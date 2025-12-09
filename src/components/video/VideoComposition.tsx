import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface Scene {
  imageUrl: string;
  narration: string;
  audioUrl?: string;
  duration: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
}

interface VideoCompositionProps {
  scenes: Scene[];
  backgroundMusic?: string;
  title: string;
}

/**
 * Individual scene component with transitions
 */
export const SceneComponent: React.FC<{
  scene: Scene;
  sceneIndex: number;
  totalScenes: number;
}> = ({ scene, sceneIndex, totalScenes }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  const transitionDuration = fps * 0.5; // 0.5 second transition
  
  // Fade in at start
  const fadeIn = interpolate(
    frame,
    [0, transitionDuration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
  
  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionDuration, durationInFrames],
    [1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  const opacity = Math.min(fadeIn, fadeOut);
  
  // Zoom effect
  const zoom = spring({
    frame,
    fps,
    from: 1,
    to: 1.1,
    durationInFrames: durationInFrames,
  });
  
  // Slide effect
  const slideX = interpolate(
    frame,
    [0, transitionDuration],
    [-100, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background Image */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: opacity,
          transform: scene.transition === 'zoom' 
            ? `scale(${zoom})` 
            : scene.transition === 'slide'
            ? `translateX(${slideX}px)`
            : 'none',
        }}
      >
        <Img
          src={scene.imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      
      {/* Overlay gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '30%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          opacity: opacity,
        }}
      />
      
      {/* Narration text (optional, for visual reference) */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          right: '5%',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          opacity: opacity,
        }}
      >
        {/* Subtitle can be added here if needed */}
      </div>
      
      {/* Audio narration */}
      {scene.audioUrl && (
        <Audio src={scene.audioUrl} />
      )}
    </AbsoluteFill>
  );
};

/**
 * Main video composition
 */
export const VideoComposition: React.FC<VideoCompositionProps> = ({
  scenes,
  backgroundMusic,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Calculate which scene should be shown
  let currentSceneIndex = 0;
  let accumulatedFrames = 0;
  
  for (let i = 0; i < scenes.length; i++) {
    const sceneDurationInFrames = scenes[i].duration * fps;
    if (frame < accumulatedFrames + sceneDurationInFrames) {
      currentSceneIndex = i;
      break;
    }
    accumulatedFrames += sceneDurationInFrames;
  }
  
  const currentScene = scenes[currentSceneIndex];
  const sceneStartFrame = accumulatedFrames;
  const relativeFrame = frame - sceneStartFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Current Scene */}
      {currentScene && (
        <SceneComponent
          scene={currentScene}
          sceneIndex={currentSceneIndex}
          totalScenes={scenes.length}
        />
      )}
      
      {/* Background Music */}
      {backgroundMusic && (
        <Audio src={backgroundMusic} volume={0.3} />
      )}
      
      {/* Title overlay at start (first 3 seconds) */}
      {frame < fps * 3 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: '4rem',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '2rem',
              textShadow: '4px 4px 8px rgba(0,0,0,0.8)',
              opacity: interpolate(
                frame,
                [0, fps, fps * 2, fps * 3],
                [0, 1, 1, 0]
              ),
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/**
 * Get video configuration
 */
export const getVideoConfig = (scenes: Scene[]) => {
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);
  
  return {
    id: 'VideoComposition',
    component: VideoComposition,
    durationInFrames: totalDuration * 30, // 30 fps
    fps: 30,
    width: 1920,
    height: 1080,
  };
};
