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

async function checkBlogSlugs() {
  console.log('🔍 Checking blog slugs...\n');

  // Get all blog taxonomies with new slug format (containing /)
  const { data: taxonomies, error } = await supabase
    .from('taxonomies')
    .select('id, slug, model_id, type')
    .in('type', ['Blog\\BlogController@detail', 'Country\\CountryController@blogDetail'])
    .like('slug', '%/%');

  if (error) {
    console.error('❌ Error fetching taxonomies:', error);
    return;
  }

  if (!taxonomies || taxonomies.length === 0) {
    console.log('✅ All blog slugs are in old format (no / in slugs)');
    console.log('✅ No action needed!\n');
    return;
  }

  console.log(`⚠️  Found ${taxonomies.length} blog slugs with new format (containing /)\n`);

  // Get blog details
  const blogIds = taxonomies.map(t => t.model_id);
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title, status')
    .in('id', blogIds);

  const blogMap = new Map(blogs?.map(b => [b.id, b]) || []);

  console.log('📋 Blog slugs that need restoration:\n');
  
  for (const tax of taxonomies) {
    const blog = blogMap.get(tax.model_id);
    const oldSlug = tax.slug.split('/').pop();
    
    console.log(`📝 Blog: ${blog?.title || 'Unknown'}`);
    console.log(`   Current: ${tax.slug}`);
    console.log(`   Should be: ${oldSlug}`);
    console.log(`   Type: ${tax.type}`);
    console.log(`   Status: ${blog?.status === 1 ? 'Active' : 'Inactive'}`);
    console.log('');
  }

  console.log('\n💡 To restore these slugs, run:');
  console.log('   npm run restore-blog-slugs\n');
}

// Run the script
checkBlogSlugs()
  .then(() => {
    console.log('✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
