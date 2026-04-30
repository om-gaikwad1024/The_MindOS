import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function summarizeLearning(rawInput: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Summarize this learning note in 2-4 clear, dense sentences. No fluff. Write like a senior engineer who distills knowledge precisely. Preserve technical accuracy. Raw note: "${rawInput}"`,
      },
    ],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : rawInput;
}

export async function generateDailyReflection(log: {
  energyLevel: number;
  mood: number;
  wins: string;
  blockers: string;
  learnedToday: string;
  tomorrowFocus: string;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Write a 3-4 sentence reflection for an engineering intern based on their daily log. Be honest, insightful, and mentoring — not cheerleader. Identify patterns. Give one specific tactical suggestion.

Energy: ${log.energyLevel}/5
Mood: ${log.mood}/5
Wins: ${log.wins}
Blockers: ${log.blockers}
Learned: ${log.learnedToday}
Tomorrow focus: ${log.tomorrowFocus}`,
      },
    ],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function generateWeeklySummary(data: {
  logs: Array<{ wins: string; blockers: string; learnedToday: string }>;
  learnings: Array<{ claudeSummary: string }>;
  tasks: Array<{ title: string; status: string }>;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 350,
    messages: [
      {
        role: "user",
        content: `Write a 3-4 sentence weekly summary for an engineering intern. Be analytical, not motivational. Identify growth patterns, recurring blockers, and the week's true highlight.

Logs: ${JSON.stringify(data.logs.slice(0, 5))}
Learnings: ${data.learnings.map((l) => l.claudeSummary).join(" | ")}
Tasks completed: ${data.tasks.filter((t) => t.status === "archived").length}`,
      },
    ],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function generateMorningBrief(data: {
  tasks: Array<{ title: string; priority: string }>;
  lastLog: { wins: string; mood: number; energyLevel: number } | null;
  budgetStatus: { totalSpent: number; totalBudget: number };
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Write a 2-3 sentence sharp morning brief for an engineering intern. Be direct. Tell them what matters today and one thing to watch.

Today's tasks: ${data.tasks.map((t) => `${t.title} (${t.priority})`).join(", ")}
Yesterday's mood: ${data.lastLog?.mood || "??"}/5, energy: ${data.lastLog?.energyLevel || "??"}/5
Yesterday's win: ${data.lastLog?.wins || "none logged"}
Budget: ₹${data.budgetStatus.totalSpent} spent of ₹${data.budgetStatus.totalBudget} this month`,
      },
    ],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export async function generateFinanceInsights(transactions: Array<{ title: string; amount: number; type: string; category: string }>): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 250,
    messages: [
      {
        role: "user",
        content: `Analyze these transactions and give 2-3 sharp, specific financial observations for a young professional in India. No generic advice.

Transactions: ${JSON.stringify(transactions.slice(0, 20))}`,
      },
    ],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}