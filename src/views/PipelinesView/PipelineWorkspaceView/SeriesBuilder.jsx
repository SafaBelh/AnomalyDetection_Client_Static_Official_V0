
import { useEffect, useState } from "react";
import { BarChart2, Check, CheckCircle2, FileText, LineChart, TriangleAlert, TrendingDown } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { C, CC } from "@/constants/colors";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { fmtE } from "@/utils/formatters";

export function WSSeriesBuilder({
  cols,
  extraCols = [],
  onConfirm,
  onNavigate,
}) {
  const [selected, setSelected] = useState(
    ["supplier", cols.label ? "label" : null].filter(Boolean)
  );
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState(null);

  const buildLocalSeries = (fields) => {
    const invoices = Array.isArray(wsStore.invoices) ? wsStore.invoices : [];
    const groups = new Map();
    invoices.forEach((inv) => {
      const parts = fields.map((f) => {
        if (f === "supplier") return inv.supplier || inv.supplier_code || "N/A";
        if (f === "label") return inv.label || "";
        return inv[f] || "";
      });
      const key = parts.join("::");
      if (!groups.has(key)) groups.set(key, { parts, values: [] });
      groups.get(key).values.push(Number(inv.amount || 0));
    });
    const series = Array.from(groups.values()).map((g, i) => {
      const values = g.values.filter(Number.isFinite);
      const n = values.length;
      const mu = n ? values.reduce((a, b) => a + b, 0) / n : 0;
      const sigma = n ? Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / n) : 0;
      const cv = mu ? sigma / mu : 0;
      return {
        id: `local-series-${i + 1}`,
        supplier: g.parts[0] || "N/A",
        label: fields.includes("label") ? g.parts[fields.indexOf("label")] : null,
        n,
        mu,
        sigma,
        cv,
        flagged: cv > 0.25 || n < 3,
        high_cv: cv > 0.25,
        low_volume: n < 3,
        tolerance_pct: wsStore.config?.tolerance_pct ?? 10,
        tolerance_days: wsStore.config?.tolerance_days ?? 10,
        active: true,
      };
    }).sort((a, b) => b.n - a.n);
    wsStore.series = series;
    return { series };
  };

  const previewSeries = async (fields) => {
    try {
      return await wsAPI.buildSeries(fields);
    } catch (e) {
      setErr(e.message);
      return buildLocalSeries(fields);
    }
  };

  // Auto-preview on mount so the user sees grouping result immediately
  useEffect(() => {
    if (selected.length === 0) return;
    setLoading(true);
    setErr(null);
    previewSeries(selected)
      .then((r) => {
        setPreview(r);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const standardCandidates = [
    { key: "supplier", label: "Fournisseur" },
    cols.label ? { key: "label", label: "Service / Libellé" } : null,
    cols.tenant ? { key: "tenant", label: "Entité (tenant)" } : null,
  ].filter(Boolean);
  const extraCandidates = [...new Set(extraCols)];
  const toggle = (f) => {
    const next = selected.includes(f)
      ? selected.filter((x) => x !== f)
      : [...selected, f];
    setSelected(next);
    if (next.length === 0) {
      setPreview(null);
      return;
    }
    setLoading(true);
    setErr(null);
    setPreview(null);
    previewSeries(next)
      .then((r) => setPreview(r))
      .finally(() => setLoading(false));
  };
  const runPreview = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await previewSeries(selected);
      setPreview(r);
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };
  const confirm = async () => {
    setConfirming(true);
    setErr(null);
    try {
      let slist;
      try {
        await wsAPI.confirmSeries(selected);
        slist = await wsAPI.listSeries();
      } catch (e) {
        setErr(e.message);
        slist = buildLocalSeries(selected).series;
      }
      onConfirm({ series: slist, groupFields: selected });
    } catch (e) {
      setErr(e.message);
      setConfirming(false);
    }
  };
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Construction des séries
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 20 }}>
        Définissez le regroupement puis confirmez pour persister les séries en
        base
      </p>
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
      <div className="card-solid" style={{ padding: 20, marginBottom: 14 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.grey900,
            marginBottom: 10,
          }}
        >
          Champs de regroupement
        </div>
        <div style={{ fontSize: 11, color: C.grey500, marginBottom: 6 }}>
          Champs standards
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {standardCandidates.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`btn-toggle${selected.includes(key) ? " active" : ""}`}
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {selected.includes(key) && (
                <Check size={10} color={C.red} style={{ marginRight: 3 }} />
              )}
              {label}
            </button>
          ))}
        </div>
        {extraCandidates.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: C.grey500, marginBottom: 6 }}>
              Champs supplémentaires (extra_data)
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              {extraCandidates.map((f) => (
                <button
                  key={f}
                  onClick={() => toggle(f)}
                  className={`btn-toggle${
                    selected.includes(f) ? " active" : ""
                  }`}
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {selected.includes(f) && <Check size={10} color={C.red} />}{" "}
                  {f}
                </button>
              ))}
            </div>
          </>
        )}
        <div
          style={{
            fontSize: 11,
            color: C.info,
            padding: "6px 10px",
            background: "rgba(59,130,246,.06)",
            borderRadius: 8,
            marginBottom: 14,
          }}
        >
          Groupement actuel : <strong>{selected.join(" + ") || "—"}</strong>
          {!selected.includes("supplier") && (
            <span style={{ color: C.warning, marginLeft: 8 }}>
              <TriangleAlert size={11} color={C.warning} /> Sans fournisseur —
              résultats non conventionnels
            </span>
          )}
        </div>
        <button
          className="btn-ghost"
          onClick={runPreview}
          disabled={loading || !selected.length}
          style={{
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <>
              <Spinner size={14} />
              Calcul…
            </>
          ) : (
            "🔍 Prévisualiser les séries"
          )}
        </button>
      </div>
      {preview && (
        <div className="card-solid" style={{ padding: 20, marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.grey900 }}>
                {preview.series.length} série
                {preview.series.length > 1 ? "s" : ""} détectée
                {preview.series.length > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
                Vérifiez la qualité avant de confirmer
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(() => {
                const flagged = (preview.series || []).filter(
                  (s) => s.flagged
                ).length;
                const ok = preview.series.length - flagged;
                return (
                  <>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: "rgba(34,197,94,.1)",
                        color: C.success,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    ><Check size={9} strokeWidth={3} />{ok} prête{ok > 1 ? "s" : ""}</span>
                    {flagged > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 99,
                          background: "rgba(245,158,11,.1)",
                          color: C.warning,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      ><TriangleAlert size={9} strokeWidth={2.5} />{flagged} à surveiller</span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 480,
              overflowY: "auto",
            }}
          >
            {(preview.series || [])
              .sort((a, b) => b.n - a.n)
              .map((s, i) => {
                const cvPct = (s.cv * 100).toFixed(1);
                const isFlagged = s.flagged;
                const issues = [];
                if (s.high_cv)
                  issues.push({
                    Icon: BarChart2,
                    title: "Montants très variables",
                    detail: `CV de ${cvPct}% — les factures varient beaucoup en montant. Il n'y a pas de montant "normal" stable, la détection d'anomalies sera moins précise. Les alertes devront être validées avec plus d'attention.`,
                    color: C.warning,
                  });
                if (s.gap_detected)
                  issues.push({
                    Icon: LineChart,
                    title: "Fréquence irrégulière",
                    detail:
                      'De grands écarts entre certaines factures ont été détectés. Le système aura du mal à prédire la date suivante — les alertes "facture manquante" seront moins fiables.',
                    color: C.warning,
                  });
                if (s.low_volume)
                  issues.push({
                    Icon: TrendingDown,
                    title: "Historique insuffisant",
                    detail: `Seulement ${s.n} facture${
                      s.n > 1 ? "s" : ""
                    } disponible${
                      s.n > 1 ? "s" : ""
                    }. En dessous du seuil recommandé de 10 — résultats à interpréter avec prudence.`,
                    color: C.red,
                  });
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: 12,
                      border: `1.5px solid ${
                        isFlagged
                          ? "rgba(245,158,11,.3)"
                          : "rgba(34,197,94,.25)"
                      }`,
                      background: isFlagged
                        ? "rgba(245,158,11,.03)"
                        : "rgba(34,197,94,.03)",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: issues.length ? 10 : 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: CC[i % CC.length],
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.grey900,
                            }}
                          >
                            {[s.supplier, s.label].filter(Boolean).join(" · ")}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.grey500,
                              marginTop: 2,
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: 12,
                            }}
                          >
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <FileText size={11} color={C.grey500} /> {s.n} facture{s.n > 1 ? "s" : ""}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center" }}>Moy. {fmtE(Math.round(s.mu))}</span>
                            <span
                              style={{
                                color: s.cv > 0.4 ? C.warning : C.grey500,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <LineChart size={11} color={s.cv > 0.4 ? C.warning : C.grey500} /> Variabilité {cvPct}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {isFlagged ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: "rgba(245,158,11,.12)",
                            color: C.warning,
                            border: "1px solid rgba(245,158,11,.25)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        ><TriangleAlert size={10} strokeWidth={2.5} />À surveiller</span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 10px",
                            borderRadius: 99,
                            background: "rgba(34,197,94,.12)",
                            color: C.success,
                            border: "1px solid rgba(34,197,94,.25)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        ><Check size={10} strokeWidth={3} />Prête</span>
                      )}
                    </div>
                    {issues.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          paddingTop: 10,
                          borderTop: `1px solid rgba(0,0,0,.06)`,
                        }}
                      >
                        {issues.map((iss, j) => (
                          <div
                            key={j}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                              background: "rgba(255,255,255,.65)",
                              borderRadius: 8,
                              padding: "8px 10px",
                            }}
                          >
                            <span
                              style={{
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            >
                              <iss.Icon size={15} color={iss.color} strokeWidth={2} />
                            </span>
                            <div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: iss.color,
                                  marginBottom: 2,
                                }}
                              >
                                {iss.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: C.grey600,
                                  lineHeight: 1.5,
                                }}
                              >
                                {iss.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div
                          style={{
                            fontSize: 10,
                            color: C.grey400,
                            padding: "3px 2px",
                          }}
                        >
                          Ces avertissements n'empêchent pas la création —
                          confirmez, mais soyez vigilant lors de la revue des
                          alertes.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <button
        onClick={confirm}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={confirming || !selected.length}
      >
        {confirming ? (
          <>
            <Spinner size={16} color="#fff" />
            Confirmation…
          </>
        ) : (
          "Confirmer les séries & configurer →"
        )}
      </button>
    </div>
  );
}
