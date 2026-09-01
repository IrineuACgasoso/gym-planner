import { useMemo, useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Input, Select, Tag } from "./ui/Primitives";
import { MUSCLE_GROUPS } from "../data/exerciseSeed";

export default function ExercisePicker({ selectedIds, onChange }) {
  const { allExercises } = useData();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("Todos");

  const filtered = useMemo(() => {
    return allExercises.filter(e => {
      if (groupFilter !== "Todos" && e.grupo !== groupFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allExercises, search, groupFilter]);

  function toggle(id) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <Input placeholder="Buscar exercício..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1.4 }} />
        <Select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} style={{ flex: 1 }}>
          <option>Todos</option>
          {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
        </Select>
      </div>

      <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${colors.border}`, borderRadius: radius.md }}>
        {!filtered.length && (
          <div style={{ padding: 16, textAlign: "center", color: colors.textMuted, fontSize: 12.5 }}>Nenhum exercício encontrado.</div>
        )}
        {filtered.map(e => {
          const checked = selectedIds.includes(e.id);
          return (
            <label key={e.id} onClick={() => toggle(e.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderBottom: `1px solid ${colors.borderSoft}`, cursor: "pointer",
              background: checked ? colors.bgElevated2 : "transparent",
            }}>
              <input type="checkbox" checked={checked} readOnly style={{ width: 17, height: 17, accentColor: colors.accent }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: colors.text, fontWeight: 600 }}>{e.name}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>
                  <Tag tone="muted" style={{ fontSize: 9 }}>{e.grupo}</Tag>
                  {e.subgrupos?.slice(0, 2).map(s => <Tag key={s} style={{ fontSize: 9 }}>{s}</Tag>)}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
