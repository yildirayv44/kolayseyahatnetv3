import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for admin operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Fetch all countries with their taxonomies (for slug)
    const { data: countries, error } = await supabase
      .from("countries")
      .select(`
        id,
        name,
        title,
        country_code,
        status,
        created_at,
        updated_at
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Get slugs from taxonomies
    const { data: taxonomies } = await supabase
      .from("taxonomies")
      .select("model_id, slug")
      .eq("type", "Country\\CountryController@detail");

    // Create a map of model_id to slug
    const slugMap = new Map(
      taxonomies?.map(t => [t.model_id, t.slug]) || []
    );

    // Add slugs to countries
    const countriesWithSlugs = countries?.map(c => ({
      ...c,
      slug: slugMap.get(c.id) || ''
    })) || [];

    return NextResponse.json({
      success: true,
      countries: countriesWithSlugs,
      count: countriesWithSlugs.length
    });
  } catch (error: any) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
