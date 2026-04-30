import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatShortDate(date: string | Date) {
  return format(new Date(date), "MMM d");
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const PRIORITY_COLORS = {
  low: "#64748b",
  medium: "#d97706",
  high: "#f97316",
  urgent: "#e05252",
};

export const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const DIFFICULTY_COLORS = {
  beginner: "#79c14a",
  intermediate: "#d97706",
  advanced: "#e05252",
};

export const CATEGORY_COLORS: Record<string, string> = {
  concept: "#79c14a",
  snippet: "#0ea5e9",
  link: "#d97706",
  paper: "#a855f7",
  resource: "#64748b",
  tool: "#e05252",
};

export const RACI_COLORS: Record<string, string> = {
  R: "#79c14a",
  A: "#d97706",
  C: "#0ea5e9",
  I: "#64748b",
};

export const CHART_COLORS = ["#79c14a", "#64748b", "#d97706", "#e05252", "#0ea5e9"];