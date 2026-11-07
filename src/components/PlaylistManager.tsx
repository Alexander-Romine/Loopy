import React, { useState } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { extractYouTubeId, getYouTubeThumbnail } from '../services/youtube';
import {
  Play,
  Trash2,
  Plus,
  ExternalLink,
  Repeat,
  Repeat1,
  AlertCircle,
  Music,
} from 'lucide-react';

interface PlaylistManagerProps {
  tracks: LofiTrack[];
  currentTrackId: string | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  onSelectTrack: (track: LofiTrack) => void;
  onDeleteTrack: (id: string) => void;
  onAddTrack: (track: LofiTrack, playImmediately: boolean) => void;
  onToggleLoop: () => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  loopMode,
  onSelectTrack,
  onDeleteTrack,
  onAddTrack,
  onToggleLoop,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const id = extractYouTubeId(urlInput);
    if (!id) {
      setError('Please paste a valid YouTube video link or ID.');
      return;
    }

    const newTrack: LofiTrack = {
      id: `track-${Date.now()}`,
      youtubeId: id,
      title: 'YouTube Video',
      artist: 'Custom Stream',
      addedAt: Date.now(),
    };

    onAddTrack(newTrack, true);
    setUrlInput('');
    setError(null);
  };

  return (
    <div className="bg-[#0f0921]/85 border border-purple-500/20 rounded-2xl p-4 sm:p-5 shadow-[0_8px_32px_rgba(10,5,25,0.6)] backdrop-blur-xl flex flex-col h-full">
      {/* 1. Quick Add Video Bar: Input + [+] button + Loop toggle button */}
      <div className="mb-4">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste YouTube link (e.g. youtu.be/...)"
            className="flex-1 px-3.5 py-2.5 bg-[#080413]/90 border border-purple-500/25 rounded-xl text-xs text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-purple-400 focus:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all"
          />

          {/* Add button: Just the + icon in cosmic lavender */}
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-purple-500 to-violet-400 hover:from-purple-500 hover:to-violet-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Add & play video"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Loop mode toggle button */}
          <button
            type="button"
            onClick={onToggleLoop}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 active:scale-95 shrink-0 ${
              loopMode === 'single'
                ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-purple-950/40 text-purple-300/70 border border-purple-900/40 hover:bg-purple-900/40'
            }`}
            title={loopMode === 'single' ? 'Loop: Single Video' : 'Loop: All Videos'}
          >
            {loopMode === 'single' ? (
              <Repeat1 className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-1 text-[11px] text-rose-400 mt-1.5">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 2. Playlist Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-purple-100">Playlist</span>
          <span className="text-purple-400/60 font-mono tabular-nums">
            ({tracks.length})
          </span>
        </div>
        <div className="text-[11px] text-purple-300/70">
          {loopMode === 'single' ? 'Looping 1 video' : 'Looping all videos'}
        </div>
      </div>

      {/* 3. Track List or Empty State */}
      <div className="space-y-2 overflow-y-auto max-h-[460px] flex-1 pr-1">
        {tracks.length === 0 ? (
          <div className="py-12 px-4 text-center bg-[#090514]/60 rounded-xl border border-dashed border-purple-500/20">
            <Music className="w-7 h-7 text-purple-400/50 mx-auto mb-2" />
            <p className="text-xs font-medium text-purple-200">Playlist is empty</p>
            <p className="text-[11px] text-purple-400/60 mt-0.5">
              Paste a link above to add your first looping video.
            </p>
          </div>
        ) : (
          tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-3 p-2 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-purple-500/15 border-purple-400/40 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                    : 'bg-[#0a0515]/50 hover:bg-[#120824]/60 border-purple-900/25'
                }`}
              >
                {/* Thumbnail / Play Trigger */}
                <div
                  onClick={() => onSelectTrack(track)}
                  className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-purple-950/40 border border-purple-500/20"
                >
                  <img
                    src={getYouTubeThumbnail(track.youtubeId)}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 ${
                      isCurrent && isPlaying ? 'opacity-100 bg-black/50' : ''
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <div className="flex gap-0.5 items-end h-3">
                        <div className="w-0.5 h-full bg-purple-400 animate-pulse" />
                        <div className="w-0.5 h-2 bg-purple-300 animate-pulse delay-75" />
                        <div className="w-0.5 h-full bg-violet-400 animate-pulse delay-150" />
                      </div>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-purple-100 fill-current opacity-80 group-hover:opacity-100" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div
                  onClick={() => onSelectTrack(track)}
                  className="min-w-0 flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-xs font-medium truncate ${
                        isCurrent ? 'text-purple-200 font-semibold' : 'text-purple-100'
                      }`}
                    >
                      {track.title}
                    </h4>
                    {isCurrent && loopMode === 'single' && (
                      <Repeat1 className="w-3 h-3 text-purple-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-purple-400/60 truncate mt-0.5">
                    {track.artist}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100">
                  <a
                    href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-purple-400/60 hover:text-purple-200 transition-colors"
                    title="Open video on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-purple-400/60 hover:text-rose-400 transition-colors"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
