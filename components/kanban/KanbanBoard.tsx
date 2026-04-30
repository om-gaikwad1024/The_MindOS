"use client";

import { useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, MoreHorizontal, AlertCircle } from "lucide-react";
import PriorityDot from "@/components/ui/PriorityDot";
import { format } from "date-fns";
import type { Board, BoardColumn, KanbanCard } from "@/types";

interface Props {
  board: Board;
  columns: BoardColumn[];
  onDataChange: () => void;
}

export default function KanbanBoard({ board, columns: initialColumns, onDataChange }: Props) {
  const [columns, setColumns] = useState(initialColumns);
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;

    const newCols = columns.map((col) => ({ ...col, cards: [...(col.cards || [])] }));
    const srcCol = newCols.find((c) => c.id === source.droppableId)!;
    const dstCol = newCols.find((c) => c.id === destination.droppableId)!;
    const [moved] = srcCol.cards!.splice(source.index, 1);
    moved.columnId = dstCol.id;
    dstCol.cards!.splice(destination.index, 0, moved);
    setColumns(newCols);

    await fetch(`/api/kanban/cards/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: dstCol.id, position: destination.index }),
    });
  }, [columns]);

  const handleAddCard = async (columnId: string) => {
    if (!newCardTitle.trim()) return;
    const res = await fetch("/api/kanban/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, boardId: board.id, title: newCardTitle, priority: "medium", tags: [], position: 0 }),
    });
    const card = await res.json();
    setColumns((cols) => cols.map((c) => c.id === columnId ? { ...c, cards: [...(c.cards || []), card] } : c));
    setNewCardTitle("");
    setAddingCard(null);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex items-start gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {columns.sort((a, b) => a.position - b.position).map((col) => {
          const cards = (col.cards || []).filter((c) => !c.isArchived).sort((a, b) => a.position - b.position);
          const overWip = col.wipLimit && cards.length > col.wipLimit;
          return (
            <div key={col.id} className="flex-shrink-0 w-72">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#ededed]">{col.title}</span>
                  <span className="text-xs text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded">{cards.length}</span>
                  {overWip && <AlertCircle size={13} className="text-amber-500" />}
                </div>
                {col.wipLimit && (
                  <span className={`text-[10px] ${overWip ? "text-amber-500" : "text-[#444]"}`}>
                    limit {col.wipLimit}
                  </span>
                )}
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-xl p-2 transition-colors ${snapshot.isDraggingOver ? "bg-accent/5 border border-accent/20" : "bg-[#111111]/50 border border-[#1f1f1f]"}`}
                  >
                    {cards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(p, snap) => (
                          <div
                            ref={p.innerRef}
                            {...p.draggableProps}
                            {...p.dragHandleProps}
                            className={`mb-2 bg-[#111111] border border-[#1f1f1f] rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${snap.isDragging ? "shadow-xl border-accent/20 rotate-1" : "hover:border-[#2a2a2a]"}`}
                          >
                            <p className="text-sm text-[#ededed] mb-2 leading-snug">{card.title}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <PriorityDot priority={card.priority} />
                                {card.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="text-[10px] text-[#666] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                                    {t}
                                  </span>
                                ))}
                              </div>
                              {card.dueDate && (
                                <span className="text-[10px] text-[#666]">{format(new Date(card.dueDate), "MMM d")}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {addingCard === col.id ? (
                <div className="mt-2 p-2">
                  <textarea
                    autoFocus
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Card title..."
                    className="w-full bg-[#111111] border border-accent/30 rounded-lg p-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddCard(col.id); }
                      if (e.key === "Escape") { setAddingCard(null); setNewCardTitle(""); }
                    }}
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <button onClick={() => handleAddCard(col.id)} className="text-xs bg-accent text-black font-medium px-3 py-1.5 rounded-lg hover:bg-accent/90">Add</button>
                    <button onClick={() => { setAddingCard(null); setNewCardTitle(""); }} className="text-xs text-[#666]">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCard(col.id)}
                  className="w-full mt-2 flex items-center gap-1.5 px-3 py-2 text-xs text-[#666] hover:text-[#999] hover:bg-[#1a1a1a] rounded-lg transition-all"
                >
                  <Plus size={12} /> Add card
                </button>
              )}
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}