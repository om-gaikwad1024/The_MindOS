"use client";

import { useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import CalendarStrip from "@/components/logs/CalendarStrip";
import LogCard from "@/components/logs/LogCard";
import Modal from "@/components/ui/Modal";
import { Plus, Trash2 } from "lucide-react";
import type { DailyLog } from "@/types";

export default function LogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    energyLevel: 3,
    mood: 3,
    wins: "",
    blockers: "",
    learnedToday: "",
    tomorrowFocus: "",
  });

  const load = async () => {
    const data = await fetch("/api/logs?recent=60").then((r) => r.json());
    setLogs(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const log = logs.find((l) => isSameDay(new Date(l.date), selectedDate)) || null;
    setSelectedLog(log);
  }, [selectedDate, logs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, date: format(selectedDate, "yyyy-MM-dd") }),
    });
    setSaving(false);
    setAddOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!selectedLog) return;
    setDeleting(true);
    await fetch(`/api/logs/${selectedLog.id}`, { method: "DELETE" });
    setDeleting(false);
    setSelectedLog(null);
    load();
  };

  const inputClass =
    "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#ededed]">Daily Logs</h1>
          <p className="text-sm text-[#666] mt-1">Your internship diary</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-accent text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-accent/90"
        >
          <Plus size={15} /> Log Today
        </button>
      </div>

      <div className="mb-6">
        <CalendarStrip
          logDates={logs.map((l) => l.date)}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[#ededed]">
          {format(selectedDate, "EEEE, MMMM d")}
        </p>
        <div className="flex items-center gap-2">
          {!selectedLog && (
            <button
              onClick={() => setAddOpen(true)}
              className="text-xs text-accent hover:text-accent/80"
            >
              + Add log
            </button>
          )}
          {selectedLog && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs text-[#666] hover:text-danger transition-colors"
            >
              <Trash2 size={12} />
              {deleting ? "Deleting..." : "Delete log"}
            </button>
          )}
        </div>
      </div>

      {selectedLog ? (
        <LogCard log={selectedLog} />
      ) : (
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-8 text-center">
          <p className="text-[#666] text-sm">No log for this day.</p>
        </div>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Log — ${format(selectedDate, "MMM d")}`}
        width="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#666] mb-2 block">Energy Level</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, energyLevel: v })}
                    className={`w-8 h-8 rounded-full border text-xs font-medium transition-all ${
                      v <= form.energyLevel
                        ? "bg-accent border-accent text-black"
                        : "border-[#2a2a2a] text-[#666]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-[#666] mb-2 block">Mood</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm({ ...form, mood: v })}
                    className={`w-8 h-8 rounded-full border text-xs font-medium transition-all ${
                      v <= form.mood
                        ? "bg-amber-500 border-amber-500 text-black"
                        : "border-[#2a2a2a] text-[#666]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {[
            { key: "wins", label: "Wins", placeholder: "What went well today?" },
            { key: "blockers", label: "Blockers", placeholder: "What was hard?" },
            { key: "learnedToday", label: "Learned Today", placeholder: "Key takeaways..." },
            { key: "tomorrowFocus", label: "Tomorrow's Focus", placeholder: "One thing to prioritize..." },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-[#666] mb-1.5 block">{label}</label>
              <textarea
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`${inputClass} min-h-[70px]`}
                placeholder={placeholder}
              />
            </div>
          ))}
          <p className="text-xs text-[#666] bg-accent/5 border border-accent/15 rounded-lg p-3">
            Claude will write a reflection based on your entries.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 disabled:opacity-50"
          >
            {saving ? "Saving & generating reflection..." : "Save Log"}
          </button>
        </form>
      </Modal>
    </div>
  );
}