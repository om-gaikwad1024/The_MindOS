import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { taskId, memberId, responsibility } = await req.json();
  const assignment = await prisma.raciAssignment.upsert({
    where: { taskId_memberId: { taskId, memberId } },
    update: { responsibility },
    create: { taskId, memberId, responsibility },
  });
  return NextResponse.json(assignment);
}

export async function DELETE(req: NextRequest) {
  const { taskId, memberId } = await req.json();
  await prisma.raciAssignment.delete({ where: { taskId_memberId: { taskId, memberId } } });
  return NextResponse.json({ ok: true });
}