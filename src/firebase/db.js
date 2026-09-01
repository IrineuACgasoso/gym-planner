import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { db } from "./config";

// Estrutura no Firestore:
// users/{uid}/routines/{routineId}      -> { name, order, workouts: [...] }
// users/{uid}/exercises/{exerciseId}    -> { name, grupo, subgrupos: [...], custom: true }
// users/{uid}/history/{sessionId}       -> { routineId, workoutId, workoutTitle, date, exercises: [...], stats: {...} }

const col = (uid, name) => collection(db, "users", uid, name);
const ref = (uid, name, id) => doc(db, "users", uid, name, id);

async function getAll(uid, name, orderField) {
  const q = orderField ? query(col(uid, name), orderBy(orderField)) : col(uid, name);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ---------- Rotinas ----------
export const listRoutines = uid => getAll(uid, "routines", "order");
export const saveRoutine = (uid, routine) => setDoc(ref(uid, "routines", routine.id), routine);
export const deleteRoutine = (uid, id) => deleteDoc(ref(uid, "routines", id));

// ---------- Exercícios (customizados pelo usuário) ----------
export const listCustomExercises = uid => getAll(uid, "exercises");
export const saveExercise = (uid, exercise) => setDoc(ref(uid, "exercises", exercise.id), exercise);
export const deleteExercise = (uid, id) => deleteDoc(ref(uid, "exercises", id));

// ---------- Histórico / Sessões de treino ----------
export const listHistory = uid => getAll(uid, "history", "date");
export const saveHistorySession = (uid, session) => setDoc(ref(uid, "history", session.id), session);
export const deleteHistorySession = (uid, id) => deleteDoc(ref(uid, "history", id));

// ---------- Estado leve do usuário (rotina ativa, treino em andamento) ----------
export const saveUserState = (uid, state) => updateDoc(doc(db, "users", uid), state);
