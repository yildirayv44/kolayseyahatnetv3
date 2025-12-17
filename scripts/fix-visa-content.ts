import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface VisaRequirement {
  country_code: string;
  visa_status: string;
  allowed_stay: string | null;
  available_methods: string[] | null;
  conditions: string | null;
}

interface Country {
  id: number;
  name: string;
  country_code: string;
  contents: string | null;
  is_manual_content?: boolean;
}

// Countries with manually created content - DO NOT overwrite
const MANUAL_CONTENT_COUNTRIES = [
  'GRC',  // Yunanistan
  'KOR',  // Güney Kore
  'USA',  // Amerika
  'GBR',  // İngiltere
  'KWT',  // Kuveyt
  'ARE',  // Dubai (BAE)
  'KEN',  // Kenya
];

// Keywords that indicate visa-free content
const VISA_FREE_KEYWORDS = [
  'vizesiz',
  'vize gerekmemektedir',
  'vize talep etmemektedir',
  'vize başvurusu gerekmemektedir',
  'vize işlemi gerekmez',
];

function analyzeContent(content: string | null): string {
  if (!content) return 'unknown';
  const lower = content.toLowerCase();
  
  for (const kw of VISA_FREE_KEYWORDS) {
    if (lower.includes(kw)) return 'visa-free';
  }
  if (lower.includes('vize gereklidir') || lower.includes('vize başvurusu yapmanız gerekmektedir')) {
    return 'visa-required';
  }
  if (lower.includes('e-vize') || lower.includes('evize')) return 'evisa';
  if (lower.includes('kapıda vize') || lower.includes('varışta vize')) return 'visa-on-arrival';
  
  return 'unknown';
}

function getMethodLabel(method: string): string {
  switch (method) {
    case 'visa-free': return 'Vizesiz Giriş';
    case 'visa-on-arrival': return 'Varışta Vize (Kapıda Vize)';
    case 'eta':
    case 'evisa': return 'e-Vize (Elektronik Vize)';
    case 'embassy': return 'Konsolosluk Vizesi';
    case 'visa-required': return 'Vize Gerekli';
    default: return method;
  }
}

function buildMethodsDescription(methods: string[] | null, visaStatus: string): string {
  const effectiveMethods = methods && methods.length > 0 ? methods : [visaStatus];
  
  if (effectiveMethods.length === 1) {
    return getMethodLabel(effectiveMethods[0]);
  }
  
  // Multiple methods available
  const labels = effectiveMethods.map(getMethodLabel);
  return labels.join(' veya ');
}

function buildMethodInstructions(methods: string[] | null, visaStatus: string, allowedStay: string): string {
  const effectiveMethods = methods && methods.length > 0 ? methods : [visaStatus];
  let instructions = '';
  
  // Check if multiple methods available
  const hasEvisa = effectiveMethods.includes('evisa') || effectiveMethods.includes('eta');
  const hasVOA = effectiveMethods.includes('visa-on-arrival');
  const hasEmbassy = effectiveMethods.includes('embassy') || effectiveMethods.includes('visa-required');
  const hasVisaFree = effectiveMethods.includes('visa-free');
  
  if (hasEvisa && hasVOA) {
    instructions = `
MEVCUT VİZE SEÇENEKLERİ (İKİSİNE DE YER VER):

1. e-Vize (Elektronik Vize) - ÖNERİLEN:
   - Online başvuru ile evden yapılabilir
   - Hızlı işlem süresi
   - Konsolosluk randevusu gerekmez
   - Kolay Seyahat ile profesyonel destek alabilirsiniz

2. Varışta Vize (Kapıda Vize):
   - Havalimanında vize alınabilir
   - Kuyruk olabilir
   - Nakit para bulundurmanız gerekebilir
   - Önceden hazırlık yapmanız önerilir

Kalış süresi: ${allowedStay}
`;
  } else if (hasEvisa) {
    instructions = `
VİZE DURUMU: e-Vize (Elektronik Vize)
- Online başvuru ile evden yapılabilir
- Hızlı işlem süresi
- Konsolosluk randevusu gerekmez
- Kolay Seyahat ile profesyonel destek alabilirsiniz
Kalış süresi: ${allowedStay}
`;
  } else if (hasVOA) {
    instructions = `
VİZE DURUMU: Varışta Vize (Kapıda Vize)
- Havalimanında vize alınabilir
- Kuyruk olabilir
- Nakit para bulundurmanız gerekebilir
- Önceden hazırlık yapmanız önerilir
Kalış süresi: ${allowedStay}
`;
  } else if (hasEmbassy) {
    instructions = `
VİZE DURUMU: Konsolosluk Vizesi
- Konsolosluk veya büyükelçilik randevusu gereklidir
- Başvuru süreci zaman alabilir
- Kolay Seyahat ile randevu ve evrak sürecinizi kolaylaştırabilirsiniz
Kalış süresi: ${allowedStay}
`;
  } else if (hasVisaFree) {
    instructions = `
VİZE DURUMU: Vizesiz Giriş
- Türk vatandaşları vize başvurusu yapmadan giriş yapabilir
- Pasaportunuzun en az 6 ay geçerli olması gerekir
Kalış süresi: ${allowedStay}
`;
  }
  
  return instructions;
}

// Clean HTML artifacts from content
function cleanContent(content: string): string {
  let cleaned = content;
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```html\s*/gi, '');
  cleaned = cleaned.replace(/```\s*/gi, '');
  
  // Remove DOCTYPE and html/head/body tags
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?html[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?head[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?body[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
  cleaned = cleaned.replace(/<title[^>]*>.*?<\/title>/gi, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

async function generateCorrectContent(
  country: Country,
  visaReq: VisaRequirement
): Promise<string> {
  const allowedStay = visaReq.allowed_stay || '30 gün';
  const methodsDescription = buildMethodsDescription(visaReq.available_methods, visaReq.visa_status);
  const methodInstructions = buildMethodInstructions(visaReq.available_methods, visaReq.visa_status, allowedStay);

  const systemPrompt = `Sen bir vize ve seyahat içerik yazarısın. Türk vatandaşları için ${country.name} vize bilgisi içeriği yazacaksın.

ÖNEMLİ KURALLAR:
1. Vize durumu: ${methodsDescription}
2. Kalış süresi: ${allowedStay}
3. İçerik vize durumu ile TUTARLI olmalı - ASLA "vizesiz" veya "vize gerekmez" yazma (vizesiz giriş hariç)
4. "Kolay Seyahat" marka adını değiştirme
5. SADECE içerik HTML'i yaz - html, head, body, DOCTYPE gibi etiketler KULLANMA
6. Sadece h2, h3, p, ul, li etiketlerini kullan
7. SEO dostu, bilgilendirici ve profesyonel ton kullan
8. 600-900 kelime arası olsun

YASAKLAR - BUNLARI YAZMA:
- Ücret bilgisi verme (ücretler vize paketlerinde belirtiliyor)
- Gerekli belgeler listesi verme (belgeler ayrı bir bölümde JSON olarak sunuluyor)
- "Gerekli Belgeler" veya "Evraklar" başlığı açma
- Fiyat, ücret, maliyet gibi bilgiler

${methodInstructions}

İÇERİK YAPISI:
1. Vize Politikası Genel Açıklama (vize durumunu ve mevcut seçenekleri net belirt)
2. Başvuru Süreci Genel Anlatım (her seçenek için ayrı ayrı anlat)
3. Kolay Seyahat Avantajları (profesyonel destek, hızlı işlem, takip)
4. Sık Sorulan Sorular (3-4 soru - belgeler ve ücret hariç)`;

  const userPrompt = `${country.name} için Türk vatandaşlarına yönelik vize bilgisi içeriği yaz.

Vize durumu: ${methodsDescription}
Kalış süresi: ${allowedStay}
Mevcut yöntemler: ${visaReq.available_methods?.join(', ') || visaReq.visa_status}

Lütfen vize durumuna UYGUN yeni içerik oluştur. Ücret ve gerekli belge bilgisi VERME.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const rawContent = completion.choices[0]?.message?.content || '';
  return cleanContent(rawContent);
}

async function main() {
  const args = process.argv.slice(2);
  const processAll = args.includes('--all');
  const specificCountry = args.find(a => a.startsWith('--country='))?.split('=')[1];
  
  console.log('🔧 Vize İçerik Düzeltme Scripti\n');
  if (processAll) {
    console.log('📋 Mod: TÜM ülkeleri işle\n');
  } else if (specificCountry) {
    console.log(`📋 Mod: Sadece ${specificCountry} ülkesini işle\n`);
  } else {
    console.log('📋 Mod: Sadece tutarsız ülkeleri işle\n');
    console.log('   (Tüm ülkeleri işlemek için --all parametresi kullanın)\n');
  }
  
  // Get countries
  let query = supabase
    .from('countries')
    .select('id, name, country_code, contents')
    .eq('status', 1)
    .order('name');
  
  if (specificCountry) {
    query = query.eq('country_code', specificCountry);
  }
  
  const { data: countries, error: e1 } = await query;
  
  if (e1) {
    console.error('Countries error:', e1);
    return;
  }
  
  // Get visa requirements
  const { data: visaReqs, error: e2 } = await supabase
    .from('visa_requirements')
    .select('country_code, visa_status, allowed_stay, available_methods, conditions');
  
  if (e2) {
    console.error('Visa reqs error:', e2);
    return;
  }
  
  const visaMap = new Map<string, VisaRequirement>();
  visaReqs?.forEach(v => visaMap.set(v.country_code, v));
  
  // Build list of countries to process
  const toProcess: { country: Country; visaReq: VisaRequirement }[] = [];
  
  for (const c of countries || []) {
    const visaReq = visaMap.get(c.country_code);
    if (!visaReq) continue;
    
    // Skip countries with manual content (unless specifically requested)
    const isManual = MANUAL_CONTENT_COUNTRIES.includes(c.country_code);
    if (isManual && !specificCountry) {
      console.log(`⏭️  Atlanıyor (manuel içerik): ${c.name} (${c.country_code})`);
      continue;
    }
    
    if (processAll || specificCountry) {
      // Process all countries with visa requirements
      toProcess.push({ country: c, visaReq });
    } else {
      // Only process mismatches
      const contentIndicates = analyzeContent(c.contents);
      const dbStatus = visaReq.visa_status;
      
      let hasMismatch = false;
      
      if (dbStatus === 'visa-free' && contentIndicates === 'visa-required') hasMismatch = true;
      if (dbStatus === 'visa-required' && contentIndicates === 'visa-free') hasMismatch = true;
      if ((dbStatus === 'eta' || dbStatus === 'evisa') && contentIndicates === 'visa-free') hasMismatch = true;
      if (dbStatus === 'visa-on-arrival' && contentIndicates === 'visa-free') hasMismatch = true;
      if (dbStatus === 'visa-free' && contentIndicates === 'evisa') hasMismatch = true;
      
      if (hasMismatch) {
        toProcess.push({ country: c, visaReq });
      }
    }
  }
  
  console.log(`📊 İşlenecek ülke sayısı: ${toProcess.length}\n`);
  
  if (toProcess.length === 0) {
    console.log('✅ İşlenecek ülke yok.');
    return;
  }
  
  // Process each country
  let fixed = 0;
  let failed = 0;
  
  for (const { country, visaReq } of toProcess) {
    console.log(`\n🔄 [${fixed + failed + 1}/${toProcess.length}] ${country.name} (${country.country_code})`);
    console.log(`   Vize Durumu: ${visaReq.visa_status}`);
    console.log(`   Yöntemler: ${visaReq.available_methods?.join(', ') || 'yok'}`);
    
    try {
      // Generate new content
      const newContent = await generateCorrectContent(country, visaReq);
      
      if (!newContent || newContent.length < 100) {
        console.log(`   ❌ İçerik oluşturulamadı`);
        failed++;
        continue;
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('countries')
        .update({ contents: newContent })
        .eq('id', country.id);
      
      if (updateError) {
        console.log(`   ❌ Güncelleme hatası: ${updateError.message}`);
        failed++;
        continue;
      }
      
      console.log(`   ✅ Düzeltildi (${newContent.length} karakter)`);
      fixed++;
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.log(`   ❌ Hata: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '─'.repeat(50));
  console.log('📊 SONUÇ');
  console.log(`   ✅ Düzeltilen: ${fixed}`);
  console.log(`   ❌ Başarısız: ${failed}`);
  console.log(`   📋 Toplam: ${toProcess.length}`);
}

main().catch(console.error);
