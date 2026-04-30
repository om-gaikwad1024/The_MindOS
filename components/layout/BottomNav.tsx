"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, Layout, DollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/kanban", label: "Kanban", icon: Layout },
  { href: "/finance", label: "Finance", icon: DollarSign },
  { href: "/dashboard", label: "Dash", icon: BarChart3 },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] border-t border-[#1f1f1f] flex">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[10px] font-medium transition-all",
              active ? "text-accent" : "text-[#666666]"
            )}
          >
            <Icon size={18} strokeWidth={active ? 2 : 1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}