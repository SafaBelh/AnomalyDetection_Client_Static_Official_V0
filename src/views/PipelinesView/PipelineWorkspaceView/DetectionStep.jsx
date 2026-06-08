

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Microscope, Play, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { wsAPI } from "@/store/wsAPI";
import { fmtE, sevColor } from "@/utils/formatters";

export function WSDetectionStep({ series, onFinish, onNavigate }) {
  const toast = useToast();
  const [alerts, setAlerts] = useState([]);
  const [running, setRunning] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [activeTab, setActiveTab] = useState("detection");
  const [err, setErr] = useState(null);
  const [testSup, setTestSup] = useState("");
  const [testLabel, setTestLabel] = useState("");
  const [testAmt, setTestAmt] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
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
  const runDetection = async () => {
    setRunning(true);
    setErr(null);
    try {
      await wsAPI.runDetection();
      const a = await wsAPI.getAlerts("pending");
      setAlerts(a);
    } catch (e) {
      setErr(e.message);
    }
    setRunning(false);
  };
  const doFeedback = async (alert, decision) => {
    try {
      await wsAPI.submitFeedback(alert.id, decision);
      setAlerts((p) => p.filter((a) => a.id !== alert.id));
      setFeedbackLog((p) => [
        ...p,
        { alert_id: alert.id, decision, ts: new Date().toISOString() },
      ]);
      toast(
        decision === "accept" ? "Anomalie confirmée" : "Feedback enregistré",
        "success"
      );
    } catch (e) {
      setErr(e.message);
    }
  };
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
      setActiveTab("detection");
      const newAlerts = await wsAPI.getAlerts("pending");
      setAlerts(newAlerts);
      toast("Facture ajoutée & détection relancée", "success");
    } catch (e) {
      setErr(e.message);
    }
    setTestRunning(false);
  };
  const confirmed = feedbackLog.filter((f) => f.decision === "accept").length;
  const rejected = feedbackLog.filter((f) => f.decision === "reject").length;
  const scoreColor = (score) =>
    score > 85 ? C.red : score > 60 ? C.warning : C.success;
  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 14,
        }}
      >
        Détection & Feedback
      </h2>
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
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {[
          { lbl: "Alertes", val: alerts.length, color: C.red },
          { lbl: "Confirmées", val: confirmed, color: C.success },
          { lbl: "Rejetées", val: rejected, color: C.info },
          { lbl: "Log total", val: feedbackLog.length, color: C.purple },
        ].map((k) => (
          <div
            key={k.lbl}
            className="glass-card-sm"
            style={{ padding: "12px 14px" }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>
              {k.val}
            </div>
            <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
              {k.lbl}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {[
          ["detection", "Alertes"],
          ["testing", "Tester"],
        ].map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab${activeTab === id ? " active" : ""}`}
            style={{ fontSize: 12, padding: "7px 16px" }}
          >
            {lbl}
          </button>
        ))}
      </div>
      {activeTab === "detection" && (
        <>
          <button
            onClick={runDetection}
            disabled={running}
            className="btn-primary"
            style={{ marginBottom: 14 }}
          >
            {running ? (
              <>
                <Spinner size={16} color="#fff" />
                Détection en cours…
              </>
            ) : (
              "Lancer la détection"
            )}
          </button>
          {alerts.length === 0 && !running && (
            <div
              className="glass-card"
              style={{ padding: 24, textAlign: "center", color: C.grey500 }}
            >
              Lancez la détection pour voir les alertes.
            </div>
          )}
          {alerts.map((a, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: "12px 14px",
                marginBottom: 8,
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.red }}>
                  ALERTE
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 800, color: C.grey700 }}
                >
                  {Math.round(a.score * 100)}
                </div>
              </div>
              <div>
                <div
                  style={{ fontSize: 12, fontWeight: 700, color: C.grey900 }}
                >
                  {a.supplier}
                  {a.label ? ` · ${a.label}` : ""}
                </div>
                <div style={{ fontSize: 11, color: C.grey500 }}>
                  {a.reason} · {fmtE(Math.round(a.amount))} · ref:{" "}
                  {a.reference_mu
                    ? `μ=${fmtE(Math.round(a.reference_mu))}`
                    : "—"}
                </div>
                {a.explanation && (
                  <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
                    {a.explanation}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  className="btn-confirm"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => doFeedback(a, "accept")}
                ><Check size={12} strokeWidth={3} style={{marginRight:4}}/>Confirmer</button>
                <button
                  className="btn-danger"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => doFeedback(a, "reject")}
                >
                  <X size={12} strokeWidth={2.5} style={{marginRight:4}}/> Rejeter
                </button>
                <button
                  className="btn-mute"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => doFeedback(a, "ignore")}
                >
                  Ignorer
                </button>
              </div>
            </div>
          ))}
        </>
      )}
      {activeTab === "testing" && (
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
                Simuler / Ajouter une facture
              </div>
              <div style={{ fontSize: 12, color: C.grey500, marginBottom: 16 }}>
                Score calculé localement — cliquez "Ajouter & Détecter" pour
                insérer en base.
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
                      {testResult.error}
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
                              color: scoreColor(testResult.score),
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
                            background: `${scoreColor(testResult.score)}15`,
                            border: `1px solid ${scoreColor(
                              testResult.score
                            )}30`,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: scoreColor(testResult.score),
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: scoreColor(testResult.score),
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
      <button
        onClick={() => onFinish({ alerts, feedbackLog, series })}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center", marginTop: 20 }}
      >
        Ouvrir le tableau de bord →
      </button>
    </div>
  );
}
