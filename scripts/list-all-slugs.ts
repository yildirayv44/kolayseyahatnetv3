import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listAllSlugs(searchTerm?: string) {
  console.log('🔍 Listing all slugs...\n');

  let query = supabase
    .from('taxonomies')
    .select('id, slug, type, model_id')
    .order('slug');

  if (searchTerm) {
    query = query.ilike('slug', `%${searchTerm}%`);
    console.log(`🔎 Filtering by: ${searchTerm}\n`);
  }

  const { data: taxonomies, error } = await query;

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!taxonomies || taxonomies.length === 0) {
    console.log('❌ No slugs found');
    return;
  }

  console.log(`📊 Found ${taxonomies.length} slug(s):\n`);

  // Group by type
  const grouped = taxonomies.reduce((acc, tax) => {
    if (!acc[tax.type]) {
      acc[tax.type] = [];
    }
    acc[tax.type].push(tax);
    return acc;
  }, {} as Record<string, typeof taxonomies>);

  for (const [type, items] of Object.entries(grouped)) {
    console.log(`\n📁 ${type} (${items.length} items):`);
    console.log('━'.repeat(80));
    
    for (const item of items) {
      console.log(`   ${item.slug}`);
    }
  }
}

// Get search term from command line argument
const searchTerm = process.argv[2];

// Run the script
listAllSlugs(searchTerm)
  .then(() => {
    console.log('\n✅ Listing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
