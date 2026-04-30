"use client";

import { subDays, format, isSameDay } from "date-fns";

interface Props {
  logDates: string[];
}

export default function ContributionHeatmap({ logDates }: Props) {
  const days = Array.from({ length: 91 }, (_, i) => subDays(new Date(), 90 - i));
  const weeks: Date[][] = [];
  let week: Date[] = [];

  days.forEach((d, i) => {
    week.push(d);
    if ((i + 1) % 7 === 0) { weeks.push(week); week = []; }
  });
  if (week.length) weeks.push(week);

  const hasLog = (d: Date) => logDates.some((l) => isSameDay(new Date(l), d));

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((d) => (
              <div
                key={d.toISOString()}
                title={`${format(d, "MMM d")}${hasLog(d) ? " — logged" : ""}`}
                className="w-3 h-3 rounded-sm transition-colors"
                style={{ backgroundColor: hasLog(d) ? "#79c14a" : "#1f1f1f" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}