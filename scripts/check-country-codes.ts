/**
 * Check country codes in database
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkCountryCodes() {
  const codes = ['TUR', 'USA', 'GBR', 'DEU', 'FRA', 'ITA', 'CAN', 'AUS', 'JPN', 'CHN', 'RUS'];
  
  console.log('🔍 Checking country codes in database...\n');
  
  for (const code of codes) {
    const { data, error } = await supabase
      .from('countries')
      .select('country_code, name, name_en')
      .eq('country_code', code)
      .maybeSingle();
    
    if (data) {
      console.log(`✅ ${code}: ${data.name} (${data.name_en || 'no EN name'})`);
    } else {
      console.log(`❌ ${code}: NOT FOUND`);
    }
  }
  
  console.log('\n🔍 Searching for Turkey (without status filter):');
  const { data: turkey } = await supabase
    .from('countries')
    .select('country_code, name, name_en, status, id')
    .or('name.ilike.%türkiye%,name.ilike.%turkey%,name_en.ilike.%turkey%,country_code.eq.TUR')
    .maybeSingle();
  
  if (turkey) {
    console.log(`✅ Found: ${turkey.country_code} - ${turkey.name} (${turkey.name_en || 'N/A'})`);
  } else {
    console.log('❌ Turkey not found');
  }
  
  console.log('\n🔍 Searching for USA:');
  const { data: usa } = await supabase
    .from('countries')
    .select('country_code, name, name_en')
    .or('name.ilike.%amerika%,name.ilike.%usa%,name_en.ilike.%united states%,name_en.ilike.%america%')
    .maybeSingle();
  
  if (usa) {
    console.log(`✅ Found: ${usa.country_code} - ${usa.name} (${usa.name_en || 'N/A'})`);
  } else {
    console.log('❌ USA not found');
  }
  
  console.log('\n�� Listing all country codes:');
  const { data: allCountries } = await supabase
    .from('countries')
    .select('country_code, name')
    .eq('status', 1)
    .order('country_code');
  
  if (allCountries) {
    console.log(`Total countries: ${allCountries.length}\n`);
    
    // Show countries that might be USA
    console.log('Countries with "Amerika" or similar:');
    allCountries.filter(c => 
      c.name.toLowerCase().includes('amerika') || 
      c.name.toLowerCase().includes('birleşik')
    ).forEach(c => {
      console.log(`  ${c.country_code}: ${c.name}`);
    });
    
    console.log('\nAll countries (first 50):');
    allCountries.slice(0, 50).forEach(c => {
      console.log(`  ${c.country_code}: ${c.name}`);
    });
    console.log('  ...');
  }
}

checkCountryCodes().catch(console.error);
