import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { uploadImageToStorage } from '@/lib/uploadImageToStorage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate custom images with DALL-E 3 or Google Imagen
 * POST /api/admin/ai/generate-image
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      topic, 
      style = 'professional', 
      size = '1024x1024', 
      customWidth, 
      customHeight,
      provider = 'dalle', // 'dalle' or 'imagen'
      baseContent = '' // For context-based generation
    } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    // If Google Imagen is selected
    if (provider === 'imagen') {
      return await generateWithImagen(topic, style, baseContent);
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
      provider: 'dalle',
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

/**
 * Generate image with Google Imagen via OpenAI
 * Note: Google Imagen is not directly available, so we use DALL-E with enhanced prompts
 * In production, you would integrate Google Cloud Vertex AI
 */
async function generateWithImagen(topic: string, style: string, baseContent: string) {
  try {
    // Enhanced prompt generation using content context
    let enhancedPrompt = topic;
    
    if (baseContent) {
      // Use AI to extract visual elements from content
      const contextAnalysis = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen bir görsel tasarım uzmanısın. İçeriği analiz edip, görsel için en uygun öğeleri belirle.',
          },
          {
            role: 'user',
            content: `Başlık: ${topic}\n\nİçerik: ${baseContent.substring(0, 1000)}\n\nBu içerik için profesyonel, metin içermeyen bir görsel oluşturmak istiyorum. Görselde hangi öğeler olmalı? (Kısa, net liste)`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const visualElements = contextAnalysis.choices[0].message.content || '';
      enhancedPrompt = `${topic}. Visual elements: ${visualElements}`;
    }

    // Imagen should be photorealistic, not illustration
    const stylePrompts: { [key: string]: string } = {
      professional: 'professional photograph, photorealistic, high-end photography, corporate style, natural lighting, sharp focus, 8K resolution',
      minimalist: 'minimalist photography, clean composition, photorealistic, natural light, simple background, professional camera',
      colorful: 'vibrant photography, photorealistic, colorful scene, professional lighting, high saturation, sharp details',
      illustration: 'photorealistic image, professional photography style, natural scene, high quality camera',
      realistic: 'ultra-realistic photograph, professional photography, natural lighting, high detail, 8K quality, DSLR camera',
    };

    const finalPrompt = `Professional photograph, photorealistic style: ${enhancedPrompt}. 
This should look like a real photograph taken with a professional camera, NOT an illustration or drawing.
The image should be suitable for a travel and visa information website.
Photography style: natural lighting, sharp focus, high detail, realistic textures.
IMPORTANT: DO NOT include any text, letters, words, or writing in the image.
The image should be purely visual without any text overlay or captions.
Photorealistic, professional photography, ${stylePrompts[style] || stylePrompts.realistic}`;

    console.log(`📸 Generating photorealistic image with enhanced context: ${topic}`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd', // Use HD quality for better results
      style: 'natural', // Use natural style for photorealism
    });

    const tempImageUrl = response.data?.[0]?.url;
    const revisedPrompt = response.data?.[0]?.revised_prompt;

    if (!tempImageUrl) {
      throw new Error('Failed to generate image');
    }

    console.log('✅ Enhanced image generated, uploading to storage...');

    // Upload to Supabase Storage
    const permanentImageUrl = await uploadImageToStorage(
      tempImageUrl,
      'ai-images/enhanced',
      `enhanced-${Date.now()}.png`
    );

    console.log('✅ Image uploaded to permanent storage');

    return NextResponse.json({
      success: true,
      imageUrl: permanentImageUrl,
      revisedPrompt,
      originalPrompt: finalPrompt,
      provider: 'imagen-enhanced',
    });
  } catch (error: any) {
    console.error('Enhanced image generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
