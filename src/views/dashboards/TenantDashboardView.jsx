import { useMemo, useState } from "react";
import { BarChart2, Bell, FileText, GitBranch, ShieldAlert, TrendingUp, TriangleAlert, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Line, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/Badge";
import { CustomTip } from "@/components/ui/CustomTip";
import { PageHeader } from "@/components/ui/PageHeader";
import { C, CC } from "@/constants/colors";
import { alertsForTenant, childTenants, invoicesForTenant, pipelinesForTenant, useAuth } from "@/store/db";
import { fmtE, fmtK } from "@/utils/formatters";

const isAnomalyInvoice = (invoice) => String(invoice.status || "").toLowerCase() === "anomaly" || !!invoice.anomalyType;

export function TenantDashboardView({ onNavigate }) {
  const { user, tenant, partner } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  if (!tenant) return null;

  // ── Core data ──────────────────────────────────────────────────────────
  const invoices = invoicesForTenant(tenant.id);
  const pipelines = pipelinesForTenant(tenant.id);
  const tenantAlerts = alertsForTenant(tenant.id);
  const subAccounts = childTenants(tenant.id);

  const anomalies = invoices.filter(isAnomalyInvoice);
  const normalInvoices = invoices.filter((i) => !isAnomalyInvoice(i));
  const anomalyRate = invoices.length ? anomalies.length / invoices.length : 0;
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const anomalyAmount = anomalies.reduce((s, i) => s + i.amount, 0);
  const unreadAlerts = tenantAlerts.filter((a) => !a.read);
  const criticalAlerts = unreadAlerts.filter((a) => a.severity === "critical");
  const activePipelines = pipelines.filter((p) => p.status === "actif");

  // ── Monthly trend ──────────────────────────────────────────────────────
  const monthlyTrend = useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const m = inv.date.slice(0, 7);
      if (!map[m])
        map[m] = {
          m,
          total: 0,
          anomalies: 0,
          normal: 0,
          amount: 0,
          anomalyAmount: 0,
        };
      map[m].total++;
      map[m].amount += inv.amount;
      if (isAnomalyInvoice(inv)) {
        map[m].anomalies++;
        map[m].anomalyAmount += inv.amount;
      } else map[m].normal++;
    });
    return Object.values(map)
      .sort((a, b) => a.m.localeCompare(b.m))
      .slice(-12)
      .map((d) => ({
        ...d,
        m: d.m.slice(5), // show MM only
        rate: d.total
          ? parseFloat(((d.anomalies / d.total) * 100).toFixed(2))
          : 0,
      }));
  }, [invoices.length]);

  // ── Anomaly type breakdown ─────────────────────────────────────────────
  const anomTypeMap = {};
  anomalies.forEach((a) => {
    const t = a.anomalyType || "autre";
    anomTypeMap[t] = (anomTypeMap[t] || 0) + 1;
  });
  const anomTypeData = Object.entries(anomTypeMap).map(([type, count], i) => ({
    type,
    count,
    pct: count / Math.max(1, anomalies.length),
    color: [C.red, C.warning, C.info, C.purple][i % 4],
  }));

  // ── Supplier analysis ──────────────────────────────────────────────────
  const supplierMap = {};
  invoices.forEach((inv) => {
    const s = inv.supplier || inv.supplierName;
    if (!supplierMap[s])
      supplierMap[s] = {
        name: s,
        total: 0,
        anomalies: 0,
        amount: 0,
        anomalyAmount: 0,
      };
    supplierMap[s].total++;
    supplierMap[s].amount += inv.amount;
    if (isAnomalyInvoice(inv)) {
      supplierMap[s].anomalies++;
      supplierMap[s].anomalyAmount += inv.amount;
    }
  });
  const supplierData = Object.values(supplierMap)
    .map((s) => ({
      ...s,
      rate: s.total
        ? parseFloat(((s.anomalies / s.total) * 100).toFixed(1))
        : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  const topSuppliersByAnomaly = [...supplierData]
    .sort((a, b) => b.anomalies - a.anomalies)
    .slice(0, 6);

  // ── Invoice amount distribution buckets ───────────────────────────────
  const buckets = [
    { range: "0–500€", min: 0, max: 500, count: 0 },
    { range: "500–2k€", min: 500, max: 2000, count: 0 },
    { range: "2k–10k€", min: 2000, max: 10000, count: 0 },
    { range: "10k€+", min: 10000, max: Infinity, count: 0 },
  ];
  invoices.forEach((inv) => {
    const b = buckets.find((b) => inv.amount >= b.min && inv.amount < b.max);
    if (b) b.count++;
  });

  // ── Scatter: invoice index vs amount (anomaly highlight) ──────────────
  const scatterSample = invoices
    .filter((_, i) => i % 3 === 0)
    .map((inv, idx) => ({
      x: idx,
      y: Math.round(inv.amount),
      isAnomaly: isAnomalyInvoice(inv),
      name: inv.supplier || inv.supplierName,
    }));
  const normalScatter = scatterSample.filter((d) => !d.isAnomaly);
  const anomalyScatter = scatterSample.filter((d) => d.isAnomaly);

  // ── Pipeline radar (per pipeline: invoices, anomalyRate, kFactor, tol) ─
  const PIPE_METRICS = [
    "Volume",
    "Taux anomalie",
    "K-factor",
    "Tolérance",
    "Fraîcheur",
  ];
  const maxPipeInv = Math.max(...pipelines.map((p) => p.invoicesProcessed), 1);
  const radarData = PIPE_METRICS.map((metric) => ({
    metric,
    ...Object.fromEntries(
      pipelines.map((p) => [
        p.name.slice(0, 10),
        metric === "Volume"
          ? Math.round((p.invoicesProcessed / maxPipeInv) * 100)
          : metric === "Taux anomalie"
          ? Math.min(100, Math.round(p.anomalyRate * 1000))
          : metric === "K-factor"
          ? Math.round((p.kFactor / 5) * 100)
          : metric === "Tolérance"
          ? Math.round((p.tolerancePct / 20) * 100)
          : Math.round(
              (1 - (new Date() - new Date(p.lastRun)) / (7 * 24 * 3600000)) *
                100
            ),
      ])
    ),
  }));

  // ── Composed: normal vs anomaly amounts monthly ────────────────────────
  const composedData = monthlyTrend.map((d) => ({
    ...d,
    normalAmt: Math.round(d.amount - d.anomalyAmount),
    anomalyAmt: Math.round(d.anomalyAmount),
  }));

  // ── Alert severity breakdown ───────────────────────────────────────────
  const sevMap = {};
  tenantAlerts.forEach((a) => {
    sevMap[a.severity] = (sevMap[a.severity] || 0) + 1;
  });
  const sevData = Object.entries(sevMap).map(([s, c]) => ({
    s,
    c,
    color: s === "critical" ? C.red : s === "warning" ? C.warning : C.info,
  }));

  // ── Helpers ────────────────────────────────────────────────────────────
  const CSDiv = ({ label, LucideComp }) => (
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

  const TENANT_SECTIONS = [
    { id: "overview", label: "Vue générale", LucideComp: BarChart2 },
    { id: "factures", label: "Factures", LucideComp: FileText },
    { id: "anomalies", label: "Anomalies", LucideComp: TriangleAlert },
    { id: "pipelines", label: "Pipelines", LucideComp: GitBranch },
    { id: "alertes", label: "Alertes", LucideComp: Bell },
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
        title={tenant.name}
        subtitle={`${tenant.plan} · ${subAccounts.length} partenaire ERP${subAccounts.length > 1 ? "s" : ""} · ${activePipelines.length}/${pipelines.length} pipelines actifs`}
        actions={(
          <>
          {criticalAlerts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                background: "rgba(217,79,61,.09)",
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
                {criticalAlerts.length} critique
                {criticalAlerts.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <button
            onClick={() => onNavigate("anomalies")}
            className="btn-ghost"
            style={{ fontSize: 12 }}
          >
            <TriangleAlert size={13} /> {anomalies.length} anomalies
          </button>
          <button
            onClick={() => onNavigate("pipelines")}
            className="btn-primary"
            style={{ fontSize: 12 }}
          >
            <GitBranch size={13} color="#fff" /> Pipelines
          </button>
          </>
        )}
      />

      {/* ── SECTION NAV ─────────────────────────────────────────────────── */}
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
        {TENANT_SECTIONS.map((s) => {
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

      {/* ═══ OVERVIEW ══════════════════════════════════════════════════ */}
      {activeSection === "overview" && (
        <div className="fade-in">
          {/* KPI row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Factures totales",
                val: invoices.length.toLocaleString("fr-FR"),
                sub: `${fmtK(Math.round(totalAmount))} total`,
                color: C.info,
                LucideComp: FileText,
              },
              {
                label: "Anomalies",
                val: anomalies.length,
                sub: `Taux ${(anomalyRate * 100).toFixed(1)}%`,
                color: C.red,
                LucideComp: TriangleAlert,
              },
              {
                label: "Montant suspect",
                val: fmtK(Math.round(anomalyAmount)),
                sub: `${(
                  (anomalyAmount / Math.max(1, totalAmount)) *
                  100
                ).toFixed(1)}% du total`,
                color: C.warning,
                LucideComp: ShieldAlert,
              },
              {
                label: "Pipelines actifs",
                val: activePipelines.length,
                sub: `sur ${pipelines.length} total`,
                color: C.success,
                LucideComp: GitBranch,
              },
              {
                label: "Alertes non-lues",
                val: unreadAlerts.length,
                sub: `${criticalAlerts.length} critiques`,
                color: criticalAlerts.length > 0 ? C.red : C.warning,
                LucideComp: Bell,
              },
              {
                label: "Fournisseurs",
                val: Object.keys(supplierMap).length,
                sub: `${topSuppliersByAnomaly.length} avec anomalies`,
                color: C.purple,
                LucideComp: Users,
              },
            ].map((k, i) => (
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
                  <k.LucideComp size={14} color={k.color} strokeWidth={2} />
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
            ))}
          </div>

          <CSDiv label="Tendances mensuelles" LucideComp={TrendingUp} />

          {/* Composed chart: volume + taux */}
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
                  Volume mensuel + taux d'anomalies
                </div>
                <Badge type="mute">12 mois</Badge>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart
                  data={monthlyTrend}
                  margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
                >
                  <defs>
                    <linearGradient id="cliNorm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.info} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={C.info} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cliAnom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.28} />
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
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: C.grey400 }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={C.info}
                    fill="url(#cliNorm)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="anomalies"
                    name="Anomalies"
                    stroke={C.red}
                    fill="url(#cliAnom)"
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

            {/* Anomaly type donut */}
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
                Types d'anomalies
              </div>
              {anomTypeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={anomTypeData}
                        dataKey="count"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={60}
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
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: 8,
                    }}
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
                            {d.count} · {(d.pct * 100).toFixed(0)}%
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
                              width: `${d.pct * 100}%`,
                              borderRadius: 2,
                              transition: "width .8s",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    fontSize: 12,
                    color: C.grey400,
                  }}
                >
                  Aucune anomalie détectée
                </div>
              )}
            </div>
          </div>

          {/* Stacked bar: normal vs anomaly amounts monthly */}
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
                Montants normaux vs suspects · mensuel
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={composedData}
                  margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                >
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
                    tickFormatter={fmtK}
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="normalAmt"
                    name="Normal €"
                    stackId="a"
                    fill={C.info}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="anomalyAmt"
                    name="Suspect €"
                    stackId="a"
                    fill={C.red}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alert severity donut */}
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
                Sévérité des alertes
              </div>
              {sevData.length > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie
                        data={sevData}
                        dataKey="c"
                        nameKey="s"
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        startAngle={90}
                        endAngle={450}
                      >
                        {sevData.map((d, i) => (
                          <Cell key={d.s} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + " alertes", n]} />
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
                    {sevData.map((d) => (
                      <div key={d.s}>
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
                                width: 9,
                                height: 9,
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
                              {d.s}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono',monospace",
                              color: d.color,
                            }}
                          >
                            {d.c}
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
                                (d.c / Math.max(1, tenantAlerts.length)) * 100
                              }%`,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    fontSize: 12,
                    color: C.grey400,
                  }}
                >
                  Aucune alerte
                </div>
              )}
            </div>
          </div>

          {/* Pipeline quick status */}
          <CSDiv label="Vos pipelines" LucideComp={GitBranch} />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(
                3,
                pipelines.length
              )},1fr)`,
              gap: 12,
              marginBottom: 8,
            }}
          >
            {pipelines.map((p) => (
              <button
                key={p.id}
                onClick={() => onNavigate("pipelines")}
                className="glass-card card-hover"
                style={{
                  padding: 16,
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background:
                          p.status === "actif"
                            ? `${C.success}18`
                            : p.status === "warning"
                            ? `${C.warning}18`
                            : `${C.grey400}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GitBranch
                        size={14}
                        color={
                          p.status === "actif"
                            ? C.success
                            : p.status === "warning"
                            ? C.warning
                            : C.grey400
                        }
                        strokeWidth={2}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: C.grey900,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 120,
                      }}
                    >
                      {p.name}
                    </span>
                  </div>
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
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: "Factures",
                      val: p.invoicesProcessed.toLocaleString("fr-FR"),
                      color: C.info,
                    },
                    {
                      label: "Taux anomalies",
                      val: `${(p.anomalyRate * 100).toFixed(2)}%`,
                      color: p.anomalyRate > 0.02 ? C.red : C.success,
                    },
                    { label: "Connecteur", val: p.connector, color: C.grey600 },
                    { label: "Fréquence", val: p.freq, color: C.grey600 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div
                        style={{
                          fontSize: 9,
                          color: C.grey400,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          marginBottom: 1,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: item.color,
                        }}
                      >
                        {item.val}
                      </div>
                    </div>
                  ))}
                </div>
                {p.lastRun && (
                  <div style={{ fontSize: 9, color: C.grey400, marginTop: 10 }}>
                    Dernière exéc.{" "}
                    {new Date(p.lastRun).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FACTURES SECTION ══════════════════════════════════════════ */}
      {activeSection === "factures" && (
        <div className="fade-in">
          <CSDiv label="Analyse des factures" LucideComp={FileText} />

          {/* KPIs */}
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
                label: "Total factures",
                val: invoices.length.toLocaleString("fr-FR"),
                color: C.info,
              },
              {
                label: "Montant total",
                val: fmtK(Math.round(totalAmount)),
                color: C.success,
              },
              {
                label: "Montant moyen",
                val: fmtK(
                  Math.round(totalAmount / Math.max(1, invoices.length))
                ),
                color: C.teal,
              },
              {
                label: "Fournisseurs",
                val: Object.keys(supplierMap).length,
                color: C.purple,
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

          {/* Invoice distribution + supplier volume */}
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
                Distribution des montants
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={buckets.map(({ range, count }) => ({ range, count }))}
                  margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 10, fill: C.grey700 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar dataKey="count" name="Factures" radius={[8, 8, 0, 0]}>
                    {buckets.map((_, i) => (
                      <Cell key={i} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="top"
                      style={{ fill: C.grey500, fontSize: 10, fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Supplier volume horizontal bar */}
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
                Volume par fournisseur
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={supplierData.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 4, right: 50, bottom: 4, left: 4 }}
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
                    width={70}
                  />
                  <Tooltip />
                  <Bar dataKey="total" name="Factures" radius={[0, 6, 6, 0]}>
                    {supplierData.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="total"
                      position="right"
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter plot: invoice amounts */}
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
              Nuage de points — montants factures (rouge = anomalie)
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Index"
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                  label={{
                    value: "Index",
                    position: "insideBottom",
                    offset: -2,
                    fill: C.grey400,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Montant €"
                  tickFormatter={fmtK}
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Montant €",
                    angle: -90,
                    position: "insideLeft",
                    fill: C.grey400,
                    fontSize: 10,
                  }}
                />
                <Tooltip
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
                          Montant: {fmtE(d?.y)}
                        </div>
                        {d?.isAnomaly && (
                          <div style={{ color: C.red, fontWeight: 700 }}>
                            <TriangleAlert size={11} color={C.red} /> Anomalie
                            détectée
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Scatter
                  name="Normal"
                  data={normalScatter}
                  fill={C.info}
                  fillOpacity={0.5}
                  r={3}
                />
                <Scatter
                  name="Anomalie"
                  data={anomalyScatter}
                  fill={C.red}
                  fillOpacity={0.85}
                  r={5}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Supplier amount radar */}
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
              Radar · profil fournisseurs (top 5)
            </div>
            {(() => {
              const top5 = supplierData.slice(0, 5);
              const maxAmt = Math.max(...top5.map((s) => s.amount), 1);
              const maxAnomAmt = Math.max(
                ...top5.map((s) => s.anomalyAmount),
                1
              );
              const supplierRadar = [
                { metric: "Volume" },
                { metric: "Montant total" },
                { metric: "Anomalies" },
                { metric: "Montant suspect" },
                { metric: "Taux" },
              ].map((row) => ({
                ...row,
                ...Object.fromEntries(
                  top5.map((s) => [
                    s.name.slice(0, 10),
                    row.metric === "Volume"
                      ? Math.round(
                          (s.total / Math.max(...top5.map((x) => x.total), 1)) *
                            100
                        )
                      : row.metric === "Montant total"
                      ? Math.round((s.amount / maxAmt) * 100)
                      : row.metric === "Anomalies"
                      ? Math.round(
                          (s.anomalies /
                            Math.max(...top5.map((x) => x.anomalies), 1)) *
                            100
                        )
                      : row.metric === "Montant suspect"
                      ? Math.round(
                          (s.anomalyAmount / Math.max(maxAnomAmt, 1)) * 100
                        )
                      : Math.min(100, Math.round(s.rate * 10)),
                  ])
                ),
              }));
              return (
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    data={supplierRadar}
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
                    {top5.map((s, i) => (
                      <Radar
                        key={s.name}
                        name={s.name}
                        dataKey={s.name.slice(0, 10)}
                        stroke={CC[i % CC.length]}
                        fill={CC[i % CC.length]}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}/100`]} />
                  </RadarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ ANOMALIES SECTION ══════════════════════════════════════════ */}
      {activeSection === "anomalies" && (
        <div className="fade-in">
          <CSDiv label="Détail des anomalies" LucideComp={TriangleAlert} />

          {/* KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Total anomalies", val: anomalies.length, color: C.red },
              {
                label: "Taux global",
                val: `${(anomalyRate * 100).toFixed(2)}%`,
                color: C.warning,
              },
              {
                label: "Montant suspect",
                val: fmtK(Math.round(anomalyAmount)),
                color: C.red,
              },
              {
                label: "Fournisseurs touchés",
                val: topSuppliersByAnomaly.length,
                color: C.purple,
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

          {/* Anomaly evolution + type breakdown */}
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
                  data={monthlyTrend}
                  margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                >
                  <defs>
                    <linearGradient id="cliAnomEv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cliRateEv" x1="0" y1="0" x2="0" y2="1">
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
                    width={36}
                  />
                  <Tooltip content={<CustomTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="anomalies"
                    name="Anomalies"
                    stroke={C.red}
                    fill="url(#cliAnomEv)"
                    strokeWidth={2.5}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    name="Taux %"
                    stroke={C.warning}
                    fill="url(#cliRateEv)"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Anomaly type full donut */}
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
                Répartition par type
              </div>
              {anomTypeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={anomTypeData}
                        dataKey="count"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        startAngle={90}
                        endAngle={450}
                      >
                        {anomTypeData.map((d, i) => (
                          <Cell key={d.type} fill={d.color} />
                        ))}
                        <LabelList
                          dataKey="count"
                          position="inside"
                          style={{
                            fill: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        />
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + " anomalies", n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    {anomTypeData.map((d) => (
                      <div
                        key={d.type}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: d.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 11,
                            color: C.grey700,
                            textTransform: "capitalize",
                            flex: 1,
                          }}
                        >
                          {d.type}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: d.color,
                          }}
                        >
                          {d.count}
                        </span>
                        <span style={{ fontSize: 10, color: C.grey400 }}>
                          {(d.pct * 100).toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    fontSize: 12,
                    color: C.grey400,
                  }}
                >
                  Aucune anomalie
                </div>
              )}
            </div>
          </div>

          {/* Top suppliers by anomaly + anomaly amount bar */}
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
                Fournisseurs avec le plus d'anomalies
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={topSuppliersByAnomaly}
                  layout="vertical"
                  margin={{ top: 4, right: 50, bottom: 4, left: 4 }}
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
                    width={70}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="anomalies"
                    name="Anomalies"
                    radius={[0, 6, 6, 0]}
                  >
                    {topSuppliersByAnomaly.map((_, i) => (
                      <Cell key={i} fill={CC[i % CC.length]} />
                    ))}
                    <LabelList
                      dataKey="anomalies"
                      position="right"
                      style={{ fill: C.grey500, fontSize: 10 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Anomaly rate per supplier */}
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
                Taux d'anomalies par fournisseur
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={supplierData.slice(0, 6)}
                  margin={{ top: 4, right: 8, bottom: 20, left: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.grey100}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 9,
                      fill: C.grey700,
                      angle: -20,
                      textAnchor: "end",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: C.grey500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Taux"]} />
                  <Bar dataKey="rate" name="Taux %" radius={[6, 6, 0, 0]}>
                    {supplierData.slice(0, 6).map((s, i) => (
                      <Cell
                        key={i}
                        fill={
                          s.rate > 2
                            ? C.red
                            : s.rate > 1
                            ? C.warning
                            : C.success
                        }
                      />
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

          {/* Recent anomaly invoices feed */}
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
              Dernières factures anomalies
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
                      "Référence",
                      "Fournisseur",
                      "Montant",
                      "Type anomalie",
                      "Score",
                      "Statut",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "7px 10px",
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
                  {anomalies.slice(0, 10).map((inv) => (
                    <tr
                      key={inv.id}
                      className="table-row"
                      style={{ borderBottom: `1px solid ${C.grey100}` }}
                    >
                      <td
                        style={{
                          padding: "8px 10px",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 10,
                          color: C.grey600,
                        }}
                      >
                        {inv.reference}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontWeight: 600,
                          color: C.grey900,
                        }}
                      >
                        {inv.supplier || inv.supplierName}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontWeight: 700,
                          color: C.red,
                        }}
                      >
                        {fmtE(Math.round(inv.amount))}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          className={`badge badge-${
                            inv.anomalyType === "montant"
                              ? "red"
                              : inv.anomalyType === "doublon"
                              ? "warn"
                              : "info"
                          }`}
                          style={{ fontSize: 9, textTransform: "capitalize" }}
                        >
                          {inv.anomalyType || "autre"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                            color:
                              inv.anomalyScore > 0.85
                                ? C.red
                                : inv.anomalyScore > 0.7
                                ? C.warning
                                : C.success,
                          }}
                        >
                          {inv.anomalyScore
                            ? (inv.anomalyScore * 100).toFixed(0)
                            : "—"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <Badge type="red">Anomalie</Badge>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          fontSize: 10,
                          color: C.grey500,
                        }}
                      >
                        {inv.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PIPELINES SECTION ══════════════════════════════════════════ */}
      {activeSection === "pipelines" && (
        <div className="fade-in">
          <CSDiv label="Vos pipelines" LucideComp={GitBranch} />

          {/* Radar: pipeline health */}
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
                Radar · santé des pipelines
              </div>
              {pipelines.length > 0 ? (
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
                      tick={{ fill: C.grey600, fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: C.grey400, fontSize: 8 }}
                    />
                    {pipelines.map((p, i) => (
                      <Radar
                        key={p.id}
                        name={p.name.slice(0, 12)}
                        dataKey={p.name.slice(0, 10)}
                        stroke={CC[i % CC.length]}
                        fill={CC[i % CC.length]}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}/100`]} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    fontSize: 12,
                    color: C.grey400,
                  }}
                >
                  Aucun pipeline
                </div>
              )}
            </div>

            {/* Pipeline anomaly rate bar */}
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
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={pipelines.map((p) => ({
                    name: p.name.slice(0, 16),
                    rate: parseFloat((p.anomalyRate * 100).toFixed(2)),
                    inv: p.invoicesProcessed,
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
                    width={100}
                  />
                  <Tooltip formatter={(v) => [`${v}%`, "Taux"]} />
                  <Bar
                    dataKey="rate"
                    name="Taux anomalies"
                    radius={[0, 6, 6, 0]}
                  >
                    {pipelines.map((p, i) => (
                      <Cell
                        key={p.id}
                        fill={
                          p.anomalyRate > 0.02
                            ? C.red
                            : p.anomalyRate > 0.015
                            ? C.warning
                            : C.success
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
          </div>

          {/* Pipeline detail table */}
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
              Détail des pipelines
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
                      "Connecteur",
                      "Fréquence",
                      "Factures",
                      "K-Factor",
                      "Tolérance",
                      "Taux",
                      "Statut",
                      "Dernière exéc.",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "7px 10px",
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
                  {pipelines.map((p) => (
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
                        {p.invoicesProcessed.toLocaleString("fr-FR")}
                      </td>
                      <td
                        style={{
                          padding: "9px 10px",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 11,
                          color: C.purple,
                        }}
                      >
                        {p.kFactor.toFixed(1)}
                      </td>
                      <td
                        style={{
                          padding: "9px 10px",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 11,
                          color: C.teal,
                        }}
                      >
                        {p.tolerancePct}%
                      </td>
                      <td style={{ padding: "9px 10px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: p.anomalyRate > 0.02 ? C.red : C.success,
                          }}
                        >
                          {(p.anomalyRate * 100).toFixed(2)}%
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ALERTES SECTION ═══════════════════════════════════════════ */}
      {activeSection === "alertes" && (
        <div className="fade-in">
          <CSDiv label="Alertes & notifications" LucideComp={Bell} />

          {/* Alert KPIs */}
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
                label: "Total alertes",
                val: tenantAlerts.length,
                color: C.info,
              },
              { label: "Non-lues", val: unreadAlerts.length, color: C.warning },
              { label: "Critiques", val: criticalAlerts.length, color: C.red },
              {
                label: "Lues",
                val: tenantAlerts.length - unreadAlerts.length,
                color: C.success,
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

          {/* Alert type breakdown + severity donut */}
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
                Alertes par type
              </div>
              {(() => {
                const typeMap = {};
                tenantAlerts.forEach((a) => {
                  typeMap[a.type] = (typeMap[a.type] || 0) + 1;
                });
                const typeData = Object.entries(typeMap).map(
                  ([type, count], i) => ({
                    type,
                    count,
                    color: CC[i % CC.length],
                  })
                );
                return (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={typeData}
                      margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={C.grey100}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="type"
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
                      <Bar dataKey="count" name="Alertes" radius={[8, 8, 0, 0]}>
                        {typeData.map((d, i) => (
                          <Cell key={d.type} fill={d.color} />
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
                Répartition sévérité
              </div>
              {sevData.length > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={sevData}
                        dataKey="c"
                        nameKey="s"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={62}
                        paddingAngle={4}
                        startAngle={90}
                        endAngle={450}
                      >
                        {sevData.map((d, i) => (
                          <Cell key={d.s} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + " alertes", n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {sevData.map((d) => (
                      <div key={d.s}>
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
                              gap: 7,
                            }}
                          >
                            <div
                              style={{
                                width: 9,
                                height: 9,
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
                              {d.s}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "'JetBrains Mono',monospace",
                              color: d.color,
                            }}
                          >
                            {d.c}
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
                                (d.c / Math.max(1, tenantAlerts.length)) * 100
                              }%`,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: 32,
                    fontSize: 12,
                    color: C.grey400,
                  }}
                >
                  Aucune alerte
                </div>
              )}
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
              Fil d'alertes · toutes
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {tenantAlerts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "11px 14px",
                    borderRadius: 10,
                    background: a.read
                      ? "transparent"
                      : a.severity === "critical"
                      ? "rgba(217,79,61,.05)"
                      : a.severity === "warning"
                      ? "rgba(245,158,11,.05)"
                      : "rgba(59,130,246,.04)",
                    border: `1px solid ${
                      a.read
                        ? C.grey100
                        : a.severity === "critical"
                        ? "rgba(217,79,61,.15)"
                        : a.severity === "warning"
                        ? "rgba(245,158,11,.15)"
                        : "rgba(59,130,246,.1)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: a.read
                        ? C.grey300
                        : a.severity === "critical"
                        ? C.red
                        : a.severity === "warning"
                        ? C.warning
                        : C.info,
                      flexShrink: 0,
                      marginTop: 3,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: a.read ? 500 : 700,
                        color: a.read ? C.grey500 : C.grey900,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.message}
                    </div>
                    <div
                      style={{ fontSize: 10, color: C.grey400, marginTop: 2 }}
                    >
                      {new Date(a.timestamp).toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <span
                      className={`badge badge-${
                        a.severity === "critical"
                          ? "red"
                          : a.severity === "warning"
                          ? "warn"
                          : "info"
                      }`}
                      style={{ fontSize: 9 }}
                    >
                      {a.severity}
                    </span>
                    <span className="badge badge-mute" style={{ fontSize: 9 }}>
                      {a.type}
                    </span>
                    {!a.read && (
                      <span
                        className="badge badge-purple"
                        style={{ fontSize: 9 }}
                      >
                        Nouveau
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
