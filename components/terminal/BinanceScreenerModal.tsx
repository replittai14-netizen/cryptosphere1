'use client';

import React, { useState } from 'react';
import { ScreenerItem } from '@/types/orderflow';
import { Search, ArrowUpDown, Flame, TrendingUp, TrendingDown, RefreshCw, X } from 'lucide-react';

interface BinanceScreenerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ScreenerItem[];
  onSelectSymbol: (symbol: string) => void;
  currentSymbol: string;
  onRefresh: () => void;
}

type SortField = 'volume24h' | 'volumeSpikeRatio' | 'netCvd24h' | 'oiChange24h' | 'longShortRatio' | 'priceChange24h';

export const BinanceScreenerModal: React.FC<BinanceScreenerModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectSymbol,
  currentSymbol,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('volumeSpikeRatio');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterSignal, setFilterSignal] = useState<string>('ALL');

  if (!isOpen) return null;

  // Filter and sort items
  const filtered = items
    .filter((item) => {
      const matchSearch = item.symbol.toLowerCase().includes(search.toLowerCase());
      const matchSignal = filterSignal === 'ALL' || item.smartMoneySignal.includes(filterSignal);
      return matchSearch && matchSignal;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-neutral-950 border border-neutral-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-neutral-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                BINANCE PERPETUAL FUTURES INSTITUTIONAL SCREENER
              </h2>
              <p className="text-[11px] text-neutral-400">
                Live volume spikes, Net CVD, Open Interest shifts & Smart Money order clustering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Refresh live metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-neutral-800/80 bg-neutral-900/30">
          {/* Search box */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search symbol (e.g. BTC, SOL)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Quick Signal Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'ACCUMULATION', 'DISTRIBUTION', 'SQUEEZE', 'FLUSH'].map((sig) => (
              <button
                key={sig}
                onClick={() => setFilterSignal(sig)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors ${
                  filterSignal === sig
                    ? 'bg-neutral-100 text-neutral-900 font-bold'
                    : 'bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400 font-medium select-none z-10">
              <tr>
                <th className="py-2.5 px-4 font-semibold">PAIR</th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('priceChange24h')}>
                  <div className="flex items-center justify-end gap-1">
                    PRICE (24h) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volumeSpikeRatio')}>
                  <div className="flex items-center justify-end gap-1">
                    VOL SPIKE <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('netCvd24h')}>
                  <div className="flex items-center justify-end gap-1">
                    NET CVD (24h) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('oiChange24h')}>
                  <div className="flex items-center justify-end gap-1">
                    OI CHANGE <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right cursor-pointer hover:text-white" onClick={() => handleSort('longShortRatio')}>
                  <div className="flex items-center justify-end gap-1">
                    L/S RATIO <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">INSTITUTIONAL SIGNAL</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filtered.map((item) => {
                const isSelected = item.symbol === currentSymbol;
                const isSpike = item.volumeSpikeRatio > 1.8;

                return (
                  <tr
                    key={item.symbol}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      isSelected ? 'bg-sky-950/20 border-l-2 border-sky-500' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-white flex items-center gap-2">
                      <span>{item.symbol}</span>
                      {isSelected && <span className="text-[9px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded">ACTIVE</span>}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <div>${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={`text-[10px] ${item.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.priceChange24h >= 0 ? '+' : ''}{item.priceChange24h}%
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${isSpike ? 'bg-amber-950 text-amber-400 border border-amber-800/50' : 'text-neutral-300'}`}>
                        {item.volumeSpikeRatio}x
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className={`font-semibold ${item.netCvd24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.netCvd24h >= 0 ? '+' : ''}${(item.netCvd24h / 1000000).toFixed(1)}M
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className={`font-semibold ${item.oiChange24h >= 0 ? 'text-purple-400' : 'text-neutral-400'}`}>
                        {item.oiChange24h >= 0 ? '+' : ''}{item.oiChange24h}%
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-300">
                      {item.longShortRatio.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded tracking-tight ${
                          item.smartMoneySignal.includes('ACCUMULATION')
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                            : item.smartMoneySignal.includes('DISTRIBUTION')
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/40'
                            : item.smartMoneySignal.includes('SQUEEZE')
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                            : 'bg-neutral-800/60 text-neutral-400'
                        }`}
                      >
                        {item.smartMoneySignal}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectSymbol(item.symbol);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] rounded transition-colors font-sans font-medium"
                      >
                        Load Pair
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
