
import { C } from "@/constants/colors";
import { useEffect, useState } from "react";
import { CheckCircle, Euro, Rows, ShieldCheck, ShieldX, Users } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { downloadCSV, wsAPI, wsStore } from "@/store/wsAPI";
import { fmtE, fmtK } from "@/utils/formatters";

export function WSCleaningStep({ onConfirm, onNavigate, parsedRows, amountCol }) {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showRejected, setShowRejected] = useState(false);
  const [showAccepted, setShowAccepted] = useState(false);
  const [rejectedRows, setRejectedRows] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const [sc, dist, allInv] = await Promise.all([
          wsAPI.getSupplierCounts(),
          wsAPI.getDistribution(),
          wsAPI.getAllInvoices(),
        ]);
        const invList = Array.isArray(allInv?.invoices)
          ? allInv.invoices
          : Array.isArray(allInv?.content)
          ? allInv.content
          : Array.isArray(allInv)
          ? allInv
          : Array.isArray(wsStore.invoices)
          ? wsStore.invoices
          : [];
        setInvoices(invList);
        const amounts = Array.isArray(dist?.amounts) && dist.amounts.length
          ? dist.amounts
          : invList.map((r) => Number(r.amount || 0)).filter(Number.isFinite);
        const acceptedCount = invList.length || amounts.length;
        const originalCount = parsedRows?.length || acceptedCount;
        setStats({
          supplierCount: Object.keys(sc?.supplier_counts || {}).length || new Set(invList.map((r) => r.supplier || r.supplier_code).filter(Boolean)).size,
          totalInvoices: acceptedCount,
          totalAmount: amounts.reduce((a, b) => a + b, 0),
          minAmt: amounts.length ? Math.min(...amounts) : 0,
          maxAmt: amounts.length ? Math.max(...amounts) : 0,
          originalCount,
        });
        if (parsedRows?.length) {
          const rejected = parsedRows
            .filter((r) => {
              if (amountCol && amountCol in r) {
                const v = String(r[amountCol] ?? "").trim();
                const n = parseFloat(v);
                return v === "" || isNaN(n) || n <= 0;
              }
              return Object.values(r).some((v) => v === "" || v === null);
            })
            .map((r) => {
              const reasons = [];
              if (amountCol && amountCol in r) {
                const v = String(r[amountCol] ?? "").trim();
                const n = parseFloat(v);
                if (v === "" || isNaN(n)) reasons.push("montant manquant");
                else if (n <= 0) reasons.push("montant ≤ 0");
              } else {
                if (Object.values(r).some((v) => v === "" || v === null))
                  reasons.push("champ vide");
              }
              return { ...r, _reasons: reasons };
            });
          setRejectedRows(rejected.slice(0, 100));
        }
      } catch (e) {
        const invList = Array.isArray(wsStore.invoices) ? wsStore.invoices : [];
        const amounts = invList.map((r) => Number(r.amount || 0)).filter(Number.isFinite);
        const suppliers = new Set(invList.map((r) => r.supplier || r.supplier_code).filter(Boolean));
        setInvoices(invList);
        setStats({
          supplierCount: suppliers.size,
          totalInvoices: invList.length,
          totalAmount: amounts.reduce((a, b) => a + b, 0),
          minAmt: amounts.length ? Math.min(...amounts) : 0,
          maxAmt: amounts.length ? Math.max(...amounts) : 0,
          originalCount: parsedRows?.length || invList.length,
        });
        setErr(e.message);
      }
      setLoading(false);
    })();
  }, []);
  const exportRejected = () => {
    if (!rejectedRows.length) return;
    downloadCSV(
      rejectedRows.map((r) => {
        const { _reasons, ...rest } = r;
        return { ...rest, reject_reason: _reasons?.join(", ") || "" };
      }),
      "lignes_rejetees.csv"
    );
  };
  const rules = stats
    ? [
      { rule: "Montant > 0", pass: stats.totalInvoices, color: C.success },
      { rule: "Date valide", pass: stats.totalInvoices, color: C.info },
      {
        rule: "Fournisseur renseigné",
        pass: stats.totalInvoices,
        color: C.purple,
      },
      { rule: "Statut valide", pass: stats.totalInvoices, color: C.warning },
    ]
    : [];
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Nettoyage des données
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 20 }}>
        Règles appliquées côté serveur · montant {">"} 0 · date valide ·
        fournisseur non vide
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
      {loading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spinner size={36} />
        </div>
      )}
      {stats && (
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
              {
                lbl: "Lignes avant",
                val: stats.originalCount.toLocaleString(),
                color: C.info,
                Icon: Rows,
              },
              {
                lbl: "Lignes conservées",
                val: stats.totalInvoices.toLocaleString(),
                color: C.success,
                Icon: ShieldCheck,
              },
              {
                lbl: "Lignes rejetées",
                val: (stats.originalCount - stats.totalInvoices).toLocaleString(),
                color: C.red,
                Icon: ShieldX,
              },
              {
                lbl: "Montant conservé",
                val: fmtK(Math.round(stats.totalAmount)),
                color: C.warning,
                Icon: Euro,
              },
              {
                lbl: "Fournisseurs uniques",
                val: stats.supplierCount,
                color: C.purple,
                Icon: Users,
              },
            ].map((k) => (
              <div
                key={k.lbl}
                className="glass-card-sm"
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${k.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                }}>
                  <k.Icon size={14} color={k.color} strokeWidth={2} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" }}>
                  {k.val}
                </div>
                <div style={{ fontSize: 11, color: C.grey500 }}>
                  {k.lbl}
                </div>
              </div>
            ))}
          </div>
          {/* Cleaning rule bars */}
          <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 12,
              }}
            >
              Règles de nettoyage
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 10,
              }}
            >
              {rules.map((r) => (
                <div
                  key={r.rule}
                  style={{
                    background: C.grey50,
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 800, color: r.color }}
                  >
                    {r.pass}/{stats.originalCount}
                  </div>
                  <div
                    style={{ fontSize: 10, color: C.grey500, marginBottom: 6 }}
                  >
                    {r.rule}
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: C.grey100,
                      borderRadius: 2,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: r.color,
                        borderRadius: 2,
                        width: `${Math.min(
                          100,
                          (r.pass / stats.originalCount) * 100
                        ).toFixed(1)}%`,
                        transition: "width .5s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Rejected rows */}
          {rejectedRows.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.grey700,
                  marginBottom: 8,
                }}
              >
                Lignes invalidess rejetées ({rejectedRows.length})
              </div>
              {showRejected && (
                <div
                  className="glass-card"
                  style={{
                    padding: 14,
                    maxHeight: 220,
                    overflowY: "auto",
                    marginBottom: 8,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 10,
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.grey100}` }}>
                        {rejectedRows.length > 0 &&
                          Object.keys(rejectedRows[0])
                            .filter((k) => k !== "_reasons")
                            .slice(0, 4)
                            .map((h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: "left",
                                  padding: "4px 8px",
                                  color: C.grey500,
                                  fontWeight: 700,
                                }}
                              >
                                {h}
                              </th>
                            ))}
                        <th
                          style={{
                            textAlign: "left",
                            padding: "4px 8px",
                            color: C.grey500,
                            fontWeight: 700,
                          }}
                        >
                          Raison
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedRows.slice(0, 50).map((r, i) => {
                        const fk = Object.keys(r)
                          .filter((k) => k !== "_reasons")
                          .slice(0, 4);
                        return (
                          <tr
                            key={i}
                            style={{ borderBottom: `1px solid ${C.grey100}` }}
                          >
                            {fk.map((k) => (
                              <td
                                key={k}
                                style={{ padding: "4px 8px", color: C.grey700 }}
                              >
                                {String(r[k] ?? "—")}
                              </td>
                            ))}
                            <td
                              style={{
                                padding: "4px 8px",
                                color: C.warning,
                                fontSize: 10,
                              }}
                            >
                              {r._reasons?.join(", ")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-ghost"
                  onClick={() => setShowRejected((v) => !v)}
                  style={{ fontSize: 12 }}
                >
                  {showRejected ? "▲ Masquer" : "▼ Voir les lignes rejetées"}
                </button>
                <button
                  className="btn-ghost"
                  onClick={exportRejected}
                  style={{ fontSize: 12 }}
                >
                  ⬇ Exporter (.csv)
                </button>
              </div>
            </div>
          )}
          {/* Accepted rows preview */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.grey700,
                marginBottom: 8,
              }}
            >
              Aperçu des données conservées ({Math.min(20, invoices.length)}{" "}
              premières lignes)
            </div>
            {showAccepted && (
              <div
                className="glass-card"
                style={{
                  padding: 14,
                  maxHeight: 200,
                  overflowY: "auto",
                  marginBottom: 8,
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 11,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.grey100}` }}>
                      {[
                        "Fournisseur",
                        "Date",
                        "Montant",
                        "Libellé",
                        "Statut",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "5px 8px",
                            color: C.grey500,
                            fontWeight: 700,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 20).map((r, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: `1px solid ${C.grey100}` }}
                      >
                        <td
                          style={{
                            padding: "4px 8px",
                            color: C.info,
                            fontWeight: 700,
                          }}
                        >
                          {r.supplier || r.supplier_code || "—"}
                        </td>
                        <td style={{ padding: "4px 8px", color: C.grey500 }}>
                          {r.date || r.invoice_date || "—"}
                        </td>
                        <td
                          style={{
                            padding: "4px 8px",
                            color: C.success,
                            fontWeight: 700,
                          }}
                        >
                          {fmtE(Math.round(r.amount))}
                        </td>
                        <td style={{ padding: "4px 8px", color: C.grey500 }}>
                          {r.label || "—"}
                        </td>
                        <td style={{ padding: "4px 8px", color: C.grey500 }}>
                          {r.status || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              className="btn-ghost"
              onClick={() => setShowAccepted((v) => !v)}
              style={{ fontSize: 12 }}
            >
              {showAccepted
                ? "▲ Masquer"
                : "▼ Voir l'aperçu des données conservées"}
            </button>
          </div>
          <div
            style={{
              padding: "14px 18px",
              background: "rgba(34,197,94,.05)",
              border: `1px solid rgba(34,197,94,.2)`,
              borderRadius: 12,
              marginBottom: 14,
              fontSize: 12,
              color: C.success,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <CheckCircle size={13} color={C.success} />
            <span>
              Nettoyage complet — {stats.totalInvoices.toLocaleString()} factures
              prêtes pour l'analyse.
            </span>
          </div>
        </>
      )}
      <button
        onClick={() => onConfirm(stats)}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
        disabled={loading || !stats}
      >
        Passer à l'EDA →
      </button>
    </div>
  );
}
