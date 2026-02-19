"use client";

import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import Launchpad from "./Launchpad";
import NotesApp from "./NotesApp";
import MarketsApp from "./MarketsApp";

const CORRECT_PASSWORD = "LottaDash2026!";

export default function ClientWrapper() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check auth status on client-side only
    const stored = localStorage.getItem("dashboard_auth");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, []);

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("dashboard_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentApp(null);
    localStorage.removeItem("dashboard_auth");
  };

  // Before hydration completes, show login page (safe for SSR)
  // After hydration, check auth state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Router for apps
  switch (currentApp) {
    case "notes":
      return <NotesApp onBack={() => setCurrentApp(null)} onLogout={logout} />;
    case "markets":
      return <MarketsApp onBack={() => setCurrentApp(null)} onLogout={logout} />;
    default:
      return <Launchpad onSelectApp={setCurrentApp} onLogout={logout} />;
  }
}
