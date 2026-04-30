import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const captures = await prisma.capture.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" }, take: 20 });
  return NextResponse.json(captures);
}

export async function POST(req: NextRequest) {
  const { rawText } = await req.json();
  const capture = await prisma.capture.create({ data: { userId: USER_ID, rawText } });
  return NextResponse.json(capture, { status: 201 });
}