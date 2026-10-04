'use client';

import React from 'react';
import { TerminalToggles } from '@/types/orderflow';
import { SlidersHorizontal, Eye, Volume2, VolumeX, Sparkles, Layers } from 'lucide-react';

interface UnifiedControlBarProps {
  toggles: TerminalToggles;
  onToggle: (key: keyof TerminalToggles) => void;
  onSetPreset: (preset: 'ALL_ON' | 'ORDERFLOW_PURE' | 'SMC_HEATMAP' | 'CLEAN_CHART') => void;
}

export const UnifiedControlBar: React.FC<UnifiedControlBarProps> = ({
  toggles,
  onToggle,
  onSetPreset,
}) => {
  const toggleItems: { key: keyof TerminalToggles; label: string; desc: string; category: string }[] = [
    { key: 'footprintOverlay', label: 'Footprint (Bid x Ask)', desc: 'Bid/Ask clusters & delta', category: 'ORDERFLOW' },
    { key: 'liquidityWalls', label: 'Liquidity Walls', desc: 'Thick depth limits', category: 'ORDERFLOW' },
    { key: 'gravitational3D', label: '3D Gravity Field', desc: 'WebGL magnetic pull', category: '3D WEBGL' },
    { key: 'poiAbsorption3D', label: '3D Absorption Rings', desc: 'POI shockwave ripples', category: '3D WEBGL' },
    { key: 'liquidationHeatmap', label: 'Liq Heatmap', desc: '10x-100x cascade zones', category: 'HEATMAP' },
    { key: 'cumulativePressure', label: 'Pressure Candles', desc: 'Bullish vs Bearish pressure OHLC', category: 'CHARTS' },
    { key: 'cvdSubBar', label: 'CVD Candles', desc: 'Cumulative Volume Delta OHLC & Sub-bar delta', category: 'CHARTS' },
    { key: 'oiFunding', label: 'OI Candles', desc: 'Open Interest OHLC & Funding Rate', category: 'CHARTS' },
    { key: 'smcBlocks', label: 'SMC (FVG & OB)', desc: 'Smart money gaps & blocks', category: 'SMC' },
    { key: 'spoofVelocity', label: 'Spoof & Tape', desc: 'Cancel detection & TPS', category: 'SIGNALS' },
    { key: 'divergenceRadar', label: 'Divergence Radar', desc: 'Price vs Pressure & Pressure vs CVD divergences', category: 'SIGNALS' },
    { key: 'confluenceAlerts', label: 'Confluence Badges', desc: 'Institutional alert HUD', category: 'SIGNALS' },
    { key: 'soundEnabled', label: 'Audio Engine', desc: 'Procedural chimes & sweeps', category: 'AUDIO' },
  ];

  return (
    <div className="w-full bg-neutral-900 border-y border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Label and Quick Presets */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-neutral-400 font-semibold text-[11px] uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>LAYER TOGGLE MATRIX</span>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetPreset('ALL_ON')}
            className="px-2 py-0.5 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            All Active
          </button>
          <button
            onClick={() => onSetPreset('ORDERFLOW_PURE')}
            className="px-2 py-0.5 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Pure Orderflow
          </button>
          <button
            onClick={() => onSetPreset('SMC_HEATMAP')}
            className="px-2 py-0.5 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            SMC & Heatmap
          </button>
          <button
            onClick={() => onSetPreset('CLEAN_CHART')}
            className="px-2 py-0.5 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
          >
            Clean Canvas
          </button>
        </div>
      </div>

      {/* Individual ON/OFF Switch Matrix */}
      <div className="flex flex-wrap items-center gap-1.5">
        {toggleItems.map((item) => {
          const isActive = toggles[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              title={item.desc}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                isActive
                  ? 'bg-neutral-800 border-sky-500/50 text-white shadow-sm'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]' : 'bg-neutral-700'
                }`}
              />
              <span className="whitespace-nowrap">{item.label}</span>
              {item.key === 'soundEnabled' && (
                isActive ? <Volume2 className="w-3 h-3 text-sky-400" /> : <VolumeX className="w-3 h-3 text-neutral-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
