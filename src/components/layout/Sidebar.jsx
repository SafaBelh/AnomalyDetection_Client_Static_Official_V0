import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { C } from "@/constants/colors";
import { alertsForTenant, enrichTenant, useAuth } from "@/store/db";

export function Sidebar({ activePage, onNavigate, onLogout }) {
  const { user, tenant, partner, isEngineAdmin, isTenantAdmin, isSSO } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  if (!user) return null;
  const tenantWithStats = tenant ? enrichTenant(tenant) : null;
  const tenantColor = tenantWithStats?.color || C.red;
  const footerAvatarColor = tenantWithStats?.color || C.red;
  const footerAvatarLogo = tenantWithStats?.logo || user.name?.slice(0, 2).toUpperCase() || "?";
  const ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "budget", label: "Budget", icon: "chart" },
    { id: "pipelines", label: "Pipelines", icon: "pipelines" },
    { id: "explorer", label: "Explorer", icon: "explorer" },
    { id: "anomalies", label: "Anomalies", icon: "anomalies" },
    { id: "alerts", label: "Alertes", icon: "alerts" },
    { id: "series", label: "Séries", icon: "fileText" },
    ...(isEngineAdmin ? [{ id: "integrations", label: "Intégrations", icon: "integrations" }] : []),
    ...(isEngineAdmin ? [{ id: "tenants", label: "Tenants", icon: "tenants" }] : []),
    { id: "settings", label: "Paramètres", icon: "settings" },
  ];
  const unread = tenant
    ? alertsForTenant(tenant.id).filter((a) => !a.read).length
    : 0;
  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,.72)",
        backdropFilter: "blur(20px)",
        borderRight: `1px solid rgba(255,255,255,.88)`,
        transition: "width .2s ease-out",
        overflow: "hidden",
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 16px 16px",
          borderBottom: `1px solid rgba(255,255,255,.88)`,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `linear-gradient(135deg,${C.red},${C.redMid})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(217,79,61,.3)",
          }}
        >
          <Icon name="bolt" size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 16,
                color: C.grey900,
                whiteSpace: "nowrap",
              }}
            >
              AnomalyIQ
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.grey500,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 1,
              }}
            >
              Invoice Intelligence
            </div>
          </div>
        )}
      </div>
      {/* Tenant chip */}
      {tenantWithStats && !collapsed && (
        <div
          style={{
            margin: "10px 12px",
            padding: "8px 12px",
            borderRadius: 12,
            background: `${tenantColor}0F`,
            border: `1px solid ${tenantColor}26`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: tenantColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {tenantWithStats.logo
              ? tenantWithStats.logo
              : (tenantWithStats.name?.slice(0, 2).toUpperCase() || "?")}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: C.grey900,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tenantWithStats.name}
            </div>
            <div style={{ fontSize: 9, color: C.grey500 }}>
              {tenantWithStats.plan} · {(tenantWithStats.invoiceCount ?? 0).toLocaleString("fr-FR")}{" "}
              factures
            </div>
          </div>
        </div>
      )}
      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          overflowY: "auto",
        }}
      >
        {ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`nav-item${activePage === item.id ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <Icon
              name={item.icon}
              size={17}
              color="currentColor"
            />
            {!collapsed && (
              <span
                style={{
                  truncate: true,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {item.label}
              </span>
            )}
            {!collapsed && item.id === "alerts" && unread > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  background: C.red,
                  color: "#fff",
                  borderRadius: 99,
                  fontSize: 9,
                  padding: "1px 6px",
                  fontWeight: 700,
                }}
              >
                {unread}
              </span>
            )}
          </button>
        ))}
      </nav>
      {/* Footer */}
      <div
        style={{
          padding: "10px",
          borderTop: `1px solid rgb(138 138 138 / 7%)`,
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              padding: "4px 6px",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: footerAvatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {footerAvatarLogo}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.grey900,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: C.grey500,
                  textTransform: "capitalize",
                }}
              >
                {user.role ? user.role.replace("_", " ") : ""}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            onLogout();
          }}
          className="nav-item"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          title="Déconnexion"
        >
          <Icon name="logout" size={17} color="currentColor" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="nav-item"
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            marginTop: 4,
          }}
          title={collapsed ? "Étendre" : "Réduire"}
        >
          <Icon
            name={collapsed ? "expand" : "collapse"}
            size={15}
            color="currentColor"
          />
          {!collapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  );
}
