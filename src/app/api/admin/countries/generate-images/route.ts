import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { downloadAndUploadImage, STORAGE_BUCKETS } from "@/lib/storage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Download and save country cover images to Supabase Storage
 * GET /api/admin/countries/generate-images?save=true&auto_search=true
 * GET /api/admin/countries/generate-images (just check)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const shouldSave = searchParams.get('save') === 'true';
    const autoSearch = searchParams.get('auto_search') === 'true';

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

    // Check which countries are using fallback or external URLs
    const countriesWithFallback = countries?.filter(c => {
      const imageUrl = getCountryDefaultImage(c.name);
      return imageUrl === DEFAULT_IMAGES.country;
    }) || [];

    const countriesWithExternalImage = countries?.filter(c => {
      const imageUrl = getCountryDefaultImage(c.name);
      return imageUrl !== DEFAULT_IMAGES.country && !imageUrl.includes('supabase.co/storage');
    }) || [];

    const countriesWithStorageImage = countries?.filter(c => {
      const imageUrl = getCountryDefaultImage(c.name);
      return imageUrl.includes('supabase.co/storage');
    }) || [];

    console.log(`✅ ${countriesWithStorageImage.length} countries already in storage`);
    console.log(`🌐 ${countriesWithExternalImage.length} countries using external URLs`);
    console.log(`⚠️  ${countriesWithFallback.length} countries using generic fallback`);

    // If not saving, just return the check results
    if (!shouldSave) {
      return NextResponse.json({
        success: true,
        total: countries?.length || 0,
        in_storage: countriesWithStorageImage.length,
        external_urls: countriesWithExternalImage.length,
        using_fallback: countriesWithFallback.length,
        storage_countries: countriesWithStorageImage.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: getCountryDefaultImage(c.name)
        })),
        external_countries: countriesWithExternalImage.map((c: any) => ({
          id: c.id,
          name: c.name,
          image: getCountryDefaultImage(c.name)
        })),
        fallback_countries: countriesWithFallback.map((c: any) => ({
          id: c.id,
          name: c.name,
          fallback_image: DEFAULT_IMAGES.country
        }))
      });
    }

    // Determine which countries to process
    const countriesToProcess = autoSearch 
      ? [...countriesWithFallback, ...countriesWithExternalImage]
      : countriesWithExternalImage;

    // Save images to Supabase Storage
    console.log(`💾 Starting to save ${countriesToProcess.length} images to storage...`);
    
    const savedImages = [];
    const failedImages = [];

    for (const country of countriesToProcess) {
      try {
        let imageUrl = getCountryDefaultImage(country.name);
        
        // If using fallback and auto_search enabled, search for image
        if (autoSearch && imageUrl === DEFAULT_IMAGES.country) {
          console.log(`🔍 Searching image for ${country.name}...`);
          
          // Try Pexels first
          const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
          if (PEXELS_API_KEY) {
            try {
              const searchQuery = `${country.name} landmark travel`;
              const pexelsResponse = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
                {
                  headers: {
                    'Authorization': PEXELS_API_KEY
                  }
                }
              );

              if (pexelsResponse.ok) {
                const pexelsData = await pexelsResponse.json();
                if (pexelsData.photos && pexelsData.photos.length > 0) {
                  imageUrl = pexelsData.photos[0].src.large;
                  console.log(`✅ Found Pexels image for ${country.name}`);
                }
              }
            } catch (error) {
              console.log(`⚠️  Pexels search failed for ${country.name}`);
            }
          }

          // If still no image, try Unsplash
          if (imageUrl === DEFAULT_IMAGES.country) {
            const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
            if (UNSPLASH_ACCESS_KEY) {
              try {
                const searchQuery = `${country.name} landmark`;
                const unsplashResponse = await fetch(
                  `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
                  {
                    headers: {
                      'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
                    }
                  }
                );

                if (unsplashResponse.ok) {
                  const unsplashData = await unsplashResponse.json();
                  if (unsplashData.results && unsplashData.results.length > 0) {
                    imageUrl = unsplashData.results[0].urls.regular;
                    console.log(`✅ Found Unsplash image for ${country.name}`);
                  }
                }
              } catch (error) {
                console.log(`⚠️  Unsplash search failed for ${country.name}`);
              }
            }
          }

          // If still no image found, skip
          if (imageUrl === DEFAULT_IMAGES.country) {
            console.log(`❌ No image found for ${country.name}, skipping`);
            failedImages.push({
              id: country.id,
              name: country.name,
              error: 'No image found'
            });
            continue;
          }
        }
        
        // Skip if already using storage
        if (imageUrl.includes('supabase.co/storage')) {
          console.log(`⏭️  ${country.name} already using storage`);
          continue;
        }

        console.log(`📥 Downloading image for ${country.name}...`);
        
        // Sanitize folder name (remove Turkish characters, spaces, special chars)
        const folderName = country.name
          .toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/İ/g, 'i')
          .replace(/Ğ/g, 'g')
          .replace(/Ü/g, 'u')
          .replace(/Ş/g, 's')
          .replace(/Ö/g, 'o')
          .replace(/Ç/g, 'c')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        
        // Download and upload to storage
        const result = await downloadAndUploadImage(
          imageUrl,
          STORAGE_BUCKETS.COUNTRIES,
          folderName
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
