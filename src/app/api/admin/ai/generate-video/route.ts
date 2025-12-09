import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VideoScene {
  timestamp: string;
  description: string;
  imagePrompt: string;
  narration: string;
  duration: number; // seconds
}

/**
 * Generate video from script
 * This creates a storyboard with images for each scene
 * In production, you would use Remotion or FFmpeg to combine images into video
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      script,
      videoType = 'slideshow', // 'slideshow', 'ai-generated', 'avatar'
      voiceOver = false,
      music = true
    } = await request.json();

    if (!script) {
      return NextResponse.json(
        { success: false, error: 'Script is required' },
        { status: 400 }
      );
    }

    console.log(`🎬 Generating video storyboard for: ${script.title}`);

    // Create scenes from script
    const scenes: VideoScene[] = [];

    // Hook scene
    scenes.push({
      timestamp: '0:00-0:15',
      description: 'Hook',
      imagePrompt: `Eye-catching opening scene about ${script.title}. Photorealistic, engaging, attention-grabbing visual.`,
      narration: script.hook,
      duration: 15,
    });

    // Intro scene
    scenes.push({
      timestamp: '0:15-0:45',
      description: 'Introduction',
      imagePrompt: `Professional introduction scene for ${script.title}. Clean, welcoming, informative visual.`,
      narration: script.intro,
      duration: 30,
    });

    // Main sections
    script.sections.forEach((section: any, idx: number) => {
      const visualHints = section.visualSuggestions?.join(', ') || '';
      scenes.push({
        timestamp: section.timestamp,
        description: section.title,
        imagePrompt: `Photorealistic scene showing ${section.title}. ${visualHints}. Professional travel photography style, natural lighting, high detail.`,
        narration: section.script,
        duration: 60, // Estimate 1 minute per section
      });
    });

    // Outro scene
    scenes.push({
      timestamp: 'Outro',
      description: 'Closing',
      imagePrompt: `Professional closing scene for ${script.title}. Warm, inviting, call-to-action visual.`,
      narration: script.outro,
      duration: 20,
    });

    // CTA scene
    scenes.push({
      timestamp: 'CTA',
      description: 'Call to Action',
      imagePrompt: `Strong call-to-action visual for ${script.title}. Professional, motivating, clear message.`,
      narration: script.cta,
      duration: 10,
    });

    console.log(`✅ Created ${scenes.length} scenes for video`);

    // Generate images for each scene (optional, can be done on-demand)
    // For now, we return the storyboard
    // In production, you would:
    // 1. Generate images for each scene using DALL-E
    // 2. Use Remotion or FFmpeg to combine images
    // 3. Add voiceover using text-to-speech
    // 4. Add background music
    // 5. Export final video

    return NextResponse.json({
      success: true,
      storyboard: {
        title: script.title,
        totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
        totalScenes: scenes.length,
        scenes: scenes,
        productionNotes: {
          voiceOver: voiceOver ? 'Text-to-speech narration will be added' : 'No voiceover',
          music: music ? script.musicSuggestion : 'No music',
          bRoll: script.bRollSuggestions || [],
          format: videoType,
        },
        nextSteps: [
          '1. Review storyboard',
          '2. Generate images for each scene',
          '3. Record or generate voiceover',
          '4. Combine elements into video',
          '5. Add music and effects',
          '6. Export final video',
        ],
      },
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate video storyboard' },
      { status: 500 }
    );
  }
}

/**
 * Generate image for a specific scene
 */
export async function PUT(request: NextRequest) {
  try {
    const { scenePrompt, sceneDescription } = await request.json();

    if (!scenePrompt) {
      return NextResponse.json(
        { success: false, error: 'Scene prompt is required' },
        { status: 400 }
      );
    }

    console.log(`🎨 Generating image for scene: ${sceneDescription}`);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: scenePrompt,
      n: 1,
      size: '1792x1024', // 16:9 aspect ratio for video
      quality: 'hd',
      style: 'natural',
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Failed to generate scene image');
    }

    console.log(`✅ Scene image generated: ${sceneDescription}`);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      sceneDescription: sceneDescription,
    });
  } catch (error: any) {
    console.error('Scene image generation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate scene image' },
      { status: 500 }
    );
  }
}
