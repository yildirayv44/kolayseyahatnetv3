import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Mismatch {
  name: string;
  code: string;
  slug?: string;
  dbStatus: string | null;
  contentIndicates: string;
  issue: string;
}

// Keywords that indicate visa-free content
const VISA_FREE_KEYWORDS = [
  'vizesiz',
  'vize gerekmemektedir',
  'vize talep etmemektedir',
  'vize başvurusu gerekmemektedir',
  'vize işlemi gerekmez',
];

// Keywords that indicate visa required content  
const VISA_REQUIRED_KEYWORDS = [
  'vize gereklidir',
  'vize başvurusu yapmanız gerekmektedir',
  'vize almak zorunludur',
];

function analyzeContent(content: string | null): string {
  if (!content) return 'unknown';
  const lower = content.toLowerCase();
  
  for (const kw of VISA_FREE_KEYWORDS) {
    if (lower.includes(kw)) return 'visa-free';
  }
  for (const kw of VISA_REQUIRED_KEYWORDS) {
    if (lower.includes(kw)) return 'visa-required';
  }
  if (lower.includes('e-vize') || lower.includes('evize')) return 'evisa';
  if (lower.includes('kapıda vize') || lower.includes('varışta vize')) return 'visa-on-arrival';
  
  return 'unknown';
}

async function main() {
  console.log('🔍 Vize Gereklilikleri ve İçerik Analizi\n');
  
  // Get countries
  const { data: countries, error: e1 } = await supabase
    .from('countries')
    .select('id, name, country_code, contents')
    .eq('status', 1)
    .order('name');
  
  if (e1) {
    console.error('Countries error:', e1);
    return;
  }
  
  // Get taxonomies for slugs
  const countryIds = countries?.map(c => c.id) || [];
  const { data: taxonomies } = await supabase
    .from('taxonomies')
    .select('model_id, slug')
    .in('model_id', countryIds)
    .eq('type', 'Country\\CountryController@detail');
  
  const slugMap = new Map<number, string>();
  taxonomies?.forEach(t => slugMap.set(t.model_id, t.slug));
  
  // Get visa requirements
  const { data: visaReqs, error: e2 } = await supabase
    .from('visa_requirements')
    .select('country_code, visa_status');
  
  if (e2) {
    console.error('Visa reqs error:', e2);
    return;
  }
  
  const visaMap = new Map<string, string>();
  visaReqs?.forEach(v => visaMap.set(v.country_code, v.visa_status));
  
  // Analyze
  const mismatches: Mismatch[] = [];
  const noVisaReq: string[] = [];
  
  for (const c of countries || []) {
    const dbStatus = visaMap.get(c.country_code) || null;
    const contentIndicates = analyzeContent(c.contents);
    const slug = slugMap.get(c.id);
    
    if (!dbStatus) {
      noVisaReq.push(c.name);
      continue;
    }
    
    // Check mismatches
    let issue = '';
    
    if (dbStatus === 'visa-free' && contentIndicates === 'visa-required') {
      issue = 'DB: vizesiz ↔ İçerik: vize gerekli';
    }
    if (dbStatus === 'visa-required' && contentIndicates === 'visa-free') {
      issue = 'DB: vize gerekli ↔ İçerik: vizesiz';
    }
    if ((dbStatus === 'eta' || dbStatus === 'evisa') && contentIndicates === 'visa-free') {
      issue = 'DB: e-vize ↔ İçerik: vizesiz';
    }
    if (dbStatus === 'visa-on-arrival' && contentIndicates === 'visa-free') {
      issue = 'DB: varışta vize ↔ İçerik: vizesiz';
    }
    if (dbStatus === 'visa-free' && contentIndicates === 'evisa') {
      issue = 'DB: vizesiz ↔ İçerik: e-vize';
    }
    
    if (issue) {
      mismatches.push({
        name: c.name,
        code: c.country_code,
        slug,
        dbStatus,
        contentIndicates,
        issue
      });
    }
  }
  
  // Print results
  console.log('📊 ÖZET');
  console.log('─'.repeat(50));
  console.log(`Toplam ülke: ${countries?.length}`);
  console.log(`Vize gereksinimi tanımlı: ${visaReqs?.length}`);
  console.log(`Vize gereksinimi eksik: ${noVisaReq.length}`);
  console.log(`Tutarsızlık bulunan: ${mismatches.length}`);
  console.log('');
  
  if (mismatches.length > 0) {
    console.log('⚠️  TUTARSIZ ÜLKELER');
    console.log('─'.repeat(50));
    mismatches.forEach(m => {
      console.log(`\n🔴 ${m.name} (${m.code})`);
      console.log(`   URL: https://www.kolayseyahat.net/${m.slug}`);
      console.log(`   DB Vize Durumu: ${m.dbStatus}`);
      console.log(`   İçerik Gösteriyor: ${m.contentIndicates}`);
      console.log(`   Sorun: ${m.issue}`);
    });
  }
  
  if (noVisaReq.length > 0) {
    console.log('\n\n📋 VİZE GEREKSİNİMİ EKSİK ÜLKELER');
    console.log('─'.repeat(50));
    noVisaReq.forEach(name => console.log(`- ${name}`));
  }
}

main().catch(console.error);
