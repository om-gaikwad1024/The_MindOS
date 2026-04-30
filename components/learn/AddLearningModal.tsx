"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Sparkles } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddLearningModal({ open, onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    rawInput: "",
    category: "concept",
    difficulty: "beginner",
    sourceUrl: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rawInput.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      setForm({ rawInput: "", category: "concept", difficulty: "beginner", sourceUrl: "", tags: "" });
      onAdded();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333] transition-colors";
  const selectClass = inputClass;

  return (
    <Modal open={open} onClose={onClose} title="Add Learning" width="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[#666] mb-1.5 block">What did you learn?</label>
          <textarea
            value={form.rawInput}
            onChange={(e) => setForm({ ...form, rawInput: e.target.value })}
            className={`${inputClass} min-h-[120px]`}
            placeholder="Dump it here — messy is fine. Claude will clean it up."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={selectClass}>
              {["concept", "snippet", "link", "paper", "resource", "tool"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={selectClass}>
              {["beginner", "intermediate", "advanced"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-[#666] mb-1.5 block">Source URL (optional)</label>
          <input
            value={form.sourceUrl}
            onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
            className={inputClass}
            placeholder="https://..."
            type="url"
          />
        </div>
        <div>
          <label className="text-xs text-[#666] mb-1.5 block">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className={inputClass}
            placeholder="react, typescript, hooks"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          <Sparkles size={14} />
          {saving ? "Claude is summarizing..." : "Save & Summarize"}
        </button>
      </form>
    </Modal>
  );
}