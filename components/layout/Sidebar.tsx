"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun, BookOpen, BookMarked, TrendingUp,
  Layout, DollarSign, Grid3X3, BarChart3, Zap, Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/logs", label: "Logs", icon: BookMarked },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/kanban", label: "Kanban", icon: Layout },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/raci", label: "RACI", icon: Grid3X3 },
  { href: "/captures", label: "Captures", icon: Inbox },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-screen border-r border-[#1f1f1f] bg-[#111111] px-3 py-6 fixed left-0 top-0 z-30">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <Zap size={14} className="text-black" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-[#ededed]">MindOS</span>
      </div>
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-[#666666] hover:text-[#ededed] hover:bg-[#1a1a1a]"
              )}
            >
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pt-4 border-t border-[#1f1f1f]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#79c14a]/20 flex items-center justify-center text-xs font-medium text-accent">
            AC
          </div>
          <div>
            <p className="text-xs text-[#ededed] font-medium">Alex Chen</p>
            <p className="text-xs text-[#666666]">demo@mindos.app</p>
          </div>
        </div>
      </div>
    </aside>
  );
}