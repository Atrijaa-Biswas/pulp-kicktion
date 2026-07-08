"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'fan' | 'staff'>('fan');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save role in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          role,
          email,
          createdAt: Date.now()
        });
        router.push(role === 'staff' ? '/dashboard' : '/fan-dashboard');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Let the AuthContext and protected routes handle redirection, or redirect here.
        // But we need to fetch the role here if we want immediate redirection.
        // It's safer to let the onAuthStateChanged in AuthContext set the role, but we'll 
        // redirect based on a quick check or just redirect to a neutral loading screen.
        // For simplicity, we just push to a check-role route, or we can await getDoc here.
        import("firebase/firestore").then(async ({ getDoc, doc }) => {
            const userDocSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
            if (userDocSnap.exists() && userDocSnap.data().role === 'staff') {
                router.push('/dashboard');
            } else {
                router.push('/fan-dashboard');
            }
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      import("firebase/firestore").then(async ({ getDoc, setDoc, doc }) => {
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          // New Google User, set default role as 'fan' or use the selected role if signing up
          const assignedRole = isSignUp ? role : 'fan';
          await setDoc(userDocRef, {
            role: assignedRole,
            email: result.user.email,
            createdAt: Date.now()
          });
          router.push(assignedRole === 'staff' ? '/dashboard' : '/fan-dashboard');
        } else {
          // Existing user
          const existingRole = userDocSnap.data().role;
          router.push(existingRole === 'staff' ? '/dashboard' : '/fan-dashboard');
        }
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl relative z-10 transition-all duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? "Join the Action" : "Welcome Back"}
          </h2>
          <p className="text-slate-400 text-center">
            {isSignUp ? "Create an account to access your stadium companion." : "Sign in to access your Pulp Kicktion experience."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setRole('fan')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'fan' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fan Account
              </button>
              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  role === 'staff' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Staff Account
              </button>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                {isSignUp ? "Sign Up" : "Sign In"}
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-slate-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold transition-all flex items-center justify-center gap-3"
        >
          Continue with Google
        </button>

        <p className="mt-8 text-center text-slate-400 text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
