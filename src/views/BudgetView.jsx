import { useState, useMemo, useCallback } from "react";
import { INVOICES_TABLE, COMMANDES_FRONTEND_TABLE, COMMAND_BUDGET_SERIES_TABLE, HISTORICAL_INVOICES_TABLE } from "@/store/staticData";
import { useAuth, visibleTenants } from "@/store/db";
import { BarChart3, Brain, Flag, Lightbulb, Search, TriangleAlert, Waves, Globe, TrendingUp, TrendingDown, AlertTriangle, Building2, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   COLORS
───────────────────────────────────────────────────────────── */
const C = {
  red: "#D94F3D",
  redMid: "#E8736A",
  redLight: "#F2A49F",
  redPale: "#FDF1F0",
  grey900: "#18191C",
  grey800: "#2D3038",
  grey700: "#3D4149",
  grey600: "#525761",
  grey500: "#6B7280",
  grey400: "#9CA3AF",
  grey300: "#C4C7CC",
  grey200: "#E5E7EB",
  grey100: "#F3F4F6",
  grey50: "#FAFAFA",
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.65)",
  glassBd: "rgba(255,255,255,0.88)",
  success: "#22C55E",
  warning: "#F59E0B",
  info: "#3B82F6",
  purple: "#8B5CF6",
  teal: "#14B8A6",
  pink: "#EC4899",
  orange: "#F97316",
  bg: "#F0EDE8",
};

/* ─────────────────────────────────────────────────────────────
   FAKE INVOICES DATA — sourced from staticData.js
───────────────────────────────────────────────────────────── */
const FAKE_INVOICES = INVOICES_TABLE;

/* ─────────────────────────────────────────────────────────────
   FAKE COMMANDES DATA — sourced from staticData.js
───────────────────────────────────────────────────────────── */
const FAKE_COMMANDES = COMMANDES_FRONTEND_TABLE;

/* ─────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
───────────────────────────────────────────────────────────── */
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const monthName = (i) => MONTH_NAMES[i] || String(i + 1);
const monthShort = (i) => (MONTH_NAMES[i]?.slice(0, 3)) || String(i + 1);

const fmtM = (v) =>
  v == null ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(v));

const fmtK = (v) => {
  if (v == null) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M €`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K €`;
  return `${sign}${Math.round(abs)} €`;
};

const fmtDelta = (v, pct) => {
  if (v == null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${fmtK(v)} (${sign}${pct?.toFixed(1)}%)`;
};

const fmtComparison = ({ diff, pct, zeroLabel, ratio }) => {
  if (diff == null) return "—";
  if (Math.abs(diff) < 0.5) return ratio != null ? `${zeroLabel} · ${ratio.toFixed(0)}%` : zeroLabel;
  return fmtDelta(diff, pct);
};

const fmtDate = (date) => date
  ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date)
  : "—";

const SPEC_INVOICE_BUDGETS = {
  "EAU_SAISON — Eau potable": 1800,
  "FOURNITURES_BUREAU — Fournitures scolaires": 1250,
  "TELECOM_FIBRE — Fibre Optique": 3600,
  "TELECOM_FIBRE — Internet ADSL": 600,
};

const seriesNameForInvoice = (inv) => `${inv.supplier || inv.supplierName} — ${inv.label || "Sans label"}`;
const CURRENT_EXERCISE_YEAR = new Date().getFullYear();
const MOCK_DATA_YEAR = CURRENT_EXERCISE_YEAR;
const CURRENT_MONTH_IDX = new Date().getMonth();

function getStatus(real, expected, isFuture) {
  if (isFuture) return "upcoming";
  if (real > expected * 1.05) return "critical";
  if (real < expected * 0.90) return "under";
  return "normal";
}

const STATUS_META = {
  normal: { label: "Normal", color: C.success, bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.30)" },
  critical: { label: "Dépassement", color: C.red, bg: "rgba(217,79,61,.10)", border: "rgba(217,79,61,.30)" },
  under: { label: "Sous-conso", color: C.info, bg: "rgba(59,130,246,.10)", border: "rgba(59,130,246,.30)" },
  upcoming: { label: "À venir", color: C.grey400, bg: "rgba(0,0,0,.04)", border: "rgba(0,0,0,.12)" },
  in_progress: { label: "En cours", color: C.warning, bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.30)" },
};

/* ─────────────────────────────────────────────────────────────
   SEASONAL RISK ENGINE
───────────────────────────────────────────────────────────── */
function computeSeasonalForecast({ monthlyHistorical, annualBudget }) {
  const avgByMonthIdx = Array.from({ length: 12 }, () => ({ sum: 0, cnt: 0 }));
  Object.entries(monthlyHistorical).forEach(([key, val]) => {
    const mIdx = parseInt(key.slice(5)) - 1;
    if (mIdx >= 0 && mIdx < 12 && val > 0) {
      avgByMonthIdx[mIdx].sum += val;
      avgByMonthIdx[mIdx].cnt += 1;
    }
  });
  const rawAvg = avgByMonthIdx.map(({ sum, cnt }) => cnt > 0 ? sum / cnt : null);
  const rawSum = rawAvg.reduce((a, v) => a + (v ?? 0), 0);
  const scalingFactor = 1;
  const flat = annualBudget / 12;
  return rawAvg.map((avg, mIdx) => ({
    monthIdx: mIdx,
    name: monthShort(mIdx),
    nameFull: monthName(mIdx),
    expected: avg != null ? Math.round(avg) : Math.round(flat),
    flat: Math.round(flat),
    scalingFactor,
    rawAvg: avg,
  }));
}

function computeSeasonalRisks(seriesStats, allInvoices, nowMonth) {
  return seriesStats
    .filter(s => s.projectedYearTotal > s.annualBudget)
    .map(s => {
      const monthly = s.historicalPattern || Array.from({ length: 12 }, () => 0);
      const futureMonthsAvg = monthly.slice(nowMonth + 1).reduce((a, b) => a + b, 0);
      const totalHistoricalAvg = monthly.reduce((a, b) => a + b, 0) || 1;
      const futureFraction = futureMonthsAvg / totalHistoricalAvg;
      const remaining = s.annualBudget - s.currentYearTotal;
      const pct = s.annualBudget > 0 ? Math.round((s.currentYearTotal / s.annualBudget) * 100) : 0;
      const peakFutureIdx = monthly.reduce((best, v, i) => i > nowMonth && v > (monthly[best] ?? 0) ? i : best, nowMonth + 1);
      return { ...s, futureFraction, futureMonthsAvg, remaining, pct, peakMonth: monthName(peakFutureIdx) };
    });
}

/* ─────────────────────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────────────────────── */
function SectionNum({ n, color }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 8,
      background: color || `linear-gradient(135deg,${C.red},${C.red}dd)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0,
      boxShadow: color ? `0 4px 12px ${color}48` : `0 4px 12px ${C.red}48`,
      letterSpacing: "-.5px", fontFamily: "'JetBrains Mono',monospace",
    }}>{n}</div>
  );
}

function SectionLabel({ n, children, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      {n !== "" && <SectionNum n={n} color={color} />}
      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: C.grey400 }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.grey200},transparent)` }} />
    </div>
  );
}

function StatusPill({ status }) {
  const m = STATUS_META[status] || STATUS_META.normal;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: 20, fontSize: 10, fontWeight: 700, color: m.color,
      background: m.bg, border: `1px solid ${m.border}`,
      fontFamily: "'JetBrains Mono',monospace",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color, display: "inline-block" }} />
      {m.label}
    </span>
  );
}

function MiniBar({ pct, exceeded }) {
  const color = exceeded ? C.red : pct > 0.95 ? C.warning : C.success;
  return (
    <div style={{ width: 90, height: 6, borderRadius: 6, background: "rgba(0,0,0,.06)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(pct * 100, 100)}%`, height: "100%", borderRadius: 6, background: color, transition: "width .4s ease" }} />
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.72)",
      backdropFilter: "blur(18px) saturate(180%)",
      border: "1px solid rgba(255,255,255,.85)",
      borderRadius: 18,
      boxShadow: "0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function KpiTile({ label, value, sub, accent, delay = 0 }) {
  return (
    <div style={{
      flex: 1, minWidth: 148,
      background: "rgba(255,255,255,.72)",
      backdropFilter: "blur(18px) saturate(180%)",
      border: "1px solid rgba(255,255,255,.85)",
      borderRadius: 18,
      boxShadow: "0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)",
      padding: "20px 22px",
      display: "flex", flexDirection: "column", gap: 8,
      animation: `fadeSlideUp .45s cubic-bezier(.22,1,.36,1) ${delay}ms both`,
    }}>
      <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.grey400 }}>{label}</span>
      <div style={{
        fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 800,
        color: accent || C.grey900, letterSpacing: "-0.8px", lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.grey400, lineHeight: 1.3 }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG CHARTS
───────────────────────────────────────────────────────────── */
function MonthlyBarsChart({ months, showExpected = true, height = 180 }) {
  const maxVal = useMemo(() => {
    const vals = months.flatMap(m => [
      m.realAmount ?? 0,
      showExpected ? (m.expectedAmount ?? 0) : 0,
    ]);
    return Math.max(...vals, 100) * 1.12;
  }, [months, showExpected]);

  const W = 680, H = height;
  const PL = 54, PR = 16, PT = 14, PB = 28;
  const CW = W - PL - PR, CH = H - PT - PB;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="bvGradExp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity=".85" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity=".85" />
        </linearGradient>
        <linearGradient id="bvGradNormal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity=".9" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="bvGradCrit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity=".9" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="bvGradUnder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity=".9" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id="bvGradProgress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity=".9" />
          <stop offset="100%" stopColor="#d97706" stopOpacity=".9" />
        </linearGradient>
      </defs>

      {[0, .25, .5, .75, 1].map((r, i) => {
        const y = PT + CH * r;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke={C.grey200} strokeDasharray="3 3" />
            <text x={PL - 8} y={y + 4} fill={C.grey400} fontSize="9" textAnchor="end" fontFamily="'JetBrains Mono',monospace">
              {fmtK(Math.round(maxVal * (1 - r)))}
            </text>
          </g>
        );
      })}

      {months.map((m, idx) => {
        const xCenter = PL + (idx * CW / 12) + (CW / 24);
        const realVal = m.realAmount ?? 0;
        const expVal = m.expectedAmount ?? 0;
        const status = m.status;
        const isFuture = m.isFuture || status === "upcoming";
        const expH = maxVal > 0 ? (expVal / maxVal) * CH : 0;
        const expY = PT + CH - expH;
        const realH = maxVal > 0 ? (realVal / maxVal) * CH : 0;
        const realY = PT + CH - realH;
        let realFill = "url(#bvGradNormal)";
        if (status === "critical") realFill = "url(#bvGradCrit)";
        else if (status === "under") realFill = "url(#bvGradUnder)";
        else if (status === "in_progress") realFill = "url(#bvGradProgress)";
        else if (isFuture) realFill = "rgba(0,0,0,.06)";
        const monthLabel = m.monthName ? m.monthName.slice(0, 3) : monthShort(m.monthIdx ?? idx);
        return (
          <g key={idx}>
            {showExpected && expVal > 0 && (
              <rect x={xCenter - 9} y={expY} width="8" height={expH} rx="2" fill="url(#bvGradExp)">
                <title>{`Attendu ${monthLabel}: ${fmtM(expVal)}`}</title>
              </rect>
            )}
            {(realVal > 0 || !isFuture) && (
              <rect x={xCenter + 1} y={realY} width="8" height={Math.max(realH, 2)} rx="2" fill={realFill} opacity={isFuture ? .35 : 1}>
                <title>{`Réel ${monthLabel}: ${fmtM(realVal)} (${status || "—"})`}</title>
              </rect>
            )}
            <text x={xCenter} y={H - 8} fill={C.grey400} fontSize="9" textAnchor="middle">{monthLabel}</text>
          </g>
        );
      })}
      <line x1={PL} y1={PT + CH} x2={W - PR} y2={PT + CH} stroke={C.grey200} />
    </svg>
  );
}

function TrendAreaChart({ trendData }) {
  if (!trendData?.length) return null;
  const W = 680, H = 140, PL = 44, PR = 16, PT = 10, PB = 28;
  const CW = W - PL - PR, CH = H - PT - PB;
  const maxVal = Math.max(...trendData.flatMap(d => [d.real, d.budget]), 100) * 1.1;
  const xPos = (i) => PL + (i / (trendData.length - 1)) * CW;
  const yPos = (v) => PT + CH - (v / maxVal) * CH;
  const realPath = trendData.map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)} ${yPos(d.real).toFixed(1)}`).join(" ");
  const budgPath = trendData.map((d, i) => `${i === 0 ? "M" : "L"}${xPos(i).toFixed(1)} ${yPos(d.budget).toFixed(1)}`).join(" ");
  const realFill = `${realPath} L${xPos(trendData.length - 1).toFixed(1)} ${PT + CH} L${PL} ${PT + CH} Z`;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="bvTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={C.red} stopOpacity=".18" />
          <stop offset="95%" stopColor={C.red} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, .5, 1].map((r, i) => (
        <line key={i} x1={PL} y1={PT + CH * r} x2={W - PR} y2={PT + CH * r} stroke={C.grey200} strokeDasharray="3 3" />
      ))}
      <path d={realFill} fill="url(#bvTrendFill)" />
      <path d={budgPath} stroke={C.grey300} strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      <path d={realPath} stroke={C.red} strokeWidth="2.5" fill="none" />
      {trendData.map((d, i) => (
        <text key={i} x={xPos(i)} y={H - 8} fill={C.grey400} fontSize="9" textAnchor="middle">{d.m}</text>
      ))}
      <line x1={PL} y1={PT + CH} x2={W - PR} y2={PT + CH} stroke={C.grey200} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SEASONAL RISK BANNER
───────────────────────────────────────────────────────────── */
function SeasonalRiskBanner({ risks }) {
  if (!risks || risks.length === 0) return null;
  return (
    <div style={{
      background: "rgba(245,158,11,.06)",
      border: "1px solid rgba(245,158,11,.28)",
      borderRadius: 16,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Brain size={16} color={C.warning} />
        <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: C.warning }}>
          Analyse saisonnière — Risques identifiés pour le reste de l'année
        </span>
      </div>
      {risks.map((r, i) => (
        <div key={i} style={{
          background: "rgba(245,158,11,.06)",
          border: "1px solid rgba(245,158,11,.15)",
          borderRadius: 10,
          padding: "12px 16px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 800,
            color: C.warning, background: "rgba(245,158,11,.12)",
            padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", flexShrink: 0,
          }}>{r.name}</span>
          <div style={{ fontSize: 11, color: C.grey600, lineHeight: 1.6 }}>
            <strong style={{ color: C.grey800 }}>Attention :</strong> seulement{" "}
            <strong style={{ color: C.warning }}>{r.pct}%</strong> du budget consommé à ce jour,
            mais <strong style={{ color: C.grey800 }}>{Math.round(r.futureFraction * 100)}%</strong> des dépenses historiques
            tombent après ce mois.
            Budget restant <strong style={{ color: r.remaining < r.futureMonthsAvg ? C.red : C.success }}>{fmtM(r.remaining)}</strong> —
            projection saisonnière restante <strong style={{ color: C.grey700 }}>{fmtM(r.futureMonthsAvg)}</strong>.
            {r.remaining < r.futureMonthsAvg && (
              <span style={{ color: C.red }}> Risque de dépassement — prévoir notamment {r.peakMonth}.</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL ADMIN DASHBOARD — cross-tenant overview
───────────────────────────────────────────────────────────── */
function computeTenantStats(tenantId, allInvoices) {
  const nowMonth = CURRENT_MONTH_IDX;
  const dataYear = MOCK_DATA_YEAR;

  const invoices = allInvoices.filter(
    inv => inv.tenantId === tenantId || inv.tenant_id === tenantId
  );

  const seriesMap = {};
  invoices.forEach(inv => {
    const s = seriesNameForInvoice(inv);
    if (!seriesMap[s]) seriesMap[s] = { name: s, monthly: {} };
    const m = inv.date?.slice(0, 7);
    if (m) seriesMap[s].monthly[m] = (seriesMap[s].monthly[m] || 0) + inv.amount;
  });

  HISTORICAL_INVOICES_TABLE.forEach(inv => {
    const s = seriesNameForInvoice(inv);
    if (!seriesMap[s]) seriesMap[s] = { name: s, monthly: {} };
  });

  let totalRealized = 0;
  let totalBudget = 0;
  let exceededCount = 0;
  let alertCount = 0;

  const seriesList = Object.values(seriesMap).map(s => {
    const currentYearTotal = Object.entries(s.monthly)
      .filter(([k]) => k.startsWith(String(dataYear)) && Number(k.slice(5, 7)) <= nowMonth + 1)
      .reduce((a, [, v]) => a + v, 0);

    const historicalByMonth = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
    HISTORICAL_INVOICES_TABLE.forEach(inv => {
      if (seriesNameForInvoice(inv) !== s.name || !inv.date) return;
      const idx = Number(inv.date.slice(5, 7)) - 1;
      historicalByMonth[idx].sum += inv.amount;
      historicalByMonth[idx].count += 1;
    });
    const historicalPattern = historicalByMonth.map(({ sum, count }) => count ? sum / count : 0);
    const projectedYearTotal = currentYearTotal + historicalPattern.slice(nowMonth + 1).reduce((a, v) => a + v, 0);
    const autoAnnualBudget = SPEC_INVOICE_BUDGETS[s.name] ?? currentYearTotal;

    totalRealized += currentYearTotal;
    totalBudget += autoAnnualBudget;
    if (projectedYearTotal > autoAnnualBudget) exceededCount++;

    return { name: s.name, currentYearTotal, autoAnnualBudget, projectedYearTotal };
  });

  // Top overrun series for this tenant
  const overrunSeries = seriesList
    .filter(s => s.projectedYearTotal > s.autoAnnualBudget)
    .sort((a, b) => (b.projectedYearTotal - b.autoAnnualBudget) - (a.projectedYearTotal - a.autoAnnualBudget))
    .slice(0, 3);

  const consumptionRate = totalBudget > 0 ? (totalRealized / totalBudget) * 100 : 0;
  const ecart = totalRealized - totalBudget;

  return { totalRealized, totalBudget, consumptionRate, ecart, exceededCount, overrunSeries, seriesCount: seriesList.length };
}

function GlobalAdminDashboard({ tenants, allInvoices, onSelectTenant }) {
  const tenantStats = useMemo(() =>
    tenants.map(t => ({ tenant: t, stats: computeTenantStats(t.id, allInvoices) })),
    [tenants, allInvoices]
  );

  const globalRealized = tenantStats.reduce((s, t) => s + t.stats.totalRealized, 0);
  const globalBudget = tenantStats.reduce((s, t) => s + t.stats.totalBudget, 0);
  const globalRate = globalBudget > 0 ? (globalRealized / globalBudget) * 100 : 0;
  const globalEcart = globalRealized - globalBudget;
  const totalAlerts = tenantStats.reduce((s, t) => s + t.stats.exceededCount, 0);
  const tenantsOverBudget = tenantStats.filter(t => t.stats.ecart > 0).length;

  // All overrun series across all tenants for the global alert table
  const allOverruns = useMemo(() => {
    const rows = [];
    tenantStats.forEach(({ tenant, stats }) => {
      stats.overrunSeries.forEach(s => {
        rows.push({
          tenantId: tenant.id,
          tenantName: tenant.name,
          seriesName: s.name,
          overrun: s.projectedYearTotal - s.autoAnnualBudget,
          pct: s.autoAnnualBudget > 0 ? (s.projectedYearTotal / s.autoAnnualBudget) * 100 : 0,
        });
      });
    });
    return rows.sort((a, b) => b.overrun - a.overrun).slice(0, 10);
  }, [tenantStats]);

  // Bar chart data — tenants sorted by consumption rate descending
  const chartData = [...tenantStats].sort((a, b) => b.stats.consumptionRate - a.stats.consumptionRate);
  const maxConsumption = Math.max(...chartData.map(t => t.stats.consumptionRate), 100);

  const W = 680, barH = 26, barGap = 8, labelW = 140, valW = 72, PR = 16;
  const chartH = chartData.length * (barH + barGap) + 32;
  const barAreaW = W - labelW - valW - PR;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>


      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KpiTile
          label="Réalisé global"
          value={fmtK(globalRealized)}
          sub={`${tenants.length} tenants consolidés`}
          accent={C.grey900}
          delay={0}
        />
        <KpiTile
          label="Budget global"
          value={fmtK(globalBudget)}
          sub="Somme des budgets auto"
          delay={60}
        />
        <KpiTile
          label="Écart consolidé"
          value={`${globalEcart > 0 ? "+" : ""}${fmtK(globalEcart)}`}
          sub={globalEcart > 0 ? "Dépassement global" : "Économie globale"}
          accent={globalEcart > 0 ? C.red : C.success}
          delay={120}
        />
        <KpiTile
          label="Taux moyen"
          value={`${globalRate.toFixed(1)}%`}
          sub={`${tenantsOverBudget} tenant(s) en dépassement`}
          accent={globalRate > 100 ? C.red : globalRate > 90 ? C.warning : C.success}
          delay={180}
        />
        <KpiTile
          label="Alertes actives"
          value={totalAlerts}
          sub="Séries en dépassement projeté"
          accent={totalAlerts > 0 ? C.red : C.success}
          delay={240}
        />
      </div>

      {/* Tenant ranking bar chart */}
      <Card style={{ padding: "20px 24px" }}>
        <SectionLabel n="1">Classement des tenants — Taux de consommation budgétaire</SectionLabel>
        <svg width="100%" viewBox={`0 0 ${W} ${chartH}`} style={{ overflow: "visible" }}>
          {chartData.map(({ tenant, stats }, i) => {
            const y = 16 + i * (barH + barGap);
            const pct = Math.min(stats.consumptionRate / maxConsumption, 1);
            const barW = pct * barAreaW;
            const isOver = stats.ecart > 0;
            const barColor = stats.consumptionRate > 100 ? C.red
              : stats.consumptionRate > 90 ? C.warning
                : C.success;
            return (
              <g
                key={tenant.id}
                style={{ cursor: "pointer" }}
                onClick={() => onSelectTenant(tenant.id)}
              >
                {/* Hover background */}
                <rect x={0} y={y - 4} width={W} height={barH + 8} rx={6}
                  fill="rgba(217,79,61,0)" className="tenant-row-hover"
                  style={{ transition: "fill .15s" }}
                  onMouseEnter={e => e.currentTarget.setAttribute("fill", "rgba(217,79,61,.04)")}
                  onMouseLeave={e => e.currentTarget.setAttribute("fill", "rgba(217,79,61,0)")}
                />
                {/* Label */}
                <text
                  x={labelW - 8} y={y + barH / 2 + 1}
                  fill={C.grey700} fontSize="11" textAnchor="end"
                  fontFamily="inherit" dominantBaseline="central"
                  fontWeight="600"
                >
                  {(tenant.name || tenant.id).slice(0, 16)}
                </text>
                {/* Track */}
                <rect x={labelW} y={y} width={barAreaW} height={barH} rx={5}
                  fill="rgba(0,0,0,.04)" />
                {/* Bar */}
                <rect x={labelW} y={y} width={Math.max(barW, 4)} height={barH} rx={5}
                  fill={barColor} opacity={0.82} />
                {/* 100% line */}
                <line
                  x1={labelW + (barAreaW * 100 / maxConsumption)}
                  y1={y - 2}
                  x2={labelW + (barAreaW * 100 / maxConsumption)}
                  y2={y + barH + 2}
                  stroke={C.grey300} strokeWidth="1" strokeDasharray="3 2"
                />
                {/* Value label */}
                <text
                  x={labelW + barAreaW + valW - PR} y={y + barH / 2 + 1}
                  fill={isOver ? C.red : C.grey600} fontSize="10"
                  fontFamily="'JetBrains Mono',monospace" textAnchor="end"
                  dominantBaseline="central" fontWeight="700"
                >
                  {stats.consumptionRate.toFixed(1)}%
                </text>
                {/* Overrun badge */}
                {stats.exceededCount > 0 && (
                  <text
                    x={labelW + barAreaW + valW - PR - 44} y={y + barH / 2 + 1}
                    fill={C.red} fontSize="9"
                    fontFamily="'JetBrains Mono',monospace" textAnchor="middle"
                    dominantBaseline="central" fontWeight="700"
                  >
                    ▲{stats.exceededCount}
                  </text>
                )}
                {/* Drill-down arrow */}
                <text
                  x={W - 6} y={y + barH / 2 + 1}
                  fill={C.grey300} fontSize="11" textAnchor="end"
                  dominantBaseline="central"
                >›</text>
              </g>
            );
          })}
          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map(pct => {
            const x = labelW + (pct / maxConsumption) * barAreaW;
            return (
              <text key={pct} x={x} y={chartH - 4}
                fill={C.grey400} fontSize="8" textAnchor="middle"
                fontFamily="'JetBrains Mono',monospace"
              >{pct}%</text>
            );
          })}
        </svg>
        <div style={{ marginTop: 8, fontSize: 10, color: C.grey400 }}>
          Cliquez sur un tenant pour accéder au détail budgétaire complet.
        </div>
      </Card>

      {/* Per-tenant cards grid */}
      <div>
        <SectionLabel n="2">Détail par organisation</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
          {tenantStats.map(({ tenant, stats }) => {
            const isOver = stats.ecart > 0;
            const ratePct = Math.min(stats.consumptionRate, 100);
            const barColor = stats.consumptionRate > 100 ? C.red
              : stats.consumptionRate > 90 ? C.warning
                : C.success;
            return (
              <div
                key={tenant.id}
                onClick={() => onSelectTenant(tenant.id)}
                style={{
                  background: "rgba(255,255,255,.72)",
                  backdropFilter: "blur(18px) saturate(180%)",
                  border: `1px solid ${isOver ? "rgba(217,79,61,.25)" : "rgba(255,255,255,.85)"}`,
                  borderRadius: 16,
                  boxShadow: isOver
                    ? "0 2px 8px rgba(217,79,61,.08), 0 0 0 1px rgba(217,79,61,.08)"
                    : "0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)",
                  padding: "18px 20px",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.10)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = isOver
                    ? "0 2px 8px rgba(217,79,61,.08), 0 0 0 1px rgba(217,79,61,.08)"
                    : "0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)";
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: isOver ? "rgba(217,79,61,.12)" : "rgba(34,197,94,.10)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Building2 size={16} color={isOver ? C.red : C.success} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900, lineHeight: 1.2 }}>
                        {tenant.name || tenant.id}
                      </div>
                      <div style={{ fontSize: 9, color: C.grey400, fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>
                        {stats.seriesCount} séries · {tenant.id}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} color={C.grey300} />
                </div>

                {/* KPI row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "Réalisé", value: fmtK(stats.totalRealized), color: C.grey900 },
                    { label: "Budget", value: fmtK(stats.totalBudget), color: C.info },
                    { label: "Écart", value: `${stats.ecart > 0 ? "+" : ""}${fmtK(stats.ecart)}`, color: isOver ? C.red : C.success },
                    { label: "Alertes", value: `${stats.exceededCount} série(s)`, color: stats.exceededCount > 0 ? C.red : C.success },
                  ].map((kpi, i) => (
                    <div key={i} style={{
                      background: "rgba(0,0,0,.025)", borderRadius: 10, padding: "10px 12px",
                    }}>
                      <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400, marginBottom: 4 }}>
                        {kpi.label}
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 800, color: kpi.color }}>
                        {kpi.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Consumption bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: C.grey400, fontWeight: 600 }}>Consommation budgétaire</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 800,
                      color: barColor,
                    }}>{stats.consumptionRate.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(0,0,0,.06)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      width: `${ratePct}%`, height: "100%", borderRadius: 6,
                      background: barColor, transition: "width .5s ease",
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global overrun table */}
      {allOverruns.length > 0 && (
        <Card>
          <div style={{
            borderBottom: "1px solid rgba(255,255,255,.85)", padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <AlertTriangle size={15} color={C.red} />
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".16em", color: C.grey400 }}>
              Top dépassements toutes organisations
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,.02)" }}>
                  {[
                    { h: "Organisation", align: "left" },
                    { h: "Série / Fournisseur", align: "left" },
                    { h: "Dépassement projeté", align: "right", c: C.red },
                    { h: "% du budget", align: "right" },
                    { h: "Accès", align: "center" },
                  ].map((col, i) => (
                    <th key={i} style={{
                      padding: "10px 16px", textAlign: col.align,
                      fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em",
                      color: col.c || C.grey400, whiteSpace: "nowrap",
                      borderBottom: `1.5px solid ${C.grey200}`,
                    }}>{col.h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allOverruns.map((row, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${C.grey100}`, cursor: "pointer", transition: "background .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(217,79,61,.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}
                    onClick={() => onSelectTenant(row.tenantId)}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 8,
                        background: "rgba(217,79,61,.08)", color: C.red,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}>{row.tenantName || row.tenantId}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: C.grey700, fontWeight: 500 }}>{row.seriesName}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: C.red }}>
                      +{fmtM(row.overrun)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.warning }}>
                      {row.pct.toFixed(1)}%
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <button
                        onClick={e => { e.stopPropagation(); onSelectTenant(row.tenantId); }}
                        style={{
                          padding: "5px 12px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                          border: `1px solid ${C.grey200}`, background: "transparent",
                          color: C.grey500, cursor: "pointer", fontFamily: "inherit",
                          transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = C.grey200; e.currentTarget.style.color = C.grey500; }}
                      >Voir détail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SERIES BUDGET PANEL
───────────────────────────────────────────────────────────── */
function SeriesBudgetPanel({ series, invoices, budgetInput, autoAnnualBudget }) {
  const nowMonth = CURRENT_MONTH_IDX;
  const nowYear = CURRENT_EXERCISE_YEAR;
  const dataYear = MOCK_DATA_YEAR;

  const historicalMonthlyPattern = useMemo(() => {
    const map = {};
    HISTORICAL_INVOICES_TABLE.forEach(inv => {
      if (seriesNameForInvoice(inv) === series.name) {
        const m = inv.date?.slice(0, 7);
        if (m) map[m] = (map[m] || 0) + inv.amount;
      }
    });
    return map;
  }, [series.name]);

  const currentMonthlyActual = useMemo(() => {
    const map = {};
    invoices.forEach(inv => {
      if (seriesNameForInvoice(inv) !== series.name) return;
      const yr = Number(inv.date?.slice(0, 4));
      const mIdx = Number(inv.date?.slice(5, 7)) - 1;
      if (yr !== dataYear || mIdx > nowMonth) return;
      const m = inv.date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + inv.amount;
    });
    return map;
  }, [invoices, series.name, nowMonth, dataYear]);

  const expectedInvoiceDays = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, () => []);
    HISTORICAL_INVOICES_TABLE.forEach(inv => {
      if (seriesNameForInvoice(inv) !== series.name || !inv.date) return;
      const monthIdx = Number(inv.date.slice(5, 7)) - 1;
      const day = Number(inv.date.slice(8, 10));
      if (monthIdx >= 0 && monthIdx < 12 && day > 0) byMonth[monthIdx].push(day);
    });
    return byMonth.map(days => {
      if (!days.length) return 15;
      return Math.round(days.reduce((sum, day) => sum + day, 0) / days.length);
    });
  }, [series.name]);

  const annualBudget = budgetInput !== "" ? Math.max(0, Number(budgetInput)) : autoAnnualBudget;

  const seasonForecast = useMemo(
    () => computeSeasonalForecast({ monthlyHistorical: historicalMonthlyPattern, annualBudget }),
    [historicalMonthlyPattern, annualBudget]
  );

  const forecast12 = useMemo(() => {
    return seasonForecast.map(sf => {
      const mKey = `${dataYear}-${String(sf.monthIdx + 1).padStart(2, "0")}`;
      const realVal = currentMonthlyActual[mKey] ?? null;
      const isFuture = sf.monthIdx > nowMonth;
      const isCurrentMonth = sf.monthIdx === nowMonth;
      const real = isFuture || (isCurrentMonth && realVal == null) ? null : (realVal || 0);
      const expectedInvoiceDate = new Date(nowYear, sf.monthIdx, expectedInvoiceDays[sf.monthIdx] || 15);
      let status;
      if (isFuture) status = "upcoming";
      else if (isCurrentMonth) status = "in_progress";
      else status = getStatus(real, sf.expected, false);
      return { ...sf, real, isFuture, isCurrentMonth, status, expectedInvoiceDate };
    });
  }, [seasonForecast, currentMonthlyActual, nowMonth, dataYear, nowYear, expectedInvoiceDays]);

  const realYtd = forecast12.filter(m => !m.isFuture).reduce((s, m) => s + (m.real || 0), 0);
  const remaining = annualBudget - realYtd;
  const projected = useMemo(() => {
    const futureExpected = forecast12.filter(m => m.isFuture).reduce((s, m) => s + m.expected, 0);
    return realYtd + futureExpected;
  }, [forecast12, realYtd]);
  const pct = annualBudget > 0 ? realYtd / annualBudget : 0;
  const exceeded = realYtd > annualBudget;
  const flaggedMonths = forecast12.filter(m => m.status === "critical").length;
  const monthlyOverruns = forecast12.filter(m => m.status === "critical");

  const budgetExhaustionMonth = useMemo(() => {
    if (projected <= annualBudget) return null;
    let cumul = 0;
    for (const m of forecast12) {
      cumul += (m.real ?? m.expected);
      if (cumul > annualBudget) return m.nameFull;
    }
    return null;
  }, [forecast12, annualBudget, projected]);

  const budgetAccent = exceeded ? C.red : pct > 0.9 ? C.warning : C.grey900;

  const useSeasonality = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
    Object.entries(historicalMonthlyPattern).forEach(([key, amount]) => {
      const idx = Number(key.slice(5, 7)) - 1;
      if (idx >= 0 && idx < 12) {
        byMonth[idx].sum += amount;
        byMonth[idx].count += 1;
      }
    });
    const monthlyAvg = byMonth.map(({ sum, count }) => count ? sum / count : 0);
    const nonZero = monthlyAvg.filter(v => v > 0);
    if (nonZero.length < 2) return false;
    const mu = nonZero.reduce((a, b) => a + b, 0) / nonZero.length;
    const max = Math.max(...nonZero);
    const min = Math.min(...nonZero);
    return mu > 0 && (max - min) / mu > 0.25;
  }, [historicalMonthlyPattern]);

  const futureHeavyMonths = useMemo(() => {
    if (!useSeasonality) return [];
    const futureMths = forecast12
      .filter(m => m.isFuture && m.expected > m.flat)
      .sort((a, b) => b.expected - a.expected);
    return futureMths.slice(0, 2).map(m => m.nameFull);
  }, [forecast12, useSeasonality]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        background: useSeasonality ? "rgba(59,130,246,.06)" : "rgba(34,197,94,.06)",
        border: `1px solid ${useSeasonality ? "rgba(59,130,246,.2)" : "rgba(34,197,94,.2)"}`,
        borderRadius: 12, padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", fontSize: 11,
      }}>
        {useSeasonality ? <Waves size={15} color={C.info} /> : <BarChart3 size={15} color={C.success} />}
        <div>
          <strong style={{ color: useSeasonality ? C.info : C.success }}>
            {useSeasonality ? "Saisonnalité détectée" : "Distribution uniforme"}
          </strong>
          <span style={{ color: C.grey400, marginLeft: 8, fontSize: 10 }}>
            {useSeasonality
              ? `— Cycle identifié · Budget réparti selon l'historique`
              : `— Répartition mensuelle uniforme (budget/12)`}
          </span>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.grey400 }}>
          {invoices.filter(i => seriesNameForInvoice(i) === series.name).length} factures
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <KpiTile label="Budget Annuel" value={fmtM(annualBudget)} sub={`Moy. ${fmtM(annualBudget / 12)} / mois`} accent={C.info} delay={0} />
        <KpiTile label="Réalisé YTD" value={fmtM(realYtd)} sub={exceeded ? "Budget dépassé" : "Sous le budget"} accent={exceeded ? C.red : C.success} delay={60} />
        <KpiTile label="Restant" value={fmtM(remaining)} sub="Budget restant" accent={remaining < 0 ? C.red : C.success} delay={120} />
        <KpiTile label="Projection Fin d'Année" value={fmtM(projected)} sub={projected > annualBudget ? "Dépassement probable" : "Dans le budget"} accent={projected > annualBudget ? C.red : C.success} delay={180} />
        <KpiTile label="Consommation" value={`${Math.round(pct * 100)}%`} sub={`${flaggedMonths} mois dépassé(s)`} accent={budgetAccent} delay={240} />
        <KpiTile label="Épuisement Budget" value={budgetExhaustionMonth || "—"} sub={budgetExhaustionMonth ? "Dépassement estimé" : "Aucun dépassement projeté"} accent={budgetExhaustionMonth ? C.warning : C.success} delay={300} />
      </div>

      <Card style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <SectionLabel n="">GRAPH. MENSUEL — {series.name}</SectionLabel>
          <div style={{ display: "flex", gap: 14, fontSize: 10, color: C.grey400 }}>
            {[
              { color: C.info, label: "Attendu" },
              { color: C.success, label: "Normal" },
              { color: C.red, label: "Dépassement" },
              { color: C.warning, label: "En cours" },
            ].map(l => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <MonthlyBarsChart months={forecast12.map(m => ({
          monthIdx: m.monthIdx, monthName: m.nameFull,
          realAmount: m.real ?? 0, expectedAmount: m.expected,
          status: m.status, isFuture: m.isFuture,
        }))} />
      </Card>

      <Card>
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,.85)", padding: "12px 18px",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400,
          background: "rgba(0,0,0,.025)", borderRadius: "18px 18px 0 0",
        }}>
          Transparence budgétaire mensuelle — {nowYear} · {series.name}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,.02)", borderBottom: `1.5px solid ${C.grey200}` }}>
                {[
                  { h: "Mois", align: "left" },
                  { h: "Réel", align: "right" },
                  { h: "Attendu (Saison)", align: "right", c: C.info },
                  { h: "Rythme Flat", align: "right" },
                  { h: "Δ Saison vs Flat", align: "right" },
                  { h: "Δ Réel vs Saison", align: "right" },
                  { h: "Statut", align: "center" },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: "13px 18px", textAlign: col.align,
                    fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em",
                    color: col.c || C.grey400, whiteSpace: "nowrap",
                  }}>{col.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecast12.map((d) => {
                const rDiff = d.expected - d.flat;
                const rDiffPct = d.flat > 0 ? (rDiff / d.flat) * 100 : 0;
                const variance = d.real == null ? null : d.real - d.expected;
                const variancePct = variance != null && d.expected > 0 ? (variance / d.expected) * 100 : null;
                const realizedRatio = d.real != null && d.expected > 0 ? (d.real / d.expected) * 100 : null;
                return (
                  <tr key={d.monthIdx} style={{ borderBottom: `1px solid ${C.grey100}` }}>
                    <td style={{ padding: "15px 18px", fontWeight: d.isCurrentMonth ? 800 : 500, fontSize: 13, color: C.grey900 }}>
                      {d.nameFull}
                      {d.isCurrentMonth && <span style={{ marginLeft: 7, fontSize: 9, color: C.warning, fontFamily: "'JetBrains Mono',monospace" }}>(en cours)</span>}
                      {d.isFuture && <span style={{ marginLeft: 7, fontSize: 9, color: C.grey300, fontFamily: "'JetBrains Mono',monospace" }}>À VENIR</span>}
                    </td>
                    <td style={{ padding: "15px 18px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: d.isFuture ? C.grey300 : C.grey800 }}>
                      {d.real == null
                        ? d.isCurrentMonth
                          ? <span style={{ color: C.warning, fontSize: 10 }}>attendue le {fmtDate(d.expectedInvoiceDate)}</span>
                          : "—"
                        : fmtM(d.real)}
                    </td>
                    <td style={{ padding: "15px 18px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: C.info }}>
                      {fmtM(d.expected)}
                    </td>
                    <td style={{ padding: "15px 18px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", color: C.grey400 }}>
                      {fmtM(d.flat)}
                    </td>
                    <td style={{
                      padding: "15px 18px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                      color: rDiff > 0 ? C.warning : rDiff < 0 ? C.info : C.grey500
                    }}>
                      {fmtComparison({ diff: rDiff, pct: rDiffPct, zeroLabel: "Aligné au flat" })}
                    </td>
                    <td style={{
                      padding: "15px 18px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                      color: variance === null ? C.grey300 : variance > 0 ? C.red : variance < 0 ? C.success : C.success
                    }}>
                      {fmtComparison({ diff: variance, pct: variancePct, zeroLabel: "Conforme", ratio: realizedRatio })}
                    </td>
                    <td style={{ padding: "15px 18px", textAlign: "center" }}>
                      <StatusPill status={d.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card style={{ padding: "18px 22px" }}>
        <SectionLabel n="">Projection &amp; Alerte Saisonnière</SectionLabel>
        <div style={{ position: "relative", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 2, height: 28 }}>
            {forecast12.map((m, idx) => {
              const cumulProjected = forecast12.slice(0, idx + 1).reduce((s, x) => s + (x.real ?? x.expected), 0);
              const isToday = m.isCurrentMonth;
              const isMonthlyOverrun = m.status === "critical";
              const isBudgetExhaustionMonth = projected > annualBudget && budgetExhaustionMonth === m.nameFull;
              const isProjectionWarning = projected > annualBudget && cumulProjected / annualBudget > 0.8;
              const barColor = m.isFuture
                ? isBudgetExhaustionMonth
                  ? "rgba(217,79,61,.75)"
                  : isProjectionWarning
                    ? "rgba(245,158,11,.65)"
                    : "rgba(59,130,246,.18)"
                : isMonthlyOverrun || isBudgetExhaustionMonth
                  ? "rgba(217,79,61,.75)"
                  : isProjectionWarning
                    ? "rgba(245,158,11,.65)"
                    : "rgba(34,197,94,.55)";
              return (
                <div key={idx} style={{
                  flex: 1, borderRadius: 4, background: barColor,
                  border: isToday ? `2px solid ${C.warning}` : "1px solid rgba(0,0,0,.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontFamily: "'JetBrains Mono',monospace",
                  color: m.isFuture ? C.grey400 : "#fff", fontWeight: 700,
                  transition: "all .3s",
                }} title={`${m.nameFull}: réel ${fmtM(m.real ?? 0)}, attendu ${fmtM(m.expected)}, cumul projeté ${fmtM(cumulProjected)} / ${fmtM(annualBudget)}`}>
                  {m.name.slice(0, 1)}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 8, fontFamily: "'JetBrains Mono',monospace", color: C.grey400 }}>
            <span>Jan</span><span>|aujourd'hui</span><span>Déc</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, flexWrap: "wrap" }}>
            {[
              { color: "rgba(34,197,94,.55)", label: "Projection <= budget" },
              { color: "rgba(245,158,11,.65)", label: "Vigilance projection" },
              { color: "rgba(217,79,61,.75)", label: "Dépassement" },
              { color: "rgba(59,130,246,.18)", label: "Projeté" },
            ].map(l => (
              <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, color: C.grey400 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          background: projected > annualBudget ? "rgba(217,79,61,.06)" : "rgba(59,130,246,.05)",
          border: `1px solid ${projected > annualBudget ? "rgba(217,79,61,.2)" : "rgba(59,130,246,.18)"}`,
          borderRadius: 10, padding: "12px 16px", fontSize: 11, color: C.grey600, lineHeight: 1.7,
        }}>
          {budgetExhaustionMonth
            ? <>À ce rythme saisonnier, le budget sera épuisé en <strong style={{ color: C.red }}>{budgetExhaustionMonth}</strong>. Il vous reste <strong style={{ color: remaining < 0 ? C.red : C.success }}>{fmtM(remaining)}</strong> pour {forecast12.filter(m => m.isFuture).length} mois à venir{futureHeavyMonths.length > 0 && <>, dont <strong style={{ color: C.warning }}>{futureHeavyMonths.join(" et ")}</strong> qui sont historiquement vos mois les plus chargés</>}.</>
            : monthlyOverruns.length > 0
              ? <>Comportement anormal détecté en <strong style={{ color: C.red }}>{monthlyOverruns.map(m => m.nameFull).join(", ")}</strong> : le réel dépasse l'attendu saisonnier. La projection annuelle reste toutefois dans le budget avec <strong style={{ color: C.success }}>{fmtM(remaining)}</strong> restant pour {forecast12.filter(m => m.isFuture).length} mois.</>
              : <>À ce rythme saisonnier, la projection reste dans le budget. Reste <strong style={{ color: C.success }}>{fmtM(remaining)}</strong> pour {forecast12.filter(m => m.isFuture).length} mois.{projected === annualBudget ? <> Le budget est prévu pour être utilisé exactement en fin d'année, sans dépassement.</> : null}{futureHeavyMonths.length > 0 && <> Vigilance sur <strong style={{ color: C.warning }}>{futureHeavyMonths.join(" et ")}</strong>.</>}</>
          }
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GLOBAL BUDGET TABLE
───────────────────────────────────────────────────────────── */
function GlobalBudgetTable({ seriesStats, customBudgets, onSetBudget, onSelectSeries, flaggedSuppliers, onToggleFlag, seasonalRisks, invoices }) {
  const [search, setSearch] = useState("");
  const filtered = seriesStats.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 0,
        padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,.85)",
      }}>
        <SectionNum n="2" />
        <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".16em", color: C.grey400, flex: 1 }}>
          Détail par série / fournisseur
        </span>
        <div style={{ position: "relative" }}>
          <Search size={12} color={C.grey300} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            style={{
              paddingLeft: 30, width: 210, fontSize: 11, borderRadius: 10,
              border: `1.5px solid ${C.grey200}`, background: "rgba(255,255,255,.88)",
              padding: "9px 13px 9px 30px", outline: "none", fontFamily: "inherit",
              color: C.grey900,
            }}
            placeholder="Filtrer fournisseur…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,.02)" }}>
              {[
                { h: "Série / Fournisseur", align: "left" },
                { h: "Réalisé YTD", align: "right" },
                { h: "Budget Annuel", align: "center", c: C.info },
                { h: "Progression", align: "center" },
                { h: "Risque projection", align: "center", c: C.warning },
                { h: "Statut", align: "center" },
                { h: "Alerte", align: "center" },
                { h: "Analyse", align: "center" },
              ].map((col, i) => (
                <th key={i} style={{
                  textAlign: col.align, padding: "11px 14px",
                  borderBottom: `1.5px solid ${C.grey200}`, color: col.c || C.grey400,
                  fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap",
                }}>{col.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map((s, i) => {
              const hasAlert = flaggedSuppliers.has(s.name);
              const isCustom = customBudgets[s.name] != null;
              const pct = s.annualBudget > 0 ? s.currentYearTotal / s.annualBudget : 0;
              const q4risk = s.projectedYearTotal > s.annualBudget ? "risk" : "ok";
              return (
                <tr key={i}
                  style={{ borderBottom: `1px solid ${C.grey100}`, cursor: "pointer", transition: "background .18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(217,79,61,.035)"}
                  onMouseLeave={e => e.currentTarget.style.background = ""}
                  onClick={() => onSelectSeries(s)}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 12, color: C.grey900 }}>
                    {s.name}
                    {isCustom && <span style={{ marginLeft: 6, fontSize: 8, color: C.info, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>● MANUEL</span>}
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: s.exceeded ? C.red : C.grey900 }}>
                    {fmtM(s.currentYearTotal)}
                  </td>
                  <td style={{ padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                      <input
                        type="number"
                        style={{
                          width: 108, textAlign: "center",
                          fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 800,
                          border: `1.5px solid ${customBudgets[s.name] != null ? C.info + "80" : C.grey200}`,
                          borderRadius: 10, padding: "6px 8px",
                          background: customBudgets[s.name] != null ? "rgba(59,130,246,.05)" : "rgba(255,255,255,.88)",
                          outline: "none", color: customBudgets[s.name] != null ? C.info : C.grey700,
                        }}
                        value={customBudgets[s.name] != null ? customBudgets[s.name] : Math.round(s.annualBudget)}
                        onChange={e => onSetBudget(s.name, Number(e.target.value))}
                        onClick={e => e.stopPropagation()}
                      />
                      <span style={{ fontSize: 9, color: C.grey300, fontFamily: "'JetBrains Mono',monospace", flexShrink: 0 }}>€</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <MiniBar pct={pct} exceeded={s.exceeded} />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: s.exceeded ? C.red : C.success, minWidth: 32 }}>
                        {Math.round(pct * 100)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    {q4risk === "risk"
                      ? <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: C.warning }}>Risque</span>
                      : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, color: C.success }}>OK</span>
                    }
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }}>
                    <StatusPill status={s.exceeded ? "critical" : pct > .95 ? "in_progress" : "normal"} />
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleFlag(s.name)}
                      style={{
                        background: "none", border: "none", cursor: "pointer", padding: 5, borderRadius: 7,
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        transition: "transform .18s", fontSize: 14,
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.25) rotate(-8deg)"}
                      onMouseLeave={e => e.currentTarget.style.transform = ""}
                      title={hasAlert ? "Désactiver l'alerte" : "Créer une alerte"}
                    >
                      <Flag size={14} fill={hasAlert ? C.red : "none"} color={hasAlert ? C.red : C.grey400} />
                    </button>
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectSeries(s)}
                      style={{
                        padding: "6px 14px", borderRadius: 9, fontSize: 10, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${C.grey200}`, background: "transparent", color: C.grey500,
                        fontFamily: "inherit", transition: "all .18s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.grey200; e.currentTarget.style.color = C.grey500; }}
                    >Analyse</button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={99} style={{ padding: 36, textAlign: "center", color: C.grey300, fontStyle: "italic", fontSize: 12 }}>Aucun fournisseur trouvé</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 20 && (
        <div style={{ padding: "10px 14px", textAlign: "center", fontSize: 10, color: C.grey400, fontStyle: "italic" }}>
          Affichage des 20 premiers sur {filtered.length} séries
        </div>
      )}
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIMULATION PANEL
───────────────────────────────────────────────────────────── */
function SimulationPanel({ invoices, seriesStats }) {
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const safeSeriesStats = Array.isArray(seriesStats) ? seriesStats : [];
  const [simSeriesName, setSimSeriesName] = useState(safeSeriesStats[0]?.name || "");
  const selectedSimSeries = safeSeriesStats.find((s) => s.name === simSeriesName) || safeSeriesStats[0] || null;
  const [simBudget, setSimBudget] = useState(selectedSimSeries?.autoAnnualBudget || 0);
  const nowYear = CURRENT_EXERCISE_YEAR;
  const dataYear = MOCK_DATA_YEAR;
  const nowMonth = CURRENT_MONTH_IDX;

  const historicalPattern = useMemo(() => {
    const map = {};
    if (!selectedSimSeries) return map;
    HISTORICAL_INVOICES_TABLE.filter(i => seriesNameForInvoice(i) === selectedSimSeries.name).forEach(inv => {
      const m = inv.date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + inv.amount;
    });
    return map;
  }, [selectedSimSeries?.name]);

  const currentActual = useMemo(() => {
    const map = {};
    if (!selectedSimSeries) return map;
    safeInvoices.filter(i => seriesNameForInvoice(i) === selectedSimSeries.name).forEach(inv => {
      const yr = Number(inv.date?.slice(0, 4));
      const mIdx = Number(inv.date?.slice(5, 7)) - 1;
      if (yr !== dataYear || mIdx > nowMonth) return;
      const m = inv.date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + inv.amount;
    });
    return map;
  }, [safeInvoices, selectedSimSeries?.name, nowMonth, dataYear]);

  const expectedInvoiceDays = useMemo(() => {
    const byMonth = Array.from({ length: 12 }, () => []);
    if (!selectedSimSeries) return byMonth.map(() => 15);
    HISTORICAL_INVOICES_TABLE.forEach(inv => {
      if (seriesNameForInvoice(inv) !== selectedSimSeries.name || !inv.date) return;
      const monthIdx = Number(inv.date.slice(5, 7)) - 1;
      const day = Number(inv.date.slice(8, 10));
      if (monthIdx >= 0 && monthIdx < 12 && day > 0) byMonth[monthIdx].push(day);
    });
    return byMonth.map(days => days.length ? Math.round(days.reduce((sum, day) => sum + day, 0) / days.length) : 15);
  }, [selectedSimSeries?.name]);

  const forecast = useMemo(() =>
    computeSeasonalForecast({ monthlyHistorical: historicalPattern, annualBudget: simBudget }),
    [historicalPattern, simBudget]
  );

  const rows = forecast.map(sf => {
    const mKey = `${dataYear}-${String(sf.monthIdx + 1).padStart(2, "0")}`;
    const real = currentActual[mKey] ?? null;
    const isFuture = sf.monthIdx > nowMonth;
    const isCurrentMonth = sf.monthIdx === nowMonth;
    const diff = real != null ? real - sf.expected : null;
    const status = isFuture ? "upcoming" : getStatus(real ?? 0, sf.expected, false);
    const expectedInvoiceDate = new Date(nowYear, sf.monthIdx, expectedInvoiceDays[sf.monthIdx] || 15);
    return { ...sf, real, isFuture, isCurrentMonth, diff, status: isCurrentMonth ? "in_progress" : status, expectedInvoiceDate };
  });

  const referenceBudget = selectedSimSeries?.autoAnnualBudget || 1;
  const scalingFactor = simBudget / referenceBudget;

  const scenariosData = useMemo(() => {
    return [
      { label: "Scénario A — Budget actuel", budget: simBudget, pct: 0, color: C.info },
      { label: "Scénario B — +10%", budget: Math.round(simBudget * 1.1), pct: 10, color: C.success },
      { label: "Scénario C — −10%", budget: Math.round(simBudget * 0.9), pct: -10, color: C.warning },
    ].map(sc => {
      const fc = computeSeasonalForecast({ monthlyHistorical: historicalPattern, annualBudget: sc.budget });
      const realYtd = rows.filter(r => !r.isFuture).reduce((s, r) => s + (r.real ?? 0), 0);
      const futureExp = fc.filter((_, idx) => idx > nowMonth).reduce((s, m) => s + m.expected, 0);
      const projected = realYtd + futureExp;
      const surplus = sc.budget - projected;
      return { ...sc, avg: Math.round(sc.budget / 12), projected, surplus };
    });
  }, [simBudget, historicalPattern, rows, nowMonth]);

  const calendarMonths = useMemo(() => {
    let cumul = 0;
    return rows.map(r => {
      cumul += r.real ?? r.expected;
      const pct = simBudget > 0 ? cumul / simBudget : 0;
      let color = C.success;
      if (pct > 1) color = C.red;
      else if (pct >= 0.8) color = C.warning;
      return { ...r, cumul, pct, calColor: color };
    });
  }, [rows, simBudget]);
  const maxMonthExpected = Math.max(...rows.map(r => r.expected), 1);

  if (!selectedSimSeries) {
    return (
      <Card style={{ padding: 20, fontSize: 12, color: C.grey500 }}>
        Aucune série disponible pour la simulation budgétaire.
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <SectionNum n="3" color={C.teal} />
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".16em", color: C.grey400, flex: 1 }}>
            Simulation Budget — {selectedSimSeries?.name || "Série"}
          </span>
          <select
            value={selectedSimSeries?.name || ""}
            onChange={(e) => {
              const next = safeSeriesStats.find((s) => s.name === e.target.value);
              setSimSeriesName(e.target.value);
              setSimBudget(next?.autoAnnualBudget || 0);
            }}
            style={{
              minWidth: 280, maxWidth: 420,
              padding: "8px 12px", borderRadius: 10,
              border: `1.5px solid ${C.grey200}`,
              background: "rgba(255,255,255,.88)",
              fontSize: 11, fontWeight: 700, color: C.grey800,
              outline: "none", fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {safeSeriesStats.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 10, color: C.grey400, fontFamily: "'JetBrains Mono',monospace" }}>Budget annuel simulé :</span>
            <input
              type="number"
              value={simBudget}
              onChange={e => setSimBudget(Number(e.target.value))}
              style={{
                width: 110, textAlign: "right",
                fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800,
                border: `1.5px solid ${C.info}50`, borderRadius: 10,
                padding: "7px 10px", background: "rgba(59,130,246,.05)",
                outline: "none", color: C.grey900,
              }}
            />
            <span style={{ fontSize: 10, color: C.grey400 }}>€/an</span>
          </div>
        </div>
        <div style={{ padding: "14px 22px" }}>
          <div style={{ marginBottom: 10, display: "flex", gap: 16, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", flexWrap: "wrap" }}>
            <span style={{ color: C.grey400 }}>Scaling factor: <strong style={{ color: C.info }}>{scalingFactor.toFixed(2)}×</strong></span>
            <span style={{ color: C.grey400 }}>Budget implicite de référence: <strong style={{ color: C.grey600 }}>{fmtM(referenceBudget)}</strong></span>
            <span style={{ color: C.grey400 }}>Source: <strong style={{ color: C.grey600 }}>historique N-1 / N-2</strong></span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 500, borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,.02)", borderBottom: `1.5px solid ${C.grey200}` }}>
                  {["Mois", "Réel", "Attendu (Scaled)", "Réel / Attendu", "Statut"].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: i > 0 ? "right" : "left", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.monthIdx} style={{ borderBottom: `1px solid ${C.grey100}` }}>
                    <td style={{ padding: "11px 14px", fontWeight: 500, color: C.grey800 }}>{r.nameFull}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", color: r.isFuture ? C.grey300 : C.grey800 }}>
                      {r.real == null
                        ? r.isCurrentMonth
                          ? <span style={{ color: C.warning, fontSize: 10 }}>attendue le {fmtDate(r.expectedInvoiceDate)}</span>
                          : "—"
                        : fmtM(r.real)}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.info }}>{fmtM(r.expected)}</td>
                    <td style={{
                      padding: "11px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
                      color: r.diff == null ? C.grey300 : r.diff > 0 ? C.red : r.diff < 0 ? C.info : C.success
                    }}>
                      {r.diff == null ? "—" : (
                        <span>
                          <span>{r.expected > 0 ? `${((r.real / r.expected) * 100).toFixed(1)}%` : "—"}</span>
                          <span style={{ marginLeft: 6, color: C.grey400, fontSize: 10 }}>
                            ({r.diff > 0 ? "+" : ""}{fmtM(r.diff)})
                          </span>
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}><StatusPill status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card style={{ padding: "18px 22px" }}>
        <SectionLabel n="">Scénario Comparatif — 3 hypothèses budgétaires</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {scenariosData.map((sc, i) => {
            const barPct = Math.min(sc.projected / (sc.budget * 1.15), 1);
            const isOver = sc.projected > sc.budget;
            return (
              <div key={i} style={{
                background: "rgba(0,0,0,.02)", borderRadius: 12, padding: "14px 18px",
                border: `1px solid ${isOver ? "rgba(217,79,61,.2)" : "rgba(34,197,94,.15)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.grey800, flex: 1 }}>{sc.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.grey400 }}>
                    Budget: <strong style={{ color: sc.color }}>{fmtM(sc.budget)}</strong>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.grey400 }}>
                    Moy: <strong style={{ color: C.grey700 }}>{fmtM(sc.avg)}/mois</strong>
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.grey400 }}>
                    Fin d'année: <strong style={{ color: isOver ? C.red : C.success }}>{fmtM(sc.projected)}</strong>
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: isOver ? "rgba(217,79,61,.10)" : "rgba(34,197,94,.10)",
                    color: isOver ? C.red : C.success,
                    border: `1px solid ${isOver ? "rgba(217,79,61,.25)" : "rgba(34,197,94,.25)"}`,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}>
                    {isOver ? `−${fmtM(Math.abs(sc.surplus))}` : `+${fmtM(sc.surplus)}`}
                  </span>
                </div>
                <div style={{ height: 8, background: "rgba(0,0,0,.06)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${barPct * 100}%`, height: "100%", borderRadius: 6, background: isOver ? C.red : sc.color, transition: "width .5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ padding: "18px 22px" }}>
        <SectionLabel n="">Calendrier de Consommation — Cumul budgétaire mensuel</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {calendarMonths.map((m, i) => {
            const barW = maxMonthExpected > 0 ? (m.expected / maxMonthExpected) * 100 : 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey400, width: 30, textAlign: "right", flexShrink: 0 }}>{m.name}</span>
                <div style={{ flex: 1, height: 16, background: "rgba(0,0,0,.04)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${barW}%`, height: "100%", borderRadius: 4,
                    background: m.calColor, opacity: m.isFuture ? 0.45 : 0.85,
                    transition: "width .4s ease",
                  }} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey400, width: 64, textAlign: "right", flexShrink: 0 }}>
                  {fmtM(m.expected)}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: m.calColor, width: 44, textAlign: "right", flexShrink: 0, fontWeight: 700 }}>
                  {Math.round(m.pct * 100)}%
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 10, flexWrap: "wrap" }}>
          {[
            { color: C.success, label: "En rythme (< 80%)" },
            { color: C.warning, label: "Alerte (80–100%)" },
            { color: C.red, label: "Dépassement (> budget)" },
          ].map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, color: C.grey400 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />{l.label}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMMANDES BUDGET PANEL
───────────────────────────────────────────────────────────── */
function CommandesBudgetPanel({ commandes, invoices }) {
  const nowYear = CURRENT_EXERCISE_YEAR;
  const nowMonth = 5;

  const budgetSeries = COMMAND_BUDGET_SERIES_TABLE;
  const totalOrdered = budgetSeries.reduce((s, c) => s + c.totalCommandes, 0);
  const totalBudget = budgetSeries.reduce((s, c) => s + c.budgetAlloue, 0);
  const totalProjection = budgetSeries.reduce((s, c) => s + c.projection, 0);
  const overrunSeries = budgetSeries.filter((s) => s.projection > s.budgetAlloue);

  const supplierRisks = useMemo(() => {
    const uniqueSuppliers = [...new Set(commandes.map(c => c.supplier))];
    return uniqueSuppliers.map(sup => {
      const byMonth = Array.from({ length: 12 }, () => ({ sum: 0, cnt: 0 }));
      invoices.forEach(inv => {
        if (inv.supplier === sup && inv.date) {
          const mIdx = parseInt(inv.date.slice(5, 7)) - 1;
          const yr = parseInt(inv.date.slice(0, 4));
          if (yr < nowYear) { byMonth[mIdx].sum += inv.amount; byMonth[mIdx].cnt += 1; }
        }
      });
      const avgByMonth = byMonth.map(({ sum, cnt }) => cnt > 0 ? sum / cnt : 0);
      const total = avgByMonth.reduce((a, b) => a + b, 0);
      if (total === 0) return { supplier: sup, risk: false, novDecPct: 0, novDecAvg: 0 };
      const novDecAvg = avgByMonth[10] + avgByMonth[11];
      const novDecPct = novDecAvg / total;
      const supplierCommandes = commandes.filter(c => c.supplier === sup);
      const totalCommanded = supplierCommandes.reduce((s, c) => s + c.orderedAmount, 0);
      const totalRcvd = supplierCommandes.reduce((s, c) => s + c.receivedAmount, 0);
      const remaining = totalCommanded - totalRcvd;
      const risk = novDecPct > 0.20 && remaining < novDecAvg;
      return { supplier: sup, risk, novDecPct: Math.round(novDecPct * 100), novDecAvg };
    }).filter(r => r.risk);
  }, [commandes, invoices, nowYear]);

  const seasonalStatusMeta = {
    normal: { label: "Normal", color: C.success, bg: "rgba(34,197,94,.08)", border: "rgba(34,197,94,.2)" },
    q4risk: { label: "Risque Q4", color: C.warning, bg: "rgba(245,158,11,.08)", border: "rgba(245,158,11,.2)" },
    over: { label: "Dépassement", color: C.red, bg: "rgba(217,79,61,.08)", border: "rgba(217,79,61,.2)" },
    under: { label: "Sous-conso", color: C.info, bg: "rgba(59,130,246,.08)", border: "rgba(59,130,246,.2)" },
  };

  const heatmapSuppliers = useMemo(() => {
    return budgetSeries.map((s) => ({
      supplier: s.budgetCode,
      avgByMonth: s.monthlyProfile,
      maxVal: Math.max(...s.monthlyProfile, 1),
    })).filter(s => s.avgByMonth.some(v => v > 0));
  }, [budgetSeries]);

  const globalMaxHeat = Math.max(...heatmapSuppliers.flatMap(s => s.avgByMonth), 1);
  const cellSize = 28;
  const labelW = 130;
  const heatW = 680;
  const heatH = heatmapSuppliers.length * (cellSize + 4) + 50;
  const monthColW = (heatW - labelW) / 12;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KpiTile label="Total Commandé" value={fmtM(totalOrdered)} sub="36 commandes livrées" accent={C.info} delay={0} />
        <KpiTile label="Budget Alloué" value={fmtM(totalBudget)} sub={`Table budgets ${nowYear}`} accent={C.success} delay={60} />
        <KpiTile label="Projection Fin d'Année" value={fmtM(totalProjection)} sub="Réalisé juin + profil restant" accent={overrunSeries.length ? C.red : C.success} delay={120} />
        <KpiTile label="Alertes Budget" value={overrunSeries.length} sub="Uniquement projection > budget" accent={overrunSeries.length ? C.red : C.success} delay={180} />
      </div>

      {supplierRisks.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,.06)",
          border: "1px solid rgba(245,158,11,.28)",
          borderRadius: 16, padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TriangleAlert size={16} color={C.warning} />
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: C.warning }}>
              Risque de dépassement saisonnier — Nov/Déc
            </span>
          </div>
          <p style={{ fontSize: 11, color: C.grey600, margin: 0, lineHeight: 1.7 }}>
            Les commandes{" "}
            <strong style={{ color: C.grey800 }}>{supplierRisks.map(r => r.supplier).join(", ")}</strong>{" "}
            ont historiquement un pic en fin d'année. Les mois Nov–Déc représentent{" "}
            <strong style={{ color: C.warning }}>
              {Math.round(supplierRisks.reduce((a, r) => a + r.novDecPct, 0) / supplierRisks.length)}%
            </strong>{" "}
            des dépenses annuelles moyennes. Sur la base de l'historique, environ{" "}
            <strong style={{ color: C.red }}>{fmtM(supplierRisks.reduce((a, r) => a + r.novDecAvg, 0))}</strong>{" "}
            supplémentaires sont attendus en Nov–Déc. Vérifiez l'adéquation du budget restant.
          </p>
        </div>
      )}

      <Card>
        <div style={{
          borderBottom: "1px solid rgba(255,255,255,.85)", padding: "12px 18px",
          fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400,
          background: "rgba(0,0,0,.025)", borderRadius: "18px 18px 0 0",
        }}>
          Analyse par code budgétaire — exercice {nowYear}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,.02)", borderBottom: `1.5px solid ${C.grey200}` }}>
                {[
                  { h: "Code", align: "left" },
                  { h: "Libellé", align: "left" },
                  { h: "Volume", align: "left" },
                  { h: `Total ${nowYear}`, align: "right" },
                  { h: "Budget alloué", align: "right", c: C.info },
                  { h: "Projection", align: "right" },
                  { h: "Dépassement", align: "right" },
                  { h: "Projection/Budget", align: "right" },
                  { h: "Alerte projection", align: "center", c: C.warning },
                ].map((col, i) => (
                  <th key={i} style={{
                    padding: "11px 14px", textAlign: col.align,
                    fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em",
                    color: col.c || C.grey400, whiteSpace: "nowrap",
                    borderBottom: `1.5px solid ${C.grey200}`,
                  }}>{col.h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetSeries.map((c, i) => {
                const overrun = c.projection > c.budgetAlloue;
                const sm = overrun ? seasonalStatusMeta.over : seasonalStatusMeta.normal;
                const taux = c.budgetAlloue > 0 ? (c.projection / c.budgetAlloue) * 100 : 0;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.grey100}` }}>
                    <td style={{ padding: "12px 14px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.grey900, fontSize: 10 }}>{c.budgetCode}</td>
                    <td style={{ padding: "12px 14px", color: C.grey600 }}>{c.label}</td>
                    <td style={{ padding: "12px 14px", color: C.grey600, fontSize: 10 }}>{c.orderCount} commandes</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: C.grey700 }}>{fmtM(c.totalCommandes)}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: C.info }}>{fmtM(c.budgetAlloue)}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: C.grey700 }}>{fmtM(c.projection)}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: overrun ? C.red : C.success }}>{overrun ? `+${fmtM(c.overrunAmount)}` : "0 €"}</td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: overrun ? C.red : C.grey600 }}>
                      {taux.toFixed(1)}%
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "3px 9px",
                        borderRadius: 20, fontSize: 10, fontWeight: 700, color: sm.color,
                        background: sm.bg, border: `1px solid ${sm.border}`,
                        fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap",
                      }}>{overrun ? `BUDGET_OVERRUN +${fmtM(c.overrunAmount)}` : sm.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card style={{ padding: "18px 22px" }}>
        <SectionLabel n="">Heatmap de saisonnalité — Intensité des dépenses par mois</SectionLabel>
        <div style={{ overflowX: "auto" }}>
          <svg width="100%" viewBox={`0 0 ${heatW} ${heatH}`} style={{ overflow: "visible" }}>
            {Array.from({ length: 12 }).map((_, mIdx) => (
              <text key={mIdx} x={labelW + mIdx * monthColW + monthColW / 2} y={18}
                fill={C.grey400} fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono',monospace">
                {monthShort(mIdx)}
              </text>
            ))}
            {heatmapSuppliers.map((s, rowIdx) => {
              const y = 28 + rowIdx * (cellSize + 4);
              return (
                <g key={s.supplier}>
                  <text x={labelW - 8} y={y + cellSize / 2 + 4} fill={C.grey500} fontSize="9"
                    textAnchor="end" fontFamily="'JetBrains Mono',monospace">
                    {s.supplier.slice(0, 14)}
                  </text>
                  {s.avgByMonth.map((val, mIdx) => {
                    const intensity = val / globalMaxHeat;
                    const r = 8 + intensity * (cellSize / 2 - 10);
                    const cx = labelW + mIdx * monthColW + monthColW / 2;
                    const cy = y + cellSize / 2;
                    const opacity = 0.12 + intensity * 0.78;
                    return (
                      <g key={mIdx}>
                        <circle cx={cx} cy={cy} r={Math.max(r, 3)} fill={C.red} opacity={opacity}>
                          <title>{`${s.supplier} — ${monthName(mIdx)}: moy. ${fmtM(val)}`}</title>
                        </circle>
                        {intensity > 0.6 && (
                          <text x={cx} y={cy + 3} fill="#fff" fontSize="7" textAnchor="middle"
                            fontFamily="'JetBrains Mono',monospace" fontWeight="700">
                            {Math.round(val / 100) > 0 ? `${Math.round(val / 100)}c` : ""}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: C.grey400, fontSize: 9 }}>Taille et opacité du cercle = dépense mensuelle historique moyenne</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[0.15, 0.4, 0.7, 1.0].map((op, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10 + i * 4, height: 10 + i * 4, borderRadius: "50%", background: C.red, opacity: 0.12 + op * 0.78, display: "inline-block" }} />
                <span style={{ fontSize: 8, color: C.grey400, fontFamily: "'JetBrains Mono',monospace" }}>
                  {["Faible", "Modéré", "Élevé", "Max"][i]}
                </span>
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function BudgetView() {
  const { tenant, isEngineAdmin } = useAuth();
  const [tab, setTab] = useState("suivi");
  const [customBudgets, setCustomBudgets] = useState({});
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [seriesBudgetInput, setSeriesBudgetInput] = useState("");
  const [flaggedSuppliers, setFlaggedSuppliers] = useState(new Set());
  const [adminTenantId, setAdminTenantId] = useState("");

  const adminTenants = useMemo(() => isEngineAdmin ? visibleTenants() : [], [isEngineAdmin]);

  // When admin selects a tenant (from dropdown OR by clicking in GlobalAdminDashboard)
  const handleSelectTenant = useCallback((tenantId) => {
    setAdminTenantId(tenantId);
    setSelectedSeries(null);
    setSeriesBudgetInput("");
    setTab("suivi");
  }, []);

  const selectedTenantId = isEngineAdmin ? adminTenantId : tenant?.id;
  const selectedTenantName = isEngineAdmin
    ? (adminTenantId ? adminTenants.find(t => t.id === adminTenantId)?.name : "Tous les tenants")
    : tenant?.name;

  // Show global admin dashboard when admin and no tenant selected
  const showGlobalDashboard = isEngineAdmin && !adminTenantId;

  const invoices = useMemo(() => {
    if (!selectedTenantId) return FAKE_INVOICES;
    return FAKE_INVOICES.filter(inv => inv.tenantId === selectedTenantId || inv.tenant_id === selectedTenantId);
  }, [selectedTenantId]);

  const commandes = useMemo(() => {
    if (!selectedTenantId) return FAKE_COMMANDES;
    return FAKE_COMMANDES.filter(c => !c.tenantId || c.tenantId === selectedTenantId || c.tenant_id === selectedTenantId);
  }, [selectedTenantId]);

  const nowYear = CURRENT_EXERCISE_YEAR;
  const dataYear = MOCK_DATA_YEAR;
  const nowMonth = CURRENT_MONTH_IDX;

  const { seriesStats, allMonths, totalRealized, totalBudget } = useMemo(() => {
    const sMap = {};
    const mSet = new Set();
    invoices.forEach(inv => {
      const m = inv.date?.slice(0, 7);
      if (m && Number(m.slice(0, 4)) === dataYear && Number(m.slice(5, 7)) <= nowMonth + 1) mSet.add(`${nowYear}-${m.slice(5, 7)}`);
      const s = seriesNameForInvoice(inv);
      if (!sMap[s]) sMap[s] = { name: s, supplier: inv.supplier || inv.supplierName, label: inv.label, monthly: {} };
      if (m) sMap[s].monthly[m] = (sMap[s].monthly[m] || 0) + inv.amount;
    });

    HISTORICAL_INVOICES_TABLE.forEach(inv => {
      const s = seriesNameForInvoice(inv);
      if (!sMap[s]) sMap[s] = { name: s, supplier: inv.supplier || inv.supplierName, label: inv.label, monthly: {} };
    });

    const sortedMonths = Array.from(mSet).sort();
    let tReal = 0, tBudg = 0;

    const stats = Object.values(sMap).map((s) => {
      const currentYearTotal = Object.entries(s.monthly)
        .filter(([k]) => k.startsWith(String(dataYear)) && Number(k.slice(5, 7)) <= nowMonth + 1)
        .reduce((a, [, v]) => a + v, 0);
      const historicalByMonth = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
      HISTORICAL_INVOICES_TABLE.forEach(inv => {
        if (seriesNameForInvoice(inv) !== s.name || !inv.date) return;
        const idx = Number(inv.date.slice(5, 7)) - 1;
        historicalByMonth[idx].sum += inv.amount;
        historicalByMonth[idx].count += 1;
      });
      const historicalPattern = historicalByMonth.map(({ sum, count }) => count ? sum / count : 0);
      const projectedYearTotal = currentYearTotal + historicalPattern.slice(nowMonth + 1).reduce((a, v) => a + v, 0);
      const autoAnnualBudget = SPEC_INVOICE_BUDGETS[s.name] ?? currentYearTotal;
      const annualBudget = customBudgets[s.name] != null ? customBudgets[s.name] : autoAnnualBudget;
      const avg = annualBudget / 12;
      tReal += currentYearTotal;
      tBudg += annualBudget;

      return {
        ...s, avg, annualBudget, autoAnnualBudget, projectedYearTotal, historicalPattern,
        currentYearTotal, pct: annualBudget > 0 ? currentYearTotal / annualBudget : 0,
        exceeded: projectedYearTotal > annualBudget,
      };
    }).sort((a, b) => b.currentYearTotal - a.currentYearTotal);

    return { seriesStats: stats, allMonths: sortedMonths, totalRealized: tReal, totalBudget: tBudg };
  }, [invoices, customBudgets, nowYear, dataYear, nowMonth]);

  const trendData = useMemo(() => {
    return allMonths.slice(-12).map(m => ({
      m: m.slice(5),
      real: seriesStats.reduce((a, s) => a + (s.monthly?.[`${dataYear}-${m.slice(5)}`] || 0), 0),
      budget: seriesStats.reduce((a, s) => a + s.avg, 0),
    }));
  }, [allMonths, seriesStats, dataYear]);

  const seasonalRisks = useMemo(() =>
    computeSeasonalRisks(seriesStats, invoices, nowMonth),
    [seriesStats, invoices, nowMonth]
  );

  const ecart = totalRealized - totalBudget;
  const consumptionRate = totalBudget > 0 ? (totalRealized / totalBudget) * 100 : 0;
  const exceededCount = seriesStats.filter(s => s.exceeded).length;

  const handleToggleFlag = useCallback((name) => {
    setFlaggedSuppliers(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }, []);

  const TABS = [
    { id: "suivi", label: "Suivi budgétaire" },
    { id: "serie", label: "Analyse par série" },
    { id: "simulation", label: "Simulation budget" },
    { id: "commandes", label: "Budget Commandes" },
  ];

  return (
    <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeSlideUp .45s cubic-bezier(.22,1,.36,1) both" }}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        input:focus { outline:none; border-color:rgba(217,79,61,.4) !important; box-shadow:0 0 0 3px rgba(217,79,61,.1); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <div style={{ width: 18, height: 2, background: C.red, borderRadius: 2 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: "0.1em" }}>{showGlobalDashboard ? "Pilotage" : "Budget"}</span>
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, fontWeight: 400, color: C.grey900, letterSpacing: "-0.02em", margin: 0, lineHeight: 1 }}>
            {showGlobalDashboard ? "Vue Globale — Tous les Tenants" : "Budget & Prévisions"}
          </h2>
          <p style={{ fontSize: 11, color: C.grey500, margin: "7px 0 0" }}>
            {showGlobalDashboard
              ? `Moteur — ${adminTenants.length} organisations · exercice ${CURRENT_EXERCISE_YEAR}`
              : `Démo · Suivi saisonnalisé · Gardien budgétaire${selectedTenantName ? ` · ${selectedTenantName}` : ""}`
            }
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

        {/* Admin tenant selector */}
        {isEngineAdmin && (
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <Globe size={13} color={!adminTenantId ? C.red : C.grey500} style={{ position: "absolute", left: 11, pointerEvents: "none" }} />
          <select
            value={adminTenantId}
            onChange={e => handleSelectTenant(e.target.value)}
            style={{
              minWidth: 210,
              padding: "9px 12px 9px 32px",
              borderRadius: 10,
              border: `1.5px solid ${!adminTenantId ? C.red + "60" : C.grey200}`,
              background: !adminTenantId ? "rgba(217,79,61,.04)" : "rgba(255,255,255,.88)",
              color: !adminTenantId ? C.red : C.grey800,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            <option value="">Vue globale</option>
            {adminTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          </div>
        )}

        {/* Back to global button when a tenant is selected */}
        {isEngineAdmin && adminTenantId && (
          <button
            onClick={() => handleSelectTenant("")}
            style={{
              padding: "8px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer",
              border: `1px solid rgba(217,79,61,.3)`, background: "rgba(217,79,61,.05)",
              color: C.red, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
              transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,79,61,.10)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(217,79,61,.05)"; }}
          >
            <Globe size={13} /> Vue globale
          </button>
        )}

        </div>
      </div>

      {/* Tabs — left-aligned below header */}
      {!showGlobalDashboard && (
        <div style={{ display: "flex", justifyContent: "flex-start", marginTop: -6 }}>
          <div style={{ display: "flex", background: "rgba(0,0,0,.04)", borderRadius: 12, padding: 3, gap: 2, flexWrap: "wrap" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none",
                fontFamily: "inherit",
                background: tab === t.id ? `linear-gradient(135deg,${C.red},${C.red}dd)` : "transparent",
                color: tab === t.id ? "#fff" : C.grey500,
                boxShadow: tab === t.id ? "0 4px 16px rgba(217,79,61,.28)" : "none",
                transition: "all .15s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── GLOBAL ADMIN DASHBOARD ── */}
      {showGlobalDashboard && (
        <GlobalAdminDashboard
          tenants={adminTenants}
          allInvoices={FAKE_INVOICES}
          onSelectTenant={handleSelectTenant}
        />
      )}

      {/* ── PER-TENANT VIEW ── */}
      {!showGlobalDashboard && (
        <>
          {/* Global KPIs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <KpiTile label="Total Réalisé" value={fmtM(totalRealized)} sub={`Sur ${allMonths.slice(-12).length} mois glissants`} accent={ecart > 0 ? C.red : C.success} delay={0} />
            <KpiTile label="Budget Total" value={fmtM(totalBudget)} sub="Calculé sur historique N-1 / N-2" delay={60} />
            <KpiTile label="Écart" value={`${ecart > 0 ? "+" : ""}${fmtK(ecart)}`} sub={ecart > 0 ? "Dépassement global" : "Économie globale"} accent={ecart > 0 ? C.red : C.success} delay={120} />
            <KpiTile label="Taux de consommation" value={`${consumptionRate.toFixed(1)}%`} sub={`${exceededCount} série(s) dépassée(s)`} accent={consumptionRate > 100 ? C.red : consumptionRate > 90 ? C.warning : C.success} delay={180} />
          </div>

          {/* ── TAB: Suivi budgétaire ── */}
          {tab === "suivi" && (
            <>
              <SeasonalRiskBanner risks={seasonalRisks} />

              <Card style={{ padding: "22px 26px" }}>
                <SectionLabel n="1">Évolution mensuelle — Réalisé vs Budget</SectionLabel>
                <TrendAreaChart trendData={trendData} />
                <div style={{ display: "flex", gap: 22, marginTop: 12, justifyContent: "center" }}>
                  {[
                    { color: C.red, label: "Dépenses Réelles", dash: false },
                    { color: C.grey400, label: "Budget Mensuel Moyen", dash: true },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <svg width="24" height="10">
                        <line x1="0" y1="5" x2="24" y2="5" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash ? "4 3" : "0"} />
                      </svg>
                      <span style={{ fontSize: 10, color: C.grey400 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <GlobalBudgetTable
                seriesStats={seriesStats}
                customBudgets={customBudgets}
                onSetBudget={(name, val) => setCustomBudgets(c => ({ ...c, [name]: val }))}
                onSelectSeries={s => { setSelectedSeries(s); setSeriesBudgetInput(""); setTab("serie"); }}
                flaggedSuppliers={flaggedSuppliers}
                onToggleFlag={handleToggleFlag}
                seasonalRisks={seasonalRisks}
                invoices={invoices}
              />

              {Object.keys(customBudgets).length > 0 && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setCustomBudgets({})}
                    style={{
                      padding: "8px 18px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${C.grey200}`, background: "transparent", color: C.grey500,
                      fontFamily: "inherit", transition: "all .18s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.grey200; e.currentTarget.style.color = C.grey500; }}
                  >Réinitialiser tous les budgets manuels</button>
                </div>
              )}
            </>
          )}

          {/* ── TAB: Analyse par série ── */}
          {tab === "serie" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card style={{ padding: "20px 24px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "stretch" }}>
                <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <label style={{ display: "block", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400, marginBottom: 6 }}>
                    Sélectionner une série
                  </label>
                  <select
                    style={{
                      width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${C.grey200}`, background: "rgba(255,255,255,.88)",
                      color: C.grey900, outline: "none", fontFamily: "'JetBrains Mono',monospace",
                      height: 42, boxSizing: "border-box",
                    }}
                    value={selectedSeries?.name || ""}
                    onChange={e => {
                      const s = seriesStats.find(x => x.name === e.target.value) || null;
                      setSelectedSeries(s);
                      setSeriesBudgetInput("");
                    }}
                  >
                    <option value="">— Choisir un fournisseur / série —</option>
                    {seriesStats.map(s => (
                      <option key={s.name} value={s.name}>
                        {s.name} · {fmtM(s.currentYearTotal)} / {fmtM(s.annualBudget)}{s.exceeded ? " · Dépassement" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSeries && (
                  <div style={{ width: 1, background: C.grey200, alignSelf: "stretch", flexShrink: 0 }} />
                )}

                {selectedSeries && (
                  <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <label style={{ display: "block", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.grey400, marginBottom: 6 }}>
                      Budget annuel — {selectedSeries.name}
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        style={{
                          flex: 1, padding: "10px 13px", borderRadius: 10, height: 42, boxSizing: "border-box",
                          fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, letterSpacing: "-0.5px",
                          border: `1.5px solid ${C.grey200}`, background: "rgba(255,255,255,.88)",
                          color: C.grey900, outline: "none",
                        }}
                        placeholder={String(selectedSeries.autoAnnualBudget)}
                        value={seriesBudgetInput}
                        onChange={e => setSeriesBudgetInput(e.target.value)}
                      />
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.grey400, flexShrink: 0 }}>€ / an</span>
                      {seriesBudgetInput !== "" && (
                        <button
                          style={{ padding: "0 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${C.grey200}`, background: "transparent", color: C.grey500, fontFamily: "inherit", height: 42, boxSizing: "border-box" }}
                          onClick={() => setSeriesBudgetInput("")}
                        >Auto</button>
                      )}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey400, marginTop: 5 }}>
                      {seriesBudgetInput === ""
                        ? `Budget auto : ${fmtM(selectedSeries.autoAnnualBudget)}`
                        : `Auto : ${fmtM(selectedSeries.autoAnnualBudget)}`}
                    </div>
                  </div>
                )}
              </Card>

              {!selectedSeries && (
                <div style={{
                  background: "rgba(59,130,246,.05)", border: "1px solid rgba(59,130,246,.18)",
                  borderRadius: 14, padding: "15px 20px", fontSize: 11, lineHeight: 1.65, display: "flex", gap: 10, alignItems: "flex-start",
                }}>
                  <Lightbulb size={16} color={C.info} />
                  <span>
                    <strong style={{ color: C.info }}>Mode Analyse par Série</strong> — Sélectionnez un fournisseur ci-dessus.
                    Le système calculera la prévision saisonnière mensuelle et vous alertera sur les mois à risque.
                  </span>
                </div>
              )}

              {selectedSeries && (
                <SeriesBudgetPanel
                  key={selectedSeries.name}
                  series={selectedSeries}
                  invoices={invoices}
                  allMonths={allMonths}
                  budgetInput={seriesBudgetInput}
                  autoAnnualBudget={selectedSeries.autoAnnualBudget}
                />
              )}
            </div>
          )}

          {/* ── TAB: Simulation ── */}
          {tab === "simulation" && (
            <SimulationPanel invoices={invoices} seriesStats={seriesStats} />
          )}

          {/* ── TAB: Budget Commandes ── */}
          {tab === "commandes" && (
            <CommandesBudgetPanel commandes={commandes} invoices={invoices} />
          )}
        </>
      )}
    </div>
  );
}

export default BudgetView;
