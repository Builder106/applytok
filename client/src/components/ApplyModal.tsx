import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type Video, type User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ApplyModalProps {
  video: Video;
  creator?: User;
  onClose: () => void;
}

export default function ApplyModal({ video, creator, onClose }: ApplyModalProps) {
  const [note, setNote] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user's video resumes
  const { data: userVideos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/user'],
  });
  
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });
  
  const videoResumes = userVideos?.filter(v => v.videoType === 'resume') || [];
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(
    videoResumes.length > 0 ? videoResumes[0].id : null
  );
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const applyMutation = useMutation({
    mutationFn: (data: { jobVideoId: number; userVideoId: number; note?: string }) => 
      apiRequest('POST', '/api/applications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = () => {
    if (!selectedVideoId) {
      toast({
        title: "Video resume required",
        description: "Please select or create a video resume first",
        variant: "destructive",
      });
      return;
    }
    
    applyMutation.mutate({
      jobVideoId: video.id,
      userVideoId: selectedVideoId,
      note: note.trim() || undefined,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-dark">
          <h2 className="text-xl font-semibold text-white">Apply for this position</h2>
          <button 
            className="text-2xl text-white" 
            onClick={onClose}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            {creator?.companyLogo ? (
              <img 
                src={creator.companyLogo}
                alt={creator.companyName || creator.fullName} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                {creator?.companyName?.[0] || creator?.fullName?.[0] || '?'}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-white">{video.title}</h3>
              <p className="text-sm text-gray-medium">
                {creator?.companyName || creator?.fullName} • {video.location || 'Remote'}
              </p>
            </div>
          </div>
          
          <div className="bg-dark rounded-lg p-4 mb-5">
            <h4 className="font-medium mb-3 text-white">Use your video resume</h4>
            
            {videosLoading ? (
              <div className="h-48 bg-gray-dark rounded-lg animate-pulse"></div>
            ) : videoResumes.length > 0 ? (
              <div>
                {videoResumes.map((videoResume) => (
                  <div 
                    key={videoResume.id}
                    className={`relative rounded-lg overflow-hidden h-48 mb-3 border-2 ${
                      selectedVideoId === videoResume.id ? 'border-accent' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedVideoId(videoResume.id)}
                  >
                    {videoResume.thumbnailUrl ? (
                      <img 
                        src={videoResume.thumbnailUrl}
                        alt={videoResume.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-dark flex items-center justify-center">
                        <i className="ri-movie-line text-3xl text-gray-medium"></i>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white">
                        <i className="ri-play-fill text-2xl"></i>
                      </div>
                    </div>
                    {selectedVideoId === videoResume.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white"></i>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-between text-sm text-white">
                  <span>{videoResumes.find(v => v.id === selectedVideoId)?.title || 'My Resume'}</span>
                  <span>{videoResumes.find(v => v.id === selectedVideoId)?.duration ? 
                    `${Math.floor(videoResumes.find(v => v.id === selectedVideoId)!.duration / 60)}:${(videoResumes.find(v => v.id === selectedVideoId)!.duration % 60).toString().padStart(2, '0')}` 
                    : '01:00'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-medium">
                <i className="ri-video-add-line text-3xl mb-2"></i>
                <p>You don't have any video resumes yet.</p>
                <Button className="mt-4">
                  Create Video Resume
                </Button>
              </div>
            )}
          </div>
          
          <div className="mb-5">
            <h4 className="font-medium mb-3 text-white">Add traditional resume (optional)</h4>
            <label className="w-full border border-dashed border-gray-medium rounded-lg py-4 flex flex-col items-center justify-center text-gray-medium cursor-pointer">
              <i className="ri-upload-2-line text-2xl mb-2"></i>
              <span>{resumeFile ? resumeFile.name : 'Upload PDF or DOCX'}</span>
              <input 
                type="file" 
                accept=".pdf,.docx,.doc" 
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          <div className="mb-5">
            <h4 className="font-medium mb-3 text-white">Additional note (optional)</h4>
            <Textarea 
              placeholder="Why are you interested in this position?" 
              className="w-full bg-dark text-white border border-gray-dark h-24 resize-none focus:border-accent"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full bg-accent text-white py-3 rounded-full font-semibold text-center"
            onClick={handleSubmit}
            disabled={applyMutation.isPending || !selectedVideoId}
          >
            {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}
