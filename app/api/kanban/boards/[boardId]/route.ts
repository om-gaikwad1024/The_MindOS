import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { boardId: string } }) {
  const board = await prisma.board.findUnique({
    where: { id: params.boardId },
    include: {
      columns: {
        include: { cards: { where: { isArchived: false }, orderBy: { position: "asc" } } },
        orderBy: { position: "asc" },
      },
    },
  });
  return NextResponse.json(board);
}

export async function PATCH(req: NextRequest, { params }: { params: { boardId: string } }) {
  const body = await req.json();
  const board = await prisma.board.update({ where: { id: params.boardId }, data: body });
  return NextResponse.json(board);
}

export async function DELETE(_: NextRequest, { params }: { params: { boardId: string } }) {
  await prisma.board.delete({ where: { id: params.boardId } });
  return NextResponse.json({ ok: true });
}