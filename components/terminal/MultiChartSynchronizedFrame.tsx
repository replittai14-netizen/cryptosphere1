'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  UTCTimestamp,
  Time,
  createSeriesMarkers,
  ISeriesMarkersPluginApi,
} from 'lightweight-charts';
import {
  Candle,
  LiquidityWall,
  LiquidationCluster,
  POI,
  TerminalToggles,
  TerminalLayoutMode,
  WhaleTradeSignal,
  DivergenceSignal,
} from '@/types/orderflow';
import { ThreeGravitationalCanvas } from './ThreeGravitationalCanvas';
import { DivergenceVisualizerHUD } from './DivergenceVisualizerHUD';
import { Plus, Minus, RotateCcw, Maximize2, Minimize2, HelpCircle } from 'lucide-react';

interface MultiChartSynchronizedFrameProps {
  candles: Candle[];
  liquidityWalls: LiquidityWall[];
  liquidationClusters: LiquidationCluster[];
  activePOIs: POI[];
  toggles: TerminalToggles;
  symbol: string;
  currentPrice: number;
  layoutMode: TerminalLayoutMode;
  onToggleLayoutMode: (mode: TerminalLayoutMode) => void;
  latestWhaleSignal?: WhaleTradeSignal | null;
  divergences?: DivergenceSignal[];
  onOpenGuide?: (tab?: 'PRESSURE' | 'CVD' | 'OI' | 'DOMINANCE' | 'WALLS' | 'WHALE') => void;
}

const TV_THEME = {
  bg: '#131722',
  grid: 'rgba(255, 255, 255, 0.04)',
  panelBorder: '#2a2e39',
  scaleText: '#787b86',
  crosshair: '#787b86',
  bullish: '#089981',
  bearish: '#f23645',
};

const getCommonChartOptions = (container: HTMLElement, height: number, showTimeAxis: boolean) => ({
  width: container.clientWidth || 800,
  height: height > 0 ? height : 240,
  layout: {
    background: { type: ColorType.Solid, color: TV_THEME.bg },
    textColor: TV_THEME.scaleText,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, monospace',
    fontSize: 11,
  },
  grid: {
    vertLines: { color: TV_THEME.grid, style: LineStyle.Dotted },
    horzLines: { color: TV_THEME.grid, style: LineStyle.Dotted },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
    vertLine: { color: TV_THEME.crosshair, style: LineStyle.Dashed, labelBackgroundColor: '#2a2e39' },
    horzLine: { color: TV_THEME.crosshair, style: LineStyle.Dashed, labelBackgroundColor: '#2a2e39' },
  },
  rightPriceScale: {
    borderColor: TV_THEME.panelBorder,
    visible: true,
    autoScale: true,
  },
  timeScale: {
    borderColor: TV_THEME.panelBorder,
    visible: showTimeAxis,
    timeVisible: true,
    secondsVisible: false,
    rightOffset: 12,
    barSpacing: 9,
    minBarSpacing: 0.5,
    fixLeftEdge: false,
    fixRightEdge: false,
    lockVisibleTimeRangeOnResize: false,
    shiftVisibleRangeOnNewBar: true,
  },
  handleScroll: {
    mouseWheel: true,
    pressedMouseMove: true,
    horzTouchDrag: true,
    vertTouchDrag: true,
  },
  handleScale: {
    axisPressedMouseMove: {
      time: true,
      price: true,
    },
    mouseWheel: true,
    pinch: true,
  },
});

export const MultiChartSynchronizedFrame: React.FC<MultiChartSynchronizedFrameProps> = ({
  candles,
  liquidityWalls,
  activePOIs,
  toggles,
  symbol,
  currentPrice,
  layoutMode,
  latestWhaleSignal,
  divergences,
  onOpenGuide,
}) => {
  const [maximizedChart, setMaximizedChart] = useState<'PRICE' | 'PRESSURE' | 'CVD' | 'OI' | null>(null);

  // Containers
  const priceContainerRef = useRef<HTMLDivElement>(null);
  const pressureContainerRef = useRef<HTMLDivElement>(null);
  const cvdContainerRef = useRef<HTMLDivElement>(null);
  const oiContainerRef = useRef<HTMLDivElement>(null);

  // Chart APIs
  const priceChartRef = useRef<IChartApi | null>(null);
  const pressureChartRef = useRef<IChartApi | null>(null);
  const cvdChartRef = useRef<IChartApi | null>(null);
  const oiChartRef = useRef<IChartApi | null>(null);

  // Series APIs
  const priceSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const pressureSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const cvdSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const subDeltaSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const oiSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const markersPluginRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const priceLinesRef = useRef<any[]>([]);

  const [hoveredData, setHoveredData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    delta: number;
    time: number;
  } | null>(null);

  const [priceDimensions, setPriceDimensions] = useState({ width: 800, height: 450 });

  const candlesRef = useRef<Candle[]>(candles);
  useEffect(() => {
    candlesRef.current = candles;
  }, [candles]);

  // Transform and strictly validate candle data for all 4 charts
  const chartData = useMemo(() => {
    const map = new Map<number, Candle>();
    candles.forEach((c) => {
      const sec = Math.floor(c.time / 1000);
      map.set(sec, c);
    });

    const sorted = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);

    // 1. Price candles
    const priceList = sorted
      .map(([sec, c]) => {
        const o = Number(c.open);
        const cl = Number(c.close);
        const rawH = Number(c.high);
        const rawL = Number(c.low);
        const h = Math.max(o, cl, !isNaN(rawH) ? rawH : Math.max(o, cl));
        const l = Math.min(o, cl, !isNaN(rawL) ? rawL : Math.min(o, cl));
        return {
          time: sec as UTCTimestamp,
          open: o,
          high: h,
          low: l,
          close: cl,
        };
      })
      .filter((d) => !isNaN(d.open) && !isNaN(d.close));

    // 2. Volume histogram
    const volumeList = sorted.map(([sec, c]) => ({
      time: sec as UTCTimestamp,
      value: Number(c.volume) || 0,
      color: c.close >= c.open ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)',
    }));

    // 3. Pressure candles (0 - 100 scale)
    const pressureList = sorted
      .map(([sec, c]) => {
        const o = typeof c.pressureOpen === 'number' && !isNaN(c.pressureOpen) ? c.pressureOpen : 50;
        const cl = typeof c.pressureClose === 'number' && !isNaN(c.pressureClose) ? c.pressureClose : 50;
        const rawH = typeof c.pressureHigh === 'number' && !isNaN(c.pressureHigh) ? c.pressureHigh : Math.max(o, cl) + 3;
        const rawL = typeof c.pressureLow === 'number' && !isNaN(c.pressureLow) ? c.pressureLow : Math.min(o, cl) - 3;
        const h = Math.min(100, Math.max(o, cl, rawH));
        const l = Math.max(0, Math.min(o, cl, rawL));
        return {
          time: sec as UTCTimestamp,
          open: o,
          high: h,
          low: l,
          close: cl,
        };
      })
      .filter((d) => !isNaN(d.open) && !isNaN(d.close));

    // 4. CVD candles
    const cvdList = sorted
      .map(([sec, c]) => {
        const o = typeof c.cvdOpen === 'number' && !isNaN(c.cvdOpen) ? c.cvdOpen : c.cumulativeDelta || 0;
        const cl = typeof c.cvdClose === 'number' && !isNaN(c.cvdClose) ? c.cvdClose : c.cumulativeDelta || 0;
        const swing = Math.max(1, Math.abs(cl - o));
        const rawH = typeof c.cvdHigh === 'number' && !isNaN(c.cvdHigh) ? c.cvdHigh : Math.max(o, cl) + swing * 0.25;
        const rawL = typeof c.cvdLow === 'number' && !isNaN(c.cvdLow) ? c.cvdLow : Math.min(o, cl) - swing * 0.25;
        const h = Math.max(o, cl, rawH);
        const l = Math.min(o, cl, rawL);
        return {
          time: sec as UTCTimestamp,
          open: o,
          high: h,
          low: l,
          close: cl,
        };
      })
      .filter((d) => !isNaN(d.open) && !isNaN(d.close));

    // 5. Sub-bar Delta histogram
    const subDeltaList = sorted.map(([sec, c]) => ({
      time: sec as UTCTimestamp,
      value: typeof c.delta === 'number' && !isNaN(c.delta) ? c.delta : 0,
      color: (c.delta || 0) >= 0 ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)',
    }));

    // 6. OI candles
    const oiList = sorted
      .map(([sec, c]) => {
        const o = typeof c.oiOpen === 'number' && !isNaN(c.oiOpen) ? c.oiOpen : c.oi || 150000000;
        const cl = typeof c.oiClose === 'number' && !isNaN(c.oiClose) ? c.oiClose : c.oi || 150000000;
        const swing = Math.max(1000, Math.abs(cl - o));
        const rawH = typeof c.oiHigh === 'number' && !isNaN(c.oiHigh) ? c.oiHigh : Math.max(o, cl) + swing * 0.3;
        const rawL = typeof c.oiLow === 'number' && !isNaN(c.oiLow) ? c.oiLow : Math.min(o, cl) - swing * 0.3;
        const h = Math.max(o, cl, rawH);
        const l = Math.min(o, cl, rawL);
        return {
          time: sec as UTCTimestamp,
          open: o,
          high: h,
          low: l,
          close: cl,
        };
      })
      .filter((d) => !isNaN(d.open) && !isNaN(d.close));

    return {
      priceList,
      volumeList,
      pressureList,
      cvdList,
      subDeltaList,
      oiList,
      lastCandle: sorted.length > 0 ? sorted[sorted.length - 1][1] : null,
    };
  }, [candles]);

  // Synchronize logical range across all charts
  const setupSynchronization = useCallback(() => {
    const charts: IChartApi[] = [];
    if (priceChartRef.current) charts.push(priceChartRef.current);
    if (pressureChartRef.current) charts.push(pressureChartRef.current);
    if (cvdChartRef.current) charts.push(cvdChartRef.current);
    if (oiChartRef.current) charts.push(oiChartRef.current);

    if (charts.length < 2) return;

    let isSyncing = false;
    charts.forEach((chart) => {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (isSyncing || !range) return;
        isSyncing = true;
        charts.forEach((other) => {
          if (other !== chart) {
            try {
              other.timeScale().setVisibleLogicalRange(range);
            } catch {}
          }
        });
        isSyncing = false;
      });
    });
  }, []);

  // 1. Initialize Primary TradingView Price Chart
  useEffect(() => {
    if (!priceContainerRef.current) return;
    const container = priceContainerRef.current;

    const chart = createChart(container, {
      ...getCommonChartOptions(container, container.clientHeight || 300, true),
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: TV_THEME.bullish,
      downColor: TV_THEME.bearish,
      borderVisible: true,
      borderUpColor: TV_THEME.bullish,
      borderDownColor: TV_THEME.bearish,
      wickUpColor: TV_THEME.bullish,
      wickDownColor: TV_THEME.bearish,
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData) {
        const data = param.seriesData.get(candleSeries) as any;
        if (data) {
          const matchCandle = candlesRef.current.find((c) => Math.floor(c.time / 1000) === (param.time as number));
          setHoveredData({
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: matchCandle?.volume || 0,
            delta: matchCandle?.delta || (data.close - data.open),
            time: (param.time as number) * 1000,
          });
        }
      } else {
        setHoveredData(null);
      }
    });

    // Populate data immediately if available
    if (chartData.priceList.length > 0) {
      candleSeries.setData(chartData.priceList);
    }
    if (chartData.volumeList.length > 0) {
      volSeries.setData(chartData.volumeList);
    }

    priceChartRef.current = chart;
    priceSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volSeries;

    const handleResize = () => {
      if (container && chart && container.clientWidth > 0 && container.clientHeight > 0) {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
        setPriceDimensions({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    setupSynchronization();

    return () => {
      observer.disconnect();
      chart.remove();
      priceChartRef.current = null;
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, [setupSynchronization]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Initialize Cumulative Price Pressure Chart
  useEffect(() => {
    if (!pressureContainerRef.current) return;
    const container = pressureContainerRef.current;

    const chart = createChart(container, {
      ...getCommonChartOptions(container, container.clientHeight || 240, true),
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: TV_THEME.bullish,
      downColor: TV_THEME.bearish,
      borderVisible: true,
      borderUpColor: TV_THEME.bullish,
      borderDownColor: TV_THEME.bearish,
      wickUpColor: TV_THEME.bullish,
      wickDownColor: TV_THEME.bearish,
    });

    series.createPriceLine({
      price: 50,
      color: '#38bdf8',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: '50 EQUILIBRIUM',
    });

    // Populate data immediately if available
    if (chartData.pressureList.length > 0) {
      series.setData(chartData.pressureList);
    }

    pressureChartRef.current = chart;
    pressureSeriesRef.current = series;

    const handleResize = () => {
      if (container && chart && container.clientWidth > 0 && container.clientHeight > 0) {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    setupSynchronization();

    return () => {
      observer.disconnect();
      chart.remove();
      pressureChartRef.current = null;
      pressureSeriesRef.current = null;
    };
  }, [setupSynchronization]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Initialize Cumulative Volume Delta (CVD) Chart
  useEffect(() => {
    if (!cvdContainerRef.current) return;
    const container = cvdContainerRef.current;

    const chart = createChart(container, {
      ...getCommonChartOptions(container, container.clientHeight || 240, true),
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: TV_THEME.bullish,
      downColor: TV_THEME.bearish,
      borderVisible: true,
      borderUpColor: TV_THEME.bullish,
      borderDownColor: TV_THEME.bearish,
      wickUpColor: TV_THEME.bullish,
      wickDownColor: TV_THEME.bearish,
    });

    const subDeltaSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: '',
    });
    subDeltaSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    // Populate data immediately if available
    if (chartData.cvdList.length > 0) {
      series.setData(chartData.cvdList);
    }
    if (chartData.subDeltaList.length > 0) {
      subDeltaSeries.setData(chartData.subDeltaList);
    }

    cvdChartRef.current = chart;
    cvdSeriesRef.current = series;
    subDeltaSeriesRef.current = subDeltaSeries;

    const handleResize = () => {
      if (container && chart && container.clientWidth > 0 && container.clientHeight > 0) {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    setupSynchronization();

    return () => {
      observer.disconnect();
      chart.remove();
      cvdChartRef.current = null;
      cvdSeriesRef.current = null;
      subDeltaSeriesRef.current = null;
    };
  }, [setupSynchronization]); // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Initialize Open Interest (OI) Chart
  useEffect(() => {
    if (!oiContainerRef.current) return;
    const container = oiContainerRef.current;

    const chart = createChart(container, {
      ...getCommonChartOptions(container, container.clientHeight || 240, true),
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: TV_THEME.bullish,
      downColor: TV_THEME.bearish,
      borderVisible: true,
      borderUpColor: TV_THEME.bullish,
      borderDownColor: TV_THEME.bearish,
      wickUpColor: TV_THEME.bullish,
      wickDownColor: TV_THEME.bearish,
    });

    // Populate data immediately if available
    if (chartData.oiList.length > 0) {
      series.setData(chartData.oiList);
    }

    oiChartRef.current = chart;
    oiSeriesRef.current = series;

    const handleResize = () => {
      if (container && chart && container.clientWidth > 0 && container.clientHeight > 0) {
        chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    setupSynchronization();

    return () => {
      observer.disconnect();
      chart.remove();
      oiChartRef.current = null;
      oiSeriesRef.current = null;
    };
  }, [setupSynchronization]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update Data across all series whenever chartData changes
  useEffect(() => {
    if (priceSeriesRef.current && chartData.priceList.length > 0) {
      priceSeriesRef.current.setData(chartData.priceList);
    }
    if (volumeSeriesRef.current && chartData.volumeList.length > 0) {
      volumeSeriesRef.current.setData(chartData.volumeList);
    }
    if (pressureSeriesRef.current && chartData.pressureList.length > 0) {
      pressureSeriesRef.current.setData(chartData.pressureList);
    }
    if (cvdSeriesRef.current && chartData.cvdList.length > 0) {
      cvdSeriesRef.current.setData(chartData.cvdList);
    }
    if (subDeltaSeriesRef.current && chartData.subDeltaList.length > 0) {
      subDeltaSeriesRef.current.setData(chartData.subDeltaList);
    }
    if (oiSeriesRef.current && chartData.oiList.length > 0) {
      oiSeriesRef.current.setData(chartData.oiList);
    }

    // Attach Whale and Divergence Markers on Primary Chart
    const priceMarkers: any[] = [];

    if (toggles.divergenceRadar && divergences && divergences.length > 0) {
      divergences.forEach((d) => {
        const sec = Math.floor(d.toTimestamp / 1000) as UTCTimestamp;
        const isBull = d.direction === 'BULLISH';
        priceMarkers.push({
          time: sec,
          position: isBull ? ('belowBar' as const) : ('aboveBar' as const),
          color: isBull ? '#089981' : '#f23645',
          shape: isBull ? ('arrowUp' as const) : ('arrowDown' as const),
          text: d.category === 'PRICE_VS_PRESSURE'
            ? (isBull ? '▲ BULL DIV (PRESSURE HL)' : '▼ BEAR DIV (PRESSURE LH)')
            : (isBull ? '▲ ICEBERG BID WALL' : '▼ ICEBERG ASK WALL'),
        });
      });
    }

    if (latestWhaleSignal && latestWhaleSignal.symbol === symbol && chartData.lastCandle) {
      const isBuy = latestWhaleSignal.side === 'BUY';
      const lastSec = Math.floor(chartData.lastCandle.time / 1000) as UTCTimestamp;
      priceMarkers.push({
        time: lastSec,
        position: isBuy ? ('belowBar' as const) : ('aboveBar' as const),
        color: isBuy ? '#089981' : '#f23645',
        shape: isBuy ? ('arrowUp' as const) : ('arrowDown' as const),
        text: `WHALE ${latestWhaleSignal.side} $${(latestWhaleSignal.sizeUSDT / 1000000).toFixed(1)}M`,
      });
    }

    priceMarkers.sort((a, b) => (a.time as number) - (b.time as number));

    if (priceSeriesRef.current && priceMarkers.length > 0) {
      if (!markersPluginRef.current) {
        markersPluginRef.current = createSeriesMarkers(priceSeriesRef.current, priceMarkers);
      } else {
        markersPluginRef.current.setMarkers(priceMarkers);
      }
    }
  }, [chartData, latestWhaleSignal, symbol, divergences, toggles.divergenceRadar]);

  // Update Liquidity Walls as native PriceLines
  useEffect(() => {
    if (!priceSeriesRef.current) return;
    const series = priceSeriesRef.current;

    priceLinesRef.current.forEach((pl) => {
      try {
        series.removePriceLine(pl);
      } catch {}
    });
    priceLinesRef.current = [];

    if (toggles.liquidityWalls && liquidityWalls.length > 0) {
      liquidityWalls.slice(0, 8).forEach((w) => {
        const isBid = w.side === 'bid';
        const pl = series.createPriceLine({
          price: w.price,
          color: isBid ? '#089981' : '#f23645',
          lineWidth: w.isBeingTested ? 2 : 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `${isBid ? 'BID' : 'ASK'} $${(w.sizeUSDT / 1000000).toFixed(1)}M`,
        });
        priceLinesRef.current.push(pl);
      });
    }
  }, [liquidityWalls, toggles.liquidityWalls]);

  // Determine visibility of each chart panel
  const showPrice = maximizedChart === null ? true : maximizedChart === 'PRICE';
  const showPressure =
    maximizedChart === 'PRESSURE' ||
    (maximizedChart === null && layoutMode === 'QUAD_MATRIX' && toggles.cumulativePressure);
  const showCVD =
    maximizedChart === 'CVD' ||
    (maximizedChart === null && layoutMode !== 'FULL_CHART' && toggles.cvdSubBar);
  const showOI =
    maximizedChart === 'OI' ||
    (maximizedChart === null && layoutMode === 'QUAD_MATRIX' && toggles.oiFunding);

  // Resize charts whenever visibility, layout, or maximization changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const items = [
        { chart: priceChartRef.current, container: priceContainerRef.current, visible: showPrice },
        { chart: pressureChartRef.current, container: pressureContainerRef.current, visible: showPressure },
        { chart: cvdChartRef.current, container: cvdContainerRef.current, visible: showCVD },
        { chart: oiChartRef.current, container: oiContainerRef.current, visible: showOI },
      ];

      items.forEach(({ chart, container, visible }) => {
        if (chart && container && visible) {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w > 0 && h > 0) {
            chart.applyOptions({ width: w, height: h });
          }
        }
      });
    }, 40);
    return () => clearTimeout(timer);
  }, [maximizedChart, layoutMode, showPrice, showPressure, showCVD, showOI]);

  // Generic Zoom and Pan helpers
  const zoomChart = (chart: IChartApi | null, factor: number) => {
    if (!chart) return;
    const range = chart.timeScale().getVisibleLogicalRange();
    if (range) {
      const span = range.to - range.from;
      const delta = Math.max(1, Math.round(span * factor));
      chart.timeScale().setVisibleLogicalRange({ from: range.from + delta, to: range.to - delta });
    }
  };

  const resetChart = (chart: IChartApi | null) => {
    if (!chart) return;
    chart.timeScale().fitContent();
  };

  const toggleMaximize = (target: 'PRICE' | 'PRESSURE' | 'CVD' | 'OI') => {
    if (maximizedChart === target) {
      setMaximizedChart(null);
    } else {
      setMaximizedChart(target);
    }
  };

  const activeCandle = hoveredData || chartData.lastCandle;

  return (
    <div className="relative flex flex-col w-full h-full select-none overflow-hidden bg-[#131722] border border-[#2a2e39]">
      {/* Live Divergence Radar Banner */}
      {toggles.divergenceRadar && divergences && divergences.length > 0 && (
        <DivergenceVisualizerHUD divergences={divergences} />
      )}

      {/* 1. Primary Candlestick Chart */}
      <div
        className={`relative w-full flex-1 min-h-0 ${showPrice ? 'flex flex-col' : 'hidden'} ${
          showPressure || showCVD || showOI ? 'border-b border-[#2a2e39]' : ''
        }`}
      >
        {/* TradingView Legend HUD */}
        <div className="absolute top-2 left-3 z-30 flex items-center gap-3.5 text-xs font-mono pointer-events-none bg-[#1e222d]/90 px-3 py-1.5 rounded border border-[#2a2e39] backdrop-blur-md shadow-lg">
          <span className="font-bold text-sky-400">{symbol}</span>
          <span>
            O <span className="tabular-nums font-semibold text-white">${activeCandle?.open.toFixed(2)}</span>
          </span>
          <span>
            H <span className="tabular-nums font-semibold text-white">${activeCandle?.high.toFixed(2)}</span>
          </span>
          <span>
            L <span className="tabular-nums font-semibold text-white">${activeCandle?.low.toFixed(2)}</span>
          </span>
          <span>
            C <span className="tabular-nums font-semibold text-white">${activeCandle?.close.toFixed(2)}</span>
          </span>
          <span>
            VOL <span className="tabular-nums font-medium text-neutral-300">{activeCandle?.volume.toLocaleString()}</span>
          </span>
          <span>
            Δ{' '}
            <span
              className={`tabular-nums font-bold ${
                (activeCandle?.delta || 0) >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {(activeCandle?.delta || 0) >= 0 ? '+' : ''}
              {(activeCandle?.delta || 0).toFixed(1)}
            </span>
          </span>
        </div>

        {/* Floating Price Controls */}
        <div className="absolute top-2 right-[85px] z-30 flex items-center gap-1 bg-[#1e222d]/90 p-1 rounded border border-[#2a2e39] shadow-md backdrop-blur-md">
          <button
            onClick={() => zoomChart(priceChartRef.current, 0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white transition-colors"
            title="Zoom In (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomChart(priceChartRef.current, -0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white transition-colors"
            title="Zoom Out (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => resetChart(priceChartRef.current)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white transition-colors"
            title="Reset View / Auto-Fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => toggleMaximize('PRICE')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-bold ${
              maximizedChart === 'PRICE'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-[#131722] hover:bg-[#2a2e39] text-neutral-300'
            }`}
            title="Maximize Price Chart to Full Screen"
          >
            {maximizedChart === 'PRICE' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{maximizedChart === 'PRICE' ? 'RESTORE EQUAL' : 'FULL SCREEN'}</span>
          </button>
        </div>

        <div ref={priceContainerRef} className="w-full h-full flex-1" />

        {/* 3D WebGL Gravitational Field & POI Absorption Shockwaves */}
        {(toggles.gravitational3D || toggles.poiAbsorption3D) && (
          <ThreeGravitationalCanvas
            liquidityWalls={liquidityWalls}
            activePOIs={activePOIs}
            currentPrice={currentPrice}
            minPrice={currentPrice * 0.98}
            maxPrice={currentPrice * 1.02}
            width={priceDimensions.width}
            height={priceDimensions.height}
            showGravitational={toggles.gravitational3D}
            showAbsorption={toggles.poiAbsorption3D}
          />
        )}
      </div>

      {/* 2. Cumulative Price Pressure Candlestick Chart */}
      <div
        className={`relative w-full flex-1 min-h-0 ${showPressure ? 'flex flex-col' : 'hidden'} ${
          showCVD || showOI ? 'border-b border-[#2a2e39]' : ''
        }`}
      >
        <div className="absolute top-2 left-3 z-20 flex items-center gap-2 text-xs font-mono pointer-events-none text-neutral-400 bg-[#1e222d]/90 px-2.5 py-1 rounded border border-[#2a2e39] shadow-sm">
          <span className="font-bold text-sky-400">CUMULATIVE PRICE PRESSURE</span>
          <span className="text-neutral-500">|</span>
          <span>
            STATUS:{' '}
            <span
              className={
                (chartData.lastCandle?.pressureClose || 50) >= 50
                  ? 'text-[#089981] font-bold'
                  : 'text-[#f23645] font-bold'
              }
            >
              {(chartData.lastCandle?.pressureClose || 50) >= 50 ? 'BULLISH AGGRESSION' : 'BEARISH SUPPRESSION'} (
              {chartData.lastCandle?.pressureClose || 50}/100)
            </span>
          </span>
        </div>

        <div className="absolute top-2 right-[85px] z-20 flex items-center gap-1 bg-[#1e222d]/90 p-1 rounded border border-[#2a2e39] shadow-md">
          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('PRESSURE')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 hover:bg-[#2a2e39] transition-colors"
              title="Learn how to trade using Price Pressure"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">GUIDE</span>
            </button>
          )}
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => zoomChart(pressureChartRef.current, 0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="Pressure Zoom In (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomChart(pressureChartRef.current, -0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="Pressure Zoom Out (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => resetChart(pressureChartRef.current)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="Pressure Auto-Fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => toggleMaximize('PRESSURE')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-bold ${
              maximizedChart === 'PRESSURE'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-[#131722] hover:bg-[#2a2e39] text-neutral-300'
            }`}
            title="Toggle Pressure Chart Full Screen"
          >
            {maximizedChart === 'PRESSURE' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{maximizedChart === 'PRESSURE' ? 'RESTORE EQUAL' : 'FULL SCREEN'}</span>
          </button>
        </div>

        <div ref={pressureContainerRef} className="w-full h-full flex-1" />
      </div>

      {/* 3. Cumulative Sub-Bar Directional Balance (CVD) Candlestick Chart */}
      <div
        className={`relative w-full flex-1 min-h-0 ${showCVD ? 'flex flex-col' : 'hidden'} ${
          showOI ? 'border-b border-[#2a2e39]' : ''
        }`}
      >
        <div className="absolute top-2 left-3 z-20 flex items-center gap-2 text-xs font-mono pointer-events-none text-neutral-400 bg-[#1e222d]/90 px-2.5 py-1 rounded border border-[#2a2e39] shadow-sm">
          <span className="font-bold text-sky-400">CVD & SUB-BAR DELTA BALANCE</span>
          <span className="text-neutral-500">|</span>
          <span>
            NET CVD:{' '}
            <span
              className={
                (chartData.lastCandle?.cvdClose || 0) >= (chartData.lastCandle?.cvdOpen || 0)
                  ? 'text-[#089981] font-bold'
                  : 'text-[#f23645] font-bold'
              }
            >
              {(chartData.lastCandle?.cvdClose || 0).toFixed(0)} Δ
            </span>
          </span>
        </div>

        <div className="absolute top-2 right-[85px] z-20 flex items-center gap-1 bg-[#1e222d]/90 p-1 rounded border border-[#2a2e39] shadow-md">
          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('CVD')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 hover:bg-[#2a2e39] transition-colors"
              title="Learn how to trade CVD divergences & absorption"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">GUIDE</span>
            </button>
          )}
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => zoomChart(cvdChartRef.current, 0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="CVD Zoom In (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomChart(cvdChartRef.current, -0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="CVD Zoom Out (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => resetChart(cvdChartRef.current)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="CVD Auto-Fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => toggleMaximize('CVD')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-bold ${
              maximizedChart === 'CVD'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-[#131722] hover:bg-[#2a2e39] text-neutral-300'
            }`}
            title="Toggle CVD Chart Full Screen"
          >
            {maximizedChart === 'CVD' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{maximizedChart === 'CVD' ? 'RESTORE EQUAL' : 'FULL SCREEN'}</span>
          </button>
        </div>

        <div ref={cvdContainerRef} className="w-full h-full flex-1" />
      </div>

      {/* 4. Open Interest (OI) & Funding Rate Candlestick Chart */}
      <div className={`relative w-full flex-1 min-h-0 ${showOI ? 'flex flex-col' : 'hidden'}`}>
        <div className="absolute top-2 left-3 z-20 flex items-center gap-2 text-xs font-mono pointer-events-none text-neutral-400 bg-[#1e222d]/90 px-2.5 py-1 rounded border border-[#2a2e39] shadow-sm">
          <span className="font-bold text-sky-400">OPEN INTEREST (OI)</span>
          <span className="text-neutral-500">|</span>
          <span>
            OI:{' '}
            <span
              className={
                (chartData.lastCandle?.oiClose || 0) >= (chartData.lastCandle?.oiOpen || 0)
                  ? 'text-[#089981] font-bold'
                  : 'text-[#f23645] font-bold'
              }
            >
              ${((chartData.lastCandle?.oiClose || 0) / 1000000).toFixed(2)}M
            </span>
          </span>
          <span className="text-neutral-500">·</span>
          <span>
            FUNDING:{' '}
            <span className="text-emerald-400">
              +{(((chartData.lastCandle?.fundingRate || 0.0001) * 100)).toFixed(4)}%
            </span>
          </span>
        </div>

        <div className="absolute top-2 right-[85px] z-20 flex items-center gap-1 bg-[#1e222d]/90 p-1 rounded border border-[#2a2e39] shadow-md">
          {onOpenGuide && (
            <button
              onClick={() => onOpenGuide('OI')}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-300 hover:bg-[#2a2e39] transition-colors"
              title="Learn how to trade using Open Interest"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">GUIDE</span>
            </button>
          )}
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => zoomChart(oiChartRef.current, 0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="OI Zoom In (+)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomChart(oiChartRef.current, -0.15)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="OI Zoom Out (-)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => resetChart(oiChartRef.current)}
            className="p-1 hover:bg-[#2a2e39] rounded text-neutral-300 hover:text-white"
            title="OI Auto-Fit"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-[1px] h-3.5 bg-[#2a2e39] mx-0.5" />
          <button
            onClick={() => toggleMaximize('OI')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors font-bold ${
              maximizedChart === 'OI'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-[#131722] hover:bg-[#2a2e39] text-neutral-300'
            }`}
            title="Toggle OI Chart Full Screen"
          >
            {maximizedChart === 'OI' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            <span>{maximizedChart === 'OI' ? 'RESTORE EQUAL' : 'FULL SCREEN'}</span>
          </button>
        </div>

        <div ref={oiContainerRef} className="w-full h-full flex-1" />
      </div>
    </div>
  );
};
