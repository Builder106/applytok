import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { type User } from '@shared/schema';

interface CreateVideoModalProps {
  onClose: () => void;
}

export default function CreateVideoModal({ onClose }: CreateVideoModalProps) {
  const [step, setStep] = useState<'type' | 'record' | 'details'>('type');
  const [videoType, setVideoType] = useState<'resume' | 'job' | ''>('');
  const [recording, setRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    salary: '',
    jobType: '',
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingInterval = useRef<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get current user to determine if job_seeker or employer
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/me'],
  });
  
  const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const startCamera = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      
      // Start countdown
      let count = 3;
      setCountdown(count);
      const countdownInterval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        
        if (count === 0) {
          clearInterval(countdownInterval);
          startRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access failed",
        description: "Please allow camera and microphone access",
        variant: "destructive",
      });
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setRecordedVideo(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.play().catch(error => {
          console.error("Error playing recorded video:", error);
        });
      }
    };
    
    mediaRecorder.start();
    setRecording(true);
    
    // Set up timer (60 second limit)
    let time = 0;
    setRecordingTime(time);
    recordingInterval.current = window.setInterval(() => {
      time += 1;
      setRecordingTime(time);
      
      if (time >= 60) {
        stopRecording();
      }
    }, 1000);
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    
    setRecording(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
  
  const discardRecording = () => {
    setRecordedVideo(null);
    setVideoUrl('');
    startCamera();
  };
  
  const goToNextStep = () => {
    if (step === 'type') {
      setStep('record');
      startCamera();
    } else if (step === 'record') {
      setStep('details');
    }
  };
  
  const goToPreviousStep = () => {
    if (step === 'record') {
      setStep('type');
      
      // Stop camera if running
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Cancel recording if in progress
      if (recording) {
        stopRecording();
      }
    } else if (step === 'details') {
      setStep('record');
    }
  };
  
  const createVideoMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/videos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos/user'] });
      toast({
        title: "Video created",
        description: "Your video has been uploaded successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = async () => {
    if (!recordedVideo || !videoType) return;
    
    // In a real implementation, this would upload the video to a storage service
    // and get back a URL. For this demo, we'll use the object URL as a placeholder.
    
    const videoData = {
      title: formData.title,
      description: formData.description,
      videoUrl: videoUrl, // This would be replaced with the uploaded video URL
      videoType,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      ...(videoType === 'job' && {
        location: formData.location,
        salary: formData.salary,
        jobType: formData.jobType,
      }),
      duration: recordingTime,
    };
    
    createVideoMutation.mutate(videoData);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-dark">
          <h2 className="text-xl font-semibold text-white">
            {step === 'type' ? 'Create New Video' : 
             step === 'record' ? `Record Your ${videoType === 'resume' ? 'Resume' : 'Job'} Video` :
             'Add Video Details'}
          </h2>
          <button 
            className="text-2xl text-white" 
            onClick={onClose}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <div className="p-4">
          {step === 'type' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-lg font-medium text-white">What type of video do you want to create?</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  className={`p-6 rounded-lg border-2 ${
                    videoType === 'resume' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-gray-dark bg-dark'
                  } flex flex-col items-center gap-3 text-white`}
                  onClick={() => setVideoType('resume')}
                  disabled={currentUser?.userType === 'employer'}
                >
                  <i className="ri-user-voice-line text-3xl"></i>
                  <span className="font-medium">Video Resume</span>
                  <span className="text-xs text-gray-medium text-center">
                    Showcase your skills and experience
                  </span>
                </button>
                
                <button
                  className={`p-6 rounded-lg border-2 ${
                    videoType === 'job' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-gray-dark bg-dark'
                  } flex flex-col items-center gap-3 text-white`}
                  onClick={() => setVideoType('job')}
                  disabled={currentUser?.userType === 'job_seeker'}
                >
                  <i className="ri-briefcase-line text-3xl"></i>
                  <span className="font-medium">Job Opportunity</span>
                  <span className="text-xs text-gray-medium text-center">
                    Post a job opening at your company
                  </span>
                </button>
              </div>
              
              {currentUser?.userType === 'employer' && videoType !== 'job' && (
                <p className="text-sm text-warning">As an employer, you can only create job opportunity videos.</p>
              )}
              
              {currentUser?.userType === 'job_seeker' && videoType !== 'resume' && (
                <p className="text-sm text-warning">As a job seeker, you can only create video resumes.</p>
              )}
              
              <Button 
                className="w-full bg-accent mt-4"
                onClick={goToNextStep}
                disabled={!videoType}
              >
                Continue
              </Button>
            </div>
          )}
          
          {step === 'record' && (
            <div className="flex flex-col gap-4">
              <div className="bg-black aspect-[9/16] rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {countdown > 0 && !recording && !recordedVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-6xl font-bold text-white">{countdown}</div>
                  </div>
                )}
                
                {recording && (
                  <div className="absolute top-4 left-0 right-0 flex flex-col items-center">
                    <div className="bg-black/50 px-3 py-1 rounded-full text-white text-sm flex items-center">
                      <span className="mr-2 w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                      <span>
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')} / 1:00
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                {recording ? (
                  <Button 
                    className="bg-red-500 text-white"
                    onClick={stopRecording}
                  >
                    <i className="ri-stop-circle-line mr-2"></i> Stop Recording
                  </Button>
                ) : recordedVideo ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-gray-dark text-white"
                      onClick={discardRecording}
                    >
                      <i className="ri-refresh-line mr-2"></i> Retake
                    </Button>
                    <Button 
                      className="bg-accent text-white"
                      onClick={goToNextStep}
                    >
                      <i className="ri-check-line mr-2"></i> Use This Video
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    className="border-gray-dark text-white"
                    onClick={goToPreviousStep}
                  >
                    <i className="ri-arrow-left-line mr-2"></i> Back
                  </Button>
                )}
              </div>
              
              <div className="text-center text-sm text-gray-medium">
                <p>Make sure you have good lighting and a quiet environment.</p>
                <p>You have 60 seconds to record your {videoType === 'resume' ? 'skills and experience' : 'job opportunity'}.</p>
              </div>
            </div>
          )}
          
          {step === 'details' && (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={updateFormData}
                  className="bg-dark border-gray-dark text-white"
                  placeholder={videoType === 'resume' ? "e.g., Frontend Developer with 3 Years Experience" : "e.g., Senior Software Engineer"}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={updateFormData}
                  className="bg-dark border-gray-dark text-white h-24"
                  placeholder={videoType === 'resume' ? "Brief overview of your experience and what you're looking for" : "Describe the role, responsibilities and requirements"}
                />
              </div>
              
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={updateFormData}
                  className="bg-dark border-gray-dark text-white"
                  placeholder="e.g., React, Node.js, AWS"
                />
              </div>
              
              {videoType === 'job' && (
                <>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={updateFormData}
                      className="bg-dark border-gray-dark text-white"
                      placeholder="e.g., Remote, San Francisco, CA"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={updateFormData}
                      className="bg-dark border-gray-dark text-white"
                      placeholder="e.g., $80-100k"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select 
                      onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                      value={formData.jobType}
                    >
                      <SelectTrigger className="bg-dark border-gray-dark text-white">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark border-gray-dark text-white">
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-dark text-white"
                  onClick={goToPreviousStep}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-accent text-white"
                  onClick={handleSubmit}
                  disabled={!formData.title || createVideoMutation.isPending}
                >
                  {createVideoMutation.isPending ? 'Uploading...' : 'Publish Video'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
