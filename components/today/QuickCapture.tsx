"use client";

import { useState } from "react";
import { Zap } from "lucide-react";

export default function QuickCapture({ onCapture }: { onCapture?: () => void }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/captures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      });
      setText("");
      onCapture?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-[#111111] border border-[#1f1f1f] rounded-xl px-4 py-3 focus-within:border-[#2a2a2a] transition-colors">
      <Zap size={15} className="text-accent flex-shrink-0" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Quick capture — type anything, hit enter..."
        className="flex-1 bg-transparent text-sm text-[#ededed] placeholder-[#444] outline-none"
        disabled={saving}
      />
      {text && (
        <button type="submit" disabled={saving} className="text-xs text-accent hover:text-accent/80 font-medium">
          {saving ? "..." : "Save"}
        </button>
      )}
    </form>
  );
}