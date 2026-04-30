import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const col = await prisma.boardColumn.create({ data: body });
  return NextResponse.json(col, { status: 201 });
}