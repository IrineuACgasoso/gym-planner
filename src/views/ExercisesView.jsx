import { useMemo, useState } from "react";
import { useData } from "../contexts/useData";
import { colors, radius } from "../styles/theme";
import { Card, Tag, Button, Input, Select, Overlay, EmptyState } from "../components/ui/Primitives";
import TopBar from "../components/TopBar";
import { MUSCLE_GROUPS, SUBGROUPS_BY_GROUP } from "../data/exerciseSeed";

export default function ExercisesView({ setView }) {
  const { allExercises, addExercise, updateExercise, removeExercise } = useData();
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => allExercises.filter(e => {
    if (groupFilter !== "Todos" && e.grupo !== groupFilter) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allExercises, search, groupFilter]);

  return (
    <div>
      <TopBar
        title="BANCO DE EXERCÍCIOS"
        onBack={() => setView("home")}
        right={<Button onClick={() => setShowNew(true)} style={{ padding: "8px 14px", fontSize: 12 }}>+ NOVO</Button>}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1.4 }} />
        <Select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} style={{ flex: 1 }}>
          <option>Todos</option>
          {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
        </Select>
      </div>

      {!filtered.length && <EmptyState icon="🔍" title="Nenhum exercício encontrado" />}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(e => (
          <Card key={e.id} style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{e.name}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                  <Tag tone="muted">{e.grupo}</Tag>
                  {e.subgrupos?.map(s => <Tag key={s}>{s}</Tag>)}
                  {!e.custom && <Tag tone="muted" style={{ opacity: 0.6 }}>PADRÃO</Tag>}
                </div>
              </div>
              {e.custom && (
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="ghost" onClick={() => setEditing(e)} style={{ padding: "6px 9px", fontSize: 11 }}>✎</Button>
                  <Button variant="danger" onClick={() => { if (confirm(`Excluir "${e.name}"?`)) removeExercise(e.id); }} style={{ padding: "6px 9px", fontSize: 11 }}>🗑</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {(showNew || editing) && (
        <ExerciseForm
          exercise={editing}
          onClose={() => { setShowNew(false); setEditing(null); }}
          onSave={async data => {
            if (editing) await updateExercise({ ...editing, ...data });
            else await addExercise(data);
            setShowNew(false); setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ExerciseForm({ exercise, onClose, onSave }) {
  const [name, setName] = useState(exercise?.name || "");
  const [grupo, setGrupo] = useState(exercise?.grupo || MUSCLE_GROUPS[0]);
  const [subgrupos, setSubgrupos] = useState(exercise?.subgrupos || []);

  const availableSubgroups = SUBGROUPS_BY_GROUP[grupo] || [];

  function toggleSub(s) {
    setSubgrupos(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), grupo, subgrupos });
  }

  return (
    <Overlay title={exercise ? "Editar Exercício" : "Novo Exercício"} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 4 }}>Nome</div>
        <Input placeholder="Ex: Crucifixo na Polia" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 4 }}>Grupo Muscular</div>
        <Select value={grupo} onChange={e => { setGrupo(e.target.value); setSubgrupos([]); }}>
          {MUSCLE_GROUPS.map(g => <option key={g}>{g}</option>)}
        </Select>
      </div>

      {!!availableSubgroups.length && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, color: colors.textFaint, marginBottom: 6 }}>
            Subgrupo(s) — deixe vazio se não for necessário garantir cobertura
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {availableSubgroups.map(s => {
              const active = subgrupos.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleSub(s)} style={{
                  background: active ? colors.tagBg : colors.bgInput,
                  border: `1px solid ${active ? colors.accent : colors.border}`,
                  color: active ? colors.babyBlue : colors.textMuted,
                  padding: "6px 11px", borderRadius: radius.pill, fontSize: 11.5, cursor: "pointer",
                }}>{s}</button>
              );
            })}
          </div>
        </div>
      )}

      <Button onClick={handleSave} style={{ width: "100%", marginTop: 16 }} disabled={!name.trim()}>SALVAR</Button>
    </Overlay>
  );
}
