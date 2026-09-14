import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Plus, Sparkles } from 'lucide-react';
import { MeetingEvent, PriorityLevel } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (event: Omit<MeetingEvent, 'id' | 'status'>) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [priority, setPriority] = useState<PriorityLevel>('P1');
  const [location, setLocation] = useState('Synthetix SF Boardroom');
  const [locationType, setLocationType] = useState<'virtual' | 'in-person'>('in-person');
  const [attendees, setAttendees] = useState('Alex Vance, Sequoia Co-Lead');
  const [category, setCategory] = useState<MeetingEvent['category']>('Investor');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title,
      date: '2026-09-15',
      startTime,
      endTime,
      priority,
      location,
      locationType,
      travelBufferMinutes: locationType === 'in-person' ? 25 : 0,
      attendees: attendees.split(',').map((s) => s.trim()).filter(Boolean),
      category,
      organizer: 'Alex Vance',
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-4 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold">Schedule Executive Meeting</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Series C Term Sheet Negotiation"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="P0">P0 - Board / Investor</option>
                <option value="P1">P1 - Key 1:1 / VIP</option>
                <option value="P2">P2 - Team / Sprint</option>
                <option value="P3">P3 - Advisory / Vendor</option>
                <option value="P4">P4 - Deep Focus</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="Investor">Investor</option>
                <option value="Board">Board</option>
                <option value="1-on-1">1-on-1</option>
                <option value="Customer">Customer</option>
                <option value="Team Sync">Team Sync</option>
                <option value="Deep Focus">Deep Focus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Location & Transit Mode
            </label>
            <div className="flex space-x-2 mb-1.5">
              <button
                type="button"
                onClick={() => setLocationType('in-person')}
                className={`flex-1 py-1 rounded text-[11px] font-semibold border ${
                  locationType === 'in-person'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                In-Person (Transit Buffer)
              </button>
              <button
                type="button"
                onClick={() => setLocationType('virtual')}
                className={`flex-1 py-1 rounded text-[11px] font-semibold border ${
                  locationType === 'virtual'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Virtual (Zoom / Meet)
              </button>
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Menlo Circus Club, Atherton"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Attendees (comma separated)
            </label>
            <input
              type="text"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              placeholder="Names or emails..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-md transition-all active:scale-95"
            >
              Add & Scan Conflicts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
