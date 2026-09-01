import { useMemo, useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius, gradients } from "../styles/theme";
import { Card, Tag, Select, EmptyState, Button } from "../components/ui/Primitives";
import Calendar from "../components/ui/Calendar";

const PERIODS = [
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "90", label: "90 dias" },
  { id: "all", label: "Sempre" },
];

export default function StatsView() {
  const { history, routines, removeHistorySession } = useData();
  const [tab, setTab] = useState("calendar");

  return (
    <div>
      <div style={{ display: "flex", background: colors.bgInput, borderRadius: radius.pill, padding: 3, marginBottom: 16 }}>
        {[["calendar", "📅 CALENDÁRIO"], ["ranking", "🏆 RANKING"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: "9px 0", borderRadius: radius.pill, border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 11.5, letterSpacing: 0.5,
            background: tab === id ? gradients.primary : "transparent",
            color: tab === id ? "#03101F" : colors.textMuted,
          }}>{label}</button>
        ))}
      </div>

      {tab === "calendar"
        ? <CalendarTab history={history} onDelete={removeHistorySession} />
        : <RankingTab history={history} routines={routines} />}
    </div>
  );
}

function CalendarTab({ history, onDelete }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const markedDates = useMemo(() => {
    const map = {};
    history.forEach(h => { map[h.date] = true; });
    return map;
  }, [history]);

  const sessionsForDate = history.filter(h => h.date === selectedDate);

  return (
    <div>
      <Card style={{ marginBottom: 14 }}>
        <Calendar markedDates={markedDates} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
      </Card>

      <div style={{ fontSize: 12, color: colors.textFaint, marginBottom: 8, letterSpacing: 0.5 }}>
        {formatDateBR(selectedDate)}
      </div>

      {!sessionsForDate.length && <EmptyState icon="💤" title="Sem treinos registrados neste dia" />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sessionsForDate.map(s => (
          <Card key={s.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: colors.text }}>{s.workoutTitle}</div>
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{s.routineName}</div>
              </div>
              <Button variant="danger" onClick={() => { if (confirm("Excluir este registro?")) onDelete(s.id); }} style={{ padding: "5px 9px", fontSize: 10 }}>🗑</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {s.exercises.map((e, i) => (
                <div key={i} style={{ fontSize: 12, color: colors.textMuted, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: e.done ? colors.text : colors.textFaint }}>{e.done ? "✓" : "—"} {e.name}</span>
                  <span>
                    {e.isCardio
                      ? [e.cardio?.km && `${e.cardio.km}km`, e.cardio?.tempo && `${e.cardio.tempo}min`, e.cardio?.pace && `${e.cardio.pace}/km`].filter(Boolean).join(" · ")
                      : `${e.sets?.length || 0} série(s)`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RankingTab({ history, routines }) {
  const [routineFilter, setRoutineFilter] = useState("all");
  const [period, setPeriod] = useState("30");
  const [metric, setMetric] = useState("frequency"); // frequency | cardio

  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const cutoff = period === "all" ? null : now - Number(period) * 86400000;
    return history.filter(h => {
      if (routineFilter !== "all" && h.routineId !== routineFilter) return false;
      if (cutoff && new Date(h.date).getTime() < cutoff) return false;
      return true;
    });
  }, [history, routineFilter, period, now]);

  const frequencyRanking = useMemo(() => {
    const counts = {};
    filtered.forEach(h => { counts[h.workoutTitle] = (counts[h.workoutTitle] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const cardioRanking = useMemo(() => {
    const rows = [];
    filtered.forEach(h => h.exercises.forEach(e => {
      if (e.isCardio && (e.cardio?.km || e.cardio?.tempo)) {
        rows.push({ date: h.date, name: e.name, ...e.cardio });
      }
    }));
    return rows.sort((a, b) => (parseFloat(b.km) || 0) - (parseFloat(a.km) || 0));
  }, [filtered]);

  const maxCount = frequencyRanking[0]?.[1] || 1;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Select value={routineFilter} onChange={e => setRoutineFilter(e.target.value)} style={{ flex: 1 }}>
          <option value="all">Todas as rotinas</option>
          {routines.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
        <Select value={period} onChange={e => setPeriod(e.target.value)} style={{ flex: 1 }}>
          {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </Select>
      </div>

      <div style={{ display: "flex", background: colors.bgInput, borderRadius: radius.pill, padding: 3, marginBottom: 16 }}>
        {[["frequency", "Frequência"], ["cardio", "Cardio (km/pace)"]].map(([id, label]) => (
          <button key={id} onClick={() => setMetric(id)} style={{
            flex: 1, padding: "7px 0", borderRadius: radius.pill, cursor: "pointer",
            fontWeight: 700, fontSize: 11, background: metric === id ? colors.bgElevated2 : "transparent",
            color: metric === id ? colors.babyBlue : colors.textMuted,
            border: metric === id ? `1px solid ${colors.accent}` : "1px solid transparent",
          }}>{label}</button>
        ))}
      </div>

      {metric === "frequency" ? (
        !frequencyRanking.length ? <EmptyState icon="📊" title="Sem dados no período" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {frequencyRanking.map(([title, count], i) => (
              <Card key={title} style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>#{i + 1} {title}</span>
                  <Tag>{count}x</Tag>
                </div>
                <div style={{ height: 6, background: colors.bgInput, borderRadius: radius.pill, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: gradients.progress }} />
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        !cardioRanking.length ? <EmptyState icon="🏃" title="Sem registros de cardio no período" /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cardioRanking.map((r, i) => (
              <Card key={i} style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{r.name}</div>
                    <div style={{ fontSize: 10.5, color: colors.textFaint, marginTop: 2 }}>{formatDateBR(r.date)}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {r.km && <Tag>{r.km} km</Tag>}
                    {r.tempo && <Tag tone="muted">{r.tempo} min</Tag>}
                    {r.pace && <Tag tone="muted">{r.pace}/km</Tag>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function formatDateBR(str) {
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
}
