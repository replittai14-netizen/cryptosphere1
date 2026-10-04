'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Timeframe, TerminalLayoutMode } from '@/types/orderflow';
import { POPULAR_PERPETUAL_SYMBOLS } from '@/lib/binance-service';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ListFilter,
  Search,
  ChevronDown,
  LayoutGrid,
  Square,
  Columns2,
  Check,
  BookOpen,
} from 'lucide-react';

interface TopNavigationProps {
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  onSelectSymbol: (symbol: string) => void;
  onOpenScreener: () => void;
  onOpenGuide?: () => void;
  isLiveWs: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  layoutMode: TerminalLayoutMode;
  onSelectLayoutMode: (mode: TerminalLayoutMode) => void;
}

const TIMEFRAMES: Timeframe[] = [
  '1m', '3m', '5m', '15m', '30m',
  '1h', '2h', '4h', '8h', '12h',
  '1d', '3d', '1w', '1M', '1Y'
];

export const TopNavigation: React.FC<TopNavigationProps> = ({
  symbol,
  currentPrice,
  priceChange24h,
  timeframe,
  onSelectTimeframe,
  onSelectSymbol,
  onOpenScreener,
  onOpenGuide,
  isLiveWs,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  layoutMode,
  onSelectLayoutMode,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  const filteredSymbols = POPULAR_PERPETUAL_SYMBOLS.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="relative w-full bg-[#0a0d14] border-b border-[#2a2e39] px-3.5 py-2 flex items-center justify-between text-xs select-none z-40">
      {/* Zone 1: Institutional Wordmark & Pair Search Dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-1.5 pr-2 border-r border-[#2a2e39]">
          <span className="text-sm font-black tracking-tight text-white font-mono flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 rotate-45 inline-block shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            CRYPTOSPHERE
          </span>
          <span className="text-[10px] font-mono font-bold text-sky-400/90 uppercase tracking-wider">
            INSTITUTIONAL
          </span>
        </div>

        {/* Pair Selector Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 bg-[#131722] hover:bg-[#1e222d] border border-[#2a2e39] rounded transition-all shadow-sm"
          >
            <span className="font-bold text-white font-mono text-xs">{symbol}</span>
            <span className="font-mono text-sky-400 font-bold tabular-nums">
              ${currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`font-mono text-[10px] font-bold tabular-nums ${
                priceChange24h >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {/* Quick Pair Search Popover Dropdown */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-72 max-h-96 bg-[#131722] border border-[#2a2e39] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
              {/* Search input */}
              <div className="p-2 border-b border-[#2a2e39] bg-[#1e222d]/60 flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search 70+ Perpetual Coins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
              </div>

              {/* Symbol List */}
              <div className="overflow-y-auto max-h-80 divide-y divide-[#2a2e39]/50">
                {filteredSymbols.map((sym) => {
                  const isCurrent = sym === symbol;
                  return (
                    <button
                      key={sym}
                      onClick={() => {
                        onSelectSymbol(sym);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs font-mono hover:bg-[#1e222d] transition-colors ${
                        isCurrent ? 'bg-sky-500/15 text-sky-400 font-bold' : 'text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isCurrent && <Check className="w-3 h-3 text-sky-400" />}
                        <span>{sym}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">USDT-M</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Multi-Timeframe Selector Tabs */}
      <div className="hidden lg:flex items-center bg-[#131722] p-0.5 rounded border border-[#2a2e39]">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onSelectTimeframe(tf)}
            className={`px-2 py-0.5 text-[11px] font-mono transition-colors rounded ${
              timeframe === tf
                ? 'bg-sky-500 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#1e222d]'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Zone 3: Layout Mode Switcher & Actions */}
      <div className="flex items-center gap-2">
        {/* Layout Switcher (Full Chart vs Dual vs Quad) */}
        <div className="flex items-center bg-[#131722] p-0.5 rounded border border-[#2a2e39]">
          <button
            onClick={() => onSelectLayoutMode('FULL_CHART')}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              layoutMode === 'FULL_CHART'
                ? 'bg-sky-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Full Chart View (Candlestick Focus)"
          >
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">FULL</span>
          </button>
          <button
            onClick={() => onSelectLayoutMode('DUAL_VIEW')}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              layoutMode === 'DUAL_VIEW'
                ? 'bg-sky-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Dual View (Price + CVD Candles)"
          >
            <Columns2 className="w-3 h-3" />
            <span className="hidden sm:inline">DUAL</span>
          </button>
          <button
            onClick={() => onSelectLayoutMode('QUAD_MATRIX')}
            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              layoutMode === 'QUAD_MATRIX'
                ? 'bg-sky-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Quad Matrix (Price + Pressure + CVD + OI)"
          >
            <LayoutGrid className="w-3 h-3" />
            <span className="hidden sm:inline">QUAD</span>
          </button>
        </div>

        {/* Screener Button */}
        <button
          onClick={onOpenScreener}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded transition-colors font-mono"
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SCREENER</span>
        </button>

        {/* Institutional Trading Guide & Strategy Playbook */}
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs rounded transition-all font-mono shadow-sm"
            title="Institutional Trading Guide & Strategy Rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">TRADING GUIDE</span>
          </button>
        )}

        {/* Live Feed Status */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#131722] border border-[#2a2e39] rounded font-mono text-[10px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveWs ? 'bg-[#089981] animate-pulse shadow-[0_0_6px_#089981]' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className={isLiveWs ? 'text-[#089981] font-semibold' : 'text-amber-400 font-semibold'}>
            {isLiveWs ? 'LIVE WSS' : 'HIGH-FREQ'}
          </span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-1 bg-[#131722] hover:bg-[#1e222d] border border-[#2a2e39] rounded text-neutral-300 transition-colors"
          title={soundEnabled ? 'Mute Terminal Audio' : 'Enable Terminal Audio'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-1 bg-[#131722] hover:bg-[#1e222d] border border-[#2a2e39] rounded text-neutral-300 transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
