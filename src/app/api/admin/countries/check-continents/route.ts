import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getContinent } from "@/lib/continent-data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Check which countries are not categorized by continent
 * GET /api/admin/countries/check-continents
 */
export async function GET() {
  try {
    // Fetch all countries
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name")
      .eq("status", 1)
      .order("name", { ascending: true });

    if (error) throw error;

    const categorized: string[] = [];
    const uncategorized: string[] = [];

    countries?.forEach(country => {
      const continent = getContinent(country.name);
      if (continent) {
        categorized.push(country.name);
      } else {
        uncategorized.push(country.name);
      }
    });

    return NextResponse.json({
      success: true,
      total: countries?.length || 0,
      categorized: categorized.length,
      uncategorized: uncategorized.length,
      uncategorized_countries: uncategorized,
      message: `${uncategorized.length} ülke kategorize edilmemiş`
    });

  } catch (error: any) {
    console.error('Check continents error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
