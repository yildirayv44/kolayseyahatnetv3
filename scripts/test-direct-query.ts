/**
 * Direct test of country query to debug RLS issue
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testQuery() {
  console.log('Testing country queries...\n');
  
  console.log('1️⃣ Testing with ANON key:');
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('countries')
    .select('country_code, name')
    .in('country_code', ['TUR', 'USA']);
  
  console.log('   Data:', anonData);
  console.log('   Error:', anonError);
  
  console.log('\n2️⃣ Testing with ADMIN key:');
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from('countries')
    .select('country_code, name')
    .in('country_code', ['TUR', 'USA']);
  
  console.log('   Data:', adminData);
  console.log('   Error:', adminError);
  
  console.log('\n3️⃣ Environment check:');
  console.log('   SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.log('   ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  console.log('   SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
}

testQuery().catch(console.error);
