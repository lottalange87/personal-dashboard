"use client";

import { 
  StickyNote, 
  TrendingUp, 
  Brain, 
  Wrench, 
  BarChart3, 
  Clock,
  LogOut,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AppTile {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  badge?: string;
}

const apps: AppTile[] = [
  {
    id: "notes",
    name: "Notes",
    description: "Encrypted notes & ideas",
    icon: <StickyNote className="w-7 h-7" />,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    badge: "E2E Encrypted",
  },
  {
    id: "markets",
    name: "Markets",
    description: "Stocks, crypto & sentiment",
    icon: <TrendingUp className="w-7 h-7" />,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    badge: "Coming Soon",
  },
  {
    id: "ai-news",
    name: "AI News",
    description: "Latest AI developments",
    icon: <Brain className="w-7 h-7" />,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    badge: "Coming Soon",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Pomodoro & daily goals",
    icon: <Clock className="w-7 h-7" />,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-500/10",
    badge: "Coming Soon",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Habits & mood tracking",
    icon: <BarChart3 className="w-7 h-7" />,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-500/10",
    badge: "Coming Soon",
  },
  {
    id: "tools",
    name: "Tools",
    description: "Passwords, JSON, etc.",
    icon: <Wrench className="w-7 h-7" />,
    color: "from-slate-500 to-gray-600",
    bgColor: "bg-slate-500/10",
    badge: "Coming Soon",
  },
];

interface LaunchpadProps {
  onSelectApp: (appId: string) => void;
}

export default function Launchpad({ onSelectApp }: LaunchpadProps) {
  const { logout } = useAuth();
  const currentHour = new Date().getHours();
  
  const greeting = 
    currentHour < 12 ? "Good morning" :
    currentHour < 18 ? "Good afternoon" :
    "Good evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{greeting}, Jörg</h1>
            <p className="text-sm text-slate-400">{new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-300 mb-1">Launchpad</h2>
          <p className="text-slate-500 text-sm">Select an app to get started</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelectApp(app.id)}
              className={`group relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 transition-all text-left hover:border-slate-700 hover:shadow-xl hover:shadow-${app.color.split("-")[1]}-500/5 ${app.badge === "Coming Soon" ? "opacity-75" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${app.color} shadow-lg`}>
                  <div className="text-white">{app.icon}</div>
                </div>
                {app.badge && (
                  <span className={`text-xs px-2 py-1 rounded-full ${app.badge === "E2E Encrypted" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                    {app.badge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-slate-200">
                {app.name}
              </h3>
              <p className="text-sm text-slate-400">{app.description}</p>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-slate-500" />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
