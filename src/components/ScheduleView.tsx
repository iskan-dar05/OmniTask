import React, { useState } from 'react';
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
  Flame
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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const sortedMeetings = [...meetings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar pb-20">
      {/* Date Header & Quick Summary */}
      <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Tuesday, September 15, 2026
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Executive Day Matrix</h2>
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
            <span className="text-[10px] text-slate-400 uppercase font-medium">Active Friction</span>
            <div className={`text-base font-bold mt-0.5 ${conflicts.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {conflicts.length} Conflicts
            </div>
          </div>
        </div>

        {/* Autonomous Conflict Notification Card */}
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
                      {conflicts.length} High-Stakes Conflicts Detected
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
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isResolving ? 'Arbitrating with LangChain...' : 'Auto-Resolve All with 1 Click'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
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

          // Compute travel buffer delta to previous event if physical
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
                <div className="my-1.5 mx-3 px-3 py-1.5 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-center justify-between text-[11px] text-amber-300">
                  <div className="flex items-center space-x-2">
                    <Car className="w-3.5 h-3.5 text-amber-400" />
                    <span>Transit commute: Palo Alto ➔ Downtown SF</span>
                  </div>
                  <span className="font-semibold text-amber-400">~35m buffer needed</span>
                </div>
              )}

              {/* Main Card */}
              <div
                id={`event-card-${meeting.id}`}
                onClick={() => setSelectedEventId(isExpanded ? null : meeting.id)}
                className={`bg-slate-900/90 hover:bg-slate-800/90 border rounded-xl p-3.5 transition-all cursor-pointer border-l-4 ${
                  style.border
                } ${
                  isConflicted
                    ? 'border-rose-500/70 shadow-lg shadow-rose-950/20 ring-1 ring-rose-500/30'
                    : isRescheduled
                    ? 'border-amber-500/50 bg-slate-900/95'
                    : 'border-slate-800/90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    {/* Time and Status Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center text-xs font-bold text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {meeting.startTime} - {meeting.endTime}
                      </span>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${style.badge}`}>
                        {meeting.priority}
                      </span>

                      {isConflicted && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full flex items-center animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                          Conflict
                        </span>
                      )}

                      {isRescheduled && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-amber-400" />
                          AI Adjusted
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-100 mt-1.5 leading-snug">
                      {meeting.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                      {meeting.locationType === 'in-person' ? (
                        <span className="flex items-center text-slate-300">
                          <MapPin className="w-3 h-3 text-rose-400 mr-1 inline" />
                          {meeting.location}
                        </span>
                      ) : (
                        <span className="flex items-center text-indigo-300">
                          <Video className="w-3 h-3 text-indigo-400 mr-1 inline" />
                          {meeting.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                </div>

                {/* Attendees list chips */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {meeting.attendees.map((att, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium border border-slate-700/60"
                    >
                      {att}
                    </span>
                  ))}
                </div>

                {/* Conflict Resolution Banner inside Card */}
                {isConflicted && matchingConflict && (
                  <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-rose-300 font-semibold flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
                        {matchingConflict.explanation}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
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

                {/* Expanded Details Accordion */}
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
    </div>
  );
};
