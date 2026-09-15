import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Trash2
} from 'lucide-react';
import { AgentChatMessage } from '../types';

interface OmniAgentChatViewProps {
  messages: AgentChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  onSelectTrace: (traceId: string) => void;
  onClearHistory?: () => void;
}

const QUICK_PROMPTS = [
  '⚡ Auto-resolve the Palo Alto commute & Board overlap',
  '📋 Synthesize today\'s Executive Morning Briefing',
  '📅 Book 45m dinner with Series B co-lead at 19:30',
  '🛡️ Protect 2 hours for Deep Focus tomorrow afternoon',
  '✈️ Check travel buffer between SF HQ and SFO Airport'
];

export const OmniAgentChatView: React.FC<OmniAgentChatViewProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  onSelectTrace,
  onClearHistory
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  // Simulated Android Voice Input
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      setSpeechFeedback(null);
    } else {
      setIsListening(true);
      setSpeechFeedback("Listening to executive voice command...");
      setTimeout(() => {
        setInputText("Schedule an emergency board sync tomorrow at 16:30 and relocate overlapping reviews.");
        setIsListening(false);
        setSpeechFeedback(null);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 pb-20">
      {/* Agent Status Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center">
              OmniTask Autonomous ReAct Agent
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-2 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-400">
              LangChain Python Runtime • Gemini 3.8 Flash • LangSmith Live
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClearHistory && messages.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear chat history"
              className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="w-3 h-3 mr-0.5" />
            VIP Guard Active
          </div>
        </div>
      </div>

      {/* Voice listening indicator if active */}
      {isListening && (
        <div className="bg-indigo-950/80 border-b border-indigo-500/40 px-4 py-2 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2 text-xs text-indigo-300">
            <Volume2 className="w-4 h-4 text-indigo-400 animate-bounce" />
            <span>{speechFeedback || "Listening..."}</span>
          </div>
          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">
            Android Mic 16kHz
          </span>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] rounded-full font-mono">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Inline Action Details Card */}
                {msg.actionDetails && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 bg-slate-950/60 p-2 rounded-lg text-[11px] text-slate-300">
                    <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold mb-0.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Autonomous Calendar Action</span>
                    </div>
                    <p className="text-slate-300">{msg.actionDetails.summary}</p>
                  </div>
                )}

                {/* LangSmith Trace Inspector Button */}
                {msg.traceId && (
                  <button
                    id={`btn-view-trace-${msg.traceId}`}
                    onClick={() => onSelectTrace(msg.traceId!)}
                    className="mt-2.5 flex items-center justify-between w-full px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-lg text-[10px] text-indigo-300 transition-all font-mono group active:scale-98"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Activity className="w-3 h-3 text-emerald-400 group-hover:animate-pulse" />
                      <span>LangSmith Trace #{msg.traceId.slice(-8)}</span>
                    </div>
                    <span className="text-[9px] text-indigo-400 underline font-sans flex items-center">
                      Inspect ReAct Tree
                      <ArrowRight className="w-2.5 h-2.5 ml-1" />
                    </span>
                  </button>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-indigo-200/70' : 'text-slate-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-slate-300 flex items-center space-x-2">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                Running LangChain ReAct reasoning loop & tool arbitration...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Executive Prompts Carousel */}
      <div className="px-4 py-2 border-t border-slate-900 overflow-x-auto custom-scrollbar flex space-x-2 shrink-0 bg-slate-950/80">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(prompt)}
            disabled={isProcessing}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 text-[11px] rounded-full whitespace-nowrap transition-all shrink-0 active:scale-95 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2">
        <button
          type="button"
          id="btn-voice-input"
          onClick={toggleVoice}
          title="Voice command (Android Speech Engine)"
          className={`p-2 rounded-full transition-all active:scale-95 ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          id="input-agent-command"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Instruct OmniTask (e.g. 'Reschedule 1:1s to clear 2h buffer')..."
          disabled={isProcessing}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
        />

        <button
          type="submit"
          id="btn-send-agent-command"
          disabled={!inputText.trim() || isProcessing}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
