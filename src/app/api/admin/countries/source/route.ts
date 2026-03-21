import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/countries/source
 * Get all source countries (countries that can be selected as passport holders)
 */
export async function GET() {
  try {
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, country_code, flag_emoji, passport_rank, passport_power_score, region")
      .eq("is_source_country", true)
      .eq("status", 1)
      .order("passport_rank", { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ countries: countries || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
