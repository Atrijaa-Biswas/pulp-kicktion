"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, orderBy, serverTimestamp, where } from "firebase/firestore";
import { Activity, Users, AlertTriangle, LogOut, ChevronDown, ChevronUp, Megaphone, Trash2, Plus } from "lucide-react";
import StadiumMap from "@/components/StadiumMap";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

interface QueueData { gateId: string; queueLength: number; estimatedWaitMinutes: number; }
interface DensityData { zoneId: string; densityPercent: number; }
interface IncidentData { id: string; loc: string; desc: string; status: string; }
interface AlertData { id: string; type: string; message: string; createdAt: any; }

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [queues, setQueues] = useState<QueueData[]>([]);
  const [densities, setDensities] = useState<DensityData[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [announcementText, setAnnouncementText] = useState("");
  const [resolveAction, setResolveAction] = useState("");

  useEffect(() => {
    if (!loading && (!user || role !== 'staff')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    const unsubQueues = onSnapshot(query(collection(db, 'stadium_state')), (snapshot) => {
      const qData: QueueData[] = [];
      const dData: DensityData[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.type === 'queue') qData.push(data as QueueData);
        if (data.type === 'density') dData.push(data as DensityData);
      });
      setQueues(qData.sort((a,b) => a.gateId.localeCompare(b.gateId)));
      setDensities(dData.sort((a,b) => a.zoneId.localeCompare(b.zoneId)));
    });

    const unsubIncidents = onSnapshot(query(collection(db, 'incidents'), where('status', '!=', 'resolved')), (snapshot) => {
      const incData: IncidentData[] = [];
      snapshot.forEach(doc => incData.push({ id: doc.id, ...doc.data() } as IncidentData));
      setIncidents(incData);
    });

    const unsubAlerts = onSnapshot(query(collection(db, 'alerts'), orderBy('createdAt', 'desc')), (snapshot) => {
      const altData: AlertData[] = [];
      snapshot.forEach(doc => altData.push({ id: doc.id, ...doc.data() } as AlertData));
      setAlerts(altData);
    });

    return () => { unsubQueues(); unsubIncidents(); unsubAlerts(); };
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const publishAnnouncement = async () => {
    if (!announcementText.trim()) return;
    await addDoc(collection(db, 'alerts'), {
      type: 'announcement',
      message: announcementText,
      createdAt: serverTimestamp()
    });
    setAnnouncementText("");
  };

  const deleteAlert = async (id: string) => {
    await deleteDoc(doc(db, 'alerts', id));
  };

  const resolveIncident = async (incident: IncidentData) => {
    if (!resolveAction.trim()) return;
    await updateDoc(doc(db, 'incidents', incident.id), {
      status: 'resolved',
      resolutionNote: resolveAction,
      resolvedAt: serverTimestamp()
    });
    await addDoc(collection(db, 'alerts'), {
      type: 'resolution',
      message: `All clear: Incident at ${incident.loc} has been resolved. (${resolveAction})`,
      createdAt: serverTimestamp()
    });
    setResolveAction("");
    setExpandedAlert(null);
  };

  const createDummyIncident = async () => {
    await addDoc(collection(db, 'incidents'), {
      loc: 'North Stand Gate ' + Math.floor(Math.random() * 5 + 1),
      desc: 'Spill reported, cleanup crew requested.',
      status: 'active',
      createdAt: serverTimestamp()
    });
  };

  if (loading || !user || role !== 'staff') {
    return (
      <div className="min-h-screen bg-vintage-cream flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-vintage-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream text-vintage-black font-sans p-4 md:p-8 animate-fade-in">
      <header className="mb-8 border-b-4 border-vintage-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-black uppercase tracking-tighter text-vintage-green drop-shadow-[2px_2px_0px_#1A1A1A]">
            Ops Control
          </h1>
          <p className="text-vintage-black/70 font-bold uppercase tracking-wide mt-1">
            Operator: {user.email?.split('@')[0]}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-white border-4 border-vintage-black poster-shadow flex items-center gap-2">
            <Activity className="w-5 h-5 text-vintage-green animate-pulse-slow" />
            <span className="font-headline text-lg uppercase font-bold tracking-wider">System Online</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-vintage-red text-white border-4 border-vintage-black poster-shadow hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-headline text-lg uppercase font-bold tracking-wider">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Heatmap Panel */}
        <div className="lg:col-span-2 bg-white border-4 border-vintage-black poster-shadow p-6 flex flex-col">
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-4 border-vintage-black pb-4">
            <Users className="w-8 h-8 text-vintage-green" />
            Live Crowd Density
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {densities.map((d, idx) => (
              <div key={idx} className="bg-vintage-cream border-2 border-vintage-black p-4 relative overflow-hidden group">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-vintage-green/20 transition-all duration-1000" 
                  style={{ height: `${d.densityPercent}%` }} 
                />
                <h3 className="font-headline text-xl font-bold uppercase relative z-10">{d.zoneId}</h3>
                <p className="text-3xl font-mono font-bold mt-2 relative z-10">{d.densityPercent}%</p>
              </div>
            ))}
            {densities.length === 0 && <div className="text-vintage-black/50 font-bold uppercase col-span-4 p-4 border-2 border-dashed border-vintage-black">Awaiting telemetry...</div>}
          </div>
          
          <div className="mt-auto bg-vintage-cream border-4 border-vintage-black p-4">
            <h3 className="text-2xl font-headline font-black uppercase tracking-tighter mb-4 text-center">Stadium Sector Map</h3>
            <div className="bg-white border-2 border-vintage-black">
              <StadiumMap />
            </div>
          </div>
        </div>

        {/* Queues Panel */}
        <div className="bg-white border-4 border-vintage-black poster-shadow p-6">
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-4 border-vintage-black pb-4">
            <AlertTriangle className="w-8 h-8 text-vintage-red" />
            Gate Queues
          </h2>
          <div className="space-y-4">
            {queues.map((q, idx) => (
              <div key={idx} className="bg-vintage-cream border-2 border-vintage-black p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-headline text-2xl font-bold uppercase tracking-wider">{q.gateId}</span>
                  <span className={`font-mono text-xl font-bold ${q.estimatedWaitMinutes > 15 ? 'text-vintage-red' : 'text-vintage-green'}`}>
                    {q.estimatedWaitMinutes} MIN
                  </span>
                </div>
                <div className="w-full bg-white border-2 border-vintage-black h-4">
                  <div 
                    className={`h-full ${q.estimatedWaitMinutes > 15 ? 'bg-vintage-red' : 'bg-vintage-green'}`} 
                    style={{ width: `${Math.min(100, (q.queueLength / 500) * 100)}%` }}
                  />
                </div>
                <p className="font-bold text-sm uppercase mt-2 text-right">{q.queueLength} People</p>
              </div>
            ))}
            {queues.length === 0 && <div className="text-vintage-black/50 font-bold uppercase p-4 border-2 border-dashed border-vintage-black">No queues reported</div>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Situation Reports (Incidents) */}
        <div className="bg-white border-4 border-vintage-black poster-shadow p-6 flex flex-col">
          <div className="flex justify-between items-center border-b-4 border-vintage-black pb-4 mb-6">
            <h2 className="text-3xl font-headline font-black uppercase tracking-tighter text-vintage-orange">
              Situation Reports
            </h2>
            <button 
              onClick={createDummyIncident}
              className="p-2 bg-vintage-green text-white border-2 border-vintage-black hover:bg-vintage-green/80 flex items-center gap-1 uppercase font-bold text-xs"
              title="Spawn dummy incident for testing"
            >
              <Plus className="w-4 h-4" /> Report
            </button>
          </div>
          <div className="space-y-4">
            {incidents.map(inc => (
              <div key={inc.id} className="border-2 border-vintage-black">
                <button 
                  onClick={() => setExpandedAlert(expandedAlert === inc.id ? null : inc.id)}
                  className="w-full bg-vintage-cream p-4 flex justify-between items-center hover:bg-vintage-orange/10 transition-colors"
                >
                  <span className="font-headline text-xl font-bold uppercase tracking-wider text-left">{inc.loc}</span>
                  {expandedAlert === inc.id ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedAlert === inc.id && (
                  <div className="p-4 bg-white border-t-2 border-vintage-black font-bold uppercase text-sm leading-relaxed">
                    <p className="mb-4">{inc.desc}</p>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        placeholder="Resolution Action (e.g., Cleanup Dispatched)" 
                        value={resolveAction}
                        onChange={(e) => setResolveAction(e.target.value)}
                        className="p-2 border-2 border-vintage-black outline-none focus:border-vintage-green w-full"
                      />
                      <button 
                        onClick={() => resolveIncident(inc)}
                        disabled={!resolveAction.trim()}
                        className="px-4 py-2 bg-vintage-green text-white border-2 border-vintage-black font-headline text-lg uppercase tracking-widest w-full hover:bg-vintage-green/80 disabled:opacity-50 transition-colors"
                      >
                        Resolve Incident
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {incidents.length === 0 && <div className="text-vintage-black/50 font-bold uppercase p-4 border-2 border-dashed border-vintage-black">No active incidents</div>}
          </div>
        </div>

        {/* Announcements & Alerts */}
        <div className="bg-white border-4 border-vintage-black poster-shadow p-6 flex flex-col">
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter mb-6 flex items-center gap-3 border-b-4 border-vintage-black pb-4 text-vintage-green">
            <Megaphone className="w-8 h-8" />
            Announcements
          </h2>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Enter public announcement..." 
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="flex-1 p-3 border-4 border-vintage-black outline-none focus:border-vintage-green font-bold text-lg"
            />
            <button 
              onClick={publishAnnouncement}
              disabled={!announcementText.trim()}
              className="px-6 bg-vintage-green text-white border-4 border-vintage-black font-headline text-xl uppercase tracking-widest hover:bg-vintage-green/80 disabled:opacity-50 transition-colors"
            >
              Publish
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 border-2 border-vintage-black flex justify-between items-start gap-4 ${alert.type === 'resolution' ? 'bg-vintage-cream' : 'bg-vintage-orange/10'}`}>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-vintage-black/60 mb-1 block">
                    {alert.type}
                  </span>
                  <p className="font-bold text-lg leading-tight">{alert.message}</p>
                </div>
                <button 
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 bg-white border-2 border-vintage-black text-vintage-red hover:bg-vintage-red hover:text-white transition-colors"
                  title="Clear Alert"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-vintage-black/50 font-bold uppercase p-4 border-2 border-dashed border-vintage-black">No active announcements</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
