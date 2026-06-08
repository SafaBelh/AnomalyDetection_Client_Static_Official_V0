import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { db, useAuth, useStore, partnersForTenant } from "@/store/db";

export function PartnersView() {
  const toast = useToast();
  const { tenant, isTenantAdmin } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  useStore();

  if (!isTenantAdmin || !tenant) return null;

  const partners = partnersForTenant(tenant.id);

  const handleEdit = (e, id) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const externalId = fd.get("external_tenant_id");
    
    if (!name || !externalId) {
      toast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    const partner = db.erpPartners.find(p => p.id === id);
    if (partner) {
      partner.name = name;
      partner.external_tenant_id = externalId;
      partner.logo = name.substring(0, 2).toUpperCase();
    }
    
    setEditingId(null);
    refresh();
    toast("Partenaire ERP mis à jour", "success");
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name");
    const externalId = fd.get("external_tenant_id");
    
    if (!name || !externalId) {
      toast("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    const newPartner = {
      id: "P_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      tenantId: tenant.id,
      name,
      external_tenant_id: externalId,
      logo: name.substring(0, 2).toUpperCase(),
      color: "#D94F3D"
    };

    db.erpPartners.push(newPartner);
    setShowAdd(false);
    refresh();
    toast("Partenaire ERP créé avec succès", "success");
  };

  const handleDelete = (id) => {
    db.erpPartners = db.erpPartners.filter(p => p.id !== id);
    // Remove pipelines related to this partner
    db.pipelines = db.pipelines.filter(p => p.erpPartnerId !== id);
    refresh();
    toast("Partenaire ERP supprimé", "warning");
  };

  return (
    <div className="fade-up" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217,79,61,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="clients" size={20} color={C.red} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: C.grey900 }}>
              Mes Partenaires ERP
            </h2>
            <p style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
              {partners.length} partenaire{partners.length !== 1 ? "s" : ""} rattaché{partners.length !== 1 ? "s" : ""} à votre espace
            </p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          ＋ Nouveau partenaire
        </button>
      </div>

      {showAdd && (
        <div className="card-solid fade-in" style={{ padding: 28, borderColor: "rgba(217,79,61,.15)", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.grey900 }}>
              Nouveau partenaire ERP
            </h3>
            <button onClick={() => setShowAdd(false)} className="btn-icon" style={{ padding: 5 }}>
              <Icon name="x" size={15} color={C.grey500} />
            </button>
          </div>

          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  <span style={{ color: C.grey400 }}>#</span> NOM DU PARTENAIRE <span style={{ color: C.red }}>*</span>
                </label>
                <input name="name" className="input-field" placeholder="Ex: Ask&Go, SAP Connect..." required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  EXTERNAL TENANT ID <span style={{ color: C.red }}>*</span>
                </label>
                <input name="external_tenant_id" className="input-field" placeholder="Ex: tenant_12345" required />
                <p style={{ fontSize: 10, color: C.grey400, marginTop: 4 }}>Cet identifiant est utilisé pour corréler les données via API ou SSO.</p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
              <button type="submit" className="btn-primary" style={{ fontSize: 13 }}>
                <Icon name="check" size={14} color="#fff" /> Créer le partenaire
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost" style={{ fontSize: 13 }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginTop: 12 }}>
        {partners.map(p => (
          <div key={p.id} className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            {editingId === p.id ? (
              <form onSubmit={(e) => handleEdit(e, p.id)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>Modifier le partenaire</div>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-icon" style={{ padding: 4 }}>
                    <Icon name="x" size={14} color={C.grey500} />
                  </button>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>NOM</label>
                  <input name="name" defaultValue={p.name} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>EXTERNAL TENANT ID</label>
                  <input name="external_tenant_id" defaultValue={p.external_tenant_id} className="input-field" required />
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }}>Annuler</button>
                  <button type="submit" className="btn-primary" style={{ fontSize: 11, padding: "6px 12px" }}>Enregistrer</button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                    {p.logo}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.grey900 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>ID: {p.external_tenant_id}</div>
                  </div>
                  <button onClick={() => setEditingId(p.id)} className="btn-icon" style={{ padding: 6, color: C.grey500 }}>
                    <Icon name="edit" size={14} color={C.grey500} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="btn-icon" style={{ padding: 6, color: C.red }}>
                    <Icon name="trash" size={14} color={C.red} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `1px solid ${C.grey100}`, paddingTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontFamily: "'Instrument Serif',serif", color: C.info }}>
                      {db.pipelines.filter(pipe => pipe.erpPartnerId === p.id).length}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase" }}>Pipelines</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontFamily: "'Instrument Serif',serif", color: C.red }}>
                      {db.alerts.filter(a => a.erpPartnerId === p.id).length}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase" }}>Alertes</div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
