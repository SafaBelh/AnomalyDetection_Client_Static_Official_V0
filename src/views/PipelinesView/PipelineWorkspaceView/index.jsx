

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Maximize2, RotateCcw, ScrollText, X } from "lucide-react";
import { C } from "@/constants/colors";
import { getPipeline, db, emit, invoicesForTenant, updatePipelineStore } from "@/store/db";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { WSFullDashboard } from "@/views/PipelinesView/PipelineWorkspaceView/DashboardTab";
import { WSMappingStep } from "./MappingStep";
import { WSCleaningStep } from "./CleaningStep";
import { WSClusterEDAStep } from "./ClusterEDAStep";
import { WSSeriesBuilder } from "./SeriesBuilder";
import { WSSeriesConfig } from "./SeriesConfigStep";
import { SideStepBar, PIPELINE_STEPS } from "./StepBar";
import { PipelineRunReportDrawer } from "@/views/PipelinesView/PipelineRunReportDrawer";
import { useToast } from "@/contexts/ToastContext";

/* ─────────────────────────────────────────────────────────────────────────
   Step page ↔ index mapping
───────────────────────────────────────────────────────────────────────── */
const STEP_PAGES = [
  "mapping",
  "cleaning",
  "clusterEDA",
  "seriesBuilder",
  "seriesConfig",
  "dashboard",
];
const MANAGE_PAGES = new Set(["mapping", "seriesConfig", "dashboard"]);

/* ─────────────────────────────────────────────────────────────────────────
   Step header chip — small breadcrumb shown above each step's content
───────────────────────────────────────────────────────────────────────── */
function StepHeader({ stepIdx, total }) {
  const step = PIPELINE_STEPS[stepIdx];
  if (!step) return null;
  const { Icon, label, desc } = step;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 22,
        paddingBottom: 16,
        borderBottom: `1px solid ${C.grey100}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(135deg,${C.red}18,${C.redMid}10)`,
          border: `1.5px solid rgba(217,79,61,.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={C.red} strokeWidth={1.8} />
      </div>
      <div>
        <div
          style={{
            fontSize: 18,
            fontFamily: "'Instrument Serif',serif",
            color: C.grey900,
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
          {desc}
          <span
            style={{
              marginLeft: 8,
              padding: "1px 7px",
              borderRadius: 99,
              background: "rgba(217,79,61,.08)",
              border: "1px solid rgba(217,79,61,.15)",
              fontSize: 9,
              fontWeight: 700,
              color: C.red,
              letterSpacing: "0.05em",
            }}
          >
            {stepIdx + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Bottom nav bar — Prev / Next buttons shown at the bottom of content
───────────────────────────────────────────────────────────────────────── */
function BottomNav({ stepIdx, total, onPrev, onNext, nextLabel, nextDisabled }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0 0",
        marginTop: 24,
        borderTop: `1px solid ${C.grey100}`,
        flexShrink: 0,
      }}
    >
      <button
        onClick={onPrev}
        disabled={stepIdx === 0}
        className="btn-ghost"
        style={{
          fontSize: 13,
          padding: "9px 18px",
          opacity: stepIdx === 0 ? 0 : 1,
          pointerEvents: stepIdx === 0 ? "none" : "auto",
        }}
      >
        <ArrowLeft size={14} /> Précédent
      </button>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === stepIdx ? 18 : 6,
              height: 6,
              borderRadius: 99,
              background:
                i < stepIdx
                  ? C.success
                  : i === stepIdx
                  ? C.red
                  : C.grey200,
              transition: "all .3s",
            }}
          />
        ))}
      </div>
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="btn-primary"
          style={{ fontSize: 13, padding: "9px 20px" }}
        >
          {nextLabel || "Suivant"} <ArrowRight size={14} color="#fff" />
        </button>
      )}
      {!onNext && <div style={{ width: 120 }} />}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Loading screen
───────────────────────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "48px 40px",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(18px)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.88)",
          boxShadow: "0 8px 32px rgba(0,0,0,.08)",
          maxWidth: 420,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg,${C.red},${C.redMid})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 6px 20px rgba(217,79,61,.3)",
          }}
        >
          <Loader2 size={26} color="#fff" className="spinner" />
        </div>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: C.grey900,
            marginBottom: 8,
            fontFamily: "'Instrument Serif',serif",
          }}
        >
          Analyse en cours…
        </h3>
        <p style={{ fontSize: 12, color: C.grey500, lineHeight: 1.6 }}>
          Modélisation des séries temporelles et détection d'anomalies
          via AnomalyIQ AI Engine…
        </p>
        <div
          style={{
            marginTop: 20,
            height: 4,
            borderRadius: 99,
            background: C.grey100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg,${C.red},${C.redMid})`,
              width: "60%",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function readConfig(pipeline) {
  const raw = pipeline?.configJson ?? pipeline?.config ?? {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return raw && typeof raw === "object" ? raw : {};
}

function invoiceRowsForPipeline(pipeline) {
  const rows = Array.isArray(wsStore.invoices) && wsStore.invoices.length > 0
    ? wsStore.invoices
    : invoicesForTenant(pipeline.tenantId, 160);
  return rows.map((inv, i) => ({
    invoice_ref: inv.invoice_ref || inv.ref || inv.id || `INV-${i + 1}`,
    invoice_date: inv.invoice_date || inv.date || inv.invoiceDate || "",
    date: inv.invoice_date || inv.date || inv.invoiceDate || "",
    amount: Number(inv.amount || inv.amountTtc || 0),
    supplier_code: inv.supplier_code || inv.supplier || inv.supplierName || "N/A",
    supplier: inv.supplier || inv.supplier_code || inv.supplierName || "N/A",
    label: inv.label || inv.category || "",
    status: inv.status || "VALIDATED",
  }));
}

function buildLocalSeries(invoices, config) {
  const groups = new Map();
  invoices.forEach((inv) => {
    const supplier = inv.supplier || inv.supplier_code || "N/A";
    const label = inv.label || "";
    const key = `${supplier}::${label}`;
    if (!groups.has(key)) groups.set(key, { supplier, label, values: [] });
    groups.get(key).values.push(Number(inv.amount || 0));
  });
  return Array.from(groups.values()).map((g, i) => {
    const n = g.values.length;
    const mu = n ? g.values.reduce((a, b) => a + b, 0) / n : 0;
    const variance = n ? g.values.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / n : 0;
    const sigma = Math.sqrt(variance);
    const cv = mu ? sigma / mu : 0;
    return {
      id: `local-series-${i + 1}`,
      name: [g.supplier, g.label].filter(Boolean).join(" · "),
      supplier: g.supplier,
      label: g.label,
      n,
      mu,
      sigma,
      cv,
      flagged: cv > 0.25 || n < 3,
      high_cv: cv > 0.25,
      low_volume: n < 3,
      tolerance_pct: config?.detection?.tolerancePct ?? 10,
      tolerance_days: config?.detection?.toleranceDays ?? 10,
      active: true,
    };
  }).sort((a, b) => b.n - a.n);
}

function buildLocalDashboardData(invoices, series) {
  const byMonth = {};
  const bySupplier = {};
  const alerts = [];
  invoices.forEach((inv, i) => {
    const date = inv.date || inv.invoice_date || "";
    const month = date.slice(0, 7);
    const amount = Number(inv.amount || 0);
    const supplier = inv.supplier || inv.supplier_code || "N/A";
    if (month) byMonth[month] = (byMonth[month] || 0) + amount;
    bySupplier[supplier] = (bySupplier[supplier] || 0) + 1;
    const s = series.find((x) => x.supplier === supplier && (x.label || "") === (inv.label || ""));
    const max = (s?.mu || 0) * (1 + (s?.tolerance_pct || 10) / 100);
    if (s && amount > max) {
      alerts.push({
        id: `local-alert-${i + 1}`,
        invoice_id: inv.invoice_ref || `INV-${i + 1}`,
        series_id: s.id,
        supplier,
        amount,
        score: Math.min(0.99, 0.75 + (amount - max) / Math.max(max, 1) / 2),
        severity: amount > max * 1.3 ? "CRITIQUE" : "ALERTE",
        status: "pending",
      });
    }
  });
  const months = Object.keys(byMonth).sort();
  return {
    alerts,
    feedbackLog: [],
    series,
    invoices,
    monthly: { months, totals: months.map((m) => byMonth[m]) },
    supplierCounts: bySupplier,
    distribution: invoices.map((inv) => Number(inv.amount || 0)).filter(Number.isFinite),
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export function PipelineWorkspaceView({
  pipelineId,
  workspaceMode = "setup",
  onBack,
  inModal = false,
  onOpenFullPage = null,
  wsPage,
  setWsPage,
  wsUploadData,
  setWsUploadData,
  wsMappingResult,
  setWsMappingResult,
  wsSeriesResult,
  setWsSeriesResult,
  wsFinalResult,
  setWsFinalResult,
  resetWsState,
}) {
  const toast = useToast();
  const pipeline = getPipeline(pipelineId);
  const manageMode = workspaceMode === "manage";
  const autoRunStarted = useRef(false);
  const page = wsPage ?? "mapping";
  const setPage = setWsPage ?? (() => {});
  const uploadData = wsUploadData ?? null;
  const setUploadData = setWsUploadData ?? (() => {});
  const mappingResult = wsMappingResult ?? null;
  const setMappingResult = setWsMappingResult ?? (() => {});
  const seriesResult = wsSeriesResult ?? null;
  const setSeriesResult = setWsSeriesResult ?? (() => {});
  const finalResult = wsFinalResult ?? null;
  const setFinalResult = setWsFinalResult ?? (() => {});
  const [reportOpen, setReportOpen] = useState(false);

  const stepIdx =
    STEP_PAGES.indexOf(page) >= 0 ? STEP_PAGES.indexOf(page) : 0;

  const pipelineConfig = useMemo(() => readConfig(pipeline), [pipeline]);
  const isAutomated = pipelineConfig?.automation?.autoRun === true || pipelineConfig?.automation?.mode === "automated" || pipelineConfig?.executionMode === "automated";
  const existingInvoices = useMemo(() => pipeline ? invoiceRowsForPipeline(pipeline) : [], [pipeline]);
  const existingSeries = useMemo(() => pipeline ? buildLocalSeries(existingInvoices, pipelineConfig) : [], [pipeline, existingInvoices, pipelineConfig]);
  const existingDashboard = useMemo(() => buildLocalDashboardData(existingInvoices, seriesResult?.series || existingSeries), [existingInvoices, seriesResult, existingSeries]);

  useEffect(() => {
    wsStore.activePipelineId = pipelineId;
  }, [pipelineId]);

  useEffect(() => {
    if (manageMode || !pipeline || !isAutomated || finalResult || autoRunStarted.current) return;
    autoRunStarted.current = true;
    setPage("dashboard-loading");
    const timer = setTimeout(() => {
      const invoices = invoiceRowsForPipeline(pipeline);
      wsStore.invoices = invoices;
      const fields = Object.keys(invoices[0] || {});
      const mapping = {
        cols: {
          id: "invoice_ref",
          date: "invoice_date",
          amount: "amount",
          supplier: "supplier_code",
          label: "label",
          status: "status",
        },
        extraCols: fields.filter((f) => !["invoice_ref", "invoice_date", "amount", "supplier_code", "label", "status"].includes(f)),
        statusConfig: pipelineConfig.statusWorkflow || null,
      };
      const series = buildLocalSeries(invoices, pipelineConfig);
      const dashboard = buildLocalDashboardData(invoices, series);
      setMappingResult(mapping);
      setSeriesResult({ series, groupFields: ["supplier_code", "label"] });
      setFinalResult(dashboard);
      setPage("dashboard");
    }, 1200);
    return () => clearTimeout(timer);
  }, [manageMode, pipeline, isAutomated, finalResult, setMappingResult, setSeriesResult, setFinalResult, setPage, pipelineConfig]);

  useEffect(() => {
    if (!pipeline || page !== "dashboard-loading" || finalResult) return;
    const timer = setTimeout(() => {
      const invoices = invoiceRowsForPipeline(pipeline);
      wsStore.invoices = invoices;
      const fields = Object.keys(invoices[0] || {});
      const mapping = {
        cols: {
          id: "invoice_ref",
          date: "invoice_date",
          amount: "amount",
          supplier: "supplier_code",
          label: "label",
          status: "status",
        },
        extraCols: fields.filter((f) => !["invoice_ref", "invoice_date", "amount", "supplier_code", "label", "status"].includes(f)),
        statusConfig: pipelineConfig.statusWorkflow || null,
      };
      const series = buildLocalSeries(invoices, pipelineConfig);
      const dashboard = buildLocalDashboardData(invoices, series);
      setMappingResult(mapping);
      setSeriesResult({ series, groupFields: ["supplier_code", "label"] });
      setFinalResult(dashboard);
      setPage("dashboard");
    }, 1800);
    return () => clearTimeout(timer);
  }, [pipeline, page, finalResult, pipelineConfig, setMappingResult, setSeriesResult, setFinalResult, setPage]);

  const handleNavigate = (idx) => {
    const target = STEP_PAGES[idx];
    if (manageMode && target && !MANAGE_PAGES.has(target)) return;
    if (target) setPage(target);
  };

  /* keyboard navigation */
  useEffect(() => {
    const h = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" && stepIdx < STEP_PAGES.length - 1) {
        e.preventDefault();
        handleNavigate(stepIdx + 1);
      }
      if (e.key === "ArrowLeft" && stepIdx > 0) {
        e.preventDefault();
        handleNavigate(stepIdx - 1);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [stepIdx]);

  const reset = async () => {
    if (resetWsState) {
      await resetWsState();
    } else {
      await wsAPI.resetDatabase();
      setUploadData(null);
      setMappingResult(null);
      setSeriesResult(null);
      setFinalResult(null);
      setPage("mapping");
    }
  };

  if (!pipeline)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 18, marginBottom: 12, color: C.grey900 }}>
          Pipeline introuvable
        </div>
        <button onClick={onBack} className="btn-primary">
          ← Retour
        </button>
      </div>
    );

  /* ── Step content ──────────────────────────────────────────────────── */
  const renderStep = () => {
    if (page === "dashboard-loading") return <LoadingScreen />;

    if (manageMode && !MANAGE_PAGES.has(page)) {
      return (
        <div className="glass-card" style={{ padding: 22, borderRadius: 18, border: `1px solid rgba(245,158,11,.25)`, background: "rgba(255,255,255,.86)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.warning, fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
            <AlertCircle size={16} /> Étape de ré-import bloquée
          </div>
          <div style={{ fontSize: 12, color: C.grey600, lineHeight: 1.55 }}>
            Ce pipeline existe déjà. Pour éviter d'importer les mêmes données deux fois, seules les actions de gestion sont disponibles ici : mapping, configuration des séries et dashboard.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="btn-primary" onClick={() => setPage("seriesConfig")} style={{ fontSize: 12 }}>Gérer les séries</button>
            <button className="btn-ghost" onClick={() => setPage("mapping")} style={{ fontSize: 12 }}>Modifier le mapping</button>
          </div>
        </div>
      );
    }

    if (page === "mapping")
      return (
        <WSMappingStep
          uploadData={uploadData}
          manageMode={manageMode}
          onConfirm={(d) => {
            setMappingResult(d);
            if (manageMode) {
              updatePipelineStore(pipeline.id, {
                configJson: {
                  ...(pipelineConfig || {}),
                  mapping: {
                    cols: d.cols || {},
                    extraCols: d.extraCols || [],
                  },
                },
              });
            }
            if (d.statusConfig) {
              updatePipelineStore(pipeline.id, {
                configJson: {
                  ...(pipeline.configJson || {}),
                  ...d.statusConfig,
                },
              });
            }
            if (d.extraCols && d.extraCols.length > 0) {
              updatePipelineStore(pipeline.id, {
                extraData: JSON.stringify(d.extraCols),
              });
            }
            if (manageMode) toast("Mapping enregistré", "success");
            setPage(manageMode ? "seriesConfig" : "cleaning");
          }}
          onNavigate={handleNavigate}
        />
      );

    if (page === "cleaning")
      return (
        <WSCleaningStep
          onConfirm={() => setPage("clusterEDA")}
          onNavigate={handleNavigate}
        />
      );

    if (page === "clusterEDA")
      return (
        <WSClusterEDAStep
          pipeline={pipeline}
          onConfirm={() => setPage("seriesBuilder")}
          onBack={() => setPage("cleaning")}
          onNavigate={handleNavigate}
        />
      );

    if (page === "seriesBuilder")
      return (
        <WSSeriesBuilder
          cols={mappingResult?.cols || {}}
          extraCols={mappingResult?.extraCols || []}
          onConfirm={(r) => {
            setSeriesResult(r);
            setPage("seriesConfig");
          }}
          onNavigate={handleNavigate}
        />
      );

    if (page === "seriesConfig")
      return (
        <WSSeriesConfig
          series={seriesResult?.series || existingSeries}
          onConfirm={async (updatedSeries) => {
            if (manageMode) {
              setSeriesResult({ ...(seriesResult || {}), series: updatedSeries || existingSeries });
              updatePipelineStore(pipeline.id, {
                configJson: {
                  ...(pipelineConfig || {}),
                  seriesOverrides: (updatedSeries || existingSeries).map((item) => ({
                    id: item.id,
                    tolerance_pct: item.tolerance_pct,
                    tolerance_days: item.tolerance_days,
                    use_seasonality: item.use_seasonality,
                    forecast_start_today: item.forecast_start_today,
                    active: item.active !== false,
                  })),
                },
              });
              toast("Changements enregistrés", "success");
              return;
            }
            setPage("dashboard-loading");
            try {
              await wsAPI.runDetection();
              const s = await wsAPI.listSeries();
              const a = await wsAPI.getAlerts("pending");

              const dbAlerts = a.map((wa) => ({
                id: `ALT-${pipeline.tenantId}-${
                  pipeline.erpPartnerId || "ANY"
                }-${wa.id}`,
                tenantId: pipeline.tenantId,
                erpPartnerId: pipeline.erpPartnerId,
                type: "anomaly",
                severity: wa.score > 0.85 ? "critical" : "warning",
                message: `Facture anormale détectée — ${wa.supplier} (${wa.amount} €)`,
                timestamp: new Date().toISOString(),
                read: false,
                invoiceRef: wa.invoice_id,
                anomalyScore: wa.score,
              }));

              dbAlerts.forEach((da) => {
                if (
                  !db.alerts.some(
                    (existing) => existing.invoiceRef === da.invoiceRef
                  )
                ) {
                  db.alerts.push(da);
                }
              });
              emit();

              setSeriesResult({ ...seriesResult, series: s });
              setFinalResult({ alerts: a, feedbackLog: [], series: s });
              setPage("dashboard");
            } catch (e) {
              console.error(e);
              const s = seriesResult?.series || buildLocalSeries(invoiceRowsForPipeline(pipeline), pipelineConfig);
              const dashboard = buildLocalDashboardData(invoiceRowsForPipeline(pipeline), s);
              setSeriesResult({ ...seriesResult, series: s });
              setFinalResult(dashboard);
              setPage("dashboard");
            }
          }}
          confirmLabel={manageMode ? "Enregistrer les changements" : "Sauvegarder la configuration"}
          saveLocalOnly={manageMode}
          onNavigate={handleNavigate}
        />
      );

    if (page === "dashboard")
      return (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button className="btn-ghost" onClick={() => setReportOpen(true)} style={{ fontSize: 12, padding: "7px 12px" }}>
              <ScrollText size={14} /> Rapport d'exécution
            </button>
          </div>
          <WSFullDashboard
            {...(finalResult || existingDashboard)}
            series={seriesResult?.series || existingSeries}
            groupFields={seriesResult?.groupFields || []}
            onReset={reset}
            manageMode={manageMode}
          />
        </>
      );

    return null;
  };

  const isDashboard = page === "dashboard" || page === "dashboard-loading";
  const isLoading = page === "dashboard-loading";

  /* ── Workspace shell ──────────────────────────────────────────────── */
  const workspaceShell = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(255,255,255,0.88)",
          flexShrink: 0,
          gap: 12,
          zIndex: 10,
        }}
      >
        {/* Left: back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onBack}
            className="btn-icon"
            title="Retour"
            style={{ flexShrink: 0 }}
          >
            <ArrowLeft size={15} color={C.grey600} />
          </button>
          <div
            style={{
              width: 1,
              height: 20,
              background: C.grey200,
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.grey900,
                lineHeight: 1.2,
              }}
            >
              {pipeline.name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.grey500,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 1,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: pipeline.status === "paused" ? C.grey400 : C.success,
                  boxShadow: pipeline.status === "paused" ? `0 0 0 3px rgba(107,114,128,.16)` : `0 0 0 3px rgba(34,197,94,.2)`,
                }}
              />
              <span>Pipeline {pipeline.status === "paused" ? "en pause" : "actif"}</span>
              <span style={{ color: C.success, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                <CheckCircle2 size={10} /> Données demo
              </span>
              {manageMode && (
                <span style={{ color: C.warning, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <AlertCircle size={10} /> Mode gestion
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!manageMode && (
            <button
              onClick={reset}
              className="btn-ghost"
              style={{ fontSize: 11, padding: "6px 12px", gap: 5 }}
            >
              <RotateCcw size={12} color={C.grey500} />
              Nouveau CSV
            </button>
          )}

          {onOpenFullPage && (
            <button
              onClick={onOpenFullPage}
              className="btn-ghost"
              style={{ fontSize: 11, padding: "6px 12px", gap: 5 }}
            >
              <Maximize2 size={12} color={C.grey500} />
              Plein écran
            </button>
          )}

          {inModal && (
            <button onClick={onBack} className="btn-icon">
              <X size={15} color={C.grey500} />
            </button>
          )}
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Sidebar — hidden on dashboard to give full width */}
        {!isDashboard && (
          <SideStepBar
            step={stepIdx}
            onNavigate={handleNavigate}
            pipelineName={pipeline.name}
            connector={pipeline.connector}
            disabledPages={manageMode ? ["cleaning", "clusterEDA", "seriesBuilder"] : []}
          />
        )}

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: isDashboard
              ? "rgba(240,237,232,0.55)"
              : "rgba(248,247,245,0.6)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {isLoading ? (
            <LoadingScreen />
          ) : isDashboard ? (
            /* Dashboard gets full width, no padding wrapper */
            <div style={{ padding: "24px 28px" }}>{renderStep()}</div>
          ) : (
            /* Regular steps: white content card */
            <div
              style={{
                maxWidth: 860,
                width: "100%",
                margin: "24px auto",
                padding: "0 24px 40px",
              }}
            >
              {manageMode && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(245,158,11,.24)", background: "rgba(245,158,11,.07)", marginBottom: 12 }}>
                  <AlertCircle size={15} color={C.warning} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: C.grey800 }}>Gestion du pipeline existant</div>
                    <div style={{ fontSize: 11, color: C.grey500, lineHeight: 1.45, marginTop: 2 }}>
                      Les actions de ré-import, nettoyage, clustering et redétection sont bloquées pour éviter de charger les mêmes données deux fois. Vous pouvez modifier le mapping ou les séries, puis enregistrer.
                    </div>
                  </div>
                </div>
              )}

              {/* Step header chip */}
              <StepHeader
                stepIdx={stepIdx}
                total={PIPELINE_STEPS.length}
              />

              {/* Step content — each step renders its own UI */}
              <div className="fade-in">{renderStep()}</div>
            </div>
          )}
        </div>
      </div>
      <PipelineRunReportDrawer
        open={reportOpen}
        pipeline={pipeline}
        tenantName={db.activeTenantName || pipeline.tenantId}
        finalResult={finalResult}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );

  /* ── Modal mode ──────────────────────────────────────────────────── */
  if (inModal) {
    return createPortal(
      <div className="modal-overlay" style={{ padding: 16 }}>
        <div className="modal-bg" onClick={onBack} />
        <div
          className="modal-box scale-in"
          style={{
            width: "100%",
            maxWidth: "100%",
            height: "min(calc(100vh - 32px),100%)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 0,
            background: "rgba(240,237,232,0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {workspaceShell}
        </div>
      </div>,
      document.body
    );
  }

  /* ── Standalone page mode ──────────────────────────────────────────── */
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      {workspaceShell}
    </div>
  );
}
