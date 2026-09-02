import { colors, radius, font } from "../styles/theme";

export default function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <button onClick={onBack} style={{
        width: 34, height: 34, borderRadius: radius.pill, border: `1px solid ${colors.border}`,
        background: colors.bgElevated2, color: colors.babyBlue, cursor: "pointer",
        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>‹</button>
      <div style={{
        fontSize: 15.5, fontWeight: 700, color: colors.text, letterSpacing: 0.5,
        fontFamily: font, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{title}</div>
      {right}
    </div>
  );
}
