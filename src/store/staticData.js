/**
 * STATIC DATA — Single Source of Truth for ALL demo / mock data
 * Ask&Go ERP v2 Demo Mode
 *
 * Contains:
 *   - Raw database tables (suppliers, categories, factures, commandes, budgets, users)
 *   - Derived frontend tables (invoices, commandes_frontend)
 *   - Connector configuration (all 8 wizard steps)
 *   - Wizard UI constants (AUTH_FIELDS, PIPELINE_DEFS, DEMO_CONNECTORS, schemas, etc.)
 *   - Mock API response shapes (pre-built controller DTOs)
 *   - Helper utilities (generateFakeRows, buildWizardDataFromAnswers, inferColType)
 *
 * RULE: No other file in client/src should define hardcoded demo data.
 *       Import everything from here.
 */

import { Tag, Plug, Network, GitBranch, Calculator, Cpu, Sparkles, CheckCircle2, Database, Layers } from "lucide-react";

const U = (n) => `mock-uuid-${n}`;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — RAW DATABASE TABLES (exactly as they exist in askgo_db)
// ═══════════════════════════════════════════════════════════════════════════════

export const SUPPLIERS_TABLE = [
  { supplier_code: "EAU",   supplier_name: "EAU_SAISON" },
  { supplier_code: "FOURN", supplier_name: "FOURNITURES_BUREAU" },
  { supplier_code: "TEL",   supplier_name: "TELECOM_FIBRE" },
  { supplier_code: "RED",   supplier_name: "FOURNISSEUR_RED" },
];

export const CATEGORIES_TABLE = [
  { category_code: "EAU_CAT",      category_name: "Eau potable" },
  { category_code: "FOURN_CAT",    category_name: "Fournitures scolaires" },
  { category_code: "FIBRE_CAT",    category_name: "Fibre Optique" },
  { category_code: "INTERNET_CAT", category_name: "Internet ADSL" },
  { category_code: "RED_CAT",      category_name: "Services RED" },
];

function _buildFactures() {
  const rows = [];
  const FOURN_AMTS = [100,100,100,100,100,100,50,50,400,50,50,50];
  const FOURN_DAYS = [10,10,10,10,10,10,10,10,10,10,10,10];
  for (let yr of [2024, 2025, 2026]) {
    const months = yr === 2026 ? 5 : 12;
    for (let m = 1; m <= months; m++) {
      const mm = String(m).padStart(2, "0");
      rows.push({
        facture_id: `F-EAU-${yr}-${mm}`, tenant_id: "whitecape_ask",
        date: `${yr}-${mm}-15`, status: "COMPTABILISE",
        amount: yr === 2026 && m === 3 ? 280.00 : (m >= 6 && m <= 8) ? 240.00 : 120.00,
        supplier_code: "EAU", category_code: "EAU_CAT",
      });
    }
    for (let m = 0; m < months; m++) {
      const mm = String(m + 1).padStart(2, "0");
      rows.push({
        facture_id: `F-FOURN-${yr}-${mm}`, tenant_id: "whitecape_ask",
        date: `${yr}-${mm}-${String(FOURN_DAYS[m]).padStart(2, "0")}`,
        status: "COMPTABILISE", amount: yr === 2026 && m === 4 ? 260.00 : FOURN_AMTS[m],
        supplier_code: "FOURN", category_code: "FOURN_CAT",
      });
    }
    for (let m = 1; m <= months; m++) {
      const mm = String(m).padStart(2, "0");
      rows.push({
        facture_id: `F-TEL-F-${yr}-${mm}`, tenant_id: "whitecape_ask",
        date: `${yr}-${mm}-05`, status: "COMPTABILISE", amount: yr === 2026 && m === 4 ? 420.00 : 300.00,
        supplier_code: "TEL", category_code: "FIBRE_CAT",
      });
      rows.push({
        facture_id: `F-TEL-I-${yr}-${mm}`, tenant_id: "whitecape_ask",
        date: `${yr}-${mm}-05`, status: "COMPTABILISE", amount: 50.00,
        supplier_code: "TEL", category_code: "INTERNET_CAT",
      });
    }
  }
  rows.push(
    { facture_id: "F-RED-2024-01", tenant_id: "tenant_red", date: "2024-01-15", status: "COMPTABILISE", amount: 999.00, supplier_code: "RED", category_code: "RED_CAT" },
    { facture_id: "F-RED-2024-02", tenant_id: "tenant_red", date: "2024-02-15", status: "COMPTABILISE", amount: 999.00, supplier_code: "RED", category_code: "RED_CAT" },
    { facture_id: "F-RED-2025-01", tenant_id: "tenant_red", date: "2025-01-15", status: "COMPTABILISE", amount: 999.00, supplier_code: "RED", category_code: "RED_CAT" },
    { facture_id: "F-RED-2025-02", tenant_id: "tenant_red", date: "2025-02-15", status: "COMPTABILISE", amount: 999.00, supplier_code: "RED", category_code: "RED_CAT" }
  );
  return rows;
}
export const FACTURES_TABLE = _buildFactures();

function _buildCommandes() {
  const rows = [];
  const FOURN_AMTS = [100,100,100,100,100,100,50,50,400,50,50,50];
  const FOURN_DAYS = [10,10,10,10,10,10,10,10,10,10,10,10];
  for (let yr of [2024, 2025, 2026]) {
    const months = yr === 2026 ? 5 : 12;
    for (let m = 1; m <= months; m++) {
      const mm = String(m).padStart(2, "0");
      rows.push({
        commande_id: `C-EAU-${yr}-${mm}`, facture_id: `F-EAU-${yr}-${mm}`,
        date_cmd: `${yr}-${mm}-15`,
        amount: (m >= 6 && m <= 8) ? 240.00 : 120.00,
        supplier_code: "EAU", ligne_budgetaire: "BUDGET_EAU", status: "LIVRE",
      });
    }
    for (let m = 0; m < months; m++) {
      const mm = String(m + 1).padStart(2, "0");
      rows.push({
        commande_id: `C-FOURN-${yr}-${mm}`, facture_id: `F-FOURN-${yr}-${mm}`,
        date_cmd: `${yr}-${mm}-${String(FOURN_DAYS[m]).padStart(2, "0")}`,
        amount: FOURN_AMTS[m],
        supplier_code: "FOURN", ligne_budgetaire: "BUDGET_FOURN", status: "LIVRE",
      });
    }
    for (let m = 1; m <= months; m++) {
      const mm = String(m).padStart(2, "0");
      rows.push({
        commande_id: `C-TEL-F-${yr}-${mm}`, facture_id: `F-TEL-F-${yr}-${mm}`,
        date_cmd: `${yr}-${mm}-05`, amount: 300.00,
        supplier_code: "TEL", ligne_budgetaire: "BUDGET_TEL", status: "LIVRE",
      });
      rows.push({
        commande_id: `C-TEL-I-${yr}-${mm}`, facture_id: `F-TEL-I-${yr}-${mm}`,
        date_cmd: `${yr}-${mm}-05`, amount: 50.00,
        supplier_code: "TEL", ligne_budgetaire: "BUDGET_TEL", status: "LIVRE",
      });
    }
  }
  return rows;
}
export const COMMANDES_TABLE = _buildCommandes();

export const BUDGETS_TABLE = [
  { budget_id: "B-EAU-2026",   tenant_id: "whitecape_ask", year: 2026, ligne_budgetaire: "BUDGET_EAU",   libelle: "Eau potable annuelle",     budget_alloue: 2160.00, montant_engage: 0, montant_consomme: 0, status: "ACTIF" },
  { budget_id: "B-FOURN-2026", tenant_id: "whitecape_ask", year: 2026, ligne_budgetaire: "BUDGET_FOURN", libelle: "Fournitures scolaires",    budget_alloue: 1000.00, montant_engage: 0, montant_consomme: 0, status: "ACTIF" },
  { budget_id: "B-TEL-2026",   tenant_id: "whitecape_ask", year: 2026, ligne_budgetaire: "BUDGET_TEL",   libelle: "Telecom fibre + internet", budget_alloue: 4200.00, montant_engage: 0, montant_consomme: 0, status: "ACTIF" },
];

export const SETTINGS_DEFAULTS = {
  pipelineMode: "automated",
  alertChannel: "inapp",
  storageMode: "shared",
  authMode: "oauth",
  anomalyMinInvoices: 3,
  anomalyTolerancePct: 10,
  lightMode: true,
  compactMode: false,
};

export const SETTINGS_OPTIONS = {
  pipelineModes: [["manual", "Manuel"], ["automated", "Automatise"]],
  alertChannels: [["inapp", "In-app"], ["email", "Email"], ["webhook", "Webhook mock"]],
  storageModes: [["shared", "Base partagee"], ["dedicated", "Base isolee"]],
  authModes: [["oauth", "OAuth 2.0"], ["apikey", "Cle API"], ["basic", "Basic Auth"], ["jdbc", "JDBC"]],
};

export const USERS_TABLE = [
  { id: U(1), name: "Administrateur", username: "admin", password: "admin123", roles: ["ADMIN"], isEngineAdmin: true, color: "#D94F3D" },
  { id: U(2), name: "Whitecape Technology", username: "whitecapeTech", password: "@whitecapeTech123", roles: ["TENANT"], isEngineAdmin: false, logo: "WH", color: "#3B82F6", automationEnabled: true },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — DERIVED FRONTEND TABLES (mapped from raw tables for UI consumption)
// ═══════════════════════════════════════════════════════════════════════════════

export const INVOICES_TABLE = FACTURES_TABLE
  .filter(f => f.tenant_id === "whitecape_ask" && f.date.startsWith("2026-"))
  .map(f => {
    const injectedAnomaly = ["F-EAU-2026-03", "F-FOURN-2026-05", "F-TEL-F-2026-04"].includes(f.facture_id);
    return {
      id: f.facture_id,
      tenantId: U(2),
      tenant_id: f.tenant_id,
      invoiceId: f.facture_id,
      reference: f.facture_id,
      invoiceDate: f.date,
      date: f.date,
      supplier:
        f.supplier_code === "EAU" ? "EAU_SAISON"
        : f.supplier_code === "FOURN" ? "FOURNITURES_BUREAU"
        : "TELECOM_FIBRE",
      supplierName:
        f.supplier_code === "EAU" ? "EAU_SAISON"
        : f.supplier_code === "FOURN" ? "FOURNITURES_BUREAU"
        : "TELECOM_FIBRE",
      label:
        f.category_code === "EAU_CAT" ? "Eau potable"
        : f.category_code === "FOURN_CAT" ? "Fournitures scolaires"
        : f.category_code === "FIBRE_CAT" ? "Fibre Optique"
        : "Internet ADSL",
      amount: f.amount,
      status: injectedAnomaly ? "anomaly" : "normal",
      anomalyType: injectedAnomaly ? "AMOUNT_SPIKE" : null,
      anomalyScore: injectedAnomaly ? 0.96 : null,
      score: injectedAnomaly ? 0.96 : null,
      isFinal: true,
      accountingStatus: "VALIDATED",
    };
  });

function _buildHistoricalInvoices() {
  return FACTURES_TABLE
    .filter(f => f.tenant_id === "whitecape_ask" && (f.date.startsWith("2024-") || f.date.startsWith("2025-")))
    .map(f => ({
      id: f.facture_id,
      invoiceId: f.facture_id,
      invoiceDate: f.date,
      date: f.date,
      supplier:
        f.supplier_code === "EAU" ? "EAU_SAISON"
        : f.supplier_code === "FOURN" ? "FOURNITURES_BUREAU"
        : "TELECOM_FIBRE",
      supplierName:
        f.supplier_code === "EAU" ? "EAU_SAISON"
        : f.supplier_code === "FOURN" ? "FOURNITURES_BUREAU"
        : "TELECOM_FIBRE",
      label:
        f.category_code === "EAU_CAT" ? "Eau potable"
        : f.category_code === "FOURN_CAT" ? "Fournitures scolaires"
        : f.category_code === "FIBRE_CAT" ? "Fibre Optique"
        : "Internet ADSL",
      amount: f.amount,
      status: "normal",
      isFinal: true,
    }));
}

export const HISTORICAL_INVOICES_TABLE = _buildHistoricalInvoices();

export const COMMANDES_FRONTEND_TABLE = COMMANDES_TABLE.map((c) => ({
  id: c.commande_id,
  commandeRef: c.commande_id,
  date: c.date_cmd,
  commandeDate: c.date_cmd,
  supplier:
    c.supplier_code === "EAU" ? "EAU_SAISON"
    : c.supplier_code === "FOURN" ? "FOURNITURES_BUREAU"
    : "TELECOM_FIBRE",
  budgetCode: c.ligne_budgetaire,
  label:
    c.ligne_budgetaire === "BUDGET_EAU" ? "Eau potable annuelle"
    : c.ligne_budgetaire === "BUDGET_FOURN" ? "Fournitures scolaires"
    : "Telecom fibre + internet",
  orderedAmount: c.amount,
  receivedAmount: c.amount,
  status: c.ligne_budgetaire === "BUDGET_FOURN" ? "OVER_BUDGET" : "ON_TRACK",
  fiscalYear: parseInt(c.date_cmd?.slice(0, 4)) || 2024,
}));

export const COMMAND_BUDGET_SERIES_TABLE = BUDGETS_TABLE.map((b) => {
  const currentRows = COMMANDES_TABLE.filter(c => c.ligne_budgetaire === b.ligne_budgetaire && c.date_cmd.startsWith("2026-"));
  const historicalRows = COMMANDES_TABLE.filter(c => c.ligne_budgetaire === b.ligne_budgetaire && (c.date_cmd.startsWith("2024-") || c.date_cmd.startsWith("2025-")));
  const monthlyProfile = Array.from({ length: 12 }, (_, idx) => {
    const rowsForMonth = historicalRows.filter(c => Number(c.date_cmd.slice(5, 7)) === idx + 1);
    return rowsForMonth.reduce((sum, c) => sum + c.amount, 0) / Math.max(1, new Set(rowsForMonth.map(c => c.date_cmd.slice(0, 4))).size);
  });
  const totalCommandes = currentRows.reduce((sum, c) => sum + c.amount, 0);
  const realizedAtJune = totalCommandes;
  const remainingForecast = monthlyProfile.slice(5).reduce((sum, amount) => sum + amount, 0);
  const projection = realizedAtJune + remainingForecast;
  const overrunAmount = Math.max(0, projection - b.budget_alloue);
  return {
    budgetCode: b.ligne_budgetaire,
    label: b.libelle,
    orderCount: currentRows.length,
    totalCommandes,
    budgetAlloue: b.budget_alloue,
    realizedAtJune,
    remainingForecast,
    projection,
    overrunAmount,
    status: projection > b.budget_alloue ? "BUDGET_OVERRUN" : "ON_TRACK",
    severity: projection > b.budget_alloue * 1.05 ? "critical" : projection > b.budget_alloue ? "warning" : "info",
    monthlyProfile,
  };
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — CONNECTOR CONFIG (Wizard 8 Steps)
// ═══════════════════════════════════════════════════════════════════════════════

export const CONNECTOR_CONFIG = {
  step1_identity: {
    name: "Ask&Go ERP",
    description: "Connecteur ERP multi-tenant pour import, pipelines et budgets",
    type: "ERP",
    authType: "JWT_SIGNED",
  },
  step2_authentication: {
    publicKey: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----",
    apiEndpoint: null,
    apiAuthHeader: null,
    apiAuthToken: null,
  },
  step3_database: {
    jdbcUrl: "jdbc:postgresql://localhost:5432/askgo_db",
    jdbcUsername: "postgres",
    jdbcPassword: "••••••••",
    driverClass: "org.postgresql.Driver",
  },
  step4_schema: {
    mainTable: "factures",
    joinTables: [
      { table: "suppliers", alias: "s", joinType: "INNER", onCondition: "factures.supplier_code = s.supplier_code" },
      { table: "categories", alias: "c", joinType: "INNER", onCondition: "factures.category_code = c.category_code" },
    ],
  },
  step5_fieldMapping: {
    invoiceId: "factures.facture_id",
    supplierName: "s.supplier_name",
    invoiceDate: "factures.date",
    amount: "factures.amount",
    status: "factures.status",
    label: "c.category_name",
  },
  step6_statuses: {
    importStatuses: ["RECU", "COMPTABILISE"],
    provisionalStatuses: ["RECU"],
    finalStatuses: ["COMPTABILISE"],
    importStatusColumn: "factures.status",
  },
  step7_templates: {
    facture: {
      key: "facture",
      name: "Factures — import standard",
      description: "Importe les factures avec creation de series",
      enabled: true,
      tables: ["factures", "suppliers", "categories"],
      joins: [
        "s.supplier_code = factures.supplier_code",
        "c.category_code = factures.category_code",
      ],
      conditions: [
        "factures.tenant_id = '${tenantCode}'",
        "factures.status IN ('RECU', 'COMPTABILISE')",
      ],
      groupByCols: ["s.supplier_name", "c.category_name"],
      fieldMappings: {
        invoiceId: "factures.facture_id",
        supplierName: "s.supplier_name",
        invoiceDate: "factures.date",
        amount: "factures.amount",
        status: "factures.status",
        label: "c.category_name",
      },
      tolerancePct: 0.15,
      toleranceDays: 45,
      importStatusColumn: "factures.status",
      importStatuses: ["RECU", "COMPTABILISE"],
      provisionalStatuses: ["RECU"],
      finalStatuses: ["COMPTABILISE"],
    },
    commande: {
      key: "commande",
      name: "Commandes — import bons de commande",
      description: "Importe les commandes pour analyse budget",
      enabled: true,
      tables: ["commandes"],
      joins: [],
      conditions: ["commandes.status != 'ANNULE'"],
      groupByCols: ["supplierName"],
      fieldMappings: {
        commandeRef: "commandes.commande_id",
        commandeDate: "commandes.date_cmd",
        amount: "commandes.amount",
        supplierName: "commandes.supplier_code",
        budgetCode: "commandes.ligne_budgetaire",
        category: "commandes.category",
        status: "commandes.status",
      },
      tolerancePct: 0.10,
      toleranceDays: 30,
    },
    avoir: {
      key: "avoir",
      name: "Avoirs — import notes de credit",
      description: "Importe les avoirs et notes de credit",
      enabled: true,
      tables: ["factures"],
      joins: [],
      conditions: ["factures.tenant_id = '${tenantCode}'", "factures.status = 'AVOIR'"],
      groupByCols: ["factures.supplier_code"],
      fieldMappings: {
        invoiceId: "factures.facture_id",
        supplierName: "factures.supplier_code",
        invoiceDate: "factures.date",
        amount: "factures.amount",
        label: "factures.category_code",
      },
      tolerancePct: 0.15,
      toleranceDays: 45,
    },
  },
  step8_budgetAndDefaults: {
    budgetTemplate: {
      mainTable: "budgets",
      joinTables: [],
      conditions: [
        "budgets.tenant_id = '${tenantCode}'",
        "budgets.year = ${year}",
      ],
      mapping: {
        budgetCode: "budgets.ligne_budgetaire",
        label: "budgets.libelle",
        allocatedAmount: "budgets.budget_alloue",
      },
    },
    tenantDefaults: {
      defaultTolerancePct: 0.15,
      defaultToleranceDays: 45,
      autoCreateSeries: true,
      autoDetectAnomalies: true,
      budgetAnalysisEnabled: true,
      commandeImportEnabled: true,
      fiscalYearStartMonth: 1,
    },
    mappingLocked: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — WIZARD UI CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const AUTH_FIELDS = {
  NONE: [],
  BASIC: [
    { key: "username", label: "Utilisateur", type: "text" },
    { key: "password", label: "Mot de passe", type: "password" }
  ],
  API_KEY: [
    { key: "apiKey", label: "Clé API", type: "password" },
    { key: "apiKeyHeader", label: "Nom du header", type: "text", placeholder: "X-API-Key" }
  ],
  OAUTH2: [
    { key: "clientId", label: "Client ID", type: "text" },
    { key: "clientSecret", label: "Client Secret", type: "password" },
    { key: "tokenUrl", label: "Token URL", type: "text" },
    { key: "scopes", label: "Scopes", type: "text", placeholder: "read write" }
  ],
  JWT_SIGNED: [
    { key: "publicKey", label: "Clé publique (PEM)", type: "textarea" },
    { key: "issuer", label: "Issuer", type: "text" },
    { key: "audience", label: "Audience", type: "text" },
    { key: "algorithm", label: "Algorithme", type: "select", options: ["RS256", "RS384", "RS512", "ES256", "HS256"] }
  ],
  SAML: [
    { key: "entityId", label: "Entity ID", type: "text" },
    { key: "ssoUrl", label: "SSO URL", type: "text" },
    { key: "certificate", label: "Certificat X.509", type: "textarea" }
  ],
};

export const PIPELINE_DEFS = {
  facture: {
    label: "Factures", color: "#D94F3D", Icon: Database,
    fixedFields: [
      { key: "invoiceDate", label: "Date Facture / Invoice Date", required: true },
      { key: "amount", label: "Montant / Amount", required: true },
      { key: "status", label: "Statut / Status", required: true },
      { key: "supplierName", label: "Groupe: Fournisseur / Supplier", required: true },
      { key: "label", label: "Groupe: Label / Catégorie", required: true },
    ],
    defaultGroupByCols: ["supplierName", "label"],
    allowExtraFields: true, hasGroupBy: true
  },
  commande: {
    label: "Commandes", color: "#3b82f6", Icon: Layers,
    fixedFields: [
      { key: "commandeDate", label: "Date commande", required: true },
      { key: "amount", label: "Montant", required: true },
      { key: "status", label: "Statut", required: true },
      { key: "budgetCode", label: "Groupe: Ligne budgétaire", required: false },
      { key: "category", label: "Groupe: Catégorie", required: false },
    ],
    defaultGroupByCols: ["budgetCode"],
    allowExtraFields: true, hasGroupBy: true
  },
};

export const GENERIC_SCHEMA = {
  tables: [
    { name: "factures", cols: ["facture_id", "tenant_id", "date", "status", "amount", "supplier_code", "category_code"], rowCount: 50 },
    { name: "suppliers", cols: ["supplier_code", "supplier_name"], rowCount: 4 },
    { name: "categories", cols: ["category_code", "category_name"], rowCount: 5 },
    { name: "commandes", cols: ["commande_id", "facture_id", "date_cmd", "amount", "supplier_code", "ligne_budgetaire", "category", "status"], rowCount: 36 },
    { name: "budgets", cols: ["budget_id", "tenant_id", "year", "ligne_budgetaire", "libelle", "budget_alloue", "montant_engage", "montant_consomme", "status"], rowCount: 3 },
  ],
  rels: [
    { from: "factures", to: "suppliers", col: "supplier_code", type: "N:1" },
    { from: "factures", to: "categories", col: "category_code", type: "N:1" },
    { from: "commandes", to: "factures", col: "facture_id", type: "N:1" },
    { from: "commandes", to: "suppliers", col: "supplier_code", type: "N:1" },
    { from: "commandes", to: "budgets", col: "ligne_budgetaire", type: "N:1" },
  ],
};

export function normalizeTableName(name = "table") {
  const clean = String(name)
    .replace(/\.[^.]+$/, "")
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return clean || "table";
}

export function buildCsvSchema(files = []) {
  return {
    tables: files.map((file, index) => ({
      name: normalizeTableName(file.tableName || file.name || `csv_table_${index + 1}`),
      cols: Array.isArray(file.cols) && file.cols.length ? file.cols : ["id", "date", "amount", "status"],
      rowCount: file.rowCount || 0,
      source: "csv",
      fileName: file.name || file.fileName || `csv_table_${index + 1}.csv`,
    })),
    rels: [],
  };
}

export const CSV_SOURCE_PRESETS = [
  {
    type: "facture",
    label: "Factures CSV",
    name: "demo_factures_2026.csv",
    tableName: "factures_csv",
    cols: ["invoice_ref", "invoice_date", "supplier_code", "supplier_name", "amount", "currency", "category", "status", "tenant_id"],
    rowCount: 248,
  },
  {
    type: "commande",
    label: "Commandes CSV",
    name: "demo_commandes_2026.csv",
    tableName: "commandes_csv",
    cols: ["commande_id", "commande_date", "vendor_code", "vendor_name", "amount", "budget_code", "category", "status", "tenant_id"],
    rowCount: 136,
  },
  {
    type: "budget",
    label: "Budgets CSV",
    name: "demo_budgets_2026.csv",
    tableName: "budgets_csv",
    cols: ["budget_id", "year", "budget_code", "libelle", "budget_alloue", "montant_engage", "montant_consomme", "tenant_id"],
    rowCount: 42,
  },
];

export function buildApiSchema(resources = []) {
  return {
    tables: resources.map((resource, index) => ({
      name: normalizeTableName(resource.name || resource.path || `api_resource_${index + 1}`),
      cols: Array.isArray(resource.cols) && resource.cols.length ? resource.cols : ["id", "date", "amount", "status"],
      rowCount: resource.rowCount || 100,
      source: "api",
      endpoint: resource.path || resource.endpoint || "",
    })),
    rels: [],
  };
}

export const MOCK_SCHEMAS = {
  c1: {
    tables: [
      { name: "BKPF", cols: ["MANDT", "BUKRS", "BELNR", "GJAHR", "BLART", "BLDAT", "BUDAT", "WAERS", "XBLNR", "BKTXT"], rowCount: 842301 },
      { name: "BSEG", cols: ["MANDT", "BUKRS", "BELNR", "GJAHR", "BUZEI", "KOART", "LIFNR", "KUNNR", "SAKNR", "DMBTR", "WRBTR", "SGTXT", "ZFBDT"], rowCount: 2104560 },
      { name: "LFA1", cols: ["MANDT", "LIFNR", "LAND1", "NAME1", "NAME2", "ORT01", "PSTLZ", "STRAS", "TELF1", "WAERS", "ZTERM"], rowCount: 14200 },
      { name: "EKKO", cols: ["MANDT", "EBELN", "BUKRS", "BSTYP", "BSART", "LIFNR", "EKGRP", "BEDAT", "WAERS", "NETWR"], rowCount: 198400 },
      { name: "EKPO", cols: ["MANDT", "EBELN", "EBELP", "MATNR", "TXZ01", "MENGE", "MEINS", "NETPR", "NETWR", "ELIKZ"], rowCount: 512000 },
      { name: "CSKS", cols: ["MANDT", "KOKRS", "KOSTL", "DATBI", "DATAB", "BKZKP", "WAERS", "TXKST", "BUDGET_ANNUEL"], rowCount: 3200 },
      { name: "T001", cols: ["MANDT", "BUKRS", "BUTXT", "ORT01", "LAND1", "WAERS", "SPRAS"], rowCount: 4 },
    ],
    rels: [
      { from: "BKPF", to: "BSEG", col: "BELNR+GJAHR", type: "1:N" },
      { from: "BSEG", to: "LFA1", col: "LIFNR", type: "N:1" },
      { from: "EKKO", to: "EKPO", col: "EBELN", type: "1:N" },
      { from: "EKKO", to: "LFA1", col: "LIFNR", type: "N:1" },
      { from: "BSEG", to: "CSKS", col: "KOSTL", type: "N:1" },
    ],
  },
  c2: {
    tables: [
      { name: "FACTURES", cols: ["ID_FACTURE", "NUM_PIECE", "DATE_FACT", "DATE_ECHE", "CODE_FOUR", "MONTANT_HT", "MONTANT_TTC", "STATUT", "DEVISE", "SAISIE_PAR"], rowCount: 67420 },
      { name: "FOURNISSEURS", cols: ["CODE_FOUR", "NOM", "ADRESSE", "VILLE", "PAYS", "SIRET", "COMPTE_COMPTA", "DELAI_PAIEMENT"], rowCount: 2140 },
      { name: "COMMANDES", cols: ["NUM_COMMANDE", "DATE_CMD", "CODE_FOUR", "MONTANT_HT", "STATUT", "LIVRAISON_PREV", "VALIDE_PAR"], rowCount: 48200 },
      { name: "LIGNES_FACTURE", cols: ["ID_LIGNE", "ID_FACTURE", "CODE_ARTICLE", "DESIGNATION", "QTE", "PU_HT", "REMISE", "MONTANT_LIGNE"], rowCount: 234800 },
      { name: "BUDGETS", cols: ["ID_BUDGET", "ANNEE", "CODE_CENTRE", "LIBELLE", "MONTANT_ALLOUE", "MONTANT_ENGAGE", "MONTANT_CONSOM", "STATUT"], rowCount: 840 },
      { name: "CENTRES_COUT", cols: ["CODE_CENTRE", "LIBELLE", "RESP_CENTRE", "BUDGET_ANNUEL", "ACTIF"], rowCount: 48 },
      { name: "ARTICLES", cols: ["CODE_ARTICLE", "DESIGNATION", "FAMILLE", "UNITE", "PRIX_ACHAT", "TVA"], rowCount: 8900 },
    ],
    rels: [
      { from: "FACTURES", to: "FOURNISSEURS", col: "CODE_FOUR", type: "N:1" },
      { from: "FACTURES", to: "COMMANDES", col: "NUM_COMMANDE", type: "N:1" },
      { from: "LIGNES_FACTURE", to: "FACTURES", col: "ID_FACTURE", type: "N:1" },
      { from: "LIGNES_FACTURE", to: "ARTICLES", col: "CODE_ARTICLE", type: "N:1" },
      { from: "BUDGETS", to: "CENTRES_COUT", col: "CODE_CENTRE", type: "N:1" },
      { from: "COMMANDES", to: "FOURNISSEURS", col: "CODE_FOUR", type: "N:1" },
    ],
  },
};

export const DEMO_CONNECTORS = [
  {
    id: "mock-conn-1",
    name: CONNECTOR_CONFIG.step1_identity.name,
    logo: "AG",
    color: "#714B67",
    category: "erp",
    status: "connected",
    authType: CONNECTOR_CONFIG.step1_identity.authType,
    description: CONNECTOR_CONFIG.step1_identity.description,
    jdbcUrl: CONNECTOR_CONFIG.step3_database.jdbcUrl,
    jdbcUsername: CONNECTOR_CONFIG.step3_database.jdbcUsername,
    jdbcPassword: CONNECTOR_CONFIG.step3_database.jdbcPassword,
    connectionType: "jdbc",
    publicKey: CONNECTOR_CONFIG.step2_authentication.publicKey,
    apiEndpoint: CONNECTOR_CONFIG.step2_authentication.apiEndpoint,
    apiAuthToken: CONNECTOR_CONFIG.step2_authentication.apiAuthToken,
    connectorType: "ERP",
    selectedTables: ["factures", "suppliers", "categories", "commandes", "budgets"],
    pipelines: {
      facture: {
        enabled: true,
        tables: ["factures", "suppliers", "categories"],
        joins: ["suppliers.supplier_code = factures.supplier_code", "categories.category_code = factures.category_code"],
        conditions: ["factures.tenant_id = '${tenantCode}'", "factures.status IN ('RECU', 'COMPTABILISE')"],
        fieldMappings: {
          invoiceId: "factures.facture_id",
          supplierName: "suppliers.supplier_name",
          invoiceDate: "factures.date",
          amount: "factures.amount",
          status: "factures.status",
          label: "categories.category_name",
        },
        groupByCols: ["suppliers.supplier_name", "categories.category_name"],
        tolerancePct: 0.15,
        toleranceDays: 45,
        importStatusColumn: "factures.status",
        importStatuses: ["RECU", "COMPTABILISE"],
        provisionalStatuses: ["RECU"],
        finalStatuses: ["COMPTABILISE"],
      },
      commande: {
        enabled: true,
        tables: ["commandes"],
        joins: [],
        conditions: ["commandes.status != 'ANNULE'"],
        fieldMappings: {
          commandeRef: "commandes.commande_id",
          commandeDate: "commandes.date_cmd",
          amount: "commandes.amount",
          supplierName: "commandes.supplier_code",
          budgetCode: "commandes.ligne_budgetaire",
          category: "commandes.category",
          status: "commandes.status",
        },
        groupByCols: ["budgetCode"],
        tolerancePct: 0.10,
        toleranceDays: 30,
      },
    },
    tableRoles: { factures: "main", suppliers: "join", categories: "join", commandes: "main", budgets: "budget" },
    budgetSourceTables: ["budgets"],
    budgetAmountCols: [],
    budgetFormula: [],
    budgetPreset: null,
    budgetAgg: "SUM",
    tenants: [
      {
        id: "whitecape_ask",
        label: "whitecape_ask",
        active: true,
        statuses: {
          facture: { provisional: ["RECU"], final: ["COMPTABILISE"], statusColumn: "factures.status" },
          commande: { provisional: ["En cours"], final: ["LIVRE"], statusColumn: "commandes.status" }
        }
      }
    ],
    customPipelines: [],
    generatedData: {},
    issuer: "askgo-erp",
    audience: "anomaly-detection",
    algorithm: "RS256",
    jdbcDriverClassName: "org.postgresql.Driver",
  },
  {
    id: "mock-conn-liadev",
    name: "LiaDev ERP",
    logo: "LD",
    color: "#2563EB",
    category: "erp",
    status: "connected",
    authType: "JWT_SIGNED",
    description: "Connecteur ERP multi-tenant pour import, pipelines et budgets",
    jdbcUrl: CONNECTOR_CONFIG.step3_database.jdbcUrl,
    jdbcUsername: CONNECTOR_CONFIG.step3_database.jdbcUsername,
    jdbcPassword: CONNECTOR_CONFIG.step3_database.jdbcPassword,
    connectionType: "jdbc",
    publicKey: CONNECTOR_CONFIG.step2_authentication.publicKey,
    apiEndpoint: CONNECTOR_CONFIG.step2_authentication.apiEndpoint,
    apiAuthToken: CONNECTOR_CONFIG.step2_authentication.apiAuthToken,
    connectorType: "ERP",
    selectedTables: ["factures", "suppliers", "categories", "commandes", "budgets"],
    pipelines: CONNECTOR_CONFIG.step7_templates,
    tableRoles: { factures: "main", suppliers: "join", categories: "join", commandes: "main", budgets: "budget" },
    budgetSourceTables: ["budgets"],
    budgetAmountCols: [],
    budgetFormula: [],
    budgetPreset: null,
    budgetAgg: "SUM",
    tenants: [
      {
        id: "whitecape_liadev",
        label: "whitecape_liadev",
        active: false,
        statuses: {
          facture: { provisional: ["RECU"], final: ["COMPTABILISE"], statusColumn: "factures.status" },
          commande: { provisional: ["En cours"], final: ["LIVRE"], statusColumn: "commandes.status" }
        }
      }
    ],
    customPipelines: [],
    generatedData: {},
    issuer: "liadev-erp",
    audience: "anomaly-detection",
    algorithm: "RS256",
    jdbcDriverClassName: "org.postgresql.Driver",
  },
];

export const TABLE_PALETTE = [
  { fill: "#D94F3D", light: "#fca5a5", dark: "#991b1b" },
  { fill: "#0891b2", light: "#5eead4", dark: "#0e7490" },
  { fill: "#059669", light: "#6ee7b7", dark: "#047857" },
  { fill: "#d97706", light: "#fcd34d", dark: "#b45309" },
  { fill: "#6366f1", light: "#a5b4fc", dark: "#4338ca" },
  { fill: "#db2777", light: "#f9a8d4", dark: "#be185d" },
  { fill: "#2563eb", light: "#93c5fd", dark: "#1d4ed8" },
  { fill: "#ea580c", light: "#fdba74", dark: "#c2410c" },
];

export const BUDGET_PRESETS = {
  c1: [
    { id: "sap_std", name: "SAP Standard", desc: "CSKS.BUDGET_ANNUEL − Σ BSEG.DMBTR (KOART=K)", formula: [{ type: "agg", fn: "TABLE", table: "CSKS", col: "BUDGET_ANNUEL", label: "CSKS.BUDGET_ANNUEL" }, { type: "op", op: "−" }, { type: "agg", fn: "SUM", table: "BSEG", col: "DMBTR", label: "Σ BSEG.DMBTR", filter: "KOART='K'" }] },
    { id: "sap_engaged", name: "Budget Engagé", desc: "Σ EKKO.NETWR (statut ouvert)", formula: [{ type: "agg", fn: "SUM", table: "EKKO", col: "NETWR", label: "Σ EKKO.NETWR", filter: "BSTYP='F'" }] },
  ],
  c2: [
    { id: "sage_alloc", name: "Sage Standard", desc: "BUDGETS.MONTANT_ALLOUE − MONTANT_CONSOM", formula: [{ type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_ALLOUE", label: "MONTANT_ALLOUE" }, { type: "op", op: "−" }, { type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_CONSOM", label: "MONTANT_CONSOM" }] },
    { id: "sage_engage", name: "Avec Engagements", desc: "MONTANT_ALLOUE − MONTANT_ENGAGE − MONTANT_CONSOM", formula: [{ type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_ALLOUE", label: "MONTANT_ALLOUE" }, { type: "op", op: "−" }, { type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_ENGAGE", label: "MONTANT_ENGAGE" }, { type: "op", op: "−" }, { type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_CONSOM", label: "MONTANT_CONSOM" }] },
    { id: "sage_custom", name: "Personnalisé", desc: "Construire votre propre formule", formula: [] },
  ],
  generic: [
    { id: "gen_std", name: "Standard", desc: "BUDGETS.MONTANT_ALLOUE − MONTANT_CONSOM", formula: [{ type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_ALLOUE", label: "MONTANT_ALLOUE" }, { type: "op", op: "−" }, { type: "agg", fn: "COL", table: "BUDGETS", col: "MONTANT_CONSOM", label: "MONTANT_CONSOM" }] },
  ],
};

export const ERD_OFFSETS = [
  { x: 0, y: 0 }, { x: 222, y: 0 }, { x: 444, y: 0 }, { x: 666, y: 0 },
  { x: 111, y: 280 }, { x: 333, y: 280 }, { x: 555, y: 280 },
];

export const CARD_W = 192;
export const MAX_COLS = 7;
export const PAD = 24;

export const CUSTOM_PIPELINE_COLORS = ["#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777", "#ea580c"];

export const WIZARD_STEPS = [
  { label: "Identité", desc: "Nom, auth, logo", Icon: Tag },
  { label: "Connexion", desc: "JDBC/API + tables", Icon: Plug },
  { label: "Exploration", desc: "Vue ERD schéma", Icon: Network },
  { label: "Pipelines", desc: "Factures, Cmd, Custom", Icon: GitBranch },
  { label: "Budget", desc: "Tables, colonnes, formule", Icon: Calculator },
  { label: "Tenants", desc: "Statuts par client", Icon: Cpu },
  { label: "Données test", desc: "Génération & preview", Icon: Sparkles },
  { label: "Récapitulatif", desc: "Vérification finale", Icon: CheckCircle2 },
];

export const WS_MAPPING_DEMO_COLUMNS = ["invoice_ref", "invoice_date", "amount", "supplier_code", "label", "entity", "status", "due_date"];

export const WS_MAPPING_CORE_FIELDS = [
  { k: "amount", lbl: "Montant", req: true, hint: "Valeur numérique de la facture" },
  { k: "date", lbl: "Date facture", req: true, hint: "Date d'émission ou de comptabilisation" },
  { k: "supplier", lbl: "Fournisseur", req: true, hint: "Code ou nom du tiers / fournisseur" },
  { k: "label", lbl: "Libellé / Service", req: false, hint: "Sous-catégorie, service ou description" },
  { k: "tenant", lbl: "Entité / Société", req: false, hint: "Code société ou entité juridique" },
  { k: "status", lbl: "Statut", req: false, hint: "Statut de la pièce" },
  { k: "docref", lbl: "Réf. document", req: false, hint: "Numéro ou référence de la pièce" },
];

export const CSV_IMPORT_SEQUENCE = [
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

export const PIPELINE_CSV_FIXTURES = [
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

export const ADMIN_TENANT_TYPE_DEFS = [
  { type: "Enterprise", role: "ADMIN", colorKey: "red" },
  { type: "Pro", role: "TENANT_ADMIN", colorKey: "info" },
  { type: "Starter", role: "USER", fallback: true, colorKey: "success" },
];

export const ADMIN_PIPELINE_STATUS_DEFS = [
  { status: "Actif", matches: ["actif"], colorKey: "success" },
  { status: "Warning", matches: ["warning"], colorKey: "warning" },
  { status: "Paused", matches: ["draft", "paused"], colorKey: "grey400" },
];

export const ADMIN_RADAR_METRICS = ["Factures", "Anomalies", "Pipelines", "Alertes", "Taux"];

export const PIPELINE_DASHBOARD_RADAR_METRICS = [
  { metric: "Volume (factures)", fullMark: 100 },
  { metric: "Stabilité (CV)", fullMark: 100 },
  { metric: "Alertes actives", fullMark: 100 },
  { metric: "Taille série", fullMark: 100 },
  { metric: "Tolérance", fullMark: 100 },
];

export const ML_RADAR_METRICS = [
  { metric: "Volume", fullMark: 100 },
  { metric: "Stabilité CV", fullMark: 100 },
  { metric: "Taille série", fullMark: 100 },
  { metric: "Tolérance", fullMark: 100 },
  { metric: "Score anomalie", fullMark: 100 },
];

export const CONNECTOR_LABELS = {
  "mock-conn-1": "Ask&Go ERP",
  "mock-conn-liadev": "LiaDev ERP",
};

export const INTEGRATION_CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "erp", label: "ERP" },
  { id: "accounting", label: "Comptabilité" },
  { id: "crm", label: "CRM" },
  { id: "storage", label: "Stockage" },
];

export const INTEGRATION_CONNECTION_TYPES = [
  { id: "jdbc", label: "JDBC", icon: "Database", desc: "Base SQL directe" },
  { id: "api", label: "API REST", icon: "Network", desc: "Endpoint HTTP" },
  { id: "csv", label: "Fichier CSV", icon: "Layers", desc: "Import fichier" },
];

export const INTEGRATION_JOIN_TYPES = ["INNER", "LEFT", "RIGHT", "FULL"];

export const VISUAL_JOIN_PALETTE = [
  { bg: "rgba(217,79,61,.1)", border: "rgba(217,79,61,.35)", text: "#D94F3D" },
  { bg: "rgba(59,130,246,.1)", border: "rgba(59,130,246,.35)", text: "#1d4ed8" },
  { bg: "rgba(34,197,94,.1)", border: "rgba(34,197,94,.35)", text: "#15803d" },
  { bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.35)", text: "#92400e" },
  { bg: "rgba(139,92,246,.1)", border: "rgba(139,92,246,.35)", text: "#6d28d9" },
];

export const INTEGRATION_REPORT_FALLBACK_TENANTS = [
  { id: "CLIENT_001", label: "Client Alpha", active: true, platformTenantName: "Alpha Corp", pipelines: ["Factures", "Commandes"] },
  { id: "CLIENT_002", label: "Client Beta", active: true, platformTenantName: "Beta Industries", pipelines: ["Factures"] },
  { id: "CLIENT_003", label: "Client Gamma", active: false, platformTenantName: null, pipelines: [] },
];

export const DEFAULT_API_RESOURCE = {
  path: "/api/resource",
  cols: ["id", "date", "amount", "status"],
  rowCount: 100,
};

export const ALERT_TABS = [
  { id: "toutes", label: "Toutes" },
  { id: "en_attente", label: "En attente" },
  { id: "anomaly", label: "Anomalies" },
  { id: "pipeline", label: "Pipelines" },
  { id: "system", label: "Système" },
];

export const MONTH_NAMES_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const BUDGET_TABS = [
  { id: "suivi", label: "Suivi budgétaire" },
  { id: "serie", label: "Analyse par série" },
  { id: "simulation", label: "Simulation budget" },
  { id: "commandes", label: "Budget Commandes" },
];

export const DEMO_TENANT_IDS_PLACEHOLDER = "CLIENT_001, CLIENT_002";

export const JSON_IMPORT_TEMPLATE = {
  identity: { name: "Mon ERP", connectorType: "ERP", authType: "BASIC", logo: "ME", color: "#D94F3D", description: "" },
  authentication: { username: "erp_user", password: "••••••" },
  connection: { type: "jdbc", jdbcUrl: "jdbc:postgresql://host:5432/erp_db", jdbcUsername: "erp_user", jdbcPassword: "" },
  tables: { selected: ["FACTURES", "FOURNISSEURS", "COMMANDES", "BUDGETS"], budgetSources: ["BUDGETS"] },
  pipelines: {
    factures: { enabled: true, sourceTables: ["FACTURES", "FOURNISSEURS"], fieldMappings: {} },
    commandes: { enabled: true, sourceTables: ["COMMANDES"], groupBy: [] },
  },
  budget: {},
  tenants: [
    { id: "CLIENT_001", label: "Client Alpha", storageMode: "shared" },
    { id: "CLIENT_002", label: "Client Beta", storageMode: "isolated", database: { jdbcUrl: "jdbc:postgresql://host:5432/client_beta", jdbcUsername: "erp_user", jdbcPassword: "" } },
  ],
};

export const TENANT_JSON_IMPORT_TEMPLATE = {
  tenants: [
    { id: "CLIENT_001", label: "Client Alpha", storageMode: "shared" },
    { id: "CLIENT_002", label: "Client Beta", storageMode: "isolated", database: { jdbcUrl: "jdbc:postgresql://host:5432/client_beta", jdbcUsername: "erp_user", jdbcPassword: "" } },
  ],
};

export const DERIVED_ANOMALY_DEFAULTS = {
  type: "AMOUNT_SPIKE",
  score: 0.96,
  expectedAmountRatio: 0.72,
  maxAcceptableRatio: 0.85,
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — MOCK API RESPONSE SHAPES (exactly as backend controllers return)
// ═══════════════════════════════════════════════════════════════════════════════

const _whitecapeUser = USERS_TABLE[1];

export const CONNECTORS_TABLE = [{
  id: "mock-conn-1",
  name: CONNECTOR_CONFIG.step1_identity.name,
  type: "ERP",
  authType: "JWT_SIGNED",
  ...CONNECTOR_CONFIG.step1_identity,
  ...CONNECTOR_CONFIG.step2_authentication,
  ...CONNECTOR_CONFIG.step3_database,
  schemaTablesJson: JSON.stringify(CONNECTOR_CONFIG.step4_schema),
  fieldMappingJson: JSON.stringify(CONNECTOR_CONFIG.step5_fieldMapping),
  importStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.importStatuses),
  provisionalStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.provisionalStatuses),
  finalStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.finalStatuses),
  importStatusColumn: CONNECTOR_CONFIG.step6_statuses.importStatusColumn,
  pipelineTemplatesJson: JSON.stringify(CONNECTOR_CONFIG.step7_templates),
  budgetTemplateJson: JSON.stringify(CONNECTOR_CONFIG.step8_budgetAndDefaults.budgetTemplate),
  tenantDefaultsJson: JSON.stringify(CONNECTOR_CONFIG.step8_budgetAndDefaults.tenantDefaults),
  mappingLocked: CONNECTOR_CONFIG.step8_budgetAndDefaults.mappingLocked,
}, {
  id: "mock-conn-liadev",
  name: "LiaDev ERP",
  description: "Connecteur ERP multi-tenant pour import, pipelines et budgets",
  type: "ERP",
  authType: "JWT_SIGNED",
  logo: "LD",
  color: "#2563EB",
  ...CONNECTOR_CONFIG.step2_authentication,
  ...CONNECTOR_CONFIG.step3_database,
  schemaTablesJson: JSON.stringify(CONNECTOR_CONFIG.step4_schema),
  fieldMappingJson: JSON.stringify(CONNECTOR_CONFIG.step5_fieldMapping),
  importStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.importStatuses),
  provisionalStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.provisionalStatuses),
  finalStatusesJson: JSON.stringify(CONNECTOR_CONFIG.step6_statuses.finalStatuses),
  importStatusColumn: CONNECTOR_CONFIG.step6_statuses.importStatusColumn,
  pipelineTemplatesJson: JSON.stringify(CONNECTOR_CONFIG.step7_templates),
  budgetTemplateJson: JSON.stringify(CONNECTOR_CONFIG.step8_budgetAndDefaults.budgetTemplate),
  tenantDefaultsJson: JSON.stringify(CONNECTOR_CONFIG.step8_budgetAndDefaults.tenantDefaults),
  mappingLocked: CONNECTOR_CONFIG.step8_budgetAndDefaults.mappingLocked,
}];

export const TENANT_CONNECTIONS_TABLE = [{
  id: "mock-conn-1",
  tenantId: _whitecapeUser.id,
  connectorId: "mock-conn-1",
  externalId: "whitecape_ask",
  active: true,
  notes: "Lien Whitecape ↔ Ask&Go ERP",
  processedTemplatesJson: JSON.stringify(["facture", "commande"]),
  connectorName: "Ask&Go ERP",
  connectorColor: "#714B67",
  connectorLogo: "AG",
  connectorType: "ERP",
}];

export const PIPELINES_TABLE = [
  { id: "mock-pipe-1", tenantId: _whitecapeUser.id, name: "whitecape_ask - facture", sourceType: "JDBC", status: "ACTIVE", active: true, templateKey: "facture", isCustom: false, connectorId: "mock-conn-1", externalId: "whitecape_ask", lastRunAt: "2026-05-31T11:00:00Z", lastRunStats: { processedCount: 20, importedCount: 20, anomalyCount: 3 }, configJson: JSON.stringify({ query: "SELECT ..." }) },
  { id: "mock-pipe-2", tenantId: _whitecapeUser.id, name: "whitecape_ask - commande", sourceType: "JDBC", status: "ACTIVE", active: true, templateKey: "commande", isCustom: false, connectorId: "mock-conn-1", externalId: "whitecape_ask", lastRunAt: "2026-05-31T11:05:00Z", lastRunStats: { processedCount: 20, importedCount: 20, anomalyCount: 0 }, configJson: JSON.stringify({ query: "SELECT ...", groupByCols: ["budgetCode"], fieldMappings: CONNECTOR_CONFIG.step7_templates.commande.fieldMappings }) },
];

export const ALERTS_TABLE = [
  { id: "mock-alert-1", tenantId: _whitecapeUser.id, type: "BUDGET_OVERRUN", status: "ACTIVE", severity: "critical", anomalyScore: 0, invoiceRef: null, message: "Projection budget Fournitures : depassement annuel probable (+160€)", detectedAt: "2026-05-31T00:00:00Z", explanation: "FOURNITURES_BUREAU — Projection fin d'annee = 1410€ > 1250€ budget annuel. Le pic de mai augmente le risque de depassement." },
  { id: "mock-alert-2", tenantId: _whitecapeUser.id, type: "AMOUNT_SPIKE", status: "ACTIVE", severity: "warning", anomalyScore: 0.96, invoiceRef: "F-EAU-2026-03", message: "Montant inhabituel detecte : EAU_SAISON en mars (280€ vs 120€ attendu)", detectedAt: "2026-03-15T09:00:00Z", explanation: "La facture F-EAU-2026-03 depasse fortement le comportement habituel de la serie Eau potable." },
  { id: "mock-alert-3", tenantId: _whitecapeUser.id, type: "AMOUNT_SPIKE", status: "ACTIVE", severity: "critical", anomalyScore: 0.96, invoiceRef: "F-FOURN-2026-05", message: "Montant inhabituel detecte : FOURNITURES_BUREAU en mai (260€ vs 100€ attendu)", detectedAt: "2026-05-10T09:00:00Z", explanation: "La facture F-FOURN-2026-05 declenche une anomalie montant et contribue au risque de depassement budget annuel." },
  { id: "mock-alert-4", tenantId: _whitecapeUser.id, type: "AMOUNT_SPIKE", status: "ACTIVE", severity: "warning", anomalyScore: 0.96, invoiceRef: "F-TEL-F-2026-04", message: "Montant inhabituel detecte : Fibre Optique en avril (420€ vs 300€ attendu)", detectedAt: "2026-04-05T09:00:00Z", explanation: "La facture F-TEL-F-2026-04 depasse l'attendu mensuel de la serie Fibre Optique sans encore depasser le budget annuel." },
];

export const BUDGET_ANALYSIS_TABLE = [
  { budgetCode: "BUDGET_EAU", label: "Eau potable annuelle", budgetAlloue: 2160, totalCommandes: 1800, taux: 0.83, status: "ON_TRACK", prediction: "Stable (saisonnier connu)", projection: 1800, overrunAmount: 0, message: "BUDGET_EAU — Eau potable : Consommation saisonniere detectee. Vous etes ON_TRACK." },
  { budgetCode: "BUDGET_FOURN", label: "Fournitures scolaires", budgetAlloue: 1000, totalCommandes: 1250, taux: 1.25, status: "OVER_BUDGET", prediction: "OVER_BUDGET_PREDICTED", projection: 1250, overrunAmount: 250, message: "BUDGET_FOURN — ALERTE : Votre profil est fortement saisonnier avec un pic historique en septembre (400€). Projection fin d'annee : 1250€ (+250€ de depassement prevu)." },
  { budgetCode: "BUDGET_TEL", label: "Telecom fibre + internet", budgetAlloue: 4200, totalCommandes: 4200, taux: 1.0, status: "ON_TRACK", prediction: "Stable", projection: 4200, overrunAmount: 0, message: "BUDGET_TEL — Telecom : Consommation stable a 350€/mois. Vous etes ON_TRACK." },
];

export const CSV_DEMO_ROWS = INVOICES_TABLE.slice(0, 18).map((inv) => ({
  invoice_ref: inv.invoiceId,
  invoice_date: inv.invoiceDate,
  amount: inv.amount,
  supplier_code: inv.supplierName,
  label: inv.label,
  status: "COMPTABILISE",
  extra_comment: inv.anomalyType ? "pic rentree scolaire" : "standard",
}));

export const PIPELINE_LOGS_TABLE = [
  { id: "mock-log-1", category: "SERIES_DECISION", supplier: "TELECOM_FIBRE", status: "SUCCESS", reason: "Groupement facture fixe: fournisseur + label. TELECOM_FIBRE produit 2 series stables (50 EUR et 300 EUR).", createdAt: "2024-06-01T11:00:00Z" }
];

export const ANOMALIES_TABLE = [];

export const SERIES_TABLE = [
  { id: "mock-series-1", name: "EAU_SAISON — Eau potable", supplier: "EAU_SAISON", label: "Eau potable", n: 12, mu: 150, sigma: 57.74, cv: 0.385, flagged: true, tolerance_pct: 15 },
  { id: "mock-series-2", name: "FOURNITURES_BUREAU — Fournitures scolaires", supplier: "FOURNITURES_BUREAU", label: "Fournitures scolaires", n: 12, mu: 104.17, sigma: 92.47, cv: 0.888, flagged: true, tolerance_pct: 15 },
  { id: "mock-series-3", name: "TELECOM_FIBRE — Fibre Optique", supplier: "TELECOM_FIBRE", label: "Fibre Optique", n: 12, mu: 300, sigma: 0, cv: 0, flagged: false, tolerance_pct: 15 },
  { id: "mock-series-4", name: "TELECOM_FIBRE — Internet ADSL", supplier: "TELECOM_FIBRE", label: "Internet ADSL", n: 12, mu: 50, sigma: 0, cv: 0, flagged: false, tolerance_pct: 15 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// INTERLUDE — MOCK API RESPONSE SHAPES (controller-level DTOs for api.js mock router)
// ═══════════════════════════════════════════════════════════════════════════════

export const MOCK_API_RESPONSES = {
  login: (username, password) => {
    const user = USERS_TABLE.find(u => u.username === username && u.password === password);
    if (!user) throw { response: { status: 401, data: { message: "Invalid credentials" } } };
    return {
      access_token: `mock-token-${user.username}`,
      user: { ...user, password: undefined },
      tenantId: user.isEngineAdmin ? null : user.id,
      tenantName: user.name,
    };
  },
  tenants: () => ({ content: USERS_TABLE.filter(u => !u.isEngineAdmin) }),
  connectors: () => ({ content: DEMO_CONNECTORS.map((connector) => ({
    id: connector.id,
    name: connector.name,
    logo: connector.logo,
    color: connector.color,
    connectorType: connector.connectorType || "ERP",
    type: "ERP",
    authType: connector.authType,
    description: connector.description,
    jdbcUrl: connector.jdbcUrl,
    jdbcUsername: connector.jdbcUsername,
    jdbcPassword: connector.jdbcPassword,
    publicKey: connector.publicKey,
    apiEndpoint: connector.apiEndpoint,
    apiAuthToken: connector.apiAuthToken,
    tenants: connector.tenants,
    ...CONNECTOR_CONFIG.step4_schema,
    ...CONNECTOR_CONFIG.step5_fieldMapping,
    ...CONNECTOR_CONFIG.step6_statuses,
    ...CONNECTOR_CONFIG.step7_templates,
    ...CONNECTOR_CONFIG.step8_budgetAndDefaults,
    status: "ACTIVE",
    availabilityStatus: "ACTIVE",
  })) }),
  tenantConnections: () => TENANT_CONNECTIONS_TABLE,
  pipelines: () => ({ content: PIPELINES_TABLE }),
  alerts: () => ({ content: ALERTS_TABLE }),
  anomalies: () => ({ content: ANOMALIES_TABLE }),
  stats: () => {
    const anomaliesCount = INVOICES_TABLE.filter(i => i.status === "anomaly" || i.status === "ANOMALY").length;
    const activePipelineCount = PIPELINES_TABLE.filter(p => p.status === "ACTIVE" || p.active).length;
    const criticalAlerts = ALERTS_TABLE.filter(a => String(a.severity).toLowerCase() === "critical").length;
    const unreadAlerts = ALERTS_TABLE.filter(a => a.status !== "READ" && a.status !== "RESOLVED").length;
    return {
      totalTenants: USERS_TABLE.filter(u => !u.isEngineAdmin).length,
      totalInvoices: INVOICES_TABLE.length,
      totalAnomalies: anomaliesCount,
      totalPipelines: PIPELINES_TABLE.length,
      totalAlerts: ALERTS_TABLE.length,
      tenantsCount: USERS_TABLE.filter(u => !u.isEngineAdmin).length,
      invoicesCount: INVOICES_TABLE.length,
      anomaliesCount,
      activePipelineCountCount: activePipelineCount,
      alertsByStatus: { CRITICAL: criticalAlerts, UNREAD: unreadAlerts },
    };
  },
  budgetAnalysis: () => ({ content: BUDGET_ANALYSIS_TABLE }),
  invoices: (params) => {
    const tenantId = params?._tenantId;
    const filtered = tenantId ? INVOICES_TABLE.filter(i => i.tenantId === tenantId) : INVOICES_TABLE;
    return { content: filtered, totalElements: filtered.length };
  },
  adminInvoices: () => ({ content: INVOICES_TABLE.map(i => ({ ...i, tenantId: _whitecapeUser.id })), totalElements: INVOICES_TABLE.length }),
  supplierCounts: () => {
    const map = {};
    INVOICES_TABLE.forEach(i => { const s = i.supplier || i.supplierName; if (s) map[s] = (map[s] || 0) + 1; });
    return Object.entries(map).map(([supplier, count]) => ({ supplier, count }));
  },
  distribution: () => {
    const map = {};
    INVOICES_TABLE.forEach(i => { const s = i.supplier || i.supplierName; if (!map[s]) map[s] = { supplier: s, totalAmount: 0, invoiceCount: 0 }; map[s].totalAmount += i.amount || 0; map[s].invoiceCount++; });
    return Object.values(map);
  },
  monthlyTotals: () => {
    const map = {};
    INVOICES_TABLE.forEach(i => {
      if (i.date) { const m = i.date.slice(0, 7); map[m] = (map[m] || 0) + (i.amount || 0); }
    });
    return Object.entries(map).map(([month, total]) => ({ month, total }));
  },
  timeseries: () => {
    return INVOICES_TABLE.filter(i => i.date).sort((a, b) => a.date.localeCompare(b.date)).map(i => ({ date: i.date, amount: i.amount || 0, supplier: i.supplier || i.supplierName || "" }));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — HELPER UTILITIES (used by wizard & preview steps)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateFakeRows(cols, role, count = 8) {
  const suppliers = ["Al-Waha Trading", "Méditex SA", "Euro Supply SARL", "Maghreb Acier", "Delta Chimie", "Orion Tech"];
  const statuses = ["Payé", "En attente", "En cours", "Annulé", "Livré", "Validé"];
  const currencies = ["TND", "EUR", "USD", "MAD"];
  return Array.from({ length: count }, (_, i) => {
    const row = {};
    cols.forEach(col => {
      const c = col.toLowerCase();
      if (c.includes("id") || c.includes("num") || c.includes("belnr") || c.includes("ebeln")) row[col] = `${(role || "ROW").slice(0, 3).toUpperCase()}-${String(1000 + i + 1).padStart(5, "0")}`;
      else if (c.includes("date")) { const d = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1); row[col] = d.toISOString().split("T")[0]; }
      else if (c.includes("montant") || c.includes("netwr") || c.includes("dmbtr") || c.includes("alloue") || c.includes("consom") || c.includes("budget")) row[col] = (Math.random() * 80000 + 1000).toFixed(2);
      else if (c.includes("four") || c.includes("lifnr") || c.includes("nom")) row[col] = suppliers[i % suppliers.length];
      else if (c.includes("statut") || c.includes("status")) row[col] = statuses[Math.floor(Math.random() * statuses.length)];
      else if (c.includes("devise") || c.includes("waers")) row[col] = currencies[Math.floor(Math.random() * currencies.length)];
      else row[col] = `${col.slice(0, 4).toUpperCase()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    });
    return row;
  });
}

export function inferColType(header) {
  const h = header.toLowerCase();
  if (h.startsWith("id_") || h.endsWith("_id") || h === "id" || h === "mandt") return "pk";
  if (h.startsWith("code_") || h.endsWith("_code") || h.includes("lifnr") || h.includes("ebeln") || h.includes("belnr")) return "fk";
  if (h.includes("date") || h.includes("bldat") || h.includes("budat")) return "date";
  if (h.includes("montant") || h.includes("netwr") || h.includes("dmbtr") || h.includes("menge")) return "num";
  return "text";
}

export function buildWizardDataFromAnswers(a, schemaForConn) {
  const raw = a._tenantsRaw || "";
  const tenants = raw ? raw.split(",").map(s => s.trim()).filter(Boolean).map(id => ({
    id, label: id, active: true,
    statuses: { facture: { provisional: ["En attente"], final: ["Payé"], statusColumn: "STATUT" }, commande: { provisional: ["En cours"], final: ["Livré"], statusColumn: "STATUT" } }
  })) : [];
  const budgetTables = Array.isArray(a.budgetSourceTables) ? a.budgetSourceTables : a.budgetSourceTables ? [a.budgetSourceTables] : [];
  const selectedTables = Array.isArray(a.selectedTables) ? a.selectedTables : a.selectedTables ? a.selectedTables.split(",").map(s => s.trim()).filter(Boolean) : [];

  const facturePl = {
    enabled: a.pipelines?.factures?.enabled !== false,
    tables: a.pipelines?.factures?.sourceTables || [],
    fieldMappings: a.pipelines?.factures?.fieldMappings || {},
    conditions: [], joins: [], groupByCols: a.pipelines?.factures?.groupBy || PIPELINE_DEFS.facture.defaultGroupByCols,
  };
  const commandePl = {
    enabled: a.pipelines?.commandes?.enabled !== false,
    tables: a.pipelines?.commandes?.sourceTables || [],
    fieldMappings: {}, conditions: [], joins: [], groupByCols: a.pipelines?.commandes?.groupBy || [],
  };

  return {
    name: a.identity?.name || "",
    connectorType: a.identity?.connectorType || "ERP",
    authType: a.identity?.authType || "NONE",
    logo: a.identity?.logo || "",
    color: a.identity?.color || "#D94F3D",
    description: a.identity?.description || "",
    ...(a.authentication || {}),
    connectionType: a.connection?.type || "jdbc",
    jdbcUrl: a.connection?.jdbcUrl || "",
    jdbcUsername: a.connection?.jdbcUsername || "",
    jdbcPassword: a.connection?.jdbcPassword || "",
    selectedTables,
    budgetSourceTables: budgetTables,
    tenants,
    pipelines: { facture: facturePl, commande: commandePl },
    budgetFormula: [], customPipelines: [], generatedData: {},
  };
}

export function getSchemaForUrl(jdbcUrl, connId) {
  if (connId === "c1") return MOCK_SCHEMAS.c1;
  if (connId === "c2") return MOCK_SCHEMAS.c2;
  if (!jdbcUrl) return null;
  return GENERIC_SCHEMA;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — CONVENIENCE EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

function _columnsForRows(rows) {
  return Array.from(rows.reduce((cols, row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      Object.keys(row).forEach((key) => cols.add(key));
    } else {
      cols.add("value");
    }
    return cols;
  }, new Set()));
}

function _normalizeReportRows(value) {
  if (Array.isArray(value)) {
    return value.map((row) => (row && typeof row === "object" && !Array.isArray(row) ? row : { value: row }));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([key, detail]) => ({ key, detail }));
  }
  return [{ value }];
}

function _makeStaticDataTable(id, label, description, value, section = "Demo") {
  const rows = _normalizeReportRows(value);
  return {
    id,
    label,
    description,
    section,
    rowCount: rows.length,
    columns: _columnsForRows(rows),
    rows,
  };
}

export const STATIC_DATA_REPORT = [
  _makeStaticDataTable("suppliers", "SUPPLIERS_TABLE", "Raw fournisseurs ERP.", SUPPLIERS_TABLE, "Raw database"),
  _makeStaticDataTable("categories", "CATEGORIES_TABLE", "Raw categories ERP.", CATEGORIES_TABLE, "Raw database"),
  _makeStaticDataTable("factures", "FACTURES_TABLE", "Raw factures ERP, incluant historiques et tenants demo.", FACTURES_TABLE, "Raw database"),
  _makeStaticDataTable("commandes", "COMMANDES_TABLE", "Raw commandes ERP utilisees par le pipeline budget.", COMMANDES_TABLE, "Raw database"),
  _makeStaticDataTable("budgets", "BUDGETS_TABLE", "Raw lignes budgetaires.", BUDGETS_TABLE, "Raw database"),
  _makeStaticDataTable("users", "USERS_TABLE", "Comptes demo plateforme et tenant.", USERS_TABLE, "Raw database"),
  _makeStaticDataTable("invoices", "INVOICES_TABLE", "Factures mappees pour les vues frontend.", INVOICES_TABLE, "Derived frontend"),
  _makeStaticDataTable("historicalInvoices", "HISTORICAL_INVOICES_TABLE", "Factures historiques 2024-2025 pour baseline moteur.", HISTORICAL_INVOICES_TABLE, "Derived frontend"),
  _makeStaticDataTable("commandesFrontend", "COMMANDES_FRONTEND_TABLE", "Commandes mappees pour les vues frontend.", COMMANDES_FRONTEND_TABLE, "Derived frontend"),
  _makeStaticDataTable("commandBudgetSeries", "COMMAND_BUDGET_SERIES_TABLE", "Series budgetaires derivees des commandes.", COMMAND_BUDGET_SERIES_TABLE, "Derived frontend"),
  _makeStaticDataTable("connectors", "CONNECTORS_TABLE", "DTO mock des connecteurs backend.", CONNECTORS_TABLE, "Mock API"),
  _makeStaticDataTable("tenantConnections", "TENANT_CONNECTIONS_TABLE", "DTO mock des liens ERP par tenant.", TENANT_CONNECTIONS_TABLE, "Mock API"),
  _makeStaticDataTable("pipelines", "PIPELINES_TABLE", "DTO mock des pipelines actifs.", PIPELINES_TABLE, "Mock API"),
  _makeStaticDataTable("alerts", "ALERTS_TABLE", "DTO mock des alertes moteur.", ALERTS_TABLE, "Mock API"),
  _makeStaticDataTable("budgetAnalysis", "BUDGET_ANALYSIS_TABLE", "DTO mock d'analyse budget.", BUDGET_ANALYSIS_TABLE, "Mock API"),
  _makeStaticDataTable("csvDemoRows", "CSV_DEMO_ROWS", "Lignes CSV demo derivees des factures.", CSV_DEMO_ROWS, "Mock API"),
  _makeStaticDataTable("pipelineLogs", "PIPELINE_LOGS_TABLE", "Logs mock de decisions pipeline.", PIPELINE_LOGS_TABLE, "Mock API"),
  _makeStaticDataTable("anomalies", "ANOMALIES_TABLE", "Anomalies mock explicites.", ANOMALIES_TABLE, "Mock API"),
  _makeStaticDataTable("series", "SERIES_TABLE", "Series statistiques mock.", SERIES_TABLE, "Mock API"),
  _makeStaticDataTable("demoConnectors", "DEMO_CONNECTORS", "Connecteurs complets utilises par l'UI integrations.", DEMO_CONNECTORS, "Configuration"),
  _makeStaticDataTable("connectorConfig", "CONNECTOR_CONFIG", "Configuration source du connecteur Ask&Go ERP.", CONNECTOR_CONFIG, "Configuration"),
  _makeStaticDataTable("authFields", "AUTH_FIELDS", "Champs d'authentification par type.", AUTH_FIELDS, "Configuration"),
  _makeStaticDataTable("pipelineDefs", "PIPELINE_DEFS", "Definitions UI et mapping des pipelines.", PIPELINE_DEFS, "Configuration"),
  _makeStaticDataTable("genericSchema", "GENERIC_SCHEMA", "Schema ERP generique.", GENERIC_SCHEMA, "Configuration"),
  _makeStaticDataTable("csvSourcePresets", "CSV_SOURCE_PRESETS", "Presets de sources CSV.", CSV_SOURCE_PRESETS, "Configuration"),
  _makeStaticDataTable("mockSchemas", "MOCK_SCHEMAS", "Schemas ERP mock SAP/Sage.", MOCK_SCHEMAS, "Configuration"),
  _makeStaticDataTable("budgetPresets", "BUDGET_PRESETS", "Presets de formules budget.", BUDGET_PRESETS, "Configuration"),
  _makeStaticDataTable("settingsDefaults", "SETTINGS_DEFAULTS", "Valeurs par defaut des parametres.", SETTINGS_DEFAULTS, "UI constants"),
  _makeStaticDataTable("settingsOptions", "SETTINGS_OPTIONS", "Options selectionnables des parametres.", SETTINGS_OPTIONS, "UI constants"),
  _makeStaticDataTable("tablePalette", "TABLE_PALETTE", "Palette ERD/table.", TABLE_PALETTE, "UI constants"),
  _makeStaticDataTable("erdOffsets", "ERD_OFFSETS", "Offsets de layout ERD.", ERD_OFFSETS, "UI constants"),
  _makeStaticDataTable("customPipelineColors", "CUSTOM_PIPELINE_COLORS", "Couleurs pipelines custom.", CUSTOM_PIPELINE_COLORS, "UI constants"),
  _makeStaticDataTable("wizardSteps", "WIZARD_STEPS", "Etapes du wizard connecteur.", WIZARD_STEPS, "UI constants"),
  _makeStaticDataTable("wsMappingDemoColumns", "WS_MAPPING_DEMO_COLUMNS", "Colonnes demo de mapping workspace.", WS_MAPPING_DEMO_COLUMNS, "UI constants"),
  _makeStaticDataTable("wsMappingCoreFields", "WS_MAPPING_CORE_FIELDS", "Champs coeur de mapping workspace.", WS_MAPPING_CORE_FIELDS, "UI constants"),
  _makeStaticDataTable("csvImportSequence", "CSV_IMPORT_SEQUENCE", "Sequence terminale d'import CSV.", CSV_IMPORT_SEQUENCE, "UI constants"),
  _makeStaticDataTable("pipelineCsvFixtures", "PIPELINE_CSV_FIXTURES", "Fixtures CSV pipeline.", PIPELINE_CSV_FIXTURES, "UI constants"),
  _makeStaticDataTable("adminTenantTypeDefs", "ADMIN_TENANT_TYPE_DEFS", "Definitions de typologie tenant admin.", ADMIN_TENANT_TYPE_DEFS, "UI constants"),
  _makeStaticDataTable("adminPipelineStatusDefs", "ADMIN_PIPELINE_STATUS_DEFS", "Definitions statut pipeline admin.", ADMIN_PIPELINE_STATUS_DEFS, "UI constants"),
  _makeStaticDataTable("adminRadarMetrics", "ADMIN_RADAR_METRICS", "Metriques radar admin.", ADMIN_RADAR_METRICS, "UI constants"),
  _makeStaticDataTable("pipelineDashboardRadarMetrics", "PIPELINE_DASHBOARD_RADAR_METRICS", "Metriques radar dashboard pipeline.", PIPELINE_DASHBOARD_RADAR_METRICS, "UI constants"),
  _makeStaticDataTable("mlRadarMetrics", "ML_RADAR_METRICS", "Metriques radar ML.", ML_RADAR_METRICS, "UI constants"),
  _makeStaticDataTable("connectorLabels", "CONNECTOR_LABELS", "Libelles connecteurs par id.", CONNECTOR_LABELS, "UI constants"),
  _makeStaticDataTable("integrationCategories", "INTEGRATION_CATEGORIES", "Categories integrations.", INTEGRATION_CATEGORIES, "UI constants"),
  _makeStaticDataTable("integrationConnectionTypes", "INTEGRATION_CONNECTION_TYPES", "Types de connexion integration.", INTEGRATION_CONNECTION_TYPES, "UI constants"),
  _makeStaticDataTable("integrationJoinTypes", "INTEGRATION_JOIN_TYPES", "Types de jointures integration.", INTEGRATION_JOIN_TYPES, "UI constants"),
  _makeStaticDataTable("visualJoinPalette", "VISUAL_JOIN_PALETTE", "Palette visuelle des jointures.", VISUAL_JOIN_PALETTE, "UI constants"),
  _makeStaticDataTable("integrationReportFallbackTenants", "INTEGRATION_REPORT_FALLBACK_TENANTS", "Tenants fallback pour rapport integration.", INTEGRATION_REPORT_FALLBACK_TENANTS, "UI constants"),
  _makeStaticDataTable("defaultApiResource", "DEFAULT_API_RESOURCE", "Ressource API par defaut.", DEFAULT_API_RESOURCE, "UI constants"),
  _makeStaticDataTable("alertTabs", "ALERT_TABS", "Onglets alertes.", ALERT_TABS, "UI constants"),
  _makeStaticDataTable("monthNamesFr", "MONTH_NAMES_FR", "Noms des mois FR.", MONTH_NAMES_FR, "UI constants"),
  _makeStaticDataTable("budgetTabs", "BUDGET_TABS", "Onglets budget.", BUDGET_TABS, "UI constants"),
  _makeStaticDataTable("jsonImportTemplate", "JSON_IMPORT_TEMPLATE", "Template import JSON connecteur.", JSON_IMPORT_TEMPLATE, "UI constants"),
  _makeStaticDataTable("derivedAnomalyDefaults", "DERIVED_ANOMALY_DEFAULTS", "Defaults d'anomalie derivee.", DERIVED_ANOMALY_DEFAULTS, "UI constants"),
];

export const ALL_FAKE_DATA = {
  suppliers: SUPPLIERS_TABLE,
  categories: CATEGORIES_TABLE,
  factures: FACTURES_TABLE,
  commandes: COMMANDES_TABLE,
  budgets: BUDGETS_TABLE,
  users: USERS_TABLE,
  invoices: INVOICES_TABLE,
  connectorConfig: CONNECTOR_CONFIG,
  staticDataReport: STATIC_DATA_REPORT,
};

export default ALL_FAKE_DATA;
