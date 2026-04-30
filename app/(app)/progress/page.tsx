"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Flame, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { CHART_COLORS } from "@/lib/utils";

interface ProgressData {
  learnings: number;
  logs: number;
  streak: number;
  topTags: [string, number][];
  weekly: Array<{ id: string; weekStartDate: string; skills: string[]; highlights: string; blockers: string; claudeSummary: string }>;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetch("/api/progress").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-8 w-48 bg-[#111111] rounded-lg animate-pulse mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-[#111111] rounded-xl animate-pulse border border-[#1f1f1f]" />
          ))}
        </div>
      </div>
    );
  }

  const tagChartData = data.topTags.map(([name, count]) => ({ name, count }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#ededed]">Progress</h1>
        <p className="text-sm text-[#666] mt-1">Your internship journey</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-accent" />
            <span className="text-xs text-[#666] uppercase tracking-wider">Streak</span>
          </div>
          <p className="text-3xl font-bold text-accent">{data.streak}</p>
          <p className="text-xs text-[#666] mt-1">days</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-[#666]" />
            <span className="text-xs text-[#666] uppercase tracking-wider">Learnings</span>
          </div>
          <p className="text-3xl font-bold text-[#ededed]">{data.learnings}</p>
          <p className="text-xs text-[#666] mt-1">total</p>
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-[#666]" />
            <span className="text-xs text-[#666] uppercase tracking-wider">Logs</span>
          </div>
          <p className="text-3xl font-bold text-[#ededed]">{data.logs}</p>
          <p className="text-xs text-[#666] mt-1">total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">Top Skills</h2>
          {tagChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tagChartData} layout="vertical">
                <XAxis type="number" tick={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ background: "#111111", border: "1px solid #1f1f1f", borderRadius: "8px", color: "#ededed" }}
                  cursor={{ fill: "#1a1a1a" }}
                />
                <Bar dataKey="count" radius={4} fill="#79c14a" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[#666] text-center py-12">No tags yet.</p>}
        </div>
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">Skill Cloud</h2>
          <div className="flex flex-wrap gap-2">
            {data.topTags.map(([tag, count], i) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}18`,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                  fontSize: `${Math.min(14, 10 + count)}px`,
                }}
              >
                {tag} · {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-[#ededed] uppercase tracking-wider mb-4">Weekly Timeline</h2>
      <div className="space-y-4">
        {data.weekly.map((w) => (
          <div key={w.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-xs text-[#666]">Week of {format(new Date(w.weekStartDate), "MMM d, yyyy")}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {w.skills.map((s) => (
                <span key={s} className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            {w.highlights && (
              <p className="text-sm text-[#ededed] mb-2 leading-relaxed">{w.highlights}</p>
            )}
            {w.claudeSummary && (
              <div className="bg-[#0f160a] border border-accent/15 rounded-lg p-4 mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Claude's Read</p>
                <p className="text-sm text-[#c8e6b0] leading-relaxed">{w.claudeSummary}</p>
              </div>
            )}
          </div>
        ))}
        {data.weekly.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#666] text-sm">No weekly progress yet. Keep logging!</p>
          </div>
        )}
      </div>
    </div>
  );
}