/**
 * Bu script, blog ve ülke içeriklerindeki 404 dönen görselleri
 * Pexels API kullanarak otomatik olarak değiştirir.
 * 
 * Kullanım:
 * npx tsx scripts/fix-broken-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { replacebrokenImagesInHTML, isImageBroken } from '../src/lib/pexels';

// .env.local dosyasını yükle
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBrokenImagesInBlogs() {
  console.log('🔍 Checking blogs for broken images...\n');
  
  // Tüm blogları çek
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select('id, title, contents, image_url')
    .eq('status', 1);
  
  if (error) {
    console.error('❌ Error fetching blogs:', error);
    return;
  }
  
  if (!blogs || blogs.length === 0) {
    console.log('ℹ️  No blogs found');
    return;
  }
  
  console.log(`📊 Found ${blogs.length} blogs\n`);
  
  let totalFixed = 0;
  
  for (const blog of blogs) {
    console.log(`\n📝 Checking blog: ${blog.title}`);
    
    // İçerikteki kırık görselleri kontrol et ve değiştir
    if (blog.contents) {
      const { html: updatedContents, replacedCount } = await replacebrokenImagesInHTML(
        blog.contents,
        blog.title
      );
      
      if (replacedCount > 0) {
        // Database'i güncelle
        const { error: updateError } = await supabase
          .from('blogs')
          .update({ contents: updatedContents })
          .eq('id', blog.id);
        
        if (updateError) {
          console.error(`❌ Error updating blog ${blog.id}:`, updateError);
        } else {
          console.log(`✅ Fixed ${replacedCount} broken image(s) in content`);
          totalFixed += replacedCount;
        }
      }
    }
    
    // Ana görsel URL'sini kontrol et
    if (blog.image_url) {
      const isBroken = await isImageBroken(blog.image_url);
      
      if (isBroken) {
        console.log(`🔍 Main image is broken: ${blog.image_url}`);
        // Ana görseli de değiştirebiliriz ama şimdilik sadece rapor edelim
        console.log(`⚠️  Consider updating main image for blog ${blog.id}`);
      }
    }
  }
  
  console.log(`\n✅ Total fixed: ${totalFixed} broken image(s) in blogs`);
}

async function fixBrokenImagesInCountries() {
  console.log('\n🔍 Checking countries for broken images...\n');
  
  // Tüm ülkeleri çek
  const { data: countries, error } = await supabase
    .from('countries')
    .select('id, name, contents, price_contents, req_document, image_url')
    .eq('status', 1);
  
  if (error) {
    console.error('❌ Error fetching countries:', error);
    return;
  }
  
  if (!countries || countries.length === 0) {
    console.log('ℹ️  No countries found');
    return;
  }
  
  console.log(`📊 Found ${countries.length} countries\n`);
  
  let totalFixed = 0;
  
  for (const country of countries) {
    console.log(`\n🌍 Checking country: ${country.name}`);
    
    let needsUpdate = false;
    const updates: any = {};
    
    // Contents'teki kırık görselleri kontrol et
    if (country.contents) {
      const { html: updatedContents, replacedCount } = await replacebrokenImagesInHTML(
        country.contents,
        country.name
      );
      
      if (replacedCount > 0) {
        updates.contents = updatedContents;
        needsUpdate = true;
        totalFixed += replacedCount;
        console.log(`✅ Fixed ${replacedCount} broken image(s) in contents`);
      }
    }
    
    // Price contents'teki kırık görselleri kontrol et
    if (country.price_contents) {
      const { html: updatedPriceContents, replacedCount } = await replacebrokenImagesInHTML(
        country.price_contents,
        `${country.name} vize ücretleri`
      );
      
      if (replacedCount > 0) {
        updates.price_contents = updatedPriceContents;
        needsUpdate = true;
        totalFixed += replacedCount;
        console.log(`✅ Fixed ${replacedCount} broken image(s) in price_contents`);
      }
    }
    
    // Required documents'teki kırık görselleri kontrol et
    if (country.req_document) {
      const { html: updatedReqDocument, replacedCount } = await replacebrokenImagesInHTML(
        country.req_document,
        `${country.name} gerekli belgeler`
      );
      
      if (replacedCount > 0) {
        updates.req_document = updatedReqDocument;
        needsUpdate = true;
        totalFixed += replacedCount;
        console.log(`✅ Fixed ${replacedCount} broken image(s) in req_document`);
      }
    }
    
    // Database'i güncelle
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('countries')
        .update(updates)
        .eq('id', country.id);
      
      if (updateError) {
        console.error(`❌ Error updating country ${country.id}:`, updateError);
      }
    }
    
    // Ana görsel URL'sini kontrol et
    if (country.image_url) {
      const isBroken = await isImageBroken(country.image_url);
      
      if (isBroken) {
        console.log(`🔍 Main image is broken: ${country.image_url}`);
        console.log(`⚠️  Consider updating main image for country ${country.id}`);
      }
    }
  }
  
  console.log(`\n✅ Total fixed: ${totalFixed} broken image(s) in countries`);
}

async function main() {
  console.log('🚀 Starting broken image fix process...\n');
  
  try {
    await fixBrokenImagesInBlogs();
    await fixBrokenImagesInCountries();
    
    console.log('\n✅ Process completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during process:', error);
    process.exit(1);
  }
}

main();
