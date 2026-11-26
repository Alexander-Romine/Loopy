import React, { useState } from 'react';
import { LofiTrack, LoopMode } from '../types/lofi';
import { extractYouTubeId, getYouTubeThumbnail } from '../services/youtube';
import {
  Play,
  Trash2,
  Plus,
  ExternalLink,
  Repeat1,
  AlertCircle,
  Disc3,
} from 'lucide-react';

interface PlaylistManagerProps {
  tracks: LofiTrack[];
  currentTrackId: string | null;
  isPlaying: boolean;
  loopMode: LoopMode;
  onSelectTrack: (track: LofiTrack) => void;
  onDeleteTrack: (id: string) => void;
  onAddTrack: (track: LofiTrack, playImmediately: boolean) => void;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  loopMode,
  onSelectTrack,
  onDeleteTrack,
  onAddTrack,
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
      title: 'YouTube Track',
      artist: 'Vinyl Press',
      addedAt: Date.now(),
    };

    onAddTrack(newTrack, true);
    setUrlInput('');
    setError(null);
  };

  return (
    <aside
      aria-label="Record Crate"
      className="relative flex flex-col rounded-2xl border border-[#2d2925] bg-[#161412] p-5 sm:p-6 h-full min-h-[480px] lg:min-h-[640px]"
    >
      {/* Editorial Crate Header */}
      <div className="flex items-baseline justify-between border-b border-[#272320] pb-4 mb-5">
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.22em] text-[#e85d2a]">
            Side A · Listening Booth
          </span>
          <h2 className="font-[var(--font-display)] text-lg font-bold text-[#f2ece1] mt-0.5">
            Record Crate
          </h2>
        </div>
        <span className="font-mono text-xs text-[#8d8479] tabular-nums">
          {String(tracks.length).padStart(2, '0')} {tracks.length === 1 ? 'DISC' : 'DISCS'}
        </span>
      </div>

      {/* Press New Record Slot */}
      <div className="mb-5">
        <form onSubmit={handleAddSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste YouTube URL or ID..."
            className="flex-1 px-3.5 py-2.5 bg-[#0e0d0c] border border-[#2d2925] rounded-md text-xs font-mono text-[#f2ece1] placeholder-[#6e655b] focus:outline-none focus:border-[#e85d2a] transition-colors"
          />

          <button
            type="submit"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-md bg-[#e85d2a] hover:bg-[#f06e3e] text-[#12100e] font-mono text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            title="Press & spin record"
            aria-label="Add and play track"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Press</span>
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-2 font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Vinyl Sleeve Stack */}
      <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 max-h-[430px]">
        {tracks.length === 0 ? (
          <div className="py-16 px-4 text-center bg-[#0e0d0c] rounded-xl border border-dashed border-[#2d2925]">
            <Disc3 className="w-8 h-8 text-[#5e564e] mx-auto mb-3" />
            <p className="font-[var(--font-display)] text-sm font-semibold text-[#f2ece1]">
              The crate is empty
            </p>
            <p className="text-[11px] font-mono text-[#8d8479] mt-1">
              Paste a YouTube link above to press your first vinyl.
            </p>
          </div>
        ) : (
          tracks.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;

            return (
              <div
                key={track.id}
                className={`group relative flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#e85d2a]/10 border-[#e85d2a]/45'
                    : 'bg-[#0e0d0c] hover:bg-[#1d1a17] border-[#272320]'
                }`}
              >
                {/* Catalog Number */}
                <span className="font-mono text-[10px] text-[#6e655b] w-4 text-center shrink-0 tabular-nums">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Sleeve Art + Peeking Vinyl Disc */}
                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className="relative flex items-center shrink-0 cursor-pointer"
                  aria-label={`Play ${track.title}`}
                >
                  {isCurrent && (
                    <span
                      className="absolute -right-2 w-10 h-10 rounded-full bg-[#1a1714] border border-[#3d3731] animate-vinyl"
                      style={{
                        animationPlayState: isPlaying ? 'running' : 'paused',
                      }}
                    />
                  )}
                  <div className="relative z-10 w-11 h-11 rounded-md overflow-hidden bg-[#161412] border border-[#2d2925]">
                    <img
                      src={getYouTubeThumbnail(track.youtubeId)}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${
                        isCurrent && isPlaying
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3">
                          <div className="w-0.5 h-full bg-[#e85d2a] animate-vu-1" />
                          <div className="w-0.5 h-full bg-[#d4a34b] animate-vu-2" />
                          <div className="w-0.5 h-full bg-[#e85d2a] animate-vu-3" />
                        </div>
                      ) : (
                        <Play className="w-3.5 h-3.5 text-[#f2ece1] fill-current" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Track Metadata */}
                <button
                  type="button"
                  onClick={() => onSelectTrack(track)}
                  className={`min-w-0 flex-1 cursor-pointer text-left ${isCurrent ? 'pl-1.5' : ''}`}
                >
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-[#e85d2a]' : 'text-[#f2ece1]'
                      }`}
                    >
                      {track.title}
                    </h3>
                    {isCurrent && loopMode === 'single' && (
                      <Repeat1 className="w-3 h-3 text-[#e85d2a] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-[#8d8479] truncate mt-0.5">
                    {isCurrent && isPlaying ? 'NOW SPINNING' : track.artist}
                  </p>
                </button>

                {/* Sleeve Actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100">
                  <a
                    href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-[#8d8479] hover:text-[#f2ece1] transition-colors"
                    title="Open on YouTube"
                    aria-label="Open on YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onDeleteTrack(track.id)}
                    className="p-1.5 text-[#8d8479] hover:text-rose-400 transition-colors"
                    title="Remove from crate"
                    aria-label="Remove from crate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Subtle Keyboard Legend */}
      <div className="mt-4 pt-3 border-t border-[#272320] flex items-center justify-between text-[10px] font-mono text-[#6e655b]">
        <span>SPACE · PLAY/PAUSE</span>
        <span>L · LOOP</span>
        <span>←/→ · SKIP</span>
      </div>
    </aside>
  );
};
