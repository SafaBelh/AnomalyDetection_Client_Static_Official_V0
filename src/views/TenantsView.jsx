

import { useState, useEffect, useCallback, useMemo } from "react";
import { Building2, Link2, Plus } from "lucide-react";
import { Radar } from "recharts";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { childTenants, enrichTenant, getTenantCredentials, pipelinesForTenant, useAuth, useStore } from "@/store/db";
import { MLContent } from "@/views/pipelines/MLContent";
import { MOCK_API_RESPONSES, USERS_TABLE } from "@/store/staticData";
import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";

export const COLORS_PALETTE = [
  "#D94F3D",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#EC4899",
  "#84CC16",
  "#14B8A6",
];

// ── Shared input style helper ──────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  borderRadius: 10,
  border: `1.5px solid rgba(107,114,128,.18)`,
  background: "rgba(255,255,255,.7)",
  fontSize: 12,
  color: C.grey900,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color .15s",
};

const labelStyle = {
  fontSize: 9,
  fontWeight: 700,
  color: C.grey500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 5,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const softColor = (hex, alpha = "14") => `${hex}${alpha}`;

export function TenantsView({ onNavigateToPipeline }) {
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [expanded, setExpanded] = useState(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addingSubFor, setAddingSubFor] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [newCreds, setNewCreds] = useState(null);
  const [drawerTenantId, setDrawerTenantId] = useState(null);
  const [mlPipeline, setMlPipeline] = useState(null);
  const [changingCredsFor, setChangingCredsFor] = useState(null);
  const whitecapeUser = USERS_TABLE.find(u => !u.isEngineAdmin);
  const [erpConnections, setErpConnections] = useState(
    whitecapeUser ? { [whitecapeUser.id]: MOCK_API_RESPONSES.tenantConnections() } : {}
  );
  const [addErpFor, setAddErpFor] = useState(null);
  const [configErpConnId, setConfigErpConnId] = useState(null);
  const [configTemplates, setConfigTemplates] = useState({});
  const [apiTenants, setApiTenants] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  useStore();

  useEffect(() => {
    if (!isAdmin) return;
    setApiLoading(true);
    apiGet("/admin/tenants", { size: 100 })
      .then((res) => {
        const fetched = res?.content || [];
        if (fetched.length > 0) setApiTenants(fetched);
      })
      .catch(err => console.error("Failed to fetch tenants:", err))
      .finally(() => setApiLoading(false));
  }, [isAdmin]);

  if (!user) return null;
  const tenantList = apiTenants || [];
  const drawerTenant = drawerTenantId ? enrichTenant(tenantList.find(t => t.id === drawerTenantId)) : null;
  const drawerPipelines = drawerTenantId ? pipelinesForTenant(drawerTenantId) : [];
  const visibleTenants = (isAdmin
    ? tenantList.filter((t) => !t.parentId)
    : tenantList.filter((t) => t.id === user.tenantId)
  ).map(enrichTenant);

  const handleCreate = async (parentId, data) => {
    try {
      await apiPost("/admin/tenants", {
        name: data.name,
        username: data.username,
        password: data.password,
        color: data.color,
      });
      setNewCreds({ name: data.name, creds: { username: data.username, password: data.password } });
      if (parentId) setExpanded((p) => new Set(p).add(parentId));
      setShowAdd(false);
      setAddingSubFor(null);
      const res = await apiGet("/admin/tenants", { size: 100 });
      if (res?.content) setApiTenants(res.content);
      toast(`${parentId ? "Partenaire ERP" : "Tenant"} créé`, "success");
    } catch (e) {
      console.error("Failed to create tenant:", e);
      toast("Erreur lors de la création du tenant", "error");
    }
  };

  const handleEdit = async (id, data) => {
    try {
      await apiPut(`/admin/tenants/${id}`, {
        name: data.name,
        color: data.color,
        username: data.username,
        ...(data.password ? { password: data.password } : {}),
      });
      setEditingId(null);
      refresh();
      toast("Mis à jour", "success");
    } catch (e) {
      console.error("Failed to update tenant:", e);
      toast("Erreur lors de la mise à jour", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiDelete(`/admin/tenants/${id}`);
      setConfirmDel(null);
      refresh();
      toast("Supprimé", "warning");
    } catch (e) {
      console.error("Failed to delete tenant:", e);
      toast("Erreur lors de la suppression", "error");
    }
  };

  const handleChangeCredentials = async (id, data) => {
    try {
      await apiPut(`/admin/tenants/${id}`, {
        username: data.username,
        password: data.password,
      });
      setChangingCredsFor(null);
      toast("Credentials mis à jour", "success");
    } catch (e) {
      console.error("Failed to update credentials:", e);
      toast("Erreur lors de la mise à jour des credentials", "error");
    }
  };

  const fetchErpConnections = async (tenantId) => {
    try {
      const res = await apiGet("/admin/tenant-connections", { tenantId });
      if (res) setErpConnections(prev => ({ ...prev, [tenantId]: res }));
    } catch (e) {
      console.error("Failed to fetch ERP connections:", e);
    }
  };

  return (
    <div className="fade-up" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        eyebrow="Administration"
        title={isAdmin ? "Gestion des tenants" : "Mes partenaires ERP"}
        subtitle={`${visibleTenants.length} tenant${visibleTenants.length > 1 ? "s" : ""} · administration hiérarchique`}
        actions={isAdmin && visibleTenants.length > 0 && (
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); }}
            className="btn-primary"
          >
            ＋ Nouveau tenant
          </button>
        )}
      />

      {/* ── Add tenant form (slide-down) ────────────────────────────────── */}
      {showAdd && (
        <TenantForm
          title="Créer un nouveau tenant"
          parentId={null}
          onSave={(d) => handleCreate(null, d)}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleTenants.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(217,79,61,.08)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Building2 size={34} color={C.red} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.grey900, marginBottom: 8 }}>Aucun partenaire ERP</div>
            <div style={{ fontSize: 13, color: C.grey500, marginBottom: 20 }}>Vous n'avez pas encore créé de partenaire ERP.</div>
            {isAdmin && (
              <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-primary">
                ＋ Nouveau tenant
              </button>
            )}
          </div>
        )}

        {visibleTenants.map((tenant) => {
          const children = childTenants(tenant.id);
          const pipes = pipelinesForTenant(tenant.id);
          const isExpand = expanded.has(tenant.id);
          return (
            <div key={tenant.id} className="glass-card" style={{ padding: 20 }}>
              {editingId === tenant.id ? (
                <TenantForm
                  title={`Modifier ${tenant.name}`}
                  initial={tenant}
                  onSave={(d) => handleEdit(tenant.id, d)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() =>
                        setExpanded((p) => {
                          const n = new Set(p);
                          n.has(tenant.id) ? n.delete(tenant.id) : n.add(tenant.id);
                          return n;
                        })
                      }
                      className="btn-icon"
                      style={{ padding: 5 }}
                    >
                      <Icon name={isExpand ? "chevronDown" : "chevronRight"} size={14} color={C.grey500} />
                    </button>
                    <button
                      onClick={() => setDrawerTenantId(drawerTenantId === tenant.id ? null : tenant.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: tenant.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0,
                        boxShadow: drawerTenantId === tenant.id ? `0 0 0 3px ${tenant.color}44` : "none",
                        transition: "box-shadow .2s",
                      }}>
                        {tenant.logo}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 15,
                          color: drawerTenantId === tenant.id ? C.red : C.grey900,
                          transition: "color .15s",
                        }}>
                          {tenant.name}
                        </div>
                        <div style={{ fontSize: 9, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                          {tenant.plan} · {children.length} partenaire ERP{children.length > 1 ? "s" : ""} · <span style={{ color: C.info }}>voir pipelines</span>
                        </div>
                      </div>
                    </button>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, textAlign: "center" }}>
                      {[
                        [(tenant.invoiceCount || 0).toLocaleString("fr-FR"), "Factures", C.grey900],
                        [tenant.anomalyCount || 0, "Anomalies", C.red],
                        [pipes.length, "Pipelines", C.info],
                      ].map(([v, l, color]) => (
                        <div key={l}>
                          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color, letterSpacing: "-0.5px" }}>{v}</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button onClick={() => setEditingId(tenant.id)} className="btn-icon" style={{ padding: 5 }}>
                          <Icon name="edit" size={14} color={C.grey500} />
                        </button>
                        <button onClick={() => setConfirmDel(tenant.id)} className="btn-icon" style={{ padding: 5 }}>
                          <Icon name="trash" size={14} color={C.red} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isExpand && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.grey100}`, display: "flex", flexDirection: "column", gap: 14 }}>
                      <CredsPanel
                        tenantId={tenant.id}
                        onChangeCreds={() => setChangingCredsFor(tenant.id)}
                      />

                      {/* Change credentials inline */}
                      {changingCredsFor === tenant.id && (
                        <ChangeCredentialsForm
                          tenantId={tenant.id}
                          tenantName={tenant.name}
                          onSave={(data) => handleChangeCredentials(tenant.id, data)}
                          onCancel={() => setChangingCredsFor(null)}
                        />
                      )}

                      {/* Automation Toggle */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Automatisation des pipelines
                          </span>
                          <label style={{ position: "relative", display: "inline-block", width: 44, height: 24, cursor: "pointer" }}>
                            <input type="checkbox" checked={tenant.automationEnabled !== false}
                              onChange={async (e) => {
                                try {
                                  await apiPut(`/admin/tenants/${tenant.id}`, { automationEnabled: e.target.checked });
                                  toast("Automatisation " + (e.target.checked ? "activée" : "désactivée"), "info");
                                } catch (err) {
                                  toast("Erreur", "error");
                                }
                              }}
                              style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{
                              position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                              borderRadius: 24, transition: ".3s",
                              background: tenant.automationEnabled !== false ? "#22C55E" : "#D1D5DB",
                            }}>
                              <span style={{
                                position: "absolute", height: 18, width: 18, borderRadius: "50%",
                                left: tenant.automationEnabled !== false ? "24px" : "2px", bottom: "3px",
                                background: "#fff", transition: ".3s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                              }} />
                            </span>
                          </label>
                        </div>
                        <p style={{ fontSize: 10, color: C.grey400, marginTop: 4, lineHeight: 1.4 }}>
                          Si activé, les pipelines seront créés et configurés automatiquement à partir du schéma ERP déclaré.
                        </p>
                      </div>

                      {/* ERP Connections */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Connexions ERP ({erpConnections[tenant.id]?.length || 0})
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                          {(erpConnections[tenant.id] || []).map(conn => {
                            const templates = (() => {
                              try { return JSON.parse(conn.processedTemplatesJson || "[]"); } catch { return []; }
                            })();
                            const currentTemplates = configTemplates[conn.id] || templates;
                            return (
                              <div key={conn.id} style={{ borderRadius: 12, border: `1px solid ${conn.active ? "rgba(34,197,94,.15)" : C.grey100}`, background: conn.active ? "rgba(34,197,94,.04)" : "rgba(107,114,128,.04)", overflow: "hidden" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px" }}>
                                  <div style={{ width: 28, height: 28, borderRadius: 7, background: conn.connectorColor || "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{conn.connectorLogo || conn.connectorName?.[0] || "?"}</div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.grey900 }}>{conn.connectorName || "ERP"}</div>
                                    <div style={{ fontSize: 9, color: C.grey500 }}>{conn.connectorType} · ID: {conn.externalId} · {templates.length ? templates.join(", ") : "Aucun template sync"}</div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setConfigErpConnId(configErpConnId === conn.id ? null : conn.id);
                                      setConfigTemplates((prev) => ({ ...prev, [conn.id]: prev[conn.id] || templates }));
                                    }}
                                    className="btn-ghost"
                                    style={{ fontSize: 10, padding: "4px 9px" }}
                                  >
                                    Configurer
                                  </button>
                                  <label style={{ position: "relative", display: "inline-block", width: 36, height: 20, cursor: "pointer", flexShrink: 0 }}>
                                    <input type="checkbox" checked={conn.active !== false} onChange={async () => {
                                      try {
                                        await apiPut(`/admin/tenant-connections/${conn.id}`, { active: !conn.active });
                                        setErpConnections(prev => ({ ...prev, [tenant.id]: (prev[tenant.id] || []).map(x => x.id === conn.id ? { ...x, active: !conn.active } : x) }));
                                        toast(conn.active ? "Désactivé" : "Activé", "info");
                                      } catch (e) { toast("Erreur", "error"); }
                                    }} style={{ opacity: 0, width: 0, height: 0 }} />
                                    <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20, transition: ".3s", background: conn.active !== false ? "#22C55E" : "#D1D5DB" }}>
                                      <span style={{ position: "absolute", height: 16, width: 16, borderRadius: "50%", left: conn.active !== false ? "18px" : "2px", bottom: "2px", background: "#fff", transition: ".3s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                                    </span>
                                  </label>
                                  <button onClick={async () => {
                                    if (!confirm("Supprimer cette connexion ERP ?")) return;
                                    try {
                                      await apiDelete(`/admin/tenant-connections/${conn.id}`);
                                      setErpConnections(prev => ({ ...prev, [tenant.id]: (prev[tenant.id] || []).filter(x => x.id !== conn.id) }));
                                      toast("Connexion supprimée", "warning");
                                    } catch (e) { toast("Erreur", "error"); }
                                  }} className="btn-icon" style={{ padding: 3 }}>
                                    <Icon name="x" size={11} color={C.grey400} />
                                  </button>
                                </div>
                                {configErpConnId === conn.id && (
                                  <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.grey100}`, background: "rgba(255,255,255,.65)", display: "flex", flexDirection: "column", gap: 9 }}>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: C.grey500, textTransform: "uppercase", letterSpacing: ".07em" }}>Configuration de synchronisation</div>
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                      {["facture", "commande", "budget"].map((tpl) => {
                                        const checked = currentTemplates.includes(tpl);
                                        return (
                                          <button key={tpl} type="button" onClick={() => setConfigTemplates(prev => ({ ...prev, [conn.id]: checked ? currentTemplates.filter(x => x !== tpl) : [...currentTemplates, tpl] }))} style={{ border: `1.5px solid ${checked ? C.red : C.grey200}`, color: checked ? C.red : C.grey600, background: checked ? "rgba(217,79,61,.06)" : "#fff", borderRadius: 999, padding: "5px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>
                                            {tpl}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                      <button className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px" }} onClick={() => fetchErpConnections(tenant.id)}>
                                        Synchroniser
                                      </button>
                                      <button className="btn-primary" style={{ fontSize: 10, padding: "5px 12px" }} onClick={async () => {
                                        const nextJson = JSON.stringify(currentTemplates);
                                        await apiPut(`/admin/tenant-connections/${conn.id}`, { processedTemplatesJson: nextJson });
                                        setErpConnections(prev => ({ ...prev, [tenant.id]: (prev[tenant.id] || []).map(x => x.id === conn.id ? { ...x, processedTemplatesJson: nextJson } : x) }));
                                        toast("Configuration ERP sauvegardée", "success");
                                      }}>
                                        Sauvegarder
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setAddErpFor(addErpFor === tenant.id ? null : tenant.id)}
                          className="btn-ghost"
                          style={{ fontSize: 10, padding: "6px 12px", width: "100%", justifyContent: "center", gap: 6, borderStyle: addErpFor === tenant.id ? "solid" : "dashed", background: addErpFor === tenant.id ? "rgba(217,79,61,.06)" : undefined, color: addErpFor === tenant.id ? C.red : undefined }}
                        >
                          <span style={{ fontSize: 13 }}>{addErpFor === tenant.id ? "−" : "+"}</span>
                          {addErpFor === tenant.id ? "Fermer" : "Lier un ERP"}
                        </button>
                        {addErpFor === tenant.id && (
                          <div className="fade-in" style={{ marginTop: 8 }}>
                            <ErpConnectInline
                              tenantId={tenant.id}
                              existingConnections={erpConnections[tenant.id] || []}
                              onCancel={() => setAddErpFor(null)}
                              onDone={() => {
                                fetchErpConnections(tenant.id);
                                setAddErpFor(null);
                              }}
                              toast={toast}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Partenaires ERP ({children.length})
                          </span>
                          <button onClick={() => setAddingSubFor(tenant.id)} className="btn-ghost" style={{ fontSize: 11, padding: "3px 10px" }}>
                            ＋ Ajouter
                          </button>
                        </div>
                        {addingSubFor === tenant.id && (
                          <div style={{ marginBottom: 10 }}>
                            <ErpConnectionForm
                              tenantId={tenant.id}
                              onCancel={() => setAddingSubFor(null)}
                              onDone={() => { setAddingSubFor(null); refresh(); }}
                            />
                          </div>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {children.map((sub) => (
                            <div key={sub.id}>
                              {editingId === sub.id ? (
                                <TenantForm
                                  title={`Modifier ${sub.name}`}
                                  initial={sub}
                                  onSave={(d) => handleEdit(sub.id, d)}
                                  onCancel={() => setEditingId(null)}
                                />
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(107,114,128,.04)" }} className="group">
                                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${sub.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: sub.color }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.grey900 }}>{sub.name}</div>
                                    <div style={{ fontSize: 9, color: C.grey500 }}>{sub.plan}</div>
                                  </div>
                                  <div style={{ display: "flex", gap: 6, fontSize: 10, color: C.grey500, alignItems: "center" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                      <Icon name="fileText" size={11} color={C.grey400} />
                                      {sub.invoiceCount || 0}
                                    </span>
                                    <span style={{ color: C.warning, display: "flex", alignItems: "center", gap: 3 }}>
                                      <Icon name="triangle" size={11} color={C.warning} />
                                      {sub.anomalyCount || 0}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                      <Icon name="pipelines" size={11} color={C.grey400} />
                                      {pipelinesForTenant(sub.id).length}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button onClick={() => setEditingId(sub.id)} className="btn-icon" style={{ padding: 4 }}>
                                      <Icon name="edit" size={13} color={C.grey500} />
                                    </button>
                                    <button onClick={() => setConfirmDel(sub.id)} className="btn-icon" style={{ padding: 4 }}>
                                      <Icon name="trash" size={13} color={C.red} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {children.length === 0 && (
                            <div style={{ fontSize: 11, textAlign: "center", padding: 10, color: C.grey400 }}>
                              Aucun partenaire ERP
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Tenant pipeline drawer ─────────────────────────────────────── */}
      {drawerTenant && (
        <div className="scale-in" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,0.88)", borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,.10)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${C.grey100}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: drawerTenant.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {drawerTenant.logo}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.grey900 }}>{drawerTenant.name}</div>
              <div style={{ fontSize: 11, color: C.grey500, marginTop: 1 }}>
                {drawerPipelines.length} pipeline{drawerPipelines.length !== 1 ? "s" : ""} · {drawerTenant.plan}
              </div>
            </div>
            <button onClick={() => setDrawerTenantId(null)} className="btn-icon" style={{ padding: 6 }}>
              <Icon name="x" size={15} color={C.grey500} />
            </button>
          </div>
          <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
            {drawerPipelines.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.grey400, fontSize: 13 }}>
                Aucun pipeline pour ce tenant
              </div>
            )}
            {drawerPipelines.map((p) => {
              const statusColor = p.status === "actif" ? C.success : p.status === "warning" ? C.warning : C.grey400;
              const statusBg = p.status === "actif" ? "rgba(34,197,94,.1)" : p.status === "warning" ? "rgba(245,158,11,.1)" : "rgba(107,114,128,.08)";
              const statusBorder = p.status === "actif" ? "rgba(34,197,94,.3)" : p.status === "warning" ? "rgba(245,158,11,.3)" : "rgba(107,114,128,.2)";
              const statusLabel = p.status === "actif" ? "Actif" : p.status === "warning" ? "Alerte" : "En pause";
              const statusIcon = p.status === "actif" ? "check" : p.status === "warning" ? "triangle" : "pauseCircle";
              const anomalyPct = (p.anomalyRate * 100).toFixed(1);
              const lastRun = p.lastRun ? new Date(p.lastRun).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
              return (
                <div key={p.id} className="card-hover" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.grey100}`, background: "rgba(255,255,255,.7)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(217,79,61,.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon name="pipelines" size={16} color={C.red} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: C.grey500, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
                        {p.connector}
                      </span>
                      <span>·</span>
                      <span>{p.freq}</span>
                      <span>·</span>
                      <span>Dernier run : {lastRun}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900, fontFamily: "'Instrument Serif',serif" }}>{p.invoicesProcessed.toLocaleString("fr-FR")}</div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: C.grey400, textTransform: "uppercase", letterSpacing: "0.06em" }}>Factures</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: parseFloat(anomalyPct) > 2 ? C.red : C.success, fontFamily: "'Instrument Serif',serif" }}>{anomalyPct}%</div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: C.grey400, textTransform: "uppercase", letterSpacing: "0.06em" }}>Anomalies</div>
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: statusBg, color: statusColor, border: `1px solid ${statusBorder}`, flexShrink: 0, whiteSpace: "nowrap" }}>
                    <Icon name={statusIcon} size={10} color={statusColor} />
                    {statusLabel}
                  </span>
                  <button onClick={() => setMlPipeline(p)} className="btn-ghost" style={{ fontSize: 11, padding: "5px 12px", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name="sparkle" size={12} color={C.grey600} />
                    Ouvrir
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Delete confirm ─────────────────────────────────────────────── */}
      {confirmDel && (
        <div className="modal-overlay">
          <div className="modal-bg" onClick={() => setConfirmDel(null)} />
          <div className="modal-box scale-in" style={{ maxWidth: 380 }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.grey900, marginBottom: 8 }}>Supprimer ce tenant ?</div>
              <p style={{ fontSize: 12, color: C.grey500, marginBottom: 16 }}>Cette action est irréversible.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setConfirmDel(null)} className="btn-ghost">Annuler</button>
                <button onClick={() => handleDelete(confirmDel)} className="btn-primary">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal open={!!newCreds} onClose={() => setNewCreds(null)} size="440px" title={newCreds ? `Credentials — ${newCreds.name}` : ""}>
        {newCreds && <CredsMView creds={newCreds.creds} onClose={() => setNewCreds(null)} />}
      </Modal>

      <Modal open={!!mlPipeline} onClose={() => setMlPipeline(null)} size="1280px" title={mlPipeline ? `Analyse ML — ${mlPipeline.name}` : ""} subtitle="Vue analytics complète · Tendances · Anomalies · Séries · Radar · Scores · Insights IA"
        icon={
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${C.red},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(217,79,61,.3)" }}>
            <Icon name="sparkle" size={18} color="#fff" />
          </div>
        }
      >
        {mlPipeline && <MLContent pipeline={mlPipeline} />}
      </Modal>
    </div>
  );
}

// ── CredsMView ─────────────────────────────────────────────────────────────────
export function CredsMView({ creds, onClose }) {
  const [copied, setCopied] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const copy = (val, k) => {
    navigator.clipboard.writeText(val).catch(() => { });
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(245,158,11,.08)", borderRadius: 10, border: `1px solid rgba(245,158,11,.2)`, marginBottom: 16 }}>
        <span style={{ display: "flex" }}><Icon name="triangle" size={14} color={C.warning} /></span>
        <p style={{ fontSize: 11, color: C.warning }}>Sauvegardez maintenant — le mot de passe ne sera plus affiché</p>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ ...labelStyle, marginBottom: 5 }}>Nom d'utilisateur</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "8px 10px", background: "rgba(107,114,128,.06)" }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.grey900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {creds.username ?? creds.accessKey ?? "—"}
          </span>
          <button onClick={() => copy(creds.username ?? creds.accessKey ?? "", "usr")} className="btn-icon" style={{ padding: 4 }}>
            {copied === "usr" ? <Icon name="check" size={13} color={C.success} /> : <Icon name="copy" size={13} color={C.grey500} />}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ ...labelStyle, marginBottom: 5 }}>Mot de passe</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "8px 10px", background: "rgba(107,114,128,.06)" }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.grey900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {showPassword ? (creds.password ?? creds.apiSecret ?? "—") : "••••••••••••••••••••••••"}
          </span>
          <button onClick={() => setShowPassword((s) => !s)} className="btn-icon" style={{ padding: 4 }}>
            <Icon name={showPassword ? "eyeOff" : "eye"} size={13} color={C.grey500} />
          </button>
          <button onClick={() => copy(creds.password ?? creds.apiSecret ?? "", "pwd")} className="btn-icon" style={{ padding: 4 }}>
            {copied === "pwd" ? <Icon name="check" size={13} color={C.success} /> : <Icon name="copy" size={13} color={C.grey500} />}
          </button>
        </div>
      </div>
      <button onClick={onClose} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
        <Icon name="check" size={13} color="#fff" /> J'ai sauvegardé les credentials
      </button>
    </div>
  );
}

// ── CredsPanel ─────────────────────────────────────────────────────────────────
export function CredsPanel({ tenantId, onChangeCreds }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(null);
  const creds = getTenantCredentials(tenantId);
  if (!creds) return null;

  const copy = (val, k) => {
    navigator.clipboard.writeText(val).catch(() => { });
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div style={{ borderRadius: 12, border: `1px solid rgba(107,114,128,.1)`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "rgba(107,114,128,.03)" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name="key" size={11} color={C.grey500} /> Credentials
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {onChangeCreds && (
            <button
              onClick={onChangeCreds}
              style={{ fontSize: 10, color: C.red, background: "rgba(217,79,61,.06)", border: `1px solid rgba(217,79,61,.18)`, borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
            >
              <Icon name="refresh" size={10} color={C.red} />
              Modifier
            </button>
          )}
          <button
            onClick={() => setShow((s) => !s)}
            style={{ fontSize: 10, color: C.grey500, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <Icon name={show ? "eyeOff" : "eye"} size={12} color={C.grey500} />
            {show ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      {show && (
        <div className="fade-in" style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 7, padding: "5px 8px", background: "rgba(107,114,128,.05)" }}>
            <span style={{ fontSize: 9, color: C.grey500, width: 70, flexShrink: 0 }}>Utilisateur</span>
            <span style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {creds.username}
            </span>
            <button onClick={() => copy(creds.username, "usr")} style={{ background: "none", border: "none", cursor: "pointer", color: C.grey400 }}>
              {copied === "usr" ? <Icon name="check" size={11} color={C.success} /> : <Icon name="copy" size={11} color={C.grey400} />}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 7, padding: "5px 8px", background: "rgba(107,114,128,.05)" }}>
            <span style={{ fontSize: 9, color: C.grey500, width: 70, flexShrink: 0 }}>Mot de passe</span>
            <span style={{ flex: 1, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: C.grey400, fontStyle: "italic" }}>
              Défini à la création · irrécupérable
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ChangeCredentialsForm ──────────────────────────────────────────────────────
export function ChangeCredentialsForm({ tenantId, tenantName, onSave, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(_generatePassword());
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm

  const passwordMatch = password === confirmPassword || confirmPassword === "";
  const passwordStrong = password.length >= 8;
  const valid = username.trim().length >= 2 && password.length >= 8 && password === confirmPassword;

  const strengthScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"][strengthScore] || "";
  const strengthColor = ["", C.red, C.red, C.warning, C.success, C.success][strengthScore] || C.grey300;

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await onSave({ username: username.trim(), password });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fade-in"
      style={{
        borderRadius: 14,
        border: `1.5px solid rgba(217,79,61,.2)`,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        background: "linear-gradient(135deg, rgba(217,79,61,.07), rgba(217,79,61,.02))",
        borderBottom: `1px solid rgba(217,79,61,.12)`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "rgba(217,79,61,.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="key" size={14} color={C.red} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.grey900 }}>Modifier les credentials</div>
          <div style={{ fontSize: 10, color: C.grey500 }}>{tenantName}</div>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
          <Icon name="x" size={13} color={C.grey400} />
        </button>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Warning */}
        <div style={{ display: "flex", gap: 8, padding: "9px 11px", borderRadius: 9, background: "rgba(245,158,11,.07)", border: "1px solid rgba(245,158,11,.2)" }}>
          <Icon name="triangle" size={13} color={C.warning} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 10, color: "#92660a", lineHeight: 1.5, margin: 0 }}>
            Les credentials actuels seront immédiatement invalidés. Assurez-vous que les intégrations utilisant ce tenant sont prêtes.
          </p>
        </div>

        {/* Username */}
        <div>
          <div style={labelStyle}>
            <Icon name="user" size={10} color={C.grey400} />
            Nouveau nom d'utilisateur <span style={{ color: C.red }}>*</span>
          </div>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            placeholder="ex: tenant_admin"
            autoComplete="off"
            autoFocus
          />
          {username.trim().length > 0 && username.trim().length < 2 && (
            <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>Minimum 2 caractères</div>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
            <div style={labelStyle}>
              <Icon name="lock" size={10} color={C.grey400} />
              Nouveau mot de passe <span style={{ color: C.red }}>*</span>
            </div>
            <button
              onClick={() => setPassword(_generatePassword())}
              style={{ fontSize: 9, color: C.info, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 700, padding: 0 }}
            >
              <Icon name="refresh" size={10} color={C.info} />
              Générer
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", paddingRight: 36 }}
              placeholder="Mot de passe sécurisé…"
              autoComplete="new-password"
            />
            <button
              onClick={() => setShowPassword(s => !s)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} size={13} color={C.grey400} />
            </button>
          </div>
          {/* Strength bar */}
          {password.length > 0 && (
            <div className="fade-in" style={{ marginTop: 6 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strengthScore ? strengthColor : "rgba(107,114,128,.15)", transition: "background .2s" }} />
                ))}
              </div>
              <div style={{ fontSize: 9, color: strengthColor, fontWeight: 700 }}>{strengthLabel}</div>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <div style={labelStyle}>
            <Icon name="lock" size={10} color={C.grey400} />
            Confirmer le mot de passe <span style={{ color: C.red }}>*</span>
          </div>
          <input
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            type="password"
            style={{
              ...inputStyle,
              fontFamily: "'JetBrains Mono', monospace",
              borderColor: confirmPassword.length > 0 && !passwordMatch ? C.red : confirmPassword.length > 0 && passwordMatch ? C.success : "rgba(107,114,128,.18)",
            }}
            placeholder="Répétez le mot de passe…"
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && !passwordMatch && (
            <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
          )}
          {confirmPassword.length > 0 && passwordMatch && (
            <div style={{ fontSize: 9, color: C.success, marginTop: 4, display: "flex", alignItems: "center", gap: 3 }}>
              <Icon name="check" size={10} color={C.success} /> Mots de passe identiques
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 2 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 11, padding: "7px 14px" }}>Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={!valid || saving}
            className="btn-primary"
            style={{ fontSize: 11, padding: "7px 16px", display: "flex", alignItems: "center", gap: 6, opacity: !valid ? 0.5 : 1 }}
          >
            {saving ? (
              <><Icon name="refresh" size={11} color="#fff" /> Mise à jour…</>
            ) : (
              <><Icon name="check" size={11} color="#fff" /> Mettre à jour</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ErpConnectInline ─────────────────────────────────────────────────────────────
function ErpConnectInline({ tenantId, existingConnections = [], onCancel, onDone, toast }) {
  const [connectors, setConnectors] = useState([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [erpTenantSearch, setErpTenantSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedConn = connectors.find(c => c.id === selectedConnectorId);
  const isAlreadyLinked = useCallback(
    (connectorId, erpTenantId) => existingConnections.some((c) => c.connectorId === connectorId && c.externalId === erpTenantId),
    [existingConnections]
  );
  const erpTenantOptions = useMemo(() => {
    const raw = selectedConn?.tenants || selectedConn?.tenantIds || selectedConn?.availableTenants || [];
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return raw.split(",").map((id) => ({ id: id.trim(), label: id.trim(), active: true })).filter((x) => x.id); }
    }
    return Array.isArray(raw)
      ? raw.map((t) => typeof t === "string" ? { id: t, label: t, active: true } : { id: t.id || t.externalId || t.tenantId || t.label, label: t.label || t.name || t.id || t.externalId || t.tenantId, active: t.active !== false })
        .filter((t) => t.id)
      : [];
  }, [selectedConn]);
  const filteredErpTenantOptions = useMemo(() => {
    const q = erpTenantSearch.trim().toLowerCase();
    if (!q) return erpTenantOptions;
    return erpTenantOptions.filter((t) => `${t.label || ""} ${t.id || ""}`.toLowerCase().includes(q));
  }, [erpTenantOptions, erpTenantSearch]);
  const selectedErpTenant = erpTenantOptions.find((t) => t.id === externalId);
  const selectedAlreadyLinked = !!selectedConnectorId && !!externalId && isAlreadyLinked(selectedConnectorId, externalId);
  const canLinkSelectedTenant = !!selectedConnectorId && !!externalId && !!selectedErpTenant && selectedErpTenant.active !== false && !selectedAlreadyLinked;

  useEffect(() => {
    apiGet("/admin/connectors", { size: 100 })
      .then(res => setConnectors(res?.content || []))
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    if (!canLinkSelectedTenant) return;
    setSaving(true);
    try {
      await apiPost("/admin/tenant-connections", {
        tenantId,
        connectorId: selectedConnectorId,
        externalId: externalId.trim(),
        notes: notes.trim() || undefined,
      });
      toast("Connexion ERP créée", "success");
      onDone();
    } catch (e) {
      console.error("Failed:", e);
      toast(e.response?.data?.message || "Erreur", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ borderRadius: 14, border: `1.5px solid rgba(217,79,61,.18)`, background: "rgba(255,255,255,.85)", backdropFilter: "blur(10px)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: "linear-gradient(135deg, rgba(217,79,61,.07), rgba(217,79,61,.02))", borderBottom: `1px solid rgba(217,79,61,.12)`, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(217,79,61,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
          <Link2 size={13} color={C.red} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.grey900 }}>Lier un connecteur ERP</div>
          <div style={{ fontSize: 9, color: C.grey500 }}>Sélectionnez un ERP puis un tenant déclaré par cet ERP</div>
        </div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", lineHeight: 1 }}>
          <Icon name="x" size={13} color={C.grey400} />
        </button>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {connectors.length > 0 ? (
          <div>
            <label style={{ ...labelStyle, marginBottom: 6 }}>
              Connecteurs ERP disponibles <span style={{ color: C.red }}>*</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {connectors.map(conn => {
                const isSelected = selectedConnectorId === conn.id;
                const tenants = Array.isArray(conn.tenants) ? conn.tenants : [];
                const normalizedTenants = tenants.map((t) => typeof t === "string" ? { id: t, active: true } : { id: t.id || t.externalId || t.tenantId || t.label, active: t.active !== false }).filter((t) => t.id);
                const activeCount = normalizedTenants.filter((t) => t.active !== false).length;
                const remainingCount = normalizedTenants.filter((t) => t.active !== false && !isAlreadyLinked(conn.id, t.id)).length;
                const allActiveLinked = activeCount > 0 && remainingCount === 0;
                const noActiveTenant = activeCount === 0;
                const statusLabel = conn.availabilityStatus || (conn.status === "factures.status" ? "ACTIVE" : conn.status) || "ACTIVE";
                return (
                  <div
                    key={conn.id}
                    onClick={() => { if (!allActiveLinked) { setSelectedConnectorId(conn.id); setExternalId(""); setErpTenantSearch(""); } }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, cursor: allActiveLinked ? "not-allowed" : "pointer", border: `1.5px solid ${isSelected ? "#D94F3D" : C.grey100}`, background: isSelected ? "rgba(217,79,61,.06)" : "rgba(107,114,128,.02)", transition: "all .15s", opacity: allActiveLinked ? 0.62 : 1 }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: conn.color ? `linear-gradient(135deg, ${conn.color}, ${conn.color}bb)` : "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{conn.logo || conn.name?.[0] || "?"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isSelected ? C.red : C.grey900 }}>{conn.name}</div>
                      <div style={{ fontSize: 9, color: C.grey500 }}>{conn.connectorType || conn.type || "ERP"} · {conn.authType} · {activeCount}/{tenants.length} tenants ERP actifs · {remainingCount} à lier</div>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: allActiveLinked ? C.grey500 : noActiveTenant ? C.warning : statusLabel === "ACTIVE" || statusLabel === "available" || statusLabel === "connected" ? C.success : C.warning, background: allActiveLinked ? "rgba(107,114,128,.08)" : noActiveTenant ? "rgba(245,158,11,.08)" : statusLabel === "ACTIVE" || statusLabel === "available" || statusLabel === "connected" ? "rgba(34,197,94,.08)" : "rgba(245,158,11,.08)", borderRadius: 999, padding: "2px 7px" }}>
                      {allActiveLinked ? "Déjà lié" : noActiveTenant ? "ERP requis" : statusLabel}
                    </span>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${isSelected ? "#D94F3D" : C.grey200}`, background: isSelected ? "#D94F3D" : "transparent", flexShrink: 0, transition: "all .15s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: "center", fontSize: 11, color: C.grey400, background: "rgba(107,114,128,.04)", borderRadius: 10 }}>
            Aucun connecteur ERP disponible.<br />
            <span style={{ fontSize: 10 }}>Créez d'abord un connecteur dans Intégrations.</span>
          </div>
        )}

        {selectedConn && (
          <div>
            <label style={{ ...labelStyle, marginBottom: 6 }}>
              Rechercher tenant ERP par nom <span style={{ color: C.red }}>*</span>
            </label>
            <input
              value={erpTenantSearch}
              onChange={e => {
                const next = e.target.value;
                setErpTenantSearch(next);
                const exact = erpTenantOptions.find(t => (t.label || "").toLowerCase() === next.trim().toLowerCase() || t.id.toLowerCase() === next.trim().toLowerCase());
                setExternalId(exact ? exact.id : "");
              }}
              className="input-field"
              style={{ fontSize: 12, marginBottom: 8 }}
              placeholder="Tapez le nom du tenant ERP, ex: whitecape ask"
            />
            {erpTenantOptions.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {filteredErpTenantOptions.map((t) => {
                  const selected = externalId === t.id;
                  const linkable = t.active !== false;
                  const alreadyLinked = isAlreadyLinked(selectedConnectorId, t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { if (!alreadyLinked) { setExternalId(t.id); setErpTenantSearch(t.label || t.id); } }}
                      disabled={alreadyLinked}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${alreadyLinked ? C.grey200 : selected ? (linkable ? C.success : C.warning) : C.grey100}`, background: alreadyLinked ? "rgba(107,114,128,.04)" : selected ? (linkable ? "rgba(34,197,94,.06)" : "rgba(245,158,11,.06)") : "rgba(107,114,128,.02)", cursor: alreadyLinked ? "not-allowed" : "pointer", opacity: alreadyLinked ? 0.62 : 1, textAlign: "left", fontFamily: "inherit" }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: alreadyLinked ? C.grey400 : linkable ? C.success : C.warning, flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: C.grey900 }}>{t.label}</span>
                        <span style={{ display: "block", fontSize: 9, color: C.grey500, fontFamily: "'JetBrains Mono',monospace" }}>ERP tenant ID: {t.id}</span>
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: alreadyLinked ? C.grey500 : linkable ? C.success : C.warning, background: alreadyLinked ? "rgba(107,114,128,.08)" : linkable ? "rgba(34,197,94,.08)" : "rgba(245,158,11,.08)", borderRadius: 999, padding: "2px 7px" }}>
                        {alreadyLinked ? "Déjà lié" : linkable ? "Liable" : "ERP requis"}
                      </span>
                    </button>
                  );
                })}
                {filteredErpTenantOptions.length === 0 && (
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(107,114,128,.04)", color: C.grey500, fontSize: 11, lineHeight: 1.5 }}>
                    Aucun tenant ERP ne correspond à cette recherche. Essayez le nom affiché dans l'ERP ou son identifiant externe.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 12, borderRadius: 10, background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", color: C.warning, fontSize: 11, lineHeight: 1.5 }}>
                Cet ERP n'a déclaré aucun tenant ID. Demandez à l'ERP d'ajouter le tenant dans sa liste avant de le lier.
              </div>
            )}
            {selectedConn && externalId && !canLinkSelectedTenant && (
              <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 10, background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", color: C.warning, fontSize: 10, lineHeight: 1.5 }}>
                Ce tenant ERP n'est pas actif côté ERP. Demandez à l'ERP de l'activer avant de le lier à ce tenant AnomalyIQ.
              </div>
            )}
          </div>
        )}

        <div>
          <label style={{ ...labelStyle, marginBottom: 5 }}>
            Tenant ERP sélectionné <span style={{ color: C.red }}>*</span>
          </label>
          <div style={{ minHeight: 38, padding: "9px 12px", borderRadius: 10, border: `1.5px solid rgba(107,114,128,.18)`, background: "rgba(107,114,128,.04)", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
            {selectedErpTenant ? (
              <>
                <span style={{ fontWeight: 800, color: C.grey900 }}>{selectedErpTenant.label}</span>
                <span className="mono" style={{ color: C.grey500 }}>ID: {selectedErpTenant.id}</span>
              </>
            ) : (
              <span style={{ color: C.grey400 }}>{selectedConn ? "Recherchez puis choisissez un tenant ERP" : "Sélectionnez d'abord un ERP"}</span>
            )}
          </div>
        </div>

        <div>
          <label style={{ ...labelStyle, marginBottom: 5 }}>
            Notes <span style={{ color: C.grey400, fontWeight: 400, fontSize: 9 }}>(optionnel)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field"
            style={{ fontSize: 11, minHeight: 48, resize: "none" }}
            placeholder="Informations supplémentaires…"
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 2 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }}>Annuler</button>
          <button
            onClick={handleSave}
            disabled={!canLinkSelectedTenant || saving}
            className="btn-primary"
            style={{ fontSize: 11, padding: "6px 14px", gap: 6 }}
          >
            {saving ? <><Icon name="refresh" size={11} color="#fff" /> Connexion…</> : <><Icon name="integrations" size={11} color="#fff" /> Lier ce tenant</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ErpConnectionForm ────────────────────────────────────────────────────────────
export function ErpConnectionForm({ tenantId, onCancel, onDone }) {
  const [connectors, setConnectors] = useState([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet("/admin/connectors", { size: 100 })
      .then(res => setConnectors(res?.content || []))
      .catch(() => { });
  }, []);

  const handleSave = async () => {
    if (!selectedConnectorId || !externalId.trim()) return;
    setSaving(true);
    try {
      await apiPost(`/tenants/${tenantId}/erp-connections`, {
        connectorId: selectedConnectorId,
        externalId: externalId.trim(),
      });
      onDone();
    } catch (e) {
      console.error("Failed to create ERP connection:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card-solid fade-in" style={{ padding: 20, borderColor: "rgba(217,79,61,.15)", marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: C.grey900 }}>Connecter un ERP</h4>
        <button onClick={onCancel} className="btn-icon" style={{ padding: 4 }}>
          <Icon name="x" size={14} color={C.grey500} />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={{ ...labelStyle, marginBottom: 5 }}>
            Connecteur ERP <span style={{ color: C.red }}>*</span>
          </label>
          <select value={selectedConnectorId} onChange={e => setSelectedConnectorId(e.target.value)} className="input-field" style={{ height: 36, fontSize: 12 }}>
            <option value="">Sélectionner un connecteur…</option>
            {connectors.filter(c => c.status === "ACTIVE" || c.status === "available").map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: 5 }}>
            Identifiant externe (External ID) <span style={{ color: C.red }}>*</span>
          </label>
          <input value={externalId} onChange={e => setExternalId(e.target.value)} className="input-field" style={{ fontSize: 12 }} placeholder="ex: whitecape_sage" />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 12 }}>Annuler</button>
          <button onClick={handleSave} disabled={!selectedConnectorId || !externalId.trim() || saving} className="btn-primary" style={{ fontSize: 12 }}>
            {saving ? "Connexion…" : "Connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Password generator ─────────────────────────────────────────────────────────
function _generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@$!%*?&";
  const all = upper + lower + digits + special;
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let pwd = pick(upper) + pick(lower) + pick(digits) + pick(special);
  for (let i = 0; i < 8; i++) pwd += pick(all);
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

// ── TenantForm ─────────────────────────────────────────────────────────────────
export function TenantForm({ initial, parentId, onSave, onCancel, title }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [color, setColor] = useState(initial?.color ?? COLORS_PALETTE[0]);
  const [plan, setPlan] = useState(initial?.plan ?? "Pro");
  const [storage, setStorage] = useState(initial?.storage ?? "shared");
  const [step, setStep] = useState(1);
  const isEdit = !!initial?.id;

  const [currentPassword, setCurrentPassword] = useState(isEdit ? "" : _generatePassword());
  const regenerate = () => setCurrentPassword(_generatePassword());
  const suggestedUsername = name.trim().replace(/[^a-zA-Z0-9_]/g, "_").replace(/_+/g, "_").toLowerCase();
  const passwordStrong = currentPassword.length >= 12 && /[A-Z]/.test(currentPassword) && /[a-z]/.test(currentPassword) && /[0-9]/.test(currentPassword) && /[^A-Za-z0-9]/.test(currentPassword);
  const passwordScore = [
    currentPassword.length >= 8,
    currentPassword.length >= 12,
    /[A-Z]/.test(currentPassword),
    /[a-z]/.test(currentPassword),
    /[0-9]/.test(currentPassword),
    /[^A-Za-z0-9]/.test(currentPassword),
  ].filter(Boolean).length;
  const passwordStrength =
    passwordScore >= 6
      ? { label: "Fort", color: C.success, pct: 100 }
      : passwordScore >= 4
      ? { label: "Correct", color: C.warning, pct: 68 }
      : { label: "Faible", color: C.red, pct: Math.max(18, passwordScore * 14) };
  const passwordHint = passwordStrong
    ? "Robuste : longueur, majuscules, minuscules, chiffres et symbole inclus."
    : "Conseillé : 12 caractères avec majuscule, minuscule, chiffre et symbole.";

  const valid = isEdit
    ? name.trim().length >= 2 && username.trim().length >= 2 && (!currentPassword || currentPassword.length >= 8)
    : name.trim().length >= 2 && username.trim().length >= 2 && currentPassword.length >= 8;

  const totalSteps = isEdit ? 1 : 2;

  // Color name map for display
  const colorNames = {
    "#D94F3D": "Rouge",
    "#3B82F6": "Bleu",
    "#10B981": "Vert",
    "#F59E0B": "Ambre",
    "#8B5CF6": "Violet",
    "#06B6D4": "Cyan",
    "#F97316": "Orange",
    "#EC4899": "Rose",
    "#84CC16": "Lime",
    "#14B8A6": "Teal",
  };

  return (
    <div
      className="fade-in"
      style={{
        borderRadius: 16,
        border: `1px solid rgba(217,79,61,.14)`,
        background: "rgba(255,255,255,.95)",
        backdropFilter: "blur(16px)",
        overflow: "hidden",
        boxShadow: "0 14px 38px rgba(15,23,42,.08)",
      }}
    >
      {/* ── Top bar ── */}
      <div style={{
        padding: "14px 20px",
        background: "linear-gradient(135deg, rgba(255,255,255,.96) 0%, rgba(217,79,61,.035) 100%)",
        borderBottom: `1px solid rgba(107,114,128,.12)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${color}, ${softColor(color, "CC")})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#fff",
          transition: "background .2s",
          flexShrink: 0,
        }}>
          {name ? name.slice(0, 2).toUpperCase() : isEdit ? <Icon name="edit" size={15} color="#fff" /> : <Plus size={15} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>{title}</div>
          {!isEdit && (
            <div style={{ fontSize: 10, color: C.grey400, marginTop: 1 }}>
              Étape {step} sur {totalSteps} · {step === 1 ? "Identité & configuration" : "Credentials d'accès"}
            </div>
          )}
        </div>
        {/* Step pills */}
        {!isEdit && (
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ width: s === step ? 20 : 6, height: 6, borderRadius: 99, background: s === step ? C.red : s < step ? C.success : "rgba(107,114,128,.2)", transition: "all .3s" }} />
            ))}
          </div>
        )}
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", padding: 5, display: "flex", borderRadius: 8, transition: "background .15s" }}>
          <Icon name="x" size={14} color={C.grey400} />
        </button>
      </div>

      <div style={{ padding: "20px 20px" }}>
        {/* ── STEP 1: Identity ── */}
        {(step === 1 || isEdit) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name */}
            <div>
              <div style={labelStyle}>
                <span style={{ fontSize: 10, color: C.grey400, fontWeight: 700 }}>#</span>
                NOM <span style={{ color: C.red }}>*</span>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Nom de l'entité…"
                autoFocus={!isEdit}
              />
            </div>

            {/* Color picker — redesigned */}
            <div>
              <div style={labelStyle}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.47-1.125-.29-.29-.47-.688-.47-1.125 0-.94.748-1.688 1.688-1.688h1.996c3.051 0 5.555-2.504 5.555-5.555 0-4.97-4.47-9-10-9z" /></svg>
                COULEUR D'IDENTITÉ
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {COLORS_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    title={colorNames[c]}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `linear-gradient(135deg, ${softColor(c, "28")}, ${softColor(c, "70")})`,
                      border: color === c ? `1.5px solid ${c}` : `1px solid ${softColor(c, "40")}`,
                      cursor: "pointer",
                      outline: "none",
                      transform: color === c ? "translateY(-1px)" : "none",
                      transition: "all .15s",
                      position: "relative",
                      boxShadow: color === c ? `0 8px 18px ${softColor(c, "26")}` : "none",
                    }}
                  >
                  </button>
                ))}
              </div>
            </div>

            {/* Storage — only for top-level tenants on create */}
            {!parentId && !isEdit && (
              <div>
                <div style={labelStyle}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
                  STOCKAGE DES DONNÉES
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    {
                      id: "shared",
                      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>,
                      label: "Base partagée",
                      desc: "Multi-tenant logique. Plus rapide à provisionner.",
                      badge: "RECOMMANDÉ",
                      badgeColor: C.red,
                      badgeBg: "rgba(217,79,61,.1)",
                    },
                    {
                      id: "dedicated",
                      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
                      label: "Base dédiée",
                      desc: "Isolation physique. Conformité maximale.",
                      badge: "ENTERPRISE",
                      badgeColor: "#7C3AED",
                      badgeBg: "rgba(124,58,237,.1)",
                    },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setStorage(opt.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        textAlign: "left",
                        cursor: "pointer",
                        border: `1px solid ${storage === opt.id ? softColor(color, "66") : "rgba(107,114,128,.14)"}`,
                        background: storage === opt.id ? softColor(color, "0B") : "rgba(255,255,255,.72)",
                        transition: "all .15s",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        boxShadow: storage === opt.id ? `0 10px 24px ${softColor(color, "12")}` : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: storage === opt.id ? softColor(color, "14") : "rgba(107,114,128,.06)", color: storage === opt.id ? color : C.grey500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {opt.icon}
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: opt.badgeBg, color: opt.badgeColor, letterSpacing: "0.06em" }}>
                          {opt.badge}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: storage === opt.id ? color : C.grey900, marginBottom: 3 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: C.grey500, lineHeight: 1.4 }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions for edit mode */}
            {isEdit && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,.85fr) minmax(320px,1.15fr)", gap: 14, alignItems: "start" }}>
                  <div>
                    <div style={labelStyle}>
                      <Icon name="key" size={10} color={C.grey400} />
                      NOM D'UTILISATEUR <span style={{ color: C.red }}>*</span>
                    </div>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase())}
                      style={inputStyle}
                      placeholder="tenant_admin"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>
                      <Icon name="key" size={10} color={C.grey400} />
                      RÉINITIALISER LE MOT DE PASSE
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                        type="text"
                        placeholder="Laisser vide pour ne pas changer"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={regenerate}
                        className="btn-ghost"
                        style={{ fontSize: 11, padding: "0 12px", whiteSpace: "nowrap" }}
                      >
                        Suggérer fort
                      </button>
                    </div>
                    {currentPassword && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ height: 6, borderRadius: 99, background: "rgba(107,114,128,.12)", overflow: "hidden" }}>
                          <div style={{ width: `${passwordStrength.pct}%`, height: "100%", borderRadius: 99, background: passwordStrength.color, transition: "width .2s, background .2s" }} />
                        </div>
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                          <span style={{ fontSize: 9, color: C.grey500, lineHeight: 1.4 }}>{passwordHint}</span>
                          <span style={{ fontSize: 10, color: passwordStrength.color, fontWeight: 800, whiteSpace: "nowrap" }}>{passwordStrength.label}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    onClick={() => valid && onSave({ name: name.trim(), username: username.trim(), password: currentPassword.trim(), color, plan, parentId, type: parentId ? "sub_tenant" : "tenant", logo: name.slice(0, 2).toUpperCase(), storage })}
                    disabled={!valid}
                    className="btn-primary"
                    style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6, opacity: !valid ? 0.5 : 1 }}
                  >
                    <Icon name="check" size={14} color="#fff" />
                    Enregistrer
                  </button>
                  <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 13 }}>Annuler</button>
                </div>
              </div>
            )}

            {/* Next step button for create mode */}
            {!isEdit && (
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 12 }}>Annuler</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={name.trim().length < 2}
                  className="btn-primary"
                  style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, opacity: name.trim().length < 2 ? 0.5 : 1 }}
                >
                  Suivant
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Credentials ── */}
        {step === 2 && !isEdit && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(107,114,128,.04)", border: `1px solid rgba(107,114,128,.1)` }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.grey900 }}>{name}</div>
                <div style={{ fontSize: 9, color: C.grey500 }}>{plan} · {storage === "shared" ? "Base partagée" : "Base dédiée"}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(220px,.85fr) minmax(320px,1.15fr)", gap: 14, alignItems: "start" }}>
              {/* Username */}
              <div>
                <div style={labelStyle}>
                  <Icon name="key" size={10} color={C.grey400} />
                  NOM D'UTILISATEUR <span style={{ color: C.red }}>*</span>
                </div>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, "").toLowerCase())}
                  style={inputStyle}
                  placeholder={suggestedUsername || "admin_tenant"}
                  autoComplete="off"
                  autoFocus
                />
                {suggestedUsername && username !== suggestedUsername && (
                  <button
                    type="button"
                    onClick={() => setUsername(suggestedUsername)}
                    className="btn-ghost"
                    style={{ marginTop: 8, fontSize: 11, padding: "5px 10px" }}
                  >
                    Utiliser : {suggestedUsername}
                  </button>
                )}
              </div>

              {/* Password */}
              <div>
                <div style={labelStyle}>
                  <Icon name="key" size={10} color={C.grey400} />
                  MOT DE PASSE <span style={{ color: C.red }}>*</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ ...inputStyle, fontFamily: "'JetBrains Mono',monospace" }}
                    type="text"
                    placeholder="Mot de passe initial…"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={regenerate}
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "0 12px", whiteSpace: "nowrap" }}
                    title="Suggérer un mot de passe fort"
                  >
                    Suggérer fort
                  </button>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 6, borderRadius: 99, background: "rgba(107,114,128,.12)", overflow: "hidden" }}>
                    <div style={{ width: `${passwordStrength.pct}%`, height: "100%", borderRadius: 99, background: passwordStrength.color, transition: "width .2s, background .2s" }} />
                  </div>
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 9, color: C.grey500, lineHeight: 1.4 }}>{passwordHint}</span>
                    <span style={{ fontSize: 10, color: passwordStrength.color, fontWeight: 800, whiteSpace: "nowrap" }}>{passwordStrength.label}</span>
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: 9, color: C.grey400, margin: "-4px 0 0", lineHeight: 1.5 }}>
              Le mot de passe sera affiché une seule fois après création.
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
              <button
                onClick={() => setStep(1)}
                className="btn-ghost"
                style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                Retour
              </button>
              <div style={{ flex: 1 }} />
              <button onClick={onCancel} className="btn-ghost" style={{ fontSize: 12 }}>Annuler</button>
              <button
                onClick={() => valid && onSave({ name: name.trim(), username: username.trim(), password: currentPassword, color, plan, parentId, type: parentId ? "sub_tenant" : "tenant", logo: name.slice(0, 2).toUpperCase(), storage })}
                disabled={!valid}
                className="btn-primary"
                style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, opacity: !valid ? 0.5 : 1 }}
              >
                <Icon name="check" size={13} color="#fff" />
                Créer le tenant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
