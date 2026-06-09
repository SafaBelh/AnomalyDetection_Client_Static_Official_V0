
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  TriangleAlert,
  ShieldCheck,
  MousePointerClick,
  X,
  Filter,
  AlertCircle,
  TrendingUp,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { invoicesForTenant, partnersForTenant, pipelinesForTenant, useAuth, visibleTenants } from "@/store/db";
import { CONNECTOR_LABELS, DERIVED_ANOMALY_DEFAULTS } from "@/store/staticData";
import { downloadCSV } from "@/store/wsAPI";
import { addAuditEntry } from "@/utils/audit";
import { apiGet, apiPost } from "@/utils/api";

/* ─── helpers (unchanged) ─────────────────────────────────── */
const typeBg = (t) =>
  t === "montant" || t === "AMOUNT_SPIKE"
    ? "rgba(251,113,133,.13)"
    : t === "doublon"
      ? "rgba(251,191,36,.13)"
      : "rgba(96,165,250,.13)";

const typeColor = (t) =>
  t === "montant" || t === "AMOUNT_SPIKE" ? "#fb7185" : t === "doublon" ? "#fbbf24" : "#60a5fa";

const scoreColor = (s) =>
  s >= 0.9 ? "#fb7185" : s >= 0.8 ? "#f97316" : "#fbbf24";

const scoreBg = (s) =>
  s >= 0.9 ? "rgba(251,113,133,.10)" : s >= 0.8 ? "rgba(249,115,22,.10)" : "rgba(251,191,36,.10)";

const scoreBorder = (s) =>
  s >= 0.9 ? "rgba(251,113,133,.28)" : s >= 0.8 ? "rgba(249,115,22,.25)" : "rgba(251,191,36,.28)";

const fmtAmount = (v) =>
  (v || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

const severityOf = (a) => {
  if (a.severity) return String(a.severity).toLowerCase();
  const score = a.score ?? a.anomalyScore ?? 0;
  return score >= 0.9 ? "critical" : score >= 0.8 ? "warning" : "info";
};

const friendlyType = (t) =>
  t === "AMOUNT_SPIKE" || t === "montant" ? "Montant" : t === "doublon" ? "Doublon" : t || "Inconnu";

const connectorLabel = (connectorId) => {
  if (!connectorId) return "Sans ERP";
  return CONNECTOR_LABELS[connectorId] || connectorId;
};

/* ─── styles ───────────────────────────────────────────────── */
const css = `
  .anomalies-root * { box-sizing: border-box; }

  .anomalies-root {
    --bg: transparent;
    --surface: rgba(255,255,255,.82);
    --surface2: #f9fafb;
    --border: rgba(15,23,42,.08);
    --border-hover: rgba(217,79,61,.22);
    --text: #1f2937;
    --text-muted: #64748b;
    --text-dim: #94a3b8;
    --red: #fb7185;
    --orange: #f97316;
    --yellow: #fbbf24;
    --blue: #60a5fa;
    --green: #34d399;
    --mono: 'JetBrains Mono', 'Fira Code', monospace;
    --sans: inherit;
    background: var(--bg);
    min-height: calc(100vh - 68px);
    font-family: inherit;
    color: var(--text);
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* header strip */
  .anm-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .anm-eyebrow {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--red);
    font-family: var(--mono);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .anm-eyebrow::before {
    content: '';
    width: 18px;
    height: 2px;
    background: var(--red);
    border-radius: 2px;
    display: inline-block;
  }
  .anm-title {
    font-size: 30px;
    font-weight: 400;
    color: var(--text);
    font-family: 'Instrument Serif', 'Playfair Display', Georgia, serif;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
  }
  .anm-subtitle {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 5px;
    font-family: var(--mono);
  }

  /* stat pills row */
  .anm-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .anm-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 16px;
    border-radius: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: 0 10px 28px rgba(15,23,42,.04);
    min-width: 100px;
  }
  .anm-stat-label {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--text-muted);
    font-family: var(--mono);
  }
  .anm-stat-value {
    font-size: 15px;
    font-weight: 700;
    font-family: var(--mono);
  }

  /* filter bar */
  .anm-filters {
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: 0 10px 28px rgba(15,23,42,.04);
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .anm-filter-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-family: var(--mono);
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .anm-select, .anm-input {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,.96) !important;
    color: var(--text) !important;
    font-size: 11px;
    font-family: var(--sans);
    outline: none;
    cursor: pointer;
    transition: border-color .15s;
  }
  .anm-select:hover, .anm-input:hover { border-color: var(--border-hover); }
  .anm-select:focus, .anm-input:focus { border-color: rgba(96,165,250,.4); }
  .anm-input::placeholder { color: var(--text-muted); }
  .anm-select option { background: #fff; color: var(--text); }
  .anm-reset {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 11px;
    cursor: pointer;
    font-family: var(--sans);
    transition: all .15s;
  }
  .anm-reset:hover { border-color: var(--border-hover); color: var(--text); background: rgba(217,79,61,.04); }

  /* main grid */
  .anm-grid {
    display: grid;
    grid-template-columns: minmax(520px, 1.15fr) minmax(360px, .85fr);
    gap: 16px;
    align-items: start;
  }

  /* LIST column */
  .anm-list-col { display: flex; flex-direction: column; gap: 8px; }
  .anm-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px 4px;
  }
  .anm-list-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .anm-csv-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-muted);
    font-size: 10px;
    cursor: pointer;
    font-family: var(--mono);
    transition: all .15s;
  }
  .anm-csv-btn:hover { border-color: var(--border-hover); color: var(--text); }

  /* anomaly row */
  .anm-row {
    width: 100%;
    padding: 13px 14px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: 0 10px 26px rgba(15,23,42,.045);
    display: flex;
    align-items: center;
    gap: 11px;
    cursor: pointer;
    transition: all .18s;
    text-align: left;
    outline: none;
    position: relative;
    overflow: hidden;
  }
  .anm-row:hover { border-color: var(--border-hover); background: #fff; box-shadow: 0 12px 28px rgba(15,23,42,.06); }
  .anm-row.selected { background: #fff; border-color: var(--accent); box-shadow: 0 14px 30px rgba(15,23,42,.07); }

  .anm-row-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .anm-row-content { flex: 1; min-width: 0; }
  .anm-row-supplier {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .anm-row-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 3px;
    font-size: 11px;
    color: var(--text-muted);
    font-family: inherit;
    white-space: nowrap;
    min-width: 0;
  }
  .anm-row-amount, .anm-row-date { white-space: nowrap; flex-shrink: 0; }
  .anm-type-tag {
    padding: 2px 7px;
    border-radius: 5px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    font-family: inherit;
    flex-shrink: 0;
  }
  .anm-info-btn {
    width: 24px; height: 24px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all .15s;
  }
  .anm-info-btn:hover { border-color: var(--border-hover); color: var(--text); }
  .anm-score-badge {
    display: flex; flex-direction: column; align-items: center;
    gap: 1px; flex-shrink: 0;
    padding: 5px 9px;
    border-radius: 8px;
  }
  .anm-score-num {
    font-size: 12px;
    font-weight: 700;
    font-family: var(--mono);
  }
  .anm-score-label {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--text-muted);
    font-family: var(--mono);
  }

  /* empty states */
  .anm-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 24px; gap: 14px; text-align: center;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    box-shadow: 0 12px 30px rgba(15,23,42,.045);
  }
  .anm-empty-icon {
    width: 60px; height: 60px; border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
  }
  .anm-empty-title { font-size: 17px; font-weight: 600; color: var(--text); margin-top: 2px; }
  .anm-empty-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.6; max-width: 260px; }

  /* DETAIL column */
  .anm-detail-col { display: flex; flex-direction: column; gap: 12px; }

  .anm-detail-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 12px 30px rgba(15,23,42,.045);
  }
  .anm-detail-header {
    display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 18px;
  }
  .anm-detail-eyebrow {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--text-muted); font-family: var(--mono); margin-bottom: 5px;
  }
  .anm-detail-supplier { font-size: 18px; font-weight: 700; color: var(--text); }
  .anm-close {
    width: 28px; height: 28px; border-radius: 8px;
    border: 1px solid var(--border); background: var(--surface2);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-muted); transition: all .15s;
  }
  .anm-close:hover { border-color: var(--border-hover); color: var(--text); }

  .anm-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
  }
  .anm-detail-cell { display: flex; flex-direction: column; gap: 4px; }
  .anm-cell-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--text-muted); font-family: var(--mono);
  }
  .anm-cell-value { font-size: 13px; font-weight: 700; color: var(--text); font-family: var(--mono); }

  /* chart card */
  .anm-chart-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: 0 12px 30px rgba(15,23,42,.045);
  }
  .anm-chart-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: var(--text-muted); font-family: var(--mono);
    margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
  }

  /* actions card */
  .anm-actions-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 18px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 12px 30px rgba(15,23,42,.045);
  }
  .anm-actions-label {
    font-size: 10px; font-weight: 700; color: var(--text-muted); font-family: var(--mono);
    text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0;
  }
  .anm-action-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px;
    font-weight: 600; font-size: 12px; cursor: pointer;
    transition: all .18s; font-family: var(--sans);
  }
  .anm-action-confirm {
    border: 1px solid rgba(251,113,133,.3);
    background: rgba(251,113,133,.07);
    color: var(--red);
  }
  .anm-action-confirm:hover { background: rgba(251,113,133,.14); border-color: rgba(251,113,133,.5); }
  .anm-action-fp {
    border: 1px solid rgba(52,211,153,.3);
    background: rgba(52,211,153,.07);
    color: var(--green);
  }
  .anm-action-fp:hover { background: rgba(52,211,153,.14); border-color: rgba(52,211,153,.5); }

  .anm-divider { width: 1px; height: 14px; background: var(--border); }
  .anm-kbd {
    font-size: 9px; font-family: var(--mono); padding: 2px 5px;
    border: 1px solid var(--border); border-radius: 4px; color: var(--text-muted);
  }

  /* count badge */
  .anm-count-badge {
    padding: 2px 8px; border-radius: 20px;
    background: rgba(15,23,42,.045);
    font-size: 10px; font-weight: 700;
    color: var(--text-muted); font-family: var(--mono);
  }
`;

/* ─── sub-components ─────────────────────────────────────── */

function AnomalyRow({ anomaly, isSelected, onClick, onInfo }) {
  const sc = anomaly.score || 0;
  const color = scoreColor(sc);
  const tColor = typeColor(anomaly.anomalyType);

  return (
    <button
      className={`anm-row${isSelected ? " selected" : ""}`}
      style={{ "--accent": color }}
      onClick={onClick}
    >
      {/* type icon */}
      <div className="anm-row-icon" style={{ background: typeBg(anomaly.anomalyType) }}>
        <TriangleAlert size={15} color={tColor} strokeWidth={2.5} />
      </div>

      {/* content */}
      <div className="anm-row-content">
        <div className="anm-row-supplier">
          {anomaly.supplier || anomaly.supplierName || anomaly.supplier_code || "—"}
        </div>
        <div className="anm-row-meta">
          <span className="anm-type-tag" style={{ background: typeBg(anomaly.anomalyType), color: tColor }}>
            {friendlyType(anomaly.anomalyType)}
          </span>
          <span style={{ color: "rgba(100,116,139,.35)" }}>·</span>
          <span className="anm-row-amount">{fmtAmount(anomaly.actualAmount || anomaly.amount)}</span>
          {(anomaly.detectedAt || anomaly.detectionDate) && (
            <>
              <span style={{ color: "rgba(100,116,139,.35)" }}>·</span>
              <span className="anm-row-date">{anomaly.detectedAt || anomaly.detectionDate}</span>
            </>
          )}
        </div>
      </div>

      {/* info btn */}
      <button
        className="anm-info-btn"
        onClick={(e) => { e.stopPropagation(); onInfo(); }}
        title="Explication"
      >?</button>

      {/* score */}
      <div className="anm-score-badge" style={{ background: scoreBg(sc), border: `1px solid ${scoreBorder(sc)}` }}>
        <span className="anm-score-num" style={{ color }}>{(sc * 100).toFixed(0)}%</span>
        <span className="anm-score-label">Score</span>
      </div>

      <ChevronRight size={13} color="rgba(100,116,139,.45)" />
    </button>
  );
}

function DetailCell({ label, value, accent, mono = true }) {
  return (
    <div className="anm-detail-cell">
      <span className="anm-cell-label">{label}</span>
      <span className="anm-cell-value" style={accent ? { color: accent } : {}}>{value}</span>
    </div>
  );
}

function EmptyList() {
  return (
    <div className="anm-empty">
      <div className="anm-empty-icon" style={{ background: "rgba(52,211,153,.10)", border: "1px solid rgba(52,211,153,.2)" }}>
        <ShieldCheck size={26} color="#34d399" strokeWidth={2} />
      </div>
      <div>
        <div className="anm-empty-title">Aucune anomalie détectée</div>
        <div className="anm-empty-sub">Votre pipeline est sain. Les anomalies apparaîtront ici dès leur détection.</div>
      </div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div className="anm-empty" style={{ minHeight: 360 }}>
      <div className="anm-empty-icon" style={{ background: "rgba(100,116,139,.07)", border: "1px solid var(--border)" }}>
        <MousePointerClick size={22} color="#6b7280" strokeWidth={1.8} />
      </div>
      <div>
        <div className="anm-empty-title" style={{ fontSize: 14 }}>Sélectionnez une anomalie</div>
        <div className="anm-empty-sub">Le détail et le graphique s'afficheront ici</div>
      </div>
    </div>
  );
}

const filterSx = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(15,23,42,.10)",
  background: "rgba(255,255,255,.96)",
  color: "#1f2937",
  fontSize: 11,
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
};

/* ─── main view ─────────────────────────────────────────── */
export function AnomaliesView() {
  const toast = useToast();
  const { tenant, isEngineAdmin } = useAuth();
  const [selected, setSelected] = useState(null);
  const [kFactor] = useState(3.0);
  const [showExplain, setShowExplain] = useState(null);
  const [rawAnomalies, setRawAnomalies] = useState([]);
  const [targetInvoiceData, setTargetInvoiceData] = useState([]);
  const [adminTenantFilter, setAdminTenantFilter] = useState("");
  const [erpFilter, setErpFilter] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [query, setQuery] = useState("");

  const allTenants = useMemo(() => {
    if (!isEngineAdmin) return [];
    try { return visibleTenants(); } catch (e) { return []; }
  }, [isEngineAdmin]);

  const tenantIds = useMemo(() => {
    if (tenant?.id) return [tenant.id];
    if (adminTenantFilter) return [adminTenantFilter];
    return allTenants.map((t) => t.id);
  }, [tenant?.id, adminTenantFilter, allTenants]);

  const allPipelines = useMemo(
    () => tenantIds.flatMap((tenantId) => pipelinesForTenant(tenantId).map((p) => ({ ...p, tenantId }))),
    [tenantIds]
  );

  const allErps = useMemo(() => {
    const byId = new Map();
    tenantIds.forEach((tenantId) => {
      partnersForTenant(tenantId).forEach((p) => {
        if (p.connectorId) byId.set(p.connectorId, p.name || connectorLabel(p.connectorId));
      });
    });
    allPipelines.forEach((p) => {
      if (p.connectorId && !byId.has(p.connectorId)) byId.set(p.connectorId, connectorLabel(p.connectorId));
    });
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [tenantIds, allPipelines]);

  const deriveMockAnomalies = (ids) => ids.flatMap((tenantId) => {
    const invoicePipeline =
      pipelinesForTenant(tenantId).find((p) => p.templateKey === "facture") ||
      pipelinesForTenant(tenantId).find((p) => p.name?.toLowerCase().includes("facture")) ||
      pipelinesForTenant(tenantId)[0];
    return invoicesForTenant(tenantId)
      .filter((i) => i.status === "anomaly" || i.anomalyType)
      .map((i) => ({
        ...i,
        id: `anom-${i.id}`,
        invoiceId: i.id,
        invoiceRef: i.reference || i.invoiceId || i.id,
        tenantId,
        pipelineId: invoicePipeline?.id,
        pipelineName: invoicePipeline?.name,
        connectorId: invoicePipeline?.connectorId,
        anomalyType: i.anomalyType || DERIVED_ANOMALY_DEFAULTS.type,
        score: i.score ?? i.anomalyScore ?? DERIVED_ANOMALY_DEFAULTS.score,
        actualAmount: i.amount,
        detectedAt: i.date || i.invoiceDate,
        expectedAmount: i.expectedAmount || i.referenceMu || Math.round((i.amount || 0) * DERIVED_ANOMALY_DEFAULTS.expectedAmountRatio),
        maxAcceptable: i.maxAcceptable || Math.round((i.amount || 0) * DERIVED_ANOMALY_DEFAULTS.maxAcceptableRatio),
      }));
  });

  useEffect(() => {
    if (!tenant?.id && !isEngineAdmin) return;
    apiGet("/anomalies", { size: 100 })
      .then((res) => {
        const items = res?.content || [];
        const scopedItems = items.filter((a) => !tenantIds.length || tenantIds.includes(a.tenantId));
        setRawAnomalies(scopedItems.length ? scopedItems : deriveMockAnomalies(tenantIds));
      })
      .catch((err) => console.error("Failed to fetch anomalies:", err));
  }, [tenant?.id, isEngineAdmin, adminTenantFilter, tenantIds]);

  const anomalies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rawAnomalies.filter((a) => {
      const supplier = a.supplier || a.supplierName || a.supplier_code || "";
      const ref = a.invoiceRef || a.reference || a.invoiceId || a.id || "";
      if (adminTenantFilter && a.tenantId !== adminTenantFilter) return false;
      if (erpFilter && a.connectorId !== erpFilter) return false;
      if (pipelineFilter && a.pipelineId !== pipelineFilter) return false;
      if (typeFilter && a.anomalyType !== typeFilter) return false;
      if (severityFilter && severityOf(a) !== severityFilter) return false;
      if (supplierFilter && supplier !== supplierFilter) return false;
      if (q && !`${supplier} ${ref} ${a.anomalyType || ""} ${a.pipelineName || ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rawAnomalies, adminTenantFilter, erpFilter, pipelineFilter, typeFilter, severityFilter, supplierFilter, query]);

  const typeOptions = useMemo(() => Array.from(new Set(rawAnomalies.map((a) => a.anomalyType).filter(Boolean))), [rawAnomalies]);
  const supplierOptions = useMemo(() => Array.from(new Set(rawAnomalies.map((a) => a.supplier || a.supplierName || a.supplier_code).filter(Boolean))).sort(), [rawAnomalies]);

  useEffect(() => { setSelected(null); }, [adminTenantFilter, erpFilter, pipelineFilter, typeFilter, severityFilter, supplierFilter, query]);

  useEffect(() => {
    if (!selected) { setTargetInvoiceData([]); return; }
    apiGet("/invoices", { supplier: selected.supplier || selected.supplierName, size: 50 })
      .then((res) => setTargetInvoiceData(res?.content || []))
      .catch(() => setTargetInvoiceData([]));
  }, [selected]);

  useEffect(() => {
    const h = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!selected) return;
      if (e.key === "f" || e.key === "F") handleFeedback(selected.id, "confirmed");
      if (e.key === "d" || e.key === "D") handleFeedback(selected.id, "false_positive");
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [selected]);

  if (!tenant && !isEngineAdmin) return null;

  const handleFeedback = async (id, type) => {
    const anomaly = anomalies.find((a) => a.id === id);
    const decision = type === "false_positive" ? "REJECTED" : "CONFIRMED";
    try { await apiPost(`/feedback/${id}`, { decision, comment: "" }); } catch (e) { console.error("Feedback failed:", e); }
    if (type === "false_positive") {
      toast(`Faux positif signalé pour ${anomaly?.invoiceRef || anomaly?.id || id}`, "info");
      addAuditEntry("Faux positif", `${anomaly?.invoiceRef || anomaly?.id || id}`);
    } else {
      toast("Anomalie confirmée. Alerte envoyée.", "success");
      addAuditEntry("Anomalie confirmée", `${anomaly?.invoiceRef || anomaly?.id || id} — ${anomaly?.anomalyType || ""}`);
    }
  };

  const madResult = selected ? {
    median: selected.referenceMu || selected.expectedAmount || 0,
    mad: selected.maxAcceptable && (selected.referenceMu || selected.expectedAmount)
      ? (selected.maxAcceptable - (selected.referenceMu || selected.expectedAmount)) / (kFactor || 3)
      : 1,
    upperBound: selected.maxAcceptable || selected.actualAmount || 0,
    lowerBound: Math.max(0, (selected.referenceMu || selected.expectedAmount || 0) - ((selected.maxAcceptable || 0) - (selected.referenceMu || selected.expectedAmount || 0))),
    k: kFactor,
  } : null;

  const minInvoiceCount = Math.round(kFactor);

  const chartData = selected && targetInvoiceData.length > 0
    ? targetInvoiceData.map((i, idx) => ({ index: idx, montant: i.amount || 0, isAnomaly: i.id === selected.invoiceId }))
    : [];

  const avgScore = anomalies.length
    ? (anomalies.reduce((s, a) => s + (a.score || 0), 0) / anomalies.length)
    : 0;
  const totalAmount = anomalies.reduce((s, a) => s + (a.actualAmount || a.amount || 0), 0);
  const hasFilters = adminTenantFilter || erpFilter || pipelineFilter || typeFilter || severityFilter || supplierFilter || query;

  return (
    <div className="anomalies-root">
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div className="anm-header">
        <div>
          <div className="anm-eyebrow">Monitoring · Détection IA</div>
          <h1 className="anm-title">Anomalies détectées</h1>
          <div className="anm-subtitle">
            {tenant?.name || (adminTenantFilter ? allTenants.find(t => t.id === adminTenantFilter)?.name || adminTenantFilter : "Tous les tenants")}
            {" · "}
            {anomalies.length}/{rawAnomalies.length} anomalie{rawAnomalies.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* stat pills in header */}
        {anomalies.length > 0 && (
          <div className="anm-stats">
            <div className="anm-stat">
              <span className="anm-stat-label">Total</span>
              <span className="anm-stat-value" style={{ color: "#1f2937" }}>{anomalies.length}</span>
            </div>
            <div className="anm-stat">
              <span className="anm-stat-label">Score moyen</span>
              <span className="anm-stat-value" style={{ color: scoreColor(avgScore) }}>
                {(avgScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="anm-stat">
              <span className="anm-stat-label">Montant total</span>
              <span className="anm-stat-value" style={{ color: "#1f2937", fontSize: 13 }}>
                {fmtAmount(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── FILTERS ── */}
      <div className="anm-filters">
        <span className="anm-filter-label">
          <Filter size={11} />
          Filtres
        </span>

        {!tenant && isEngineAdmin && allTenants.length > 0 && (
          <select value={adminTenantFilter} onChange={(e) => { setAdminTenantFilter(e.target.value); setErpFilter(""); setPipelineFilter(""); }} style={filterSx} className="anm-select">
            <option value="">Tous les tenants</option>
            {allTenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        <select value={erpFilter} onChange={(e) => { setErpFilter(e.target.value); setPipelineFilter(""); }} style={filterSx} className="anm-select">
          <option value="">Tous les ERP</option>
          {allErps.map((erp) => <option key={erp.id} value={erp.id}>{erp.name}</option>)}
        </select>
        <select value={pipelineFilter} onChange={(e) => setPipelineFilter(e.target.value)} style={filterSx} className="anm-select">
          <option value="">Tous les pipelines</option>
          {allPipelines.filter((p) => !erpFilter || p.connectorId === erpFilter).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={filterSx} className="anm-select">
          <option value="">Tous les types</option>
          {typeOptions.map((type) => <option key={type} value={type}>{friendlyType(type)}</option>)}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} style={filterSx} className="anm-select">
          <option value="">Toutes criticités</option>
          <option value="critical">Critique</option>
          <option value="warning">À surveiller</option>
          <option value="info">Info</option>
        </select>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} style={filterSx} className="anm-select">
          <option value="">Tous fournisseurs</option>
          {supplierOptions.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          style={{ ...filterSx, minWidth: 180 }}
        />
        {hasFilters && (
          <button className="anm-reset" onClick={() => { setAdminTenantFilter(""); setErpFilter(""); setPipelineFilter(""); setTypeFilter(""); setSeverityFilter(""); setSupplierFilter(""); setQuery(""); }}>
            × Réinitialiser
          </button>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(100,116,139,.55)", fontFamily: "inherit", fontWeight: 700 }}>
          {anomalies.length}/{rawAnomalies.length}
        </span>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="anm-grid">

        {/* LEFT — list */}
        <div className="anm-list-col">
          <div className="anm-list-header">
            <span className="anm-list-title">
              <TriangleAlert size={12} color="#fb7185" />
              Anomalies
              <span className="anm-count-badge">{anomalies.length}</span>
            </span>
            <button
              className="anm-csv-btn"
              onClick={() => {
                downloadCSV(
                  anomalies.map((a) => ({
                    id: a.id,
                    fournisseur: a.supplier || a.supplierName,
                    montant: a.actualAmount || a.amount,
                    type: a.anomalyType,
                    score: a.score,
                    date: a.detectedAt || a.detectionDate,
                  })),
                  `anomalies-${tenant?.name || "global"}-${new Date().toISOString().slice(0, 10)}.csv`
                );
                addAuditEntry("Export CSV", `Anomalies — ${anomalies.length} lignes exportées`);
              }}
            >
              <Download size={11} />
              CSV
            </button>
          </div>

          {anomalies.length === 0 ? (
            <EmptyList />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {anomalies.map((a) => (
                <AnomalyRow
                  key={a.id}
                  anomaly={a}
                  isSelected={selected?.id === a.id}
                  onClick={() => setSelected(a)}
                  onInfo={() => setShowExplain(showExplain === a.id ? null : a.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — detail */}
        <div className="anm-detail-col">
          {selected && madResult ? (
            <>
              {/* detail card */}
              <div
                className="anm-detail-card"
                style={{ borderColor: scoreBorder(selected.score || 0) }}
              >
                <div className="anm-detail-header">
                  <div>
                    <div className="anm-detail-eyebrow">Fournisseur</div>
                    <div className="anm-detail-supplier">
                      {selected.supplier || selected.supplierName || "—"}
                    </div>
                  </div>
                  <button className="anm-close" onClick={() => setSelected(null)}>
                    <X size={14} />
                  </button>
                </div>

                <div className="anm-detail-grid">
                  <DetailCell label="Identifiant" value={selected.id} />
                  <DetailCell label="Montant détecté" value={fmtAmount(selected.actualAmount || selected.amount)} />
                  <DetailCell label="Score" value={`${((selected.score || 0) * 100).toFixed(0)}%`} accent={scoreColor(selected.score || 0)} />
                  <DetailCell label="Médiane référence" value={`${madResult.median.toFixed(2)} €`} />
                  <DetailCell label="Écart habituel" value={madResult.mad.toFixed(2)} />
                  <DetailCell label="Minimum factures" value={`${minInvoiceCount} fact.`} accent="#60a5fa" />
                </div>
              </div>

              {/* chart card */}
              <div className="anm-chart-card">
                <div className="anm-chart-title">
                  <Activity size={12} />
                  Répartition des montants — zone habituelle
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <ScatterChart margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,.16)" />
                    <XAxis dataKey="index" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v) => [`${Number(v).toFixed(2)} €`, "Montant"]}
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid rgba(15,23,42,.10)",
                        background: "#fff",
                        color: "#1f2937",
                        fontSize: 11,
                        boxShadow: "0 4px 16px rgba(0,0,0,.3)",
                      }}
                    />
                    <ReferenceArea y1={madResult.lowerBound} y2={madResult.upperBound} fill="#fb7185" fillOpacity={0.05} />
                    <ReferenceLine y={madResult.median} stroke="#fb7185" strokeDasharray="5 5" strokeWidth={1.5} />
                    <ReferenceLine y={madResult.upperBound} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1} />
                    <ReferenceLine y={madResult.lowerBound} stroke="#fbbf24" strokeDasharray="3 3" strokeWidth={1} />
                    <Scatter dataKey="montant" data={chartData.filter((d) => !d.isAnomaly)} fill="#fb7185" fillOpacity={0.6} />
                    <Scatter dataKey="montant" data={chartData.filter((d) => d.isAnomaly)} fill="#fbbf24" shape="diamond" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* actions card */}
              <div className="anm-actions-card">
                <span className="anm-actions-label">Actions</span>
                <button
                  className="anm-action-btn anm-action-confirm"
                  onClick={() => handleFeedback(selected.id, "confirmed")}
                >
                  <Check size={13} strokeWidth={3} />
                  Confirmer l'anomalie
                </button>
                <button
                  className="anm-action-btn anm-action-fp"
                  onClick={() => handleFeedback(selected.id, "false_positive")}
                >
                  <ShieldCheck size={13} strokeWidth={2.5} />
                  Faux positif
                </button>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="anm-kbd">F</span>
                  <span style={{ fontSize: 9, color: "rgba(100,116,139,.62)", fontFamily: "inherit" }}>confirmer</span>
                  <span className="anm-divider" />
                  <span className="anm-kbd">D</span>
                  <span style={{ fontSize: 9, color: "rgba(100,116,139,.62)", fontFamily: "inherit" }}>rejeter</span>
                </div>
              </div>
            </>
          ) : (
            <EmptyDetail />
          )}
        </div>
      </div>
    </div>
  );
}
