export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const accounts = await prisma.account.findMany({ where: { userId: USER_ID } });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const account = await prisma.account.create({ data: { ...body, userId: USER_ID } });
  return NextResponse.json(account, { status: 201 });
}