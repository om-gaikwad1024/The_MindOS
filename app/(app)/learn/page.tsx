"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Star, Plus } from "lucide-react";
import LearningCard from "@/components/learn/LearningCard";
import AddLearningModal from "@/components/learn/AddLearningModal";
import type { Learning } from "@/types";

const CATEGORIES = ["all", "concept", "snippet", "link", "paper", "resource", "tool"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

export default function LearnPage() {
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (search) params.set("search", search);
    if (favOnly) params.set("favorite", "true");
    const data = await fetch(`/api/learnings?${params}`).then((r) => r.json());
    setLearnings(data);
    setLoading(false);
  }, [category, difficulty, search, favOnly]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleFavorite = (id: string, val: boolean) => {
    setLearnings((ls) => ls.map((l) => (l.id === id ? { ...l, isFavorite: val } : l)));
  };

  const handleDelete = (id: string) => {
    setLearnings((ls) => ls.filter((l) => l.id !== id));
  };

  const chipClass = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
      active
        ? "border-accent bg-accent/10 text-accent"
        : "border-[#2a2a2a] text-[#666] hover:border-[#333] hover:text-[#999]"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#ededed]">Knowledge Vault</h1>
          <p className="text-sm text-[#666] mt-1">{learnings.length} learnings stored</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 bg-accent text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus size={15} /> Add Learning
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search learnings..."
            className="w-full bg-[#111111] border border-[#1f1f1f] rounded-xl pl-9 pr-4 py-3 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#2a2a2a]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={chipClass(category === c)}>
              {c}
            </button>
          ))}
          <div className="w-px h-4 bg-[#1f1f1f]" />
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={chipClass(difficulty === d)}
            >
              {d}
            </button>
          ))}
          <button onClick={() => setFavOnly(!favOnly)} className={chipClass(favOnly)}>
            <span className="flex items-center gap-1">
              <Star size={11} /> favorites
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-[#111111] border border-[#1f1f1f] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : learnings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-[#666] text-sm">Nothing here yet. Add your first learning.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-4 space-y-4">
          {learnings.map((l) => (
            <div key={l.id} className="break-inside-avoid mb-4">
              <LearningCard
                learning={l}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <AddLearningModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={load} />
    </div>
  );
}