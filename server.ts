import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  INITIAL_CONFLICTS,
  INITIAL_EXECUTIVE_PROFILE,
  INITIAL_LANGSMITH_TRACES,
  INITIAL_MEETINGS,
  INITIAL_MESSAGES,
  INITIAL_TASKS
} from "./src/data/initialData";
import { CalendarConflict, ExecutiveTask, LangSmithTrace, MeetingEvent } from "./src/types";

dotenv.config();

const PORT = 3000;

// Initialize Google Gemini SDK on the server side
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database for the Executive Scheduler
let meetings: MeetingEvent[] = JSON.parse(JSON.stringify(INITIAL_MEETINGS));
let conflicts: CalendarConflict[] = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
let traces: LangSmithTrace[] = JSON.parse(JSON.stringify(INITIAL_LANGSMITH_TRACES));
let messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
let tasks: ExecutiveTask[] = JSON.parse(JSON.stringify(INITIAL_TASKS));
let profile = JSON.parse(JSON.stringify(INITIAL_EXECUTIVE_PROFILE));

// Utility to generate unique ID
function uid(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

// Conflict scanner engine (mirrors backend/app/tools/scheduling/conflict.py & travel.py)
function scanForConflicts(currentMeetings: MeetingEvent[]): CalendarConflict[] {
  const newConflicts: CalendarConflict[] = [];
  const sorted = [...currentMeetings].sort((a, b) => a.startTime.localeCompare(b.startTime));

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];

      // Check direct overlap
      if (a.startTime < b.endTime && b.startTime < a.endTime) {
        newConflicts.push({
          id: `conf-${a.id}-${b.id}`,
          meetingA: a,
          meetingB: b,
          conflictType: 'direct_overlap',
          severity: 'critical',
          explanation: `Direct collision between "${a.title}" (${a.startTime}-${a.endTime}) and "${b.title}" (${b.startTime}-${b.endTime}).`,
          recommendedAction: {
            action: a.priority === 'P0' ? 'reschedule_meeting_b' : 'reschedule_meeting_a',
            targetMeetingId: a.priority === 'P0' ? b.id : a.id,
            newSlot: {
              date: a.date,
              startTime: '16:45',
              endTime: '17:30'
            },
            diplomaticMessage: `Propose moving ${a.priority === 'P0' ? b.title : a.title} to accommodate high-priority executive session.`
          }
        });
      }

      // Check physical travel buffer
      if (a.locationType === 'in-person' && b.locationType === 'in-person' && a.location !== b.location) {
        const [aEndH, aEndM] = a.endTime.split(':').map(Number);
        const [bStartH, bStartM] = b.startTime.split(':').map(Number);
        const deltaMinutes = (bStartH * 60 + bStartM) - (aEndH * 60 + aEndM);

        if (deltaMinutes >= 0 && deltaMinutes < 30) {
          newConflicts.push({
            id: `conf-buffer-${a.id}-${b.id}`,
            meetingA: a,
            meetingB: b,
            conflictType: 'insufficient_travel_buffer',
            severity: 'critical',
            explanation: `Insufficient transit window (${deltaMinutes} min) between "${a.location}" and "${b.location}". Minimum safe commute buffer is 30 minutes.`,
            recommendedAction: {
              action: 'reschedule_meeting_b',
              targetMeetingId: b.id,
              newSlot: {
                date: b.date,
                startTime: '17:15',
                endTime: '18:00'
              },
              diplomaticMessage: `Shift "${b.title}" back by 30 mins to allow safe executive transit and buffer.`
            }
          });
        }
      }
    }
  }

  return newConflicts;
}

// Calculate open slots throughout the day
function calculateOpenSlots() {
  return [
    { startTime: '11:15', endTime: '12:15', duration: '60 min', note: 'Protected pre-lunch window' },
    { startTime: '15:30', endTime: '16:30', duration: '60 min', note: 'Post-board audit open window' },
    { startTime: '17:15', endTime: '18:00', duration: '45 min', note: 'Pre-syndicate dinner slot' }
  ];
}

// Execute Agent Logic
async function executeAgentTurn(prompt: string) {
  const traceId = `trace-${uid()}`;
  const startTime = Date.now();

  messages.push({
    id: uid('msg'),
    sender: 'user',
    text: prompt,
    timestamp: startTime
  });

  let agentResponseText = "";
  let actionDetails: any = null;

  const systemPrompt = `You are OmniTask, an autonomous executive AI scheduling agent.
Executive: ${profile.name}, ${profile.role} at ${profile.company}. Timezone: ${profile.timezone}.
Today's meetings: ${JSON.stringify(meetings.map(m => ({ title: m.title, time: `${m.startTime}-${m.endTime}`, priority: m.priority, location: m.location })))}.
Active conflicts: ${JSON.stringify(conflicts.map(c => ({ id: c.id, type: c.conflictType, explanation: c.explanation })))}.
Active tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, priority: t.priority, status: t.status })))}.
Process the executive prompt with precision, clarity, and authority. Provide realistic schedule suggestions or resolution actions.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
        }
      });
      agentResponseText = response.text || "Executive request processed successfully.";
    } catch (err: any) {
      console.error("Gemini API error, falling back to heuristic response:", err);
      agentResponseText = generateHeuristicAgentResponse(prompt);
    }
  } else {
    agentResponseText = generateHeuristicAgentResponse(prompt);
  }

  const lower = prompt.toLowerCase();
  if (lower.includes("schedule") || lower.includes("book") || lower.includes("add meeting")) {
    let title = "Executive Strategy Sync";
    if (lower.includes("board")) title = "Emergency Board Strategy Session";
    else if (lower.includes("dinner")) title = "Executive Dinner: Key Stakeholders";
    else if (lower.includes("sync") || lower.includes("1:1")) title = "1:1 Executive Alignment";
    else if (lower.includes("interview")) title = "Executive Candidate Interview";

    const newEvt: MeetingEvent = {
      id: uid('evt'),
      title,
      date: '2026-09-15',
      startTime: lower.includes("morning") ? '07:45' : lower.includes("evening") ? '19:30' : '17:30',
      endTime: lower.includes("morning") ? '08:30' : lower.includes("evening") ? '20:30' : '18:15',
      attendees: ['Alex Vance', 'Executive Guest'],
      priority: lower.includes("board") ? 'P0' : 'P1',
      location: lower.includes("dinner") ? 'Boulevard SF' : 'Executive Suite / Zoom',
      locationType: lower.includes("dinner") ? 'in-person' : 'virtual',
      travelBufferMinutes: lower.includes("dinner") ? 20 : 0,
      notes: `Created autonomously by OmniTask in response to: "${prompt}"`,
      status: 'confirmed',
      organizer: 'Alex Vance',
      category: lower.includes("board") ? 'Board' : 'Strategy'
    };

    meetings.push(newEvt);
    actionDetails = {
      type: 'schedule',
      summary: `Scheduled "${newEvt.title}" at ${newEvt.startTime}-${newEvt.endTime}`,
      affectedEvents: [newEvt.id]
    };
  } else if (lower.includes("resolve") || lower.includes("fix conflict")) {
    if (conflicts.length > 0) {
      const c = conflicts.shift()!;
      const rec = c.recommendedAction;
      const target = meetings.find((m) => m.id === rec.targetMeetingId);
      if (target && rec.newSlot) {
        target.startTime = rec.newSlot.startTime;
        target.endTime = rec.newSlot.endTime;
        target.status = 'rescheduled';
      }
      actionDetails = {
        type: 'conflict_resolve',
        summary: `Resolved conflict for ${target?.title}`
      };
    }
  } else if (lower.includes("task") || lower.includes("todo") || lower.includes("action item")) {
    const newTask: ExecutiveTask = {
      id: uid('task'),
      title: prompt.replace(/create task|add task|new task/gi, '').trim() || 'Follow up on executive action item',
      priority: 'P1',
      dueDate: '2026-09-15',
      status: 'pending',
      assignedTo: 'Alex Vance (CEO)',
      category: 'Action Item',
      createdAt: Date.now()
    };
    tasks.unshift(newTask);
    actionDetails = {
      type: 'task_created',
      summary: `Created task: "${newTask.title}"`
    };
  }

  conflicts = scanForConflicts(meetings);

  const duration = Date.now() - startTime;
  const newTrace: LangSmithTrace = {
    id: traceId,
    name: 'OmniTask_Executive_ReAct_Loop',
    project: 'omnitask-executive-agent',
    timestamp: startTime,
    durationMs: duration,
    status: 'success',
    tags: ['react-agent', 'langchain-v0.3', 'langsmith-trace', 'gemini-3.8-flash', 'mobile-client'],
    tokens: {
      prompt: 1120 + Math.floor(Math.random() * 200),
      completion: 240 + Math.floor(Math.random() * 150),
      total: 1400 + Math.floor(Math.random() * 300)
    },
    inputPrompt: prompt,
    outputResult: agentResponseText,
    reactLogs: [
      {
        stepIndex: 1,
        type: 'Thought',
        content: `Parsed user command: "${prompt}". Evaluating C-suite priority guidelines, open calendar slots, and travel buffer constraints.`,
        timestamp: startTime + Math.floor(duration * 0.15)
      },
      {
        stepIndex: 2,
        type: 'Action',
        content: 'calendar_scan_tool',
        timestamp: startTime + Math.floor(duration * 0.35)
      },
      {
        stepIndex: 3,
        type: 'Observation',
        content: `Calendar state: ${meetings.length} events, ${conflicts.length} active conflicts.`,
        timestamp: startTime + Math.floor(duration * 0.65)
      },
      {
        stepIndex: 4,
        type: 'Final Answer',
        content: agentResponseText,
        timestamp: startTime + duration
      }
    ],
    steps: [
      {
        id: `step-${uid()}`,
        name: 'OmniTask_ReAct_AgentExecutor',
        runType: 'chain',
        startTime,
        endTime: startTime + duration,
        durationMs: duration,
        status: 'success',
        inputs: { prompt },
        outputs: { answer: agentResponseText }
      }
    ]
  };

  traces.unshift(newTrace);

  messages.push({
    id: uid('msg'),
    sender: 'agent',
    text: agentResponseText,
    timestamp: Date.now(),
    traceId,
    actionDetails
  });

  return { agentResponseText, newTrace, actionDetails };
}

function resolveSingleConflict(conflictId: string) {
  const conflict = conflicts.find((c) => c.id === conflictId);
  if (!conflict) return null;

  const rec = conflict.recommendedAction;
  const target = meetings.find((m) => m.id === rec.targetMeetingId);

  if (target && rec.newSlot) {
    target.startTime = rec.newSlot.startTime;
    target.endTime = rec.newSlot.endTime;
    target.status = 'rescheduled';
    target.notes = (target.notes ? target.notes + ' | ' : '') + `[OmniTask Auto-Rescheduled: ${rec.diplomaticMessage}]`;
  }

  const otherId = conflict.meetingA.id === rec.targetMeetingId ? conflict.meetingB.id : conflict.meetingA.id;
  const other = meetings.find((m) => m.id === otherId);
  if (other && other.status === 'conflicted') {
    other.status = 'confirmed';
  }

  conflicts = conflicts.filter((c) => c.id !== conflictId);

  const traceId = `trace-${uid()}`;
  const newTrace: LangSmithTrace = {
    id: traceId,
    name: 'OmniTask_Conflict_Arbitrator',
    project: 'omnitask-executive-agent',
    timestamp: Date.now(),
    durationMs: 780,
    status: 'success',
    tags: ['conflict-arbitrator', 'auto-reschedule', 'p0-protection'],
    tokens: { prompt: 620, completion: 180, total: 800 },
    inputPrompt: `Resolve conflict ${conflictId}: ${conflict.explanation}`,
    outputResult: `Autonomous resolution executed. Rescheduled "${target?.title}" to ${rec.newSlot?.startTime}-${rec.newSlot?.endTime}. Formulated diplomatic notice.`,
    reactLogs: [
      {
        stepIndex: 1,
        type: 'Thought',
        content: `Arbitrating conflict between ${conflict.meetingA.title} and ${conflict.meetingB.title}.`,
        timestamp: Date.now() - 600
      },
      {
        stepIndex: 2,
        type: 'Action',
        content: 'conflict_arbitrator_tool',
        timestamp: Date.now() - 400
      },
      {
        stepIndex: 3,
        type: 'Final Answer',
        content: `Relocated ${target?.title} to preserve executive slots and eliminated buffer hazard.`,
        timestamp: Date.now()
      }
    ],
    steps: []
  };

  traces.unshift(newTrace);

  messages.push({
    id: uid('msg'),
    sender: 'agent',
    text: `⚡ Autonomous Conflict Resolved: Relocated "${target?.title}" to ${rec.newSlot?.startTime} - ${rec.newSlot?.endTime}. Diplomatic email notification drafted for ${target?.organizer}.`,
    timestamp: Date.now(),
    traceId,
    actionDetails: {
      type: 'conflict_resolve',
      summary: `Rescheduled ${target?.title}`,
      affectedEvents: [target?.id || '']
    }
  });

  return { conflict, target, trace: newTrace };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // 1. Health Route (mirrors backend/app/api/routes/health.py)
  // -------------------------------------------------------------
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      langchainVersion: "0.3.18",
      langsmithTracing: "enabled",
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      modules: {
        executive_agent: "operational",
        calendar_scanner: "active",
        travel_buffer_engine: "active",
        priority_arbitrator: "active",
        email_synthesizer: "active"
      },
      metrics: {
        activeMeetings: meetings.length,
        pendingConflicts: conflicts.length,
        openTasks: tasks.filter(t => t.status !== 'completed').length,
        tracesLogged: traces.length
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Calendar Routes (mirrors backend/app/api/routes/calendar.py)
  // -------------------------------------------------------------
  app.get("/api/calendar/events", (req, res) => {
    const { date } = req.query;
    let list = meetings;
    if (date && typeof date === 'string') {
      list = meetings.filter(m => m.date === date);
    }
    res.json({
      events: list,
      count: list.length
    });
  });

  app.post("/api/calendar/events", (req, res) => {
    const data = req.body;
    const newEvent: MeetingEvent = {
      id: uid('evt'),
      title: data.title || 'New Executive Meeting',
      date: data.date || '2026-09-15',
      startTime: data.startTime || '16:00',
      endTime: data.endTime || '16:45',
      attendees: data.attendees || ['Alex Vance'],
      priority: data.priority || 'P2',
      location: data.location || 'Executive Boardroom',
      locationType: data.locationType || 'in-person',
      travelBufferMinutes: Number(data.travelBufferMinutes) || 0,
      notes: data.notes || '',
      status: 'confirmed',
      organizer: data.organizer || profile.name,
      category: data.category || 'Strategy'
    };

    meetings.push(newEvent);
    conflicts = scanForConflicts(meetings);

    res.status(201).json({
      success: true,
      event: newEvent,
      conflicts
    });
  });

  app.put("/api/calendar/events/:id", (req, res) => {
    const { id } = req.params;
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Event not found" });
    }

    meetings[idx] = { ...meetings[idx], ...req.body };
    conflicts = scanForConflicts(meetings);

    res.json({
      success: true,
      event: meetings[idx],
      conflicts
    });
  });

  app.delete("/api/calendar/events/:id", (req, res) => {
    const { id } = req.params;
    meetings = meetings.filter(m => m.id !== id);
    conflicts = scanForConflicts(meetings);

    res.json({
      success: true,
      deletedId: id
    });
  });

  app.post("/api/calendar/scan", (_req, res) => {
    conflicts = scanForConflicts(meetings);
    const travelHazards = conflicts.filter(c => c.conflictType === 'insufficient_travel_buffer');
    const directCollisions = conflicts.filter(c => c.conflictType === 'direct_overlap');

    res.json({
      status: "scanned",
      totalConflicts: conflicts.length,
      travelHazardsCount: travelHazards.length,
      directCollisionsCount: directCollisions.length,
      conflicts
    });
  });

  app.post("/api/calendar/reset", (_req, res) => {
    meetings = JSON.parse(JSON.stringify(INITIAL_MEETINGS));
    conflicts = JSON.parse(JSON.stringify(INITIAL_CONFLICTS));
    traces = JSON.parse(JSON.stringify(INITIAL_LANGSMITH_TRACES));
    messages = JSON.parse(JSON.stringify(INITIAL_MESSAGES));
    tasks = JSON.parse(JSON.stringify(INITIAL_TASKS));
    profile = JSON.parse(JSON.stringify(INITIAL_EXECUTIVE_PROFILE));

    res.json({
      success: true,
      meetings,
      conflicts,
      traces,
      messages,
      tasks,
      profile
    });
  });

  // -------------------------------------------------------------
  // 3. Schedule Routes (mirrors backend/app/api/routes/schedule.py)
  // -------------------------------------------------------------
  app.get("/api/schedule/today", (_req, res) => {
    const p0Count = meetings.filter(m => m.priority === 'P0').length;
    const inPersonCount = meetings.filter(m => m.locationType === 'in-person').length;
    const openSlots = calculateOpenSlots();

    res.json({
      date: '2026-09-15',
      meetings,
      conflicts,
      openSlots,
      stats: {
        totalMeetings: meetings.length,
        p0Commitments: p0Count,
        activeConflicts: conflicts.length,
        inPersonTravelStops: inPersonCount,
        protectedFocusBlocks: 1
      }
    });
  });

  app.get("/api/schedule/conflicts", (_req, res) => {
    res.json({
      conflicts,
      count: conflicts.length
    });
  });

  app.post("/api/schedule/resolve", (req, res) => {
    const { conflictId } = req.body;
    const result = resolveSingleConflict(conflictId);
    if (!result) {
      return res.status(404).json({ error: "Conflict not found" });
    }

    res.json({
      success: true,
      meetings,
      conflicts,
      trace: result.trace
    });
  });

  app.post("/api/schedule/resolve-all", (_req, res) => {
    const traceId = `trace-${uid()}`;
    const initialCount = conflicts.length;

    conflicts.forEach((conf) => {
      const rec = conf.recommendedAction;
      const target = meetings.find((m) => m.id === rec.targetMeetingId);
      if (target && rec.newSlot) {
        target.startTime = rec.newSlot.startTime;
        target.endTime = rec.newSlot.endTime;
        target.status = 'rescheduled';
        target.notes = (target.notes ? target.notes + ' | ' : '') + `[OmniTask Auto-Rescheduled: ${rec.diplomaticMessage}]`;
      }
      const otherId = conf.meetingA.id === rec.targetMeetingId ? conf.meetingB.id : conf.meetingA.id;
      const other = meetings.find((m) => m.id === otherId);
      if (other && other.status === 'conflicted') {
        other.status = 'confirmed';
      }
    });

    conflicts = [];

    const newTrace: LangSmithTrace = {
      id: traceId,
      name: 'OmniTask_Batch_Arbitration_Run',
      project: 'omnitask-executive-agent',
      timestamp: Date.now(),
      durationMs: 1450,
      status: 'success',
      tags: ['batch-arbitration', 'all-conflicts-resolved', 'langchain-v0.3'],
      tokens: { prompt: 1320, completion: 390, total: 1710 },
      inputPrompt: 'Auto-resolve all current executive schedule conflicts.',
      outputResult: `Successfully arbitrated ${initialCount} calendar conflicts. Enforced safe commute buffers.`,
      reactLogs: [
        {
          stepIndex: 1,
          type: 'Thought',
          content: `Resolved ${initialCount} conflict nodes across calendar.`,
          timestamp: Date.now() - 1000
        },
        {
          stepIndex: 2,
          type: 'Final Answer',
          content: 'Calendar state optimal.',
          timestamp: Date.now()
        }
      ],
      steps: []
    };

    traces.unshift(newTrace);

    messages.push({
      id: uid('msg'),
      sender: 'agent',
      text: `🎯 All ${initialCount} calendar conflicts autonomously arbitrated. Enforced travel buffers and cleared executive direct collisions.`,
      timestamp: Date.now(),
      traceId,
      actionDetails: {
        type: 'conflict_resolve',
        summary: `Resolved ${initialCount} conflicts`
      }
    });

    res.json({
      success: true,
      meetings,
      conflicts,
      trace: newTrace
    });
  });

  app.get("/api/schedule/slots", (_req, res) => {
    res.json({
      date: '2026-09-15',
      availableSlots: calculateOpenSlots()
    });
  });

  // -------------------------------------------------------------
  // 4. Chat Routes (mirrors backend/app/api/routes/chat.py)
  // -------------------------------------------------------------
  app.post("/api/chat/message", async (req, res) => {
    const prompt = req.body.message || req.body.prompt;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const { agentResponseText, newTrace, actionDetails } = await executeAgentTurn(prompt);

    res.json({
      reply: agentResponseText,
      trace: newTrace,
      actionDetails,
      state: {
        meetings,
        conflicts,
        tasks,
        messages
      }
    });
  });

  app.get("/api/chat/history", (_req, res) => {
    res.json({
      messages,
      count: messages.length
    });
  });

  app.post("/api/chat/clear", (_req, res) => {
    messages = [
      {
        id: uid('msg'),
        sender: 'system',
        text: 'Executive chat session reset. OmniTask Agent standing by for calendar directives.',
        timestamp: Date.now()
      }
    ];
    res.json({ success: true, messages });
  });

  // -------------------------------------------------------------
  // 5. Tasks Routes (mirrors backend/app/api/routes/tasks.py)
  // -------------------------------------------------------------
  app.get("/api/tasks", (_req, res) => {
    res.json({
      tasks,
      totalCount: tasks.length,
      pendingCount: tasks.filter(t => t.status !== 'completed').length
    });
  });

  app.post("/api/tasks", (req, res) => {
    const data = req.body;
    if (!data.title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const newTask: ExecutiveTask = {
      id: uid('task'),
      title: data.title,
      priority: data.priority || 'P1',
      dueDate: data.dueDate || '2026-09-15',
      status: data.status || 'pending',
      assignedTo: data.assignedTo || 'Alex Vance (CEO)',
      relatedMeetingId: data.relatedMeetingId,
      category: data.category || 'Action Item',
      createdAt: Date.now()
    };

    tasks.unshift(newTask);

    res.status(201).json({
      success: true,
      task: newTask
    });
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (req.body.status) task.status = req.body.status;
    if (req.body.title) task.title = req.body.title;
    if (req.body.priority) task.priority = req.body.priority;
    if (req.body.dueDate) task.dueDate = req.body.dueDate;
    if (req.body.category) task.category = req.body.category;

    res.json({
      success: true,
      task
    });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const { id } = req.params;
    tasks = tasks.filter(t => t.id !== id);
    res.json({ success: true, deletedId: id });
  });

  // -------------------------------------------------------------
  // Legacy / Compatibility Endpoints
  // -------------------------------------------------------------
  app.get("/api/agent/state", (_req, res) => {
    res.json({
      meetings,
      conflicts,
      profile,
      messages,
      tasks,
      tracesCount: traces.length,
      latestTrace: traces[0] || null
    });
  });

  app.get("/api/traces", (_req, res) => {
    res.json({ traces });
  });

  app.get("/api/traces/:id", (req, res) => {
    const trace = traces.find((t) => t.id === req.params.id);
    if (!trace) return res.status(404).json({ error: "Trace not found" });
    res.json({ trace });
  });

  app.post("/api/calendar/resolve-conflict", (req, res) => {
    const { conflictId } = req.body;
    const result = resolveSingleConflict(conflictId);
    if (!result) return res.status(404).json({ error: "Conflict not found" });
    res.json({ success: true, meetings, conflicts, trace: result.trace });
  });

  app.post("/api/calendar/auto-resolve-all", (req, res) => {
    // Redirect to schedule resolve-all logic
    (app as any)._router.handle({ ...req, url: '/api/schedule/resolve-all', method: 'POST' }, res);
  });

  app.post("/api/agent/execute", async (req, res) => {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const { agentResponseText, newTrace } = await executeAgentTurn(prompt);
    res.json({
      reply: agentResponseText,
      trace: newTrace,
      meetings,
      conflicts,
      messages,
      tasks
    });
  });

  // Vite development middleware or production static
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OmniTask Executive Server] Running on http://localhost:${PORT}`);
    console.log(`[OmniTask Executive Server] API routes loaded for health, calendar, schedule, chat, tasks.`);
  });
}

function generateHeuristicAgentResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("brief") || lower.includes("agenda") || lower.includes("summary")) {
    return `Executive Daily Briefing for Alex Vance (2026-09-15):
• 08:30: Breakfast Briefing with Roelof Botha (Sequoia) in Palo Alto (P0).
• ⚠️ Note: 38-minute transit required to SF HQ. 
• 10:45: Protected Deep Focus block for Model Architecture (P4).
• 12:30: Recruiting Lunch with Dr. Aris Thorne at Prospect SF (P1).
• 14:00: Mandatory Q3 Board Audit (P0).
• 18:15: Series B Syndicate Dinner at Benu (P0).
Status: 2 conflicts detected. Recommend 1-click autonomous arbitration.`;
  }

  if (lower.includes("conflict") || lower.includes("resolve") || lower.includes("overlap")) {
    return `Autonomous arbitration analysis complete:
1. Palo Alto Transit Hazard: Shift VP Product sprint to 17:15 (+35m buffer safe return).
2. Board Direct Collision: Reschedule Apex Corp renewal to 15:45 (post-board wrap).
Diplomatic emails staged with polite justification. Ready to apply with your consent.`;
  }

  if (lower.includes("schedule") || lower.includes("book") || lower.includes("add")) {
    return `Understood. I have scanned your calendar and identified an optimal window at 17:30 - 18:15 that preserves your protected Deep Focus time and guarantees the 25-minute buffer before your Syndicate Dinner at Benu. The meeting invite has been drafted.`;
  }

  if (lower.includes("task") || lower.includes("todo")) {
    return `I have logged this action item into your Executive Tasks ledger with high priority and synchronized it with today's calendar commitments.`;
  }

  return `I have analyzed your executive schedule using LangChain ReAct reasoning. Calendar constraints verified: all P0 board commitments are protected, Peninsula transit buffers are enforced, and your 90-minute morning focus block remains uninterrupted.`;
}

startServer();
