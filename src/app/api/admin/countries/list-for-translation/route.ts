import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: countries, error } = await supabase
      .from("countries")
      .select(`
        id, name, slug,
        title_en, description_en, contents_en,
        travel_tips_en, application_steps_en, important_notes_en,
        popular_cities_en, required_documents_en,
        best_time_to_visit_en, health_requirements_en, customs_regulations_en
      `)
      .eq("status", 1)
      .order("name");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, countries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
