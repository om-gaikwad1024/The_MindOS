"use client";

import { useState } from "react";
import { format, isPast } from "date-fns";
import PriorityDot from "@/components/ui/PriorityDot";
import type { Task } from "@/types";

interface Props {
  task: Task;
  onArchive: (id: string) => void;
}

export default function TaskItem({ task, onArchive }: Props) {
  const [loading, setLoading] = useState(false);
  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status === "active";

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

  return (
    <div className={`flex items-start gap-3 py-3.5 border-b border-[#1f1f1f] last:border-0 group ${overdue ? "opacity-90" : ""}`}>
      <button
        onClick={handleArchive}
        disabled={loading}
        className="mt-0.5 w-4 h-4 rounded border border-[#333] flex-shrink-0 hover:border-accent hover:bg-accent/10 transition-all flex items-center justify-center"
      >
        {loading && <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${overdue ? "text-danger" : "text-[#ededed]"}`}>
            {task.title}
          </span>
          {overdue && (
            <span className="text-[10px] text-danger bg-danger/10 px-1.5 py-0.5 rounded">Overdue</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
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
            <span key={t} className="text-xs text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}