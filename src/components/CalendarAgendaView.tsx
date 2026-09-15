import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Car,
  Plus,
  Video,
  Trash2,
  Scan,
  AlertTriangle,
  CheckCircle2,
  Filter,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { MeetingEvent, PriorityLevel, CalendarConflict } from '../types';

interface CalendarAgendaViewProps {
  meetings: MeetingEvent[];
  conflicts: CalendarConflict[];
  onOpenAddModal: () => void;
  onDeleteEvent: (id: string) => void;
  onScanCalendar: () => void;
  isScanning?: boolean;
  onSelectMeetingForChat: (meeting: MeetingEvent) => void;
}

const PRIORITY_BADGES: Record<PriorityLevel, { bg: string; text: string }> = {
  P0: { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300', text: 'text-rose-400' },
  P1: { bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', text: 'text-indigo-400' },
  P2: { bg: 'bg-sky-500/20 border-sky-500/40 text-sky-300', text: 'text-sky-400' },
  P3: { bg: 'bg-slate-500/20 border-slate-500/40 text-slate-300', text: 'text-slate-400' },
  P4: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'text-emerald-400' }
};

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  meetings,
  conflicts,
  onOpenAddModal,
  onDeleteEvent,
  onScanCalendar,
  isScanning = false,
  onSelectMeetingForChat
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Day picker days
  const days = [
    { label: 'Mon', num: '14', date: '2026-09-14' },
    { label: 'Tue', num: '15', date: '2026-09-15', isToday: true },
    { label: 'Wed', num: '16', date: '2026-09-16' },
    { label: 'Thu', num: '17', date: '2026-09-17' },
    { label: 'Fri', num: '18', date: '2026-09-18' }
  ];

  const categories = ['All', 'Investor', 'Board', 'Strategy', '1-on-1', 'Deep Focus'];

  const filteredMeetings = meetings
    .filter((m) => m.date === selectedDate)
    .filter((m) => selectedCategory === 'All' || m.category === selectedCategory)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar pb-20">
      {/* Header & Controls */}
      <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Route /api/calendar/events
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Executive Calendar</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="btn-scan-calendar"
              onClick={onScanCalendar}
              disabled={isScanning}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
              title="Trigger Conflict & Commute Scan"
            >
              <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
            </button>
            <button
              id="btn-calendar-add-event"
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Day Selector Horizontal Strip */}
        <div className="flex items-center justify-between mt-3.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
          {days.map((day) => {
            const isSelected = selectedDate === day.date;
            return (
              <button
                key={day.date}
                id={`calendar-day-${day.num}`}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="text-[10px] uppercase font-semibold tracking-wider opacity-80">
                  {day.label}
                </span>
                <span className="text-sm font-black mt-0.5">{day.num}</span>
                {day.isToday && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 mt-3 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-semibold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-14 px-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
            <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No events scheduled</h4>
            <p className="text-xs text-slate-500 mt-1">Tap &quot;New&quot; to schedule an executive session on this date.</p>
          </div>
        ) : (
          filteredMeetings.map((event) => {
            const isConflicted = conflicts.some(
              (c) => c.meetingA.id === event.id || c.meetingB.id === event.id
            );
            const isExpanded = expandedEventId === event.id;
            const priorityInfo = PRIORITY_BADGES[event.priority] || PRIORITY_BADGES.P2;

            return (
              <div
                key={event.id}
                id={`calendar-event-card-${event.id}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  isConflicted
                    ? 'bg-slate-900/90 border-rose-500/50 shadow-sm shadow-rose-950/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${priorityInfo.bg}`}>
                        {event.priority}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-medium bg-slate-800 text-slate-300 rounded-md">
                        {event.category}
                      </span>
                      {isConflicted && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-md flex items-center animate-pulse">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Conflict
                        </span>
                      )}
                      {event.status === 'rescheduled' && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/40">
                          Rescheduled
                        </span>
                      )}
                    </div>

                    <h4
                      onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                      className="text-xs font-bold text-slate-100 hover:text-indigo-300 cursor-pointer transition-colors"
                    >
                      {event.title}
                    </h4>

                    {/* Time & Location */}
                    <div className="flex items-center space-x-3 mt-1.5 text-[10px] text-slate-400 flex-wrap gap-y-1">
                      <span className="flex items-center font-mono font-semibold text-slate-300">
                        <Clock className="w-3 h-3 mr-1 text-slate-500" />
                        {event.startTime} - {event.endTime}
                      </span>
                      <span className="flex items-center truncate max-w-[180px]">
                        {event.locationType === 'in-person' ? (
                          <MapPin className="w-3 h-3 mr-1 text-amber-400 shrink-0" />
                        ) : (
                          <Video className="w-3 h-3 mr-1 text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate">{event.location}</span>
                      </span>
                    </div>

                    {/* Travel Buffer Warning */}
                    {event.travelBufferMinutes > 0 && (
                      <div className="flex items-center text-[10px] text-amber-400 font-medium mt-1.5">
                        <Car className="w-3 h-3 mr-1" />
                        <span>Requires {event.travelBufferMinutes}m Transit Buffer</span>
                      </div>
                    )}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      onClick={() => onSelectMeetingForChat(event)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Ask AI Agent about this meeting"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Card */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2 animate-in fade-in duration-150">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Attendees</span>
                      <p className="text-slate-300 text-[11px]">{event.attendees.join(', ')}</p>
                    </div>

                    {event.notes && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Notes</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{event.notes}</p>
                      </div>
                    )}

                    {event.agenda && event.agenda.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Key Agenda</span>
                        <ul className="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
                          {event.agenda.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Organizer: {event.organizer}</span>
                      <button
                        onClick={() => onSelectMeetingForChat(event)}
                        className="text-indigo-400 hover:underline font-semibold flex items-center"
                      >
                        Ask ReAct Agent to Reschedule
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
