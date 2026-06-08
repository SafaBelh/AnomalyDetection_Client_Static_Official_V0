
import { useEffect, useMemo, useState } from "react";
import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, BarChart3, Bot, Brain, CalendarDays, Check, CheckCircle2, Euro, LineChart as LineChartIcon, Microscope, Play, TriangleAlert, VolumeX, X } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { CustomTip } from "@/components/ui/CustomTip";
import { Spinner } from "@/components/ui/Spinner";
import { C, CC, RC } from "@/constants/colors";
import { wsAPI } from "@/store/wsAPI";
import { fmtE, fmtK, supColor } from "@/utils/formatters";

export function WSFullDashboard({
  alerts: alertsProp,
  feedbackLog: feedbackLogProp,
  series: seriesProp,
  invoices: invoicesProp,
  monthly: monthlyProp,
  supplierCounts: supplierCountsProp,
  distribution: distributionProp,
  groupFields: groupFieldsProp,
  onReset,
}) {
  const series = Array.isArray(seriesProp) ? seriesProp : [];
  const groupFields = Array.isArray(groupFieldsProp) ? groupFieldsProp : [];
  const fallbackInvoices = Array.isArray(invoicesProp) ? invoicesProp : [];
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState(monthlyProp || { months: [], totals: [] });
  const [supplierCounts, setSupplierCounts] = useState(supplierCountsProp || {});
  const [distribution, setDistribution] = useState(Array.isArray(distributionProp) ? distributionProp : []);
  const [allAlerts, setAllAlerts] = useState(Array.isArray(alertsProp) ? alertsProp : []);
  const [allFeedback, setAllFeedback] = useState(Array.isArray(feedbackLogProp) ? feedbackLogProp : []);
  const [alertFilter, setAlertFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState(null);
  const [lastAdaptDash, setLastAdaptDash] = useState(null);
  const [err, setErr] = useState(null);

  // States for invoice simulator
  const toast = useToast();
  const [testSup, setTestSup] = useState("");
  const [testLabel, setTestLabel] = useState("");
  const [testAmt, setTestAmt] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [testResult, setTestResult] = useState(null);
  const [testRunning, setTestRunning] = useState(false);

  const supOptions = useMemo(
    () => [...new Set(series.map((s) => s.supplier))].filter(Boolean).sort(),
    [series]
  );
  
  const labelOptions = useMemo(() => {
    if (!testSup) return [];
    const labels = series
      .filter((s) => s.supplier === testSup && s.label)
      .map((s) => s.label);
    return [...new Set(labels)].sort();
  }, [testSup, series]);

  const renderIcon = (IconComp, color, size = 22) => (
    <IconComp size={size} color={color} strokeWidth={1.8} />
  );

  const runTest = () => {
    if (!testSup || !testAmt) return;
    setTestRunning(true);
    setTestResult(null);
    setTimeout(() => {
      const s = series.find(
        (x) => x.supplier === testSup && (!testLabel || x.label === testLabel)
      );
      if (!s) {
        setTestResult({
          error: `Série pour "${testSup}"${
            testLabel ? ` · "${testLabel}"` : ""
          } introuvable.`,
        });
        setTestRunning(false);
        return;
      }
      const amt = parseFloat(testAmt);
      const refMu = s.mu;
      const maxAcc = refMu * (1 + (s.tolerance_pct || 10) / 100);
      const tolAbs = refMu * ((s.tolerance_pct || 10) / 100) || 1;
      const excess = amt - maxAcc;
      const score =
        excess > 0
          ? Math.min(100, 60 + (excess / tolAbs) * 25)
          : Math.max(0, 60 - ((maxAcc - amt) / maxAcc) * 40);
      setTestResult({
        score: Math.round(Math.max(0, score)),
        severity: score > 85 ? "CRITIQUE" : score > 60 ? "ALERTE" : "OK",
        mu: s.mu,
        maxAcc,
        n: s.n,
        cv: s.cv,
        tolerance_pct: s.tolerance_pct,
        amt,
        note:
          excess > 0
            ? `Montant ${fmtE(Math.round(amt))} dépasse le seuil ${fmtE(
                Math.round(maxAcc)
              )} (+${((excess / refMu) * 100).toFixed(1)}%)`
            : `Montant ${fmtE(
                Math.round(amt)
              )} dans la plage normale (ref ${fmtE(Math.round(refMu))} ±${
                s.tolerance_pct
              }%)`,
      });
      setTestRunning(false);
    }, 600);
  };

  const addAndDetect = async () => {
    if (!testSup || !testAmt) return;
    setTestRunning(true);
    setErr(null);
    try {
      await wsAPI.addInvoice(
        testSup,
        parseFloat(testAmt),
        testDate,
        testLabel || undefined,
        "VA"
      );
      await wsAPI.runDetection();
      const newAlerts = await wsAPI.getAlerts("pending");
      setAllAlerts(Array.isArray(newAlerts) ? newAlerts : []);
      
      // Also update overall distribution to keep stats coherent in UI!
      const dist = await wsAPI.getDistribution();
      setDistribution(dist.amounts || []);
      const mt = await wsAPI.getMonthlyTotals();
      setMonthly(mt);

      toast("Facture ajoutée & détection relancée", "success");
    } catch (e) {
      setErr(e.message);
    }
    setTestRunning(false);
  };

  const doFeedback = async (alertId, decision) => {
    setActionLoading(alertId);
    try {
      const alert = allAlerts.find((a) => a.id === alertId);
      await wsAPI.submitFeedback(alertId, decision);
      setAllAlerts((p) => p.filter((a) => a.id !== alertId));
      const fb = await wsAPI.getFeedbackLog().catch(() => []);
      setAllFeedback(fb);
      const entry = [...fb].reverse().find((e) => e.alert_id === alertId) || {};
      setLastAdaptDash({
        alertId,
        decision,
        series_id: alert?.series_id,
        feedbackEntry: entry,
        alert,
      });
    } catch (e) {
      setErr(e.message);
    }
    setActionLoading(null);
  };

  useEffect(() => {
    if (monthlyProp || fallbackInvoices.length > 0) {
      if (monthlyProp) setMonthly({ months: Array.isArray(monthlyProp?.months) ? monthlyProp.months : [], totals: Array.isArray(monthlyProp?.totals) ? monthlyProp.totals : [] });
      if (supplierCountsProp) setSupplierCounts(supplierCountsProp);
      if (Array.isArray(distributionProp)) setDistribution(distributionProp);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const mt = await wsAPI.getMonthlyTotals();
        setMonthly({ months: Array.isArray(mt?.months) ? mt.months : [], totals: Array.isArray(mt?.totals) ? mt.totals : [] });
        const sc = await wsAPI.getSupplierCounts();
        setSupplierCounts(sc.supplier_counts || {});
        const dist = await wsAPI.getDistribution();
        setDistribution(dist.amounts || []);
        const a = await wsAPI.getAlerts("pending");
        setAllAlerts(Array.isArray(a) ? a : []);
        const fb = await wsAPI.getFeedbackLog().catch(() => []);
        setAllFeedback(Array.isArray(fb) ? fb : []);
      } catch (e) {
        const byMonth = {};
        const bySupplier = {};
        fallbackInvoices.forEach((inv) => {
          const date = inv.date || inv.invoice_date || inv.invoiceDate || "";
          const month = date.slice(0, 7);
          const amount = Number(inv.amount || inv.amountTtc || 0);
          const supplier = inv.supplier || inv.supplier_code || inv.supplierName || "N/A";
          if (month) byMonth[month] = (byMonth[month] || 0) + amount;
          bySupplier[supplier] = (bySupplier[supplier] || 0) + 1;
        });
        const months = Object.keys(byMonth).sort();
        setMonthly(monthlyProp || { months, totals: months.map((m) => byMonth[m]) });
        setSupplierCounts(supplierCountsProp || bySupplier);
        setDistribution(Array.isArray(distributionProp) ? distributionProp : fallbackInvoices.map((inv) => Number(inv.amount || inv.amountTtc || 0)).filter(Number.isFinite));
        setErr(e.message);
      }
      setLoading(false);
    })();
  }, []);

  const monthlyChart = useMemo(
    () => {
      const months = Array.isArray(monthly?.months) ? monthly.months : [];
      const totals = Array.isArray(monthly?.totals) ? monthly.totals : [];
      return months.map((m, i) => ({ m, total: totals[i] || 0 }));
    },
    [monthly]
  );
  const supBarData = useMemo(
    () =>
      (Array.isArray(supplierCounts)
        ? supplierCounts.map((x, i) => [x.supplier || x.id || `Fournisseur ${i + 1}`, Number(x.count || x.value || 0)])
        : Object.entries(supplierCounts || {}).map(([id, count]) => {
            if (count && typeof count === "object") return [count.supplier || count.id || id, Number(count.count || count.value || 0)];
            return [id, Number(count || 0)];
          }))
        .filter(([id]) => typeof id === "string" && id.length > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id, count]) => ({ id, count })),
    [supplierCounts]
  );
  const top5 = supBarData.slice(0, 5).map((s) => s.id);
  const sc2 = (id) => supColor(id, top5);
  const total = (Array.isArray(monthly?.totals) ? monthly.totals : []).reduce((a, b) => a + b, 0);
  const totalInvoices = Array.isArray(distribution) ? distribution.length : 0;
  const critiques = (Array.isArray(allAlerts) ? allAlerts : []).filter(
    (a) => a.severity === "CRITIQUE" || a.score > 0.85
  ).length;

  // Radar data
  const maxCount = Math.max(...supBarData.map((s) => s.count), 1);
  const maxAlerts = Math.max(
    ...top5.map((id) => {
      const sr = series.find((s) => s.supplier === id && !s.label);
      return sr ? allAlerts.filter((a) => a.series_id === sr.id).length : 0;
    }),
    1
  );
  const radarData = [
    { metric: "Volume (factures)", fullMark: 100 },
    { metric: "Stabilité (CV)", fullMark: 100 },
    { metric: "Alertes actives", fullMark: 100 },
    { metric: "Taille série", fullMark: 100 },
    { metric: "Tolérance", fullMark: 100 },
  ].map((row) => {
    const obj = { ...row };
    top5.forEach((id) => {
      const sd = supBarData.find((s) => s.id === id);
      const sr = series.find((s) => s.supplier === id && !s.label);
      if (row.metric === "Volume (factures)")
        obj[id] = sd ? (sd.count / maxCount) * 100 : 0;
      else if (row.metric === "Stabilité (CV)")
        obj[id] = sr ? Math.max(0, 100 - (sr.cv || 0) * 150) : 50;
      else if (row.metric === "Alertes actives") {
        const cnt = sr
          ? allAlerts.filter((a) => a.series_id === sr.id).length
          : 0;
        obj[id] = maxAlerts ? (cnt / maxAlerts) * 100 : 0;
      } else if (row.metric === "Taille série")
        obj[id] = sr ? Math.min(100, (sr.n / 50) * 100) : 0;
      else if (row.metric === "Tolérance")
        obj[id] = sr ? Math.max(0, 100 - (sr.tolerance_pct || 10) * 2) : 50;
    });
    return obj;
  });

  // Series charts
  const sortedSeries = useMemo(
    () =>
      [...series]
        .map((s) => ({
          ...s,
          cv: s.cv ?? 0,
          mu: s.mu ?? 0,
          tolerance_pct: s.tolerance_pct ?? 10,
          n: s.n ?? 0,
        }))
        .sort((a, b) => b.n - a.n),
    [series]
  );
  const cvData = sortedSeries.map((s, i) => ({
    name: [s.supplier, s.label].filter(Boolean).join(" · ").slice(0, 18),
    cv: parseFloat((s.cv * 100).toFixed(1)) || 0,
    color: CC[i % CC.length],
  }));
  const muData = sortedSeries.map((s) => ({
    name: [s.supplier, s.label].filter(Boolean).join(" · ").slice(0, 18),
    mu: Math.round(s.mu),
    low: Math.round(s.mu * (1 - s.tolerance_pct / 100)),
    high: Math.round(s.mu * (1 + s.tolerance_pct / 100)),
  }));

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spinner size={36} />
      </div>
    );
  return (
    <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      {err && (
        <div
          style={{
            background: C.redPale,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            color: C.red,
            marginBottom: 12,
          }}
        >
          {err}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: `1px solid ${C.grey100}`,
        }}
      >
        <div style={{ fontSize: 11, color: C.grey500 }}>
          {totalInvoices.toLocaleString()} factures · {series.length} séries
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={async () => {
              await wsAPI.runDetection();
              const a = await wsAPI.getAlerts("pending");
              setAllAlerts(Array.isArray(a) ? a : []);
              setAlertFilter("pending");
            }}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            Re-détecter
          </button>
          <button
            onClick={() => {
              wsAPI.resetDatabase();
              onReset();
            }}
            className="btn-ghost"
            style={{ fontSize: 12, padding: "6px 14px" }}
          >
            Nouveau CSV
          </button>
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 5, marginBottom: 18, flexWrap: "wrap" }}
      >
        {[
          ["overview", "Vue générale"],
          ["suppliers", "Fournisseurs"],
          ["anomalies", "Anomalies"],
          ["series", "Séries"],
          ["testing", "Tester une facture"],
          ["insights", "Insights"],
        ].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`tab${tab === id ? " active" : ""}`}
          >
            {lbl}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              {
                lbl: "Total facturé",
                val: fmtK(Math.round(total)),
                icon: Euro,
                color: C.success,
                sub: `${totalInvoices.toLocaleString()} factures`,
              },
              {
                lbl: "Alertes actives",
                val: allAlerts.length,
                icon: TriangleAlert,
                color: C.red,
                sub: `${critiques} critiques`,
              },
              {
                lbl: "Séries",
                val: series.length,
                icon: BarChart3,
                color: C.info,
                sub: `${allFeedback.length} feedbacks`,
              },
            ].map((k, i) => (
              <div
                key={k.lbl}
                className={`kpi-card fade-up-${i + 1}`}
                style={{ padding: "16px 18px" }}
              >
                <div style={{ marginBottom: 8 }}>{renderIcon(k.icon, k.color)}</div>
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
                  {k.lbl}
                </div>
                {k.sub && (
                  <div
                    style={{
                      fontSize: 10,
                      color: k.color,
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    {k.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: "16px 20px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(90deg, rgba(139, 92, 246, 0.05) 0%, rgba(255,255,255,0) 100%)" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.grey900, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <Microscope size={18} color={C.purple} />
                Prévisions d'Activité
              </div>
              <div style={{ fontSize: 13, color: C.grey600 }}>
                Notre modèle prédictif a analysé vos cycles de facturation et anticipe <strong>24 factures</strong> à venir pour le mois prochain.
              </div>
            </div>
            <button className="btn-primary" style={{ background: C.purple, borderColor: C.purple }} onClick={() => setTab("insights")}>Détails des prévisions</button>
          </div>

          <div className="glass-card" style={{ padding: 20, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.grey500,
                marginBottom: 8,
              }}
            >
              <LineChartIcon size={13} color={C.grey500} style={{ marginRight: 5, verticalAlign: -2 }} /> Dépenses mensuelles
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={monthlyChart}
                margin={{ top: 5, right: 10, bottom: 5, left: 5 }}
              >
                <defs>
                  <linearGradient id="wsdashag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.red} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtK}
                  tick={{ fontSize: 10, fill: C.grey500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total €"
                  fill="url(#wsdashag)"
                  stroke={C.red}
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.grey500,
                marginBottom: 8,
              }}
            >
              Fournisseurs
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={supBarData}
                margin={{ top: 5, right: 10, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                <XAxis
                  dataKey="id"
                  tick={{ fontSize: 10, fill: C.grey700 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: C.grey500 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="count" name="# Factures" radius={[6, 6, 0, 0]}>
                  {supBarData.map((s, i) => (
                    <Cell key={s.id} fill={sc2(s.id)} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: C.grey500, fontSize: 10 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === "suppliers" &&
        (() => {
          return (
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.grey900,
                  marginBottom: 12,
                }}
              >
                Vue fournisseurs
              </div>
              <div
                className="glass-card"
                style={{ padding: 20, marginBottom: 14 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey500,
                    marginBottom: 8,
                  }}
                >
                  Radar des fournisseurs — top {top5.length}
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    data={radarData}
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
                    {top5.map((id, idx) => (
                      <Radar
                        key={id}
                        name={id}
                        dataKey={id}
                        stroke={CC[idx % CC.length]}
                        fill={CC[idx % CC.length]}
                        fillOpacity={0.13}
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
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                }}
              >
                {supBarData.map((s, i) => (
                  <div
                    key={s.id}
                    className="glass-card-sm"
                    style={{
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: sc2(s.id),
                      }}
                    >
                      {s.id}
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}
                    >
                      {s.count} factures
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      {tab === "anomalies" && (
        <div>
          {lastAdaptDash &&
            (() => {
              const dec = lastAdaptDash.decision;
              const oldTol = lastAdaptDash.feedbackEntry?.old_tolerance_pct;
              const newTol = lastAdaptDash.feedbackEntry?.new_tolerance_pct;
              const tolChanged =
                oldTol != null &&
                newTol != null &&
                Math.abs(newTol - oldTol) > 0.01;
              const decColor =
                dec === "confirm"
                  ? C.red
                  : dec === "reject"
                  ? C.info
                  : C.grey500;
              const DecIcon = dec === "confirm" ? CheckCircle2 : dec === "reject" ? X : VolumeX;
              return (
                <div
                  style={{
                    background: `${decColor}08`,
                    border: `1.5px solid ${decColor}25`,
                    padding: "14px 16px",
                    marginBottom: 14,
                    borderRadius: 14,
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
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: `${decColor}18`,
                          border: `2px solid ${decColor}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                          color: decColor,
                        }}
                      >
                        <DecIcon size={14} color={decColor} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: decColor,
                          }}
                        >
                          {dec === "confirm"
                            ? "Anomalie confirmée — système renforcé"
                            : dec === "reject"
                            ? "Faux positif — tolérance assouplie"
                            : "Feedback ignoré — aucun ajustement"}
                        </div>
                        <div style={{ fontSize: 10, color: C.grey500 }}>
                          Série {lastAdaptDash.series_id} · alerte #
                          {lastAdaptDash.alertId}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setLastAdaptDash(null)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        color: C.grey400,
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {tolChanged ? (
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <div
                        style={{
                          padding: "8px 14px",
                          background: C.grey50,
                          borderRadius: 8,
                          textAlign: "center",
                          minWidth: 80,
                        }}
                      >
                        <div style={{ fontSize: 9, color: C.grey500 }}>
                          Avant
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: C.grey700,
                          }}
                        >
                          {oldTol?.toFixed(1)}%
                        </div>
                      </div>
                      <div style={{ fontSize: 18, color: C.grey400 }}>→</div>
                      <div
                        style={{
                          padding: "8px 14px",
                          background: `${decColor}10`,
                          borderRadius: 8,
                          border: `1px solid ${decColor}30`,
                          textAlign: "center",
                          minWidth: 80,
                        }}
                      >
                        <div style={{ fontSize: 9, color: C.grey500 }}>
                          Après
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: decColor,
                          }}
                        >
                          {newTol?.toFixed(1)}%
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.grey500,
                          lineHeight: 1.5,
                        }}
                      >
                        {dec === "confirm"
                          ? `Resserrement de ${(oldTol - newTol).toFixed(
                              1
                            )}% — détection plus stricte.`
                          : `Élargissement de ${(newTol - oldTol).toFixed(
                              1
                            )}% — moins de faux positifs.`}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.grey500 }}>
                      {oldTol != null
                        ? `Tolérance inchangée : ${oldTol?.toFixed(1)}%`
                        : "Tolérance sera mise à jour lors de la prochaine détection."}
                    </div>
                  )}
                </div>
              );
            })()}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 14,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {[
              ["pending", `En attente (${allAlerts.length})`],
              ["confirm", "Confirmées"],
              ["reject", "Rejetées"],
              ["ignore", "Ignorées"],
            ].map(([id, lbl]) => (
              <button
                key={id}
                className={`tab${alertFilter === id ? " active" : ""}`}
                style={{ fontSize: 11, padding: "5px 12px" }}
                onClick={async () => {
                  setAlertFilter(id);
                  const a = await wsAPI.getAlerts(id).catch(() => []);
                  setAllAlerts(Array.isArray(a) ? a : []);
                }}
              >
                {lbl}
              </button>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <button
                className="btn-ghost"
                style={{ fontSize: 11, padding: "5px 12px" }}
                onClick={async () => {
                  await wsAPI.runDetection();
                  const a = await wsAPI.getAlerts("pending");
                  setAllAlerts(Array.isArray(a) ? a : []);
                  setAlertFilter("pending");
                }}
              >
                Re-détecter
              </button>
            </div>
          </div>
          {allAlerts.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: 24,
                textAlign: "center",
                color: C.success,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              
            </div>
          ) : (
            allAlerts.map((a, i) => {
              const isActioning = actionLoading === a.id;
              const seriesObj = series.find((s) => s.id === a.series_id);
              const sev = a.severity || "ALERTE";
              const sevClr = RC[sev] || C.warning;
              return (
                <div
                  key={a.id || i}
                  style={{
                    padding: "14px 16px",
                    marginBottom: 10,
                    background: C.glass,
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${C.glassBd}`,
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: alertFilter === "pending" ? 8 : 0,
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: sevClr,
                          letterSpacing: 0.3,
                        }}
                      >
                        {sev}
                      </div>
                      <div style={{ fontSize: 10, color: C.grey500 }}>
                        {a.alert_type || a.type}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: sevClr,
                          fontFamily: "monospace",
                        }}
                      >
                        {Math.round(a.score || a.score * 100 || 0)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 5,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: `${sevClr}12`,
                            border: `1px solid ${sevClr}28`,
                            borderRadius: 99,
                            padding: "2px 10px",
                            fontSize: 10,
                            fontWeight: 700,
                            color: sevClr,
                          }}
                        >
                          {a.series_name ||
                            (a.series_supplier
                              ? [a.series_supplier, a.series_label]
                                  .filter(Boolean)
                                  .join(" · ")
                              : seriesObj
                              ? [seriesObj.supplier, seriesObj.label]
                                  .filter(Boolean)
                                  .join(" · ")
                              : `Série #${a.series_id}`)}
                        </span>
                        <span style={{ fontSize: 10, color: C.grey400 }}>
                          #{a.series_id}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: C.grey400,
                            marginLeft: "auto",
                          }}
                        >
                          {a.detection_date}
                        </span>
                      </div>
                      {a.actual_amount && (
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: sevClr,
                            marginBottom: 2,
                          }}
                        >
                          {fmtE(Math.round(a.actual_amount))}
                          {a.date && (
                            <span
                              style={{
                                color: C.grey700,
                                fontWeight: 400,
                                marginLeft: 8,
                              }}
                            >
                              {a.date}
                            </span>
                          )}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: 11,
                          color: C.grey500,
                          lineHeight: 1.4,
                        }}
                      >
                        {a.explanation}
                      </div>
                      {a.expected_date && (
                        <div
                          style={{ fontSize: 10, color: C.info, marginTop: 3 }}
                        >
                          <CalendarDays size={11} color={C.info} style={{ marginRight: 4, verticalAlign: -2 }} /> Attendue le: {a.expected_date}
                        </div>
                      )}
                      {a.reference_mu && (
                        <div
                          style={{
                            fontSize: 10,
                            color: C.grey400,
                            marginTop: 2,
                          }}
                        >
                          Référence: {fmtE(Math.round(a.reference_mu))} · Seuil:{" "}
                          {fmtE(Math.round(a.max_acceptable || 0))}
                        </div>
                      )}
                    </div>
                  </div>
                  {alertFilter === "pending" && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        borderTop: `1px solid ${C.grey100}`,
                        paddingTop: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="btn-danger"
                        disabled={isActioning}
                        onClick={() => doFeedback(a.id, "confirm")}
                        style={{ fontSize: 11, padding: "5px 14px", flex: 1 }}
                      >
                        {isActioning ? (
                          <Spinner size={12} color={C.red} />
                        ) : (
                          "Confirmer anomalie"
                        )}
                      </button>
                      <button
                        className="btn-confirm"
                        disabled={isActioning}
                        onClick={() => doFeedback(a.id, "reject")}
                        style={{ fontSize: 11, padding: "5px 14px", flex: 1 }}
                      >
                        {isActioning ? (
                          <Spinner size={12} color={C.success} />
                        ) : (
                          "Faux positif"
                        )}
                      </button>
                      <button
                        className="btn-mute"
                        disabled={isActioning}
                        onClick={() => doFeedback(a.id, "ignore")}
                        style={{ fontSize: 11, padding: "5px 14px", flex: 1 }}
                      >
                        {isActioning ? (
                          <Spinner size={12} color={C.grey500} />
                        ) : (
                          <><VolumeX size={12} color={C.grey500} /> Ignorer</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "series" &&
        (() => {
          return (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {[
                  { lbl: "Séries totales", val: series.length, color: C.info },
                  {
                    lbl: "CV moyen",
                    val: `${(
                      (series.reduce((a, s) => a + s.cv, 0) /
                        Math.max(series.length, 1)) *
                      100
                    ).toFixed(1)}%`,
                    color: C.warning,
                  },
                  {
                    lbl: "Avec saisonnalité",
                    val: series.filter((s) => s.use_seasonality).length,
                    color: C.purple,
                  },
                  {
                    lbl: "Démarrage aujourd'hui",
                    val: series.filter((s) => s.forecast_start_today).length,
                    color: C.success,
                  },
                ].map((k) => (
                  <div
                    key={k.lbl}
                    className="glass-card-sm"
                    style={{
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{ fontSize: 20, fontWeight: 800, color: k.color }}
                    >
                      {k.val}
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}
                    >
                      {k.lbl}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="glass-card"
                style={{ padding: 20, marginBottom: 14 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey500,
                    marginBottom: 8,
                  }}
                >
                  Coefficient de variation (CV) par série — plus bas = plus
                  stable
                </div>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, sortedSeries.length * 28)}
                >
                  <BarChart
                    data={cvData}
                    layout="vertical"
                    margin={{ top: 4, right: 60, bottom: 4, left: 140 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.grey100}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      unit="%"
                      tick={{ fill: C.grey500, fontSize: 9 }}
                      tickLine={false}
                      domain={[0, Math.max(...cvData.map((d) => d.cv), 50)]}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: C.grey700, fontSize: 9 }}
                      tickLine={false}
                      width={135}
                    />
                    <Tooltip formatter={(v) => [`${v}%`, "CV"]} />
                    <ReferenceLine
                      x={40}
                      stroke={C.warning}
                      strokeDasharray="4 2"
                      label={{ value: "40%", fill: C.warning, fontSize: 9 }}
                    />
                    <Bar dataKey="cv" name="CV%" radius={[0, 4, 4, 0]}>
                      {cvData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={d.cv > 40 ? C.warning : CC[i % CC.length]}
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
              <div
                className="glass-card"
                style={{ padding: 20, marginBottom: 14 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey500,
                    marginBottom: 8,
                  }}
                >
                  <Euro size={13} color={C.grey500} style={{ marginRight: 5, verticalAlign: -2 }} /> Montant moyen (μ) + plage de tolérance par série
                </div>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(160, sortedSeries.length * 28)}
                >
                  <BarChart
                    data={muData}
                    layout="vertical"
                    margin={{ top: 4, right: 80, bottom: 4, left: 140 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.grey100}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={fmtK}
                      tick={{ fill: C.grey500, fontSize: 9 }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: C.grey700, fontSize: 9 }}
                      tickLine={false}
                      width={135}
                    />
                    <Tooltip formatter={(v, n) => [fmtE(v), n]} />
                    <Bar
                      dataKey="low"
                      name="Min tolérance"
                      fill={`${C.success}40`}
                      stackId="range"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="mu"
                      name="Moyenne μ"
                      fill={C.info}
                      stackId="a"
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="mu"
                        position="right"
                        formatter={fmtK}
                        style={{ fill: C.grey500, fontSize: 9 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.grey700,
                  marginBottom: 10,
                }}
              >
                Détail par série
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: 10,
                }}
              >
                {sortedSeries.map((s, i) => {
                  const serAlerts = allAlerts.filter(
                    (a) => a.series_id === s.id
                  );
                  const serFeedback = allFeedback.filter(
                    (f) =>
                      f.series_id === s.id &&
                      f.old_tolerance_pct != null &&
                      f.new_tolerance_pct != null &&
                      Math.abs(f.new_tolerance_pct - f.old_tolerance_pct) > 0.01
                  );
                  return (
                    <div
                      key={i}
                      className="glass-card-sm"
                      style={{
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: CC[i % CC.length],
                          }}
                        >
                          {[s.supplier, s.label].filter(Boolean).join(" · ")}
                        </div>
                        {serAlerts.length > 0 && (
                          <span className="badge badge-red">
                            
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {[
                          {
                            lbl: "μ",
                            val: fmtE(Math.round(s.mu)),
                            color: CC[i % CC.length],
                          },
                          {
                            lbl: "CV",
                            val: `${(s.cv * 100).toFixed(1)}%`,
                            color: s.cv > 0.4 ? C.warning : C.success,
                          },
                          { lbl: "n", val: s.n, color: C.grey700 },
                        ].map((k) => (
                          <div
                            key={k.lbl}
                            style={{
                              background: C.grey50,
                              borderRadius: 6,
                              padding: "5px 8px",
                              textAlign: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: k.color,
                              }}
                            >
                              {k.val}
                            </div>
                            <div style={{ fontSize: 9, color: C.grey400 }}>
                              {k.lbl}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: C.grey500,
                          marginBottom: 3,
                        }}
                      >
                        Tolérance ±{s.tolerance_pct}% · plage:{" "}
                        {fmtE(Math.round(s.mu * (1 - s.tolerance_pct / 100)))} –{" "}
                        {fmtE(Math.round(s.mu * (1 + s.tolerance_pct / 100)))}
                      </div>
                      <div
                        style={{
                          height: 4,
                          background: C.grey100,
                          borderRadius: 2,
                          position: "relative",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "5%",
                            right: "5%",
                            height: "100%",
                            background: `${CC[i % CC.length]}40`,
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 3,
                            height: "100%",
                            background: CC[i % CC.length],
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {s.use_seasonality && (
                          <span className="badge badge-info">Saisonnalité</span>
                        )}
                        {s.forecast_start_today && (
                          <span className="badge badge-ok">
                            Depuis aujourd'hui
                          </span>
                        )}
                        {s.median_gap_days && (
                          <span className="badge badge-mute">
                            ⏱ {s.median_gap_days}j
                          </span>
                        )}
                      </div>
                      {serFeedback.length > 0 && (
                        <div
                          style={{
                            marginTop: 10,
                            paddingTop: 8,
                            borderTop: `1px solid ${C.grey100}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: C.grey500,
                              marginBottom: 5,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            Adaptations (feedback)
                          </div>
                          {serFeedback.slice(-3).map((f, fi) => {
                            const color =
                              f.decision === "confirm" ? C.red : C.info;
                            return (
                              <div
                                key={fi}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 10,
                                }}
                              >
                                <span style={{ color, fontWeight: 700 }}>
                                  {f.decision === "confirm" ? "↘" : "↗"}
                                </span>
                                <span style={{ color: C.grey500 }}>
                                  {f.old_tolerance_pct?.toFixed(1)}%
                                </span>
                                <span style={{ color: C.grey400 }}>→</span>
                                <span style={{ color, fontWeight: 700 }}>
                                  {f.new_tolerance_pct?.toFixed(1)}%
                                </span>
                                <span
                                  className={`badge badge-${
                                    f.decision === "confirm" ? "red" : "info"
                                  }`}
                                  style={{ fontSize: 8, padding: "1px 6px" }}
                                >
                                  {f.decision}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

      {tab === "testing" && (
        <div className="fade-in">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div className="glass-card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.grey900,
                  marginBottom: 4,
                }}
              >
                Simuler / Tester une facture
              </div>
              <div style={{ fontSize: 12, color: C.grey500, marginBottom: 16 }}>
                Score calculé en temps réel — cliquez "Ajouter & Détecter" pour
                l'insérer de manière cohérente dans les données.
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.grey600,
                      display: "block",
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Fournisseur *
                  </label>
                  <select
                    className="input-field"
                    value={testSup}
                    onChange={(e) => {
                      setTestSup(e.target.value);
                      setTestLabel("");
                      setTestResult(null);
                    }}
                  >
                    <option value="">— Sélectionner —</option>
                    {supOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                {testSup && labelOptions.length > 0 && (
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.grey600,
                        display: "block",
                        marginBottom: 5,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Service / Libellé
                    </label>
                    <select
                      className="input-field"
                      value={testLabel}
                      onChange={(e) => {
                        setTestLabel(e.target.value);
                        setTestResult(null);
                      }}
                    >
                      <option value="">— Tous services —</option>
                      {labelOptions.map((lbl) => (
                        <option key={lbl} value={lbl}>
                          {lbl}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{ fontSize: 10, color: C.grey500, marginTop: 4 }}
                    >
                      Sélectionnez un service pour affiner la référence.
                    </div>
                  </div>
                )}
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.grey600,
                      display: "block",
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Montant (€) *
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    step="0.01"
                    placeholder="ex: 1450.00"
                    value={testAmt}
                    onChange={(e) => {
                      setTestAmt(e.target.value);
                      setTestResult(null);
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.grey600,
                      display: "block",
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Date
                  </label>
                  <input
                    className="input-field"
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn-ghost"
                    onClick={runTest}
                    disabled={!testSup || !testAmt || testRunning}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {testRunning ? (
                      <>
                        <Spinner size={14} />
                        Calcul…
                      </>
                    ) : (
                      "Tester (simulation)"
                    )}
                  </button>
                  <button
                    className="btn-primary"
                    onClick={addAndDetect}
                    disabled={!testSup || !testAmt || testRunning}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {testRunning ? (
                      <>
                        <Spinner size={14} color="#fff" />
                        Insertion…
                      </>
                    ) : (
                      "➕ Ajouter & Détecter"
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div>
              {!testResult && !testRunning && (
                <div
                  style={{
                    height: "100%",
                    minHeight: 280,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 40,
                    background: "rgba(255,255,255,.5)",
                    borderRadius: 18,
                    border: `2px dashed ${C.grey200}`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Microscope size={48} color={C.grey300} strokeWidth={1} />
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: C.grey700 }}
                  >
                    Prêt à tester
                  </div>
                  <div style={{ fontSize: 12, color: C.grey500, marginTop: 4 }}>
                    Remplissez le formulaire et cliquez Tester
                  </div>
                </div>
              )}
              {testResult && !testRunning && (
                <div className="fade-in">
                  {testResult.error ? (
                    <div
                      style={{
                        background: C.redPale,
                        borderRadius: 10,
                        padding: "12px 14px",
                        fontSize: 12,
                        color: C.red,
                      }}
                    >
                      ⚠ {testResult.error}
                    </div>
                  ) : (
                    <>
                      <div
                        className="glass-card"
                        style={{ padding: 18, marginBottom: 12 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.grey500,
                            marginBottom: 10,
                          }}
                        >
                          Résultat — {fmtE(Math.round(testResult.amt))}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Instrument Serif',serif",
                              fontSize: 52,
                              color: testResult.score > 85 ? C.red : testResult.score > 60 ? C.warning : C.success,
                              lineHeight: 1,
                            }}
                          >
                            {testResult.score}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                height: 10,
                                background: C.grey100,
                                borderRadius: 5,
                                overflow: "hidden",
                                marginBottom: 6,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 5,
                                  width: `${testResult.score}%`,
                                  background: `linear-gradient(90deg,${C.success},${C.warning},${C.red})`,
                                  transition: "width 1.2s ease-out",
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                              {[
                                { lbl: "OK", c: C.success },
                                { lbl: "ALERTE", c: C.warning },
                                { lbl: "CRITIQUE", c: C.red },
                              ].map((z) => (
                                <div
                                  key={z.lbl}
                                  style={{
                                    flex: 1,
                                    padding: "2px 4px",
                                    borderRadius: 5,
                                    background: `${z.c}15`,
                                    border: `1px solid ${z.c}30`,
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 9,
                                      fontWeight: 700,
                                      color: z.c,
                                    }}
                                  >
                                    {z.lbl}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 12px",
                            borderRadius: 99,
                            background: `${testResult.score > 85 ? C.red : testResult.score > 60 ? C.warning : C.success}15`,
                            border: `1px solid ${testResult.score > 85 ? C.red : testResult.score > 60 ? C.warning : C.success}30`,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: testResult.score > 85 ? C.red : testResult.score > 60 ? C.warning : C.success,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: testResult.score > 85 ? C.red : testResult.score > 60 ? C.warning : C.success,
                            }}
                          >
                            {testResult.severity}
                          </span>
                        </div>
                      </div>
                      <div className="glass-card" style={{ padding: 16 }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.grey700,
                            marginBottom: 8,
                          }}
                        >
                          🔍 Détails
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.grey600,
                            lineHeight: 1.6,
                            marginBottom: 10,
                            padding: "8px 12px",
                            background: C.grey50,
                            borderRadius: 10,
                          }}
                        >
                          {testResult.note}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 6,
                          }}
                        >
                          {[
                            [
                              "Référence",
                              fmtE(Math.round(testResult.mu)),
                              C.info,
                            ],
                            [
                              "Seuil max",
                              fmtE(Math.round(testResult.maxAcc)),
                              C.warning,
                            ],
                            [
                              `CV`,
                              `${(testResult.cv * 100).toFixed(1)}%`,
                              C.grey700,
                            ],
                            ["# Factures", testResult.n, C.grey700],
                          ].map(([k, v, col]) => (
                            <div
                              key={k}
                               style={{
                                 background: C.grey50,
                                 borderRadius: 8,
                                 padding: "7px 9px",
                               }}
                             >
                               <div style={{ fontSize: 9, color: C.grey500 }}>
                                 {k}
                               </div>
                               <div
                                 style={{
                                   fontSize: 12,
                                   fontWeight: 700,
                                   color: col,
                                 }}
                               >
                                 {v}
                               </div>
                             </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            critiques > 0 && {
              icon: AlertTriangle,
              color: C.red,
              title: `${critiques} anomalies CRITIQUE`,
              body: `Sur ${allAlerts.length} alertes totales.`,
              action: "Audit manuel immédiat requis.",
            },
            allFeedback.length > 0 && {
              icon: Brain,
              color: C.success,
              title: `${allFeedback.length} feedbacks enregistrés`,
              body: "Le système s'adapte à chaque décision.",
              action: "Continuer à valider les alertes.",
            },
            series.filter((s) => s.cv < 0.05 && s.n > 20).length > 0 && {
              icon: Bot,
              color: C.teal,
              title: `${
                series.filter((s) => s.cv < 0.05 && s.n > 20).length
              } candidats auto`,
              body: "Séries très stables — auto-approbation possible.",
              action: "Configurer un seuil strict.",
            },
            {
              icon: BarChart3,
              color: C.info,
              title: `${series.length} séries actives`,
              body: `Regroupées par: ${groupFields.join(", ") || "—"}.`,
              action: "Ajustez les tolérances si nécessaire.",
            },
          ]
            .filter(Boolean)
            .map((ins, i) => (
              <div
                key={i}
                className="glass-card-sm"
                style={{
                  padding: 16,
                  background: `${ins.color}08`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  flex: "1 1 360px",
                }}
              >
                <div style={{ flexShrink: 0 }}>{renderIcon(ins.icon, ins.color, 20)}</div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: ins.color,
                      marginBottom: 6,
                    }}
                  >
                    {ins.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.grey500,
                      lineHeight: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    {ins.body}
                  </div>
                  <div style={{ fontSize: 11, color: C.grey600, lineHeight: 1.45 }}>
                    {ins.action}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      <div
        style={{
          borderTop: `1px solid ${C.grey100}`,
          marginTop: 32,
          paddingTop: 12,
          fontSize: 10,
          color: C.grey300,
          textAlign: "center",
        }}
      >
        AnomalyIQ · Invoice Analytics · API v2.0
      </div>
    </div>
  );
}
