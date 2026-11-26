import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { getSavedProgress, saveProgress, clearProgress } from '../services/youtube';

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

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    onTrackEndedRef.current = onTrackEnded;
    onPlayStateChangeRef.current = onPlayStateChange;
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTrackEnded, onPlayStateChange, onTimeUpdate]);

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

  const handleStateChange = useCallback((event: any) => {
    const state = event.data;
    if (state === 1) {
      onPlayStateChangeRef.current(true);
      setHasPlaybackError(null);
    } else if (state === 2) {
      onPlayStateChangeRef.current(false);
    } else if (state === 0) {
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
    let message = 'Unable to play this audio stream.';
    if (errorCode === 101 || errorCode === 150) {
      message = 'Video owner disabled embedding outside YouTube.';
    } else if (errorCode === 100) {
      message = 'Video not found or was removed.';
    } else if (errorCode === 2) {
      message = 'Invalid video ID parameter.';
    }
    setHasPlaybackError(message);
  }, []);

  useEffect(() => {
    if (!isApiReady || !currentTrack || !currentTrack.youtubeId) return;

    const resumeSeconds = getSavedProgress(currentTrack.youtubeId);

    if (!playerRef.current) {
      currentVideoIdRef.current = currentTrack.youtubeId;
      playerRef.current = new window.YT.Player(containerId, {
        host: 'https://www.youtube-nocookie.com',
        height: '100%',
        width: '100%',
        videoId: currentTrack.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          disablekb: 1,
          fs: 0,
          vq: 'small',
          start: resumeSeconds > 0 ? Math.floor(resumeSeconds) : 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            const player = e.target;
            if (typeof player.setPlaybackQuality === 'function') {
              player.setPlaybackQuality('small');
            }
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
      if (typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId: currentTrack.youtubeId,
          startSeconds: resumeSeconds > 0 ? Math.floor(resumeSeconds) : 0,
        });
      }
    }
  }, [isApiReady, currentTrack?.youtubeId, handleStateChange, handleError]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

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

  const lastSecondRef = useRef<number>(-1);

  useEffect(() => {
    const updateProgress = () => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const current = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          const rounded = Math.floor(current);
          if (rounded !== lastSecondRef.current) {
            lastSecondRef.current = rounded;
            onTimeUpdateRef.current(current, dur);
          }

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
        intervalRef.current = window.setInterval(updateProgress, 1000);
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

  useEffect(() => {
    if (!currentTrack || !currentTrack.youtubeId) {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
        currentVideoIdRef.current = null;
      }
    }
  }, [currentTrack?.youtubeId]);

  useEffect(() => {
    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, []);

  if (!currentTrack || !currentTrack.youtubeId) {
    return null;
  }

  return (
    <>
      {/* Hidden 1x1 YouTube audio engine (video is never displayed) */}
      <div
        className="fixed -bottom-[9999px] -right-[9999px] w-[1px] h-[1px] opacity-0 pointer-events-none"
        style={{ contain: 'strict' }}
      >
        <div id={containerId} className="w-full h-full" />
      </div>

      {/* Embed restriction notice */}
      {hasPlaybackError && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e85d2a]/40 bg-[#1c1714] px-4 py-3 text-xs">
          <div className="flex items-center gap-2 text-[#f2ece1]">
            <AlertCircle className="w-4 h-4 text-[#e85d2a] shrink-0" />
            <span>{hasPlaybackError}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTrackEndedRef.current()}
              className="px-3 py-1.5 rounded bg-[#e85d2a] text-[#12100e] font-semibold hover:bg-[#f06e3e] transition-colors"
            >
              Next Record
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${currentTrack.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#272320] text-[#f2ece1] hover:bg-[#332e2a] transition-colors"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
