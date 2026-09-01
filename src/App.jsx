import { useState } from "react";
import { useAuth } from "./contexts/useAuth";
import { DataProvider } from "./contexts/DataContext";
import { useData } from "./contexts/useData";
import { colors, font, radius, shadows, gradients } from "./styles/theme";

import AuthView from "./views/AuthView";
import HomeView from "./views/HomeView";
import ActiveWorkoutView from "./views/ActiveWorkoutView";
import ExercisesView from "./views/ExercisesView";
import RoutinesView from "./views/RoutinesView";
import StatsView from "./views/StatsView";
import InstallBanner from "./components/InstallBanner";

function BottomNav({ view, setView }) {
  const tabs = [
    { id: "home", emoji: "🏠", label: "HOJE" },
    { id: "stats", emoji: "📊", label: "STATS" },
    { id: "exercises", emoji: "🏋️", label: "EXERC." },
    { id: "routines", emoji: "📋", label: "ROTINAS" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(4,11,20,0.97)", borderTop: `1px solid ${colors.border}`,
      display: "flex", zIndex: 100, backdropFilter: "blur(6px)",
    }}>
      {tabs.map(t => {
        const active = view === t.id || (t.id === "home" && view === "workout");
        return (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            flex: 1, padding: "10px 0 12px", background: "none", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.emoji}</span>
            <span style={{
              fontSize: 8, fontWeight: active ? 700 : 400, letterSpacing: 1.5,
              color: active ? colors.babyBlue : colors.textFaint, fontFamily: font,
            }}>{t.label}</span>
            {active && <div style={{ width: 18, height: 2, background: colors.accent, borderRadius: 1 }} />}
          </button>
        );
      })}
    </div>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: 34, height: 34, borderRadius: radius.pill, border: `1px solid ${colors.border}`,
        background: gradients.primary, color: "#03101F", fontWeight: 700, fontSize: 14,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: shadows.glow,
      }}>{initial}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 89 }} />
          <div style={{
            position: "absolute", top: 42, left: 0, background: colors.bgElevated2,
            border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: 8,
            minWidth: 170, zIndex: 90, boxShadow: shadows.card,
          }}>
            <div style={{ padding: "6px 10px", fontSize: 12, color: colors.text, fontWeight: 700 }}>
              {user.displayName || "Usuário"}
            </div>
            <div style={{ padding: "0 10px 8px", fontSize: 10.5, color: colors.textFaint }}>{user.email}</div>
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

function AppShell() {
  const { user, logout } = useAuth();
  const { loading, activeRoutine } = useData();
  const [view, setView] = useState("home");

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: font, color: colors.text, paddingBottom: 78 }}>
      <GlobalStyle />

      <div style={{
        background: colors.bgElevated, borderBottom: `1px solid ${colors.border}`,
        padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProfileMenu user={user} onLogout={logout} />
          <div>
            <div style={{
              fontSize: 17, fontWeight: 700, letterSpacing: 3, lineHeight: 1,
              backgroundImage: gradients.primary, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>⚡ GYMFLOW</div>
            <div style={{ fontSize: 9, color: colors.textFaint, marginTop: 3, letterSpacing: 1.5 }}>
              {activeRoutine?.name?.toUpperCase() || "SEM ROTINA ATIVA"}
            </div>
          </div>
        </div>
        {activeRoutine && (
          <button onClick={() => setView("routines")} style={{
            background: colors.bgInput, border: `1px solid ${colors.border}`, color: colors.textMuted,
            padding: "7px 12px", borderRadius: radius.sm, cursor: "pointer",
            fontSize: 11, letterSpacing: 1, fontFamily: font, fontWeight: 600,
          }}>⇄ ROTINA</button>
        )}
      </div>

      <div style={{ padding: "14px 14px 0" }}>
        {view === "home" && <HomeView setView={setView} />}
        {view === "workout" && <ActiveWorkoutView setView={setView} />}
        {view === "stats" && <StatsView />}
        {view === "exercises" && <ExercisesView />}
        {view === "routines" && <RoutinesView />}
      </div>

      <BottomNav view={view} setView={setView} />
      <InstallBanner />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      background: colors.bg, height: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14, fontFamily: font,
    }}>
      <GlobalStyle />
      <div style={{
        fontSize: 30, fontWeight: 700, letterSpacing: 5,
        backgroundImage: gradients.primary, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
      }}>⚡ GYMFLOW</div>
      <div style={{ fontSize: 11, color: colors.textFaint, letterSpacing: 2 }}>CARREGANDO...</div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 2px; }
      input, select, button { outline: none; font-family: ${font}; }
      input::placeholder { color: ${colors.textFaint}; }
      select option { background: ${colors.bgInput}; color: ${colors.text}; }
      body { background: ${colors.bg}; }
    `}</style>
  );
}

export default function App() {
  const { user } = useAuth();

  if (user === undefined) return <LoadingScreen />;
  if (!user) return <AuthView />;

  return (
    <DataProvider>
      <AppShell />
    </DataProvider>
  );
}
