import { useEffect, useState } from "react";
import { DangerZoneSection } from "@/components/ui/DangerZoneSection";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { SeriesToggleRow } from "@/components/ui/SeriesModal";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { pipelinesForTenant, updatePipelineStore, useAuth, useStore } from "@/store/db";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { AuditLogView } from "@/views/AuditLogView";

function Toggle({ on, onChange, small = false }) {
  const w = small ? 40 : 50, h = small ? 22 : 26, knob = small ? 16 : 20, offset = small ? 3 : 3;
  return (
    <div onClick={onChange} style={{ width: w, height: h, borderRadius: 99, background: on ? C.red : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0, boxShadow: on ? "0 0 0 3px rgba(217,79,61,.15)" : "none" }}>
      <div style={{ position: "absolute", top: offset, left: on ? w - knob - offset : offset, width: knob, height: knob, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.2)", transition: "left .3s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function SectionHeader({ iconName, label, accent = C.red }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: "1.5px solid rgba(0,0,0,.06)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={iconName} size={15} color={accent} />
      </div>
      <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 17, fontWeight: 600, color: C.grey900, letterSpacing: "-.2px" }}>{label}</span>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 1px 4px rgba(0,0,0,.04)", padding: "22px 24px", ...style }}>
      {children}
    </div>
  );
}

function FieldRow({ label, value, mono = false, last = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, padding: "10px 0", borderBottom: last ? "none" : "1px solid rgba(0,0,0,.05)" }}>
      <span style={{ fontSize: 12, color: C.grey500, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: mono ? C.red : C.grey900, fontFamily: mono ? "'Courier New',monospace" : "inherit", lineHeight: 1.5 }}>{value}</span>
    </div>
  );
}

export function SettingsView() {
  const { user, tenant, isAdmin } = useAuth();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState("contexte");
  const [lightMode, setLightMode] = useState(true);
  const [notifs, setNotifs] = useState({
    critiques: true,
    doublons: true,
    pipeline: true,
    rapport: false,
  });
  const toggleNotif = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));
  useStore();

  // Global pipeline config — wired to actual pipeline store
  const pipelines = tenant ? pipelinesForTenant(tenant.id) : [];
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const selectedPipeline =
    pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0] || null;
  const [globalK, setGlobalK] = useState(selectedPipeline?.kFactor ?? 3);
  const [globalTol, setGlobalTol] = useState(
    selectedPipeline?.tolerancePct ?? 10
  );

  useEffect(() => {
    if (selectedPipeline) {
      setGlobalK(selectedPipeline.kFactor);
      setGlobalTol(selectedPipeline.tolerancePct);
    }
  }, [selectedPipeline?.id]);

  const NAV_SECTIONS = [
    { id: "contexte", icon: "key", label: "Contexte" },
    { id: "apparence", icon: "eye", label: "Apparence" },
    { id: "pipelines_cfg", icon: "pipelines", label: "Config pipelines" },
    { id: "series", icon: "fileText", label: "Séries" },
    { id: "mapping", icon: "integrations", label: "Mapping ERP" },
    { id: "notifs", icon: "alerts", label: "Notifications" },
    { id: "audit", icon: "clock", label: "Journal d'audit" },
    { id: "shortcuts", icon: "zap", label: "Raccourcis clavier" },
    ...(tenant
      ? [{ id: "espace", icon: "tenants", label: "Compte" }]
      : []),
    { id: "danger", icon: "shield", label: "Zone dangereuse", danger: true },
  ];

  if (!user) return null;

  const content = (() => {
    if (activeSection === "contexte")
      return (
        <Card>
          <SectionHeader iconName="key" label="Contexte actif" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: 0,
              columnGap: 32,
            }}
          >
            {[
              ["Utilisateur", user.name || "Admin Système"],
              ["Rôle", user.role || "Admin"],
              ["Tenant", tenant?.name || "AnomalyAI"],
              ["Type", tenant?.type || "Platform"],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                style={{
                  padding: "10px 0",
                  borderBottom:
                    i < arr.length - 2 ? `1px solid rgba(0,0,0,.05)` : "none",
                  display: "flex",
                  gap: 6,
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: 12, color: C.grey400, minWidth: 80 }}>
                  {k}
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </Card>
      );

    if (activeSection === "apparence")
      return (
        <Card>
          <SectionHeader iconName="eye" label="Apparence" />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.grey900,
                  marginBottom: 3,
                }}
              >
                Thème de l'interface
              </div>
              <div style={{ fontSize: 11, color: C.grey400 }}>
                {lightMode ? "Mode clair actif" : "Mode sombre actif"}
              </div>
            </div>
            <Toggle on={lightMode} onChange={() => setLightMode((v) => !v)} />
          </div>
        </Card>
      );

    if (activeSection === "pipelines_cfg")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <SectionHeader
              iconName="pipelines"
              label="Configuration globale des pipelines"
            />
            {pipelines.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: C.grey400,
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Aucun pipeline disponible pour ce tenant.
              </div>
            )}
            {pipelines.length > 0 && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.grey500,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 6,
                    }}
                  >
                    Pipeline à configurer
                  </div>
                  <select
                    value={selectedPipeline?.id || ""}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    className="input-field"
                    style={{ fontSize: 12 }}
                  >
                    {pipelines.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedPipeline && (
                  <>
                    {/* Active / Pause toggle */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        borderRadius: 12,
                        background:
                          selectedPipeline.status === "actif"
                            ? "rgba(34,197,94,.06)"
                            : "rgba(107,114,128,.06)",
                        border: `1.5px solid ${
                          selectedPipeline.status === "actif"
                            ? "rgba(34,197,94,.25)"
                            : C.grey200
                        }`,
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.grey900,
                            marginBottom: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          <Icon
                            name={
                              selectedPipeline.status === "actif"
                                ? "check"
                                : "pauseCircle"
                            }
                            size={14}
                            color={
                              selectedPipeline.status === "actif"
                                ? C.success
                                : C.grey400
                            }
                          />
                          {selectedPipeline.status === "actif"
                            ? "Pipeline actif"
                            : "Pipeline en pause"}
                        </div>
                        <div style={{ fontSize: 11, color: C.grey500 }}>
                          {selectedPipeline.status === "actif"
                            ? "Traitement des factures en cours"
                            : "Aucun traitement — les données ne sont pas mises à jour"}
                        </div>
                      </div>
                      <Toggle
                        on={selectedPipeline.status === "actif"}
                        onChange={() => {
                          const next =
                            selectedPipeline.status === "actif"
                              ? "paused"
                              : "actif";
                          updatePipelineStore(selectedPipeline.id, {
                            status: next,
                          });
                          toast(
                            next === "actif"
                              ? "Pipeline activé"
                              : "Pipeline mis en pause",
                            "info"
                          );
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 5,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.grey700,
                            }}
                          >
                            Minimum de factures par cluster
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.red,
                              fontFamily: "'JetBrains Mono',monospace",
                            }}
                          >
                            {Math.round(globalK)} fact.
                          </div>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={15}
                          step={1}
                          value={globalK}
                          onChange={(e) => setGlobalK(Number(e.target.value))}
                          className="slider"
                          style={{ width: "100%" }}
                        />
                        <div
                          style={{
                            fontSize: 10,
                            color: C.grey400,
                            marginTop: 3,
                          }}
                        >
                          Nombre minimum de factures requis pour former un cluster
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 5,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.grey700,
                            }}
                          >
                            Tolérance globale (%)
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: C.purple,
                              fontFamily: "'JetBrains Mono',monospace",
                            }}
                          >
                            {globalTol}%
                          </div>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={30}
                          step={1}
                          value={globalTol}
                          onChange={(e) => setGlobalTol(Number(e.target.value))}
                          className="slider"
                          style={{ width: "100%" }}
                        />
                        <div
                          style={{
                            fontSize: 10,
                            color: C.grey400,
                            marginTop: 3,
                          }}
                        >
                          Marge acceptée autour de la moyenne par série
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          updatePipelineStore(selectedPipeline.id, {
                            kFactor: globalK,
                            tolerancePct: globalTol,
                          });
                          toast("Pipeline mis à jour", "success");
                        }}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: "8px 18px" }}
                      >
                        <Icon name="check" size={13} color="#fff" />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setGlobalK(selectedPipeline.kFactor);
                          setGlobalTol(selectedPipeline.tolerancePct);
                        }}
                        className="btn-ghost"
                        style={{ fontSize: 12, padding: "8px 14px" }}
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </Card>
        </div>
      );

    if (activeSection === "danger")
      return (
        <DangerZoneSection
          pipelines={pipelines}
          tenant={tenant}
          isAdmin={isAdmin}
          toast={toast}
        />
      );

    if (activeSection === "series")
      return (
        <Card>
          <SectionHeader
            iconName="fileText"
            label="Séries — Vue globale & pause"
          />
          {pipelines.length === 0 && (
            <div
              style={{
                fontSize: 12,
                color: C.grey400,
                textAlign: "center",
                padding: 20,
              }}
            >
              Aucun pipeline disponible.
            </div>
          )}
          <SeriesList pipelines={pipelines} Toggle={Toggle} toast={toast} />
        </Card>
      );

    if (activeSection === "mapping")
      return (
        <Card>
          <SectionHeader iconName="integrations" label="Mapping ERP par pipeline" />
          {pipelines.length === 0 && (
            <div style={{ fontSize: 12, color: C.grey400, textAlign: "center", padding: 20 }}>
              Aucun pipeline disponible.
            </div>
          )}
          {pipelines.length > 0 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
                  Pipeline
                </div>
                <select
                  value={selectedPipeline?.id || ""}
                  onChange={(e) => setSelectedPipelineId(e.target.value)}
                  className="input-field"
                  style={{ fontSize: 12 }}
                >
                  {pipelines.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {selectedPipeline && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.grey700, marginBottom: 12, padding: "8px 12px", background: `${C.info}08`, borderRadius: 8, border: `1px solid ${C.info}20` }}>
                    {selectedPipeline.name} — {selectedPipeline.connector || "REST"}
                  </div>
                  {[
                    ["Table principale", "EPFTET (en-tête facture)"],
                    ["Montant analysé", "LOCNETMNT — montant net local"],
                    ["Date facture", "FACDAT"],
                    ["Date comptable", "CPTDAT"],
                    ["Fournisseur", "TIECOD → TIENOM1 (join SERCPTTIE)"],
                    ["Établissement", "JRNETA"],
                    ["Code société", "SOCCOD"],
                    ["Entité comptable", "EPECOD"],
                    ["Type facture", "FACTYP (FA / AV / CC)"],
                    ["Statut externe", "EPFEXTSTA (ENCO / VALID / REFUS / PAYE)"],
                    ["Statut interne", "EPFINTSTA (AT / VA / RE / PA)"],
                  ].map(([lbl, val], i, arr) => (
                    <FieldRow key={lbl} label={lbl} value={val} mono last={i === arr.length - 1} />
                  ))}
                </>
              )}
            </>
          )}
        </Card>
      );

    if (activeSection === "notifs")
      return (
        <Card>
          <SectionHeader iconName="alerts" label="Notifications" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              ["critiques", "Anomalies critiques", "EPFEXTSTA: ENCO"],
              ["doublons", "Doublons détectés", "TIEMNQ normalisé"],
              ["pipeline", "Erreurs pipeline", "Connexion JDBC"],
              ["rapport", "Rapport hebdomadaire", "Automatique · chaque lundi"],
            ].map(([key, title, sub], i, arr) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 0",
                  borderBottom:
                    i < arr.length - 1 ? `1px solid rgba(0,0,0,.05)` : "none",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.grey900,
                      marginBottom: 2,
                    }}
                  >
                    {title}
                  </div>
                  <div style={{ fontSize: 11, color: C.grey400 }}>{sub}</div>
                </div>
                <Toggle on={notifs[key]} onChange={() => toggleNotif(key)} />
              </div>
            ))}
          </div>
        </Card>
      );

    if (activeSection === "espace")
      return (
        <Card>
          <SectionHeader
            iconName="tenants"
            label="Paramètres du compte"
            accent={C.info}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                  Identifiant
                </div>
                <input
                  className="input-field"
                  defaultValue={user?.name || tenant?.name || ""}
                  placeholder="Nom d'utilisateur"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                  Rôle
                </div>
                <input
                  className="input-field"
                  value={user?.role || "—"}
                  disabled
                  style={{ fontSize: 12, opacity: 0.6 }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                  Adresse email
                </div>
                <input
                  className="input-field"
                  defaultValue={tenant?.admin_username || ""}
                  placeholder="email@exemple.com"
                  style={{ fontSize: 12 }}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                  Mot de passe
                </div>
                <input
                  type="password"
                  className="input-field"
                  defaultValue={tenant?.admin_password || ""}
                  placeholder="••••••••"
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>
            <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ fontSize: 12, padding: "8px 18px" }}>
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </Card>
      );

    if (activeSection === "audit")
      return (
        <Card>
          <AuditLogView />
        </Card>
      );

    if (activeSection === "shortcuts")
      return (
        <Card>
          <SectionHeader iconName="zap" label="Raccourcis clavier" accent={C.purple} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { keys: ["⌘", "K"], desc: "Ouvrir la palette de commandes — recherche globale" },
              { keys: ["↑", "↓"], desc: "Naviguer dans la palette de commandes" },
              { keys: ["↵"], desc: "Confirmer la sélection dans la palette" },
              { keys: ["Échap"], desc: "Fermer modales, palette, panneau notifications" },
              { keys: ["F"], desc: "Feedback « Confirmé » sur une anomalie sélectionnée" },
              { keys: ["D"], desc: "Feedback « Faux positif » sur une anomalie sélectionnée" },
              { keys: ["←", "→"], desc: "Naviguer entre les étapes du workspace pipeline" },
            ].map((sc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 10, background: i % 2 === 0 ? C.grey50 : "transparent" }}>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {sc.keys.map((k, j) => (
                    <kbd key={j} style={{ padding: "3px 8px", borderRadius: 6, background: C.white, border: `1.5px solid ${C.grey200}`, fontSize: 11, fontWeight: 700, color: C.grey700, fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,.06)" }}>{k}</kbd>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: C.grey600, flex: 1 }}>{sc.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      );

    return null;
  })();

  return (
    <div
      className="fade-up"
      style={{
        padding: "28px 24px",
        height: "calc(100vh - 68px)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflow: "hidden",
      }}
    >
      <PageHeader eyebrow="Configuration" title="Paramètres" subtitle="Compte · pipelines · audit · sécurité" />

      {/* Two-column layout */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: 16,
          overflow: "hidden",
        }}
      >
        {/* Left nav rail */}
        <div
          className="glass-card"
          style={{
            padding: "10px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "fit-content",
          }}
        >
          {NAV_SECTIONS.map((s) => [
            s.danger && (
              <div
                key={s.id + "_sep"}
                style={{ height: 1, background: C.grey200, margin: "6px 4px" }}
              />
            ),
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 12px",
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                textAlign: "left",
                width: "100%",
                transition: "all .18s",
                fontFamily: "inherit",
                background:
                  activeSection === s.id
                    ? s.danger
                      ? "linear-gradient(135deg,#991b1b,#D94F3D)"
                      : "linear-gradient(135deg,#D94F3D,#E8736A)"
                    : "transparent",
                color:
                  activeSection === s.id
                    ? "#fff"
                    : s.danger
                    ? C.red
                    : C.grey600,
                boxShadow:
                  activeSection === s.id
                    ? "0 4px 14px rgba(217,79,61,.25)"
                    : "none",
              }}
            >
              <Icon
                name={s.icon}
                size={14}
                color={
                  activeSection === s.id ? "#fff" : s.danger ? C.red : C.grey500
                }
              />
              {s.label}
            </button>,
          ])}
        </div>

        {/* Right content */}
        <div style={{ overflowY: "auto", paddingRight: 2 }}>{content}</div>
      </div>
    </div>
  );
}

function SeriesList({ pipelines, Toggle, toast }) {
  const [seriesMap, setSeriesMap] = useState({});
  useEffect(() => {
    (async () => {
      const map = {};
      await Promise.all(pipelines.map(async (p) => {
        if (!p.workspaceStarted) { map[p.id] = []; return; }
        try {
          wsStore.activePipelineId = p.id;
          const data = await wsAPI.listSeries();
          map[p.id] = Array.isArray(data) ? data : [];
        } catch (e) { map[p.id] = []; }
      }));
      setSeriesMap(map);
    })();
  }, [pipelines]);
  return pipelines.map((p) => {
    const wsSeries = seriesMap[p.id] || [];
    return (
      <div key={p.id} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.grey900, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.status === "actif" ? C.success : C.grey400, display: "inline-block" }} />
          {p.name}
          <span style={{ fontSize: 9, color: C.grey500, fontWeight: 400 }}>({wsSeries.length} séries)</span>
        </div>
        {wsSeries.length === 0 && (
          <div style={{ fontSize: 11, color: C.grey400, padding: "6px 0 10px", borderBottom: `1px solid ${C.grey100}` }}>
            Pipeline non démarré — aucune série configurée.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
          {wsSeries.map((s) => (
            <SeriesToggleRow key={s.id} series={{ ...s, paused: s.active === false }} Toggle={Toggle} toast={toast} />
          ))}
        </div>
      </div>
    );
  });
}
