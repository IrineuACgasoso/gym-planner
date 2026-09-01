import { useState } from "react";
import { colors, radius } from "../../styles/theme";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 10, color: colors.textFaint, fontWeight: 700 }}>{w}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const str = dateStr(d);
          const marked = markedDates[str];
          const isToday = str === todayStr;
          const isSelected = str === selectedDate;
          return (
            <button key={i} onClick={() => onSelectDate(str)} style={{
              aspectRatio: "1", borderRadius: radius.sm, border: `1px solid ${isSelected ? colors.accent : "transparent"}`,
              background: isSelected ? colors.tagBg : marked ? colors.bgElevated2 : "transparent",
              color: marked ? colors.babyBlue : isToday ? colors.text : colors.textMuted,
              fontSize: 12, fontWeight: marked ? 700 : 500, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
              position: "relative",
            }}>
              {d}
              {marked && <div style={{ width: 4, height: 4, borderRadius: 4, background: colors.cyan }} />}
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
