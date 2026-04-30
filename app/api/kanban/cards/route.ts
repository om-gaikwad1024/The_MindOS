import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const card = await prisma.kanbanCard.create({ data: { ...body, tags: body.tags || [] } });
  return NextResponse.json(card, { status: 201 });
}