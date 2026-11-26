/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LofiTrack, LoopMode } from './types/lofi';
import { Turntable } from './components/Turntable';
import { YouTubePlayer } from './components/YouTubePlayer';
import { PlaylistManager } from './components/PlaylistManager';

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

  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

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
      document.body.classList.toggle('tab-inactive', document.hidden);
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
    setCurrentTime(0);
  }, [tracks.length]);

  const handlePrevTrack = useCallback(() => {
    if (!tracks.length) return;
    if (currentTime > 4) {
      setSeekTime(0);
      return;
    }
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length, currentTime]);

  const handleTrackEnded = useCallback(() => {
    if (loopMode === 'single') {
      setSeekTime(0);
      setIsPlaying(true);
    } else {
      handleNextTrack();
    }
  }, [loopMode, handleNextTrack]);

  const handleToggleLoop = () => {
    setLoopMode((prev) => (prev === 'single' ? 'all' : 'single'));
  };

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
  }, [handleNextTrack, handlePrevTrack, tracks.length]);

  const handleAddTrack = (newTrack: LofiTrack, playImmediately: boolean) => {
    setTracks((prev) => [newTrack, ...prev]);
    if (playImmediately) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setCurrentTime(0);
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
      setCurrentTime(0);
    }
  };

  return (
    <div className="relative min-h-screen text-[#f3ece0] flex flex-col justify-between font-sans overflow-x-hidden bg-[#2c1b12]">
      {/* Lightweight CSS-only Coffee Shop Room Backdrop (Slatted Oak + Terracotta Brick) */}
      <div className="fixed inset-0 pointer-events-none z-0 flex flex-col" aria-hidden="true">
        {/* Upper Wall: 60% Slatted Oak + 40% Terracotta Brick */}
        <div className="flex-1 flex relative overflow-hidden">
          <div className="w-[62%] h-full wall-slatted-oak relative">
            {/* Hanging Cream Hi-Fi Speaker (Left) */}
            <div className="hidden lg:flex absolute top-6 left-8 flex-col items-center">
              <div className="w-24 h-28 rounded-lg bg-[#e8dfd1] border-2 border-[#4a2c1a] p-2.5 flex flex-col items-center justify-between shadow-md">
                <div className="w-14 h-14 rounded-full bg-[#1e1a17] border-4 border-[#3a332d] flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-[#3a332d]" />
                </div>
                <div className="w-full h-3 rounded-sm bg-[#2c2520]" />
              </div>
            </div>

            {/* Walnut Record Shelf with Vinyl Spines & Plant */}
            <div className="hidden lg:flex absolute top-14 left-40 items-end gap-4">
              <div className="flex items-end gap-1 px-3 pt-2 pb-1 bg-[#4a2c1a] border-b-4 border-[#2b180e] rounded-t">
                <span className="w-2.5 h-12 bg-[#c85a32] rounded-t-xs" />
                <span className="w-2 h-11 bg-[#e8dfd1] rounded-t-xs" />
                <span className="w-3 h-12 bg-[#2c2520] rounded-t-xs" />
                <span className="w-2 h-10 bg-[#d4a34b] rounded-t-xs" />
                <span className="w-2.5 h-12 bg-[#52734d] rounded-t-xs" />
                <span className="w-2 h-11 bg-[#efe7da] rounded-t-xs" />
                <span className="w-2.5 h-12 bg-[#9a4626] rounded-t-xs" />
              </div>
              {/* Potted Plant */}
              <div className="flex flex-col items-center">
                <div className="flex gap-0.5 -mb-1">
                  <span className="w-3 h-5 rounded-full bg-[#4d7c46] -rotate-12" />
                  <span className="w-3 h-6 rounded-full bg-[#5b8c52]" />
                  <span className="w-3 h-5 rounded-full bg-[#3f6b39] rotate-12" />
                </div>
                <div className="w-7 h-6 bg-[#c85a32] rounded-b-md border-t-2 border-[#a84623]" />
              </div>
            </div>
          </div>

          <div className="w-[38%] h-full wall-terracotta-brick relative">
            {/* Hanging Cream Speaker (Right) */}
            <div className="hidden lg:flex absolute top-8 right-12 flex-col items-center">
              <div className="w-20 h-24 rounded-lg bg-[#e8dfd1] border-2 border-[#4a2c1a] p-2 flex flex-col items-center justify-between shadow-md">
                <div className="w-11 h-11 rounded-full bg-[#1e1a17] border-4 border-[#3a332d]" />
                <div className="w-full h-2.5 rounded-sm bg-[#2c2520]" />
              </div>
            </div>
          </div>

          {/* Warm Daylight Sunbeam Wash */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(120deg, rgba(255, 240, 210, 0.22) 0%, rgba(28, 18, 12, 0.45) 65%, rgba(20, 12, 8, 0.7) 100%)',
            }}
          />
        </div>

        {/* Lower Countertop Surface */}
        <div className="h-[46%] counter-wood border-t-4 border-[#5c3923]" />
      </div>

      {/* Main Interactive Listening Booth */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Walnut Turntable + Coffee Mug */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <Turntable
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((prev) => !prev)}
            />

            <YouTubePlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              loopMode={loopMode}
              volume={volume}
              isMuted={isMuted}
              onTrackEnded={handleTrackEnded}
              onPlayStateChange={setIsPlaying}
              onTimeUpdate={(curr, dur) => {
                setCurrentTime(curr);
                if (dur) setDuration(dur);
              }}
              seekTime={seekTime}
              onSeekHandled={() => setSeekTime(null)}
            />
          </div>

          {/* Right: Cream & Walnut Listening Station Console */}
          <div className="lg:col-span-5">
            <PlaylistManager
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              loopMode={loopMode}
              volume={volume}
              isMuted={isMuted}
              currentTime={currentTime}
              duration={duration}
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
    </div>
  );
}
