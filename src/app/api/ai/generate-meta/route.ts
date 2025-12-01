import { NextRequest, NextResponse } from "next/server";
import { generateMetaDescription } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { content, maxLength } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "İçerik gerekli" },
        { status: 400 }
      );
    }

    const metaDescription = await generateMetaDescription(content, maxLength);

    return NextResponse.json({ metaDescription });
  } catch (error: any) {
    console.error("Generate meta error:", error);
    return NextResponse.json(
      { error: error.message || "Meta description oluşturulamadı" },
      { status: 500 }
    );
  }
}
