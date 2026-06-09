const BASE_URL = '/api';
const ERP_ID = 'erp_demo_42';

interface FetchOptions extends RequestInit {
  token?: string;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, signal, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-ERP-ID': ERP_ID,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> | undefined) },
    signal,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { const body = await res.json(); message = body.error || message; } catch { /* ignore */ }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

// ─── Core ERP API ─────────────────────────────────────────────────────────────

export const api = {
  ssoExchange: (signal?: AbortSignal) =>
    apiFetch<{ token: string }>('/sso/exchange', { method: 'POST', signal }),

  getAdminConnectors: (signal?: AbortSignal) =>
    apiFetch<{ content?: Array<Record<string, unknown>> } | Array<Record<string, unknown>>>('/admin/connectors', { signal }),

  getAlerts: (params: { status?: string; supplier?: string; page?: number; size?: number }, token: string, signal?: AbortSignal) => {
    const q = new URLSearchParams();
    if (params.status)   q.set('status', params.status);
    if (params.supplier) q.set('supplier', params.supplier);
    if (params.page !== undefined) q.set('page', String(params.page));
    if (params.size !== undefined) q.set('size', String(params.size));
    return apiFetch<import('../types').AlertsPage>(`/alerts?${q}`, { token, signal });
  },

  getAlert: (id: string, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').AlertDetail>(`/alerts/${id}`, { token, signal }),

  postFeedback: (alertId: string, payload: import('../types').FeedbackPayload, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').FeedbackResponse>(`/feedback/${alertId}`, {
      method: 'POST', body: JSON.stringify(payload), token, signal,
    }),

  checkInvoice: (pipelineId: string, data: import('../types').InvoiceData, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').InvoiceCheckResult>(`/pipelines/${pipelineId}/invoices/check`, {
      method: 'POST', body: JSON.stringify(data), token, signal,
    }),

  confirmInvoice: (pipelineId: string, data: import('../types').InvoiceData & { score?: number }, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').SavedInvoice>(`/pipelines/${pipelineId}/invoices/confirm`, {
      method: 'POST', body: JSON.stringify(data), token, signal,
    }),

  getBudget: (pipelineId: string, seriesId: string, year: number, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').BudgetData>(
      `/pipelines/${pipelineId}/series/${seriesId}/budget?year=${year}`,
      { token, signal },
    ),

  getForecast: (pipelineId: string, seriesId: string, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').ForecastPage>(
      `/pipelines/${pipelineId}/series/${seriesId}/forecast`,
      { token, signal },
    ),

  // ─── Procurement API ───────────────────────────────────────────────────────

  getSuppliers: (params: { status?: string; page?: number; size?: number }, token: string, signal?: AbortSignal) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.page !== undefined) q.set('page', String(params.page));
    if (params.size !== undefined) q.set('size', String(params.size));
    return apiFetch<import('../types').SuppliersPage>(`/suppliers?${q}`, { token, signal });
  },

  getSupplier: (id: string, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').Supplier>(`/suppliers/${id}`, { token, signal }),

  updateSupplierStatus: (id: string, status: string, token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').Supplier>(`/suppliers/${id}/status`, {
      method: 'POST', body: JSON.stringify({ status }), token, signal,
    }),

  getDepartments: (token: string, signal?: AbortSignal) =>
    apiFetch<import('../types').Department[]>('/departments', { token, signal }),

  getInvoices: (params: { supplier?: string; page?: number; size?: number }, token: string, signal?: AbortSignal) => {
    const q = new URLSearchParams();
    if (params.supplier) q.set('supplier', params.supplier);
    if (params.page !== undefined) q.set('page', String(params.page));
    if (params.size !== undefined) q.set('size', String(params.size));
    return apiFetch<import('../types').InvoicesPage>(`/invoices?${q}`, { token, signal });
  },
};
