import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Convert text to speech using OpenAI TTS
 * Supports multiple voices and formats
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      text,
      voice = 'alloy', // alloy, echo, fable, onyx, nova, shimmer
      model = 'tts-1-hd', // tts-1 or tts-1-hd
      speed = 1.0, // 0.25 to 4.0
      format = 'mp3', // mp3, opus, aac, flac
      sceneId = null,
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log(`🎙️ Generating speech for text (${text.length} chars) with voice: ${voice}`);

    // Generate speech
    const mp3Response = await openai.audio.speech.create({
      model: model,
      voice: voice as any,
      input: text,
      speed: speed,
    });

    // Convert to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    // Upload to Supabase Storage
    const fileName = `audio/${Date.now()}-${sceneId || 'narration'}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ai-generated')
      .upload(fileName, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload audio');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ai-generated')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    console.log(`✅ Speech generated and uploaded: ${audioUrl}`);

    return NextResponse.json({
      success: true,
      audioUrl: audioUrl,
      voice: voice,
      duration: Math.ceil(text.length / 15), // Rough estimate: ~15 chars per second
      format: format,
    });
  } catch (error: any) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

/**
 * Get available voices
 */
export async function GET(request: NextRequest) {
  const voices = [
    {
      id: 'alloy',
      name: 'Alloy',
      description: 'Neutral, balanced voice',
      gender: 'neutral',
      language: 'en',
      preview: 'Clear and professional',
    },
    {
      id: 'echo',
      name: 'Echo',
      description: 'Male voice, warm tone',
      gender: 'male',
      language: 'en',
      preview: 'Friendly and approachable',
    },
    {
      id: 'fable',
      name: 'Fable',
      description: 'British accent, storytelling',
      gender: 'male',
      language: 'en',
      preview: 'Narrative and engaging',
    },
    {
      id: 'onyx',
      name: 'Onyx',
      description: 'Deep male voice',
      gender: 'male',
      language: 'en',
      preview: 'Authoritative and strong',
    },
    {
      id: 'nova',
      name: 'Nova',
      description: 'Female voice, energetic',
      gender: 'female',
      language: 'en',
      preview: 'Bright and enthusiastic',
    },
    {
      id: 'shimmer',
      name: 'Shimmer',
      description: 'Female voice, soft tone',
      gender: 'female',
      language: 'en',
      preview: 'Gentle and soothing',
    },
  ];

  return NextResponse.json({
    success: true,
    voices: voices,
  });
}
