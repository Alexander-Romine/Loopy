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
    <div className="bg-[#1a1714] border border-[#2c2722] rounded-xl p-4 sm:p-5 flex flex-col h-full">
      {/* 1. Quick Add Video Bar */}
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
            className="flex-1 px-3 py-2 bg-[#141210] border border-[#2c2722] rounded-md text-xs text-[#f3ede2] placeholder-[#736a60] focus:outline-none focus:border-[#e07a38] transition-colors"
          />

          <button
            type="submit"
            className="flex items-center justify-center w-9 h-9 rounded-md bg-[#e07a38] hover:bg-[#ea8b4d] text-[#141210] transition-colors shrink-0"
            title="Add & play video"
            aria-label="Add and play video"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={onToggleLoop}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors shrink-0 ${
              loopMode === 'single'
                ? 'bg-[#e07a38]/20 text-[#e07a38] border border-[#e07a38]/40'
                : 'bg-[#141210] text-[#9e9488] border border-[#2c2722] hover:bg-[#25211d]'
            }`}
            title={loopMode === 'single' ? 'Loop: Single Video' : 'Loop: All Videos'}
            aria-label="Toggle loop mode"
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

      {/* 2. Record Crate Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2c2722] mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#f3ede2]">Record Crate</span>
          <span className="text-[#9e9488] font-mono tabular-nums">
            ({tracks.length})
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#c8a258]">
          {loopMode === 'single' ? 'Looping 1 side' : 'Looping all'}
        </div>
      </div>

      {/* 3. Track List or Empty State */}
      <div className="space-y-2 overflow-y-auto max-h-[460px] flex-1 pr-1">
        {tracks.length === 0 ? (
          <div className="py-12 px-4 text-center bg-[#141210] rounded-lg border border-dashed border-[#2c2722]">
            <Music className="w-7 h-7 text-[#736a60] mx-auto mb-2" />
            <p className="text-xs font-medium text-[#f3ede2]">Crate is empty</p>
            <p className="text-[11px] text-[#9e9488] mt-0.5">
              Paste a YouTube link above to press your first record.
            </p>
          </div>
        ) : (
          tracks.map((track) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                className={`group flex items-center gap-3 p-2 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'bg-[#e07a38]/10 border-[#e07a38]/40'
                    : 'bg-[#141210] hover:bg-[#25211d] border-[#2c2722]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="relative w-12 h-10 rounded overflow-hidden shrink-0 cursor-pointer bg-[#0e0c0a] border border-[#2c2722]"
                  aria-label={`Play ${track.title}`}
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
                        <div className="w-0.5 h-full bg-[#e07a38] animate-pulse" />
                        <div className="w-0.5 h-2 bg-[#c8a258] animate-pulse delay-75" />
                        <div className="w-0.5 h-full bg-[#e07a38] animate-pulse delay-150" />
                      </div>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-[#f3ede2] fill-current opacity-80 group-hover:opacity-100" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-xs font-medium truncate ${
                        isCurrent ? 'text-[#e07a38] font-semibold' : 'text-[#f3ede2]'
                      }`}
                    >
                      {track.title}
                    </h4>
                    {isCurrent && loopMode === 'single' && (
                      <Repeat1 className="w-3 h-3 text-[#e07a38] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#9e9488] truncate mt-0.5">
                    {track.artist}
                  </p>
                </button>

                <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover:opacity-100">
                  <a
                    href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#9e9488] hover:text-[#f3ede2] transition-colors"
                    title="Open video on YouTube"
                    aria-label="Open video on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-[#9e9488] hover:text-rose-400 transition-colors"
                    title="Remove from playlist"
                    aria-label="Remove from playlist"
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
