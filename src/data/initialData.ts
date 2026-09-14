import { MeetingEvent, CalendarConflict, ExecutiveProfile, LangSmithTrace } from '../types';

export const INITIAL_EXECUTIVE_PROFILE: ExecutiveProfile = {
  name: 'Alex Vance',
  role: 'Chief Executive Officer & Founder',
  company: 'Synthetix AI Systems',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  timezone: 'America/Los_Angeles (PST)',
  workHours: { start: '08:00', end: '19:30' },
  defaultTravelBufferMinutes: 30,
  minFocusBlockMinutes: 90,
  autonomousResolutionThreshold: 0.82,
  vipList: [
    {
      id: 'vip-1',
      name: 'Roelof Botha',
      email: 'roelof@sequoiacap.com',
      title: 'Partner, Sequoia Capital',
      tier: 'P0',
      weight: 0.98,
      notes: 'Board Lead; never reschedule without CEO confirmation'
    },
    {
      id: 'vip-2',
      name: 'Sarah Jenkins',
      email: 'sjenkins@board.synthetix.ai',
      title: 'Lead Independent Director',
      tier: 'P0',
      weight: 0.95,
      notes: 'Audit Committee Chair; holds mandatory quarterly slot'
    },
    {
      id: 'vip-3',
      name: 'Elena Rostova',
      email: 'elena@synthetix.ai',
      title: 'Chief Technology Officer',
      tier: 'P1',
      weight: 0.88,
      notes: 'Direct report, 1:1 movable within same day if urgent'
    },
    {
      id: 'vip-4',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@deepmind-alumni.org',
      title: 'Principal AI Architect Candidate',
      tier: 'P1',
      weight: 0.84,
      notes: 'Key executive recruit; time-sensitive offer stage'
    },
    {
      id: 'vip-5',
      name: 'David Marcus',
      email: 'dmarcus@synthetix.ai',
      title: 'VP of Product Management',
      tier: 'P2',
      weight: 0.65,
      notes: 'Internal review; flexible to move to afternoon slot'
    },
    {
      id: 'vip-6',
      name: 'Marcus Vance (Apex Corp)',
      email: 'mvance@apexholdings.com',
      title: 'Enterprise Client ($1.8M ARR)',
      tier: 'P1',
      weight: 0.82,
      notes: 'High value customer renewal negotiation'
    }
  ]
};

export const INITIAL_MEETINGS: MeetingEvent[] = [
  {
    id: 'evt-1',
    title: 'Breakfast Briefing: Q4 Growth & Syndicate',
    date: '2026-09-15',
    startTime: '08:30',
    endTime: '09:30',
    attendees: ['Roelof Botha (Sequoia)', 'Alex Vance'],
    priority: 'P0',
    location: 'Buck\'s of Woodside, 3062 Woodside Rd (Palo Alto)',
    locationType: 'in-person',
    travelBufferMinutes: 35,
    notes: 'Discussion on Series C lead terms and board expansion',
    status: 'confirmed',
    organizer: 'Roelof Botha',
    category: 'Investor',
    agenda: ['Series C term sheet review', 'Governance structure', 'Secondary share allocations']
  },
  {
    id: 'evt-2',
    title: 'VP Product Sprint & Roadmap Audit',
    date: '2026-09-15',
    startTime: '09:45',
    endTime: '10:30',
    attendees: ['David Marcus (VP Product)', 'Design Lead', 'Alex Vance'],
    priority: 'P2',
    location: 'Synthetix HQ - Executive Boardroom SF',
    locationType: 'in-person',
    travelBufferMinutes: 0,
    notes: 'Q4 feature freeze commitments and model delivery target',
    status: 'conflicted',
    organizer: 'David Marcus',
    category: 'Team Sync',
    agenda: ['Model fine-tuning milestones', 'Enterprise API launch checklist']
  },
  {
    id: 'evt-3',
    title: 'Deep Focus: Strategic Whitepaper & Model Architecture',
    date: '2026-09-15',
    startTime: '10:45',
    endTime: '12:15',
    attendees: ['Alex Vance (Solo)'],
    priority: 'P4',
    location: 'Executive Office (Do Not Disturb)',
    locationType: 'virtual',
    travelBufferMinutes: 0,
    notes: 'Protected autonomous block: do not schedule non-P0 meetings here',
    status: 'confirmed',
    organizer: 'Alex Vance',
    category: 'Deep Focus'
  },
  {
    id: 'evt-4',
    title: 'Key Hire Lunch: Principal AI Research Lead',
    date: '2026-09-15',
    startTime: '12:30',
    endTime: '13:45',
    attendees: ['Dr. Aris Thorne', 'Alex Vance'],
    priority: 'P1',
    location: 'Prospect SF, 300 Spear St',
    locationType: 'in-person',
    travelBufferMinutes: 20,
    notes: 'Offer negotiation and technical vision alignment',
    status: 'confirmed',
    organizer: 'Alex Vance',
    category: '1-on-1'
  },
  {
    id: 'evt-5',
    title: 'Board of Directors Quarterly Audit Session',
    date: '2026-09-15',
    startTime: '14:00',
    endTime: '15:30',
    attendees: ['Sarah Jenkins (Board)', 'Roelof Botha (Sequoia)', 'General Counsel', 'Alex Vance'],
    priority: 'P0',
    location: 'Synthetix Boardroom / Zoom Hybrid',
    locationType: 'virtual',
    travelBufferMinutes: 0,
    notes: 'Mandatory fiduciary review; strict quorum required',
    status: 'confirmed',
    organizer: 'Sarah Jenkins',
    category: 'Board',
    zoomLink: 'https://zoom.us/j/99281726354'
  },
  {
    id: 'evt-6',
    title: 'Apex Corp Renewal: $1.8M ARR Negotiation',
    date: '2026-09-15',
    startTime: '14:45',
    endTime: '15:45',
    attendees: ['Marcus Vance (Apex CEO)', 'James Sterling (VP Sales)', 'Alex Vance'],
    priority: 'P1',
    location: 'Google Meet',
    locationType: 'virtual',
    travelBufferMinutes: 0,
    notes: 'Overlaps directly with Board of Directors session!',
    status: 'conflicted',
    organizer: 'James Sterling',
    category: 'Customer'
  },
  {
    id: 'evt-7',
    title: '1:1 Technical Review: Elena Rostova (CTO)',
    date: '2026-09-15',
    startTime: '16:00',
    endTime: '17:00',
    attendees: ['Elena Rostova (CTO)', 'Alex Vance'],
    priority: 'P1',
    location: 'Synthetix Lab & Lounge',
    locationType: 'in-person',
    travelBufferMinutes: 0,
    notes: 'Distributed training cluster budget & inference cluster SLAs',
    status: 'confirmed',
    organizer: 'Elena Rostova',
    category: '1-on-1'
  },
  {
    id: 'evt-8',
    title: 'Executive Syndicate Dinner',
    date: '2026-09-15',
    startTime: '18:15',
    endTime: '20:00',
    attendees: ['Series B Syndicate Leads', 'Alex Vance'],
    priority: 'P0',
    location: 'Benu SF, 22 Hawthorne St',
    locationType: 'in-person',
    travelBufferMinutes: 25,
    notes: 'Private dining room reserved',
    status: 'confirmed',
    organizer: 'Alex Vance',
    category: 'Investor'
  }
];

export const INITIAL_CONFLICTS: CalendarConflict[] = [
  {
    id: 'conf-1',
    meetingA: INITIAL_MEETINGS[0], // Sequoia breakfast in Woodside/Palo Alto
    meetingB: INITIAL_MEETINGS[1], // Product audit at SF HQ at 09:45
    conflictType: 'insufficient_travel_buffer',
    severity: 'critical',
    explanation: 'Event 1 ends at 09:30 in Woodside (Palo Alto). Event 2 starts at 09:45 in downtown SF HQ. Route travel takes ~38 mins. Violates minimum mandatory travel buffer by 23 minutes.',
    recommendedAction: {
      action: 'reschedule_meeting_b',
      targetMeetingId: 'evt-2',
      newSlot: {
        date: '2026-09-15',
        startTime: '17:15',
        endTime: '18:00'
      },
      diplomaticMessage: 'Propose shifting David Marcus (VP Product) review to 17:15 - 18:00, or converting to asynchronous Loom digest to safeguard commute safety.'
    }
  },
  {
    id: 'conf-2',
    meetingA: INITIAL_MEETINGS[4], // Board meeting 14:00 - 15:30
    meetingB: INITIAL_MEETINGS[5], // Apex Corp 14:45 - 15:45
    conflictType: 'direct_overlap',
    severity: 'critical',
    explanation: 'Direct 45-minute collision between Board Audit (P0, Weight 0.95) and Apex Corp Customer Renewal (P1, Weight 0.82). Board meeting has higher governance priority.',
    recommendedAction: {
      action: 'reschedule_meeting_b',
      targetMeetingId: 'evt-6',
      newSlot: {
        date: '2026-09-15',
        startTime: '15:45',
        endTime: '16:30'
      },
      diplomaticMessage: 'Reposition Apex Corp negotiation to 15:45 immediately following Board closure, notifying VP Sales James Sterling with high-touch executive apology.'
    }
  }
];

export const INITIAL_LANGSMITH_TRACES: LangSmithTrace[] = [
  {
    id: 'trace-8a91b2c4',
    name: 'OmniTask_ReAct_Executive_Resolver',
    project: 'omnitask-executive-agent',
    timestamp: Date.now() - 1000 * 60 * 18,
    durationMs: 1420,
    status: 'success',
    tags: ['react-agent', 'langchain-v0.3', 'executive-mobile', 'gemini-3.8-flash'],
    tokens: {
      prompt: 1184,
      completion: 342,
      total: 1526
    },
    inputPrompt: 'Scan tomorrow calendar for high-priority conflicts, calculate Woodside commute buffer, and prepare conflict resolution matrix.',
    outputResult: 'Detected 2 high-severity conflicts: (1) Insufficient travel buffer between Palo Alto breakfast & SF HQ product sprint (deficit 23 min); (2) Direct overlap between Board Meeting & Apex Corp ($1.8M ARR). Formulated optimal re-slots and prepared diplomatic correspondence.',
    reactLogs: [
      {
        stepIndex: 1,
        type: 'Thought',
        content: 'Analyzing calendar state for 2026-09-15. Need to scan events, check location transitions, and verify VIP priority weights.',
        timestamp: Date.now() - 1000 * 60 * 18 + 120
      },
      {
        stepIndex: 2,
        type: 'Action',
        content: 'calendar_scan_tool',
        timestamp: Date.now() - 1000 * 60 * 18 + 320
      },
      {
        stepIndex: 3,
        type: 'Action Input',
        content: '{"date_str": "2026-09-15"}',
        timestamp: Date.now() - 1000 * 60 * 18 + 380
      },
      {
        stepIndex: 4,
        type: 'Observation',
        content: 'Found 8 events: 2 P0, 3 P1, 1 P2, 1 P4. Detected location delta between Event 1 (Woodside) and Event 2 (SF HQ). Detected direct time overlap between Event 5 (Board) and Event 6 (Apex Corp).',
        timestamp: Date.now() - 1000 * 60 * 18 + 650
      },
      {
        stepIndex: 5,
        type: 'Thought',
        content: 'Event 1 is in Woodside Rd, Event 2 is in downtown SF at 09:45. Let us invoke travel_buffer_calculator_tool to check realistic commute duration with morning Peninsula traffic.',
        timestamp: Date.now() - 1000 * 60 * 18 + 720
      },
      {
        stepIndex: 6,
        type: 'Action',
        content: 'travel_buffer_calculator_tool',
        timestamp: Date.now() - 1000 * 60 * 18 + 840
      },
      {
        stepIndex: 7,
        type: 'Action Input',
        content: '{"origin_address": "Bucks of Woodside, Palo Alto", "destination_address": "Synthetix HQ SF", "time_of_day": "09:30"}',
        timestamp: Date.now() - 1000 * 60 * 18 + 910
      },
      {
        stepIndex: 8,
        type: 'Observation',
        content: '{"transit_estimate_min": 35, "recommended_buffer_min": 50, "safety_margin_rating": "VIOLATION_DETECTED"}',
        timestamp: Date.now() - 1000 * 60 * 18 + 1100
      },
      {
        stepIndex: 9,
        type: 'Thought',
        content: 'Commute takes 35-50 minutes. Event 2 starts 15 mins after Event 1. Rescheduling Event 2 (David Marcus, P2) to 17:15 will preserve executive commute safety. Resolving Board vs Apex Corp overlap: Board is P0 (weight 0.95), Apex Corp is P1 (weight 0.82). Relocate Apex Corp to 15:45.',
        timestamp: Date.now() - 1000 * 60 * 18 + 1250
      },
      {
        stepIndex: 10,
        type: 'Final Answer',
        content: 'Optimal schedule re-alignment ready. Insufficient travel buffer resolved by shifting VP Product Review to 17:15. Board conflict resolved by moving Apex Corp to 15:45. Drafted diplomatic notifications.',
        timestamp: Date.now() - 1000 * 60 * 18 + 1420
      }
    ],
    steps: [
      {
        id: 'step-root',
        name: 'OmniTask_ReAct_Chain',
        runType: 'chain',
        startTime: Date.now() - 1000 * 60 * 18,
        endTime: Date.now() - 1000 * 60 * 18 + 1420,
        durationMs: 1420,
        status: 'success',
        inputs: { query: 'Scan tomorrow calendar for high-priority conflicts...' },
        outputs: { result: 'Detected 2 high-severity conflicts and computed solutions.' },
        children: [
          {
            id: 'step-llm-1',
            name: 'ChatGoogleGenerativeAI (gemini-3.8-flash)',
            runType: 'llm',
            startTime: Date.now() - 1000 * 60 * 18 + 50,
            endTime: Date.now() - 1000 * 60 * 18 + 320,
            durationMs: 270,
            status: 'success',
            model: 'gemini-3.8-flash',
            tokens: { prompt: 540, completion: 82, total: 622 },
            inputs: { system: 'You are OmniTask...', prompt: 'Executive Request: Scan tomorrow calendar...' },
            outputs: { text: 'Thought: Need to scan events using calendar_scan_tool\nAction: calendar_scan_tool...' }
          },
          {
            id: 'step-tool-1',
            name: 'calendar_scan_tool',
            runType: 'tool',
            startTime: Date.now() - 1000 * 60 * 18 + 330,
            endTime: Date.now() - 1000 * 60 * 18 + 650,
            durationMs: 320,
            status: 'success',
            inputs: { date_str: '2026-09-15' },
            outputs: { events_found: 8, conflicts_flagged: 2 }
          },
          {
            id: 'step-llm-2',
            name: 'ChatGoogleGenerativeAI (gemini-3.8-flash)',
            runType: 'llm',
            startTime: Date.now() - 1000 * 60 * 18 + 670,
            endTime: Date.now() - 1000 * 60 * 18 + 840,
            durationMs: 170,
            status: 'success',
            model: 'gemini-3.8-flash',
            tokens: { prompt: 780, completion: 65, total: 845 },
            inputs: { observation: 'Found 8 events...' },
            outputs: { text: 'Thought: Need to calculate transit buffer\nAction: travel_buffer_calculator_tool...' }
          },
          {
            id: 'step-tool-2',
            name: 'travel_buffer_calculator_tool',
            runType: 'tool',
            startTime: Date.now() - 1000 * 60 * 18 + 850,
            endTime: Date.now() - 1000 * 60 * 18 + 1100,
            durationMs: 250,
            status: 'success',
            inputs: { origin: 'Bucks of Woodside', destination: 'Synthetix HQ SF' },
            outputs: { transit_estimate_min: 35, recommended_buffer_min: 50 }
          },
          {
            id: 'step-llm-3',
            name: 'ChatGoogleGenerativeAI (gemini-3.8-flash)',
            runType: 'llm',
            startTime: Date.now() - 1000 * 60 * 18 + 1120,
            endTime: Date.now() - 1000 * 60 * 18 + 1420,
            durationMs: 300,
            status: 'success',
            model: 'gemini-3.8-flash',
            tokens: { prompt: 990, completion: 195, total: 1185 },
            inputs: { observation: 'Transit estimate 35 mins...' },
            outputs: { text: 'Final Answer: Optimal schedule re-alignment ready...' }
          }
        ]
      }
    ]
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'system',
    text: 'OmniTask Executive AI initialized. Connected to LangChain runtime & LangSmith Live Tracing. Ready to orchestrate your calendar, resolve VIP conflicts, and enforce travel buffers.',
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'msg-2',
    sender: 'agent',
    text: 'Good morning Alex. I detected 2 critical calendar conflicts for today: (1) Insufficient 15m buffer after your Woodside breakfast with Roelof (commute takes ~38m), and (2) Direct overlap between your Q3 Board Audit and Apex Corp renewal. Would you like me to autonomously resolve both and notify David and Marcus?',
    timestamp: Date.now() - 1000 * 60 * 20,
    traceId: 'trace-8a91b2c4',
    actionDetails: {
      type: 'conflict_resolve',
      summary: '2 Critical Conflicts flagged with ready-to-apply autonomous solutions.'
    }
  }
];
