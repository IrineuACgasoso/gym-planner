/**
 * Embaralha os exercícios de um treino de forma "inteligente":
 * garante que, sempre que o exercício sorteado tiver subgrupos definidos,
 * cada subgrupo presente no pool do treino seja contemplado pelo menos uma vez
 * antes de repetir subgrupos já usados (round-robin ponderado).
 *
 * Exercícios sem subgrupo (ex: cardio) entram em um pool "livre" e são
 * sorteados normalmente, sem exigência de cobertura.
 *
 * @param {Array} exercisePool - exercícios disponíveis para o treino: [{id, name, grupo, subgrupos}]
 * @param {number} count - quantidade de exercícios desejada no treino gerado
 * @returns {Array} lista de exercícios sorteados (mesmo formato de exercisePool)
 */
export function generateSmartWorkout(exercisePool, count) {
  if (!exercisePool?.length) return [];

  const withSub = exercisePool.filter(e => e.subgrupos?.length);
  const freePool = exercisePool.filter(e => !e.subgrupos?.length);

  // Agrupa exercícios com subgrupo por subgrupo (um exercício pode aparecer em vários grupos)
  const bySubgroup = {};
  withSub.forEach(e => {
    e.subgrupos.forEach(sg => {
      if (!bySubgroup[sg]) bySubgroup[sg] = [];
      bySubgroup[sg].push(e);
    });
  });
  const subgroupKeys = Object.keys(bySubgroup);

  const picked = [];
  const pickedIds = new Set();
  const usedCountBySubgroup = {};
  subgroupKeys.forEach(k => (usedCountBySubgroup[k] = 0));

  let remaining = Math.min(count, exercisePool.length);

  // Fase 1: round-robin — sempre escolhe do subgrupo menos representado até esgotar
  let guard = 0;
  while (remaining > 0 && subgroupKeys.length && guard < 500) {
    guard++;
    // ordena subgrupos por quantos já foram usados (prioriza os menos usados)
    const sorted = [...subgroupKeys].sort((a, b) => usedCountBySubgroup[a] - usedCountBySubgroup[b]);
    let advanced = false;
    for (const sg of sorted) {
      const candidates = bySubgroup[sg].filter(e => !pickedIds.has(e.id));
      if (!candidates.length) continue;
      const choice = candidates[Math.floor(Math.random() * candidates.length)];
      picked.push(choice);
      pickedIds.add(choice.id);
      choice.subgrupos.forEach(s => { if (usedCountBySubgroup[s] !== undefined) usedCountBySubgroup[s]++; });
      remaining--;
      advanced = true;
      break;
    }
    if (!advanced) break; // esgotou todos os subgrupos
  }

  // Fase 2: completa com exercícios livres (cardio/sem subgrupo) e depois com o que sobrar
  const leftoverTagged = withSub.filter(e => !pickedIds.has(e.id));
  const fillPools = [freePool, leftoverTagged];
  for (const pool of fillPools) {
    if (remaining <= 0) break;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    for (const e of shuffled) {
      if (remaining <= 0) break;
      if (pickedIds.has(e.id)) continue;
      picked.push(e);
      pickedIds.add(e.id);
      remaining--;
    }
  }

  return picked;
}
