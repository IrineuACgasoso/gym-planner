import { useState } from "react";
import { colors, radius } from "../../styles/theme";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const MAX_VISIBLE = 2; // qtde de treinos mostrados no dia fechado antes do "+N"

// markedDates: { [date]: string[] } -> lista de títulos dos treinos daquele dia
export default function Calendar({ markedDates, onSelectDate, selectedDate }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const { year, month } = cursor;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function dateStr(d) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function shiftMonth(delta) {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCursor({ year: y, month: m });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => shiftMonth(-1)} style={navBtn}>‹</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.text, letterSpacing: 0.5 }}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={() => shiftMonth(1)} style={navBtn}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: colors.textFaint, fontWeight: 700 }}>{w}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, alignItems: "stretch" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const str = dateStr(d);
          const workouts = markedDates[str] || [];
          const marked = workouts.length > 0;
          const isToday = str === todayStr;
          const isSelected = str === selectedDate;
          const visibleWorkouts = isSelected ? workouts : workouts.slice(0, MAX_VISIBLE);
          const hiddenCount = workouts.length - visibleWorkouts.length;

          return (
            <button key={i} onClick={() => onSelectDate(str)} style={{
              minHeight: 46, borderRadius: radius.sm, border: `1px solid ${isSelected ? colors.accent : "transparent"}`,
              background: isSelected ? colors.tagBg : marked ? colors.bgElevated2 : "transparent",
              cursor: "pointer", padding: "5px 2px 6px", boxSizing: "border-box",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: marked ? "flex-start" : "center", gap: 3,
              position: "relative", width: "100%", minWidth: 0, overflow: "hidden",
            }}>
              <span style={{
                fontSize: 12, fontWeight: marked ? 700 : 500, lineHeight: 1,
                color: marked ? colors.babyBlue : isToday ? colors.text : colors.textMuted,
              }}>{d}</span>

              {marked && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", minWidth: 0 }}>
                  {visibleWorkouts.map((title, wi) => (
                    <div key={wi} style={{ display: "flex", alignItems: "center", gap: 2, width: "100%", minWidth: 0 }}>
                      <div style={{ width: 4, height: 4, borderRadius: 4, background: colors.cyan, flexShrink: 0 }} />
                      <span style={{
                        fontSize: 8.5, fontWeight: 600, color: colors.babyBlue, lineHeight: 1.2, minWidth: 0, flex: 1,
                        textAlign: "left",
                        whiteSpace: isSelected ? "normal" : "nowrap",
                        overflow: isSelected ? "visible" : "hidden",
                        textOverflow: isSelected ? "clip" : "ellipsis",
                        wordBreak: isSelected ? "break-word" : "normal",
                      }}>{title}</span>
                    </div>
                  ))}
                  {!isSelected && hiddenCount > 0 && (
                    <span style={{ fontSize: 8, color: colors.textFaint, textAlign: "left", paddingLeft: 6 }}>+{hiddenCount}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const navBtn = {
  background: colors.bgInput, border: `1px solid ${colors.border}`, color: colors.text,
  width: 30, height: 30, borderRadius: radius.pill, cursor: "pointer", fontSize: 16,
};
