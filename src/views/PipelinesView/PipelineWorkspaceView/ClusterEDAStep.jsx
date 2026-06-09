
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, X, TriangleAlert } from "lucide-react";
import { Bar, CartesianGrid, Cell, ComposedChart, Legend, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Spinner } from "@/components/ui/Spinner";
import { C, CC } from "@/constants/colors";
import { assignCluster, detectGapDetails, recursiveGapSplit } from "@/utils/math";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { fmtE, fmtK } from "@/utils/formatters";

export function WSClusterEDAStep({ pipeline, onConfirm, onBack, onNavigate }) {
  const k = Math.round(pipeline?.kFactor || 3);
  const [smallThreshold, setSmallThreshold] = useState(k);
  const [removedRows, setRemovedRows] = useState(new Set());
  const [expandedSup, setExpandedSup] = useState(null);
  const [viewMode, setViewMode] = useState("scatter");
  const [loading, setLoading] = useState(true);
  const [df, setDf] = useState([]);
  const [err, setErr] = useState(null);
  const [ignoring, setIgnoring] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const invoices = await wsAPI.getAllInvoices();
        const invList = Array.isArray(invoices?.invoices)
          ? invoices.invoices
          : Array.isArray(invoices?.content)
          ? invoices.content
          : Array.isArray(invoices)
          ? invoices
          : Array.isArray(wsStore.invoices)
          ? wsStore.invoices
          : [];
        const data = invList.map((inv, i) => ({
          id: inv.id || inv.invoice_ref,
          _supplier: inv.supplier || inv.supplier_code,
          _label: inv.label,
          _amount: inv.amount,
          _date: new Date(inv.date || inv.invoice_date),
        }));
        
        // Auto-detect clusters under k and mark their rows for automatic removal
        const autoRemoved = new Set();
        const supMap = {};
        data.forEach((r) => {
          if (r._amount > 0) {
            if (!supMap[r._supplier]) supMap[r._supplier] = [];
            supMap[r._supplier].push(r);
          }
        });
        
        Object.entries(supMap).forEach(([sup, rows]) => {
          if (rows.length >= 2) {
            const amounts = rows.map((r) => r._amount);
            const clusters = recursiveGapSplit(amounts, 2.5, 30, 2);
            const clusterMeans = [...clusters].sort((a, b) => a - b);
            
            clusterMeans.forEach((mean, ci) => {
              const clusterInvoices = rows.filter(
                (r) => assignCluster(r._amount, clusterMeans) === ci
              );
              if (clusterInvoices.length < k) {
                clusterInvoices.forEach(r => autoRemoved.add(r));
              }
            });
          }
        });
        
        setRemovedRows(autoRemoved);
        setDf(data);
      } catch (e) {
        const data = (Array.isArray(wsStore.invoices) ? wsStore.invoices : []).map((inv, i) => ({
          id: inv.id || inv.invoice_ref || `INV-${i + 1}`,
          _supplier: inv.supplier || inv.supplier_code,
          _label: inv.label,
          _amount: Number(inv.amount || 0),
          _date: new Date(inv.date || inv.invoice_date),
        }));
        setDf(data);
        setErr(e.message);
      }
      setLoading(false);
    })();
  }, [pipeline, k]);
  const supplierClusters = useMemo(() => {
    const supMap = {};
    df.forEach((r) => {
      if (!supMap[r._supplier]) supMap[r._supplier] = [];
      if (r._amount > 0 && !removedRows.has(r)) supMap[r._supplier].push(r);
    });
    return Object.entries(supMap)
      .filter(([, rows]) => rows.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8)
      .map(([sup, rows]) => {
        const amounts = rows.map((r) => r._amount);
        const clusters = recursiveGapSplit(amounts, 2.5, 30, 2);
        const gapDetails = detectGapDetails(amounts);
        const clusterMeans = [...clusters].sort((a, b) => a - b);
        const clusterRows = clusterMeans.map((mean, ci) => ({
          mean: Math.round(mean),
          rows: rows.filter(
            (r) => assignCluster(r._amount, clusterMeans) === ci
          ),
          index: ci,
        }));
        const mn = Math.min(...amounts),
          mx = Math.max(...amounts);
        const bucketCount = Math.min(
          30,
          Math.max(10, Math.floor(amounts.length / 8))
        );
        const bs = (mx - mn) / bucketCount || 1;
        const buckets = Array.from({ length: bucketCount }, (_, i) => ({
          x: Math.round(mn + i * bs),
          count: 0,
        }));
        amounts.forEach((a) => {
          const bi = Math.min(bucketCount - 1, Math.floor((a - mn) / bs));
          buckets[bi].count++;
        });
        const scatterData = rows.map((r, ri) => ({
          x: ri,
          y: r._amount,
          cluster: assignCluster(r._amount, clusterMeans),
          date: r._date?.toISOString().split("T")[0],
        }));
        const sorted = [...amounts].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const med = sorted[Math.floor(sorted.length * 0.5)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        return {
          sup,
          rows,
          amounts,
          clusterMeans,
          clusterRows,
          gapDetails,
          buckets,
          scatterData,
          sorted,
          q1,
          med,
          q3,
          mn,
          mx,
          hasGap: clusters.length > 1,
        };
      });
  }, [df, removedRows]);
  const toggleRemove = (sup, ci) => {
    const rows =
      supplierClusters.find((s) => s.sup === sup)?.clusterRows[ci]?.rows || [];
    const newSet = new Set(removedRows);
    const allRemoved = rows.every((r) => newSet.has(r));
    rows.forEach((r) => (allRemoved ? newSet.delete(r) : newSet.add(r)));
    setRemovedRows(newSet);
  };
  const isRemoved = (sup, ci) => {
    const r =
      supplierClusters.find((s) => s.sup === sup)?.clusterRows[ci]?.rows || [];
    return r.length > 0 && r.every((r2) => removedRows.has(r2));
  };
  const confirm = async () => {
    setIgnoring(true);
    try {
      const ids = [...removedRows].map((r) => r.id).filter(Boolean);
      if (ids.length > 0) await wsAPI.ignoreInvoices(ids);
      onConfirm();
    } catch (e) {
      setErr(e.message);
    }
    setIgnoring(false);
  };
  if (loading)
    return (
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spinner size={40} />
        </div>
      </div>
    );
  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Analyse des clusters (EDA)
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 16 }}>
        Recursive Gap Split · K-means · Visualisez et nettoyez les
        sous-catégories par fournisseur
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { lbl: "Lignes", val: df.length.toLocaleString(), color: C.info },
          {
            lbl: "Avec gap détecté",
            val: supplierClusters.filter((s) => s.hasGap).length,
            color: C.warning,
          },
          { lbl: "À retirer", val: removedRows.size, color: C.red },
        ].map((k) => (
          <div
            key={k.lbl}
            className="glass-card-sm"
            style={{ padding: "12px 14px" }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>
              {k.val}
            </div>
            <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
              {k.lbl}
            </div>
          </div>
        ))}
      </div>
      <div
        className="glass-card"
        style={{
          padding: 14,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.grey700 }}>
            Seuil petit cluster ≤ {smallThreshold}
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={smallThreshold}
            onChange={(e) => setSmallThreshold(Number(e.target.value))}
            className="slider"
            style={{ width: 100 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            ["scatter", "K-means"],
            ["histogram", "Histo"],
            ["violin", "Box"],
          ].map(([id, lbl]) => (
            <button
              key={id}
              className={`btn-toggle${viewMode === id ? " active" : ""}`}
              style={{ fontSize: 11, padding: "5px 12px" }}
              onClick={() => setViewMode(id)}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>
      {supplierClusters.map(
        ({
          sup,
          amounts,
          clusterMeans,
          clusterRows,
          gapDetails,
          buckets,
          scatterData,
          q1,
          med,
          q3,
          mn,
          mx,
          hasGap,
        }) => {
          const isExpanded = expandedSup === sup;
          const totalAmt = amounts.reduce((a, b) => a + b, 0);
          return (
            <div
              key={sup}
              className="glass-card"
              style={{
                marginBottom: 12,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "14px 18px",
                  background: isExpanded
                    ? "rgba(255,255,255,.35)"
                    : "transparent",
                }}
                onClick={() => setExpandedSup(isExpanded ? null : sup)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: hasGap ? C.warning : C.success,
                    }}
                  >
                    {sup}
                  </div>
                  <span className={`badge badge-${hasGap ? "warn" : "ok"}`}>
                    {hasGap ? `${clusterMeans.length} clusters` : "Homogène"}
                  </span>
                  {hasGap && gapDetails && (
                    <span style={{ fontSize: 11, color: C.grey500 }}>
                      Gap:{" "}
                      <strong style={{ color: C.red }}>
                        {fmtE(gapDetails.gapEuros)}
                      </strong>{" "}
                      · C1~{fmtE(gapDetails.leftMean)} → C2~
                      {fmtE(gapDetails.rightMean)}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.grey500 }}>
                    {amounts.length} fact. · {fmtE(Math.round(totalAmt))}
                  </span>
                  <span style={{ fontSize: 13, color: C.grey500 }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div
                  style={{
                    padding: "14px 18px 18px",
                    borderTop: `1px solid rgba(0,0,0,.06)`,
                  }}
                >
                  {viewMode === "scatter" && (
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.grey500,
                          marginBottom: 8,
                        }}
                      >
                        Scatter K-means — chaque point = une facture, couleur =
                        cluster
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <ScatterChart
                          margin={{ top: 10, right: 10, bottom: 5, left: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.grey100}
                          />
                          <XAxis
                            dataKey="x"
                            name="Index"
                            tick={{ fill: C.grey500, fontSize: 8 }}
                            tickLine={false}
                          />
                          <YAxis
                            dataKey="y"
                            name="Montant"
                            tickFormatter={fmtK}
                            tick={{ fill: C.grey500, fontSize: 8 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            cursor={{ strokeDasharray: "3 3" }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0]?.payload;
                              return (
                                <div
                                  style={{
                                    background: C.white,
                                    border: `1px solid ${C.grey200}`,
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    fontSize: 11,
                                  }}
                                >
                                  <div
                                    style={{
                                      color: CC[d?.cluster % CC.length],
                                      fontWeight: 700,
                                    }}
                                  >
                                    C{(d?.cluster || 0) + 1}
                                  </div>
                                  <div>{fmtE(Math.round(d?.y || 0))}</div>
                                  <div style={{ color: C.grey400 }}>
                                    {d?.date}
                                  </div>
                                </div>
                              );
                            }}
                          />
                          {clusterMeans.map((mean, ci) => (
                            <Scatter
                              key={ci}
                              name={`C${ci + 1} (~${fmtE(Math.round(mean))})`}
                              data={scatterData.filter((d) => d.cluster === ci)}
                              fill={CC[ci % CC.length]}
                              fillOpacity={0.72}
                            />
                          ))}
                          {clusterMeans.map((mean, ci) => (
                            <ReferenceLine
                              key={`r${ci}`}
                              y={mean}
                              stroke={CC[ci % CC.length]}
                              strokeWidth={2}
                              strokeDasharray="6 3"
                              label={{
                                value: `μ${ci + 1}`,
                                fill: CC[ci % CC.length],
                                fontSize: 8,
                                position: "right",
                              }}
                            />
                          ))}
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {viewMode === "histogram" && (
                    <div style={{ marginBottom: 14 }}>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.grey500,
                          marginBottom: 8,
                        }}
                      >
                        Distribution — barres colorées par cluster assigné
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <ComposedChart
                          data={buckets}
                          margin={{ top: 10, right: 10, bottom: 5, left: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={C.grey100}
                          />
                          <XAxis
                            dataKey="x"
                            tickFormatter={(v) => `€${Math.round(v / 1000)}K`}
                            tick={{ fill: C.grey500, fontSize: 8 }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: C.grey500, fontSize: 8 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) =>
                              active && payload?.length ? (
                                <div
                                  style={{
                                    background: C.white,
                                    border: `1px solid ${C.grey100}`,
                                    borderRadius: 8,
                                    padding: "6px 10px",
                                    fontSize: 11,
                                  }}
                                >
                                  <div>~{fmtE(payload[0].payload.x)}</div>
                                  <div>
                                    <strong>{payload[0].value}</strong> fact.
                                  </div>
                                </div>
                              ) : null
                            }
                          />
                          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                            {buckets.map((b, bi) => {
                              const ci =
                                clusterMeans.length > 1
                                  ? assignCluster(b.x, clusterMeans)
                                  : 0;
                              return (
                                <Cell
                                  key={bi}
                                  fill={`${CC[ci % CC.length]}90`}
                                  stroke={CC[ci % CC.length]}
                                  strokeWidth={0.5}
                                />
                              );
                            })}
                          </Bar>
                          {clusterMeans.map((mean, ci) => (
                            <ReferenceLine
                              key={ci}
                              x={Math.round(mean)}
                              stroke={CC[ci % CC.length]}
                              strokeWidth={2}
                              strokeDasharray="5 3"
                              label={{
                                value: `C${ci + 1}`,
                                fill: CC[ci % CC.length],
                                fontSize: 8,
                                position: "top",
                              }}
                            />
                          ))}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {viewMode === "violin" &&
                    (() => {
                      const range = mx - mn || 1;
                      const pct = (v) =>
                        `${(((v - mn) / range) * 88 + 6).toFixed(1)}%`;
                      const iqr = q3 - q1;
                      const wL = Math.max(mn, q1 - 1.5 * iqr),
                        wH = Math.min(mx, q3 + 1.5 * iqr);
                      const outliers = amounts
                        .sort((a, b) => a - b)
                        .filter((v) => v < wL || v > wH);
                      return (
                        <div style={{ marginBottom: 14 }}>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.grey500,
                              marginBottom: 8,
                            }}
                          >
                            Box plot + distribution
                          </div>
                          <div
                            style={{
                              position: "relative",
                              height: 48,
                              background: C.grey50,
                              borderRadius: 8,
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                left: pct(wL),
                                width: 2,
                                top: "20%",
                                height: "60%",
                                background: `${CC[0]}80`,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: pct(q1),
                                width: `calc(${pct(q3)} - ${pct(q1)})`,
                                top: "12%",
                                height: "76%",
                                background: `${CC[0]}20`,
                                border: `2px solid ${CC[0]}`,
                                borderRadius: 4,
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: pct(med),
                                width: 3,
                                top: "8%",
                                height: "84%",
                                background: CC[0],
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                left: pct(wH),
                                width: 2,
                                top: "20%",
                                height: "60%",
                                background: `${CC[0]}80`,
                              }}
                            />
                            {outliers.slice(0, 6).map((v, oi) => (
                              <div
                                key={oi}
                                style={{
                                  position: "absolute",
                                  left: pct(v),
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: C.red,
                                  top: "34%",
                                  marginLeft: -3,
                                }}
                                title={fmtE(Math.round(v))}
                              />
                            ))}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 9,
                              color: C.grey500,
                            }}
                          >
                            <span>{fmtE(Math.round(mn))}</span>
                            <span>Q1:{fmtE(Math.round(q1))}</span>
                            <span style={{ color: CC[0], fontWeight: 700 }}>
                              Méd:{fmtE(Math.round(med))}
                            </span>
                            <span>Q3:{fmtE(Math.round(q3))}</span>
                            <span>{fmtE(Math.round(mx))}</span>
                          </div>
                          {outliers.length > 0 && (
                            <div
                              style={{
                                fontSize: 10,
                                color: C.red,
                                marginTop: 4,
                              }}
                            >
                              <TriangleAlert size={9} color={C.red} />{" "}
                              {outliers.length} valeur(s) aberrante(s)
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${clusterMeans.length},1fr)`,
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {clusterRows.map((cl, ci) => {
                      const removed = isRemoved(sup, ci);
                      const isUnderK = cl.rows.length < k;
                      const isSmall = cl.rows.length <= smallThreshold;
                      const vals = cl.rows.map((r) => r._amount);
                      const clMu = vals.length
                        ? vals.reduce((a, b) => a + b, 0) / vals.length
                        : 0;
                      const clStd =
                        vals.length > 1
                          ? Math.sqrt(
                              vals
                                .map((v) => (v - clMu) ** 2)
                                .reduce((a, b) => a + b, 0) / vals.length
                            )
                          : 0;
                      return (
                        <div
                          key={ci}
                          style={{
                            background: (removed || isUnderK)
                              ? "rgba(217,79,61,.06)"
                              : isSmall
                              ? "rgba(245,158,11,.06)"
                              : `${CC[ci % CC.length]}08`,
                            borderRadius: 12,
                            padding: "10px 12px",
                            border: `1.5px solid ${
                              (removed || isUnderK)
                                ? C.red
                                : isSmall
                                ? C.warning
                                : CC[ci % CC.length]
                            }40`,
                            opacity: (removed || isUnderK) ? 0.72 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 5,
                            }}
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: CC[ci % CC.length],
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: CC[ci % CC.length],
                              }}
                            >
                              Cluster {ci + 1}
                            </span>
                            {isUnderK ? (
                              <span className="badge badge-red" style={{display:"inline-flex",alignItems:"center",gap:3}}>Sous K <X size={9} color={C.red} /></span>
                            ) : isSmall && !removed ? (
                              <span className="badge badge-warn" style={{display:"inline-flex",alignItems:"center",gap:3}}>Petit<TriangleAlert size={9} strokeWidth={2.5} style={{marginLeft:2}}/></span>
                            ) : null}
                          </div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: C.grey900,
                            }}
                          >
                            {fmtE(Math.round(clMu))}
                          </div>
                          <div style={{ fontSize: 10, color: C.grey500 }}>
                            σ {fmtE(Math.round(clStd))} · {cl.rows.length} fact.
                          </div>
                          <button
                            className={removed ? "btn-ghost" : "btn-danger"}
                            style={{
                              width: "100%",
                              fontSize: 11,
                              padding: "4px 8px",
                              marginTop: 8,
                            }}
                            onClick={() => toggleRemove(sup, ci)}
                          >
                            {removed ? (
                              <><RotateCcw size={11} color={C.success} /> Conserver</>
                            ) : (
                              <><X size={11} color={C.red} /> Retirer {cl.rows.length}</>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }
      )}
      {supplierClusters.length === 0 && (
        <div
          className="glass-card"
          style={{ padding: 28, textAlign: "center", color: C.grey500 }}
        >
          Pas assez de données par fournisseur (min 2 factures).
        </div>
      )}
      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
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
          onClick={confirm}
          className="btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={ignoring}
        >
          {ignoring ? (
            <>
              <Spinner size={16} color="#fff" />
              Ignoring…
            </>
          ) : (
            `Confirmer & construire les séries · ${
              df.length - removedRows.size
            } lignes${
              removedRows.size > 0 ? ` · ${removedRows.size} retirées` : ""
            }`
          )}
        </button>
      </div>
    </div>
  );
}
