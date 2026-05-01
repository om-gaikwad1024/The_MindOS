export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const goal = await prisma.goal.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(goal);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}