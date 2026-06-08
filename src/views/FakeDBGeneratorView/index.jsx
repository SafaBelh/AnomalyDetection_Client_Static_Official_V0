import { useCallback, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SliderRow } from "@/components/ui/SliderRow";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { fmtE } from "@/utils/formatters";

export const anomTypeLabel = {
  amount_spike: "Pic de montant",
  gap_cluster: "Zéro / Manquant",
  extra_invoice: "Double facturation",
};
export const FAKE_GEN_COLORS = [
  C.red,
  C.info,
  C.success,
  C.warning,
  C.purple,
  C.teal,
  C.orange,
  C.pink,
  C.redMid,
];

export function FakeDBGeneratorView() {
  const toast = useToast();
  const [genMonths, setGenMonths] = useState(18);
  const [genSuppliers, setGenSuppliers] = useState([]);
  const [genAnomalies, setGenAnomalies] = useState([]);
  const [genPreview, setGenPreview] = useState(null);
  const [editingSupIdx, setEditingSupIdx] = useState(null);
  const [activeTab, setActiveTab] = useState("suppliers"); // suppliers | anomalies | preview

  const generateData = useCallback(() => {
    const headers = [
      "invoice_ref",
      "invoice_date",
      "amount",
      "supplier_code",
      "entity",
      "status",
      "label",
      "doc_ref",
      "due_date",
    ];
    const rows = [];
    let idx = 1001;
    const anomalyLog = [];
    genSuppliers.forEach((sup) => {
      (sup.subcategories || []).forEach((sub) => {
        for (let m = 0; m < genMonths; m++) {
          if (sub.freq === "quarterly" && m % 3 !== 0) continue;
          if (sub.freq === "biannual" && m % 6 !== 0) continue;
          const noise = 1 + (Math.random() - 0.5) * 2 * sub.cv;
          let amt = Math.max(1, Math.round(sub.mu * noise * 100) / 100);
          const baseDate = new Date(
            2023,
            m % 12,
            3 + Math.floor(Math.random() * 20)
          );
          const matchedAnom = genAnomalies.find(
            (a) =>
              a.supplier === sup.name &&
              (!a.label || a.label === sub.label) &&
              a.month === m
          );
          if (matchedAnom) {
            if (matchedAnom.type === "amount_spike") {
              amt = Math.round(sub.mu * matchedAnom.multiplier * 100) / 100;
              anomalyLog.push({
                ...matchedAnom,
                label: sub.label,
                actualAmount: amt,
                ref: `INV-${String(idx).padStart(5, "0")}`,
                date: baseDate.toISOString().split("T")[0],
              });
            } else if (matchedAnom.type === "gap_cluster") {
              amt = 0;
              anomalyLog.push({
                ...matchedAnom,
                label: sub.label,
                actualAmount: 0,
                ref: `INV-${String(idx).padStart(5, "0")}`,
                date: baseDate.toISOString().split("T")[0],
              });
            } else if (matchedAnom.type === "extra_invoice") {
              const extraDate = new Date(2023, m % 12, baseDate.getDate() + 2);
              rows.push(
                [
                  `INV-${String(idx).padStart(5, "0")}`,
                  extraDate.toISOString().split("T")[0],
                  amt,
                  sup.name,
                  "CORP01",
                  "VALID",
                  sub.label,
                  "DOC" + idx++,
                  new Date(extraDate.getTime() + 30 * 864e5)
                    .toISOString()
                    .split("T")[0],
                ].join(",")
              );
              anomalyLog.push({
                ...matchedAnom,
                label: sub.label,
                actualAmount: amt,
                ref: `INV-${String(idx - 1).padStart(5, "0")}`,
                date: extraDate.toISOString().split("T")[0],
              });
            }
          }
          rows.push(
            [
              `INV-${String(idx).padStart(5, "0")}`,
              baseDate.toISOString().split("T")[0],
              amt,
              sup.name,
              "CORP01",
              "VALID",
              sub.label,
              "DOC" + idx++,
              new Date(baseDate.getTime() + 30 * 864e5)
                .toISOString()
                .split("T")[0],
            ].join(",")
          );
        }
      });
    });
    const csvText = [headers.join(","), ...rows].join("\n");
    const totalSubs = genSuppliers.reduce(
      (s, sup) => s + (sup.subcategories?.length || 0),
      0
    );
    const preview = {
      rows: rows.length,
      suppliers: genSuppliers.length,
      subcategories: totalSubs,
      anomalies: anomalyLog.length,
      csvText,
      headers,
      anomalyLog,
    };
    setGenPreview(preview);
    return { csvText, anomalyLog, preview };
  }, [genSuppliers, genMonths, genAnomalies]);

  const downloadGenerated = () => {
    const { csvText } = generateData();
    const blob = new Blob([csvText], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anomalyiq_fake_data.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV téléchargé avec succès", "success");
  };

  const totalInvoiceEstimate = genSuppliers.reduce(
    (s, sup) =>
      s +
      (sup.subcategories || []).reduce(
        (ss, sub) =>
          ss +
          (sub.freq === "monthly"
            ? genMonths
            : sub.freq === "quarterly"
            ? Math.floor(genMonths / 3)
            : Math.floor(genMonths / 6)),
        0
      ),
    0
  );

  return (
    <div style={{ padding: "28px 0", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `linear-gradient(135deg,${C.purple},${C.info})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 16px rgba(139,92,246,.3)",
                }}
              >
                🧪
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 28,
                    color: C.grey900,
                    lineHeight: 1,
                  }}
                >
                  Générateur de données de test
                </h2>
                <p style={{ fontSize: 12, color: C.grey500, marginTop: 3 }}>
                  Créez un jeu de données fictif réaliste pour tester le
                  pipeline sans toucher aux bases réelles
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="btn-ghost"
              onClick={downloadGenerated}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Icon name="fileText" size={14} color={C.grey600} />⬇ Télécharger
              CSV
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                generateData();
                setActiveTab("preview");
                toast("Données générées !", "success");
              }}
            >
              <Icon name="sparkle" size={14} color="#fff" />
              Générer & Aperçu
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[
            {
              label: "Fournisseurs",
              value: genSuppliers.length,
              color: C.red,
              icon: "clients",
            },
            {
              label: "Sous-catégories",
              value: genSuppliers.reduce(
                (s, sup) => s + (sup.subcategories?.length || 0),
                0
              ),
              color: C.info,
              icon: "chart",
            },
            {
              label: "Factures estimées",
              value: totalInvoiceEstimate,
              color: C.success,
              icon: "fileText",
            },
            {
              label: "Anomalies injectées",
              value: genAnomalies.length,
              color: C.warning,
              icon: "triangle",
            },
          ].map(({ label, value, color, icon }, i) => (
            <div
              key={i}
              className={`glass-card-sm fade-up-${i}`}
              style={{ padding: "14px 16px", borderLeft: `3px solid ${color}` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={icon} size={16} color={color} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>
                    {value.toLocaleString("fr-FR")}
                  </div>
                  <div
                    style={{ fontSize: 11, fontWeight: 600, color: C.grey600 }}
                  >
                    {label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          padding: "6px 8px",
          background: "rgba(255,255,255,.5)",
          borderRadius: 14,
          backdropFilter: "blur(10px)",
          border: `1px solid rgba(255,255,255,.88)`,
          width: "fit-content",
        }}
      >
        {[
          ["suppliers", "🏢 Fournisseurs"],
          ["anomalies", "⚡ Anomalies"],
          ["preview", "📋 Aperçu & Export"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tab${activeTab === id ? " active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── SUPPLIERS TAB ── */}
      {activeTab === "suppliers" && (
        <div
          className="fade-in"
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}
        >
          {/* Supplier list */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: C.grey700 }}>
                Configuration des fournisseurs
              </div>
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: "6px 14px" }}
                onClick={() =>
                  setGenSuppliers((prev) => [
                    ...prev,
                    {
                      name: `Fournisseur${prev.length + 1}`,
                      subcategories: [
                        {
                          label: "Service A",
                          mu: 500,
                          cv: 0.1,
                          freq: "monthly",
                        },
                      ],
                    },
                  ])
                }
              >
                + Fournisseur
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {genSuppliers.map((sup, si) => (
                <div
                  key={si}
                  className="card-solid fade-up"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  {/* Supplier header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: `${
                        FAKE_GEN_COLORS[si % FAKE_GEN_COLORS.length]
                      }0C`,
                      borderBottom: `1px solid ${
                        FAKE_GEN_COLORS[si % FAKE_GEN_COLORS.length]
                      }20`,
                    }}
                  >
                    {editingSupIdx === si ? (
                      <input
                        className="input-field"
                        value={sup.name}
                        autoFocus
                        onChange={(e) =>
                          setGenSuppliers((prev) =>
                            prev.map((s, i) =>
                              i === si ? { ...s, name: e.target.value } : s
                            )
                          )
                        }
                        onBlur={() => setEditingSupIdx(null)}
                        style={{
                          flex: 1,
                          padding: "4px 8px",
                          fontSize: 13,
                          fontWeight: 700,
                          marginRight: 8,
                          maxWidth: 200,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: FAKE_GEN_COLORS[si % FAKE_GEN_COLORS.length],
                          flex: 1,
                        }}
                      >
                        {sup.name}
                        <span
                          style={{
                            fontSize: 10,
                            color: C.grey500,
                            fontWeight: 400,
                            marginLeft: 8,
                          }}
                        >
                          {sup.subcategories?.length || 0} sous-catégorie
                          {(sup.subcategories?.length || 0) > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="btn-ghost"
                        style={{ fontSize: 10, padding: "2px 8px" }}
                        onClick={() =>
                          setEditingSupIdx(editingSupIdx === si ? null : si)
                        }
                      >
                        ✏️ Renommer
                      </button>
                      <button
                        className="btn-ghost"
                        style={{
                          fontSize: 10,
                          padding: "2px 8px",
                          color: C.success,
                          borderColor: `${C.success}50`,
                        }}
                        onClick={() =>
                          setGenSuppliers((prev) =>
                            prev.map((s, i) =>
                              i === si
                                ? {
                                    ...s,
                                    subcategories: [
                                      ...(s.subcategories || []),
                                      {
                                        label: "Nouveau service",
                                        mu: 300,
                                        cv: 0.1,
                                        freq: "monthly",
                                      },
                                    ],
                                  }
                                : s
                            )
                          )
                        }
                      >
                        + Sous-cat.
                      </button>
                      <button
                        className="btn-danger"
                        style={{ fontSize: 10, padding: "2px 8px" }}
                        onClick={() =>
                          setGenSuppliers((prev) =>
                            prev.filter((_, i) => i !== si)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* Subcategory rows */}
                  <div>
                    {(sup.subcategories || []).map((sub, subi) => (
                      <div
                        key={subi}
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(0,1fr) 100px 72px 110px 32px",
                          gap: 6,
                          alignItems: "end",
                          padding: "10px 14px",
                          borderBottom:
                            subi < sup.subcategories.length - 1
                              ? `1px solid ${C.grey100}`
                              : undefined,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.grey400,
                              marginBottom: 3,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                            }}
                          >
                            LABEL
                          </div>
                          <input
                            className="input-field"
                            value={sub.label}
                            style={{ fontSize: 11, padding: "5px 8px" }}
                            onChange={(e) =>
                              setGenSuppliers((prev) =>
                                prev.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        subcategories: s.subcategories.map(
                                          (c, j) =>
                                            j === subi
                                              ? { ...c, label: e.target.value }
                                              : c
                                        ),
                                      }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.grey400,
                              marginBottom: 3,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                            }}
                          >
                            MONTANT MOY.
                          </div>
                          <input
                            type="number"
                            className="input-field"
                            value={sub.mu}
                            style={{ fontSize: 11, padding: "5px 8px" }}
                            onChange={(e) =>
                              setGenSuppliers((prev) =>
                                prev.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        subcategories: s.subcategories.map(
                                          (c, j) =>
                                            j === subi
                                              ? {
                                                  ...c,
                                                  mu: Number(e.target.value),
                                                }
                                              : c
                                        ),
                                      }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.grey400,
                              marginBottom: 3,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                            }}
                          >
                            CV
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            className="input-field"
                            value={sub.cv}
                            style={{ fontSize: 11, padding: "5px 8px" }}
                            onChange={(e) =>
                              setGenSuppliers((prev) =>
                                prev.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        subcategories: s.subcategories.map(
                                          (c, j) =>
                                            j === subi
                                              ? {
                                                  ...c,
                                                  cv: Number(e.target.value),
                                                }
                                              : c
                                        ),
                                      }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.grey400,
                              marginBottom: 3,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                            }}
                          >
                            FRÉQUENCE
                          </div>
                          <select
                            className="input-field"
                            value={sub.freq}
                            style={{ fontSize: 11, padding: "5px 8px" }}
                            onChange={(e) =>
                              setGenSuppliers((prev) =>
                                prev.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        subcategories: s.subcategories.map(
                                          (c, j) =>
                                            j === subi
                                              ? { ...c, freq: e.target.value }
                                              : c
                                        ),
                                      }
                                    : s
                                )
                              )
                            }
                          >
                            <option value="monthly">Mensuel</option>
                            <option value="quarterly">Trimestriel</option>
                            <option value="biannual">Semestriel</option>
                          </select>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            paddingBottom: 1,
                          }}
                        >
                          <button
                            className="btn-danger"
                            style={{
                              fontSize: 10,
                              padding: "5px 7px",
                              width: "100%",
                              justifyContent: "center",
                            }}
                            onClick={() =>
                              setGenSuppliers((prev) =>
                                prev.map((s, i) =>
                                  i === si
                                    ? {
                                        ...s,
                                        subcategories: s.subcategories.filter(
                                          (_, j) => j !== subi
                                        ),
                                      }
                                    : s
                                )
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: global params */}
          <div>
            <div
              className="card-solid"
              style={{ padding: 22, marginBottom: 16 }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: C.grey900,
                  marginBottom: 4,
                }}
              >
                ⚙️ Paramètres globaux
              </div>
              <div style={{ fontSize: 11, color: C.grey500, marginBottom: 16 }}>
                Contrôle la portée et le volume des données générées
              </div>
              <SliderRow
                label="Mois d'historique"
                value={genMonths}
                min={6}
                max={36}
                step={1}
                onChange={setGenMonths}
                fmt={(v) => `${v} mois`}
              />
              <div
                style={{
                  fontSize: 11,
                  color: C.grey400,
                  marginTop: 8,
                  padding: "8px 10px",
                  background: C.grey50,
                  borderRadius: 8,
                }}
              >
                → ~{totalInvoiceEstimate} factures normales +{" "}
                {genAnomalies.length} anomalies injectées
              </div>
            </div>
            <div
              className="card-solid"
              style={{
                padding: 18,
                background: "rgba(139,92,246,.03)",
                border: `1.5px solid rgba(139,92,246,.15)`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.purple,
                  marginBottom: 10,
                }}
              >
                💡 Guide rapide
              </div>
              {[
                [
                  "Montant moy. (mu)",
                  "Le montant de facture typique pour ce service",
                ],
                [
                  "CV (coeff. variation)",
                  "La variabilité normale — 0.05 = stable, 0.3 = volatile",
                ],
                ["Fréquence", "À quelle périodicité ce fournisseur facture"],
              ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 8 }}>
                  <div
                    style={{ fontSize: 11, fontWeight: 700, color: C.grey700 }}
                  >
                    {k}
                  </div>
                  <div style={{ fontSize: 10, color: C.grey500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ANOMALIES TAB ── */}
      {activeTab === "anomalies" && (
        <div
          className="fade-in"
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 700, color: C.grey700 }}
                >
                  Anomalies injectées
                </div>
                <div style={{ fontSize: 11, color: C.grey500 }}>
                  Ces anomalies seront délibérément insérées dans les données
                  générées pour tester la détection
                </div>
              </div>
              <button
                className="btn-danger"
                style={{ fontSize: 12, padding: "6px 14px" }}
                onClick={() => {
                  const sup = genSuppliers[0]?.name || "TechCorp";
                  setGenAnomalies((prev) => [
                    ...prev,
                    {
                      supplier: sup,
                      type: "amount_spike",
                      month: Math.floor(genMonths / 2),
                      multiplier: 2.5,
                      desc: "Nouvelle anomalie",
                    },
                  ]);
                }}
              >
                + Anomalie
              </button>
            </div>
            {genAnomalies.length === 0 && (
              <div
                className="card-solid"
                style={{
                  padding: 40,
                  textAlign: "center",
                  color: C.grey400,
                  fontSize: 12,
                }}
              >
                Aucune anomalie configurée — ajoutez-en une pour tester la
                détection.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {genAnomalies.map((a, ai) => (
                <div
                  key={ai}
                  className="card-solid fade-up"
                  style={{ padding: "14px 16px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          marginBottom: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          className="badge badge-red"
                          style={{ fontSize: 10 }}
                        >
                          {anomTypeLabel[a.type] || a.type}
                        </span>
                        <span
                          className="badge badge-mute"
                          style={{ fontSize: 10 }}
                        >
                          {a.supplier}
                        </span>
                        <span
                          className="badge badge-warn"
                          style={{ fontSize: 10 }}
                        >
                          Mois {a.month + 1}
                        </span>
                      </div>
                      <input
                        className="input-field"
                        value={a.desc}
                        style={{ fontSize: 11, marginBottom: 8 }}
                        onChange={(e) =>
                          setGenAnomalies((prev) =>
                            prev.map((x, i) =>
                              i === ai ? { ...x, desc: e.target.value } : x
                            )
                          )
                        }
                      />
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        <select
                          className="input-field"
                          value={a.supplier}
                          style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            width: "auto",
                          }}
                          onChange={(e) =>
                            setGenAnomalies((prev) =>
                              prev.map((x, i) =>
                                i === ai
                                  ? {
                                      ...x,
                                      supplier: e.target.value,
                                      label: "",
                                    }
                                  : x
                              )
                            )
                          }
                        >
                          {genSuppliers.map((s) => (
                            <option key={s.name} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        {(() => {
                          const sup = genSuppliers.find(
                            (s) => s.name === a.supplier
                          );
                          const subs = sup?.subcategories || [];
                          if (subs.length <= 1) return null;
                          return (
                            <select
                              className="input-field"
                              value={a.label || ""}
                              style={{
                                fontSize: 11,
                                padding: "4px 8px",
                                width: "auto",
                              }}
                              onChange={(e) =>
                                setGenAnomalies((prev) =>
                                  prev.map((x, i) =>
                                    i === ai
                                      ? { ...x, label: e.target.value || "" }
                                      : x
                                  )
                                )
                              }
                            >
                              <option value="">Toutes sous-catégories</option>
                              {subs.map((c) => (
                                <option key={c.label} value={c.label}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                        <select
                          className="input-field"
                          value={a.type}
                          style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            width: "auto",
                          }}
                          onChange={(e) =>
                            setGenAnomalies((prev) =>
                              prev.map((x, i) =>
                                i === ai ? { ...x, type: e.target.value } : x
                              )
                            )
                          }
                        >
                          <option value="amount_spike">💥 Pic montant</option>
                          <option value="gap_cluster">
                            🔴 Zéro / manquant
                          </option>
                          <option value="extra_invoice">
                            🔁 Double facturation
                          </option>
                        </select>
                        {a.type === "amount_spike" && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <span style={{ fontSize: 11, color: C.grey500 }}>
                              ×
                            </span>
                            <input
                              type="number"
                              step="0.1"
                              min="1.2"
                              max="10"
                              value={a.multiplier}
                              className="input-field"
                              style={{
                                width: 65,
                                fontSize: 11,
                                padding: "4px 8px",
                              }}
                              onChange={(e) =>
                                setGenAnomalies((prev) =>
                                  prev.map((x, i) =>
                                    i === ai
                                      ? {
                                          ...x,
                                          multiplier: Number(e.target.value),
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                          </div>
                        )}
                        <input
                          type="number"
                          min={0}
                          max={genMonths - 1}
                          value={a.month}
                          className="input-field"
                          style={{
                            width: 60,
                            fontSize: 11,
                            padding: "4px 8px",
                          }}
                          placeholder="Mois"
                          onChange={(e) =>
                            setGenAnomalies((prev) =>
                              prev.map((x, i) =>
                                i === ai
                                  ? { ...x, month: Number(e.target.value) }
                                  : x
                              )
                            )
                          }
                        />
                      </div>
                    </div>
                    <button
                      className="btn-danger"
                      style={{
                        fontSize: 11,
                        padding: "4px 9px",
                        flexShrink: 0,
                      }}
                      onClick={() =>
                        setGenAnomalies((prev) =>
                          prev.filter((_, i) => i !== ai)
                        )
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: what to expect */}
          <div>
            <div
              className="card-solid"
              style={{
                padding: 20,
                border: `1.5px solid rgba(59,130,246,.2)`,
                background: "rgba(59,130,246,.02)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: C.info,
                  marginBottom: 12,
                }}
              >
                📋 Ce que vous devez voir après détection
              </div>
              {genAnomalies.length === 0 ? (
                <div style={{ fontSize: 11, color: C.grey400 }}>
                  Ajoutez des anomalies pour voir les attentes.
                </div>
              ) : (
                genAnomalies.map((a, ai) => {
                  const sup = genSuppliers.find((s) => s.name === a.supplier);
                  const sub =
                    sup?.subcategories?.find(
                      (c) => !a.label || c.label === a.label
                    ) || sup?.subcategories?.[0];
                  const refMu = sub?.mu || 0;
                  const expectedAmt = sub
                    ? a.type === "amount_spike"
                      ? Math.round(refMu * a.multiplier)
                      : a.type === "gap_cluster"
                      ? 0
                      : Math.round(refMu)
                    : "?";
                  const normalAmt = sub ? Math.round(refMu) : "?";
                  return (
                    <div
                      key={ai}
                      style={{
                        marginBottom: 8,
                        padding: "8px 12px",
                        background: "rgba(59,130,246,.06)",
                        borderRadius: 8,
                        border: `1px solid rgba(59,130,246,.15)`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.grey900,
                          marginBottom: 2,
                        }}
                      >
                        {a.supplier} — {anomTypeLabel[a.type]}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: C.grey600,
                          marginBottom: 2,
                        }}
                      >
                        Mois {a.month + 1} (≈{" "}
                        {new Date(2023, a.month % 12).toLocaleDateString(
                          "fr-FR",
                          { month: "long", year: "numeric" }
                        )}
                        )
                      </div>
                      {a.type === "amount_spike" && (
                        <div style={{ fontSize: 10, color: C.red }}>
                          💥 Montant attendu:{" "}
                          <strong>{fmtE(expectedAmt)}</strong> vs normal{" "}
                          <strong>{fmtE(normalAmt)}</strong> (×{a.multiplier})
                        </div>
                      )}
                      {a.type === "gap_cluster" && (
                        <div style={{ fontSize: 10, color: C.red }}>
                          🔴 Facture à <strong>€0</strong> — cluster séparé
                          détectable
                        </div>
                      )}
                      {a.type === "extra_invoice" && (
                        <div style={{ fontSize: 10, color: C.warning }}>
                          🔁 Double facturation: 2 factures dans le mois{" "}
                          {a.month + 1}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === "preview" && (
        <div className="fade-in">
          {!genPreview ? (
            <div
              className="card-solid"
              style={{ padding: 60, textAlign: "center" }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>🧪</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.grey700,
                  marginBottom: 6,
                }}
              >
                Aucune donnée générée
              </div>
              <div style={{ fontSize: 12, color: C.grey500, marginBottom: 20 }}>
                Cliquez sur "Générer & Aperçu" pour créer votre jeu de données
                de test.
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  generateData();
                  toast("Données générées !", "success");
                }}
              >
                <Icon name="sparkle" size={14} color="#fff" />
                Générer maintenant
              </button>
            </div>
          ) : (
            <div>
              {/* Summary */}
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
                    label: "Lignes CSV",
                    value: genPreview.rows,
                    color: C.success,
                  },
                  {
                    label: "Fournisseurs",
                    value: genPreview.suppliers,
                    color: C.info,
                  },
                  {
                    label: "Anomalies injectées",
                    value: genPreview.anomalies,
                    color: C.red,
                  },
                ].map(({ label, value, color }, i) => (
                  <div
                    key={i}
                    className="glass-card-sm"
                    style={{
                      padding: "14px 18px",
                      borderLeft: `3px solid ${color}`,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 28, fontWeight: 800, color }}>
                      {value.toLocaleString("fr-FR")}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.grey600,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Anomaly log */}
              {genPreview.anomalyLog.length > 0 && (
                <div
                  className="card-solid"
                  style={{ padding: 20, marginBottom: 16 }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.grey700,
                      marginBottom: 12,
                    }}
                  >
                    ⚡ Journal des anomalies injectées
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 11,
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${C.grey200}` }}>
                          {[
                            "Référence",
                            "Date",
                            "Fournisseur",
                            "Label",
                            "Type",
                            "Montant",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "6px 10px",
                                fontWeight: 700,
                                color: C.grey500,
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {genPreview.anomalyLog.map((a, i) => (
                          <tr
                            key={i}
                            className="table-row"
                            style={{ borderBottom: `1px solid ${C.grey100}` }}
                          >
                            <td
                              style={{
                                padding: "7px 10px",
                                fontFamily: "'JetBrains Mono',monospace",
                                fontSize: 10,
                              }}
                            >
                              {a.ref || "—"}
                            </td>
                            <td
                              style={{ padding: "7px 10px", color: C.grey600 }}
                            >
                              {a.date || "—"}
                            </td>
                            <td
                              style={{
                                padding: "7px 10px",
                                fontWeight: 600,
                                color: C.grey900,
                              }}
                            >
                              {a.supplier}
                            </td>
                            <td
                              style={{ padding: "7px 10px", color: C.grey600 }}
                            >
                              {a.label || "—"}
                            </td>
                            <td style={{ padding: "7px 10px" }}>
                              <span
                                className={`badge ${
                                  a.type === "amount_spike"
                                    ? "badge-red"
                                    : a.type === "gap_cluster"
                                    ? "badge-warn"
                                    : "badge-info"
                                }`}
                                style={{ fontSize: 9 }}
                              >
                                {anomTypeLabel[a.type]}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "7px 10px",
                                fontWeight: 700,
                                color: a.actualAmount === 0 ? C.red : C.grey900,
                              }}
                            >
                              {a.actualAmount === 0
                                ? "€0 ⚠️"
                                : fmtE(a.actualAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CSV preview */}
              <div className="card-solid" style={{ padding: 20 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.grey700,
                    marginBottom: 12,
                  }}
                >
                  📄 Aperçu CSV (10 premières lignes)
                </div>
                <pre
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 10,
                    color: C.grey700,
                    background: C.grey50,
                    borderRadius: 8,
                    padding: "12px 14px",
                    overflowX: "auto",
                    border: `1px solid ${C.grey200}`,
                  }}
                >
                  {genPreview.csvText.split("\n").slice(0, 11).join("\n")}
                </pre>
                <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                  <button
                    className="btn-ghost"
                    onClick={downloadGenerated}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    ⬇ Télécharger le CSV complet ({genPreview.rows} lignes)
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      generateData();
                      toast("Données régénérées !", "success");
                    }}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <Icon name="refresh" size={13} color="#fff" />
                    Régénérer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
