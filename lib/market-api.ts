// Market data API utilities - now using local API routes

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "crypto";
  lastUpdated: number;
}

export async function fetchCryptoPrices(ids: string[]): Promise<StockQuote[]> {
  try {
    const response = await fetch(`/api/crypto?ids=${ids.join(",")}`);
    if (!response.ok) throw new Error("Failed to fetch crypto");
    return await response.json();
  } catch (error) {
    console.error("Error fetching crypto:", error);
    return [];
  }
}

export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  try {
    const response = await fetch(`/api/stocks?symbols=${symbols.join(",")}`);
    if (!response.ok) throw new Error("Failed to fetch stocks");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stocks:", error);
    return [];
  }
}

export async function fetchFearGreedIndex(): Promise<{ value: number; classification: string }> {
  try {
    const response = await fetch("/api/fear-greed");
    if (!response.ok) throw new Error("Failed to fetch fear & greed");
    return await response.json();
  } catch (error) {
    console.error("Error fetching fear & greed:", error);
    return { value: 50, classification: "Neutral" };
  }
}

export interface RedditPost {
  title: string;
  subreddit: string;
  sentiment: "bullish" | "bearish" | "neutral";
  upvotes: number;
  url?: string;
}

export async function fetchRedditSentiment(): Promise<RedditPost[]> {
  // TODO: Implement server-side Reddit API
  return [
    { title: "AAPL beats earnings expectations", subreddit: "wallstreetbets", sentiment: "bullish", upvotes: 4520 },
    { title: "NVDA valuation concerns", subreddit: "stocks", sentiment: "bearish", upvotes: 1234 },
    { title: "Bitcoin halving countdown", subreddit: "cryptocurrency", sentiment: "bullish", upvotes: 8900 },
    { title: "Market correction incoming?", subreddit: "investing", sentiment: "bearish", upvotes: 2100 },
  ];
}
