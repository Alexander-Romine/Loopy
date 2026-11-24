/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LofiTrack, LoopMode } from './types/lofi';
import { TopBar } from './components/TopBar';
import { YouTubePlayer } from './components/YouTubePlayer';
import { PlayerControls } from './components/PlayerControls';
import { PlaylistManager } from './components/PlaylistManager';

export default function App() {
  // Load playlist from localStorage (defaults to empty: no default songs)
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

  // Restore saved loop mode (Loop This vs Loop All)
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
  const [isVideoHidden, setIsVideoHidden] = useState<boolean>(() => {
    return localStorage.getItem('loopy_video_hidden') === 'true';
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  // Persist loop mode choice
  useEffect(() => {
    try {
      localStorage.setItem('loopy_loop_mode', loopMode);
    } catch {
      // ignore
    }
  }, [loopMode]);

  // Persist tracks
  useEffect(() => {
    try {
      localStorage.setItem('loopy_user_playlist', JSON.stringify(tracks));
    } catch {
      // ignore
    }
  }, [tracks]);

  // Persist video hidden preference
  useEffect(() => {
    try {
      localStorage.setItem('loopy_video_hidden', String(isVideoHidden));
    } catch {
      // ignore
    }
  }, [isVideoHidden]);

  // Background tab optimization: pause animations and throttle when inactive
  useEffect(() => {
    const handleVisibility = () => {
      document.body.classList.toggle('tab-inactive', document.hidden);
    };
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Current track pointer safety
  const currentTrack = useMemo(() => {
    if (!tracks.length) return null;
    return tracks[currentTrackIndex] || tracks[0] || null;
  }, [tracks, currentTrackIndex]);

  // Persist active track ID so the user returns to this exact video next time
  useEffect(() => {
    if (currentTrack?.id) {
      try {
        localStorage.setItem('loopy_active_track_id', currentTrack.id);
      } catch {
        // ignore
      }
    }
  }, [currentTrack?.id]);

  // Next track logic
  const handleNextTrack = useCallback(() => {
    if (!tracks.length) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length]);

  // Previous track logic
  const handlePrevTrack = useCallback(() => {
    if (!tracks.length) return;
    if (currentTime > 4) {
      setSeekTime(0);
      return;
    }
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  }, [tracks.length, currentTime]);

  // When track finishes naturally in player
  const handleTrackEnded = useCallback(() => {
    if (loopMode === 'single') {
      setSeekTime(0);
      setIsPlaying(true);
    } else {
      handleNextTrack();
    }
  }, [loopMode, handleNextTrack]);

  // Toggle between Loop Single Video (∞) and Loop Playlist
  const handleToggleLoop = () => {
    setLoopMode((prev) => (prev === 'single' ? 'all' : 'single'));
  };

  // Keyboard shortcuts
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
      } else if (e.code === 'KeyV') {
        e.preventDefault();
        setIsVideoHidden((prev) => !prev);
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

  // Add track and immediately loop it
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
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden">
      <TopBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Video & Controls Column (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Embedded YouTube Player */}
            <YouTubePlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              loopMode={loopMode}
              volume={volume}
              isMuted={isMuted}
              isVideoHidden={isVideoHidden}
              onToggleVideoHidden={() => setIsVideoHidden((prev) => !prev)}
              onTrackEnded={handleTrackEnded}
              onPlayStateChange={setIsPlaying}
              onTimeUpdate={(curr, dur) => {
                setCurrentTime(curr);
                if (dur) setDuration(dur);
              }}
              seekTime={seekTime}
              onSeekHandled={() => setSeekTime(null)}
            />

            {/* Transport & Scrub Bar Controls */}
            <PlayerControls
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              loopMode={loopMode}
              volume={volume}
              isMuted={isMuted}
              isVideoHidden={isVideoHidden}
              currentTime={currentTime}
              duration={duration}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onPrevTrack={handlePrevTrack}
              onNextTrack={handleNextTrack}
              onToggleLoop={handleToggleLoop}
              onToggleVideoHidden={() => setIsVideoHidden((prev) => !prev)}
              onVolumeChange={setVolume}
              onToggleMute={() => setIsMuted(!isMuted)}
              onSeek={(target) => setSeekTime(target)}
            />
          </div>

          {/* Clean Playlist Column (5 Cols on desktop) */}
          <div className="lg:col-span-5">
            <PlaylistManager
              tracks={tracks}
              currentTrackId={currentTrack?.id || null}
              isPlaying={isPlaying}
              loopMode={loopMode}
              onSelectTrack={handleSelectTrack}
              onDeleteTrack={handleDeleteTrack}
              onAddTrack={handleAddTrack}
              onToggleLoop={handleToggleLoop}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
