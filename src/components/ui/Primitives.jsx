import { colors, font, radius, shadows, gradients } from "../../styles/theme";

export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bgElevated,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: 16,
        boxShadow: shadows.card,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Tag({ children, tone = "accent", style }) {
  const tones = {
    accent: { bg: colors.tagBg, border: colors.tagBorder, color: colors.babyBlue },
    muted: { bg: colors.bgInput, border: colors.border, color: colors.textMuted },
    success: { bg: "rgba(63,224,165,0.1)", border: "rgba(63,224,165,0.3)", color: colors.success },
    danger: { bg: "rgba(255,93,108,0.1)", border: "rgba(255,93,108,0.3)", color: colors.danger },
  };
  const t = tones[tone] || tones.accent;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: t.bg, border: `1px solid ${t.border}`, color: t.color,
      fontSize: 10, fontWeight: 600, letterSpacing: 0.6,
      padding: "3px 9px", borderRadius: radius.pill, fontFamily: font,
      ...style,
    }}>{children}</span>
  );
}

export function Button({ children, onClick, variant = "primary", style, disabled, type = "button" }) {
  const variants = {
    primary: { background: gradients.primary, color: "#03101F", border: "none", boxShadow: shadows.glow },
    secondary: { background: colors.bgElevated2, color: colors.text, border: `1px solid ${colors.border}` },
    ghost: { background: "transparent", color: colors.textMuted, border: `1px solid ${colors.border}` },
    danger: { background: "rgba(255,93,108,0.12)", color: colors.danger, border: `1px solid rgba(255,93,108,0.35)` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: font, fontWeight: 700, fontSize: 13, letterSpacing: 0.8,
        padding: "12px 18px", borderRadius: radius.md, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "transform .12s ease, opacity .12s ease",
        ...variants[variant], ...style,
      }}
    >{children}</button>
  );
}

export function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%", background: colors.bgInput, border: `1px solid ${colors.border}`,
        color: colors.text, borderRadius: radius.sm, padding: "11px 13px",
        fontSize: 14, fontFamily: font, ...style,
      }}
    />
  );
}

export function Select({ style, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: "100%", background: colors.bgInput, border: `1px solid ${colors.border}`,
        color: colors.text, borderRadius: radius.sm, padding: "11px 13px",
        fontSize: 14, fontFamily: font, ...style,
      }}
    >{children}</select>
  );
}

export function Overlay({ onClose, children, title }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(2,6,12,0.75)",
        backdropFilter: "blur(3px)", zIndex: 200, display: "flex",
        alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: colors.bgElevated, borderTop: `1px solid ${colors.border}`,
          borderLeft: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}`,
          borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480,
          maxHeight: "88vh", overflowY: "auto", padding: 20,
          boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
        }}
      >
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, letterSpacing: 0.5 }}>{title}</h2>
            <button onClick={onClose} style={{
              background: colors.bgInput, border: `1px solid ${colors.border}`, color: colors.textMuted,
              width: 30, height: 30, borderRadius: radius.pill, cursor: "pointer", fontSize: 14,
            }}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: colors.textMuted }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, marginBottom: 16 }}>{subtitle}</div>}
      {action}
    </div>
  );
}
