import { useMemo, useState, useEffect } from "react";
import { BarChart2, Bell, Building2, GitBranch, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { CustomTip } from "@/components/ui/CustomTip";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { C, CC } from "@/constants/colors";
import { fmtE, fmtK } from "@/utils/formatters";
import { apiGet } from "@/utils/api";
import { db, useStore, visibleTenants } from "@/store/db";
import { ADMIN_PIPELINE_STATUS_DEFS, ADMIN_RADAR_METRICS, ADMIN_TENANT_TYPE_DEFS } from "@/store/staticData";

const normalizeAnomalyType = (value) => {
  const raw = String(value || "autre").toLowerCase();
  if (raw === "amount_spike" || raw === "montant") return "montant";
  if (raw === "duplicate" || raw === "doublon") return "doublon";
  if (raw === "frequency" || raw === "fréquence" || raw === "frequence") return "fréquence";
  return raw;
};

export function AdminDashboardView({ onNavigate }) {
  useStore();
  const [activeSection, setActiveSection] = useState("overview");
  const [apiStats, setApiStats] = useState(null);
  const enrichedTenants = visibleTenants();
  const tenants = enrichedTenants;
  const [allInvoices, setAllInvoices] = useState([]);
  const [allAnomalies, setAllAnomalies] = useState([]);
  const [allPipelines, setAllPipelines] = useState([]);
  const [allAlerts, setAllAlerts] = useState([]);

  useEffect(() => {
    Promise.all([
      apiGet("/admin/stats").catch(() => null),
      apiGet("/admin/invoices", { size: 10000 }).catch(() => ({ content: [] })),
      apiGet("/admin/pipelines", { size: 100 }).catch(() => ({ content: [] })),
      apiGet("/admin/alerts", { size: 100 }).catch(() => ({ content: [] })),
      apiGet("/anomalies", { size: 10000 }).catch(() => ({ content: [] })),
    ]).then(([stats, invoicesRes, pipelinesRes, alertsRes, anomaliesRes]) => {
      const invoices = invoicesRes?.content ?? [];
      const pipelines = (pipelinesRes?.content ?? []).map((p) => {
        const processed = p.invoicesProcessed ?? p.lastRunStats?.processedCount ?? p.lastRunStats?.importedCount ?? 0;
        const anomalies = p.lastRunStats?.anomalyCount ?? p.anomalyCount ?? 0;
        return {
          ...p,
          status: p.status === "ACTIVE" ? "actif" : p.status === "DRAFT" ? "draft" : (p.status || "paused").toLowerCase(),
          invoicesProcessed: processed,
          anomalyRate: processed > 0 ? anomalies / processed : 0,
          connector: p.connector || p.connectorName || p.sourceType || p.connectorId || "Aucun",
          freq: p.freq || p.frequency || "Manuel",
          lastRun: p.lastRun || p.lastRunAt || null,
        };
      });
      const alerts = (alertsRes?.content ?? []).map((a) => ({
        ...a,
        timestamp: a.timestamp || a.detectedAt || a.createdAt,
        severity: String(a.severity || "info").toLowerCase(),
      }));
      const apiAnomalies = anomaliesRes?.content ?? [];
      setApiStats(stats);
      setAllInvoices(invoices);
      setAllPipelines(pipelines);
      setAllAlerts(alerts);
      setAllAnomalies(apiAnomalies.length ? apiAnomalies : invoices.filter((i) => i.status === "anomaly" || i.status === "ANOMALY" || i.anomalyType));
    }).catch(err => console.error("Failed to fetch admin data:", err));
  }, [db.activeTenantId]);

  // ── Aggregate data across ALL tenants ──────────────────────────────────
  const totalTenants = apiStats?.tenantsCount ?? apiStats?.totalTenants ?? tenants.length;
  const totalInvoiceCount = apiStats?.invoicesCount ?? apiStats?.totalInvoices ?? allInvoices.length;
  const totalAnomalyCount = apiStats?.anomaliesCount ?? apiStats?.totalAnomalies ?? allAnomalies.length;
  const overallAnomalyRate = totalInvoiceCount
    ? ((totalAnomalyCount / totalInvoiceCount) * 100).toFixed(2)
    : 0;
  const activePipelineCount = apiStats?.activePipelineCountCount ?? allPipelines.filter((p) => p.status === "actif").length;
  const alertsByStatus = apiStats?.alertsByStatus ?? {};
  const criticalAlerts = alertsByStatus.CRITICAL ?? 0;
  const unreadAlerts = alertsByStatus.UNREAD ?? 0;

  const totalInvoiceAmount = useMemo(() =>
    allInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
  [allInvoices]);

  const allTenants = enrichedTenants;

  // ── Database storage mode distribution (donut) ─────────────────────────
  const storageModeDist = useMemo(() => {
    const m = { "Base partagée": 0, "Base isolée": 0 };
    tenants.forEach((t) => {
      const mode = t.storage === "dedicated" || t.storage === "isolated" ? "Base isolée" : "Base partagée";
      m[mode] = (m[mode] || 0) + 1;
    });
    return Object.entries(m).map(([mode, count], i) => ({
      mode,
      count,
      color: CC[i % CC.length],
    }));
  }, [tenants]);

  // ── Tenant type breakdown ─────────────────────────────────────────────
  const tenantTypeData = ADMIN_TENANT_TYPE_DEFS.map((def) => ({
    type: def.type,
    count: tenants.filter((t) => def.fallback ? t.role === def.role || !t.role : t.role === def.role).length,
    color: C[def.colorKey],
  }));

  // ── Invoice amount per tenant (bar) ───────────────────────────────────
  const invoiceVolumeData = enrichedTenants
    .map((t, i) => ({
      name: t.name,
      amount: allInvoices.filter((inv) => inv.tenantId === t.id).reduce((sum, inv) => sum + (inv.amount || 0), 0),
      color: t.color,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── Monthly trend across platform ─────────────────────────────────────
  const monthlyTrend = useMemo(() => {
    const map = {};
    allInvoices.forEach((inv) => {
      const d = inv.date || inv.invoiceDate;
      if (!d) return;
      const m = d.slice(0, 7);
      if (!map[m]) map[m] = { m, total: 0, anomalies: 0, amount: 0 };
      map[m].total++;
      if (inv.status === "ANOMALY" || inv.status === "anomaly" || inv.anomalyType) {
        map[m].anomalies++;
        map[m].amount += inv.amount ?? 0;
      } else map[m].amount += inv.amount ?? 0;
    });
    return Object.values(map)
      .sort((a, b) => a.m.localeCompare(b.m))
      .slice(-12);
  }, [allInvoices]);

  // ── Anomaly type distribution ─────────────────────────────────────────
  const anomTypeData = useMemo(() => {
    const anomTypeMap = {};
    allAnomalies.forEach((a) => {
      const t = normalizeAnomalyType(a.anomalyType || a.type);
      anomTypeMap[t] = (anomTypeMap[t] || 0) + 1;
    });
    return Object.entries(anomTypeMap).map(([type, count], i) => ({
      type,
      count,
      color: [C.red, C.warning, C.info, C.purple][i % 4],
    }));
  }, [allAnomalies]);

  // ── Per-tenant anomaly rates ───────────────────────────────────────────
  const clientAnomalyData = useMemo(() => enrichedTenants.map((t) => {
    const invoices = allInvoices.filter((inv) => inv.tenantId === t.id);
    const anomalies = allAnomalies.filter((a) => a.tenantId === t.id);
    const invoiceCount = invoices.length || t.invoiceCount || 0;
    const anomalyCount = anomalies.length || t.anomalyCount || 0;
    return {
      name: t.name.slice(0, 10),
      rate: invoiceCount ? parseFloat(((anomalyCount / invoiceCount) * 100).toFixed(2)) : 0,
      invoices: invoiceCount,
      color: t.color,
      plan: t.role || "unknown",
      type: t.role || "unknown",
    };
  }), [allAnomalies, allInvoices, enrichedTenants]);

  // ── Pipeline status breakdown ──────────────────────────────────────────
  const pipelineStatusData = ADMIN_PIPELINE_STATUS_DEFS.map((def) => ({
    status: def.status,
    count: allPipelines.filter((p) => def.matches.includes(p.status)).length,
    color: C[def.colorKey],
  }));

  // ── Connector usage ────────────────────────────────────────────────────
  const connData = useMemo(() => {
    const connMap = {};
    allPipelines.forEach((p) => {
      const c = p.connector || p.connectorId || "Aucun";
      connMap[c] = (connMap[c] || 0) + 1;
    });
    return Object.entries(connMap).map(([conn, count]) => ({
      conn: conn === "none" ? "Aucun" : conn,
      count,
    }));
  }, [allPipelines]);

  // ── Alert timeline (last 8) ────────────────────────────────────────────
  const recentAlerts = allAlerts
    .filter((a) => a.severity === "critical" || a.severity === "warning")
    .slice(0, 8);

  // ── Radar — client health metrics ─────────────────────────────────────
  const RADAR_METRICS = ADMIN_RADAR_METRICS;
  const tInvoiceCounts = useMemo(() => enrichedTenants.map(t => t.invoiceCount || 0), [enrichedTenants]);
  const tAnomalyCounts = useMemo(() => enrichedTenants.map(t => t.anomalyCount || 0), [enrichedTenants]);
  const maxInv = Math.max(...tInvoiceCounts, 1);
  const maxAnm = Math.max(...tAnomalyCounts, 1);
  const radarData = RADAR_METRICS.map((metric) => ({
    metric,
    ...Object.fromEntries(
      tenants.map((t, i) => [
        t.name.slice(0, 8),
        metric === "Factures"
          ? Math.round((tInvoiceCounts[i] / maxInv) * 100)
          : metric === "Anomalies"
          ? Math.round((tAnomalyCounts[i] / maxAnm) * 100)
          : metric === "Pipelines"
          ? Math.min(100, allPipelines.filter(p => p.tenantId === t.id).length * 25)
          : metric === "Alertes"
          ? Math.min(100, allAlerts.filter(a => a.tenantId === t.id && a.status !== "READ").length * 10)
          : Math.round((t.anomalyRate || 0) * 100),
      ])
    ),
  }));

  // ── Composed chart: invoices + anomaly rate per month ─────────────────
  const composedData = monthlyTrend.map((d) => ({
    ...d,
    rate: d.total ? parseFloat(((d.anomalies / d.total) * 100).toFixed(2)) : 0,
  }));

  // ── Scatter: invoice volume vs anomaly rate per client ─────────────────
  const scatterData = enrichedTenants.map((t, i) => ({
      x: t.invoiceCount || 0,
      y: parseFloat(((t.anomalyRate || 0) * 100).toFixed(2)),
      z: Math.max(1, allInvoices.filter((inv) => inv.tenantId === t.id).length),
      name: t.name,
      color: t.color,
  }));

  // ── Stacked bar: anomalies per type per tenant ─────────────────────────
  const stackedData = enrichedTenants.map((t, i) => {
    const anom = allAnomalies.filter((x) => x.tenantId === t.id);
    const mc = {};
    anom.forEach((a) => {
      const tp = normalizeAnomalyType(a.anomalyType || a.type);
      mc[tp] = (mc[tp] || 0) + 1;
    });
    return {
      name: t.name.slice(0, 8),
      montant: mc.montant || 0,
      doublon: mc.doublon || 0,
      fréquence: mc["fréquence"] || 0,
    };
  });

  const SDiv = ({ label, lucide: LucideComp }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        margin: "4px 0 18px",
      }}
    >
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(90deg,rgba(217,79,61,.18),transparent)`,
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: C.grey400,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {LucideComp && (
          <LucideComp size={12} color={C.grey400} strokeWidth={2} />
        )}
        {label}
      </span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(270deg,rgba(217,79,61,.18),transparent)`,
        }}
      />
    </div>
  );

  const SECTIONS = [
    { id: "overview", label: "Vue générale", LucideComp: BarChart2 },
    { id: "tenants", label: "Tenants", LucideComp: Users },
    { id: "pipelines", label: "Pipelines", LucideComp: GitBranch },
    { id: "anomalies", label: "Anomalies", LucideComp: TriangleAlert },
  ];

  return (
    <div
      style={{
        padding: "20px 24px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <PageHeader
        eyebrow="Monitoring"
        title="Command Center"
        subtitle="Vue analytique globale · AnomalyIQ Admin"
        actions={(
          <>
          {criticalAlerts > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(217,79,61,.1)",
                border: `1px solid rgba(217,79,61,.2)`,
                borderRadius: 99,
              }}
            >
              <span
                className="pulse-dot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.red,
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.red }}>
                {criticalAlerts} critique{criticalAlerts > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <button
            onClick={() => onNavigate("alerts")}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "7px 14px" }}
          >
            <Icon name="bell" size={13} /> {unreadAlerts} alertes
          </button>
          <button
            onClick={() => onNavigate("tenants")}
            className="btn-primary"
            style={{ fontSize: 12, padding: "7px 14px" }}
          >
            <Icon name="clients" size={13} color="#fff" /> Gérer tenants
          </button>
          </>
        )}
      />

      {/* ── SECTION NAV PILLS ────────────────────────────────────────────── */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          flexWrap: "wrap",
          padding: "4px",
          background: "rgba(255,255,255,.55)",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.88)",
          width: "fit-content",
          boxShadow: "0 2px 12px rgba(0,0,0,.05)",
        }}
      >
        {SECTIONS.map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                transition: "all .2s",
                fontFamily: "inherit",
                background: active
                  ? "linear-gradient(135deg,#D94F3D,#E8736A)"
                  : "transparent",
                color: active ? "#fff" : C.grey500,
                boxShadow: active ? "0 4px 14px rgba(217,79,61,.25)" : "none",
              }}
            >
              <s.LucideComp
                size={13}
                color={active ? "#fff" : C.grey500}
                strokeWidth={2.2}
              />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW SECTION ═══════════════════════════════════════════ */}
      {activeSection === "overview" && (
        <div className="fade-in">
          {/* KPI Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              gap: 11,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Tenants",
                val: tenants.length,
                sub: `${tenants.filter((t) => t.storage === "dedicated" || t.storage === "isolated").length} bases isolées`,
                color: C.info,
                LucideComp: Building2,
              },
              {
                label: "Montant facturé",
                val: fmtK(totalInvoiceAmount),
                sub: "D'après factures mock",
                color: C.success,
                icon: "chart",
              },
              {
                label: "Factures",
                val: totalInvoiceCount.toLocaleString("fr-FR"),
                sub: "Toutes entités",
                color: C.info,
                icon: "fileText",
              },
              {
                label: "Anomalies",
                val: totalAnomalyCount.toLocaleString("fr-FR"),
                sub: `Taux ${overallAnomalyRate}%`,
                color: C.red,
                icon: "triangle",
              },
              {
                label: "Pipelines",
                val: allPipelines.length,
                sub: `${activePipelineCount} actifs`,
                color: C.success,
                icon: "pipelines",
              },
              {
                label: "Alertes",
                val: unreadAlerts,
                sub: `${criticalAlerts} critiques`,
                color: criticalAlerts > 0 ? C.red : C.warning,
                icon: "bell",
              },
              {
                label: "Taux global",
                val: `${overallAnomalyRate}%`,
                sub: "Anomalies / factures",
                color: C.purple,
                icon: "bolt",
              },
            ].map((k, i) => {
              const KpiIcon = k.LucideComp;
              return (
              <div
                key={k.label}
                className={`kpi-card fade-up-${Math.min(3, i)}`}
                style={{ padding: "16px 14px" }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `${k.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 9,
                  }}
                >
                  {KpiIcon ? <KpiIcon size={14} color={k.color} /> : <Icon name={k.icon} size={14} color={k.color} />}
                </div>
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 24,
                    color: k.color,
                    lineHeight: 1,
                    letterSpacing: "-.4px",
                  }}
                >
                  {k.val}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.grey500,
                    marginTop: 5,
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}
                >
                  {k.label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: k.color,
                    marginTop: 2,
                    opacity: 0.7,
                  }}
                >
                  {k.sub}
                </div>
              </div>
            );})}
          </div>

          <SDiv label="Tendances plateforme" lucide={TrendingUp} />

          {/* Composed chart: invoices + anomaly rate */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.grey700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Volume + Taux d'anomalies · 12 mois
                </div>
                <Badge type="mute">Composé</Badge>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <ComposedChart
                  data={composedData}
                  margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                >
                  <defs>
                    <linearGradient id="adgTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.info} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={C.info} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adgAnom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="m"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: C.grey400 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    width={40}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    name="Factures"
                    stroke={C.info}
                    fill="url(#adgTotal)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="anomalies"
                    name="Anomalies"
                    stroke={C.red}
                    fill="url(#adgAnom)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    name="Taux %"
                    stroke={C.warning}
                    strokeWidth={2}
                    dot={{ r: 3, fill: C.warning }}
                    strokeDasharray="4 2"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline status donut */}
            <div
              className="glass-card"
              style={{ padding: 20, display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Statut des pipelines
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={pipelineStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    startAngle={90}
                    endAngle={450}
                  >
                    {pipelineStatusData.map((d, i) => (
                      <Cell key={d.status} fill={d.color} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="inside"
                      style={{ fill: "#fff", fontSize: 11, fontWeight: 700 }}
                    />
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  marginTop: "auto",
                }}
              >
                {pipelineStatusData.map((d) => (
                  <div
                    key={d.status}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ fontSize: 11, color: C.grey700, flex: 1 }}>
                      {d.status}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono',monospace",
                        color: d.color,
                      }}
                    >
                      {d.count}
                    </div>
                    <div
                      style={{
                        flex: 2,
                        height: 4,
                        borderRadius: 2,
                        background: C.grey100,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          background: d.color,
                          width: `${
                            (d.count / Math.max(1, allPipelines.length)) * 100
                          }%`,
                          borderRadius: 2,
                          transition: "width .8s ease-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Anomaly types donut + connector bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Types d'anomalies · plateforme
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={anomTypeData}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {anomTypeData.map((d, i) => (
                        <Cell key={d.type} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + " anomalies", n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {anomTypeData.map((d) => (
                    <div key={d.type}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: d.color,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: C.grey700,
                              textTransform: "capitalize",
                            }}
                          >
                            {d.type}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                            color: d.color,
                          }}
                        >
                          {d.count}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 2,
                          background: C.grey100,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            background: d.color,
                            width: `${
                              (d.count / Math.max(1, allAnomalies.length)) * 100
                            }%`,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Connecteurs utilisés
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={connData}
                  layout="vertical"
                  margin={{ top: 4, right: 40, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="conn"
                    tick={{ fontSize: 11, fill: C.grey700, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Bar dataKey="count" name="Pipelines" radius={[0, 6, 6, 0]}>
                    {connData.map((d, i) => (
                      <Cell key={d.conn} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="right"
                      style={{ fill: C.grey500, fontSize: 11, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent critical alerts */}
          <SDiv label="Alertes récentes critiques" lucide={Bell} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 10,
              marginBottom: 8,
            }}
          >
            {recentAlerts.slice(0, 4).map((a, i) => (
              <div
                key={a.id}
                className="glass-card-sm"
                style={{
                  padding: "12px 14px",
                  border: `1px solid ${a.severity === "critical" ? "rgba(217,79,61,.20)" : "rgba(245,158,11,.22)"}`,
                  boxShadow: `0 10px 24px ${a.severity === "critical" ? "rgba(217,79,61,.07)" : "rgba(245,158,11,.07)"}`,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: a.severity === "critical" ? C.red : C.warning,
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.grey900,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.message}
                  </div>
                  <div style={{ fontSize: 10, color: C.grey500, marginTop: 2 }}>
                    {new Date(a.timestamp).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <span
                  className={`badge badge-${
                    a.severity === "critical" ? "red" : "warn"
                  }`}
                  style={{ fontSize: 9, flexShrink: 0, maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {a.severity === "critical" ? "CRITIQUE" : "ALERTE"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ CLIENTS SECTION ═══════════════════════════════════════════ */}
      {activeSection === "tenants" && (

        <div className="fade-in">
          <SDiv label="Analyse tenants" lucide={Users} />

          {/* Client cards row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${tenants.length},1fr)`,
              gap: 12,
              marginBottom: 24,
            }}
          >
            {enrichedTenants.map((t) => {
              const pipes = allPipelines.filter(p => p.tenantId === t.id);
              return (
                <div
                  key={t.id}
                  className="glass-card card-hover"
                  style={{ padding: 18 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: t.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 800,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {t.logo}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: C.grey900,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.name}
                      </div>
                      <span
                        className={`badge badge-${
                          t.plan === "Enterprise"
                            ? "red"
                            : t.plan === "Pro"
                            ? "info"
                            : "ok"
                        }`}
                        style={{ fontSize: 9 }}
                      >
                        {t.plan}
                      </span>
                    </div>
                  </div>
                  {[
                    {
                      label: "Montant",
                      val: fmtK(allInvoices.filter((inv) => inv.tenantId === t.id).reduce((sum, inv) => sum + (inv.amount || 0), 0)),
                      color: C.success,
                    },
                    {
                      label: "Factures",
                      val: t.invoiceCount.toLocaleString("fr-FR"),
                      color: C.info,
                    },
                    { label: "Anomalies", val: t.anomalyCount, color: C.red },
                    {
                      label: "Taux",
                      val: `${(t.anomalyRate * 100).toFixed(1)}%`,
                      color: C.warning,
                    },
                    {
                      label: "Mode DB",
                      val: t.storage === "dedicated" || t.storage === "isolated" ? "Isolée" : "Partagée",
                      color: C.purple,
                    },
                    { label: "Pipelines", val: pipes.length, color: C.teal },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderBottom: `1px solid ${C.grey100}`,
                      }}
                    >
                      <span style={{ fontSize: 10, color: C.grey500 }}>
                        {item.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: item.color,
                        }}
                      >
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Invoice amount bar chart */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Montant facturé par tenant
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={invoiceVolumeData}
                  margin={{ top: 22, right: 16, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={fmtK}
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => [fmtE(v), "Montant"]} />
                  <Bar dataKey="amount" name="Montant" radius={[8, 8, 0, 0]}>
                    {invoiceVolumeData.map((d, i) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                    <LabelList
                      dataKey="amount"
                      position="top"
                      offset={8}
                      formatter={fmtK}
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Database mode distribution donut */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Distribution des modes DB
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={storageModeDist}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={4}
                      startAngle={90}
                      endAngle={450}
                    >
                      {storageModeDist.map((d, i) => (
                        <Cell key={d.mode} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + " tenants", n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {storageModeDist.map((d) => (
                    <div
                      key={d.mode}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: d.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.grey700,
                          flex: 1,
                        }}
                      >
                        {d.mode}
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          fontFamily: "'JetBrains Mono',monospace",
                          color: d.color,
                        }}
                      >
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Radar client health + stacked anomalies */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Radar · santé des tenants
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  data={radarData}
                >
                  <PolarGrid stroke={C.grey200} />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: C.grey600, fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: C.grey400, fontSize: 8 }}
                  />
                  {enrichedTenants.map((t, i) => (
                    <Radar
                      key={t.id}
                      name={t.name}
                      dataKey={t.name.slice(0, 8)}
                      stroke={t.color}
                      fill={t.color}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v}/100`]} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Stacked bar: anomaly types per client */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Anomalies par type et tenant
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stackedData}
                  margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="montant"
                    name="Montant"
                    stackId="a"
                    fill={C.red}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="doublon"
                    name="Doublon"
                    stackId="a"
                    fill={C.warning}
                  />
                  <Bar
                    dataKey="fréquence"
                    name="Fréquence"
                    stackId="a"
                    fill={C.info}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter: invoice volume vs anomaly rate */}
          <div className="glass-card" style={{ padding: 20, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 14,
              }}
            >
              Volume factures vs Taux d'anomalies · toutes entités
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Factures"
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                  label={{
                    value: "Volume factures",
                    position: "insideBottom",
                    offset: -2,
                    fill: C.grey400,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Taux %"
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Taux anomalies %",
                    angle: -90,
                    position: "insideLeft",
                    fill: C.grey400,
                    fontSize: 10,
                  }}
                />
                <ZAxis dataKey="z" range={[60, 280]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div
                        style={{
                          background: "rgba(255,255,255,.97)",
                          border: `1px solid ${C.grey200}`,
                          borderRadius: 10,
                          padding: "10px 14px",
                          fontSize: 11,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            color: C.grey900,
                            marginBottom: 4,
                          }}
                        >
                          {d?.name}
                        </div>
                        <div style={{ color: C.info }}>
                          Volume: {d?.x?.toLocaleString("fr-FR")}
                        </div>
                        <div style={{ color: C.red }}>Taux: {d?.y}%</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} name="Tenants">
                  {scatterData.map((d, i) => (
                    <Cell key={i} fill={d.color} fillOpacity={0.8} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ PIPELINES SECTION ══════════════════════════════════════════ */}
      {activeSection === "pipelines" && (
        <div className="fade-in">
          <SDiv label="Analyse des pipelines" lucide={GitBranch} />

          {/* Pipeline KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total pipelines",
                val: allPipelines.length,
                color: C.info,
              },
              { label: "Actifs", val: activePipelineCount, color: C.success },
              {
                label: "En warning",
                val: allPipelines.filter((p) => p.status === "warning").length,
                color: C.warning,
              },
              {
                label: "En pause",
                val: allPipelines.filter((p) => p.status === "paused").length,
                color: C.grey500,
              },
            ].map((k) => (
              <div
                key={k.label}
                className="glass-card-sm"
                style={{
                  padding: "14px 16px",
                  border: `1px solid ${k.color}24`,
                  boxShadow: `0 10px 24px ${k.color}0F`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 28,
                    color: k.color,
                  }}
                >
                  {k.val}
                </div>
                <div style={{ fontSize: 11, color: C.grey500, marginTop: 4 }}>
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline anomaly rate bar + invoices processed */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Taux d'anomalies par pipeline
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={allPipelines.map((p) => ({
                    name: p.name.slice(0, 14),
                    rate: Number.isFinite(p.anomalyRate) ? parseFloat((p.anomalyRate * 100).toFixed(2)) : 0,
                    status: p.status,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 60, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Taux anomalies"]} />
                  <Bar dataKey="rate" name="Taux %" radius={[0, 6, 6, 0]}>
                    {allPipelines.map((p, i) => (
                      <Cell
                        key={p.id}
                        fill={
                          p.status === "actif"
                            ? C.success
                            : p.status === "warning"
                            ? C.warning
                            : C.grey400
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="rate"
                      position="right"
                      formatter={(v) => `${v}%`}
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Factures processées par pipeline */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Factures traitées par pipeline
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={allPipelines.map((p) => ({
                    name: p.name.slice(0, 14),
                    inv: p.invoicesProcessed || 0,
                    conn: p.connector,
                  }))}
                  layout="vertical"
                  margin={{ top: 4, right: 60, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(v) => [v.toLocaleString("fr-FR"), "Factures"]}
                  />
                  <Bar dataKey="inv" name="Factures" radius={[0, 6, 6, 0]}>
                    {allPipelines.map((p, i) => (
                      <Cell key={p.id} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="inv"
                      position="right"
                      formatter={(v) => v.toLocaleString("fr-FR")}
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Connector radar + freq distribution */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Répartition connecteurs (donut)
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={connData.map((d, i) => ({
                      ...d,
                      fill: CC[i % CC.length],
                    }))}
                    dataKey="count"
                    nameKey="conn"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {connData.map((d, i) => (
                      <Cell key={d.conn} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="conn"
                      position="outside"
                      style={{ fill: C.grey600, fontSize: 10 }}
                    />
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + " pipelines", n]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Freq distribution */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Fréquence d'exécution
              </div>
              {(() => {
                const freqMap = {};
                allPipelines.forEach((p) => {
                  freqMap[p.freq] = (freqMap[p.freq] || 0) + 1;
                });
                const freqData = Object.entries(freqMap).map(
                  ([freq, count], i) => ({
                    freq,
                    count,
                    color: CC[i % CC.length],
                  })
                );
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={freqData}
                      margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={C.grey100}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="freq"
                        tick={{ fontSize: 11, fill: C.grey700 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: C.grey500 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        name="Pipelines"
                        radius={[8, 8, 0, 0]}
                      >
                        {freqData.map((d, i) => (
                          <Cell key={d.freq} fill={d.color} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="top"
                          style={{
                            fill: C.grey500,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* Pipeline table */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 14,
              }}
            >
              Tous les pipelines
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.grey200}` }}>
                    {[
                      "Pipeline",
                      "Tenant",
                      "Connecteur",
                      "Fréquence",
                      "Factures",
                      "Taux",
                      "Statut",
                      "Dernière exéc.",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 10px",
                          fontWeight: 700,
                          fontSize: 10,
                          color: C.grey500,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPipelines.map((p) => {
                    const t = allTenants.find((t) => t.id === p.tenantId);
                    return (
                      <tr
                        key={p.id}
                        className="table-row"
                        style={{ borderBottom: `1px solid ${C.grey100}` }}
                      >
                        <td
                          style={{
                            padding: "9px 10px",
                            fontWeight: 700,
                            color: C.grey900,
                          }}
                        >
                          {p.name}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: 5,
                                background: t?.color || C.grey400,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 8,
                                fontWeight: 800,
                                color: "#fff",
                              }}
                            >
                              {t?.logo}
                            </div>
                            <span style={{ fontSize: 11, color: C.grey700 }}>
                              {t?.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <Badge type="mute">{p.connector}</Badge>
                        </td>
                        <td
                          style={{
                            padding: "9px 10px",
                            fontSize: 11,
                            color: C.grey600,
                          }}
                        >
                          {p.freq}
                        </td>
                        <td
                          style={{
                            padding: "9px 10px",
                            fontFamily: "'JetBrains Mono',monospace",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {(p.invoicesProcessed || 0).toLocaleString("fr-FR")}
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: (Number.isFinite(p.anomalyRate) ? p.anomalyRate : 0) > 0.02 ? C.red : C.success,
                            }}
                          >
                            {((Number.isFinite(p.anomalyRate) ? p.anomalyRate : 0) * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ padding: "9px 10px" }}>
                          <Badge
                            type={
                              p.status === "actif"
                                ? "ok"
                                : p.status === "warning"
                                ? "warn"
                                : "mute"
                            }
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td
                          style={{
                            padding: "9px 10px",
                            fontSize: 10,
                            color: C.grey500,
                            fontFamily: "'JetBrains Mono',monospace",
                          }}
                        >
                          {p.lastRun
                            ? new Date(p.lastRun).toLocaleString("fr-FR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANOMALIES SECTION ══════════════════════════════════════════ */}
      {activeSection === "anomalies" && (
        <div className="fade-in">
          <SDiv label="Analyse des anomalies" lucide={TriangleAlert} />

          {/* Anomaly KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Total anomalies",
                val: totalAnomalyCount,
                color: C.red,
              },
              {
                label: "Taux global",
                val: `${overallAnomalyRate}%`,
                color: C.warning,
              },
              {
                label: "Montant (mont.)",
                val: anomTypeData.find((d) => d.type === "montant")?.count || 0,
                color: C.red,
              },
              {
                label: "Doublons",
                val: anomTypeData.find((d) => d.type === "doublon")?.count || 0,
                color: C.warning,
              },
              {
                label: "Fréquence",
                val:
                  anomTypeData.find((d) => d.type === "fréquence")?.count || 0,
                color: C.info,
              },
            ].map((k) => (
              <div
                key={k.label}
                className="glass-card-sm"
                style={{ padding: "14px 16px" }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 28,
                    color: k.color,
                  }}
                >
                  {k.val}
                </div>
                <div style={{ fontSize: 11, color: C.grey500, marginTop: 4 }}>
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          {/* Monthly anomaly trend area + per-client anomaly bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Évolution anomalies · 12 mois
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={composedData}
                  margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                >
                  <defs>
                    <linearGradient id="adAnom2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="adRate2" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={C.warning}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={C.warning}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="m"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: C.grey400 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="anomalies"
                    name="Anomalies"
                    stroke={C.red}
                    fill="url(#adAnom2)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    name="Taux %"
                    stroke={C.warning}
                    fill="url(#adRate2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Anomaly rate per client */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Taux par entité
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={clientAnomalyData}
                  margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Taux"]} />
                  <Bar
                    dataKey="rate"
                    name="Taux anomalies"
                    radius={[6, 6, 0, 0]}
                  >
                    {clientAnomalyData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                    <LabelList
                      dataKey="rate"
                      position="top"
                      formatter={(v) => `${v}%`}
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alert severity distribution + anomaly type radar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Distribution sévérité des alertes
              </div>
              {(() => {
                const sevMap = {};
                allAlerts.forEach((a) => {
                  sevMap[a.severity] = (sevMap[a.severity] || 0) + 1;
                });
                const sevData = Object.entries(sevMap).map(([s, c]) => ({
                  s,
                  c,
                  color:
                    s === "critical"
                      ? C.red
                      : s === "warning"
                      ? C.warning
                      : C.info,
                }));
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sevData}
                        dataKey="c"
                        nameKey="s"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={450}
                      >
                        {sevData.map((d, i) => (
                          <Cell key={d.s} fill={d.color} />
                        ))}
                        <LabelList
                          dataKey="s"
                          position="outside"
                          style={{ fill: C.grey600, fontSize: 10 }}
                        />
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + " alertes", n]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Anomaly type per client radar */}
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: 14,
                }}
              >
                Profil anomalies par tenant (radar)
              </div>
              {(() => {
                const ANOM_METRICS = ["montant", "doublon", "fréquence"];
                const anomRadarData = ANOM_METRICS.map((type) => ({
                  type,
                  ...Object.fromEntries(
                    enrichedTenants.map((t) => {
                      const c = allAnomalies.filter(
                        (x) => x.tenantId === t.id && normalizeAnomalyType(x.anomalyType || x.type) === type
                      ).length;
                      return [t.name.slice(0, 8), c];
                    })
                  ),
                }));
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      data={anomRadarData}
                    >
                      <PolarGrid stroke={C.grey200} />
                      <PolarAngleAxis
                        dataKey="type"
                        tick={{
                          fill: C.grey600,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                      <PolarRadiusAxis
                        tick={{ fill: C.grey400, fontSize: 8 }}
                      />
                      {enrichedTenants.map((t, i) => (
                        <Radar
                          key={t.id}
                          name={t.name}
                          dataKey={t.name.slice(0, 8)}
                          stroke={t.color}
                          fill={t.color}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* Alert feed */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 14,
              }}
            >
              Alertes actives · toutes entités
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {allAlerts
                .filter((a) => !a.read && a.status !== "READ")
                .slice(0, 12)
                .map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background:
                        a.severity === "critical"
                          ? "rgba(217,79,61,.06)"
                          : a.severity === "warning"
                          ? "rgba(245,158,11,.06)"
                          : "rgba(59,130,246,.04)",
                      border: `1px solid ${
                        a.severity === "critical"
                          ? "rgba(217,79,61,.15)"
                          : a.severity === "warning"
                          ? "rgba(245,158,11,.15)"
                          : "rgba(59,130,246,.1)"
                      }`,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background:
                          a.severity === "critical"
                            ? C.red
                            : a.severity === "warning"
                            ? C.warning
                            : C.info,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.grey900,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.message}
                      </div>
                      <div
                        style={{ fontSize: 10, color: C.grey500, marginTop: 1 }}
                      >
                        {new Date(a.timestamp).toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    <span
                      className={`badge badge-${
                        a.severity === "critical"
                          ? "red"
                          : a.severity === "warning"
                          ? "warn"
                          : "info"
                      }`}
                      style={{ fontSize: 9, flexShrink: 0, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {a.type || a.category || a.severity}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
