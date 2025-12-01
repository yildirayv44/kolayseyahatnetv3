import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, type, field } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // System prompts for different content types
    const systemPrompts: Record<string, string> = {
      title: "You are a professional translator. Translate the following Turkish title to English. Keep it concise and SEO-friendly. Only return the translated text, nothing else.",
      description: "You are a professional translator. Translate the following Turkish description to English. Maintain the tone and keep it engaging. Only return the translated text, nothing else.",
      contents: "You are a professional translator specializing in travel and visa content. Translate the following Turkish HTML content to English. Preserve all HTML tags, formatting, and structure. Maintain professional tone suitable for visa consultation services. Only return the translated HTML, nothing else.",
      req_document: "You are a professional translator. Translate the following Turkish document requirements to English. Keep the list format and be clear and precise. Only return the translated text, nothing else.",
      price_contents: "You are a professional translator. Translate the following Turkish pricing information to English. Maintain clarity and professional tone. Only return the translated text, nothing else.",
      warning_notes: "You are a professional translator. Translate the following Turkish warning/note to English. Keep it clear and important-sounding. Only return the translated text, nothing else.",
      aboutme: "You are a professional translator. Translate the following Turkish consultant bio/about section to English. Maintain professional and friendly tone. Preserve all HTML tags if present. Only return the translated text, nothing else.",
    };

    const systemPrompt = systemPrompts[field] || systemPrompts.contents;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const translatedText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      translated: translatedText,
      usage: completion.usage,
    });
  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
