export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma, USER_ID } from "@/lib/prisma";
import { summarizeLearning, generateDailyReflection } from "@/lib/anthropic";
import { format } from "date-fns";

const tools = [
  {
    name: "get_today_tasks",
    description: "Get all active tasks for today from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "add_task",
    description: "Add a new task to MindOS",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        dueDate: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "archive_task",
    description: "Mark a task as done/archived by its id",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_all_tasks",
    description: "Get all active tasks across today and backlog",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "add_learning",
    description: "Save a learning note to MindOS vault. Claude summarizes it automatically.",
    inputSchema: {
      type: "object",
      required: ["rawInput"],
      properties: {
        rawInput: { type: "string" },
        category: { type: "string", enum: ["concept", "snippet", "link", "paper", "resource", "tool"] },
        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
        tags: { type: "array", items: { type: "string" } },
        sourceUrl: { type: "string" },
      },
    },
  },
  {
    name: "get_learnings",
    description: "Get learnings from the vault, optionally filtered",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        difficulty: { type: "string" },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_daily_log",
    description: "Save today's daily journal log to MindOS",
    inputSchema: {
      type: "object",
      required: ["energyLevel", "mood"],
      properties: {
        energyLevel: { type: "number" },
        mood: { type: "number" },
        wins: { type: "string" },
        blockers: { type: "string" },
        learnedToday: { type: "string" },
        tomorrowFocus: { type: "string" },
      },
    },
  },
  {
    name: "get_recent_logs",
    description: "Get the last 7 daily logs from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "add_capture",
    description: "Quick capture raw text to MindOS for later processing",
    inputSchema: {
      type: "object",
      required: ["rawText"],
      properties: { rawText: { type: "string" } },
    },
  },
  {
    name: "get_finance_summary",
    description: "Get this month income vs expense summary from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "add_transaction",
    description: "Add a financial transaction to MindOS",
    inputSchema: {
      type: "object",
      required: ["title", "amount", "type", "date"],
      properties: {
        title: { type: "string" },
        amount: { type: "number" },
        type: { type: "string", enum: ["income", "expense"] },
        date: { type: "string" },
        notes: { type: "string" },
      },
    },
  },
  {
    name: "get_kanban_boards",
    description: "Get all Kanban boards and their card counts from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_progress",
    description: "Get learning streak, top skills and weekly progress from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_dashboard",
    description: "Get full MindOS dashboard — tasks, learnings, finance, boards, logs. Use for morning brief.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_raci_project",
    description: "Get the RACI matrix for a specific project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: { projectId: { type: "string" } },
    },
  },
  {
    name: "get_raci_projects",
    description: "List all RACI projects in MindOS",
    inputSchema: { type: "object", properties: {} },
  },
];

async function executeTool(name: string, args: Record<string, unknown>) {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const fetcher = (path: string, method = "GET", body?: unknown) =>
    fetch(`${base}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => r.json());

  switch (name) {
    case "get_today_tasks":
      return fetcher("/api/tasks?section=today&status=active");

    case "get_all_tasks":
      return fetcher("/api/tasks?status=active");

    case "add_task":
      return fetcher("/api/tasks", "POST", { ...args, section: "today", tags: args.tags || [] });

    case "archive_task":
      return fetcher(`/api/tasks/${args.id}`, "PATCH", { status: "archived" });

    case "add_learning":
      return fetcher("/api/learnings", "POST", { ...args, tags: args.tags || [] });

    case "get_learnings": {
      const p = new URLSearchParams(
        Object.fromEntries(Object.entries(args).filter(([, v]) => v)) as Record<string, string>
      ).toString();
      return fetcher(`/api/learnings?${p}`);
    }

    case "add_daily_log":
      return fetcher("/api/logs", "POST", {
        ...args,
        date: format(new Date(), "yyyy-MM-dd"),
      });

    case "get_recent_logs":
      return fetcher("/api/logs?recent=7");

    case "add_capture":
      return fetcher("/api/captures", "POST", args);

    case "get_finance_summary": {
      const m = new Date().getMonth() + 1;
      const y = new Date().getFullYear();
      return fetcher(`/api/finance/summary?month=${m}&year=${y}`);
    }

    case "add_transaction": {
      const accounts = await fetcher("/api/finance/accounts");
      const accountId = accounts[0]?.id;
      if (!accountId) return { error: "No account found. Create an account first." };
      return fetcher("/api/finance/transactions", "POST", { ...args, accountId, tags: [] });
    }

    case "get_kanban_boards":
      return fetcher("/api/kanban/boards");

    case "get_progress":
      return fetcher("/api/progress");

    case "get_dashboard":
      return fetcher("/api/dashboard");

    case "get_raci_projects":
      return fetcher("/api/raci/projects");

    case "get_raci_project":
      return fetcher(`/api/raci/projects/${args.projectId}`);

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "mindos", version: "1.0.0" },
      },
    });
  }

  if (body.method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id,
      result: { tools },
    });
  }

  if (body.method === "tools/call") {
    const { name, arguments: args } = body.params;
    try {
      const result = await executeTool(name, args || {});
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          content: [{ type: "text", text: `Error: ${msg}` }],
          isError: true,
        },
      });
    }
  }

  return NextResponse.json({ jsonrpc: "2.0", id: body.id, result: {} });
}

export async function GET() {
  return NextResponse.json({ name: "MindOS MCP Server", status: "ok", tools: tools.length });
}