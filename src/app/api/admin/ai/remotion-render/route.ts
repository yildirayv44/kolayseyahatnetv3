import { NextRequest, NextResponse } from 'next/server';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
import os from 'os';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Render video using Remotion locally
 * For production, use Remotion Lambda for cloud rendering
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      storyboard,
      voiceId = 'alloy',
      musicTrackId = null,
      transitions = 'fade',
      quality = 'hd',
    } = await request.json();

    if (!storyboard || !storyboard.scenes) {
      return NextResponse.json(
        { success: false, error: 'Storyboard with scenes is required' },
        { status: 400 }
      );
    }

    console.log(`🎬 Starting Remotion render for: ${storyboard.title}`);

    // Step 1: Prepare composition input
    const compositionInput = {
      title: storyboard.title,
      scenes: storyboard.scenes.map((scene: any) => ({
        imageUrl: scene.generatedImage || scene.imageUrl,
        narration: scene.narration,
        audioUrl: scene.audioUrl,
        duration: scene.duration,
        transition: transitions,
      })),
      backgroundMusic: musicTrackId ? `/music/${musicTrackId}.mp3` : undefined,
    };

    // Calculate total duration
    const totalDuration = storyboard.scenes.reduce(
      (sum: number, scene: any) => sum + scene.duration,
      0
    );
    const durationInFrames = totalDuration * 30; // 30 fps

    console.log(`📊 Total duration: ${totalDuration}s (${durationInFrames} frames)`);

    // Step 2: Bundle the Remotion project
    console.log('📦 Bundling Remotion project...');
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'Root.tsx'),
      webpackOverride: (config) => config,
    });

    console.log(`✅ Bundle created at: ${bundleLocation}`);

    // Step 3: Select composition
    console.log('🎯 Selecting composition...');
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'VideoComposition',
      inputProps: compositionInput,
    });

    console.log(`✅ Composition selected: ${composition.id}`);

    // Step 4: Render video
    console.log('🎬 Rendering video...');
    const outputLocation = path.join(
      os.tmpdir(),
      `video-${Date.now()}.mp4`
    );

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation,
      inputProps: compositionInput,
      onProgress: ({ progress }) => {
        console.log(`⏳ Rendering progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log(`✅ Video rendered: ${outputLocation}`);

    // Step 5: Upload to Supabase Storage
    console.log('☁️ Uploading to storage...');
    const videoBuffer = fs.readFileSync(outputLocation);
    const fileName = `videos/${Date.now()}-${storyboard.title.replace(/\s+/g, '-').toLowerCase()}.mp4`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ai-generated')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload video');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('ai-generated')
      .getPublicUrl(fileName);

    const videoUrl = urlData.publicUrl;

    // Clean up temp file
    fs.unlinkSync(outputLocation);

    console.log(`✅ Video uploaded: ${videoUrl}`);

    return NextResponse.json({
      success: true,
      videoUrl: videoUrl,
      duration: totalDuration,
      frames: durationInFrames,
      scenes: storyboard.scenes.length,
      message: 'Video rendered successfully!',
    });
  } catch (error: any) {
    console.error('Remotion render error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to render video',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}

/**
 * Alternative: Render using Remotion Lambda (Cloud)
 * Uncomment and configure for production use
 */
/*
import { renderMediaOnLambda } from '@remotion/lambda/client';

export async function POST_LAMBDA(request: NextRequest) {
  try {
    const { storyboard } = await request.json();

    // Configure AWS credentials
    const region = process.env.AWS_REGION || 'us-east-1';
    const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
    const serveUrl = process.env.REMOTION_SERVE_URL!;

    // Render on Lambda
    const { renderId, bucketName } = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: 'VideoComposition',
      inputProps: {
        title: storyboard.title,
        scenes: storyboard.scenes,
      },
      codec: 'h264',
      imageFormat: 'jpeg',
      maxRetries: 1,
      privacy: 'public',
    });

    console.log(`Lambda render started: ${renderId}`);

    return NextResponse.json({
      success: true,
      renderId,
      bucketName,
      message: 'Video rendering on Lambda',
    });
  } catch (error: any) {
    console.error('Lambda render error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
*/
