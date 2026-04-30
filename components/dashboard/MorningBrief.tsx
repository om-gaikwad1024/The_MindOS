"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export default function MorningBrief() {
  const [brief, setBrief] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "morning_brief" }),
      });
      const data = await res.json();
      setBrief(data.brief || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-[#0f160a] border border-accent/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Morning Brief</span>
        </div>
        <button onClick={load} className="text-[#666] hover:text-accent transition-colors">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-accent/10 rounded animate-pulse w-full" />
          <div className="h-4 bg-accent/10 rounded animate-pulse w-4/5" />
          <div className="h-4 bg-accent/10 rounded animate-pulse w-3/5" />
        </div>
      ) : (
        <p className="text-sm text-[#c8e6b0] leading-relaxed">{brief || "No brief available. Add tasks and log your day to generate insights."}</p>
      )}
    </div>
  );
}