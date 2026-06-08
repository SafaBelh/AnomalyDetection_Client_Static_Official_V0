import { MOCK_API_RESPONSES, USERS_TABLE, INVOICES_TABLE, SERIES_TABLE, ANOMALIES_TABLE, CSV_DEMO_ROWS, CONNECTORS_TABLE, TENANT_CONNECTIONS_TABLE, ALERTS_TABLE } from "@/store/staticData";

const TOKEN_KEY = "anomalyiq_token";
const USER_KEY = "anomalyiq_user";
const MOCK_FLAG = "anomalyiq_use_mock";

export function isMockMode() {
  return localStorage.getItem(MOCK_FLAG) === "true";
}

export function setMockMode(enabled) {
  if (enabled) localStorage.setItem(MOCK_FLAG, "true");
  else localStorage.removeItem(MOCK_FLAG);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

async function mockRequest(method, path, data) {
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

  const storedUser = getUser();
  const isAdmin = storedUser?.isEngineAdmin;
  const tenantId = storedUser?.tenantId;

  const XTenantId = isAdmin ? null : tenantId;

  // ── Auth ──
  if (path === "/auth/login" && method === "POST") {
    return MOCK_API_RESPONSES.login(data?.username, data?.password);
  }

  // ── Admin: tenants ──
  if (path === "/admin/tenants" && method === "GET") {
    return MOCK_API_RESPONSES.tenants();
  }
  if (path === "/admin/tenants" && method === "POST") {
    const newUser = { id: `mock-uuid-${Date.now()}`, ...data, roles: ["TENANT"], isEngineAdmin: false };
    USERS_TABLE.push(newUser);
    return newUser;
  }
  if (path.startsWith("/admin/tenants/") && method === "PUT") {
    const id = path.split("/")[3];
    const idx = USERS_TABLE.findIndex(u => u.id === id);
    if (idx >= 0) { USERS_TABLE[idx] = { ...USERS_TABLE[idx], ...data }; }
    return { ok: true };
  }
  if (path.startsWith("/admin/tenants/") && method === "DELETE") {
    const id = path.split("/")[3];
    const idx = USERS_TABLE.findIndex(u => u.id === id);
    if (idx >= 0) USERS_TABLE.splice(idx, 1);
    return { ok: true };
  }
  if (path === "/admin/tenant-connections" && method === "GET") {
    const tid = data?.tenantId;
    const rows = tid ? TENANT_CONNECTIONS_TABLE.filter((c) => c.tenantId === tid) : TENANT_CONNECTIONS_TABLE;
    return rows;
  }
  if (path === "/admin/tenant-connections" && method === "POST") {
    const connector = CONNECTORS_TABLE.find((c) => c.id === data?.connectorId) || {};
    const row = {
      id: `mock-tenant-conn-${Date.now()}`,
      tenantId: data?.tenantId,
      connectorId: data?.connectorId,
      externalId: data?.externalId,
      active: true,
      notes: data?.notes || "",
      connectorName: connector.name || data?.connectorId || "ERP",
      connectorColor: connector.color || "#64748B",
      connectorLogo: connector.logo || connector.name?.slice(0, 2).toUpperCase() || "ERP",
      connectorType: connector.type || connector.connectorType || "ERP",
    };
    TENANT_CONNECTIONS_TABLE.push(row);
    return row;
  }
  if (path.startsWith("/admin/tenant-connections/") && method === "PUT") {
    const id = path.split("/")[3];
    const row = TENANT_CONNECTIONS_TABLE.find((c) => c.id === id);
    if (row) Object.assign(row, data || {});
    return { ok: true };
  }
  if (path.startsWith("/admin/tenant-connections/") && method === "DELETE") {
    const id = path.split("/")[3];
    const idx = TENANT_CONNECTIONS_TABLE.findIndex((c) => c.id === id);
    if (idx >= 0) TENANT_CONNECTIONS_TABLE.splice(idx, 1);
    return { ok: true };
  }
  if (path === "/admin/connectors" && method === "GET") {
    return MOCK_API_RESPONSES.connectors();
  }

  // ── Admin: data ──
  if (path === "/admin/invoices" && method === "GET") {
    return MOCK_API_RESPONSES.adminInvoices();
  }
  if (path === "/admin/pipelines" && method === "GET") {
    return MOCK_API_RESPONSES.pipelines();
  }
  if (path === "/admin/alerts" && method === "GET") {
    return MOCK_API_RESPONSES.alerts();
  }
  if (path === "/admin/stats" && method === "GET") {
    return MOCK_API_RESPONSES.stats();
  }

  // ── Tenant: connectors ──
  if (path === "/tenants" && method === "GET") {
    return { content: USERS_TABLE.filter(u => !u.isEngineAdmin) };
  }

  // ── Invoices ──
  if (path === "/invoices" && method === "GET") {
    if (isAdmin) return MOCK_API_RESPONSES.adminInvoices();
    const supplier = data?.supplier;
    const filtered = supplier
      ? INVOICES_TABLE.filter(i => (i.supplier || i.supplierName) === supplier)
      : INVOICES_TABLE;
    return { content: filtered, totalElements: filtered.length };
  }
  if (path === "/invoices/supplier-counts" && method === "GET") {
    return MOCK_API_RESPONSES.supplierCounts();
  }
  if (path === "/invoices/distribution" && method === "GET") {
    return MOCK_API_RESPONSES.distribution();
  }
  if (path === "/invoices/monthly-totals" && method === "GET") {
    return MOCK_API_RESPONSES.monthlyTotals();
  }
  if (path === "/invoices/timeseries" && method === "GET") {
    return MOCK_API_RESPONSES.timeseries();
  }

  // ── Anomalies ──
  if (path === "/anomalies" && method === "GET") {
    return MOCK_API_RESPONSES.anomalies();
  }

  // ── Alerts ──
  if (path === "/alerts" && method === "GET") {
    return MOCK_API_RESPONSES.alerts();
  }
  if (path.startsWith("/alerts/") && path.endsWith("/status") && method === "PATCH") {
    const id = path.split("/")[2];
    const alert = ALERTS_TABLE.find((a) => a.id === id);
    if (alert) alert.status = data?.status || "READ";
    return { ok: true };
  }

  // ── Pipelines ──
  if (path === "/pipelines" && method === "GET") {
    return MOCK_API_RESPONSES.pipelines();
  }
  if (path === "/pipelines" && method === "POST") {
    return { ...(data || {}), id: `mock-pipe-${Date.now()}` };
  }
  if (path.includes("/series/build") && method === "POST") {
    return { series: SERIES_TABLE };
  }
  if (path.includes("/series/confirm") && method === "POST") {
    return { ok: true };
  }
  if (path.includes("/series") && method === "GET" && !path.includes("/forecast") && !path.includes("/config")) {
    return { content: SERIES_TABLE };
  }
  if (path.includes("/series/") && path.includes("/forecast") && method === "GET") {
    return { forecast: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, expected: 150, upper: 200, lower: 100 })) };
  }
  if (path.includes("/series/") && path.includes("/config") && method === "PUT") {
    return { ok: true };
  }
  if (path.includes("/run") && method === "POST") {
    return { ok: true, processed: 48, anomalies: 1, alerts: ANOMALIES_TABLE };
  }
  if (path.includes("/invoices/check") && method === "POST") {
    return { ok: true };
  }
  if (path.includes("/preview/csv") && method === "POST") {
    return { rows: CSV_DEMO_ROWS };
  }
  if (path.includes("/import") && method === "POST") {
    return { ok: true, imported: CSV_DEMO_ROWS.length };
  }
  if (path.includes("/data") && method === "DELETE") {
    return { ok: true };
  }

  // ── Feedback ──
  if (path.startsWith("/feedback/") && method === "POST") {
    return { ok: true };
  }
  if (path === "/feedback/log" && method === "GET") {
    return { content: [] };
  }

  // ── Budget ──
  if (path === "/budget/analysis" && method === "GET") {
    return MOCK_API_RESPONSES.budgetAnalysis();
  }

  // ── Fallback ──
  console.warn(`[API MOCK] Unhandled route: ${method} ${path}`);
  return null;
}

export async function apiGet(path, params) {
  return mockRequest("GET", path, params);
}

export async function apiPost(path, body) {
  return mockRequest("POST", path, body);
}

export async function apiPut(path, body) {
  return mockRequest("PUT", path, body);
}

export async function apiPatch(path, body) {
  return mockRequest("PATCH", path, body);
}

export async function apiDelete(path) {
  return mockRequest("DELETE", path);
}
