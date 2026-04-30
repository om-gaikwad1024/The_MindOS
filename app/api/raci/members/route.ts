export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const member = await prisma.raciMember.create({ data: body });
  return NextResponse.json(member, { status: 201 });
}