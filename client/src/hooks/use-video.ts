import { useState, useRef, useEffect } from 'react';

interface UseVideoProps {
  videoUrl: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

interface UseVideoReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  togglePlayPause: () => void;
  setProgress: (percent: number) => void;
  replay: () => void;
}

export function useVideo({ 
  videoUrl, 
  autoPlay = true, 
  loop = true, 
  muted = true 
}: UseVideoProps): UseVideoReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Set video attributes
    videoElement.autoplay = autoPlay;
    videoElement.loop = loop;
    videoElement.muted = muted;
    videoElement.src = videoUrl;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      setProgress((videoElement.currentTime / videoElement.duration) * 100);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    // Initial play attempt (might fail due to autoplay policies)
    if (autoPlay) {
      videoElement.play().catch(error => {
        console.error("Error auto-playing video:", error);
        setIsPlaying(false);
      });
    }

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [videoUrl, autoPlay, loop, muted]);

  const togglePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch(error => {
        console.error("Error playing video:", error);
      });
    }
  };

  const setVideoProgress = (percent: number) => {
    const videoElement = videoRef.current;
    if (!videoElement || !duration) return;

    const time = (percent / 100) * duration;
    videoElement.currentTime = time;
    setCurrentTime(time);
    setProgress(percent);
  };

  const replay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = 0;
    videoElement.play().catch(error => {
      console.error("Error replaying video:", error);
    });
  };

  return {
    videoRef,
    isPlaying,
    progress,
    duration,
    currentTime,
    togglePlayPause,
    setProgress: setVideoProgress,
    replay
  };
}
