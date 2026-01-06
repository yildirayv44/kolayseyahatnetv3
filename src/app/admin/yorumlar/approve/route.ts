import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type } = body;

    if (!id || !type) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const tableName = 
      type === "consultant" ? "user_comments" :
      type === "blog" ? "blog_comments" :
      type === "country" ? "country_comments" :
      null;

    if (!tableName) {
      return NextResponse.json({ error: "Invalid comment type" }, { status: 400 });
    }

    const { error } = await supabase
      .from(tableName)
      .update({ status: 1 }) // 1 = Approved
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return redirect("/admin/yorumlar");
  } catch (error) {
    console.error("Approve comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
