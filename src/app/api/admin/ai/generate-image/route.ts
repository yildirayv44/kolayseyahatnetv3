import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { uploadImageToStorage } from '@/lib/uploadImageToStorage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate custom images with DALL-E 3
 * POST /api/admin/ai/generate-image
 */
export async function POST(request: NextRequest) {
  try {
    const { topic, style = 'professional', size = '1024x1024', customWidth, customHeight } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Create optimized prompt based on style
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

    // IMPORTANT: Explicitly instruct NO TEXT in the image
    const prompt = `Create a ${stylePrompts[style] || stylePrompts.professional} image about: ${topic}. 
The image should be suitable for a travel and visa information website. 
IMPORTANT: DO NOT include any text, letters, words, or writing in the image. 
The image should be purely visual without any text overlay or captions.
Clean, professional, and text-free design.`;

    console.log(`🎨 Generating image with DALL-E 3: ${topic}`);
    console.log(`📐 Size: ${size}, Style: ${style}`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: size as '1024x1024' | '1792x1024' | '1024x1792',
      quality: 'standard',
      style: 'vivid',
    });

    const tempImageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!tempImageUrl) {
      throw new Error('Failed to generate image');
    }

    console.log('✅ DALL-E image generated, uploading to storage...');

    // Upload to Supabase Storage
    const permanentImageUrl = await uploadImageToStorage(
      tempImageUrl,
      'ai-images/dalle',
      `dalle-${Date.now()}.png`
    );

    console.log('✅ Image uploaded to permanent storage');

    return NextResponse.json({
      success: true,
      imageUrl: permanentImageUrl,
      revisedPrompt,
      originalPrompt: prompt,
    });
  } catch (error: any) {
    console.error('DALL-E image generation error:', error);
    
    // Check if it's a content policy violation
    if (error.message?.includes('content_policy_violation')) {
      return NextResponse.json(
        { success: false, error: 'İçerik politikası ihlali. Lütfen farklı bir konu deneyin.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
