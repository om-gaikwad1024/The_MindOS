import { NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { subDays, isSameDay } from "date-fns";

export async function GET() {
  const [learnings, logs, weekly] = await Promise.all([
    prisma.learning.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } }),
    prisma.dailyLog.findMany({ where: { userId: USER_ID }, orderBy: { date: "desc" }, take: 90 }),
    prisma.weeklyProgress.findMany({ where: { userId: USER_ID }, orderBy: { weekStartDate: "desc" }, take: 12 }),
  ]);

  let streak = 0;
  let d = new Date();
  while (true) {
    const hasLog = logs.some((l) => isSameDay(new Date(l.date), d));
    if (!hasLog) break;
    streak++;
    d = subDays(d, 1);
  }

  const tagFreq: Record<string, number> = {};
  learnings.forEach((l) => l.tags.forEach((t) => { tagFreq[t] = (tagFreq[t] || 0) + 1; }));
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return NextResponse.json({ learnings: learnings.length, logs: logs.length, streak, topTags, weekly });
}