'use client';

import React from 'react';
import { SpoofEvent } from '@/types/orderflow';
import { AlertTriangle, Activity, Zap, ShieldAlert } from 'lucide-react';

interface TapeVelocityAndSpoofingProps {
  spoofs: SpoofEvent[];
  tapeSpeedTps: number;
}

export const TapeVelocityAndSpoofing: React.FC<TapeVelocityAndSpoofingProps> = ({
  spoofs,
  tapeSpeedTps,
}) => {
  const isBurstVelocity = tapeSpeedTps > 65;

  return (
    <div className="w-full bg-neutral-900/90 border border-neutral-800 p-3 select-none flex flex-col gap-2.5">
      {/* Tape Speed Velocity Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-4 h-4 ${isBurstVelocity ? 'text-amber-400 animate-pulse' : 'text-sky-400'}`} />
          <span className="text-[11px] font-semibold text-neutral-300 tracking-wider">
            TAPE VELOCITY & SPOOFING DETECTOR
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <span className="text-neutral-500">SPEED:</span>
          <span className={`font-bold tabular-nums ${isBurstVelocity ? 'text-amber-400' : 'text-sky-400'}`}>
            {tapeSpeedTps} TPS
          </span>
          {isBurstVelocity && (
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">BURST SPIKE</span>
          )}
        </div>
      </div>

      {/* Velocity Progress Meter */}
      <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isBurstVelocity ? 'bg-amber-400' : 'bg-sky-500'
          }`}
          style={{ width: `${Math.min(100, (tapeSpeedTps / 100) * 100)}%` }}
        />
      </div>

      {/* Spoofing Events Feed */}
      <div className="flex flex-col gap-1.5 pt-0.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
          <span>DETECTED SPOOF EVENTS (&lt;250ms CANCELED WALLS)</span>
          <span>{spoofs.length} DETECTIONS</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
          {spoofs.length === 0 ? (
            <div className="text-[11px] font-mono text-neutral-500 py-2 text-center">
              Scanning orderbook limits for flash cancel anomalies...
            </div>
          ) : (
            spoofs.slice(0, 3).map((sp) => (
              <div
                key={sp.id}
                className="bg-neutral-950/70 border border-neutral-800 rounded p-1.5 text-[10px] font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className={`w-3.5 h-3.5 ${sp.side === 'bid' ? 'text-emerald-400' : 'text-rose-400'}`} />
                  <div>
                    <span className={`font-bold ${sp.side === 'bid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sp.side.toUpperCase()} SPOOF
                    </span>
                    <span className="text-neutral-400 ml-1.5">${sp.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-300 font-semibold">${(sp.sizeUSDT / 1000000).toFixed(1)}M PULL</div>
                  <div className="text-[9px] text-neutral-500">{sp.durationMs}ms active</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
