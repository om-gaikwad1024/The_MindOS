import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { generateMorningBrief, generateWeeklySummary, generateFinanceInsights } from "@/lib/anthropic";
import { startOfMonth, endOfMonth, subDays } from "date-fns";

export async function POST(req: NextRequest) {
  const { type } = await req.json();

  if (type === "morning_brief") {
    const [tasks, lastLog, txs] = await Promise.all([
      prisma.task.findMany({ where: { userId: USER_ID, status: "active" }, orderBy: { priority: "desc" }, take: 5 }),
      prisma.dailyLog.findFirst({ where: { userId: USER_ID }, orderBy: { date: "desc" } }),
      prisma.transaction.findMany({
        where: { userId: USER_ID, type: "expense", date: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) } },
      }),
    ]);
    const cats = await prisma.financeCategory.findMany({ where: { userId: USER_ID, type: "expense" } });
    const totalBudget = cats.reduce((s, c) => s + (c.monthlyBudget || 0), 0);
    const totalSpent = txs.reduce((s, t) => s + t.amount, 0);

    let brief = "";
    try {
      brief = await generateMorningBrief({
        tasks: tasks.map((t) => ({ title: t.title, priority: t.priority })),
        lastLog: lastLog ? { wins: lastLog.wins || "", mood: lastLog.mood, energyLevel: lastLog.energyLevel } : null,
        budgetStatus: { totalSpent, totalBudget },
      });
    } catch {}
    return NextResponse.json({ brief });
  }

  if (type === "weekly_summary") {
    const weekAgo = subDays(new Date(), 7);
    const [logs, learnings, tasks] = await Promise.all([
      prisma.dailyLog.findMany({ where: { userId: USER_ID, date: { gte: weekAgo } } }),
      prisma.learning.findMany({ where: { userId: USER_ID, createdAt: { gte: weekAgo } } }),
      prisma.task.findMany({ where: { userId: USER_ID } }),
    ]);
    let summary = "";
    try {
      summary = await generateWeeklySummary({
        logs: logs.map((l) => ({ wins: l.wins || "", blockers: l.blockers || "", learnedToday: l.learnedToday || "" })),
        learnings: learnings.map((l) => ({ claudeSummary: l.claudeSummary })),
        tasks: tasks.map((t) => ({ title: t.title, status: t.status })),
      });
    } catch {}
    return NextResponse.json({ summary });
  }

  if (type === "finance_insights") {
    const txs = await prisma.transaction.findMany({
      where: { userId: USER_ID, date: { gte: subDays(new Date(), 30) } },
      include: { category: true },
      take: 50,
    });
    let insights = "";
    try {
      insights = await generateFinanceInsights(
        txs.map((t) => ({ title: t.title, amount: t.amount, type: t.type, category: t.category?.name || "Other" }))
      );
    } catch {}
    return NextResponse.json({ insights });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}