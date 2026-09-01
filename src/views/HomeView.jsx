import { useData } from "../contexts/useData";
import { colors } from "../styles/theme";
import { Card, Tag, Button, EmptyState } from "../components/ui/Primitives";
import { generateSmartWorkout } from "../utils/workoutGenerator";

export default function HomeView({ setView }) {
  const { activeRoutine, allExercises, currentWorkout, startWorkout } = useData();

  async function handleStart(workout) {
    if (currentWorkout) { setView("workout"); return; }
    const pool = allExercises.filter(e => workout.exerciseIds.includes(e.id));
    const chosen = workout.shuffle
      ? generateSmartWorkout(pool, workout.targetCount || pool.length)
      : pool;
    const instance = chosen.map(e => ({
      exId: e.id, name: e.name, grupo: e.grupo, subgrupos: e.subgrupos,
      isCardio: e.grupo === "Cardio",
      sets: e.grupo === "Cardio" ? null : [{ reps: "", peso: "", done: false }],
      cardio: e.grupo === "Cardio" ? { tempo: "", km: "", pace: "" } : null,
      done: false,
    }));
    await startWorkout(activeRoutine, workout, instance);
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
                {w.exerciseIds.length} exercício(s) cadastrado(s){w.shuffle ? ` · sorteia ${w.targetCount}` : ""}
              </div>
            </div>
            {w.shuffle && <Tag>🔀 INTELIGENTE</Tag>}
          </div>
          <Button onClick={() => handleStart(w)} style={{ width: "100%" }} disabled={!w.exerciseIds.length}>
            ▶ INICIAR TREINO
          </Button>
        </Card>
      ))}
    </div>
  );
}
