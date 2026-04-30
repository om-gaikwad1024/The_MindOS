import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const budgets = await prisma.budget.findMany({ where: { userId: USER_ID, month, year }, include: { category: true } });
  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const budget = await prisma.budget.upsert({
    where: { id: body.id || "" },
    update: { amount: body.amount },
    create: { ...body, userId: USER_ID },
  });
  return NextResponse.json(budget, { status: 201 });
}