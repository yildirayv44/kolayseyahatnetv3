import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { countryName, existingContent } = await request.json();

    const systemPrompt = `Sen bir vize danışmanlık şirketinin pazarlama uzmanısın. Ülke detay sayfaları için tetikleyici, dönüşüm odaklı "Hızlı Bilgiler" oluşturuyorsun.

Her bilgi:
- Kısa ve öz olmalı (maksimum 50 karakter)
- Emoji ile başlamalı
- İki kısımdan oluşmalı: Başlık: Açıklama
- Müşteri için değer vurgulamalı
- Aciliyet ve güven hissi yaratmalı
- Ülkeye özgü olmalı

Örnekler:
- ⚡ Hızlı İşlem: 48 saat içinde randevu
- 🎯 Yüksek Onay: %95 başarı oranı
- 💼 Profesyonel: 7/24 destek
- 💳 Esnek Ödeme: Taksit imkanı

4 farklı hızlı bilgi oluştur. JSON formatında döndür:
{
  "quick_info_1": "...",
  "quick_info_2": "...",
  "quick_info_3": "...",
  "quick_info_4": "..."
}`;

    const userPrompt = `${countryName} vizesi için hızlı bilgiler oluştur.

${existingContent ? `Mevcut içerik:\n${existingContent.substring(0, 500)}` : ''}

Ülkeye özgü bilgiler ekle (işlem süresi, gereksinimler, özellikler vb.)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Quick info generation error:", error);
    return NextResponse.json(
      { error: error.message || "AI oluşturma başarısız" },
      { status: 500 }
    );
  }
}
