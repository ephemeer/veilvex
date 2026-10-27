import type { CaseDetails } from './types';

export const az: CaseDetails = {
  labels: {
    crumbs: 'Naviqasiya zənciri',
    titleSuffix: '{brand} layihəsi',
    home: 'Ana səhifə',
    breadcrumb: 'Layihələr',
    toc: 'Bu səhifədə',
    live: 'Sayta canlı baxın',
    newTab: 'yeni tabda açılır',
    readFull: 'Layihə haqqında ətraflı',
    cta: 'Oxşar layihəni müzakirə edək',
    ctaTitle: 'Oxşar layihə lazımdır?',
    ctaText: 'Tapşırıq barədə danışın — smeta və müddəti 15 dəqiqəlik qısa brifdən sonra veririk.',
    prev: 'Əvvəlki layihə',
    next: 'Növbəti layihə',
    all: 'Bütün layihələr',
    of: '/',
  },
  items: {
    mybuild: {
      description: 'Tikinti üçün marketpleys: sifarişlər, qiymət və müddətli təkliflər, işin real vaxtda təhvili və qəbulu. Next.js, NestJS, PostgreSQL.',
      lead: 'İkitərəfli platforma: sifarişçi tikinti sifarişini yerləşdirir, şirkətlər qiymət və müddət təklif edir, sövdələşmə isə addım-addım işin qəbuluna qədər gedir. İki kabinet, real vaxt rejimində yenilənmə, fayllar və bildirişlər.',
      result: 'Sifarişlər, təkliflər və işin qəbulu bir platformada',
      tags: ['Next.js', 'NestJS', 'PostgreSQL', 'WebSocket'],
      facts: [
        { label: 'Müddət', value: '4 ay işləmə' },
        { label: 'Dəyər', value: '≈ 26 500 $' },
      ],
      sections: [
        {
          id: 'about',
          title: 'Layihə haqqında',
          blocks: [
            { p: 'Sifarişçinin adı və layihə məlumatları məxfilik sazişi ilə qorunur, ona görə burada yalnız platformanın necə qurulduğunu göstəririk. Test məlumatları üzərində işləyən açıq demo versiya iş sistemi ilə eyni koddan yığılıb.' },
          ],
        },
        {
          id: 'task',
          title: 'Məsələ',
          blocks: [
            { p: 'Platformaya qədər sifarişçi və tikinti şirkəti yazışmada və telefonla razılaşırdılar. Sövdələşmənin şərtləri söhbətlərdə itirdi, çertyojlar və smetalar müxtəlif yazışmalara səpələnirdi, «iş hansı mərhələdədir» sualına isə tərəflərin heç birində dəqiq cavab yox idi.' },
            { p: 'Sövdələşmənin aydın addımları olan, hər addımı hər iki tərəfin təsdiqlədiyi və heç bir addımı atlamağın mümkün olmadığı sistem lazım idi.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Bir tətbiqdə iki kabinet: sifarişçi öz sifarişlərini idarə edir, tikinti şirkəti isə mövcud sifarişlər lentini, öz təkliflərini və işin təhvilini görür.',
                'Kateqoriya, obyektin tipi, sahə, ünvan, büdcə, arzuolunan başlama tarixi və fayllarla sifariş forması: çertyojlar və planlar dərhal əlavə olunur ki, şirkət qiyməti sözlü təsvirə görə yox, sənədlərə görə hesablasın.',
                'Qiymət və müddəti olan təkliflər: sifarişçi onları yan-yana görür və birini seçir. Sövdələşmənin qiyməti və müddəti qəbul edilmiş təklifdən götürülür, qalan təkliflər avtomatik olaraq «seçilməyib» statusuna keçir.',
                'İşin fayllarla və məcburi şərhlə təhvili, sifarişçi tərəfindən qəbulu və yeni təhvil dövrü ilə yenidən işlənməyə qaytarılması. Bütün dövrlərin tarixçəsi saxlanılır.',
                'Real vaxt rejimində yenilənmə: bir tərəfin hərəkəti o birində səhifəni yeniləmədən görünür.',
                'Sövdələşmənin hər hadisəsi üzrə bildirişlər və oxunmamışların sayğacı.',
                'Tamamlanmış sifarişlərin sayı göstərilən podratçı kataloqu və bütün sifarişlər üzrə bütün faylları toplayan «Sənədlər» bölməsi.',
                'Məxfi fayl anbarı: yükləmə linki beş dəqiqə yaşayır və yalnız həmin fayla hüququ olana verilir.',
                'Tünd və işıqlı mövzular, telefondan böyük ekrana qədər adaptivlik.',
              ],
            },
          ],
        },
        {
          id: 'deal',
          title: 'Sövdələşmə necə işləyir',
          blocks: [
            { p: 'Sifarişin statusunu əllə dəyişmək mümkün deyil. Bütün icazəli keçidlər bir cədvəldə təsvir olunub və ondan kənar istənilən hərəkət aydın izahla rədd edilir. Status, təkliflər və bildirişlər bir tranzaksiya ilə dəyişir, ona görə sövdələşmənin vəziyyəti iki tərəfin ekranları arasında fərqlənə bilmir.' },
            {
              ol: [
                'İcraçı axtarılır — sifariş yerləşdirilib, hələ təklif yoxdur.',
                'Təsdiq gözlənilir — ən azı bir təklif gəlib, sifarişçi seçim edir.',
                'İşdədir — təklif qəbul olunub, qiymət və müddət təsbit edilib.',
                'İcranın təsdiqi gözlənilir — şirkət işi fayllar və şərhlə təhvil verib.',
                'Yenidən işlənir — sifarişçi işi geri qaytarıb, şirkət növbəti təhvil dövrünü hazırlayır.',
                'Tamamlanıb — sifarişçi işi qəbul edib.',
              ],
            },
          ],
        },
        {
          id: 'privacy',
          title: 'Kənar şirkət nə görür',
          blocks: [
            { p: 'Məxfilik burada qeyd-şərt deyil, məlumatın özünə qoyulmuş qaydadır. Sövdələşmədə iştirak etməyən şirkət sifarişi, əslində hansı vəziyyətdə olmasından asılı olmayaraq, «icraçı axtarılır» kimi görür. Ona nə sövdələşmənin qiyməti, nə özgə təklifləri, nə də sifarişçinin əlaqə məlumatları görünür.' },
            { p: 'Eyni qayda üç yerdə birdən işləyir: serverin cavabında, real vaxt hadisələrinin ünvanlanmasında və fayllara girişdə.' },
          ],
        },
        {
          id: 'tech',
          title: 'Texnologiyalar',
          blocks: [
            { p: 'İnterfeys tərəfində Next.js və React, server tərəfində NestJS və PostgreSQL, bütün layihə TypeScript üzərindədir. Real vaxt rejimində yenilənmələr WebSocket ilə gedir, avtorizasiya və fayl anbarı Supabase üzərindədir.' },
            { p: 'Sövdələşmənin ümumi qaydaları ayrıca paketə çıxarılıb və hər iki tərəfə qoşulub, ona görə ekrandakı düymə ilə serverdəki yoxlama eyni funksiya ilə hesablanır və fərqlənə bilmir.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və dəyər',
          blocks: [{ p: 'Dörd ay işləmə, ondan sonra sifarişçi tərəfində qəbul testləri. Layihənin dəyəri — təxminən 26 500 $.' }],
        },
      ],
      shots: [],
    },

    'target-english-courses': {
      description: 'Onlayn ingilis dili məktəbi üçün hədəfli reklam: MDB auditoriyası, iki trafik ssenarisi və çatbot. 10 gündə 95 müraciət, CTR 9,3 %-ə qədər, klik 0,03 $.',
      lead: 'Onlayn ingilis dili məktəbi üçün hədəfli reklam: auditoriya MDB ölkələrinə genişləndirildi, trafik sayt və Instagram arasında bölündü, tez-tez verilən sualları isə çatbot öz üzərinə götürdü.',
      result: '10 gündə 95 müraciət',
      tags: ['Hədəfli reklam', 'Instagram', 'Çatbot'],
      facts: [
        { label: 'Dövr', value: '10 gün, aprel 2024' },
        { label: 'Sayta keçid', value: '0,03 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Məsələ',
          blocks: [{ p: 'Onlayn ingilis dili məktəbinə kurslara daha çox müraciət lazım idi — həm Instagram, həm də sayt vasitəsilə.' }],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Coğrafiyanı genişləndirdik: əvvəlcə auditoriya bir şəhərlə məhdudlaşırdı, lakin məktəb onlayndır və şagirdin yeri rol oynamır — MDB ölkələrini əlavə etdik.',
                'Trafiki iki ssenariyə ayırdıq: məktəbin saytına keçid və Instagram-da mesajlar.',
                'Potensial şagirdlərin tez-tez verdiyi sualları bağlayan və onları məktəbin saytına yönləndirən çatbot qoşduq — menecer artıq isti dialoqa qoşulur.',
                'Həm öz kreativlərimizdən, həm də hesabın artıq işləyən paylaşımlarından istifadə etdik.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: '10 günün nəticəsi',
          blocks: [
            {
              stats: [
                { value: '95', label: 'müraciət' },
                { value: '1,35 $', label: 'müraciətin orta qiyməti (auditoriyadan asılı olaraq 0,57–2,95 $)' },
                { value: '9,3 %', label: 'sayta yönəldilmiş reklamın CTR-i' },
                { value: '0,03 $', label: 'sayta keçidin qiyməti' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Bu nə verir',
          blocks: [
            { p: 'Burada görünür ki, reklamı bir rəqəmə görə qiymətləndirmək olmaz: dayrektə müraciət sayta keçiddən baha başa gəlir, amma özünü də fərqli aparır. Trafikin iki ssenariyə bölünməsi və rutin sualları götürən çatbot məktəbə nəzarətli büdcə ilə müraciət axını verdi. Kampaniya 2024-cü ilin aprelində keçirilib.' },
          ],
        },
      ],
      shots: [],
    },

    alfanet: {
      description: 'İnternet provayderi Alfanet üçün WordPress saytı: üç məhsul, iki dil, qısa müraciət formaları. Google axtarışından 36,8 min keçid, CTR 25 %.',
      lead: 'Provayderin informasiya portalı: tariflər, əhatə zonaları, birbaşa e-poçta gedən qoşulma müraciətləri, iki dil versiyası, SEO və hərəkətə qısa yola vurğu ilə.',
      result: 'Provayder saytı: Google-dan 36,8 min keçid, CTR 25 %',
      tags: ['WordPress', 'Çoxdilli', 'Adaptiv', 'Müraciət formaları'],
      facts: [
        { label: 'Müddət', value: '≈ 2 həftə' },
        { label: 'Təhvil', value: 'fevral 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Alfanet — Azərbaycan internet provayderidir: ev və korporativ internet, televiziya və hostinq. Provayder üçün sayt ilk təmas nöqtəsidir: insan axtarışdan və ya reklamdan gəlir və bir dəqiqə ərzində şərtləri anlayıb qoşulma üçün müraciət göndərməlidir.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Saytı üç məhsul üzrə böldük — «İnternet», «TV», «Hostinq». Hər birinin öz səhifəsi var ki, axtarışdan gələn ziyarətçi birbaşa lazım olan xidmətə düşsün.',
                'WordPress üzərində qurduq: provayderin kontent-meneceri tarifləri və mətnləri developer olmadan özü dəyişir.',
                'İki dil versiyası hazırladıq — Azərbaycan və rus dilləri.',
                'Qoşulma üçün qısa müraciət formaları qoyduq: müraciət artıq addımlar və məcburi CRM olmadan birbaşa şirkətin poçtuna gedir.',
                'Adaptiv verstka etdik — provayderə müraciətlərin böyük hissəsi telefondan gəlir.',
                'Səhifələrin strukturunu, başlıqları və meta-teqləri internet, TV və hostinq sorğuları üzrə iki dildə yazdıq.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. Alfanet texnoloji şirkətdir, lakin sadəlik satır — buna görə sayt yüklü deyil: kontrast vurğular və ikonlar bir saniyədə bir məhsulu digərindən ayırmağa kömək edir, istifadəçinin yolu isə qısadır — xidməti seç, müraciət göndər. Qoşulmağa kömək etməyən hər şey əsas səhifədən çıxarılıb.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Verstka, doldurma və formaların qurulması ilə birlikdə təxminən iki həftə. Sayt 2025-ci ilin fevralında təhvil verilib.' }],
        },
        {
          id: 'metrics',
          title: 'Saytın göstəriciləri',
          blocks: [
            { p: '16 aylıq Google Search Console və PageSpeed Insights məlumatları, avqust 2026.' },
            {
              stats: [
                { value: '36,8 min', label: 'Google axtarışından keçid, 147 min göstərişdə' },
                { value: '25 %', label: 'axtarışda CTR: hər dörd göstərişdən biri keçidlə bitir' },
                { value: '5,2', label: 'Google-da orta mövqe' },
                { value: '100 / 100', label: 'PageSpeed Insights-da SEO və əlçatanlıq (masaüstü)' },
              ],
            },
            {
              ul: [
                'PageSpeed Insights-da ən yaxşı təcrübələr — 100-dən 96.',
                'Cumulative Layout Shift 0 və Total Blocking Time 0 ms: səhifə yüklənərkən «sıçramır» və skriptlərdə ilişmir.',
              ],
            },
          ],
        },
      ],
      shots: [],
    },

    'target-personal-profile': {
      description: 'Reklam ekspertinin şəxsi brendinin tanıtımı: auditoriyanın problemlərinə əsaslanan lid-maqnit. 5 gündə 0,95 $-a 90 müraciət və 4 aylıq müştəri.',
      lead: 'Ekspertin şəxsi brendinin tanıtımı: əvvəlcə auditoriyanın problemlərini təhlil etdik, sonra ən çox verilən sual üzrə bələdçi-lid-maqnit hazırladıq və trafiki birbaşa yazışmaya apardıq.',
      result: 'Hər biri 1 $-dan ucuz 90 lid',
      tags: ['Hədəfli reklam', 'Instagram', 'Lid-maqnit'],
      facts: [
        { label: 'Dövr', value: '5 gün, aprel 2024' },
        { label: 'Büdcə', value: '86 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Məsələ',
          blocks: [
            { p: 'Hədəfli reklam üzrə mütəxəssisin layihəsi: onun ekspert kimi tanınmasını artırmaq və Instagram-da lid-maqnit paylamaqla maraqlı izləyicilər bazası toplamaq.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Auditoriyanı təhlil etdik: ağrılar, qorxular və əsas təkrarlanan sual — reklam işə salınmazdan əvvəl Instagram-da iş profilini necə hazırlamaq.',
                'Məhz bu sual üzrə bələdçi hazırlayıb onu lid-maqnitə çevirdik: insan dayrektə yazır və faydanı dərhal alır.',
                'Instagram-da mesajlara yönəlmiş kampaniya işə saldıq və trafiki aralıq lendinqlər olmadan birbaşa yazışmaya apardıq.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: '5 günün nəticəsi',
          blocks: [
            {
              stats: [
                { value: '90', label: 'dayrektə müraciət' },
                { value: '0,95 $', label: 'bir müraciətin qiyməti' },
                { value: '86 $', label: 'kampaniyanın büdcəsi' },
                { value: '4 ay', label: 'kampaniyadan gələn müştəri ilə əməkdaşlıq' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Bu nə verir',
          blocks: [
            { p: 'Keys həm ekspert, həm biznes üçün işləyən mexanikanı göstərir: birbaşa reklam əvəzinə insanın özünün götürdüyü faydalı material, satış isə artıq bu təmas üzərində qurulur. Belə yanaşmada müraciətin qiyməti kiçik büdcədə belə bir dollardan aşağı qalır. Kampaniya 2024-cü ilin aprelində keçirilib.' },
          ],
        },
      ],
      shots: [],
    },

    shp: {
      description: 'SHP tikinti şirkəti üçün təmiz kodla sayt: obyektlər portfoliosu, üç dil, Vercel və Cloudinary. Masaüstündə PageSpeed 98, axtarışda CTR 14,7 %.',
      lead: 'Təmiz kodla müasir sayt: sürətli və adaptiv, həyata keçirilmiş layihələrə vurğu ilə. Vercel-də hostinq, şəkillər Cloudinary vasitəsilə.',
      result: 'Tikinti şirkəti üçün sayt: PageSpeed 98, CTR 14,7 %',
      tags: ['HTML/CSS/JS', 'SEO', 'Vercel', 'Cloudinary'],
      facts: [
        { label: 'Müddət', value: '≈ 3 həftə' },
        { label: 'Təhvil', value: 'dekabr 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'SHP — tam dövrlü şirkətdir: konsepsiya və strategiyadan tikintinin idarə olunmasına və obyektlərin sonrakı istismarına qədər. İş sahələri: beton və dam işləri, metal konstruksiyalar, mühəndis sistemləri (İVK, su təchizatı və kanalizasiya, yanğınsöndürmə, elektrik, BMS), həmçinin layihələndirmə, 3D vizuallaşdırma və tikinti konsaltinqi. Həyata keçirilmiş obyektlər arasında Port Baku Walk, Deniz Mall, CASA Baku və Rahat Gourmet Crescent Mall var.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Strukturu şirkətin əsas arqumenti — obyektlər portfoliosu ətrafında qurduq: «Layihələr», «Xidmətlər», «Haqqımızda», «Komanda», «Lisenziyalar və sertifikatlar», «Müştərilər» üçün ayrıca bölmələr.',
                'Saytı CMS və konstruktorlar olmadan, təmiz HTML, CSS və JavaScript ilə yazdıq — səhifələr ağır foto qalereyalarla belə sürətli açılır.',
                'Üç dil versiyası hazırladıq: Azərbaycan, rus və ingilis dilləri.',
                'Müştəri və tərəfdaş loqolarını (Pasha Group, AZAL, Marriott International, Ritz Carlton), həmçinin ISO lisenziya və sertifikatlar blokunu yerləşdirdik — tikinti sifarişçisi üçün etibar məsələsini bağlayan məhz budur.',
                'Cloudinary qoşduq: obyekt fotoları sıxılmış və lazımi ölçüdə verilir, ona görə qalereyalar səhifəni yavaşlatmır.',
                'Vercel-də yerləşdirdik: HTTPS, CDN və yeniləmələr zamanı sürətli geri qayıtma.',
                'Baza SEO qurduq — başlıqlar, meta-teqlər, sayt xəritəsi, semantik işarələmə.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. Əsas qrafik motiv çoxüzlülərdir: onlar dəqiqlik, dinamika və müxtəlif mürəkkəblikdə layihələrlə iş kimi oxunur — bu da SHP-nin mövqeyi ilə üst-üstə düşür.' },
            { p: 'Palitra qəsdən təmkinlidir: tikintidə etibarı bəzək deyil, sakit təqdimat və obyektlərin keyfiyyətli fotoları qazandırır. İri şəkillər təcrübənin sübutu kimi işləyir, qısa xidmət təsvirləri isə kontaktlara aparır.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Maketin təsdiqindən dərcə qədər təxminən üç həftə — bölmələrin doldurulması və üç dilə tərcümə də daxil olmaqla. Sayt 2024-cü ilin dekabrında təhvil verilib.' }],
        },
        {
          id: 'metrics',
          title: 'Saytın göstəriciləri',
          blocks: [
            { p: 'Google Search Console və PageSpeed Insights məlumatları, avqust 2026.' },
            {
              stats: [
                { value: '98 / 100', label: 'PageSpeed Insights-da məhsuldarlıq (masaüstü)' },
                { value: '1,0 san', label: 'Largest Contentful Paint; Cumulative Layout Shift — 0,002' },
                { value: '14,7 %', label: 'axtarışda CTR: təxminən hər yeddi göstərişdən biri keçidlə bitir' },
                { value: '5,1', label: 'son üç ayda Google-da orta mövqe, 16 ayın ortalaması 6,4 idi' },
              ],
            },
            { ul: ['Əlçatanlıq — 100-dən 90, ən yaxşı təcrübələr — 100-dən 96.'] },
          ],
        },
      ],
      shots: [],
    },

    'yakitori-site': {
      description: 'Yakitori restoranı üçün təmiz HTML, CSS və JS ilə menyu-sayt: 15 bölmə, ayrıca səhifələrdə iki dil, yapışqan naviqasiya və laytboks.',
      lead: 'Asiya mətbəxi restoranı üçün menyu-sayt: CMS və bilder olmadan təmiz HTML, CSS və JavaScript, ayrıca səhifələr kimi iki dil versiyası, məlumatlardan qurulan menyu bölmələri, yapışqan naviqasiya və laytboks.',
      result: '15 bölməli menyu-sayt, iki dil versiyası',
      tags: ['HTML/CSS/JS', 'Asılılıqsız', 'Çoxdillilik', 'SEO', 'JSON-LD Restaurant', 'Cloudflare Pages'],
      facts: [
        { label: 'Müddət', value: '≈ 1 həftə' },
        { label: 'Dərc', value: '17 avqust 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Yakitori · Asian Food — Asiya mətbəxi restoranıdır: suşi və rollar, şorbalar, əriştə, qızardılmış düyü, udon, tempura, salatlar, vaflilər, dondurma və içkilər, üstəlik şəhər üzrə çatdırılma. Belə restoranın qonağı sayta bir şey üçün gəlir: qiymətlərlə menyuya baxmaq və zəng etmək. Deməli, sayt telefonda dərhal açılmalı və yeməyi siyahıdakı sətir kimi deyil, fotoşəkil kimi göstərməlidir.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Saytı təmiz HTML, CSS və JavaScript ilə qurduq: nə CMS, nə bilder, nə də bir dənə xarici asılılıq. Səhifələr hazır fayl kimi verilir, yeniləmə qovluğun köçürülməsinə çevrilir, plaginlərin yenilənməsində sınacaq bir şey yoxdur.',
                'Məlumatı və renderi ayırdıq. Bütün menyu ayrıca məlumat faylında yaşayır, skript ondan həm kart şəbəkəsini, həm də bölmələr üzrə naviqasiyanı qurur. Qiyməti və ya tərkibi dəyişmək üçün verstkaya toxunmaq lazım deyil.',
                'İki dil versiyasını klient tərəfdə keçid deyil, ayrıca səhifə kimi hazırladıq: rus dili yakitori.az ünvanında, Azərbaycan dili yakitori.az/az ünvanında. Hər birinin öz canonical-ı və tam hreflang klasteri var (ru, az və x-default): axtarış sistemi mətnini dəyişən bir sənəd deyil, iki müstəqil sənəd görür.',
                'Menyunu 15 bölməyə ayırdıq — setlərdən və kombolardan limonadlara qədər — suşi və rollar daxilində beş qrupla: xosomaki, uramaki, isti rollar, bişmiş rollar, suşi-burger və düyü topları. Son üç bölmə qiymət cədvəli kimi verilir və avtomatik olaraq sütunlara yığılır.',
                'Bölmələr üzrə yapışqan naviqasiya qurduq: aktiv bənd IntersectionObserver ilə işıqlandırılır, lent təkərlə sürüşür və siçanla dartılır, dartmadan sonrakı klik isə söndürülür — əks halda dartma təsadüfən başqa bölməyə aparardı.',
                'Laytboks əlavə etdik: istənilən fotoya klik onu tam ekranda açır, istənilən klik və Escape düyməsi bağlayır.',
                'Yemək fotolarını fayllara toxunmadan, yalnız CSS ilə kadrladıq. Şorbalarda miqyas və kadr nöqtəsi elə seçilib ki, kasalar sırada eyni ölçüdə çıxsın; laytboks isə toxunulmamış orijinalı açır.',
                'Axtarış üçün tam işarələmə yazdıq: title, description, canonical, hreflang, geo-metaməlumatlar, Open Graph və Twitter kartı, telefon, ünvan, iş saatları, koordinatlar və qiymət kateqoriyası ilə JSON-LD Restaurant.',
                'Bütün rastr qrafikanı WebP-yə çevirdik və saytı Cloudflare Pages-də yerləşdirdik; www ünvanı yönləndirmə ilə əsas ünvana aparılır, ona görə çap olunmuş flayerdəki QR-kod işlək qalır — çapa məhz www variantı gedib.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Sayt brendin iki teması üzərində dayanır. Tünd tema — başlıq, birinci ekran və altlıq: tünd-qəhvəyi fon, krem mətn, qızılı yazılar və başlığın altında qırmızı xətt. Açıq tema — menyunun özü: seyqayha naxışlı krem kağız, ağ yemək kartları, qırmızı qiymətlər. Nəticədə tünd üz qabığının üzərinə qoyulmuş çap menyu-kartı alınır — yəni restoranın özü nədirsə, o.' },
            { p: 'Birinci ekran reklam deyil: başlıq, bir cümlə, sifariş düyməsi və iki sətir fakt — iş saatları və ünvan. Telefon başlığa çıxarılıb və altlıqda təkrarlanıb, çünki burada sifariş səbətlə deyil, zənglə gedir.' },
          ],
        },
        {
          id: 'typography',
          title: 'Tipoqrafika və Azərbaycan versiyası',
          blocks: [
            { p: 'Üç qarnitur, dördüncüsü yoxdur: başlıqlarda, yemək adlarında və qiymətlərdə Montserrat, tərkib və təsvirlərdə Manrope, bölmələrin yapon imzalarında Noto Sans JP. Bu bölgü dekorativ deyil: Manrope-da milli valyuta işarəsi və Azərbaycan Ə hərfi fiziki olaraq yoxdur, ona görə bütün qiymətlər Montserrat ilə yığılıb, Manrope isə həmin Montserrat ilə sığortalanıb — Azərbaycan təsvirlərindəki Ə hərfini məhz o çəkir.' },
            { p: 'Bu olmasa, brauzer səssizcə sistem şriftini qoyardı: CSS-də bunu görmək mümkün deyil, şrift təyin olunub və hər şey «işləyir», amma hərf sətirdən düşür. Gözlə deyil, skriptlə yoxladıq: o, brauzerdən hər iki səhifədə hər mətn qovşağının hansı real şriftlə çəkildiyini soruşur.' },
            { p: 'İkinci Azərbaycan tələsi registrdir. Adi uppercase i hərfini I-ya çevirir, Azərbaycan dilində isə İ lazımdır, ona görə kapsla göstərilən bütün sətirlər məlumatlarda artıq böyük hərflərlə saxlanılır və çevirmə boşa işləyir.' },
          ],
        },
        {
          id: 'mobile',
          title: 'Sayt telefonda özünü necə aparır',
          blocks: [
            { p: 'Sifarişlərin böyük hissəsi telefondan gəlir, ona görə menyu şəbəkəsini on dörd endə yoxladıq — geniş monitordan dar telefona qədər. Onların hamısının arxasında bir qayda dayanır: yeməyin adı heç yerdə iki sətrə qırılıb qiymətin üstünə düşməməlidir.' },
            {
              ul: [
                'Planşetdə şəbəkə məcburi iki sütuna keçir.',
                'Telefonda qiymət adla sətri bölüşmək əvəzinə onun altına düşür.',
                'Ən dar ekranlarda bütün mətn bir pillə kiçilir.',
              ],
            },
            { p: 'Ölçülər Montserrat-a görə seçilib: eyni kegldə o, Manrope-dan təxminən beşdə bir enlidir, ona görə burada «gözəyarı» üsul işləmir.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [
            { p: 'Təxminən bir həftəlik iş. Sayt 2026-cı il avqustun 17-də yakitori.az ünvanında dərc olunub, layihə isə avqustun 18-də, flayerlə eyni vaxtda bağlanıb: flayerdə sayta aparan QR-kod çap olunur, ona görə onları ayrıca təhvil vermək mümkün deyildi.' },
          ],
        },
      ],
      shots: [],
    },

    'target-body-massage': {
      description: 'Masaj ustası üçün hədəfli reklam: keçmiş kampaniyalar üzrə seqmentləşdirmə və ən yaxşı Reels-kreativ. 5 gündə 0,93 $-a 80 müraciət, 0,10 $-a 747 klik.',
      lead: 'Masaj ustasına yazılma kampaniyası: auditoriya əvvəlki kampaniyaların nəticələri üzrə seqmentləşdirildi, kampaniya isə artıq ən çox yazışma gətirən Reels-video ətrafında quruldu.',
      result: '5 gündə 0,93 $-a 80 müraciət',
      tags: ['Hədəfli reklam', 'Instagram', 'Reels'],
      facts: [
        { label: 'Dövr', value: '5 gün, aprel 2024' },
        { label: 'Büdcə', value: '74,70 $' },
      ],
      sections: [
        {
          id: 'task',
          title: 'Məsələ',
          blocks: [{ p: 'Maderoterapiya prosedurası — əl ilə bədən masajı — üzrə mümkün qədər çox sorğu almaq və onları yazılışa çevirmək.' }],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'İşə salınma anında müştəri ilə artıq ikinci ay işləyirdik, ona görə təxminlərə deyil, faktlara söykəndik: auditoriyanı keçmiş kampaniyaların nəticələri üzrə seqmentləşdirdik və nişdə ən aktiv hissəni ayırdıq.',
                'Dərc olunmuş Reels videolardan hansının daha çox və daha ucuz yazışma verdiyini müəyyən etdik — və kampaniyanı onun ətrafında qurduq.',
                'Trafiki mesajlara apardıq ki, insan sayt öyrənmək əvəzinə dərhal boş vaxtı soruşsun.',
              ],
            },
          ],
        },
        {
          id: 'results',
          title: '5 günün nəticəsi',
          blocks: [
            {
              stats: [
                { value: '80', label: 'müraciət' },
                { value: '0,93 $', label: 'bir müraciətin qiyməti' },
                { value: '74,70 $', label: 'büdcə' },
                { value: '747', label: 'klik, hər biri 0,10 $' },
              ],
            },
          ],
        },
        {
          id: 'why',
          title: 'Bu nə verir',
          blocks: [
            { p: 'Kampaniya işə salındıqdan sonra bir aydan çox işlədi: nəticənin qiyməti artdı, lakin prosedura yazılışlar davam etdi — bu isə reklam kampaniyalarının çoxunun keçə bilmədiyi dayanıqlıq testidir.' },
            { p: 'Keys həm də toplanmış məlumatın dəyərini göstərir: müştəri ilə ikinci ay birinciyə nisbətən nəzərəçarpacaq dərəcədə ucuz nəticə verir. Kampaniya 2024-cü ilin aprelində keçirilib.' },
          ],
        },
      ],
      shots: [],
    },

    'deniz-service': {
      description: 'Sənaye təchizatçısı Deniz Service üçün ikidilli sayt: 21 kateqoriyalı kataloq, öz sertifikat komponenti, Apache-də təmiz URL-lər və tam SEO işarələməsi.',
      lead: 'Sənaye təchizatçısı üçün ikidilli sayt: lövbər naviqasiyalı 21 kateqoriyalı kataloq, sıfırdan yazılmış sertifikat komponenti, Apache üzərində təmiz URL-lər və tam axtarış işarələməsi.',
      result: 'Təchizatçı kataloqu: 21 kateqoriya və bir klikdə sənədlər',
      tags: ['HTML/CSS/JS', 'jQuery', 'Çoxdilli', 'SEO', 'Apache/.htaccess'],
      facts: [
        { label: 'Müddət', value: '≈ 2 həftə' },
        { label: 'Təhvil', value: 'iyul 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Deniz Service 2005-ci ildən təchizat və mühəndis dəstəyi ilə məşğuldur: neft-qaz, metallurgiya, qida və kimya sənayesi, tikinti, kənd təsərrüfatı. Şirkət vahid satınalma nöqtəsi kimi işləyir — partlayışdan qorunan avadanlıqdan və boru armaturundan tutmuş takelaj, İVK və fərdi mühafizə vasitələrinə qədər — və Azərbaycanda on bir xarici istehsalçını təmsil edir. Şirkətin ISO 9001:2015 üzrə keyfiyyət menecmenti sistemi və D-U-N-S bazasında qeydiyyatı var.' },
            { p: 'Belə biznesə bir kliklə satış saytı lazım deyil: mühəndis və ya təchizatçı iki şeyi yoxlamağa gəlir — lazım olan nomenklatura varmı və təchizatçının onu təqdim etmək hüququ varmı.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Saytı təmiz kod üzərində qurduq — HTML, CSS, JavaScript və jQuery, CMS olmadan: səhifələr hazır fayllar kimi verilir, plagin yenilənəndə sınacaq bir şey yoxdur və admin panel üzərindən hücum ediləcək yer də yoxdur.',
                'İki dil versiyası hazırladıq: ingilis versiyası saytın kökündə, Azərbaycan versiyası /az/ bölməsində. Hər səhifənin öz canonical-ı və tam hreflang klasteri var — en, az və x-default.',
                'Kataloqu ayrıca səhifəyə çıxardıq: hər birinin tərkibi açıqlanmış 21 mal və xidmət kateqoriyası. Əsas səhifədəki kartlar lövbər linki ilə birbaşa lazım olan bloka aparır, uzun siyahının əvvəlinə deyil.',
                '«Tərəfdaşlar» bölməsinin komponentini sıfırdan yazdıq: on bir brendin lenti bir məlumat faylından qurulur, klik isə öz laytboksumuzu açır — klik və çarxla miqyaslama, telefonda pinç, hədd ilə sürüşdürmə (klik təsadüfi yerdəyişməyə çevrilməsin deyə), şaquli önizləmələr və bir neçə avtorizasiya sənədi olan brendlərin dəstəyi.',
                'Apache-ni .htaccess vasitəsilə qurduq: .html-siz ünvanlar, köhnə formalardan 301, məcburi HTTPS, www-suz ünvan və sonda slaşsız — hər səhifənin dəqiq bir kanonik forması var. Elə orada gzip, fayl tiplərinə görə keşləmə başlıqları, təhlükəsizlik başlıqları və WebP ilə şriftlər üçün düzgün MIME tipləri.',
                'Axtarış sistemləri üçün işarələməni yazdıq: Organization, WebSite, WebPage və BreadcrumbList qovşaqları ilə JSON-LD @graph, Open Graph və Twitter kartları, hər ünvanda dil alternativləri olan sitemap.xml.',
                'Sənədləri birbaşa yerləşdirdik: şirkətin təqdimatı, ISO sertifikatı, laboratoriya akkreditasiyaları və hər on bir istehsalçının avtorizasiya məktubları. PDF forma və qeydiyyat olmadan bir kliklə açılır.',
                'Bütün rastr qrafikasını WebP-yə keçirdik və şəkillərin gecikdirilmiş yüklənməsini işə saldıq.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. İlk ekran tünddür, istehsalat fotosu və şirkət haqqında bir cümlə ilə: sənaye təchizatçısı üçün profili dərhal adlandırmaq şüardan daha vacibdir. Aşağıda tünd fonda açıq rəngli kartlar şəbəkəsi gəlir — 21 kateqoriya reklam bloku kimi deyil, kataloq kimi oxunur.' },
            { p: 'Qrafik motiv — fon şəkillərindəki nazik çoxüzlü tor — mühəndis intonasiyasını saxlayır və avadanlıq fotoları ilə mübahisə etmir. Etibar arqumentləri bir yerə toplanıb: iş illəri, şirkətin prinsipləri, ISO sertifikatı və D-U-N-S nişanı. Kontaktlar poçt və telefona birbaşa linklərlə, xəritənin yanında verilib — təchizatçıya əlaqə saxlamaq lazımdır, forma doldurmaq yox.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Verstka, kataloqun doldurulması, sertifikat komponenti və hostinqin qurulması üçün təxminən iki həftə. Sayt 2026-cı ilin iyulunda təhvil verilib.' }],
        },
      ],
      shots: [],
    },

    'expert-solutions': {
      description: 'Neft-qaz üçün açar-təslim laboratoriyalar quran Expert Solutions-ın korporativ saytı: premium palitra, heksaqon motivi, skroll animasiyaları, iki dil.',
      lead: '25 illik təcrübəyə malik şirkətin korporativ saytı: ciddi premium palitra, mühəndis motivi kimi heksaqonlar, skrollda hamar animasiyalar və iki dil versiyası.',
      result: 'Neft-qaz üçün laboratoriya həlləri təchizatçısının saytı',
      tags: ['HTML/CSS/JS', 'Bootstrap', 'GSAP', 'Swiper', 'Vercel'],
      facts: [
        { label: 'Müddət', value: '≈ 3 həftə' },
        { label: 'Təhvil', value: 'yanvar 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Expert Solutions LLC açar-təslim laboratoriyalar qurur və neft-qaz sektoruna konsaltinq xidməti göstərir: avadanlıq seçimi, layihələndirmə, istismara buraxılış, beynəlxalq standartlara uyğunluq. Komandanın 25 illik təcrübəsi var, müştəriləri isə iri sənaye sifarişçiləri və beynəlxalq tərəfdaşlardır. Sayt onların dilində danışmalı idi: ciddi, sübuta əsaslanan, marketinq səs-küyü olmadan.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Korporativ saytı təmiz frontend üzərində qurduq: HTML, CSS, JavaScript və jQuery, şəbəkə əsası kimi Bootstrap — buradan da telefondan geniş monitora qədər düzgün göstərilmə.',
                'Səhifəni huni məntiqi ilə qurduq: hərəkətə çağırışlı geniş ilk ekran, xidmət kartları, şirkət dəyərləri bloku, komanda ilə tanışlıq, kontaktlar.',
                'Skroll animasiyaları əlavə etdik: tipoqrafika üçün ScrollTrigger və SplitText ilə GSAP, blokların görünməsi üçün AOS, sliderlər üçün Swiper, rəqəm sayğacları üçün Odometer.',
                'İnteraktiv FAQ akkordeonu hazırladıq — o, tipik sualları ilk zəngdən əvvəl bağlayır.',
                'Yerli və beynəlxalq tərəfdaşlar üçün iki dil versiyası hazırladıq — ingilis və Azərbaycan dilləri.',
                'Vercel-də yerləşdirdik: verilmə sürəti, HTTPS və öz serveri olmadan sabitlik.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. Palitra dərin tünd və təmiz ağ rəngin kontrastı üzərində, qızılı-qum vurğusu ilə qurulub — ekspertlik məhz belə görünür, parlaq reklam kimi yox.' },
            { p: 'Əsas qrafik motiv heksaqonlardır: fotoların formalarında və qrafikada onlar molekulyar quruluşa və mühəndis dəqiqliyinə işarə edir. Açıq və tünd bölmələrin növbələşməsi uzun skroll boyunca diqqəti saxlayır.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Dizayn, verstka və doldurma üçün təxminən üç həftə. Sayt 2026-cı ilin yanvarında təhvil verilib.' }],
        },
      ],
      shots: [],
    },

    konteks: {
      description: '90 illik tarixi olan istehsalat-tikinti şirkəti Konteks üçün çoxsəhifəli sayt: istiqamətlər üzrə bölmələr, həyata keçirilmiş obyektlər, üç dil.',
      lead: 'İstehsalat-tikinti təşkilatının çoxsəhifəli saytı: istiqamətlər üzrə aydın arxitektura, həyata keçirilmiş obyektlər bölməsi və üç dil versiyası.',
      result: '90 illik tarixi olan şirkətin üç dildə saytı',
      tags: ['WordPress', 'Çoxdilli', 'Adaptiv', 'Formalar'],
      facts: [
        { label: 'Müddət', value: '≈ 3 həftə' },
        { label: 'Təhvil', value: 'aprel 2025' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Konteks — 90 illik tarixi olan, Azərbaycanda sovet dövründən fəaliyyət göstərən istehsalat-tikinti təşkilatıdır. İstiqamətlər: şaquli silindrik rezervuarların hazırlanması və quraşdırılması, metal konstruksiyalar, hidrotest, rezervuarların kalibrlənməsi, qumlama və metal səthlərin antikorroziya boyanması. Obyektləri arasında LUKOİL üçün işlər, nasos stansiyaları, metro və hava limanı var.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Çoxsəhifəli struktur layihələndirdik: hər istiqamət ümumi siyahıda bir sətir deyil, texnologiyanın təsviri və görülmüş işlərin fotoları ilə ayrıca bölmədir.',
                'Həyata keçirilmiş layihələr bölməsini görünən yerə çıxardıq: sənaye sifarişçisi üçün əsas arqument budur.',
                'WordPress üzərində qurduq ki, şirkət xəbərləri və yeni obyektləri özü əlavə etsin.',
                'Üç dil versiyası hazırladıq — Azərbaycan, rus və ingilis dilləri.',
                'Müraciət formaları əlavə etdik, kontaktları, rekvizitləri və ünvanı həm altlıqda, həm ayrıca bölmədə yerləşdirdik — sifarişçi əlaqə yolunu axtarmalı olmur.',
                'Telefon və planşetlərdə düzgün göstərilmə ilə adaptiv verstka etdik.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. Sakit rəng qamması və ifadələrdəki mühəndis dəqiqliyi şirkətin texniki profilinə uyğundur, fotolar və vizual bloklar isə böyük həcmli məlumatda istiqamətlənməyə kömək edir.' },
            { p: 'Sayt konkret məsələni həll edir: miqyası, istehsal güclərini və sovet dövründən bugünkü obyektlərə qədər davam edən reputasiyanı göstərmək.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Bölmələrin həcmi və üç dilə tərcümə nəzərə alınmaqla təxminən üç həftə. Sayt 2025-ci ilin aprelində təhvil verilib.' }],
        },
      ],
      shots: [],
    },

    'oqni-baku': {
      description: '«Oqni Baku» restoranı üçün şablonsuz, sıfırdan vizit-sayt: menyu, kontaktlar, öz 404 səhifəsi, Google və Yandex üçün SEO, Google Cloud hostinqi.',
      lead: 'Şablonsuz sıfırdan sayt: əsas səhifə, menyu, kontaktlar, dizayn edilmiş 404 səhifəsi və dinamik fırlanan şəkil. Google və Yandex üçün SEO, Google Cloud hostinqi.',
      result: 'Google və Yandex üçün SEO ilə restoran vizit-saytı',
      tags: ['HTML/CSS/JS', 'SEO', 'Google Cloud'],
      facts: [
        { label: 'Müddət', value: '≈ 1,5 həftə' },
        { label: 'Təhvil', value: 'aprel 2024' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: '«Oqni Baku» — Rusiyanın Həştərxan şəhərində Azərbaycan mətbəxi restoranıdır. Saytın işi sadə və ictimai iaşə üçün tipikdir: insan məkanı axtarışda və ya adla tapır, ona menyunu görmək, ab-havanı hiss etmək və ünvanla telefonu tapmaq lazımdır.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                'Şablonlar və hazır mövzular olmadan sıfırdan vizit-sayt hazırladıq: əsas səhifə, menyu səhifəsi, kontaktlar səhifəsi.',
                'Təmiz HTML, CSS və JavaScript kodu yazdıq — sayt yüngüldür və mobil internetdə belə sürətli açılır.',
                'Adaptiv verstka etdik: restoran ziyarətçilərinin çoxu saytı telefondan açır.',
                'Əsas səhifəyə dinamik fırlanan şəkil əlavə etdik — ağır animasiyalar olmadan səhifəni canlandıran vurğu.',
                'Google və Yandex üçün SEO və indeksləşdirmə qurduq — rusdilli auditoriya üçün Yandex vacibdir.',
                'Səhv linkin sınıq sayt təsiri bağışlamaması üçün dizayn edilmiş 404 səhifəsi hazırladıq.',
                'Layihəni Google Cloud-da yerləşdirdik.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Dizayn müştəri ilə birlikdə hazırlanıb. Restorana böyük sayt lazım deyil — qısa və inandırıcı sayt lazımdır: üç səhifə, iri yemək fotoları, oxunaqlı menyu və bir klikdə kontaktlar. Artıq hər şey qəsdən çıxarılıb ki, əsas hərəkəti — gəlmək və ya zəng etmək — zəiflətməsin.' },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [{ p: 'Maketdən dərcə qədər təxminən bir yarım həftə. Sayt 2024-cü ilin aprelində təhvil verilib.' }],
        },
      ],
      shots: [],
    },

    'yakitori-menu': {
      description: 'Yakitori restoranı üçün çap A4 menyu-kitab: 10 vərəq, fotolu 68 mövqe, bir versdadan RU və AZ, redaktə olunan PPTX və mətni əyrilərdə olan PDF.',
      lead: '10 vərəqlik çap A4 menyu-kitab: fotoşəkillərlə 68 mövqe, ümumi verstkadan iki dil versiyası, restoran üçün redaktə oluna bilən PPTX və mətni əyrilərə çevrilmiş çap PDF-i.',
      result: 'A4 menyu-kitab: 10 vərəq, 68 mövqe, RU və AZ',
      tags: ['HTML/CSS', 'PPTX', 'Çap PDF', 'Mətn əyrilərdə', 'RU / AZ'],
      facts: [
        { label: 'Müddət', value: '5 gün' },
        { label: 'Təhvil', value: '10 avqust 2026' },
      ],
      sections: [
        {
          id: 'client',
          title: 'Müştəri haqqında',
          blocks: [
            { p: 'Yakitori · Asian Food — Asiya mətbəxi restoranıdır. Zaldakı çap menyusu sadəcə siyahı deyil: qonaq onu bir neçə dəqiqə əlində tutur və fotoşəkilə görə seçir. Bütün çeşidi əhatə edən, dərhal iki dildə olan və elə təhvil verilən kitab lazım idi ki, restoran mətni özü düzəldə bilsin, mətbəə isə əlavə düzəlişsiz çap etsin.' },
          ],
        },
        {
          id: 'work',
          title: 'Nə etdik',
          blocks: [
            {
              ul: [
                '10 vərəqlik A4 menyu-kitab verstkaladıq: beş fiziki vərəq, ikitərəfli çap, yaylı cildləmə. İçində 68 mövqe var və hər birinin öz fotosu — ümumilikdə 77 şəkil, bir dənə də boş yer yoxdur.',
                'Rus və Azərbaycan dil komplektlərini bir verstkadan yığdıq. Azərbaycan kitabı fork deyil: işarələmə, üslublar və konvertor ümumidir, yalnız mətn faylı ayrıdır. Üç qoruyucu yığımı dayandırır: mənbənin strukturu sürüşəndə, xidməti açar bildiriləndən fərqli sayda rast gələndə və ya hazır səhifədə görünən rus mətni qalanda.',
                'Restorana şəkil deyil, redaktə oluna bilən PowerPoint təhvil verdik: qiyməti və ya adı bizə qayıtmadan özü dəyişir.',
                'Təqdimatı sabitlərdən deyil, hazır səhifənin ölçülərindən yığdıq. Blokların koordinatları, sətir keçidləri artıq hesablanmış mətnlər və foto yolları çəkilmiş maketdən götürülür, ona görə maketdəki düzəliş PPTX-ə özü keçir.',
                'Fotoları qrafik redaktorda deyil, məlumatlardakı parametrlə kadrladıq: bir düstur həm maket üçün CSS-ə, həm də PowerPoint üçün şəkil kəsiyinə çevrilir, ona görə kadr hər ikisində üst-üstə düşür, orijinal fayllar isə toxunulmaz qalır.',
                'Fərqli cildləmələr üçün üç çap variantı hazırladıq — yaylı, yaysız və 12 səhifəlik versiya — və onları layihənin surətlərini çıxarmadan, bir mənbədən skriptlə yığdıq.',
              ],
            },
          ],
        },
        {
          id: 'design',
          title: 'Dizayn və struktur',
          blocks: [
            { p: 'Üz qabığı tünd, daxili vərəqlər açıqdır: momici yarpaqları fonlu krem kağız, tünd boya, qırmızı vurğular və qızılı incə xətlər. Hər vərəqin başlığı və altlığı tünd qalır, ona görə kitab müxtəlif səhifələr yığını kimi deyil, vahid obyekt kimi oxunur.' },
            { p: 'Hər açılışın yemək növünə uyğun öz kart arxetipi var: setlər üçün yuxarısında foto olan plitə, rollar və şorbalar üçün ağ çərçivədə qızılı halqalı dairəvi foto, isti rollar üçün solunda foto olan iri kart, kombolar üçün əyilmiş polaroid, içkilər üçün tipoqrafik qiymət cədvəli. Sonuncu vərəq «Nuş olsun» yazılı dairəvi hanko möhürü ilə bağlanır.' },
            { p: 'Qərarların bir hissəsini iş gedişində müştəri verdi və onlar maketi nəzərəçarpacaq dərəcədə dəyişdi. Kartların altındakı ağ lövhələr vərəqin təxminən 70 %-ni tuturdu və yarpaq fonunu örtürdü — onlar rədd edildi. İndi kart qızılı incə xətli yarımşəffaf şüşədir, fon onun arxasından görünür, qiymət isə sağ yuxarı küncə etiket kimi çıxarılıb. Dekorativ kumiko künclərini də eyni səbəbdən götürdük: vərəq sakitləşdi.' },
            { p: 'Bir qayda da verstkanın özündən doğdu: sıraların hündürlüyü əllə seçilmir, bölmələr özləri uzanır və vərəqi altlığa qədər doldurur. Yaylı sahələrdən sonra ən pis ehtiyat setlər vərəqində bir santimetrdən azdır.' },
          ],
        },
        {
          id: 'print',
          title: 'Çap',
          blocks: [
            {
              ul: [
                'Yay üçün güzgü sahələr: cildləmə tərəfindən 12,2 mm, xarici tərəfdən 6,6 mm. Vərəqin üz tərəfi yayı solda, arxa tərəfi sağda saxlayır.',
                'Loqonu və telefonları yuxarı kənardan 2,9 mm-dən 6,3–6,6 mm-ə qədər aşağı saldıq: əvvəlki rəqəm kəsim dözümünə sığmırdı və mətbəə uzaqlaşdırmağı xahiş etdi.',
                'Mətn əyrilərdə təhvil verilib: hazır PDF-də sıfır quraşdırılmış şrift var. Gözlə yox, rəqəmlə yoxladıq — «mətn siçanla seçilir» burada heç nə sübut etmir: konturların yanında yalnız axtarış və kopyalama üçün xidməti cədvəl yazılır.',
                'Fotonun üzərindəki şəffaflıqlı qradiyent çapa getmir: üz qabığındakı qaraltma mətbəədən moruq rəngi ilə dolu qayıtdı. Qaraltmanı birbaşa şəklin içinə yandırdıq və problem qalmadı.',
                'PDF PowerPoint-dən saxlanılmır, öz skriptimizlə yığılır: PowerPoint fayla quraşdırılmış şriftlərlə həqiqi mətn qoyur və şəkilləri sıxır — fon 300 dpi normasına qarşı təxminən 110 dpi ilə gəlirdi.',
              ],
            },
          ],
        },
        {
          id: 'timeline',
          title: 'Müddət və proses',
          blocks: [
            { p: 'Beş günlük iş. Menyu razılaşdırılıb, yığılıb və çap olunub, iş 2026-cı il avqustun 10-da tamamlanıb. Yekun komplekt: üç cildləmə variantı üçün altı çap PDF-i və rus və Azərbaycan dillərində iki redaktə oluna bilən PPTX.' },
          ],
        },
      ],
      shots: [],
    },
  },
};
