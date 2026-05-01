export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const limit = searchParams.get("limit");

  const where: Record<string, unknown> = { userId: USER_ID };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true, account: true },
    orderBy: { date: "desc" },
    take: limit ? parseInt(limit) : 100,
  });
  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tx = await prisma.transaction.create({
    data: {
      userId: USER_ID,
      accountId: body.accountId,
      title: body.title,
      amount: parseFloat(body.amount),
      type: body.type,
      categoryId: body.categoryId || null,
      date: new Date(body.date),
      notes: body.notes || null,
      tags: body.tags || [],
      isRecurring: body.isRecurring || false,
    },
    include: { category: true, account: true },
  });

  await prisma.account.update({
    where: { id: body.accountId },
    data: {
      balance: {
        increment: body.type === "income" ? parseFloat(body.amount) : -parseFloat(body.amount),
      },
    },
  });

  return NextResponse.json(tx, { status: 201 });
}