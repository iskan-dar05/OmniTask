import React from 'react';
import { ShieldCheck, Bell, Sparkles, RefreshCw, Smartphone } from 'lucide-react';
import { ExecutiveProfile } from '../types';

interface AndroidAppBarProps {
  profile: ExecutiveProfile;
  conflictsCount: number;
  onReset: () => void;
  isResetting: boolean;
  onOpenNotifications: () => void;
  hasUnreadNotification: boolean;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  profile,
  conflictsCount,
  onReset,
  isResetting,
  onOpenNotifications,
  hasUnreadNotification
}) => {
  return (
    <div id="android-app-bar" className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between select-none">
      {/* Executive Info */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/60 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
              {profile.name}
            </h1>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
              CEO
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-[11px] text-slate-400 font-medium flex items-center">
              <ShieldCheck className="w-3 h-3 text-emerald-400 mr-1 inline" />
              OmniTask AI Active
            </span>
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-2">
        <button
          id="btn-reset-calendar"
          onClick={onReset}
          disabled={isResetting}
          title="Reset Calendar to Test Suite"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        <button
          id="btn-notifications"
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-all active:scale-95"
          title="Notifications Shade"
        >
          <Bell className="w-4 h-4" />
          {conflictsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};
