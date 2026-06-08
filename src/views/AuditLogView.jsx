import { useState } from "react";
import { Download } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { C } from "@/constants/colors";
import { useAuth, useStore } from "@/store/db";
import { downloadCSV } from "@/store/wsAPI";
import { auditLog } from "@/utils/audit";

const USERS = { U01: "Admin", U02: "Manager", U03: "Utilisateur", ENGINE: "Engine Admin" };

export function AuditLogView() {
  useStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const actions = [...new Set(auditLog.map(e => e.action))];
  const filtered = filter === "all" ? auditLog : auditLog.filter(e => e.action === filter);
  const actionColors = {
    "Connexion": C.success, "Seuil modifié": C.warning, "Anomalie confirmée": C.red,
    "Faux positif": C.info, "Pipeline créé": C.purple, "Export CSV": C.teal,
    "Série reconfigurée": C.orange, "Alerte ignorée": C.grey500,
  };
  const actorName = (uid) => USERS[uid] || uid;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: C.grey900 }}>Journal d'audit</h3>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setFilter("all")} className={filter === "all" ? "btn-primary" : "btn-ghost"} style={{ fontSize: 11, padding: "5px 12px" }}>Tous</button>
          {actions.slice(0, 5).map(a => (
            <button key={a} onClick={() => setFilter(a)} className={filter === a ? "btn-primary" : "btn-ghost"} style={{ fontSize: 11, padding: "5px 12px" }}>{a}</button>
          ))}
        </div>
      </div>
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon="📋" title="Aucune entrée" subtitle="Les actions seront enregistrées ici." />
        ) : filtered.map((e, i) => {
          const col = actionColors[e.action] || C.grey500;
          return (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.grey100}` : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.grey900 }}>{e.action}</span>
                  <span style={{ fontSize: 10, color: col, background: `${col}18`, padding: "1px 7px", borderRadius: 6, fontWeight: 600 }}>{actorName(e.userId)}</span>
                </div>
                <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>{e.detail}</div>
              </div>
              <div style={{ fontSize: 10, color: C.grey400, flexShrink: 0 }}>
                {new Date(e.timestamp).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => {
          downloadCSV(filtered.map(e => ({ action: e.action, detail: e.detail, user: actorName(e.userId), timestamp: e.timestamp })), "audit-log.csv");
        }}>
          <Download size={13} /> Exporter CSV
        </button>
      </div>
    </div>
  );
}
