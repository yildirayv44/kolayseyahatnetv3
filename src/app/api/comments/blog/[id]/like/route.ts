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
    const commentId = parseInt(id);

    const forwarded = request.headers.get("x-forwarded-for");
    const userIp = forwarded ? forwarded.split(",")[0] : "unknown";

    const { data: existingLike } = await supabase
      .from("blog_comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_ip", userIp)
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from("blog_comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_ip", userIp);

      await supabase.rpc("decrement_blog_comment_likes", { comment_id: commentId });

      return NextResponse.json({ liked: false });
    } else {
      await supabase
        .from("blog_comment_likes")
        .insert({ comment_id: commentId, user_ip: userIp });

      await supabase.rpc("increment_blog_comment_likes", { comment_id: commentId });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
