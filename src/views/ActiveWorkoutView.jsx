import { useRef, useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius, gradients } from "../styles/theme";
import { Tag, Button, Input } from "../components/ui/Primitives";
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
  const [openIdx, setOpenIdx] = useState(0);
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
      document.activeElement?.blur?.();
      const nextOpen = currentWorkout.exercises.findIndex((e, i) => i > idx && !e.done);
      setOpenIdx(nextOpen);
    } else if (document.activeElement === document.body && lastFocusedRef.current?.isConnected) {
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
      <style>{`
        @keyframes rollIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 6, position: "sticky", top: 0, zIndex: 10, background: colors.bg, padding: "4px 0 10px",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{currentWorkout.workoutTitle}</div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{doneCount}/{total} concluídos</div>
        </div>
        <button onClick={() => setConfirmCancel(true)} style={{
          background: "none", border: "none", color: colors.textFaint, fontSize: 10.5,
          fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, padding: "6px 0",
        }}>✕ ANULAR TREINO</button>
      </div>

      {confirmCancel && (
        <div style={{
          background: colors.bgElevated, border: `1px solid ${colors.danger}`, borderRadius: radius.lg,
          padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 12 }}>
            Anular este treino? Todo o progresso preenchido será perdido e nada será salvo no calendário.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setConfirmCancel(false)} style={{ flex: 1 }}>VOLTAR</Button>
            <Button variant="danger" onClick={handleCancel} style={{ flex: 1 }}>SIM, ANULAR</Button>
          </div>
        </div>
      )}

      {confirmFinish && (
        <div style={{
          background: colors.bgElevated, border: `1px solid ${colors.accent}`, borderRadius: radius.lg,
          padding: 14, marginBottom: 14,
        }}>
          <div style={{ fontSize: 13, color: colors.text, marginBottom: 12 }}>
            Ainda faltam {total - doneCount} exercício(s) sem marcar como concluído. Finalizar mesmo assim?
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={() => setConfirmFinish(false)} style={{ flex: 1 }}>VOLTAR</Button>
            <Button onClick={handleConfirmFinishAnyway} style={{ flex: 1 }}>SIM, FINALIZAR</Button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 100 }}>
        {currentWorkout.exercises.map((ex, idx) => {
          const isOpen = openIdx === idx && !ex.done;
          return (
            <div key={idx} style={{
              background: colors.bgElevated, border: `1.5px solid ${ex.done ? colors.success : isOpen ? colors.accent : colors.border}`,
              borderRadius: radius.lg, opacity: ex.done ? 0.55 : 1,
              animation: `rollIn .35s ease ${idx * 0.06}s both`,
            }}>
              <div
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={ex.done}
                  onClick={e => e.stopPropagation()}
                  onChange={e => toggleDone(idx, e.target.checked)}
                  style={{ width: 22, height: 22, accentColor: colors.accent, flexShrink: 0, borderRadius: "50%" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: colors.text, textDecoration: ex.done ? "line-through" : "none" }}>
                    {ex.name}
                  </div>
                  {isOpen && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
                      <Tag tone="muted">{ex.grupo}</Tag>
                      {ex.subgrupos?.map(s => <Tag key={s}>{s}</Tag>)}
                    </div>
                  )}
                </div>
                {isOpen && !ex.done && (
                  <button onClick={e => { e.stopPropagation(); handleReroll(idx); }} title="Sortear outro exercício"
                    style={{
                      background: colors.bgInput, border: `1px solid ${colors.border}`, color: colors.babyBlue,
                      width: 28, height: 28, borderRadius: radius.pill, cursor: "pointer", fontSize: 12, flexShrink: 0,
                    }}>🔀</button>
                )}
                <span style={{ color: colors.textFaint, fontSize: 12, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
              </div>

              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 14px 20px",
        background: `linear-gradient(180deg, transparent, ${colors.bg} 35%)`, zIndex: 60,
      }}>
        <button onClick={handleFinish} style={{
          width: "100%", padding: "16px 0", borderRadius: radius.md, border: "none", cursor: "pointer",
          background: gradients.primary, color: "#03101F", fontWeight: 700, fontSize: 14, letterSpacing: 1,
        }}>✔ FINALIZAR TREINO</button>
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
