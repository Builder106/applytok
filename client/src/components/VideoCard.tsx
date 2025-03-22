import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Video, type User } from '@shared/schema';
import ApplyModal from './ApplyModal';
import { useToast } from '@/hooks/use-toast';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch video creator info
  const { data: creator } = useQuery<User>({
    queryKey: [`/api/users/${video.userId}`],
  });
  
  // Check if video is bookmarked
  const { data: bookmarkData } = useQuery<{ isBookmarked: boolean }>({
    queryKey: [`/api/bookmarks/${video.id}`],
  });
  
  const isBookmarked = bookmarkData?.isBookmarked || false;
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/videos/${video.id}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}`] });
      toast({
        title: "Video liked",
        description: "Your like has been recorded",
      });
    },
  });
  
  // Share mutation
  const shareMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/videos/${video.id}/share`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}`] });
      toast({
        title: "Video shared",
        description: "Thanks for sharing!",
      });
    },
  });
  
  // Bookmark mutations
  const createBookmarkMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bookmarks', { videoId: video.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/${video.id}`] });
      toast({
        title: "Video bookmarked",
        description: "Added to your saved videos",
      });
    },
  });
  
  const deleteBookmarkMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/bookmarks/${video.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookmarks/${video.id}`] });
      toast({
        title: "Bookmark removed",
        description: "Removed from your saved videos",
      });
    },
  });
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      if (videoElement.duration) {
        setProgress((videoElement.currentTime / videoElement.duration) * 100);
      }
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.play().catch(error => {
        console.error("Error playing video:", error);
        setIsPlaying(false);
      });
    } else {
      videoElement.pause();
    }
    
    const controlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    return () => clearTimeout(controlsTimeout);
  }, [isPlaying]);
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    setShowControls(true);
  };
  
  const handleVideoClick = (e: React.MouseEvent) => {
    // Don't toggle play/pause if clicking on overlay or side actions
    if (
      e.target instanceof HTMLElement && 
      !e.target.closest('.video-overlay') && 
      !e.target.closest('.side-actions')
    ) {
      togglePlayPause();
    }
  };
  
  const handleLike = () => {
    likeMutation.mutate();
  };
  
  const handleComment = () => {
    // Open comments modal
    toast({
      title: "Comments",
      description: "Comments feature coming soon",
    });
  };
  
  const handleShare = () => {
    shareMutation.mutate();
    
    // Simple share dialog
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description || '',
        url: window.location.href,
      }).catch(err => console.error('Error sharing', err));
    } else {
      // Fallback for browsers that don't support the Web Share API
      toast({
        title: "Share this video",
        description: "Copy link feature coming soon",
      });
    }
  };
  
  const handleBookmark = () => {
    if (isBookmarked) {
      deleteBookmarkMutation.mutate();
    } else {
      createBookmarkMutation.mutate();
    }
  };
  
  const handleApply = () => {
    setIsApplyModalOpen(true);
  };
  
  return (
    <div className="video-container relative h-full w-full rounded-xl overflow-hidden" onClick={handleVideoClick}>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="relative w-full h-full bg-black">
            <video
              ref={videoRef}
              src={video.videoUrl}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl">
                <i className="ri-play-fill"></i>
              </div>
            </div>
          )}
          
          <div className="video-overlay absolute bottom-0 left-0 p-3 w-2/3">
            <div className="flex items-center gap-3 mb-3">
              {creator?.profileImage || creator?.companyLogo ? (
                <img
                  src={creator.userType === 'employer' ? creator.companyLogo || '' : creator.profileImage || ''}
                  alt={creator.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center">
                  {creator?.fullName.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg">{video.title}</h3>
                <div className="flex items-center text-sm text-gray-medium">
                  <span>{creator?.userType === 'employer' ? creator.companyName : creator?.fullName}</span>
                  {video.videoType === 'job' && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{video.location || 'Remote'}</span>
                      {video.salary && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{video.salary}</span>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm mb-3">{video.description || ''}</p>
            
            {video.skills && video.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {video.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            )}
            
            {video.videoType === 'job' ? (
              <button
                className="bg-accent text-white py-2 px-6 rounded-full font-semibold text-sm flex items-center gap-2"
                onClick={handleApply}
              >
                <i className="ri-user-add-line"></i> Apply Now
              </button>
            ) : (
              <button className="bg-primary text-white py-2 px-6 rounded-full font-semibold text-sm flex items-center gap-2">
                <i className="ri-message-2-line"></i> Contact
              </button>
            )}
          </div>
          
          <div className="side-actions absolute top-0 right-0 p-4 flex flex-col items-center gap-4 bg-black/20">
            <div className="flex flex-col items-center">
              <button
                className="action-btn"
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <i className="ri-heart-line"></i>
              </button>
              <span className="action-count">{video.likes || 0}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <button
                className="action-btn"
                onClick={handleComment}
              >
                <i className="ri-message-3-line"></i>
              </button>
              <span className="action-count">{video.comments || 0}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <button
                className="action-btn"
                onClick={handleShare}
                disabled={shareMutation.isPending}
              >
                <i className="ri-share-forward-line"></i>
              </button>
              <span className="action-count">{video.shares || 0}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <button
                className="action-btn"
                onClick={handleBookmark}
                disabled={createBookmarkMutation.isPending || deleteBookmarkMutation.isPending}
              >
                <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}`}></i>
              </button>
              <span className="action-count">Save</span>
            </div>
          </div>
          
          {isApplyModalOpen && (
            <ApplyModal
              video={video}
              onClose={() => setIsApplyModalOpen(false)}
              creator={creator}
            />
          )}
        </div>
  );
}