import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { projectId: string } }) {
  const project = await prisma.raciProject.findUnique({
    where: { id: params.projectId },
    include: {
      tasks: { include: { assignments: true }, orderBy: { position: "asc" } },
      members: { orderBy: { createdAt: "asc" } },
    },
  });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { projectId: string } }) {
  const body = await req.json();
  const project = await prisma.raciProject.update({ where: { id: params.projectId }, data: body });
  return NextResponse.json(project);
}