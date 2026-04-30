export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { generateDailyReflection } from "@/lib/anthropic";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const recent = searchParams.get("recent");

  if (date) {
    const log = await prisma.dailyLog.findUnique({ where: { userId_date: { userId: USER_ID, date: new Date(date) } } });
    return NextResponse.json(log);
  }

  const logs = await prisma.dailyLog.findMany({
    where: { userId: USER_ID },
    orderBy: { date: "desc" },
    take: recent ? parseInt(recent) : 30,
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const date = new Date(format(new Date(body.date || new Date()), "yyyy-MM-dd"));
  let claudeReflection = "";
  try {
    claudeReflection = await generateDailyReflection({
      energyLevel: body.energyLevel,
      mood: body.mood,
      wins: body.wins || "",
      blockers: body.blockers || "",
      learnedToday: body.learnedToday || "",
      tomorrowFocus: body.tomorrowFocus || "",
    });
  } catch {}

  const log = await prisma.dailyLog.upsert({
    where: { userId_date: { userId: USER_ID, date } },
    update: { ...body, date, claudeReflection },
    create: { ...body, date, userId: USER_ID, claudeReflection },
  });
  return NextResponse.json(log, { status: 201 });
}