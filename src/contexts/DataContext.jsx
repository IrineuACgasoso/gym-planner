import { useEffect, useState, useCallback, useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import * as fdb from "../firebase/db";
import { EXERCISE_SEED } from "../data/exerciseSeed";
import { uid } from "../utils/uid";
import { useAuth } from "./useAuth";
import { DataContext } from "./dataContextObj";

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uidVal = user?.uid;

  const [routines, setRoutines] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega tudo quando o usuário loga
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!uidVal) {
        if (!cancelled) setLoading(false);
        return;
      }
      setLoading(true);
      const [r, ex, h] = await Promise.all([
        fdb.listRoutines(uidVal),
        fdb.listCustomExercises(uidVal),
        fdb.listHistory(uidVal),
      ]);
      if (cancelled) return;
      setRoutines(r);
      setCustomExercises(ex);
      setHistory(h);
      setLoading(false);
    }
    load();

    if (!uidVal) return () => { cancelled = true; };

    // Escuta o documento do usuário para rotina ativa / treino em andamento (multi-dispositivo)
    const unsub = onSnapshot(doc(db, "users", uidVal), snap => {
      const d = snap.data();
      if (!d) return;
      setActiveRoutineId(prev => d.activeRoutineId ?? prev);
      setCurrentWorkout(d.currentWorkout ?? null);
    });

    return () => { cancelled = true; unsub(); };
  }, [uidVal]);

  const allExercises = useMemo(() => [...EXERCISE_SEED, ...customExercises], [customExercises]);

  // ---------- Rotinas ----------
  const createRoutine = useCallback(async name => {
    const routine = { id: uid("routine"), name, order: routines.length, workouts: [] };
    setRoutines(prev => [...prev, routine]);
    await fdb.saveRoutine(uidVal, routine);
    if (!activeRoutineId) {
      setActiveRoutineId(routine.id);
      await fdb.saveUserState(uidVal, { activeRoutineId: routine.id });
    }
    return routine;
  }, [routines, uidVal, activeRoutineId]);

  const updateRoutine = useCallback(async updated => {
    setRoutines(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    await fdb.saveRoutine(uidVal, updated);
  }, [uidVal]);

  const removeRoutine = useCallback(async id => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    await fdb.deleteRoutine(uidVal, id);
    if (activeRoutineId === id) {
      const next = routines.find(r => r.id !== id);
      setActiveRoutineId(next?.id || null);
      await fdb.saveUserState(uidVal, { activeRoutineId: next?.id || null });
    }
  }, [uidVal, activeRoutineId, routines]);

  const switchRoutine = useCallback(async id => {
    setActiveRoutineId(id);
    await fdb.saveUserState(uidVal, { activeRoutineId: id });
  }, [uidVal]);

  // ---------- Exercícios customizados ----------
  const addExercise = useCallback(async exercise => {
    const full = { ...exercise, id: uid("ex"), custom: true };
    setCustomExercises(prev => [...prev, full]);
    await fdb.saveExercise(uidVal, full);
    return full;
  }, [uidVal]);

  const updateExercise = useCallback(async exercise => {
    setCustomExercises(prev => prev.map(e => (e.id === exercise.id ? exercise : e)));
    await fdb.saveExercise(uidVal, exercise);
  }, [uidVal]);

  const removeExercise = useCallback(async id => {
    setCustomExercises(prev => prev.filter(e => e.id !== id));
    await fdb.deleteExercise(uidVal, id);
  }, [uidVal]);

  // ---------- Treino ativo ----------
  const startWorkout = useCallback(async (routine, workout, exercisesInstance) => {
    const session = {
      routineId: routine.id,
      routineName: routine.name,
      workoutId: workout.id,
      workoutTitle: workout.title,
      startedAt: new Date().toISOString(),
      exercises: exercisesInstance,
    };
    setCurrentWorkout(session);
    await fdb.saveUserState(uidVal, { currentWorkout: session });
    return session;
  }, [uidVal]);

  const updateCurrentWorkout = useCallback(async session => {
    setCurrentWorkout(session);
    await fdb.saveUserState(uidVal, { currentWorkout: session });
  }, [uidVal]);

  const cancelWorkout = useCallback(async () => {
    setCurrentWorkout(null);
    await fdb.saveUserState(uidVal, { currentWorkout: null });
  }, [uidVal]);

  const finishWorkout = useCallback(async () => {
    if (!currentWorkout) return;
    const session = {
      id: uid("session"),
      routineId: currentWorkout.routineId,
      routineName: currentWorkout.routineName,
      workoutId: currentWorkout.workoutId,
      workoutTitle: currentWorkout.workoutTitle,
      date: currentWorkout.startedAt.slice(0, 10),
      finishedAt: new Date().toISOString(),
      exercises: currentWorkout.exercises,
    };
    setHistory(prev => [...prev, session]);
    await fdb.saveHistorySession(uidVal, session);
    setCurrentWorkout(null);
    await fdb.saveUserState(uidVal, { currentWorkout: null });
    return session;
  }, [currentWorkout, uidVal]);

  const removeHistorySession = useCallback(async id => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await fdb.deleteHistorySession(uidVal, id);
  }, [uidVal]);

  const activeRoutine = routines.find(r => r.id === activeRoutineId) || routines[0] || null;

  const value = {
    loading, routines, allExercises, customExercises, history,
    activeRoutine, activeRoutineId, currentWorkout,
    createRoutine, updateRoutine, removeRoutine, switchRoutine,
    addExercise, updateExercise, removeExercise,
    startWorkout, updateCurrentWorkout, cancelWorkout, finishWorkout, removeHistorySession,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
