import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols");
  
  if (!symbols) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
  }
  
  const symbolList = symbols.split(",");
  
  try {
    const results = await Promise.all(
      symbolList.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
            { headers: { Accept: "application/json" } }
          );
          
          if (!response.ok) return null;
          
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (!result) return null;
          
          const meta = result.meta;
          const price = meta.regularMarketPrice;
          const prevClose = meta.previousClose || meta.chartPreviousClose;
          const change = price - prevClose;
          const changePercent = (change / prevClose) * 100;
          
          return {
            symbol: meta.symbol || symbol,
            name: meta.shortName || meta.symbol || symbol,
            price,
            change,
            changePercent,
            type: "stock",
            lastUpdated: Date.now(),
          };
        } catch (e) {
          console.error(`Error fetching ${symbol}:`, e);
          return null;
        }
      })
    );
    
    return NextResponse.json(results.filter(r => r !== null));
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
  }
}
