import { NextRequest, NextResponse } from "next/server";
import { improveContent } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { content, instructions } = await request.json();

    if (!content || !instructions) {
      return NextResponse.json(
        { error: "İçerik ve talimatlar gerekli" },
        { status: 400 }
      );
    }

    const improvedContent = await improveContent(content, instructions);

    return NextResponse.json({ content: improvedContent });
  } catch (error: any) {
    console.error("Improve content error:", error);
    return NextResponse.json(
      { error: error.message || "İçerik geliştirilemedi" },
      { status: 500 }
    );
  }
}
