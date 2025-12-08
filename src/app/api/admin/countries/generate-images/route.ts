import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Generate missing country cover images using Unsplash API
 * GET /api/admin/countries/generate-images
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');
    const autoFix = searchParams.get('auto_fix') === 'true';

    // Fetch countries without cover images
    let query = supabase
      .from("countries")
      .select("id, name, cover_image")
      .eq("status", 1);

    if (countryId) {
      query = query.eq("id", parseInt(countryId));
    }

    const { data: countries, error } = await query;

    if (error) throw error;

    const countriesWithoutImages = countries?.filter(
      c => !c.cover_image || 
           c.cover_image.includes('kolayseyahat.tr') || 
           c.cover_image.includes('kolayseyahat.net')
    ) || [];

    console.log(`📸 Found ${countriesWithoutImages.length} countries without valid cover images`);

    if (!autoFix) {
      return NextResponse.json({
        success: true,
        count: countriesWithoutImages.length,
        countries: countriesWithoutImages.map(c => ({
          id: c.id,
          name: c.name,
          current_image: c.cover_image
        }))
      });
    }

    // Auto-fix: Generate Unsplash URLs
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    const updates = [];

    for (const country of countriesWithoutImages) {
      let imageUrl = null;

      if (UNSPLASH_ACCESS_KEY) {
        // Try to fetch from Unsplash API
        try {
          const searchQuery = `${country.name} landmark travel`;
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`,
            {
              headers: {
                'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              imageUrl = `${data.results[0].urls.regular}&w=1200&h=630&q=80&fit=crop`;
            }
          }
        } catch (error) {
          console.error(`Failed to fetch Unsplash image for ${country.name}:`, error);
        }
      }

      // Fallback to generic country image
      if (!imageUrl) {
        imageUrl = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&q=80&fit=crop`;
      }

      // Update database
      const { error: updateError } = await supabase
        .from("countries")
        .update({ cover_image: imageUrl })
        .eq("id", country.id);

      if (updateError) {
        console.error(`Failed to update ${country.name}:`, updateError);
      } else {
        updates.push({
          id: country.id,
          name: country.name,
          new_image: imageUrl
        });
        console.log(`✅ Updated ${country.name} with image`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} countries with cover images`,
      updates
    });

  } catch (error: any) {
    console.error('Generate images error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
