'use client';

import React from 'react';
import { ReplayState } from '@/types/orderflow';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, Radio } from 'lucide-react';

interface BarReplayControllerProps {
  replay: ReplayState;
  onToggleReplay: () => void;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onScrub: (index: number) => void;
  onSetSpeed: (speed: number) => void;
  currentCandleDate?: string;
}

export const BarReplayController: React.FC<BarReplayControllerProps> = ({
  replay,
  onToggleReplay,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onScrub,
  onSetSpeed,
  currentCandleDate,
}) => {
  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="w-full bg-neutral-900/95 border-b border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Replay Mode Indicator & Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleReplay}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
            replay.isActive
              ? 'bg-amber-500 text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{replay.isActive ? 'REPLAY ACTIVE' : 'BAR REPLAY'}</span>
        </button>

        {replay.isActive ? (
          <span className="text-[11px] font-mono text-amber-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            HISTORICAL SIMULATION
            {currentCandleDate && <span className="text-neutral-400">· {currentCandleDate}</span>}
          </span>
        ) : (
          <span className="text-[11px] font-mono text-emerald-400 font-medium flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            LIVE TICK FEED
          </span>
        )}
      </div>

      {/* Replay Controls (Only visible or active when replay is active) */}
      {replay.isActive && (
        <div className="flex items-center gap-4 flex-1 max-w-xl mx-2">
          {/* Playback Transport Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onStepBackward}
              disabled={replay.currentReplayIndex <= 5}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-200 transition-colors"
              title="Step 1 bar backward"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onPlayPause}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded flex items-center gap-1 transition-colors"
            >
              {replay.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-mono">{replay.isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={onStepForward}
              disabled={replay.currentReplayIndex >= replay.maxIndex}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 rounded text-neutral-200 transition-colors"
              title="Step 1 bar forward"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrubber Range Slider */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500">BAR</span>
            <input
              type="range"
              min={10}
              max={replay.maxIndex}
              value={replay.currentReplayIndex}
              onChange={(e) => onScrub(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg appearance-none"
            />
            <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
              {replay.currentReplayIndex}/{replay.maxIndex}
            </span>
          </div>

          {/* Speed multiplier selector */}
          <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  replay.speed === s
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
