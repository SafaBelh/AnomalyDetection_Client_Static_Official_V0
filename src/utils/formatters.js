import { C, CC } from "@/constants/colors";

export const supColor = (id, top5) => {
  const i = (top5 || []).indexOf(id);
  return i >= 0 ? CC[i % CC.length] : CC[4];
};

export const fmtK = (v) =>
  v >= 1e6 ? `€${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `€${(v / 1000).toFixed(0)}K` : `€${v}`;

export const fmtE = (v) => `€${Number(v).toLocaleString("fr-FR")}`;

export const sevColor = (s) =>
  s === "critical" || s === "CRITIQUE"
    ? C.red
    : s === "warning" || s === "ALERTE"
      ? C.warning
      : C.success;
