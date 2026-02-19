// Market data API utilities
// Using free tier APIs: CoinGecko for crypto, Yahoo Finance via CORS proxy for stocks

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Yahoo Finance via a CORS proxy (for client-side use)
// In production, this should be a server-side API route
const YAHOO_FINANCE_PROXY = "https://query1.finance.yahoo.com/v8/finance/chart";

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "crypto";
  lastUpdated: number;
}

// CoinGecko: Free tier allows 10-30 calls/minute
export async function fetchCryptoPrices(ids: string[]): Promise<StockQuote[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids.join(",")}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) throw new Error("Failed to fetch crypto prices");
    
    const data = await response.json();
    
    const cryptoMap: Record<string, { symbol: string; name: string }> = {
      bitcoin: { symbol: "BTC", name: "Bitcoin" },
      ethereum: { symbol: "ETH", name: "Ethereum" },
      solana: { symbol: "SOL", name: "Solana" },
      cardano: { symbol: "ADA", name: "Cardano" },
      polkadot: { symbol: "DOT", name: "Polkadot" },
    };
    
    return Object.entries(data).map(([id, prices]: [string, any]) => {
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
        type: "crypto" as const,
        lastUpdated: Date.now(),
      };
    });
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return [];
  }
}

// Yahoo Finance: Unofficial endpoint (may break, use with caution)
export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    // Using a simple quote endpoint
    const promises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `${YAHOO_FINANCE_PROXY}/${symbol}?interval=1d&range=1d`,
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
          type: "stock" as const,
          lastUpdated: Date.now(),
        };
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  } catch (error) {
    console.error("Error fetching stock quotes:", error);
    return [];
  }
}

// Alternative: Use a more reliable free API like Alpha Vantage (requires API key)
// or Finnhub (free tier available)

// Fear & Greed Index from alternative.me
export async function fetchFearGreedIndex(): Promise<{ value: number; classification: string }> {
  try {
    const response = await fetch("https://api.alternative.me/fng/");
    const data = await response.json();
    
    if (data.data && data.data[0]) {
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
      };
    }
    
    return { value: 50, classification: "Neutral" };
  } catch (error) {
    console.error("Error fetching fear & greed:", error);
    return { value: 50, classification: "Neutral" };
  }
}

// Reddit sentiment (would need server-side due to CORS/auth)
// For now, returning mock data
export interface RedditPost {
  title: string;
  subreddit: string;
  sentiment: "bullish" | "bearish" | "neutral";
  upvotes: number;
  url?: string;
}

export async function fetchRedditSentiment(): Promise<RedditPost[]> {
  // In a real implementation, this would call your backend
  // which uses Reddit API or scrapes popular finance subreddits
  return [
    { title: "AAPL beats earnings expectations", subreddit: "wallstreetbets", sentiment: "bullish", upvotes: 4520 },
    { title: "NVDA valuation concerns", subreddit: "stocks", sentiment: "bearish", upvotes: 1234 },
    { title: "Bitcoin halving countdown", subreddit: "cryptocurrency", sentiment: "bullish", upvotes: 8900 },
    { title: "Market correction incoming?", subreddit: "investing", sentiment: "bearish", upvotes: 2100 },
  ];
}
