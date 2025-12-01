import { NextRequest, NextResponse } from "next/server";
import { generateBlogPost } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { topic, keywords } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: "Blog konusu gerekli" },
        { status: 400 }
      );
    }

    const content = await generateBlogPost(topic, keywords);

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Generate blog error:", error);
    return NextResponse.json(
      { error: error.message || "Blog içeriği oluşturulamadı" },
      { status: 500 }
    );
  }
}
