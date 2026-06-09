import { useEffect, useState } from "react";
import { DangerZoneSection } from "@/components/ui/DangerZoneSection";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import {
  alertsForTenant,
  getTenantCredentials,
  partnersForTenant,
  pipelinesForTenant,
  updateTenantCredentials,
  updateTenantStore,
  updatePipelineStore,
  useAuth,
  useStore,
  visibleTenants,
} from "@/store/db";
import { ALERTS_TABLE, BUDGETS_TABLE, DEMO_CONNECTORS, PIPELINES_TABLE, SETTINGS_DEFAULTS, SETTINGS_OPTIONS, STATIC_DATA_REPORT, TENANT_CONNECTIONS_TABLE } from "@/store/staticData";

function Card({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 1px 4px rgba(0,0,0,.04)", padding: "22px 24px" }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, accent = C.red }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(0,0,0,.06)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={15} color={accent} />
      </div>
      <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontSize: 19, color: C.grey900 }}>{title}</h2>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{ width: 48, height: 26, borderRadius: 99, border: "none", background: value ? C.red : C.grey300, padding: 3, cursor: "pointer", display: "flex", justifyContent: value ? "flex-end" : "flex-start", alignItems: "center" }}
    >
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 5px rgba(0,0,0,.22)" }} />
    </button>
  );
}

function Row({ label, description, right, last = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, padding: "13px 0", borderBottom: last ? "none" : "1px solid rgba(0,0,0,.05)" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: C.grey500, marginTop: 3, lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

function Field({ label, value, mono = false, last = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px minmax(0,1fr)", gap: 14, padding: "10px 0", borderBottom: last ? "none" : "1px solid rgba(0,0,0,.05)" }}>
      <span style={{ fontSize: 12, color: C.grey500 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: mono ? C.red : C.grey900, fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "-"}</span>
    </div>
  );
}

function StatGrid({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
      {items.map((item) => (
        <div key={item.label} style={{ padding: "12px 14px", borderRadius: 12, background: C.grey50, border: `1px solid ${C.grey100}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.grey900 }}>{item.value}</div>
          <div style={{ fontSize: 10, color: C.grey500, marginTop: 2 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field" style={{ minWidth: 170, fontSize: 12 }}>
      {options.map((option) => <option key={option[0]} value={option[0]}>{option[1]}</option>)}
    </select>
  );
}

function stringifyDetail(value) {
  if (value === null || value === undefined) return "-";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  return JSON.stringify(value, (key, item) => (typeof item === "function" ? `[Function ${item.name || "anonymous"}]` : item), 2);
}

function StaticDataReportTable({ table }) {
  return (
    <details style={{ border: `1px solid ${C.grey100}`, borderRadius: 14, background: "#fff", overflow: "hidden" }}>
      <summary style={{ cursor: "pointer", padding: "12px 14px", display: "grid", gridTemplateColumns: "minmax(170px,1fr) 90px 1.5fr", gap: 12, alignItems: "center", listStyle: "none" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: C.grey900, fontFamily: "'JetBrains Mono',monospace" }}>{table.label}</div>
          <div style={{ fontSize: 10, color: C.grey500, marginTop: 3 }}>{table.section}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: C.red }}>{table.rowCount.toLocaleString("fr-FR")} lignes</div>
        <div style={{ fontSize: 11, color: C.grey600, lineHeight: 1.4 }}>{table.description}</div>
      </summary>
      <div style={{ borderTop: `1px solid ${C.grey100}`, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {table.columns.map((column) => (
            <span key={column} style={{ fontSize: 10, fontWeight: 800, color: C.grey700, background: C.grey50, border: `1px solid ${C.grey100}`, borderRadius: 999, padding: "4px 8px", fontFamily: "'JetBrains Mono',monospace" }}>{column}</span>
          ))}
        </div>
        <div style={{ maxHeight: 360, overflow: "auto", border: `1px solid ${C.grey100}`, borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: C.grey50 }}>
                <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: C.grey500, width: 54 }}>#</th>
                {table.columns.map((column) => (
                  <th key={column} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: C.grey500, fontFamily: "'JetBrains Mono',monospace" }}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`${table.id}-${rowIndex}`} style={{ borderTop: `1px solid ${C.grey100}` }}>
                  <td style={{ padding: "8px 10px", fontSize: 11, color: C.grey400, verticalAlign: "top" }}>{rowIndex + 1}</td>
                  {table.columns.map((column) => (
                    <td key={column} style={{ padding: "8px 10px", fontSize: 11, color: C.grey800, verticalAlign: "top", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "pre-wrap", maxWidth: 360 }}>{stringifyDetail(row[column])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

export function SettingsView() {
  useStore();
  const { user, tenant, isEngineAdmin } = useAuth();
  const toast = useToast();
  const tenants = visibleTenants();
  const hasTenantContext = !!tenant?.id;
  const isPlatformSettings = !!isEngineAdmin && !hasTenantContext;
  const isAdmin = isPlatformSettings;
  const activeTenant = hasTenantContext ? tenants.find((item) => item.id === tenant.id) || tenant : null;
  const pipelines = activeTenant ? pipelinesForTenant(activeTenant.id) : [];
  const alerts = activeTenant ? alertsForTenant(activeTenant.id) : [];
  const partners = activeTenant ? partnersForTenant(activeTenant.id) : [];
  const credentials = activeTenant ? getTenantCredentials(activeTenant.id) : null;
  const budgets = activeTenant ? BUDGETS_TABLE.filter((b) => b.tenant_id === activeTenant.id || b.tenantId === activeTenant.id || activeTenant.username === "whitecapeTech") : [];
  const settingsPipelines = isPlatformSettings ? PIPELINES_TABLE : pipelines;
  const settingsAlerts = isPlatformSettings ? ALERTS_TABLE : alerts;
  const settingsBudgets = isPlatformSettings ? BUDGETS_TABLE : budgets;
  const connectorIds = new Set(TENANT_CONNECTIONS_TABLE.map((item) => item.connectorId));

  const adminNav = [
    ["profil_admin", "key", "Profil plateforme"],
    ["tenants", "tenants", "Tenants & acces"],
    ["connecteurs", "integrations", "Connecteurs ERP"],
    ["pipelines", "pipelines", "Pipelines"],
    ["anomalies", "alerts", "Moteur anomalies"],
    ["budget", "fileText", "Budget"],
    ["notifs", "alerts", "Alertes"],
    ["donnees", "shield", "Donnees"],
    ["apparence", "eye", "Apparence"],
    ["danger", "shield", "Zone dangereuse"],
  ];
  const tenantNav = [
    ["profil_tenant", "key", "Profil tenant"],
    ["compte", "tenants", "Mon compte"],
    ["erp", "integrations", "Connexion ERP"],
    ["pipelines", "pipelines", "Pipelines"],
    ["anomalies", "alerts", "Anomalies"],
    ["budget", "fileText", "Budget"],
    ["notifs", "alerts", "Notifications"],
    ["donnees", "shield", "Donnees"],
    ["apparence", "eye", "Apparence"],
    ["danger", "shield", "Zone dangereuse"],
  ];
  const nav = isPlatformSettings ? adminNav : tenantNav;
  const defaultSection = isPlatformSettings ? "profil_admin" : "profil_tenant";
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [lightMode, setLightMode] = useState(SETTINGS_DEFAULTS.lightMode);
  const [compactMode, setCompactMode] = useState(SETTINGS_DEFAULTS.compactMode);
  const [pipelineMode, setPipelineMode] = useState(SETTINGS_DEFAULTS.pipelineMode);
  const [alertChannel, setAlertChannel] = useState(SETTINGS_DEFAULTS.alertChannel);
  const [storageMode, setStorageMode] = useState(SETTINGS_DEFAULTS.storageMode);
  const [authMode, setAuthMode] = useState(SETTINGS_DEFAULTS.authMode);
  const [tenantForm, setTenantForm] = useState({ name: "", logo: "", color: "#3B82F6", storage: "shared" });
  const [accountForm, setAccountForm] = useState({ username: "", password: "" });

  useEffect(() => {
    setActiveSection(defaultSection);
  }, [defaultSection]);

  useEffect(() => {
    setTenantForm({
      name: activeTenant?.name || "",
      logo: activeTenant?.logo || "",
      color: activeTenant?.color || "#3B82F6",
      storage: activeTenant?.storage || "shared",
    });
    setAccountForm({
      username: credentials?.username || "",
      password: credentials?.password || "",
    });
  }, [activeTenant?.id, credentials?.username, credentials?.password]);

  const saveTenantProfile = () => {
    if (!activeTenant) return;
    updateTenantStore(activeTenant.id, tenantForm);
    toast("Profil tenant enregistre", "success");
  };

  const saveAccount = () => {
    if (!activeTenant) return;
    updateTenantCredentials(activeTenant.id, accountForm);
    toast("Compte mis a jour", "success");
  };

  if (!user) return null;

  const activePipelineCount = settingsPipelines.filter((p) => p.status === "actif" || p.status === "ACTIVE" || p.active).length;
  const unreadAlerts = settingsAlerts.filter((a) => a.status !== "READ" && a.status !== "RESOLVED").length;
  const staticDataRowCount = STATIC_DATA_REPORT.reduce((sum, table) => sum + table.rowCount, 0);
  const staticDataColumnCount = STATIC_DATA_REPORT.reduce((sum, table) => sum + table.columns.length, 0);

  const exportStaticDataReport = () => {
    const payload = stringifyDetail(STATIC_DATA_REPORT);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "static-data-report.json";
    link.click();
    URL.revokeObjectURL(url);
    toast("Rapport staticData exporte", "success");
  };

  const renderContent = () => {
    if (activeSection === "profil_admin") {
      return (
        <Card>
          <SectionHeader icon="key" title="Profil plateforme" />
          <StatGrid items={[
            { label: "Tenants", value: tenants.length.toLocaleString("fr-FR") },
            { label: "Connecteurs", value: DEMO_CONNECTORS.length.toLocaleString("fr-FR") },
            { label: "Liens ERP", value: TENANT_CONNECTIONS_TABLE.length.toLocaleString("fr-FR") },
          ]} />
          <div style={{ marginTop: 16 }}>
            <Field label="Utilisateur" value={user.name} />
            <Field label="Role" value={user.role} />
            <Field label="Mode" value="Donnees statiques de demonstration" last />
          </div>
        </Card>
      );
    }

    if (activeSection === "profil_tenant") {
      return (
        <Card>
          <SectionHeader icon="key" title="Profil tenant" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Nom</div>
              <input className="input-field" value={tenantForm.name} onChange={(e) => setTenantForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Logo</div>
              <input className="input-field" value={tenantForm.logo} onChange={(e) => setTenantForm((f) => ({ ...f, logo: e.target.value.toUpperCase().slice(0, 4) }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Couleur</div>
              <input type="color" value={tenantForm.color} onChange={(e) => setTenantForm((f) => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 34, border: `1px solid ${C.grey200}`, borderRadius: 8, padding: 2 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Mode DB</div>
              <Select value={tenantForm.storage} onChange={(storage) => setTenantForm((f) => ({ ...f, storage }))} options={[["shared", "Base partagee"], ["dedicated", "Base isolee"]]} />
            </div>
          </div>
          <Field label="Identifiant" value={activeTenant?.id} mono />
          <Row label="Apercu" right={<span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800 }}><span style={{ width: 28, height: 28, borderRadius: 8, background: tenantForm.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{tenantForm.logo || "?"}</span>{tenantForm.name}</span>} />
          <button type="button" className="btn-primary" onClick={saveTenantProfile} style={{ marginTop: 12 }}>Enregistrer</button>
        </Card>
      );
    }

    if (activeSection === "compte") {
      return (
        <Card>
          <SectionHeader icon="tenants" title="Mon compte" accent={C.info} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Nom d'utilisateur</div>
              <input className="input-field" value={accountForm.username} onChange={(e) => setAccountForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.grey500, textTransform: "uppercase", marginBottom: 6 }}>Mot de passe</div>
              <input className="input-field" type="password" value={accountForm.password} onChange={(e) => setAccountForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
          </div>
          <Field label="Role" value={user.role === "engine_admin" && activeTenant ? "tenant_admin" : user.role} last />
          <button type="button" className="btn-primary" onClick={saveAccount} style={{ marginTop: 12 }}>Enregistrer</button>
        </Card>
      );
    }

    if (activeSection === "tenants") {
      return (
        <Card>
          <SectionHeader icon="tenants" title="Tenants & acces" accent={C.info} />
          <Row label="Mode de stockage par defaut" description="Applique aux nouveaux tenants mock." right={<Select value={storageMode} onChange={setStorageMode} options={SETTINGS_OPTIONS.storageModes} />} />
          <div style={{ marginTop: 14 }}>
            {tenants.map((item) => (
              <Field key={item.id} label={item.name} value={`${item.storage === "dedicated" ? "Base isolee" : "Base partagee"} · ${item.invoiceCount || 0} factures`} />
            ))}
          </div>
        </Card>
      );
    }

    if (activeSection === "connecteurs") {
      return (
        <Card>
          <SectionHeader icon="integrations" title="Connecteurs ERP" />
          <StatGrid items={[
            { label: "Connecteurs", value: DEMO_CONNECTORS.length.toLocaleString("fr-FR") },
            { label: "Connecteurs lies", value: connectorIds.size.toLocaleString("fr-FR") },
            { label: "Liens tenants", value: TENANT_CONNECTIONS_TABLE.length.toLocaleString("fr-FR") },
          ]} />
          <div style={{ marginTop: 16 }}>
            <Row label="Authentification par defaut" right={<Select value={authMode} onChange={setAuthMode} options={SETTINGS_OPTIONS.authModes} />} />
            {DEMO_CONNECTORS.slice(0, 6).map((connector) => (
              <Field key={connector.id} label={connector.name} value={connector.description || connector.connectorType || "ERP"} />
            ))}
          </div>
        </Card>
      );
    }

    if (activeSection === "erp") {
      return (
        <Card>
          <SectionHeader icon="integrations" title="Connexion ERP" />
          <Field label="Statut" value={partners.length ? "Connecte" : "Non connecte"} />
          <Field label="Connexions" value={String(partners.length)} />
          <Field label="Connecteur" value={partners[0]?.name || "Aucun"} />
          <Field label="ID ERP externe" value={partners[0]?.external_tenant_id || "-"} mono last />
        </Card>
      );
    }

    if (activeSection === "pipelines") {
      return (
        <Card>
          <SectionHeader icon="pipelines" title="Pipelines" />
          <StatGrid items={[
            { label: "Pipelines", value: settingsPipelines.length.toLocaleString("fr-FR") },
            { label: "Actifs", value: activePipelineCount.toLocaleString("fr-FR") },
            { label: "Mode par defaut", value: pipelineMode === "automated" ? "Auto" : "Manuel" },
          ]} />
          <div style={{ marginTop: 16 }}>
            <Row label="Mode d'execution par defaut" right={<Select value={pipelineMode} onChange={setPipelineMode} options={SETTINGS_OPTIONS.pipelineModes} />} />
            {settingsPipelines.map((pipeline) => (
              <Row
                key={pipeline.id}
                label={pipeline.name}
                description={`${pipeline.connector || "ERP"} · ${pipeline.status || "actif"}`}
                right={<Toggle value={pipeline.status === "actif" || pipeline.status === "ACTIVE" || pipeline.active} onChange={(next) => { updatePipelineStore(pipeline.id, { status: next ? "actif" : "paused" }); toast(next ? "Pipeline active" : "Pipeline mis en pause", "info"); }} />}
              />
            ))}
          </div>
        </Card>
      );
    }

    if (activeSection === "anomalies") {
      return (
        <Card>
          <SectionHeader icon="alerts" title={isAdmin ? "Moteur anomalies" : "Anomalies"} />
          <Row label="Minimum de factures" description="Nombre minimum requis pour analyser une serie." right={<span style={{ fontSize: 12, fontWeight: 800 }}>{SETTINGS_DEFAULTS.anomalyMinInvoices} fact.</span>} />
          <Row label="Tolerance d'ecart" description="Marge avant signalement d'une anomalie." right={<span style={{ fontSize: 12, fontWeight: 800 }}>{SETTINGS_DEFAULTS.anomalyTolerancePct}%</span>} />
          <Row label="Types affiches" description="Montant inhabituel, frequence inhabituelle, doublon, ecart habituel." right={<span style={{ fontSize: 11, color: C.grey500 }}>Moteur</span>} last />
        </Card>
      );
    }

    if (activeSection === "budget") {
      return (
        <Card>
          <SectionHeader icon="fileText" title="Budget" accent={C.purple} />
          <StatGrid items={[
            { label: "Exercice", value: String(new Date().getFullYear()) },
            { label: "Lignes budget", value: settingsBudgets.length.toLocaleString("fr-FR") },
            { label: "Saisonnalite", value: "Auto" },
          ]} />
          <div style={{ marginTop: 16 }}>
            <Row label="Alertes budget" description="Déduites automatiquement par série selon le rythme, la saisonnalité et la projection moteur." right={<span style={{ fontSize: 11, color: C.grey500 }}>Moteur</span>} last />
          </div>
        </Card>
      );
    }

    if (activeSection === "notifs") {
      return (
        <Card>
          <SectionHeader icon="alerts" title={isAdmin ? "Alertes" : "Notifications"} />
          <StatGrid items={[
            { label: "Alertes", value: settingsAlerts.length.toLocaleString("fr-FR") },
            { label: "Non lues", value: unreadAlerts.toLocaleString("fr-FR") },
            { label: "Canal", value: alertChannel === "inapp" ? "In-app" : alertChannel },
          ]} />
          <div style={{ marginTop: 16 }}>
            <Row label="Canal principal" right={<Select value={alertChannel} onChange={setAlertChannel} options={SETTINGS_OPTIONS.alertChannels} />} />
            <Row label="Marquer tout lu" description="Operation simulee sur les alertes mock." right={<button type="button" className="btn-ghost" onClick={() => toast("Toutes les alertes marquees comme lues", "success")}>Marquer tout lu</button>} last />
          </div>
        </Card>
      );
    }

    if (activeSection === "donnees") {
      return (
        <Card>
          <SectionHeader icon="shield" title="Donnees" />
          <StatGrid items={[
            { label: "Tables staticData", value: STATIC_DATA_REPORT.length.toLocaleString("fr-FR") },
            { label: "Lignes detaillees", value: staticDataRowCount.toLocaleString("fr-FR") },
            { label: "Colonnes exposees", value: staticDataColumnCount.toLocaleString("fr-FR") },
          ]} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 16 }}>
            <div style={{ border: `1px solid ${C.grey100}`, borderRadius: 12, padding: 12, background: C.grey50 }}>
              <Field label="Source" value="src/store/staticData.js" mono />
              <Field label="Tenants" value={tenants.length.toLocaleString("fr-FR")} />
              <Field label="Connecteurs" value={DEMO_CONNECTORS.length.toLocaleString("fr-FR")} />
              <Field label={isPlatformSettings ? "Budgets" : "Budgets tenant"} value={settingsBudgets.length.toLocaleString("fr-FR")} last />
            </div>
            <div style={{ border: `1px solid ${C.grey100}`, borderRadius: 12, padding: 12, background: "rgba(217,79,61,.05)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: C.grey900 }}>Rapport complet staticData</div>
                <div style={{ fontSize: 11, color: C.grey600, lineHeight: 1.5, marginTop: 4 }}>Toutes les tables, colonnes, nombres de lignes et chaque ligne detaillee sont lus depuis le store central.</div>
              </div>
              <button type="button" className="btn-primary" onClick={exportStaticDataReport} style={{ alignSelf: "flex-start" }}>Exporter JSON</button>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            {STATIC_DATA_REPORT.map((table) => <StaticDataReportTable key={table.id} table={table} />)}
          </div>
        </Card>
      );
    }

    if (activeSection === "apparence") {
      return (
        <Card>
          <SectionHeader icon="eye" title="Apparence" />
          <Row label="Theme clair" description="Preference locale de demonstration." right={<Toggle value={lightMode} onChange={setLightMode} />} />
          <Row label="Cartes compactes" description="Reduit visuellement l'espacement." right={<Toggle value={compactMode} onChange={setCompactMode} />} last />
        </Card>
      );
    }

    if (activeSection === "danger") {
      return <DangerZoneSection pipelines={pipelines} tenant={activeTenant} isAdmin={isAdmin} toast={toast} />;
    }

    return null;
  };

  return (
    <div className="fade-up" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
      <PageHeader
        eyebrow={isPlatformSettings ? "Configuration" : "Mon espace"}
        title="Parametres"
        subtitle={isPlatformSettings ? "Profil · tenants · pipelines · audit · securite" : "Profil · compte · pipelines · anomalies · budget"}
      />
      <div style={{ display: "grid", gridTemplateColumns: "210px minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div className="glass-card" style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                textAlign: "left",
                width: "100%",
                fontFamily: "inherit",
                background: activeSection === id ? "linear-gradient(135deg,#D94F3D,#E8736A)" : "transparent",
                color: activeSection === id ? "#fff" : id === "danger" ? C.red : C.grey600,
                boxShadow: activeSection === id ? "0 4px 14px rgba(217,79,61,.25)" : "none",
              }}
            >
              <Icon name={icon} size={14} color={activeSection === id ? "#fff" : id === "danger" ? C.red : C.grey500} />
              {label}
            </button>
          ))}
        </div>
        <div key={activeSection} style={{ minWidth: 0 }}>{renderContent()}</div>
      </div>
    </div>
  );
}
