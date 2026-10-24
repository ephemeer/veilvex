/**
 * Public site configuration (safe to commit — contains NO secrets).
 * Contact channels: leave a field empty ('') to hide the corresponding button.
 * Secrets for the contact form live ONLY in environment variables (see .env.example).
 */
export interface SiteConfig {
  brand: string;
  whatsapp: string;
  telegram: string;
  phone: string;
  email: string;
  instagram: string;
  contactEndpoint: string;
}

export const siteConfig: SiteConfig = {
  brand: 'Veilvex',
  /** WhatsApp number — digits only with country code, e.g. '994501234567' */
  whatsapp: '994559939938',
  /** Telegram username without @, e.g. 'veilvex' */
  telegram: 'veilvex_manager',
  /** Phone for tel: links, e.g. '+994501234567' */
  phone: '',
  /** Public contact email, e.g. 'hello@veilvex.com' */
  email: '',
  /** Instagram username (optional) */
  instagram: '',
  /** API endpoint of the contact function (same-origin) */
  contactEndpoint: '/api/contact',
};

export function contactLinks() {
  const c = siteConfig;
  return {
    whatsapp: c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, '')}` : '',
    telegram: c.telegram ? `https://t.me/${c.telegram.replace(/^@/, '')}` : '',
    phone: c.phone ? `tel:${c.phone.replace(/[^\d+]/g, '')}` : '',
    email: c.email ? `mailto:${c.email}` : '',
    instagram: c.instagram ? `https://instagram.com/${c.instagram.replace(/^@/, '')}` : '',
  };
}
