import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { searchPexelsPhotos } from '@/lib/pexels';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Upload cover images for countries from Pexels
 * POST /api/admin/countries/upload-cover-images
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      countryIds, // Optional: specific country IDs to process
      overwrite = false, // Whether to overwrite existing images
      limit = 10 // Max countries to process in one request
    } = body;

    console.log('🖼️ Starting country cover image upload...');
    console.log(`Settings: overwrite=${overwrite}, limit=${limit}`);

    // Get countries to process
    let query = supabase
      .from('countries')
      .select('id, name, image_url, country_code')
      .eq('status', 1);

    if (countryIds && countryIds.length > 0) {
      query = query.in('id', countryIds);
    } else if (!overwrite) {
      // Only process countries without images
      query = query.or('image_url.is.null,image_url.eq.');
    }

    query = query.limit(limit);

    const { data: countries, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching countries:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    if (!countries || countries.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No countries to process',
        processed: 0,
        results: []
      });
    }

    console.log(`📋 Processing ${countries.length} countries...`);

    const results = [];

    for (const country of countries) {
      console.log(`\n🌍 Processing: ${country.name}`);

      try {
        // Search for country image on Pexels
        const searchQueries = [
          `${country.name} landmark`,
          `${country.name} travel destination`,
          `${country.name} tourism`,
          `${country.name} cityscape`,
          country.name
        ];

        let imageUrl = null;
        let pexelsPhoto = null;

        // Try each query until we find a good image
        for (const query of searchQueries) {
          console.log(`  🔍 Trying: "${query}"`);
          
          const pexelsResult = await searchPexelsPhotos(query, {
            perPage: 3,
            orientation: 'landscape',
            size: 'large'
          });

          if (pexelsResult && pexelsResult.photos.length > 0) {
            pexelsPhoto = pexelsResult.photos[0];
            console.log(`  ✅ Found image: ${pexelsPhoto.src.large}`);
            break;
          }

          // Wait a bit between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (!pexelsPhoto) {
          console.log(`  ⚠️ No image found for ${country.name}`);
          results.push({
            country_id: country.id,
            country_name: country.name,
            success: false,
            error: 'No image found on Pexels'
          });
          continue;
        }

        // Download image from Pexels
        console.log(`  📥 Downloading image...`);
        const imageResponse = await fetch(pexelsPhoto.src.large);
        
        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.statusText}`);
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });

        // Generate filename
        const filename = `${country.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
        const storagePath = `uploads/photos/shares/${filename}`;

        // Upload to Supabase Storage
        console.log(`  ☁️ Uploading to Supabase Storage...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(storagePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: overwrite
          });

        if (uploadError) {
          console.error(`  ❌ Upload error:`, uploadError);
          
          // Fallback: use Pexels URL directly
          imageUrl = pexelsPhoto.src.large;
          console.log(`  ⚠️ Using Pexels URL as fallback`);
        } else {
          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(storagePath);

          imageUrl = publicUrlData.publicUrl;
          console.log(`  ✅ Uploaded: ${imageUrl}`);
        }

        // Update country with new image URL
        const { error: updateError } = await supabase
          .from('countries')
          .update({ 
            image_url: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', country.id);

        if (updateError) {
          console.error(`  ❌ Update error:`, updateError);
          results.push({
            country_id: country.id,
            country_name: country.name,
            success: false,
            error: 'Failed to update country'
          });
        } else {
          console.log(`  ✅ Updated country record`);
          results.push({
            country_id: country.id,
            country_name: country.name,
            success: true,
            image_url: imageUrl,
            photographer: pexelsPhoto.photographer,
            photographer_url: pexelsPhoto.photographer_url
          });
        }

      } catch (error: any) {
        console.error(`  ❌ Error processing ${country.name}:`, error);
        results.push({
          country_id: country.id,
          country_name: country.name,
          success: false,
          error: error.message
        });
      }

      // Wait between countries to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`\n✅ Completed! Success: ${successCount}, Failed: ${failCount}`);

    return NextResponse.json({
      success: true,
      message: `Processed ${countries.length} countries`,
      processed: countries.length,
      success_count: successCount,
      fail_count: failCount,
      results
    });

  } catch (error: any) {
    console.error('Error in upload-cover-images:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
