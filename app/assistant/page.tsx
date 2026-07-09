"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, Settings2, ArrowLeft, Trophy } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StadiumMap from "@/components/StadiumMap";

export default function Assistant() {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "WELCOME TO THE MATCH. I AM YOUR GEN-AI COMPANION. DO YOU NEED ASSISTANCE WITH DIRECTIONS, FOOD, OR INCIDENTS?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!loading && (!user || role !== 'fan')) {
      router.push('/login');
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Parse the latest assistant message for keywords to highlight the map
    const latestAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant');
    if (latestAssistantMessage) {
      const content = latestAssistantMessage.content.toLowerCase();
      // Simple simulated keyword matching
      if (content.includes('north') || content.includes('gate 1') || content.includes('food')) {
        setActiveZone('NorthStand');
      } else if (content.includes('south') || content.includes('gate 2') || content.includes('restroom')) {
        setActiveZone('SouthStand');
      } else if (content.includes('east') || content.includes('gate 3')) {
        setActiveZone('EastStand');
      } else if (content.includes('west') || content.includes('gate 4') || content.includes('exit')) {
        setActiveZone('WestStand');
      } else if (content.includes('incident')) {
        // Just highlight somewhere if it's an incident
        setActiveZone('NorthStand');
      } else {
        setActiveZone(undefined);
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    // Create a placeholder for the assistant response
    setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: { location: "Unknown" } })
      });

      if (!res.ok) throw new Error("API failed");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].content += text;
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = "CONNECTION LOST. PLEASE TRY AGAIN.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex h-screen bg-vintage-cream text-vintage-black font-sans animate-fade-in">
      
      {/* Left Panel: Chat Interface */}
      <div className="flex flex-col w-full lg:w-1/2 h-full border-r-4 border-vintage-black bg-white relative z-10 poster-shadow">
        
        {/* Header */}
        <header className="p-4 border-b-4 border-vintage-black bg-vintage-green text-white flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <Link href="/fan-dashboard" className="p-2 text-white hover:bg-white/20 border-2 border-transparent hover:border-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h2 className="font-headline font-black text-2xl uppercase tracking-widest leading-none drop-shadow-[2px_2px_0px_#1A1A1A]">Pulp Kicktion AI</h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Terminal: {user.email?.split('@')[0]}</p>
            </div>
          </div>
          <button className="p-2 text-white hover:bg-white/20 border-2 border-transparent hover:border-white transition-colors">
            <Settings2 className="w-6 h-6" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\' opacity=\\'0.03\\'/%3E%3C/svg%3E')]">
          {messages.map((m, idx) => {
            const displayContent = m.content.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '').trim();
            if (!displayContent && m.role === 'assistant' && !isLoading) return null;
            
            return (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-6 py-4 border-4 border-vintage-black poster-shadow ${
                m.role === 'user' 
                  ? 'bg-vintage-green text-white text-right' 
                  : 'bg-vintage-cream text-vintage-black'
              }`}>
                <p className="font-bold uppercase tracking-wide leading-relaxed text-sm md:text-base">
                  {displayContent}
                </p>
              </div>
            </div>
          )})}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-vintage-cream border-4 border-vintage-black poster-shadow px-6 py-4 flex items-center gap-2">
                <span className="font-bold uppercase tracking-widest text-sm text-vintage-black/70">Processing</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-vintage-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-vintage-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-vintage-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t-4 border-vintage-black z-10">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <button type="button" className="p-4 bg-vintage-cream border-4 border-vintage-black poster-shadow hover:translate-y-1 hover:shadow-none transition-all">
              <Mic className="w-6 h-6" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ENTER COMMAND..." 
              className="flex-1 bg-vintage-cream border-4 border-vintage-black px-6 outline-none focus:ring-4 focus:ring-vintage-green transition-all font-bold uppercase tracking-wide placeholder:text-vintage-black/40"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-4 bg-vintage-red text-white border-4 border-vintage-black poster-shadow hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel: Interactive Stadium Map */}
      <div className="hidden lg:flex flex-col w-1/2 h-full bg-vintage-green relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-vintage-yellow/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-vintage-orange/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10">
          <div className="bg-white p-8 border-4 border-vintage-black poster-shadow w-full max-w-2xl">
            <div className="flex justify-between items-center mb-8 border-b-4 border-vintage-black pb-4">
              <h2 className="font-headline font-black text-4xl uppercase tracking-tighter text-vintage-orange flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                Sector Map
              </h2>
              <div className="px-3 py-1 bg-vintage-black text-vintage-cream font-bold text-xs uppercase tracking-widest border-2 border-vintage-black">
                Simulated Data
              </div>
            </div>
            
            <div className="w-full flex justify-center items-center">
              <StadiumMap activeZone={activeZone} />
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-vintage-orange border-2 border-vintage-black"></div>
                <span className="font-bold text-sm uppercase tracking-wide">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-vintage-cream border-2 border-vintage-black"></div>
                <span className="font-bold text-sm uppercase tracking-wide">Standard</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
