export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { columnId: string } }) {
  const body = await req.json();
  const col = await prisma.boardColumn.update({ where: { id: params.columnId }, data: body });
  return NextResponse.json(col);
}

export async function DELETE(_: NextRequest, { params }: { params: { columnId: string } }) {
  await prisma.boardColumn.delete({ where: { id: params.columnId } });
  return NextResponse.json({ ok: true });
}