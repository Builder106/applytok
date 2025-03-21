import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import VideoFeed from "@/components/VideoFeed";
import { apiRequest } from "@/lib/queryClient";
import { type Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Fetch recommended videos based on user type
  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos/recommended"],
    enabled: !!currentUser,
  });
  
  // If no user is logged in or if just loading, fetch default videos (jobs)
  const { data: defaultVideos, isLoading: defaultVideosLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos?type=job"],
    enabled: !currentUser && !isLoading,
  });
  
  const displayVideos = currentUser ? videos : defaultVideos;
  const loading = isLoading || videosLoading || defaultVideosLoading;
  
  if (loading) {
    return (
      <div className="h-screen bg-secondary flex items-center justify-center">
        <div className="w-full max-w-md">
          <Skeleton className="h-[80vh] w-full rounded-md bg-gray-dark" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full min-h-screen bg-secondary">
      {displayVideos && displayVideos.length > 0 ? (
        <VideoFeed videos={displayVideos} />
      ) : (
        <div className="h-full min-h-screen bg-secondary text-white flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-medium">
              {currentUser 
                ? "We couldn't find any recommended videos for you yet. Check back soon!"
                : "No job videos available yet. Check back soon!"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
