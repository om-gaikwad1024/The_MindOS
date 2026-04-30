import { PRIORITY_COLORS } from "@/lib/utils";

export default function PriorityDot({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#666";
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}