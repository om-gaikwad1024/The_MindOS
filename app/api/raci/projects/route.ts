export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.raciProject.findMany({ where: { userId: USER_ID }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const project = await prisma.raciProject.create({ data: { ...body, userId: USER_ID } });
  return NextResponse.json(project, { status: 201 });
}