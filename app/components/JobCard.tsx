'use client';

import { Heart, MessageCircle, Bookmark, Share2, Building2, BriefcaseIcon } from 'lucide-react';
import { JobCardProps } from '../types';
import VideoPlayer from './VideoPlayer';

export default function JobCard({ 
  title,
  company,
  location,
  videoUrl,
  description,
  likes,
  comments,
  saves,
  shares,
  userAvatar,
  isActive
}: JobCardProps) {
  return (
    <div className="relative h-screen w-full bg-black flex items-center justify-center">
      <div className="relative h-full w-full max-w-[450px] bg-black">
        <VideoPlayer src={videoUrl} isActive={isActive} />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80">
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/40">
                <img src={userAvatar} alt="Company" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-medium">{company}</span>
            </div>
            <button className="bg-primary/90 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/100 transition-colors">
              Apply Now
            </button>
          </div>

          {/* Job Info */}
          <div className="absolute bottom-24 left-4 right-16 text-white">
            <div className="flex items-center gap-2 mb-2">
              <BriefcaseIcon className="w-5 h-5" />
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <p className="text-sm text-gray-200 line-clamp-2 mb-2">{description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Building2 className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="absolute right-2 bottom-[20vh] flex flex-col items-center gap-4">
            <button className="interaction-button group">
              <div className="w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center mb-1 group-hover:bg-black/60 transition-colors">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">{likes}</span>
            </button>

            <button className="interaction-button group">
              <div className="w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center mb-1 group-hover:bg-black/60 transition-colors">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">{comments}</span>
            </button>

            <button className="interaction-button group">
              <div className="w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center mb-1 group-hover:bg-black/60 transition-colors">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">{saves}</span>
            </button>

            <button className="interaction-button group">
              <div className="w-12 h-12 bg-black/40 backdrop-blur rounded-full flex items-center justify-center mb-1 group-hover:bg-black/60 transition-colors">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs">{shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}