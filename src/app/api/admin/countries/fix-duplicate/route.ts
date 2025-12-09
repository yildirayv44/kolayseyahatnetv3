import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateSlug } from "@/lib/helpers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    // Simply deactivate ID 188 (Bosna-Hersek with dash)
    const { error: deactivateError } = await supabase
      .from("countries")
      .update({ status: 0 })
      .eq("id", 188);

    if (deactivateError) {
      return NextResponse.json({ error: deactivateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      deactivated_id: 188,
      active_id: 80,
      message: "ID 188 deactivated. Use ID 80 (Bosna Hersek) with slug mapping 'bosna-hersek'",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
