"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  Search,
  RefreshCw,
  DollarSign,
  Bitcoin,
  MessageSquare,
  Activity,
  LogOut,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchCryptoPrices, fetchStockQuotes, fetchFearGreedIndex, StockQuote, RedditPost } from "@/lib/market-api";

interface MarketsAppProps {
  onBack: () => void;
  onLogout: () => void;
}

// Default watchlist
const DEFAULT_WATCHLIST = ["AAPL", "BTC", "NVDA", "MSFT"];

// Available assets
const AVAILABLE_STOCKS = ["AAPL", "MSFT", "NVDA", "TSLA", "GOOGL", "AMZN", "META", "AMD"];
const AVAILABLE_CRYPTO = ["BTC", "ETH", "SOL", "ADA"];

const CRYPTO_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum", 
  SOL: "solana",
  ADA: "cardano"
};

export default function MarketsApp({ onBack, onLogout }: MarketsAppProps) {
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [prices, setPrices] = useState<StockQuote[]>([]);
  const [sentiment, setSentiment] = useState<RedditPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fearGreed, setFearGreed] = useState({ value: 50, classification: "Neutral" });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch stocks
      const stockSymbols = watchlist.filter(s => !AVAILABLE_CRYPTO.includes(s));
      const stocks = await fetchStockQuotes(stockSymbols);
      
      // Fetch crypto
      const cryptoIds = watchlist
        .filter(s => AVAILABLE_CRYPTO.includes(s))
        .map(s => CRYPTO_MAP[s])
        .filter((s): s is string => s !== undefined);
      const cryptos = await fetchCryptoPrices(cryptoIds);
      
      setPrices([...stocks, ...cryptos]);
      setLastUpdated(new Date());
      
      // Fetch fear & greed
      const fg = await fetchFearGreedIndex();
      setFearGreed(fg);
    } catch (err) {
      setError("Failed to fetch market data. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [watchlist]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const formatPrice = (price: number) => {
    return price >= 1000 
      ? price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      : price.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const getFearGreedColor = (value: number) => {
    if (value <= 20) return "text-red-500";
    if (value <= 40) return "text-orange-500";
    if (value <= 60) return "text-yellow-500";
    if (value <= 80) return "text-emerald-500";
    return "text-green-500";
  };

  const watchlistStocks = prices.filter(s => watchlist.includes(s.symbol));
  const allAssets = [...AVAILABLE_STOCKS.map(s => ({ symbol: s, type: "stock" as const })),
    ...AVAILABLE_CRYPTO.map(s => ({ symbol: s, type: "crypto" as const }))];
  const filteredAssets = allAssets.filter(a => 
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Markets</h1>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={isLoading} className="text-slate-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <Alert className="mb-4 bg-red-500/10 border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <DollarSign className="w-4 h-4 mr-2" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <TrendingUp className="w-4 h-4 mr-2" />
              All Assets
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <MessageSquare className="w-4 h-4 mr-2" />
              Sentiment
            </TabsTrigger>
          </TabsList>

          {/* Fear & Greed Index */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-300 font-medium">Fear & Greed Index</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                    style={{ width: `${fearGreed.value}%` }}
                  />
                </div>
                <span className={`font-bold ${getFearGreedColor(fearGreed.value)}`}>
                  {fearGreed.value} - {fearGreed.classification}
                </span>
              </div>
            </div>
          </div>

          <TabsContent value="watchlist" className="space-y-4">
            {isLoading && prices.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                <p>Loading market data...</p>
              </div>
            ) : watchlistStocks.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Your watchlist is empty. Add stocks from the "All Assets" tab.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {watchlistStocks.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${stock.type === "crypto" ? "bg-orange-500/20" : "bg-blue-500/20"}`}>
                        {stock.type === "crypto" ? (
                          <Bitcoin className="w-5 h-5 text-orange-400" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{stock.symbol}</h3>
                        <p className="text-sm text-slate-400">{stock.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatPrice(stock.price)}</p>
                        <p className={`text-sm flex items-center justify-end gap-1 ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFromWatchlist(stock.symbol)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search stocks or crypto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid gap-3">
              {filteredAssets.map((asset) => {
                const price = prices.find(p => p.symbol === asset.symbol);
                const isInWatchlist = watchlist.includes(asset.symbol);
                
                return (
                  <div key={asset.symbol} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${asset.type === "crypto" ? "bg-orange-500/20" : "bg-blue-500/20"}`}>
                        {asset.type === "crypto" ? (
                          <Bitcoin className="w-5 h-5 text-orange-400" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{asset.symbol}</h3>
                        <p className="text-sm text-slate-400">
                          {price?.name || asset.symbol} • {asset.type === "crypto" ? "Crypto" : "Stock"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {price && (
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatPrice(price.price)}</p>
                          <p className={`text-sm flex items-center justify-end gap-1 ${price.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {price.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {price.change >= 0 ? "+" : ""}{price.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => addToWatchlist(asset.symbol)}
                        disabled={isInWatchlist}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      >
                        {isInWatchlist ? "Added" : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Reddit sentiment analysis coming soon.</p>
              <p className="text-sm mt-2">Will track r/wallstreetbets, r/cryptocurrency, r/stocks</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
