import { NextRequest, NextResponse } from "next/server";
import { submitConsultantComment } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.user_id || !body.comment || !body.rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Submit comment
    const result = await submitConsultantComment(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to submit comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
