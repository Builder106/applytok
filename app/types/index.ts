export interface JobPost {
  id: string;
  title: string;
  company: string;
  location: string;
  videoUrl: string;
  description: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  userAvatar: string;
}

export interface VideoPlayerProps {
  src: string;
  isActive: boolean;
}

export interface JobCardProps extends JobPost {
  isActive: boolean;
}