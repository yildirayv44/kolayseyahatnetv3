import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { consultant_id, name, email, comment, rating } = body;

    if (!consultant_id || !name || !email || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_comments")
      .insert({
        user_id: null, // Yorum yapan kullanıcı (şimdilik null, login olunca set edilecek)
        comment_user_id: consultant_id, // Danışman ID
        contents: comment,
        star: rating || 0,
        status: 0, // Pending approval
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Consultant comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
