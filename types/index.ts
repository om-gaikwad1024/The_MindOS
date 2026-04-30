export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: "active" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  section: "today" | "backlog";
  tags: string[];
  category?: string;
  createdAt: string;
}

export interface Learning {
  id: string;
  userId: string;
  rawInput: string;
  claudeSummary: string;
  category: "concept" | "snippet" | "link" | "paper" | "resource" | "tool";
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  sourceUrl?: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string;
  energyLevel: number;
  mood: number;
  wins?: string;
  blockers?: string;
  learnedToday?: string;
  tomorrowFocus?: string;
  claudeReflection?: string;
  createdAt: string;
}

export interface WeeklyProgress {
  id: string;
  userId: string;
  weekStartDate: string;
  skills: string[];
  highlights?: string;
  blockers?: string;
  claudeSummary?: string;
  createdAt: string;
}

export interface Capture {
  id: string;
  rawText: string;
  processed: boolean;
  assignedTo?: string;
  createdAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  createdAt: string;
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  boardId: string;
  title: string;
  position: number;
  color?: string;
  wipLimit?: number;
  cards?: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  assignee?: string;
  position: number;
  isArchived: boolean;
  createdAt: string;
  checklists?: CardChecklist[];
}

export interface CardChecklist {
  id: string;
  cardId: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
  position: number;
}

export interface Account {
  id: string;
  name: string;
  type: "cash" | "card" | "savings" | "investment";
  balance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: string;
  date: string;
  notes?: string;
  tags: string[];
  isRecurring: boolean;
  createdAt: string;
  category?: FinanceCategory;
  account?: Account;
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  icon?: string;
  color: string;
  monthlyBudget?: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  category?: FinanceCategory;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDue: string;
  isActive: boolean;
}

export interface RaciProject {
  id: string;
  title: string;
  description?: string;
  status: "active" | "completed" | "archived";
  tasks?: RaciTask[];
  members?: RaciMember[];
}

export interface RaciTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: "low" | "medium" | "high" | "urgent";
  position: number;
  assignments?: RaciAssignment[];
}

export interface RaciMember {
  id: string;
  projectId: string;
  name: string;
  role?: string;
  email?: string;
}

export interface RaciAssignment {
  id: string;
  taskId: string;
  memberId: string;
  responsibility: "R" | "A" | "C" | "I";
}