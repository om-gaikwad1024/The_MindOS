import { Battery, Smile } from "lucide-react";
import type { DailyLog } from "@/types";

function DotRating({ value, max = 5, color = "#79c14a" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < value ? color : "#2a2a2a" }}
        />
      ))}
    </div>
  );
}

export default function LogCard({ log }: { log: DailyLog }) {
  return (
    <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Battery size={14} className="text-[#666]" />
          <span className="text-xs text-[#666]">Energy</span>
          <DotRating value={log.energyLevel} />
        </div>
        <div className="flex items-center gap-2">
          <Smile size={14} className="text-[#666]" />
          <span className="text-xs text-[#666]">Mood</span>
          <DotRating value={log.mood} color="#d97706" />
        </div>
      </div>

      {[
        { label: "Wins", value: log.wins, color: "text-accent" },
        { label: "Blockers", value: log.blockers, color: "text-danger" },
        { label: "Learned Today", value: log.learnedToday, color: "text-[#ededed]" },
        { label: "Tomorrow's Focus", value: log.tomorrowFocus, color: "text-[#ededed]" },
      ].map(({ label, value, color }) =>
        value ? (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666] mb-1.5">{label}</p>
            <p className={`text-sm leading-relaxed ${color}`}>{value}</p>
          </div>
        ) : null
      )}

      {log.claudeReflection && (
        <div className="bg-[#0f160a] border border-accent/20 rounded-lg p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-2">Claude's Reflection</p>
          <p className="text-sm text-[#c8e6b0] leading-relaxed">{log.claudeReflection}</p>
        </div>
      )}
    </div>
  );
}