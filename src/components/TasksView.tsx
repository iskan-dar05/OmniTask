import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  ListTodo
} from 'lucide-react';
import { ExecutiveTask, PriorityLevel } from '../types';

interface TasksViewProps {
  tasks: ExecutiveTask[];
  onToggleTask: (taskId: string, currentStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (taskData: Partial<ExecutiveTask>) => void;
  isProcessing?: boolean;
}

const PRIORITY_BADGES: Record<PriorityLevel, { bg: string; text: string; label: string }> = {
  P0: { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300', text: 'text-rose-400', label: 'P0 Board & Counsel' },
  P1: { bg: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300', text: 'text-indigo-400', label: 'P1 Executive VIP' },
  P2: { bg: 'bg-sky-500/20 border-sky-500/40 text-sky-300', text: 'text-sky-400', label: 'P2 Internal' },
  P3: { bg: 'bg-slate-500/20 border-slate-500/40 text-slate-300', text: 'text-slate-400', label: 'P3 Follow-up' },
  P4: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'text-emerald-400', label: 'P4 Focus' }
};

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  isProcessing = false
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'p0'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('P1');
  const [newCategory, setNewCategory] = useState<'Action Item' | 'Preparation' | 'Follow-up' | 'Decision'>('Action Item');
  const [newDueDate, setNewDueDate] = useState('2026-09-15');
  const [newAssignee, setNewAssignee] = useState('Alex Vance (CEO)');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate,
      assignedTo: newAssignee,
      status: 'pending'
    });
    setNewTitle('');
    setIsCreating(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'p0') return t.priority === 'P0';
    return true;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar pb-20">
      {/* Header */}
      <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Autonomous Action Items
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">Executive Tasks</h2>
          </div>
          <button
            id="btn-open-new-task-modal"
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task Metric Chips */}
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Pending</span>
            <div className="text-base font-bold text-amber-400 mt-0.5">{pendingCount} Active</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Completed</span>
            <div className="text-base font-bold text-emerald-400 mt-0.5">{completedCount} Done</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Sync Status</span>
            <div className="text-base font-bold text-indigo-300 mt-0.5 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
              Realtime
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 mt-3 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar">
          {(['all', 'pending', 'completed', 'p0'] as const).map((tab) => (
            <button
              key={tab}
              id={`task-filter-${tab}`}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab === 'all' && `All (${tasks.length})`}
              {tab === 'pending' && `Pending (${pendingCount})`}
              {tab === 'completed' && `Completed (${completedCount})`}
              {tab === 'p0' && `P0 High Priority (${tasks.filter(t => t.priority === 'P0').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Inline Create Form Sheet if open */}
      {isCreating && (
        <form onSubmit={handleCreate} className="m-4 p-4 bg-slate-900 border border-indigo-500/40 rounded-xl shadow-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Executive Action Item
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Task Title</label>
            <input
              id="input-task-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Review Sequoia Series C draft covenants"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</label>
              <select
                id="select-task-priority"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="P0">P0 - Board / Critical</option>
                <option value="P1">P1 - Executive VIP</option>
                <option value="P2">P2 - Internal Team</option>
                <option value="P3">P3 - Routine</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
              <select
                id="select-task-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Action Item">Action Item</option>
                <option value="Preparation">Preparation</option>
                <option value="Decision">Decision</option>
                <option value="Follow-up">Follow-up</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Due Date</label>
              <input
                id="input-task-duedate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assignee</label>
              <input
                id="input-task-assignee"
                type="text"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            id="btn-submit-create-task"
            type="submit"
            disabled={!newTitle.trim()}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow"
          >
            Save Executive Task
          </button>
        </form>
      )}

      {/* Task List */}
      <div className="p-4 space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <ListTodo className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No tasks in this view</p>
            <p className="text-xs text-slate-500 mt-1">
              All executive action items in this filter are addressed.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.P2;

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between space-x-3">
                  {/* Checkbox button */}
                  <button
                    id={`btn-toggle-task-${task.id}`}
                    onClick={() => onToggleTask(task.id, task.status)}
                    disabled={isProcessing}
                    className="mt-0.5 text-slate-400 hover:text-indigo-400 transition-colors shrink-0 active:scale-95"
                    title={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${priorityInfo.bg}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-medium bg-slate-800 text-slate-300 rounded-md">
                        {task.category}
                      </span>
                      {task.status === 'in_progress' && (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/40">
                          In Progress
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-semibold leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>

                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-400 flex-wrap">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-500" />
                        {task.dueDate}
                      </span>
                      {task.assignedTo && (
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1 text-slate-500" />
                          {task.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    id={`btn-delete-task-${task.id}`}
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
