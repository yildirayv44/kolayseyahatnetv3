import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check which countries are using fallback images
 * GET /api/admin/countries/generate-images
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country_id');

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

  } catch (error: any) {
    console.error('Generate images error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
