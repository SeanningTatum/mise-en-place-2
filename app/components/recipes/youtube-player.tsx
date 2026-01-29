import { useEffect, useRef, useCallback, useState } from "react";
import YouTube, { type YouTubePlayer as YTPlayer, type YouTubeEvent } from "react-youtube";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface YouTubePlayerProps {
  videoId: string;
  seekTo?: number | null;
  onTimeUpdate?: (currentTime: number) => void;
  onReady?: () => void;
  onSeeked?: () => void;
}

export function YouTubePlayer({
  videoId,
  seekTo,
  onTimeUpdate,
  onReady,
  onSeeked,
}: YouTubePlayerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Only render on client side - react-youtube requires browser APIs
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleReady = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    onReady?.();
  }, [onReady]);

  const handleStateChange = useCallback((event: YouTubeEvent) => {
    // YT.PlayerState.PLAYING = 1
    if (event.data === 1 && onTimeUpdate) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Poll for time updates
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          onTimeUpdate(currentTime);
        }
      }, 1000);
    } else {
      // Clear interval when not playing
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [onTimeUpdate]);

  // Seek to timestamp when seekTo prop changes
  useEffect(() => {
    if (seekTo !== null && seekTo !== undefined && playerRef.current) {
      playerRef.current.seekTo(seekTo, true);
      playerRef.current.playVideo();
      // Notify parent that seek is complete so it can reset the state
      // This allows clicking the same timestamp multiple times
      onSeeked?.();
    }
  }, [seekTo, onSeeked]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0 as const,
      modestbranding: 1 as const,
      rel: 0 as const,
    },
  };

  // Show skeleton until client-side hydration is complete
  if (!isMounted) {
    return (
      <Card className="overflow-hidden">
        <Skeleton className="aspect-video w-full" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video" data-testid="youtube-player">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={handleReady}
          onStateChange={handleStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />
      </div>
    </Card>
  );
}
