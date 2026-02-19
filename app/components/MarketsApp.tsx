"use client";

import { useState, useEffect } from "react";
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
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "stock" | "crypto";
}

interface SentimentPost {
  title: string;
  subreddit: string;
  sentiment: "bullish" | "bearish" | "neutral";
  upvotes: number;
}

interface MarketsAppProps {
  onBack: () => void;
  onLogout: () => void;
}

// Mock data for now - will be replaced with real API calls
const MOCK_STOCKS: Stock[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 195.89, change: 2.34, changePercent: 1.21, type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 417.32, change: -1.23, changePercent: -0.29, type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 15.67, changePercent: 1.82, type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 178.45, change: -5.23, changePercent: -2.85, type: "stock" },
  { symbol: "BTC", name: "Bitcoin", price: 52340.12, change: 1240.50, changePercent: 2.43, type: "crypto" },
  { symbol: "ETH", name: "Ethereum", price: 2890.34, change: -45.20, changePercent: -1.54, type: "crypto" },
];

const MOCK_SENTIMENT: SentimentPost[] = [
  { title: "AAPL earnings beat expectations", subreddit: "wallstreetbets", sentiment: "bullish", upvotes: 4520 },
  { title: "Is NVDA overvalued?", subreddit: "stocks", sentiment: "bearish", upvotes: 1234 },
  { title: "Bitcoin halving coming up", subreddit: "cryptocurrency", sentiment: "bullish", upvotes: 8900 },
  { title: "TSLA production numbers down", subreddit: "wallstreetbets", sentiment: "bearish", upvotes: 3200 },
];

export default function MarketsApp({ onBack, onLogout }: MarketsAppProps) {
  const [watchlist, setWatchlist] = useState<string[]>(["AAPL", "BTC", "NVDA"]);
  const [prices, setPrices] = useState<Stock[]>(MOCK_STOCKS);
  const [sentiment, setSentiment] = useState<SentimentPost[]>(MOCK_SENTIMENT);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fearGreedIndex, setFearGreedIndex] = useState(65); // 0-100

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(stock => ({
        ...stock,
        price: stock.price * (1 + (Math.random() - 0.5) * 0.002),
        change: stock.change + (Math.random() - 0.5) * 0.5,
        changePercent: stock.changePercent + (Math.random() - 0.5) * 0.1,
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatPrice = (price: number) => {
    return price >= 1000 
      ? price.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      : price.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const getFearGreedLabel = (index: number) => {
    if (index <= 20) return { label: "Extreme Fear", color: "text-red-500" };
    if (index <= 40) return { label: "Fear", color: "text-orange-500" };
    if (index <= 60) return { label: "Neutral", color: "text-yellow-500" };
    if (index <= 80) return { label: "Greed", color: "text-emerald-500" };
    return { label: "Extreme Greed", color: "text-green-500" };
  };

  const watchlistStocks = prices.filter(s => watchlist.includes(s.symbol));
  const filteredStocks = prices.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Button variant="ghost" size="sm" onClick={refreshData} disabled={isLoading} className="text-slate-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
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
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: `${fearGreedIndex}%` }}
                  />
                </div>
                <span className={`font-bold ${getFearGreedLabel(fearGreedIndex).color}`}>
                  {fearGreedIndex} - {getFearGreedLabel(fearGreedIndex).label}
                </span>
              </div>
            </div>
          </div>

          <TabsContent value="watchlist" className="space-y-4">
            {watchlistStocks.length === 0 ? (
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
              {filteredStocks.map((stock) => (
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-white">{formatPrice(stock.price)}</p>
                      <p className={`text-sm flex items-center justify-end gap-1 ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addToWatchlist(stock.symbol)}
                      disabled={watchlist.includes(stock.symbol)}
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      {watchlist.includes(stock.symbol) ? "Added" : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <div className="grid gap-3">
              {sentiment.map((post, idx) => (
                <div key={idx} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{post.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={post.sentiment === "bullish" ? "border-emerald-500 text-emerald-400" : post.sentiment === "bearish" ? "border-red-500 text-red-400" : "border-slate-500 text-slate-400"}
                    >
                      {post.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>r/{post.subreddit}</span>
                    <span>↑ {post.upvotes.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
