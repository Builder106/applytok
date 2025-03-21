import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Video } from '@shared/schema';
import VideoCard from './VideoCard';

interface VideoFeedProps {
  videos: Video[];
}

export default function VideoFeed({ videos }: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startY = useRef(0);
  
  const currentVideo = videos[currentIndex];
  const hasNextVideo = currentIndex < videos.length - 1;
  const hasPreviousVideo = currentIndex > 0;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsSwiping(false);
    const endY = e.changedTouches[0].clientY;
    const diffY = startY.current - endY;
    
    if (diffY > 50 && hasNextVideo) {
      // Swipe up - show next video
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else if (diffY < -50 && hasPreviousVideo) {
      // Swipe down - show previous video
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (hasNextVideo) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (hasPreviousVideo) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length]);
  
  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary text-white">
        <p>No videos available</p>
      </div>
    );
  }
  
  return (
    <div 
      className="h-screen lg:h-screen overflow-hidden bg-secondary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ y: direction * 500, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * -500, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full w-full"
        >
          <VideoCard video={currentVideo} />
        </motion.div>
      </AnimatePresence>
      
      {/* Swipe indicators */}
      {hasPreviousVideo && (
        <div className="swipe-indicator swipe-up absolute top-1/4 left-1/2 transform -translate-x-1/2 z-15 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
          <i className="ri-arrow-up-s-line"></i>
        </div>
      )}
      
      {hasNextVideo && (
        <div className="swipe-indicator swipe-down absolute bottom-1/4 left-1/2 transform -translate-x-1/2 z-15 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
          <i className="ri-arrow-down-s-line"></i>
        </div>
      )}
    </div>
  );
}
