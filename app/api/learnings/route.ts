import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { summarizeLearning } from "@/lib/anthropic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");
  const favorite = searchParams.get("favorite");

  const where: Record<string, unknown> = { userId: USER_ID };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (favorite === "true") where.isFavorite = true;
  if (search) {
    where.OR = [
      { claudeSummary: { contains: search, mode: "insensitive" } },
      { rawInput: { contains: search, mode: "insensitive" } },
    ];
  }

  const learnings = await prisma.learning.findMany({ where, orderBy: { createdAt: "desc" } });
  return NextResponse.json(learnings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  let claudeSummary = "";
  try {
    claudeSummary = await summarizeLearning(body.rawInput);
  } catch {
    claudeSummary = body.rawInput;
  }
  const learning = await prisma.learning.create({
    data: { ...body, userId: USER_ID, claudeSummary, tags: body.tags || [] },
  });
  return NextResponse.json(learning, { status: 201 });
}