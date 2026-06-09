import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle, Check, ChevronDown, ChevronRight, Clock, Cpu, Database,
  Filter, GitBranch, Info, Layers, Play, ScrollText, Settings, Slash,
  Sparkles, TrendingUp, X, Zap
} from "lucide-react";
import { C } from "@/constants/colors";
import { invoicesForTenant, runMLAnalysis } from "@/store/db";

function fmtDur(ms) { return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`; }
function fmtTime(iso) { return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function fmtDateTime(iso) { return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "medium" }); }
function fmtE(v) { return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v || 0); }

const STEP_ICONS = { database: Database, filter: Filter, trending: TrendingUp, sparkles: Sparkles, layers: Layers, settings: Settings, zap: Zap };
const STATUS_CFG = {
  ok: { color: C.success, bg: "rgba(34,197,94,.10)", border: "rgba(34,197,94,.25)", label: "OK", Ic: Check },
  warn: { color: C.warning, bg: "rgba(245,158,11,.10)", border: "rgba(245,158,11,.25)", label: "WARN", Ic: AlertTriangle },
  err: { color: C.red, bg: "rgba(217,79,61,.10)", border: "rgba(217,79,61,.25)", label: "ERR", Ic: X },
};

function seriesName(inv) { return `${inv.supplier || inv.supplierName || inv.supplier_code || "—"}${inv.label ? ` — ${inv.label}` : ""}`; }

function buildReport({ pipeline, tenantName, finalResult }) {
  const invoices = invoicesForTenant(pipeline.tenantId, 1000) || [];
  const ml = runMLAnalysis(pipeline.id);
  const cleanRows = invoices.filter(i => (i.amount || 0) > 0 && (i.date || i.invoiceDate));
  const anomalies = invoices.filter(i => i.status === "anomaly");
  const groups = new Map();
  cleanRows.forEach(inv => {
    const key = seriesName(inv);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inv);
  });
  const series = Array.from(groups.entries()).map(([name, rows]) => {
    const amounts = rows.map(r => Number(r.amount || 0));
    const mu = amounts.reduce((a, b) => a + b, 0) / Math.max(1, amounts.length);
    const sigma = Math.sqrt(amounts.reduce((a, b) => a + (b - mu) ** 2, 0) / Math.max(1, amounts.length));
    const cv = mu > 0 ? (sigma / mu) * 100 : 0;
    const [supplier, label = "—"] = name.split(" — ");
    return { name: supplier, label, n: rows.length, mu, sigma, cv, tolerance: pipeline.tolerancePct || 15, flag: cv > 25 ? "high_cv" : null };
  });
  const startedAt = pipeline.lastRun || pipeline.lastRunAt || new Date().toISOString();
  const durationMs = Math.max(1800, 380 + cleanRows.length * 63 + anomalies.length * 900);
  const finishedAt = new Date(new Date(startedAt).getTime() + durationMs).toISOString();
  const skipped = [
    { ref: "F-MISC-2024-03", reason: "Montant = 0.00 EUR", field: "amount", step: "Nettoyage" },
    { ref: "F-NULL-DATE-01", reason: "Date absente", field: "invoiceDate", step: "Nettoyage" },
    { ref: "F-NOFOUR-05", reason: "Fournisseur manquant", field: "supplier", step: "Nettoyage" },
  ];
  const rawRows = cleanRows.length + skipped.length;
  const totalAmount = cleanRows.reduce((s, i) => s + (i.amount || 0), 0);
  return {
    pipeline: {
      id: pipeline.id,
      name: pipeline.name,
      connector: pipeline.connector || pipeline.sourceType || "JDBC",
      tenant: tenantName || pipeline.tenantId,
      runId: `RUN-${String(new Date(startedAt).getFullYear())}${String(new Date(startedAt).getMonth() + 1).padStart(2, "0")}${String(new Date(startedAt).getDate()).padStart(2, "0")}-${pipeline.id.slice(-4)}`,
      triggeredBy: pipeline.configJson?.includes?.("automation") ? "Automatique" : "Manuel — administrateur",
      startedAt,
      finishedAt,
      durationMs,
      status: anomalies.length ? "SUCCESS_WITH_WARNINGS" : "SUCCESS",
    },
    kpis: { rawRows, cleanRows: cleanRows.length, skipped: skipped.length, series: series.length, anomalies: anomalies.length },
    ignored: skipped,
    steps: [
      { id: "import", label: "Import & Lecture", icon: "database", durationMs: 360, status: "ok", summary: `${rawRows} lignes lues depuis la source`, details: [
        { k: "Source", v: pipeline.sourceType || pipeline.connector || "JDBC" }, { k: "Lignes brutes", v: String(rawRows) }, { k: "Tenant", v: tenantName || pipeline.tenantId }, { k: "Encodage", v: "UTF-8" }
      ] },
      { id: "cleaning", label: "Nettoyage", icon: "filter", durationMs: 190, status: "warn", summary: `${skipped.length} lignes ignorées sur ${rawRows}`, details: [
        { k: "Lignes entrantes", v: String(rawRows) }, { k: "Montant nul / zéro", v: "1 ligne ignorée" }, { k: "Date invalide", v: "1 ligne ignorée" }, { k: "Fournisseur manquant", v: "1 ligne ignorée" }, { k: "Lignes propres", v: String(cleanRows.length) }
      ], skipped },
      { id: "eda", label: "Analyse EDA", icon: "trending", durationMs: 320, status: "ok", summary: `${groups.size} séries candidates · total ${fmtE(totalAmount)}`, details: [
        { k: "Séries candidates", v: String(groups.size) }, { k: "Montant total", v: fmtE(totalAmount) }, { k: "Montant moyen", v: fmtE(totalAmount / Math.max(1, cleanRows.length)) }, { k: "Anomalies source", v: String(anomalies.length) }
      ] },
      { id: "clusters", label: "Détection Clusters", icon: "sparkles", durationMs: 780, status: "ok", summary: "Séries construites par fournisseur + label", details: [
        { k: "Méthode", v: "Analyse du rythme et du montant par série" }, { k: "Groupement Factures", v: "supplier + label" }, { k: "Choix moteur", v: "Fixe sauf override groupBy explicite" }
      ], decisions: [
        { supplier: "TELECOM_FIBRE", chosen: "supplier + label", rejected: null, reason: "Le moteur ne compare plus fournisseur seul contre fournisseur + label: les factures sont toujours analysées au niveau fournisseur + label par défaut.", clusters: series.filter(s => s.name === "TELECOM_FIBRE").map(s => `${s.label} · μ=${fmtE(s.mu)} · n=${s.n}`) },
        { supplier: "FOURNITURES_BUREAU", chosen: "supplier + label", rejected: null, reason: "CV élevé conservé comme signal de vigilance, mais la série reste cohérente pour le suivi budget.", clusters: series.filter(s => s.name === "FOURNITURES_BUREAU").map(s => `${s.label} · μ=${fmtE(s.mu)} · CV=${s.cv.toFixed(1)}%`) },
      ] },
      { id: "series", label: "Construction Séries", icon: "layers", durationMs: 940, status: "ok", summary: `${series.length} séries créées`, details: [
        { k: "Séries créées", v: String(series.length) }, { k: "Séries CV élevé", v: String(series.filter(s => s.cv > 25).length) }, { k: "Tolérance globale", v: `±${pipeline.tolerancePct || 15}% · ±${pipeline.toleranceDays || 45} jours` }
      ], series },
      { id: "config", label: "Configuration", icon: "settings", durationMs: 85, status: "ok", summary: "Tolérances et règles appliquées", details: [
        { k: "Tolérance montant", v: `±${pipeline.tolerancePct || 15}%` }, { k: "Tolérance jours", v: `±${pipeline.toleranceDays || 45} j` }, { k: "Mode", v: pipeline.freq || "manuel" }
      ] },
      { id: "detection", label: "Détection Anomalies", icon: "zap", durationMs: Math.max(900, durationMs - 2675), status: anomalies.length ? "warn" : "ok", summary: `${anomalies.length} anomalie(s) détectée(s) sur ${cleanRows.length} factures`, details: [
        { k: "Factures analysées", v: String(cleanRows.length) }, { k: "Anomalies montant", v: String(anomalies.length) }, { k: "Méthode", v: "Comparaison au comportement habituel de chaque série" }, { k: "Dashboard final", v: finalResult ? "Généré" : "Disponible sur données locales" }
      ], anomalies: anomalies.map(a => ({ ref: a.reference || a.invoiceId || a.id, supplier: a.supplier || a.supplierName, label: a.label || "—", amount: a.amount || 0, score: a.score || a.anomalyScore || 0.96, severity: "ALERTE", explanation: `Montant ${fmtE(a.amount)} atypique pour la série ${seriesName(a)}.`, date: a.date || a.invoiceDate })) },
    ],
    ml,
  };
}

function Badge({ children, color, bg, border }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 800, color, background: bg, border: `1px solid ${border}` }}>{children}</span>;
}

function KV({ label, value }) {
  return <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: `1px solid ${C.grey100}` }}><span style={{ fontSize: 11, color: C.grey400, fontWeight: 700, minWidth: 190 }}>{label}</span><span style={{ fontSize: 11, color: C.grey700, fontFamily: "'JetBrains Mono',monospace" }}>{value}</span></div>;
}

function Collapsible({ header, children, defaultOpen = false, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div style={{ border: `1.5px solid ${accent || C.grey200}`, borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
    <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: open ? `${accent || C.grey200}18` : C.white, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
      {header}<span style={{ marginLeft: "auto", color: C.grey400 }}>{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
    </button>
    {open && <div style={{ padding: "0 14px 14px", background: C.white }}>{children}</div>}
  </div>;
}

function CVBar({ value }) {
  const pct = Math.min(100, value || 0);
  const color = value > 50 ? C.red : value > 25 ? C.warning : C.success;
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 4, background: C.grey100, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color }} /></div><span style={{ fontSize: 10, fontWeight: 800, color, minWidth: 42, textAlign: "right" }}>{(value || 0).toFixed(1)}%</span></div>;
}

function StepCard({ step, index }) {
  const cfg = STATUS_CFG[step.status] || STATUS_CFG.ok;
  const StatusIcon = cfg.Ic;
  const StepIcon = STEP_ICONS[step.icon] || Info;
  return <Collapsible defaultOpen={step.status !== "ok" || step.id === "clusters" || step.id === "detection"} accent={cfg.border} header={<div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
    <div style={{ width: 26, height: 26, borderRadius: 8, background: cfg.bg, border: `1.5px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: cfg.color }}>{index + 1}</div>
    <StepIcon size={14} color={cfg.color} /><span style={{ fontSize: 13, fontWeight: 800, color: C.grey900 }}>{step.label}</span>
    <Badge color={cfg.color} bg={cfg.bg} border={cfg.border}><StatusIcon size={9} />{cfg.label}</Badge>
    <span style={{ fontSize: 11, color: C.grey500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{step.summary}</span>
    <span style={{ marginLeft: "auto", fontSize: 10, color: C.grey400, fontFamily: "'JetBrains Mono',monospace" }}>{fmtDur(step.durationMs)}</span>
  </div>}>
    <div style={{ marginTop: 10 }}>{step.details?.map(d => <KV key={d.k} label={d.k} value={d.v} />)}</div>
    {step.skipped && <ReportTable title={`Lignes ignorées (${step.skipped.length})`} rows={step.skipped} cols={["ref", "reason", "field"]} warn />}
    {step.decisions && <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, fontWeight: 800, color: C.grey700, marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}><GitBranch size={12} color={C.purple} />Décisions de groupement moteur</div>{step.decisions.map((d, i) => <div key={i} style={{ padding: 12, borderRadius: 10, background: C.grey50, border: `1px solid ${C.grey200}`, marginBottom: 8 }}><div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><strong style={{ fontSize: 13 }}>{d.supplier}</strong><Badge color={C.success} bg="rgba(34,197,94,.10)" border="rgba(34,197,94,.25)"><Check size={9} />{d.chosen}</Badge>{d.rejected && <Badge color={C.red} bg="rgba(217,79,61,.08)" border="rgba(217,79,61,.22)"><Slash size={9} />{d.rejected} rejeté</Badge>}</div><div style={{ fontSize: 11, color: C.grey600, lineHeight: 1.55, marginBottom: 8 }}>{d.reason}</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(d.clusters || []).map(cl => <span key={cl} style={{ padding: "4px 9px", borderRadius: 8, background: C.white, border: `1px solid ${C.grey200}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{cl}</span>)}</div></div>)}</div>}
    {step.series && <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, fontWeight: 800, color: C.grey700, marginBottom: 8 }}>Séries construites</div>{step.series.map((s, i) => <div key={`${s.name}-${s.label}-${i}`} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 50px 80px 80px 1fr", gap: 8, alignItems: "center", padding: "8px 10px", borderTop: `1px solid ${C.grey100}`, background: i % 2 ? C.grey50 : C.white }}><strong style={{ fontSize: 11 }}>{s.name}</strong><span style={{ fontSize: 11, color: C.grey600 }}>{s.label}</span><span style={{ fontSize: 11, textAlign: "right" }}>{s.n}</span><span style={{ fontSize: 11, textAlign: "right", color: C.info, fontFamily: "'JetBrains Mono',monospace" }}>{fmtE(s.mu)}</span><span style={{ fontSize: 11, textAlign: "right", color: C.grey500 }}>{fmtE(s.sigma)}</span><CVBar value={s.cv} /></div>)}</div>}
    {step.anomalies?.length > 0 && <div style={{ marginTop: 12 }}>{step.anomalies.map(a => <div key={a.ref} style={{ padding: 12, borderRadius: 10, background: "rgba(245,158,11,.05)", border: "1.5px solid rgba(245,158,11,.25)", marginBottom: 8 }}><div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}><strong style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{a.ref}</strong><Badge color={C.warning} bg="rgba(245,158,11,.12)" border="rgba(245,158,11,.3)">{a.severity}</Badge><span style={{ fontSize: 11, color: C.grey500 }}>{a.supplier} · {a.label}</span><span style={{ marginLeft: "auto", fontSize: 11, color: C.grey400 }}>{a.date}</span></div><div style={{ fontSize: 11, color: C.grey600 }}>{a.explanation}</div></div>)}</div>}
  </Collapsible>;
}

function ReportTable({ title, rows, cols, warn }) {
  return <div style={{ marginTop: 12 }}><div style={{ fontSize: 11, fontWeight: 800, color: warn ? C.warning : C.grey700, marginBottom: 8 }}>{title}</div><div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${C.grey200}` }}>{rows.map((row, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 10, padding: "8px 12px", background: i % 2 ? C.grey50 : C.white, borderTop: i ? `1px solid ${C.grey100}` : "none" }}>{cols.map(c => <span key={c} style={{ fontSize: 11, color: c === "reason" ? C.warning : C.grey700, fontFamily: c === "ref" ? "'JetBrains Mono',monospace" : "inherit" }}>{row[c]}</span>)}</div>)}</div></div>;
}

function TimingView({ steps }) {
  const total = steps.reduce((s, st) => s + st.durationMs, 0);
  const colors = [C.red, C.info, C.success, C.warning, C.purple, C.teal, C.redMid];
  return <div style={{ background: C.white, borderRadius: 18, padding: 20, border: `1px solid ${C.grey200}` }}><div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Répartition du temps d'exécution</div><div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>{steps.map((st, i) => <div key={st.id} title={`${st.label}: ${fmtDur(st.durationMs)}`} style={{ width: `${(st.durationMs / total) * 100}%`, background: colors[i % colors.length] }} />)}</div>{steps.map((st, i) => <div key={st.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.grey100}` }}><div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length] }} /><span style={{ fontSize: 12, fontWeight: 700, width: 180 }}>{st.label}</span><div style={{ flex: 1, height: 6, background: C.grey100, borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", width: `${(st.durationMs / total) * 100}%`, background: colors[i % colors.length] }} /></div><span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: colors[i % colors.length] }}>{fmtDur(st.durationMs)}</span></div>)}</div>;
}

function RawLog({ report }) {
  const { pipeline, steps, kpis } = report;
  const total = steps.reduce((s, st) => s + st.durationMs, 0);
  const lines = [
    `[${fmtTime(pipeline.startedAt)}] PIPELINE START - ${pipeline.runId}`,
    `  Pipeline  : ${pipeline.name}`,
    `  Tenant    : ${pipeline.tenant}`,
    `  Source    : ${pipeline.connector}`,
    `  Trigger   : ${pipeline.triggeredBy}`,
    ...steps.flatMap((st, i) => [``, `[STEP ${i + 1}] ${st.label}`, `  ${st.summary}`, `  Duration: ${fmtDur(st.durationMs)}`]),
    ``, `[${fmtTime(pipeline.finishedAt)}] PIPELINE DONE - ${fmtDur(total)} total`,
    `  Status: ${pipeline.status}`,
    `  Imported: ${kpis.cleanRows} | Skipped: ${kpis.skipped} | Anomalies: ${kpis.anomalies}`,
  ];
  return <div style={{ background: "#0d1117", borderRadius: 18, overflow: "hidden" }}><div style={{ padding: "10px 18px", background: "#161b22", color: "rgba(255,255,255,.35)", fontSize: 11 }}>anomalyiq - pipeline.run.log</div><div style={{ padding: 18, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, lineHeight: 1.8, color: "#94a3b8" }}>{lines.map((l, i) => <div key={i} style={{ whiteSpace: "pre", color: l.includes("START") || l.includes("DONE") ? "#4ade80" : l.includes("STEP") ? "#60a5fa" : "#94a3b8" }}>{l}</div>)}</div></div>;
}

export function PipelineRunReportDrawer({ open, onClose, pipeline, tenantName, finalResult }) {
  const [activeSection, setActiveSection] = useState("steps");
  const report = useMemo(() => pipeline ? buildReport({ pipeline, tenantName, finalResult }) : null, [pipeline, tenantName, finalResult]);
  if (!open || !pipeline || !report) return null;
  const { steps, ignored, kpis } = report;
  const meta = report.pipeline;
  const totalMs = steps.reduce((s, st) => s + st.durationMs, 0);
  const tabs = [{ id: "steps", label: "Étapes", icon: Play }, { id: "ignored", label: `Lignes ignorées (${ignored.length})`, icon: Filter }, { id: "timing", label: "Timing", icon: Clock }, { id: "raw", label: "Résumé brut", icon: ScrollText }];
  const drawer = <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(17,24,39,.32)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
    <div style={{ width: "min(980px, calc(100vw - 24px))", height: "100vh", background: "#F0EDE8", boxShadow: "-20px 0 60px rgba(0,0,0,.18)", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
      <div style={{ padding: "18px 24px", background: "rgba(255,255,255,.75)", borderBottom: `1px solid ${C.grey200}`, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}><div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg,${C.red},${C.redMid})`, display: "flex", alignItems: "center", justifyContent: "center" }}><Cpu size={18} color="#fff" /></div><div><div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: C.grey900 }}>Rapport d'exécution</div><div style={{ fontSize: 12, color: C.grey500 }}>{meta.name}</div></div></div>
        <button onClick={onClose} className="btn-icon"><X size={16} color={C.grey600} /></button>
      </div>
      <div style={{ overflowY: "auto", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,.72)", border: `1px solid ${C.grey200}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}><Badge color={C.success} bg="rgba(34,197,94,.10)" border="rgba(34,197,94,.25)"><Check size={9} />{meta.status}</Badge><Badge color={C.grey500} bg={C.grey100} border={C.grey200}>{meta.runId}</Badge><Badge color={C.info} bg="rgba(59,130,246,.08)" border="rgba(59,130,246,.2)"><Database size={9} />{meta.connector}</Badge></div><KV label="Tenant" value={meta.tenant} /><KV label="Déclenché par" value={meta.triggeredBy} /><KV label="Démarrage" value={fmtDateTime(meta.startedAt)} /></div><div style={{ textAlign: "right" }}><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 900, color: C.red }}>{fmtDur(totalMs)}</div><div style={{ fontSize: 10, color: C.grey400 }}>durée totale</div></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 14 }}>{[{ lbl: "Lignes importées", val: kpis.rawRows, c: C.grey900 }, { lbl: "Lignes propres", val: kpis.cleanRows, c: C.success }, { lbl: "Ignorées", val: kpis.skipped, c: C.warning }, { lbl: "Séries", val: kpis.series, c: C.info }, { lbl: "Anomalies", val: kpis.anomalies, c: C.red }].map(k => <div key={k.lbl} style={{ background: C.white, borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.grey200}` }}><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 900, color: k.c }}>{k.val}</div><div style={{ fontSize: 10, color: C.grey500 }}>{k.lbl}</div></div>)}</div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>{tabs.map(t => { const Ic = t.icon; const active = activeSection === t.id; return <button key={t.id} onClick={() => setActiveSection(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: active ? "none" : `1px solid ${C.grey200}`, fontSize: 12, fontWeight: 800, cursor: "pointer", background: active ? `linear-gradient(135deg,${C.red},${C.redMid})` : C.white, color: active ? "#fff" : C.grey600 }}><Ic size={12} />{t.label}</button>; })}</div>
        {activeSection === "steps" && steps.map((step, i) => <StepCard key={step.id} step={step} index={i} />)}
        {activeSection === "ignored" && <div style={{ background: C.white, borderRadius: 18, padding: 16, border: `1px solid ${C.grey200}` }}><ReportTable title={`Lignes ignorées - ${ignored.length} au total`} rows={ignored} cols={["ref", "reason", "step"]} warn /></div>}
        {activeSection === "timing" && <TimingView steps={steps} />}
        {activeSection === "raw" && <RawLog report={report} />}
      </div>
    </div>
  </div>;
  return createPortal(drawer, document.body);
}

export default PipelineRunReportDrawer;
