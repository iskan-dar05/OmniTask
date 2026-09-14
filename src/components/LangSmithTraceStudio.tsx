import React, { useState } from 'react';
import {
  Activity,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  Tag,
  FileCode2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { LangSmithTrace, LangSmithTraceStep } from '../types';

interface LangSmithTraceStudioProps {
  traces: LangSmithTrace[];
  selectedTraceId: string | null;
  onSelectTrace: (traceId: string) => void;
  compactMode?: boolean;
}

export const LangSmithTraceStudio: React.FC<LangSmithTraceStudioProps> = ({
  traces,
  selectedTraceId,
  onSelectTrace,
  compactMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'react' | 'waterfall' | 'json'>('tree');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTrace = traces.find((t) => t.id === selectedTraceId) || traces[0];

  const handleCopyJson = () => {
    if (!activeTrace) return;
    navigator.clipboard.writeText(JSON.stringify(activeTrace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeTrace) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-400 bg-slate-950">
        <Activity className="w-10 h-10 text-slate-600 mb-2 animate-spin" />
        <p className="text-xs">Waiting for LangSmith agent execution traces...</p>
      </div>
    );
  }

  // Flatten steps for waterfall view
  const allSteps: LangSmithTraceStep[] = [];
  function collectSteps(step: LangSmithTraceStep) {
    allSteps.push(step);
    if (step.children) {
      step.children.forEach(collectSteps);
    }
  }
  if (activeTrace.steps) {
    activeTrace.steps.forEach(collectSteps);
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden pb-12">
      {/* LangSmith Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-100 font-mono">
                {activeTrace.name}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">
                SUCCESS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Project: <span className="text-slate-200">{activeTrace.project}</span> • ID: #{activeTrace.id.slice(-8)}
            </div>
          </div>
        </div>

        {/* Trace Stats Badges */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-amber-400 font-bold">{activeTrace.durationMs}ms</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-300">
            <Cpu className="w-3 h-3 text-slate-400" />
            <span className="text-indigo-400 font-bold">{activeTrace.tokens.total} tokens</span>
          </div>
        </div>
      </div>

      {/* Trace Selector Dropdown / Pills if multiple traces */}
      {traces.length > 1 && (
        <div className="bg-slate-900/60 border-b border-slate-800 px-3 py-1.5 flex items-center space-x-2 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[10px] text-slate-500 uppercase font-mono font-bold shrink-0">Runs:</span>
          {traces.map((tr) => (
            <button
              key={tr.id}
              onClick={() => onSelectTrace(tr.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-all shrink-0 ${
                tr.id === activeTrace.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              #{tr.id.slice(-6)} ({tr.durationMs}ms)
            </button>
          ))}
        </div>
      )}

      {/* Sub-tabs: Tree, ReAct Cycle, Waterfall, JSON */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex space-x-1">
          {[
            { id: 'tree', label: 'Trace DAG Tree', icon: Layers },
            { id: 'react', label: 'ReAct Cycle', icon: Sparkles },
            { id: 'waterfall', label: 'Latency Waterfall', icon: Clock },
            { id: 'json', label: 'Raw Payload', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  isSel
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopyJson}
          className="flex items-center space-x-1 text-[10px] text-slate-400 hover:text-slate-200 font-mono transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Trace'}</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {/* VIEW 1: TRACE DAG TREE */}
        {activeTab === 'tree' && (
          <div className="space-y-3 font-mono text-xs">
            {/* Input Prompt Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Root Chain Input
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">
                {activeTrace.inputPrompt}
              </p>
            </div>

            {/* Hierarchical Tree Nodes */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                Execution Hierarchy (DAG)
              </span>

              {activeTrace.steps?.map((step) => (
                <TreeNode
                  key={step.id}
                  step={step}
                  depth={0}
                  selectedStepId={selectedStepId}
                  onSelectStep={setSelectedStepId}
                />
              ))}
            </div>

            {/* Final Answer / Output */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Final Agent Output
              </span>
              <p className="text-slate-200 text-xs font-sans whitespace-pre-line leading-relaxed">
                {activeTrace.outputResult}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: REACT CYCLE */}
        {activeTab === 'react' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 font-mono mb-2">
              LangChain ReAct Execution Loop: Thought ➔ Action ➔ Observation ➔ Final Answer
            </div>

            {activeTrace.reactLogs.map((log, idx) => {
              const isThought = log.type === 'Thought';
              const isAction = log.type === 'Action' || log.type === 'Action Input';
              const isObs = log.type === 'Observation';
              const isFinal = log.type === 'Final Answer';

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 text-xs transition-all ${
                    isThought
                      ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                      : isAction
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 font-mono'
                      : isObs
                      ? 'bg-slate-900 border-slate-800 text-slate-300 font-mono'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 font-sans'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold font-mono mb-1.5 opacity-90">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>
                        STEP {log.stepIndex}: {log.type}
                      </span>
                    </span>
                    <span className="opacity-75">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-line">
                    {log.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: LATENCY WATERFALL */}
        {activeTab === 'waterfall' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400 font-mono mb-2">
              Latency Timeline Breakdown (Total: {activeTrace.durationMs}ms)
            </div>

            <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-lg p-3">
              {allSteps.map((step) => {
                const percentage = Math.max(8, Math.round((step.durationMs / activeTrace.durationMs) * 100));
                const isLlm = step.runType === 'llm';
                const isTool = step.runType === 'tool';

                return (
                  <div key={step.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300 font-bold truncate max-w-[200px]">
                        {step.name}
                      </span>
                      <span className="text-slate-400">{step.durationMs}ms ({percentage}%)</span>
                    </div>

                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLlm
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            : isTool
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: RAW JSON PAYLOAD */}
        {activeTab === 'json' && (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
            <pre>{JSON.stringify(activeTrace, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

// Recursive Tree Node for DAG
const TreeNode: React.FC<{
  step: LangSmithTraceStep;
  depth: number;
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
}> = ({ step, depth, selectedStepId, onSelectStep }) => {
  const isSelected = selectedStepId === step.id;
  const isLlm = step.runType === 'llm';
  const isTool = step.runType === 'tool';
  const isChain = step.runType === 'chain';

  return (
    <div className="space-y-1.5" style={{ marginLeft: `${depth * 16}px` }}>
      <div
        onClick={() => onSelectStep(step.id)}
        className={`p-2 rounded-md border flex items-center justify-between transition-all cursor-pointer ${
          isSelected
            ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2 truncate">
          <span
            className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
              isLlm
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : isTool
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}
          >
            {step.runType.toUpperCase()}
          </span>
          <span className="font-semibold truncate text-[11px]">{step.name}</span>
        </div>

        <div className="flex items-center space-x-2 shrink-0 text-[10px] text-slate-400">
          <span>{step.durationMs}ms</span>
          {step.tokens && <span className="text-indigo-400">{step.tokens.total}t</span>}
        </div>
      </div>

      {step.children && step.children.length > 0 && (
        <div className="border-l border-slate-800 pl-2 space-y-1.5 ml-2">
          {step.children.map((child) => (
            <TreeNode
              key={child.id}
              step={child}
              depth={depth + 1}
              selectedStepId={selectedStepId}
              onSelectStep={onSelectStep}
            />
          ))}
        </div>
      )}
    </div>
  );
};
