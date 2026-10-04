'use client';

import React, { useState } from 'react';
import { WhaleTradeSignal } from '@/types/orderflow';
import { ArrowUpRight, ArrowDownRight, Target, Shield, Copy, Check, X, ShieldAlert } from 'lucide-react';

interface WhaleRadarBannerProps {
  whaleSignal: WhaleTradeSignal | null;
  onDismiss: () => void;
}

export const WhaleRadarBanner: React.FC<WhaleRadarBannerProps> = ({ whaleSignal, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  if (!whaleSignal) return null;

  const isBuy = whaleSignal.side === 'BUY';

  const copyTrade = () => {
    const text = `WHALE ${whaleSignal.symbol} ${whaleSignal.side} ENTRY: $${whaleSignal.price} | TP: $${whaleSignal.targetPrice} | SL: $${whaleSignal.stopLossPrice} | R:R ${whaleSignal.riskReward}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`w-full px-4 py-2 border-b select-none transition-all duration-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-md ${
        isBuy
          ? 'bg-[#062419] border-[#089981]/60 text-emerald-200'
          : 'bg-[#290d12] border-[#f23645]/60 text-rose-200'
      }`}
    >
      {/* Whale Detection Badge */}
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center justify-center p-1.5 rounded font-bold text-xs ${
            isBuy ? 'bg-[#089981] text-white shadow-[0_0_12px_rgba(8,153,129,0.7)]' : 'bg-[#f23645] text-white shadow-[0_0_12px_rgba(242,54,69,0.7)]'
          }`}
        >
          {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white tracking-wide">
              {whaleSignal.symbol} INSTITUTIONAL {whaleSignal.side} DETECTED
            </span>
            <span
              className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                isBuy ? 'bg-[#089981]/30 text-[#26a69a] border border-[#089981]/50' : 'bg-[#f23645]/30 text-[#ef5350] border border-[#f23645]/50'
              }`}
            >
              SIZE: ${(whaleSignal.sizeUSDT / 1000000).toFixed(2)}M USDT
            </span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-neutral-300">
              CONFIDENCE {whaleSignal.confidence}%
            </span>
          </div>
          <p className="text-[11px] text-neutral-300/90 mt-0.5">{whaleSignal.reason}</p>
        </div>
      </div>

      {/* Actionable Trade Execution Levels */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded border border-neutral-700/60">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400">ENTRY</span>
            <span className="font-bold text-white tabular-nums">${whaleSignal.price.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
              <Target className="w-2.5 h-2.5" /> TP
            </span>
            <span className="font-bold text-emerald-400 tabular-nums">${whaleSignal.targetPrice.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-rose-400 flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5" /> SL
            </span>
            <span className="font-bold text-rose-400 tabular-nums">${whaleSignal.stopLossPrice.toLocaleString()}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400">R:R</span>
            <span className="font-bold text-sky-400 tabular-nums">{whaleSignal.riskReward}</span>
          </div>
        </div>

        {/* Copy Setup Button */}
        <button
          onClick={copyTrade}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-sans text-xs font-semibold transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : isBuy
              ? 'bg-[#089981] hover:bg-[#067a67] text-white shadow-sm'
              : 'bg-[#f23645] hover:bg-[#c92534] text-white shadow-sm'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED!' : 'FOLLOW WHALE'}</span>
        </button>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="p-1.5 hover:bg-black/30 rounded text-neutral-400 hover:text-white transition-colors"
          title="Dismiss Whale Signal"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
