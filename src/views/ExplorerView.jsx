import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { commandesForTenant, invoicesForTenant, useAuth, visibleTenants } from "@/store/db";
import { downloadCSV } from "@/store/wsAPI";
import { addAuditEntry } from "@/utils/audit";

export const EXT_STATUS_CFG = {
  ENCO: { label: "En cours", cls: "badge-warn" },
  VALID: { label: "Validé", cls: "badge-ok" },
  REFUS: { label: "Refusé", cls: "badge-red" },
  PAYE: { label: "Payé", cls: "badge-info" },
};

export function ExplorerView() {
  const { tenant, isEngineAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [extFilter, setExtFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [sel, setSel] = useState(null);
  const [dataset, setDataset] = useState("factures");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const tenantIds = isEngineAdmin
      ? visibleTenants().map(t => t.id)
      : (tenant?.id ? [tenant.id] : []);
    if (tenantIds.length === 0) {
      setRows([]);
      setSel(null);
      return;
    }
    const nextRows = tenantIds.flatMap(tid => {
      const data = dataset === "commandes" ? commandesForTenant(tid) : invoicesForTenant(tid, 1000);
      return data.map(row => ({ ...row, tenantId: row.tenantId || row.tenant_id || tid }));
    });
    setRows(nextRows);
    setSel(null);
  }, [tenant?.id, isEngineAdmin, dataset]);

  if (!tenant && !isEngineAdmin) return null;
  const filtered = rows
    .filter((i) => {
      if (dataset === "factures" && filter !== "all" && (i.status || "normal") !== filter) return false;
      if (dataset === "factures" && extFilter !== "all" && (i.extStatus || "") !== extFilter) return false;
      if (dataset === "commandes" && filter !== "all" && (i.status || "") !== filter) return false;
      const ref = i.reference || i.invoice_ref || i.invoiceId || i.commandeRef || i.id || "";
      const name = i.supplier || i.supplierName || i.supplier_code || i.budgetCode || "";
      if (search && !`${ref} ${name}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      const dateA = a.date || a.invoice_date || "";
      const dateB = b.date || b.invoice_date || "";
      const amtA = a.amount || a.orderedAmount || 0;
      const amtB = b.amount || b.orderedAmount || 0;
      const supA = a.supplier || a.supplierName || a.supplier_code || "";
      const supB = b.supplier || b.supplierName || b.supplier_code || "";
      if (sortKey === "date") cmp = dateA.localeCompare(dateB);
      if (sortKey === "amount") cmp = amtA - amtB;
      if (sortKey === "supplier") cmp = supA.localeCompare(supB);
      return sortDir === "asc" ? cmp : -cmp;
    });
  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  };
  const SortIcon = ({ k }) =>
    sortKey === k ? <span style={{ fontSize: 8, marginLeft: 2 }}>{sortDir === "asc" ? "▲" : "▼"}</span> : null;
  const thBase = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    padding: "10px 12px",
    background: "#fbf8f6",
    borderBottom: `1px solid ${C.grey100}`,
    boxShadow: "0 2px 0 rgba(255,255,255,.95)",
    fontWeight: 700,
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };
  const labels = dataset === "commandes"
    ? { ref: "Référence commande", supplier: "Fournisseur", amount: "Montant commande", date: "Date commande", org: "Budget", extStatus: "Statut", status: "Budget" }
    : { ref: "Référence facture", supplier: "Fournisseur", amount: "Montant", date: "Date facture", org: "Établissement", extStatus: "Statut externe", status: "Anomalie" };
  return (
    <div className="fade-up" style={{ padding: 24, height: "calc(100vh - 68px)", display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
      <PageHeader
        eyebrow="Data"
        title="Explorateur"
        subtitle={`${filtered.length} ${dataset === "commandes" ? "commande" : "facture"}${filtered.length > 1 ? "s" : ""} · ${tenant?.name || "Tous les tenants"}`}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} color={C.grey400} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: 30, fontSize: 12 }} placeholder={dataset === "commandes" ? "Commande, fournisseur, budget…" : "Référence, fournisseur…"} />
        </div>
        {["factures", "commandes"].map((d) => (
          <button key={d} onClick={() => { setDataset(d); setFilter("all"); }} className={dataset === d ? "btn-primary" : "btn-ghost"} style={{ fontSize: 12, padding: "6px 14px" }}>
            {d === "factures" ? "Factures" : "Commandes"}
          </button>
        ))}
        {(dataset === "factures" ? ["all", "anomaly", "normal"] : ["all", "OVER_BUDGET", "ON_TRACK"]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn-primary" : "btn-ghost"} style={{ fontSize: 12, padding: "6px 14px" }}>
            {f === "all" ? "Toutes" : f === "anomaly" ? "Anomalies" : f === "normal" ? "Normales" : f === "OVER_BUDGET" ? "Dépassement" : "OK budget"}
          </button>
        ))}
        {dataset === "factures" && <select value={extFilter} onChange={(e) => setExtFilter(e.target.value)} className="input-field" style={{ width: "auto", fontSize: 12 }}>
          <option value="all">Statut (tous)</option>
          {Object.entries(EXT_STATUS_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label} ({k})</option>
          ))}
        </select>}
        <button className="btn-ghost" style={{ fontSize: 12, padding: "7px 14px", flexShrink: 0 }}
          onClick={() => {
            downloadCSV(filtered.map(i => ({
              reference: i.reference || i.invoice_ref || i.commandeRef,
              fournisseur: i.supplier || i.supplierName,
              montant: i.amount || i.orderedAmount,
              tva: i.vatAmount,
              date: i.date || i.invoice_date || i.commandeDate,
              echeance: i.dueDate,
              budget: i.budgetCode || "",
              statut: i.status,
              type_anomalie: i.anomalyType || "",
              score: i.score || "",
              ext_statut: i.extStatus,
            })), `${dataset}-${tenant?.name || "tous-les-tenants"}-${new Date().toISOString().slice(0, 10)}.csv`);
            addAuditEntry("Export CSV", `Explorateur — ${filtered.length} ${dataset} exportées`);
          }}
        ><Download size={13} /> Exporter CSV ({filtered.length})</button>
      </div>
      <div style={{ display: "flex", gap: 12, flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto" }} className="glass-card">
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 11, minWidth: 700 }}>
            <thead>
              <tr style={{ color: C.grey500 }}>
                <th style={{ ...thBase, textAlign: "left" }}>{labels.ref}</th>
                <th style={{ ...thBase, textAlign: "left", cursor: "pointer" }} onClick={() => toggleSort("supplier")}>{labels.supplier} <SortIcon k="supplier" /></th>
                <th style={{ ...thBase, textAlign: "right", cursor: "pointer" }} onClick={() => toggleSort("amount")}>{labels.amount} <SortIcon k="amount" /></th>
                <th style={{ ...thBase, textAlign: "left", cursor: "pointer" }} onClick={() => toggleSort("date")}>{labels.date} <SortIcon k="date" /></th>
                <th style={{ ...thBase, textAlign: "left" }}>{labels.org}</th>
                <th style={{ ...thBase, textAlign: "left" }}>{labels.extStatus}</th>
                <th style={{ ...thBase, textAlign: "left" }}>{labels.status}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ height: 300, textAlign: "center", verticalAlign: "middle", color: C.grey400, fontSize: 13 }}>
                    Aucune {dataset === "commandes" ? "commande" : "facture"} trouvée
                  </td>
                </tr>
              )}
              {filtered.slice(0, 200).map((inv) => {
                const stCfg = dataset === "commandes" ? { label: inv.status === "OVER_BUDGET" ? "Dépassement" : "OK", cls: inv.status === "OVER_BUDGET" ? "badge-red" : "badge-ok" } : EXT_STATUS_CFG[inv.extStatus || ""] || { label: inv.extStatus || "—", cls: "badge-mute" };
                const isSel = sel?.id === inv.id;
                return (
                  <tr key={inv.id || inv.invoice_ref} onClick={() => setSel(isSel ? null : inv)} className={`table-row${isSel ? " selected" : ""}`} style={{ borderTop: `1px solid ${C.grey100}` }}>
                    <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: C.red, whiteSpace: "nowrap" }}>{inv.reference || inv.invoice_ref || inv.commandeRef}</td>
                    <td style={{ padding: "8px 12px", color: C.grey900, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.supplier || inv.supplierName || inv.supplier_code}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", textAlign: "right", fontWeight: 600, color: C.grey900, whiteSpace: "nowrap" }}>{(inv.amount || inv.orderedAmount || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</td>
                    <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", color: C.grey500, whiteSpace: "nowrap" }}>{inv.date || inv.invoice_date || inv.commandeDate}</td>
                    <td style={{ padding: "8px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey500 }}>{dataset === "commandes" ? inv.budgetCode : inv.establishment || "—"}</td>
                    <td style={{ padding: "8px 12px" }}><span className={`badge ${stCfg.cls}`}>{dataset === "commandes" ? stCfg.label : inv.extStatus || "—"}</span></td>
                    <td style={{ padding: "8px 12px" }}>
                      {dataset === "commandes" ? <span className={`badge ${stCfg.cls}`}>{inv.status === "OVER_BUDGET" ? "À surveiller" : "Budget OK"}</span> : inv.status === "anomaly" ? (
                        <span className="badge badge-red">{inv.anomalyType || ""} · {((inv.score || 0) * 100).toFixed(0)}%</span>
                      ) : (
                        <span className="badge badge-ok">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sel && (
          <div className="glass-card fade-in" style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.grey100}` }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.grey900 }}>{sel.supplier || sel.supplierName}</p>
                 <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.grey500 }}>{sel.reference || sel.invoice_ref || sel.commandeRef}</p>
              </div>
              <button onClick={() => setSel(null)} className="btn-icon" style={{ padding: 5 }}><Icon name="x" size={14} color={C.grey500} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Champs EPFTET / TIECOD</p>
              {[
                [dataset === "commandes" ? "CMDREF" : "DOCREF", sel.reference || sel.invoice_ref || sel.commandeRef, dataset === "commandes" ? "COMMANDES" : "EPFTET"],
                [dataset === "commandes" ? "MONTANT_CMD" : "LOCNETMNT", `${(sel.amount || sel.orderedAmount || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`, dataset === "commandes" ? "COMMANDES" : "EPFTET"],
                [dataset === "commandes" ? "DATE_CMD" : "FACDAT", sel.date || sel.invoice_date || sel.commandeDate, dataset === "commandes" ? "COMMANDES" : "EPFTET"],
                ["ECHDAT", sel.dueDate || "—", "EPFTET"],
                ["SOCCOD", sel.socId || sel.tenantId || "—", "EPFTET"],
                ["JRNETA", sel.establishment || "—", "EPFTET"],
                ["EPFEXTSTA", sel.extStatus || "—", "EPFTET"],
                ["DEVCOD", sel.currency || "EUR", "EPFTET"],
                ["TIECOD", sel.supplier || sel.supplierName || sel.supplier_code, "TIECOD"],
                ...(dataset === "commandes" ? [["BUDGET", sel.budgetCode, "COMMANDES"], ["LIBELLE", sel.label, "COMMANDES"]] : []),
              ].map(([field, value, table]) => (
                <div key={field} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.grey50}` }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.red }}>{field}</span>
                    {table && <span style={{ marginLeft: 4, fontSize: 8, color: C.grey400, opacity: 0.6 }}>{table}</span>}
                  </div>
                  <span style={{ fontSize: 9, textAlign: "right", fontFamily: "'JetBrains Mono',monospace", color: C.grey900, wordBreak: "break-all" }}>{value}</span>
                </div>
              ))}
              {sel.status === "anomaly" && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "rgba(217,79,61,.1)", border: `1px solid rgba(217,79,61,.2)` }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: C.red }}>Anomalie détectée</p>
                  <p style={{ fontSize: 9, color: C.red, opacity: 0.85, marginTop: 3 }}>Type : {sel.anomalyType}</p>
                  <p style={{ fontSize: 9, color: C.red, opacity: 0.85 }}>Score MAD : {((sel.score || 0) * 100).toFixed(0)}%</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <p style={{ fontSize: 10, color: C.grey400, flexShrink: 0 }}>
        {filtered.length} {dataset === "commandes" ? "commande" : "facture"}{filtered.length > 1 ? "s" : ""} · Source : {dataset === "commandes" ? "COMMANDES" : "EPFTET"} · Tenant <strong style={{ color: C.red }}>{tenant?.name || "Tous les tenants"}</strong>
      </p>
    </div>
  );
}
