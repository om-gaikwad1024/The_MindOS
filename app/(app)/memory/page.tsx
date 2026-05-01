"use client";

import { useEffect, useState } from "react";
import { Brain, RefreshCw, Edit3, Check, X, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  title: string;
  why?: string;
  timeframe: string;
  deadline?: string;
  linkedTasks: string[];
  createdAt: string;
  status: string;
}

export default function MemoryPage() {
  const [context, setContext] = useState("");
  const [contextUpdated, setContextUpdated] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingContext, setEditingContext] = useState(false);
  const [editText, setEditText] = useState("");
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    why: "",
    timeframe: "short_term",
    deadline: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [ctx, gls] = await Promise.all([
      fetch("/api/context").then((r) => r.json()),
      fetch("/api/goals").then((r) => r.json()),
    ]);
    setContext(ctx.content || "");
    setContextUpdated(ctx.updatedAt);
    setGoals(Array.isArray(gls) ? gls : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSaveContext = async () => {
    setSaving(true);
    await fetch("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editText, append: false }),
    });
    setContext(editText);
    setEditingContext(false);
    setSaving(false);
    load();
  };

  const handleClearContext = async () => {
    if (!confirm("Clear all running context? This cannot be undone.")) return;
    await fetch("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "", append: false }),
    });
    setContext("");
    load();
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGoal),
    });
    setNewGoal({ title: "", why: "", timeframe: "short_term", deadline: "" });
    setAddGoalOpen(false);
    setSaving(false);
    load();
  };

  const handleDeleteGoal = async (id: string) => {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals((g) => g.filter((goal) => goal.id !== id));
  };

  const handleToggleGoalStatus = async (goal: Goal) => {
    const next = goal.status === "active" ? "completed" : "active";
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  };

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";

  const shortTermGoals = goals.filter((g) => g.timeframe === "short_term");
  const longTermGoals = goals.filter((g) => g.timeframe === "long_term");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Brain size={20} className="text-accent" />
            <h1 className="text-2xl font-semibold text-[#ededed]">Claude Memory</h1>
          </div>
          <p className="text-sm text-[#666]">
            What Claude knows about you across sessions
          </p>
        </div>
        <button
          onClick={load}
          className="text-[#666] hover:text-accent transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Running Context */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-[#ededed]">Running Context</h2>
            {contextUpdated && (
              <p className="text-[10px] text-[#444] mt-0.5">
                Last updated {format(new Date(contextUpdated), "MMM d, h:mm a")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editingContext ? (
              <>
                <button
                  onClick={() => {
                    setEditText(context);
                    setEditingContext(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
                {context && (
                  <button
                    onClick={handleClearContext}
                    className="text-xs text-[#666] hover:text-danger transition-colors"
                  >
                    Clear
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveContext}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80"
                >
                  <Check size={12} /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingContext(false)}
                  className="text-xs text-[#666] hover:text-[#ededed]"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        {editingContext ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`${inputClass} min-h-[200px] font-mono text-xs`}
            placeholder="Running context will appear here as Claude writes to it..."
            autoFocus
          />
        ) : loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-4 bg-[#1a1a1a] rounded animate-pulse w-4/5" />
          </div>
        ) : context ? (
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-4">
            <pre className="text-xs text-[#c8e6b0] leading-relaxed whitespace-pre-wrap font-mono">
              {context}
            </pre>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#666] text-sm mb-2">No context yet.</p>
            <p className="text-xs text-[#444]">
              End a Claude conversation with "append a summary to my MindOS running context"
            </p>
          </div>
        )}
      </div>

      {/* Goals */}
      <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#ededed]">Goals</h2>
          <button
            onClick={() => setAddGoalOpen(!addGoalOpen)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium"
          >
            <Plus size={13} /> Add Goal
          </button>
        </div>

        {addGoalOpen && (
          <form
            onSubmit={handleAddGoal}
            className="mb-5 p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg flex flex-col gap-3"
          >
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Goal</label>
              <input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className={inputClass}
                placeholder="Land a full-time ML engineering offer"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1.5 block">Why it matters</label>
              <textarea
                value={newGoal.why}
                onChange={(e) => setNewGoal({ ...newGoal, why: e.target.value })}
                className={`${inputClass} min-h-[60px]`}
                placeholder="Because this internship is my direct path to financial independence..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Timeframe</label>
                <select
                  value={newGoal.timeframe}
                  onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value })}
                  className={inputClass}
                >
                  <option value="short_term">Short term (this month)</option>
                  <option value="long_term">Long term (6 months)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Deadline</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-black text-sm font-semibold rounded-lg py-2 hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Goal"}
            </button>
          </form>
        )}

        {goals.length === 0 && !addGoalOpen ? (
          <div className="text-center py-8">
            <p className="text-[#666] text-sm mb-1">No goals yet.</p>
            <p className="text-xs text-[#444]">
              Goals let Claude reframe advice in terms of what actually matters to you.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {shortTermGoals.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">
                  Short Term
                </p>
                <div className="space-y-3">
                  {shortTermGoals.map((g) => (
                    <GoalItem
                      key={g.id}
                      goal={g}
                      onDelete={handleDeleteGoal}
                      onToggle={handleToggleGoalStatus}
                    />
                  ))}
                </div>
              </div>
            )}
            {longTermGoals.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0ea5e9] mb-2">
                  Long Term
                </p>
                <div className="space-y-3">
                  {longTermGoals.map((g) => (
                    <GoalItem
                      key={g.id}
                      goal={g}
                      onDelete={handleDeleteGoal}
                      onToggle={handleToggleGoalStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-[#0f160a] border border-accent/15 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
          How Claude uses this
        </p>
        <div className="space-y-2.5 text-xs text-[#c8e6b0] leading-relaxed">
          <p>
            <span className="text-accent font-medium">Running Context</span> — Claude reads this at the start of every conversation if you ask it to. It contains everything worth remembering from past sessions.
          </p>
          <p>
            <span className="text-accent font-medium">Goals</span> — Claude reads these to reframe advice. Instead of "this task is overdue", it says "this task ties to your goal of landing an offer, so it comes first".
          </p>
          <p>
            <span className="text-accent font-medium">To update context</span> — end any Claude conversation with: "append a summary of what we decided to my MindOS running context"
          </p>
          <p>
            <span className="text-accent font-medium">To load context</span> — start any conversation with: "read my MindOS running context and goals before we begin"
          </p>
        </div>
      </div>
    </div>
  );
}

function GoalItem({
  goal,
  onDelete,
  onToggle,
}: {
  goal: Goal & { status?: string };
  onDelete: (id: string) => void;
  onToggle: (goal: Goal & { status?: string }) => void;
}) {
  const done = goal.status === "completed";
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all group ${
        done
          ? "border-[#1a1a1a] opacity-50"
          : "border-[#1f1f1f] hover:border-[#2a2a2a]"
      }`}
    >
      <button
        onClick={() => onToggle(goal)}
        className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 transition-all ${
          done
            ? "bg-accent/20 border-accent/40"
            : "border-[#333] hover:border-accent"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium ${
            done ? "line-through text-[#666]" : "text-[#ededed]"
          }`}
        >
          {goal.title}
        </p>
        {goal.why && (
          <p className="text-xs text-[#666] mt-0.5 leading-relaxed">{goal.why}</p>
        )}
        {goal.deadline && (
          <p className="text-[10px] text-[#444] mt-1">
            by {format(new Date(goal.deadline), "MMM d, yyyy")}
          </p>
        )}
      </div>
      <button
        onClick={() => onDelete(goal.id)}
        className="opacity-0 group-hover:opacity-100 text-[#666] hover:text-danger transition-all flex-shrink-0"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}