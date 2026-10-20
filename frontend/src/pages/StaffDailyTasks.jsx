import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { 
  CheckSquare, 
  Square, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Plus, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const StaffDailyTasks = () => {
  const { showToast } = useAlert();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    taskType: 'routine_shelf_audit',
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff-tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load staff tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleComplete = async (taskId) => {
    try {
      const res = await api.patch(`/staff-tasks/${taskId}/toggle`);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? res.data : t))
      );

      if (res.data.status === 'completed') {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
        });
        showToast('Task marked completed!', 'success');
      }
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff-tasks', newTask);
      showToast('Custom shift task added!', 'success');
      setShowAddModal(false);
      setNewTask({ title: '', description: '', priority: 'medium', taskType: 'routine_shelf_audit' });
      fetchTasks();
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Staff Daily Suggestion Generator
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              Shift Checklist
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated daily action items generated for floor staff: rotate FEFO batches, verify rack locations, affix clearance tags, and remove expired stock.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shift Note</span>
        </button>
      </div>

      {/* Daily Progress Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-black uppercase text-slate-400">
              Today's Shift Completion Rate
            </div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {completedCount} of {tasks.length} Tasks Checked Off ({progressPercent}%)
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Date: <strong className="text-slate-800 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
          <p className="text-xs font-semibold">Generating today's smart staff checklist from inventory...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-900 text-base">All Daily Tasks Completed!</h3>
          <p className="text-xs text-slate-400 mt-1">
            Store shelves are aligned with FEFO principles and verified.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isDone = task.status === 'completed';

            let priorityBadge = 'bg-slate-100 text-slate-700';
            if (task.priority === 'critical') priorityBadge = 'bg-rose-100 text-rose-700 font-bold';
            if (task.priority === 'high') priorityBadge = 'bg-amber-100 text-amber-800 font-bold';

            return (
              <div
                key={task._id}
                onClick={() => handleToggleComplete(task._id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-md'
                }`}
              >
                {/* Checkbox Icon */}
                <div className="mt-0.5 shrink-0 text-slate-400">
                  {isDone ? (
                    <CheckSquare className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Square className="w-6 h-6 hover:text-rose-600 transition" />
                  )}
                </div>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${priorityBadge}`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {task.taskType?.replace('_', ' ')}
                    </span>
                    {task.shelfLocation?.rack && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-rose-600" />
                        {task.shelfLocation.rack}, {task.shelfLocation.shelf}
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-black text-slate-900 text-sm sm:text-base ${
                      isDone ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Completion Audit Stamp */}
                  {isDone && task.completedByName && (
                    <div className="mt-2 text-[11px] font-medium text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Verified by <strong>{task.completedByName}</strong> at{' '}
                        {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to add custom shift note */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base mb-3">
              Add Custom Shift Task / Shelf Note
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect cold display temperature"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Details / Instructions *
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe the action staff must take..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Task Category
                  </label>
                  <select
                    value={newTask.taskType}
                    onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="fefo_rotation">FEFO Rotation</option>
                    <option value="clearance_discount">Clearance Tagging</option>
                    <option value="disposal_removal">Disposal Pull</option>
                    <option value="overstock_check">Overstock Audit</option>
                    <option value="routine_shelf_audit">Routine Audit</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDailyTasks;
