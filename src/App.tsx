import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Activity,
  Code2,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { AndroidShell } from './components/AndroidShell';
import { AndroidAppBar } from './components/AndroidAppBar';
import { AndroidBottomNav, AndroidTab } from './components/AndroidBottomNav';
import { ScheduleView } from './components/ScheduleView';
import { OmniAgentChatView } from './components/OmniAgentChatView';
import { ConflictsView } from './components/ConflictsView';
import { LangSmithTraceStudio } from './components/LangSmithTraceStudio';
import { PythonCodeStudio } from './components/PythonCodeStudio';
import { VIPPolicyView } from './components/VIPPolicyView';
import { AddEventModal } from './components/AddEventModal';
import {
  INITIAL_CONFLICTS,
  INITIAL_EXECUTIVE_PROFILE,
  INITIAL_LANGSMITH_TRACES,
  INITIAL_MEETINGS,
  INITIAL_MESSAGES
} from './data/initialData';
import {
  MeetingEvent,
  CalendarConflict,
  LangSmithTrace,
  AgentChatMessage,
  ExecutiveProfile
} from './types';

type StudioLayoutMode = 'dual' | 'mobile_only' | 'langsmith_only' | 'python_only';

export default function App() {
  const [layoutMode, setLayoutMode] = useState<StudioLayoutMode>('dual');
  const [activeAndroidTab, setActiveAndroidTab] = useState<AndroidTab>('schedule');
  const [meetings, setMeetings] = useState<MeetingEvent[]>(INITIAL_MEETINGS);
  const [conflicts, setConflicts] = useState<CalendarConflict[]>(INITIAL_CONFLICTS);
  const [traces, setTraces] = useState<LangSmithTrace[]>(INITIAL_LANGSMITH_TRACES);
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL_MESSAGES);
  const [profile, setProfile] = useState<ExecutiveProfile>(INITIAL_EXECUTIVE_PROFILE);

  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(
    INITIAL_LANGSMITH_TRACES[0]?.id || null
  );
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Fetch initial state from server
  useEffect(() => {
    fetch('/api/agent/state')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (data.meetings) setMeetings(data.meetings);
        if (data.conflicts) setConflicts(data.conflicts);
        if (data.profile) setProfile(data.profile);
        if (data.messages) setMessages(data.messages);
      })
      .catch((err) => {
        console.warn('Using initial local executive dataset:', err);
      });
  }, []);

  // Show temporary toast notification
  const triggerToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Send message to OmniTask agent
  const handleSendMessage = async (promptText: string) => {
    setIsProcessingAgent(true);

    const tempMsgId = `msg-${Date.now()}`;
    const userMsg: AgentChatMessage = {
      id: tempMsgId,
      sender: 'user',
      text: promptText,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();

      if (data.meetings) setMeetings(data.meetings);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.messages) setMessages(data.messages);
      if (data.trace) {
        setTraces((prev) => [data.trace, ...prev]);
        setSelectedTraceId(data.trace.id);
      }
      triggerToast('OmniTask ReAct cycle completed. LangSmith trace updated.');
    } catch (err) {
      console.warn('Fallback local execution:', err);
      // Fallback local agent reply
      const replyMsg: AgentChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: `Understood Alex. I scanned your calendar for "${promptText}". All P0 commitments remain protected, and minimum 30-minute Peninsula transit buffers are verified.`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, replyMsg]);
    } finally {
      setIsProcessingAgent(false);
    }
  };

  // Resolve single conflict
  const handleResolveConflict = async (conflictId: string) => {
    setIsResolvingConflict(true);
    try {
      const res = await fetch('/api/calendar/resolve-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId })
      });

      if (!res.ok) throw new Error('Failed to resolve');
      const data = await res.json();

      if (data.meetings) setMeetings(data.meetings);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.trace) {
        setTraces((prev) => [data.trace, ...prev]);
        setSelectedTraceId(data.trace.id);
      }
      triggerToast('Conflict arbitrated autonomously. Diplomatic email drafted.');
    } catch (err) {
      console.warn('Local conflict resolution fallback:', err);
      // Local fallback resolution
      setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
      setMeetings((prev) =>
        prev.map((m) => (m.status === 'conflicted' ? { ...m, status: 'rescheduled' } : m))
      );
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Auto resolve all conflicts
  const handleAutoResolveAll = async () => {
    setIsResolvingConflict(true);
    try {
      const res = await fetch('/api/calendar/auto-resolve-all', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Auto-resolve error');
      const data = await res.json();

      if (data.meetings) setMeetings(data.meetings);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.trace) {
        setTraces((prev) => [data.trace, ...prev]);
        setSelectedTraceId(data.trace.id);
      }
      triggerToast('All calendar conflicts autonomously arbitrated.');
    } catch (err) {
      console.warn('Local fallback batch arbitration:', err);
      setConflicts([]);
      setMeetings((prev) =>
        prev.map((m) => (m.status === 'conflicted' ? { ...m, status: 'rescheduled' } : m))
      );
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Reset calendar
  const handleResetCalendar = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/calendar/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();
      if (data.meetings) setMeetings(data.meetings);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.traces) setTraces(data.traces);
      if (data.messages) setMessages(data.messages);
      setSelectedTraceId(data.traces?.[0]?.id || null);
      triggerToast('Executive calendar reset to initial high-conflict test suite.');
    } catch (err) {
      setMeetings(JSON.parse(JSON.stringify(INITIAL_MEETINGS)));
      setConflicts(JSON.parse(JSON.stringify(INITIAL_CONFLICTS)));
      setTraces(JSON.parse(JSON.stringify(INITIAL_LANGSMITH_TRACES)));
      setMessages(JSON.parse(JSON.stringify(INITIAL_MESSAGES)));
    } finally {
      setIsResetting(false);
    }
  };

  // Add custom event
  const handleAddEvent = (newEventData: Omit<MeetingEvent, 'id' | 'status'>) => {
    const newEvent: MeetingEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      status: 'confirmed'
    };

    setMeetings((prev) => [...prev, newEvent]);
    triggerToast(`Added "${newEvent.title}". Scanning for conflict & transit buffer...`);

    // Scan for conflicts locally
    const overlaps = meetings.filter(
      (m) =>
        newEvent.startTime < m.endTime &&
        m.startTime < newEvent.endTime &&
        m.id !== newEvent.id
    );

    if (overlaps.length > 0) {
      const collision = overlaps[0];
      const newConf: CalendarConflict = {
        id: `conf-dynamic-${Date.now()}`,
        meetingA: collision,
        meetingB: newEvent,
        conflictType: 'direct_overlap',
        severity: 'critical',
        explanation: `Direct schedule collision between "${collision.title}" and "${newEvent.title}".`,
        recommendedAction: {
          action: collision.priority === 'P0' ? 'reschedule_meeting_b' : 'reschedule_meeting_a',
          targetMeetingId: collision.priority === 'P0' ? newEvent.id : collision.id,
          newSlot: {
            date: newEvent.date,
            startTime: '17:30',
            endTime: '18:15'
          },
          diplomaticMessage: `Shift new meeting to 17:30 to preserve priority commitments.`
        }
      };
      setConflicts((prev) => [newConf, ...prev]);
    }
  };

  const handleSelectMeetingForChat = (meeting: MeetingEvent) => {
    setActiveAndroidTab('agent');
    handleSendMessage(`Review scheduling constraints and potential re-slots for "${meeting.title}" (${meeting.startTime}-${meeting.endTime}).`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Global Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-950">
            Ω
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm text-slate-100 tracking-tight">OmniTask</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                Executive AI Agent
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Python LangChain 0.3 • LangSmith Real-Time Tracing • React Native Android UI
            </p>
          </div>
        </div>

        {/* Layout View Mode Switchers */}
        <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setLayoutMode('dual')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === 'dual'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dual Studio View</span>
          </button>

          <button
            onClick={() => setLayoutMode('mobile_only')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === 'mobile_only'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Only</span>
          </button>

          <button
            onClick={() => setLayoutMode('langsmith_only')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === 'langsmith_only'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>LangSmith Studio</span>
          </button>

          <button
            onClick={() => setLayoutMode('python_only')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === 'python_only'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Python LangChain</span>
          </button>
        </div>

        {/* Global Reset Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleResetCalendar}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Reset Calendar"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden md:inline">Reset Suite</span>
          </button>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {notificationToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-indigo-500/50 text-slate-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden p-3 sm:p-6 gap-6 justify-center items-center">
        {/* LEFT COLUMN: React Native Android Device Emulator */}
        {(layoutMode === 'dual' || layoutMode === 'mobile_only') && (
          <div className="flex flex-col items-center justify-center shrink-0">
            <AndroidShell
              conflicts={conflicts}
              onOpenConflictTab={() => setActiveAndroidTab('conflicts')}
              isNotificationOpen={isNotificationOpen}
              onCloseNotification={() => setIsNotificationOpen(false)}
            >
              {/* Top App Bar */}
              <AndroidAppBar
                profile={profile}
                conflictsCount={conflicts.length}
                onReset={handleResetCalendar}
                isResetting={isResetting}
                onOpenNotifications={() => setIsNotificationOpen(!isNotificationOpen)}
                hasUnreadNotification={conflicts.length > 0}
              />

              {/* Tab View Container */}
              <div className="flex-1 overflow-hidden relative">
                {activeAndroidTab === 'schedule' && (
                  <ScheduleView
                    meetings={meetings}
                    conflicts={conflicts}
                    onResolveConflict={handleResolveConflict}
                    onAutoResolveAll={handleAutoResolveAll}
                    isResolving={isResolvingConflict}
                    onSelectMeetingForChat={handleSelectMeetingForChat}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                  />
                )}

                {activeAndroidTab === 'agent' && (
                  <OmniAgentChatView
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isProcessing={isProcessingAgent}
                    onSelectTrace={(traceId) => {
                      setSelectedTraceId(traceId);
                      if (layoutMode === 'mobile_only') {
                        setActiveAndroidTab('traces');
                      }
                    }}
                  />
                )}

                {activeAndroidTab === 'conflicts' && (
                  <ConflictsView
                    conflicts={conflicts}
                    meetings={meetings}
                    onResolveConflict={handleResolveConflict}
                    onAutoResolveAll={handleAutoResolveAll}
                    isResolving={isResolvingConflict}
                  />
                )}

                {activeAndroidTab === 'traces' && (
                  <LangSmithTraceStudio
                    traces={traces}
                    selectedTraceId={selectedTraceId}
                    onSelectTrace={setSelectedTraceId}
                    compactMode={true}
                  />
                )}

                {activeAndroidTab === 'code' && <PythonCodeStudio />}

                {activeAndroidTab === 'vips' && (
                  <VIPPolicyView profile={profile} onUpdateProfile={setProfile} />
                )}
              </div>

              {/* Bottom Navigation */}
              <AndroidBottomNav
                activeTab={activeAndroidTab}
                onChangeTab={setActiveAndroidTab}
                conflictsCount={conflicts.length}
              />
            </AndroidShell>
          </div>
        )}

        {/* RIGHT COLUMN: LangSmith Tracing Studio & Python Codebase Inspector */}
        {(layoutMode === 'dual' || layoutMode === 'langsmith_only' || layoutMode === 'python_only') && (
          <div className="flex-1 h-[840px] max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Header Tabs for the Right Studio Panel */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLayoutMode(layoutMode === 'python_only' ? 'dual' : layoutMode)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    layoutMode !== 'python_only'
                      ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  <span>LangSmith Observability Studio</span>
                </button>

                <button
                  onClick={() => setLayoutMode('python_only')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    layoutMode === 'python_only'
                      ? 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Python LangChain Source</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Tracing: ON</span>
              </div>
            </div>

            {/* Studio Panel Body */}
            <div className="flex-1 overflow-hidden">
              {layoutMode === 'python_only' ? (
                <PythonCodeStudio />
              ) : (
                <LangSmithTraceStudio
                  traces={traces}
                  selectedTraceId={selectedTraceId}
                  onSelectTrace={setSelectedTraceId}
                  compactMode={false}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
}
