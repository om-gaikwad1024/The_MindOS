"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import MorningBrief from "@/components/dashboard/MorningBrief";
import ContributionHeatmap from "@/components/dashboard/ContributionHeatmap";
import { CHART_COLORS, formatCurrency } from "@/lib/utils";

interface DashboardData {
  taskStats: { total: number; active: number; archived: number };
  learningStats: { total: number; categoryDist: Record<string, number>; avgEnergy: number };
  priorityDist: Record<string, number>;
  monthlyFinance: Array<{ month: string; income: number; expense: number }>;
  boardStats: Array<{ name: string; total: number; active: number }>;
  logDates: string[];
  recentLearnings: Array<{ id: string; claudeSummary: string; category: string; tags: string[] }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="h-8 w-40 bg-[#111111] rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 bg-[#111111] border border-[#1f1f1f] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const categoryData = Object.entries(data.learningStats.categoryDist).map(([name, value]) => ({ name, value }));
  const priorityData = Object.entries(data.priorityDist).map(([name, value]) => ({ name, value }));
  const chartStyle = { background: "#111111", border: "1px solid #1f1f1f", borderRadius: "8px", color: "#ededed" };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#ededed]">Dashboard</h1>
        <p className="text-sm text-[#666] mt-1">Everything at a glance</p>
      </div>

      <div className="mb-8">
        <MorningBrief />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Learnings", value: data.learningStats.total, color: "#79c14a" },
          { label: "Active Tasks", value: data.taskStats.active, color: "#0ea5e9" },
          { label: "Completed Tasks", value: data.taskStats.archived, color: "#64748b" },
          { label: "Avg Energy", value: data.learningStats.avgEnergy.toFixed(1) + "/5", color: "#d97706" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-xs text-[#666] uppercase tracking-wider mb-2">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">Income vs Expense (6 months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlyFinance}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false} />
              <YAxis tick={false} axisLine={false} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="income" fill="#79c14a" radius={4} name="Income" />
              <Bar dataKey="expense" fill="#e05252" radius={4} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">Learning by Category</h2>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={chartStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
<span className="text-xs text-[#666]">{c.name} ({c.value})</span>
</div>
))}
</div>
</>
) : <p className="text-sm text-[#666] text-center py-12">No data.</p>}
</div>
</div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#ededed] mb-4">Tasks by Priority</h2>
      {priorityData.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={priorityData} layout="vertical">
            <XAxis type="number" tick={false} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#666" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip contentStyle={chartStyle} cursor={{ fill: "#1a1a1a" }} />
            <Bar dataKey="value" radius={4}>
              {priorityData.map((d, i) => (
                <Cell key={i} fill={d.name === "urgent" ? "#e05252" : d.name === "high" ? "#f97316" : d.name === "medium" ? "#d97706" : "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : <p className="text-sm text-[#666] text-center py-12">No tasks.</p>}
    </div>

    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#ededed] mb-4">Kanban Boards</h2>
      {data.boardStats.map((b) => (
        <div key={b.name} className="mb-4 last:mb-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-[#ededed]">{b.name}</span>
            <span className="text-xs text-[#666]">{b.active} active / {b.total} total</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${b.total > 0 ? (b.active / b.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
      {data.boardStats.length === 0 && <p className="text-sm text-[#666] text-center py-10">No boards.</p>}
    </div>
  </div>

  <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-[#ededed]">Log Consistency (last 91 days)</h2>
      <span className="text-xs text-[#666]">GitHub-style</span>
    </div>
    <ContributionHeatmap logDates={data.logDates} />
  </div>

  {data.recentLearnings.length > 0 && (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#ededed] mb-4">Recent Learnings</h2>
      <div className="space-y-4">
        {data.recentLearnings.map((l) => (
          <div key={l.id} className="border-b border-[#1f1f1f] last:border-0 pb-4 last:pb-0">
            <p className="text-sm text-[#c8e6b0] leading-relaxed mb-2">{l.claudeSummary}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">{l.category}</span>
              {l.tags.slice(0, 3).map((t) => (
                <span key={t} className="text-[10px] text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
);
}