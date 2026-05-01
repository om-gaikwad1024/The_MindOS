export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { subDays } from "date-fns";

export async function GET() {
  const weekAgo = subDays(new Date(), 7);

  await prisma.task.deleteMany({
    where: {
      userId: USER_ID,
      status: "archived",
      createdAt: { lt: weekAgo },
    },
  });

  const tasks = await prisma.task.findMany({
    where: { userId: USER_ID, status: "archived" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}