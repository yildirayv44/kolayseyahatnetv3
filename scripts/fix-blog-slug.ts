/**
 * Bu script, yanlış ülke taxonomy'si olarak kayıtlı blog slug'larını düzeltir.
 * 
 * Kullanım:
 * npx tsx scripts/fix-blog-slug.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local dosyasını yükle
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBlogSlug() {
  const problematicSlug = 'ev-alana-vatandaslik-veren-ulkeler';
  
  console.log('🔍 Checking slug:', problematicSlug);
  
  // 1. Taxonomies tablosunda bu slug'ı kontrol et
  const { data: taxonomies, error: taxError } = await supabase
    .from('taxonomies')
    .select('*')
    .eq('slug', problematicSlug);
  
  if (taxError) {
    console.error('❌ Error fetching taxonomies:', taxError);
    return;
  }
  
  console.log('📊 Found taxonomies:', taxonomies);
  
  // 2. Bu slug'ın blog olup olmadığını kontrol et
  const blogId = taxonomies?.find(t => t.type.includes('Blog'))?.model_id;
  let blog = null;
  let blogError = null;
  
  if (blogId) {
    const result = await supabase
      .from('blogs')
      .select('id, title')
      .eq('id', blogId)
      .maybeSingle();
    
    blog = result.data ? [result.data] : null;
    blogError = result.error;
  }
  
  if (blogError) {
    console.error('❌ Error fetching blog:', blogError);
    return;
  }
  
  console.log('📝 Found blog:', blog);
  
  // 3. Yanlış taxonomy'leri göster
  const wrongTaxonomies = taxonomies?.filter(t => 
    t.type.includes('Country') && !t.type.includes('blog')
  );
  
  if (wrongTaxonomies && wrongTaxonomies.length > 0) {
    console.log('⚠️  Wrong taxonomies found:', wrongTaxonomies);
    console.log('\n📋 To fix this issue, run the following SQL in Supabase SQL Editor:');
    console.log('\n```sql');
    console.log(`-- Delete wrong country taxonomy`);
    console.log(`DELETE FROM taxonomies`);
    console.log(`WHERE slug = '${problematicSlug}'`);
    console.log(`AND type LIKE '%Country%'`);
    console.log(`AND type NOT LIKE '%blog%';`);
    
    if (blog && blog.length > 0) {
      console.log(`\n-- Add correct blog taxonomy (if not exists)`);
      console.log(`INSERT INTO taxonomies (slug, type, model_id)`);
      console.log(`SELECT 'blog/${problematicSlug}', 'Blog\\\\BlogController@detail', ${blog[0].id}`);
      console.log(`WHERE NOT EXISTS (`);
      console.log(`  SELECT 1 FROM taxonomies`);
      console.log(`  WHERE slug = 'blog/${problematicSlug}'`);
      console.log(`  AND type = 'Blog\\\\BlogController@detail'`);
      console.log(`);`);
    }
    console.log('```\n');
  } else {
    console.log('✅ No wrong taxonomies found!');
  }
}

fixBlogSlug().catch(console.error);
