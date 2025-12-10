import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { id, slug } = await request.json();

    if (!id || !slug) {
      return NextResponse.json(
        { error: "ID and slug required" },
        { status: 400 }
      );
    }

    // Extract the last part of the slug if it contains /
    const parts = slug.split('/');
    const newSlug = parts[parts.length - 1];

    // Only update if slug actually contains /
    if (parts.length === 1) {
      return NextResponse.json({
        success: true,
        message: "Slug already in correct format",
        unchanged: true
      });
    }

    // Update the slug
    const { error } = await supabase
      .from("taxonomies")
      .update({ slug: newSlug })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Slug updated successfully",
      old_slug: slug,
      new_slug: newSlug
    });
  } catch (error: any) {
    console.error("Error fixing slug:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
