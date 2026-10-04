'use client';

import React from 'react';
import { DominanceMetrics } from '@/types/orderflow';

interface DominanceTrackerProps {
  metrics: DominanceMetrics;
}

export const DominanceTracker: React.FC<DominanceTrackerProps> = ({ metrics }) => {
  const isBuyerDominant = metrics.dominanceRatio >= 50;

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800 p-3 select-none flex flex-col gap-2.5">
      {/* Header and Institutional Verdict */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-neutral-400 tracking-wider">
          ORDER DOMINANCE & ABSORPTION TRACKER
        </span>
        <span
          className={`text-xs font-mono font-bold tracking-wide px-2 py-0.5 rounded ${
            metrics.verdict.includes('BUYER') || metrics.verdict.includes('ABSORBING SELLS')
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
              : metrics.verdict.includes('SELLER') || metrics.verdict.includes('ABSORBING BUYS')
              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
          }`}
        >
          {metrics.verdict}
        </span>
      </div>

      {/* LARGE, BOLD, HIGH-CONTRAST BUYING VS SELLING ORDERS COUNT */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Buyer Dominance Side */}
        <div className="flex flex-col bg-neutral-950/80 p-2.5 rounded border border-emerald-900/40">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">
              BUY ORDERS
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {metrics.dominanceRatio.toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-400 tabular-nums my-0.5">
            {metrics.buyingOrdersCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            Vol: <span className="text-neutral-200 font-medium">{metrics.buyAggressionVolume.toLocaleString()}</span>
          </div>
        </div>

        {/* Seller Dominance Side */}
        <div className="flex flex-col bg-neutral-950/80 p-2.5 rounded border border-rose-900/40">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">
              SELL ORDERS
            </span>
            <span className="text-xs font-mono text-rose-400 font-semibold">
              {(100 - metrics.dominanceRatio).toFixed(1)}%
            </span>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-rose-400 tabular-nums my-0.5">
            {metrics.sellingOrdersCount.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            Vol: <span className="text-neutral-200 font-medium">{metrics.sellAggressionVolume.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Dominance Gauge Bar */}
      <div className="w-full flex flex-col gap-1 mt-0.5">
        <div className="w-full h-2 bg-neutral-950 rounded overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${metrics.dominanceRatio}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${100 - metrics.dominanceRatio}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-neutral-500">
          <span>AGGRESSIVE BID POWER</span>
          <span>TAPE: {metrics.tapeSpeedTps} TPS</span>
          <span>AGGRESSIVE ASK POWER</span>
        </div>
      </div>
    </div>
  );
};
