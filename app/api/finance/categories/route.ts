import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const cats = await prisma.financeCategory.findMany({ where: { userId: USER_ID }, orderBy: { name: "asc" } });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cat = await prisma.financeCategory.create({ data: { ...body, userId: USER_ID } });
  return NextResponse.json(cat, { status: 201 });
}