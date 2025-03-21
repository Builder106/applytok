import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { type User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

export default function ProfileModal({ user, onClose }: ProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    headline: user.headline || '',
    bio: user.bio || '',
    location: user.location || '',
    skills: user.skills?.join(', ') || '',
    companyName: user.companyName || '',
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => apiRequest('PATCH', '/api/users/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData: Partial<User> = {
      fullName: formData.fullName,
      headline: formData.headline,
      bio: formData.bio,
      location: formData.location,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean),
    };
    
    if (user.userType === 'employer') {
      updatedData.companyName = formData.companyName;
    }
    
    updateMutation.mutate(updatedData);
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary rounded-lg w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-dark">
          <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          <button 
            className="text-2xl text-white" 
            onClick={onClose}
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="bg-dark border-gray-dark text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="bg-dark border-gray-dark text-white"
              placeholder="e.g., Senior Developer at Tech Company"
            />
          </div>
          
          {user.userType === 'employer' && (
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-dark border-gray-dark text-white"
                required
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="bg-dark border-gray-dark text-white h-24"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="bg-dark border-gray-dark text-white"
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          
          <div>
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="bg-dark border-gray-dark text-white"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>
          
          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-accent"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
