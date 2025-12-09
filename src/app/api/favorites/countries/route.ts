import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
    }

    const idArray = ids.split(",").map(Number);

    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, title, description")
      .in("id", idArray)
      .eq("status", 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get taxonomy slugs for each country
    const countriesWithSlugs = await Promise.all(
      (countries || []).map(async (country: any) => {
        const { data: taxonomy } = await supabase
          .from("taxonomies")
          .select("slug")
          .eq("model_id", country.id)
          .eq("type", "Country\\CountryController@detail")
          .maybeSingle();

        return {
          ...country,
          slug: country.slug || taxonomy?.slug || "",
        };
      })
    );

    return NextResponse.json(countriesWithSlugs);
  } catch (error) {
    console.error("Favorites countries API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
