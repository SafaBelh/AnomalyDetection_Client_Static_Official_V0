import { useEffect, useRef, useState } from "react";
import { Bell, Search, ChevronDown, Globe } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { NotifDrawer } from "@/components/ui/NotifDrawer";
import { C } from "@/constants/colors";
import { useCmdPalette } from "@/contexts/CmdPaletteContext";
import { alertsForTenant, db, enrichTenant, setActivePartner, setActiveTenant, visibleTenants, useAuth, useStore, partnersForTenant } from "@/store/db";

export function Topbar({ activePage, onNavigate }) {
  const { user, tenant, partner, isSSO, isEngineAdmin, isTenantAdmin } = useAuth();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const switchRef = useRef(null);
  const parentTenantId = tenant?.parentId || tenant?.id;
  const partners = parentTenantId ? partnersForTenant(parentTenantId) : [];
  const tenants = isEngineAdmin ? visibleTenants() : [];
  const { openPalette } = useCmdPalette();
  useStore();
  const unread = tenant
    ? alertsForTenant(tenant.id).filter((a) => !a.read).length
    : 0;
  useEffect(() => {
    const h = (e) => {
      if (!switchRef.current?.contains(e.target)) setSwitchOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const PAGE_TITLES = {
    dashboard: "Vue d'ensemble",
    budget: "Budget & Prévisions",
    pipelines: "Pipelines",
    explorer: "Explorateur",
    anomalies: "Anomalies",
    alerts: "Alertes",
    integrations: "Intégrations",
    tenants: "Tenants",
    settings: "Paramètres",
  };
  if (!user) return null;
  return (
    <>
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 24px",
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid rgba(255,255,255,.88)`,
        boxShadow: "0 2px 16px rgba(0,0,0,.06)",
      }}
    >
      <div style={{ minWidth: 0, flex: "0 0 auto" }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 22,
            color: C.grey900,
            letterSpacing: "-0.4px",
            lineHeight: 1,
          }}
        >
          {PAGE_TITLES[activePage] || "AnomalyIQ"}
        </h1>
        <p style={{ fontSize: 10, color: C.grey500, marginTop: 2 }}>
          {isEngineAdmin ? (
            tenant ? (
              <>
                SuperAdmin · Vue locataire <strong style={{ color: C.red }}>{tenant.name}</strong>
              </>
            ) : (
              "SuperAdmin · Vue globale de tous les locataires"
            )
          ) : tenant ? (
            <>
              Espace <strong style={{ color: C.red }}>{tenant.name}</strong>
              {partner && (
                <>
                  {" "}—{" "}
                  <strong style={{ color: C.grey800 }}>{partner.name}</strong>
                </>
              )}
            </>
          ) : (
            "Aucun espace actif"
          )}
        </p>
      </div>
      <div style={{ flex: 1 }} />
      {/* Command Palette Trigger */}
      <button
        onClick={openPalette}
        style={{
          position: "relative",
          width: 260,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 10,
          border: `1.5px solid ${C.grey200}`,
          background: "rgba(255,255,255,.75)",
          cursor: "pointer",
          color: C.grey400,
          fontSize: 12,
          fontWeight: 400,
          fontFamily: "inherit",
          transition: "all .2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.color = C.red; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.grey200; e.currentTarget.style.color = C.grey400; }}
      >
        <Search size={13} />
        <span style={{ flex: 1, textAlign: "left" }}>Rechercher…</span>
        <kbd style={{ padding: "1px 5px", borderRadius: 5, background: C.grey100, border: `1px solid ${C.grey200}`, fontSize: 10, fontFamily: "inherit", color: C.grey500 }}>⌘K</kbd>
      </button>
      {/* Context switcher (Engine or Tenant Admin) */}
      {!isSSO && (isEngineAdmin ? tenants.length > 0 : partners.length > 0) && (() => {
        const activeEntity = partner || (tenant ? enrichTenant(tenant) : null);
        const activeEntityColor = activeEntity?.color || C.red;
        const globalText = isEngineAdmin ? "Vue globale" : "Tous les partenaires";
        return (
          <div style={{ position: "relative" }} ref={switchRef}>
            <button
              onClick={() => setSwitchOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 10,
                background: activeEntity ? `${activeEntityColor}0F` : "rgba(217,79,61,.07)",
                border: `1px solid ${activeEntity ? `${activeEntityColor}26` : "rgba(217,79,61,.16)"}`,
                cursor: "pointer",
              }}
            >
              {activeEntity ? (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: activeEntityColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {activeEntity.logo
                    ? activeEntity.logo
                    : (activeEntity.name?.slice(0, 2).toUpperCase() || "??")}
                </div>
              ) : (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: `linear-gradient(135deg, ${C.red}, ${C.redMid})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Globe size={12} color="#fff" strokeWidth={2} />
                </div>
              )}
              <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.grey900,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {activeEntity ? activeEntity.name : globalText}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: C.grey500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeEntity ? (partner ? `Partenaire (${tenant?.name})` : "Locataire") : "Administrateur"}
                </div>
              </div>
              <ChevronDown size={14} color={C.grey500} />
            </button>
          {switchOpen && (
            <div
              className="scale-in"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 6px)",
                width: 280,
                background: "#fff",
                border: `1px solid ${C.grey200}`,
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0,0,0,.12)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: "10px 14px 8px",
                  borderBottom: `1px solid ${C.grey100}`,
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.grey500,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="tenants" size={12} color={C.grey400} />
                Contexte
              </div>
              <div
                style={{ maxHeight: 280, overflowY: "auto", padding: "4px" }}
              >
                <button
                  onClick={() => {
                    if (isEngineAdmin) {
                      setActiveTenant(null);
                    } else if (parentTenantId) {
                      setActiveTenant(parentTenantId);
                    }
                    setActivePartner(null);
                    setSwitchOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: 10,
                    border: "none",
                    background:
                      !db.activePartnerId
                        ? "rgba(217,79,61,.07)"
                        : "transparent",
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: `linear-gradient(135deg, ${C.red}, ${C.redMid})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Globe size={16} color="#fff" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.grey900,
                      }}
                    >
                      Tous les partenaires
                    </div>
                    <div style={{ fontSize: 10, color: C.grey500 }}>
                      Vue globale administrateur
                    </div>
                  </div>
                  {!db.activePartnerId && (
                    <Icon name="check" size={14} color={C.red} />
                  )}
                </button>
                {isEngineAdmin ? (
                  tenants.map((t) => (
                    <div key={t.id}>
                      <button
                        onClick={() => {
                          setActiveTenant(t.id);
                          setActivePartner(null);
                          setSwitchOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderRadius: 10,
                          border: "none",
                          background:
                            db.activeTenantId === t.id && !db.activePartnerId
                              ? "rgba(217,79,61,.07)"
                              : "transparent",
                          cursor: "pointer",
                          transition: "background .15s",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: t.color || C.grey700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {t.logo
                            ? t.logo
                            : (t.name?.slice(0, 2).toUpperCase() || "?")}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.grey900,
                            }}
                          >
                            {t.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.grey500 }}>
                            Tenant ID: {t.id}
                          </div>
                        </div>
                        {db.activeTenantId === t.id && !db.activePartnerId && (
                          <Icon name="check" size={14} color={C.red} />
                        )}
                      </button>
                      {partnersForTenant(t.id).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveTenant(t.id);
                            setActivePartner(p.id);
                            setSwitchOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px 8px 46px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            borderRadius: 10,
                            border: "none",
                            background:
                              db.activePartnerId === p.id
                                ? "rgba(217,79,61,.07)"
                                : "transparent",
                            cursor: "pointer",
                            transition: "background .15s",
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 6,
                              background: p.color || C.grey600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            {p.logo
                              ? p.logo
                              : (p.name?.slice(0, 2).toUpperCase() || "?")}
                          </div>
                          <div style={{ flex: 1, textAlign: "left" }}>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: C.grey900,
                              }}
                            >
                              {p.name}
                            </div>
                          </div>
                          {db.activePartnerId === p.id && (
                            <Icon name="check" size={14} color={C.red} />
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  partners.map((item) => {
                    const sel = db.activePartnerId === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (parentTenantId) {
                            setActiveTenant(parentTenantId);
                          }
                          setActivePartner(item.id);
                          setSwitchOpen(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          borderRadius: 10,
                          border: "none",
                          background:
                            sel
                              ? "rgba(217,79,61,.07)"
                              : "transparent",
                          cursor: "pointer",
                          transition: "background .15s",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: item.color || C.grey700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          {item.logo
                            ? item.logo
                            : (item.name?.slice(0, 2).toUpperCase() || "?")}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.grey900,
                            }}
                          >
                            {item.name}
                          </div>
                          <div style={{ fontSize: 10, color: C.grey500 }}>
                            ID Externe: {item.external_tenant_id}
                          </div>
                        </div>
                        {sel && (
                          <Icon name="check" size={14} color={C.red} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        );
      })()}
      {/* Bell — opens notification drawer */}
      <button
        onClick={() => setNotifOpen(true)}
        className="btn-icon"
        style={{ position: "relative" }}
      >
        <Icon name="bell" size={16} color={C.grey600} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 99,
              background: C.red,
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(217,79,61,.4)",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </header>
    <NotifDrawer open={notifOpen} onClose={() => setNotifOpen(false)} onNavigate={onNavigate} />
    </>
  );
}
