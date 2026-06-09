import React, { useEffect, useRef, useState } from 'react';
import type { Alert, FeedbackResponse, InvoiceCheckResult, SavedInvoice, Theme } from '../../types';
import { lightTheme } from '../../theme/ThemeProvider';
import { getAskGoSaasWidget, getAskGoSaasWidgets, subscribeToSaasWidgetUpdates, type AskGoWidgetSlot, type SaasWidget } from '../../saasWidgetStore';

// ─── Ask&Go brand theme ───────────────────────────────────────────────────────
export const askGoTheme: Theme = {
  ...lightTheme,
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

// ─── Icons ────────────────────────────────────────────────────────────────────
const BellIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const HomeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const CaretDown = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>;
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const MenuIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CartIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const SettingsIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-2.82-1.18l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9"/></svg>;
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;

// ─── Widget injection marker ──────────────────────────────────────────────────
function WidgetBadge({ name }: { name: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 3, background: '#fff3cd', border: '1px dashed #f59e0b', fontSize: 10, color: '#92400e', fontFamily: 'monospace', marginBottom: 6 }}>
      <span style={{ fontSize: 12 }}>⚡</span> Widget injecté : <strong>{name}</strong>
    </div>
  );
}

function AskGoWidgetFrame({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div style={{ border: '2px dashed #f59e0b', borderRadius: 4, background: '#fffbf0', overflow: 'hidden' }}>
      {title && (
        <div style={{ background: '#f59e0b', padding: '3px 10px', fontSize: 10, fontFamily: 'monospace', color: '#1a1a1a', fontWeight: 'bold', letterSpacing: '0.05em' }}>
          ⚡ WIDGET ANOMALYIQ — {title}
        </div>
      )}
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function WebWidget({
  tag,
  attrs,
  props,
  events,
}: {
  tag: string;
  attrs?: Record<string, string | number | undefined>;
  props?: Record<string, unknown>;
  events?: Record<string, (event: CustomEvent) => void>;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !props) return;
    Object.entries(props).forEach(([key, value]) => {
      (element as any)[key] = value;
    });
  }, [props]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !events) return;
    Object.entries(events).forEach(([name, handler]) => element.addEventListener(name, handler as EventListener));
    return () => {
      Object.entries(events).forEach(([name, handler]) => element.removeEventListener(name, handler as EventListener));
    };
  }, [events]);

  return React.createElement(tag, { ref, ...attrs });
}

function SaasWidgetGate({
  slot,
  children,
}: {
  slot: AskGoWidgetSlot;
  children: (widget: SaasWidget) => React.ReactNode;
}) {
  const [, setVersion] = useState(0);

  useEffect(() => subscribeToSaasWidgetUpdates(() => setVersion(version => version + 1)), []);

  const widget = getAskGoSaasWidget(slot);
  if (!widget || widget.status !== 'active') return <DisabledBox name={`${slot} désactivé dans le SaaS`} />;
  return <div style={buildWidgetThemeStyle(widget)}>{children(widget)}</div>;
}

function buildWidgetThemeStyle(widget: SaasWidget): React.CSSProperties {
  const cfg = widget.config;
  return {
    '--anomaly-primary-color': String(cfg.primaryColor ?? '#D94F3D'),
    '--anomaly-primary-dark': String(cfg.primaryDark ?? cfg.primaryColor ?? '#C84332'),
    '--anomaly-accent-color': String(cfg.accentColor ?? '#f59e0b'),
    '--anomaly-background': String(cfg.background ?? '#F0EDE8'),
    '--anomaly-surface': String(cfg.surface ?? 'rgba(255,255,255,0.72)'),
    '--anomaly-surface-hover': String(cfg.surfaceHover ?? 'rgba(217,79,61,0.04)'),
    '--anomaly-text-primary': String(cfg.textPrimary ?? '#18191C'),
    '--anomaly-text-secondary': String(cfg.textSecondary ?? '#525761'),
    '--anomaly-text-muted': String(cfg.textMuted ?? '#9CA3AF'),
    '--anomaly-border-color': String(cfg.borderColor ?? 'rgba(255,255,255,0.88)'),
    '--anomaly-border-radius': String(cfg.borderRadius ?? '16px'),
    '--anomaly-danger': String(cfg.danger ?? '#D94F3D'),
    '--anomaly-success': String(cfg.success ?? '#16a34a'),
    '--anomaly-warning': String(cfg.warning ?? '#d97706'),
    '--anomaly-info': String(cfg.info ?? '#0284c7'),
    '--anomaly-font-family': String(cfg.fontFamily ?? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"),
    '--anomaly-font-mono': String(cfg.fontFamilyMono ?? "'JetBrains Mono', 'Fira Code', monospace"),
  } as React.CSSProperties;
}

function buildThemeVars(theme: Theme): React.CSSProperties {
  return {
    '--anomaly-primary-color': theme.primaryColor,
    '--anomaly-primary-dark': theme.primaryDark,
    '--anomaly-accent-color': theme.accentColor,
    '--anomaly-background': theme.background,
    '--anomaly-surface': theme.surface,
    '--anomaly-surface-hover': theme.surfaceHover,
    '--anomaly-text-primary': theme.textPrimary,
    '--anomaly-text-secondary': theme.textSecondary,
    '--anomaly-text-muted': theme.textMuted,
    '--anomaly-border-color': theme.borderColor,
    '--anomaly-border-radius': theme.borderRadius,
    '--anomaly-danger': theme.danger,
    '--anomaly-success': theme.success,
    '--anomaly-warning': theme.warning,
    '--anomaly-info': theme.info,
    '--anomaly-font-family': theme.fontFamily,
    '--anomaly-font-mono': theme.fontFamilyMono,
  } as React.CSSProperties;
}

function SaasWidgetsPanel() {
  const [, setVersion] = useState(0);

  useEffect(() => subscribeToSaasWidgetUpdates(() => setVersion(version => version + 1)), []);

  const widgets = getAskGoSaasWidgets();
  return (
    <div style={{ background: 'var(--anomaly-surface)', border: '1px solid var(--anomaly-border-color)', borderRadius: 'var(--anomaly-border-radius)', padding: '16px 20px' }}>
      <h3 style={{ margin: 0, fontSize: 13, color: 'var(--anomaly-text-primary)', fontFamily: 'var(--anomaly-font-family)' }}>Widgets fournis par le SaaS</h3>
      <p style={{ margin: '2px 0 14px', fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>
        Configuration lue depuis WidgetsApp. Pour activer/désactiver un widget, utilisez le SaaS.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
        {widgets.map(widget => (
          <div key={widget.id} style={{ border: `1px solid ${widget.status === 'active' ? 'var(--anomaly-primary-color)' : 'var(--anomaly-border-color)'}`, borderRadius: 'var(--anomaly-border-radius)', padding: '10px 12px', background: widget.status === 'active' ? 'rgba(37,99,235,.06)' : 'var(--anomaly-background)' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: 'var(--anomaly-text-primary)', fontFamily: 'var(--anomaly-font-family)' }}>{widget.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>{widget.config.webComponent} · {widget.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props { token: string; }
type View = 'dashboard' | 'invoice' | 'alerts' | 'budget' | 'settings';

export function AskGoApp({ token }: Props) {
  const theme = askGoTheme;
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Invoice state
  const [supplier, setSupplier] = useState('Microsoft Corp');
  const [label, setLabel]       = useState('');
  const [amount, setAmount]     = useState('');
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);

  // Check state
  const [isChecking, setIsChecking]   = useState(false);
  const [checkResult, setCheckResult] = useState<InvoiceCheckResult | null>(null);
  const [savedInvoice, setSavedInvoice] = useState<SavedInvoice | null>(null);
  const [toastMsg, setToastMsg]       = useState('');

  // Alerts
  const [selectedAlert, setSelectedAlert]     = useState<Alert | null>(null);
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); }

  function handleStatusChange(_res: FeedbackResponse) {
    setAlertRefreshKey(k => k + 1);
    setTimeout(() => setSelectedAlert(null), 1200);
  }

  const C = { red: '#cc0000', bgGrey: theme.background, btnBlue: theme.primaryColor, btnGrey: '#f4f4f4', blueHeader: '#4488c5' };
  const fontFamily = theme.fontFamily;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bgGrey, fontFamily, ...buildThemeVars(theme) }}>

      {/* ── Top dark bar ── */}
      <header style={{ background: 'linear-gradient(to bottom, #3b3b3b 0%, #1a1a1a 100%)', color: 'white', padding: '0 15px', height: 46, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ backgroundColor: C.red, borderRadius: 4, padding: '3px 8px', fontSize: 18, letterSpacing: '-0.5px' }}>Ask&amp;Go</div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>WHITECAPE</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>TENANT_WC_00201323</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(to bottom, #444, #222)', border: '1px solid #555', borderRadius: 3, padding: '4px 8px', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <UserIcon /> USER <CaretDown />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(to bottom, #e60000, #a30000)', border: '1px solid #7a0000', borderRadius: 3, padding: '4px 20px', gap: 30, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
            Global <CaretDown />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(to bottom, #e60000, #a30000)', border: '1px solid #7a0000', borderRadius: 3, padding: '4px 10px', gap: 20, cursor: 'pointer', fontSize: 12, fontWeight: 'bold', color: '#fff' }}>
            Mes favoris <CaretDown />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ cursor: 'pointer' }}><InfoIcon /></div>
          <div style={{ cursor: 'pointer' }}><MailIcon /></div>
          <div style={{ position: 'relative', cursor: 'pointer', color: '#ccc' }} onClick={() => setCurrentView('alerts')} title="Alertes AnomalyIQ">
            <BellIcon />
            <span style={{ position: 'absolute', top: -6, right: -8, background: C.red, color: '#fff', borderRadius: 3, padding: '1px 3px', fontSize: 9, fontWeight: 'bold' }}>5</span>
          </div>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <MenuIcon />
            <span style={{ position: 'absolute', top: -6, right: -8, background: C.red, color: '#fff', borderRadius: 3, padding: '1px 3px', fontSize: 9, fontWeight: 'bold' }}>98</span>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', background: '#e65c00', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>
            <CartIcon />
            <span style={{ position: 'absolute', top: -5, right: -5, background: C.red, color: '#fff', borderRadius: 3, padding: '1px 3px', fontSize: 9, fontWeight: 'bold' }}>2</span>
          </div>
          <div style={{ width: 16, height: 11, background: 'linear-gradient(90deg, blue 33%, white 33%, white 66%, red 66%)', border: '1px solid #555' }} />
          <div style={{ cursor: 'pointer' }}><SettingsIcon /></div>
          <button onClick={() => setCurrentView('settings')} style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: 3, padding: '2px 7px', fontSize: 10, cursor: 'pointer', fontFamily: 'monospace' }}>
            ⚡ AIQ
          </button>
        </div>
      </header>

      {/* ── Red nav ── */}
      <nav style={{ background: 'linear-gradient(to bottom, #d30000, #a30000)', borderBottom: '2px solid #800000', display: 'flex', alignItems: 'center', padding: '0 20px', height: 36, fontSize: 12, fontWeight: 'bold', color: 'white', fontFamily }}>
        {([
          { key: 'dashboard', label: 'Accueil',        icon: <HomeIcon /> },
          { key: null,        label: 'Demandes' },
          { key: null,        label: 'Stock' },
          { key: null,        label: 'Dossiers achats' },
          { key: null,        label: 'Visa' },
          { key: null,        label: 'Commandes' },
          { key: null,        label: 'Réceptions' },
          { key: 'invoice',   label: 'Factures' },
          { key: 'budget',    label: 'Budget AIQ' },
        ] as { key: View | null; label: string; icon?: React.ReactNode }[]).map((item, i) => (
          <div key={i} onClick={() => item.key && setCurrentView(item.key)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: '100%', cursor: item.key ? 'pointer' : 'default', borderRight: '1px solid #800000', borderLeft: i === 0 ? '1px solid #800000' : undefined, background: currentView === item.key ? '#900000' : 'transparent', whiteSpace: 'nowrap' }}>
            {item.icon} {item.label} <CaretDown />
          </div>
        ))}
      </nav>

      {/* ── Toast ── */}
      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#333', color: '#fff', padding: '12px 20px', borderRadius: 4, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', zIndex: 2000, fontSize: 13 }}>{toastMsg}</div>
      )}

      <main style={{ padding: 10, background: C.bgGrey, minHeight: 'calc(100vh - 82px)', fontFamily }}>

        {/* DASHBOARD */}
        {currentView === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: 28, textAlign: 'center' }}>
              <h2 style={{ color: theme.textSecondary, marginBottom: 8, fontWeight: 'normal', fontFamily }}>Bienvenue dans Ask&amp;Go ERP</h2>
              <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20, fontFamily }}>ERP: WHITECAPE · ERP_WC_00201323</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {[{ label: 'Créer une facture', view: 'invoice', bg: C.red }, { label: '⚡ Alertes AnomalyIQ', view: 'alerts', bg: C.btnBlue }, { label: '📊 Budget & Prévisions', view: 'budget', bg: '#047857' }].map(b => (
                  <button key={b.view} onClick={() => setCurrentView(b.view as View)} style={{ background: b.bg, color: '#fff', border: 'none', padding: '8px 20px', borderRadius: theme.borderRadius, fontSize: 13, fontWeight: 'bold', cursor: 'pointer', fontFamily }}>{b.label}</button>
                ))}
              </div>
            </div>
            <div>
              <WidgetBadge name="AlertsWidget" />
              <AskGoWidgetFrame title="ALERTES ANOMALYIQ (aperçu)">
                <SaasWidgetGate slot="AlertsWidget">
                  {widget => <WebWidget
                    tag={String(widget.config.webComponent)}
                    attrs={{ token, 'api-key': widget.apiKey, 'status-filter': String(widget.config.statusFilter ?? 'PENDING'), 'refresh-key': alertRefreshKey }}
                    events={{ 'anomaly-select-alert': e => { setSelectedAlert(e.detail as Alert); setCurrentView('alerts'); } }}
                  />}
                </SaasWidgetGate>
              </AskGoWidgetFrame>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {currentView === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: '10px 16px' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: theme.textSecondary, fontWeight: 'normal', fontFamily }}>
                Alertes AnomalyIQ
                <span style={{ background: '#fff3cd', border: '1px solid #f59e0b', color: '#92400e', fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 3, marginLeft: 10 }}>⚡ AlertsWidget + AlertDetailWidget</span>
              </h2>
            </div>
            <WidgetBadge name="AlertsWidget + AlertDetailWidget" />
            <div style={{ display: 'grid', gridTemplateColumns: selectedAlert ? '1fr 1fr' : '1fr', gap: 10 }}>
              <SaasWidgetGate slot="AlertsWidget">
                {widget => (
                <AskGoWidgetFrame title="LISTE DES ALERTES">
                  <WebWidget
                    tag={String(widget.config.webComponent)}
                    attrs={{ token, 'api-key': widget.apiKey, 'refresh-key': alertRefreshKey }}
                    events={{ 'anomaly-select-alert': e => setSelectedAlert(e.detail as Alert) }}
                  />
                </AskGoWidgetFrame>
                )}
              </SaasWidgetGate>
              {selectedAlert && (
                <SaasWidgetGate slot="AlertDetailWidget">
                  {widget => (
                    <AskGoWidgetFrame title="DÉTAIL DE L'ALERTE">
                      <WebWidget
                        tag={String(widget.config.webComponent)}
                        attrs={{ token, 'api-key': widget.apiKey }}
                        props={{ alert: selectedAlert }}
                        events={{
                          'anomaly-status-change': e => handleStatusChange(e.detail as FeedbackResponse),
                          'anomaly-close': () => setSelectedAlert(null),
                        }}
                      />
                    </AskGoWidgetFrame>
                  )}
                </SaasWidgetGate>
              )}
            </div>
          </div>
        )}

        {/* INVOICE */}
        {currentView === 'invoice' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: checkResult ? '0 0 55%' : '1', minWidth: 0, background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: 20, transition: 'flex 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                <h2 style={{ margin: 0, fontSize: 22, color: theme.textSecondary, fontWeight: 'normal', fontFamily }}>Facture</h2>
                <span style={{ background: '#aaa', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 3, marginLeft: 10, textTransform: 'uppercase' }}>Création</span>
              </div>
              <div style={{ background: '#4488c5', color: '#fff', padding: 15, display: 'flex', justifyContent: 'space-between', marginBottom: 20, borderRadius: 2 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>Facture</div>
                  <div style={{ fontSize: 12 }}>Faite par USER, le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12 }}>Montant : <strong>{amount || '0'} EUR</strong></div>
                  <div style={{ fontSize: 12 }}>Date : <strong>{date}</strong></div>
                </div>
              </div>
              <div style={{ background: '#eaf4f9', border: '1px solid #bce8f1', padding: 15, fontSize: 12, color: '#31708f', display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <div><strong>Type facture</strong>&nbsp;&nbsp;Factures ss BC ss TVA</div>
                <div><strong>Code procédure</strong>&nbsp;&nbsp;W1S1FAC-1</div>
              </div>
              <div style={{ background: '#fffdf0', border: `1px solid ${theme.borderColor}`, padding: 20, marginBottom: 20 }}>
                <h3 style={{ marginBottom: 15, fontSize: 14, fontWeight: 'bold', color: theme.textPrimary, fontFamily }}>Détails de la facture</h3>
                <div style={{ display: 'flex', gap: 20, marginBottom: 15 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontFamily }}>Fournisseur *</label>
                    <select value={supplier} onChange={e => { setSupplier(e.target.value); setCheckResult(null); }} style={{ ...selectStyle, fontFamily }}>
                      <option value="">— Sélectionner —</option>
                      {['Microsoft Corp','Google LLC','Apple Inc','Acme Corp','Globex Ltd'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontFamily }}>Libellé / Service</label>
                    <select value={label} onChange={e => setLabel(e.target.value)} style={{ ...selectStyle, fontFamily }}>
                      <option value="">— Sélectionner —</option>
                      {['Licences logicielles','Prestations de services','Matériel informatique','Fournitures de bureau','Maintenance & support'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontFamily }}>Montant (€) *</label>
                    <input type="number" placeholder="0.00" value={amount} onChange={e => { setAmount(e.target.value); setCheckResult(null); }} style={{ ...inputStyle, fontFamily }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...labelStyle, fontFamily }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, fontFamily }} />
                  </div>
                </div>
              </div>
              <div style={{ background: '#fffbf0', border: '1px dashed #f59e0b', borderRadius: 4, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#92400e', fontFamily: 'monospace' }}>
                ⚡ "Vérifier anomalie" → <strong>ScoreWidget</strong> via <code>POST /pipelines/askgo/invoices/check</code>
              </div>
              <div style={{ borderTop: `1px solid ${theme.borderColor}`, paddingTop: 15, display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => { if (!supplier || !amount) return; setIsChecking(true); setCheckResult(null); }} disabled={isChecking || !supplier || !amount} style={{ background: C.btnBlue, color: '#fff', border: `1px solid ${theme.primaryDark}`, padding: '6px 14px', borderRadius: theme.borderRadius, fontSize: 13, fontWeight: 'bold', cursor: (!supplier || !amount) ? 'not-allowed' : 'pointer', opacity: (!supplier || !amount) ? 0.6 : 1, fontFamily }}>
                  {isChecking ? 'Analyse IA…' : 'Vérifier anomalie ⚡'}
                </button>
                {checkResult && (
                  <button onClick={() => { showToast('Facture enregistrée.'); setCheckResult(null); setAmount(''); setLabel(''); }} style={{ background: '#f4f4f4', color: '#333', border: '1px solid #ccc', padding: '6px 14px', borderRadius: theme.borderRadius, fontSize: 13, cursor: 'pointer', fontFamily }}>Enregistrer</button>
                )}
              </div>
            </div>
            {(isChecking || checkResult) && supplier && amount && (
              <div style={{ flex: '0 0 41%', minWidth: 0 }}>
                <WidgetBadge name="ScoreWidget (AnomalyIQ)" />
                <AskGoWidgetFrame title="SCORE D'ANOMALIE">
                  <SaasWidgetGate slot="ScoreWidget">
                    {widget => (
                    <WebWidget
                      tag={String(widget.config.webComponent)}
                      attrs={{ token, 'api-key': widget.apiKey, 'pipeline-id': String(widget.config.pipelineId ?? 'pipeline_askgo') }}
                      props={{ invoiceData: { supplier, amount: Number(amount), date } }}
                      events={{ 'anomaly-score-received': e => { setCheckResult(e.detail as InvoiceCheckResult); setIsChecking(false); } }}
                    />
                    )}
                  </SaasWidgetGate>
                </AskGoWidgetFrame>
              </div>
            )}
          </div>
        )}

        {/* BUDGET */}
        {currentView === 'budget' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: '10px 16px' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: theme.textSecondary, fontWeight: 'normal', fontFamily }}>
                Budget & Prévisions <span style={{ background: '#fff3cd', border: '1px solid #f59e0b', color: '#92400e', fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 3, marginLeft: 10 }}>⚡ BudgetWidget + ForecastWidget</span>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 10 }}>
              <SaasWidgetGate slot="BudgetWidget">
                {widget => <div><WidgetBadge name="BudgetWidget" /><AskGoWidgetFrame title="BUDGET VS RÉALISÉ"><WebWidget tag={String(widget.config.webComponent)} attrs={{ token, 'api-key': widget.apiKey, 'pipeline-id': String(widget.config.pipelineId ?? 'pipeline_123'), 'series-id': String(widget.config.seriesId ?? 'series_456'), year: Number(widget.config.year ?? 2024) }} /></AskGoWidgetFrame></div>}
              </SaasWidgetGate>
              <SaasWidgetGate slot="ForecastWidget">
                {widget => <div><WidgetBadge name="ForecastWidget" /><AskGoWidgetFrame title="PRÉVISIONS 12 MOIS"><WebWidget tag={String(widget.config.webComponent)} attrs={{ token, 'api-key': widget.apiKey, 'pipeline-id': String(widget.config.pipelineId ?? 'pipeline_123'), 'series-id': String(widget.config.seriesId ?? 'series_456') }} /></AskGoWidgetFrame></div>}
              </SaasWidgetGate>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {currentView === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: '10px 16px' }}>
              <h2 style={{ margin: 0, fontSize: 18, color: theme.textSecondary, fontWeight: 'normal', fontFamily }}>
                Réglages AnomalyIQ — Ask&amp;Go
                <span style={{ background: '#fff3cd', border: '1px solid #f59e0b', color: '#92400e', fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 3, marginLeft: 10 }}>⚡ Configuration des widgets</span>
              </h2>
            </div>

            {/* SaaS widget contract */}
            <div style={{ background: theme.surface, border: `1px solid ${theme.borderColor}`, borderRadius: theme.borderRadius, padding: 16 }}>
              <SaasWidgetsPanel />
            </div>

            {/* Integration doc */}
            <div style={{ background: '#fff3cd', border: '1px solid #f59e0b', borderRadius: theme.borderRadius, padding: 14, fontSize: 12, color: '#92400e', fontFamily: 'monospace' }}>
              <strong>Intégration Ask&amp;Go × AnomalyIQ :</strong><br /><br />
              1. WidgetsApp publie les widgets Ask&amp;Go dans <code>widgetsapp.saas.widgetData.v1</code><br />
              2. Ask&amp;Go lit le slot SaaS actif avant de monter chaque web component<br />
              3. Chaque web component reçoit <code>api-key</code>, <code>token</code> et la configuration SaaS<br />
              4. Callbacks (<code>anomaly-score-received</code>, <code>anomaly-status-change</code>…) notifient l'ERP<br />
              5. CSS scope isolé : <strong>.erp-theme-askgo-standalone</strong> — aucune fuite vers l'application hôte
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DisabledBox({ name }: { name: string }) {
  return (
    <div style={{ padding: 20, border: '1px dashed #ccc', borderRadius: 4, textAlign: 'center', color: '#aaa', fontSize: 12, fontFamily: 'monospace' }}>
      ◌ <strong>{name}</strong> désactivé dans Réglages
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: '#777', marginBottom: 5, fontWeight: 'bold' };
const selectStyle: React.CSSProperties = { width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 3, fontSize: 12 };
