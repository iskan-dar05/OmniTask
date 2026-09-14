import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Car,
  Clock,
  ArrowRight,
  Sparkles,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';
import { CalendarConflict, MeetingEvent } from '../types';

interface ConflictsViewProps {
  conflicts: CalendarConflict[];
  meetings: MeetingEvent[];
  onResolveConflict: (conflictId: string) => void;
  onAutoResolveAll: () => void;
  isResolving: boolean;
}

export const ConflictsView: React.FC<ConflictsViewProps> = ({
  conflicts,
  meetings,
  onResolveConflict,
  onAutoResolveAll,
  isResolving
}) => {
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);

  const handleCopyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-950 pb-20">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-950/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-100">Zero Calendar Friction</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
          OmniTask autonomous agent has arbitrated all calendar conflicts. High-priority P0 commitments are protected and travel buffers are strictly enforced.
        </p>
        <div className="mt-6 flex flex-col space-y-2 w-full max-w-xs text-left bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
          <div className="flex items-center text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Peninsula Commute Buffer: 35 min guaranteed</span>
          </div>
          <div className="flex items-center text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Board Meeting: Unbroken quorum preserved</span>
          </div>
          <div className="flex items-center text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Deep Focus: 90m block locked</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-20">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
            Arbitration Engine
          </span>
          <h2 className="text-base font-black text-slate-100">
            {conflicts.length} Pending Friction Points
          </h2>
        </div>

        <button
          id="btn-resolve-all-conflicts-tab"
          onClick={onAutoResolveAll}
          disabled={isResolving}
          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isResolving ? 'Arbitrating...' : 'Auto-Resolve All'}</span>
        </button>
      </div>

      {/* Conflicts List */}
      {conflicts.map((conflict) => {
        const { meetingA, meetingB, recommendedAction } = conflict;
        const targetMeeting = meetingA.id === recommendedAction.targetMeetingId ? meetingA : meetingB;
        const protectedMeeting = meetingA.id === recommendedAction.targetMeetingId ? meetingB : meetingA;

        return (
          <div
            key={conflict.id}
            id={`conflict-card-${conflict.id}`}
            className="bg-slate-900/95 border border-rose-500/40 rounded-xl p-4 shadow-lg relative overflow-hidden"
          >
            {/* Top Tag */}
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-[10px] font-bold flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {conflict.conflictType === 'insufficient_travel_buffer'
                  ? 'Commute Transit Buffer Violation'
                  : 'Direct Schedule Overlap'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Severity: CRITICAL
              </span>
            </div>

            {/* Explanation */}
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {conflict.explanation}
            </p>

            {/* Side by side comparison */}
            <div className="grid grid-cols-2 gap-2.5 my-3.5">
              {/* Meeting A */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-rose-400">{meetingA.priority} Priority</span>
                  <span>{meetingA.startTime} - {meetingA.endTime}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{meetingA.title}</h4>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center">
                  <MapPin className="w-2.5 h-2.5 mr-1 text-slate-500 inline" />
                  <span className="truncate">{meetingA.location}</span>
                </div>
              </div>

              {/* Meeting B */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-indigo-400">{meetingB.priority} Priority</span>
                  <span>{meetingB.startTime} - {meetingB.endTime}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{meetingB.title}</h4>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center">
                  <MapPin className="w-2.5 h-2.5 mr-1 text-slate-500 inline" />
                  <span className="truncate">{meetingB.location}</span>
                </div>
              </div>
            </div>

            {/* AI Decision & Proposed Solution */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-3 text-xs">
              <div className="flex items-center text-indigo-300 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                <span>LangChain Autonomous Arbitration Recommendation</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Protect <span className="text-indigo-200 font-bold">{protectedMeeting.title}</span> ({protectedMeeting.priority}).
                Relocate <span className="text-rose-300 font-bold">{targetMeeting.title}</span> to{' '}
                <span className="text-emerald-300 font-mono font-bold">
                  {recommendedAction.newSlot?.startTime} - {recommendedAction.newSlot?.endTime}
                </span>.
              </p>

              {/* Diplomatic Draft Preview */}
              <div className="mt-2 pt-2 border-t border-indigo-900/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="flex items-center text-indigo-300 font-medium">
                    <Mail className="w-3 h-3 mr-1" />
                    Diplomatic Notification Draft:
                  </span>
                  <button
                    onClick={() => handleCopyDraft(conflict.id, recommendedAction.diplomaticMessage)}
                    className="flex items-center text-indigo-400 hover:text-indigo-200"
                  >
                    {copiedDraftId === conflict.id ? (
                      <Check className="w-3 h-3 text-emerald-400 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    <span>{copiedDraftId === conflict.id ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2 rounded text-[10px] text-slate-300 font-mono italic leading-relaxed border border-slate-800">
                  "{recommendedAction.diplomaticMessage}"
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="mt-3 flex items-center justify-end">
              <button
                id={`btn-apply-conflict-${conflict.id}`}
                onClick={() => onResolveConflict(conflict.id)}
                disabled={isResolving}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-98 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Autonomous Re-Slot & Send Notice</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
