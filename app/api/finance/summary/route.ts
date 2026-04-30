
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  const transactions = await prisma.transaction.findMany({
    where: { userId: USER_ID, date: { gte: start, lte: end } },
    include: { category: true },
  });

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, { name: string; amount: number; color: string; icon: string }>>((acc, t) => {
      const key = t.categoryId || "other";
      const name = t.category?.name || "Other";
      if (!acc[key]) acc[key] = { name, amount: 0, color: t.category?.color || "#666", icon: t.category?.icon || "💳" };
      acc[key].amount += t.amount;
      return acc;
    }, {});

  return NextResponse.json({ income, expense, byCategory: Object.values(byCategory) });
}