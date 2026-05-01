export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const context = await prisma.runningContext.findUnique({
    where: { userId: USER_ID },
  });
  return NextResponse.json(context || { content: "", updatedAt: null });
}

export async function POST(req: NextRequest) {
  const { content, append } = await req.json();

  const existing = await prisma.runningContext.findUnique({
    where: { userId: USER_ID },
  });

  let newContent = content;

  if (append && existing?.content) {
    const timestamp = new Date().toISOString().split("T")[0];
    newContent = `${existing.content}\n\n--- ${timestamp} ---\n${content}`;
  }

  const context = await prisma.runningContext.upsert({
    where: { userId: USER_ID },
    update: { content: newContent },
    create: { userId: USER_ID, content: newContent },
  });

  return NextResponse.json(context);
}