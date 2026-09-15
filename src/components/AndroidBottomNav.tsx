import React from 'react';
import { Calendar, Bot, AlertTriangle, CheckSquare, Activity } from 'lucide-react';

export type AndroidTab = 'calendar' | 'schedule' | 'chat' | 'tasks' | 'health';

interface AndroidBottomNavProps {
  activeTab: AndroidTab;
  onChangeTab: (tab: AndroidTab) => void;
  conflictsCount: number;
  tasksCount?: number;
}

interface NavItem {
  id: AndroidTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onChangeTab,
  conflictsCount,
  tasksCount
}) => {
  const tabs: NavItem[] = [
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: AlertTriangle, badge: conflictsCount },
    { id: 'chat', label: 'AI Agent', icon: Bot },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: tasksCount },
    { id: 'health', label: 'Health', icon: Activity },
  ];

  return (
    <div id="android-bottom-nav" className="bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-1.5 py-1.5 flex items-center justify-around select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id as AndroidTab)}
            className="flex flex-col items-center justify-center flex-1 py-1 transition-all group relative active:scale-95"
          >
            <div
              className={`relative px-3.5 py-1 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/50 shadow-sm'
                  : 'text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.5]' : 'stroke-2'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-rose-500 text-white rounded-full leading-tight shadow">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight font-medium transition-colors ${
                isActive ? 'text-indigo-300 font-semibold' : 'text-slate-500 group-hover:text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
