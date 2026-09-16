// Paleta "Deep Navy / Baby Blue" — futurista, confortável para uso noturno.
export const colors = {
  // Fundos (do mais escuro ao mais elevado)
  bg: "#040B14",          // fundo principal, quase preto-azulado
  bgElevated: "#081221",  // cards, headers
  bgElevated2: "#0C1B30", // cards elevados / hover
  bgInput: "#0A1526",

  border: "#132238",
  borderSoft: "#0D1A2C",

  // Acentos — do azul bebê (claro) ao azul profundo
  babyBlue: "#7FD4FF",
  accent: "#3FA9F5",       // ação primária
  accentSoft: "#1E6FB8",
  accentDeep: "#0B3D91",
  cyan: "#5EEBFF",         // destaque secundário / glow

  // Texto
  text: "#E7F3FC",
  textMuted: "#7B93AC",
  textFaint: "#3E5670",

  // Estados
  success: "#3FE0A5",
  danger: "#FF5D6C",
  warning: "#FFC24B",

  // Grupos musculares (para tags visuais)
  tagBg: "#0E2038",
  tagBorder: "#1B3A5C",
};

export const font = "'Rajdhani', sans-serif";

export const shadows = {
  glow: "0 0 24px rgba(63,169,245,0.25)",
  card: "0 4px 18px rgba(0,0,0,0.35)",
};

export const gradients = {
  primary: "linear-gradient(135deg, #7FD4FF 0%, #3FA9F5 45%, #0B3D91 100%)",
  header: "linear-gradient(180deg, #081221 0%, #040B14 100%)",
  progress: "linear-gradient(90deg, #3FA9F5, #5EEBFF)",
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };
