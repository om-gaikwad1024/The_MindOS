import { PrismaClient } from "@prisma/client";
import { subDays, startOfWeek, format } from "date-fns";

const prisma = new PrismaClient();
const USER_ID = "demo-user-id";

async function main() {
  await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: "demo@mindos.app",
      name: "Alex Chen",
    },
  });

  await prisma.task.createMany({
    data: [
      { userId: USER_ID, title: "Review PR #42 for auth module", priority: "urgent", section: "today", dueDate: new Date(), tags: ["backend", "review"] },
      { userId: USER_ID, title: "Write unit tests for payment service", priority: "high", section: "today", dueDate: new Date(), tags: ["testing"] },
      { userId: USER_ID, title: "Update API documentation", priority: "medium", section: "today", tags: ["docs"] },
      { userId: USER_ID, title: "Fix mobile layout bug on dashboard", priority: "low", section: "backlog", tags: ["frontend", "bug"] },
      { userId: USER_ID, title: "Setup CI/CD pipeline", priority: "high", section: "backlog", tags: ["devops"] },
    ],
    skipDuplicates: true,
  });

  await prisma.learning.createMany({
    data: [
      {
        userId: USER_ID,
        rawInput: "learned about react server components today - they render on server and reduce bundle size, no useState or useEffect allowed",
        claudeSummary: "React Server Components (RSC) render exclusively on the server, eliminating client-side JavaScript for those components. This reduces bundle size and improves initial load time. Key constraint: RSC cannot use browser APIs, useState, or useEffect — those belong to Client Components marked with 'use client'.",
        category: "concept",
        tags: ["react", "performance", "frontend"],
        difficulty: "intermediate",
        isFavorite: true,
        createdAt: subDays(new Date(), 1),
      },
      {
        userId: USER_ID,
        rawInput: "postgres index types - b-tree is default for =, <, > queries. GiST for geometric/full-text. GIN for arrays and jsonb",
        claudeSummary: "PostgreSQL offers multiple index types for different query patterns: B-tree (default) handles equality and range queries efficiently. GiST supports geometric data and full-text search. GIN excels at array containment and JSONB field queries. Choose based on the operator used in your WHERE clause.",
        category: "concept",
        tags: ["postgres", "database", "performance"],
        difficulty: "advanced",
        createdAt: subDays(new Date(), 2),
      },
      {
        userId: USER_ID,
        rawInput: "quick snippet for debounce in js without lodash",
        claudeSummary: "A minimal debounce implementation in vanilla JavaScript: wrap a function to delay execution until after a specified wait period has passed since the last invocation. Useful for search inputs and resize handlers.",
        category: "snippet",
        tags: ["javascript", "utility"],
        difficulty: "beginner",
        sourceUrl: "https://developer.mozilla.org/",
        createdAt: subDays(new Date(), 3),
      },
    ],
    skipDuplicates: true,
  });

  for (let i = 6; i >= 0; i--) {
    const d = subDays(new Date(), i);
    await prisma.dailyLog.upsert({
      where: { userId_date: { userId: USER_ID, date: new Date(format(d, "yyyy-MM-dd")) } },
      update: {},
      create: {
        userId: USER_ID,
        date: new Date(format(d, "yyyy-MM-dd")),
        energyLevel: Math.floor(Math.random() * 3) + 3,
        mood: Math.floor(Math.random() * 3) + 3,
        wins: "Shipped the authentication module. Got positive feedback from the team lead.",
        blockers: "Struggling with the async state management in the payment flow.",
        learnedToday: "Deep dive into React Server Components and Prisma query optimization.",
        tomorrowFocus: "Write tests for the payment service and review open PRs.",
        claudeReflection: "You're maintaining solid momentum this week. The auth module ship is a real milestone — own that win. The async state blocker is worth a 15-minute whiteboard session tomorrow morning before you open your editor. Your learning is compound and consistent.",
      },
    });
  }

  const board = await prisma.board.upsert({
    where: { id: "demo-board-1" },
    update: {},
    create: { id: "demo-board-1", userId: USER_ID, title: "Internship Project", description: "Main sprint board", color: "#79c14a" },
  });

  const col1 = await prisma.boardColumn.upsert({ where: { id: "col-1" }, update: {}, create: { id: "col-1", boardId: board.id, title: "Backlog", position: 0 } });
  const col2 = await prisma.boardColumn.upsert({ where: { id: "col-2" }, update: {}, create: { id: "col-2", boardId: board.id, title: "In Progress", position: 1, wipLimit: 3 } });
  const col3 = await prisma.boardColumn.upsert({ where: { id: "col-3" }, update: {}, create: { id: "col-3", boardId: board.id, title: "Review", position: 2 } });
  const col4 = await prisma.boardColumn.upsert({ where: { id: "col-4" }, update: {}, create: { id: "col-4", boardId: board.id, title: "Done", position: 3 } });

  await prisma.kanbanCard.createMany({
    data: [
      { boardId: board.id, columnId: col1.id, title: "Design system documentation", priority: "medium", position: 0, tags: ["docs"] },
      { boardId: board.id, columnId: col2.id, title: "Implement OAuth2 login", priority: "high", position: 0, tags: ["auth", "backend"] },
      { boardId: board.id, columnId: col2.id, title: "Payment gateway integration", priority: "urgent", position: 1, tags: ["payments"] },
      { boardId: board.id, columnId: col3.id, title: "User profile page", priority: "medium", position: 0, tags: ["frontend"] },
      { boardId: board.id, columnId: col4.id, title: "Database schema design", priority: "high", position: 0, tags: ["database"] },
    ],
    skipDuplicates: true,
  });

  const account = await prisma.account.upsert({
    where: { id: "demo-account-1" },
    update: {},
    create: { id: "demo-account-1", userId: USER_ID, name: "Primary Account", type: "card", balance: 45000, currency: "INR" },
  });

  const expCat = await prisma.financeCategory.upsert({
    where: { id: "cat-food" },
    update: {},
    create: { id: "cat-food", userId: USER_ID, name: "Food & Dining", type: "expense", icon: "🍕", color: "#d97706", monthlyBudget: 8000 },
  });
  const incCat = await prisma.financeCategory.upsert({
    where: { id: "cat-salary" },
    update: {},
    create: { id: "cat-salary", userId: USER_ID, name: "Stipend", type: "income", icon: "💰", color: "#79c14a" },
  });

  await prisma.transaction.createMany({
    data: [
      { userId: USER_ID, accountId: account.id, title: "Monthly Stipend", amount: 25000, type: "income", categoryId: incCat.id, date: new Date(format(subDays(new Date(), 5), "yyyy-MM-dd")), tags: [] },
      { userId: USER_ID, accountId: account.id, title: "Team lunch at Olive", amount: 1200, type: "expense", categoryId: expCat.id, date: new Date(format(subDays(new Date(), 2), "yyyy-MM-dd")), tags: [] },
      { userId: USER_ID, accountId: account.id, title: "Swiggy dinner", amount: 450, type: "expense", categoryId: expCat.id, date: new Date(format(subDays(new Date(), 1), "yyyy-MM-dd")), tags: [] },
      { userId: USER_ID, accountId: account.id, title: "Coffee", amount: 280, type: "expense", categoryId: expCat.id, date: new Date(format(new Date(), "yyyy-MM-dd")), tags: [] },
    ],
    skipDuplicates: true,
  });

  const project = await prisma.raciProject.upsert({
    where: { id: "demo-raci-1" },
    update: {},
    create: { id: "demo-raci-1", userId: USER_ID, title: "ML Model Deployment", description: "Production deployment of recommendation model" },
  });

  const m1 = await prisma.raciMember.upsert({ where: { id: "rm-1" }, update: {}, create: { id: "rm-1", projectId: project.id, name: "Alex Chen", role: "Engineer" } });
  const m2 = await prisma.raciMember.upsert({ where: { id: "rm-2" }, update: {}, create: { id: "rm-2", projectId: project.id, name: "Priya Sharma", role: "Tech Lead" } });
  const m3 = await prisma.raciMember.upsert({ where: { id: "rm-3" }, update: {}, create: { id: "rm-3", projectId: project.id, name: "Rahul Mehta", role: "QA" } });

  const rt1 = await prisma.raciTask.upsert({ where: { id: "rt-1" }, update: {}, create: { id: "rt-1", projectId: project.id, title: "Model training pipeline", position: 0 } });
  const rt2 = await prisma.raciTask.upsert({ where: { id: "rt-2" }, update: {}, create: { id: "rt-2", projectId: project.id, title: "API endpoint design", position: 1 } });
  const rt3 = await prisma.raciTask.upsert({ where: { id: "rt-3" }, update: {}, create: { id: "rt-3", projectId: project.id, title: "Load testing", position: 2 } });

  await prisma.raciAssignment.createMany({
    data: [
      { taskId: rt1.id, memberId: m1.id, responsibility: "R" },
      { taskId: rt1.id, memberId: m2.id, responsibility: "A" },
      { taskId: rt1.id, memberId: m3.id, responsibility: "I" },
      { taskId: rt2.id, memberId: m2.id, responsibility: "R" },
      { taskId: rt2.id, memberId: m1.id, responsibility: "C" },
      { taskId: rt3.id, memberId: m3.id, responsibility: "R" },
      { taskId: rt3.id, memberId: m2.id, responsibility: "A" },
      { taskId: rt3.id, memberId: m1.id, responsibility: "I" },
    ],
    skipDuplicates: true,
  });

  const wp = await prisma.weeklyProgress.upsert({
    where: { id: "wp-1" },
    update: {},
    create: {
      id: "wp-1",
      userId: USER_ID,
      weekStartDate: new Date(format(startOfWeek(subDays(new Date(), 7)), "yyyy-MM-dd")),
      skills: ["react", "postgres", "prisma", "typescript", "auth"],
      highlights: "Completed the auth module end-to-end. Learned about RSC and query optimization.",
      blockers: "Async state management patterns are still tricky for complex flows.",
      claudeSummary: "A strong week technically. You shipped something real and learned intentionally — both signal good trajectory. The async blocker you identified is worth a dedicated study session, not just debugging in context. Consider spending 30 minutes this weekend with a focused example. Your consistency is your biggest asset right now.",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());