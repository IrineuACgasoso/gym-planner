import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { EmptyState } from "../components/ui/Primitives";
import TopBar from "../components/TopBar";
import WorkoutEditor from "../components/WorkoutEditor";
import ManualSelectionOverlay from "../components/ManualSelectionOverlay";
import { useStartWorkout } from "../hooks/useStartWorkout";

function sumSmartCount(w) {
  const bySub = Object.values(w.subgroupCounts || {}).reduce((a, b) => a + b, 0);
  return bySub + (w.freeCount || 0);
}

export default function ChooseWorkoutView({ setView }) {
  const { activeRoutine, updateRoutine } = useData();
  const { manualPickFor, setManualPickFor, beginWorkout, confirmManualSelection, allExercises } = useStartWorkout(setView);
  const [editingWorkout, setEditingWorkout] = useState(null); // null | 'new' | workout obj
  const [pendingDelete, setPendingDelete] = useState(null);

  if (!activeRoutine) { setView("home"); return null; }

  async function upsertWorkout(workout) {
    const exists = activeRoutine.workouts.some(w => w.id === workout.id);
    const workouts = exists
      ? activeRoutine.workouts.map(w => (w.id === workout.id ? workout : w))
      : [...activeRoutine.workouts, workout];
    await updateRoutine({ ...activeRoutine, workouts });
    setEditingWorkout(null);
  }

  async function deleteWorkout(id) {
    await updateRoutine({ ...activeRoutine, workouts: activeRoutine.workouts.filter(w => w.id !== id) });
    setPendingDelete(null);
  }

  async function toggleShuffle(w) {
    const workouts = activeRoutine.workouts.map(item => (item.id === w.id ? { ...item, shuffle: !item.shuffle } : item));
    await updateRoutine({ ...activeRoutine, workouts });
  }

  return (
    <div>
      <TopBar title={activeRoutine.name.toUpperCase()} onBack={() => setView("home")} />

      {!activeRoutine.workouts?.length && (
        <EmptyState icon="📋" title="Nenhum treino nesta rotina" subtitle="Toque em + para criar o primeiro." />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {activeRoutine.workouts?.map(w => (
          <div key={w.id} style={{ position: "relative" }}>
            <button
              onClick={() => beginWorkout(w)}
              disabled={!w.exerciseIds?.length}
              style={{
                width: "100%", textAlign: "left", background: colors.bgElevated,
                border: `1.5px solid ${colors.border}`, borderRadius: radius.lg,
                padding: "16px 84px 16px 16px", cursor: w.exerciseIds?.length ? "pointer" : "not-allowed",
                opacity: w.exerciseIds?.length ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{w.title}</div>
              <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                {w.exerciseIds?.length || 0} exercício(s){w.shuffle ? ` · sorteia ${sumSmartCount(w)}` : " · manual"}
              </div>
            </button>

            <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
              <button
                onClick={e => { e.stopPropagation(); toggleShuffle(w); }}
                title={w.shuffle ? "Modo inteligente (toque para tornar manual)" : "Modo manual (toque para tornar inteligente)"}
                style={{
                  ...iconBtnStyle, width: "auto", padding: "0 8px", gap: 4,
                  color: w.shuffle ? colors.babyBlue : colors.textMuted,
                  borderColor: w.shuffle ? colors.accentSoft : colors.border,
                }}
              >{w.shuffle ? "🔀" : "✋"}</button>
              <button onClick={() => setEditingWorkout(w)} style={iconBtnStyle}>✎</button>
              <button onClick={() => setPendingDelete(w)} style={{ ...iconBtnStyle, color: colors.danger }}>🗑</button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setEditingWorkout("new")}
          style={{
            width: "100%", background: "transparent", border: `1.5px dashed ${colors.border}`,
            borderRadius: radius.lg, padding: "18px 16px", cursor: "pointer",
            color: colors.babyBlue, fontSize: 22, fontWeight: 700,
          }}
        >+</button>
      </div>

      {editingWorkout && (
        <WorkoutEditor
          workout={editingWorkout === "new" ? null : editingWorkout}
          onCancel={() => setEditingWorkout(null)}
          onSave={upsertWorkout}
        />
      )}

      {manualPickFor && (
        <ManualSelectionOverlay
          workout={manualPickFor}
          allExercises={allExercises}
          onClose={() => setManualPickFor(null)}
          onConfirm={ids => confirmManualSelection(manualPickFor, ids)}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteOverlay
          workout={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteWorkout(pendingDelete.id)}
        />
      )}
    </div>
  );
}

function ConfirmDeleteOverlay({ workout, onCancel, onConfirm }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(2,6,12,0.75)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: colors.bgElevated, border: `1px solid ${colors.danger}`, borderRadius: radius.lg,
        padding: 20, maxWidth: 320, width: "100%",
      }}>
        <div style={{ fontSize: 13.5, color: colors.text, marginBottom: 16 }}>
          Excluir o treino <strong>"{workout.title}"</strong>? Essa ação não pode ser desfeita.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px 0", borderRadius: radius.sm, background: colors.bgInput,
            border: `1px solid ${colors.border}`, color: colors.textMuted, cursor: "pointer", fontWeight: 700, fontSize: 12,
          }}>CANCELAR</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px 0", borderRadius: radius.sm, background: "rgba(255,93,108,0.15)",
            border: `1px solid ${colors.danger}`, color: colors.danger, cursor: "pointer", fontWeight: 700, fontSize: 12,
          }}>EXCLUIR</button>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 26, height: 26, borderRadius: radius.pill, border: `1px solid ${colors.border}`,
  background: colors.bgInput, color: colors.textMuted, cursor: "pointer", fontSize: 11,
  display: "flex", alignItems: "center", justifyContent: "center",
};
