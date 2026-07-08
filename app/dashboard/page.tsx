"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { Activity, Users, AlertTriangle, LogOut } from "lucide-react";
import StadiumMap from "@/components/StadiumMap";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface QueueData { gateId: string; queueLength: number; estimatedWaitMinutes: number; }
interface DensityData { zoneId: string; densityPercent: number; }

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [densities, setDensities] = useState<DensityData[]>([]);

  useEffect(() => {
    if (!loading && (!user || role !== 'staff')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    // Listen to queues
    const qQueues = query(collection(db, 'stadium_state'));
    const unsub = onSnapshot(
      qQueues, 
      (snapshot) => {
        const qData: QueueData[] = [];
        const dData: DensityData[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.type === 'queue') qData.push(data as QueueData);
          if (data.type === 'density') dData.push(data as DensityData);
        });
        setQueues(qData.sort((a,b) => a.gateId.localeCompare(b.gateId)));
        setDensities(dData.sort((a,b) => a.zoneId.localeCompare(b.zoneId)));
      },
      (error) => {
        console.error("Error fetching stadium state:", error);
      }
    );

    return () => unsub();
  }, []);
  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user || role !== 'staff') return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ops Dashboard</h1>
          <p className="text-slate-400">Welcome, {user.email?.split('@')[0]} (Admin)</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-slate-800 rounded flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono">System Online</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Heatmap Panel */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Live Crowd Density
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {densities.map((d, idx) => (
              <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700 relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-blue-500/20 transition-all duration-1000" 
                  style={{ height: `${d.densityPercent}%` }} 
                />
                <h3 className="font-bold relative z-10">{d.zoneId}</h3>
                <p className="text-2xl font-mono mt-2 relative z-10">{d.densityPercent}%</p>
              </div>
            ))}
            {densities.length === 0 && <div className="text-slate-500 col-span-3">Waiting for data...</div>}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Stadium Layout</h3>
            <StadiumMap />
          </div>
        </div>

        {/* Queues & Alerts Panel */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Gate Queues
            </h2>
            <div className="space-y-3">
              {queues.map((q, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                  <span className="font-bold">{q.gateId}</span>
                  <div className="text-right">
                    <p className="font-mono text-amber-400">{q.queueLength} people</p>
                    <p className="text-xs text-slate-400">~{q.estimatedWaitMinutes} min wait</p>
                  </div>
                </div>
              ))}
              {queues.length === 0 && <div className="text-slate-500">Waiting for data...</div>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
