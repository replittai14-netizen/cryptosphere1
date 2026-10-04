'use client';

import React, { useState } from 'react';
import {
  X,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ShieldAlert,
  Target,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface TradingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'PRESSURE' | 'CVD' | 'OI' | 'DOMINANCE' | 'WALLS' | 'WHALE';
}

export const TradingGuideModal: React.FC<TradingGuideModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'PRESSURE',
}) => {
  const [activeTab, setActiveTab] = useState<
    'PRESSURE' | 'CVD' | 'OI' | 'DOMINANCE' | 'WALLS' | 'WHALE' | 'CHEAT_SHEET'
  >(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1017] border border-[#2a2e39] rounded-xl shadow-2xl flex flex-col overflow-hidden text-neutral-200 font-sans">
        {/* Header */}
        <div className="p-4 bg-[#131722] border-b border-[#2a2e39] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  INSTITUTIONAL ORDERFLOW & TRADING STRATEGY PLAYBOOK
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  MASTERCLASS
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Complete guide on how to read each tool, execute high-probability entries, and exit with profit.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-[#080b11] border-b border-[#2a2e39] overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('PRESSURE')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'PRESSURE'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>PRICE PRESSURE (50 EQ)</span>
          </button>
          <button
            onClick={() => setActiveTab('CVD')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CVD'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>CVD & SUB-BAR BALANCE</span>
          </button>
          <button
            onClick={() => setActiveTab('OI')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'OI'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OPEN INTEREST & FUNDING</span>
          </button>
          <button
            onClick={() => setActiveTab('DOMINANCE')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'DOMINANCE'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>DOMINANCE & ABSORPTION</span>
          </button>
          <button
            onClick={() => setActiveTab('WALLS')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'WALLS'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>LIQUIDITY WALLS & SPOOFING</span>
          </button>
          <button
            onClick={() => setActiveTab('WHALE')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'WHALE'
                ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                : 'text-neutral-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>WHALE RADAR TRADES</span>
          </button>
          <button
            onClick={() => setActiveTab('CHEAT_SHEET')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CHEAT_SHEET'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow'
                : 'text-emerald-400 hover:text-white hover:bg-[#131722]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>QUICK CHEAT-SHEET</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PRICE PRESSURE */}
          {activeTab === 'PRESSURE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-sky-400 mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> 1. Cumulative Price Pressure Chart (50 Equilibrium)
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Yeh tool orderbook aur tape ke real buying pressure vs selling pressure ko 0 se 100 ke scale par candlestick ke roop me dikhata hai.
                  Isme beech me <strong>50 EQ (Equilibrium Line)</strong> hoti hai jo neutral market ko darshati hai.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BUY ENTRY RULE */}
                <div className="p-4 rounded-lg bg-emerald-950/25 border border-emerald-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <TrendingUp className="w-4 h-4" /> LONG (BUY) ENTRY KAISE KAREIN:
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                    <li>Jab Pressure candles <strong>50 line ke upar cross</strong> karein aur green banein (60 - 80+).</li>
                    <li>Iska matlab buyers aggressive market orders se asks ko consume kar rahe hain.</li>
                    <li><strong>Entry Point:</strong> 50 ke breakout pe ya 50 ke retest pe confirmation ke sath.</li>
                    <li><strong>Stop Loss:</strong> Pressure candle ke swing low ke neeche (ya 48 ke neeche).</li>
                  </ul>
                </div>

                {/* SELL ENTRY RULE */}
                <div className="p-4 rounded-lg bg-rose-950/25 border border-rose-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <TrendingDown className="w-4 h-4" /> SHORT (SELL) ENTRY KAISE KAREIN:
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                    <li>Jab Pressure candles <strong>50 line ke neeche drop</strong> karein aur red candle banein (40 - 20).</li>
                    <li>Iska matlab sellers bids ko heavily hit kar rahe hain aur market dump ho raha hai.</li>
                    <li><strong>Entry Point:</strong> 50 line breakdown confirm hote hi short enter karein.</li>
                    <li><strong>Stop Loss:</strong> 52 ke upar ya recent pressure high pe.</li>
                  </ul>
                </div>
              </div>

              {/* EXIT STRATEGY */}
              <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" /> EXIT (PROFIT BOOK / RISK MANAGEMENT) KAISE KAREIN:
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Agar aapne <strong>Long</strong> liya hai aur Pressure 85-90 touch karke wapas mudne lage (exhaustion) ya wapas 50 ke paas aaye, to foran 50% to 100% position close karein.
                  Agar aapne <strong>Short</strong> liya hai aur Pressure 15-20 ke oversold zone se bounce kare, to exit plan trigger karein.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CVD */}
          {activeTab === 'CVD' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-sky-400 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 2. Cumulative Volume Delta (CVD) & Sub-Bar Directional Balance
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  CVD market me execute huye total Market Buys minus Market Sells ka net cumulative total hai.
                  Niche jo bars dikhte hain wo sub-bar directional volume delta hai. CVD Divergence se 90% institutional reversals pakde jaate hain.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BULLISH ABSORPTION */}
                <div className="p-4 rounded-lg bg-emerald-950/25 border border-emerald-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <TrendingUp className="w-4 h-4" /> SETUP 1: BULLISH ABSORPTION (PERFECT LONG)
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                    <li><strong>Sign:</strong> Price chart par naya lower low banta hai, lekin <strong>CVD candles higher low</strong> bana rahi hoti hain!</li>
                    <li><strong>Secret:</strong> Institutional whales retail panic sellers ke sare dump orders ko iceberg limit bids se absorb kar chuki hain.</li>
                    <li><strong>Action:</strong> Yahan se aggressive upward reversal aayega. Instant LONG entry lein!</li>
                  </ul>
                </div>

                {/* BEARISH DIVERGENCE */}
                <div className="p-4 rounded-lg bg-rose-950/25 border border-rose-800/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <TrendingDown className="w-4 h-4" /> SETUP 2: BEARISH EXHAUSTION (PERFECT SHORT)
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                    <li><strong>Sign:</strong> Price naya high bana raha hai, par <strong>CVD chart par naya high nahi banta (down ja raha hai)</strong>.</li>
                    <li><strong>Secret:</strong> Retailers FOMO me buy kar rahe hain jabki smart money limit asks laga kar distribution kar rahi hai.</li>
                    <li><strong>Action:</strong> Yahan se market violently crash karega. Instant SHORT enter karein!</li>
                  </ul>
                </div>
              </div>

              {/* EXIT RULE */}
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 space-y-2">
                <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
                  <Target className="w-4 h-4 text-sky-400" /> CVD EXIT STRATEGY:
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Jab CVD ki slope flat hone lage ya opposite color ki delta bar continuous 3 baar appear ho, tab apna trailing stop loss hit hone se pehle partial ya full exit le lein.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: OPEN INTEREST */}
          {activeTab === 'OI' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-purple-400 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 3. Open Interest (OI) & Funding Rate Quadrants
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Open Interest dikhata hai ki market me kitne fresh contracts open huye hain ya close huye hain. Green candle contract addition (accumulation), red candle contract unwinding (liquidation flush) darshati hai.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded bg-[#131722] border border-[#2a2e39] space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400">1. PRICE ↑ + OI ↑ (TRUE BULL TREND)</span>
                  <p className="text-xs text-neutral-300">
                    Naye buyers aggressive leverage ke sath long open kar rahe hain. <strong>Trade:</strong> Long hold karein, shorts mat lo!
                  </p>
                </div>
                <div className="p-3.5 rounded bg-[#131722] border border-[#2a2e39] space-y-1.5">
                  <span className="text-xs font-bold text-amber-400">2. PRICE ↑ + OI ↓ (SHORT SQUEEZE ONLY)</span>
                  <p className="text-xs text-neutral-300">
                    Sellers liquidate ho rahe hain, koi naya buyer nahi hai. <strong>Trade:</strong> Top par profit book karein, reversal ki taiyari karein.
                  </p>
                </div>
                <div className="p-3.5 rounded bg-[#131722] border border-[#2a2e39] space-y-1.5">
                  <span className="text-xs font-bold text-rose-400">3. PRICE ↓ + OI ↑ (AGGRESSIVE SHORT BUILDUP)</span>
                  <p className="text-xs text-neutral-300">
                    Whales aggressive shorts enter kar rahi hain. <strong>Trade:</strong> Sell on every pullback, long bilkul mat lo!
                  </p>
                </div>
                <div className="p-3.5 rounded bg-[#131722] border border-[#2a2e39] space-y-1.5">
                  <span className="text-xs font-bold text-sky-400">4. PRICE ↓ + OI ↓ (LONG LIQUIDATION CAPITULATION)</span>
                  <p className="text-xs text-neutral-300">
                    Retail longs liquidate ho gaye, leverage clean ho gaya. <strong>Trade:</strong> Yahan se bottom reversal aata hai, Golden Long Opportunity!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOMINANCE & ABSORPTION */}
          {activeTab === 'DOMINANCE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 4. Order Dominance & Absorption Tracker
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Right sidebar me <strong>BUY ORDERS vs SELL ORDERS</strong> ka live count aur <strong>TAPE SPEED (TPS)</strong> dikhata hai.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded bg-[#131722] border border-emerald-900/40 space-y-1.5">
                  <div className="text-xs font-bold text-emerald-400">VERDICT: AGGRESSIVE BUYER DOMINANCE & TPS &gt; 60</div>
                  <p className="text-xs text-neutral-300">
                    Jab Buy Orders 60% se upar ho aur tape speed 60+ TPS ho jaye, to breakout trigger hota hai. Is time market order se instant long chase kiya ja sakta hai.
                  </p>
                </div>
                <div className="p-3.5 rounded bg-[#131722] border border-rose-900/40 space-y-1.5">
                  <div className="text-xs font-bold text-rose-400">VERDICT: AGGRESSIVE SELLER DOMINANCE & TPS &gt; 60</div>
                  <p className="text-xs text-neutral-300">
                    Jab Sell orders 60%+ dominate karein aur tape accelerate ho, to heavy selling dump expected hota hai. Stop losses tighten karein ya short enter karein.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIQUIDITY WALLS & SPOOFING */}
          {activeTab === 'WALLS' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-sky-400 mb-1 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> 5. Liquidity Walls & Spoofing Radar
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Chart par dotted green aur red price lines deep institutional limit walls ($1M+ se $20M+) dikhati hain.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded bg-[#131722] border border-[#2a2e39] space-y-1.5">
                  <span className="text-xs font-bold text-emerald-400">REAL WALL BOUNCE TRADE:</span>
                  <p className="text-xs text-neutral-300">
                    Jab price kisi <strong>Green Bid Wall ($5M+)</strong> ko touch kare aur absorption sound play ho, to us wall ke thik upar Buy limit order lagayein, aur apna <strong>Stop Loss wall ke $10-$20 niche</strong> rakhein!
                  </p>
                </div>
                <div className="p-3.5 rounded bg-[#131722] border border-amber-900/40 space-y-1.5">
                  <span className="text-xs font-bold text-amber-400">FAKE SPOOF ORDER ALERT:</span>
                  <p className="text-xs text-neutral-300">
                    Agar <strong>Spoof Velocity Alarm</strong> bajta hai aur orderbook se bada sell wall achanak gayab ho jata hai, iska matlab whales ne fake sell wall laga kar retail ko daraya tha. Ab market rockets ki tarah UP jayega!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WHALE RADAR */}
          {activeTab === 'WHALE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-800/40">
                <h3 className="text-base font-bold text-amber-400 mb-1 flex items-center gap-2">
                  <Target className="w-4 h-4" /> 6. Institutional Whale Radar Execution
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Top par jab <strong>WHALE RADAR BANNER</strong> trigger hota hai aur chart par Whale Arrow marker lagta hai, to institutional size orders detect hote hain.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-700 space-y-2">
                <div className="text-xs font-bold text-sky-400">WHALE TRADE RULES:</div>
                <ul className="text-xs text-neutral-300 space-y-2 list-disc list-inside">
                  <li><strong>Follow the Whale:</strong> Banner me automatically <strong>Entry Price</strong>, <strong>Take Profit (1:3 RR)</strong> aur <strong>Stop Loss</strong> generate hota hai.</li>
                  <li><strong>Confirmation:</strong> Check karein ki Whale BUY signal ke sath CVD bhi green ho aur Price Pressure &gt; 50 ho. Agar tino match karte hain, to 95% win-rate trade setup hota hai!</li>
                  <li><strong>Exit Rule:</strong> Take Profit target hit hone par ya stop loss hit hone par strictly exit karein.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 7: QUICK CHEAT SHEET */}
          {activeTab === 'CHEAT_SHEET' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white mb-2">QUICK INSTITUTIONAL ACTION CHEAT SHEET</h3>
              <div className="overflow-x-auto rounded-lg border border-[#2a2e39]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#131722] text-neutral-400 border-b border-[#2a2e39]">
                    <tr>
                      <th className="p-3">TOOL / METRIC</th>
                      <th className="p-3 text-emerald-400">BUY (LONG) SIGNAL</th>
                      <th className="p-3 text-rose-400">SELL (SHORT) SIGNAL</th>
                      <th className="p-3 text-amber-400">EXIT / TAKE PROFIT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2e39] text-neutral-300">
                    <tr>
                      <td className="p-3 font-semibold text-white">Price Pressure (50 EQ)</td>
                      <td className="p-3">Crosses &gt; 50 (Green body)</td>
                      <td className="p-3">Drops &lt; 50 (Red body)</td>
                      <td className="p-3">Crosses back through 50 or reaches 90+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">CVD Delta Balance</td>
                      <td className="p-3">Bullish Absorption (Price LL, CVD HL)</td>
                      <td className="p-3">Bearish Divergence (Price HH, CVD LH)</td>
                      <td className="p-3">Delta flips opposite for 3 consecutive bars</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Open Interest (OI)</td>
                      <td className="p-3">OI Liquidation Flush + Price Bounce</td>
                      <td className="p-3">OI Drop on Price Rise (Exhaustion)</td>
                      <td className="p-3">Funding Rate exceeds +0.06%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Order Dominance</td>
                      <td className="p-3">Buy Orders &gt; 60% with TPS &gt; 50</td>
                      <td className="p-3">Sell Orders &gt; 60% with TPS &gt; 50</td>
                      <td className="p-3">Dominance returns to 50/50 balance</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Liquidity Walls</td>
                      <td className="p-3">Bounce off Green Bid Wall ($5M+)</td>
                      <td className="p-3">Rejection from Red Ask Wall ($5M+)</td>
                      <td className="p-3">Wall gets completely broken or swept</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Whale Radar</td>
                      <td className="p-3">Whale Buy Block Alert (&gt;$500k)</td>
                      <td className="p-3">Whale Sell Dump Alert (&gt;$500k)</td>
                      <td className="p-3">1:3.1 Risk-Reward Target reached</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131722] border-t border-[#2a2e39] flex items-center justify-between text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Always wait for minimum 2-3 Confluence indicators before placing order.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors"
          >
            I UNDERSTAND - START TRADING
          </button>
        </div>
      </div>
    </div>
  );
};
