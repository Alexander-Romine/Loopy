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
    <div
      className="min-h-screen text-[#f3ece0] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans overflow-x-hidden"
      style={{
        backgroundColor: '#1b120d',
        backgroundImage:
          'linear-gradient(125deg, #24160f 0%, #1b120d 55%, #2b1710 100%)',
      }}
    >
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Clean Walnut Turntable with Large Spinning Disc */}
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
      </main>
    </div>
  );
}
