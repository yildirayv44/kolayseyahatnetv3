import "server-only";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCountryContent(countryName: string) {
  const prompt = `Sen profesyonel bir vize danışmanısın. ${countryName} vizesi hakkında detaylı, SEO uyumlu bir içerik oluştur.

İçerik şu bölümleri içermeli:
1. Genel Bilgiler (ülke hakkında kısa bilgi)
2. Vize Türleri (turist, iş, öğrenci vb.)
3. Başvuru Süreci (adım adım)
4. Gerekli Belgeler (liste halinde)
5. Başvuru Süreleri ve Ücretler
6. Önemli Notlar ve İpuçları

HTML formatında yaz. <h2>, <h3>, <p>, <ul>, <li>, <strong> etiketlerini kullan.
Profesyonel ve güvenilir bir dil kullan.
Türkçe yaz.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sen profesyonel bir vize danışmanısın. Detaylı, doğru ve SEO uyumlu içerikler üretiyorsun.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content || "";
}

export async function generateBlogPost(topic: string, keywords?: string[]) {
  const keywordText = keywords?.length ? `Anahtar kelimeler: ${keywords.join(", ")}` : "";
  
  const prompt = `Sen profesyonel bir seyahat ve vize danışmanısın. "${topic}" konusunda bir blog yazısı yaz.

${keywordText}

Blog yazısı şunları içermeli:
1. Çekici bir giriş
2. Ana içerik (3-4 alt başlık)
3. Pratik ipuçları
4. Sonuç ve CTA (Call to Action)

HTML formatında yaz. <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> etiketlerini kullan.
SEO uyumlu, bilgilendirici ve ilgi çekici olsun.
Türkçe yaz.
Minimum 500 kelime.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sen profesyonel bir içerik yazarısın. Seyahat, vize ve danışmanlık konularında uzmanlaşmışsın.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 3000,
  });

  return completion.choices[0].message.content || "";
}

export async function improveContent(content: string, instructions: string) {
  const prompt = `Aşağıdaki içeriği geliştir:

${instructions}

Mevcut içerik:
${content}

Geliştirilmiş içeriği HTML formatında döndür. Mevcut HTML etiketlerini koru ve geliştir.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sen profesyonel bir içerik editörüsün. İçerikleri geliştirip daha iyi hale getiriyorsun.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  return completion.choices[0].message.content || "";
}

export async function generateMetaDescription(content: string, maxLength: number = 160) {
  const prompt = `Aşağıdaki içerik için SEO uyumlu bir meta description oluştur. Maksimum ${maxLength} karakter olsun.

İçerik:
${content.substring(0, 500)}...

Sadece meta description metnini döndür, başka bir şey ekleme.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Sen SEO uzmanısın. Kısa, çekici ve anahtar kelime içeren meta description'lar yazıyorsun.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  return completion.choices[0].message.content || "";
}
