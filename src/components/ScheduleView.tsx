import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Car,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Plus,
  Video,
  ExternalLink,
  Flame,
  Zap,
  Mail,
  Copy,
  Check,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { MeetingEvent, CalendarConflict, PriorityLevel } from '../types';

interface ScheduleViewProps {
  meetings: MeetingEvent[];
  conflicts: CalendarConflict[];
  onResolveConflict: (conflictId: string) => void;
  onAutoResolveAll: () => void;
  isResolving: boolean;
  onSelectMeetingForChat: (meeting: MeetingEvent) => void;
  onOpenAddModal: () => void;
}

const PRIORITY_STYLES: Record<PriorityLevel, { badge: string; border: string; text: string; label: string }> = {
  P0: {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    border: 'border-l-rose-500',
    text: 'text-rose-400',
    label: 'P0 Board / Lead Investor'
  },
  P1: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    border: 'border-l-indigo-500',
    text: 'text-indigo-400',
    label: 'P1 Executive & VIP'
  },
  P2: {
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    border: 'border-l-sky-500',
    text: 'text-sky-400',
    label: 'P2 Internal Sync'
  },
  P3: {
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    border: 'border-l-slate-500',
    text: 'text-slate-400',
    label: 'P3 External / Advisory'
  },
  P4: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'border-l-emerald-500',
    text: 'text-emerald-400',
    label: 'P4 Protected Deep Focus'
  }
};

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  meetings,
  conflicts,
  onResolveConflict,
  onAutoResolveAll,
  isResolving,
  onSelectMeetingForChat,
  onOpenAddModal
}) => {
  const [subTab, setSubTab] = useState<'timeline' | 'arbitration' | 'slots'>('timeline');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [openSlots, setOpenSlots] = useState<{ startTime: string; endTime: string; duration: string; note: string }[]>([]);

  useEffect(() => {
    fetch('/api/schedule/slots')
      .then(res => res.json())
      .then(data => {
        if (data.availableSlots) setOpenSlots(data.availableSlots);
      })
      .catch(err => console.error('Error fetching open slots:', err));
  }, []);

  const handleCopyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(id);
    setTimeout(() => setCopiedDraftId(null), 2000);
  };

  const sortedMeetings = [...meetings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar pb-20">
      {/* Date Header & Quick Summary */}
      <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Route /api/schedule/today
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Executive Schedule</h2>
          </div>
          <button
            id="btn-add-schedule-event"
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Executive Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Slots Total</span>
            <div className="text-base font-bold text-slate-200 mt-0.5">{meetings.length} Events</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Deep Focus</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">90m Locked</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Friction Points</span>
            <div className={`text-base font-bold mt-0.5 ${conflicts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {conflicts.length} Conflicts
            </div>
          </div>
        </div>

        {/* Autonomous Conflict Notification Card if conflicts exist */}
        {conflicts.length > 0 && (
          <div className="mt-3.5 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900 border border-rose-500/40 rounded-xl p-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <div className="p-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg text-rose-400 mt-0.5">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-rose-300">
                      {conflicts.length} High-Stakes Friction Points
                    </span>
                    <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-bold rounded">
                      Action Required
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    LangChain ReAct arbitrator has computed non-destructive re-slots and diplomatic drafts.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end space-x-2">
              <button
                id="btn-auto-resolve-all-schedule"
                onClick={onAutoResolveAll}
                disabled={isResolving}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-98 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isResolving ? 'Arbitrating with LangChain...' : 'Auto-Resolve All with 1 Click'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Segmented Sub-Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 mt-3.5">
          <button
            id="subtab-timeline"
            onClick={() => setSubTab('timeline')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              subTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Day Timeline
          </button>
          <button
            id="subtab-arbitration"
            onClick={() => setSubTab('arbitration')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
              subTab === 'arbitration'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Arbitration</span>
            {conflicts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {conflicts.length}
              </span>
            )}
          </button>
          <button
            id="subtab-slots"
            onClick={() => setSubTab('slots')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              subTab === 'slots'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Slots
          </button>
        </div>
      </div>

      {/* VIEW 1: Timeline View */}
      {subTab === 'timeline' && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>TIME & COMMUTE FLOW</span>
            <span>PRIORITY TIER</span>
          </div>

          {sortedMeetings.map((meeting, index) => {
            const style = PRIORITY_STYLES[meeting.priority] || PRIORITY_STYLES.P2;
            const isConflicted = meeting.status === 'conflicted';
            const isRescheduled = meeting.status === 'rescheduled';
            const matchingConflict = conflicts.find(
              (c) => c.meetingA.id === meeting.id || c.meetingB.id === meeting.id
            );
            const isExpanded = selectedEventId === meeting.id;

            const prevMeeting = index > 0 ? sortedMeetings[index - 1] : null;
            const showTravelAlert =
              prevMeeting &&
              prevMeeting.locationType === 'in-person' &&
              meeting.locationType === 'in-person' &&
              prevMeeting.location !== meeting.location;

            return (
              <div key={meeting.id} className="relative group">
                {/* Commute Transit Indicator if needed */}
                {showTravelAlert && (
                  <div className="my-2 p-2 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-center justify-between text-[11px] text-amber-300">
                    <div className="flex items-center space-x-2">
                      <Car className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Peninsula Commute Hazard: ~38 min transit required
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                      Buffer Violated
                    </span>
                  </div>
                )}

                {/* Event Card */}
                <div
                  id={`meeting-card-${meeting.id}`}
                  onClick={() => setSelectedEventId(isExpanded ? null : meeting.id)}
                  className={`border-l-4 ${style.border} rounded-r-xl p-3.5 bg-slate-900/90 border-y border-r border-slate-800/90 hover:border-slate-700 transition-all cursor-pointer ${
                    isConflicted ? 'ring-1 ring-rose-500/60 bg-rose-950/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${style.badge}`}>
                          {meeting.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {meeting.category}
                        </span>
                        {isRescheduled && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 font-semibold">
                            Rescheduled
                          </span>
                        )}
                        {isConflicted && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white rounded font-bold animate-pulse flex items-center">
                            <AlertTriangle className="w-3 h-3 mr-0.5" />
                            Collision
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
                        {meeting.title}
                      </h4>

                      <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center font-mono font-semibold text-slate-200">
                          <Clock className="w-3 h-3 mr-1 text-slate-500" />
                          {meeting.startTime} - {meeting.endTime}
                        </span>
                        <span className="flex items-center truncate max-w-[190px]">
                          {meeting.locationType === 'in-person' ? (
                            <MapPin className="w-3 h-3 mr-1 text-amber-400 shrink-0" />
                          ) : (
                            <Video className="w-3 h-3 mr-1 text-indigo-400 shrink-0" />
                          )}
                          <span className="truncate">{meeting.location}</span>
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`}
                    />
                  </div>

                  {/* Conflict Notice if this meeting is involved */}
                  {matchingConflict && (
                    <div className="mt-3 p-2 bg-rose-950/40 border border-rose-500/40 rounded-lg text-xs">
                      <div className="flex items-center justify-between text-[10px] text-rose-300 font-bold mb-1">
                        <span className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
                          {matchingConflict.conflictType.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-mono">Arbitrable</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">
                        {matchingConflict.explanation}
                      </p>
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-rose-900/50">
                        <span className="text-[9px] text-indigo-300">
                          Recommended: Shift to {matchingConflict.recommendedAction.newSlot?.startTime}
                        </span>
                        <button
                          id={`btn-resolve-single-${matchingConflict.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onResolveConflict(matchingConflict.id);
                          }}
                          disabled={isResolving}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold shadow transition-all"
                        >
                          Auto-Resolve
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expanded Accordion Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2 text-slate-300 animate-in fade-in duration-200">
                      {meeting.notes && (
                        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">Executive Context</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed">{meeting.notes}</p>
                        </div>
                      )}

                      {meeting.agenda && meeting.agenda.length > 0 && (
                        <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Key Agenda Topics</span>
                          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                            {meeting.agenda.map((ag, idx) => (
                              <li key={idx}>{ag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMeetingForChat(meeting);
                          }}
                          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded border border-indigo-500/40 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Ask OmniTask to Re-Slot</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Arbitration Matrix */}
      {subTab === 'arbitration' && (
        <div className="p-4 space-y-4">
          {conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Zero Schedule Collisions</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                All P0 board commitments are protected and safe Peninsula transit buffers are preserved.
              </p>
            </div>
          ) : (
            conflicts.map((conflict) => {
              const { meetingA, meetingB, recommendedAction } = conflict;
              const targetMeeting = meetingA.id === recommendedAction.targetMeetingId ? meetingA : meetingB;
              const protectedMeeting = meetingA.id === recommendedAction.targetMeetingId ? meetingB : meetingA;

              return (
                <div
                  key={conflict.id}
                  id={`conflict-card-${conflict.id}`}
                  className="bg-slate-900 border border-rose-500/40 rounded-xl p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" />
                      {conflict.conflictType.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] bg-rose-500/20 text-rose-300 font-bold rounded-full border border-rose-500/30">
                      CRITICAL
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-snug">
                    {conflict.explanation}
                  </p>

                  {/* Priority Yield Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-500/30">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase block">Protected (Preserved)</span>
                      <h5 className="font-bold text-slate-100 text-[11px] mt-0.5 truncate">{protectedMeeting.title}</h5>
                      <span className="text-[10px] text-slate-400">{protectedMeeting.startTime} - {protectedMeeting.endTime}</span>
                    </div>

                    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/30">
                      <span className="text-[9px] text-amber-400 font-bold uppercase block">To Yield &amp; Reschedule</span>
                      <h5 className="font-bold text-slate-100 text-[11px] mt-0.5 truncate">{targetMeeting.title}</h5>
                      <span className="text-[10px] text-slate-400">Yield to {recommendedAction.newSlot?.startTime}</span>
                    </div>
                  </div>

                  {/* Diplomatic Email Draft */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-indigo-300 font-semibold">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Diplomatic Notice Draft ({targetMeeting.organizer})
                      </span>
                      <button
                        onClick={() => handleCopyDraft(conflict.id, recommendedAction.diplomaticMessage)}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white"
                      >
                        {copiedDraftId === conflict.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800/80 leading-relaxed">
                      &quot;{recommendedAction.diplomaticMessage}&quot;
                    </p>
                  </div>

                  {/* 1-Click Resolve Action */}
                  <button
                    onClick={() => onResolveConflict(conflict.id)}
                    disabled={isResolving}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Apply Autonomous Displacement ({recommendedAction.newSlot?.startTime})</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 3: Open Recommended Slots */}
      {subTab === 'slots' && (
        <div className="p-4 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
              Route /api/schedule/slots
            </span>
            <h4 className="text-sm font-bold text-slate-100">Conflict-Free Open Windows</h4>
            <p className="text-xs text-slate-400 mt-1">
              Calculated dynamically with 30m commute buffers and 90m deep focus preservation.
            </p>
          </div>

          <div className="space-y-2.5">
            {openSlots.map((slot, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-emerald-400">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 font-bold rounded-full">
                      {slot.duration}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{slot.note}</p>
                </div>

                <button
                  onClick={onOpenAddModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
