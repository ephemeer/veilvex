/**
 * Minimal parser for the `[[headers]]` blocks of netlify.toml (the only TOML subset we need):
 *
 *   [[headers]]
 *     for = "/*"
 *     [headers.values]
 *       Key = "value"
 *
 * No dependency; used by scripts/serve-secure.mjs to mirror production headers locally.
 */

/** @typedef {{ for: string, values: Record<string, string> }} HeaderRule */

/** Removes a trailing `# comment` while respecting quoted strings. */
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\' && quote === '"') i += 1; // skip escaped char inside basic strings
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#') {
      return line.slice(0, i);
    }
  }
  return line;
}

/** Parses a TOML string value (basic "…" with escapes, literal '…'), falls back to the bare text. */
function parseValue(raw) {
  const text = raw.trim();
  if (text.startsWith('"') && text.endsWith('"') && text.length >= 2) {
    return text.slice(1, -1).replace(/\\(["\\nt])/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : c));
  }
  if (text.startsWith("'") && text.endsWith("'") && text.length >= 2) return text.slice(1, -1);
  return text;
}

function parseKey(raw) {
  const text = raw.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text.slice(1, -1);
  return text;
}

/**
 * @param {string} toml
 * @returns {HeaderRule[]} rules in file order
 */
export function parseNetlifyHeaders(toml) {
  /** @type {HeaderRule[]} */
  const rules = [];
  /** @type {HeaderRule | null} */
  let rule = null;
  /** @type {'rule' | 'values' | null} */
  let section = null;

  for (const rawLine of toml.split(/\r?\n/)) {
    const line = stripComment(rawLine).trim();
    if (!line) continue;

    if (line === '[[headers]]') {
      rule = { for: '', values: {} };
      rules.push(rule);
      section = 'rule';
      continue;
    }
    if (line.startsWith('[')) {
      if (rule && line === '[headers.values]') {
        section = 'values';
      } else {
        rule = null;
        section = null;
      }
      continue;
    }
    if (!rule || !section) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = parseKey(line.slice(0, eq));
    const value = parseValue(line.slice(eq + 1));
    if (section === 'rule' && key === 'for') rule.for = value;
    else if (section === 'values') rule.values[key] = value;
  }
  return rules.filter((r) => r.for !== '');
}

/**
 * Netlify-style path pattern → RegExp: `*` matches anything (including `/`), `:name` matches one segment.
 * @param {string} pattern
 */
export function globToRegExp(pattern) {
  const source = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/:[A-Za-z0-9_]+/g, '[^/]+');
  return new RegExp(`^${source}$`);
}

/**
 * Headers for a path: every matching rule is applied in file order, later rules override earlier ones.
 * @param {HeaderRule[]} rules
 * @param {string} pathname
 * @returns {Record<string, string>}
 */
export function headersForPath(rules, pathname) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rule of rules) {
    if (globToRegExp(rule.for).test(pathname)) Object.assign(out, rule.values);
  }
  return out;
}
