import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS for inserts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📝 Country comment request body:", body);
    
    const { country_id, name, email, comment, rating } = body;

    if (!country_id || !name || !email || !comment) {
      console.error("❌ Missing required fields:", { country_id, name, email, comment });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("✅ Inserting comment for country_id:", country_id);

    const { data, error } = await supabase
      .from("country_comments")
      .insert({
        country_id,
        name,
        email,
        comment,
        rating: rating || 0,
        status: 0, // Pending approval
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint 
      }, { status: 500 });
    }

    console.log("✅ Comment inserted successfully:", data);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Country comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
