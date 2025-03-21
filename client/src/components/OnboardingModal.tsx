import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface OnboardingModalProps {
  onComplete: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(1);

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary z-[200]">
      <AnimatePresence mode="wait">
        {currentSlide === 1 && (
          <motion.div 
            key="slide-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="text-primary text-6xl mb-6">
              <i className="ri-video-chat-line"></i>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Welcome to JobTok</h1>
            <p className="text-gray-medium mb-8 max-w-xs">
              Discover job opportunities and showcase your skills through short videos
            </p>
            <Button 
              onClick={handleNext}
              className="bg-primary text-white py-3 px-8 rounded-full font-semibold text-center mb-6"
            >
              Get Started
            </Button>
            <div className="flex gap-2">
              <div className="w-8 h-1 rounded-full bg-primary"></div>
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
            </div>
          </motion.div>
        )}

        {currentSlide === 2 && (
          <motion.div 
            key="slide-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="text-accent text-6xl mb-6">
              <i className="ri-user-voice-line"></i>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Create Your Video Profile</h1>
            <p className="text-gray-medium mb-8 max-w-xs">
              Record a 60-second video showcasing your skills, experience and personality
            </p>
            <Button 
              onClick={handleNext}
              className="bg-accent text-white py-3 px-8 rounded-full font-semibold text-center mb-6"
            >
              Continue
            </Button>
            <div className="flex gap-2">
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
              <div className="w-8 h-1 rounded-full bg-accent"></div>
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
            </div>
          </motion.div>
        )}

        {currentSlide === 3 && (
          <motion.div 
            key="slide-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="text-success text-6xl mb-6">
              <i className="ri-film-line"></i>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">Swipe & Apply</h1>
            <p className="text-gray-medium mb-8 max-w-xs">
              Browse job opportunities with a simple swipe and apply with your video profile
            </p>
            <Button 
              onClick={handleNext}
              className="bg-success text-white py-3 px-8 rounded-full font-semibold text-center mb-6"
            >
              Start Exploring
            </Button>
            <div className="flex gap-2">
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
              <div className="w-8 h-1 rounded-full bg-gray-dark"></div>
              <div className="w-8 h-1 rounded-full bg-success"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
