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
    console.log("📝 Question request body:", body);
    
    const { country_id, name, email, phone, question } = body;

    if (!country_id || !name || !email || !question) {
      console.error("❌ Missing required fields:", { country_id, name, email, question });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("✅ Inserting question for country_id:", country_id);

    // Insert question
    const { data: questionData, error: questionError } = await supabase
      .from("questions")
      .insert({
        contents: `${question}\n\nİletişim: ${name} (${email}${phone ? `, ${phone}` : ""})`,
        parent_id: 0,
        status: 0, // Pending approval
      })
      .select()
      .single();

    if (questionError) {
      console.error("❌ Question insert error:", questionError);
      return NextResponse.json({ 
        error: questionError.message,
        details: questionError.details 
      }, { status: 500 });
    }

    console.log("✅ Question inserted:", questionData);

    // Link question to country
    const { error: linkError } = await supabase
      .from("question_to_countries")
      .insert({
        question_id: questionData.id,
        country_id: country_id,
      });

    if (linkError) {
      console.error("❌ Question-country link error:", linkError);
      // Question is already inserted, so we don't return error
      // Just log it
    } else {
      console.log("✅ Question linked to country");
    }

    return NextResponse.json({ success: true, data: questionData }, { status: 201 });
  } catch (error) {
    console.error("Question submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
