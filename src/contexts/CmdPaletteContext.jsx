import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CornerDownLeft, Search } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { C } from "@/constants/colors";
import { alertsForTenant, pipelinesForTenant, useAuth } from "@/store/db";
import { fmtE } from "@/utils/formatters";

export const CmdPaletteContext = createContext(null);
export function CmdPaletteProvider({ children, onNavigate }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  return (
    <CmdPaletteContext.Provider value={{ open, openPalette, closePalette, onNavigate }}>
      {children}
      {open && <CommandPaletteModal onClose={closePalette} onNavigate={onNavigate} />}
    </CmdPaletteContext.Provider>
  );
}
export function useCmdPalette() {
  return useContext(CmdPaletteContext) || {};
}
export function CommandPaletteModal({ onClose, onNavigate }) {
  const { tenant, isEngineAdmin } = useAuth();
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const [idx, setIdx] = useState(0);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setIdx(0); }, [q]);

  const invoices = [];
  const alerts = tenant ? alertsForTenant(tenant.id) : [];
  const pipelines = tenant ? pipelinesForTenant(tenant.id) : [];

  const navItems = [
    { type: "nav", label: "Vue d'ensemble", icon: "dashboard", page: "dashboard" },
    { type: "nav", label: "Pipelines", icon: "pipelines", page: "pipelines" },
    { type: "nav", label: "Explorateur de factures", icon: "explorer", page: "explorer" },
    { type: "nav", label: "Anomalies", icon: "anomalies", page: "anomalies" },
    { type: "nav", label: "Alertes", icon: "bell", page: "alerts" },
    { type: "nav", label: "Intégrations", icon: "plug", page: "integrations" },
    ...(isEngineAdmin ? [{ type: "nav", label: "Tenants", icon: "tenants", page: "tenants" }] : []),
    { type: "nav", label: "Paramètres", icon: "gear", page: "settings" },
  ];

  const ql = q.toLowerCase().trim();
  const results = ql.length === 0 ? navItems.slice(0, 6) : [
    ...navItems.filter(n => n.label.toLowerCase().includes(ql)),
    ...pipelines.filter(p => p.name.toLowerCase().includes(ql) || p.connector.toLowerCase().includes(ql))
      .slice(0, 3).map(p => ({ type: "pipeline", label: p.name, sub: `Pipeline · ${p.connector}`, icon: "pipelines", pipelineId: p.id })),
    ...alerts.filter(a => a.message.toLowerCase().includes(ql))
      .slice(0, 3).map(a => ({ type: "alert", label: a.message, sub: `Alerte · ${a.severity}`, icon: "bell", page: "alerts" })),
    ...invoices.filter(i => i.reference.toLowerCase().includes(ql) || i.supplierName.toLowerCase().includes(ql))
      .slice(0, 4).map(i => ({ type: "invoice", label: i.reference, sub: `${i.supplierName} · ${fmtE(i.amount)}`, icon: "fileText", page: "explorer", anomaly: i.status === "anomaly" })),
  ];

  const handleSelect = (r) => {
    if (r.page) onNavigate(r.page);
    onClose();
  };
  const handleKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && results[idx]) handleSelect(results[idx]);
    if (e.key === "Escape") onClose();
  };

  const typeColors = { nav: C.info, pipeline: C.purple, alert: C.warning, invoice: C.grey600 };
  const typeLabels = { nav: "Navigation", pipeline: "Pipeline", alert: "Alerte", invoice: "Facture" };

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(24,25,28,0.45)", backdropFilter: "blur(6px)" }} />
      <div
        className="scale-in"
        style={{ position: "relative", width: 580, background: "rgba(255,255,255,0.96)", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,.22)", border: `1px solid ${C.grey200}`, overflow: "hidden" }}
      >
        {/* Input */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${C.grey100}` }}>
          <Search size={16} color={C.grey400} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Rechercher — factures, pipelines, alertes, pages…"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontWeight: 500, background: "transparent", color: C.grey900, fontFamily: "inherit" }}
          />
          <kbd style={{ padding: "2px 6px", borderRadius: 5, background: C.grey100, border: `1px solid ${C.grey200}`, fontSize: 10, color: C.grey500, fontFamily: "inherit" }}>ESC</kbd>
        </div>
        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: C.grey400, fontSize: 13 }}>Aucun résultat pour « {q} »</div>
          ) : (
            <div style={{ padding: "6px 6px 8px" }}>
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(r)}
                  onMouseEnter={() => setIdx(i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 11,
                    border: "none", background: i === idx ? "rgba(217,79,61,.08)" : "transparent", cursor: "pointer",
                    textAlign: "left", transition: "background .1s",
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${typeColors[r.type]}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={r.icon} size={14} color={typeColors[r.type]} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: r.anomaly ? C.red : C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
                    {r.sub && <div style={{ fontSize: 11, color: C.grey500, marginTop: 1 }}>{r.sub}</div>}
                  </div>
                  <span style={{ fontSize: 10, color: typeColors[r.type], fontWeight: 700, background: `${typeColors[r.type]}15`, padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>{typeLabels[r.type]}</span>
                  {i === idx && <CornerDownLeft size={12} color={C.grey400} />}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.grey100}`, display: "flex", gap: 16, fontSize: 10, color: C.grey400 }}>
          <span><kbd style={{ fontFamily: "inherit", background: C.grey100, border: `1px solid ${C.grey200}`, borderRadius: 4, padding: "1px 5px" }}>↑↓</kbd> naviguer</span>
          <span><kbd style={{ fontFamily: "inherit", background: C.grey100, border: `1px solid ${C.grey200}`, borderRadius: 4, padding: "1px 5px" }}>↵</kbd> ouvrir</span>
          <span><kbd style={{ fontFamily: "inherit", background: C.grey100, border: `1px solid ${C.grey200}`, borderRadius: 4, padding: "1px 5px" }}>⌘K</kbd> pour rouvrir</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
