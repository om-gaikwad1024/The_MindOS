export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

const BASE =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
    description: "Mark a task as done by its id",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_captures",
    description: "Get all captures from MindOS inbox, optionally filtered by processed status",
    inputSchema: {
      type: "object",
      properties: {
        processed: { type: "boolean", description: "true for processed, false for unprocessed, omit for all" },
      },
    },
  },
  {
    name: "update_capture",
    description: "Mark a capture as processed or assign it to a section",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        processed: { type: "boolean" },
        assignedTo: { type: "string", enum: ["task", "learning", "log", "ignore"] },
      },
    },
  },
  {
    name: "delete_capture",
    description: "Permanently delete a capture from MindOS",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_all_tasks",
    description: "Get all active tasks from MindOS",
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
    description: "Get learnings from MindOS vault, optionally filtered",
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
    description: "Quick capture raw text into MindOS for later processing",
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
    name: "get_running_context",
    description: "Fetch the persistent running context — blockers, goals, ongoing projects, anything flagged as worth remembering across sessions",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "update_running_context",
    description: "Write back to the persistent running context after a session. Use append:true to add to existing context rather than overwrite.",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        append: { type: "boolean", description: "If true, appends with timestamp instead of overwriting" },
      },
    },
  },
  {
    name: "get_morning_brief",
    description: "Get the full bundled morning startup payload — today tasks, overdue tasks, yesterday log, weekly trend, running context, and active goals. Use this at the start of every morning conversation.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_goals",
    description: "Get active goals from MindOS — short term and long term",
    inputSchema: {
      type: "object",
      properties: {
        timeframe: { type: "string", enum: ["short_term", "long_term"] },
      },
    },
  },
  {
    name: "add_goal",
    description: "Add a new goal to MindOS",
    inputSchema: {
      type: "object",
      required: ["title", "timeframe"],
      properties: {
        title: { type: "string" },
        why: { type: "string", description: "Why this goal matters" },
        timeframe: { type: "string", enum: ["short_term", "long_term"] },
        deadline: { type: "string", description: "YYYY-MM-DD" },
      },
    },
  },
  {
    name: "link_task_to_goal",
    description: "Link a task to a goal in MindOS so Claude can reframe advice in terms of goals",
    inputSchema: {
      type: "object",
      required: ["goalId", "taskId"],
      properties: {
        goalId: { type: "string" },
        taskId: { type: "string" },
      },
    },
  },
  {
    name: "get_skill_overlap",
    description: "Get tasks and learnings that share the same skill tags — surfaces the learning-task bridge. Optionally filter by a specific skill.",
    inputSchema: {
      type: "object",
      properties: {
        skill: { type: "string", description: "Filter by specific skill tag" },
      },
    },
  },
  {
    name: "delete_learning",
    description: "Permanently delete a learning from the MindOS vault by id",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "delete_log",
    description: "Delete a daily log entry from MindOS by id",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "get_recent_logs",
    description: "Get recent daily logs. Default 30 days. Pass days param for more.",
    inputSchema: {
      type: "object",
      properties: {
        days: { type: "number", description: "Number of days to fetch, default 30" },
      },
    },
  },
  {
    name: "get_kanban_boards",
    description: "Get all Kanban boards from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_progress",
    description: "Get learning streak, top skills and weekly progress from MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_dashboard",
    description: "Get full MindOS dashboard — tasks, learnings, finance, boards. Use for morning brief.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_raci_projects",
    description: "List all RACI projects in MindOS",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_raci_project",
    description: "Get the full RACI matrix for a specific project",
    inputSchema: {
      type: "object",
      required: ["projectId"],
      properties: { projectId: { type: "string" } },
    },
  },
];

async function fetcher(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "get_today_tasks":
      return fetcher("/api/tasks?section=today&status=active");

    case "get_all_tasks":
      return fetcher("/api/tasks?status=active");

    case "get_running_context":
      return fetcher("/api/context");

    case "update_running_context":
      return fetcher("/api/context", "POST", {
        content: args.content,
        append: args.append ?? true,
      });

    case "get_morning_brief":
      return fetcher("/api/morning-brief");

    case "get_goals": {
      const p = args.timeframe ? `?timeframe=${args.timeframe}` : "";
      return fetcher(`/api/goals${p}`);
    }

    case "add_goal":
      return fetcher("/api/goals", "POST", args);

    case "link_task_to_goal": {
      const goal = await fetcher(`/api/goals/${args.goalId}`);
      const linked = goal.linkedTasks || [];
      if (!linked.includes(args.taskId)) {
        linked.push(args.taskId);
      }
      return fetcher(`/api/goals/${args.goalId}`, "PATCH", {
        linkedTasks: linked,
      });
    }

    case "get_skill_overlap": {
      const q = args.skill ? `?skill=${args.skill}` : "";
      return fetcher(`/api/skills/overlap${q}`);
    }

    case "get_recent_logs": {
      const days = args.days || 30;
      return fetcher(`/api/logs?recent=${days}`);
    }

    case "add_task":
      return fetcher("/api/tasks", "POST", {
        ...args,
        section: "today",
        tags: args.tags || [],
      });

    case "archive_task":
      return fetcher(`/api/tasks/${args.id}`, "PATCH", { status: "archived" });
    
    case "delete_learning":
      return fetcher(`/api/learnings/${args.id}`, "DELETE");

    case "delete_log":
      return fetcher(`/api/logs/${args.id}`, "DELETE");

    case "add_learning":
      return fetcher("/api/learnings", "POST", {
        ...args,
        tags: args.tags || [],
      });

    case "get_learnings": {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(args).filter(([, v]) => v != null && v !== "")
        ) as Record<string, string>
      ).toString();
      return fetcher(`/api/learnings?${params}`);
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
      if (!accountId) return { error: "No account found. Create an account in MindOS first." };
      return fetcher("/api/finance/transactions", "POST", {
        ...args,
        accountId,
        tags: [],
      });
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

    case "get_captures": {
      const data = await fetcher("/api/captures");
      if (args.processed !== undefined) {
        return data.filter((c: { processed: boolean }) => c.processed === args.processed);
      }
      return data;
    }

    case "update_capture":
      return fetcher(`/api/captures/${args.id}`, "PATCH", {
        processed: args.processed,
        assignedTo: args.assignedTo,
      });

    case "delete_capture":
      return fetcher(`/api/captures/${args.id}`, "DELETE");

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const accept = req.headers.get("accept") || "";

  if (accept.includes("text/event-stream")) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        send({
          jsonrpc: "2.0",
          method: "notifications/initialized",
          params: {},
        });

        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }, 15000);

        req.signal.addEventListener("abort", () => {
          clearInterval(keepAlive);
          controller.close();
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        ...corsHeaders(),
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  return NextResponse.json(
    {
      name: "MindOS MCP Server",
      status: "ok",
      version: "1.0.0",
      tools: tools.length,
    },
    { headers: corsHeaders() }
  );
}

export async function POST(req: NextRequest) {
  let body: {
    jsonrpc?: string;
    id?: string | number;
    method?: string;
    params?: { name?: string; arguments?: Record<string, unknown> };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { headers: corsHeaders() }
    );
  }

  const { method, id, params } = body;

  if (method === "initialize") {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "mindos", version: "1.0.0" },
        },
      },
      { headers: corsHeaders() }
    );
  }

  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  }

  if (method === "tools/list") {
    return NextResponse.json(
      { jsonrpc: "2.0", id, result: { tools } },
      { headers: corsHeaders() }
    );
  }

  if (method === "tools/call") {
    const toolName = params?.name || "";
    const toolArgs = (params?.arguments || {}) as Record<string, unknown>;

    try {
      const result = await executeTool(toolName, toolArgs);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          },
        },
        { headers: corsHeaders() }
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Error: ${msg}` }],
            isError: true,
          },
        },
        { headers: corsHeaders() }
      );
    }
  }

  return NextResponse.json(
    { jsonrpc: "2.0", id, result: {} },
    { headers: corsHeaders() }
  );
}