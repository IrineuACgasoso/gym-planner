import { useState } from "react";
import { colors, radius } from "../styles/theme";
import { Tag, Button, Overlay } from "./ui/Primitives";

export default function ManualSelectionOverlay({ workout, allExercises, onClose, onConfirm }) {
  const pool = allExercises.filter(e => workout.exerciseIds.includes(e.id));
  const initial = (workout.manualSelection?.length ? workout.manualSelection : workout.exerciseIds)
    .filter(id => workout.exerciseIds.includes(id));
  const [selected, setSelected] = useState(initial);

  return (
    <Overlay title={`Escolha os exercícios — ${workout.title}`} onClose={onClose}>
      <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 10 }}>
        Este treino está no modo manual. Marque os exercícios que quer fazer hoje — sua escolha fica salva para a próxima vez.
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto", border: `1px solid ${colors.border}`, borderRadius: radius.md, marginBottom: 14 }}>
        {pool.map(e => {
          const checked = selected.includes(e.id);
          return (
            <label key={e.id} onClick={() => setSelected(prev => checked ? prev.filter(id => id !== e.id) : [...prev, e.id])} style={{
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
      <Button onClick={() => onConfirm(selected)} style={{ width: "100%" }} disabled={!selected.length}>
        SALVAR E INICIAR ({selected.length})
      </Button>
    </Overlay>
  );
}
