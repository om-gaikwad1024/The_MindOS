"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { RACI_COLORS } from "@/lib/utils";
import type { RaciProject, RaciTask, RaciMember, RaciAssignment } from "@/types";

const RACI_CYCLE: Array<"R" | "A" | "C" | "I" | ""> = ["", "R", "A", "C", "I"];

export default function RaciPage() {
  const [projects, setProjects] = useState<RaciProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [project, setProject] = useState<RaciProject | null>(null);
  const [addProjOpen, setAddProjOpen] = useState(false);
  const [newProj, setNewProj] = useState({ title: "", description: "" });
  const [newTask, setNewTask] = useState("");
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const loadProjects = async () => {
    const data = await fetch("/api/raci/projects").then((r) => r.json());
    setProjects(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
  };

  const loadProject = async (id: string) => {
    const data = await fetch(`/api/raci/projects/${id}`).then((r) => r.json());
    setProject(data);
  };

  useEffect(() => { loadProjects(); }, []);
  useEffect(() => { if (selectedId) loadProject(selectedId); }, [selectedId]);

  const getAssignment = (taskId: string, memberId: string): "R" | "A" | "C" | "I" | "" => {
    const a = project?.tasks?.find((t) => t.id === taskId)?.assignments?.find((a) => a.memberId === memberId);
    return (a?.responsibility as "R" | "A" | "C" | "I") || "";
  };

  const cycleAssignment = async (taskId: string, memberId: string) => {
    const current = getAssignment(taskId, memberId);
    const idx = RACI_CYCLE.indexOf(current);
    const next = RACI_CYCLE[(idx + 1) % RACI_CYCLE.length];

    if (next === "") {
      await fetch("/api/raci/assignments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, memberId }),
      });
    } else {
      await fetch("/api/raci/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, memberId, responsibility: next }),
      });
    }
    if (selectedId) loadProject(selectedId);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !selectedId) return;
    await fetch("/api/raci/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedId, title: newTask, position: project?.tasks?.length || 0 }),
    });
    setNewTask("");
    loadProject(selectedId);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !selectedId) return;
    await fetch("/api/raci/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedId, ...newMember }),
    });
    setNewMember({ name: "", role: "" });
    setAddMemberOpen(false);
    loadProject(selectedId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/raci/tasks/${taskId}`, { method: "DELETE" });
    if (selectedId) loadProject(selectedId);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const proj = await fetch("/api/raci/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProj),
    }).then((r) => r.json());
    setProjects((p) => [...p, proj]);
    setSelectedId(proj.id);
    setNewProj({ title: "", description: "" });
    setAddProjOpen(false);
  };

  const inputClass = "w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg px-3 py-2.5 text-sm text-[#ededed] placeholder-[#444] outline-none focus:border-[#333]";

  return (
    <div className="max-w-full px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#ededed]">RACI Matrix</h1>
        <div className="flex items-center gap-2">
          {project && (
            <button onClick={() => setAddMemberOpen(true)} className="flex items-center gap-1.5 text-xs border border-[#1f1f1f] text-[#666] hover:text-[#ededed] px-3 py-1.5 rounded-lg hover:border-[#2a2a2a] transition-all">
              <Plus size={12} /> Member
            </button>
          )}
          <button onClick={() => setAddProjOpen(true)} className="flex items-center gap-1.5 text-xs bg-accent text-black font-medium px-3 py-1.5 rounded-lg hover:bg-accent/90">
            <Plus size={12} /> Project
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-all ${
              selectedId === p.id ? "bg-accent/10 border-accent/30 text-accent" : "border-[#1f1f1f] text-[#666] hover:border-[#2a2a2a] hover:text-[#999]"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {(["R", "A", "C", "I"] as const).map((r) => (
          <div key={r} className="flex items-center gap-1.5 text-xs text-[#666]">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${RACI_COLORS[r]}20`, color: RACI_COLORS[r] }}>
              {r}
            </div>
            {r === "R" ? "Responsible" : r === "A" ? "Accountable" : r === "C" ? "Consulted" : "Informed"}
          </div>
        ))}
        <span className="text-xs text-[#444]">Click cells to cycle</span>
      </div>

      {project ? (
        <div className="overflow-auto">
          <table className="w-full border-collapse" style={{ minWidth: `${200 + (project.members?.length || 0) * 120}px` }}>
            <thead>
              <tr>
                <th className="text-left p-3 text-xs font-medium text-[#666] bg-[#111111] border border-[#1f1f1f] min-w-[200px]">Task</th>
                {project.members?.map((m) => (
                  <th key={m.id} className="p-3 text-xs font-medium text-[#ededed] bg-[#111111] border border-[#1f1f1f] text-center min-w-[110px]">
                    <div>{m.name}</div>
                    {m.role && <div className="text-[#666] font-normal mt-0.5">{m.role}</div>}
                  </th>
                ))}
                <th className="p-3 bg-[#111111] border border-[#1f1f1f] w-10" />
              </tr>
            </thead>
            <tbody>
              {project.tasks?.map((task) => (
                <tr key={task.id} className="group">
                  <td className="p-3 text-sm text-[#ededed] bg-[#111111] border border-[#1f1f1f]">{task.title}</td>
                  {project.members?.map((m) => {
                    const resp = getAssignment(task.id, m.id);
                    return (
                      <td key={m.id} className="p-3 bg-[#111111] border border-[#1f1f1f] text-center">
                        <button
                          onClick={() => cycleAssignment(task.id, m.id)}
                          className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                          style={resp ? {
                            backgroundColor: `${RACI_COLORS[resp]}20`,
                            color: RACI_COLORS[resp],
                            border: `1px solid ${RACI_COLORS[resp]}40`,
                          } : {
                            backgroundColor: "#1a1a1a",
                            color: "#333",
                          }}
                        >
                          {resp || "·"}
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-2 bg-[#111111] border border-[#1f1f1f]">
                    <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-[#666] hover:text-danger transition-all">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={(project.members?.length || 0) + 2} className="p-2 bg-[#0a0a0a] border border-[#1f1f1f]">
                  <form onSubmit={handleAddTask} className="flex items-center gap-2">
                    <input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="+ Add task..."
                      className="flex-1 bg-transparent text-sm text-[#666] placeholder-[#333] outline-none focus:text-[#ededed]"
                    />
                    {newTask && (
                      <button type="submit" className="text-xs text-accent font-medium px-2 py-1">Add</button>
                    )}
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-[#666] text-sm">No projects yet.</p>
        </div>
      )}

      <Modal open={addProjOpen} onClose={() => setAddProjOpen(false)} title="New Project">
        <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Project Name</label>
            <input value={newProj.title} onChange={(e) => setNewProj({ ...newProj, title: e.target.value })} className={inputClass} placeholder="ML Model Deployment" required />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Description</label>
            <input value={newProj.description} onChange={(e) => setNewProj({ ...newProj, description: e.target.value })} className={inputClass} placeholder="Optional description" />
          </div>
          <button type="submit" className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90">
            Create Project
          </button>
        </form>
      </Modal>

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Name</label>
            <input value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className={inputClass} placeholder="Alex Chen" required />
          </div>
          <div>
            <label className="text-xs text-[#666] mb-1.5 block">Role</label>
            <input value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })} className={inputClass} placeholder="Engineer" />
          </div>
          <button type="submit" className="bg-accent text-black text-sm font-semibold rounded-lg py-2.5 hover:bg-accent/90">
            Add Member
          </button>
        </form>
      </Modal>
    </div>
  );
}