import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Translate country menu content to English using AI
 * POST /api/admin/ai/translate-country-menu
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name,
      description,
      contents,
      meta_title,
      meta_description
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "İsim alanı gerekli" },
        { status: 400 }
      );
    }

    // Translate all fields in one request for consistency
    const translationPrompt = `Translate the following Turkish visa/travel content to English. Maintain professional tone and SEO quality.

Turkish Content:
---
Name: ${name}
${description ? `Description: ${description}` : ''}
${meta_title ? `Meta Title: ${meta_title}` : ''}
${meta_description ? `Meta Description: ${meta_description}` : ''}
${contents ? `\nFull Content (HTML):\n${contents}` : ''}
---

Return ONLY a JSON object with these fields:
{
  "name_en": "English name translation",
  "description_en": "English description translation (if provided)",
  "meta_title_en": "English meta title translation (if provided)",
  "meta_description_en": "English meta description translation (if provided)",
  "contents_en": "English HTML content translation (if provided, maintain HTML structure)"
}

Important:
- Keep HTML tags intact in contents_en
- Maintain SEO quality for meta fields
- Use professional visa/travel terminology
- Keep character limits: meta_title (60 chars), meta_description (160 chars)
- Return empty string for fields that weren't provided`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in visa and travel content. You translate Turkish to English while maintaining SEO quality and professional tone. Always return valid JSON."
        },
        {
          role: "user",
          content: translationPrompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const translationText = response.choices[0]?.message?.content || "{}";
    const translation = JSON.parse(translationText);

    return NextResponse.json({
      name_en: translation.name_en || "",
      description_en: translation.description_en || "",
      meta_title_en: translation.meta_title_en || "",
      meta_description_en: translation.meta_description_en || "",
      contents_en: translation.contents_en || "",
    });

  } catch (error: any) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error.message || "Çeviri yapılamadı" },
      { status: 500 }
    );
  }
}
