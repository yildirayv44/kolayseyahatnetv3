import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');

    if (countryId) {
      // Check specific country
      const { data: taxonomy, error } = await supabase
        .from("taxonomies")
        .select("*")
        .eq("model_id", countryId)
        .eq("type", "Country\\CountryController@detail")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        countryId,
        taxonomy,
        hasSlug: !!taxonomy?.slug,
        slug: taxonomy?.slug || null,
      });
    }

    // Get all country taxonomies
    const { data: taxonomies, error } = await supabase
      .from("taxonomies")
      .select("model_id, slug, title")
      .eq("type", "Country\\CountryController@detail")
      .order("model_id", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      total: taxonomies?.length || 0,
      taxonomies,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
