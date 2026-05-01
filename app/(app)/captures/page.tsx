"use client";

import { useEffect, useState } from "react";
import {
  Inbox,
  CheckCheck,
  Trash2,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Zap,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Modal from "@/components/ui/Modal";
import type { Capture } from "@/types";

type FilterType = "all" | "unprocessed" | "processed";

export default function CapturesPage() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [filter, setFilter] = useState<FilterType>("unprocessed");
  const [loading, setLoading] = useState(true);
  const [routeOpen, setRouteOpen] = useState(false);
  const [selectedCapture, setSelectedCapture] = useState<Capture | null>(null);
  const [routing, setRouting] = useState<"task" | "learning" | null>(null);
  const [routeForm, setRouteForm] = useState({
    title: "",
    priority: "medium",
    rawInput: "",
    category: "concept",
    difficulty: "beginner",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetch("/api/captures").then((r) => r.json());
    setCaptures(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const markProcessed = async (id: string, processed: boolean) => {
    await fetch(`/api/captures/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processed }),
    });
    setCaptures((cs) =>
      cs.map((c) => (c.id === id ? { ...c, processed } : c))
    );
  };

  const deleteCapture = async (id: string) => {
    await fetch(`/api/captures/${id}`, { method: "DELETE" });
    setCaptures((cs) => cs.filter((c) => c.id !== id));
  };

  const openRoute = (capture: Capture, type: "task" | "learning") => {
    setSelectedCapture(capture);
    setRouting(type);
    setRouteForm({
      title: capture.rawText.slice(0, 80),
      priority: "medium",
      rawInput: capture.rawText,
      category: "concept",
      difficulty: "beginner",
      tags: "",
    });
    setRouteOpen(true);
  };

  const handleRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapture) return;
    setSaving(true);

    if (routing === "task") {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: routeForm.title,
          priority: routeForm.priority,
          section: "today",
          tags: routeForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
    } else {
      await fetch("/api/learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: routeForm.rawInput,
          category: routeForm.category,
          difficulty: routeForm.difficulty,
          tags: routeForm.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
    }

    await fetch(`/api/captures/${selectedCapture.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        processed: true,
        assignedTo: routing,
      }),
    });

    setCaptures((cs) =>
      cs.map((c) =>
        c.id === selectedCapture.id
          ? { ...c, processed: true, assignedTo: routing ?? undefined }
          : c
      )
    );

    setSaving(false);
    setRouteOpen(false);
    setSelectedCapture(null);
    setRouting(null);
  };

  const markAllProcessed = async () => {
    const unprocessed = captures.filter((c) => !c.processed);
    await Promise.all(
      unprocessed.map((c) =>
        fetch(`/api/captures/${c.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ processed: true }),
        })
      )
    );
    setCaptures((cs) => cs.map((c) => ({ ...c, processed: true })));
  };

  const filtered = captures.filter((c) => {
    if (filter === "unprocessed") return !c.processed;
    if (filter === "processed") return c.processed;
    return true;
  });

  const unprocessedCount = captures.filter((c) => !c.processed).length;

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333] transition-colors";

  const chipClass = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
      active
        ? "border-accent bg-accent/10 text-accent"
        : "border-[#1f1f1f] text-[#666] hover:border-[#2a2a2a] hover:text-[#999]"
    }`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl font-semibold text-[#ededed]">Captures</h1>
            {unprocessedCount > 0 && (
              <span className="text-xs bg-accent text-black font-bold px-2 py-0.5 rounded-full">
                {unprocessedCount}
              </span>
            )}
          </div>
          <p className="text-sm text-[#666]">Your raw inbox — route or discard</p>
        </div>
        {unprocessedCount > 0 && (
          <button
            onClick={markAllProcessed}
            className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] border border-[#1f1f1f] px-3 py-1.5 rounded-lg hover:border-[#2a2a2a] transition-all"
          >
            <CheckCheck size={13} />
            Clear all
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        {(["all", "unprocessed", "processed"] as FilterType[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={chipClass(filter === f)}>
            {f}
            {f === "unprocessed" && unprocessedCount > 0 && (
              <span className="ml-1.5 text-[10px] bg-accent/20 text-accent px-1 rounded">
                {unprocessedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[#111111] border border-[#1f1f1f] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#111111] border border-[#1f1f1f] flex items-center justify-center">
            <Inbox size={20} className="text-[#444]" />
          </div>
          <p className="text-[#666] text-sm">
            {filter === "unprocessed"
              ? "Inbox zero. All captures processed."
              : "No captures here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((capture) => (
            <div
              key={capture.id}
              className={`bg-[#111111] border rounded-xl p-4 transition-all ${
                capture.processed
                  ? "border-[#1a1a1a] opacity-50"
                  : "border-[#1f1f1f] hover:border-[#2a2a2a]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Zap
                    size={14}
                    className={capture.processed ? "text-[#333]" : "text-accent"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      capture.processed ? "text-[#666]" : "text-[#ededed]"
                    }`}
                  >
                    {capture.rawText}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] text-[#444]">
                      {formatDistanceToNow(new Date(capture.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {capture.processed && capture.assignedTo && (
                      <span className="text-[10px] text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCheck size={9} />
                        routed to {capture.assignedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!capture.processed && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a]">
                  <button
                    onClick={() => openRoute(capture, "task")}
                    className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <CheckSquare size={11} />
                    → Task
                  </button>
                  <button
                    onClick={() => openRoute(capture, "learning")}
                    className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <BookOpen size={11} />
                    → Learning
                  </button>
                  <button
                    onClick={() => markProcessed(capture.id, true)}
                    className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] bg-[#1a1a1a] hover:bg-[#222] px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <CheckCheck size={11} />
                    Done
                  </button>
                  <button
                    onClick={() => deleteCapture(capture.id)}
                    className="flex items-center gap-1.5 text-xs text-[#666] hover:text-danger bg-[#1a1a1a] hover:bg-danger/10 px-2.5 py-1.5 rounded-lg transition-all ml-auto"
                  >
                    <Trash2 size={11} />
                    Delete
                  </button>
                </div>
              )}

              {capture.processed && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => deleteCapture(capture.id)}
                    className="text-[#333] hover:text-danger transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={routeOpen}
        onClose={() => {
          setRouteOpen(false);
          setSelectedCapture(null);
          setRouting(null);
        }}
        title={routing === "task" ? "Save as Task" : "Save as Learning"}
      >
        <form onSubmit={handleRoute} className="flex flex-col gap-4">
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-3">
            <p className="text-[10px] text-[#666] uppercase tracking-wider mb-1">
              Original capture
            </p>
            <p className="text-xs text-[#999] leading-relaxed">
              {selectedCapture?.rawText}
            </p>
          </div>

          {routing === "task" && (
            <>
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Task Title</label>
                <input
                  value={routeForm.title}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, title: e.target.value })
                  }
                  className={inputClass}
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">Priority</label>
                  <select
                    value={routeForm.priority}
                    onChange={(e) =>
                      setRouteForm({ ...routeForm, priority: e.target.value })
                    }
                    className={inputClass}
                  >
                    {["low", "medium", "high", "urgent"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">Tags</label>
                  <input
                    value={routeForm.tags}
                    onChange={(e) =>
                      setRouteForm({ ...routeForm, tags: e.target.value })
                    }
                    className={inputClass}
                    placeholder="react, backend"
                  />
                </div>
              </div>
            </>
          )}

          {routing === "learning" && (
            <>
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">
                  Raw Input
                </label>
                <textarea
                  value={routeForm.rawInput}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, rawInput: e.target.value })
                  }
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="Edit before saving..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">
                    Category
                  </label>
                  <select
                    value={routeForm.category}
                    onChange={(e) =>
                      setRouteForm({ ...routeForm, category: e.target.value })
                    }
                    className={inputClass}
                  >
                    {[
                      "concept",
                      "snippet",
                      "link",
                      "paper",
                      "resource",
                      "tool",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1.5 block">
                    Difficulty
                  </label>
                  <select
                    value={routeForm.difficulty}
                    onChange={(e) =>
                      setRouteForm({ ...routeForm, difficulty: e.target.value })
                    }
                    className={inputClass}
                  >
                    {["beginner", "intermediate", "advanced"].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#666] mb-1.5 block">Tags</label>
                <input
                  value={routeForm.tags}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, tags: e.target.value })
                  }
                  className={inputClass}
                  placeholder="react, typescript"
                />
              </div>
              <p className="text-xs text-accent/80 bg-accent/5 border border-accent/15 rounded-lg px-3 py-2">
                Claude will auto-summarize this when saved.
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            <ArrowRight size={14} />
            {saving
              ? "Saving..."
              : routing === "task"
              ? "Save as Task"
              : "Save as Learning"}
          </button>
        </form>
      </Modal>
    </div>
  );
}