'use client';

import React, { useState } from 'react';
import { DivergenceSignal } from '@/types/orderflow';
import { Zap, TrendingUp, TrendingDown, Eye, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface DivergenceVisualizerHUDProps {
  divergences: DivergenceSignal[];
  onSelectDivergence?: (signal: DivergenceSignal) => void;
}

export const DivergenceVisualizerHUD: React.FC<DivergenceVisualizerHUDProps> = ({
  divergences,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!divergences || divergences.length === 0) return null;

  const latest = divergences[divergences.length - 1];
  const isBull = latest.direction === 'BULLISH';

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-top duration-300 pointer-events-auto">
      <div
        className={`rounded-lg border shadow-2xl backdrop-blur-md transition-all ${
          isBull
            ? 'bg-[#061814]/95 border-[#089981]/60 shadow-[0_0_20px_rgba(8,153,129,0.25)]'
            : 'bg-[#18080a]/95 border-[#f23645]/60 shadow-[0_0_20px_rgba(242,54,69,0.25)]'
        }`}
      >
        {/* Main Banner Header */}
        <div className="flex items-center justify-between px-3 py-1.5 gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`p-1 rounded-full ${
                isBull ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#f23645]/20 text-[#f23645]'
              }`}
            >
              {isBull ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                {latest.title}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  isBull ? 'bg-[#089981] text-neutral-950' : 'bg-[#f23645] text-white'
                }`}
              >
                {latest.direction} ({latest.confidence}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded text-neutral-300 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand Details'}
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Detailed Divergence Breakdown */}
        {isExpanded && (
          <div className="px-3 pb-2 pt-1 border-t border-white/10 text-xs font-mono space-y-1.5">
            <p className="text-neutral-200 text-[11px] leading-relaxed">
              {latest.explanation}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <AlertCircle className={`w-3 h-3 ${isBull ? 'text-[#089981]' : 'text-[#f23645]'}`} />
                <span>
                  ACTION:{' '}
                  <strong className={isBull ? 'text-[#089981]' : 'text-[#f23645]'}>
                    {latest.action}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span>Category: {latest.category === 'PRICE_VS_PRESSURE' ? 'Price vs Pressure' : 'Pressure vs CVD'}</span>
                <span>·</span>
                <span className="text-neutral-300">Active Signals: {divergences.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
