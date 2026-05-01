export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get("skill");

  const [tasks, learnings] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: USER_ID,
        status: "active",
        ...(skill
          ? {
              OR: [
                { tags: { has: skill } },
                { relatedSkills: { has: skill } },
              ],
            }
          : {}),
      },
      orderBy: { priority: "desc" },
    }),
    prisma.learning.findMany({
      where: {
        userId: USER_ID,
        ...(skill ? { tags: { has: skill } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const taskSkills = new Set(
    tasks.flatMap((t) => [...t.tags, ...t.relatedSkills])
  );
  const learningTags = new Set(learnings.flatMap((l) => l.tags));
  const overlapping = Array.from(taskSkills).filter((s) => learningTags.has(s));

  const pairs = overlapping.map((skill) => ({
    skill,
    tasks: tasks
      .filter(
        (t) => t.tags.includes(skill) || t.relatedSkills.includes(skill)
      )
      .map((t) => ({ id: t.id, title: t.title, priority: t.priority })),
    learnings: learnings
      .filter((l) => l.tags.includes(skill))
      .map((l) => ({
        id: l.id,
        claudeSummary: l.claudeSummary,
        category: l.category,
        createdAt: l.createdAt,
      })),
  }));

  return NextResponse.json({
    overlapping,
    pairs,
    totalTasks: tasks.length,
    totalLearnings: learnings.length,
  });
}