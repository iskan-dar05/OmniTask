export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface VIPContact {
  id: string;
  name: string;
  email: string;
  title: string;
  tier: 'P0' | 'P1' | 'P2';
  weight: number; // 0.0 - 1.0
  notes: string;
}

export interface MeetingEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  attendees: string[];
  priority: PriorityLevel;
  location: string;
  locationType: 'virtual' | 'in-person';
  travelBufferMinutes: number;
  notes?: string;
  status: 'confirmed' | 'conflicted' | 'rescheduled' | 'tentative';
  organizer: string;
  category: 'Investor' | 'Board' | '1-on-1' | 'Strategy' | 'Customer' | 'Deep Focus' | 'Team Sync';
  agenda?: string[];
  zoomLink?: string;
}

export interface CalendarConflict {
  id: string;
  meetingA: MeetingEvent;
  meetingB: MeetingEvent;
  conflictType: 'direct_overlap' | 'insufficient_travel_buffer' | 'focus_time_violation';
  severity: 'critical' | 'moderate' | 'low';
  explanation: string;
  recommendedAction: {
    action: 'reschedule_meeting_a' | 'reschedule_meeting_b' | 'compress_duration' | 'convert_to_virtual';
    targetMeetingId: string;
    newSlot?: {
      date: string;
      startTime: string;
      endTime: string;
    };
    diplomaticMessage: string;
  };
}

export interface LangSmithTraceStep {
  id: string;
  name: string;
  runType: 'chain' | 'llm' | 'tool' | 'retriever';
  startTime: number;
  endTime: number;
  durationMs: number;
  status: 'success' | 'error';
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  model?: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  children?: LangSmithTraceStep[];
}

export interface LangSmithTrace {
  id: string;
  name: string;
  timestamp: number;
  durationMs: number;
  status: 'success' | 'error';
  tags: string[];
  project: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  inputPrompt: string;
  outputResult: string;
  steps: LangSmithTraceStep[];
  reactLogs: {
    stepIndex: number;
    type: 'Thought' | 'Action' | 'Action Input' | 'Observation' | 'Final Answer';
    content: string;
    timestamp: number;
  }[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: number;
  traceId?: string;
  actionDetails?: {
    type: 'schedule' | 'conflict_resolve' | 'buffer_adjust' | 'briefing';
    summary: string;
    affectedEvents?: string[];
  };
}

export interface ExecutiveProfile {
  name: string;
  role: string;
  company: string;
  avatar: string;
  timezone: string;
  workHours: { start: string; end: string };
  defaultTravelBufferMinutes: number;
  minFocusBlockMinutes: number;
  autonomousResolutionThreshold: number; // 0.85
  vipList: VIPContact[];
}
