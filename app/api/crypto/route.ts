import { NextResponse } from "next/server";

// 1. Map your frontend IDs to Yahoo Finance Crypto Tickers
const YAHOO_SYMBOLS: Record<string, string> = {
  "bitcoin": "BTC-USD",
  "ethereum": "ETH-USD",
  "solana": "SOL-USD",
  "dogecoin": "DOGE-USD"
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") || "bitcoin,ethereum,solana,dogecoin";
  const ids = idsParam.split(",");

  try {
    // 2. Fetch from Yahoo Finance (Unblocked) instead of CoinCap (Blocked)
    const promises = ids.map(async (id) => {
      const symbol = YAHOO_SYMBOLS[id];
      if (!symbol) return null;

      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`, {
        next: { revalidate: 15 },
        headers: {
          // Required to prevent Yahoo from blocking automated requests
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!res.ok) return null;

      const parsed = await res.json();
      const result = parsed.chart.result[0];
      
      const currentPrice = result.meta.regularMarketPrice;
      const prevClose = result.meta.chartPreviousClose || result.meta.previousClose;
      const changePercent = ((currentPrice - prevClose) / prevClose) * 100;

      // 3. Output the exact schema CoinCap used, so your frontend page.tsx doesn't break!
      return {
        id: id,
        priceUsd: currentPrice,
        changePercent24Hr: changePercent
      };
    });

    const results = await Promise.all(promises);
    const data = results.filter(r => r !== null);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Crypto API Route Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}