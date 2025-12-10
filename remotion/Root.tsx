import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from '../src/components/video/VideoComposition';

/**
 * Remotion Root Component
 * This is the entry point for Remotion
 * Register all video compositions here
 */

// Default props for the composition
const defaultProps = {
  title: 'Sample Video',
  scenes: [
    {
      imageUrl: 'https://via.placeholder.com/1920x1080',
      narration: 'This is a sample scene',
      duration: 5,
      transition: 'fade' as const,
    },
  ],
  backgroundMusic: undefined,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition as any}
        durationInFrames={150} // 5 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
