export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const boards = await prisma.board.findMany({
    where: { userId: USER_ID },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(boards);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const board = await prisma.board.create({ data: { ...body, userId: USER_ID } });
  await prisma.boardColumn.createMany({
    data: [
      { boardId: board.id, title: "Backlog", position: 0 },
      { boardId: board.id, title: "In Progress", position: 1 },
      { boardId: board.id, title: "Done", position: 2 },
    ],
  });
  return NextResponse.json(board, { status: 201 });
}