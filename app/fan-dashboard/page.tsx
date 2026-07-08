"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Bot, Navigation, Activity, Clock, ShieldCheck } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import Link from "next/link";

interface QueueData { gateId: string; queueLength: number; estimatedWaitMinutes: number; }

export default function FanDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [queues, setQueues] = useState<QueueData[]>([]);

  // Ball position state for animation
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!loading && (!user || role === 'staff')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    // Listen to queues for some live data
    const qQueues = query(collection(db, 'stadium_state'));
    const unsub = onSnapshot(
      qQueues, 
      (snapshot) => {
        const qData: QueueData[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.type === 'queue') qData.push(data as QueueData);
        });
        setQueues(qData.sort((a,b) => a.gateId.localeCompare(b.gateId)));
      },
      (error) => {
        console.error("Error fetching queues:", error);
      }
    );

    // Animate ball randomly
    const interval = setInterval(() => {
      setBallPos({
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 80) + 10,
      });
    }, 2000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user || role !== 'fan') return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">Fan Experience</h1>
              <p className="text-xs text-slate-400">Welcome, {user.email?.split('@')[0]}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 flex flex-col gap-8">
        
        {/* Interactive Pitch Section */}
        <section className="bg-slate-900 rounded-3xl p-6 border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            Live Match Action
          </h2>
          
          {/* Football Pitch */}
          <div className="w-full max-w-3xl mx-auto aspect-[1.5/1] bg-emerald-700/80 rounded-lg border-2 border-white/60 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-white/60 -translate-x-1/2"></div>
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-[20%] aspect-square border-2 border-white/60 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/80 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Left Penalty Area */}
            <div className="absolute top-[20%] bottom-[20%] left-0 w-[18%] border-2 border-white/60 border-l-0"></div>
            {/* Left Goal Area */}
            <div className="absolute top-[35%] bottom-[35%] left-0 w-[6%] border-2 border-white/60 border-l-0"></div>
            {/* Left Penalty Arc */}
            <div className="absolute top-1/2 left-[18%] w-[12%] aspect-square border-2 border-white/60 rounded-full -translate-y-1/2 -translate-x-1/2" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
            
            {/* Right Penalty Area */}
            <div className="absolute top-[20%] bottom-[20%] right-0 w-[18%] border-2 border-white/60 border-r-0"></div>
            {/* Right Goal Area */}
            <div className="absolute top-[35%] bottom-[35%] right-0 w-[6%] border-2 border-white/60 border-r-0"></div>
            {/* Right Penalty Arc */}
            <div className="absolute top-1/2 right-[18%] w-[12%] aspect-square border-2 border-white/60 rounded-full -translate-y-1/2 translate-x-1/2" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>

            {/* The Ball */}
            <div 
              className="absolute w-4 h-4 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] transition-all duration-[2000ms] ease-in-out z-10 flex items-center justify-center"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              <div className="w-1.5 h-1.5 bg-black rounded-full opacity-50"></div>
            </div>
            
            {/* Hover instruction */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity duration-300">
              <span className="px-4 py-2 bg-black/60 rounded-full text-sm font-medium backdrop-blur-md">
                Live match tracking activated
              </span>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quick Info & Queues */}
          <section className="bg-slate-900 rounded-3xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Live Gate Queues
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {queues.length > 0 ? queues.map((q, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                      {q.gateId}
                    </div>
                    <span className="font-medium text-slate-300">Wait Time</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-lg font-bold ${q.estimatedWaitMinutes > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {q.estimatedWaitMinutes} min
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-slate-500 text-center py-8">Waiting for live data...</div>
              )}
            </div>
          </section>

          {/* Assistant Promo */}
          <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 border border-blue-800/50 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Pulp Kicktion Assistant</h2>
              <p className="text-blue-200 mb-8 max-w-md leading-relaxed">
                Need help finding your seat, ordering food, or translating announcements? Your GenAI companion is ready.
              </p>
            </div>
            
            <Link 
              href="/assistant" 
              className="relative z-10 w-full sm:w-auto self-start px-8 py-4 bg-white hover:bg-slate-50 text-blue-900 font-bold rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] flex items-center gap-3"
            >
              <Navigation className="w-5 h-5" />
              Open Fan Assistant
            </Link>
          </section>
        </div>

      </main>
    </div>
  );
}
