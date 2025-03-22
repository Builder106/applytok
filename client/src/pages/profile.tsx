import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/hooks/use-supabase';
import { type User, type Video, type Application } from '@shared/schema';
import ProfileModal from '@/components/ProfileModal';
import AuthModal from '@/components/AuthModal';

export default function Profile() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, uploadFile, getFileUrl } = useSupabase();
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery<User>({
    queryKey: ['/api/users/me'],
    enabled: !!user,
  });
  
  // Fetch user videos
  const { data: videos, isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos/user'],
    enabled: !!user,
  });
  
  // Fetch user applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    enabled: !!user,
  });

  // Resume upload mutation
  const resumeUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const filePath = `${user!.id}/${file.name}`;
      const { error } = await uploadFile('resumes', filePath, file);
      if (error) throw error;
      
      const fileUrl = getFileUrl('resumes', filePath);
      // Update user profile with resume URL
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeUrl: fileUrl }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.includes('pdf') && !file.type.includes('word')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }
    
    await resumeUploadMutation.mutate(file);
  };
  
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-secondary text-white p-4 pb-16">
        <div className="h-40 bg-gradient-to-r from-primary to-accent mb-14"></div>
        <Skeleton className="absolute -mt-24 w-28 h-28 rounded-full bg-gray-dark" />
        <div className="mt-8">
          <Skeleton className="h-8 w-48 rounded-md bg-gray-dark mb-2" />
          <Skeleton className="h-4 w-32 rounded-md bg-gray-dark mb-4" />
          <Skeleton className="h-20 w-full rounded-md bg-gray-dark" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-secondary text-black flex items-center justify-center p-4 pb-16">
        <div className="text-center">
          <i className="ri-user-line text-4xl mb-4"></i>
          <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
          <p className="text-gray-medium mb-4">Please sign in to view your profile</p>
          <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-secondary text-white pb-16">
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" className="bg-black/30 text-white">
            <i className="ri-settings-3-line"></i>
          </Button>
        </div>
        
        <div className="relative px-4 pb-6">
          <div className="absolute -top-14 left-4 w-28 h-28 rounded-full border-4 border-secondary overflow-hidden">
            {profile?.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-white text-3xl">
                {profile?.fullName?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="pt-16">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{profile?.fullName}</h2>
                <p className="text-gray-medium text-sm">
                  {profile?.headline || (profile?.userType === 'employer' ? profile?.companyName : 'Add a headline')}
                </p>
              </div>
              <Button 
                className="bg-accent text-white" 
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </Button>
            </div>
            
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <span className="font-semibold">{applications?.length || 0}</span> Applications
              </div>
              <div>
                <span className="font-semibold">{videos?.length || 0}</span> Videos
              </div>
              <div>
                <span className="font-semibold">{profile?.skills?.length || 0}</span> Skills
              </div>
            </div>
            
            <p className="mt-4 text-sm">
              {profile?.bio || 'Add a bio to tell people more about yourself.'}
            </p>
            
            {profile?.location && (
              <div className="flex mt-3 text-accent items-center text-sm">
                <i className="ri-map-pin-line mr-1"></i>
                <span>{profile.location}</span>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Tabs defaultValue="videos">
              <TabsList className="w-full bg-transparent border-b border-gray-dark">
                <TabsTrigger value="videos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Videos
                </TabsTrigger>
                {profile?.userType === 'job_seeker' && (
                  <TabsTrigger value="resume" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    Resume
                  </TabsTrigger>
                )}
                <TabsTrigger value="applications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                  Applications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="videos" className="mt-4">
                {videosLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="aspect-[9/16] rounded-md bg-gray-dark" />
                    <Skeleton className="aspect-[9/16] rounded-md bg-gray-dark" />
                  </div>
                ) : videos && videos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {videos.map((video) => (
                      <div key={video.id} className="relative rounded-lg overflow-hidden aspect-[9/16]">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-dark flex items-center justify-center">
                            <i className="ri-movie-line text-3xl text-gray-medium"></i>
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-xs font-medium">{video.title}</div>
                          <div className="text-xs text-gray-medium flex items-center">
                            <i className="ri-eye-line mr-1"></i> {video.views}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-video-line text-3xl text-gray-medium mb-2"></i>
                    <p className="text-gray-medium">
                      {profile?.userType === 'employer' 
                        ? "No job videos posted yet. Create one to attract talent!" 
                        : "No video resume yet. Create one to showcase your skills!"}
                    </p>
                    <Button className="mt-4">
                      <i className="ri-add-line mr-1"></i> Create Video
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {profile?.userType === 'job_seeker' && (
                <TabsContent value="resume" className="mt-4 p-4 bg-dark rounded-lg">
                  <h3 className="font-semibold mb-3">Traditional Resume</h3>
                  <label className="block">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <div className="w-full border border-dashed border-gray-medium bg-transparent text-gray-medium py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-dark/10 transition-colors">
                      <i className="ri-upload-2-line text-2xl mb-2"></i>
                      <span>{profile.resumeUrl ? 'Update Resume' : 'Upload Resume'} (PDF or Word)</span>
                      {profile.resumeUrl && (
                        <a 
                          href={profile.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-accent mt-2 hover:underline"
                        >
                          View Current Resume
                        </a>
                      )}
                    </div>
                  </label>
                </TabsContent>
              )}
              
              <TabsContent value="applications" className="mt-4">
                {applicationsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-md bg-gray-dark" />
                    <Skeleton className="h-24 w-full rounded-md bg-gray-dark" />
                  </div>
                ) : applications && applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.map((application) => (
                      <div key={application.id} className="bg-dark rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gray-dark rounded-lg"></div>
                          <div>
                            <div className="font-medium">Job Title</div>
                            <div className="text-xs text-gray-medium">Company Name</div>
                          </div>
                          <div className="ml-auto">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              application.status === 'pending' ? 'bg-warning/20 text-warning' :
                              application.status === 'viewed' ? 'bg-accent/20 text-accent' :
                              application.status === 'interview' ? 'bg-primary/20 text-primary' : 
                              application.status === 'offered' ? 'bg-success/20 text-success' :
                              'bg-error/20 text-error'
                            }`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-medium">
                          Applied {application.createdAt 
                            ? new Date(String(application.createdAt)).toLocaleDateString()
                            : 'Unknown date'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="ri-file-list-3-line text-3xl text-gray-medium mb-2"></i>
                    <p className="text-gray-medium">
                      {profile?.userType === 'employer' 
                        ? "No applications received yet." 
                        : "You haven't applied to any jobs yet."}
                    </p>
                    {profile?.userType === 'job_seeker' && (
                      <Button className="mt-4" variant="secondary">
                        Browse Jobs
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {isEditModalOpen && (
        <ProfileModal user={profile!} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
}
