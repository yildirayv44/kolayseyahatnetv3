import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { downloadAndUploadImage, STORAGE_BUCKETS } from "@/lib/storage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Download and save country cover images to Supabase Storage
 * GET /api/admin/countries/generate-images?save=true
 * GET /api/admin/countries/generate-images (just check)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const shouldSave = searchParams.get('save') === 'true';

    // Import image helper
    const { getCountryDefaultImage, DEFAULT_IMAGES } = await import("@/lib/image-helpers");

    // Fetch all countries
    let query = supabase
      .from("countries")
      .select("id, name")
      .eq("status", 1);

    if (countryId) {
      query = query.eq("id", parseInt(countryId));
    }

    const { data: countries, error } = await query;

    if (error) throw error;

    // Check which countries are using fallback
    const countriesWithFallback = countries?.filter(c => {
      const imageUrl = getCountryDefaultImage(c.name);
      return imageUrl === DEFAULT_IMAGES.country;
    }) || [];

    const countriesWithSpecificImage = countries?.filter(c => {
      const imageUrl = getCountryDefaultImage(c.name);
      return imageUrl !== DEFAULT_IMAGES.country;
    }) || [];

    console.log(`📸 ${countriesWithSpecificImage.length} countries have specific images`);
    console.log(`⚠️  ${countriesWithFallback.length} countries using generic fallback`);

    // If not saving, just return the check results
    if (!shouldSave) {
      return NextResponse.json({
        success: true,
        total: countries?.length || 0,
        with_specific_image: countriesWithSpecificImage.length,
        using_fallback: countriesWithFallback.length,
        fallback_countries: countriesWithFallback.map(c => ({
          id: c.id,
          name: c.name,
          fallback_image: DEFAULT_IMAGES.country
        })),
        countries_with_images: countriesWithSpecificImage.map(c => ({
          id: c.id,
          name: c.name,
          image: getCountryDefaultImage(c.name)
        }))
      });
    }

    // Save images to Supabase Storage
    console.log(`💾 Starting to save ${countriesWithSpecificImage.length} images to storage...`);
    
    const savedImages = [];
    const failedImages = [];

    for (const country of countriesWithSpecificImage) {
      try {
        const imageUrl = getCountryDefaultImage(country.name);
        
        // Skip if already using storage
        if (imageUrl.includes('supabase.co/storage')) {
          console.log(`⏭️  ${country.name} already using storage`);
          continue;
        }

        console.log(`📥 Downloading image for ${country.name}...`);
        
        // Download and upload to storage
        const result = await downloadAndUploadImage(
          imageUrl,
          STORAGE_BUCKETS.COUNTRIES,
          country.name.toLowerCase().replace(/\s+/g, '-')
        );

        if ('error' in result) {
          console.error(`❌ Failed to save ${country.name}: ${result.error}`);
          failedImages.push({
            id: country.id,
            name: country.name,
            error: result.error
          });
        } else {
          console.log(`✅ Saved ${country.name} to storage: ${result.url}`);
          savedImages.push({
            id: country.id,
            name: country.name,
            storage_url: result.url,
            storage_path: result.path
          });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`❌ Exception for ${country.name}:`, error);
        failedImages.push({
          id: country.id,
          name: country.name,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${savedImages.length} images to storage`,
      saved: savedImages.length,
      failed: failedImages.length,
      saved_images: savedImages,
      failed_images: failedImages
    });

  } catch (error: any) {
    console.error('Generate images error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
