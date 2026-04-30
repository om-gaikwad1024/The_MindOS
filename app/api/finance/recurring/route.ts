import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const recurring = await prisma.recurringTransaction.findMany({ where: { userId: USER_ID }, orderBy: { nextDue: "asc" } });
  return NextResponse.json(recurring);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const r = await prisma.recurringTransaction.create({ data: { ...body, userId: USER_ID } });
  return NextResponse.json(r, { status: 201 });
}