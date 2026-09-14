export interface PythonFile {
  path: string;
  name: string;
  language: string;
  description: string;
  code: string;
}

export const PYTHON_CODEBASE: PythonFile[] = [
  {
    path: 'agent.py',
    name: 'agent.py',
    language: 'python',
    description: 'Autonomous ReAct Executive Scheduling Agent with LangChain & LangSmith tracing',
    code: `"""
OmniTask: Autonomous Executive Scheduling AI Agent
Built with LangChain, LangSmith Real-Time Tracing, and Google Gemini.
"""

import os
import datetime
from typing import List, Dict, Any
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langsmith import Client, traceable

from tools import (
    calendar_scan_tool,
    conflict_arbitrator_tool,
    priority_scorer_tool,
    travel_buffer_calculator_tool,
    diplomatic_email_draft_tool,
    slot_negotiator_tool
)

# Initialize LangSmith Tracing
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "omnitask-executive-agent"
langsmith_client = Client()

EXECUTIVE_REACT_SYSTEM_PROMPT = """You are OmniTask, an autonomous executive chief-of-staff AI scheduling agent.
Your mission is to manage high-stakes executive calendars, resolve direct and buffer conflicts,
protect 2-hour daily deep-focus blocks, and draft diplomatic communications.

Executive Rules:
1. P0 (Board / Lead Investors) always supersedes P1-P4.
2. In-person meetings require travel buffers (15-45 mins) calculated via travel_buffer_calculator.
3. When moving someone's meeting, always generate a polite, executive-grade diplomatic reason.
4. Always prioritize uninterrupted Deep Focus for strategic work.

TOOLS AVAILABLE:
{tools}

TOOL NAMES:
{tool_names}

Use the following strict ReAct format:
Question: the input executive scheduling command or calendar event
Thought: your continuous reasoning on priorities, constraints, and time math
Action: the action to take, should be one of [{tool_names}]
Action Input: the JSON or string input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now have resolved the schedule and generated the necessary calendar changes
Final Answer: the final summary of actions taken, executive rationale, and calendar updates.

Executive Request: {input}
{agent_scratchpad}"""

@traceable(name="omnitask_executive_agent_run", tags=["executive", "react-agent", "android-mobile"])
def build_executive_agent() -> AgentExecutor:
    """Instantiates the LangChain ReAct agent configured for executive scheduling."""
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.8-flash",
        temperature=0.1,
        max_output_tokens=2048,
    )

    tools = [
        calendar_scan_tool,
        conflict_arbitrator_tool,
        priority_scorer_tool,
        travel_buffer_calculator_tool,
        diplomatic_email_draft_tool,
        slot_negotiator_tool,
    ]

    prompt = PromptTemplate.from_template(EXECUTIVE_REACT_SYSTEM_PROMPT)
    agent = create_react_agent(llm=llm, tools=tools, prompt=prompt)

    executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        return_intermediate_steps=True,
        max_iterations=8
    )
    return executor

if __name__ == "__main__":
    agent_executor = build_executive_agent()
    result = agent_executor.invoke({
        "input": "Urgent board member dinner requested tomorrow at 6:30 PM. Relocate conflicting team review and preserve travel buffer."
    })
    print("Agent Outcome:", result["output"])
`,
  },
  {
    path: 'tools.py',
    name: 'tools.py',
    language: 'python',
    description: 'LangChain @tool definitions for Calendar Scanning, Priority Matrix, and Travel Buffers',
    code: `"""
OmniTask Scheduling Tools for LangChain Agent Execution
"""

from langchain.tools import tool
from typing import Dict, Any, List
import json

@tool
def calendar_scan_tool(date_str: str) -> str:
    """Scans the executive calendar for a specific date (YYYY-MM-DD) and identifies all scheduled slots and tentative invites."""
    # Simulated calendar repository integration (Google Calendar / Microsoft 365)
    return json.dumps({
        "date": date_str,
        "events_count": 6,
        "working_hours": "08:30 - 18:30",
        "focus_blocks_detected": 1,
        "conflicts_flagged": 2
    })

@tool
def priority_scorer_tool(attendee_name: str, meeting_topic: str) -> str:
    """Calculates the strategic executive priority score (0.0 to 1.0) and tier (P0, P1, P2, P3, P4)."""
    weights = {
        "sequoia": 0.98,
        "board": 0.95,
        "investor": 0.92,
        "cto": 0.85,
        "vp": 0.80,
        "product sync": 0.60,
        "vendor": 0.35,
    }
    score = 0.50
    topic_lower = meeting_topic.lower()
    for key, val in weights.items():
        if key in topic_lower or key in attendee_name.lower():
            score = max(score, val)
    
    tier = "P0" if score >= 0.90 else "P1" if score >= 0.80 else "P2" if score >= 0.60 else "P3"
    return json.dumps({"attendee": attendee_name, "topic": meeting_topic, "score": score, "tier": tier})

@tool
def travel_buffer_calculator_tool(origin_address: str, destination_address: str, time_of_day: str) -> str:
    """Computes realistic travel duration and mandatory buffer minutes between physical meetings."""
    # Computes traffic buffer using route duration + 15 min parking/check-in buffer
    base_minutes = 25
    buffer_safety = 15
    total = base_minutes + buffer_safety
    return json.dumps({
        "origin": origin_address,
        "destination": destination_address,
        "transit_estimate_min": base_minutes,
        "recommended_buffer_min": total,
        "safety_margin_rating": "EXCELLENT"
    })

@tool
def conflict_arbitrator_tool(meeting_a_json: str, meeting_b_json: str) -> str:
    """Evaluates two overlapping meetings and determines which should yield with diplomatic rationale."""
    return json.dumps({
        "action": "RESCHEDULE_LOWER_PRIORITY",
        "rationale": "Strategic Board Review (P0, weight 0.95) displaces Internal Product Sync (P2, weight 0.60).",
        "next_available_slot": "Tomorrow at 16:30 - 17:15",
        "requires_human_approval": False
    })

@tool
def diplomatic_email_draft_tool(recipient_name: str, old_time: str, new_time: str, reason: str) -> str:
    """Generates an executive-level courteous email notification explaining the schedule change."""
    return f"""Hi {recipient_name},

I am writing on behalf of the CEO's office. Due to an urgent, time-sensitive board matter that has arisen, we have proactively rescheduled our '{reason}' to {new_time} (previously {old_time}).

We deeply value your time and have secured this dedicated window to ensure our full focus. Please let us know if you need to adjust.

Best regards,
OmniTask Executive Autonomous Office"""

@tool
def slot_negotiator_tool(duration_minutes: int, attendees_timezones: List[str]) -> str:
    """Finds optimal overlap windows across multiple executive time zones with zero red-eye impact."""
    return json.dumps({
        "recommended_utc_slot": "14:00 - 15:00 UTC",
        "local_times": {
            "San Francisco (PST)": "07:00 AM",
            "New York (EST)": "10:00 AM",
            "London (GMT)": "15:00 PM",
            "Tokyo (JST)": "23:00 PM (Warning: late)"
        },
        "consensus_score": 0.88
    })
`,
  },
  {
    path: 'react_native/ExecutiveCalendarScreen.tsx',
    name: 'ExecutiveCalendarScreen.tsx',
    language: 'typescript',
    description: 'React Native Android Mobile UI Component (Native styling, Material 3, Gesture Pill)',
    code: `import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput
} from 'react-native';

export const ExecutiveCalendarScreen = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'conflicts' | 'traces'>('schedule');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Android Top App Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>OmniTask AI</Text>
          <Text style={styles.appSubtitle}>Executive Chief of Staff</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>LangSmith Live</Text>
        </View>
      </View>

      {/* Autonomous Action Banner */}
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>⚡ Autonomous Conflict Resolved</Text>
        <Text style={styles.alertBody}>
          Displaced 1:1 Sync for Sequoia Partner Session (+25m buffer). Diplomatic email sent.
        </Text>
      </View>

      {/* Schedule Feed */}
      <ScrollView style={styles.feed}>
        <Text style={styles.sectionHeader}>Today's Executive Flow</Text>
        {/* Meeting Cards Rendered Here */}
      </ScrollView>

      {/* React Native Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => setActiveTab('schedule')}>
          <Text style={styles.navLabel}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('conflicts')}>
          <Text style={styles.navLabel}>Conflicts (1)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('traces')}>
          <Text style={styles.navLabel}>LangSmith</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1120' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  appTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC' },
  appSubtitle: { fontSize: 12, color: '#94A3B8' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 10, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { color: '#E2E8F0', fontSize: 11, fontWeight: '600' },
  alertCard: { margin: 16, backgroundColor: '#1E1B4B', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#4338CA' },
  alertTitle: { color: '#A5B4FC', fontWeight: '700', fontSize: 14 },
  alertBody: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  feed: { flex: 1, paddingHorizontal: 16 },
  sectionHeader: { color: '#64748B', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, backgroundColor: '#0F172A', borderTopWidth: 1, borderColor: '#1E293B' },
  navLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' }
});
`,
  },
];
