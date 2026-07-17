"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut, Bot, Navigation, Activity, Clock, Trophy, Megaphone, BellRing } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import Link from "next/link";

interface QueueData { gateId: string; queueLength: number; estimatedWaitMinutes: number; }
interface AlertData { id: string; type: string; message: string; createdAt: any; }

export default function FanDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

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
    const unsubQueues = onSnapshot(
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

    // Listen to alerts for announcements and resolutions
    const qAlerts = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
    const unsubAlerts = onSnapshot(
      qAlerts,
      (snapshot) => {
        const altData: AlertData[] = [];
        const now = Date.now();
        // 12 hours expiration
        const EXPIRATION_MS = 12 * 60 * 60 * 1000;
        
        snapshot.forEach(doc => {
           const data = doc.data();
           let isExpired = false;
           if (data.createdAt && data.createdAt.toMillis) {
             isExpired = now - data.createdAt.toMillis() > EXPIRATION_MS;
           }
           if (!isExpired) {
             altData.push({ id: doc.id, ...data } as AlertData);
           }
        });
        setAlerts(altData);
      },
      (error) => {
        console.error("Error fetching alerts:", error);
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
      unsubQueues();
      unsubAlerts();
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading || !user || role !== 'fan') {
    return (
      <div className="min-h-screen bg-vintage-cream flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-vintage-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream text-vintage-black font-sans flex flex-col animate-fade-in">
      {/* Header */}
      <header className="bg-white border-b-4 border-vintage-black p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-vintage-red flex items-center justify-center border-2 border-vintage-black poster-shadow">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-headline text-3xl font-black uppercase tracking-tighter leading-none text-vintage-green drop-shadow-[2px_2px_0px_#1A1A1A]">Matchday Hub</h1>
              <p className="text-sm font-bold uppercase tracking-widest text-vintage-black/70 mt-1">Ticket: {user.email?.split('@')[0]}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-3 bg-vintage-cream border-4 border-vintage-black poster-shadow hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline font-headline text-lg uppercase font-bold tracking-wider">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col gap-12">
        
        {/* Live Announcements Ticker / List */}
        <section className="bg-vintage-orange border-4 border-vintage-black poster-shadow p-6 group">
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-4 flex items-center gap-3 border-b-4 border-vintage-black pb-4 text-vintage-black">
            <Megaphone className="w-8 h-8" />
            Live Updates & Announcements
          </h2>
          
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
            {alerts.length > 0 ? alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`min-w-[300px] max-w-[400px] shrink-0 p-4 border-4 border-vintage-black snap-start flex flex-col justify-between
                  ${alert.type === 'resolution' ? 'bg-vintage-cream' : 'bg-white'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BellRing className={`w-5 h-5 ${alert.type === 'resolution' ? 'text-vintage-green' : 'text-vintage-red'} animate-pulse`} />
                  <span className="font-bold uppercase tracking-widest text-xs text-vintage-black/70">
                    {alert.type === 'resolution' ? 'All Clear' : 'Official Announcement'}
                  </span>
                </div>
                <p className="font-bold text-lg leading-tight text-balance">
                  {alert.message}
                </p>
                {alert.createdAt && alert.createdAt.toDate && (
                  <span className="font-mono text-xs font-bold mt-4 block opacity-50">
                    {alert.createdAt.toDate().toLocaleTimeString()}
                  </span>
                )}
              </div>
            )) : (
              <div className="bg-white p-6 border-4 border-vintage-black w-full flex items-center justify-center">
                <span className="font-headline text-xl uppercase font-bold text-vintage-black/50">No Active Announcements</span>
              </div>
            )}
          </div>
        </section>

        {/* Interactive Pitch Section */}
        <section className="bg-white border-4 border-vintage-black poster-shadow p-6 group">
          
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-4 border-vintage-black pb-4 text-vintage-green">
            <Activity className="w-8 h-8" />
            Live Match Action
          </h2>
          
          {/* Football Pitch - Vintage Style */}
          <div className="w-full max-w-3xl mx-auto aspect-[1.5/1] bg-vintage-green border-4 border-vintage-black relative overflow-hidden poster-shadow">
            {/* Center Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[4px] bg-vintage-cream -translate-x-1/2 opacity-80"></div>
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-[20%] aspect-square border-4 border-vintage-cream rounded-full -translate-x-1/2 -translate-y-1/2 opacity-80"></div>
            {/* Center Dot */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-vintage-cream rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Left Penalty Area */}
            <div className="absolute top-[20%] bottom-[20%] left-0 w-[18%] border-4 border-vintage-cream border-l-0 opacity-80"></div>
            {/* Left Goal Area */}
            <div className="absolute top-[35%] bottom-[35%] left-0 w-[6%] border-4 border-vintage-cream border-l-0 opacity-80"></div>
            {/* Left Penalty Arc */}
            <div className="absolute top-1/2 left-[18%] w-[12%] aspect-square border-4 border-vintage-cream rounded-full -translate-y-1/2 -translate-x-1/2 opacity-80" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
            
            {/* Right Penalty Area */}
            <div className="absolute top-[20%] bottom-[20%] right-0 w-[18%] border-4 border-vintage-cream border-r-0 opacity-80"></div>
            {/* Right Goal Area */}
            <div className="absolute top-[35%] bottom-[35%] right-0 w-[6%] border-4 border-vintage-cream border-r-0 opacity-80"></div>
            {/* Right Penalty Arc */}
            <div className="absolute top-1/2 right-[18%] w-[12%] aspect-square border-4 border-vintage-cream rounded-full -translate-y-1/2 translate-x-1/2 opacity-80" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>

            {/* The Ball */}
            <div 
              className="absolute w-8 h-8 bg-white border-2 border-vintage-black rounded-full shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all duration-[2000ms] ease-in-out z-10 flex items-center justify-center"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              {/* Retro classic ball pattern simple */}
              <div className="w-3 h-3 bg-vintage-black rounded-full"></div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Quick Info & Queues */}
          <section className="bg-white border-4 border-vintage-black poster-shadow p-6 flex flex-col">
            <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-4 border-vintage-black pb-4 text-vintage-orange">
              <Clock className="w-8 h-8" />
              Live Gate Queues
            </h2>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {queues.length > 0 ? queues.map((q, idx) => (
                <div key={idx} className="flex justify-between items-center bg-vintage-cream p-4 border-2 border-vintage-black">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-vintage-black flex items-center justify-center text-vintage-cream font-headline text-xl font-bold border-2 border-vintage-black">
                      {q.gateId}
                    </div>
                    <span className="font-bold uppercase tracking-widest text-sm">Wait Time</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-3xl font-bold ${q.estimatedWaitMinutes > 15 ? 'text-vintage-red' : 'text-vintage-green'} drop-shadow-[1px_1px_0px_#1A1A1A]`}>
                      {q.estimatedWaitMinutes}m
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-vintage-black/50 font-bold uppercase p-4 border-2 border-dashed border-vintage-black text-center">Awaiting Telemetry...</div>
              )}
            </div>
          </section>

          {/* Assistant Promo */}
          <section className="bg-vintage-green border-4 border-vintage-black poster-shadow p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Retro rays background effect could go here */}
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-vintage-orange flex items-center justify-center mb-6 border-4 border-vintage-black poster-shadow">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-headline font-black uppercase tracking-tighter mb-4 text-white drop-shadow-[3px_3px_0px_#1A1A1A]">
                Matchday Assistant
              </h2>
              <p className="text-vintage-cream font-bold text-lg mb-8 max-w-md leading-relaxed border-l-4 border-vintage-orange pl-4">
                NEED DIRECTIONS? HUNGRY? LOST IN TRANSLATION? CONSULT YOUR GEN-AI COMPANION.
              </p>
            </div>
            
            <Link 
              href="/assistant" 
              className="relative z-10 w-full sm:w-auto self-start px-10 py-5 bg-white text-vintage-black font-headline text-2xl uppercase font-bold border-4 border-vintage-black poster-shadow hover:-translate-y-1 hover:shadow-none transition-all flex items-center gap-3"
            >
              <Navigation className="w-6 h-6 text-vintage-orange" />
              Engage Assistant
            </Link>
          </section>
        </div>

      </main>
    </div>
  );
}
