import { useState, useEffect, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { type Video } from '@shared/schema';
import VideoPlayer from './VideoPlayer';

interface VideoFeedProps {
  videos: Video[];
}

const SWIPE_MIN_DISTANCE = 50;
const TRANSITION_DURATION = 0.3;

export default function VideoFeed({ videos }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const hasNextVideo = currentIndex < videos.length - 1;
  const hasPreviousVideo = currentIndex > 0;

  // Preload management for smoother playback
  const videoQueue = useMemo(() => {
    const queue = [videos[currentIndex]];
    if (hasNextVideo) queue.push(videos[currentIndex + 1]);
    if (hasPreviousVideo) queue.unshift(videos[currentIndex - 1]);
    return queue;
  }, [currentIndex, videos]);

  const handlers = useSwipeable({
    onSwipedUp: (eventData) => {
      if (eventData.deltaY < -SWIPE_MIN_DISTANCE && hasNextVideo) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedDown: (eventData) => {
      if (eventData.deltaY > SWIPE_MIN_DISTANCE && hasPreviousVideo) {
        setDirection(-1);
        setCurrentIndex(currentIndex - 1);
      }
    },
    touchEventOptions: { passive: false },
    trackTouch: true,
    trackMouse: false
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && hasPreviousVideo) {
        setDirection(-1);
        setCurrentIndex(currentIndex - 1);
      } else if (e.key === 'ArrowDown' && hasNextVideo) {
        setDirection(1);
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, hasNextVideo, hasPreviousVideo]);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary text-white">
        <p>No videos available</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-secondary overflow-hidden" {...handlers}>
      <div className="max-w-[calc(100vh*9/16)] mx-auto h-full relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ y: direction * 500, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction * -500, opacity: 0 }}
            transition={{ duration: TRANSITION_DURATION, ease: "easeInOut" }}
            className="h-full w-full absolute"
          >
            <VideoPlayer
              src={videos[currentIndex].videoUrl}
              poster={videos[currentIndex].thumbnailUrl || undefined}
              isVisible={!isLoading}
              onReady={() => setIsLoading(false)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation indicators */}
        {hasPreviousVideo && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white/50">
            Swipe up for previous
          </div>
        )}
        {hasNextVideo && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50">
            Swipe down for next
          </div>
        )}
      </div>
    </div>
  );
}