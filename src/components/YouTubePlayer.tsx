import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { AlertCircle, ExternalLink, Eye, EyeOff, Repeat, Zap } from 'lucide-react';
import { getYouTubeThumbnail } from '../services/youtube';

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
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            const player = e.target;
            player.setVolume(isMuted ? 0 : volume);
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
        playerRef.current.loadVideoById(currentTrack.youtubeId);
      } catch (err) {
        console.error('Error loading video by ID:', err);
      }
    }
  }, [isApiReady, currentTrack?.youtubeId, handleStateChange, handleError]);

  // Clean destruction on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
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
      // ignore
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
        onSeekHandled();
      } catch {
        // ignore
      }
    }
  }, [seekTime, onSeekHandled]);

  // High-Efficiency Visibility-Aware Progress Polling:
  // Zero CPU polling when paused or when tab is in background!
  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const current = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          onTimeUpdateRef.current(current, dur);
        } catch {
          // ignore
        }
      }
    };

    const startTimer = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      // Only poll if video is actively playing AND tab is currently visible
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
        // Tab is hidden: sleep the interval to eliminate background CPU/RAM churn!
        stopTimer();
      } else {
        // Tab returned to focus: immediately sample once, then resume timer if playing
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

  // If no track exists in playlist yet, render clean empty stage with lavender styling
  if (!currentTrack || !currentTrack.youtubeId) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0e091c] border border-purple-500/20 shadow-[0_0_35px_rgba(147,51,234,0.1)] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 text-purple-300 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <Repeat className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-purple-100 mb-1">No Video Loaded</h3>
        <p className="text-xs text-purple-300/70 max-w-sm">
          Paste any YouTube video link in the bar to the right and click <span className="font-bold text-purple-400 font-mono">+</span> to begin looping.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-purple-500/20 shadow-[0_0_40px_rgba(147,51,234,0.12)] transition-all duration-200">
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

      {/* 2. Audio-Only / High-Speed Mode Display: Space Lavender Aesthetic */}
      {isVideoHidden && (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#140b29] via-[#0f0820] to-[#080412] relative select-none">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[11px] text-purple-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Audio Only Mode</span>
            <span className="text-purple-400/60 font-normal">· GPU Video Off</span>
          </div>

          <button
            onClick={onToggleVideoHidden}
            className="absolute top-3.5 right-4 flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-purple-200 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/25 rounded-lg transition-colors"
          >
            <Eye className="w-3 h-3 text-purple-300" />
            <span>Show Video</span>
          </button>

          <div className="flex flex-col items-center text-center max-w-sm px-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-purple-400/30 shadow-[0_0_25px_rgba(168,85,247,0.25)] mb-4 bg-purple-950/40">
              <img
                src={getYouTubeThumbnail(currentTrack.youtubeId)}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="flex items-end gap-1 h-6">
                    <div className="w-1 bg-purple-400 rounded-full animate-pulse h-full" />
                    <div className="w-1 bg-purple-300 rounded-full animate-pulse h-4 delay-75" />
                    <div className="w-1 bg-violet-400 rounded-full animate-pulse h-5 delay-150" />
                    <div className="w-1 bg-fuchsia-300 rounded-full animate-pulse h-3 delay-100" />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-purple-100 truncate max-w-xs mb-1">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-purple-300/70 truncate max-w-xs">
              {currentTrack.artist}
            </p>
          </div>
        </div>
      )}

      {/* Embed Restriction Fallback */}
      {hasPlaybackError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d081c]/95 p-6 text-center backdrop-blur-sm">
          <AlertCircle className="w-9 h-9 text-purple-400 mb-2" />
          <h4 className="text-sm font-semibold text-purple-100 mb-1">Playback Notice</h4>
          <p className="text-xs text-purple-300/70 max-w-sm mb-4">{hasPlaybackError}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTrackEndedRef.current()}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)]"
            >
              Next Video
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-purple-200 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
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
