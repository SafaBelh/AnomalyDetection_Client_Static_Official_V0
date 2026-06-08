import { useState, useEffect, useMemo } from "react";
import { BellOff, Check, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { markAlertRead, pipelinesForTenant, useAuth, useStore, visibleTenants } from "@/store/db";
import { downloadCSV } from "@/store/wsAPI";
import { addAuditEntry } from "@/utils/audit";
import { sevColor } from "@/utils/formatters";
import { apiGet, apiPatch, apiPost } from "@/utils/api";

export function AlertsView() {
  const toast = useToast();
  const { tenant, isEngineAdmin } = useAuth();
  const [tab, setTab] = useState("toutes");
  const [localAlerts, setLocalAlerts] = useState([]);
  const [adminTenantFilter, setAdminTenantFilter] = useState("");
  useStore();

  const allTenants = useMemo(() => {
    if (!isEngineAdmin) return [];
    try { return visibleTenants(); } catch (e) { return []; }
  }, [isEngineAdmin]);

  useEffect(() => {
    if (!tenant?.id && !isEngineAdmin) return;
    apiGet("/alerts", { size: 100 })
      .then((res) => {
        const apiAlerts = res?.content || [];
        const tid = tenant?.id || adminTenantFilter;
        const filtered = tid ? apiAlerts.filter(a => !a.tenantId || a.tenantId === tid) : apiAlerts;
        setLocalAlerts(filtered.map(a => ({
          ...a,
          tenantId: a.tenantId || tid || "admin",
          severity: a.severity?.toLowerCase() === "critique" ? "critical" : a.severity?.toLowerCase() || "warning",
          type: (a.type || a.anomalyType || "anomaly").toLowerCase(),
          message: a.message || a.explanation || "",
          status: a.status?.toLowerCase() === "read" ? "read" : a.status?.toLowerCase() || "en_attente",
          read: a.read === true || a.status?.toUpperCase?.() === "READ" || a.status?.toUpperCase?.() === "RESOLVED",
          timestamp: a.detectedAt || a.detectionDate || a.createdAt || a.timestamp,
        })));
      })
      .catch(err => console.error("Failed to fetch alerts:", err));
  }, [tenant?.id, isEngineAdmin, adminTenantFilter]);

  if (!tenant && !isEngineAdmin) return null;
  const allAlerts = localAlerts
    .slice()
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const pipelines = tenant ? pipelinesForTenant(tenant.id) : [];
  const pipelineNameOf = (a) =>
    pipelines.find((p) => p.id === a.pipelineId)?.name;
  const counts = {
    critique: allAlerts.filter((a) => a.severity === "critical").length,
    attention: allAlerts.filter((a) => a.severity === "warning").length,
    info: allAlerts.filter((a) => a.severity === "info").length,
    pending: allAlerts.filter((a) => !a.read).length,
  };
  const filtered = allAlerts.filter((a) => {
    if (tab === "toutes") return true;
    if (tab === "en_attente") return a.status === "en_attente";
    return a.type === tab;
  });
  const TABS = [
    { id: "toutes", label: "Toutes" },
    { id: "en_attente", label: "En attente" },
    { id: "anomaly", label: "Anomalies" },
    { id: "pipeline", label: "Pipelines" },
    { id: "system", label: "Système" },
  ];
  const sevLabel = (s) =>
    s === "critical" ? "Critique" : s === "warning" ? "Attention" : "Info";
  const updateLocalAlert = (id, patch) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };
  const handleMarkRead = async (a) => {
    try { await apiPatch(`/alerts/${a.id}/status`, { status: "READ" }); } catch (e) { console.error("Mark read failed:", e); }
    await markAlertRead(a.id);
    updateLocalAlert(a.id, { read: true, status: a.status === "en_attente" ? a.status : "read" });
    toast("Alerte marquée comme lue", "success");
  };
  const handleMarkAllRead = async () => {
    const unread = filtered.filter((a) => !a.read);
    await Promise.all(unread.map((a) => handleMarkRead(a)));
  };
  const handleConfirm = async (a) => {
    try { await apiPost(`/feedback/${a.id}`, { decision: "CONFIRMED", comment: "" }); } catch (e) { console.error("Feedback failed:", e); }
    updateLocalAlert(a.id, { status: "confirmée", read: true });
    toast("Anomalie confirmée — alerte envoyée.", "success");
    addAuditEntry("Anomalie confirmée", `${a.invoiceRef || a.id} — ${(a.message || "").slice(0, 60)}`);
  };
  const handleFalse = async (a) => {
    try { await apiPost(`/feedback/${a.id}`, { decision: "REJECTED", comment: "Faux positif" }); } catch (e) { console.error("Feedback failed:", e); }
    updateLocalAlert(a.id, { status: "rejetée", read: true });
    toast("Faux positif — modèle ML réajuste le seuil K.", "info");
    addAuditEntry("Faux positif", `${a.invoiceRef || a.id} — ${(a.message || "").slice(0, 60)}`);
  };
  const handleIgnore = async (a) => {
    try { await apiPost(`/feedback/${a.id}`, { decision: "IGNORED", comment: "" }); } catch (e) { console.error("Feedback failed:", e); }
    updateLocalAlert(a.id, { status: "ignorée", read: true });
    toast("Alerte ignorée.", "warning");
    addAuditEntry("Alerte ignorée", `${a.id} — ${(a.message || "").slice(0, 60)}`);
  };
  return (
    <div
      className="fade-up"
      style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}
    >
      <PageHeader
        eyebrow="Monitoring"
        title="Centre d'alertes"
        subtitle={<>{counts.pending} en attente{counts.critique > 0 && <span style={{ color: C.red, fontWeight: 700, marginLeft: 6 }}>· {counts.critique} critiques</span>}</>}
        actions={(
          <>
          {[
            { k: "Critique", c: C.red, n: counts.critique },
            { k: "Attention", c: C.warning, n: counts.attention },
            { k: "Info", c: C.info, n: counts.info },
          ].map((x) => (
            <div
              key={x.k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${x.c}25`,
                background: `${x.c}0d`,
                color: C.grey900,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: x.c,
                }}
              />
              {x.k} ({x.n})
            </div>
          ))}
          </>
        )}
      />
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab${tab === t.id ? " active" : ""}`}
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            {t.label}
          </button>
        ))}
        {!tenant && isEngineAdmin && allTenants.length > 0 && (
          <select value={adminTenantFilter} onChange={e => setAdminTenantFilter(e.target.value)} style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${C.grey200}`, fontSize: 11, fontFamily: "inherit", outline: "none" }}>
            <option value="">Tous les tenants</option>
            {allTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        </div>
        <button
          className="btn-ghost"
          style={{ fontSize: 11, padding: "5px 12px" }}
          onClick={() => {
            downloadCSV(filtered.map(a => ({
              id: a.id,
              type: a.type,
              severite: a.severity,
              message: a.message,
              timestamp: a.timestamp,
              lu: a.read ? "oui" : "non",
              ref_facture: a.invoiceRef || "",
              score: a.anomalyScore || "",
            })), `alertes-${tenant?.name || "admin"}-${new Date().toISOString().slice(0, 10)}.csv`);
            addAuditEntry("Export CSV", `Alertes — ${filtered.length} lignes exportées`);
          }}
        >
          <Download size={12} /> Exporter CSV ({filtered.length})
        </button>
        {filtered.some((a) => !a.read) && (
          <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }} onClick={handleMarkAllRead}>
            <Check size={12} /> Tout marquer lu
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <EmptyState icon={<BellOff size={32} color={C.red} strokeWidth={1.8} />} title="Aucune alerte" subtitle="Aucune alerte ne correspond à ce filtre pour le moment." />
        )}
        {filtered.map((a, i) => {
          const color = sevColor(a.severity);
          const score = Math.round((a.anomalyScore ?? 0) * 100);
          const pipelineName = pipelineNameOf(a);
          const dateValue = a.timestamp ? new Date(a.timestamp) : null;
          const time = dateValue && !Number.isNaN(dateValue.getTime())
            ? dateValue.toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Date non disponible";
          return (
            <div
              key={a.id}
              className="glass-card"
              style={{
                padding: 20,
                opacity: a.read ? 0.78 : 1,
                boxShadow: `0 2px 12px ${color}12`,
                border: `1px solid ${color}15`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${color}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `inset 0 0 0 1px ${color}20`,
                  }}
                >
                  <Icon
                    name={
                      a.type === "pipeline"
                        ? "pipelines"
                        : a.severity === "critical"
                        ? "triangle"
                        : a.severity === "warning"
                        ? "triangle"
                        : "alerts"
                    }
                    size={18}
                    color={color}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.grey900,
                        lineHeight: 1.4,
                      }}
                    >
                      {a.message}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <span
                        className="badge"
                        style={{
                          background: `${color}18`,
                          color,
                          border: `1px solid ${color}28`,
                        }}
                      >
                        {sevLabel(a.severity)}
                      </span>
                      {a.status && (
                        <span
                          className="badge"
                          style={{
                            background: a.status === 'en_attente' ? `${C.warning}18` : a.status === 'confirmée' ? `${C.success}18` : a.status === 'rejetée' ? `${C.info}18` : `${C.grey500}18`,
                            color: a.status === 'en_attente' ? C.warning : a.status === 'confirmée' ? C.success : a.status === 'rejetée' ? C.info : C.grey500,
                            border: `1px solid ${a.status === 'en_attente' ? C.warning : a.status === 'confirmée' ? C.success : a.status === 'rejetée' ? C.info : C.grey500}28`,
                          }}
                        >
                          {a.status === 'en_attente' ? 'En attente' : a.status === 'confirmée' ? 'Confirmée' : a.status === 'rejetée' ? 'Rejetée' : 'Ignorée'}
                        </span>
                      )}
                      {!a.read && (
                        <button
                          onClick={() => handleMarkRead(a)}
                          className="btn-ghost"
                          style={{ fontSize: 10, padding: "3px 8px" }}
                        >
                          <Check size={11} /> Marquer lu
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                      fontSize: 10,
                      color: C.grey500,
                      marginBottom:
                        a.type === "anomaly" && a.anomalyScore !== undefined
                          ? 10
                          : 0,
                    }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                      <Clock size={11} color={C.grey500} style={{ flexShrink: 0 }} />
                      <span>{time}</span>
                    </span>
                    <Badge type="mute">{tenant?.name || allTenants.find(t => t.id === a.tenantId)?.name || a.tenantId}</Badge>
                    {pipelineName && (
                      <Badge type="mute">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Icon name="pipelines" size={10} color={C.grey500} />
                          {pipelineName}
                        </span>
                      </Badge>
                    )}
                    {a.invoiceRef && (
                      <span
                        style={{ fontFamily: "'JetBrains Mono',monospace" }}
                      >
                        #{a.invoiceRef}
                      </span>
                    )}
                  </div>
                  {a.type === "anomaly" && a.anomalyScore !== undefined && (
                    <div>
                      <div
                        style={{
                          fontSize: 9,
                          color: C.grey500,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 6,
                        }}
                      >
                        Score d'anomalie
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 7,
                            borderRadius: 99,
                            background: `${color}15`,
                            overflow: "hidden",
                            boxShadow: `inset 0 1px 2px ${color}10`,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 99,
                              background: `linear-gradient(90deg, ${color}, ${color}bb)`,
                              width: `${score}%`,
                              transition: "width .8s cubic-bezier(.22,1,.36,1)",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            fontFamily: "'JetBrains Mono',monospace",
                            color,
                          }}
                        >
                          {score}%
                        </span>
                      </div>
                    </div>
                  )}
                  {a.status === 'en_attente' && a.type !== "budget_overrun" && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() => handleConfirm(a)}
                        className="btn-danger"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                      >
                        Confirmer anomalie
                      </button>
                      <button
                        onClick={() => handleFalse(a)}
                        className="btn-confirm"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                      >
                        Faux positif
                      </button>
                      <button
                        onClick={() => handleIgnore(a)}
                        className="btn-mute"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                      >
                        Ignorer
                      </button>
                    </div>
                  )}
                  {a.status === 'en_attente' && a.type === "budget_overrun" && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleConfirm(a)}
                        className="btn-danger"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                      >
                        Confirmer dépassement
                      </button>
                      <button
                        onClick={() => handleIgnore(a)}
                        className="btn-mute"
                        style={{ fontSize: 11, padding: "5px 12px" }}
                      >
                        Ignorer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
