export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET() {
  const today = new Date();
  const yesterday = subDays(today, 1);

  const [
    todayTasks,
    overdueTasks,
    yesterdayLog,
    runningContext,
    goals,
    recentLogs,
  ] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: USER_ID,
        status: "active",
        OR: [
          { section: "today" },
          {
            dueDate: {
              gte: startOfDay(today),
              lte: endOfDay(today),
            },
          },
        ],
      },
      orderBy: { priority: "desc" },
    }),
    prisma.task.findMany({
      where: {
        userId: USER_ID,
        status: "active",
        dueDate: { lt: startOfDay(today) },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.dailyLog.findFirst({
      where: {
        userId: USER_ID,
        date: {
          gte: startOfDay(yesterday),
          lte: endOfDay(yesterday),
        },
      },
    }),
    prisma.runningContext.findUnique({
      where: { userId: USER_ID },
    }),
    prisma.goal.findMany({
      where: { userId: USER_ID, status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.dailyLog.findMany({
      where: { userId: USER_ID },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  const avgEnergy =
    recentLogs.length > 0
      ? recentLogs.reduce((s, l) => s + l.energyLevel, 0) / recentLogs.length
      : null;

  const avgMood =
    recentLogs.length > 0
      ? recentLogs.reduce((s, l) => s + l.mood, 0) / recentLogs.length
      : null;

  return NextResponse.json({
    date: format(today, "EEEE, MMMM d yyyy"),
    todayTasks: todayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      tags: t.tags,
      relatedSkills: t.relatedSkills,
    })),
    overdueTasks: overdueTasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
    yesterdayLog: yesterdayLog
      ? {
          mood: yesterdayLog.mood,
          energyLevel: yesterdayLog.energyLevel,
          wins: yesterdayLog.wins,
          blockers: yesterdayLog.blockers,
          tomorrowFocus: yesterdayLog.tomorrowFocus,
        }
      : null,
    weeklyTrend: {
      avgEnergy: avgEnergy ? parseFloat(avgEnergy.toFixed(1)) : null,
      avgMood: avgMood ? parseFloat(avgMood.toFixed(1)) : null,
      logCount: recentLogs.length,
    },
    runningContext: runningContext?.content || null,
    activeGoals: goals.map((g) => ({
      id: g.id,
      title: g.title,
      why: g.why,
      timeframe: g.timeframe,
      deadline: g.deadline,
      linkedTasks: g.linkedTasks,
    })),
  });
}