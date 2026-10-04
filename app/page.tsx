'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Timeframe,
  Candle,
  LiquidityWall,
  LiquidationCluster,
  POI,
  DominanceMetrics,
  SpoofEvent,
  ScreenerItem,
  ConfluenceAlert,
  TerminalToggles,
  ReplayState,
  TerminalLayoutMode,
  WhaleTradeSignal,
} from '@/types/orderflow';
import { binanceService, BinanceTradeTick, BinanceDepthUpdate, BinanceTickerUpdate } from '@/lib/binance-service';
import {
  calculateLiquidityWalls,
  calculateLiquidationClusters,
  detectSmartMoneyConcepts,
  computeDominance,
  detectDivergences,
} from '@/lib/orderflow-math';
import { soundEngine } from '@/lib/sound';

import { TopNavigation } from '@/components/terminal/TopNavigation';
import { UnifiedControlBar } from '@/components/terminal/UnifiedControlBar';
import { BarReplayController } from '@/components/terminal/BarReplayController';
import { MultiChartSynchronizedFrame } from '@/components/terminal/MultiChartSynchronizedFrame';
import { DominanceTracker } from '@/components/terminal/DominanceTracker';
import { TapeVelocityAndSpoofing } from '@/components/terminal/TapeVelocityAndSpoofing';
import { OrderbookDepthHUD } from '@/components/terminal/OrderbookDepthHUD';
import { BinanceScreenerModal } from '@/components/terminal/BinanceScreenerModal';
import { ConfluenceAlertBanner } from '@/components/terminal/ConfluenceAlertBanner';
import { WhaleRadarBanner } from '@/components/terminal/WhaleRadarBanner';
import { TradingGuideModal } from '@/components/terminal/TradingGuideModal';

export default function CryptoSphereTerminal() {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [currentPrice, setCurrentPrice] = useState<number>(85198.0);
  const [priceChange24h, setPriceChange24h] = useState<number>(0.75);
  const [isLiveWs, setIsLiveWs] = useState<boolean>(false);
  const [isScreenerOpen, setIsScreenerOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideDefaultTab, setGuideDefaultTab] = useState<'PRESSURE' | 'CVD' | 'OI' | 'DOMINANCE' | 'WALLS' | 'WHALE'>('PRESSURE');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleOpenGuide = useCallback((tab?: 'PRESSURE' | 'CVD' | 'OI' | 'DOMINANCE' | 'WALLS' | 'WHALE') => {
    if (tab) setGuideDefaultTab(tab);
    setIsGuideOpen(true);
  }, []);

  // Layout mode: default to QUAD_MATRIX so all 4 charts are active on load
  const [layoutMode, setLayoutMode] = useState<TerminalLayoutMode>('QUAD_MATRIX');

  // Whale radar & signal
  const [latestWhale, setLatestWhale] = useState<WhaleTradeSignal | null>(null);

  // Core Data States
  const [allCandles, setAllCandles] = useState<Candle[]>([]);
  const [liquidityWalls, setLiquidityWalls] = useState<LiquidityWall[]>([]);
  const [liquidationClusters, setLiquidationClusters] = useState<LiquidationCluster[]>([]);
  const [activePOIs, setActivePOIs] = useState<POI[]>([]);
  const [dominance, setDominance] = useState<DominanceMetrics>({
    buyingOrdersCount: 1420,
    sellingOrdersCount: 980,
    buyAggressionVolume: 420.5,
    sellAggressionVolume: 280.2,
    dominanceRatio: 59.2,
    tapeSpeedTps: 42,
    verdict: 'AGGRESSIVE BUYER BREAKOUT',
    absorptionStrength: 75,
  });
  const [spoofs, setSpoofs] = useState<SpoofEvent[]>([]);
  const [screenerItems, setScreenerItems] = useState<ScreenerItem[]>([]);
  const [confluenceAlerts, setConfluenceAlerts] = useState<ConfluenceAlert[]>([]);
  const [divergences, setDivergences] = useState<DivergenceSignal[]>([]);
  const [recentTrades, setRecentTrades] = useState<{ price: number; qty: number; time: number; isBuy: boolean }[]>([]);

  // Toggles for every indicator and layer
  const [toggles, setToggles] = useState<TerminalToggles>({
    footprintOverlay: false,
    liquidityWalls: true,
    gravitational3D: true,
    poiAbsorption3D: true,
    liquidationHeatmap: true,
    cumulativePressure: true,
    cvdSubBar: true,
    oiFunding: true,
    smcBlocks: true,
    vpvrProfile: true,
    spoofVelocity: true,
    confluenceAlerts: true,
    divergenceRadar: true,
    soundEnabled: true,
  });

  // Bar Replay Engine State
  const [replay, setReplay] = useState<ReplayState>({
    isActive: false,
    isPlaying: false,
    currentReplayIndex: 50,
    maxIndex: 80,
    speed: 1,
  });

  const tapeCounterRef = useRef<number>(0);
  const lastTapeCheckRef = useRef<number>(0);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound engine enabled state
  useEffect(() => {
    soundEngine.setEnabled(toggles.soundEnabled);
  }, [toggles.soundEnabled]);

  // Load Initial Data for Symbol & Timeframe
  const loadPairData = useCallback(async (sym: string, tf: Timeframe) => {
    // 1. Fetch live 24h ticker for instant accurate price on header
    const stats = await binanceService.fetchSymbolPriceAndStats(sym);
    if (stats.price) {
      setCurrentPrice(stats.price);
      setPriceChange24h(stats.priceChange24h);
    }

    // 2. Fetch extensive historical candles from beginning to current
    const historical = await binanceService.fetchHistoricalCandles(sym, tf, 1000);
    if (historical.length > 0) {
      setAllCandles(historical);
      const last = historical[historical.length - 1];
      setCurrentPrice(last.close);

      // Derive initial walls, liquidations, POIs, divergences
      const walls = calculateLiquidityWalls(last.close, last.high - last.low);
      setLiquidityWalls(walls);
      setLiquidationClusters(calculateLiquidationClusters(last.close));
      setActivePOIs(detectSmartMoneyConcepts(historical));
      setDominance(computeDominance(historical, 42));
      setDivergences(detectDivergences(historical));

      setReplay((prev) => ({
        ...prev,
        currentReplayIndex: Math.floor(historical.length * 0.75),
        maxIndex: historical.length - 1,
      }));
    }
  }, []);

  // Fetch Screener Data
  const refreshScreener = useCallback(async () => {
    const items = await binanceService.fetchPerpetualScreener();
    setScreenerItems(items);
    const current = items.find((i) => i.symbol === symbol);
    if (current) {
      setPriceChange24h(current.priceChange24h);
      setCurrentPrice(current.price);
    }
  }, [symbol]);

  // Initial Boot
  useEffect(() => {
    let isCancelled = false;
    const initData = async () => {
      await loadPairData(symbol, timeframe);
      if (!isCancelled) {
        await refreshScreener();
      }
    };
    initData();
    return () => {
      isCancelled = true;
    };
  }, [symbol, timeframe, loadPairData, refreshScreener]);

  // Connect to Binance Futures Live WebSocket
  useEffect(() => {
    binanceService.connect(symbol);

    const checkLiveInterval = setInterval(() => {
      setIsLiveWs(binanceService.isLive);
    }, 1500);

    // Subscribe to micro-ticks
    const unsubTick = binanceService.subscribeTick((tick: BinanceTradeTick) => {
      setCurrentPrice(tick.price);
      tapeCounterRef.current++;

      if (Math.random() < 0.2) {
        soundEngine.playTapeTick(!tick.isBuyerMaker);
      }

      setRecentTrades((prev) => [
        { price: tick.price, qty: tick.qty, time: tick.time, isBuy: !tick.isBuyerMaker },
        ...prev.slice(0, 19),
      ]);

      if (!replay.isActive) {
        setAllCandles((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          const lastCandle = { ...updated[updated.length - 1] };

          if (tick.price > lastCandle.high) lastCandle.high = tick.price;
          if (tick.price < lastCandle.low) lastCandle.low = tick.price;
          lastCandle.close = tick.price;
          lastCandle.volume += tick.qty;
          lastCandle.tradesCount++;

          const isBuy = !tick.isBuyerMaker;
          if (isBuy) {
            lastCandle.buyVolume += tick.qty;
            lastCandle.delta += tick.qty;
          } else {
            lastCandle.sellVolume += tick.qty;
            lastCandle.delta -= tick.qty;
          }
          lastCandle.cumulativeDelta += isBuy ? tick.qty : -tick.qty;

          lastCandle.cvdClose = lastCandle.cumulativeDelta;
          lastCandle.cvdHigh = Math.max(lastCandle.cvdOpen, lastCandle.cvdClose, lastCandle.cvdHigh || lastCandle.cvdClose);
          lastCandle.cvdLow = Math.min(lastCandle.cvdOpen, lastCandle.cvdClose, lastCandle.cvdLow || lastCandle.cvdClose);

          const bullRatio = lastCandle.volume > 0 ? lastCandle.buyVolume / lastCandle.volume : 0.5;
          lastCandle.pressureClose = Math.min(95, Math.max(5, Math.round(bullRatio * 100)));
          lastCandle.pressureHigh = Math.max(lastCandle.pressureOpen, lastCandle.pressureClose, lastCandle.pressureHigh || lastCandle.pressureClose);
          lastCandle.pressureLow = Math.min(lastCandle.pressureOpen, lastCandle.pressureClose, lastCandle.pressureLow || lastCandle.pressureClose);

          lastCandle.oiClose = lastCandle.oi;
          lastCandle.oiHigh = Math.max(lastCandle.oiOpen, lastCandle.oiClose, lastCandle.oiHigh || lastCandle.oiClose);
          lastCandle.oiLow = Math.min(lastCandle.oiOpen, lastCandle.oiClose, lastCandle.oiLow || lastCandle.oiClose);

          updated[updated.length - 1] = lastCandle;
          return updated;
        });
      }
    });

    // Subscribe to live 24h ticker updates
    const unsubTicker = binanceService.subscribeTicker((ticker: BinanceTickerUpdate) => {
      setCurrentPrice(ticker.price);
      setPriceChange24h(ticker.priceChange24h);
    });

    // Subscribe to Whale block order detections
    const unsubWhale = binanceService.subscribeWhale((whale: WhaleTradeSignal) => {
      setLatestWhale(whale);
      soundEngine.playConfluenceAlert(whale.side === 'BUY');
    });

    // Subscribe to orderbook depth
    const unsubDepth = binanceService.subscribeDepth((depth: BinanceDepthUpdate) => {
      if (depth.bids.length > 0 && depth.asks.length > 0) {
        setLiquidityWalls((prev) => {
          return prev.map((w) => {
            const isTested = Math.abs(w.price - currentPrice) / currentPrice < 0.002;
            if (isTested && !w.isBeingTested) {
              soundEngine.playLiquiditySweep();
            }
            return {
              ...w,
              isBeingTested: isTested,
            };
          });
        });
      }
    });

    // Subscribe to spoof alerts
    const unsubSpoof = binanceService.subscribeSpoof((sp: SpoofEvent) => {
      setSpoofs((prev) => [sp, ...prev.slice(0, 12)]);
      soundEngine.playSpoofAlarm();
    });

    return () => {
      clearInterval(checkLiveInterval);
      unsubTick();
      unsubTicker();
      unsubWhale();
      unsubDepth();
      unsubSpoof();
      binanceService.disconnect();
    };
  }, [symbol, currentPrice, replay.isActive]);

  // Tape Speed TPS calculation & Periodic Confluence Check (every 1 second)
  useEffect(() => {
    lastTapeCheckRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = (now - lastTapeCheckRef.current) / 1000;
      lastTapeCheckRef.current = now;

      const tps = Math.round(tapeCounterRef.current / (elapsedSec || 1));
      tapeCounterRef.current = 0;

      if (allCandles.length > 0) {
        const dom = computeDominance(allCandles, tps);
        setDominance(dom);
        setDivergences(detectDivergences(allCandles));

        const testedWall = liquidityWalls.find((w) => w.isBeingTested);
        const interactingPOI = activePOIs.find((p) => p.isInteracting);

        if (testedWall && interactingPOI && Math.random() < 0.18) {
          const isBull = testedWall.side === 'bid';
          const newAlert: ConfluenceAlert = {
            id: `conf_${Date.now()}`,
            timestamp: Date.now(),
            type: isBull ? 'MULTI_CONFLUENCE_LONG' : 'MULTI_CONFLUENCE_SHORT',
            symbol,
            price: currentPrice,
            title: isBull ? 'INSTITUTIONAL ABSORPTION (LONG)' : 'LIQUIDITY SWEEP (SHORT)',
            description: `Major ${testedWall.side.toUpperCase()} Wall ($${(testedWall.sizeUSDT / 1000000).toFixed(1)}M) absorbed with aggressive CVD divergence.`,
            score: 95,
            timeString: new Date().toLocaleTimeString(undefined, { hour12: false }),
          };

          setConfluenceAlerts((prev) => [newAlert, ...prev.slice(0, 4)]);
          soundEngine.playConfluenceAlert(isBull);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [allCandles, liquidityWalls, activePOIs, currentPrice, symbol]);

  // Bar Replay Engine Loop
  useEffect(() => {
    if (replay.isActive && replay.isPlaying) {
      const stepInterval = Math.max(100, Math.round(800 / replay.speed));
      replayTimerRef.current = setInterval(() => {
        setReplay((prev) => {
          if (prev.currentReplayIndex >= prev.maxIndex) {
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentReplayIndex: prev.currentReplayIndex + 1 };
        });
      }, stepInterval);
    } else {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    }

    return () => {
      if (replayTimerRef.current) clearInterval(replayTimerRef.current);
    };
  }, [replay.isActive, replay.isPlaying, replay.speed]);

  const displayedCandles = replay.isActive
    ? allCandles.slice(0, Math.min(allCandles.length, replay.currentReplayIndex + 1))
    : allCandles;

  const handleToggle = (key: keyof TerminalToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetPreset = (preset: 'ALL_ON' | 'ORDERFLOW_PURE' | 'SMC_HEATMAP' | 'CLEAN_CHART') => {
    if (preset === 'ALL_ON') {
      setToggles({
        footprintOverlay: true,
        liquidityWalls: true,
        gravitational3D: true,
        poiAbsorption3D: true,
        liquidationHeatmap: true,
        cumulativePressure: true,
        cvdSubBar: true,
        oiFunding: true,
        smcBlocks: true,
        vpvrProfile: true,
        spoofVelocity: true,
        confluenceAlerts: true,
        soundEnabled: true,
      });
    } else if (preset === 'ORDERFLOW_PURE') {
      setToggles({
        footprintOverlay: true,
        liquidityWalls: true,
        gravitational3D: false,
        poiAbsorption3D: false,
        liquidationHeatmap: false,
        cumulativePressure: false,
        cvdSubBar: true,
        oiFunding: true,
        smcBlocks: false,
        vpvrProfile: true,
        spoofVelocity: true,
        confluenceAlerts: true,
        soundEnabled: true,
      });
      setLayoutMode('DUAL_VIEW');
    } else if (preset === 'SMC_HEATMAP') {
      setToggles({
        footprintOverlay: false,
        liquidityWalls: true,
        gravitational3D: true,
        poiAbsorption3D: true,
        liquidationHeatmap: true,
        cumulativePressure: false,
        cvdSubBar: false,
        oiFunding: false,
        smcBlocks: true,
        vpvrProfile: true,
        spoofVelocity: false,
        confluenceAlerts: true,
        soundEnabled: true,
      });
      setLayoutMode('FULL_CHART');
    } else if (preset === 'CLEAN_CHART') {
      setToggles({
        footprintOverlay: false,
        liquidityWalls: false,
        gravitational3D: false,
        poiAbsorption3D: false,
        liquidationHeatmap: false,
        cumulativePressure: false,
        cvdSubBar: false,
        oiFunding: false,
        smcBlocks: false,
        vpvrProfile: false,
        spoofVelocity: false,
        confluenceAlerts: false,
        soundEnabled: false,
      });
      setLayoutMode('FULL_CHART');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentReplayCandle = displayedCandles[displayedCandles.length - 1];

  return (
    <div className="flex flex-col w-screen h-screen bg-[#06080e] text-neutral-100 overflow-hidden font-sans antialiased">
      {/* 1. Institutional Top Navigation */}
      <TopNavigation
        symbol={symbol}
        currentPrice={currentPrice}
        priceChange24h={priceChange24h}
        timeframe={timeframe}
        onSelectTimeframe={(tf) => setTimeframe(tf)}
        onSelectSymbol={(sym) => setSymbol(sym)}
        onOpenScreener={() => setIsScreenerOpen(true)}
        onOpenGuide={() => handleOpenGuide('PRESSURE')}
        isLiveWs={isLiveWs}
        soundEnabled={toggles.soundEnabled}
        onToggleSound={() => handleToggle('soundEnabled')}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        layoutMode={layoutMode}
        onSelectLayoutMode={(m) => setLayoutMode(m)}
      />

      {/* 2. Institutional Whale Radar & Follow Whale Signal Banner */}
      <WhaleRadarBanner
        whaleSignal={latestWhale}
        onDismiss={() => setLatestWhale(null)}
      />

      {/* 3. Layer Toggle Matrix */}
      <UnifiedControlBar
        toggles={toggles}
        onToggle={handleToggle}
        onSetPreset={handleSetPreset}
      />

      {/* 4. Bar Replay Controller */}
      <BarReplayController
        replay={replay}
        onToggleReplay={() => setReplay((prev) => ({ ...prev, isActive: !prev.isActive, isPlaying: false }))}
        onPlayPause={() => setReplay((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))}
        onStepForward={() => setReplay((prev) => ({ ...prev, currentReplayIndex: Math.min(prev.maxIndex, prev.currentReplayIndex + 1) }))}
        onStepBackward={() => setReplay((prev) => ({ ...prev, currentReplayIndex: Math.max(10, prev.currentReplayIndex - 1) }))}
        onScrub={(idx) => setReplay((prev) => ({ ...prev, currentReplayIndex: idx }))}
        onSetSpeed={(s) => setReplay((prev) => ({ ...prev, speed: s }))}
        currentCandleDate={currentReplayCandle ? new Date(currentReplayCandle.time).toLocaleString() : undefined}
      />

      {/* 5. Confluence Alert Banner */}
      {toggles.confluenceAlerts && (
        <ConfluenceAlertBanner
          alerts={confluenceAlerts}
          onDismiss={(id) => setConfluenceAlerts((prev) => prev.filter((a) => a.id !== id))}
        />
      )}

      {/* 6. Master Workspace: Synchronized Frame + Right HUD */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* TradingView Synchronized Multi-Chart Engine */}
        <div className="flex-1 h-full min-w-0 relative">
          <MultiChartSynchronizedFrame
            candles={displayedCandles}
            liquidityWalls={liquidityWalls}
            liquidationClusters={liquidationClusters}
            activePOIs={activePOIs}
            toggles={toggles}
            symbol={symbol}
            currentPrice={currentPrice}
            layoutMode={layoutMode}
            onToggleLayoutMode={setLayoutMode}
            latestWhaleSignal={latestWhale}
            divergences={divergences}
            onOpenGuide={handleOpenGuide}
          />
        </div>

        {/* Right HUD Column (Clean Institutional Dock with Smooth Scroll) */}
        <div className="w-80 xl:w-92 h-full flex flex-col border-l border-[#2a2e39] bg-[#0c1017] overflow-y-auto overscroll-contain divide-y divide-[#2a2e39]">
          {/* Order Dominance & Absorption Tracker */}
          <div className="shrink-0 w-full">
            <DominanceTracker metrics={dominance} />
          </div>

          {/* Tape Velocity & Spoofing Detector */}
          {toggles.spoofVelocity && (
            <div className="shrink-0 w-full">
              <TapeVelocityAndSpoofing spoofs={spoofs} tapeSpeedTps={dominance.tapeSpeedTps} />
            </div>
          )}

          {/* Limit Orderbook Walls & Tape */}
          <div className="shrink-0 w-full min-h-[380px]">
            <OrderbookDepthHUD
              currentPrice={currentPrice}
              liquidityWalls={liquidityWalls}
              recentTrades={recentTrades}
            />
          </div>
        </div>
      </div>

      {/* 7. Binance Perpetual Futures Screener Modal */}
      <BinanceScreenerModal
        isOpen={isScreenerOpen}
        onClose={() => setIsScreenerOpen(false)}
        items={screenerItems}
        onSelectSymbol={(sym) => setSymbol(sym)}
        currentSymbol={symbol}
        onRefresh={refreshScreener}
      />

      {/* 8. Institutional Trading Guide & Strategy Playbook Modal */}
      <TradingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        defaultTab={guideDefaultTab}
      />
    </div>
  );
}
