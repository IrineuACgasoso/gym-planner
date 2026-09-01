import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { colors, font, gradients, radius, shadows } from "../styles/theme";
import { Input, Button } from "../components/ui/Primitives";

export default function AuthView() {
  const { login, signup, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") await login(email, password);
    else await signup(name, email, password);
    setBusy(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: colors.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{
          fontSize: 30, fontWeight: 700, letterSpacing: 5,
          backgroundImage: gradients.primary, WebkitBackgroundClip: "text", backgroundClip: "text",
          color: "transparent", filter: `drop-shadow(0 0 14px rgba(63,169,245,0.35))`,
        }}>⚡ GYMFLOW</div>
        <div style={{ fontSize: 11, color: colors.textFaint, letterSpacing: 2, marginTop: 6 }}>
          SEU GESTOR DE TREINOS PESSOAL
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: 360, background: colors.bgElevated,
        border: `1px solid ${colors.border}`, borderRadius: radius.xl, padding: 24,
        boxShadow: shadows.card,
      }}>
        <div style={{ display: "flex", marginBottom: 20, background: colors.bgInput, borderRadius: radius.pill, padding: 3 }}>
          {["login", "signup"].map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} style={{
              flex: 1, padding: "9px 0", borderRadius: radius.pill, border: "none", cursor: "pointer",
              fontFamily: font, fontWeight: 700, fontSize: 12, letterSpacing: 0.8,
              background: mode === m ? gradients.primary : "transparent",
              color: mode === m ? "#03101F" : colors.textMuted,
            }}>{m === "login" ? "ENTRAR" : "CRIAR CONTA"}</button>
          ))}
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 12 }}>
            <Input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <Input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        </div>

        {error && (
          <div style={{ color: colors.danger, fontSize: 12.5, marginBottom: 14, textAlign: "center" }}>{error}</div>
        )}

        <Button type="submit" disabled={busy} style={{ width: "100%" }}>
          {busy ? "AGUARDE..." : mode === "login" ? "ENTRAR" : "CRIAR CONTA E ENTRAR"}
        </Button>
      </form>
    </div>
  );
}
