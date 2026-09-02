import { useRef, useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Card, Tag, Button, Input } from "../components/ui/Primitives";
import { rerollSingleExercise } from "../utils/workoutGenerator";

function formatCardioTime(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits; // ainda digitando os segundos
  const minStr = digits.slice(0, -2);
  const secStr = digits.slice(-2);
  const totalMin = parseInt(minStr, 10) || 0;
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}:${String(m).padStart(2, "0")}:${secStr}`;
  }
  return `${minStr}:${secStr}`;
}

export default function ActiveWorkoutView({ setView }) {
  const { currentWorkout, updateCurrentWorkout, cancelWorkout, finishWorkout, routines, allExercises } = useData();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const lastFocusedRef = useRef(null);

  if (!currentWorkout) {
    setView("home");
    return null;
  }

  const doneCount = currentWorkout.exercises.filter(e => e.done).length;
  const total = currentWorkout.exercises.length;

  const routine = routines.find(r => r.id === currentWorkout.routineId);
  const workoutDef = routine?.workouts.find(w => w.id === currentWorkout.workoutId);
  const fullPool = workoutDef ? allExercises.filter(e => workoutDef.exerciseIds.includes(e.id)) : [];

  function patchExercise(idx, patch) {
    const exercises = currentWorkout.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e));
    updateCurrentWorkout({ ...currentWorkout, exercises });
  }

  function replaceExercise(idx, newExercise) {
    const exercises = currentWorkout.exercises.map((e, i) => (i === idx ? newExercise : e));
    updateCurrentWorkout({ ...currentWorkout, exercises });
  }

  function patchSet(idx, setIdx, patch) {
    const ex = currentWorkout.exercises[idx];
    const sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
    patchExercise(idx, { sets });
  }

  function addSet(idx) {
    const ex = currentWorkout.exercises[idx];
    patchExercise(idx, { sets: [...ex.sets, { reps: "", peso: "", done: false }] });
  }

  function deleteSet(idx, setIdx) {
    if (!confirm("Excluir esta série? Essa ação não pode ser desfeita.")) return;
    const ex = currentWorkout.exercises[idx];
    const sets = ex.sets.filter((_, i) => i !== setIdx);
    patchExercise(idx, { sets });
  }

  function toggleDone(idx, checked) {
    if (checked) {
      // fecha o teclado ao concluir o exercício
      document.activeElement?.blur?.();
    } else if (document.activeElement === document.body && lastFocusedRef.current?.isConnected) {
      // devolve o cursor pro campo de antes, se nada mais estiver focado
      lastFocusedRef.current.focus();
    }
    patchExercise(idx, { done: checked });
  }

  function handleReroll(idx) {
    const ex = currentWorkout.exercises[idx];
    const usedIds = currentWorkout.exercises.map(e => e.exId);
    const replacement = rerollSingleExercise(fullPool, ex, usedIds);
    if (!replacement) {
      alert("Não há outro exercício disponível no pool deste treino para substituir.");
      return;
    }
    replaceExercise(idx, {
      exId: replacement.id, name: replacement.name, grupo: replacement.grupo, subgrupos: replacement.subgrupos,
      isCardio: replacement.grupo === "Cardio",
      sets: replacement.grupo === "Cardio" ? null : [{ reps: "", peso: "", done: false }],
      cardio: replacement.grupo === "Cardio" ? { tempo: "", km: "", pace: "" } : null,
      done: false,
    });
  }

  async function handleFinish() {
    if (doneCount < total) {
      setConfirmFinish(true);
      return;
    }
    await finishWorkout();
    setView("home");
  }

  async function handleConfirmFinishAnyway() {
    await finishWorkout();
    setView("home");
  }

  async function handleCancel() {
    await cancelWorkout();
    setView("home");
  }

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14, position: "sticky", top: 60, zIndex: 10,
        background: colors.bg, padding: "6px 0",
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>{currentWorkout.workoutTitle}</div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{doneCount}/{total} concluídos</div>
        </div>
        <button onClick={() => setConfirmCancel(true)} style={{
          background: "rgba(255,93,108,0.1)", border: `1px solid rgba(255,93,108,0.35)`, color: colors.danger,
          padding: "8px 12px", borderRadius: radius.sm, fontSize: 11, fontWeight: 700, cursor: "pointer",
        }}>✕ ANULAR</button>
      </div>

      {confirmCancel && (
        <Card style={{ marginBottom: 14, borderColor: colors.danger }}>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 12 }}>
            Anular este treino? Todo o progresso preenchido será perdido e nada será salvo no calendário.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)} style={{ flex: 1 }}>VOLTAR</Button>
            <Button variant="danger" onClick={handleCancel} style={{ flex: 1 }}>SIM, ANULAR</Button>
          </div>
        </Card>
      )}

      {confirmFinish && (
        <Card style={{ marginBottom: 14, borderColor: colors.accent }}>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 12 }}>
            Ainda faltam {total - doneCount} exercício(s) sem marcar como concluído. Finalizar mesmo assim?
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setConfirmFinish(false)} style={{ flex: 1 }}>VOLTAR</Button>
            <Button onClick={handleConfirmFinishAnyway} style={{ flex: 1 }}>SIM, FINALIZAR</Button>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 90 }}>
        {currentWorkout.exercises.map((ex, idx) => (
          <Card key={idx} style={{ opacity: ex.done ? 0.6 : 1, borderColor: ex.done ? colors.success : colors.border }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{ex.name}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                  <Tag tone="muted">{ex.grupo}</Tag>
                  {ex.subgrupos?.map(s => <Tag key={s}>{s}</Tag>)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {!ex.done && (
                  <button onClick={() => handleReroll(idx)} title="Sortear outro exercício"
                    style={{
                      background: colors.bgInput, border: `1px solid ${colors.border}`, color: colors.babyBlue,
                      width: 30, height: 30, borderRadius: radius.pill, cursor: "pointer", fontSize: 13,
                    }}>🔀</button>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={ex.done} onChange={e => toggleDone(idx, e.target.checked)}
                    style={{ width: 20, height: 20, accentColor: colors.accent }} />
                </label>
              </div>
            </div>

            {ex.isCardio ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Field label="Tempo (mm:ss)" value={ex.cardio.tempo} mask="time"
                  onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, tempo: v } })}
                  onFocus={e => (lastFocusedRef.current = e.target)} />
                <Field label="Distância (km)" value={ex.cardio.km}
                  onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, km: v } })}
                  onFocus={e => (lastFocusedRef.current = e.target)} />
                <Field label="Pace (mm:ss/km)" value={ex.cardio.pace} mask="time"
                  onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, pace: v } })}
                  onFocus={e => (lastFocusedRef.current = e.target)} />
              </div>
            ) : (
              <div>
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: colors.textFaint, width: 16 }}>{si + 1}</span>
                    <Field label="Reps" value={s.reps} onChange={v => patchSet(idx, si, { reps: v })} small
                      onFocus={e => (lastFocusedRef.current = e.target)} />
                    <Field label="Peso (kg)" value={s.peso} onChange={v => patchSet(idx, si, { peso: v })} small
                      onFocus={e => (lastFocusedRef.current = e.target)} />
                    <button onClick={() => deleteSet(idx, si)} title="Excluir série" style={{
                      background: "none", border: "none", color: colors.danger, cursor: "pointer",
                      fontSize: 15, padding: "4px 6px", lineHeight: 1,
                    }}>🗑</button>
                  </div>
                ))}
                <button onClick={() => addSet(idx)} style={{
                  background: "none", border: "none", color: colors.babyBlue, fontSize: 11.5,
                  fontWeight: 700, cursor: "pointer", padding: "4px 0",
                }}>+ ADICIONAR SÉRIE</button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div style={{
        position: "fixed", bottom: 72, left: 0, right: 0, padding: "10px 14px",
        background: `linear-gradient(180deg, transparent, ${colors.bg} 30%)`, zIndex: 60,
      }}>
        <Button onClick={handleFinish} style={{ width: "100%" }}>✔ FINALIZAR TREINO</Button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, small, mask, onFocus }) {
  function handleChange(e) {
    const v = mask === "time" ? formatCardioTime(e.target.value) : e.target.value;
    onChange(v);
  }
  return (
    <div style={{ flex: 1 }}>
      {!small && <div style={{ fontSize: 10, color: colors.textFaint, marginBottom: 3 }}>{label}</div>}
      <Input placeholder={label} value={value} onChange={handleChange} onFocus={onFocus}
        inputMode={mask === "time" ? "numeric" : "decimal"} style={{ padding: "8px 10px", fontSize: 13 }} />
    </div>
  );
}