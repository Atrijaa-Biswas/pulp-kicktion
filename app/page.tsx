"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Bot, Map, ShieldAlert, Zap } from "lucide-react";
import { startMockDataEngine } from "@/lib/mock-data-engine";

export default function Home() {
  const [stats, setStats] = useState({ activeSessions: 0, activeAlerts: 0 });

  useEffect(() => {
    // Start mock data for the demo
    startMockDataEngine();

    // Listen to live stats
    const unsub = onSnapshot(doc(db, 'stadium_state', 'global_stats'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          activeSessions: data.activeSessions || 0,
          activeAlerts: data.activeAlerts || 0,
        });
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-50 font-sans">
      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 font-medium mb-8 border border-blue-500/20">
          <Zap className="w-4 h-4" />
          <span>FIFA World Cup 2026</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Pulp Kicktion
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 leading-relaxed">
          The GenAI-powered stadium companion that helps fans navigate, translates in real-time, and keeps operations running smoothly.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-20 w-full sm:w-auto">
          <Link href="/assistant" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-3">
            <Bot className="w-5 h-5" />
            Launch Fan Assistant
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-lg transition-all border border-slate-700 flex items-center justify-center gap-3">
            <ShieldAlert className="w-5 h-5" />
            Ops Dashboard (Staff)
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Live Fan Sessions</h3>
            <p className="text-4xl font-mono font-bold text-blue-400 mb-2">
              {stats.activeSessions.toLocaleString()}
            </p>
            <p className="text-slate-400">Fans currently using the companion app</p>
          </div>

          <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50 backdrop-blur-sm text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
              <Map className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Active Incidents</h3>
            <p className="text-4xl font-mono font-bold text-amber-400 mb-2">
              {stats.activeAlerts}
            </p>
            <p className="text-slate-400">Alerts being monitored by Ops</p>
          </div>
        </div>

      </main>
    </div>
  );
}
