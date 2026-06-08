
import { useCallback, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle, CheckCircle2, ChevronLeft, Clock, Database, FileText, FolderOpen, Globe, Play, Sparkles, Upload, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { createPipelineStore, updatePipelineStore, useAuth, partnersForTenant } from "@/store/db";
import { parseCSV, wsAPI, wsStore } from "@/store/wsAPI";

/* ─────────────────────────────────────────────────────────
   Inline style constants matching the screenshots exactly
───────────────────────────────────────────────────────── */
const S = {
  // Section header row
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  // Numbered badge  ── blue/teal variant (sections 3, 5)
  badgeBlue: {
    width: 24,
    height: 24,
    borderRadius: 8,
    background: "rgba(59,130,246,.12)",
    border: "1.5px solid rgba(59,130,246,.25)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#3b82f6",
    flexShrink: 0,
  },
  // Section title text ── blue
  sectionTitleBlue: {
    fontSize: 11,
    fontWeight: 800,
    color: "#3b82f6",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  // Section subtitle / optional tag
  sectionSub: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: 500,
  },
  // Card for Statuts Provisoires (orange theme)
  cardOrange: {
    background: "rgba(251,191,36,.07)",
    border: "1.5px solid rgba(251,191,36,.3)",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardOrangeHeader: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 11,
    fontWeight: 800,
    color: "#d97706",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  cardOrangeHelper: {
    fontSize: 11,
    color: "#d97706",
    marginTop: 4,
    lineHeight: 1.5,
  },
  // Card for Statuts Finaux (green theme)
  cardGreen: {
    background: "rgba(34,197,94,.07)",
    border: "1.5px solid rgba(34,197,94,.28)",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardGreenHeader: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 11,
    fontWeight: 800,
    color: "#16a34a",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  cardGreenHelper: {
    fontSize: 11,
    color: "#16a34a",
    marginTop: 4,
    lineHeight: 1.5,
  },
  // Textarea inside colored cards
  cardTextarea: {
    width: "100%",
    minHeight: 70,
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,.1)",
    background: "rgba(255,255,255,.7)",
    padding: "8px 10px",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#1e293b",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  // Tenant isolation section wrapper
  tenantSection: {
    borderTop: "1px solid #e2e8f0",
    paddingTop: 20,
    marginTop: 4,
  },
  // Rounded large inputs matching screenshot 2
  tenantInput: {
    width: "100%",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    padding: "12px 16px",
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color .15s",
  },
};

export function PipelineConfigForm({
  pipeline,
  mode = "wizard",
  onCancel,
  onSubmitted,
  onOpenSeries,
}) {
  const { tenant, partner, isSSO, isAdmin } = useAuth();
  const savedConfig = (() => {
    const raw = pipeline?.configJson ?? pipeline?.config ?? {};
    if (typeof raw === "string") {
      try { return JSON.parse(raw); } catch { return {}; }
    }
    return raw && typeof raw === "object" ? raw : {};
  })();
  const [wizardStep, setWizardStep] = useState(pipeline ? 3 : 1);
  const [name, setName] = useState(pipeline?.name ?? "");
  const availablePartners = partnersForTenant(tenant?.id) || [];
  const [erpPartnerId, setErpPartnerId] = useState(
    pipeline?.erpPartnerId ?? partner?.id ?? (availablePartners.length > 0 ? availablePartners[0].id : "")
  );
  const [desc, setDesc] = useState(pipeline?.description ?? "");
  const [active, setActive] = useState(pipeline ? pipeline.status === "actif" : true);
  const [connType, setConnType] = useState((savedConfig.connection?.type || pipeline?.connector?.toLowerCase() || "api").replace("rest", "api"));
  const [freq, setFreq] = useState(savedConfig.schedule?.freq ?? pipeline?.freq ?? "daily");
  const [executionMode, setExecutionMode] = useState(savedConfig.automation?.mode ?? savedConfig.executionMode ?? "automated");
  const [tolPct, setTolPct] = useState(savedConfig.detection?.tolerancePct ?? pipeline?.tolerancePct ?? 10);
  const [tolDays, setTolDays] = useState(savedConfig.detection?.toleranceDays ?? pipeline?.toleranceDays ?? 10);
  const [kFactor, setKFactor] = useState(savedConfig.detection?.kFactor ?? pipeline?.kFactor ?? 3.0);
  const [apiUrl, setApiUrl] = useState(savedConfig.connection?.apiUrl ?? "");
  const [apiAuth, setApiAuth] = useState(savedConfig.connection?.apiAuth ?? "Bearer token");
  const [apiToken, setApiToken] = useState(savedConfig.connection?.apiToken ?? "");
  const [jdbcDriver, setJdbcDriver] = useState(savedConfig.connection?.jdbcDriver ?? "PostgreSQL");
  const [jdbcHost, setJdbcHost] = useState(savedConfig.connection?.jdbcHost ?? "");
  const [jdbcPort, setJdbcPort] = useState(savedConfig.connection?.jdbcPort ?? "5432");
  const [jdbcDb, setJdbcDb] = useState(savedConfig.connection?.jdbcDb ?? "");
  const [jdbcUser, setJdbcUser] = useState(savedConfig.connection?.jdbcUser ?? "");
  const [jdbcPass, setJdbcPass] = useState(savedConfig.connection?.jdbcPass ?? "");
  const [sftpHost, setSftpHost] = useState(savedConfig.connection?.sftpHost ?? "");
  const [sftpPort, setSftpPort] = useState(savedConfig.connection?.sftpPort ?? "22");
  const [sftpUser, setSftpUser] = useState(savedConfig.connection?.sftpUser ?? "");
  const [sftpPath, setSftpPath] = useState(savedConfig.connection?.sftpPath ?? "");
  const [sftpAuthMethod, setSftpAuthMethod] = useState(savedConfig.connection?.sftpAuthMethod ?? "password");
  const [sftpPass, setSftpPass] = useState(savedConfig.connection?.sftpPass ?? "");
  const [csvDelim, setCsvDelim] = useState(savedConfig.connection?.csvDelim ?? ",");
  const [csvEnc, setCsvEnc] = useState(savedConfig.connection?.csvEnc ?? "UTF-8");
  const [csvHeader, setCsvHeader] = useState(savedConfig.connection?.csvHeader ?? "first");

  const [jdbcTables, setJdbcTables] = useState(savedConfig.jdbc?.tables ?? [{ name: "factures", alias: "f" }]);
  const [jdbcJoins, setJdbcJoins] = useState(savedConfig.jdbc?.joins ?? []);
  const [jdbcWhere, setJdbcWhere] = useState(savedConfig.jdbc?.where ?? "");

  // Status workflow fields
  const [statusCol, setStatusCol] = useState(savedConfig.statusWorkflow?.statusColumn ?? pipeline?.statusColumn ?? "");
  const [allowedStatuses, setAllowedStatuses] = useState(savedConfig.statusWorkflow?.allowedStatuses ?? pipeline?.allowedStatuses ?? '["VALIDATED","PAID"]');
  const [provisionalStatuses, setProvisionalStatuses] = useState(savedConfig.statusWorkflow?.provisionalStatuses ?? pipeline?.provisionalStatuses ?? '["Reçu","En attente"]');
  const [finalStatuses, setFinalStatuses] = useState(savedConfig.statusWorkflow?.finalStatuses ?? pipeline?.finalStatuses ?? '["Comptabilisé","Validé"]');
  const [importStartDate, setImportStartDate] = useState(savedConfig.statusWorkflow?.importStartDate ?? pipeline?.importStartDate ?? "");

  const [scheduleMode, setScheduleMode] = useState(savedConfig.schedule?.scheduleMode ?? pipeline?.scheduleMode ?? "MANUAL");
  const [cronExpression, setCronExpression] = useState(savedConfig.schedule?.cronExpression ?? pipeline?.cronExpression ?? "0 0 2 * * ?");
  const [intervalMinutes, setIntervalMinutes] = useState(savedConfig.schedule?.intervalMinutes ?? pipeline?.intervalMinutes ?? "15");

  const [csvFile, setCsvFile] = useState(null);
  const [csvImportPhase, setCsvImportPhase] = useState("idle");
  const [csvImportLines, setCsvImportLines] = useState([]);
  const [csvDetectedFields, setCsvDetectedFields] = useState([]);
  const csvDropRef = useRef();

  const CSV_IMPORT_SEQUENCE = [
    { delay: 0, text: "$ anomalyiq import --source csv --validate", color: "#a8d8a8" },
    { delay: 320, text: "  Lecture du fichier…", color: "#94a3b8" },
    { delay: 700, text: "  Parsing en-têtes CSV…", color: "#94a3b8" },
    { delay: 1100, text: "  ✔ En-têtes détectés :", color: "#4ade80" },
    { delay: 1350, text: "__FIELDS__", color: "#60a5fa" },
    { delay: 1700, text: "  Validation des types…", color: "#94a3b8" },
    { delay: 2100, text: "  ✔ Colonnes montant   → numeric (float64)", color: "#4ade80" },
    { delay: 2400, text: "  ✔ Colonnes date      → datetime", color: "#4ade80" },
    { delay: 2700, text: "  ✔ Colonnes fournisseur → string", color: "#4ade80" },
    { delay: 3000, text: "  Chargement dans la mémoire pipeline…", color: "#94a3b8" },
    { delay: 3400, text: "__ROWS__", color: "#f9a8d4" },
    { delay: 3800, text: "  ✔ Import terminé avec succès", color: "#4ade80" },
    { delay: 4000, text: "  Pipeline prêt — passez à la connexion ↓", color: "#fbbf24" },
  ];

  const CSV_FIXTURES = [
    {
      name: "Factures Ask&Go mixed quality",
      file: "askgo_factures_mixed_quality.csv",
      desc: "Factures avec doublons, valeurs manquantes, invalid dates, tenant_red.",
      mapping: "invoice_ref -> ID, invoice_date -> date, supplier_name -> fournisseur, amount -> montant, category -> label, status -> statut",
    },
    {
      name: "Commandes budget 2026",
      file: "askgo_commandes_budget_2026.csv",
      desc: "Commandes avec budget_code, projection BUDGET_FOURN, ligne invalide.",
      mapping: "commande_id -> reference, commande_date -> date, vendor -> fournisseur, amount -> montant, budget_code -> budgetCode, status -> statut",
    },
    {
      name: "Generic expenses quality cases",
      file: "generic_expenses_quality_cases.csv",
      desc: "Colonnes differentes pour tester mapping et nettoyage generique.",
      mapping: "record_id -> ID, date_posted -> date, vendor_name -> fournisseur, gross_amount -> montant, expense_type -> label, approval_state -> statut",
    },
  ];

  const runCsvTerminal = useCallback((fields, rowCount) => {
    setCsvImportPhase("importing");
    setCsvImportLines([]);
    CSV_IMPORT_SEQUENCE.forEach(({ delay, text, color }) => {
      setTimeout(() => {
        setCsvImportLines((prev) => [
          ...prev,
          {
            text:
              text === "__FIELDS__"
                ? "    " + fields.slice(0, 8).join("  ·  ") + (fields.length > 8 ? `  +${fields.length - 8} autres` : "")
                : text === "__ROWS__"
                ? `  → ${rowCount.toLocaleString("fr-FR")} lignes importées`
                : text,
            color,
          },
        ]);
        if (text === "  Pipeline prêt — passez à la connexion ↓") {
          setCsvImportPhase("done");
          setCsvDetectedFields(fields);
          setTimeout(() => setWizardStep(2), 600);
        }
      }, delay);
    });
  }, []);

  const handleCsvFile = useCallback(
    async (file) => {
      if (!file) return;
      setCsvFile(file);
      try {
        const text = await file.text();
        const { headers, rows } = parseCSV(text);
        wsStore.csvHeaders = headers;
        wsStore.csvSampleRows = rows.slice(0, 5);
        wsStore.csvRawRows = rows;
        wsStore.invoices = rows.map((r, i) => ({
          invoice_ref: r.invoice_ref || `INV-${i + 1}`,
          invoice_date: r.invoice_date || r.date || "",
          amount: parseFloat(r.amount) || 0,
          supplier_code: r.supplier_code || r.supplier || "",
          label: r.label || "",
          entity: r.entity || "",
          status: r.status || "",
          due_date: r.due_date || "",
        }));
        wsStore.series = [];
        wsStore.alerts = [];
        wsStore.detectionRun = false;
        runCsvTerminal(headers, rows.length);
      } catch (e) {
        await wsAPI.importCSV();
        const preview = await wsAPI.previewCSV();
        runCsvTerminal(preview.headers, preview.row_count);
      }
    },
    [runCsvTerminal]
  );

  const loadCsvDemo = useCallback(async () => {
    const fixture = CSV_FIXTURES[0];
    const res = await fetch(`/sample-data/${fixture.file}`);
    const text = await res.text();
    const { headers, rows } = parseCSV(text);
    setCsvFile({ name: fixture.file });
    wsStore.csvHeaders = headers;
    wsStore.csvSampleRows = rows.slice(0, 5);
    wsStore.csvRawRows = rows;
    wsStore.invoices = rows.map((r, i) => ({
      invoice_ref: r.invoice_ref || r.commande_id || r.record_id || `ROW-${i + 1}`,
      invoice_date: r.invoice_date || r.commande_date || r.date_posted || r.date || "",
      amount: parseFloat(r.amount ?? r.gross_amount) || 0,
      supplier_code: r.supplier_code || r.supplier_name || r.vendor || r.vendor_name || "",
      label: r.category || r.budget_code || r.expense_type || "",
      status: r.status || r.approval_state || "",
      tenant_id: r.tenant_id || "",
    }));
    wsStore.series = [];
    wsStore.alerts = [];
    wsStore.detectionRun = false;
    runCsvTerminal(headers, rows.length);
  }, [runCsvTerminal]);

  const loadCsvFixture = useCallback(async (fixture) => {
    try {
      const res = await fetch(`/sample-data/${fixture.file}`);
      const text = await res.text();
      const { headers, rows } = parseCSV(text);
      setCsvFile({ name: fixture.file });
      wsStore.csvHeaders = headers;
      wsStore.csvSampleRows = rows.slice(0, 5);
      wsStore.csvRawRows = rows;
      wsStore.invoices = rows.map((r, i) => ({
        invoice_ref: r.invoice_ref || r.commande_id || r.record_id || `ROW-${i + 1}`,
        invoice_date: r.invoice_date || r.commande_date || r.date_posted || r.date || "",
        amount: parseFloat(r.amount ?? r.gross_amount) || 0,
        supplier_code: r.supplier_code || r.supplier_name || r.vendor || r.vendor_name || "",
        label: r.category || r.budget_code || r.expense_type || "",
        status: r.status || r.approval_state || "",
        tenant_id: r.tenant_id || "",
      }));
      wsStore.series = [];
      wsStore.alerts = [];
      wsStore.detectionRun = false;
      runCsvTerminal(headers, rows.length);
    } catch (e) {
      console.error("Failed to load CSV fixture", e);
    }
  }, [runCsvTerminal]);

  const canSubmit = name.trim().length >= 2 && (pipeline || tenant);

  const CONNS = [
    { id: "api", label: "API REST", sub: "HTTP / Bearer", LucideComp: Globe },
    { id: "jdbc", label: "JDBC", sub: "Base SQL", LucideComp: Database },
    { id: "sftp", label: "SFTP", sub: "Fichiers", LucideComp: FolderOpen },
    { id: "csv", label: "CSV", sub: "Import", LucideComp: FileText },
  ];

  const persist = () => {
    if (!canSubmit) return;
    const connectorName = connType === "api" ? "REST" : connType.toUpperCase();
    const configJson = {
      ...(savedConfig || {}),
      mode: pipeline ? "edit" : "create",
      connection: {
        type: connType,
        apiUrl,
        apiAuth,
        apiToken,
        jdbcDriver,
        jdbcHost,
        jdbcPort,
        jdbcDb,
        jdbcUser,
        jdbcPass,
        sftpHost,
        sftpPort,
        sftpUser,
        sftpPath,
        sftpAuthMethod,
        sftpPass,
        csvDelim,
        csvEnc,
        csvHeader,
        csvFileName: csvFile?.name || savedConfig.connection?.csvFileName || null,
      },
      jdbc: {
        tables: jdbcTables,
        joins: jdbcJoins,
        where: jdbcWhere,
      },
      detection: {
        tolerancePct: tolPct,
        toleranceDays: tolDays,
        kFactor,
      },
      schedule: {
        freq,
        scheduleMode,
        cronExpression,
        intervalMinutes,
      },
      automation: {
        mode: executionMode,
        autoRun: executionMode === "automated",
      },
      executionMode,
      statusWorkflow: {
        statusColumn: statusCol,
        allowedStatuses,
        provisionalStatuses,
        finalStatuses,
        importStartDate,
      },
      updatedAt: new Date().toISOString(),
    };
    const patch = {
      name: name.trim(),
      description: desc,
      connector: connectorName,
      status: active ? "actif" : "paused",
      kFactor,
      tolerancePct: tolPct,
      toleranceDays: tolDays,
      freq,
      erpPartnerId: pipeline?.erpPartnerId || (isSSO ? partner?.id : null),
      scheduleMode,
      cronExpression,
      intervalMinutes,
      statusColumn: statusCol,
      allowedStatuses,
      provisionalStatuses,
      finalStatuses,
      importStartDate,
      configJson,
    };
    if (pipeline) {
      updatePipelineStore(pipeline.id, patch);
      onSubmitted(pipeline.id);
    } else {
      const np = createPipelineStore({
        id: `mock-pipe-${Date.now()}`,
        tenantId: tenant.id,
        isCustom: connType === "csv",
        templateKey: connType === "csv" ? null : undefined,
        sourceType: connType === "csv" ? "CSV" : connType,
        connectorId: connType === "csv" ? null : undefined,
        ...patch
      });
      onSubmitted(np.id);
    }
  };

  /* ── Micro shared components ── */
  const LBL = ({ children }) => (
    <div style={{ fontSize: 10, fontWeight: 600, color: C.grey500, marginBottom: 6, letterSpacing: "0.02em" }}>
      {children}
    </div>
  );

  const Helper = ({ children }) => (
    <div style={{ fontSize: 10, color: C.grey400, marginTop: 4 }}>{children}</div>
  );

  const parseStatusTags = (value) => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    try {
      const parsed = JSON.parse(value || "[]");
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {}
    return String(value || "")
      .split(",")
      .map((x) => x.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  };

  const stringifyStatusTags = (tags) => JSON.stringify(tags);

  const TagInput = ({ value, onChange, placeholder, accent = C.info }) => {
    const tags = parseStatusTags(value);
    const [draft, setDraft] = useState("");
    const commit = () => {
      const next = draft.trim();
      if (!next) return;
      if (!tags.includes(next)) onChange(stringifyStatusTags([...tags, next]));
      setDraft("");
    };
    const remove = (tag) => onChange(stringifyStatusTags(tags.filter((x) => x !== tag)));
    return (
      <div
        className="input-field"
        style={{
          minHeight: 42,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          padding: "7px 10px",
          background: "rgba(255,255,255,.78)",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              borderRadius: 999,
              padding: "4px 8px",
              background: `${accent}12`,
              border: `1px solid ${accent}35`,
              color: accent,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", display: "inline-flex" }}
            >
              <X size={11} color={accent} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Backspace" && !draft && tags.length) remove(tags[tags.length - 1]);
          }}
          placeholder={tags.length ? "" : placeholder}
          style={{
            flex: 1,
            minWidth: 120,
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 12,
            fontFamily: "inherit",
            color: C.grey900,
          }}
        />
      </div>
    );
  };

  /* ── Section header with numbered badge (blue/teal variant matching screenshots) ── */
  const SectionHeader = ({ num, title, sub, color = "blue" }) => {
    const isBlue = color === "blue";
    const badge = isBlue ? S.badgeBlue : {
      ...S.badgeBlue,
      background: "rgba(217,79,61,.12)",
      border: "1.5px solid rgba(217,79,61,.25)",
      color: C.red,
    };
    const titleStyle = isBlue ? S.sectionTitleBlue : {
      ...S.sectionTitleBlue,
      color: C.red,
    };
    return (
      <div style={S.sectionHeader}>
        <span style={badge}>{num}</span>
        <span style={titleStyle}>{title}</span>
        {sub && <span style={S.sectionSub}>• {sub}</span>}
      </div>
    );
  };

  /* ── ConnTab ── */
  const ConnTab = () => {
    if (connType === "api")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <LBL>BASE URL</LBL>
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="input-field" placeholder="https://api.exemple.com/v1" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <LBL>AUTH</LBL>
              <select value={apiAuth} onChange={(e) => setApiAuth(e.target.value)} className="input-field">
                <option>Bearer token</option>
                <option>API Key</option>
                <option>Basic Auth</option>
                <option>OAuth 2.0</option>
              </select>
            </div>
            <div>
              <LBL>TOKEN / CLÉ</LBL>
              <input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} className="input-field" placeholder="••••••••••••" />
            </div>
          </div>
        </div>
      );

    if (connType === "jdbc")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Section 1: DB Connection ── */}
          <div style={{ paddingBottom: 12, borderBottom: `1px solid ${C.grey100}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(217,79,61,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.red }}>1</span>
              <LBL>CONNEXION BASE DE DONNÉES</LBL>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 70px", gap: 12, marginBottom: 12 }}>
              <div>
                <LBL>DRIVER</LBL>
                <select value={jdbcDriver} onChange={(e) => setJdbcDriver(e.target.value)} className="input-field">
                  <option>PostgreSQL</option><option>MySQL</option><option>MSSQL</option><option>Oracle</option>
                </select>
              </div>
              <div>
                <LBL>PORT</LBL>
                <input value={jdbcPort} onChange={(e) => setJdbcPort(e.target.value)} className="input-field" placeholder="5432" />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <LBL>HOST</LBL>
              <input value={jdbcHost} onChange={(e) => setJdbcHost(e.target.value)} className="input-field" placeholder="db.exemple.com" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <LBL>DATABASE</LBL>
              <input value={jdbcDb} onChange={(e) => setJdbcDb(e.target.value)} className="input-field" placeholder="erp_prod" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <LBL>UTILISATEUR</LBL>
                <input value={jdbcUser} onChange={(e) => setJdbcUser(e.target.value)} className="input-field" placeholder="readonly_user" />
              </div>
              <div>
                <LBL>MOT DE PASSE</LBL>
                <input type="password" value={jdbcPass} onChange={(e) => setJdbcPass(e.target.value)} className="input-field" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* ── Section 2: Tables & Alias ── */}
          <div style={{ paddingBottom: 12, borderBottom: `1px solid ${C.grey100}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(217,79,61,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.red }}>2</span>
              <LBL>TABLES &amp; ALIAS JDBC</LBL>
              <span style={{ fontSize: 9, color: C.grey400, marginLeft: 4 }}>1ère ligne = FROM principal</span>
            </div>
            <div style={{ background: "rgba(0,0,0,.02)", borderRadius: 10, border: `1px solid ${C.grey200}`, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", padding: "7px 12px", background: "rgba(0,0,0,.03)", borderBottom: `1px solid ${C.grey200}`, fontSize: 10, fontWeight: 600, color: C.grey500 }}>
                <span style={{ width: 28 }}>#</span>
                <span style={{ flex: 2 }}>Nom de table</span>
                <span style={{ width: 80 }}>Alias</span>
                <span style={{ width: 28 }} />
              </div>
              {jdbcTables.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderBottom: i < jdbcTables.length - 1 ? `1px solid ${C.grey100}` : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: i === 0 ? "rgba(217,79,61,.12)" : "rgba(0,0,0,.06)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: i === 0 ? C.red : C.grey500, flexShrink: 0 }}>
                    {i === 0 ? "F" : i}
                  </span>
                  <input value={t.name} onChange={(e) => setJdbcTables((ts) => ts.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))} className="input-field" style={{ flex: 2, fontSize: 11 }} placeholder="factures" />
                  <input value={t.alias} onChange={(e) => setJdbcTables((ts) => ts.map((r, idx) => (idx === i ? { ...r, alias: e.target.value } : r)))} className="input-field" style={{ width: 72, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }} placeholder="f" />
                  {jdbcTables.length > 1 && (
                    <button onClick={() => setJdbcTables((ts) => ts.filter((_, idx) => idx !== i))} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${C.grey200}`, background: "rgba(217,79,61,.06)", color: C.red, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setJdbcTables((ts) => [...ts, { name: "", alias: "" }])} style={{ fontSize: 11, fontWeight: 600, color: C.red, background: "rgba(217,79,61,.07)", border: `1px dashed ${C.redMid}`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
              + Ajouter une table
            </button>

            {jdbcTables.length > 1 && (
              <div style={{ marginBottom: 12 }}>
                <LBL>JOINTURES ({jdbcJoins.length})</LBL>
                {jdbcJoins.length === 0 && (
                  <div style={{ padding: "8px 12px", fontSize: 10, color: C.grey400, fontStyle: "italic", background: "rgba(0,0,0,.02)", borderRadius: 8, border: `1px dashed ${C.grey200}` }}>
                    Aucune jointure — ajoutez-en une ci-dessous
                  </div>
                )}
                {jdbcJoins.map((j, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "7px 10px", background: "rgba(0,0,0,.02)", borderRadius: 8, marginBottom: 6, border: `1px solid ${C.grey100}` }}>
                    <select value={j.type} onChange={(e) => setJdbcJoins((js) => js.map((r, idx) => (idx === i ? { ...r, type: e.target.value } : r)))} className="input-field" style={{ width: 80, fontSize: 10, padding: "4px 6px" }}>
                      <option>INNER</option><option>LEFT</option><option>RIGHT</option>
                    </select>
                    <span style={{ fontSize: 10, color: C.grey500, fontWeight: 700 }}>JOIN</span>
                    <input value={j.toAlias} onChange={(e) => setJdbcJoins((js) => js.map((r, idx) => (idx === i ? { ...r, toAlias: e.target.value } : r)))} className="input-field" style={{ width: 60, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "4px 6px" }} placeholder="il" />
                    <span style={{ fontSize: 10, color: C.grey500, fontWeight: 700 }}>ON</span>
                    <input value={j.condition} onChange={(e) => setJdbcJoins((js) => js.map((r, idx) => (idx === i ? { ...r, condition: e.target.value } : r)))} className="input-field" style={{ flex: 1, minWidth: 120, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "4px 6px" }} placeholder="f.id = il.facture_id" />
                    <span style={{ fontSize: 10, color: C.grey500, fontWeight: 700 }}>de</span>
                    <input value={j.fromAlias} onChange={(e) => setJdbcJoins((js) => js.map((r, idx) => (idx === i ? { ...r, fromAlias: e.target.value } : r)))} className="input-field" style={{ width: 60, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "4px 6px" }} placeholder="f" />
                    <button onClick={() => setJdbcJoins((js) => js.filter((_, idx) => idx !== i))} style={{ width: 22, height: 22, borderRadius: 6, border: `1px solid ${C.grey200}`, background: "rgba(217,79,61,.06)", color: C.red, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
                <button onClick={() => setJdbcJoins((js) => [...js, { fromAlias: "", toAlias: "", condition: "", type: "INNER" }])} style={{ fontSize: 11, fontWeight: 600, color: C.info, background: "rgba(59,130,246,.07)", border: `1px dashed rgba(59,130,246,.3)`, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", marginTop: 4 }}>
                  + Ajouter une jointure
                </button>
              </div>
            )}

            <div>
              <LBL>CLAUSE WHERE (optionnelle)</LBL>
              <input value={jdbcWhere} onChange={(e) => setJdbcWhere(e.target.value)} className="input-field" placeholder="f.statut = 'VALIDATED'" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} />
              <Helper>Utilisez les alias définis ci-dessus. Ex: f.statut = 'VALIDATED'</Helper>
            </div>

            {(jdbcTables[0]?.name || jdbcWhere) && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#0d1117", borderRadius: 10, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, lineHeight: 1.8, color: "#94a3b8" }}>
                <span style={{ color: "#60a5fa" }}>SELECT</span> *{" "}
                <span style={{ color: "#60a5fa" }}>FROM</span>{" "}
                <span style={{ color: "#4ade80" }}>{jdbcTables[0]?.name || "factures"}</span>{" "}
                <span style={{ color: "#f9a8d4" }}>{jdbcTables[0]?.alias || "f"}</span>
                {jdbcJoins.map((j, i) => (
                  <span key={i}>
                    <br />
                    <span style={{ color: "#60a5fa" }}>  {j.type} JOIN</span>{" "}
                    <span style={{ color: "#4ade80" }}>{jdbcTables.find((t) => t.alias === j.toAlias)?.name || j.toAlias}</span>{" "}
                    <span style={{ color: "#f9a8d4" }}>{j.toAlias}</span>{" "}
                    <span style={{ color: "#60a5fa" }}>ON</span> {j.condition}
                  </span>
                ))}
                {jdbcWhere && (
                  <span>
                    <br />
                    <span style={{ color: "#60a5fa" }}>WHERE</span> <span style={{ color: C.red }}>{jdbcWhere}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );

    if (connType === "sftp")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 70px", gap: 12 }}>
            <div><LBL>HOST</LBL><input value={sftpHost} onChange={(e) => setSftpHost(e.target.value)} className="input-field" placeholder="sftp.exemple.com" /></div>
            <div><LBL>PORT</LBL><input value={sftpPort} onChange={(e) => setSftpPort(e.target.value)} className="input-field" placeholder="22" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><LBL>UTILISATEUR</LBL><input value={sftpUser} onChange={(e) => setSftpUser(e.target.value)} className="input-field" placeholder="erp_export" /></div>
            <div><LBL>CHEMIN</LBL><input value={sftpPath} onChange={(e) => setSftpPath(e.target.value)} className="input-field" placeholder="/exports/" /></div>
          </div>
          <div>
            <LBL>AUTHENTIFICATION</LBL>
            <div style={{ display: "flex", gap: 8 }}>
              {[["password", "Mot de passe"], ["ssh", "Clé SSH"]].map(([id, lbl]) => (
                <button key={id} onClick={() => setSftpAuthMethod(id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${sftpAuthMethod === id ? C.red : C.grey200}`, background: sftpAuthMethod === id ? C.redPale : "#fff", color: sftpAuthMethod === id ? C.red : C.grey700 }}>{lbl}</button>
              ))}
            </div>
          </div>
          {sftpAuthMethod === "password" && (
            <div><LBL>MOT DE PASSE</LBL><input type="password" value={sftpPass} onChange={(e) => setSftpPass(e.target.value)} className="input-field" placeholder="••••••••" /></div>
          )}
        </div>
      );

    if (connType === "csv")
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {csvImportPhase === "idle" && (
            <>
              <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleCsvFile(e.dataTransfer.files[0]); }} onClick={() => csvDropRef.current?.click()} style={{ border: `2px dashed rgba(217,79,61,.3)`, borderRadius: 12, padding: "24px 14px", textAlign: "center", cursor: "pointer", background: "rgba(217,79,61,.02)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Upload size={28} color={C.red} strokeWidth={1.5} />
                <div style={{ fontSize: 13, fontWeight: 600, color: C.grey800 }}>Déposez votre CSV ici</div>
                <div style={{ fontSize: 11, color: C.grey500 }}>ou cliquez pour sélectionner · max 50 MB</div>
              </div>
              <input ref={csvDropRef} type="file" accept=".csv" style={{ display: "none" }} onChange={(e) => handleCsvFile(e.target.files[0])} />
              <button type="button" className="btn-ghost" onClick={loadCsvDemo} style={{ fontSize: 11, justifyContent: "center", gap: 6 }}>
                <Play size={11} color={C.grey500} /> Charger données démo (18 mois)
              </button>
              <div style={{ border: `1px solid ${C.grey200}`, borderRadius: 12, padding: 12, background: "rgba(255,255,255,.75)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <LBL>JEUX CSV FICTIFS POUR TEST</LBL>
                    <Helper>Chargez un fichier exemple ou telechargez-le pour tester upload, mapping, nettoyage et dashboard.</Helper>
                  </div>
                  <a href="/sample-data/README.md" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 10, padding: "5px 10px", textDecoration: "none" }}>
                    Voir README
                  </a>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
                  {CSV_FIXTURES.map((fixture) => (
                    <div key={fixture.file} style={{ border: `1px solid ${C.grey200}`, borderRadius: 10, padding: 10, background: "#fff", display: "flex", flexDirection: "column", gap: 7 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: C.grey900 }}>{fixture.name}</div>
                      <div style={{ fontSize: 10, color: C.grey500, lineHeight: 1.45 }}>{fixture.desc}</div>
                      <div style={{ fontSize: 9, color: C.info, lineHeight: 1.45, fontFamily: "'JetBrains Mono',monospace" }}>{fixture.mapping}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                        <button type="button" className="btn-primary" onClick={() => loadCsvFixture(fixture)} style={{ fontSize: 10, padding: "5px 9px" }}>
                          Charger
                        </button>
                        <a href={`/sample-data/${fixture.file}`} download className="btn-ghost" style={{ fontSize: 10, padding: "5px 9px", textDecoration: "none" }}>
                          Télécharger
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {csvImportPhase === "importing" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "rgba(96,165,250,.06)" }}>
              <Spinner size={14} />
              <span style={{ fontSize: 12, color: C.info }}>Import en cours…</span>
            </div>
          )}
          {csvImportPhase === "done" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 11px", borderRadius: 8, background: "rgba(34,197,94,.07)" }}>
                <CheckCircle size={13} color={C.success} strokeWidth={2} />
                <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>
                  {csvFile?.name ? `${csvFile.name} · ` : "Fichier chargé · "}{csvDetectedFields.length} champs détectés
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div><LBL>DÉLIMITEUR</LBL><select value={csvDelim} onChange={(e) => setCsvDelim(e.target.value)} className="input-field"><option value=",">, virgule</option><option value=";">; point-virgule</option><option value="\t">tabulation</option><option value="|">| pipe</option></select></div>
                <div><LBL>ENCODAGE</LBL><select value={csvEnc} onChange={(e) => setCsvEnc(e.target.value)} className="input-field"><option>UTF-8</option><option>ISO-8859-1</option><option>Windows-1252</option></select></div>
                <div><LBL>EN-TÊTES</LBL><select value={csvHeader} onChange={(e) => setCsvHeader(e.target.value)} className="input-field"><option value="first">Première ligne</option><option value="none">Aucun</option></select></div>
              </div>
            </>
          )}
        </div>
      );
    return null;
  };

  const SliderField = ({ label, value, min, max, step, onChange, fmt, hint }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
        <LBL>{label}</LBL>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.red, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(value)}</div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", height: 5 }} />
      {hint && <Helper>{hint}</Helper>}
    </div>
  );

  // Terminal connection state
  const [connPhase, setConnPhase] = useState("idle");
  const [connLines, setConnLines] = useState([]);
  const [connFields, setConnFields] = useState([]);
  const [connRowCount, setConnRowCount] = useState(0);

  const CONN_SEQUENCES = {
    api: [
      { delay: 0, text: "$ anomalyiq connect --type rest --auth bearer", color: "#a8d8a8" },
      { delay: 320, text: "  Résolution DNS…", color: "#94a3b8" },
      { delay: 700, text: "  Ouverture connexion HTTPS…", color: "#94a3b8" },
      { delay: 1050, text: "  Authentification Bearer token…", color: "#94a3b8" },
      { delay: 1400, text: "  ✔ Connexion établie", color: "#4ade80" },
      { delay: 1700, text: "  Découverte des endpoints…", color: "#94a3b8" },
      { delay: 2100, text: "  ✔ Schéma récupéré — 8 champs détectés", color: "#4ade80" },
      { delay: 2400, text: "__FIELDS__", color: "#60a5fa" },
      { delay: 2800, text: "  ✔ Test d'import (50 enregistrements)…", color: "#94a3b8" },
      { delay: 3200, text: "__ROWS__", color: "#f9a8d4" },
      { delay: 3600, text: "  ✔ Connexion API opérationnelle", color: "#4ade80" },
      { delay: 3900, text: "  Pipeline prêt pour l'analyse ML →", color: "#fbbf24" },
    ],
    jdbc: [
      { delay: 0, text: "$ anomalyiq connect --type jdbc --driver postgres", color: "#a8d8a8" },
      { delay: 320, text: "  Résolution hôte…", color: "#94a3b8" },
      { delay: 700, text: "  Connexion TCP port 5432…", color: "#94a3b8" },
      { delay: 1050, text: "  Authentification SQL…", color: "#94a3b8" },
      { delay: 1400, text: "  ✔ Connexion base de données établie", color: "#4ade80" },
      { delay: 1700, text: "  Introspection du schéma…", color: "#94a3b8" },
      { delay: 2100, text: "  ✔ Tables et colonnes récupérées", color: "#4ade80" },
      { delay: 2400, text: "__FIELDS__", color: "#60a5fa" },
      { delay: 2800, text: "  Échantillon de données (100 lignes)…", color: "#94a3b8" },
      { delay: 3200, text: "__ROWS__", color: "#f9a8d4" },
      { delay: 3600, text: "  ✔ Base de données opérationnelle", color: "#4ade80" },
      { delay: 3900, text: "  Pipeline prêt pour l'analyse ML →", color: "#fbbf24" },
    ],
    sftp: [
      { delay: 0, text: "$ anomalyiq connect --type sftp --port 22", color: "#a8d8a8" },
      { delay: 320, text: "  Résolution hôte SFTP…", color: "#94a3b8" },
      { delay: 700, text: "  Handshake SSH…", color: "#94a3b8" },
      { delay: 1050, text: "  Authentification…", color: "#94a3b8" },
      { delay: 1400, text: "  ✔ Session SFTP ouverte", color: "#4ade80" },
      { delay: 1700, text: "  Listage du répertoire…", color: "#94a3b8" },
      { delay: 2100, text: "  ✔ Fichiers CSV détectés", color: "#4ade80" },
      { delay: 2400, text: "__FIELDS__", color: "#60a5fa" },
      { delay: 2800, text: "  Lecture partielle (preview)…", color: "#94a3b8" },
      { delay: 3200, text: "__ROWS__", color: "#f9a8d4" },
      { delay: 3600, text: "  ✔ Source SFTP opérationnelle", color: "#4ade80" },
      { delay: 3900, text: "  Pipeline prêt pour l'analyse ML →", color: "#fbbf24" },
    ],
    csv: [
      { delay: 0, text: "$ anomalyiq import --source csv --validate", color: "#a8d8a8" },
      { delay: 320, text: "  Lecture du fichier…", color: "#94a3b8" },
      { delay: 700, text: "  Parsing en-têtes CSV…", color: "#94a3b8" },
      { delay: 1100, text: "  ✔ En-têtes détectés :", color: "#4ade80" },
      { delay: 1350, text: "__FIELDS__", color: "#60a5fa" },
      { delay: 1700, text: "  Validation des types…", color: "#94a3b8" },
      { delay: 2100, text: "  ✔ Colonnes montant   → numeric (float64)", color: "#4ade80" },
      { delay: 2400, text: "  ✔ Colonnes date      → datetime", color: "#4ade80" },
      { delay: 2700, text: "  ✔ Colonnes fournisseur → string", color: "#4ade80" },
      { delay: 3000, text: "  Chargement dans la mémoire pipeline…", color: "#94a3b8" },
      { delay: 3400, text: "__ROWS__", color: "#f9a8d4" },
      { delay: 3800, text: "  ✔ Import terminé avec succès", color: "#4ade80" },
      { delay: 4000, text: "  Pipeline prêt — analyse ML disponible →", color: "#fbbf24" },
    ],
  };

  const DEFAULT_FIELDS = {
    api: ["invoice_ref", "invoice_date", "amount", "supplier_code", "label", "entity", "status", "due_date"],
    jdbc: ["invoice_id", "date_facture", "montant_ttc", "code_fournisseur", "libelle", "entite", "statut", "echeance"],
    sftp: ["ref_facture", "date", "montant", "fournisseur", "service", "societe", "statut", "date_echeance"],
    csv: csvDetectedFields.length > 0 ? csvDetectedFields : ["invoice_ref", "invoice_date", "amount", "supplier_code", "label", "entity", "status", "due_date"],
  };

  const runConnTerminal = useCallback(() => {
    const fields = DEFAULT_FIELDS[connType] || DEFAULT_FIELDS.api;
    const rows = connType === "csv" ? wsStore.invoices.length || 247 : Math.floor(Math.random() * 241) + 180;
    setConnFields(fields);
    setConnRowCount(rows);
    setConnPhase("connecting");
    setConnLines([]);
    const seq = CONN_SEQUENCES[connType] || CONN_SEQUENCES.api;
    let lastDelay = 0;
    seq.forEach(({ delay, text, color }) => {
      lastDelay = Math.max(lastDelay, delay);
      setTimeout(() => {
        setConnLines((prev) => [
          ...prev,
          {
            text:
              text === "__FIELDS__"
                ? "    " + fields.slice(0, 8).join("  ·  ") + (fields.length > 8 ? `  +${fields.length - 8} autres` : "")
                : text === "__ROWS__"
                ? `  → ${rows.toLocaleString("fr-FR")} enregistrements chargés`
                : text,
            color,
          },
        ]);
      }, delay);
    });
    setTimeout(() => setConnPhase("done"), lastDelay + 200);
  }, [connType, csvDetectedFields]);

  const handleCreate = () => {
    if (!canSubmit) return;
    if (!pipeline && executionMode === "manual") {
      persist();
      return;
    }
    runConnTerminal();
  };
  const handleConfirmCreate = () => { persist(); };

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {connPhase !== "idle" ? (
        /* ── Terminal overlay ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: "20px 24px 16px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: connPhase === "done" ? "rgba(34,197,94,.12)" : "rgba(96,165,250,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {connPhase === "done" ? (
                <CheckCircle size={22} color={C.success} strokeWidth={2} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid rgba(96,165,250,.3)`, borderTopColor: C.info, animation: "spin 0.8s linear infinite" }} />
              )}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.grey900, letterSpacing: "-.2px" }}>
                {connPhase === "done" ? "Connexion établie — pipeline prêt" : "Établissement de la connexion…"}
              </div>
              <div style={{ fontSize: 11, color: C.grey500, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                {CONNS.find((c) => c.id === connType) && (() => { const conn = CONNS.find((c) => c.id === connType); return <conn.LucideComp size={11} color={C.grey400} strokeWidth={2} />; })()}
                {connType.toUpperCase()} · {name}
              </div>
            </div>
          </div>

          <div style={{ flex: 1, background: "#0d1117", borderRadius: 14, overflow: "hidden", fontFamily: "'JetBrains Mono',monospace", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "#161b22", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0 }}>
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginLeft: 10, fontWeight: 500 }}>anomalyiq — {connType === "csv" ? "import" : "connect"}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.18)", marginLeft: "auto" }}>{connType === "csv" && csvFile?.name ? csvFile.name : `${connType}.connection`}</span>
            </div>
            <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {connLines.map((line, i) => (
                <div key={i} className="fade-in" style={{ fontSize: 11, color: line.color, lineHeight: 1.7, whiteSpace: "pre", letterSpacing: ".01em" }}>{line.text}</div>
              ))}
              {connPhase === "connecting" && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", animation: "blink 1s step-end infinite" }}>▋</span>
                </div>
              )}
              {connPhase === "done" && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 8, letterSpacing: ".06em" }}>SCHÉMA DÉTECTÉ</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {connFields.map((f) => (
                      <span key={f} style={{ background: "rgba(34,197,94,.12)", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#4ade80", fontWeight: 600 }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,.25)" }}>{connRowCount.toLocaleString("fr-FR")} enregistrements prêts à l'analyse</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
            <button onClick={() => setConnPhase("idle")} className="btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>Modifier la configuration</button>
            <button onClick={handleConfirmCreate} className="btn-primary" style={{ fontSize: 13, padding: "8px 20px" }}>{pipeline ? "Sauvegarder" : "Créer le pipeline"}</button>
          </div>
        </div>
      ) : (
        /* ── Wizard ── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ flex: 1, display: "flex", gap: 24, minHeight: 0, padding: "20px 24px", background: "rgba(240,237,232,0.3)" }}>

            {/* ── Sidebar Stepper ── */}
            <div style={{ width: 230, borderRight: `1px solid ${C.grey200}`, paddingRight: 20, display: "flex", flexDirection: "column", gap: 20, flexShrink: 0 }}>
              {[
                { stepNum: 1, title: "1. Identité & Rythme", desc: "Nom, partenaire et planification" },
                { stepNum: 2, title: "2. Connexion Source", desc: "Credentials et type de connecteur" },
                { stepNum: 3, title: "3. Paramètres MAD", desc: "Seuils, tolérances et clusters" },
              ].map((s) => {
                const isPast = s.stepNum < wizardStep;
                const isCurrent = s.stepNum === wizardStep;
                const stepColor = isPast ? C.success : isCurrent ? C.red : C.grey400;
                return (
                  <div key={s.stepNum} style={{ display: "flex", flexDirection: "column", gap: 4, opacity: isCurrent ? 1 : 0.6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: isPast ? "rgba(34,197,94,0.15)" : isCurrent ? "rgba(217,79,61,0.15)" : "rgba(0,0,0,0.05)", border: `1.5px solid ${stepColor}`, color: stepColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                        {isPast ? <Check size={10} strokeWidth={3} color={isPast ? (s.stepNum < wizardStep && s.stepNum === 1 ? C.grey500 : C.success) : C.grey500} /> : s.stepNum}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isCurrent ? C.grey900 : C.grey600 }}>{s.title}</span>
                    </div>
                    <span style={{ fontSize: 10, color: C.grey400, marginLeft: 32 }}>{s.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* ── Main content ── */}
            <div style={{ flex: 1, padding: "20px 24px", background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ══ STEP 1 ══ */}
              {wizardStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ borderBottom: `1px solid ${C.grey100}`, paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: C.grey900 }}>Informations Générales</h3>
                    <p style={{ fontSize: 11, color: C.grey500 }}>Définissez le nom, la description et le mode d'exécution de ce pipeline.</p>
                  </div>
                  <div>
                    <LBL>NOM DU PIPELINE</LBL>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="ex. Surveillance factures Acme 2024" />
                  </div>
                  {pipeline?.erpPartnerId && (
                    <div>
                      <LBL>CONNEXION ERP ASSOCIÉE</LBL>
                      <div className="input-field" style={{ background: "rgba(0,0,0,.025)", color: C.grey500 }}>
                        {availablePartners.find((p) => p.id === pipeline.erpPartnerId)?.name || pipeline.erpPartnerId}
                      </div>
                      <Helper>La liaison ERP est gérée depuis Integrations par l'administrateur.</Helper>
                    </div>
                  )}
                  <div>
                    <LBL>DESCRIPTION</LBL>
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="input-field" style={{ resize: "none" }} placeholder="Décrivez ce que ce pipeline surveille…" />
                  </div>
                  <div>
                    <LBL>MODE D'EXÉCUTION</LBL>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { id: "automated", label: "Automatisé", desc: "Le moteur enchaîne mapping, nettoyage, séries, détection et ouvre le dashboard." },
                        { id: "manual", label: "Manuel", desc: "Vous parcourez chaque étape et validez les résultats intermédiaires." },
                      ].map((m) => {
                        const selected = executionMode === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setExecutionMode(m.id)}
                            style={{
                              textAlign: "left",
                              padding: "12px 14px",
                              borderRadius: 12,
                              border: `1.5px solid ${selected ? C.red : C.grey200}`,
                              background: selected ? "rgba(217,79,61,.06)" : "rgba(255,255,255,.75)",
                              color: selected ? C.red : C.grey700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 800 }}>{m.label}</div>
                            <div style={{ fontSize: 10, color: selected ? C.red : C.grey500, lineHeight: 1.45, marginTop: 4 }}>{m.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                    <Helper>La saisonnalité et les prévisions restent toujours détectées automatiquement par le moteur.</Helper>
                  </div>
                  <div style={{ borderBottom: `1px solid ${C.grey100}`, paddingBottom: 8, marginTop: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "#8B5CF6" }}>Rythme &amp; Planification</h3>
                    <p style={{ fontSize: 11, color: C.grey500 }}>Planifiez la fréquence d'exécution du pipeline.</p>
                  </div>
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {[
                        { id: "MANUAL", label: "Manuel", desc: "À la demande" },
                        { id: "CRON", label: "CRON", desc: "Planification cron" },
                        { id: "POLLING", label: "Polling", desc: "Intervalle régulier" },
                      ].map((m) => (
                        <button key={m.id} type="button" onClick={() => setScheduleMode(m.id)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${scheduleMode === m.id ? (m.id === "MANUAL" ? C.grey500 : m.id === "CRON" ? "#8B5CF6" : C.info) : C.grey200}`, background: scheduleMode === m.id ? (m.id === "MANUAL" ? "rgba(0,0,0,.05)" : m.id === "CRON" ? "rgba(139,92,246,.08)" : "rgba(59,130,246,.08)") : "transparent", color: scheduleMode === m.id ? (m.id === "MANUAL" ? C.grey700 : m.id === "CRON" ? "#8B5CF6" : C.info) : C.grey500, fontFamily: "inherit", textAlign: "center" }}>
                          {m.label}
                          <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2 }}>{m.desc}</div>
                        </button>
                      ))}
                    </div>
                    {scheduleMode === "CRON" && (
                      <div>
                        <LBL>EXPRESSION CRON</LBL>
                        <input value={cronExpression} onChange={(e) => setCronExpression(e.target.value)} className="input-field" placeholder="0 0 2 * * ?" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} />
                        <Helper>Syntaxe Quartz/Spring — ex: 0 0 2 * * ? = tous les jours à 2h00</Helper>
                      </div>
                    )}
                    {scheduleMode === "POLLING" && (
                      <div>
                        <LBL>INTERVALLE (MINUTES)</LBL>
                        <input type="number" value={intervalMinutes} onChange={(e) => setIntervalMinutes(e.target.value)} className="input-field" placeholder="15" style={{ width: 120, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} />
                        <Helper>Fréquence des vérifications en arrière-plan</Helper>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ STEP 2 ══ */}
              {wizardStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Connector type selector */}
                  <div>
                    <LBL>TYPE DE SOURCE</LBL>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {CONNS.map((c) => {
                        const sel = connType === c.id;
                        return (
                          <button key={c.id} type="button" onClick={() => setConnType(c.id)} style={{ padding: "10px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${sel ? "rgba(217,79,61,.35)" : "rgba(0,0,0,.07)"}`, background: sel ? "rgba(217,79,61,.07)" : "rgba(255,255,255,.7)", color: sel ? C.red : C.grey600, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: sel ? "0 2px 10px rgba(217,79,61,.12)" : "none" }}>
                            <c.LucideComp size={16} color={sel ? C.red : C.grey400} strokeWidth={2} />
                            <span>{c.label}</span>
                            <span style={{ fontSize: 8, fontWeight: 600, color: sel ? C.red : C.grey400, letterSpacing: "0.04em" }}>{c.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${C.grey100}`, paddingTop: 16 }}>
                    <ConnTab />
                  </div>

                  {/* ══════════════════════════════════════════
                      SECTION 3 — FILTRAGE CIBLÉ & WORKFLOW STATUTS
                      Styled to match screenshots exactly
                  ══════════════════════════════════════════ */}
                  <div style={{ borderTop: `1px solid #e2e8f0`, paddingTop: 20 }}>
                    <SectionHeader num="3" title="Filtrage Ciblé & Workflow Statuts" sub="optionnel" color="blue" />

                    {/* Row: status col + start date */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <LBL>COLONNE STATUT</LBL>
                        <input value={statusCol} onChange={(e) => setStatusCol(e.target.value)} className="input-field" placeholder="f.statut" />
                        <Helper>Ex: f.statut (JDBC) ou statut (CSV)</Helper>
                      </div>
                      <div>
                        <LBL>DATE DE DÉPART</LBL>
                        <input
                          type="date"
                          value={importStartDate}
                          onChange={(e) => setImportStartDate(e.target.value)}
                          className="input-field"
                          placeholder="dd/mm/yyyy"
                        />
                        <Helper>Ignorer les données antérieures à cette date</Helper>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <LBL>STATUTS AUTORISÉS</LBL>
                      <TagInput
                        value={allowedStatuses}
                        onChange={setAllowedStatuses}
                        placeholder="Ajouter un statut, puis Entrée"
                        accent={C.info}
                      />
                      <Helper>Seuls ces statuts seront importés dans le pipeline</Helper>
                    </div>

                    {/* Provisional / Final cards — 2 columns matching screenshot 3 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {/* Orange card — Statuts Provisoires */}
                      <div style={S.cardOrange}>
                        <div style={S.cardOrangeHeader}>
                          <Clock size={12} color="#d97706" strokeWidth={2} />
                          <span>Statuts Provisoires</span>
                        </div>
                        <TagInput
                          value={provisionalStatuses}
                          onChange={setProvisionalStatuses}
                          placeholder="Ajouter un statut provisoire"
                          accent="#d97706"
                        />
                        <div style={S.cardOrangeHelper}>
                          Fixent la date de réception. Données encore modifiables.
                        </div>
                      </div>

                      {/* Green card — Statuts Finaux */}
                      <div style={S.cardGreen}>
                        <div style={S.cardGreenHeader}>
                          <CheckCircle2 size={12} color="#16a34a" strokeWidth={2} />
                          <span>Statuts Finaux</span>
                        </div>
                        <TagInput
                          value={finalStatuses}
                          onChange={setFinalStatuses}
                          placeholder="Ajouter un statut final"
                          accent="#16a34a"
                        />
                        <div style={S.cardGreenHelper}>
                          Fixent le montant définitif. Clôture comptable.
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* ══ STEP 3 ══ */}
              {wizardStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ borderBottom: `1px solid ${C.grey100}`, paddingBottom: 8 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: C.grey900 }}>Paramètres Algorithmiques (MAD)</h3>
                    <p style={{ fontSize: 11, color: C.grey500 }}>Réglez la sensibilité et les tolérances du modèle d'intelligence artificielle.</p>
                  </div>
                  <SliderField label="TOLÉRANCE MONTANT" value={tolPct} min={0} max={50} step={5} onChange={setTolPct} fmt={(v) => `${v}%`} hint="Variation max par rapport à la prévision" />
                  <SliderField label="TOLÉRANCE DATES" value={tolDays} min={1} max={60} step={1} onChange={setTolDays} fmt={(v) => `${v} j`} />
                  <SliderField label="MINIMUM DE FACTURES PAR CLUSTER" value={kFactor} min={1} max={15} step={1} onChange={setKFactor} fmt={(v) => `${Math.round(v)} fact.`} hint="Nombre minimum de factures requis pour un cluster. En dessous de ce seuil, le cluster est automatiquement supprimé." />
                  <div style={{ padding: "11px 13px", background: "rgba(217,79,61,.05)", borderRadius: 10, display: "flex", gap: 9, alignItems: "flex-start", marginTop: 8 }}>
                    <Sparkles size={13} color={C.red} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 11, color: C.grey700, lineHeight: 1.5 }}>
                      {pipeline
                        ? "Les modifications sont appliquées immédiatement après sauvegarde."
                        : executionMode === "automated"
                        ? "Après création, le pipeline exécutera automatiquement toutes les étapes et ouvrira le dashboard final."
                        : "Après création, vous pourrez parcourir manuellement chaque étape du workspace."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Sticky Footer ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,.88)", background: "rgba(255,255,255,.72)", backdropFilter: "blur(18px)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {wizardStep === 1 ? (
                <button type="button" onClick={onCancel} className="btn-ghost" style={{ fontSize: 13 }}>Annuler</button>
              ) : (
                <button type="button" onClick={() => setWizardStep((s) => s - 1)} className="btn-ghost" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <ChevronLeft size={14} /> Précédent
                </button>
              )}
              {onOpenSeries && (
                <button type="button" onClick={onOpenSeries} className="btn-ghost" style={{ fontSize: 12, gap: 6, color: C.grey600 }}>
                  <FileText size={13} color={C.grey500} /> Config séries
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!canSubmit && name.trim().length < 2 && <span style={{ fontSize: 11, color: C.grey400 }}>Nom requis (min. 2 caractères)</span>}
              {wizardStep < 3 ? (
                <button type="button" onClick={() => setWizardStep((s) => s + 1)} disabled={wizardStep === 1 && name.trim().length < 2} className="btn-primary" style={{ fontSize: 13, padding: "10px 22px" }}>
                  Suivant <ArrowRight size={14} color="#fff" style={{ marginLeft: 4 }} />
                </button>
              ) : (
                <button type="button" onClick={handleCreate} disabled={!canSubmit} className="btn-primary" style={{ fontSize: 13, padding: "10px 22px" }}>
                  <Check size={14} color="#fff" />
                  {pipeline ? "Sauvegarder" : executionMode === "automated" ? "Créer et lancer" : "Créer le pipeline"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
