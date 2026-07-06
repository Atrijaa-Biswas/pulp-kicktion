"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Mic, Settings2 } from "lucide-react";

export default function Assistant() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hi there! I'm Pulp Kicktion, your GenAI stadium companion for the 2026 World Cup. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        newMessages[newMessages.length - 1].content = "Sorry, I'm experiencing some difficulties right now. Please try again.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex flex-col flex-1 max-w-4xl mx-auto h-full border-x border-slate-200 bg-white">
        
        {/* Header */}
        <header className="p-4 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
          <h2 className="font-bold text-lg text-blue-600">Pulp Kicktion Fan Assistant</h2>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
            <Settings2 className="w-5 h-5" />
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => {
            // Strip out <ACTION>...</ACTION> from the displayed text
            const displayContent = m.content.replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '').trim();
            if (!displayContent && m.role === 'assistant' && !isLoading) return null;
            
            return (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}>
                {displayContent}
              </div>
            </div>
          )})}
          {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-3 text-sm animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <button type="button" className="p-3 text-slate-500 hover:bg-slate-100 rounded-full transition">
              <Mic className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-slate-100 border-none rounded-full px-6 outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
