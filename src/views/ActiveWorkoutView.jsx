import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Card, Tag, Button, Input } from "../components/ui/Primitives";

export default function ActiveWorkoutView({ setView }) {
  const { currentWorkout, updateCurrentWorkout, cancelWorkout, finishWorkout } = useData();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!currentWorkout) {
    setView("home");
    return null;
  }

  const doneCount = currentWorkout.exercises.filter(e => e.done).length;
  const total = currentWorkout.exercises.length;

  function patchExercise(idx, patch) {
    const exercises = currentWorkout.exercises.map((e, i) => (i === idx ? { ...e, ...patch } : e));
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

  async function handleFinish() {
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
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={ex.done} onChange={e => patchExercise(idx, { done: e.target.checked })}
                  style={{ width: 20, height: 20, accentColor: colors.accent }} />
              </label>
            </div>

            {ex.isCardio ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Field label="Tempo (min)" value={ex.cardio.tempo} onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, tempo: v } })} />
                <Field label="Distância (km)" value={ex.cardio.km} onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, km: v } })} />
                <Field label="Pace (min/km)" value={ex.cardio.pace} onChange={v => patchExercise(idx, { cardio: { ...ex.cardio, pace: v } })} />
              </div>
            ) : (
              <div>
                {ex.sets.map((s, si) => (
                  <div key={si} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: colors.textFaint, width: 16 }}>{si + 1}</span>
                    <Field label="Reps" value={s.reps} onChange={v => patchSet(idx, si, { reps: v })} small />
                    <Field label="Peso (kg)" value={s.peso} onChange={v => patchSet(idx, si, { peso: v })} small />
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

function Field({ label, value, onChange, small }) {
  return (
    <div style={{ flex: 1 }}>
      {!small && <div style={{ fontSize: 10, color: colors.textFaint, marginBottom: 3 }}>{label}</div>}
      <Input placeholder={label} value={value} onChange={e => onChange(e.target.value)}
        inputMode="decimal" style={{ padding: "8px 10px", fontSize: 13 }} />
    </div>
  );
}
