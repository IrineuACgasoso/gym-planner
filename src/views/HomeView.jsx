import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Card, Tag, Button, Overlay, EmptyState } from "../components/ui/Primitives";
import { generateSmartWorkout } from "../utils/workoutGenerator";

export default function HomeView({ setView }) {
  const { activeRoutine, allExercises, currentWorkout, startWorkout, updateRoutine } = useData();
  const [manualPickFor, setManualPickFor] = useState(null); // workout aguardando seleção manual

  function buildInstance(chosen) {
    return chosen.map(e => ({
      exId: e.id, name: e.name, grupo: e.grupo, subgrupos: e.subgrupos,
      isCardio: e.grupo === "Cardio",
      sets: e.grupo === "Cardio" ? null : [{ reps: "", peso: "", done: false }],
      cardio: e.grupo === "Cardio" ? { tempo: "", km: "", pace: "" } : null,
      done: false,
    }));
  }

  async function handleStart(workout) {
    if (currentWorkout) { setView("workout"); return; }
    const pool = allExercises.filter(e => workout.exerciseIds.includes(e.id));

    if (workout.shuffle) {
      const chosen = generateSmartWorkout(pool, {
        subgroupCounts: workout.subgroupCounts,
        freeCount: workout.freeCount,
      });
      await startWorkout(activeRoutine, workout, buildInstance(chosen));
      setView("workout");
      return;
    }

    // Modo não-inteligente: pede quais exercícios usar, pré-selecionando a última escolha salva
    setManualPickFor(workout);
  }

  async function toggleSmart(workout) {
    const updated = {
      ...workout,
      shuffle: !workout.shuffle,
      manualSelection: workout.manualSelection?.length ? workout.manualSelection : workout.exerciseIds,
    };
    await updateRoutine({ ...activeRoutine, workouts: activeRoutine.workouts.map(w => (w.id === workout.id ? updated : w)) });
  }

  async function confirmManualSelection(workout, selectedIds) {
    const updatedWorkout = { ...workout, manualSelection: selectedIds };
    await updateRoutine({ ...activeRoutine, workouts: activeRoutine.workouts.map(w => (w.id === workout.id ? updatedWorkout : w)) });
    setManualPickFor(null);
    const pool = allExercises.filter(e => selectedIds.includes(e.id));
    await startWorkout(activeRoutine, updatedWorkout, buildInstance(pool));
    setView("workout");
  }

  if (!activeRoutine) {
    return (
      <EmptyState
        icon="🏋️"
        title="Nenhuma rotina criada ainda"
        subtitle="Crie sua primeira rotina de treinos para começar."
        action={<Button onClick={() => setView("routines")}>+ CRIAR ROTINA</Button>}
      />
    );
  }

  if (currentWorkout) {
    return (
      <div>
        <Card style={{ marginBottom: 16, border: `1px solid ${colors.accent}`, background: colors.bgElevated2 }}>
          <div style={{ fontSize: 11, color: colors.babyBlue, letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>
            ● TREINO EM ANDAMENTO
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: colors.text, marginBottom: 10 }}>{currentWorkout.workoutTitle}</div>
          <Button onClick={() => setView("workout")} style={{ width: "100%" }}>CONTINUAR TREINO</Button>
        </Card>
      </div>
    );
  }

  if (!activeRoutine.workouts?.length) {
    return (
      <EmptyState
        icon="📋"
        title={`"${activeRoutine.name}" ainda não tem treinos`}
        subtitle="Adicione um treino a essa rotina para começar."
        action={<Button onClick={() => setView("routines")}>+ ADICIONAR TREINO</Button>}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {activeRoutine.workouts.map(w => (
        <Card key={w.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>{w.title}</div>
              <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 3 }}>
                {w.exerciseIds.length} exercício(s) cadastrado(s)
              </div>
            </div>
            <button
              onClick={() => toggleSmart(w)}
              title={w.shuffle ? "Desativar modo inteligente" : "Ativar modo inteligente"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer",
                background: w.shuffle ? colors.tagBg : colors.bgInput,
                border: `1px solid ${w.shuffle ? colors.tagBorder : colors.border}`,
                color: w.shuffle ? colors.babyBlue : colors.textMuted,
                fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
                padding: "5px 10px", borderRadius: radius.pill,
              }}
            >
              {w.shuffle ? "🔀 INTELIGENTE" : "✋ MANUAL"}
            </button>
          </div>
          <Button onClick={() => handleStart(w)} style={{ width: "100%" }} disabled={!w.exerciseIds.length}>
            ▶ INICIAR TREINO
          </Button>
        </Card>
      ))}

      {manualPickFor && (
        <ManualSelectionOverlay
          workout={manualPickFor}
          allExercises={allExercises}
          onClose={() => setManualPickFor(null)}
          onConfirm={ids => confirmManualSelection(manualPickFor, ids)}
        />
      )}
    </div>
  );
}

function ManualSelectionOverlay({ workout, allExercises, onClose, onConfirm }) {
  const pool = allExercises.filter(e => workout.exerciseIds.includes(e.id));
  const initial = (workout.manualSelection?.length ? workout.manualSelection : workout.exerciseIds)
    .filter(id => workout.exerciseIds.includes(id));
  const [selected, setSelected] = useState(initial);

  return (
    <Overlay title={`Escolha os exercícios — ${workout.title}`} onClose={onClose}>
      <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 10 }}>
        Este treino está no modo manual. Marque os exercícios que quer fazer hoje — sua escolha fica salva para a próxima vez.
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto", border: `1px solid ${colors.border}`, borderRadius: radius.md, marginBottom: 14 }}>
        {pool.map(e => {
          const checked = selected.includes(e.id);
          return (
            <label key={e.id} onClick={() => setSelected(prev => checked ? prev.filter(id => id !== e.id) : [...prev, e.id])} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderBottom: `1px solid ${colors.borderSoft}`, cursor: "pointer",
              background: checked ? colors.bgElevated2 : "transparent",
            }}>
              <input type="checkbox" checked={checked} readOnly style={{ width: 17, height: 17, accentColor: colors.accent }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{e.name}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                  <Tag tone="muted" style={{ fontSize: 9 }}>{e.grupo}</Tag>
                  {e.subgrupos?.slice(0, 2).map(s => <Tag key={s} style={{ fontSize: 9 }}>{s}</Tag>)}
                </div>
              </div>
            </label>
          );
        })}
      </div>
      <Button onClick={() => onConfirm(selected)} style={{ width: "100%" }} disabled={!selected.length}>
        SALVAR E INICIAR ({selected.length})
      </Button>
    </Overlay>
  );
}
