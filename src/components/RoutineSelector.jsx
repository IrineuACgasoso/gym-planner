import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius, shadows, font } from "../styles/theme";
import { Input, Button } from "./ui/Primitives";

export default function RoutineSelector() {
  const { routines, activeRoutine, activeRoutineId, switchRoutine, createRoutine, updateRoutine, removeRoutine } = useData();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [draftName, setDraftName] = useState("");

  function close() {
    setOpen(false);
    setCreating(false);
    setRenamingId(null);
  }

  async function handleCreate() {
    if (!draftName.trim()) return;
    await createRoutine(draftName.trim());
    setDraftName("");
    setCreating(false);
  }

  async function handleRename(id) {
    if (!draftName.trim()) return;
    await updateRoutine({ ...routines.find(r => r.id === id), name: draftName.trim() });
    setRenamingId(null);
    setDraftName("");
  }

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 6, background: colors.bgElevated2,
        border: `1px solid ${colors.border}`, color: colors.text, padding: "8px 12px",
        borderRadius: radius.sm, cursor: "pointer", fontFamily: font, fontWeight: 700, fontSize: 12.5,
        maxWidth: 180,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeRoutine?.name || "SEM ROTINA"}
        </span>
        <span style={{ color: colors.babyBlue, fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <>
          <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 89 }} />
          <div style={{
            position: "absolute", top: 42, left: 0, background: colors.bgElevated2,
            border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: 8,
            minWidth: 230, zIndex: 90, boxShadow: shadows.card,
          }}>
            {routines.map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 6px",
                background: r.id === activeRoutineId ? colors.tagBg : "transparent", borderRadius: radius.sm,
              }}>
                {renamingId === r.id ? (
                  <div style={{ display: "flex", gap: 6, flex: 1 }}>
                    <Input value={draftName} onChange={e => setDraftName(e.target.value)} autoFocus
                      style={{ padding: "6px 8px", fontSize: 12 }} />
                    <button onClick={() => handleRename(r.id)} style={iconBtn}>✔</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => { switchRoutine(r.id); close(); }} style={{
                      flex: 1, textAlign: "left", background: "none", border: "none", cursor: "pointer",
                      color: r.id === activeRoutineId ? colors.babyBlue : colors.text,
                      fontFamily: font, fontWeight: 600, fontSize: 13, padding: "4px 2px",
                    }}>{r.name}</button>
                    <button onClick={() => { setRenamingId(r.id); setDraftName(r.name); }} style={iconBtn}>✎</button>
                    <button onClick={() => { if (confirm(`Excluir a rotina "${r.name}"?`)) removeRoutine(r.id); }} style={{ ...iconBtn, color: colors.danger }}>🗑</button>
                  </>
                )}
              </div>
            ))}

            {creating ? (
              <div style={{ display: "flex", gap: 6, marginTop: 6, padding: "0 2px" }}>
                <Input placeholder="Nome da rotina" value={draftName} onChange={e => setDraftName(e.target.value)}
                  autoFocus style={{ padding: "6px 8px", fontSize: 12 }} />
                <Button onClick={handleCreate} style={{ padding: "6px 10px", fontSize: 11 }}>OK</Button>
              </div>
            ) : (
              <button onClick={() => { setCreating(true); setDraftName(""); }} style={{
                width: "100%", marginTop: 6, background: "none", border: `1px dashed ${colors.border}`,
                color: colors.babyBlue, borderRadius: radius.sm, padding: "8px 0", cursor: "pointer",
                fontFamily: font, fontWeight: 700, fontSize: 12,
              }}>+ NOVA ROTINA</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const iconBtn = {
  background: "none", border: "none", color: colors.textMuted, cursor: "pointer",
  fontSize: 12, padding: "4px 6px",
};
