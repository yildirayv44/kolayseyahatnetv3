/**
 * Script to generate bilateral visa pages for popular country pairs
 * Run with: npx tsx scripts/generate-popular-visa-pages.ts
 */

// Popular country pairs for bilateral visa pages
const POPULAR_COUNTRY_PAIRS = [
  // Turkey-based (20 pairs)
  { source: 'TUR', destination: 'USA', priority: 1 },
  { source: 'TUR', destination: 'GBR', priority: 1 },
  { source: 'TUR', destination: 'DEU', priority: 1 },
  { source: 'TUR', destination: 'FRA', priority: 1 },
  { source: 'TUR', destination: 'ITA', priority: 1 },
  { source: 'TUR', destination: 'CAN', priority: 2 },
  { source: 'TUR', destination: 'AUS', priority: 2 },
  { source: 'TUR', destination: 'JPN', priority: 2 },
  { source: 'TUR', destination: 'CHN', priority: 2 },
  { source: 'TUR', destination: 'RUS', priority: 2 },
  { source: 'TUR', destination: 'NLD', priority: 3 },
  { source: 'TUR', destination: 'ESP', priority: 3 },
  { source: 'TUR', destination: 'CHE', priority: 3 },
  { source: 'TUR', destination: 'BEL', priority: 3 },
  { source: 'TUR', destination: 'AUT', priority: 3 },
  { source: 'TUR', destination: 'SWE', priority: 3 },
  { source: 'TUR', destination: 'NOR', priority: 3 },
  { source: 'TUR', destination: 'DNK', priority: 3 },
  { source: 'TUR', destination: 'FIN', priority: 3 },
  { source: 'TUR', destination: 'IRL', priority: 3 },
  
  // Other popular pairs (10 pairs)
  { source: 'FIN', destination: 'AFG', priority: 4 },
  { source: 'FIN', destination: 'TUR', priority: 4 },
  { source: 'FIN', destination: 'RUS', priority: 4 },
  { source: 'USA', destination: 'TUR', priority: 4 },
  { source: 'USA', destination: 'CHN', priority: 4 },
  { source: 'USA', destination: 'MEX', priority: 4 },
  { source: 'DEU', destination: 'TUR', priority: 5 },
  { source: 'DEU', destination: 'SYR', priority: 5 },
  { source: 'DEU', destination: 'AFG', priority: 5 },
  { source: 'GBR', destination: 'TUR', priority: 5 },
];

async function generateVisaPages() {
  const API_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  console.log('🚀 Starting bilateral visa page generation...\n');
  console.log(`📊 Total pairs to generate: ${POPULAR_COUNTRY_PAIRS.length}\n`);
  
  // Sort by priority
  const sortedPairs = [...POPULAR_COUNTRY_PAIRS].sort((a, b) => a.priority - b.priority);
  
  let successful = 0;
  let failed = 0;
  const errors: any[] = [];
  
  for (const pair of sortedPairs) {
    try {
      console.log(`⏳ Generating: ${pair.source} → ${pair.destination}...`);
      
      // Generate Turkish version
      const trResponse = await fetch(`${API_URL}/api/admin/visa-pages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_country_code: pair.source,
          destination_country_code: pair.destination,
          locale: 'tr'
        })
      });
      
      if (!trResponse.ok) {
        throw new Error(`TR generation failed: ${await trResponse.text()}`);
      }
      
      const trData = await trResponse.json();
      console.log(`  ✅ Turkish: ${trData.data?.slug || 'generated'}`);
      
      // Wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Generate English version
      const enResponse = await fetch(`${API_URL}/api/admin/visa-pages/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_country_code: pair.source,
          destination_country_code: pair.destination,
          locale: 'en'
        })
      });
      
      if (!enResponse.ok) {
        throw new Error(`EN generation failed: ${await enResponse.text()}`);
      }
      
      const enData = await enResponse.json();
      console.log(`  ✅ English: ${enData.data?.slug || 'generated'}`);
      
      successful++;
      
      // Wait 200ms before next pair
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error: any) {
      console.log(`  ❌ Failed: ${error.message}`);
      failed++;
      errors.push({
        pair: `${pair.source} → ${pair.destination}`,
        error: error.message
      });
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📈 Generation Summary:');
  console.log(`  ✅ Successful: ${successful} pairs (${successful * 2} pages)`);
  console.log(`  ❌ Failed: ${failed} pairs`);
  console.log('='.repeat(50));
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(err => {
      console.log(`  - ${err.pair}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Done!');
}

// Run the script
generateVisaPages().catch(console.error);
