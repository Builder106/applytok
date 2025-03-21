'use client';

import { useState } from 'react';
import { JobPost } from '../types';
import JobCard from './JobCard';

const MOCK_JOBS: JobPost[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-at-a-startup-company-4431-large.mp4',
    description: 'Join our dynamic team and help build the future of web applications. We\'re looking for experienced frontend developers passionate about creating beautiful, responsive interfaces.',
    likes: 1234,
    comments: 89,
    saves: 456,
    shares: 123,
    userAvatar: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Design Studios',
    location: 'Remote',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-308-large.mp4',
    description: 'Looking for a creative product designer to join our remote team. Help shape the future of digital products that millions of people use daily.',
    likes: 2345,
    comments: 156,
    saves: 789,
    shares: 234,
    userAvatar: 'https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=200&h=200&fit=crop'
  }
];

export default function Feed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <div 
        className="h-full w-full transition-transform duration-300"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        {MOCK_JOBS.map((job, index) => (
          <JobCard 
            key={job.id} 
            {...job} 
            isActive={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
}