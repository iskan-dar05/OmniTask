import React, { useState } from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Bell,
  X,
  Smartphone,
  LayoutGrid,
  Activity,
  AlertTriangle,
  Car,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CalendarConflict } from '../types';

interface AndroidShellProps {
  children: React.ReactNode;
  conflicts: CalendarConflict[];
  onOpenConflictTab: () => void;
  isNotificationOpen: boolean;
  onCloseNotification: () => void;
}

export const AndroidShell: React.FC<AndroidShellProps> = ({
  children,
  conflicts,
  onOpenConflictTab,
  isNotificationOpen,
  onCloseNotification
}) => {
  const [currentTime] = useState('09:41');

  return (
    <div className="relative w-full max-w-[420px] h-[840px] bg-slate-950 rounded-[48px] p-3 shadow-2xl shadow-indigo-950/40 ring-1 ring-slate-800 border-[8px] border-slate-900 flex flex-col overflow-hidden select-none">
      {/* Android Dynamic Status Bar */}
      <div className="h-7 bg-slate-950 px-6 flex items-center justify-between text-slate-300 text-[11px] font-medium z-30 shrink-0">
        {/* Left: Clock and notification icons */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold tracking-tight text-slate-200">{currentTime}</span>
          {conflicts.length > 0 && (
            <div className="flex items-center space-x-1 text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
          )}
        </div>

        {/* Center: Camera Punch-Hole */}
        <div className="w-4 h-4 rounded-full bg-slate-900 ring-2 ring-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-slate-950" />
        </div>

        {/* Right: Network & Battery Indicators */}
        <div className="flex items-center space-x-1.5 text-slate-300">
          <span className="text-[9px] font-bold text-slate-400">5G</span>
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <div className="flex items-center space-x-0.5">
            <span className="text-[10px] font-mono">98%</span>
            <Battery className="w-3.5 h-3.5 fill-current text-slate-300" />
          </div>
        </div>
      </div>

      {/* Android Notification Shade Drawer */}
      {isNotificationOpen && (
        <div className="absolute inset-x-3 top-10 z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Android Executive Notifications</span>
            </div>
            <button
              onClick={onCloseNotification}
              className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {conflicts.map((conf) => (
              <div
                key={conf.id}
                onClick={() => {
                  onCloseNotification();
                  onOpenConflictTab();
                }}
                className="bg-slate-950/90 border border-rose-500/40 rounded-xl p-3 text-xs cursor-pointer hover:border-rose-400 transition-all"
              >
                <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold mb-1">
                  <span className="flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-rose-400" />
                    OMNITASK ARBITRATOR
                  </span>
                  <span>Just now</span>
                </div>
                <h5 className="font-bold text-slate-100 text-[11px]">{conf.explanation}</h5>
                <p className="text-[10px] text-slate-400 mt-1">
                  Tap to review side-by-side arbitration matrix and apply diplomatic re-slot.
                </p>
              </div>
            ))}

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
              <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold mb-1">
                <span>LANGSMITH TELEMETRY</span>
                <span>Active</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Project `omnitask-executive-agent` tracing connected. 100% runs logged with token metrics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative rounded-b-[36px]">
        {children}
      </div>

      {/* Android Gesture Navigation Pill Bar */}
      <div className="h-6 bg-slate-950 flex items-center justify-center shrink-0">
        <div className="w-28 h-1 bg-slate-700 hover:bg-slate-500 rounded-full transition-all cursor-pointer" />
      </div>
    </div>
  );
};
