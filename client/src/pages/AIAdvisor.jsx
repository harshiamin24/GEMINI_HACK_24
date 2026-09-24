import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingDown,
  Building2,
  Bike,
} from 'lucide-react';

const ADVISOR_SCENARIOS = [
  {
    title: 'Rain & Wet Weather Protocol',
    prompt: 'Current forecast indicates heavy rain in Midtown and Downtown. Provide an emergency operational adjustment plan for battery discharge, speed limits, and payload reduction.',
    icon: Zap,
    color: 'emerald',
  },
  {
    title: 'Micro-Hub Congestion Diagnostic',
    prompt: 'Central Station Hub is reaching 85% storage capacity. Recommend parcel redistribution and dispatch wave adjustments to avoid dock bottlenecking.',
    icon: Building2,
    color: 'amber',
  },
  {
    title: 'Fleet Battery Life Optimization',
    prompt: 'What charging cycles and state-of-charge thresholds should our dispatchers enforce to extend Li-ion cell life while sustaining 40km range per shift?',
    icon: Bike,
    color: 'cyan',
  },
  {
    title: 'Low-Emission Zone (LEZ) Expansion',
    prompt: 'City council announced a 3km expansion of the zero-emission zone next quarter. How many additional Heavy-Cargo-Trikes are required to replace current diesel subcontracting?',
    icon: Sparkles,
    color: 'purple',
  },
];

export default function AIAdvisor() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: `### 🤖 Gemini Logistics Systems Advisor Online\n\nI am initialized with urban last-mile micro-mobility schemas, fleet telemetry models, and low-emission zone parameters.\n\nSelect an operational scenario above or submit any inquiry regarding route bottlenecks, pre-positioning schedules, or payload mechanics.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryAdvisor(textToSend, {
        activeHubs: 4,
        totalParcels: 12,
        activeBikes: 9,
      });

      const aiMsg = {
        id: `a-${Date.now()}`,
        sender: 'ai',
        text: res.response || 'Operational playbook synthesized.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ Advisory engine error: ${err.message}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>AI Logistics Advisor</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Powered by Google Gemini 2.5 Flash
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Generative AI operational intelligence for dynamic routing, battery degradation troubleshooting, and fleet scaling
        </p>
      </div>

      {/* Scenario Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ADVISOR_SCENARIOS.map((sc, idx) => {
          const Icon = sc.icon;
          return (
            <div
              key={idx}
              onClick={() => handleSend(sc.prompt)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 shadow-lg cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="p-2 w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-xs mb-1">{sc.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-3">{sc.prompt}</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 mt-3 block group-hover:underline">
                Simulate Scenario →
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Advisory Consultation Stream */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Stream Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-500'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Gemini 2.5 Flash is analyzing urban logistics constraints...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Gemini AI for customized delivery advice, fleet rebalancing, or route simulations..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Consult</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
