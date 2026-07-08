"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  role: 'fan' | 'staff' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'fan' | 'staff' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch role from Firestore
        try {
          // Add a timeout to getDoc so it doesn't hang forever if Firestore is offline
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          const docPromise = getDoc(userDocRef);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
          
          const userDocSnap = (await Promise.race([docPromise, timeoutPromise])) as unknown as import('firebase/firestore').DocumentSnapshot;

          if (userDocSnap.exists()) {
            setRole(userDocSnap.data().role as 'fan' | 'staff');
          } else {
            setRole('fan');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole('fan'); // fallback
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
