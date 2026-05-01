export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const status = searchParams.get("status") || "active";
  const today = searchParams.get("today") === "true";

  const where: Record<string, unknown> = { userId: USER_ID, status };
  if (section) where.section = section;
  if (today) {
    where.OR = [
      { dueDate: { gte: startOfDay(new Date()), lte: endOfDay(new Date()) } },
      { section: "today" },
    ];
  }

  const tasks = await prisma.task.findMany({ where, orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      userId: USER_ID,
      title: body.title,
      description: body.description || null,
      status: body.status || "active",
      priority: body.priority || "medium",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      section: body.section || "today",
      tags: body.tags || [],
      relatedSkills: body.relatedSkills || [],
      category: body.category || null,
    },
  });
  return NextResponse.json(task, { status: 201 });
}