"use client";

import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import Launchpad from "./components/Launchpad";
import NotesApp from "./components/NotesApp";

function DashboardContent() {
  const { isAuthenticated } = useAuth();
  const [currentApp, setCurrentApp] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Router for apps
  switch (currentApp) {
    case "notes":
      return <NotesApp onBack={() => setCurrentApp(null)} />;
    default:
      return <Launchpad onSelectApp={setCurrentApp} />;
  }
}

export default function Home() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
