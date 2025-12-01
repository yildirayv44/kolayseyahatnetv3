import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parentId = parseInt(id);
    const body = await request.json();

    const { name, email, comment, country_id } = body;

    if (!name || !email || !comment || !country_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("country_comments")
      .insert({
        country_id,
        parent_id: parentId,
        name,
        email,
        comment,
        rating: 0,
        status: 0, // Pending approval
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
