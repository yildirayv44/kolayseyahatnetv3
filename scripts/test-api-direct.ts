/**
 * Test API endpoint directly with fetch
 */

async function testAPI() {
  console.log('Testing API endpoint directly...\n');
  
  const response = await fetch('http://localhost:3000/api/admin/visa-pages/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_country_code: 'TUR',
      destination_country_code: 'USA',
      locale: 'tr'
    })
  });
  
  const result = await response.json();
  
  console.log('Response status:', response.status);
  console.log('Response body:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ Success! Page generated:');
    console.log('   Slug:', result.data.slug);
    console.log('   Status:', result.data.content_status);
  } else {
    console.log('\n❌ Failed:', result.error);
  }
}

testAPI().catch(console.error);
