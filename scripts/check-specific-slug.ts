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

async function checkSlug(slug: string) {
  console.log(`🔍 Checking slug: ${slug}\n`);

  // Check in taxonomies
  const { data: taxonomies, error } = await supabase
    .from('taxonomies')
    .select('id, slug, model_id, type')
    .or(`slug.eq.${slug},slug.like.%${slug}%`);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!taxonomies || taxonomies.length === 0) {
    console.log('❌ Slug not found in taxonomies table');
    console.log('\n💡 Possible reasons:');
    console.log('   1. Slug was deleted');
    console.log('   2. Slug name is different');
    console.log('   3. Content is inactive/unpublished');
    return;
  }

  console.log(`✅ Found ${taxonomies.length} matching record(s):\n`);

  for (const tax of taxonomies) {
    console.log(`📝 Taxonomy ID: ${tax.id}`);
    console.log(`   Slug: ${tax.slug}`);
    console.log(`   Type: ${tax.type}`);
    console.log(`   Model ID: ${tax.model_id}`);

    // Get related content based on type
    if (tax.type === 'Country\\CountryController@menuDetail') {
      const { data: menu } = await supabase
        .from('country_menus')
        .select('id, name, status')
        .eq('id', tax.model_id)
        .maybeSingle();

      if (menu) {
        console.log(`   Content: ${menu.name}`);
        console.log(`   Status: ${menu.status === 1 ? 'Active ✅' : 'Inactive ❌'}`);
      }
    } else if (tax.type === 'Blog\\BlogController@detail' || tax.type === 'Country\\CountryController@blogDetail') {
      const { data: blog } = await supabase
        .from('blogs')
        .select('id, title, status')
        .eq('id', tax.model_id)
        .maybeSingle();

      if (blog) {
        console.log(`   Content: ${blog.title}`);
        console.log(`   Status: ${blog.status === 1 ? 'Active ✅' : 'Inactive ❌'}`);
      }
    } else if (tax.type === 'Country\\CountryController@detail') {
      const { data: country } = await supabase
        .from('countries')
        .select('id, name, status')
        .eq('id', tax.model_id)
        .maybeSingle();

      if (country) {
        console.log(`   Content: ${country.name}`);
        console.log(`   Status: ${country.status === 1 ? 'Active ✅' : 'Inactive ❌'}`);
      }
    }

    console.log('');
  }
}

// Get slug from command line argument
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Please provide a slug as argument');
  console.log('\nUsage: npm run check-slug -- <slug>');
  console.log('Example: npm run check-slug -- amerika-f2m2-ogrenci-aile-vizesi');
  process.exit(1);
}

// Run the script
checkSlug(slug)
  .then(() => {
    console.log('✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
