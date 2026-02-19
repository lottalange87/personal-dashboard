import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");
  
  if (!ids) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { headers: { Accept: "application/json" } }
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from CoinGecko" }, { status: 502 });
    }
    
    const data = await response.json();
    
    const cryptoMap: Record<string, { symbol: string; name: string }> = {
      bitcoin: { symbol: "BTC", name: "Bitcoin" },
      ethereum: { symbol: "ETH", name: "Ethereum" },
      solana: { symbol: "SOL", name: "Solana" },
      cardano: { symbol: "ADA", name: "Cardano" },
    };
    
    const results = Object.entries(data).map(([id, prices]: [string, any]) => {
      const info = cryptoMap[id] || { symbol: id.toUpperCase(), name: id };
      const price = prices.usd;
      const changePercent = prices.usd_24h_change || 0;
      const prevPrice = price / (1 + changePercent / 100);
      const change = price - prevPrice;
      
      return {
        symbol: info.symbol,
        name: info.name,
        price,
        change,
        changePercent,
        type: "crypto",
        lastUpdated: Date.now(),
      };
    });
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch crypto" }, { status: 500 });
  }
}
