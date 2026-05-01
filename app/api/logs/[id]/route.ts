export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const log = await prisma.dailyLog.update({ where: { id: params.id }, data: body });
  return NextResponse.json(log);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.dailyLog.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}