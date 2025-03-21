import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import VideoFeed from '@/components/VideoFeed';
import { type Video } from '@shared/schema';

export default function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoType, setVideoType] = useState<'job' | 'resume'>('job');
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: [`/api/videos?type=${videoType}`],
  });
  
  const filteredVideos = videos?.filter(video => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      video.title.toLowerCase().includes(searchLower) ||
      video.description?.toLowerCase().includes(searchLower) ||
      video.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
      video.location?.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div className="min-h-screen bg-secondary text-white pb-16">
      <div className="p-4 sticky top-0 bg-secondary z-20">
        <h1 className="text-xl font-bold mb-4">Discover</h1>
        
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search jobs, skills, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark border-gray-dark text-white"
          />
          <Button variant="secondary" size="icon">
            <i className="ri-search-line"></i>
          </Button>
        </div>
        
        <Tabs defaultValue="job" onValueChange={(value) => setVideoType(value as 'job' | 'resume')}>
          <TabsList className="w-full bg-dark">
            <TabsTrigger value="job" className="w-full">Job Opportunities</TabsTrigger>
            <TabsTrigger value="resume" className="w-full">Talent Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-md bg-gray-dark" />
            <Skeleton className="h-48 w-full rounded-md bg-gray-dark" />
          </div>
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <VideoFeed videos={filteredVideos} />
        ) : (
          <div className="text-center p-8">
            <i className="ri-search-line text-4xl text-gray-medium mb-2"></i>
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-gray-medium">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
