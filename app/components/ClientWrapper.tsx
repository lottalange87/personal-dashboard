"use client";

import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import Launchpad from "./Launchpad";
import NotesApp from "./NotesApp";
import MarketsApp from "./MarketsApp";

const CORRECT_PASSWORD = "LottaDash2026!";

export default function ClientWrapper() {
  // Use null as initial state - server renders null, client renders null, no mismatch
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("dashboard_auth");
    setAuthState(stored === "true" ? "authenticated" : "unauthenticated");
  }, []);

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setAuthState("authenticated");
      localStorage.setItem("dashboard_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuthState("unauthenticated");
    setCurrentApp(null);
    localStorage.removeItem("dashboard_auth");
  };

  // While loading, show simple loading (same on server and client)
  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <LoginPage onLogin={login} />;
  }

  switch (currentApp) {
    case "notes":
      return <NotesApp onBack={() => setCurrentApp(null)} onLogout={logout} />;
    case "markets":
      return <MarketsApp onBack={() => setCurrentApp(null)} onLogout={logout} />;
    default:
      return <Launchpad onSelectApp={setCurrentApp} onLogout={logout} />;
  }
}
