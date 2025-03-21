'use client';

import { useEffect, useRef } from 'react';
import { VideoPlayerProps } from '../types';

export default function VideoPlayer({ src, isActive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-full max-w-[450px] mx-auto">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src={src}
        loop
        playsInline
        muted
        controls={false}
      />
    </div>
  );
}