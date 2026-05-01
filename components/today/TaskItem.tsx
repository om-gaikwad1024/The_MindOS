"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import PriorityDot from "@/components/ui/PriorityDot";
import type { Task } from "@/types";

interface Props {
  task: Task;
  onArchive: (id: string) => void;
  archived?: boolean;
}

export default function TaskItem({ task, onArchive, archived = false }: Props) {
  const [loading, setLoading] = useState(false);
  const overdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status === "active";

  const handleArchive = async () => {
    setLoading(true);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    onArchive(task.id);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onArchive(task.id);
    setLoading(false);
  };

  return (
    <div
      className={`flex items-start gap-3 py-3.5 border-b border-[#1f1f1f] last:border-0 group ${
        overdue ? "opacity-90" : ""
      } ${archived ? "opacity-60" : ""}`}
    >
      {!archived ? (
        <button
          onClick={handleArchive}
          disabled={loading}
          className="mt-0.5 w-4 h-4 rounded border border-[#333] flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center"
        >
          {loading && (
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          )}
        </button>
      ) : (
        <div className="mt-0.5 w-4 h-4 rounded border border-accent/40 bg-accent/10 flex-shrink-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-accent" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm ${
              archived
                ? "line-through text-[#666]"
                : overdue
                ? "text-danger"
                : "text-[#ededed]"
            }`}
          >
            {task.title}
          </span>
          {overdue && !archived && (
            <span className="text-[10px] text-danger bg-danger/10 px-1.5 py-0.5 rounded">
              Overdue
            </span>
          )}
          {archived && (
            <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              Done
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <div className="flex items-center gap-1.5">
            <PriorityDot priority={task.priority} />
            <span className="text-xs text-[#666]">{task.priority}</span>
          </div>
          {task.dueDate && (
            <span className="text-xs text-[#666]">
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
          {task.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-xs text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {archived && (
        <button
          onClick={handleDelete}
          disabled={loading}
          className="opacity-0 group-hover:opacity-100 text-xs text-[#666] hover:text-danger transition-all ml-auto flex-shrink-0"
        >
          delete
        </button>
      )}
    </div>
  );
}