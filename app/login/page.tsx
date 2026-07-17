"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Login() {
  const { user, role, loading, setRole } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<'fan' | 'staff'>('fan');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Handle automatic redirection if already logged in
  useEffect(() => {
    if (user && role) {
      router.push(role === 'staff' ? '/dashboard' : '/fan-dashboard');
    }
  }, [user, role, router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          role: selectedRole,
          email,
          createdAt: Date.now()
        });
        setRole(selectedRole);
        router.push(selectedRole === 'staff' ? '/dashboard' : '/fan-dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // For the demo, we allow the role selector on Sign In to overwrite the role in DB
        await setDoc(doc(db, "users", userCredential.user.uid), {
          role: selectedRole,
        }, { merge: true });
        setRole(selectedRole);
        router.push(selectedRole === 'staff' ? '/dashboard' : '/fan-dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsProcessing(false);
    }
  };

  const handleGoogleAuth = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        const assignedRole = selectedRole;
        await setDoc(userDocRef, {
          role: assignedRole,
          email: result.user.email,
          createdAt: Date.now()
        });
        setRole(assignedRole);
        router.push(assignedRole === 'staff' ? '/dashboard' : '/fan-dashboard');
      } else {
        // If document exists, update it for demo flexibility so user can switch roles
        const assignedRole = selectedRole;
        await setDoc(userDocRef, { role: assignedRole }, { merge: true });
        setRole(assignedRole);
        router.push(assignedRole === 'staff' ? '/dashboard' : '/fan-dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsProcessing(false);
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-vintage-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-vintage-cream text-vintage-black">
      
      <div className="w-full max-w-md bg-white rounded-xl border-4 border-vintage-black p-8 poster-shadow relative z-10 transition-all duration-500">
        
        <div className="flex flex-col items-center mb-8 border-b-4 border-vintage-black pb-6">
          <div className="w-16 h-16 bg-vintage-red flex items-center justify-center mb-4 border-2 border-vintage-black poster-shadow">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-headline text-4xl uppercase tracking-tighter text-center font-bold">
            {isSignUp ? "Join the Match" : "Welcome Back"}
          </h2>
          <p className="text-vintage-black/70 text-center font-medium mt-2 uppercase tracking-wide text-sm">
            {isSignUp ? "Secure your ticket to the stadium" : "Present your credentials"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-vintage-red text-white border-2 border-vintage-black font-bold text-sm poster-shadow">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="flex gap-4 p-2 bg-vintage-cream border-2 border-vintage-black poster-shadow mb-4">
            <button
              type="button"
              onClick={() => setSelectedRole('fan')}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                selectedRole === 'fan' ? 'bg-vintage-green text-white border-vintage-black' : 'bg-transparent text-vintage-black border-transparent hover:bg-vintage-green/10'
              }`}
            >
              Fan
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('staff')}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider border-2 transition-all ${
                selectedRole === 'staff' ? 'bg-vintage-orange text-white border-vintage-black' : 'bg-transparent text-vintage-black border-transparent hover:bg-vintage-orange/10'
              }`}
            >
              Staff
            </button>
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vintage-black/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-white border-4 border-vintage-black py-3 pl-12 pr-4 text-vintage-black placeholder:text-vintage-black/50 focus:outline-none focus:ring-4 focus:ring-vintage-green transition-all font-bold"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-vintage-black/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-white border-4 border-vintage-black py-3 pl-12 pr-4 text-vintage-black placeholder:text-vintage-black/50 focus:outline-none focus:ring-4 focus:ring-vintage-green transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-vintage-green text-white font-headline text-2xl uppercase tracking-wider border-4 border-vintage-black poster-shadow hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-6 h-6" />
                {isSignUp ? "Sign Up" : "Sign In"}
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-1 bg-vintage-black"></div>
          <span className="font-headline font-bold text-lg uppercase tracking-wider">OR</span>
          <div className="flex-1 h-1 bg-vintage-black"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isProcessing}
          className="w-full py-4 bg-white text-vintage-black font-headline text-xl uppercase tracking-wider border-4 border-vintage-black poster-shadow hover:bg-vintage-cream transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with Google
        </button>

        <p className="mt-8 text-center font-bold text-sm uppercase tracking-wide">
          {isSignUp ? "Already hold a ticket?" : "Need a ticket?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-vintage-red hover:underline ml-1"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
