import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Card, Tag, Button, Input, Overlay, EmptyState } from "../components/ui/Primitives";
import { uid } from "../utils/uid";
import ExercisePicker from "../components/ExercisePicker";

export default function RoutinesView() {
  const { routines, activeRoutineId, switchRoutine, createRoutine, updateRoutine, removeRoutine } = useData();
  const [newRoutineName, setNewRoutineName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null); // rotina aberta p/ gerenciar treinos
  const [renaming, setRenaming] = useState(null);

  async function handleCreate() {
    if (!newRoutineName.trim()) return;
    await createRoutine(newRoutineName.trim());
    setNewRoutineName("");
    setShowNew(false);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, color: colors.text, fontWeight: 700 }}>MINHAS ROTINAS</h2>
        <Button onClick={() => setShowNew(true)} style={{ padding: "8px 14px", fontSize: 12 }}>+ NOVA ROTINA</Button>
      </div>

      {!routines.length && (
        <EmptyState icon="📋" title="Nenhuma rotina ainda" subtitle="Crie sua primeira rotina de treinos." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {routines.map(r => (
          <Card key={r.id} style={{ borderColor: r.id === activeRoutineId ? colors.accent : colors.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: colors.text }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 2 }}>{r.workouts?.length || 0} treino(s)</div>
              </div>
              {r.id === activeRoutineId && <Tag tone="success">ATIVA</Tag>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {r.id !== activeRoutineId && (
                <Button variant="secondary" onClick={() => switchRoutine(r.id)} style={{ flex: 1, padding: "9px 10px", fontSize: 11.5 }}>USAR ESTA</Button>
              )}
              <Button variant="secondary" onClick={() => setEditingRoutine(r)} style={{ flex: 1, padding: "9px 10px", fontSize: 11.5 }}>GERENCIAR TREINOS</Button>
              <Button variant="ghost" onClick={() => setRenaming(r)} style={{ padding: "9px 10px", fontSize: 11.5 }}>✎</Button>
              <Button variant="danger" onClick={() => { if (confirm(`Excluir a rotina "${r.name}"?`)) removeRoutine(r.id); }} style={{ padding: "9px 10px", fontSize: 11.5 }}>🗑</Button>
            </div>
          </Card>
        ))}
      </div>

      {showNew && (
        <Overlay title="Nova Rotina" onClose={() => setShowNew(false)}>
          <Input placeholder="Ex: Musculação, Cardio, Funcional..." value={newRoutineName}
            onChange={e => setNewRoutineName(e.target.value)} autoFocus />
          <Button onClick={handleCreate} style={{ width: "100%", marginTop: 14 }}>CRIAR</Button>
        </Overlay>
      )}

      {renaming && (
        <Overlay title="Renomear Rotina" onClose={() => setRenaming(null)}>
          <RenameForm routine={renaming} onSave={async name => { await updateRoutine({ ...renaming, name }); setRenaming(null); }} />
        </Overlay>
      )}

      {editingRoutine && (
        <RoutineWorkoutsModal
          routine={routines.find(r => r.id === editingRoutine.id) || editingRoutine}
          onClose={() => setEditingRoutine(null)}
          onSave={updateRoutine}
        />
      )}
    </div>
  );
}

function RenameForm({ routine, onSave }) {
  const [name, setName] = useState(routine.name);
  return (
    <div>
      <Input value={name} onChange={e => setName(e.target.value)} autoFocus />
      <Button onClick={() => name.trim() && onSave(name.trim())} style={{ width: "100%", marginTop: 14 }}>SALVAR</Button>
    </div>
  );
}

// ---------- Gerenciar treinos de uma rotina ----------
function RoutineWorkoutsModal({ routine, onClose, onSave }) {
  const [editingWorkout, setEditingWorkout] = useState(null); // null | 'new' | workout obj

  async function upsertWorkout(workout) {
    const exists = routine.workouts.some(w => w.id === workout.id);
    const workouts = exists ? routine.workouts.map(w => (w.id === workout.id ? workout : w)) : [...routine.workouts, workout];
    await onSave({ ...routine, workouts });
    setEditingWorkout(null);
  }

  async function deleteWorkout(id) {
    if (!confirm("Excluir este treino?")) return;
    await onSave({ ...routine, workouts: routine.workouts.filter(w => w.id !== id) });
  }

  return (
    <Overlay title={`Treinos — ${routine.name}`} onClose={onClose}>
      <Button onClick={() => setEditingWorkout("new")} style={{ width: "100%", marginBottom: 14 }}>+ NOVO TREINO</Button>

      {!routine.workouts?.length && <EmptyState icon="🏋️" title="Nenhum treino nesta rotina" />}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {routine.workouts?.map(w => (
          <div key={w.id} style={{
            background: colors.bgInput, border: `1px solid ${colors.border}`, borderRadius: radius.md,
            padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{w.title}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                {w.exerciseIds.length} exercício(s){w.shuffle ? ` · sorteia ${w.targetCount}` : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Button variant="ghost" onClick={() => setEditingWorkout(w)} style={{ padding: "7px 10px", fontSize: 11 }}>✎</Button>
              <Button variant="danger" onClick={() => deleteWorkout(w.id)} style={{ padding: "7px 10px", fontSize: 11 }}>🗑</Button>
            </div>
          </div>
        ))}
      </div>

      {editingWorkout && (
        <WorkoutEditor
          workout={editingWorkout === "new" ? null : editingWorkout}
          onCancel={() => setEditingWorkout(null)}
          onSave={upsertWorkout}
        />
      )}
    </Overlay>
  );
}

function WorkoutEditor({ workout, onCancel, onSave }) {
  const [title, setTitle] = useState(workout?.title || "");
  const [exerciseIds, setExerciseIds] = useState(workout?.exerciseIds || []);
  const [shuffle, setShuffle] = useState(workout?.shuffle || false);
  const [targetCount, setTargetCount] = useState(workout?.targetCount || Math.max(1, exerciseIds.length));

  function handleSave() {
    if (!title.trim() || !exerciseIds.length) return;
    onSave({
      id: workout?.id || uid("workout"),
      title: title.trim(),
      exerciseIds,
      shuffle,
      targetCount: shuffle ? Math.min(targetCount, exerciseIds.length) : exerciseIds.length,
    });
  }

  return (
    <Overlay title={workout ? "Editar Treino" : "Novo Treino"} onClose={onCancel}>
      <div style={{ marginBottom: 12 }}>
        <Input placeholder="Título do treino (ex: Peito, Costas, Full Body)" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} style={{ width: 18, height: 18, accentColor: colors.accent }} />
        <span style={{ fontSize: 12.5, color: colors.text }}>🔀 Sortear exercícios automaticamente (cobrindo os subgrupos musculares)</span>
      </label>

      {shuffle && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 4 }}>Quantidade de exercícios por sessão</div>
          <Input type="number" min={1} max={exerciseIds.length || 1} value={targetCount}
            onChange={e => setTargetCount(Number(e.target.value))} />
        </div>
      )}

      <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 6, marginTop: 4 }}>
        SELECIONE OS EXERCÍCIOS DO POOL ({exerciseIds.length} selecionados)
      </div>
      <ExercisePicker selectedIds={exerciseIds} onChange={setExerciseIds} />

      <Button onClick={handleSave} style={{ width: "100%", marginTop: 16 }} disabled={!title.trim() || !exerciseIds.length}>
        SALVAR TREINO
      </Button>
    </Overlay>
  );
}
