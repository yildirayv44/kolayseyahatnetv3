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

    const { name, email, comment, user_id } = body;

    if (!name || !email || !comment || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get parent comment to get user_id (consultant)
    const { data: parentComment } = await supabase
      .from("user_comments")
      .select("user_id")
      .eq("id", parentId)
      .single();

    if (!parentComment) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 }
      );
    }

    // Insert reply
    const { data, error } = await supabase
      .from("user_comments")
      .insert({
        user_id: parentComment.user_id, // Same consultant
        comment_user_id: user_id,
        parent_id: parentId,
        contents: comment,
        star: 0, // Replies don't have ratings
        status: 0, // Pending approval
        created_at: new Date().toISOString(),
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
