import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('name') || 'Eritre';

  // Get country by name
  const { data: country } = await supabase
    .from("countries")
    .select("id, name, country_code")
    .ilike("name", `%${countryName}%`)
    .maybeSingle();

  if (!country) {
    return NextResponse.json({ error: "Country not found", searched_name: countryName });
  }

  // Get visa requirements
  const { data: visaReqs, error: visaError } = await supabase
    .from("visa_requirements")
    .select("*")
    .eq("country_code", country.country_code);

  return NextResponse.json({
    country,
    visa_requirements: visaReqs,
    visa_error: visaError,
    has_country_code: !!country.country_code,
  });
}
