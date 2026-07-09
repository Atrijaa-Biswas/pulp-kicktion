"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Bot, ShieldAlert, LogIn, Trophy } from "lucide-react";
import { startMockDataEngine } from "@/lib/mock-data-engine";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const [stats, setStats] = useState({ activeSessions: 0, activeAlerts: 0 });
  const { user, role, loading } = useAuth();

  useEffect(() => {
    startMockDataEngine();

    const unsub = onSnapshot(
      doc(db, 'stadium_state', 'global_stats'), 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setStats({
            activeSessions: data.activeSessions || 0,
            activeAlerts: data.activeAlerts || 0,
          });
        }
      },
      (error) => {
        console.error("Error fetching live stats:", error);
      }
    );

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-vintage-cream text-vintage-black">
      
      {/* Decorative Poster Border */}
      <div className="absolute inset-4 border-8 border-vintage-black pointer-events-none z-0 opacity-10"></div>
      
      <main className="max-w-6xl w-full mx-auto px-6 py-20 flex flex-col items-center text-center relative z-10 animate-fade-in">
        
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-vintage-red text-white font-headline uppercase tracking-widest font-bold border-4 border-vintage-black poster-shadow mb-8 transform -rotate-2">
          <Trophy className="w-5 h-5" />
          <span>Matchday 2026</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-black uppercase tracking-tighter text-vintage-green mb-6 leading-none drop-shadow-[4px_4px_0px_#1A1A1A]">
          PULP <br/> KICKTION
        </h1>
        
        <div className="w-24 h-2 bg-vintage-orange mb-8 border-2 border-vintage-black poster-shadow"></div>

        <p className="text-xl md:text-2xl font-bold max-w-2xl mb-16 leading-relaxed bg-white/80 p-6 border-4 border-vintage-black poster-shadow">
          THE OFFICIAL GEN-AI MATCHDAY COMPANION. NAVIGATE THE STADIUM, TRANSLATE CHANTS, AND KEEP OPERATIONS RUNNING SMOOTHLY.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 mb-24 w-full sm:w-auto">
          {loading ? (
            <div className="px-10 py-5 bg-vintage-green/50 text-vintage-cream font-headline text-xl uppercase tracking-wider font-bold border-4 border-vintage-black flex items-center justify-center animate-pulse w-64 h-20">
              LOADING...
            </div>
          ) : user ? (
            <>
              {role === 'fan' && (
                <Link href="/fan-dashboard" className="px-10 py-5 bg-vintage-green text-vintage-cream font-headline text-2xl uppercase tracking-wider font-bold border-4 border-vintage-black poster-shadow hover:-translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3 group">
                  <Bot className="w-8 h-8 group-hover:animate-bounce" />
                  Enter Stadium
                </Link>
              )}
              {role === 'staff' && (
                <Link href="/dashboard" className="px-10 py-5 bg-vintage-orange text-white font-headline text-2xl uppercase tracking-wider font-bold border-4 border-vintage-black poster-shadow hover:-translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
                  <ShieldAlert className="w-8 h-8" />
                  Ops Control
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" className="px-10 py-5 bg-vintage-red text-white font-headline text-2xl uppercase tracking-wider font-bold border-4 border-vintage-black poster-shadow hover:-translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3">
              <LogIn className="w-8 h-8" />
              Secure Ticket
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Retro Scoreboard: Fans */}
          <div className="bg-vintage-black text-vintage-cream p-8 border-4 border-vintage-black poster-shadow flex flex-col items-center transform rotate-1 transition-transform hover:rotate-0">
            <h3 className="font-headline text-2xl uppercase tracking-widest text-vintage-orange mb-4">Live Attendance</h3>
            <div className="bg-black p-4 border-4 border-vintage-black rounded">
              <p className="text-6xl font-mono text-vintage-green drop-shadow-[0_0_10px_#133824]">
                {stats.activeSessions.toString().padStart(5, '0')}
              </p>
            </div>
            <p className="font-bold uppercase tracking-wide mt-4 text-sm opacity-80">Fans Connected</p>
          </div>

          {/* Retro Scoreboard: Alerts */}
          <div className="bg-vintage-black text-vintage-cream p-8 border-4 border-vintage-black poster-shadow flex flex-col items-center transform -rotate-1 transition-transform hover:rotate-0">
            <h3 className="font-headline text-2xl uppercase tracking-widest text-vintage-red mb-4">Ops Status</h3>
            <div className="bg-black p-4 border-4 border-vintage-black rounded">
              <p className="text-6xl font-mono text-vintage-orange drop-shadow-[0_0_10px_#CC5803]">
                {stats.activeAlerts.toString().padStart(3, '0')}
              </p>
            </div>
            <p className="font-bold uppercase tracking-wide mt-4 text-sm opacity-80">Active Incidents</p>
          </div>
        </div>

      </main>
    </div>
  );
}
