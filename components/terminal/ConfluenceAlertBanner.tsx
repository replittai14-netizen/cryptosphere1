'use client';

import React from 'react';
import { ConfluenceAlert } from '@/types/orderflow';
import { ShieldCheck, Zap, Bell, CheckCircle2, X } from 'lucide-react';

interface ConfluenceAlertBannerProps {
  alerts: ConfluenceAlert[];
  onDismiss: (id: string) => void;
}

export const ConfluenceAlertBanner: React.FC<ConfluenceAlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 p-3 bg-neutral-900/90 border border-neutral-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-neutral-200 tracking-wider">
            INSTITUTIONAL MULTI-CONFLUENCE SIGNALS
          </span>
        </div>
        <span className="text-[10px] font-mono text-neutral-400">
          SWEEP + CVD DIVERGENCE + POI ABSORPTION + OI ALIGNED
        </span>
      </div>

      <div className="space-y-1.5">
        {alerts.slice(0, 2).map((alert) => {
          const isBull = alert.type.includes('LONG') || alert.type.includes('BULL');

          return (
            <div
              key={alert.id}
              className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between transition-all ${
                isBull
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full animate-ping ${
                    isBull ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <div>
                  <div className="font-bold flex items-center gap-2">
                    <span className="text-white">{alert.symbol}</span>
                    <span className={isBull ? 'text-emerald-400' : 'text-rose-400'}>{alert.title}</span>
                    <span className="text-[10px] bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-300">
                      SCORE: {alert.score}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-300 mt-0.5">{alert.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-400">{alert.timeString}</span>
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
