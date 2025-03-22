import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/use-supabase';
import { insertVideoSchema } from '@shared/schema';

interface CreateVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateVideoModal({ isOpen, onClose }: CreateVideoModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, uploadFile, getFileUrl } = useSupabase();

  const createVideoMutation = useMutation({
    mutationFn: async (videoUrl: string) => {
      // Create video record
      const videoData = insertVideoSchema.parse({
        title,
        description,
        videoUrl,
        userId: user!.id,
        videoType: user?.user_metadata.userType === 'employer' ? 'job' : 'resume',
      });

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      if (!res.ok) throw new Error('Failed to create video');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setVideoFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      // Upload video to Supabase Storage
      const filePath = `${user!.id}/${Date.now()}-${videoFile.name}`;
      const { error: uploadError } = await uploadFile('videos', filePath, videoFile);
      if (uploadError) throw uploadError;

      // Get video URL
      const videoUrl = getFileUrl('videos', filePath);
      await createVideoMutation.mutate(videoUrl);
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      toast({
        title: "File too large",
        description: "Video size should be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setVideoFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-semibold">Create New Video</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Video</label>
            <label className="block">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <div className="w-full border border-dashed border-gray-dark rounded-lg bg-transparent text-gray-medium py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-dark/10 transition-colors">
                <i className="ri-upload-cloud-line text-3xl mb-2"></i>
                <span>{videoFile ? videoFile.name : 'Select video to upload'}</span>
                <span className="text-xs mt-1">Max size: 100MB</span>
              </div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || !videoFile || !title}
            >
              {isUploading ? 'Uploading...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
