import { useState } from "react";
import { useData } from "../contexts/useData";
import { generateSmartWorkout } from "../utils/workoutGenerator";

export function buildWorkoutInstance(chosen) {
  return chosen.map(e => ({
    exId: e.id, name: e.name, grupo: e.grupo, subgrupos: e.subgrupos,
    isCardio: e.grupo === "Cardio",
    sets: e.grupo === "Cardio" ? null : [{ reps: "", peso: "", done: false }],
    cardio: e.grupo === "Cardio" ? { tempo: "", km: "", pace: "" } : null,
    done: false,
  }));
}

export function useStartWorkout(setView) {
  const { activeRoutine, allExercises, currentWorkout, startWorkout, updateRoutine, history } = useData();
  const [manualPickFor, setManualPickFor] = useState(null); // workout aguardando seleção manual

  async function beginWorkout(workout) {
    if (currentWorkout) { setView("workout"); return; }
    const pool = allExercises.filter(e => workout.exerciseIds.includes(e.id));

    if (workout.shuffle) {
      const chosen = generateSmartWorkout(pool, {
        subgroupCounts: workout.subgroupCounts,
        freeCount: workout.freeCount,
      });
      await startWorkout(activeRoutine, workout, buildWorkoutInstance(chosen));
      setView("workout");
      return;
    }

    // Modo não-inteligente: pede quais exercícios usar, pré-selecionando a última escolha salva
    setManualPickFor(workout);
  }

  async function confirmManualSelection(workout, selectedIds) {
    const updatedWorkout = { ...workout, manualSelection: selectedIds };
    await updateRoutine({ ...activeRoutine, workouts: activeRoutine.workouts.map(w => (w.id === workout.id ? updatedWorkout : w)) });
    setManualPickFor(null);
    const pool = allExercises.filter(e => selectedIds.includes(e.id));
    await startWorkout(activeRoutine, updatedWorkout, buildWorkoutInstance(pool));
    setView("workout");
  }

  // Sorteia (roleta) um treino qualquer dentro da rotina ativa
  function pickRandomWorkout() {
    const candidates = (activeRoutine?.workouts || []).filter(w => w.exerciseIds?.length);
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Sequência: continua a partir do treino seguinte ao último que foi realizado nesta rotina.
  // Se o próximo da fila não tiver exercícios cadastrados, pula pro seguinte que tiver.
  function pickNextSequentialWorkout() {
    const workouts = (activeRoutine?.workouts || []);
    const runnable = workouts.filter(w => w.exerciseIds?.length);
    if (!runnable.length) return null;

    const routineHistory = history
      .filter(h => h.routineId === activeRoutine.id)
      .sort((a, b) => new Date(b.finishedAt || b.date) - new Date(a.finishedAt || a.date));
    const lastWorkoutId = routineHistory[0]?.workoutId;
    const lastIndex = workouts.findIndex(w => w.id === lastWorkoutId);

    if (lastIndex === -1) return runnable[0];

    for (let step = 1; step <= workouts.length; step++) {
      const candidate = workouts[(lastIndex + step) % workouts.length];
      if (candidate.exerciseIds?.length) return candidate;
    }
    return runnable[0];
  }

  return { manualPickFor, setManualPickFor, beginWorkout, confirmManualSelection, pickRandomWorkout, pickNextSequentialWorkout, allExercises };
}
