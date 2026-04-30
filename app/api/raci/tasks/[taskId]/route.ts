export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: NextRequest, { params }: { params: { taskId: string } }) {
  await prisma.raciTask.delete({ where: { id: params.taskId } });
  return NextResponse.json({ ok: true });
}