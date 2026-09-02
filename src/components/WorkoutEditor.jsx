import { useState } from "react";
import { useData } from "../contexts/useData";
import { colors } from "../styles/theme";
import { Button, Input, Overlay } from "./ui/Primitives";
import { uid } from "../utils/uid";
import { getSubgroupsInPool } from "../utils/workoutGenerator";
import ExercisePicker from "./ExercisePicker";

export default function WorkoutEditor({ workout, onCancel, onSave }) {
  const { allExercises } = useData();
  const [title, setTitle] = useState(workout?.title || "");
  const [exerciseIds, setExerciseIds] = useState(workout?.exerciseIds || []);
  // Caso base: treino novo já nasce "inteligente" (ativado).
  const [shuffle, setShuffle] = useState(workout ? !!workout.shuffle : true);
  const [subgroupCounts, setSubgroupCounts] = useState(workout?.subgroupCounts || {});
  const [freeCount, setFreeCount] = useState(workout?.freeCount ?? 0);

  const poolExercises = allExercises.filter(e => exerciseIds.includes(e.id));
  const subgroupsInPool = getSubgroupsInPool(poolExercises);
  const hasFreePool = poolExercises.some(e => !e.subgrupos?.length);

  function countFor(sg) {
    return subgroupCounts[sg] ?? 1;
  }
  function setCountFor(sg, value) {
    setSubgroupCounts(prev => ({ ...prev, [sg]: Math.max(0, Number(value) || 0) }));
  }

  function handleSave() {
    if (!title.trim() || !exerciseIds.length) return;
    // limpa contagens de subgrupos que não existem mais no pool
    const cleanCounts = {};
    subgroupsInPool.forEach(sg => { cleanCounts[sg] = countFor(sg); });
    onSave({
      id: workout?.id || uid("workout"),
      title: title.trim(),
      exerciseIds,
      shuffle,
      subgroupCounts: cleanCounts,
      freeCount: hasFreePool ? Math.max(0, freeCount) : 0,
      // mantém seleção manual anterior (usada quando o modo inteligente está desativado)
      manualSelection: workout?.manualSelection?.filter(id => exerciseIds.includes(id)) || [],
    });
  }

  return (
    <Overlay title={workout ? "Editar Treino" : "Novo Treino"} onClose={onCancel}>
      <div style={{ marginBottom: 12 }}>
        <Input placeholder="Título do treino (ex: Peito, Costas, Full Body)" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, cursor: "pointer" }}>
        <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} style={{ width: 18, height: 18, accentColor: colors.accent }} />
        <span style={{ fontSize: 12.5, color: colors.text }}>🔀 Sortear exercícios automaticamente (modo inteligente)</span>
      </label>

      {shuffle && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 6 }}>
            QUANTOS EXERCÍCIOS DE CADA SUBGRUPO
          </div>
          {!subgroupsInPool.length && (
            <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 8 }}>
              Selecione exercícios com subgrupo no pool abaixo para configurar.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {subgroupsInPool.map(sg => (
              <div key={sg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: colors.text, flex: 1 }}>{sg}</span>
                <Input type="number" min={0} value={countFor(sg)} onChange={e => setCountFor(sg, e.target.value)}
                  style={{ width: 64, padding: "7px 8px", fontSize: 12.5, textAlign: "center" }} />
              </div>
            ))}
          </div>
          {hasFreePool && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: colors.text, flex: 1 }}>Sem subgrupo (ex: Cardio)</span>
              <Input type="number" min={0} value={freeCount} onChange={e => setFreeCount(Math.max(0, Number(e.target.value) || 0))}
                style={{ width: 64, padding: "7px 8px", fontSize: 12.5, textAlign: "center" }} />
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 6, marginTop: 4 }}>
        SELECIONE OS EXERCÍCIOS DO POOL ({exerciseIds.length} selecionados)
      </div>
      <ExercisePicker selectedIds={exerciseIds} onChange={setExerciseIds} />

      <Button onClick={handleSave} style={{ width: "100%", marginTop: 16 }} disabled={!title.trim() || !exerciseIds.length}>
        SALVAR TREINO
      </Button>
    </Overlay>
  );
}
