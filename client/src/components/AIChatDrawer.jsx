import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, RefreshCw, Zap, Lightbulb, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  'How do we handle delivery delay during peak rain in Downtown Core?',
  'Recommend pre-positioning strategy for high-volume parcels tonight.',
  'Analyze battery buffer safety margin for Class-1 bikes on 15% incline.',
  'What is the estimated carbon offset of adding 4 trikes to Midtown Hub?',
];

export default function AIChatDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "👋 Hello! I'm **UrbanLogix AI Logistics Advisor**, powered by Google Gemini 2.5 Flash.\n\nI can analyze parcel allocation, simulate micro-hub storage congestion, calculate battery degradation under wet/hilly conditions, and evaluate your fleet's net-zero carbon offsets.\n\nHow can I optimize your logistics operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.queryAdvisor(textToSend, {
        activeHubs: 4,
        totalParcels: 12,
        activeBikes: 9,
      });

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.response || 'Operational strategy generated successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Error generating AI consultation: ${err.message}. Please verify Gemini API connectivity.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Gemini Logistics Advisor</h3>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  gemini-2.5-flash
                </span>
              </div>
              <p className="text-xs text-slate-400">Micro-Mobility Dispatch & Telemetry Intelligence</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto flex gap-2 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs shrink-0 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-emerald-400" />
              <span>{prompt.slice(0, 38)}...</span>
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-600/10'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none prose prose-invert prose-sm'
                }`}
              >
                <div className="whitespace-pre-line font-sans">{msg.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-slate-300">
                Synthesizing fleet telemetry with Gemini 2.5 Flash...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini to optimize routes, troubleshoot battery drain, or plan allocations..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Powered by Google Gemini 2.5 Flash SDK • Tailored for Urban Cargo Bike Optimization
          </p>
        </div>
      </div>
    </div>
  );
}
