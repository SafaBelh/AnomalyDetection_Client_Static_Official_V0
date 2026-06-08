import { useSyncExternalStore } from "react";
import { loadStorage, saveStorage } from "@/utils/storage";
import { getUser, getToken, clearToken } from "@/utils/api";
import {
  USERS_TABLE,
  INVOICES_TABLE,
  COMMANDES_TABLE,
  COMMANDES_FRONTEND_TABLE,
  BUDGETS_TABLE,
  CONNECTORS_TABLE,
  TENANT_CONNECTIONS_TABLE,
  PIPELINES_TABLE,
  ALERTS_TABLE,
  BUDGET_ANALYSIS_TABLE,
} from "@/store/staticData";

const stored = loadStorage();

export const db = {
  version: 0,
  activeTenantId: stored?.activeTenantId ?? null,
  activeTenantName: stored?.activeTenantName ?? null,
  activePartnerId: stored?.activePartnerId ?? null,
  isSSO: stored?.isSSO ?? false,
  isEngineAdmin: stored?.isEngineAdmin ?? false,
  tenants: [],
  pipelines: [],
  alerts: [],
  erpPartners: [],
  integrations: [],
  tenantIntegrations: [],
};

export const listeners = new Set();
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function emit() {
  db.version += 1;
  listeners.forEach((l) => l());
  saveStorage(db);
}
export function getSnapshot() {
  return (
    (db.activeTenantId ?? "") +
    "::" +
    (db.activeTenantName ?? "") +
    "::" +
    (db.activePartnerId ?? "") +
    "::" +
    db.isSSO +
    "::" +
      db.isEngineAdmin
      +
      "::" +
      db.version
  );
}
export function getServerSnapshot() {
  return "ssr";
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useAuth() {
  useStore();
  const storedUser = getUser();
  const hasToken = !!getToken();
  const isEngineAdmin = storedUser?.isEngineAdmin || db.isEngineAdmin || false;
  const isSSO = storedUser?.isSSO || db.isSSO || false;

  let userObj = null;
  if (hasToken && storedUser) {
    userObj = {
      name: storedUser.name || "Utilisateur",
      role: isEngineAdmin ? "engine_admin" : isSSO ? "sso" : "tenant_admin",
    };
  }

  let tenantId = isEngineAdmin
    ? db.activeTenantId
    : (storedUser?.tenantId || (hasToken ? db.activeTenantId : null));
  let tenantName = isEngineAdmin
    ? db.activeTenantName
    : (storedUser?.tenantName || db.activeTenantName || null);

  if (tenantId && !tenantName) {
    const cached = _cache.tenants.find(t => t.id === tenantId);
    tenantName = cached?.name || null;
  }

  return {
    tenant: tenantId ? { id: tenantId, name: tenantName || tenantId } : null,
    partner: null,
    isSSO,
    isEngineAdmin,
    isTenantAdmin: !isEngineAdmin && !isSSO,
    isAdmin: !isSSO,
    user: userObj,
  };
}

export function storeLogout() {
  db.activeTenantId = null;
  db.activeTenantName = null;
  db.activePartnerId = null;
  db.isSSO = false;
  db.isEngineAdmin = false;
  emit();
}

export function setActiveTenant(id, name) {
  db.activeTenantId = id;
  db.activeTenantName = name
    || _cache.tenants.find(t => t.id === id)?.name
    || null;
  _cache.pipelines.clear();
  _cache.alerts.clear();
  _cache.pipelinesById.clear();
  _invoicesCache.clear();
  _partnersCache.clear();
  emit();
}

export function setActivePartner(partnerId) {
  if (db.isSSO) return;
  db.activePartnerId = partnerId;
  emit();
}

function _strHash(s) {
  if (!s) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const _cache = {
  pipelines: new Map(),
  alerts: new Map(),
  pipelinesById: new Map(),
  partners: new Map(),
  tenants: [],
  tenantsLoaded: false,
  tenantStats: new Map(),
};

function _mapTenant(t, stats) {
  if (!t) return t;
  const s = stats || {};
  const fallbackLogo = (t.name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";
  return {
    ...t,
    plan: t.role || "USER",
    mrr: s.mrr ?? 0,
    invoiceCount: s.invoicesCount ?? 0,
    anomalyCount: s.anomaliesCount ?? 0,
    anomalyRate: s.invoicesCount ? (s.anomaliesCount || 0) / s.invoicesCount : 0,
    storage: t.storage || "shared",
    color: t.color || "#" + (_strHash(t.id || t.name) % 0xFFFFFF).toString(16).padStart(6, "0"),
    logo: t.logo || fallbackLogo,
  };
}

function _mapPipeline(p) {
  const processed = p.lastRunStats?.processedCount || p.invoicesProcessed || 0;
  const anomalies = p.lastRunStats?.anomalyCount || 0;
  return {
    ...p,
    connector: p.sourceType || p.connector,
    status: p.status === "ACTIVE" ? "actif" : p.status === "DRAFT" ? "draft" : "paused",
    description: p.description || p.name,
    tenantId: p.tenantId,
    workspaceStarted: p.lastRunAt ? true : false,
    invoicesProcessed: processed,
    erpPartnerId: p.config?.erpPartnerId,
    connectorId: p.connectorId,
    anomalyRate: processed > 0 ? anomalies / processed : 0,
    anomRate: processed > 0 ? anomalies / processed : 0,
    tolerancePct: p.tolerancePct ?? 15,
    toleranceDays: p.toleranceDays ?? 45,
    kFactor: p.kFactor ?? 3.5,
    freq: p.freq ?? "manual",
    lastRun: p.lastRunAt || p.lastRun || null,
  };
}

function _mapAlert(a) {
  return {
    ...a,
    read: a.status === "READ" || a.status === "RESOLVED",
    message: a.message || a.explanation || "",
    timestamp: a.detectedAt || a.timestamp || new Date().toISOString(),
    severity: a.severity ? a.severity.toLowerCase() : "info",
    type: a.type || a.anomalyType || "unknown",
  };
}

function _mapInvoice(inv) {
  const isAnomaly = String(inv.status || "").toLowerCase() === "anomaly" || !!inv.anomalyType;
  return {
    ...inv,
    date: inv.date || inv.invoiceDate || "",
    amount: inv.amount ?? 0,
    status: isAnomaly ? "anomaly" : "normal",
    anomalyType: inv.anomalyType || null,
  };
}

export function pipelinesForTenant(tenantId) {
  if (!_cache.pipelines.has(tenantId)) {
    const raw = PIPELINES_TABLE.filter(p => p.tenantId === tenantId);
    _cache.pipelines.set(tenantId, raw.map(_mapPipeline));
    raw.forEach(p => _cache.pipelinesById.set(p.id, _mapPipeline(p)));
  }
  return _cache.pipelines.get(tenantId);
}

export function alertsForTenant(tenantId) {
  if (!_cache.alerts.has(tenantId)) {
    const raw = ALERTS_TABLE.filter(a => a.tenantId === tenantId);
    _cache.alerts.set(tenantId, raw.map(_mapAlert));
  }
  return _cache.alerts.get(tenantId);
}

const _invoicesCache = new Map();

function _seedMockData() {
  const whitecape = USERS_TABLE.find((u) => !u.isEngineAdmin);
  if (!whitecape) return;
  const tid = whitecape.id;

  _cache.tenants = USERS_TABLE.filter(u => !u.isEngineAdmin);
  _cache.tenantsLoaded = true;
  _cache.tenantStats.set(tid, { invoicesCount: INVOICES_TABLE.length, anomaliesCount: INVOICES_TABLE.filter(i => i.status === "anomaly").length, mrr: 0 });

  _invoicesCache.set(tid, INVOICES_TABLE.map(_mapInvoice));

  if (!_cache.alerts.has(tid)) _cache.alerts.set(tid, ALERTS_TABLE.map(_mapAlert));

  if (!_cache.pipelines.has(tid)) {
    _cache.pipelines.set(tid, PIPELINES_TABLE.map(_mapPipeline));
    PIPELINES_TABLE.forEach(p => _cache.pipelinesById.set(p.id, _mapPipeline(p)));
  }

  const partnerKey = "int_" + tid;
  if (!_cache.partners.has(partnerKey)) {
    _cache.partners.set(partnerKey, TENANT_CONNECTIONS_TABLE);
  }

  if (!db.activeTenantId) {
    db.activeTenantId = tid;
    db.activeTenantName = whitecape.name;
  }
}

_seedMockData();

export function invoicesForTenant(tenantId) {
  if (!_invoicesCache.has(tenantId)) {
    const raw = INVOICES_TABLE.filter(inv => inv.tenantId === tenantId || inv.tenant_id === tenantId);
    _invoicesCache.set(tenantId, raw.map(_mapInvoice));
  }
  return _invoicesCache.get(tenantId);
}

const _commandesCache = new Map();

export function commandesForTenant(tenantId) {
  if (!_commandesCache.has(tenantId)) {
    _commandesCache.set(tenantId, COMMANDES_FRONTEND_TABLE.filter(c => c.fiscalYear === new Date().getFullYear()));
  }
  return _commandesCache.get(tenantId);
}

export function budgetAnalysisForTenant(tenantId) {
  return BUDGET_ANALYSIS_TABLE;
}

export function getPipeline(id) {
  if (!_cache.pipelinesById.has(id)) {
    const raw = PIPELINES_TABLE.find(p => p.id === id);
    if (raw) _cache.pipelinesById.set(id, _mapPipeline(raw));
    else return null;
  }
  return _cache.pipelinesById.get(id);
}

const _partnersCache = new Map();

export function partnersForTenant(tenantId) {
  if (!_partnersCache.has(tenantId)) {
    const raw = TENANT_CONNECTIONS_TABLE.filter(c => c.tenantId === tenantId);
    const partners = raw.map(c => {
      const conn = CONNECTORS_TABLE.find(x => x.id === c.connectorId);
      const name = conn?.name || c.connectorId?.slice(0, 8) || "ERP";
      return {
        id: c.id,
        name,
        external_tenant_id: c.externalId,
        tenantId: c.tenantId,
        logo: name.charAt(0).toUpperCase(),
        color: "#" + (_strHash(c.connectorId) % 0xFFFFFF).toString(16).padStart(6, "0"),
        connectorId: c.connectorId,
      };
    });
    _partnersCache.set(tenantId, partners);
  }
  return _partnersCache.get(tenantId);
}

function _enrichTenant(t) {
  if (!t) return t;
  const fullTenant = _cache.tenants.find((tenant) => tenant.id === t.id)
    || USERS_TABLE.find((tenant) => tenant.id === t.id)
    || null;
  const mergedTenant = fullTenant ? { ...t, ...fullTenant } : t;
  const stats = _cache.tenantStats.has(mergedTenant.id) ? _cache.tenantStats.get(mergedTenant.id) : {};
  return _mapTenant(mergedTenant, stats);
}

function _enrichAll(tenants) {
  return tenants.map(_enrichTenant);
}

export function visibleTenants() {
  if (!_cache.tenantsLoaded) {
    _cache.tenants = USERS_TABLE.filter(u => !u.isEngineAdmin);
    _cache.tenantsLoaded = true;
    if (!db.activeTenantId && _cache.tenants.length > 0) {
      setActiveTenant(_cache.tenants[0].id, _cache.tenants[0].name);
    }
  }
  return _enrichAll(_cache.tenants);
}

export function childTenants(parentId) {
  return _enrichAll(_cache.tenants.filter(t => t.parentId === parentId));
}

export function enrichTenant(t) {
  return _enrichTenant(t);
}

export function getIntegrationsForTenant(tenantId) {
  const key = "int_" + tenantId;
  if (!_cache.partners.has(key)) {
    const raw = TENANT_CONNECTIONS_TABLE.filter(c => c.tenantId === tenantId);
    _cache.partners.set(key, raw);
  }
  return _cache.partners.get(key);
}

export const tenantCreds = new Map();

export function getTenantCredentials(tenantId) {
  if (!tenantCreds.has(tenantId)) {
    const t = _cache.tenants.find((x) => x.id === tenantId);
    if (!t) return { username: "admin", password: "••••••••••••••••" };
    tenantCreds.set(tenantId, { username: t.username || "admin", password: "••••••••••••••••" });
  }
  return tenantCreds.get(tenantId);
}

export function createPipelineStore(data) {
  _cache.pipelinesById.set(data.id, _mapPipeline(data));
  const tid = data.tenantId;
  if (_cache.pipelines.has(tid)) {
    _cache.pipelines.get(tid).push(_mapPipeline(data));
  } else {
    _cache.pipelines.set(tid, [_mapPipeline(data)]);
  }
  emit();
  return data;
}

export async function updatePipelineStore(id, data) {
  try {
    const applyPatch = (p) => {
      if (!p) return;
    if (data.name != null) p.name = data.name;
    if (data.description != null) p.description = data.description;
    if (data.status === "actif") p.status = "actif";
    else if (data.status === "paused") p.status = "paused";
    if (data.connector) p.connector = data.connector;
    if (data.config != null) p.config = data.config;
    if (data.configJson != null) p.configJson = data.configJson;
    if (data.extraData != null) p.extraData = data.extraData;
    };
    const p = _cache.pipelinesById.get(id);
    if (!p) return;
    applyPatch(p);
    _cache.pipelines.forEach((list) => {
      const item = list.find((x) => x.id === id);
      applyPatch(item);
    });
    emit();
  } catch (err) {
    console.error("updatePipelineStore failed:", err);
  }
}

export async function deletePipelineStore(id) {
  try {
    const p = _cache.pipelinesById.get(id);
    if (p) {
      _cache.pipelinesById.delete(id);
      const tid = p.tenantId;
      if (_cache.pipelines.has(tid)) {
        _cache.pipelines.set(tid, _cache.pipelines.get(tid).filter(x => x.id !== id));
      }
      emit();
    }
  } catch (err) {
    console.error("deletePipelineStore failed:", err);
  }
}

export async function deleteTenantStore(id) {
  try {
    _cache.tenants = _cache.tenants.filter(t => t.id !== id);
    emit();
    return true;
  } catch {
    return false;
  }
}

export async function deleteAllDataForTenant(tenantId) {
  try {
    _cache.pipelines.set(tenantId, []);
    for (const [id, p] of _cache.pipelinesById.entries()) {
      if (p.tenantId === tenantId) _cache.pipelinesById.delete(id);
    }
    emit();
  } catch (err) {
    console.error("deleteAllDataForTenant failed:", err);
  }
}

export async function markAlertRead(alertId) {
  try {
    const raw = ALERTS_TABLE.find((x) => x.id === alertId);
    if (raw) raw.status = "READ";
    for (const [, arr] of _cache.alerts) {
      const a = arr.find(x => x.id === alertId);
      if (a) { a.read = true; a.status = "READ"; break; }
    }
    emit();
  } catch (err) {
    console.error("markAlertRead failed:", err);
  }
}

export function runMLAnalysis(pipelineId) {
  const p = getPipeline(pipelineId);
  const invoices = invoicesForTenant(p?.tenantId);
  const totalInvoices = invoices.length;
  const anomalies = invoices.filter(i => i.status === "anomaly").length;
  const anomalyRate = totalInvoices > 0 ? anomalies / totalInvoices : 0;
  const kFactor = 3.5;
  const monthly = [];
  const typeMap = {};
  invoices.forEach(i => {
    const month = (i.date || "2024-01-01").slice(0, 7);
    let mObj = monthly.find(m => m.month === month);
    if (!mObj) {
      mObj = { month, total: 0, anomalies: 0 };
      monthly.push(mObj);
    }
    mObj.total++;
    if (i.status === "anomaly") {
      mObj.anomalies++;
      const t = i.anomalyType || "autre";
      typeMap[t] = (typeMap[t] || 0) + 1;
    }
  });
  monthly.sort((a, b) => a.month.localeCompare(b.month));
  const colors = ["#D94F3D", "#F59E0B", "#8B5CF6", "#14B8A6"];
  const anomalyByType = Object.entries(typeMap).map(([type, count], idx) => ({ type, count, pct: count / anomalies, color: colors[idx % colors.length] }));
  const scatter = invoices.map((inv, idx) => ({
    x: idx,
    y: inv.amount || 0,
    isAnomaly: inv.status === "anomaly",
  }));
  const insights = [];
  if (anomalies > 0) insights.push(`${anomalies} facture(s) anormale(s) détectée(s) sur ${totalInvoices} — taux de ${(anomalyRate * 100).toFixed(1)}%.`);
  if (monthly.length > 0) {
    const peak = monthly.reduce((a, b) => (a.total > b.total ? a : b));
    insights.push(`Pic d'activité en ${peak.month} avec ${peak.total} facture(s).`);
  }
  const flaggedSuppliers = [...new Set(invoices.filter(i => i.status === "anomaly").map(i => i.supplier || ""))].filter(Boolean);
  if (flaggedSuppliers.length > 0) insights.push(`Fournisseur(s) à risque : ${flaggedSuppliers.join(", ")}.`);
  const highAmount = invoices.filter(i => (i.amount || 0) > 300);
  if (highAmount.length > 0) insights.push(`${highAmount.length} facture(s) de montant élevé (>300€) nécessitent une vigilance.`);
  if (insights.length === 0) insights.push("Aucune anomalie détectée — le flux est stable.");
  return { totalInvoices, anomalies, anomalyRate, kFactor, monthly, anomalyByType, scatter, insights };
}
