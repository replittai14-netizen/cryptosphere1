'use client';

import React from 'react';
import { LiquidityWall } from '@/types/orderflow';

interface OrderbookDepthHUDProps {
  currentPrice: number;
  liquidityWalls: LiquidityWall[];
  recentTrades: { price: number; qty: number; time: number; isBuy: boolean }[];
}

export const OrderbookDepthHUD: React.FC<OrderbookDepthHUDProps> = ({
  currentPrice,
  liquidityWalls,
  recentTrades,
}) => {
  const asks = liquidityWalls.filter((w) => w.side === 'ask').sort((a, b) => b.price - a.price);
  const bids = liquidityWalls.filter((w) => w.side === 'bid').sort((a, b) => b.price - a.price);

  return (
    <div className="w-full h-full bg-neutral-900/90 border-l border-neutral-800 flex flex-col text-xs font-mono select-none overflow-hidden">
      {/* HUD Header */}
      <div className="p-2.5 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
        <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">
          ORDERBOOK LIMIT WALLS
        </span>
        <span className="text-[10px] text-neutral-500">DEEP LIQUIDITY</span>
      </div>

      {/* Asks (Sell Side) */}
      <div className="flex-1 flex flex-col justify-end p-2 space-y-1 overflow-hidden">
        {asks.slice(0, 4).map((ask) => {
          return (
            <div key={ask.id} className="relative flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded">
              <div
                className="absolute inset-0 bg-rose-950/40 rounded -z-10"
                style={{ width: `${Math.min(100, ask.strength * 100)}%` }}
              />
              <span className="text-rose-400 font-semibold tabular-nums">
                ${ask.price < 1 ? ask.price.toFixed(4) : ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-neutral-400 tabular-nums">
                ${(ask.sizeUSDT / 1000000).toFixed(1)}M
              </span>
            </div>
          );
        })}
      </div>

      {/* Mid Price Spread Bar */}
      <div className="py-1.5 px-3 bg-neutral-950 border-y border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-bold text-sky-400 tabular-nums">
          ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[10px] text-neutral-400">SPREAD 0.01%</span>
      </div>

      {/* Bids (Buy Side) */}
      <div className="flex-1 flex flex-col p-2 space-y-1 overflow-hidden">
        {bids.slice(0, 4).map((bid) => {
          return (
            <div key={bid.id} className="relative flex items-center justify-between text-[11px] py-0.5 px-1.5 rounded">
              <div
                className="absolute inset-0 bg-emerald-950/40 rounded -z-10"
                style={{ width: `${Math.min(100, bid.strength * 100)}%` }}
              />
              <span className="text-emerald-400 font-semibold tabular-nums">
                ${bid.price < 1 ? bid.price.toFixed(4) : bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-neutral-400 tabular-nums">
                ${(bid.sizeUSDT / 1000000).toFixed(1)}M
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent High-Frequency Aggregated Trades Feed */}
      <div className="border-t border-neutral-800 p-2 bg-neutral-950/40">
        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1">
          <span>TIME</span>
          <span>PRICE</span>
          <span>SIZE (USDT)</span>
        </div>
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {recentTrades.slice(0, 6).map((tr, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10px] py-0.5">
              <span className="text-neutral-500">
                {new Date(tr.time).toLocaleTimeString(undefined, { hour12: false, minute: '2-digit', second: '2-digit' })}
              </span>
              <span className={tr.isBuy ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                ${tr.price < 1 ? tr.price.toFixed(4) : tr.price.toFixed(2)}
              </span>
              <span className="text-neutral-300">
                {(tr.qty * tr.price).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
