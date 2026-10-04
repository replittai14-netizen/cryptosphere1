export type Timeframe =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M'
  | '1Y';

export interface FootprintLevel {
  price: number;
  bidVol: number;
  askVol: number;
  totalVol: number;
  delta: number;
  imbalance: 'buy' | 'sell' | 'none';
  isPoc?: boolean;
  isValueArea?: boolean;
}

export interface Candle {
  time: number; // millisecond timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tradesCount: number;
  buyVolume: number;
  sellVolume: number;
  delta: number;
  cumulativeDelta: number;
  // Cumulative Price Pressure Candlestick OHLC (0-100)
  pressureOpen: number;
  pressureHigh: number;
  pressureLow: number;
  pressureClose: number;
  // Cumulative Volume Delta (CVD) Candlestick OHLC
  cvdOpen: number;
  cvdHigh: number;
  cvdLow: number;
  cvdClose: number;
  // Open Interest (OI) Candlestick OHLC
  oiOpen: number;
  oiHigh: number;
  oiLow: number;
  oiClose: number;
  pressureBull: number; // 0 - 100 cumulative buying pressure
  pressureBear: number; // 0 - 100 cumulative selling pressure
  oi: number; // Open Interest in contracts or USD
  fundingRate: number; // instantaneous / 8hr funding rate
  footprint: FootprintLevel[];
}

export interface LiquidityWall {
  id: string;
  price: number;
  sizeUSDT: number;
  orderCount: number;
  side: 'bid' | 'ask';
  strength: number; // 0 to 1
  distancePct: number;
  isBeingTested: boolean;
  pullForce: number; // Gravitational pull vector magnitude
}

export interface POI {
  id: string;
  type: 'POC' | 'VAH' | 'VAL' | 'FVG' | 'ORDER_BLOCK' | 'LIQUIDITY_POOL' | 'EQH' | 'EQL';
  price: number;
  priceHigh?: number;
  priceLow?: number;
  timeStart: number;
  timeEnd?: number;
  mitigated: boolean;
  label: string;
  side?: 'bullish' | 'bearish';
  absorptionCount: number;
  isInteracting: boolean;
}

export interface LiquidationCluster {
  id: string;
  price: number;
  notionalUSDT: number;
  leverage: '10x' | '20x' | '50x' | '100x';
  side: 'long_liq' | 'short_liq'; // long_liq is below price (triggered if price drops), short_liq is above
  density: number; // 0 to 1 intensity
}

export interface DominanceMetrics {
  buyingOrdersCount: number;
  sellingOrdersCount: number;
  buyAggressionVolume: number;
  sellAggressionVolume: number;
  dominanceRatio: number; // Buy % (e.g. 68.4)
  tapeSpeedTps: number; // Trades per second
  verdict: 'ABSORBING SELLS (PASSIVE BID WALL)' | 'ABSORBING BUYS (PASSIVE ASK WALL)' | 'AGGRESSIVE BUYER BREAKOUT' | 'AGGRESSIVE SELLER BREAKOUT' | 'CONSOLIDATION / BALANCED';
  absorptionStrength: number; // 0 to 100
}

export interface SpoofEvent {
  id: string;
  timestamp: number;
  price: number;
  side: 'bid' | 'ask';
  sizeUSDT: number;
  durationMs: number;
  note: string;
}

export interface ScreenerItem {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeSpikeRatio: number;
  netCvd24h: number;
  oiChange24h: number;
  longShortRatio: number;
  volatilityRatio: number;
  orderbookImbalance: number; // -1 to +1
  smartMoneySignal: 'INSTITUTIONAL ACCUMULATION' | 'AGGRESSIVE DISTRIBUTION' | 'SHORT SQUEEZE DETECTED' | 'LONG LIQUIDATION FLUSH' | 'RANGING LIQUIDITY POOL';
}

export interface ConfluenceAlert {
  id: string;
  timestamp: number;
  type: 'MULTI_CONFLUENCE_LONG' | 'MULTI_CONFLUENCE_SHORT' | 'LIQUIDITY_WALL_SWEEP' | 'POI_ABSORPTION_BURST' | 'SPOOF_ORDER_PULLED';
  symbol: string;
  price: number;
  title: string;
  description: string;
  score: number; // Confluence score 0 - 100
  timeString: string;
}

export interface WhaleTradeSignal {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  sizeUSDT: number;
  targetPrice: number;
  stopLossPrice: number;
  riskReward: string;
  reason: string;
  confidence: number; // e.g. 96
  timeString: string;
}

export type DivergenceCategory = 'PRICE_VS_PRESSURE' | 'PRESSURE_VS_CVD';
export type DivergenceType = 'REGULAR_BEARISH' | 'REGULAR_BULLISH' | 'HIDDEN_BULLISH' | 'HIDDEN_BEARISH';

export interface DivergenceSignal {
  id: string;
  category: DivergenceCategory;
  type: DivergenceType;
  direction: 'BULLISH' | 'BEARISH';
  timestamp: number;
  fromTimestamp: number;
  toTimestamp: number;
  price1: number;
  price2: number;
  indicator1: number;
  indicator2: number;
  title: string;
  explanation: string;
  action: string;
  confidence: number;
}

export type TerminalLayoutMode = 'FULL_CHART' | 'DUAL_VIEW' | 'QUAD_MATRIX';

export interface TerminalToggles {
  footprintOverlay: boolean;
  liquidityWalls: boolean;
  gravitational3D: boolean;
  poiAbsorption3D: boolean;
  liquidationHeatmap: boolean;
  cumulativePressure: boolean;
  cvdSubBar: boolean;
  oiFunding: boolean;
  smcBlocks: boolean;
  vpvrProfile: boolean;
  spoofVelocity: boolean;
  confluenceAlerts: boolean;
  divergenceRadar: boolean;
  soundEnabled: boolean;
}

export interface ViewportState {
  startIndex: number;
  endIndex: number;
  zoomLevel: number; // 1 to 100 (where 100 is single candle view)
  panOffset: number;
  crosshairPrice: number | null;
  crosshairTime: number | null;
  hoveredCandleIndex: number | null;
}

export interface ReplayState {
  isActive: boolean;
  isPlaying: boolean;
  currentReplayIndex: number;
  maxIndex: number;
  speed: number; // 0.5, 1, 2, 5, 10
}
