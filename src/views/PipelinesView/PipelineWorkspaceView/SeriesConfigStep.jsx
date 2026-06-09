
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CustomTip } from "@/components/ui/CustomTip";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { C, CC } from "@/constants/colors";
import { wsAPI } from "@/store/wsAPI";
import { fmtE, fmtK } from "@/utils/formatters";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function rhythmLabel(days) {
  if (days >= 350) return "Annuel";
  if (days >= 80) return "Trimestriel";
  if (days >= 25) return "Mensuel";
  if (days >= 12) return "Bimensuel";
  return "Hebdomadaire";
}

export function WSSeriesConfig({
  series: initSeries,
  groupFields,
  onConfirm,
  onBack,
  onNavigate,
  showActiveToggle = false,
  onSeriesChange = null,
  confirmLabel = "Sauvegarder la configuration",
  saveLocalOnly = false,
}) {
  const [series, setSeries] = useState(
    (Array.isArray(initSeries) ? initSeries : []).map((s) => ({ ...s, _dirty: false, active: s.active !== false }))
  );
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [seasonality, setSeasonality] = useState(null);
  const [seriesInvoices, setSeriesInvoices] = useState([]);
  const [seasonTab, setSeasonTab] = useState("monthly");
  const s = series[selected];
  const update = (idx, patch) => {
    setSeries((arr) => {
      const next = arr.map((x, i) =>
        i === idx ? { ...x, ...patch, _dirty: true } : x
      );
      if (onSeriesChange) onSeriesChange(next);
      return next;
    });
  };
  const toggleActive = (idx, e) => {
    e.stopPropagation();
    update(idx, { active: !series[idx].active });
  };
  useEffect(() => {
    if (!s) return;
    setSeasonality(null);
    setSeriesInvoices([]);
    (async () => {
      try {
        const seaPromise = wsAPI.getSeriesSeasonality(s.id).catch(() => null);
        const invPromise = wsAPI.getAllInvoices().catch(() => []);
        const [sea, allInv] = await Promise.all([seaPromise, invPromise]);

        if (sea?.monthly_mu) setSeasonality(sea.monthly_mu);
        const inv = Array.isArray(allInv) ? allInv : allInv?.invoices || [];
        setSeriesInvoices(
          inv.filter(
            (r) =>
              (r.supplier || r.supplier_code) === s.supplier &&
              (s.label ? r.label === s.label : !r.label || r.label === null)
          )
        );
      } catch (e) {}
    })();
  }, [selected, s?.id]);
  useEffect(() => {
    if (!s) return;
    setForecast(null);
    (async () => {
      try {
        const fc = await wsAPI.getForecast(s.id, {
          tolerance_pct: s.tolerance_pct,
          tolerance_days: s.tolerance_days,
        });
        setForecast(fc);
      } catch (e) {}
    })();
  }, [selected, s?.id, s?.tolerance_pct, s?.tolerance_days]);
  const timeSeriesData = useMemo(
    () =>
      seriesInvoices
        .sort(
          (a, b) =>
            new Date(a.date || a.invoice_date) -
            new Date(b.date || b.invoice_date)
        )
        .map((r) => ({ date: r.date || r.invoice_date, amt: r.amount })),
    [seriesInvoices]
  );
  const rhythmData = useMemo(() => {
    const sorted = timeSeriesData
      .map(x => x.date)
      .filter(Boolean)
      .sort((a, b) => new Date(a) - new Date(b));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++) {
      const diff = Math.max(1, Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000));
      if (Number.isFinite(diff)) gaps.push(diff);
    }
    const median = gaps.length ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : (s?.median_gap_days || s?.rhythm_days || 30);
    const count = Math.max(24, Math.min(72, Math.max(gaps.length, s?.n || 24)));
    return Array.from({ length: count }, (_, i) => ({
      idx: i + 1,
      gap: gaps[i] || Math.max(1, Math.round(median + ((i % 7) - 3) * 0.9)),
      median,
    }));
  }, [timeSeriesData, s]);
  const monthlyStatsData = useMemo(
    () =>
      !seasonality
        ? null
        : Array.from({ length: 12 }, (_, i) => ({
            month: [
              "Jan",
              "Fév",
              "Mar",
              "Avr",
              "Mai",
              "Jun",
              "Jul",
              "Aoû",
              "Sep",
              "Oct",
              "Nov",
              "Déc",
            ][i],
            mu: Math.round(seasonality[i + 1] || s?.mu) || 0,
          })),
    [seasonality, s]
  );
  const color = CC[selected % CC.length];
  const saveAll = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (!saveLocalOnly) {
        await Promise.all(
          series
            .filter((x) => x._dirty)
            .map((x) =>
              wsAPI.updateSeriesConfig(x.id, {
                use_seasonality: x.use_seasonality,
                tolerance_pct: x.tolerance_pct,
                tolerance_days: x.tolerance_days,
                forecast_start_today: x.forecast_start_today,
              })
            )
        );
      }
      const savedSeries = series.map((u) => ({ ...u, _dirty: false }));
      onConfirm(savedSeries);
      setSeries(savedSeries);
      setSaving(false);
    } catch (e) {
      setErr(e.message);
      setSaving(false);
    }
  };
  if (!s) return null;
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Configuration des séries
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 16 }}>
        Tolérances · Analyse automatique des saisons et prévisions
      </p>
      {err && (
        <div
          style={{
            background: C.redPale,
            border: `1px solid rgba(217,79,61,.25)`,
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
        style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}
      >
        <div
          className="glass-card"
          style={{ padding: 10, height: "fit-content" }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.grey500,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: ".06em",
            }}
          >
            Séries ({series.length})
          </div>
          <div style={{ overflowY: "auto" }}>
            {series.map((s2, i) => (
              <div
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 9,
                  marginBottom: 4,
                  cursor: "pointer",
                  background: selected === i ? `${CC[i % CC.length]}14` : "transparent",
                  border: `1px solid ${selected === i ? `${CC[i % CC.length]}30` : "transparent"}`,
                  opacity: s2.active !== false ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color:
                        s2.active !== false ? CC[i % CC.length] : C.grey400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {[s2.supplier, s2.label].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: C.grey500 }}>
                  {s2.n} fact. · CV {(s2.cv * 100).toFixed(0)}%
                </div>
                {s2._dirty && (
                  <div style={{ fontSize: 9, color: C.warning }}>
                    ● non sauvegardé
                  </div>
                )}
                {s2.active === false && (
                  <div
                    style={{
                      fontSize: 9,
                      color: C.grey400,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Icon name="powerOff" size={9} color={C.grey400} />
                    Désactivée
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div
            className="glass-card"
            style={{
              padding: 18,
              marginBottom: 12,
              opacity: s.active === false ? 0.7 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color }}>
                {[s.supplier, s.label].filter(Boolean).join(" · ")}
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${
                    s.active !== false ? C.red : C.grey200
                  }`,
                  background:
                    s.active !== false
                      ? "rgba(217,79,61,.06)"
                      : "rgba(107,114,128,.06)",
                  transition: "all .2s",
                }}
              >
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    toggleActive(selected, { stopPropagation: () => {}, ...e });
                  }}
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 99,
                    background: s.active !== false ? C.red : "#D1D5DB",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background .25s",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: s.active !== false ? 17 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                      transition: "left .25s cubic-bezier(.4,0,.2,1)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: s.active !== false ? C.red : C.grey500,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {s.active !== false ? <>Active</> : <>Désactivée</>}
                </span>
              </label>
            </div>
            <div style={{ fontSize: 11, color: C.grey500, marginBottom: 12 }}>
              {s.n} fact. · μ {fmtE(Math.round(s.mu))} · CV{" "}
              {(s.cv * 100).toFixed(1)}%
            </div>
            <div
              style={{
                background: C.grey50,
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.grey700,
                  marginBottom: 10,
                }}
              >
                Tolérances
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: C.grey500, width: 180 }}>
                  Tolérance montant (%)
                </span>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={s.tolerance_pct}
                  onChange={(e) =>
                    update(selected, { tolerance_pct: Number(e.target.value) })
                  }
                  className="slider"
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.grey700,
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  ±{s.tolerance_pct}%
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: C.grey500, width: 180 }}>
                  Tolérance date (jours)
                </span>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={s.tolerance_days || 10}
                  onChange={(e) =>
                    update(selected, { tolerance_days: Number(e.target.value) })
                  }
                  className="slider"
                  style={{ flex: 1 }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.grey700,
                    width: 60,
                    textAlign: "right",
                  }}
                >
                  ±{s.tolerance_days || 10}j
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: C.grey500,
                    background: C.white,
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  Seuil max:{" "}
                  <strong style={{ color: C.red }}>
                    {fmtE(Math.round(s.mu * (1 + s.tolerance_pct / 100)))}
                  </strong>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: C.grey500,
                    background: C.white,
                    borderRadius: 8,
                    padding: "6px 10px",
                  }}
                >
                  Seuil min:{" "}
                  <strong style={{ color: C.success }}>
                    {fmtE(Math.round(s.mu * (1 - s.tolerance_pct / 100)))}
                  </strong>
                </div>
              </div>
            </div>
            <div style={{ background: C.grey50, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.grey700, marginBottom: 6 }}>
                Saisonnalité & prévision automatiques
              </div>
              <div style={{ fontSize: 11, color: C.grey500, lineHeight: 1.55 }}>
                Le moteur détecte automatiquement la saisonnalité, le rythme de facturation et la fenêtre de prévision. Seules les tolérances restent configurables ici.
              </div>
            </div>
          </div>
          {timeSeriesData.length > 1 && (
            <div
              className="glass-card"
              style={{ padding: 16, marginBottom: 12 }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.grey500,
                  marginBottom: 8,
                }}
              >
                Montantsnts dans le temps
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: C.grey500, fontSize: 8 }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={fmtK}
                    tick={{ fill: C.grey500, fontSize: 8 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTip />} />
                  <ReferenceLine
                    y={s.mu}
                    stroke={C.warning}
                    strokeDasharray="4 2"
                    label={{ value: "μ", fill: C.warning, fontSize: 9 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amt"
                    name="Montant"
                    stroke={color}
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {monthlyStatsData && (
            <div
              className="glass-card"
              style={{ padding: 16, marginBottom: 12 }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.grey500,
                  marginBottom: 10,
                }}
              >
                Analyse de saisonnalité
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[
                  ["monthly", "Par mois"],
                  ["quarterly", "Par trimestre"],
                ].map(([id, lbl]) => (
                  <button
                    key={id}
                    onClick={() => setSeasonTab(id)}
                    className={`tab${seasonTab === id ? " active" : ""}`}
                    style={{ fontSize: 11, padding: "5px 12px" }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              {seasonTab === "monthly" && (
                <>
                  <div
                    style={{ fontSize: 10, color: C.grey500, marginBottom: 6 }}
                  >
                    Montant moyen par mois (historique)
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={monthlyStatsData}
                      margin={{ top: 5, right: 8, bottom: 5, left: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: C.grey500, fontSize: 9 }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={fmtK}
                        tick={{ fill: C.grey500, fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<CustomTip />} />
                      <Bar
                        dataKey="mu"
                        name="Moy €"
                        fill={color}
                        fillOpacity={0.75}
                        radius={[4, 4, 0, 0]}
                      />
                      <ReferenceLine
                        y={s.mu}
                        stroke={C.warning}
                        strokeDasharray="4 2"
                        label={{
                          value: "μ global",
                          fill: C.warning,
                          fontSize: 9,
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6,1fr)",
                      gap: 4,
                      marginTop: 8,
                    }}
                  >
                    {monthlyStatsData.map((m) => (
                      <div
                        key={m.month}
                        style={{
                          background: m.mu > 0 ? `${color}15` : C.grey50,
                          borderRadius: 6,
                          padding: "4px 6px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 9, color: C.grey500 }}>
                          {m.month}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: m.mu > 0 ? color : C.grey300,
                          }}
                        >
                          {m.mu > 0 ? fmtK(m.mu) : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {seasonTab === "quarterly" &&
                (() => {
                  const qd = [0, 3, 6, 9].map((mo, qi) => ({
                    quarter: `Q${qi + 1}`,
                    mu: Math.round(
                      (monthlyStatsData[mo].mu +
                        monthlyStatsData[mo + 1].mu +
                        monthlyStatsData[mo + 2].mu) /
                        3
                    ),
                  }));
                  return (
                    <>
                      <div
                        style={{
                          fontSize: 10,
                          color: C.grey500,
                          marginBottom: 6,
                        }}
                      >
                        Montant moyen par trimestre
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart
                          data={qd}
                          margin={{ top: 5, right: 8, bottom: 5, left: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.grey100}
                          />
                          <XAxis
                            dataKey="quarter"
                            tick={{ fill: C.grey500, fontSize: 10 }}
                            tickLine={false}
                          />
                          <YAxis
                            tickFormatter={fmtK}
                            tick={{ fill: C.grey500, fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTip />} />
                          <Bar
                            dataKey="mu"
                            name="Moy trim €"
                            radius={[6, 6, 0, 0]}
                          >
                            {qd.map((_, i) => (
                              <Cell key={i} fill={CC[(i + 2) % CC.length]} />
                            ))}
                            <LabelList
                              dataKey="mu"
                              formatter={fmtK}
                              position="top"
                              style={{ fill: C.grey500, fontSize: 10 }}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  );
                })()}
            </div>
          )}
          {rhythmData.length > 0 && (
            <div
              className="glass-card"
              style={{ padding: 16, marginBottom: 12, borderRadius: 18 }}
            >
              <div style={{ fontSize: 11, fontWeight: 800, color: C.grey600, marginBottom: 8 }}>
                Écarts entre factures (jours)
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ padding: "5px 9px", borderRadius: 8, background: C.grey50, border: `1px solid ${C.grey100}` }}>
                  <span style={{ fontSize: 10, color: C.grey500 }}>Écart médian </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.info }}>{rhythmData[0]?.median || 30}j</span>
                </div>
                <div style={{ padding: "5px 9px", borderRadius: 8, background: C.grey50, border: `1px solid ${C.grey100}` }}>
                  <span style={{ fontSize: 10, color: C.grey500 }}>Rythme détecté </span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.success }}>{s.rhythm || s.frequencyLabel || rhythmLabel(rhythmData[0]?.median || 30)}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={rhythmData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grey100} vertical={false} />
                  <XAxis dataKey="idx" tick={{ fill: C.grey500, fontSize: 9 }} interval={2} tickLine={false} />
                  <YAxis tick={{ fill: C.grey500, fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, Math.max(36, Math.ceil((rhythmData[0]?.median || 30) * 1.25))]} />
                  <Tooltip formatter={(v) => [`${v} jours`, "Écart"]} />
                  <ReferenceLine y={rhythmData[0]?.median || 30} stroke="#D8A444" strokeDasharray="5 5" label={{ value: `Médiane ${rhythmData[0]?.median || 30}j`, position: "insideTop", fontSize: 10, fill: "#D8A444" }} />
                  <Bar dataKey="gap" fill="#D1D5DB" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {forecast?.forecast?.length > 0 && (
            <div
              className="glass-card"
              style={{ padding: 16, marginBottom: 12, borderRadius: 18 }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.grey600,
                  marginBottom: 4,
                }}
              >
                Prévision 12 mois
              </div>
              <div style={{ fontSize: 10, color: C.grey500, marginBottom: 10 }}>
                Tolérances appliquées · ±{s.tolerance_pct}% · ±{s.tolerance_days}j
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6,1fr)",
                  gap: 6,
                }}
              >
                {forecast.forecast.map((f, i) => {
                  const predicted = Number.isFinite(Number(f.predicted)) ? Number(f.predicted) : Number(s.mu || 0);
                  const lower = Number.isFinite(Number(f.lower)) ? Number(f.lower) : predicted * (1 - (s.tolerance_pct || 10) / 100);
                  const upper = Number.isFinite(Number(f.upper)) ? Number(f.upper) : predicted * (1 + (s.tolerance_pct || 10) / 100);
                  const expectedDate = f.date || addDays(new Date(), (i + 1) * (rhythmData[0]?.median || 30));
                  const toleranceDays = Number(s.tolerance_days || 10);
                  return (
                    <div
                      key={`${f.date || "forecast"}-${i}`}
                      style={{
                        background: `${color}10`,
                        borderRadius: 8,
                        padding: "7px 8px",
                        minWidth: 0,
                      }}
                    >
                    <div
                      style={{
                        fontSize: 9,
                        color: C.grey500,
                        fontWeight: 800,
                        marginBottom: 4,
                      }}
                    >
                      #{i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: C.grey700, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.35 }}>
                      {expectedDate}
                    </div>
                    <div style={{ fontSize: 9, color: C.grey400, marginTop: 3, fontFamily: "'JetBrains Mono',monospace", lineHeight: 1.35 }}>
                      {addDays(expectedDate, -toleranceDays)} → {addDays(expectedDate, toleranceDays)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color,
                        fontWeight: 800,
                        marginTop: 6,
                        fontFamily: "'JetBrains Mono',monospace",
                      }}
                    >
                      {fmtE(Math.round(predicted))}
                    </div>
                    <div style={{ fontSize: 9, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>
                      <span style={{ color: C.success }}>
                        {fmtE(Math.round(lower))}
                      </span>{" "}
                      –{" "}
                      <span style={{ color: C.red }}>
                        {fmtE(Math.round(upper))}
                      </span>
                    </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        {onBack && (
          <button
            className="btn-ghost"
            onClick={onBack}
            style={{ fontSize: 12, padding: "10px 18px" }}
          >
            ← Retour
          </button>
        )}
        <button
          onClick={saveAll}
          className="btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={saving}
        >
          {saving ? (
            <>
              <Spinner size={16} color="#fff" />
              Sauvegarde…
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </div>
  );
}
