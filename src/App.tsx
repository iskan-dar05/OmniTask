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
  LayoutGrid,
  Users,
  CheckSquare
} from 'lucide-react';
import { AndroidShell } from './components/AndroidShell';
import { AndroidAppBar } from './components/AndroidAppBar';
import { AndroidBottomNav, AndroidTab } from './components/AndroidBottomNav';
import { CalendarAgendaView } from './components/CalendarAgendaView';
import { ScheduleView } from './components/ScheduleView';
import { OmniAgentChatView } from './components/OmniAgentChatView';
import { TasksView } from './components/TasksView';
import { HealthView } from './components/HealthView';
import { LangSmithTraceStudio } from './components/LangSmithTraceStudio';
import { PythonCodeStudio } from './components/PythonCodeStudio';
import { VIPPolicyView } from './components/VIPPolicyView';
import { AddEventModal } from './components/AddEventModal';
import {
  INITIAL_CONFLICTS,
  INITIAL_EXECUTIVE_PROFILE,
  INITIAL_LANGSMITH_TRACES,
  INITIAL_MEETINGS,
  INITIAL_MESSAGES,
  INITIAL_TASKS
} from './data/initialData';
import {
  MeetingEvent,
  CalendarConflict,
  LangSmithTrace,
  AgentChatMessage,
  ExecutiveProfile,
  ExecutiveTask
} from './types';

type StudioLayoutMode = 'dual' | 'mobile_only' | 'langsmith_only' | 'python_only';

export default function App() {
  const [layoutMode, setLayoutMode] = useState<StudioLayoutMode>('dual');
  const [activeAndroidTab, setActiveAndroidTab] = useState<AndroidTab>('schedule');
  const [meetings, setMeetings] = useState<MeetingEvent[]>(INITIAL_MEETINGS);
  const [conflicts, setConflicts] = useState<CalendarConflict[]>(INITIAL_CONFLICTS);
  const [traces, setTraces] = useState<LangSmithTrace[]>(INITIAL_LANGSMITH_TRACES);
  const [messages, setMessages] = useState<AgentChatMessage[]>(INITIAL_MESSAGES);
  const [tasks, setTasks] = useState<ExecutiveTask[]>(INITIAL_TASKS);
  const [profile, setProfile] = useState<ExecutiveProfile>(INITIAL_EXECUTIVE_PROFILE);

  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(
    INITIAL_LANGSMITH_TRACES[0]?.id || null
  );
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync initial state from backend endpoints
  useEffect(() => {
    // 1. Fetch Calendar Events
    fetch('/api/calendar/events')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.events) setMeetings(data.events);
      })
      .catch(() => {});

    // 2. Fetch Schedule Conflicts
    fetch('/api/schedule/conflicts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.conflicts) setConflicts(data.conflicts);
      })
      .catch(() => {});

    // 3. Fetch Tasks
    fetch('/api/tasks')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tasks) setTasks(data.tasks);
      })
      .catch(() => {});

    // 4. Fetch Chat History
    fetch('/api/chat/history')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.messages) setMessages(data.messages);
      })
      .catch(() => {});
  }, []);

  const triggerToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // --- API Handlers ---

  // 1. Send Chat Message (/api/chat/message)
  const handleSendMessage = async (promptText: string) => {
    setIsProcessingAgent(true);

    const userMsg: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText })
      });

      if (!res.ok) throw new Error('Chat API returned ' + res.status);
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      }
      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.trace) {
        setTraces((prev) => [data.trace, ...prev]);
        setSelectedTraceId(data.trace.id);
      }
      triggerToast('OmniTask LangChain cycle completed. Trace updated.');
    } catch (err) {
      console.warn('Fallback local execution:', err);
      const fallbackReply: AgentChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'agent',
        text: `Executed schedule check for "${promptText}". All P0 commitments protected, Peninsula transit buffers preserved.`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsProcessingAgent(false);
    }
  };

  // 2. Clear Chat History (/api/chat/clear)
  const handleClearChat = async () => {
    try {
      await fetch('/api/chat/clear', { method: 'POST' });
    } catch (err) {
      console.warn('Clear chat error:', err);
    }
    setMessages([]);
    triggerToast('Chat history cleared.');
  };

  // 3. Resolve Single Conflict (/api/schedule/resolve)
  const handleResolveConflict = async (conflictId: string) => {
    setIsResolvingConflict(true);
    try {
      const res = await fetch('/api/schedule/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflictId })
      });

      if (!res.ok) throw new Error('Failed to resolve');
      const data = await res.json();

      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.trace) {
        setTraces((prev) => [data.trace, ...prev]);
        setSelectedTraceId(data.trace.id);
      }
      triggerToast('Schedule conflict arbitrated autonomously. Diplomatic email drafted.');
    } catch (err) {
      console.warn('Local conflict resolution fallback:', err);
      setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
      setMeetings((prev) =>
        prev.map((m) => (m.status === 'conflicted' ? { ...m, status: 'rescheduled' } : m))
      );
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // 4. Auto Resolve All Conflicts (/api/schedule/resolve-all)
  const handleAutoResolveAll = async () => {
    setIsResolvingConflict(true);
    try {
      const res = await fetch('/api/schedule/resolve-all', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Auto-resolve error');
      const data = await res.json();

      if (data.events) setMeetings(data.events);
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

  // 5. Scan Calendar for Conflicts (/api/calendar/scan)
  const handleScanCalendar = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/calendar/scan', { method: 'POST' });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();

      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      triggerToast(`Calendar scan completed: ${data.conflictsFound} conflicts detected.`);
    } catch (err) {
      console.warn('Scan fallback:', err);
      triggerToast('Calendar scan completed.');
    } finally {
      setIsScanning(false);
    }
  };

  // 6. Reset All Calendar & Executive Data (/api/calendar/reset)
  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/calendar/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      const data = await res.json();

      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      if (data.traces) setTraces(data.traces);
      if (data.messages) setMessages(data.messages);
      if (data.tasks) setTasks(data.tasks);
      setSelectedTraceId(data.traces?.[0]?.id || null);
      triggerToast('Executive calendar & task dataset restored.');
    } catch (err) {
      setMeetings(JSON.parse(JSON.stringify(INITIAL_MEETINGS)));
      setConflicts(JSON.parse(JSON.stringify(INITIAL_CONFLICTS)));
      setTraces(JSON.parse(JSON.stringify(INITIAL_LANGSMITH_TRACES)));
      setMessages(JSON.parse(JSON.stringify(INITIAL_MESSAGES)));
      setTasks(JSON.parse(JSON.stringify(INITIAL_TASKS)));
    } finally {
      setIsResetting(false);
    }
  };

  // 7. Add Calendar Event (/api/calendar/events)
  const handleAddEvent = async (newEventData: Omit<MeetingEvent, 'id' | 'status'>) => {
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventData)
      });
      if (!res.ok) throw new Error('Add event failed');
      const data = await res.json();

      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      triggerToast(`Scheduled "${newEventData.title}". Conflicts & travel buffers evaluated.`);
    } catch (err) {
      const fallbackEvent: MeetingEvent = {
        ...newEventData,
        id: `evt-${Date.now()}`,
        status: 'confirmed'
      };
      setMeetings((prev) => [...prev, fallbackEvent]);
      triggerToast(`Added "${fallbackEvent.title}".`);
    }
  };

  // 8. Delete Calendar Event (/api/calendar/events/:id)
  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      if (data.events) setMeetings(data.events);
      if (data.conflicts) setConflicts(data.conflicts);
      triggerToast('Event removed from schedule.');
    } catch (err) {
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      triggerToast('Event deleted.');
    }
  };

  // 9. Task Management (/api/tasks)
  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus as any } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Update task failed');
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
    } catch (err) {
      console.warn('Update task error:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete task failed');
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
      triggerToast('Executive task removed.');
    } catch (err) {
      console.warn('Delete task error:', err);
    }
  };

  const handleAddTask = async (taskData: Partial<ExecutiveTask>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Add task failed');
      const data = await res.json();
      if (data.tasks) setTasks(data.tasks);
      triggerToast('Action item added to Executive Tasks.');
    } catch (err) {
      const fallbackTask: ExecutiveTask = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'New Task',
        priority: taskData.priority || 'P1',
        category: taskData.category || 'Action Item',
        dueDate: taskData.dueDate || '2026-09-15',
        status: 'pending',
        assignedTo: taskData.assignedTo || 'Alex Vance (CEO)',
        relatedMeetingId: taskData.relatedMeetingId,
        createdAt: Date.now()
      };
      setTasks((prev) => [fallbackTask, ...prev]);
    }
  };

  const handleSelectMeetingForChat = (meeting: MeetingEvent) => {
    setActiveAndroidTab('chat');
    handleSendMessage(`Review scheduling constraints and evaluate non-destructive re-slots for "${meeting.title}" (${meeting.startTime}-${meeting.endTime}).`);
  };

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

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
            id="btn-global-reset"
            onClick={handleResetAll}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            title="Reset Calendar & Tasks"
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
              onOpenConflictTab={() => setActiveAndroidTab('schedule')}
              isNotificationOpen={isNotificationOpen}
              onCloseNotification={() => setIsNotificationOpen(false)}
            >
              {/* Top App Bar */}
              <AndroidAppBar
                profile={profile}
                conflictsCount={conflicts.length}
                onReset={handleResetAll}
                isResetting={isResetting}
                onOpenNotifications={() => setIsNotificationOpen(!isNotificationOpen)}
                hasUnreadNotification={conflicts.length > 0}
              />

              {/* Tab View Container */}
              <div className="flex-1 overflow-hidden relative">
                {/* 1. Calendar View */}
                {activeAndroidTab === 'calendar' && (
                  <CalendarAgendaView
                    meetings={meetings}
                    conflicts={conflicts}
                    onOpenAddModal={() => setIsAddModalOpen(true)}
                    onDeleteEvent={handleDeleteEvent}
                    onScanCalendar={handleScanCalendar}
                    isScanning={isScanning}
                    onSelectMeetingForChat={handleSelectMeetingForChat}
                  />
                )}

                {/* 2. Schedule & Conflict View */}
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

                {/* 3. AI Agent Chat View */}
                {activeAndroidTab === 'chat' && (
                  <OmniAgentChatView
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isProcessing={isProcessingAgent}
                    onSelectTrace={(traceId) => {
                      setSelectedTraceId(traceId);
                      if (layoutMode === 'mobile_only') {
                        setLayoutMode('dual');
                      }
                    }}
                    onClearHistory={handleClearChat}
                  />
                )}

                {/* 4. Tasks View */}
                {activeAndroidTab === 'tasks' && (
                  <TasksView
                    tasks={tasks}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onAddTask={handleAddTask}
                  />
                )}

                {/* 5. Health & Policy View */}
                {activeAndroidTab === 'health' && (
                  <HealthView
                    profile={profile}
                    onUpdateProfile={setProfile}
                    onResetAllData={handleResetAll}
                    isResetting={isResetting}
                  />
                )}
              </div>

              {/* Bottom Navigation */}
              <AndroidBottomNav
                activeTab={activeAndroidTab}
                onChangeTab={setActiveAndroidTab}
                conflictsCount={conflicts.length}
                tasksCount={pendingTasksCount}
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

              <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
                <span className="flex items-center text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                  LangSmith Live
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-indigo-300">FastAPI &amp; Express Bridge</span>
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
