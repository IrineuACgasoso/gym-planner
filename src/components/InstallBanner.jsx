import { useEffect, useState } from "react";
import { colors, radius, gradients, shadows, font } from "../styles/theme";

function isIos() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
}
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("gymflow_install_dismissed") === "1");
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (isStandalone() || dismissed) return null;
  if (!deferredPrompt && !isIos()) return null;

  function dismiss() {
    setDismissed(true);
    sessionStorage.setItem("gymflow_install_dismissed", "1");
  }

  async function handleInstall() {
    if (isIos()) { setShowIosHint(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 24px)", maxWidth: 528, zIndex: 95,
      background: colors.bgElevated2, border: `1px solid ${colors.accent}`, borderRadius: radius.lg,
      padding: 12, display: "flex", alignItems: "center", gap: 10, boxShadow: shadows.glow, fontFamily: font,
    }}>
      <div style={{ fontSize: 22 }}>📲</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.text }}>Instale o GymFlow</div>
        <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 1 }}>
          {showIosHint ? "Toque em Compartilhar → \"Adicionar à Tela de Início\"" : "Use como app, sem precisar do navegador."}
        </div>
      </div>
      {!showIosHint && (
        <button onClick={handleInstall} style={{
          background: gradients.primary, border: "none", color: "#03101F", fontWeight: 700,
          fontSize: 11, padding: "8px 12px", borderRadius: radius.sm, cursor: "pointer", fontFamily: font,
        }}>INSTALAR</button>
      )}
      <button onClick={dismiss} style={{
        background: "none", border: "none", color: colors.textFaint, fontSize: 16, cursor: "pointer", padding: 4,
      }}>✕</button>
    </div>
  );
}
