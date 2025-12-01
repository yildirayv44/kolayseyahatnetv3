import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TranslationCache {
  [key: string]: string;
}

// In-memory cache for translations
const translationCache: TranslationCache = {};

export async function translateText(
  text: string,
  targetLang: "en" | "tr"
): Promise<string> {
  if (!text) return text;

  // Create cache key
  const cacheKey = `${targetLang}:${text}`;

  // Check cache first
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in visa and travel content. Translate the following text to ${targetLang === "en" ? "English" : "Turkish"}. Maintain the tone, formatting, and any HTML tags. Only return the translated text, nothing else.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translation = response.choices[0]?.message?.content || text;

    // Cache the translation
    translationCache[cacheKey] = translation;

    return translation;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
}

export async function translateObject<T extends Record<string, any>>(
  obj: T,
  targetLang: "en" | "tr",
  fieldsToTranslate: (keyof T)[]
): Promise<T> {
  const translated = { ...obj };

  for (const field of fieldsToTranslate) {
    const value = obj[field];
    if (typeof value === "string" && value) {
      translated[field] = (await translateText(value, targetLang)) as T[keyof T];
    }
  }

  return translated;
}

export async function translateArray<T extends Record<string, any>>(
  array: T[],
  targetLang: "en" | "tr",
  fieldsToTranslate: (keyof T)[]
): Promise<T[]> {
  return Promise.all(
    array.map((item) => translateObject(item, targetLang, fieldsToTranslate))
  );
}

// Clear cache (useful for development)
export function clearTranslationCache() {
  Object.keys(translationCache).forEach((key) => {
    delete translationCache[key];
  });
}
