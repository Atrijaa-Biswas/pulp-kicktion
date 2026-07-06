import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * SIMULATED DATA — replace with real IoT/sensor feed in production.
 * This simulates live crowd density and queue lengths.
 */
export function startMockDataEngine() {
  if (typeof window === 'undefined') return; // Run on client side for the demo
  
  console.log("Starting mock data engine...");
  
  setInterval(async () => {
    try {
      const now = Date.now();
      
      const gates = ['G1', 'G2', 'G3', 'G4', 'G5'];
      for (const gate of gates) {
        await setDoc(doc(db, 'stadium_state', `queue_${gate}`), {
          type: 'queue',
          gateId: gate,
          queueLength: Math.floor(Math.random() * 150),
          estimatedWaitMinutes: Math.floor(Math.random() * 30),
          updatedAt: now
        });
      }
      
      const zones = ['NorthStand', 'SouthStand', 'EastStand', 'WestStand', 'ConcourseA'];
      for (const zone of zones) {
        await setDoc(doc(db, 'stadium_state', `density_${zone}`), {
          type: 'density',
          zoneId: zone,
          densityPercent: Math.floor(Math.random() * 100),
          updatedAt: now
        });
      }
      
      // Global stats for landing page
      await setDoc(doc(db, 'stadium_state', 'global_stats'), {
        type: 'stats',
        activeSessions: Math.floor(Math.random() * 5000) + 1000,
        activeAlerts: Math.floor(Math.random() * 5),
        updatedAt: now
      });
      
    } catch (err) {
      console.error('Mock data engine error:', err);
    }
  }, 10000); // 10s updates for a snappy demo
}
