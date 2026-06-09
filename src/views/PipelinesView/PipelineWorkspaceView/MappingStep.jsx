

import { C } from "@/constants/colors";
import { useState } from "react";
import { Check, TriangleAlert } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { parseCSV, wsAPI, wsStore } from "@/store/wsAPI";
import { WS_MAPPING_CORE_FIELDS, WS_MAPPING_DEMO_COLUMNS } from "@/store/staticData";
import { autoDetect } from "@/views/PipelinesView/PipelineWorkspaceView/utils";

export function WSMappingStep({ uploadData, onConfirm, onNavigate, manageMode = false }) {
  // Prefer uploadData from previous upload step; fall back to headers stored in
  // wsStore by the pipeline-creation modal CSV import (new flow, no upload step).
  const headers = uploadData?.columns || wsStore.csvHeaders || WS_MAPPING_DEMO_COLUMNS;
  const detected = autoDetect(headers);
  const [cols, setCols] = useState(detected);
  const [extraCols, setExtraCols] = useState([]);
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState(null);

  const sampleRows = uploadData?.sampleRows || wsStore.csvSampleRows || [];
  const reservedCols = new Set(
    [
      cols.amount,
      cols.date,
      cols.supplier,
      cols.tenant,
      cols.status,
      cols.label,
      cols.docref,
      cols.note,
    ].filter(Boolean)
  );
  const availableForExtra = headers.filter((h) => !reservedCols.has(h));
  const toggleExtra = (h) =>
    setExtraCols((e) => (e.includes(h) ? e.filter((x) => x !== h) : [...e, h]));
  const CORE = WS_MAPPING_CORE_FIELDS;
  const sampleVals = (col) => {
    if (!col || !sampleRows.length) return [];
    return [
      ...new Set(
        sampleRows.map((r) => r[col]).filter((v) => v !== undefined && v !== "")
      ),
    ].slice(0, 3);
  };
  const confidence = (k) => {
    if (!cols[k]) return null;
    const h = cols[k].toLowerCase().replace(/[_\-\s]/g, "");
    const sk = k.toLowerCase();
    if (h === sk) return "high";
    if (h.includes(sk) || sk.includes(h)) return "high";
    return "med";
  };
  const confColor = (c) =>
    c === "high" ? C.success : c === "med" ? C.warning : C.grey300;
  const can = cols.amount && cols.date && cols.supplier;
  const confirm = async () => {
    setImporting(true);
    setErr(null);
    try {
      if (uploadData?.file) {
        // Real file uploaded via the old upload step
        const text = await uploadData.file.text();
        const parsed = parseCSV(text);
        wsStore.invoices = parsed.rows
          .map((r, i) => ({
            invoice_ref: r[cols.docref] || `INV-${i + 1}`,
            invoice_date: r[cols.date] || "",
            amount: parseFloat(r[cols.amount]) || 0,
            supplier_code: r[cols.supplier] || "",
            label: cols.label ? r[cols.label] : null,
            entity: cols.tenant ? r[cols.tenant] : "CORP01",
            status: cols.status ? r[cols.status] : "VALID",
            doc_ref: r[cols.docref] || "",
            ...Object.fromEntries(extraCols.map((col) => [col, r[col] ?? ""])),
          }))
          .filter((r) => r.amount > 0 && r.invoice_date && r.supplier_code);
        wsStore.series = [];
        wsStore.alerts = [];
        wsStore.detectionRun = false;
      } else if (!uploadData && wsStore.csvRawRows?.length) {
        // CSV was already uploaded via the pipeline creation modal — re-map using
        // the user's column selections from this mapping step.
        wsStore.invoices = wsStore.csvRawRows
          .map((r, i) => ({
            invoice_ref: r[cols.docref] || `INV-${i + 1}`,
            invoice_date: r[cols.date] || "",
            amount: parseFloat(r[cols.amount]) || 0,
            supplier_code: r[cols.supplier] || "",
            label: cols.label ? r[cols.label] : null,
            entity: cols.tenant ? r[cols.tenant] : "CORP01",
            status: cols.status ? r[cols.status] : "VALID",
            doc_ref: r[cols.docref] || "",
            ...Object.fromEntries(extraCols.map((col) => [col, r[col] ?? ""])),
          }))
          .filter((r) => r.amount > 0 && r.invoice_date && r.supplier_code);
        wsStore.series = [];
        wsStore.alerts = [];
        wsStore.detectionRun = false;
      } else {
        // Demo/static data already lives in wsStore during manual pipeline creation.
        wsStore.invoices = Array.isArray(wsStore.invoices) ? wsStore.invoices : [];
      }
      onConfirm({ cols, extraCols, statusConfig: null });
    } catch (e) {
      setErr(e.message);
      setImporting(false);
    }
  };
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
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
      {/* Column chips */}
      <div
        className="glass-card"
        style={{ padding: "12px 16px", marginBottom: 12 }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.grey700,
            marginBottom: 8,
          }}
        >
          Colonnes du fichier{" "}
          <span style={{ color: C.grey400, fontWeight: 400, marginLeft: 6 }}>
            rouge = mappé, gris = non mappé
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {headers.map((h) => {
            const mappedAs = Object.entries(cols).find(([, v]) => v === h)?.[0];
            return (
              <span
                key={h}
                style={{
                  background: mappedAs ? "rgba(217,79,61,.1)" : C.grey100,
                  borderRadius: 6,
                  padding: "3px 10px",
                  fontSize: 10,
                  color: mappedAs ? C.red : C.grey600,
                  fontWeight: 600,
                  border: `1px solid ${
                    mappedAs ? "rgba(217,79,61,.2)" : C.grey200
                  }`,
                }}
              >
                {h}
                {mappedAs && (
                  <span style={{ fontSize: 9, color: C.redMid, marginLeft: 4 }}>
                    →{mappedAs}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
      {/* Core mapping */}
      <div className="glass-card" style={{ padding: 18, marginBottom: 12 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.grey700,
            marginBottom: 14,
          }}
        >
          Association des champs
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 28px",
          }}
        >
          {CORE.map(({ k, lbl, req, hint }) => {
            const mapped = cols[k];
            const vals = sampleVals(mapped);
            const conf = mapped ? confidence(k) : null;
            return (
              <div key={k} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <label
                    style={{ fontSize: 11, color: C.grey600, fontWeight: 700 }}
                  >
                    {lbl}
                    {req && <span style={{ color: C.red }}> *</span>}
                  </label>
                  {conf && (
                    <span
                      style={{
                        fontSize: 9,
                        color: confColor(conf),
                        fontWeight: 700,
                        padding: "1px 6px",
                        background: `${confColor(conf)}15`,
                        borderRadius: 4,
                      }}
                    >
                      {conf === "high" ? "Confiant" : "Probable"}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 9, color: C.grey400, marginBottom: 5 }}>
                  {hint}
                </div>
                <select
                  value={cols[k] || ""}
                  onChange={(e) =>
                    setCols((c) => ({ ...c, [k]: e.target.value }))
                  }
                  className="input-field"
                  style={{
                    padding: "8px 12px",
                    borderColor: mapped
                      ? conf === "high"
                        ? `${C.success}60`
                        : `${C.warning}60`
                      : C.grey200,
                  }}
                >
                  <option value="">— non mappé —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                {vals.length > 0 && (
                  <div
                    style={{
                      marginTop: 4,
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    {vals.map((v, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 9,
                          background: C.grey50,
                          border: `1px solid ${C.grey200}`,
                          borderRadius: 4,
                          padding: "1px 6px",
                          color: C.grey600,
                          fontFamily: "monospace",
                        }}
                      >
                        {String(v).slice(0, 24)}
                      </span>
                    ))}
                  </div>
                )}
                {!mapped && req && (
                  <div style={{ fontSize: 9, color: C.red, marginTop: 3 }}>
                    <TriangleAlert size={9} color={C.red} /> Champ obligatoire
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
            {/* Sample data table */}
      {sampleRows.length > 0 && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey700,
              marginBottom: 8,
            }}
          >
            Aperçuçu ({sampleRows.length} premières lignes)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 10,
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.grey100}` }}>
                  {headers.map((h) => {
                    const mappedAs = Object.entries(cols).find(
                      ([, v]) => v === h
                    )?.[0];
                    return (
                      <th
                        key={h}
                        style={{
                          padding: "5px 8px",
                          textAlign: "left",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          color: mappedAs ? C.red : C.grey500,
                          background: mappedAs
                            ? "rgba(217,79,61,.04)"
                            : "transparent",
                        }}
                      >
                        {h}
                        {mappedAs && (
                          <div
                            style={{
                              fontSize: 8,
                              color: C.redMid,
                              fontWeight: 400,
                            }}
                          >
                            {mappedAs}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sampleRows.slice(0, 4).map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.grey50}` }}>
                    {headers.map((h) => {
                      const mappedAs = Object.entries(cols).find(
                        ([, v]) => v === h
                      )?.[0];
                      return (
                        <td
                          key={h}
                          style={{
                            padding: "4px 8px",
                            color: mappedAs ? C.grey900 : C.grey400,
                            fontWeight: mappedAs ? 600 : 400,
                            background: mappedAs
                              ? "rgba(217,79,61,.03)"
                              : "transparent",
                            whiteSpace: "nowrap",
                            maxWidth: 120,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {String(row[h] ?? "").slice(0, 30)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Extra cols */}
      {availableForExtra.length > 0 && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.grey700,
              marginBottom: 4,
            }}
          >
            Colonnes supplémentaires
          </div>
          <div style={{ fontSize: 11, color: C.grey500, marginBottom: 10 }}>
            Cochez les colonnes à inclure comme champs de regroupement dans les
            séries (stockées dans <code>extra_data</code>).
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {availableForExtra.map((h) => {
              const vals = sampleVals(h);
              return (
                <button
                  key={h}
                  className={`btn-toggle${
                    extraCols.includes(h) ? " active" : ""
                  }`}
                  style={{
                    fontSize: 11,
                    padding: "5px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                  onClick={() => toggleExtra(h)}
                >
                  <span>
                    {extraCols.includes(h) && (
                      <Check
                        size={10}
                        color={C.success}
                        style={{ marginRight: 3 }}
                      />
                    )}
                    {h}
                  </span>
                  {vals.length > 0 && (
                    <span
                      style={{ fontSize: 8, opacity: 0.6, fontWeight: 400 }}
                    >
                      {vals.slice(0, 2).join(", ")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <button
        disabled={!can || importing}
        onClick={confirm}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        {importing ? (
          <>
            <Spinner size={16} color="#fff" />
            Importation…
          </>
        ) : can ? (
          manageMode ? "Enregistrer le mapping" : `Importer & continuer →`
        ) : (
          "Sélectionner les 3 champs obligatoires (*)"
        )}
      </button>
    </div>
  );
}
