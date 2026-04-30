const http = require("http");
const { execSync } = require("child_process");

const BASE_URL = "http://localhost:3000";

const tools = [
  {
    name: "get_today_tasks",
    description: "Get all active tasks for today",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "add_task",
    description: "Add a new task",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
        dueDate: { type: "string", description: "YYYY-MM-DD format" },
        tags: { type: "array", items: { type: "string" } }
      }
    }
  },
  {
    name: "add_learning",
    description: "Add a learning note. Claude will auto-summarize it.",
    inputSchema: {
      type: "object",
      required: ["rawInput"],
      properties: {
        rawInput: { type: "string" },
        category: { type: "string", enum: ["concept", "snippet", "link", "paper", "resource", "tool"] },
        difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
        tags: { type: "array", items: { type: "string" } },
        sourceUrl: { type: "string" }
      }
    }
  },
  {
    name: "get_learnings",
    description: "Get learnings, optionally filtered",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string" },
        difficulty: { type: "string" },
        search: { type: "string" }
      }
    }
  },
  {
    name: "add_daily_log",
    description: "Save today's daily log entry",
    inputSchema: {
      type: "object",
      required: ["energyLevel", "mood"],
      properties: {
        energyLevel: { type: "number", minimum: 1, maximum: 5 },
        mood: { type: "number", minimum: 1, maximum: 5 },
        wins: { type: "string" },
        blockers: { type: "string" },
        learnedToday: { type: "string" },
        tomorrowFocus: { type: "string" }
      }
    }
  },
  {
    name: "get_recent_logs",
    description: "Get the last 7 daily logs",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "add_capture",
    description: "Quick capture — dump raw unprocessed text",
    inputSchema: {
      type: "object",
      required: ["rawText"],
      properties: { rawText: { type: "string" } }
    }
  },
  {
    name: "get_boards",
    description: "Get all Kanban boards",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "add_transaction",
    description: "Add a financial transaction",
    inputSchema: {
      type: "object",
      required: ["title", "amount", "type", "accountId", "date"],
      properties: {
        title: { type: "string" },
        amount: { type: "number" },
        type: { type: "string", enum: ["income", "expense"] },
        accountId: { type: "string" },
        categoryId: { type: "string" },
        date: { type: "string" }
      }
    }
  },
  {
    name: "get_finance_summary",
    description: "Get this month's income vs expense summary",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_dashboard",
    description: "Get full dashboard data — tasks, learnings, finance, boards",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_progress",
    description: "Get learning streak, top skills, weekly progress",
    inputSchema: { type: "object", properties: {} }
  }
];

async function callApi(path, method = "GET", body = null) {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  return res.json();
}

async function handleTool(name, args) {
  switch (name) {
    case "get_today_tasks":
      return callApi("/api/tasks?section=today&status=active");
    case "add_task":
      return callApi("/api/tasks", "POST", { ...args, section: "today" });
    case "add_learning":
      return callApi("/api/learnings", "POST", args);
    case "get_learnings": {
      const p = new URLSearchParams(args).toString();
      return callApi(`/api/learnings?${p}`);
    }
    case "add_daily_log":
      return callApi("/api/logs", "POST", {
        ...args,
        date: new Date().toISOString().split("T")[0]
      });
    case "get_recent_logs":
      return callApi("/api/logs?recent=7");
    case "add_capture":
      return callApi("/api/captures", "POST", args);
    case "get_boards":
      return callApi("/api/kanban/boards");
    case "add_transaction":
      return callApi("/api/finance/transactions", "POST", { ...args, tags: [] });
    case "get_finance_summary":
      return callApi(`/api/finance/summary?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`);
    case "get_dashboard":
      return callApi("/api/dashboard");
    case "get_progress":
      return callApi("/api/progress");
    default:
      return { error: "Unknown tool" };
  }
}

process.stdin.setEncoding("utf8");
let buffer = "";

process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);

      if (msg.method === "initialize") {
        process.stdout.write(JSON.stringify({
          jsonrpc: "2.0", id: msg.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "mindos", version: "1.0.0" }
          }
        }) + "\n");
      }

      else if (msg.method === "tools/list") {
        process.stdout.write(JSON.stringify({
          jsonrpc: "2.0", id: msg.id,
          result: { tools }
        }) + "\n");
      }

      else if (msg.method === "tools/call") {
        const { name, arguments: args } = msg.params;
        try {
          const result = await handleTool(name, args || {});
          process.stdout.write(JSON.stringify({
            jsonrpc: "2.0", id: msg.id,
            result: {
              content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
            }
          }) + "\n");
        } catch (e) {
          process.stdout.write(JSON.stringify({
            jsonrpc: "2.0", id: msg.id,
            result: {
              content: [{ type: "text", text: `Error: ${e.message}` }],
              isError: true
            }
          }) + "\n");
        }
      }

      else if (msg.method === "notifications/initialized") {
        // no response needed
      }

    } catch (e) {
      // parse error, skip
    }
  }
});