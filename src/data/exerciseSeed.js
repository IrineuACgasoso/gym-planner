/**
 * Banco de exercícios padrão (global, somente leitura).
 * Cada exercício tem:
 *  - grupo: grupo muscular principal
 *  - subgrupos: array de subgrupos trabalhados (pode ser vazio, ex: cardio)
 * O usuário pode adicionar exercícios próprios em Firestore (users/{uid}/exercises).
 */

export const MUSCLE_GROUPS = [
  "Peitoral", "Costas", "Ombro", "Bíceps", "Tríceps", "Antebraço",
  "Quadríceps", "Posterior de Coxa", "Glúteos", "Panturrilha",
  "Abdômen", "Lombar", "Cardio", "Corpo Inteiro",
];

export const SUBGROUPS_BY_GROUP = {
  "Peitoral": ["Peitoral Superior", "Peitoral Médio", "Peitoral Inferior"],
  "Costas": ["Dorsal", "Trapézio", "Romboides", "Lombar"],
  "Ombro": ["Deltoide Anterior", "Deltoide Lateral", "Deltoide Posterior"],
  "Bíceps": ["Bíceps Braquial", "Braquial"],
  "Tríceps": ["Tríceps Cabeça Longa", "Tríceps Cabeça Lateral"],
  "Antebraço": ["Flexores", "Extensores"],
  "Quadríceps": ["Quadríceps"],
  "Posterior de Coxa": ["Posterior de Coxa"],
  "Glúteos": ["Glúteo Máximo", "Glúteo Médio"],
  "Panturrilha": ["Gastrocnêmio", "Sóleo"],
  "Abdômen": ["Reto Abdominal", "Oblíquos"],
  "Lombar": ["Lombar"],
  "Cardio": [],
  "Corpo Inteiro": [],
};

let i = 0;
const ex = (name, grupo, subgrupos = []) => ({ id: `seed_${++i}`, name, grupo, subgrupos, custom: false });

export const EXERCISE_SEED = [
  // Peitoral
  ex("Supino Reto c/ Barra", "Peitoral", ["Peitoral Médio", "Deltoide Anterior"]),
  ex("Supino Inclinado c/ Barra", "Peitoral", ["Peitoral Superior", "Deltoide Anterior"]),
  ex("Supino Reto c/ Halteres", "Peitoral", ["Peitoral Médio"]),
  ex("Supino Inclinado c/ Halteres", "Peitoral", ["Peitoral Superior"]),
  ex("Supino Declinado", "Peitoral", ["Peitoral Inferior"]),
  ex("Crucifixo Reto c/ Halteres", "Peitoral", ["Peitoral Médio"]),
  ex("Crucifixo Inclinado", "Peitoral", ["Peitoral Superior"]),
  ex("Crucifixo Declinado", "Peitoral", ["Peitoral Inferior"]),
  ex("Crucifixo na Polia (cross-over)", "Peitoral", ["Peitoral Inferior", "Deltoide Anterior"]),
  ex("Crossover Alto", "Peitoral", ["Peitoral Inferior"]),
  ex("Crossover Baixo", "Peitoral", ["Peitoral Superior"]),
  ex("Peck Deck (Voador)", "Peitoral", ["Peitoral Médio"]),
  ex("Flexão de Braço", "Peitoral", ["Peitoral Médio", "Tríceps Cabeça Lateral"]),
  ex("Pullover", "Peitoral", ["Peitoral Superior", "Dorsal"]),

  // Costas
  ex("Puxada Frontal (Pulley)", "Costas", ["Dorsal"]),
  ex("Puxada Neutra", "Costas", ["Dorsal"]),
  ex("Barra Fixa", "Costas", ["Dorsal", "Bíceps Braquial"]),
  ex("Remada Curvada c/ Barra", "Costas", ["Dorsal", "Romboides"]),
  ex("Remada Baixa (Cabo)", "Costas", ["Dorsal", "Romboides"]),
  ex("Remada Cavalinho", "Costas", ["Dorsal", "Trapézio"]),
  ex("Remada Unilateral c/ Halter", "Costas", ["Dorsal"]),
  ex("Remada Máquina", "Costas", ["Romboides", "Dorsal"]),
  ex("Encolhimento c/ Barra", "Costas", ["Trapézio"]),
  ex("Remada Alta", "Costas", ["Trapézio", "Deltoide Lateral"]),
  ex("Face Pull", "Costas", ["Deltoide Posterior", "Trapézio"]),
  ex("Hiperextensão Lombar", "Costas", ["Lombar"]),
  ex("Levantamento Terra", "Costas", ["Lombar", "Glúteo Máximo", "Posterior de Coxa"]),

  // Ombro
  ex("Desenvolvimento Militar c/ Barra", "Ombro", ["Deltoide Anterior"]),
  ex("Desenvolvimento c/ Halteres", "Ombro", ["Deltoide Anterior", "Deltoide Lateral"]),
  ex("Desenvolvimento Arnold", "Ombro", ["Deltoide Anterior", "Deltoide Lateral"]),
  ex("Elevação Frontal", "Ombro", ["Deltoide Anterior"]),
  ex("Elevação Lateral c/ Halteres", "Ombro", ["Deltoide Lateral"]),
  ex("Elevação Lateral no Cabo", "Ombro", ["Deltoide Lateral"]),
  ex("Crucifixo Invertido", "Ombro", ["Deltoide Posterior"]),
  ex("Crucifixo Invertido na Máquina", "Ombro", ["Deltoide Posterior"]),
  ex("Remada Alta c/ Halteres", "Ombro", ["Deltoide Lateral", "Trapézio"]),

  // Bíceps
  ex("Rosca Direta c/ Barra", "Bíceps", ["Bíceps Braquial"]),
  ex("Rosca Alternada c/ Halteres", "Bíceps", ["Bíceps Braquial"]),
  ex("Rosca Martelo", "Bíceps", ["Braquial", "Antebraço"]),
  ex("Rosca Scott", "Bíceps", ["Bíceps Braquial"]),
  ex("Rosca Concentrada", "Bíceps", ["Bíceps Braquial"]),
  ex("Rosca no Cabo", "Bíceps", ["Bíceps Braquial"]),

  // Tríceps
  ex("Tríceps Testa c/ Barra", "Tríceps", ["Tríceps Cabeça Longa"]),
  ex("Tríceps na Corda (Pulley)", "Tríceps", ["Tríceps Cabeça Lateral"]),
  ex("Tríceps Francês", "Tríceps", ["Tríceps Cabeça Longa"]),
  ex("Tríceps Coice (Kickback)", "Tríceps", ["Tríceps Cabeça Lateral"]),
  ex("Mergulho no Banco (Dips)", "Tríceps", ["Tríceps Cabeça Longa", "Peitoral Inferior"]),
  ex("Supino Fechado", "Tríceps", ["Tríceps Cabeça Longa", "Peitoral Médio"]),

  // Antebraço
  ex("Rosca de Punho", "Antebraço", ["Flexores"]),
  ex("Rosca de Punho Inversa", "Antebraço", ["Extensores"]),

  // Pernas
  ex("Agachamento Livre", "Quadríceps", ["Quadríceps"]),
  ex("Agachamento Búlgaro", "Quadríceps", ["Quadríceps", "Glúteo Máximo"]),
  ex("Leg Press 45°", "Quadríceps", ["Quadríceps"]),
  ex("Cadeira Extensora", "Quadríceps", ["Quadríceps"]),
  ex("Afundo (Passada)", "Quadríceps", ["Quadríceps", "Glúteo Máximo"]),
  ex("Hack Machine", "Quadríceps", ["Quadríceps"]),
  ex("Mesa Flexora", "Posterior de Coxa", ["Posterior de Coxa"]),
  ex("Stiff c/ Barra", "Posterior de Coxa", ["Posterior de Coxa", "Glúteo Máximo"]),
  ex("Cadeira Flexora", "Posterior de Coxa", ["Posterior de Coxa"]),
  ex("Elevação Pélvica (Hip Thrust)", "Glúteos", ["Glúteo Máximo"]),
  ex("Abdução de Quadril na Máquina", "Glúteos", ["Glúteo Médio"]),
  ex("Coice na Polia", "Glúteos", ["Glúteo Máximo"]),
  ex("Panturrilha em Pé", "Panturrilha", ["Gastrocnêmio"]),
  ex("Panturrilha Sentado", "Panturrilha", ["Sóleo"]),
  ex("Panturrilha no Leg Press", "Panturrilha", ["Gastrocnêmio"]),

  // Abdômen
  ex("Abdominal Supra (Solo)", "Abdômen", ["Reto Abdominal"]),
  ex("Abdominal na Polia (Crunch)", "Abdômen", ["Reto Abdominal"]),
  ex("Elevação de Pernas", "Abdômen", ["Reto Abdominal"]),
  ex("Prancha Isométrica", "Abdômen", ["Reto Abdominal", "Oblíquos"]),
  ex("Abdominal Oblíquo", "Abdômen", ["Oblíquos"]),

  // Cardio (sem subgrupo obrigatório)
  ex("Corrida (Esteira/Rua)", "Cardio", []),
  ex("Bicicleta Ergométrica", "Cardio", []),
  ex("Remo Ergométrico", "Cardio", []),
  ex("Elíptico", "Cardio", []),
  ex("Pular Corda", "Cardio", []),
  ex("HIIT", "Cardio", []),

  // Corpo inteiro
  ex("Burpee", "Corpo Inteiro", []),
  ex("Kettlebell Swing", "Corpo Inteiro", []),
  ex("Clean and Press", "Corpo Inteiro", []),
];
