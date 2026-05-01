export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get("timeframe");
  const status = searchParams.get("status") || "active";

  const where: Record<string, unknown> = { userId: USER_ID, status };
  if (timeframe) where.timeframe = timeframe;

  const goals = await prisma.goal.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const goal = await prisma.goal.create({
    data: {
      ...body,
      userId: USER_ID,
      linkedTasks: body.linkedTasks || [],
    },
  });
  return NextResponse.json(goal, { status: 201 });
}