import { apiGet, apiPost, apiPut, apiDelete } from "@/utils/api";

export const PIPELINE_STEPS = [
  "Mapping",
  "Nettoyage",
  "EDA",
  "Clusters",
  "Séries",
  "Config",
  "Détection",
  "Dashboard",
];

/* ─── CSV HELPERS ────────────────────────────────────────────────────────────── */
export function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV needs header + data rows.");
  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = lines[i].split(sep).map((v) => v.trim().replace(/^"|"$/g, ""));
    if (vals.length !== headers.length) continue;
    const row = {};
    headers.forEach((h, j) => { row[h] = vals[j]; });
    rows.push(row);
  }
  return { headers, rows };
}

export function downloadCSV(rows, filename) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


/* ─── Reactive workspace store (populated from API) ─────────────────────────── */
export let wsStore = {
  config: { tolerance_pct: 10, tolerance_days: 10 },
  invoices: [],
  series: [],
  alerts: [],
  detectionRun: false,
  ignoredIds: new Set(),
  activePipelineId: null,
};

function pid() {
  const id = wsStore.activePipelineId;
  if (!id) throw new Error("No active pipeline set. Call wsStore.activePipelineId = pipelineId first.");
  return id;
}

/* ─── API-bound workspace methods ──────────────────────────────────────────── */
export const wsAPI = {
  /* ── CSV / Upload ──────────────────────────────────────────────────────── */
  previewCSV: async () => {
    const res = await apiPost(`/pipelines/${pid()}/preview/csv`);
    wsStore.invoices = res?.rows || [];
    return {
      headers: Object.keys(wsStore.invoices[0] || {}),
      sample: wsStore.invoices.slice(0, 5),
      row_count: wsStore.invoices.length,
    };
  },

  importCSV: async () => {
    const res = await apiPost(`/pipelines/${pid()}/import`);
    wsStore.series = [];
    wsStore.alerts = [];
    wsStore.detectionRun = false;
    return { ok: true, imported: res?.imported || 0 };
  },

  /* ── Suppliers / Distributions (computed from invoices) ────────────────── */
  getSupplierCounts: async () => {
    const res = await apiGet("/invoices/supplier-counts");
    return { supplier_counts: res || {} };
  },

  getDistribution: async () => {
    const res = await apiGet("/invoices/distribution");
    return { amounts: res?.amounts || [] };
  },

  getMonthlyTotals: async () => {
    const res = await apiGet("/invoices/monthly-totals");
    return res || { months: [], totals: [] };
  },

  getTimeseries: async () => {
    const res = await apiGet("/invoices/timeseries");
    return res || { data: [] };
  },

  getAllInvoices: async () => {
    const res = await apiGet("/invoices", { size: 1000 });
    return res || { invoices: [] };
  },

  /* ── Series ────────────────────────────────────────────────────────────── */
  buildSeries: async (groupConfig) => {
    const res = await apiPost(`/pipelines/${pid()}/series/build`, groupConfig);
    return {
      series: (res?.series || res?.content || []).map((s) => ({
        id: s.id,
        name: s.name || `${s.supplier} · ${s.label || ""}`,
        supplier: s.supplier,
        label: s.label,
        n: s.n || s.invoiceCount || 0,
        mu: s.mu || 0,
        sigma: s.sigma || 0,
        cv: s.cv || 0,
        flagged: s.flagged || s.cv > 0.25 || (s.n || 0) < 3,
        high_cv: s.cv > 0.25,
        low_volume: (s.n || 0) < 3,
        tolerance_pct: s.tolerance_pct ?? wsStore.config.tolerance_pct,
        tolerance_days: s.tolerance_days ?? wsStore.config.tolerance_days,
        use_seasonality: s.use_seasonality ?? false,
        monthlyMuMap: s.monthlyMuMap || {},
        median_gap_days: s.median_gap_days || 30,
        seasonality_ratio: s.seasonality_ratio || 1,
        lastReceivedDate: s.lastReceivedDate,
        lastValidatedDate: s.lastValidatedDate,
        active: s.active !== false,
      })),
    };
  },

  confirmSeries: async (groupConfig) => {
    await apiPost(`/pipelines/${pid()}/series/confirm`, groupConfig);
    return { ok: true, count: 0 };
  },

  listSeries: async () => {
    const res = await apiGet(`/pipelines/${pid()}/series`);
    const series = res?.content || res || [];
    wsStore.series = series;
    return series.map((s) => ({
      id: s.id,
      name: s.name || `${s.supplier} · ${s.label || ""}`,
      supplier: s.supplier,
      label: s.label,
      n: s.n || s.invoiceCount || 0,
      mu: s.mu || 0,
      sigma: s.sigma || 0,
      cv: s.cv || 0,
      flagged: s.flagged || s.cv > 0.25 || (s.n || 0) < 3,
      high_cv: s.cv > 0.25,
      low_volume: (s.n || 0) < 3,
      tolerance_pct: s.tolerance_pct ?? wsStore.config.tolerance_pct,
      tolerance_days: s.tolerance_days ?? wsStore.config.tolerance_days,
      use_seasonality: s.use_seasonality ?? false,
      monthlyMuMap: s.monthlyMuMap || {},
      median_gap_days: s.median_gap_days || 30,
      forecast_start_today: s.forecast_start_today ?? false,
      active: s.active !== false,
    }));
  },

  getSeries: async () => {
    return wsAPI.listSeries();
  },

  getForecast: async (sid, opts = {}) => {
    const res = await apiGet(`/pipelines/${pid()}/series/${sid}/forecast`);
    return { forecast: res?.forecast || [] };
  },

  getSeriesSeasonality: async (sid) => {
    const fc = await wsAPI.getForecast(sid);
    return { monthly_mu: fc?.monthlyMuMap || {} };
  },

  getSeriesRhythm: async (sid) => {
    const fc = await wsAPI.getForecast(sid);
    return { median_gap_days: fc?.median_gap_days || 30, gaps: [] };
  },

  updateSeriesConfig: async (sid, cfg) => {
    await apiPut(`/pipelines/${pid()}/series/${sid}/config`, cfg);
    return { ok: true };
  },

  /* ── Detection ─────────────────────────────────────────────────────────── */
  runDetection: async () => {
    const res = await apiPost(`/pipelines/${pid()}/run`);
    wsStore.detectionRun = true;
    return { ok: true, alerts_created: res?.alerts?.length || 0 };
  },

  getAlerts: async (status = "pending") => {
    const params = status !== "all" && status !== null ? { status: status.toUpperCase() } : {};
    const res = await apiGet("/alerts", params);
    const alerts = res?.content || [];
    wsStore.alerts = alerts;
    if (status === "all" || status === null) return alerts;
    const filterStatus = status.toLowerCase();
    return alerts.filter(
      (a) => {
        const current = (a.status || "pending").toLowerCase();
        return current === filterStatus || (filterStatus === "pending" && current === "active");
      }
    );
  },

  submitFeedback: async (alertId, decision) => {
    const decisionMap = {
      accept: "CONFIRMED",
      reject: "REJECTED",
      ignore: "IGNORED",
      confirmed: "CONFIRMED",
      false_positive: "REJECTED",
      rejected: "REJECTED",
      ignored: "IGNORED",
    };
    const d = decisionMap[decision.toLowerCase()] || decision.toUpperCase();
    await apiPost(`/feedback/${alertId}`, { decision: d, comment: "" });
    return { ok: true };
  },

  /* ── Database / Reset ──────────────────────────────────────────────────── */
  resetDatabase: async () => {
    try {
      await apiDelete(`/pipelines/${pid()}/data`);
    } catch (e) {
      console.warn("resetDatabase: endpoint not available, clearing local cache");
    }
    wsStore = {
      config: { tolerance_pct: 10, tolerance_days: 10 },
      invoices: [],
      series: [],
      alerts: [],
      detectionRun: false,
      ignoredIds: new Set(),
      activePipelineId: wsStore.activePipelineId,
    };
    return { ok: true };
  },

  ignoreInvoices: async (ids) => {
    (ids || []).forEach((id) => {
      wsStore.ignoredIds = wsStore.ignoredIds || new Set();
      wsStore.ignoredIds.add(id);
    });
    return { ok: true };
  },

  /* ── Feedback Log ──────────────────────────────────────────────────────── */
  getFeedbackLog: async () => {
    const res = await apiGet("/feedback/log");
    const log = res?.content || [];
    return log;
  },

  /* ── Config ────────────────────────────────────────────────────────────── */
  batchForecastStart: async (val) => {
    const series = await wsAPI.listSeries();
    await Promise.all(
      series.map((s) => wsAPI.updateSeriesConfig(s.id, { forecast_start_today: val }))
    );
    return { ok: true };
  },

  setGlobalConfig: async (cfg) => {
    wsStore.config = { ...wsStore.config, ...cfg };
    const series = await wsAPI.listSeries();
    if (series.length > 0) {
      await Promise.all(
        series.map((s) =>
          wsAPI.updateSeriesConfig(s.id, {
            tolerance_pct: cfg.tolerance_pct ?? s.tolerance_pct,
            tolerance_days: cfg.tolerance_days ?? s.tolerance_days,
          })
        )
      );
    }
    return { ok: true };
  },

  /* ── Single invoice ────────────────────────────────────────────────────── */
  addInvoice: async (supplier, amount, date, label, status) => {
    await apiPost(`/pipelines/${pid()}/invoices/check`, {
      supplierCode: supplier,
      amount,
      invoiceDate: date,
      label: label || null,
      status: status || "VALID",
    });
    return { ok: true };
  },
};


export const wsEnsureSeries = async () => { if (!wsStore.series.length) await wsAPI.listSeries(); };
