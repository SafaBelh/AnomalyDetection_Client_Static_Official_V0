import { useEffect, useMemo, useState } from "react";
import { BarChart2, GitMerge, Microscope, TrendingUp, Users } from "lucide-react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { CustomTip } from "@/components/ui/CustomTip";
import { Icon } from "@/components/ui/Icon";
import { C, CC } from "@/constants/colors";
import { getPipeline, invoicesForTenant, runMLAnalysis } from "@/store/db";
import { wsAPI, wsEnsureSeries, wsStore } from "@/store/wsAPI";
import { fmtE, fmtK } from "@/utils/formatters";

const formatAnomalyType = (type) => {
  const value = String(type || "").toLowerCase();
  if (value === "amount_spike" || value === "montant") return "Montant inhabituel";
  if (value === "duplicate" || value === "doublon") return "Doublon";
  if (value === "frequency" || value === "frequence" || value === "fréquence") return "Fréquence inhabituelle";
  return type || "Autre";
};

export function MLContent({ pipeline }) {
  const stats = useMemo(() => runMLAnalysis(pipeline.id), [pipeline.id]);
  const p = getPipeline(pipeline.id);
  const invoices = useMemo(
    () => invoicesForTenant(p?.tenantId || ""),
    [p?.tenantId]
  );

  const monthlyChart = useMemo(
    () =>
      stats.monthly.map((m) => ({
        m: m.month.slice(5),
        normal: m.total - m.anomalies,
        anomaly: m.anomalies,
        total: m.total,
      })),
    [stats.monthly]
  );

  const supplierMap = useMemo(() => {
    const m = {};
    invoices.forEach((i) => {
      m[i.supplierName] = (m[i.supplierName] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count], i) => ({ name, count, color: CC[i % CC.length] }));
  }, [invoices]);

  const supplierAnomalyRates = useMemo(() => {
    const m = {};
    invoices.forEach((i) => {
      if (!m[i.supplierName]) m[i.supplierName] = { total: 0, anomalies: 0 };
      m[i.supplierName].total++;
      if (i.status === "anomaly") m[i.supplierName].anomalies++;
    });
    return Object.entries(m)
      .map(([name, d]) => ({
        name,
        rate: parseFloat(
          ((d.anomalies / Math.max(1, d.total)) * 100).toFixed(1)
        ),
        anomalies: d.anomalies,
        total: d.total,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [invoices]);

  const scoreDistrib = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${70 + i * 3}-${73 + i * 3}%`,
      count: 0,
      mid: 71.5 + i * 3,
    }));
    invoices
      .filter((i) => i.anomalyScore != null)
      .forEach((i) => {
        const idx = Math.min(
          9,
          Math.max(0, Math.floor((i.anomalyScore * 100 - 70) / 3))
        );
        bins[idx].count++;
      });
    return bins;
  }, [invoices]);

  const totalAmt = useMemo(
    () => invoices.reduce((s, i) => s + i.amount, 0),
    [invoices]
  );
  const anomalyAmt = useMemo(
    () =>
      invoices
        .filter((i) => i.status === "anomaly")
        .reduce((s, i) => s + i.amount, 0),
    [invoices]
  );

  // series data from wsStore
  const [wsData, setWsData] = useState({
    series: [],
    monthly: { months: [], totals: [] },
    supplierCounts: {},
  });
  useEffect(() => {
    (async () => {
      try {
        wsStore.activePipelineId = pipeline.id;
        wsEnsureSeries();
        const sc = await wsAPI
          .getSupplierCounts()
          .catch(() => ({ supplier_counts: {} }));
        const mt = await wsAPI
          .getMonthlyTotals()
          .catch(() => ({ months: [], totals: [] }));
        setWsData({
          series: wsStore.series.map((s) => ({ ...s })),
          monthly: mt,
          supplierCounts: sc.supplier_counts || {},
        });
      } catch (_) {}
    })();
  }, []);

  const wsSeries = wsData.series;
  const wsSupBarData = Object.entries(wsData.supplierCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ id, count }));
  const wsTop5 = wsSupBarData.slice(0, 5).map((s) => s.id);
  const wsMaxCount = Math.max(...wsSupBarData.map((s) => s.count), 1);

  const wsRadarData = [
    { metric: "Volume", fullMark: 100 },
    { metric: "Stabilité CV", fullMark: 100 },
    { metric: "Taille série", fullMark: 100 },
    { metric: "Tolérance", fullMark: 100 },
    { metric: "Score anomalie", fullMark: 100 },
  ].map((row) => {
    const obj = { ...row };
    wsTop5.forEach((id) => {
      const sd = wsSupBarData.find((s) => s.id === id);
      const sr = wsSeries.find((s) => s.supplier === id && !s.label);
      if (row.metric === "Volume")
        obj[id] = sd ? (sd.count / wsMaxCount) * 100 : 0;
      else if (row.metric === "Stabilité CV")
        obj[id] = sr ? Math.max(0, 100 - (sr.cv || 0) * 150) : 50;
      else if (row.metric === "Taille série")
        obj[id] = sr ? Math.min(100, (sr.n / 50) * 100) : 0;
      else if (row.metric === "Tolérance")
        obj[id] = sr ? Math.max(0, 100 - (sr.tolerance_pct || 10) * 2) : 50;
      else if (row.metric === "Score anomalie") {
        const sRate = supplierAnomalyRates.find((s) => s.name === id);
        obj[id] = sRate ? Math.min(100, sRate.rate * 10) : 0;
      }
    });
    return obj;
  });

  const sortedSeries = [...wsSeries]
    .map((s) => ({
      ...s,
      cv: s.cv ?? 0,
      mu: s.mu ?? 0,
      tolerance_pct: s.tolerance_pct ?? 10,
      n: s.n ?? 0,
    }))
    .sort((a, b) => b.n - a.n);
  const cvData = sortedSeries.map((s, i) => ({
    name: [s.supplier, s.label].filter(Boolean).join(" - ").slice(0, 16),
    cv: parseFloat((s.cv * 100).toFixed(1)) || 0,
    color: CC[i % CC.length],
  }));
  const muData = sortedSeries.map((s) => ({
    name: [s.supplier, s.label].filter(Boolean).join(" - ").slice(0, 16),
    mu: Math.round(s.mu),
    low: Math.round(s.mu * (1 - s.tolerance_pct / 100)),
    high: Math.round(s.mu * (1 + s.tolerance_pct / 100)),
  }));

  const SDiv = ({ label, lucide: LucideComp }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        margin: "6px 0 14px",
      }}
    >
      <div
        style={{
          height: 1,
          flex: 1,
          background: "linear-gradient(90deg,rgba(217,79,61,.3),transparent)",
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
          gap: 5,
        }}
      >
        <span>{LucideComp && <LucideComp size={12} color={C.grey400} />}</span>
        {label}
      </span>
      <div
        style={{
          height: 1,
          flex: 1,
          background: "linear-gradient(270deg,rgba(217,79,61,.3),transparent)",
        }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* KPI HERO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[
          {
            iconName: "fileText",
            label: "Factures",
            val: stats.totalInvoices.toLocaleString("fr-FR"),
            sub: `${fmtK(Math.round(totalAmt))} total`,
            color: C.info,
          },
          {
            iconName: "triangle",
            label: "Anomalies",
            val: stats.anomalies,
            sub: `${(stats.anomalyRate * 100).toFixed(1)}% du volume`,
            color: C.red,
          },
          {
            iconName: "bolt",
            label: "Montant suspect",
            val: fmtK(Math.round(anomalyAmt)),
            sub: `${((anomalyAmt / Math.max(1, totalAmt)) * 100).toFixed(
              1
            )}% du total`,
            color: C.warning,
          },
          {
            iconName: "gear",
            label: "Minimum factures",
            val: Math.max(3, Math.round(stats.kFactor)).toLocaleString("fr-FR"),
            sub: `Tolérance ${p?.tolerancePct ?? 10}%`,
            color: C.purple,
          },
          {
            iconName: "chart",
            label: "Séries actives",
            val: wsSeries.length || "—",
            sub: `${wsTop5.length} fournisseurs`,
            color: C.teal,
          },
        ].map((k, i) => (
          <div
            key={k.label}
            className={`glass-card-sm fade-up-${Math.min(3, i)}`}
            style={{
              padding: "18px 16px 14px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: `${k.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Icon name={k.iconName} size={16} color={k.color} />
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 30,
                color: k.color,
                lineHeight: 1,
                letterSpacing: "-.5px",
              }}
            >
              {k.val}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.grey500,
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                fontSize: 10,
                color: k.color,
                marginTop: 2,
                opacity: 0.75,
              }}
            >
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 1 — Tendances */}
      <SDiv label="Tendances temporelles" lucide={TrendingUp} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Factures normales vs anomalies - 12 mois
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart
              data={monthlyChart}
              margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
            >
              <defs>
                <linearGradient id="mlnorm2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.info} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.info} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="mlanom2" x1="0" y1="0" x2="0" y2="1">
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
                tick={{ fontSize: 10, fill: C.grey500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="normal"
                name="Normales"
                stroke={C.info}
                fill="url(#mlnorm2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="anomaly"
                name="Anomalies"
                stroke={C.red}
                fill="url(#mlanom2)"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Répartition des anomalies
          </div>
          {stats.anomalyByType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={stats.anomalyByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={54}
                    paddingAngle={3}
                  >
                    {stats.anomalyByType.map((t, i) => (
                      <Cell key={t.type} fill={t.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  marginTop: 10,
                }}
              >
                {stats.anomalyByType.map((t) => (
                  <div
                    key={t.type}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: t.color,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        color: C.grey700,
                        textTransform: "capitalize",
                        flex: 1,
                      }}
                    >
                      {t.type}
                    </div>
                    <div
                      style={{
                        flex: 2,
                        height: 5,
                        borderRadius: 3,
                        background: C.grey100,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 3,
                          background: t.color,
                          width: `${t.pct * 100}%`,
                          transition: "width .8s ease-out",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono',monospace",
                        color: C.grey500,
                        width: 50,
                        textAlign: "right",
                      }}
                    >
                      {t.count} - {(t.pct * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: 12,
                color: C.grey400,
                textAlign: "center",
                padding: 28,
              }}
            >
              Aucune anomalie détectée
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2 — Fournisseurs */}
      <SDiv label="Analyse fournisseurs" lucide={Users} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Volume de factures
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={supplierMap}
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
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: C.grey700, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip />
              <Bar dataKey="count" name="Factures" radius={[0, 6, 6, 0]}>
                {supplierMap.map((s, i) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fill: C.grey500, fontSize: 10 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Taux d'anomalies par fournisseur
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={supplierAnomalyRates}
              margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.grey100}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: C.grey600 }}
                tickLine={false}
              />
              <YAxis
                unit="%"
                tick={{ fontSize: 9, fill: C.grey500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Taux anomalies"]} />
              <Bar dataKey="rate" name="Taux %" radius={[6, 6, 0, 0]}>
                {supplierAnomalyRates.map((s, i) => (
                  <Cell
                    key={s.name}
                    fill={
                      s.rate > 3 ? C.red : s.rate > 1.5 ? C.warning : C.success
                    }
                  />
                ))}
                <LabelList
                  dataKey="rate"
                  position="top"
                  formatter={(v) => `${v}%`}
                  style={{ fill: C.grey500, fontSize: 9 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3 — Séries & Radars */}
      <SDiv label="Séries et radar fournisseurs" lucide={GitMerge} />
      <div style={{ marginBottom: 24 }}>
        {wsTop5.length > 0 ? (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div className="glass-card-sm" style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey600,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Radar top {wsTop5.length} fournisseurs
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    data={wsRadarData}
                  >
                    <PolarGrid stroke={C.grey100} />
                    <PolarAngleAxis
                      dataKey="metric"
                      tick={{ fill: C.grey700, fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: C.grey500, fontSize: 8 }}
                    />
                    {wsTop5.map((id, idx) => (
                      <Radar
                        key={id}
                        name={id}
                        dataKey={id}
                        stroke={CC[idx % CC.length]}
                        fill={CC[idx % CC.length]}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: C.white,
                        border: `1px solid ${C.grey100}`,
                        borderRadius: 10,
                        fontSize: 11,
                      }}
                      formatter={(v) => [`${v.toFixed(0)}/100`]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card-sm" style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey600,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Stabilité CV par série
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={cvData}
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
                      unit="%"
                      tick={{ fontSize: 9, fill: C.grey500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 9, fill: C.grey700 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip formatter={(v) => [`${v}%`, "CV"]} />
                    <Bar dataKey="cv" name="CV %" radius={[0, 6, 6, 0]}>
                      {cvData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            d.cv > 25
                              ? C.warning
                              : d.cv > 15
                              ? C.info
                              : C.success
                          }
                        />
                      ))}
                      <LabelList
                        dataKey="cv"
                        position="right"
                        formatter={(v) => `${v}%`}
                        style={{ fill: C.grey500, fontSize: 9 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {muData.length > 0 && (
              <div className="glass-card-sm" style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey600,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                  }}
                >
                  Fourchettes de montants prévus
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={muData}
                    margin={{ top: 4, right: 12, bottom: 4, left: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.grey100}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: C.grey700 }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={fmtK}
                      tick={{ fontSize: 9, fill: C.grey500 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTip />} />
                    <Bar
                      dataKey="low"
                      name="Seuil min"
                      fill={C.success}
                      fillOpacity={0.4}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="mu"
                      name="Référence moyenne"
                      fill={C.info}
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="high"
                      name="Seuil max"
                      fill={C.warning}
                      fillOpacity={0.4}
                      radius={[4, 4, 0, 0]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div
            className="glass-card-sm"
            style={{
              padding: 24,
              textAlign: "center",
              fontSize: 12,
              color: C.grey400,
            }}
          >
            Lancez le pipeline workspace pour générer les données de séries.
          </div>
        )}
      </div>

      {/* SECTION 4 — Scores & paramètres */}
      <SDiv label="Scores et paramètres" lucide={BarChart2} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Distribution des scores d'anomalie
          </div>
          <div style={{ fontSize: 11, color: C.grey400, marginBottom: 14 }}>
            Score ML - plus haut = plus certain
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart
              data={scoreDistrib}
              margin={{ top: 4, right: 8, bottom: 4, left: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.grey100}
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 9, fill: C.grey500 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: C.grey500 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Bar dataKey="count" name="Factures" radius={[6, 6, 0, 0]}>
                {scoreDistrib.map((b, i) => (
                  <Cell
                    key={i}
                    fill={
                      b.mid > 90 ? C.red : b.mid > 80 ? C.warning : C.success
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card-sm" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey600,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Paramètres actifs
          </div>
          {[
            {
              label: "Méthode",
              val: "Écart habituel",
              mono: false,
            },
            {
              label: "Règle",
              val: "Médiane + écart habituel",
              mono: true,
            },
            { label: "Minimum factures", val: Math.max(3, Math.round(stats.kFactor)).toLocaleString("fr-FR"), mono: true },
            {
              label: "Tolérance",
              val: `${p?.tolerancePct ?? 10}%`,
              mono: true,
            },
            { label: "Connecteur", val: p?.connector || "-", mono: false },
            { label: "Fréquence", val: p?.freq === "manual" ? "Manuelle" : p?.freq || "-", mono: false },
          ].map(({ label, val, mono }, i, arr) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderBottom:
                  i < arr.length - 1 ? "1px solid rgba(0,0,0,.05)" : "none",
              }}
            >
              <span style={{ fontSize: 11, color: C.grey500 }}>{label}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: mono ? C.red : C.grey900,
                  fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit",
                }}
              >
                {val}
              </span>
            </div>
          ))}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {stats.anomalyByType.map((t, i) => {
              const pctScore = (t.pct * 100).toFixed(0);
              return (
                <div key={t.type}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.grey800,
                        textTransform: "capitalize",
                      }}
                    >
                      {formatAnomalyType(t.type)}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "'JetBrains Mono',monospace",
                        color: t.color,
                      }}
                    >
                      {pctScore}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: C.grey100,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 4,
                        background: `linear-gradient(90deg,${t.color}80,${t.color})`,
                        width: `${pctScore}%`,
                        transition: "width .9s ease-out",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5 — Scatter */}
      <SDiv label="Scatter plot anomalies" lucide={Microscope} />
      <div className="glass-card-sm" style={{ padding: 20, marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.grey600,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: ".06em",
          }}
        >
          Normaux (rouge) vs Anomalies (orange)
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
            <XAxis
              dataKey="x"
              type="number"
              name="Index"
              tick={{ fontSize: 10, fill: C.grey500 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="Montant"
              tickFormatter={(v) => fmtK(Math.round(v))}
              tick={{ fontSize: 10, fill: C.grey500 }}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis range={[28, 28]} />
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
                      padding: "8px 12px",
                      fontSize: 11,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: d?.isAnomaly ? C.warning : C.grey700,
                      }}
                    >
                      {d?.isAnomaly ? "Anomalie" : "Normal"}
                    </div>
                    <div style={{ color: C.grey500, marginTop: 2 }}>
                      {fmtE(Math.round(d?.y || 0))}
                    </div>
                  </div>
                );
              }}
            />
            <Scatter
              name="Normal"
              data={stats.scatter.filter((d) => !d.isAnomaly)}
              fill={C.red}
              fillOpacity={0.5}
            />
            <Scatter
              name="Anomalie"
              data={stats.scatter.filter((d) => d.isAnomaly)}
              fill={C.warning}
              fillOpacity={0.9}
              shape="diamond"
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
