export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const task = await prisma.task.update({ where: { id: params.id }, data: body });
  return NextResponse.json(task);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}