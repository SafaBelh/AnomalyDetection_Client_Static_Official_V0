import { useEffect, useMemo, useState } from "react";
import { GitBranchPlus } from "lucide-react";
import { Radar } from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { getPipeline, invoicesForTenant, pipelinesForTenant, runMLAnalysis, updatePipelineStore, useAuth, useStore, visibleTenants } from "@/store/db";
import { addAuditEntry } from "@/utils/audit";
import { fmtK } from "@/utils/formatters";
import { MLContent } from "@/views/pipelines/MLContent";
import { PipelineConfigForm } from "../pipelines/PipelineConfigForm";
import { PipelineWorkspaceView } from "@/views/PipelinesView/PipelineWorkspaceView";
import { PipelineRunReportDrawer } from "@/views/PipelinesView/PipelineRunReportDrawer";
export function PipelinesView({ onNavigateToPipeline, onOpenSeriesConfig }) {
  const toast = useToast();
  const { tenant, isEngineAdmin } = useAuth();
  const [mlPipeline, setMlPipeline] = useState(null);
  const [configPipeline, setConfigPipeline] = useState(null);
  const [auditPipeline, setAuditPipeline] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // ── Workspace modal state (lifted so it survives modal↔fullscreen toggle) ──
  const [workspacePipelineId, setWorkspacePipelineId] = useState(null);
  const [wsPage, setWsPage] = useState("mapping");
  const [wsUploadData, setWsUploadData] = useState(null);
  const [wsMappingResult, setWsMappingResult] = useState(null);
  const [wsSeriesResult, setWsSeriesResult] = useState(null);
  const [wsFinalResult, setWsFinalResult] = useState(null);

  const openWorkspaceModal = (id) => {
    setWorkspacePipelineId(id);
    setWsPage("mapping");
    setWsUploadData(null);
    setWsMappingResult(null);
    setWsSeriesResult(null);
    setWsFinalResult(null);
  };

  useEffect(() => {
    if (!workspacePipelineId) return;
    try {
      localStorage.setItem(`anomalyiq.workspace.${workspacePipelineId}`, JSON.stringify({
        mappingResult: wsMappingResult,
        seriesResult: wsSeriesResult,
        finalResult: wsFinalResult,
        updatedAt: new Date().toISOString(),
      }));
    } catch {}
  }, [workspacePipelineId, wsMappingResult, wsSeriesResult, wsFinalResult]);

  useStore();
  const [adminTenantFilter, setAdminTenantFilter] = useState("");
  const allTenants = useMemo(() => {
    if (!isEngineAdmin) return [];
    try { return visibleTenants(); } catch (e) { return []; }
  }, [isEngineAdmin]);

  if (!tenant && !isEngineAdmin) return null;
  const pipelines = tenant ? pipelinesForTenant(tenant.id) : isEngineAdmin && adminTenantFilter ? pipelinesForTenant(adminTenantFilter) : isEngineAdmin ? allTenants.flatMap(t => pipelinesForTenant(t.id)) : [];
  const actifs = pipelines.filter((p) => p.status === "actif").length;

  return (
    <div
      className="fade-up"
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <PageHeader
        eyebrow="Automation"
        title="Pipelines"
        subtitle={<>{pipelines.length} pipeline{pipelines.length > 1 ? "s" : ""} · {actifs} actif{actifs > 1 ? "s" : ""} · <strong style={{ color: C.red }}>{tenant?.name || (adminTenantFilter ? allTenants.find(t => t.id === adminTenantFilter)?.name || adminTenantFilter : "Tous les tenants")}</strong></>}
        actions={(
          <>
          {!tenant && isEngineAdmin && allTenants.length > 0 && (
            <select value={adminTenantFilter} onChange={e => setAdminTenantFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${C.grey200}`, fontSize: 11, fontFamily: "inherit", outline: "none", background: "rgba(255,255,255,.88)" }}>
              <option value="">Tous les tenants</option>
              {allTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
          {pipelines.length > 0 && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nouveau pipeline
            </button>
          )}
          </>
        )}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 14,
        }}
      >
        {pipelines.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={<GitBranchPlus size={32} color={C.red} strokeWidth={1.8} />}
              title="Aucun pipeline configuré"
              subtitle="Créez votre premier pipeline pour commencer à analyser vos factures et détecter des anomalies automatiquement."
              cta="Créer votre premier pipeline →"
              onCta={() => setShowCreate(true)}
            />
          </div>
        )}
        {pipelines.map((p) => {
          const isPaused = p.status === "paused";
          const isError = p.status === "warning";
          const invs = invoicesForTenant(
            p.tenantId,
            Math.min(p.invoicesProcessed || 80, 200)
          );
          const anomalyCount = invs.filter(
            (i) => i.status === "anomaly"
          ).length;
          const amounts = invs.map((i) => i.amount);
          const avgAmt = amounts.length
            ? amounts.reduce((a, b) => a + b, 0) / amounts.length
            : 0;
          const anomalyRate = (anomalyCount / Math.max(1, invs.length)) * 100;
          const statusColor =
            p.status === "actif" ? C.success : isError ? C.warning : C.grey400;
          const statusBg =
            p.status === "actif"
              ? "rgba(34,197,94,.1)"
              : isError
              ? "rgba(245,158,11,.1)"
              : "rgba(107,114,128,.08)";
          const statusBorder =
            p.status === "actif"
              ? "rgba(34,197,94,.3)"
              : isError
              ? "rgba(245,158,11,.3)"
              : "rgba(107,114,128,.2)";
          const statusLabel =
            p.status === "actif" ? "Actif" : isError ? "Alerte" : "En pause";
          const statusIcon =
            p.status === "actif"
              ? "check"
              : isError
              ? "triangle"
              : "pauseCircle";
          return (
            <div
              key={p.id}
              className="glass-card"
              onClick={() => onNavigateToPipeline(p.id, "seriesConfig", { mode: "manage" })}
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.grey900,
                      marginBottom: 3,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.grey500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: statusColor,
                        display: "inline-block",
                      }}
                    />
                    {p.connector} · {p.freq}
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: statusBg,
                    color: statusColor,
                    border: `1px solid ${statusBorder}`,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon name={statusIcon} size={11} color={statusColor} />
                  {statusLabel}
                </span>
              </div>
              {p.description && (
                <p
                  style={{
                    fontSize: 11,
                    color: C.grey500,
                    lineHeight: 1.4,
                    marginTop: -4,
                  }}
                >
                  {p.description}
                </p>
              )}
              {/* Sparkline — anomaly rate last 12 months */}
              {(() => {
                const ml = runMLAnalysis(p.id);
                const spark = ml.monthly.slice(-12);
                if (spark.length < 2) return null;
                const rates = spark.map(m => m.total > 0 ? (m.anomalies / m.total) * 100 : 0);
                const maxR = Math.max(...rates, 0.1);
                const H = 32, W = 100;
                const pts = rates.map((r, i) => {
                  const x = (i / (rates.length - 1)) * W;
                  const y = H - (r / maxR) * H;
                  return `${x},${y}`;
                }).join(" ");
                const lastRate = rates[rates.length - 1];
                const trend = rates.length > 1 ? lastRate - rates[rates.length - 2] : 0;
                const trendColor = trend > 0.5 ? C.red : trend < -0.5 ? C.success : C.warning;
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                    <svg width={W} height={H} style={{ flex: "0 0 auto" }}>
                      <polyline points={pts} fill="none" stroke={trendColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
                      <circle cx={pts.split(" ").at(-1)?.split(",")[0]} cy={pts.split(" ").at(-1)?.split(",")[1]} r="2.5" fill={trendColor} />
                    </svg>
                    <span style={{ fontSize: 9, color: C.grey400, whiteSpace: "nowrap" }}>
                      Taux anomalies — 12 mois
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: trendColor, marginLeft: "auto" }}>
                      {trend > 0.5 ? "↑" : trend < -0.5 ? "↓" : "→"} {lastRate.toFixed(1)}%
                    </span>
                  </div>
                );
              })()}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                }}
              >
                {[
                  {
                    lbl: "Factures",
                    val: p.invoicesProcessed.toLocaleString("fr-FR"),
                    sub: null,
                    bg: "rgba(107,114,128,.05)",
                    color: C.grey900,
                  },
                  {
                    lbl: "Taux anomalies",
                    val: `${anomalyRate.toFixed(1)}%`,
                    sub: `${anomalyCount} détectées`,
                    bg: "rgba(245,158,11,.07)",
                    color: anomalyRate > 3 ? C.red : C.warning,
                  },
                  {
                    lbl: "Montant moy.",
                    val: fmtK(Math.round(avgAmt)),
                    sub: `sur ${invs.length} fact.`,
                    bg: "rgba(59,130,246,.06)",
                    color: C.info,
                  },
                ].map((k) => (
                  <div
                    key={k.lbl}
                    style={{
                      borderRadius: 10,
                      padding: "10px 12px",
                      background: k.bg,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: C.grey500,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {k.lbl}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Instrument Serif',serif",
                        fontSize: 22,
                        color: k.color,
                        marginTop: 2,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {k.val}
                    </div>
                    {k.sub && (
                      <div
                        style={{ fontSize: 9, color: C.grey400, marginTop: 1 }}
                      >
                        {k.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  borderTop: `1px solid ${C.grey100}`,
                }}
              >
                <span style={{ fontSize: 10, color: C.grey400 }}>
                  Dernier run :{" "}
                  {new Date(p.lastRun).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <div style={{ display: "flex", gap: 5 }}>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setAuditPipeline(p);
                    }}
                    className="btn-icon"
                    title="Audit du dernier run"
                  >
                    <Icon name="fileText" size={15} color={C.grey600} />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setMlPipeline(p);
                    }}
                    className="btn-icon"
                    title="Analyse ML"
                  >
                    <Icon name="sparkle" size={15} color={C.grey600} />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setConfigPipeline(p);
                    }}
                    className="btn-icon"
                    title="Configurer"
                  >
                    <Icon name="gear" size={15} color={C.grey600} />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      updatePipelineStore(p.id, {
                        status: isPaused ? "actif" : "paused",
                      });
                      toast(
                        isPaused ? "Pipeline démarré" : "Pipeline mis en pause",
                        "info"
                      );
                    }}
                    className="btn-icon"
                    title={isPaused ? "Démarrer" : "Mettre en pause"}
                  >
                    <Icon
                      name={isPaused ? "play" : "pauseCircle"}
                      size={15}
                      color={C.grey600}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
      </div>

      <Modal
        open={!!mlPipeline}
        onClose={() => setMlPipeline(null)}
        size="1280px"
        title={mlPipeline ? `Analyse ML — ${mlPipeline.name}` : ""}
        subtitle="Vue analytics complète · Tendances · Anomalies · Séries · Radar · Scores · Insights IA"
        icon={
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.red},${C.purple})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(217,79,61,.3)",
            }}
          >
            <Icon name="sparkle" size={18} color="#fff" />
          </div>
        }
      >
        {mlPipeline && <MLContent pipeline={mlPipeline} />}
      </Modal>

      <PipelineRunReportDrawer
        open={!!auditPipeline}
        pipeline={auditPipeline}
        tenantName={auditPipeline ? (allTenants.find(t => t.id === auditPipeline.tenantId)?.name || tenant?.name) : ""}
        onClose={() => setAuditPipeline(null)}
      />

      <Modal
        open={!!configPipeline}
        onClose={() => setConfigPipeline(null)}
        size="1200px"
        noScroll
        title={configPipeline ? `Configuration — ${configPipeline.name}` : ""}
        subtitle="Connexion · Tolérances · MAD"
        icon={
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(217,79,61,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="gear" size={18} color={C.red} />
          </div>
        }
      >
        {configPipeline && (
          <PipelineConfigForm
            pipeline={configPipeline}
            mode="compact"
            onCancel={() => setConfigPipeline(null)}
            onSubmitted={() => {
              setConfigPipeline(null);
              toast("Pipeline mis à jour", "success");
            }}
          />
        )}
      </Modal>

      {/* ── Pipeline workspace modal (opened after pipeline creation) ── */}
      {workspacePipelineId && (
        <PipelineWorkspaceView
          pipelineId={workspacePipelineId}
          inModal={true}
          onBack={() => setWorkspacePipelineId(null)}
          onOpenFullPage={() => onNavigateToPipeline(workspacePipelineId, wsPage)}
          wsPage={wsPage}
          setWsPage={setWsPage}
          wsUploadData={wsUploadData}
          setWsUploadData={setWsUploadData}
          wsMappingResult={wsMappingResult}
          setWsMappingResult={setWsMappingResult}
          wsSeriesResult={wsSeriesResult}
          setWsSeriesResult={setWsSeriesResult}
          wsFinalResult={wsFinalResult}
          setWsFinalResult={setWsFinalResult}
          resetWsState={() => {
            try { localStorage.removeItem(`anomalyiq.workspace.${workspacePipelineId}`); } catch {}
            setWsPage("mapping");
            setWsUploadData(null);
            setWsMappingResult(null);
            setWsSeriesResult(null);
            setWsFinalResult(null);
          }}
        />
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        size="1200px"
        noScroll
        title="Nouveau pipeline"
        subtitle="Pipeline · connexion · config globale — sur un seul écran"
        icon={
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.red},${C.redMid})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="sparkle" size={18} color="#fff" />
          </div>
        }
      >
        <PipelineConfigForm
          mode="wizard"
          tenantId={tenant?.id || adminTenantFilter || allTenants[0]?.id || null}
          onCancel={() => setShowCreate(false)}
          onSubmitted={(id) => {
            if (!id) {
              toast("Impossible de créer le pipeline : aucun tenant sélectionné", "error");
              return;
            }
            setShowCreate(false);
            openWorkspaceModal(id);
            toast("Pipeline créé !", "success");
            const p = getPipeline(id);
            addAuditEntry("Pipeline créé", `${p?.name || id} — connecteur ${p?.connector || ""}`);
          }}
        />
      </Modal>
    </div>
  );
}
