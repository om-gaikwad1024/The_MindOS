export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { cardId: string } }) {
  const body = await req.json();
  const card = await prisma.kanbanCard.update({ where: { id: params.cardId }, data: body });
  return NextResponse.json(card);
}

export async function DELETE(_: NextRequest, { params }: { params: { cardId: string } }) {
  await prisma.kanbanCard.update({ where: { id: params.cardId }, data: { isArchived: true } });
  return NextResponse.json({ ok: true });
}