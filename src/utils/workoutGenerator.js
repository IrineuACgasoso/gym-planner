/**
 * Retorna a lista de subgrupos presentes num pool de exercícios
 * (usado para configurar quantos exercícios de cada subgrupo o
 * treino inteligente deve sortear).
 */
export function getSubgroupsInPool(exercisePool) {
  const set = new Set();
  exercisePool.forEach(e => e.subgrupos?.forEach(sg => set.add(sg)));
  return [...set];
}

/**
 * Embaralha os exercícios de um treino de forma "inteligente".
 *
 * Dois modos:
 *  - subgroupCounts definido: sorteia exatamente `subgroupCounts[subgrupo]`
 *    exercícios distintos de cada subgrupo presente no pool (o usuário define
 *    quantos quer de cada subgrupo). Exercícios sem subgrupo (cardio, etc.)
 *    entram via `freeCount`.
 *  - subgroupCounts ausente: modo legado, round-robin cobrindo subgrupos até
 *    atingir `count` exercícios no total.
 *
 * @param {Array} exercisePool - exercícios disponíveis: [{id, name, grupo, subgrupos}]
 * @param {Object} options - { subgroupCounts?: {[subgrupo]: number}, freeCount?: number, count?: number, excludeIds?: string[] }
 * @returns {Array} exercícios sorteados
 */
export function generateSmartWorkout(exercisePool, options = {}) {
  if (!exercisePool?.length) return [];
  const excludeIds = new Set(options.excludeIds || []);
  const pool = exercisePool.filter(e => !excludeIds.has(e.id));

  const withSub = pool.filter(e => e.subgrupos?.length);
  const freePool = pool.filter(e => !e.subgrupos?.length);

  const bySubgroup = {};
  withSub.forEach(e => {
    e.subgrupos.forEach(sg => {
      if (!bySubgroup[sg]) bySubgroup[sg] = [];
      bySubgroup[sg].push(e);
    });
  });

  const picked = [];
  const pickedIds = new Set();

  if (options.subgroupCounts) {
    // ---- Modo: quantidade definida por subgrupo ----
    Object.entries(options.subgroupCounts).forEach(([sg, want]) => {
      const candidates = (bySubgroup[sg] || []).filter(e => !pickedIds.has(e.id));
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      let n = Math.max(0, want);
      for (const e of shuffled) {
        if (n <= 0) break;
        picked.push(e);
        pickedIds.add(e.id);
        n--;
      }
    });

    let freeCount = Math.max(0, options.freeCount || 0);
    const shuffledFree = [...freePool].sort(() => Math.random() - 0.5);
    for (const e of shuffledFree) {
      if (freeCount <= 0) break;
      if (pickedIds.has(e.id)) continue;
      picked.push(e);
      pickedIds.add(e.id);
      freeCount--;
    }
    return picked;
  }

  // ---- Modo legado: round-robin até `count` ----
  const subgroupKeys = Object.keys(bySubgroup);
  const usedCountBySubgroup = {};
  subgroupKeys.forEach(k => (usedCountBySubgroup[k] = 0));
  let remaining = Math.min(options.count || pool.length, pool.length);

  let guard = 0;
  while (remaining > 0 && subgroupKeys.length && guard < 500) {
    guard++;
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
    if (!advanced) break;
  }

  const leftoverTagged = withSub.filter(e => !pickedIds.has(e.id));
  const fillPools = [freePool, leftoverTagged];
  for (const fp of fillPools) {
    if (remaining <= 0) break;
    const shuffled = [...fp].sort(() => Math.random() - 0.5);
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

/**
 * Sorteia um único exercício substituto para reroll individual.
 * Prioriza exercícios que compartilhem algum subgrupo com o exercício atual;
 * se não houver candidato, cai para o pool livre (ex: cardio) ou qualquer
 * exercício do pool ainda não usado no treino.
 *
 * @param {Array} exercisePool - pool completo do treino (todos os exerciseIds)
 * @param {Object} currentExercise - exercício a ser substituído {id, subgrupos, grupo}
 * @param {string[]} usedIds - ids já presentes no treino em andamento (não podem repetir)
 * @returns {Object|null} exercício sorteado, ou null se não houver candidato
 */
export function rerollSingleExercise(exercisePool, currentExercise, usedIds = []) {
  const used = new Set(usedIds.filter(id => id !== currentExercise.exId && id !== currentExercise.id));
  const candidatesSameSubgroup = exercisePool.filter(e =>
    !used.has(e.id) &&
    e.id !== currentExercise.exId &&
    e.subgrupos?.some(sg => currentExercise.subgrupos?.includes(sg))
  );
  const pickFrom = candidatesSameSubgroup.length
    ? candidatesSameSubgroup
    : exercisePool.filter(e => !used.has(e.id) && e.id !== currentExercise.exId && e.grupo === currentExercise.grupo);
  const finalPool = pickFrom.length
    ? pickFrom
    : exercisePool.filter(e => !used.has(e.id) && e.id !== currentExercise.exId);
  if (!finalPool.length) return null;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}
