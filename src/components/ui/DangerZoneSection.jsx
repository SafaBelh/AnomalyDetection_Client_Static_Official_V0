import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { C } from "@/constants/colors";
import { deleteAllDataForTenant, deletePipelineStore, deleteTenantStore } from "@/store/db";

function DangerCard({ id, icon, title, subtitle, confirmLabel, confirmHint, onExecute, state, onStateChange, disabled = false }) {
  const st = state || { input: "", open: false, done: false };
  const matches = st.input.trim() === confirmLabel;
  return (
    <div style={{ border: "1.5px solid rgba(217,79,61,.25)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,.8)" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(217,79,61,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={icon} size={17} color={C.red} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>{title}</div>
            <div style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>{subtitle}</div>
          </div>
        </div>
        {!st.open && !st.done && (
          <button disabled={disabled} onClick={() => onStateChange(id, { open: true })} style={{ padding: "7px 16px", borderRadius: 9, border: "1.5px solid rgba(217,79,61,.4)", background: "rgba(217,79,61,.07)", color: C.red, fontWeight: 700, fontSize: 12, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", flexShrink: 0 }}>
            <Icon name="trash2" size={13} color={C.red} /> Supprimer
          </button>
        )}
        {st.done && (
          <span style={{ fontSize: 12, fontWeight: 700, color: C.success, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="check" size={13} color={C.success} /> Effectué
          </span>
        )}
      </div>
      {st.open && !st.done && (
        <div style={{ padding: "14px 20px 18px", borderTop: "1px solid rgba(217,79,61,.15)", background: "rgba(217,79,61,.03)" }}>
          <div style={{ fontSize: 12, color: C.grey700, marginBottom: 10, lineHeight: 1.6 }}>
            {confirmHint} Pour confirmer, saisissez exactement&nbsp;
            <code style={{ fontFamily: "'JetBrains Mono',monospace", background: "rgba(217,79,61,.1)", color: C.red, padding: "1px 6px", borderRadius: 5, fontWeight: 700, fontSize: 11 }}>{confirmLabel}</code>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input className="input-field" style={{ flex: 1, fontSize: 12, borderColor: matches ? "rgba(217,79,61,.6)" : C.grey200 }} placeholder={`Saisissez : ${confirmLabel}`} value={st.input || ""} onChange={(e) => onStateChange(id, { input: e.target.value })} />
            <button disabled={!matches} onClick={() => { onExecute(); onStateChange(id, { open: false, input: "", done: true }); }} style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: matches ? "linear-gradient(135deg,#991b1b,#D94F3D)" : "rgba(217,79,61,.2)", color: "#fff", fontWeight: 700, fontSize: 12, cursor: matches ? "pointer" : "not-allowed", opacity: matches ? 1 : 0.6, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "inherit", flexShrink: 0, boxShadow: matches ? "0 4px 14px rgba(217,79,61,.35)" : "none", transition: "all .2s" }}>
              <Icon name="trash2" size={13} color="#fff" /> Confirmer la suppression
            </button>
            <button onClick={() => onStateChange(id, { open: false, input: "" })} className="btn-ghost" style={{ fontSize: 12, padding: "7px 12px" }}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DangerZoneSection({ pipelines, tenant, isAdmin, toast }) {
  const [confirmStates, setConfirmStates] = useState({});
  const onStateChange = (id, patch) =>
    setConfirmStates((p) => ({
      ...p,
      [id]: { ...(p[id] || { input: "", open: false, done: false }), ...patch },
    }));

  const tenantPipelines = pipelines || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Warning banner */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          background: "rgba(217,79,61,.07)",
          border: `1.5px solid rgba(217,79,61,.25)`,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Icon
          name="triangle"
          size={18}
          color={C.red}
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.red,
              marginBottom: 4,
            }}
          >
            Zone dangereuse — actions irréversibles
          </div>
          <div style={{ fontSize: 12, color: C.grey600, lineHeight: 1.6 }}>
            Ces actions sont permanentes et ne peuvent pas être annulées. Chaque
            opération nécessite de saisir exactement le nom de l'élément à
            supprimer pour confirmation.
          </div>
        </div>
      </div>

      {/* Delete pipelines */}
      {tenantPipelines.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey500,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              marginBottom: 10,
            }}
          >
            Pipelines
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {tenantPipelines.map((p) => (
              <DangerCard
                key={`del_pipe_${p.id}`}
                id={`del_pipe_${p.id}`}
                icon="pipelines"
                title={`Supprimer "${p.name}"`}
                subtitle={`${p.connector} · ${
                  p.invoicesProcessed?.toLocaleString("fr-FR") || 0
                } factures · statut : ${p.status}`}
                confirmLabel={p.name}
                confirmHint="Cette action supprime définitivement le pipeline et toutes ses données associées."
                onExecute={() => {
                  deletePipelineStore(p.id);
                  toast(`Pipeline "${p.name}" supprimé`, "warning");
                }}
                state={confirmStates[`del_pipe_${p.id}`]}
                onStateChange={onStateChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delete data */}
      {tenant && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey500,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              marginBottom: 10,
            }}
          >
            Données
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DangerCard
              id="del_data"
              icon="trash2"
              title="Supprimer toutes les données d'analyse"
              subtitle="Alertes, scores, feedbacks — les pipelines et séries sont conservés"
              confirmLabel={`supprimer-données-${tenant.name}`}
              confirmHint="Supprime irrémédiablement toutes les alertes, anomalies détectées et feedbacks pour ce tenant."
              onExecute={() => {
                deleteAllDataForTenant(tenant.id);
                toast("Données d'analyse supprimées", "warning");
              }}
              state={confirmStates["del_data"]}
              onStateChange={onStateChange}
            />
          </div>
        </div>
      )}

      {/* Delete tenant — admin only */}
      {isAdmin && tenant && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.grey500,
              textTransform: "uppercase",
              letterSpacing: ".07em",
              marginBottom: 10,
            }}
          >
            Tenant
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DangerCard
              id="del_client"
              icon="tenants"
              title={`Supprimer le tenant "${tenant.name}"`}
              subtitle={`Plan ${tenant.plan} · ${
                tenant.invoiceCount?.toLocaleString("fr-FR") || 0
              } factures · suppression totale et irréversible`}
              confirmLabel={tenant.name}
              confirmHint={`Supprime le tenant, tous ses pipelines, sous-tenants, alertes et données. Cette action est définitive.`}
              onExecute={() => {
                const ok = deleteTenantStore(tenant.id);
                if (ok) toast(`Tenant "${tenant.name}" supprimé`, "warning");
                else
                  toast(
                    "Impossible : des sous-tenants existent encore.",
                    "error"
                  );
              }}
              state={confirmStates["del_client"]}
              onStateChange={onStateChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
