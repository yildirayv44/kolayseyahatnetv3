import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, style, size } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
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

    // Style prompts for Imagen
    const stylePrompts: { [key: string]: string } = {
      professional: 'professional, clean, modern, business-like, high quality',
      minimalist: 'minimalist, simple, clean lines, modern, elegant',
      colorful: 'vibrant colors, eye-catching, dynamic, energetic',
      illustration: 'flat illustration, vector style, modern design',
      realistic: 'photorealistic, detailed, high quality, professional photography',
      artistic: 'artistic, creative, imaginative, expressive, unique perspective',
      vintage: 'vintage, retro, nostalgic, classic, timeless aesthetic',
      modern: 'modern, contemporary, innovative, cutting-edge, sleek design',
      abstract: 'abstract, conceptual, artistic interpretation, non-representational',
      cinematic: 'cinematic, dramatic lighting, film-like, atmospheric, epic composition',
    };

    // Create optimized prompt
    const prompt = `${stylePrompts[style] || stylePrompts.professional} image about: ${topic}. 
The image should be suitable for a travel and visa information website. 
IMPORTANT: DO NOT include any text, letters, words, or writing in the image. 
The image should be purely visual without any text overlay or captions.
Clean, professional, and text-free design.`;

    console.log(`🎨 Generating image with Imagen 3: ${topic}`);

    // Imagen API endpoint
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict',
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: size === '1024x1024' ? '1:1' : size === '1792x1024' ? '16:9' : '9:16',
            personGeneration: 'allow_adult', // Allow people in images
            safetySetting: 'block_some', // Moderate safety
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Imagen API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      throw new Error('No image generated');
    }

    // Imagen returns base64 encoded images
    const imageData = data.predictions[0];
    const base64Image = imageData.bytesBase64Encoded || imageData.image;

    if (!base64Image) {
      throw new Error('No image data in response');
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log(`✅ Imagen image generated successfully`);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      provider: 'imagen',
      model: 'imagen-3.0',
      mimeType: imageData.mimeType || 'image/png',
    });

  } catch (error: any) {
    console.error('Imagen API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate image with Imagen',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
