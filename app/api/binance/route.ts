import { NextRequest, NextResponse } from 'next/server';

const BINANCE_FAPI_BASE = 'https://fapi.binance.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'klines';
  const symbol = (searchParams.get('symbol') || 'BTCUSDT').toUpperCase();
  const rawInterval = searchParams.get('interval') || '15m';
  const interval = rawInterval === '1Y' ? '1M' : rawInterval;
  const limit = searchParams.get('limit') || '1000';

  try {
    let url = '';
    const hasSymbol = searchParams.has('symbol');

    if (type === 'klines') {
      url = `${BINANCE_FAPI_BASE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    } else if (type === 'ticker24h') {
      url = hasSymbol
        ? `${BINANCE_FAPI_BASE}/fapi/v1/ticker/24hr?symbol=${symbol}`
        : `${BINANCE_FAPI_BASE}/fapi/v1/ticker/24hr`;
    } else if (type === 'price') {
      url = `${BINANCE_FAPI_BASE}/fapi/v1/ticker/price?symbol=${symbol}`;
    } else if (type === 'depth') {
      url = `${BINANCE_FAPI_BASE}/fapi/v1/depth?symbol=${symbol}&limit=50`;
    } else if (type === 'oi') {
      url = `${BINANCE_FAPI_BASE}/fapi/v1/openInterest?symbol=${symbol}`;
    } else if (type === 'fundingRate') {
      url = `${BINANCE_FAPI_BASE}/fapi/v1/fundingRate?symbol=${symbol}&limit=10`;
    } else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Primary endpoint status ${response.status}`);
      }
    } catch {
      // Try spot mirror fallback
      const fallbackUrl = type === 'price'
        ? `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        : type === 'ticker24h' && hasSymbol
        ? `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
        : type === 'klines'
        ? `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        : `https://api.binance.com/api/v3/ticker/24hr`;
      response = await fetch(fallbackUrl, { signal: controller.signal, cache: 'no-store' });
    }
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Binance responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown upstream error';
    // Return structured fallback flag so client can generate ultra-accurate orderflow math if needed
    return NextResponse.json({
      fallback: true,
      reason: errMessage,
      symbol,
      type,
    }, { status: 200 });
  }
}
