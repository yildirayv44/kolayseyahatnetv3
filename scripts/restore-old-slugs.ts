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

async function restoreOldSlugs() {
  console.log('🔄 Starting slug restoration...\n');

  // Get all country menu taxonomies with new slug format (containing /)
  const { data: taxonomies, error } = await supabase
    .from('taxonomies')
    .select('id, slug, model_id, type')
    .eq('type', 'Country\\CountryController@menuDetail')
    .like('slug', '%/%');

  if (error) {
    console.error('❌ Error fetching taxonomies:', error);
    return;
  }

  if (!taxonomies || taxonomies.length === 0) {
    console.log('✅ No slugs to restore (all slugs are already in old format)');
    return;
  }

  console.log(`📊 Found ${taxonomies.length} slugs with new format\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const tax of taxonomies) {
    // Extract the last part of the slug (after last /)
    const parts = tax.slug.split('/');
    const oldSlug = parts[parts.length - 1];

    console.log(`🔄 Restoring: ${tax.slug} → ${oldSlug}`);

    // Update the slug
    const { error: updateError } = await supabase
      .from('taxonomies')
      .update({ slug: oldSlug })
      .eq('id', tax.id);

    if (updateError) {
      console.error(`   ❌ Error: ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ Success`);
      successCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully restored: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total processed: ${taxonomies.length}`);
}

// Run the script
restoreOldSlugs()
  .then(() => {
    console.log('\n✅ Slug restoration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
