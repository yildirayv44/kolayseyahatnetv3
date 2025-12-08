import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCountryCode } from "@/lib/country-codes";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Update country codes for countries with missing or 'XX' codes
 * POST /api/admin/countries/update-codes
 */
export async function POST() {
  try {
    // Fetch all countries with missing or 'XX' country codes
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, country_code")
      .eq("status", 1)
      .or("country_code.is.null,country_code.eq.XX");

    if (error) throw error;

    const updates = [];
    const failed = [];

    for (const country of countries || []) {
      const autoCode = getCountryCode(country.name);
      
      if (autoCode && autoCode !== 'XX') {
        const { error: updateError } = await supabase
          .from("countries")
          .update({ country_code: autoCode })
          .eq("id", country.id);

        if (updateError) {
          failed.push({ id: country.id, name: country.name, error: updateError.message });
        } else {
          updates.push({ id: country.id, name: country.name, code: autoCode });
        }
      } else {
        failed.push({ id: country.id, name: country.name, error: 'No code found' });
      }
    }

    return NextResponse.json({
      success: true,
      updated: updates.length,
      failed: failed.length,
      updates,
      failed_countries: failed,
      message: `${updates.length} ülkenin country code'u güncellendi`
    });

  } catch (error: any) {
    console.error('Update codes error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
