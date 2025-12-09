import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { country_ids } = await request.json();

    if (!country_ids || !Array.isArray(country_ids) || country_ids.length === 0) {
      return NextResponse.json(
        { error: "country_ids gerekli" },
        { status: 400 }
      );
    }

    // Get countries
    const { data: countries, error } = await supabase
      .from("countries")
      .select("id, name, description")
      .in("id", country_ids);

    if (error) throw error;

    const updates: any[] = [];
    let updated = 0;

    for (const country of countries || []) {
      try {
        // Generate SEO content with AI
        const prompt = `Ülke: ${country.name}
${country.description ? `Açıklama: ${country.description}` : ''}

Bu ülke için SEO uyumlu meta title ve meta description oluştur.

Format:
Meta Title: [Ülke] Vizesi [Kısa Açıklayıcı Metin] - Kolay Seyahat
Meta Description: [120-155 karakter arası, ülkenin vize süreciyle ilgili bilgilendirici ve SEO uyumlu açıklama. "Kolay Seyahat" markasını içermeli.]

Örnekler:
Meta Title: Uganda Vizesi Başvurunuzu Hemen Gerçekleştirin - Kolay Seyahat
Meta Description: Uganda vizesi başvurunuzu Kolay Seyahat online vize danışmanlık platformu üzerinden hızlı ve kolayca hemen gerçekleştirebilirsiniz.

Meta Title: Kenya Vizesi Başvurunuzu Güvenle Gerçekleştirin - Kolay Seyahat
Meta Description: Kenya vizesi başvurunuzda Afrika bölgesi vize uzmanlarımızla tüm süreçte yanınızdayız. Kenya e-vize başvurunuzu şimdi gerçekleştirin.

Sadece meta title ve meta description döndür, başka açıklama ekleme.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Sen SEO uzmanı bir içerik yazarısın. Vize danışmanlık şirketi Kolay Seyahat için SEO uyumlu meta title ve description oluşturuyorsun."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        });

        const aiResponse = completion.choices[0].message.content || "";
        
        // Parse AI response
        const metaTitleMatch = aiResponse.match(/Meta Title:\s*(.+?)(?:\n|$)/i);
        const metaDescMatch = aiResponse.match(/Meta Description:\s*(.+?)(?:\n|$)/i);

        if (metaTitleMatch && metaDescMatch) {
          const meta_title = metaTitleMatch[1].trim();
          const meta_description = metaDescMatch[1].trim();

          // Update country
          const { error: updateError } = await supabase
            .from("countries")
            .update({
              meta_title,
              meta_description,
            })
            .eq("id", country.id);

          if (updateError) {
            console.error(`Error updating ${country.name}:`, updateError);
          } else {
            updated++;
            updates.push({
              id: country.id,
              name: country.name,
              meta_title,
              meta_description,
            });
          }
        }

        // Rate limiting - wait 2 seconds between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`Error processing ${country.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: updated,
      updates: updates,
    });
  } catch (error: any) {
    console.error("Error in AI update:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
