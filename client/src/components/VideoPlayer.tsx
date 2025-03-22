import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  isVisible: boolean;
  onReady?: () => void;
}

export default function VideoPlayer({ src, poster, isVisible, onReady }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    try {
      playerRef.current = videojs(videoRef.current, {
        autoplay: isVisible,
        muted: true,
        loop: true,
        controls: false,
        preload: 'auto',
        aspectRatio: '9:16',
        fluid: true,
        playsinline: true,
        html5: {
          vhs: {
            overrideNative: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
        sources: [
          {
            src,
            type: src.toLowerCase().includes('m3u8') ? 'application/x-mpegURL' : 'video/mp4'
          }
        ],
        poster,
      });

      const player = playerRef.current;

      // Reset error state when source changes
      setError(null);

      // Handle ready event
      player.ready(() => {
        setError(null);
        onReady?.();
        
        // Add error retry logic
        player.on('error', () => {
          const error = player.error();
          let errorMessage = 'An error occurred while loading the video';
          
          if (error) {
            switch (error.code) {
              case 1:
                errorMessage = 'The video loading was aborted';
                break;
              case 2:
                errorMessage = 'Network error while loading the video';
                // Retry on network error after a delay
                setTimeout(() => {
                  player.src({ src, type: 'video/mp4' });
                  player.load();
                }, 2000);
                break;
              case 3:
                errorMessage = 'Video decoding failed - trying alternate format';
                // Try different format
                player.src({ src, type: 'video/webm' });
                player.load();
                break;
              case 4:
                errorMessage = 'Video not found or access denied';
                break;
            }
          }
          setError(errorMessage);
          console.warn('Video.js error:', errorMessage, error);
        });
      });

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    } catch (err) {
      console.error('Error initializing video player:', err);
      setError('Failed to initialize video player');
    }
  }, [src]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isVisible) {
      playerRef.current.play().catch((error: any) => {
        console.warn('Playback failed:', error);
        // Handle autoplay policy
        if (error.name === 'NotAllowedError') {
          playerRef.current.muted(true);
          playerRef.current.play().catch(() => {
            setError('Playback failed - please interact with the video to play');
          });
        } else {
          setError('Playback failed - video format may not be supported');
        }
      });
    } else {
      playerRef.current.pause();
    }
  }, [isVisible]);

  const handleTap = () => {
    if (!playerRef.current) return;
    if (error) {
      // Try to recover from error on tap
      setError(null);
      playerRef.current.src({ src, type: 'video/mp4' });
      playerRef.current.load();
      playerRef.current.play().catch(console.error);
    } else {
      playerRef.current.muted(!playerRef.current.muted());
    }
  };

  return (
    <div onClick={handleTap} className={styles['video-container']}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-button-centered vjs-16-9"
          playsInline
        />
      </div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 text-white text-center p-4">
          <div>
            <i className="ri-error-warning-line text-3xl mb-2"></i>
            <p>{error}</p>
            <p className="text-sm mt-2">Tap to retry</p>
          </div>
        </div>
      )}
    </div>
  );
}