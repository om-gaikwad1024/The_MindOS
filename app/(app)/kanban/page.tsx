"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import Modal from "@/components/ui/Modal";
import type { Board, BoardColumn } from "@/types";

export default function KanbanPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<{ columns: BoardColumn[] } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newBoard, setNewBoard] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [addColOpen, setAddColOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");

  const loadBoards = async () => {
    const data = await fetch("/api/kanban/boards").then((r) => r.json());
    setBoards(data);
    if (data.length > 0 && !selectedBoardId) setSelectedBoardId(data[0].id);
  };

  const loadBoard = async (id: string) => {
    const data = await fetch(`/api/kanban/boards/${id}`).then((r) => r.json());
    setBoardData(data);
  };

  useEffect(() => { loadBoards(); }, []);
  useEffect(() => { if (selectedBoardId) loadBoard(selectedBoardId); }, [selectedBoardId]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const board = await fetch("/api/kanban/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBoard),
    }).then((r) => r.json());
    setBoards((b) => [...b, board]);
    setSelectedBoardId(board.id);
    setNewBoard({ title: "", description: "" });
    setAddOpen(false);
    setSaving(false);
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoardId || !newColTitle.trim()) return;
    const position = boardData?.columns?.length || 0;
    const col = await fetch("/api/kanban/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: selectedBoardId, title: newColTitle, position }),
    }).then((r) => r.json());
    setBoardData((bd) => bd ? { ...bd, columns: [...(bd.columns || []), { ...col, cards: [] }] } : bd);
    setNewColTitle("");
    setAddColOpen(false);
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";

  return (
    <div className="px-6 py-8">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <h1 className="text-2xl font-semibold text-[#ededed]">Kanban</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {boards.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBoardId(b.id)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
                selectedBoardId === b.id
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "border-[#1f1f1f] text-[#666] hover:border-[#2a2a2a] hover:text-[#999]"
              }`}
            >
              {b.title}
            </button>
          ))}
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 text-xs text-[#666] hover:text-accent border border-[#1f1f1f] px-2.5 py-1.5 rounded-lg hover:border-accent/30 transition-all">
            <Plus size={12} /> New Board
          </button>
        </div>

        {selectedBoardId && (
          <button onClick={() => setAddColOpen(true)} className="ml-auto flex items-center gap-1.5 text-xs text-[#666] hover:text-[#ededed] border border-[#1f1f1f] px-3 py-1.5 rounded-lg hover:border-[#2a2a2a] transition-all">
            <Plus size={12} /> Add Column
          </button>
        )}
      </div>

      {boardData && selectedBoardId ? (
        <KanbanBoard
          board={boards.find((b) => b.id === selectedBoardId)!}
          columns={boardData.columns || []}
          onDataChange={() => loadBoard(selectedBoardId)}
        />
      ) : (
        <div className="text-center py-32">
          <p className="text-[#666] text-sm mb-4">No boards yet.</p>
          <button onClick={() => setAddOpen(true)} className="bg-accent text-black text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-accent/90">
            Create First Board
          </button>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Board">
        <form onSubmit={handleCreateBoard} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Board Name</label>
            <input value={newBoard.title} onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })} className={inputClass} placeholder="Project Alpha" required />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Description (optional)</label>
            <input value={newBoard.description} onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })} className={inputClass} placeholder="What's this board for?" />
          </div>
          <button type="submit" disabled={saving} className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90 disabled:opacity-50">
            {saving ? "Creating..." : "Create Board"}
          </button>
        </form>
      </Modal>

      <Modal open={addColOpen} onClose={() => setAddColOpen(false)} title="Add Column">
        <form onSubmit={handleAddColumn} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Column Name</label>
            <input value={newColTitle} onChange={(e) => setNewColTitle(e.target.value)} className={inputClass} placeholder="In Review" required />
          </div>
          <button type="submit" className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90">
            Add Column
          </button>
        </form>
      </Modal>
    </div>
  );
}