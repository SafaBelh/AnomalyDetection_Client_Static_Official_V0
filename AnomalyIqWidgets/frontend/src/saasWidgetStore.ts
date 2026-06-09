export type SaasWidgetStatus = 'active' | 'paused';

export type AskGoWidgetSlot =
  | 'AlertsWidget'
  | 'AlertDetailWidget'
  | 'ScoreWidget'
  | 'BudgetWidget'
  | 'ForecastWidget';

export type SaasWidgetType =
  | 'askgo-alerts'
  | 'askgo-alert-detail'
  | 'askgo-score'
  | 'askgo-budget'
  | 'askgo-forecast';

export interface SaasClient {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  joinDate: string;
}

interface AnomalyIqConnector {
  id?: string;
  name?: string;
  email?: string;
  status?: string;
  availabilityStatus?: string;
  plan?: string;
  connectorType?: string;
  type?: string;
  color?: string;
}

export interface SaasWidget {
  id: string;
  name: string;
  type: SaasWidgetType | string;
  apiKey: string;
  clientId: string;
  status: SaasWidgetStatus;
  createdAt: string;
  config: Record<string, unknown> & {
    slot?: AskGoWidgetSlot;
    webComponent?: string;
    pipelineId?: string;
    seriesId?: string;
    year?: number;
  };
}

export interface SaasWidgetData {
  clients: SaasClient[];
  widgets: SaasWidget[];
}

export const SAAS_WIDGET_STORAGE_KEY = 'widgetsapp.saas.widgetData.v1';
export const SAAS_WIDGET_UPDATED_EVENT = 'widgetsapp:widgets-updated';
export const ASKGO_CLIENT_ID = 'mock-conn-1';

const ANOMALYIQ_WIDGET_THEME = {
  themePreset: 'AnomalyIQ',
  primaryColor: '#D94F3D',
  primaryDark: '#C84332',
  accentColor: '#f59e0b',
  background: '#F0EDE8',
  surface: 'rgba(255,255,255,0.72)',
  surfaceHover: 'rgba(217,79,61,0.04)',
  textPrimary: '#18191C',
  textSecondary: '#525761',
  textMuted: '#9CA3AF',
  borderColor: 'rgba(255,255,255,0.88)',
  borderRadius: '16px',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
};

export const ASKGO_WIDGET_TYPES: Record<SaasWidgetType, { slot: AskGoWidgetSlot; label: string; webComponent: string }> = {
  'askgo-alerts': { slot: 'AlertsWidget', label: 'Alertes Ask&Go', webComponent: 'anomaly-alerts' },
  'askgo-alert-detail': { slot: 'AlertDetailWidget', label: 'Détail alerte Ask&Go', webComponent: 'anomaly-alert-detail' },
  'askgo-score': { slot: 'ScoreWidget', label: 'Score facture Ask&Go', webComponent: 'anomaly-score' },
  'askgo-budget': { slot: 'BudgetWidget', label: 'Budget Ask&Go', webComponent: 'anomaly-budget' },
  'askgo-forecast': { slot: 'ForecastWidget', label: 'Prévisions Ask&Go', webComponent: 'anomaly-forecast' },
};

export function createDefaultSaasWidgetData(): SaasWidgetData {
  const client: SaasClient = {
    id: ASKGO_CLIENT_ID,
    name: 'Ask&Go ERP',
    email: 'admin@askgo.example',
    plan: 'ERP',
    status: 'active',
    joinDate: '2024-01-15',
  };
  const liaDevClient: SaasClient = {
    id: 'mock-conn-liadev',
    name: 'LiaDev ERP',
    email: 'admin@liadev.local',
    plan: 'ERP',
    status: 'active',
    joinDate: '2024-01-15',
  };

  const createdAt = client.joinDate;
  const baseConfig = {
    companyName: client.name,
    welcomeMessage: '',
    ...ANOMALYIQ_WIDGET_THEME,
  };

  return {
    clients: [client, liaDevClient],
    widgets: [
      { id: 'w_askgo_alerts', name: 'Alertes anomalies', type: 'askgo-alerts', apiKey: 'sk_live_askgo_alerts', clientId: client.id, status: 'active', createdAt, config: { ...baseConfig, ...ASKGO_WIDGET_TYPES['askgo-alerts'], statusFilter: 'PENDING' } },
      { id: 'w_askgo_alert_detail', name: 'Détail anomalie', type: 'askgo-alert-detail', apiKey: 'sk_live_askgo_alert_detail', clientId: client.id, status: 'active', createdAt, config: { ...baseConfig, ...ASKGO_WIDGET_TYPES['askgo-alert-detail'] } },
      { id: 'w_askgo_score', name: 'Score facture', type: 'askgo-score', apiKey: 'sk_live_askgo_score', clientId: client.id, status: 'active', createdAt, config: { ...baseConfig, ...ASKGO_WIDGET_TYPES['askgo-score'], pipelineId: 'pipeline_askgo' } },
      { id: 'w_askgo_budget', name: 'Budget vs réalisé', type: 'askgo-budget', apiKey: 'sk_live_askgo_budget', clientId: client.id, status: 'active', createdAt, config: { ...baseConfig, ...ASKGO_WIDGET_TYPES['askgo-budget'], pipelineId: 'pipeline_123', seriesId: 'series_456', year: 2024 } },
      { id: 'w_askgo_forecast', name: 'Prévisions budget', type: 'askgo-forecast', apiKey: 'sk_live_askgo_forecast', clientId: client.id, status: 'active', createdAt, config: { ...baseConfig, ...ASKGO_WIDGET_TYPES['askgo-forecast'], pipelineId: 'pipeline_123', seriesId: 'series_456' } },
    ],
  };
}

function normalize(data: SaasWidgetData): SaasWidgetData {
  const defaults = createDefaultSaasWidgetData();
  const clientsById = new Map(defaults.clients.map(client => [client.id, client]));
  for (const client of data.clients ?? []) {
    if (clientsById.has(client.id)) clientsById.set(client.id, { ...clientsById.get(client.id), ...client });
  }
  const widgets = (data.widgets ?? [])
    .filter(widget => widget.clientId && widget.config)
    .map(widget => {
      const defaultsForSlot = defaults.widgets.find(defaultWidget => defaultWidget.config.slot === widget.config.slot);
      if (!defaultsForSlot) return widget;
      return { ...defaultsForSlot, ...widget, config: { ...defaultsForSlot.config, ...widget.config } };
    });

  for (const defaultWidget of defaults.widgets) {
    if (!widgets.some(widget => widget.clientId === ASKGO_CLIENT_ID && (widget.id === defaultWidget.id || widget.config?.slot === defaultWidget.config.slot))) {
      widgets.push(defaultWidget);
    }
  }

  return { clients: [...clientsById.values()], widgets };
}

export function readSaasWidgetData(): SaasWidgetData {
  if (typeof window === 'undefined') return createDefaultSaasWidgetData();

  try {
    const raw = window.localStorage.getItem(SAAS_WIDGET_STORAGE_KEY);
    const data = raw ? normalize(JSON.parse(raw) as SaasWidgetData) : createDefaultSaasWidgetData();
    writeSaasWidgetData(data, false);
    return data;
  } catch {
    const data = createDefaultSaasWidgetData();
    writeSaasWidgetData(data, false);
    return data;
  }
}

export function writeSaasWidgetData(data: SaasWidgetData, notify = true) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SAAS_WIDGET_STORAGE_KEY, JSON.stringify(data));
  if (notify) window.dispatchEvent(new CustomEvent(SAAS_WIDGET_UPDATED_EVENT));
}

function normalizeConnectorStatus(connector: AnomalyIqConnector) {
  const status = (connector.status || connector.availabilityStatus || '').toLowerCase();
  return status === 'connected' || status === 'active' ? 'active' : 'inactive';
}

function connectorToClient(connector: AnomalyIqConnector): SaasClient | null {
  if (!connector.id || !connector.name) return null;
  return {
    id: connector.id,
    name: connector.name,
    email: connector.email || `admin@${connector.name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'erp'}.local`,
    plan: connector.plan || connector.connectorType || connector.type || 'ERP',
    status: normalizeConnectorStatus(connector),
    joinDate: new Date().toISOString().slice(0, 10),
  };
}

function readLocalAnomalyIqConnectors(): AnomalyIqConnector[] {
  if (typeof window === 'undefined') return [];
  const keys = ['anomalyiq.integrations', 'anomalyiq.connectors', 'anomalyiq.erpConnectors'];
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed?.content;
      if (Array.isArray(list)) return list;
    } catch {
      // Ignore malformed host-app cache values.
    }
  }
  return [];
}

export function mergeErpConnectors(data: SaasWidgetData, connectors: AnomalyIqConnector[]): SaasWidgetData {
  const clientsById = new Map<string, SaasClient>();
  for (const connector of connectors) {
    const client = connectorToClient(connector);
    if (!client) continue;
    clientsById.set(client.id, { ...data.clients.find(existing => existing.id === client.id), ...client });
  }
  return { ...data, clients: connectors.length > 0 ? [...clientsById.values()] : data.clients };
}

export function syncLocalErpConnectors() {
  const connectors = readLocalAnomalyIqConnectors();
  if (connectors.length === 0) return readSaasWidgetData();
  const data = mergeErpConnectors(readSaasWidgetData(), connectors);
  writeSaasWidgetData(data);
  return data;
}

export function getAskGoSaasWidgets() {
  return readSaasWidgetData().widgets.filter(widget => widget.clientId === ASKGO_CLIENT_ID && widget.config?.slot);
}

export function getAskGoSaasWidget(slot: AskGoWidgetSlot) {
  return getAskGoSaasWidgets().find(widget => widget.config.slot === slot);
}

export function subscribeToSaasWidgetUpdates(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === SAAS_WIDGET_STORAGE_KEY) callback();
  };
  window.addEventListener(SAAS_WIDGET_UPDATED_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(SAAS_WIDGET_UPDATED_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}
