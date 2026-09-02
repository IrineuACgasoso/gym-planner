import { useState } from "react";
import { useAuth } from "./contexts/useAuth";
import { DataProvider } from "./contexts/DataContext";
import { useData } from "./contexts/useData";
import { colors, font } from "./styles/theme";

import AuthView from "./views/AuthView";
import HomeView from "./views/HomeView";
import ChooseWorkoutView from "./views/ChooseWorkoutView";
import ActiveWorkoutView from "./views/ActiveWorkoutView";
import ExercisesView from "./views/ExercisesView";
import StatsView from "./views/StatsView";
import InstallBanner from "./components/InstallBanner";

function AppShell() {
  const { loading } = useData();
  const [view, setView] = useState("home");

  if (loading) return <LoadingScreen />;

  return (
    <div style={{ background: colors.bg, minHeight: "100vh", fontFamily: font, color: colors.text }}>
      <GlobalStyle />

      <div style={{ padding: "18px 16px 24px" }}>
        {view === "home" && <HomeView setView={setView} />}
        {view === "chooseWorkout" && <ChooseWorkoutView setView={setView} />}
        {view === "workout" && <ActiveWorkoutView setView={setView} />}
        {view === "stats" && <StatsView setView={setView} />}
        {view === "exercises" && <ExercisesView setView={setView} />}
      </div>

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
        backgroundImage: "linear-gradient(135deg, #7FD4FF 0%, #3FA9F5 45%, #0B3D91 100%)",
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
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
