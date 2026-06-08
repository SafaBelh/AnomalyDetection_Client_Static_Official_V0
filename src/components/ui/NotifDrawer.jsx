import { createPortal } from "react-dom";
import { Bell, BellOff, Check, X as LucideX } from "lucide-react";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { alertsForTenant, markAlertRead, useAuth, useStore } from "@/store/db";

export function NotifDrawer({ open, onClose, onNavigate }) {
  const { tenant } = useAuth();
  const toast = useToast();
  useStore();
  if (!tenant) return null;
  const alerts = alertsForTenant(tenant.id).slice().sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const unread = alerts.filter(a => !a.read);

  return createPortal(
    <>
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 8000 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(24,25,28,0.18)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
          />
          <div
            className="scale-in"
            style={{
              position: "absolute", right: 0, top: 0, bottom: 0, width: 380,
              background: "rgba(255,255,255,0.97)", borderLeft: `1px solid ${C.grey200}`,
              boxShadow: "-12px 0 40px rgba(0,0,0,.12)", display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${C.grey100}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(217,79,61,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bell size={16} color={C.red} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.grey900 }}>Notifications</div>
                  <div style={{ fontSize: 10, color: C.grey500 }}>{unread.length} non lue{unread.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {unread.length > 0 && (
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "5px 10px" }}
                    onClick={() => { unread.forEach(a => markAlertRead(a.id)); toast("Toutes les alertes marquées comme lues", "success"); }}
                  >
                    Tout lire
                  </button>
                )}
                <button className="btn-icon" onClick={onClose}><LucideX size={14} color={C.grey500} /></button>
              </div>
            </div>
            {/* List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
              {alerts.length === 0 ? (
                <div style={{ padding: "48px 20px", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(217,79,61,.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <BellOff size={26} color={C.red} strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.grey700 }}>Aucune alerte</div>
                  <div style={{ fontSize: 11, color: C.grey400, marginTop: 4 }}>Vous êtes à jour !</div>
                </div>
              ) : alerts.map(a => {
                const sc = { critical: C.red, warning: C.warning, info: C.info }[a.severity] || C.grey500;
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex", gap: 10, padding: "11px 10px", borderRadius: 12, marginBottom: 4,
                      background: a.read ? "transparent" : "rgba(217,79,61,.04)",
                      border: `1px solid ${a.read ? "transparent" : "rgba(217,79,61,.12)"}`,
                      transition: "background .15s",
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.read ? C.grey300 : sc, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: a.read ? 500 : 700, color: C.grey900, lineHeight: 1.4 }}>{a.message}</div>
                      <div style={{ fontSize: 10, color: C.grey400, marginTop: 3 }}>
                        {new Date(a.timestamp).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {!a.read && (
                      <button
                        className="btn-icon"
                        style={{ padding: 5, flexShrink: 0, alignSelf: "flex-start" }}
                        onClick={() => markAlertRead(a.id)}
                        title="Marquer comme lu"
                      >
                        <Check size={12} color={C.grey500} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.grey100}`, flexShrink: 0 }}>
              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { onNavigate("alerts"); onClose(); }}
              >
                Voir toutes les alertes
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
