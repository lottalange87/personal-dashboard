"use client";

import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import Launchpad from "./Launchpad";
import NotesApp from "./NotesApp";
import MarketsApp from "./MarketsApp";

const CORRECT_PASSWORD = "LottaDash2026!";

export default function ClientWrapper() {
  // Start with unauthenticated state - same for server and client
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  
  // Check auth only on client after mount
  useEffect(() => {
    const stored = localStorage.getItem("dashboard_auth");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
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

  // Always show login first - no loading state that causes mismatch
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
