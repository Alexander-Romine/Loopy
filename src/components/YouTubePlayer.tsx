import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { AlertCircle, ExternalLink, Eye, EyeOff, Repeat, Zap } from 'lucide-react';
import { getYouTubeThumbnail, getSavedProgress, saveProgress, clearProgress } from '../services/youtube';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerProps {
  currentTrack: LofiTrack | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  volume: number;
  isMuted: boolean;
  isVideoHidden: boolean;
  onToggleVideoHidden: () => void;
  onTrackEnded: () => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  seekTime: number | null;
  onSeekHandled: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  currentTrack,
  isPlaying,
  loopMode,
  volume,
  isMuted,
  isVideoHidden,
  onToggleVideoHidden,
  onTrackEnded,
  onPlayStateChange,
  onTimeUpdate,
  seekTime,
  onSeekHandled,
}) => {
  const containerId = 'yt-player-container';
  const playerRef = useRef<any>(null);
  const currentVideoIdRef = useRef<string | null>(null);
  const loopModeRef = useRef<LoopMode>(loopMode);
  const onTrackEndedRef = useRef(onTrackEnded);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  const [isApiReady, setIsApiReady] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Keep refs up-to-date without triggering re-renders
  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    onTrackEndedRef.current = onTrackEnded;
    onPlayStateChangeRef.current = onPlayStateChange;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTrackEnded, onPlayStateChange, onTimeUpdate]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      setIsApiReady(true);
    };
  }, []);

  // Stable state change handler
  const handleStateChange = useCallback((event: any) => {
    const state = event.data;
    if (state === 1) {
      onPlayStateChangeRef.current(true);
      setHasPlaybackError(null);
    } else if (state === 2) {
      onPlayStateChangeRef.current(false);
    } else if (state === 0) {
      // Clear saved progress on completion so replay starts fresh
      if (currentVideoIdRef.current) {
        clearProgress(currentVideoIdRef.current);
      }

      if (loopModeRef.current === 'single') {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        }
      } else {
        onTrackEndedRef.current();
      }
    }
  }, []);

  const handleError = useCallback((event: any) => {
    const errorCode = event.data;
    let message = 'Unable to play this video inside the frame.';
    if (errorCode === 101 || errorCode === 150) {
      message = 'Video owner disabled embedding outside YouTube.';
    } else if (errorCode === 100) {
      message = 'Video not found or was removed.';
    } else if (errorCode === 2) {
      message = 'Invalid video ID parameter.';
    }
    setHasPlaybackError(message);
  }, []);

  // Initialize YT Player instance when API is ready and video is available
  useEffect(() => {
    if (!isApiReady || !currentTrack || !currentTrack.youtubeId) return;

    const resumeSeconds = getSavedProgress(currentTrack.youtubeId);

    if (!playerRef.current) {
      currentVideoIdRef.current = currentTrack.youtubeId;
      playerRef.current = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: currentTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: resumeSeconds > 0 ? Math.floor(resumeSeconds) : 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            const player = e.target;
            player.setVolume(isMuted ? 0 : volume);
            if (resumeSeconds > 0) {
              try {
                player.seekTo(resumeSeconds, true);
              } catch {
                // ignore
              }
            }
            if (isPlaying) {
              player.playVideo();
            }
          },
          onStateChange: handleStateChange,
          onError: handleError,
        },
      });
    } else if (currentVideoIdRef.current !== currentTrack.youtubeId) {
      currentVideoIdRef.current = currentTrack.youtubeId;
      setHasPlaybackError(null);
      try {
        if (resumeSeconds > 0) {
          playerRef.current.loadVideoById({
            videoId: currentTrack.youtubeId,
            startSeconds: resumeSeconds,
          });
        } else {
          playerRef.current.loadVideoById(currentTrack.youtubeId);
        }
      } catch (err) {
        console.error('Error loading video by ID:', err);
      }
    }
  }, [isApiReady, currentTrack?.youtubeId, handleStateChange, handleError]);

  // Clean destruction on unmount & save current progress on exit
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && currentVideoIdRef.current) {
        try {
          const curr = playerRef.current.getCurrentTime();
          if (curr > 3) {
            saveProgress(currentVideoIdRef.current, curr);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Sync play/pause commands from outside
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.getPlayerState !== 'function') return;
    try {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== 1 && state !== 3) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    } catch {
      // player might still be initializing
    }
  }, [isPlaying]);

  // Sync Volume & Mute
  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    } catch {
      // ignore
    }
  }, [volume, isMuted]);

  // Handle Seek requests
  useEffect(() => {
    if (seekTime !== null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seekTime, true);
        if (currentVideoIdRef.current) {
          saveProgress(currentVideoIdRef.current, seekTime);
        }
        onSeekHandled();
      } catch {
        // ignore
      }
    }
  }, [seekTime, onSeekHandled]);

  // High-Efficiency Visibility-Aware Progress Polling & Position Auto-Saving
  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const current = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          onTimeUpdateRef.current(current, dur);

          // Save playback position so user resumes right here on next visit
          if (currentVideoIdRef.current && current > 2) {
            saveProgress(currentVideoIdRef.current, current);
          }
        } catch {
          // ignore
        }
      }
    };

    const startTimer = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (isPlaying && !document.hidden) {
        updateProgress();
        intervalRef.current = window.setInterval(updateProgress, 600);
      }
    };

    const stopTimer = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  if (!currentTrack || !currentTrack.youtubeId) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#111114] border border-zinc-800 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-11 h-11 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 flex items-center justify-center mb-3">
          <Repeat className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">No Video Loaded</h3>
        <p className="text-xs text-zinc-400 max-w-sm">
          Paste any YouTube video link in the bar to the right and click <span className="font-semibold text-blue-400 font-mono">+</span> to begin looping.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800">
      {/* 1. Real YouTube IFrame container:
          Off-screen 1x1 box when hidden for zero GPU canvas rendering */}
      <div
        className={
          isVideoHidden
            ? 'fixed -bottom-[9999px] -right-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none'
            : 'w-full h-full'
        }
      >
        <div id={containerId} className="w-full h-full" />
      </div>

      {/* 2. Audio-Only / High-Speed Mode Display */}
      {isVideoHidden && (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#111114] relative select-none">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Audio Only Mode</span>
            <span className="text-zinc-500 font-normal">· GPU Video Off</span>
          </div>

          <button
            onClick={onToggleVideoHidden}
            className="absolute top-3.5 right-4 flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-zinc-200 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors"
          >
            <Eye className="w-3 h-3 text-zinc-300" />
            <span>Show Video</span>
          </button>

          <div className="flex flex-col items-center text-center max-w-sm px-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-zinc-700 mb-4 bg-zinc-900">
              <img
                src={getYouTubeThumbnail(currentTrack.youtubeId)}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-6">
                    <div className="w-1 bg-blue-400 rounded-sm animate-pulse h-full" />
                    <div className="w-1 bg-blue-300 rounded-sm animate-pulse h-4 delay-75" />
                    <div className="w-1 bg-blue-500 rounded-sm animate-pulse h-5 delay-150" />
                    <div className="w-1 bg-blue-300 rounded-sm animate-pulse h-3 delay-100" />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 truncate max-w-xs mb-1">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate max-w-xs">
              {currentTrack.artist}
            </p>
          </div>
        </div>
      )}

      {/* Embed Restriction Fallback */}
      {hasPlaybackError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#111114]/95 p-6 text-center">
          <AlertCircle className="w-9 h-9 text-amber-400 mb-2" />
          <h4 className="text-sm font-semibold text-zinc-100 mb-1">Playback Notice</h4>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">{hasPlaybackError}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTrackEndedRef.current()}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
            >
              Next Video
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
