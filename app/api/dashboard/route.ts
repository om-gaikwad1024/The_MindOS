import { NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  const now = new Date();

  const [tasks, learnings, logs, boards] = await Promise.all([
    prisma.task.findMany({ where: { userId: USER_ID } }),
    prisma.learning.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } }),
    prisma.dailyLog.findMany({ where: { userId: USER_ID }, orderBy: { date: "desc" }, take: 90 }),
    prisma.board.findMany({ where: { userId: USER_ID }, include: { columns: { include: { cards: true } } } }),
  ]);

  const monthlyFinance = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(now, 5 - i);
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      return prisma.transaction.findMany({ where: { userId: USER_ID, date: { gte: start, lte: end } } }).then((txs) => ({
        month: format(m, "MMM"),
        income: txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        expense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      }));
    })
  );

  const learningsByWeek: Record<string, number> = {};
  learnings.slice(0, 50).forEach((l) => {
    const w = format(new Date(l.createdAt), "MMM d");
    learningsByWeek[w] = (learningsByWeek[w] || 0) + 1;
  });

  const categoryDist: Record<string, number> = {};
  learnings.forEach((l) => { categoryDist[l.category] = (categoryDist[l.category] || 0) + 1; });

  const priorityDist: Record<string, number> = {};
  tasks.forEach((t) => { priorityDist[t.priority] = (priorityDist[t.priority] || 0) + 1; });

  const boardStats = boards.map((b) => ({
    name: b.title,
    total: b.columns.reduce((s, c) => s + c.cards.length, 0),
    active: b.columns.reduce((s, c) => s + c.cards.filter((cd) => !cd.isArchived).length, 0),
  }));

  const avgEnergy = logs.slice(0, 7).reduce((s, l) => s + l.energyLevel, 0) / Math.max(logs.slice(0, 7).length, 1);
  const logDates = logs.map((l) => l.date.toISOString());

  return NextResponse.json({
    taskStats: { total: tasks.length, active: tasks.filter((t) => t.status === "active").length, archived: tasks.filter((t) => t.status === "archived").length },
    learningStats: { total: learnings.length, categoryDist, avgEnergy },
    priorityDist,
    monthlyFinance,
    boardStats,
    logDates,
    recentLearnings: learnings.slice(0, 5),
  });
}