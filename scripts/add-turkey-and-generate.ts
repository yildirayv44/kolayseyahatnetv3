/**
 * Add Turkey to database and generate bilateral visa pages
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function addTurkeyAndGenerate() {
  console.log('🇹🇷 Adding Turkey to database...\n');
  
  // Get max sorted value
  const { data: maxSorted } = await supabase
    .from('countries')
    .select('sorted')
    .order('sorted', { ascending: false })
    .limit(1)
    .single();
  
  const nextSorted = (maxSorted?.sorted || 0) + 1;
  
  // Check if Turkey already exists
  const { data: existing } = await supabase
    .from('countries')
    .select('*')
    .eq('country_code', 'TUR')
    .maybeSingle();
  
  let turkey;
  
  if (existing) {
    console.log('✅ Turkey already exists in database');
    turkey = existing;
  } else {
    // Insert Turkey
    const { data: inserted, error: turkeyError } = await supabase
      .from('countries')
      .insert({
        country_code: 'TUR',
        name: 'Türkiye',
        is_source_country: true,
        status: 1,
        flag_emoji: '🇹🇷',
        region: 'Middle East',
        sorted: nextSorted
      })
      .select()
      .single();
    
    if (turkeyError) {
      console.error('❌ Error adding Turkey:', turkeyError);
      return;
    }
    
    turkey = inserted;
  }
  
  console.log('✅ Turkey added successfully!');
  console.log(`   ID: ${turkey.id}, Code: ${turkey.country_code}, Name: ${turkey.name}\n`);
  
  // Now generate a test page
  console.log('🚀 Generating test page: Turkey → USA...\n');
  
  const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${API_URL}/api/admin/visa-pages/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_country_code: 'TUR',
      destination_country_code: 'USA',
      locale: 'tr'
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Page generated successfully!');
    console.log(`   Slug: ${result.data.slug}`);
    console.log(`   Status: ${result.data.content_status}`);
    console.log('\n🎉 Test page created! Visit: http://localhost:3000/' + result.data.slug);
  } else {
    console.error('❌ Generation failed:', result.error);
  }
}

addTurkeyAndGenerate().catch(console.error);
