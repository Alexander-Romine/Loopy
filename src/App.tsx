/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LofiTrack, LoopMode, ThemeId } from './types/lofi';
import { Turntable } from './components/Turntable';
import { YouTubePlayer } from './components/YouTubePlayer';
import { PlaylistManager, THEME_OPTIONS } from './components/PlaylistManager';

export default function App() {
  const [tracks, setTracks] = useState<LofiTrack[]>(() => {
    try {
      const saved = localStorage.getItem('loopy_user_playlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const savedId = localStorage.getItem('loopy_active_track_id');
      const savedList = localStorage.getItem('loopy_user_playlist');
      if (savedId && savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed)) {
          const idx = parsed.findIndex((t: LofiTrack) => t.id === savedId);
          if (idx !== -1) return idx;
        }
      }
    } catch {
      // fallback
    }
    return 0;
  });

  const [isPlaying, setIsPlaying] = useState(true);

  const [loopMode, setLoopMode] = useState<LoopMode>(() => {
    try {
      const saved = localStorage.getItem('loopy_loop_mode');
      if (saved === 'single' || saved === 'all') return saved;
    } catch {
      // fallback
    }
    return 'single';
  });

  const [theme, setTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('loopy_theme');
      if (saved === 'cafe' || saved === 'midnight' || saved === 'botanical') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'cafe';
  });

  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [seekTime, setSeekTime] = useState<number | null>(null);
  const [isTabHidden, setIsTabHidden] = useState(() =>
    typeof document !== 'undefined' ? document.hidden : false
  );

  // Zero-rerender timecode pub-sub
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const timeListenersRef = useRef(new Set<(c: number, d: number) => void>());

  const timeSubscribe = useCallback((cb: (c: number, d: number) => void) => {
    timeListenersRef.current.add(cb);
    cb(currentTimeRef.current, durationRef.current);
    return () => {
      timeListenersRef.current.delete(cb);
    };
  }, []);

  const handleTimeUpdate = useCallback((curr: number, dur: number) => {
    currentTimeRef.current = curr;
    durationRef.current = dur;
    timeListenersRef.current.forEach((cb) => cb(curr, dur));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('loopy_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('loopy_loop_mode', loopMode);
    } catch {
      // ignore
    }
  }, [loopMode]);

  useEffect(() => {
    try {
      localStorage.setItem('loopy_user_playlist', JSON.stringify(tracks));
    } catch {
      // ignore
    }
  }, [tracks]);

  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.hidden;
      document.body.classList.toggle('tab-inactive', hidden);
      setIsTabHidden(hidden);
    };
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const currentTrack = useMemo(() => {
    if (!tracks.length) return null;
    return tracks[currentTrackIndex] || tracks[0] || null;
  }, [tracks, currentTrackIndex]);

  useEffect(() => {
    if (currentTrack?.id) {
      try {
        localStorage.setItem('loopy_active_track_id', currentTrack.id);
      } catch {
        // ignore
      }
    }
  }, [currentTrack?.id]);

  const handleNextTrack = useCallback(() => {
    if (!tracks.length) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    currentTimeRef.current = 0;
  }, [tracks.length]);

  const handlePrevTrack = useCallback(() => {
    if (!tracks.length) return;
    if (currentTimeRef.current > 4) {
      setSeekTime(0);
      return;
    }
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    currentTimeRef.current = 0;
  }, [tracks.length]);

  const handleTrackEnded = useCallback(() => {
    if (loopMode === 'single') {
      setSeekTime(0);
      setIsPlaying(true);
    } else {
      handleNextTrack();
    }
  }, [loopMode, handleNextTrack]);

  const handleToggleLoop = useCallback(() => {
    setLoopMode((prev) => (prev === 'single' ? 'all' : 'single'));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (tracks.length > 0) {
          setIsPlaying((prev) => !prev);
        }
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        handleToggleLoop();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.code === 'ArrowRight' && !e.shiftKey) {
        e.preventDefault();
        handleNextTrack();
      } else if (e.code === 'ArrowLeft' && !e.shiftKey) {
        e.preventDefault();
        handlePrevTrack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextTrack, handlePrevTrack, handleToggleLoop, tracks.length]);

  const handleAddTrack = (newTrack: LofiTrack, playImmediately: boolean) => {
    setTracks((prev) => [newTrack, ...prev]);
    if (playImmediately) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      currentTimeRef.current = 0;
    }
  };

  const handleDeleteTrack = (id: string) => {
    setTracks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const updated = prev.filter((t) => t.id !== id);
      if (idx === currentTrackIndex) {
        setCurrentTrackIndex(0);
      } else if (idx < currentTrackIndex) {
        setCurrentTrackIndex((c) => Math.max(0, c - 1));
      }
      return updated;
    });
  };

  const handleSelectTrack = (track: LofiTrack) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setIsPlaying(true);
      currentTimeRef.current = 0;
    }
  };

  const activeTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="relative min-h-screen text-[#f3ece0] flex flex-col justify-between font-sans overflow-x-hidden bg-[#140e0a]">
      {/* Unmount all visual DOM & decoded images when tab is hidden to minimize background RAM */}
      {!isTabHidden && (
        <>
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <img
              key={activeTheme.bg}
              src={activeTheme.bg}
              alt=""
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(120deg, rgba(16, 12, 9, 0.35) 0%, rgba(16, 12, 9, 0.55) 100%)',
              }}
            />
          </div>

          <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                <Turntable
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((prev) => !prev)}
                />
              </div>

              <div className="lg:col-span-5">
                <PlaylistManager
                  tracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  loopMode={loopMode}
                  volume={volume}
                  isMuted={isMuted}
                  theme={theme}
                  timeSubscribe={timeSubscribe}
                  onChangeTheme={setTheme}
                  onTogglePlay={() => setIsPlaying((prev) => !prev)}
                  onPrevTrack={handlePrevTrack}
                  onNextTrack={handleNextTrack}
                  onToggleLoop={handleToggleLoop}
                  onVolumeChange={setVolume}
                  onToggleMute={() => setIsMuted((prev) => !prev)}
                  onSeek={(target) => setSeekTime(target)}
                  onSelectTrack={handleSelectTrack}
                  onDeleteTrack={handleDeleteTrack}
                  onAddTrack={handleAddTrack}
                />
              </div>
            </div>
          </main>
        </>
      )}

      {/* Audio-only YouTube engine stays mounted so playback continues in the background */}
      <YouTubePlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        loopMode={loopMode}
        volume={volume}
        isMuted={isMuted}
        onTrackEnded={handleTrackEnded}
        onPlayStateChange={setIsPlaying}
        onTimeUpdate={handleTimeUpdate}
        seekTime={seekTime}
        onSeekHandled={() => setSeekTime(null)}
      />
    </div>
  );
}
