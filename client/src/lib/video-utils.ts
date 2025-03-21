// Function to format seconds to MM:SS
export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Function to check if device has camera access
export async function checkCameraPermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop all tracks after checking
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
}

// Simple video compression (simulated)
export function simulateVideoCompression(videoBlob: Blob): Promise<Blob> {
  // In a real app, this would use something like ffmpeg.wasm or a server-side service
  // For this demo, we'll just return the original Blob
  return Promise.resolve(videoBlob);
}

// Create a thumbnail from a video
export function generateVideoThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadeddata = () => {
      // Seek to the 1/3 mark of the video
      video.currentTime = video.duration / 3;
    };
    
    video.onseeked = () => {
      // Create a canvas to draw the thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // Draw the video frame on the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a data URL (base64)
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      
      // Clean up
      URL.revokeObjectURL(video.src);
      
      resolve(thumbnailUrl);
    };
    
    video.onerror = () => {
      reject(new Error('Error generating video thumbnail'));
    };
    
    // Set the video source
    video.src = URL.createObjectURL(videoFile);
  });
}

// Check if the platform supports recording
export function canRecord(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
}

// Initialize global video observers
const initializeIntersectionObserver = () => {
  // Only run this in browser environment
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.target instanceof HTMLVideoElement) {
          if (entry.isIntersecting) {
            entry.target.play().catch(err => console.error('Auto-play error:', err));
          } else {
            entry.target.pause();
          }
        }
      });
    },
    { threshold: 0.6 } // 60% visibility required to trigger
  );
  
  // Observe all video elements with data-auto-play attribute
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('video[data-auto-play]').forEach(video => {
      observer.observe(video);
    });
  });
  
  // Export the observer for manual management
  (window as any).__videoObserver = observer;
};

// Call the initialization
initializeIntersectionObserver();

// Export a function to manually observe videos
export function observeVideo(videoElement: HTMLVideoElement): void {
  if (typeof window !== 'undefined' && (window as any).__videoObserver) {
    (window as any).__videoObserver.observe(videoElement);
  }
}

// Export a function to manually unobserve videos
export function unobserveVideo(videoElement: HTMLVideoElement): void {
  if (typeof window !== 'undefined' && (window as any).__videoObserver) {
    (window as any).__videoObserver.unobserve(videoElement);
  }
}
