import { NextRequest, NextResponse } from 'next/server';

/**
 * Music Library API
 * Provides royalty-free background music options
 * In production, integrate with services like:
 * - Epidemic Sound API
 * - AudioJungle API
 * - YouTube Audio Library
 * - Free Music Archive
 */

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number; // seconds
  bpm: number;
  tags: string[];
  url: string; // In production, this would be actual audio file URL
  preview: string;
  license: string;
}

// Sample music library (in production, fetch from database or API)
const musicLibrary: MusicTrack[] = [
  {
    id: 'upbeat-travel-1',
    title: 'Journey Begins',
    artist: 'Travel Sounds',
    genre: 'Electronic',
    mood: 'Upbeat',
    duration: 180,
    bpm: 128,
    tags: ['travel', 'adventure', 'energetic', 'positive'],
    url: '/music/journey-begins.mp3',
    preview: '/music/journey-begins-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'calm-ambient-1',
    title: 'Peaceful Horizons',
    artist: 'Ambient Collective',
    genre: 'Ambient',
    mood: 'Calm',
    duration: 240,
    bpm: 80,
    tags: ['calm', 'peaceful', 'relaxing', 'ambient'],
    url: '/music/peaceful-horizons.mp3',
    preview: '/music/peaceful-horizons-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'corporate-1',
    title: 'Professional Success',
    artist: 'Corporate Audio',
    genre: 'Corporate',
    mood: 'Professional',
    duration: 150,
    bpm: 120,
    tags: ['corporate', 'professional', 'business', 'motivational'],
    url: '/music/professional-success.mp3',
    preview: '/music/professional-success-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'inspiring-1',
    title: 'Dreams Take Flight',
    artist: 'Inspiration Studio',
    genre: 'Cinematic',
    mood: 'Inspiring',
    duration: 200,
    bpm: 90,
    tags: ['inspiring', 'motivational', 'cinematic', 'uplifting'],
    url: '/music/dreams-take-flight.mp3',
    preview: '/music/dreams-take-flight-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'fun-upbeat-1',
    title: 'Happy Adventures',
    artist: 'Fun Music Co',
    genre: 'Pop',
    mood: 'Fun',
    duration: 160,
    bpm: 140,
    tags: ['fun', 'happy', 'upbeat', 'cheerful'],
    url: '/music/happy-adventures.mp3',
    preview: '/music/happy-adventures-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'dramatic-1',
    title: 'Epic Journey',
    artist: 'Cinematic Sounds',
    genre: 'Orchestral',
    mood: 'Dramatic',
    duration: 220,
    bpm: 110,
    tags: ['dramatic', 'epic', 'orchestral', 'powerful'],
    url: '/music/epic-journey.mp3',
    preview: '/music/epic-journey-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'tech-modern-1',
    title: 'Digital Future',
    artist: 'Tech Beats',
    genre: 'Electronic',
    mood: 'Modern',
    duration: 170,
    bpm: 125,
    tags: ['tech', 'modern', 'electronic', 'futuristic'],
    url: '/music/digital-future.mp3',
    preview: '/music/digital-future-preview.mp3',
    license: 'Royalty-Free',
  },
  {
    id: 'acoustic-warm-1',
    title: 'Warm Memories',
    artist: 'Acoustic Stories',
    genre: 'Acoustic',
    mood: 'Warm',
    duration: 190,
    bpm: 95,
    tags: ['acoustic', 'warm', 'emotional', 'heartfelt'],
    url: '/music/warm-memories.mp3',
    preview: '/music/warm-memories-preview.mp3',
    license: 'Royalty-Free',
  },
];

/**
 * Get music tracks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mood = searchParams.get('mood');
    const genre = searchParams.get('genre');
    const tag = searchParams.get('tag');
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');

    let filteredTracks = [...musicLibrary];

    // Filter by mood
    if (mood) {
      filteredTracks = filteredTracks.filter(
        track => track.mood.toLowerCase() === mood.toLowerCase()
      );
    }

    // Filter by genre
    if (genre) {
      filteredTracks = filteredTracks.filter(
        track => track.genre.toLowerCase() === genre.toLowerCase()
      );
    }

    // Filter by tag
    if (tag) {
      filteredTracks = filteredTracks.filter(
        track => track.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    // Filter by duration
    if (minDuration) {
      filteredTracks = filteredTracks.filter(
        track => track.duration >= parseInt(minDuration)
      );
    }
    if (maxDuration) {
      filteredTracks = filteredTracks.filter(
        track => track.duration <= parseInt(maxDuration)
      );
    }

    // Get unique moods and genres for filters
    const moods = [...new Set(musicLibrary.map(t => t.mood))];
    const genres = [...new Set(musicLibrary.map(t => t.genre))];
    const allTags = [...new Set(musicLibrary.flatMap(t => t.tags))];

    return NextResponse.json({
      success: true,
      tracks: filteredTracks,
      total: filteredTracks.length,
      filters: {
        moods: moods,
        genres: genres,
        tags: allTags,
      },
    });
  } catch (error: any) {
    console.error('Music library error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch music' },
      { status: 500 }
    );
  }
}

/**
 * Get music recommendations based on video content
 */
export async function POST(request: NextRequest) {
  try {
    const { videoType, mood, duration, tags } = await request.json();

    // Simple recommendation logic
    // In production, use ML or more sophisticated matching
    let recommendations = [...musicLibrary];

    // Match mood
    if (mood) {
      recommendations = recommendations.filter(
        track => track.mood.toLowerCase() === mood.toLowerCase()
      );
    }

    // Match duration (within 20% tolerance)
    if (duration) {
      const tolerance = duration * 0.2;
      recommendations = recommendations.filter(
        track => Math.abs(track.duration - duration) <= tolerance
      );
    }

    // Match tags
    if (tags && tags.length > 0) {
      recommendations = recommendations.map(track => {
        const matchCount = track.tags.filter(t => 
          tags.some((tag: string) => t.toLowerCase().includes(tag.toLowerCase()))
        ).length;
        return { ...track, matchScore: matchCount };
      }).sort((a: any, b: any) => b.matchScore - a.matchScore);
    }

    // Return top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);

    return NextResponse.json({
      success: true,
      recommendations: topRecommendations,
      total: topRecommendations.length,
    });
  } catch (error: any) {
    console.error('Music recommendation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
