import { useState } from "react";
import { useData } from "../contexts/useData";
import { useAuth } from "../contexts/useAuth";
import { colors, radius, gradients, shadows, font } from "../styles/theme";
import { EmptyState } from "../components/ui/Primitives";
import RoutineSelector from "../components/RoutineSelector";
import ManualSelectionOverlay from "../components/ManualSelectionOverlay";
import { useStartWorkout } from "../hooks/useStartWorkout";

export default function HomeView({ setView }) {
  const { activeRoutine, currentWorkout } = useData();
  const { user, logout } = useAuth();
  const { manualPickFor, setManualPickFor, beginWorkout, confirmManualSelection, pickNextSequentialWorkout, allExercises } = useStartWorkout(setView);

  async function handleIniciarTreino() {
    if (currentWorkout) { setView("workout"); return; }
    const workout = pickNextSequentialWorkout();
    if (!workout) { setView("chooseWorkout"); return; }
    await beginWorkout(workout);
  }

  const hasWorkouts = !!activeRoutine?.workouts?.length;
  const nextWorkout = !currentWorkout && hasWorkouts ? pickNextSequentialWorkout() : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 28px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <RoutineSelector />
        <ProfileAvatar user={user} onLogout={logout} />
      </div>

      {!activeRoutine ? (
        <EmptyState icon="🏋️" title="Nenhuma rotina criada ainda"
          subtitle="Toque no seletor acima para criar sua primeira rotina." />
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "center", gap: 16 }}>
          {currentWorkout && (
            <div style={{
              background: colors.bgElevated2, border: `1px solid ${colors.accent}`, borderRadius: radius.lg,
              padding: "10px 16px", marginBottom: 4, textAlign: "center",
            }}>
              <div style={{ fontSize: 10.5, color: colors.babyBlue, fontWeight: 700, letterSpacing: 1 }}>● TREINO EM ANDAMENTO</div>
              <div style={{ fontSize: 13, color: colors.text, fontWeight: 600, marginTop: 2 }}>{currentWorkout.workoutTitle}</div>
            </div>
          )}

          <HomeButton primary onClick={handleIniciarTreino} disabled={!hasWorkouts && !currentWorkout}>
            {currentWorkout ? "▶ CONTINUAR TREINO" : "▶ INICIAR TREINO"}
          </HomeButton>
          {nextWorkout && (
            <div style={{ fontSize: 13.5, color: colors.text, textAlign: "center", marginTop: -6 }}>
              Próximo: <span style={{ color: colors.babyBlue, fontWeight: 700 }}>{nextWorkout.title}</span>
            </div>
          )}

          <HomeButton onClick={() => setView("chooseWorkout")}>
            ESCOLHER TREINO
          </HomeButton>

          <div style={{ height: 14 }} />

          <HomeButton outline onClick={() => setView("stats")}>
            📊 ESTATÍSTICAS
          </HomeButton>

          <HomeButton outline onClick={() => setView("exercises")}>
            🏋️ EXERCÍCIOS
          </HomeButton>
        </div>
      )}

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

function HomeButton({ children, onClick, primary, outline, disabled }) {
  const base = {
    width: "100%", padding: "16px 20px", borderRadius: radius.md, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: font, fontWeight: 700, fontSize: 14, letterSpacing: 1, textAlign: "center",
    opacity: disabled ? 0.4 : 1,
  };
  const variant = primary
    ? { background: gradients.primary, color: "#03101F", border: "none", boxShadow: shadows.glow }
    : outline
      ? { background: "transparent", color: colors.babyBlue, border: `1.5px solid ${colors.accentSoft}` }
      : { background: colors.bgElevated2, color: colors.text, border: `1.5px solid ${colors.border}` };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variant }}>{children}</button>;
}

function ProfileAvatar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initial = (user?.displayName || user?.email || "?").charAt(0).toUpperCase();
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 38, height: 38, borderRadius: radius.pill,
        border: `1px solid ${colors.border}`, background: gradients.primary, color: "#03101F",
        fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", boxShadow: shadows.glow,
      }}>{initial}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 89 }} />
          <div style={{
            position: "absolute", top: 46, right: 0, background: colors.bgElevated2,
            border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: 8,
            minWidth: 170, zIndex: 90, boxShadow: shadows.card,
          }}>
            <div style={{ padding: "6px 10px", fontSize: 12, color: colors.text, fontWeight: 700 }}>
              {user?.displayName || "Usuário"}
            </div>
            <div style={{ padding: "0 10px 8px", fontSize: 10.5, color: colors.textFaint }}>{user?.email}</div>
            <button onClick={onLogout} style={{
              width: "100%", textAlign: "left", background: "rgba(255,93,108,0.1)", border: "none",
              color: colors.danger, padding: "8px 10px", borderRadius: radius.sm, cursor: "pointer",
              fontSize: 12, fontWeight: 700, fontFamily: font,
            }}>⏻ SAIR</button>
          </div>
        </>
      )}
    </div>
  );
}
