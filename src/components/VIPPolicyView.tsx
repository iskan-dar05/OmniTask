import React, { useState } from 'react';
import { Users, Shield, Sliders, Clock, Car, Plus, Star, CheckCircle2 } from 'lucide-react';
import { ExecutiveProfile, VIPContact } from '../types';

interface VIPPolicyViewProps {
  profile: ExecutiveProfile;
  onUpdateProfile: (updated: ExecutiveProfile) => void;
}

export const VIPPolicyView: React.FC<VIPPolicyViewProps> = ({ profile, onUpdateProfile }) => {
  const [threshold, setThreshold] = useState(profile.autonomousResolutionThreshold);
  const [travelBuffer, setTravelBuffer] = useState(profile.defaultTravelBufferMinutes);
  const [focusMinutes, setFocusMinutes] = useState(profile.minFocusBlockMinutes);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = () => {
    onUpdateProfile({
      ...profile,
      autonomousResolutionThreshold: threshold,
      defaultTravelBufferMinutes: travelBuffer,
      minFocusBlockMinutes: focusMinutes
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs mb-1">
          <Shield className="w-4 h-4" />
          <span>EXECUTIVE ARBITRATION POLICY</span>
        </div>
        <h2 className="text-base font-black text-slate-100">
          VIP Strategic Weights & Rules
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          OmniTask uses these parameters in LangChain ReAct loops to resolve schedule conflicts and enforce transit buffers autonomously.
        </p>
      </div>

      {/* Sliders Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-200 flex items-center">
            <Sliders className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
            Autonomous Decision Thresholds
          </h3>
          {saved && (
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Settings Saved
            </span>
          )}
        </div>

        {/* Threshold Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Autonomous Confidence Threshold</span>
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
            Actions with priority delta &gt; {Math.round(threshold * 100)}% will auto-apply without CEO manual confirmation.
          </span>
        </div>

        {/* Travel Buffer Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Mandatory Commute Buffer</span>
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
            Required gap between in-person meetings across Peninsula & SF.
          </span>
        </div>

        {/* Deep Focus Duration */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">Daily Protected Focus Block</span>
            <span className="font-mono text-emerald-400 font-bold">{focusMinutes} minutes</span>
          </div>
          <input
            type="range"
            min="60"
            max="180"
            step="15"
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">
            OmniTask will defensively shield this window from routine team syncs.
          </span>
        </div>

        <button
          onClick={handleSaveSettings}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all active:scale-98"
        >
          Update Autonomous Policy
        </button>
      </div>

      {/* VIP Contacts List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-slate-400 font-bold uppercase text-[10px]">
            VIP TIER ROSTER ({profile.vipList.length})
          </span>
          <span className="text-indigo-400 font-medium text-[11px]">Strategic Weight</span>
        </div>

        {profile.vipList.map((vip) => (
          <div
            key={vip.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  vip.tier === 'P0'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : vip.tier === 'P1'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                }`}
              >
                {vip.tier}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100">{vip.name}</h4>
                <div className="text-[10px] text-slate-400">{vip.title}</div>
                <div className="text-[9px] text-slate-500 italic mt-0.5">{vip.notes}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-amber-400">
                {(vip.weight * 100).toFixed(0)}%
              </div>
              <span className="text-[9px] text-slate-500 block">Weight</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
