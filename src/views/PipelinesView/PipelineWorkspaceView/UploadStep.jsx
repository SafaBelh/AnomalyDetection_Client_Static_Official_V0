import { useCallback, useRef, useState } from "react";
import { CheckCircle, FolderOpen } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { parseCSV, wsAPI } from "@/store/wsAPI";
import { StepBar } from "@/views/PipelinesView/PipelineWorkspaceView/StepBar";

export function WSUploadStep({ pipeline, onNext }) {
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const ref = useRef();

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setErr(null);
    try {
      // Try real file parse first
      const text = await file.text();
      const res = parseCSV(text);
      setTestResult({
        ok: true,
        rows: res.rows.length,
        cols: res.headers.length,
        sample: res.headers.slice(0, 6),
        columns: res.headers,
        sampleRows: res.rows.slice(0, 5),
        parsed: res,
        file,
      });
    } catch (ex) {
      setErr("Erreur: " + ex.message);
    }
    setLoading(false);
  }, []);

  const loadDemo = async () => {
    setLoading(true);
    setErr(null);
    try {
      await wsAPI.importCSV();
      const preview = await wsAPI.previewCSV();
      setTestResult({
        ok: true,
        rows: preview.row_count,
        cols: preview.headers.length,
        sample: preview.headers.slice(0, 6),
        columns: preview.headers,
        sampleRows: preview.sample,
        file: null,
        isDemo: true,
      });
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <StepBar step={0} />
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 24,
          color: C.grey900,
          marginBottom: 4,
        }}
      >
        Chargement & Test de connexion
      </h2>
      <p style={{ fontSize: 13, color: C.grey500, marginBottom: 20 }}>
        Type de connexion :{" "}
        <strong style={{ color: C.grey900 }}>
          {pipeline?.connType?.toUpperCase() || "CSV"}
        </strong>
      </p>
      <div className="card-solid" style={{ padding: 24, marginBottom: 14 }}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            processFile(e.dataTransfer.files[0]);
          }}
          onClick={() => ref.current?.click()}
          style={{
            border: `2px dashed ${drag ? C.red : C.grey300}`,
            borderRadius: 14,
            padding: "32px 20px",
            textAlign: "center",
            cursor: "pointer",
            background: drag ? C.redPale : "rgba(255,255,255,.6)",
            transition: "all .2s",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 36,
              marginBottom: 10,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <FolderOpen size={36} color={C.red} strokeWidth={1.5} />
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.grey800,
              marginBottom: 5,
            }}
          >
            Déposez votre CSV ici
          </div>
          <div style={{ fontSize: 12, color: C.grey500, marginBottom: 14 }}>
            ou cliquez pour sélectionner
          </div>
          <span className="btn-primary" style={{ pointerEvents: "none" }}>
            {loading ? "Lecture…" : "Sélectionner un fichier CSV"}
          </span>
        </div>
        <input
          ref={ref}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => processFile(e.target.files[0])}
        />
        <button
          className="btn-ghost"
          onClick={loadDemo}
          style={{ marginBottom: 14, fontSize: 12 }}
        >
          {loading ? (
            <>
              <Spinner size={14} />
              Chargement…
            </>
          ) : (
            "▶ Charger les données démo (18 mois)"
          )}
        </button>
        {err && (
          <div
            style={{
              background: C.redPale,
              border: `1px solid rgba(217,79,61,.25)`,
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 10,
              fontSize: 12,
              color: C.red,
            }}
          >
            {err}
          </div>
        )}
        {testResult?.ok && (
          <div
            className="fade-in"
            style={{
              background: "rgba(34,197,94,.06)",
              border: `1px solid rgba(34,197,94,.25)`,
              borderRadius: 12,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "rgba(34,197,94,.12)",
                }}
              >
                <CheckCircle size={14} color={C.success} strokeWidth={2} />
              </div>
              <div style={{ fontWeight: 700, color: C.success, fontSize: 13 }}>
                Fichier prêt — {testResult.rows} lignes · {testResult.cols}{" "}
                colonnes
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {testResult.sample.map((h) => (
                <span
                  key={h}
                  style={{
                    background: "rgba(34,197,94,.12)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 10,
                    color: C.success,
                    fontWeight: 600,
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <button
        className="btn-primary"
        disabled={!testResult?.ok}
        onClick={() =>
          onNext({
            columns: testResult.columns,
            sampleRows: testResult.sampleRows,
            file: testResult.file,
            parsed: testResult.parsed,
            isDemo: testResult.isDemo,
          })
        }
        style={{ width: "100%", justifyContent: "center" }}
      >
        {testResult?.ok
          ? "Confirmer & Passer au Mapping →"
          : "Charger un fichier d'abord"}
      </button>
    </div>
  );
}
