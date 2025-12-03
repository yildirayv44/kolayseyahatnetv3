import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    // Fetch parent questions
    const { data: questionsData, error } = await supabaseAdmin
      .from("questions")
      .select("*")
      .eq("parent_id", 0)
      .order("created_at", { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Fetch country counts for each question
    const questionsWithCounts = await Promise.all(
      (questionsData || []).map(async (q) => {
        const { count } = await supabaseAdmin
          .from("question_to_countries")
          .select("*", { count: "exact", head: true })
          .eq("question_id", q.id);

        return {
          ...q,
          country_count: count || 0,
        };
      })
    );

    return NextResponse.json({ data: questionsWithCounts });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    const { error } = await supabaseAdmin
      .from("questions")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}
