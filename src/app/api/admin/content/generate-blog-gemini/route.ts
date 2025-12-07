import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { title, keywords, tone, wordCount, language, additionalContext } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const systemPrompt = language === 'tr' 
      ? `Sen profesyonel bir seyahat ve vize danışmanı blog yazarısın. 
Görevin: Verilen başlık için kapsamlı, SEO-optimized, bilgilendirici blog içeriği oluşturmak.

ÖNEMLİ: Direkt HTML formatında yaz! Markdown (##, ###) kullanma!

Kurallar:
1. HTML formatında yaz (<h2>, <h3>, <p>, <ul>, <li> kullan)
2. Giriş paragrafı ile başla (150-200 kelime) - <p> tagları içinde
3. Ana bölümler oluştur (<h2> başlıklar)
4. Alt başlıklar ekle (<h3> başlıklar)
5. Liste ve bullet points kullan (<ul>, <li>)
6. Önemli bilgileri vurgula (<strong>, <em>)
7. Sonuç bölümü ekle
8. SEO-friendly anahtar kelimeleri doğal şekilde kullan
9. Ton: ${tone === 'informative' ? 'Bilgilendirici ve profesyonel' : tone === 'friendly' ? 'Samimi ve yardımsever' : 'Resmi ve detaylı'}
10. Hedef kelime sayısı: ${wordCount} kelime (minimum ${Math.floor(wordCount * 0.8)}, maksimum ${Math.floor(wordCount * 1.2)})
11. Gerçek, güncel bilgiler ver
12. Adım adım açıklamalar yap

Yapı (HTML):
<p>[150-200 kelime giriş paragrafı]</p>

<h2>[Ana Konu 1]</h2>
<p>[Detaylı açıklama]</p>

<h3>[Alt Konu 1.1]</h3>
<p>[Açıklama]</p>
<ul>
  <li>Madde 1</li>
  <li>Madde 2</li>
</ul>

<h2>[Ana Konu 2]</h2>
<p>[Detaylı açıklama]</p>

<h2>Sonuç</h2>
<p>[Özet ve önemli notlar]</p>`
      : `You are a professional travel and visa consultant blog writer.
Task: Create comprehensive, SEO-optimized, informative blog content for the given title.

IMPORTANT: Write directly in HTML format! Do NOT use Markdown (##, ###)!

Rules:
1. Write in HTML format (use <h2>, <h3>, <p>, <ul>, <li>)
2. Start with introduction (150-200 words) - in <p> tags
3. Create main sections (<h2> headings)
4. Add subsections (<h3> headings)
5. Use lists and bullet points (<ul>, <li>)
6. Highlight important information (<strong>, <em>)
7. Add conclusion section
8. Use SEO-friendly keywords naturally
9. Tone: ${tone === 'informative' ? 'Informative and professional' : tone === 'friendly' ? 'Friendly and helpful' : 'Formal and detailed'}
10. Target word count: ${wordCount} words (minimum ${Math.floor(wordCount * 0.8)}, maximum ${Math.floor(wordCount * 1.2)})
11. Provide real, up-to-date information
12. Step-by-step explanations

Structure (HTML):
<p>[150-200 word introduction]</p>

<h2>[Main Topic 1]</h2>
<p>[Detailed explanation]</p>

<h3>[Subtopic 1.1]</h3>
<p>[Explanation]</p>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<h2>[Main Topic 2]</h2>
<p>[Detailed explanation]</p>

<h2>Conclusion</h2>
<p>[Summary and important notes]</p>`;

    let userPrompt = `Başlık: ${title}`;
    
    if (keywords.length > 0) {
      userPrompt += `\nAnahtar Kelimeler: ${keywords.join(', ')}`;
    }
    
    if (additionalContext.trim()) {
      userPrompt += `\n\nEk Bilgiler ve Talimatlar:\n${additionalContext}`;
    }

    console.log(`🤖 Generating content with Gemini: ${title}`);

    const result = await model.generateContent([
      systemPrompt,
      userPrompt
    ]);

    const response = result.response;
    const content = response.text();

    console.log(`✅ Gemini content generated (${content.length} chars)`);

    return NextResponse.json({
      success: true,
      content: content,
      provider: 'gemini',
      model: 'gemini-1.5-pro'
    });

  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate content with Gemini',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
