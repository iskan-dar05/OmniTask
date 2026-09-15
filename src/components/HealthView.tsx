import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Server,
  Cpu,
  Zap,
  CheckCircle2,
  RefreshCw,
  Clock,
  Car,
  Users,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ExecutiveProfile } from '../types';

interface HealthViewProps {
  profile: ExecutiveProfile;
  onUpdateProfile: (updated: ExecutiveProfile) => void;
  onResetAllData: () => void;
  isResetting?: boolean;
}

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  langchainVersion: string;
  langsmithTracing: string;
  hasGeminiApiKey: boolean;
  modules: {
    executive_agent: string;
    calendar_scanner: string;
    travel_buffer_engine: string;
    priority_arbitrator: string;
    email_synthesizer: string;
  };
  metrics?: {
    activeMeetings: number;
    pendingConflicts: number;
    openTasks: number;
    tracesLogged: number;
  };
}

export const HealthView: React.FC<HealthViewProps> = ({
  profile,
  onUpdateProfile,
  onResetAllData,
  isResetting = false
}) => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [threshold, setThreshold] = useState(profile.autonomousResolutionThreshold);
  const [travelBuffer, setTravelBuffer] = useState(profile.defaultTravelBufferMinutes);
  const [savedSettings, setSavedSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const checkHealth = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err) {
      console.error('Failed to fetch /api/health', err);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSavePolicy = () => {
    onUpdateProfile({
      ...profile,
      autonomousResolutionThreshold: threshold,
      defaultTravelBufferMinutes: travelBuffer
    });
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20">
      {/* Route Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Route /api/health</span>
            </div>
            <h2 className="text-lg font-black text-slate-100">System Health & Policy</h2>
          </div>

          <button
            id="btn-ping-health"
            onClick={checkHealth}
            disabled={isPinging}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isPinging ? 'Pinging...' : 'Ping API'}</span>
          </button>
        </div>

        {/* Latency & Status Pill Row */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Status</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {health?.status === 'ok' ? 'HEALTHY' : 'CONNECTING'}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Latency</span>
            <div className="text-sm font-bold text-slate-200 mt-0.5 font-mono">
              {latency !== null ? `${latency} ms` : '—'}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">LangChain</span>
            <div className="text-sm font-bold text-indigo-300 mt-0.5 font-mono">
              v0.3.18
            </div>
          </div>
        </div>
      </div>

      {/* Backend Modules Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 flex items-center">
          <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
          Microservice Module Statuses
        </h3>

        <div className="space-y-2">
          {[
            { name: 'Executive ReAct Agent (executive_agent.py)', status: health?.modules?.executive_agent || 'operational' },
            { name: 'Calendar Scanner Engine (tools/calendar/scan.py)', status: health?.modules?.calendar_scanner || 'active' },
            { name: 'Commute Travel Buffer (tools/scheduling/travel.py)', status: health?.modules?.travel_buffer_engine || 'active' },
            { name: 'Priority Conflict Arbitrator (tools/scheduling/priority.py)', status: health?.modules?.priority_arbitrator || 'active' },
            { name: 'Diplomatic Email Synthesizer (tools/communication/email.py)', status: health?.modules?.email_synthesizer || 'active' }
          ].map((mod, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800/60 rounded-lg text-xs">
              <span className="text-slate-300 font-medium">{mod.name}</span>
              <span className="flex items-center text-[10px] font-bold text-emerald-400 uppercase">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {mod.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Profile & Arbitration Weights */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/50"
            />
            <div>
              <h4 className="text-xs font-bold text-slate-100">{profile.name}</h4>
              <p className="text-[10px] text-slate-400">{profile.role} • {profile.company}</p>
            </div>
          </div>

          <span className="px-2 py-0.5 bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-bold">
            CEO Profile
          </span>
        </div>

        {/* Policy Sliders */}
        <div className="pt-2 border-t border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center">
              <Sliders className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              Arbitration Tuning
            </h4>
            {savedSettings && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Saved
              </span>
            )}
          </div>

          {/* Threshold Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Autonomous Resolution Confidence</span>
              <span className="font-mono text-indigo-400 font-bold">{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Confidence threshold required before auto-rescheduling meetings.
            </span>
          </div>

          {/* Travel Buffer Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Default Travel Transit Buffer</span>
              <span className="font-mono text-amber-400 font-bold">{travelBuffer} minutes</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={travelBuffer}
              onChange={(e) => setTravelBuffer(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">
              Enforced between in-person meetings with different addresses.
            </span>
          </div>

          <button
            id="btn-save-health-policy"
            onClick={handleSavePolicy}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            Update Policy Constraints
          </button>
        </div>
      </div>

      {/* VIP Contacts Roster */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center">
            <Users className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
            VIP Arbitration Weights
          </h3>
          <span className="text-[10px] text-slate-400">{profile.vipList.length} Contacts</span>
        </div>

        <div className="space-y-2">
          {profile.vipList.map((vip) => (
            <div key={vip.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">{vip.name}</h5>
                  <span className="text-[10px] text-slate-400">{vip.title}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    vip.tier === 'P0' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  }`}>
                    {vip.tier} ({Math.round(vip.weight * 100)}%)
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{vip.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reset State Action */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-300">Reset Initial Executive Dataset</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Reloads the demo calendar conflicts, initial tasks, and agent chat history.
            </p>
          </div>
          {confirmReset ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onResetAllData();
                  setConfirmReset(false);
                }}
                disabled={isResetting}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold active:scale-95"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-rose-900/30 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-semibold active:scale-95 transition-all flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
