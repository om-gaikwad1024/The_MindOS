"use client";

import { format, subDays, isSameDay } from "date-fns";

interface Props {
  logDates: string[];
  selectedDate: Date;
  onSelect: (d: Date) => void;
}

export default function CalendarStrip({ logDates, selectedDate, onSelect }: Props) {
  const days = Array.from({ length: 14 }, (_, i) => subDays(new Date(), 13 - i));
  const hasLog = (d: Date) => logDates.some((l) => isSameDay(new Date(l), d));

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {days.map((d) => {
        const active = isSameDay(d, selectedDate);
        const logged = hasLog(d);
        const today = isSameDay(d, new Date());
        return (
          <button
            key={d.toISOString()}
            onClick={() => onSelect(d)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 w-10 py-2 rounded-lg transition-all ${
              active ? "bg-accent/10 border border-accent/30" : "border border-transparent hover:border-[#2a2a2a] hover:bg-[#1a1a1a]"
            }`}
          >
            <span className={`text-[10px] font-medium uppercase ${active ? "text-accent" : "text-[#666]"}`}>
              {format(d, "EEE")}
            </span>
            <span className={`text-sm font-semibold ${active ? "text-accent" : today ? "text-[#ededed]" : "text-[#888]"}`}>
              {format(d, "d")}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${logged ? "bg-accent" : "bg-[#2a2a2a]"}`} />
          </button>
        );
      })}
    </div>
  );
}