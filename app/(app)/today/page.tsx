"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import TaskItem from "@/components/today/TaskItem";
import QuickCapture from "@/components/today/QuickCapture";
import Modal from "@/components/ui/Modal";
import type { Task, DailyLog, Learning } from "@/types";

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [latestLearning, setLatestLearning] = useState<Learning | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [energy, setEnergy] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium",
    dueDate: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [tr, lr, logr] = await Promise.all([
      fetch("/api/tasks?section=today&status=active").then((r) => r.json()),
      fetch("/api/learnings").then((r) => r.json()),
      fetch(`/api/logs?date=${format(new Date(), "yyyy-MM-dd")}`).then((r) => r.json()),
    ]);
    setTasks(Array.isArray(tr) ? tr : []);
    setLatestLearning(lr[0] || null);
    setTodayLog(logr);
    if (logr) setEnergy(logr.energyLevel || 0);
  };

  const loadArchived = async () => {
    const data = await fetch("/api/tasks/archived").then((r) => r.json());
    setArchivedTasks(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showArchived) loadArchived();
  }, [showArchived]);

  const handleArchive = (id: string) => {
    setTasks((t) => t.filter((task) => task.id !== id));
    if (showArchived) loadArchived();
  };

  const handleDeleteArchived = (id: string) => {
    setArchivedTasks((t) => t.filter((task) => task.id !== id));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask.title,
        priority: newTask.priority,
        dueDate: newTask.dueDate || null,
        section: "today",
        tags: newTask.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    if (!res.ok) {
      setSaving(false);
      return;
    }
    setNewTask({ title: "", priority: "medium", dueDate: "", tags: "" });
    setAddOpen(false);
    setSaving(false);
    load();
  };

  const handleEnergySet = async (val: number) => {
    setEnergy(val);
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: format(new Date(), "yyyy-MM-dd"),
        energyLevel: val,
        mood: todayLog?.mood || 3,
      }),
    });
  };

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-xs text-[#666] uppercase tracking-widest mb-1">
          {format(new Date(), "EEEE")}
        </p>
        <h1 className="text-2xl font-semibold text-[#ededed]">
          {format(new Date(), "MMMM d, yyyy")}
        </h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#ededed] uppercase tracking-wider">
            Energy Check-in
          </h2>
          <span className="text-xs text-[#666]">
            {energy > 0 ? `${energy}/5` : "not set"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => handleEnergySet(v)}
              className={`w-8 h-8 rounded-full border transition-all text-xs font-medium ${
                v <= energy
                  ? "bg-accent border-accent text-black"
                  : "border-[#2a2a2a] text-[#666] hover:border-accent/50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#ededed]">Tasks Today</h2>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-[#666] text-center py-8">
            No tasks for today. Add something.
          </p>
        ) : (
          tasks.map((t) => (
            <TaskItem key={t.id} task={t} onArchive={handleArchive} />
          ))
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 text-xs text-[#666] hover:text-[#999] transition-colors w-full"
        >
          <ChevronDown
            size={13}
            className={`transition-transform ${showArchived ? "rotate-180" : ""}`}
          />
          Completed tasks
          <span className="text-[10px] text-[#444] ml-1">(auto-deleted after 7 days)</span>
        </button>

        {showArchived && (
          <div className="mt-3 bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            {archivedTasks.length === 0 ? (
              <p className="text-sm text-[#666] text-center py-4">No completed tasks.</p>
            ) : (
              archivedTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onArchive={handleDeleteArchived}
                  archived={true}
                />
              ))
            )}
          </div>
        )}
      </div>

      {latestLearning && (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#ededed]">Recent Learning</h2>
            <a
              href="/learn"
              className="flex items-center gap-1 text-xs text-[#666] hover:text-accent"
            >
              vault <ChevronRight size={12} />
            </a>
          </div>
          <p className="text-sm text-[#c8e6b0] leading-relaxed">
            {latestLearning.claudeSummary}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {latestLearning.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <QuickCapture onCapture={() => {}} />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Task">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Title</label>
            <input
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={inputClass}
              placeholder="What needs to be done?"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className={inputClass}
              >
                {["low", "medium", "high", "urgent"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Due Date</label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Tags</label>
            <input
              value={newTask.tags}
              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
              className={inputClass}
              placeholder="react, backend, review"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Task"}
          </button>
        </form>
      </Modal>
    </div>
  );
}