import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'CryptoSphere Orderflow Terminal | Institutional Crypto Trading Engine',
  description: 'Institutional-grade Crypto Orderflow Trading Terminal with synchronized 4-chart divergence alignment engine, dynamic liquidity wall 3D gravitational pull, POI absorption tracker, liquidation heatmaps, and live Binance Perpetual Futures WebSocket integration.',
  openGraph: {
    title: 'CryptoSphere Orderflow Terminal',
    description: 'Institutional-grade Crypto Orderflow Trading Terminal with synchronized 4-chart divergence alignment engine and Binance Perpetual Futures feeds.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoSphere Orderflow Terminal',
    description: 'Institutional-grade Crypto Orderflow Trading Terminal with synchronized 4-chart divergence alignment engine and Binance Perpetual Futures feeds.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
