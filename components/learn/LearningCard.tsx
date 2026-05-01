"use client";

import { useState } from "react";
import { Star, ExternalLink, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { CATEGORY_COLORS, DIFFICULTY_COLORS } from "@/lib/utils";
import type { Learning } from "@/types";

export default function LearningCard({
  learning,
  onFavorite,
  onDelete,
}: {
  learning: Learning;
  onFavorite: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(learning.isFavorite);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFav = async () => {
    const next = !fav;
    setFav(next);
    await fetch(`/api/learnings/${learning.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    });
    onFavorite(learning.id, next);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    await fetch(`/api/learnings/${learning.id}`, { method: "DELETE" });
    onDelete(learning.id);
  };

  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              color: CATEGORY_COLORS[learning.category],
              backgroundColor: `${CATEGORY_COLORS[learning.category]}18`,
            }}
          >
            {learning.category}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded"
            style={{
              color: DIFFICULTY_COLORS[learning.difficulty],
              backgroundColor: `${DIFFICULTY_COLORS[learning.difficulty]}18`,
            }}
          >
            {learning.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleFav} className="transition-colors">
            <Star
              size={14}
              className={
                fav ? "text-amber-400 fill-amber-400" : "text-[#444] hover:text-[#666]"
              }
            />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`transition-colors ${
              confirmDelete
                ? "text-danger"
                : "text-[#333] hover:text-danger opacity-0 group-hover:opacity-100"
            }`}
            title={confirmDelete ? "Click again to confirm delete" : "Delete"}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <p className="text-xs text-danger bg-danger/10 rounded-lg px-3 py-2 mb-3">
          Click delete again to confirm — this cannot be undone
        </p>
      )}

      <p className="text-sm text-[#ededed] leading-relaxed mb-3">
        {learning.claudeSummary}
      </p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#999] mb-3 transition-colors"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        your words
      </button>

      {expanded && (
        <p className="text-xs text-[#666] bg-[#0a0a0a] rounded-lg p-3 mb-3 leading-relaxed border border-[#1f1f1f] italic">
          {learning.rawInput}
        </p>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {learning.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {learning.sourceUrl && (
            <a
              href={learning.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#666] hover:text-accent transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
          <span className="text-[10px] text-[#444]">
            {format(new Date(learning.createdAt), "MMM d")}
          </span>
        </div>
      </div>
    </div>
  );
}