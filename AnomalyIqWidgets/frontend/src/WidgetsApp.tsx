// @ts-nocheck
import React from "react";
import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    Truck, MessageSquare, Bell, AlertTriangle, FileBarChart, BarChart3,
    Info, Star, X, Download, TrendingUp, TrendingDown, Package, Palette,
    Eye, Code, Copy, Zap, ArrowLeft, Users, Search, Plus,
    Pencil, Trash2, Settings, Power, PowerOff, ExternalLink,
    Code2, LayoutGrid, Puzzle,
    Activity, LayoutDashboard, ChevronRight, ShieldCheck,
    KeyRound, Ticket, Monitor, Send, ClipboardList, Globe, FileJson,
    Check, Brush
} from "lucide-react";
import { api } from "./api";
import { ASKGO_CLIENT_ID, ASKGO_WIDGET_TYPES, mergeErpConnectors, readSaasWidgetData, syncLocalErpConnectors, writeSaasWidgetData } from "./saasWidgetStore";
import { AlertsWidget } from "./widgets/AlertsWidget";
import { BudgetWidget } from "./widgets/BudgetWidget";
import { ForecastWidget } from "./widgets/ForecastWidget";
import { ScoreWidget } from "./widgets/ScoreWidget";

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
    red: "#D94F3D", redMid: "#E8736A", redLight: "#F2A49F", redPale: "#FDF1F0",
    grey900: "#18191C", grey800: "#2D3038", grey700: "#3D4149", grey600: "#525761",
    grey500: "#6B7280", grey400: "#9CA3AF", grey300: "#C4C7CC", grey200: "#E5E7EB",
    grey100: "#F3F4F6", grey50: "#FAFAFA", white: "#FFFFFF",
    glass: "rgba(255,255,255,0.65)", glassBd: "rgba(255,255,255,0.88)",
    success: "#22C55E", warning: "#F59E0B", info: "#3B82F6",
    purple: "#8B5CF6", teal: "#14B8A6", pink: "#EC4899", orange: "#F97316",
    bg: "#F0EDE8",
};

const cn = (...cls) => cls.filter(Boolean).join(" ");
const ModalPortal = ({ children }) => typeof document === "undefined" ? children : createPortal(children, document.body);

// ── Global styles ────────────────────────────────────────────────────────────
const GlobalStyle = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ds-root {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: ${C.bg};
      color: ${C.grey900};
      min-height: 100vh;
      display: flex;
      -webkit-font-smoothing: antialiased;
    }
    .ds-root *, .ds-root button, .ds-root input, .ds-root select, .ds-root textarea {
      font-family: inherit;
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(217,79,61,0.25); border-radius: 4px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
    .ds-fadein { animation: fadeUp .35s cubic-bezier(.22,.68,0,1.15) both; }
    .ds-scalein { animation: scaleIn .3s cubic-bezier(.22,.68,0,1.15) both; }

    /* Sidebar */
    .ds-sidebar {
      width: 228px; flex-shrink: 0;
      background: ${C.glass}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid ${C.glassBd};
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh; overflow-y: auto;
    }
    .ds-sidebar-logo {
      display: flex; align-items: center; gap: 10px;
      padding: 20px 18px 14px;
      border-bottom: 1px solid ${C.glassBd};
    }
    .ds-logo-icon {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, ${C.red}, ${C.redMid});
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 12px rgba(217,79,61,0.30);
      flex-shrink: 0;
    }
    .ds-logo-text { font-size: 15px; font-weight: 700; color: ${C.grey900}; letter-spacing: -0.3px; }
    .ds-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
    .ds-nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: 10px;
      font-size: 13px; font-weight: 500; color: ${C.grey500};
      cursor: pointer; transition: all .18s; border: none; background: none;
      text-align: left; width: 100%;
    }
    .ds-nav-item:hover { background: rgba(217,79,61,.08); color: ${C.red}; }
    .ds-nav-item.active {
      background: linear-gradient(135deg, ${C.red}, ${C.redMid});
      color: #fff; font-weight: 600;
      box-shadow: 0 4px 14px rgba(217,79,61,.28);
    }
    .ds-nav-item.active svg { color: #fff !important; }
    .ds-nav-section {
      font-size: 10px; font-weight: 700; color: ${C.grey400};
      letter-spacing: .8px; text-transform: uppercase;
      padding: 12px 12px 4px;
    }
    .ds-sidebar-footer {
      padding: 12px 10px;
      border-top: 1px solid ${C.glassBd};
    }
    .ds-user-pill {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 10px; border-radius: 10px;
      background: rgba(255,255,255,.6);
      border: 1px solid ${C.glassBd};
    }
    .ds-avatar {
      width: 28px; height: 28px; border-radius: 8px;
      background: linear-gradient(135deg, ${C.red}, ${C.redMid});
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    /* Main area */
    .ds-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .ds-topbar {
      height: 56px; flex-shrink: 0;
      background: ${C.glass}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid ${C.glassBd};
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 40;
    }
    .ds-topbar-breadcrumb {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: ${C.grey500};
    }
    .ds-topbar-title { font-size: 14px; font-weight: 600; color: ${C.grey900}; }
    .ds-content { padding: 24px; flex: 1; }

    /* Cards */
    .ds-card {
      background: ${C.glass}; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid ${C.glassBd}; border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,.05);
    }
    .ds-card-solid {
      background: ${C.white}; border: 1.5px solid ${C.grey200};
      border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,.05);
    }
    .ds-card-hover { transition: all .2s; cursor: pointer; }
    .ds-card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,.09); }

    /* KPI cards */
    .ds-kpi {
      background: ${C.white}; border: 1.5px solid ${C.grey200};
      border-radius: 16px; padding: 18px 20px;
      transition: all .2s; cursor: pointer;
    }
    .ds-kpi:hover { transform: translateY(-2px); border-color: ${C.redLight}; box-shadow: 0 6px 24px rgba(217,79,61,.10); }

    /* Buttons */
    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, ${C.red}, ${C.redMid});
      color: #fff; border: none; border-radius: 10px;
      padding: 9px 18px; font-size: 13px; font-weight: 600;
      cursor: pointer; box-shadow: 0 4px 14px rgba(217,79,61,.28);
      transition: all .2s; white-space: nowrap;
    }
    .btn-primary:hover { box-shadow: 0 6px 20px rgba(217,79,61,.38); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.75); color: ${C.grey600};
      border: 1.5px solid ${C.grey200}; border-radius: 10px;
      padding: 8px 16px; font-size: 13px; font-weight: 500;
      cursor: pointer; backdrop-filter: blur(8px); transition: all .2s; white-space: nowrap;
    }
    .btn-ghost:hover { border-color: ${C.red}; color: ${C.red}; background: ${C.redPale}; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,.7); color: ${C.grey500};
      border: 1.5px solid ${C.grey200}; border-radius: 9px;
      padding: 7px; cursor: pointer; transition: all .2s;
    }
    .btn-icon:hover { border-color: ${C.red}; color: ${C.red}; background: ${C.redPale}; }
    .btn-danger {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(217,79,61,.08); color: ${C.red};
      border: 1.5px solid rgba(217,79,61,.25); border-radius: 9px;
      padding: 7px 12px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all .2s;
    }
    .btn-danger:hover { background: rgba(217,79,61,.18); }

    /* Inputs */
    .ds-input {
      width: 100%; padding: 8px 12px; border-radius: 9px;
      border: 1.5px solid ${C.grey200}; background: rgba(255,255,255,.88);
      color: ${C.grey900}; font-size: 13px; outline: none; transition: all .2s;
    }
    .ds-input:focus { border-color: ${C.red}; box-shadow: 0 0 0 3px rgba(217,79,61,.10); }
    .ds-input::placeholder { color: ${C.grey400}; }
    .ds-textarea {
      width: 100%; padding: 8px 12px; border-radius: 9px;
      border: 1.5px solid ${C.grey200}; background: rgba(255,255,255,.88);
      color: ${C.grey900}; font-size: 13px; outline: none; transition: all .2s;
      resize: vertical; line-height: 1.5;
    }
    .ds-textarea:focus { border-color: ${C.red}; box-shadow: 0 0 0 3px rgba(217,79,61,.10); }
    .ds-select {
      padding: 8px 12px; border-radius: 9px;
      border: 1.5px solid ${C.grey200}; background: rgba(255,255,255,.88);
      color: ${C.grey900}; font-size: 13px; outline: none; transition: all .2s;
    }
    .ds-select:focus { border-color: ${C.red}; box-shadow: 0 0 0 3px rgba(217,79,61,.10); }
    .ds-label { font-size: 12px; font-weight: 600; color: ${C.grey600}; margin-bottom: 5px; display: block; }

    /* Badges */
    .badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
    .badge-red { background: rgba(217,79,61,.12); color: ${C.red}; border: 1px solid rgba(217,79,61,.2); }
    .badge-green { background: rgba(34,197,94,.12); color: #16A34A; border: 1px solid rgba(34,197,94,.2); }
    .badge-yellow { background: rgba(245,158,11,.12); color: #B45309; border: 1px solid rgba(245,158,11,.2); }
    .badge-blue { background: rgba(59,130,246,.12); color: #1D4ED8; border: 1px solid rgba(59,130,246,.2); }
    .badge-purple { background: rgba(139,92,246,.12); color: #6D28D9; border: 1px solid rgba(139,92,246,.2); }
    .badge-grey { background: ${C.grey100}; color: ${C.grey600}; border: 1px solid ${C.grey200}; }
    .badge-teal { background: rgba(20,184,166,.12); color: #0F766E; border: 1px solid rgba(20,184,166,.2); }

    /* Switch */
    .ds-switch {
      position: relative; display: inline-flex; height: 20px; width: 36px;
      border-radius: 99px; border: none; cursor: pointer; transition: background .2s;
    }
    .ds-switch-thumb {
      position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #fff; transition: transform .2s;
    }

    /* Table / list rows */
    .ds-row {
      display: flex; align-items: center; gap: 12px;
      padding: 13px 16px; border-radius: 12px;
      border: 1.5px solid ${C.grey200}; background: ${C.white};
      transition: all .18s;
    }
    .ds-row:hover { border-color: ${C.redLight}; background: ${C.redPale}; }

    /* Widget preview frame */
    .ds-wf {
      border-radius: 12px; border: 1.5px solid ${C.grey200};
      background: ${C.white}; padding: 14px;
    }

    /* Tabs */
    .ds-tabs { display: flex; gap: 2px; background: ${C.grey100}; border-radius: 10px; padding: 3px; }
    .ds-tab {
      padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
      color: ${C.grey500}; cursor: pointer; border: none; background: none;
      display: inline-flex; align-items: center; gap: 6px; transition: all .18s;
    }
    .ds-tab:hover { color: ${C.red}; }
    .ds-tab.active { background: ${C.white}; color: ${C.grey900}; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,.10); }

    /* Modal */
    .ds-modal-backdrop {
      position: fixed; inset: 0; z-index: 500;
      background: rgba(24,25,28,.4); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .ds-modal {
      background: rgba(255,255,255,.92); backdrop-filter: blur(24px);
      border: 1px solid ${C.glassBd}; border-radius: 20px;
      padding: 28px; width: 100%; max-width: 520px;
      box-shadow: 0 24px 64px rgba(0,0,0,.14);
    }
    .ds-modal-sm { max-width: 380px; }
    .ds-modal h2 { font-size: 17px; font-weight: 700; color: ${C.grey900}; margin-bottom: 18px; }

    /* Divider */
    .ds-divider { height: 1px; background: ${C.grey200}; margin: 16px 0; }

    /* Section heading */
    .ds-section-label {
      font-size: 11px; font-weight: 700; color: ${C.grey400};
      letter-spacing: .7px; text-transform: uppercase; margin-bottom: 10px;
    }

    /* Code block */
    .ds-code {
      background: ${C.grey900}; border-radius: 10px; padding: 14px 16px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      line-height: 1.7; color: #86efac; overflow-x: auto; max-width: 100%;
      white-space: pre;
    }

    /* Toast */
    .ds-toast {
      background: ${C.grey900}; color: #fff;
      border-radius: 12px; padding: 12px 16px; font-size: 13px;
      border-left: 3px solid ${C.red};
      box-shadow: 0 8px 32px rgba(0,0,0,.2);
      min-width: 220px;
    }

    /* Misc */
    .ds-empty { text-align: center; padding: 48px 24px; color: ${C.grey400}; font-size: 13px; }
    .ds-mono { font-family: 'JetBrains Mono', monospace; }
  `}</style>
);

// ── Primitive components ─────────────────────────────────────────────────────
const Btn = ({ children, onClick, disabled, variant = "primary", size, className = "", style }) => {
    const cls = variant === "ghost" ? "btn-ghost" : variant === "icon" ? "btn-icon" : variant === "danger" ? "btn-danger" : "btn-primary";
    return (
        <button onClick={onClick} disabled={disabled} className={cn(cls, className)} style={style}>
            {children}
        </button>
    );
};

const Badge = ({ children, variant = "grey", className = "" }) => (
    <span className={cn("badge", `badge-${variant}`, className)}>{children}</span>
);

const Input = ({ className = "", ...props }) => (
    <input className={cn("ds-input", className)} {...props} />
);
const Textarea = ({ className = "", ...props }) => (
    <textarea className={cn("ds-textarea", className)} {...props} />
);
const Label = ({ children }) => <label className="ds-label">{children}</label>;

const DSSelect = ({ value, onValueChange, children, className = "" }) => {
    const opts = [];
    const extract = (c) => {
        if (!c) return;
        const arr = Array.isArray(c) ? c : [c];
        arr.forEach(ch => {
            if (!ch) return;
            if (ch.type === DSOption) opts.push(ch);
            if (ch.props?.children) extract(ch.props.children);
        });
    };
    extract(children);
    return (
        <select value={value} onChange={e => onValueChange(e.target.value)} className={cn("ds-select", className)}>
            {opts.map(o => <option key={o.props.value} value={o.props.value}>{o.props.children}</option>)}
        </select>
    );
};
const DSOption = ({ children }) => children;

const Switch = ({ checked, onCheckedChange }) => (
    <button
        role="switch" aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className="ds-switch"
        style={{ background: checked ? C.red : C.grey300 }}
    >
        <span className="ds-switch-thumb" style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
    </button>
);

const ConfirmDialog = ({ trigger, title, description, onConfirm }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <span onClick={() => setOpen(true)}>{trigger}</span>
            {open && <ModalPortal>
                <div className="ds-modal-backdrop" onClick={() => setOpen(false)}>
                    <div className={cn("ds-modal ds-modal-sm ds-scalein")} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: 15 }}>{title}</h2>
                        <p style={{ fontSize: 13, color: C.grey500, marginBottom: 20, lineHeight: 1.5 }}>{description}</p>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <Btn variant="ghost" onClick={() => setOpen(false)}>Annuler</Btn>
                            <Btn variant="danger" onClick={() => { onConfirm(); setOpen(false); }}>Supprimer</Btn>
                        </div>
                    </div>
                </div>
            </ModalPortal>}
        </>
    );
};

const ToastCtx = createContext(null);
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const show = ({ title, description }) => {
        const id = Math.random();
        setToasts(t => [...t, { id, title, description }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    };
    return (
        <ToastCtx.Provider value={show}>
            {children}
            <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
                {toasts.map(t => (
                    <div key={t.id} className="ds-toast ds-fadein">
                        <p style={{ fontWeight: 600 }}>{t.title}</p>
                        {t.description && <p style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{t.description}</p>}
                    </div>
                ))}
            </div>
        </ToastCtx.Provider>
    );
};
const useToast = () => ({ toast: useContext(ToastCtx) });

// ── Store ────────────────────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 10);
const genApiKey = () => "sk_live_" + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

const widgetCatalog = [
    { type: "askgo-alerts", name: "Alertes Ask&Go", description: "Liste des anomalies", icon: AlertTriangle, color: C.warning },
    { type: "askgo-alert-detail", name: "Détail alerte", description: "Analyse et feedback", icon: Info, color: C.info },
    { type: "askgo-score", name: "Score facture", description: "Détection anomalie facture", icon: Zap, color: C.red },
    { type: "askgo-budget", name: "Budget", description: "Budget vs réalisé", icon: BarChart3, color: C.success },
    { type: "askgo-forecast", name: "Prévisions", description: "Prévisions budgétaires", icon: TrendingUp, color: C.teal },
];
const CUSTOM_WIDGET_CATALOG_KEY = "widgetsapp.saas.customWidgetCatalog.v1";
const readCustomWidgetCatalog = () => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(CUSTOM_WIDGET_CATALOG_KEY) ?? "[]"); }
    catch { return []; }
};
const writeCustomWidgetCatalog = items => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CUSTOM_WIDGET_CATALOG_KEY, JSON.stringify(items));
};
const getWidgetCatalog = () => [...widgetCatalog, ...readCustomWidgetCatalog().map(w => ({ ...w, icon: Code2, color: w.color ?? C.info }))];
const getWidgetMeta = (type) => getWidgetCatalog().find(w => w.type === type) ?? widgetCatalog[0];

const baseConfig = {
    primaryColor: "#D94F3D", primaryDark: "#C84332", accentColor: "#f59e0b",
    background: "#F0EDE8", surface: "rgba(255,255,255,0.72)", surfaceHover: "rgba(217,79,61,0.04)",
    textPrimary: "#18191C", textSecondary: "#525761", textMuted: "#9CA3AF", borderColor: "rgba(255,255,255,0.88)",
    borderRadius: "16px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace", companyName: "Ask&Go · Whitecape", welcomeMessage: ""
};
const ASKGO_THEME_PRESETS = {
    "AnomalyIQ": { primaryColor: "#D94F3D", primaryDark: "#C84332", accentColor: "#f59e0b", background: "#F0EDE8", surface: "rgba(255,255,255,0.72)", surfaceHover: "rgba(217,79,61,0.04)", textPrimary: "#18191C", textSecondary: "#525761", textMuted: "#9CA3AF", borderColor: "rgba(255,255,255,0.88)", borderRadius: "16px" },
    "Ask&Go Classique": { primaryColor: "#D94F3D", primaryDark: "#C84332", accentColor: "#f59e0b", background: "#F0EDE8", surface: "rgba(255,255,255,0.72)", surfaceHover: "rgba(217,79,61,0.04)", textPrimary: "#18191C", textSecondary: "#525761", textMuted: "#9CA3AF", borderColor: "rgba(255,255,255,0.88)", borderRadius: "16px" },
    "Ask&Go Moderne": { primaryColor: "#1d4ed8", primaryDark: "#1e40af", accentColor: "#22c55e", background: "#f8fafc", surface: "#ffffff", surfaceHover: "#eff6ff", textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b", borderColor: "#bfdbfe", borderRadius: "8px" },
    "Ask&Go Sombre": { primaryColor: "#3b82f6", primaryDark: "#2563eb", accentColor: "#f59e0b", background: "#1e293b", surface: "#0f172a", surfaceHover: "#334155", textPrimary: "#f1f5f9", textSecondary: "#94a3b8", textMuted: "#64748b", borderColor: "#334155", borderRadius: "4px" },
};
const WIDGET_FONT_OPTIONS = [
    { label: "Arial (défaut ERP)", value: "'Arial', 'Helvetica', sans-serif", mono: "'Courier New', monospace" },
    { label: "Nunito", value: "'Nunito', sans-serif", mono: "'JetBrains Mono', monospace" },
    { label: "Inter", value: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace" },
    { label: "Syne", value: "'Syne', sans-serif", mono: "'DM Mono', monospace" },
    { label: "Times New Roman", value: "'Times New Roman', 'Georgia', serif", mono: "'Courier New', monospace" },
];
const SHARED_ASKGO_STYLE_KEYS = new Set([
    "themePreset", "primaryColor", "primaryDark", "accentColor", "background", "surface", "surfaceHover",
    "textPrimary", "textSecondary", "textMuted", "borderColor", "borderRadius", "fontFamily", "fontFamilyMono",
]);
const defaultConfigByType = {
    "askgo-alerts": { ...baseConfig, ...ASKGO_WIDGET_TYPES["askgo-alerts"], statusFilter: "PENDING" },
    "askgo-alert-detail": { ...baseConfig, ...ASKGO_WIDGET_TYPES["askgo-alert-detail"] },
    "askgo-score": { ...baseConfig, ...ASKGO_WIDGET_TYPES["askgo-score"], pipelineId: "pipeline_askgo" },
    "askgo-budget": { ...baseConfig, ...ASKGO_WIDGET_TYPES["askgo-budget"], pipelineId: "pipeline_123", seriesId: "series_456", year: 2024 },
    "askgo-forecast": { ...baseConfig, ...ASKGO_WIDGET_TYPES["askgo-forecast"], pipelineId: "pipeline_123", seriesId: "series_456" },
};

const seed = () => readSaasWidgetData();

const AppCtx = createContext(null);
const AppProvider = ({ children }) => {
    const [data, setData] = useState(seed);
    useEffect(() => {
        setData(syncLocalErpConnectors());
        const ctrl = new AbortController();
        api.getAdminConnectors(ctrl.signal)
            .then(res => {
                const connectors = Array.isArray(res) ? res : (res?.content || []);
                if (connectors.length > 0) setData(d => mergeErpConnectors(d, connectors));
            })
            .catch(() => {});
        return () => ctrl.abort();
    }, []);
    useEffect(() => writeSaasWidgetData(data), [data]);
    const state = {
        clients: data.clients, widgets: data.widgets,
        addClient: (c) => { const client = { ...c, id: genId(), joinDate: new Date().toISOString().slice(0, 10) }; setData(d => ({ ...d, clients: [client, ...d.clients] })); return client; },
        updateClient: (id, patch) => setData(d => ({ ...d, clients: d.clients.map(c => c.id === id ? { ...c, ...patch } : c) })),
        deleteClient: (id) => setData(d => ({ clients: d.clients.filter(c => c.id !== id), widgets: d.widgets.filter(w => w.clientId !== id) })),
        addWidget: (clientId, name, type) => {
            const client = data.clients.find(c => c.id === clientId);
            const meta = getWidgetMeta(type);
            const fallbackConfig = { ...baseConfig, webComponent: meta.webComponent ?? "anomaly-widget", companyName: client?.name ?? "—" };
            const w = { id: genId(), name, type, apiKey: genApiKey(), clientId, status: "active", createdAt: new Date().toISOString().slice(0, 10), config: { ...(defaultConfigByType[type] ?? fallbackConfig), companyName: client?.name ?? "—" } };
            setData(d => ({ ...d, widgets: [w, ...d.widgets] })); return w;
        },
        updateWidget: (id, patch) => setData(d => ({ ...d, widgets: d.widgets.map(w => w.id === id ? { ...w, ...patch } : w) })),
        updateWidgetConfig: (id, patch) => setData(d => {
            const target = d.widgets.find(w => w.id === id);
            const sharedPatch = Object.fromEntries(Object.entries(patch).filter(([key]) => SHARED_ASKGO_STYLE_KEYS.has(key)));
            const syncAskGoStyle = target?.clientId === ASKGO_CLIENT_ID && Object.keys(sharedPatch).length > 0;
            return {
                ...d,
                widgets: d.widgets.map(w => {
                    if (w.id === id) return { ...w, config: { ...w.config, ...patch } };
                    if (syncAskGoStyle && w.clientId === ASKGO_CLIENT_ID) return { ...w, config: { ...w.config, ...sharedPatch } };
                    return w;
                }),
            };
        }),
        deleteWidget: (id) => setData(d => ({ ...d, widgets: d.widgets.filter(w => w.id !== id) })),
        getWidget: (id) => data.widgets.find(w => w.id === id),
        getClient: (id) => data.clients.find(c => c.id === id),
        getWidgetsByClient: (clientId) => data.widgets.filter(w => w.clientId === clientId),
    };
    return <AppCtx.Provider value={state}>{children}</AppCtx.Provider>;
};
const useApp = () => useContext(AppCtx);

const RouterCtx = createContext(null);
const RouterProvider = ({ children }) => {
    const [path, setPath] = useState("/");
    return <RouterCtx.Provider value={{ path, navigate: setPath }}>{children}</RouterCtx.Provider>;
};
const useRouter = () => useContext(RouterCtx);

// ── Status / plan helpers ────────────────────────────────────────────────────
const statusBadge = (s) => {
    if (s === "active") return <Badge variant="green">actif</Badge>;
    if (s === "trial") return <Badge variant="blue">essai</Badge>;
    if (s === "paused") return <Badge variant="yellow">pause</Badge>;
    return <Badge variant="grey">{s}</Badge>;
};
const planBadge = (p) => {
    if (p === "Enterprise") return <Badge variant="purple">{p}</Badge>;
    if (p === "Pro") return <Badge variant="blue">{p}</Badge>;
    return <Badge variant="grey">{p}</Badge>;
};

// ── Widget Preview components ─────────────────────────────────────────────────
const WFrame = ({ widget, children, title, icon }) => (
    <div className="ds-wf" style={{ borderRadius: `${widget.config.borderRadius}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <span style={{ color: widget.config.primaryColor }}>{icon}</span>
            <span style={{ fontWeight: 600, fontSize: 13, color: C.grey900 }}>{title}</span>
        </div>
        <p style={{ fontSize: 11, color: C.grey400, marginBottom: 12 }}>{widget.config.companyName}</p>
        {children}
    </div>
);

const DeliveryPreview = ({ widget }) => {
    const [sel, setSel] = useState(null);
    const slots = [
        { id: "s1", label: "Lun 10:00–12:00", price: "5,99 €" },
        { id: "s2", label: "Lun 14:00–17:00", price: "7,99 €" },
        { id: "s3", label: "Mar 09:00–11:00", price: "5,99 €" },
        { id: "s4", label: "Mar 15:00–18:00", price: "9,99 €" },
    ];
    return (
        <WFrame widget={widget} title={widget.config.welcomeMessage} icon={<Truck size={14} />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {slots.map(s => (
                    <div key={s.id} onClick={() => setSel(s.id)} style={{
                        border: `1.5px solid ${sel === s.id ? widget.config.primaryColor : C.grey200}`,
                        background: sel === s.id ? widget.config.primaryColor + "14" : C.grey50,
                        borderRadius: 8, padding: "8px 10px", cursor: "pointer", transition: "all .15s"
                    }}>
                        <div style={{ fontSize: 11, color: C.grey600, fontWeight: 500 }}>{s.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: widget.config.accentColor, marginTop: 2 }}>{s.price}</div>
                    </div>
                ))}
            </div>
            <button disabled={!sel} style={{
                width: "100%", padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600,
                color: "#fff", border: "none", cursor: sel ? "pointer" : "not-allowed",
                background: widget.config.primaryColor, opacity: sel ? 1 : .4, transition: "opacity .2s"
            }}>Réserver ce créneau</button>
        </WFrame>
    );
};

const FeedbackPreview = ({ widget }) => {
    const scale = widget.config.ratingScale ?? 5;
    const [hov, setHov] = useState(0);
    return (
        <WFrame widget={widget} title={widget.config.welcomeMessage} icon={<MessageSquare size={14} />}>
            <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                {Array.from({ length: scale }).map((_, i) => (
                    <Star key={i} size={22} style={{ cursor: "pointer", color: i < hov ? widget.config.accentColor : C.grey300, fill: i < hov ? widget.config.accentColor : "transparent", transition: "all .1s" }}
                        onMouseEnter={() => setHov(i + 1)} onMouseLeave={() => setHov(0)} />
                ))}
            </div>
            {widget.config.askComment && <textarea rows={2} placeholder="Votre commentaire..." className="ds-textarea" style={{ marginBottom: 10 }} />}
            <button style={{ width: "100%", padding: "9px 0", borderRadius: 9, fontSize: 13, fontWeight: 600, color: "#fff", border: "none", cursor: "pointer", background: widget.config.primaryColor }}>Envoyer</button>
            <p style={{ fontSize: 11, color: C.grey400, textAlign: "center", marginTop: 8 }}>{widget.config.thankYouMessage}</p>
        </WFrame>
    );
};

const NotificationPreview = ({ widget }) => {
    const pos = widget.config.position ?? "top-right";
    return (
        <div style={{ position: "relative", height: 160, background: C.grey100, borderRadius: 10, border: `1.5px solid ${C.grey200}`, overflow: "hidden" }}>
            <span style={{ position: "absolute", top: 8, left: 10, fontSize: 10, color: C.grey400 }}>Aperçu page hôte</span>
            <div style={{
                position: "absolute",
                ...(pos === "bottom-right" ? { bottom: 10, right: 10 } : pos === "bottom-left" ? { bottom: 10, left: 10 } : pos === "top-left" ? { top: 28, left: 10 } : { top: 28, right: 10 }),
                background: widget.config.primaryColor, borderRadius: `${widget.config.borderRadius}px`,
                padding: "10px 12px", maxWidth: 220,
            }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Bell size={13} color="#fff" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 11, color: "#fff" }}>{widget.config.notificationTitle}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{widget.config.notificationBody}</p>
                    </div>
                    <X size={10} color="rgba(255,255,255,.7)" />
                </div>
            </div>
        </div>
    );
};

const AlertPreview = ({ widget }) => {
    const sev = widget.config.severity ?? "warning";
    const colors = {
        info: { bg: "#EFF6FF", border: C.info, text: "#1E40AF" },
        warning: { bg: "#FFFBEB", border: C.warning, text: "#92400E" },
        critical: { bg: "#FEF2F2", border: C.red, text: "#991B1B" },
    }[sev];
    const Icon = sev === "info" ? Info : AlertTriangle;
    return (
        <div style={{ padding: "12px 14px", borderLeft: `4px solid ${colors.border}`, borderRadius: "0 8px 8px 0", background: colors.bg, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Icon size={16} color={colors.border} style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: colors.text }}>{widget.config.welcomeMessage}</p>
                <p style={{ fontSize: 12, color: colors.text, opacity: .8, marginTop: 2 }}>{widget.config.alertMessage}</p>
            </div>
            {widget.config.dismissible && <X size={14} color={colors.text} style={{ cursor: "pointer", opacity: .6 }} />}
        </div>
    );
};

const ReportPreview = ({ widget }) => (
    <WFrame widget={widget} title={widget.config.welcomeMessage} icon={<FileBarChart size={14} />}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Badge variant="grey" className="">{widget.config.reportPeriod}</Badge>
            <button style={{ fontSize: 11, color: C.grey500, border: `1.5px solid ${C.grey200}`, borderRadius: 7, padding: "4px 9px", background: C.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Download size={11} /> Export PDF
            </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            {[{ l: "Commandes", v: "1 248" }, { l: "Revenus", v: "24 580€" }, { l: "Avis moy.", v: "4.7★" }].map(m => (
                <div key={m.l} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 8, padding: "8px 6px", textAlign: "center", background: C.grey50 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: widget.config.primaryColor }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: C.grey400, marginTop: 2 }}>{m.l}</div>
                </div>
            ))}
        </div>
        {widget.config.includeCharts && (
            <div style={{ height: 56, display: "flex", alignItems: "flex-end", gap: 3 }}>
                {[40, 65, 50, 80, 70, 90, 60].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", height: `${h}%`, background: widget.config.accentColor, opacity: .8 }} />
                ))}
            </div>
        )}
    </WFrame>
);

const AnalyticsPreview = ({ widget }) => (
    <WFrame widget={widget} title={widget.config.welcomeMessage} icon={<BarChart3 size={14} />}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 8, padding: "8px 10px", background: C.grey50 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.grey400 }}>Visiteurs</span>
                    <TrendingUp size={12} color={C.success} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: widget.config.primaryColor, marginTop: 2 }}>12 489</div>
            </div>
            <div style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 8, padding: "8px 10px", background: C.grey50 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.grey400 }}>Conversion</span>
                    <TrendingDown size={12} color={C.red} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: widget.config.accentColor, marginTop: 2 }}>3.2%</div>
            </div>
        </div>
        <div style={{ height: 70, position: "relative" }}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                <defs>
                    <linearGradient id={`ga${widget.id}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={widget.config.primaryColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={widget.config.primaryColor} stopOpacity="0" />
                    </linearGradient>
                </defs>
                {widget.config.chartType === "bar"
                    ? [10, 20, 15, 28, 22, 35, 30, 38].map((h, i) => <rect key={i} x={i * 12 + 2} y={40 - h} width="9" height={h} fill={widget.config.primaryColor} rx="2" />)
                    : (<>
                        <path d="M0,30 L15,22 L30,26 L45,15 L60,18 L75,8 L100,12 L100,40 L0,40 Z" fill={widget.config.chartType === "area" ? `url(#ga${widget.id})` : "none"} />
                        <path d="M0,30 L15,22 L30,26 L45,15 L60,18 L75,8 L100,12" fill="none" stroke={widget.config.primaryColor} strokeWidth="1.5" />
                    </>)
                }
            </svg>
        </div>
        {widget.config.showRealtime && (
            <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: C.success, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 99, padding: "2px 8px" }}>● Temps réel</span>
            </div>
        )}
    </WFrame>
);

const widgetThemeVars = (widget) => ({
    "--anomaly-primary-color": widget.config.primaryColor ?? "#D94F3D",
    "--anomaly-primary-dark": widget.config.primaryDark ?? widget.config.primaryColor ?? "#C84332",
    "--anomaly-accent-color": widget.config.accentColor ?? "#f59e0b",
    "--anomaly-background": widget.config.background ?? "#F0EDE8",
    "--anomaly-surface": widget.config.surface ?? "rgba(255,255,255,0.72)",
    "--anomaly-surface-hover": widget.config.surfaceHover ?? "rgba(217,79,61,0.04)",
    "--anomaly-text-primary": widget.config.textPrimary ?? "#18191C",
    "--anomaly-text-secondary": widget.config.textSecondary ?? "#525761",
    "--anomaly-text-muted": widget.config.textMuted ?? "#9CA3AF",
    "--anomaly-border-color": widget.config.borderColor ?? "rgba(255,255,255,0.88)",
    "--anomaly-border-radius": widget.config.borderRadius ?? "16px",
    "--anomaly-danger": widget.config.danger ?? "#D94F3D",
    "--anomaly-success": widget.config.success ?? "#16a34a",
    "--anomaly-warning": widget.config.warning ?? "#d97706",
    "--anomaly-info": widget.config.info ?? "#0284c7",
    "--anomaly-font-family": widget.config.fontFamily ?? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "--anomaly-font-mono": widget.config.fontFamilyMono ?? "'JetBrains Mono', 'Fira Code', monospace",
});

const AskGoSaasPreview = ({ widget, token }) => {
    if (!token) return <div className="ds-empty">Connexion SSO pour l'aperçu du widget…</div>;

    const pipelineId = widget.config.pipelineId ?? "pipeline_askgo";
    const seriesId = widget.config.seriesId ?? "series_456";
    const year = Number(widget.config.year ?? 2024);
    const invoiceData = { supplier: "Microsoft Corp", amount: 12450, date: new Date().toISOString().slice(0, 10) };

    return (
        <div style={widgetThemeVars(widget)}>
            {widget.type === "askgo-alerts" && <AlertsWidget token={token} statusFilter={widget.config.statusFilter ?? "PENDING"} />}
            {widget.type === "askgo-alert-detail" && <AlertsWidget token={token} statusFilter={widget.config.statusFilter ?? "PENDING"} />}
            {widget.type === "askgo-score" && <ScoreWidget token={token} pipelineId={pipelineId} invoiceData={invoiceData} />}
            {widget.type === "askgo-budget" && <BudgetWidget token={token} pipelineId={pipelineId} seriesId={seriesId} year={year} />}
            {widget.type === "askgo-forecast" && <ForecastWidget token={token} pipelineId={pipelineId} seriesId={seriesId} />}
        </div>
    );
};

const WidgetPreview = ({ widget, token }) => {
    switch (widget.type) {
        case "delivery": return <DeliveryPreview widget={widget} />;
        case "feedback": return <FeedbackPreview widget={widget} />;
        case "notification": return <NotificationPreview widget={widget} />;
        case "alert": return <AlertPreview widget={widget} />;
        case "report": return <ReportPreview widget={widget} />;
        case "analytics": return <AnalyticsPreview widget={widget} />;
        case "askgo-alerts":
        case "askgo-alert-detail":
        case "askgo-score":
        case "askgo-budget":
        case "askgo-forecast": return <AskGoSaasPreview widget={widget} token={token} />;
        default: return null;
    }
};

// ── TypeConfigFields ──────────────────────────────────────────────────────────
const TypeConfigFields = ({ widget, onChange }) => {
    const c = widget.config;
    const Row = ({ label, children }) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Label>{label}</Label>{children}
        </div>
    );
    switch (widget.type) {
        case "askgo-alerts":
        case "askgo-alert-detail":
        case "askgo-score":
        case "askgo-budget":
        case "askgo-forecast": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Web component</Label><Input value={c.webComponent ?? ""} readOnly /></div>
                <div><Label>Slot Ask&amp;Go</Label><Input value={c.slot ?? ""} readOnly /></div>
                {"pipelineId" in c && <div><Label>Pipeline ID</Label><Input value={c.pipelineId ?? ""} onChange={e => onChange({ pipelineId: e.target.value })} /></div>}
                {"seriesId" in c && <div><Label>Series ID</Label><Input value={c.seriesId ?? ""} onChange={e => onChange({ seriesId: e.target.value })} /></div>}
                {"year" in c && <div><Label>Année</Label><Input type="number" value={c.year ?? 2024} onChange={e => onChange({ year: parseInt(e.target.value) || 2024 })} /></div>}
            </div>
        );
        case "delivery": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Row label="Afficher les prix"><Switch checked={!!c.showPrices} onCheckedChange={v => onChange({ showPrices: v })} /></Row>
                <Row label="Livraison jour même"><Switch checked={!!c.allowSameDayDelivery} onCheckedChange={v => onChange({ allowSameDayDelivery: v })} /></Row>
                <div><Label>Jours max à l'avance</Label><Input type="number" min={1} max={90} value={c.maxDaysAhead ?? 14} onChange={e => onChange({ maxDaysAhead: parseInt(e.target.value) || 1 })} /></div>
            </div>
        );
        case "feedback": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Échelle de notation</Label><DSSelect value={String(c.ratingScale ?? 5)} onValueChange={v => onChange({ ratingScale: parseInt(v) })} className="ds-select" style={{ width: "100%" }}><DSOption value="5">5 étoiles</DSOption><DSOption value="10">10 étoiles</DSOption></DSSelect></div>
                <Row label="Demander un commentaire"><Switch checked={!!c.askComment} onCheckedChange={v => onChange({ askComment: v })} /></Row>
                <div><Label>Message de remerciement</Label><Input value={c.thankYouMessage ?? ""} onChange={e => onChange({ thankYouMessage: e.target.value })} /></div>
            </div>
        );
        case "notification": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Titre</Label><Input value={c.notificationTitle ?? ""} onChange={e => onChange({ notificationTitle: e.target.value })} /></div>
                <div><Label>Corps</Label><Textarea rows={2} value={c.notificationBody ?? ""} onChange={e => onChange({ notificationBody: e.target.value })} /></div>
                <div><Label>Position</Label><DSSelect value={c.position ?? "top-right"} onValueChange={v => onChange({ position: v })} className="ds-select" style={{ width: "100%" }}><DSOption value="top-right">Haut droite</DSOption><DSOption value="top-left">Haut gauche</DSOption><DSOption value="bottom-right">Bas droite</DSOption><DSOption value="bottom-left">Bas gauche</DSOption></DSSelect></div>
                <div><Label>Masquer après (ms)</Label><Input type="number" value={c.autoHideMs ?? 5000} onChange={e => onChange({ autoHideMs: parseInt(e.target.value) || 0 })} /></div>
            </div>
        );
        case "alert": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Sévérité</Label><DSSelect value={c.severity ?? "warning"} onValueChange={v => onChange({ severity: v })} className="ds-select" style={{ width: "100%" }}><DSOption value="info">Information</DSOption><DSOption value="warning">Attention</DSOption><DSOption value="critical">Critique</DSOption></DSSelect></div>
                <div><Label>Message d'alerte</Label><Textarea rows={2} value={c.alertMessage ?? ""} onChange={e => onChange({ alertMessage: e.target.value })} /></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Label>Peut être fermée</Label><Switch checked={!!c.dismissible} onCheckedChange={v => onChange({ dismissible: v })} /></div>
            </div>
        );
        case "report": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Période</Label><DSSelect value={c.reportPeriod ?? "weekly"} onValueChange={v => onChange({ reportPeriod: v })} className="ds-select" style={{ width: "100%" }}><DSOption value="daily">Quotidien</DSOption><DSOption value="weekly">Hebdomadaire</DSOption><DSOption value="monthly">Mensuel</DSOption></DSSelect></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Label>Inclure les graphiques</Label><Switch checked={!!c.includeCharts} onCheckedChange={v => onChange({ includeCharts: v })} /></div>
            </div>
        );
        case "analytics": return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><Label>Type de graphique</Label><DSSelect value={c.chartType ?? "area"} onValueChange={v => onChange({ chartType: v })} className="ds-select" style={{ width: "100%" }}><DSOption value="line">Ligne</DSOption><DSOption value="area">Aire</DSOption><DSOption value="bar">Barres</DSOption></DSSelect></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><Label>Données temps réel</Label><Switch checked={!!c.showRealtime} onCheckedChange={v => onChange({ showRealtime: v })} /></div>
            </div>
        );
        default: return null;
    }
};

// ── Page header helper ────────────────────────────────────────────────────────
const PageHeader = ({ title, subtitle, actions, back }) => {
    const { navigate } = useRouter();
    return (
        <div style={{ marginBottom: 24 }}>
            {back && (
                <button onClick={() => navigate(back.to)} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: C.grey500, background: "none", border: "none", cursor: "pointer", marginBottom: 12, padding: 0 }}>
                    <ArrowLeft size={13} /> {back.label}
                </button>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: C.grey900, letterSpacing: "-0.4px" }}>{title}</h1>
                    {subtitle && <p style={{ fontSize: 13, color: C.grey500, marginTop: 3 }}>{subtitle}</p>}
                </div>
                {actions && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>}
            </div>
        </div>
    );
};

// ── Avatar helper ────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36, color = C.red }) => (
    <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{name?.charAt(0)?.toUpperCase()}</div>
);

// ── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, style, className = "" }) => (
    <div className={cn("ds-card", className)} style={{ padding: "20px 22px", ...style }}>
        {children}
    </div>
);
const SectionTitle = ({ children, action }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.grey900 }}>{children}</h2>
        {action}
    </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
    const { navigate } = useRouter();
    const { clients, widgets } = useApp();
    const activeWidgets = widgets.filter(w => w.status === "active").length;

    const kpis = [
        { title: "ERP actifs", value: clients.filter(c => c.status === "active").length, change: "+1", icon: Users, color: C.info },
        { title: "Appels API", value: "12 489", change: "+18%", icon: Activity, color: C.success },
        { title: "Widgets actifs", value: activeWidgets, change: "+5%", icon: Package, color: C.purple },
    ];

    const activity = [
        { action: "ERP synchronisé", client: "Ask&Go · Whitecape", time: "2 min", type: "success" },
        { action: "Widget configuré", client: "Score facture", time: "15 min", type: "info" },
        { action: "API key générée", client: "Alertes anomalies", time: "1h", type: "success" },
        { action: "Erreur API", client: "pipeline_askgo", time: "2h", type: "error" },
    ];

    const dotColor = { success: C.success, info: C.info, error: C.red };

    return (
        <div className="ds-fadein">
            <PageHeader
                title="Dashboard"
                subtitle="Bienvenue sur AnomalyIqWidgets — supervision de vos ERP et widgets API"
                actions={<>
                    <Btn variant="ghost"><Settings size={14} /> Paramètres</Btn>
                    <Btn onClick={() => navigate("/clients")}><Plus size={14} /> Nouvel ERP</Btn>
                </>}
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
                {kpis.map((k, i) => {
                    const Icon = k.icon;
                    return (
                        <div key={i} className="ds-kpi">
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: C.grey400, textTransform: "uppercase", letterSpacing: ".5px" }}>{k.title}</p>
                                    <p style={{ fontSize: 26, fontWeight: 700, color: C.grey900, marginTop: 6, letterSpacing: "-0.5px" }}>{k.value}</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5 }}>
                                        <TrendingUp size={11} color={C.success} />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: C.success }}>{k.change}</span>
                                    </div>
                                </div>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={18} color={k.color} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Card>
                    <SectionTitle action={<Btn variant="ghost" style={{ fontSize: 11, padding: "4px 10px" }}>Voir tout</Btn>}>
                        Activité récente
                    </SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {activity.map((a, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, background: C.grey50, border: `1px solid ${C.grey200}` }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor[a.type] ?? C.grey300, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: C.grey900 }}>{a.action}</p>
                                    <p style={{ fontSize: 11, color: C.grey400, marginTop: 1 }}>{a.client}</p>
                                </div>
                                <span style={{ fontSize: 11, color: C.grey400 }}>il y a {a.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <SectionTitle>ERP récents</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {clients.slice(0, 4).map((c, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Avatar name={c.name} size={32} color={C.red} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                                    <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                                        {planBadge(c.plan)}
                                        <span style={{ fontSize: 10, color: C.grey400 }}>{widgets.filter(w => w.clientId === c.id).length} widgets</span>
                                    </div>
                                </div>
                                {statusBadge(c.status)}
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

// ── ERP page ──────────────────────────────────────────────────────────────────
const ClientsPage = () => {
    const { clients, widgets } = useApp();
    const { navigate } = useRouter();
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState("all");

    const filtered = useMemo(() => clients.filter(c => {
        if (filter !== "all" && c.status !== filter) return false;
        if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.email.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
    }), [clients, q, filter]);

    const wCount = id => widgets.filter(w => w.clientId === id).length;

    return (
        <div className="ds-fadein">
            <PageHeader
                title="ERP"
                subtitle={`${clients.length} ERP synchronisé${clients.length > 1 ? "s" : ""} depuis AnomalyIQ`}
                actions={<Badge variant="blue">Source AnomalyIQ</Badge>}
            />

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.grey400 }} />
                        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un ERP…" style={{ paddingLeft: 30 }} />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {[["all", "Tous"], ["active", "Actifs"], ["trial", "Essai"], ["inactive", "Inactifs"]].map(([v, l]) => (
                            <button key={v} onClick={() => setFilter(v)} style={{
                                padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                border: `1.5px solid ${filter === v ? C.red : C.grey200}`,
                                background: filter === v ? C.redPale : "rgba(255,255,255,.7)",
                                color: filter === v ? C.red : C.grey500, transition: "all .15s"
                            }}>
                                {l} <span style={{ fontWeight: 400, opacity: .7 }}>({v === "all" ? clients.length : clients.filter(c => c.status === v).length})</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map(client => (
                    <div key={client.id} className="ds-row" style={{ cursor: "default" }}>
                        <Avatar name={client.name} size={38} color={C.red} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 600, fontSize: 14, color: C.grey900 }}>{client.name}</span>
                                {planBadge(client.plan)}
                                {statusBadge(client.status)}
                            </div>
                            <p style={{ fontSize: 12, color: C.grey400, marginTop: 2 }}>{client.email}</p>
                        </div>
                        <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
                            <div>
                                <p style={{ fontSize: 15, fontWeight: 700, color: C.grey900 }}>{wCount(client.id)}</p>
                                <p style={{ fontSize: 10, color: C.grey400 }}>Widgets</p>
                            </div>
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 600, color: C.grey700 }}>{client.joinDate}</p>
                                <p style={{ fontSize: 10, color: C.grey400 }}>Inscrit</p>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                            <Btn variant="icon" onClick={() => navigate(`/clients/${client.id}`)}><Eye size={14} /></Btn>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <div className="ds-empty">Aucun ERP trouvé.</div>}
            </div>
        </div>
    );
};

// ── ERP detail page ───────────────────────────────────────────────────────────
const ClientDetailPage = ({ clientId }) => {
    const { getClient, getWidgetsByClient, addWidget, updateWidget, deleteWidget } = useApp();
    const { navigate } = useRouter();
    const { toast } = useToast();
    const client = getClient(clientId);
    const widgets = getWidgetsByClient(clientId);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("askgo-alerts");

    if (!client) return <div className="ds-empty"><p>ERP introuvable.</p><Btn style={{ marginTop: 12 }} onClick={() => navigate("/clients")}>Retour</Btn></div>;

    const handleCreate = () => {
        if (!name.trim()) return;
        const w = addWidget(client.id, name.trim(), type);
        setName(""); setOpen(false);
        toast({ title: "Widget créé", description: `${w.name} ajouté` });
        navigate(`/configurator/${w.id}`);
    };

    return (
        <div className="ds-fadein">
            {open && <ModalPortal>
                <div className="ds-modal-backdrop" onClick={() => setOpen(false)}>
                    <div className="ds-modal ds-scalein" onClick={e => e.stopPropagation()}>
                        <h2>Créer un widget</h2>
                        <div style={{ marginBottom: 16 }}>
                            <Label>Type de widget</Label>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                                {getWidgetCatalog().map(m => {
                                    const Icon = m.icon; return (
                                        <button key={m.type} onClick={() => setType(m.type)} style={{
                                            textAlign: "left", padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                                            border: `2px solid ${type === m.type ? m.color : C.grey200}`,
                                            background: type === m.type ? `${m.color}10` : C.white,
                                            transition: "all .15s"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                                <Icon size={14} color={m.color} />
                                                <span style={{ fontWeight: 600, fontSize: 12, color: C.grey900 }}>{m.name}</span>
                                            </div>
                                            <p style={{ fontSize: 11, color: C.grey400 }}>{m.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}><Label>Nom du widget</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Site principal" /></div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <Btn variant="ghost" onClick={() => setOpen(false)}>Annuler</Btn>
                            <Btn onClick={handleCreate} disabled={!name.trim()}>Créer</Btn>
                        </div>
                    </div>
                </div>
            </ModalPortal>}

            <PageHeader
                back={{ to: "/clients", label: "ERP" }}
                title={client.name}
                subtitle={client.email}
                actions={<>
                    <Btn variant="ghost" onClick={() => navigate(`/clients/${client.id}/onboarding`)}><FileBarChart size={14} /> Guide d'intégration</Btn>
                    <Btn onClick={() => setOpen(true)}><Plus size={14} /> Nouveau widget</Btn>
                </>}
            />

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {planBadge(client.plan)} {statusBadge(client.status)}
                <span style={{ fontSize: 12, color: C.grey400, alignSelf: "center" }}>Inscrit le {client.joinDate}</span>
            </div>

            <Card>
                <SectionTitle>Widgets ({widgets.length})</SectionTitle>
                {widgets.length === 0
                    ? <div className="ds-empty">Aucun widget pour cet ERP.</div>
                    : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {widgets.map(w => {
                                const meta = getWidgetMeta(w.type); const Icon = meta.icon; return (
                                    <div key={w.id} className="ds-row" style={{ cursor: "default" }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${w.config.primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={16} color={w.config.primaryColor} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                                                <span style={{ fontWeight: 600, fontSize: 13, color: C.grey900 }}>{w.name}</span>
                                                <Badge variant="grey">{meta.name}</Badge>
                                                {w.status === "active" ? <Badge variant="green">actif</Badge> : <Badge variant="yellow">pause</Badge>}
                                            </div>
                                            <p className="ds-mono" style={{ fontSize: 10, color: C.grey400, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.apiKey}</p>
                                        </div>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <Btn variant="icon" onClick={() => { navigator.clipboard.writeText(w.apiKey); toast({ title: "API key copiée" }); }}><Copy size={13} /></Btn>
                                            <Btn variant="icon" onClick={() => updateWidget(w.id, { status: w.status === "active" ? "paused" : "active" })}>
                                                {w.status === "active" ? <PowerOff size={13} /> : <Power size={13} color={C.success} />}
                                            </Btn>
                                            <Btn variant="icon" onClick={() => navigate(`/configurator/${w.id}`)}><Settings size={13} /></Btn>
                                            <ConfirmDialog
                                                trigger={<Btn variant="icon"><Trash2 size={13} color={C.red} /></Btn>}
                                                title="Supprimer le widget ?"
                                                description={`"${w.name}" sera supprimé définitivement.`}
                                                onConfirm={() => { deleteWidget(w.id); toast({ title: "Widget supprimé" }); }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </Card>
        </div>
    );
};

const CDN_URL = "https://cdn.anomalyiq.com/widgets.esm.js";
const API_ENDPOINT = "https://api.anomalyiq.com";

const getWidgetStyleVars = (widget) => ({
    "--anomaly-primary-color": widget.config.primaryColor ?? "#D94F3D",
    "--anomaly-primary-dark": widget.config.primaryDark ?? widget.config.primaryColor ?? "#C84332",
    "--anomaly-accent-color": widget.config.accentColor ?? "#f59e0b",
    "--anomaly-background": widget.config.background ?? "#F0EDE8",
    "--anomaly-surface": widget.config.surface ?? "rgba(255,255,255,0.72)",
    "--anomaly-surface-hover": widget.config.surfaceHover ?? "rgba(217,79,61,0.04)",
    "--anomaly-text-primary": widget.config.textPrimary ?? "#18191C",
    "--anomaly-text-secondary": widget.config.textSecondary ?? "#525761",
    "--anomaly-text-muted": widget.config.textMuted ?? "#9CA3AF",
    "--anomaly-border-color": widget.config.borderColor ?? "rgba(255,255,255,0.88)",
    "--anomaly-border-radius": widget.config.borderRadius ?? "16px",
    "--anomaly-font-family": widget.config.fontFamily ?? "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "--anomaly-font-mono": widget.config.fontFamilyMono ?? "'JetBrains Mono', 'Fira Code', monospace",
});

const styleVarsToInline = vars => Object.entries(vars).map(([k, v]) => `${k}: ${v};`).join(" ");

const getWidgetApiSpec = (widget) => {
    if (widget.type === "askgo-alerts") return [
        { method: "GET", path: "/alerts", query: ["status", "supplier?", "page?", "size?"], body: null, returns: "Alert[] + pagination", purpose: "Charge la liste paginée des alertes de l'ERP." },
    ];
    if (widget.type === "askgo-alert-detail") return [
        { method: "GET", path: "/alerts/{id}", query: ["id"], body: null, returns: "Alert", purpose: "Charge le détail complet d'une alerte." },
        { method: "POST", path: "/feedback/{alertId}", query: ["alertId"], body: { action: "CONFIRM | REJECT | IGNORE", comment: "string?" }, returns: "FeedbackResponse", purpose: "Confirme, rejette ou ignore une anomalie." },
    ];
    if (widget.type === "askgo-score") return [
        { method: "POST", path: `/pipelines/${widget.config.pipelineId ?? "pipeline_askgo"}/invoices/check`, query: [], body: { supplier: "string", amount: "number", date: "YYYY-MM-DD", label: "string", extraFields: "Record<string, unknown>?" }, returns: "InvoiceCheckResult", purpose: "Calcule le score de risque d'une facture." },
    ];
    if (widget.type === "askgo-budget") return [
        { method: "GET", path: `/pipelines/${widget.config.pipelineId ?? "pipeline_123"}/series/${widget.config.seriesId ?? "series_456"}/budget`, query: ["year"], body: null, returns: "BudgetSummary", purpose: "Charge budget vs réalisé mensuel." },
    ];
    if (widget.type === "askgo-forecast") return [
        { method: "GET", path: `/pipelines/${widget.config.pipelineId ?? "pipeline_123"}/series/${widget.config.seriesId ?? "series_456"}/forecast`, query: ["page?", "size?"], body: null, returns: "ForecastPoint[]", purpose: "Charge la prévision sur 12 mois." },
    ];
    return [
        { method: "GET", path: `/widgets/${widget.id}/data`, query: ["erpId"], body: null, returns: "WidgetData", purpose: "Endpoint de données du widget custom." },
    ];
};

const getWidgetEvents = (widget) => {
    if (widget.type === "askgo-alerts") return [
        { direction: "emitted", name: "anomaly-select-alert", payload: "Alert", purpose: "Déclenché quand l'utilisateur sélectionne une alerte." },
    ];
    if (widget.type === "askgo-alert-detail") return [
        { direction: "listened", name: "anomaly-open-alert", payload: "{ id: string }", purpose: "Optionnel: l'ERP peut ouvrir une alerte précise dans le panneau détail." },
        { direction: "emitted", name: "anomaly-status-change", payload: "FeedbackResponse", purpose: "Notifie l'ERP qu'un statut d'alerte a changé." },
        { direction: "emitted", name: "anomaly-close", payload: "void", purpose: "Demande la fermeture du panneau détail." },
    ];
    if (widget.type === "askgo-score") return [
        { direction: "emitted", name: "anomaly-score-received", payload: "InvoiceCheckResult", purpose: "Retourne score, sévérité et explication à l'ERP." },
        { direction: "emitted", name: "anomaly-score-error", payload: "{ message: string }", purpose: "Notifie l'ERP si le scoring échoue." },
    ];
    return [];
};



// ── Widgets page ───────────────────────────────────────────────────────────────


/**
 * DROP-IN REPLACEMENT for ErpOnboardingPage + IntegrationReport + getWidgetIntegrationSpec
 * in your main WidgetsApp file.
 *
 * Paste these three exports in place of the existing ones.
 * All other imports / helpers (C, Btn, Card, Badge, Avatar, etc.) are assumed to be in scope.
 */

/**
 * DROP-IN REPLACEMENT for ErpOnboardingPage + IntegrationReport + getWidgetIntegrationSpec
 * in your main WidgetsApp file.
 *
 * Paste these three exports in place of the existing ones.
 * All other imports / helpers (C, Btn, Card, Badge, Avatar, etc.) are assumed to be in scope.
 */

// ─────────────────────────────────────────────────────────────────────────────
// getWidgetIntegrationSpec  — full API + event + CSS-var + type contracts
// ─────────────────────────────────────────────────────────────────────────────
const getWidgetIntegrationSpec = (widget) => {
    const tag = widget.config.webComponent ?? "anomaly-widget";

    // ── HTML attributes always present ──
    const baseAttrs = [
        { name: "api-key", value: widget.apiKey, required: true, desc: "Clé d'API unique générée par le SaaS pour ce widget / ERP." },
        { name: "erp-id", value: widget.clientId, required: true, desc: "Identifiant de l'ERP." },
        { name: "endpoint", value: "https://api.anomalyiq.com", required: false, desc: "URL de base de l'API AnomalyIQ. Peut être surchargée pour un environnement de staging." },
    ];

    const widgetAttrs = [];   // widget-specific HTML attributes
    const apis = [];   // { method, path, params: [{name,type,required,desc}], response, purpose }
    const events = [];   // { name, payload, fields, purpose }
    const cssVars = [     // CSS custom properties injected by the SaaS
        { name: "--anomaly-primary-color", value: widget.config.primaryColor ?? "#D94F3D", desc: "Couleur principale (boutons, liens, accents)." },
        { name: "--anomaly-primary-dark", value: widget.config.primaryDark ?? "#C84332", desc: "Variante sombre de la couleur principale (hover, focus)." },
        { name: "--anomaly-accent-color", value: widget.config.accentColor ?? "#f59e0b", desc: "Couleur d'accent secondaire." },
        { name: "--anomaly-background", value: widget.config.background ?? "#F0EDE8", desc: "Fond global du widget." },
        { name: "--anomaly-surface", value: widget.config.surface ?? "rgba(255,255,255,0.72)", desc: "Fond des cartes / panneaux." },
        { name: "--anomaly-surface-hover", value: widget.config.surfaceHover ?? "rgba(217,79,61,0.04)", desc: "Fond des éléments au survol." },
        { name: "--anomaly-text-primary", value: widget.config.textPrimary ?? "#18191C", desc: "Texte principal." },
        { name: "--anomaly-text-secondary", value: widget.config.textSecondary ?? "#475569", desc: "Texte secondaire." },
        { name: "--anomaly-text-muted", value: widget.config.textMuted ?? "#94a3b8", desc: "Texte atténué / labels." },
        { name: "--anomaly-border-color", value: widget.config.borderColor ?? "#e2e8f0", desc: "Couleur des bordures." },
        { name: "--anomaly-border-radius", value: widget.config.borderRadius ?? "3px", desc: "Rayon des bords." },
        { name: "--anomaly-danger", value: widget.config.danger ?? "#ef4444", desc: "Couleur d'erreur / alerte critique." },
        { name: "--anomaly-success", value: widget.config.success ?? "#16a34a", desc: "Couleur de succès." },
        { name: "--anomaly-warning", value: widget.config.warning ?? "#d97706", desc: "Couleur d'avertissement." },
        { name: "--anomaly-font-family", value: widget.config.fontFamily ?? "'Arial', sans-serif", desc: "Police principale." },
        { name: "--anomaly-font-mono", value: widget.config.fontFamilyMono ?? "'Courier New', monospace", desc: "Police monospace (valeurs numériques, codes)." },
    ];

    // ── Per-widget specs ──
    if (widget.type === "askgo-alerts") {
        widgetAttrs.push(
            { name: "status-filter", value: widget.config.statusFilter ?? "PENDING", required: false, desc: "Filtre de statut initial. Valeurs: PENDING | CONFIRMED | REJECTED | IGNORED | '' (tous)." },
            { name: "refresh-key", value: "0", required: false, desc: "Incrémenter pour forcer un rechargement de la liste (ex: après un feedback)." },
        );
        apis.push({
            method: "GET", path: "/alerts",
            purpose: "Charge la liste paginée des alertes de l'ERP authentifié.",
            auth: "Bearer token SSO (header Authorization) + api-key (header X-Api-Key)",
            params: [
                { name: "status", type: "string", required: false, desc: "Filtre: PENDING | CONFIRMED | REJECTED | IGNORED" },
                { name: "page", type: "integer", required: false, desc: "Numéro de page (0-based). Défaut: 0." },
                { name: "size", type: "integer", required: false, desc: "Taille de page. Défaut: 10. Max: 100." },
            ],
            response: `{
  "items": [
    {
      "id":       "string",
      "supplier": "string",
      "type":     "DUPLICATE | AMOUNT_ANOMALY | FREQUENCY | ROUNDING | NEW_SUPPLIER",
      "amount":   number,
      "date":     "YYYY-MM-DD",
      "score":    number,   // 0-100
      "status":   "PENDING | CONFIRMED | REJECTED | IGNORED"
    }
  ],
  "total":      number,
  "page":       number,
  "totalPages": number
}`,
        });
        events.push({
            name: "anomaly-select-alert",
            purpose: "Déclenché quand l'utilisateur clique sur 'Détail' d'une alerte. L'ERP doit monter AlertDetailWidget avec l'objet reçu.",
            payload: "Alert",
            fields: [
                { name: "id", type: "string", desc: "ID de l'alerte sélectionnée." },
                { name: "supplier", type: "string", desc: "Nom du fournisseur." },
                { name: "type", type: "string", desc: "Type d'anomalie détectée." },
                { name: "amount", type: "number", desc: "Montant de la facture." },
                { name: "date", type: "string", desc: "Date de la facture (YYYY-MM-DD)." },
                { name: "score", type: "number", desc: "Score de risque (0-100)." },
                { name: "status", type: "string", desc: "Statut courant." },
            ],
        });
    }

    if (widget.type === "askgo-alert-detail") {
        widgetAttrs.push(
            { name: "(prop) alert", value: "Alert object", required: true, desc: "Propriété JS — non un attribut HTML. Passer l'objet Alert reçu de anomaly-select-alert via element.alert = alertObj." },
        );
        apis.push({
            method: "GET", path: "/alerts/{id}",
            purpose: "Charge le détail complet d'une alerte (explication, valeurs de référence, historique).",
            auth: "Bearer token SSO + X-Api-Key",
            params: [
                { name: "id", type: "string", required: true, desc: "ID de l'alerte (path param)." },
            ],
            response: `{
  "id":          "string",
  "supplier":    "string",
  "amount":      number,
  "date":        "YYYY-MM-DD",
  "score":       number,
  "status":      "PENDING | CONFIRMED | REJECTED | IGNORED",
  "explanation": "string",
  "referenceValues": {
    "expected": number | null,
    "actual":   number | null
  }
}`,
        });
        apis.push({
            method: "POST", path: "/feedback/{alertId}",
            purpose: "Enregistre la décision de l'utilisateur sur une alerte (confirmer, rejeter, ignorer).",
            auth: "Bearer token SSO + X-Api-Key",
            params: [
                { name: "alertId", type: "string", required: true, desc: "ID de l'alerte (path param)." },
                { name: "action", type: "string", required: true, desc: "CONFIRM | REJECT | IGNORE" },
                { name: "comment", type: "string", required: false, desc: "Commentaire libre de l'utilisateur." },
            ],
            response: `{
  "alertId":   "string",
  "newStatus": "CONFIRMED | REJECTED | IGNORED",
  "updatedAt": "ISO 8601"
}`,
        });
        events.push({
            name: "anomaly-status-change",
            purpose: "Notifie l'ERP qu'un statut d'alerte a changé. Incrémenter refresh-key de AlertsWidget pour rafraîchir la liste.",
            payload: "FeedbackResponse",
            fields: [
                { name: "alertId", type: "string", desc: "ID de l'alerte modifiée." },
                { name: "newStatus", type: "string", desc: "Nouveau statut: CONFIRMED | REJECTED | IGNORED." },
                { name: "updatedAt", type: "string", desc: "Horodatage ISO 8601." },
            ],
        });
        events.push({
            name: "anomaly-close",
            purpose: "L'utilisateur a cliqué 'Fermer'. L'ERP doit démonter ou masquer le panneau détail.",
            payload: "void",
            fields: [],
        });
    }

    if (widget.type === "askgo-score") {
        const pid = widget.config.pipelineId ?? "pipeline_askgo";
        widgetAttrs.push(
            { name: "pipeline-id", value: pid, required: true, desc: "Identifiant du pipeline de détection configuré dans le SaaS." },
            { name: "(prop) invoiceData", value: "InvoiceData", required: true, desc: "Propriété JS. Passer { supplier, amount, date } via element.invoiceData = {...}." },
        );
        apis.push({
            method: "POST", path: `/pipelines/${pid}/invoices/check`,
            purpose: "Calcule le score de risque d'anomalie d'une facture via le pipeline IA configuré.",
            auth: "Bearer token SSO + X-Api-Key",
            params: [
                { name: "supplier", type: "string", required: true, desc: "Nom du fournisseur." },
                { name: "amount", type: "number", required: true, desc: "Montant de la facture (€)." },
                { name: "date", type: "string", required: true, desc: "Date de la facture (YYYY-MM-DD)." },
                { name: "label", type: "string", required: false, desc: "Libellé / description de la facture." },
                { name: "extraFields", type: "object", required: false, desc: "Champs supplémentaires libres transmis au pipeline." },
            ],
            response: `{
  "score":       number,    // 0-100 (100 = risque maximal)
  "severity":    "LOW | MEDIUM | HIGH",
  "explanation": "string"   // Explication lisible par un humain
}`,
        });
        events.push({
            name: "anomaly-score-received",
            purpose: "Retourne le résultat d'analyse à l'ERP dès que le score est calculé. Utiliser pour décider d'afficher un avertissement ou de bloquer la saisie.",
            payload: "InvoiceCheckResult",
            fields: [
                { name: "score", type: "number", desc: "Score de risque (0-100)." },
                { name: "severity", type: "string", desc: "LOW | MEDIUM | HIGH." },
                { name: "explanation", type: "string", desc: "Explication textuelle." },
            ],
        });
    }

    if (widget.type === "askgo-budget") {
        const pid = widget.config.pipelineId ?? "pipeline_123";
        const sid = widget.config.seriesId ?? "series_456";
        const yr = widget.config.year ?? 2024;
        widgetAttrs.push(
            { name: "pipeline-id", value: pid, required: true, desc: "Pipeline de données budgétaires." },
            { name: "series-id", value: sid, required: true, desc: "Série budgétaire à afficher." },
            { name: "year", value: String(yr), required: false, desc: "Année à afficher. Défaut: année courante." },
        );
        apis.push({
            method: "GET", path: `/pipelines/${pid}/series/${sid}/budget`,
            purpose: "Charge les données budget vs réalisé mois par mois pour l'année sélectionnée.",
            auth: "Bearer token SSO + X-Api-Key",
            params: [
                { name: "year", type: "integer", required: false, desc: "Année fiscale. Défaut: année courante." },
            ],
            response: `{
  "annualVariance": number,   // % de dépassement/sous-réalisation global
  "months": [
    {
      "month":    number,     // 1-12
      "actual":   number,     // Réalisé (€)
      "expected": number,     // Budget (€)
      "variance": number,     // % écart (positif = dépassement)
      "status":   "OVER | UNDER | ON_TRACK"
    }
  ]
}`,
        });
    }

    if (widget.type === "askgo-forecast") {
        const pid = widget.config.pipelineId ?? "pipeline_123";
        const sid = widget.config.seriesId ?? "series_456";
        widgetAttrs.push(
            { name: "pipeline-id", value: pid, required: true, desc: "Pipeline de prévision." },
            { name: "series-id", value: sid, required: true, desc: "Série à prévoir." },
        );
        apis.push({
            method: "GET", path: `/pipelines/${pid}/series/${sid}/forecast`,
            purpose: "Retourne la prévision sur les 12 prochains mois avec intervalles de confiance.",
            auth: "Bearer token SSO + X-Api-Key",
            params: [
                { name: "page", type: "integer", required: false, desc: "Page (0-based). Défaut: 0." },
                { name: "size", type: "integer", required: false, desc: "Nombre d'entrées. Défaut: 12." },
            ],
            response: `{
  "items": [
    {
      "date":           "YYYY-MM-DD",
      "expectedAmount": number,
      "lowerBound":     number,
      "upperBound":     number
    }
  ],
  "total":      number,
  "page":       number,
  "totalPages": number
}`,
        });
    }

    // ── Build HTML snippet ──
    const allAttrs = [...baseAttrs, ...widgetAttrs].filter(a => !a.name.startsWith("(prop)"));
    const htmlLines = [`<${tag}`, ...allAttrs.map(a => `  ${a.name}="${a.value}"`), `></${tag}>`];
    const html = htmlLines.join("\n");

    // ── JS property setters (for props) ──
    const jsPropLines = widgetAttrs
        .filter(a => a.name.startsWith("(prop)"))
        .map(a => {
            const propName = a.name.replace("(prop) ", "");
            if (propName === "alert") return `const el = document.querySelector('${tag}');\nel.alert = alert; // Alert object from anomaly-select-alert`;
            if (propName === "invoiceData") return `const el = document.querySelector('${tag}');\nel.invoiceData = { supplier: "Fournisseur SA", amount: 12450, date: "2024-06-15" };`;
            return `document.querySelector('${tag}').${propName} = value;`;
        });

    return { tag, html, htmlLines, allAttrs, baseAttrs, widgetAttrs, apis, events, cssVars, jsPropLines };
};


// ─────────────────────────────────────────────────────────────────────────────
// IntegrationReport  — full ERP guide
// ─────────────────────────────────────────────────────────────────────────────
const IntegrationReport = ({ client, widgets }) => {
    const [copiedKey, setCopiedKey] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1800);
    };

    const activeWidgets = widgets.filter(w => w.status === "active");
    const scriptTag = `<script type="module" src="https://cdn.anomalyiq.com/widgets.esm.js"></script>`;

    const ssoSnippet = `// 1. Votre backend échange le token SSO de votre ERP contre un token AnomalyIQ
const response = await fetch("https://api.anomalyiq.com/auth/sso-exchange", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": "<VOTRE_API_KEY>",
  },
  body: JSON.stringify({ erpToken: currentUser.sessionToken }),
});
const { token } = await response.json();
// 2. Passer ce token à chaque web component via l'attribut "token"`;

    const sections = [
        { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
        { id: "install", label: "Installation", icon: Download },
        { id: "auth", label: "Authentification", icon: ShieldCheck },
        { id: "widgets", label: "Widgets", icon: Zap },
        { id: "css", label: "CSS Variables", icon: Palette },
        { id: "json", label: "Rapport JSON", icon: FileJson },
        { id: "examples", label: "Exemples", icon: Code2 },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1.5px solid ${C.grey200}`, borderRadius: 18, overflow: "hidden", background: C.white }}>

            {/* ── Report header ── */}
            <div style={{ background: `linear-gradient(135deg, ${C.grey900} 0%, ${C.grey700} 100%)`, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 80% 50%, ${C.red}22 0%, transparent 60%)` }} />
                <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ background: C.red, color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: ".8px", textTransform: "uppercase" }}>Guide d'intégration</span>
                        <span style={{ fontSize: 11, color: C.grey400 }}>AnomalyIQ Widgets · v1</span>
                    </div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>{client.name}</h2>
                    <p style={{ margin: 0, fontSize: 13, color: C.grey400 }}>ERP ID: <span style={{ fontFamily: "monospace", color: C.grey300 }}>{client.id}</span> · {activeWidgets.length} widget{activeWidgets.length !== 1 ? "s" : ""} actif{activeWidgets.length !== 1 ? "s" : ""} · Généré le {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
            </div>

            {/* ── Section nav ── */}
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.grey200}`, background: C.grey50, overflowX: "auto" }}>
                {sections.map(s => {
                    const Icon = s.icon;
                    return (
                    <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                        padding: "12px 20px", border: "none", background: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                        color: activeSection === s.id ? C.red : C.grey500,
                        borderBottom: `2px solid ${activeSection === s.id ? C.red : "transparent"}`,
                        transition: "all .15s",
                    }}>
                        <Icon size={14} /> {s.label}
                    </button>
                    );
                })}
            </div>

            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>

                {/* ────────────────────────── OVERVIEW ─────────────────────────────── */}
                {activeSection === "overview" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                            {[
                                { label: "Endpoint API", value: "api.anomalyiq.com", mono: true, icon: Globe },
                                { label: "CDN Script", value: "cdn.anomalyiq.com", mono: true, icon: Package },
                                { label: "Auth", value: "SSO Exchange + API Key", mono: false, icon: ShieldCheck },
                            ].map(k => (
                                <div key={k.label} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 12, padding: "14px 16px", background: C.grey50 }}>
                                    <k.icon size={18} color={C.red} style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 10, fontWeight: 700, color: C.grey400, textTransform: "uppercase", letterSpacing: ".6px", margin: "0 0 4px" }}>{k.label}</p>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: C.grey800, fontFamily: k.mono ? "monospace" : "inherit", margin: 0 }}>{k.value}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>Widgets sélectionnés pour cet ERP</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {activeWidgets.map(w => {
                                    const spec = getWidgetIntegrationSpec(w);
                                    return (
                                        <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", border: `1.5px solid ${C.grey200}`, borderRadius: 12, background: C.white }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${w.config.primaryColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={16} color={w.config.primaryColor} /></div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.grey900 }}>{w.name}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: 11, color: C.grey400, fontFamily: "monospace" }}>&lt;{spec.tag}&gt; · {spec.apis.length} API endpoint{spec.apis.length !== 1 ? "s" : ""} · {spec.events.length} événement{spec.events.length !== 1 ? "s" : ""}</p>
                                            </div>
                                            <span style={{ fontSize: 11, fontFamily: "monospace", background: `${w.config.primaryColor}14`, color: w.config.primaryColor, border: `1px solid ${w.config.primaryColor}33`, borderRadius: 6, padding: "3px 9px" }}>{w.type}</span>
                                        </div>
                                    );
                                })}
                                {activeWidgets.length === 0 && (
                                    <div style={{ padding: "24px", textAlign: "center", color: C.grey400, fontSize: 13, border: `1.5px dashed ${C.grey200}`, borderRadius: 12 }}>
                                        Aucun widget actif. Activez des widgets depuis la page ERP.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ background: "#EFF6FF", border: `1.5px solid #BFDBFE`, borderRadius: 12, padding: "16px 18px" }}>
                            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#1E40AF", display: "flex", alignItems: "center", gap: 8 }}><ClipboardList size={16} /> Checklist d'intégration</p>
                            {[
                                "Inclure le script CDN une seule fois dans le <head> de l'application ERP",
                                "Implémenter l'endpoint SSO Exchange côté backend",
                                "Monter chaque web component avec token + api-key + attributs requis",
                                "Écouter les événements CustomEvent pour la communication inter-composants",
                                "Injecter les CSS variables dans l'élément parent pour le theming",
                                "Tester en staging sur https://api.anomalyiq.com/health",
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 8 }}>
                                    <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid #3B82F6`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#1D4ED8", flexShrink: 0 }}>{i + 1}</span>
                                    <span style={{ fontSize: 12, color: "#1E40AF", lineHeight: 1.5 }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ────────────────────────── INSTALL ──────────────────────────────── */}
                {activeSection === "install" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <SectionHead icon={<Download size={16} />} title="Étape 1 — Script global" subtitle="À inclure une seule fois dans le <head> ou avant </body>. Enregistre tous les web components AnomalyIQ." />
                        <CodeBlock code={scriptTag} language="html" onCopy={() => copy(scriptTag, "script")} copied={copiedKey === "script"} />

                        <SectionHead icon={<ClipboardList size={16} />} title="Étape 2 — Vérification" subtitle="Tester que les web components sont enregistrés dans le navigateur." />
                        <CodeBlock language="js" onCopy={() => copy(`customElements.get('anomaly-alerts');\n// Doit retourner la classe du composant, pas undefined`, "check")} copied={copiedKey === "check"} code={`customElements.get('anomaly-alerts');\n// Doit retourner la classe du composant, pas undefined`} />

                        <InfoBox icon={<Info size={18} />} color="#3B82F6" bg="#EFF6FF" border="#BFDBFE">
                            Le script est un module ES2020+. Il est compatible avec tous les navigateurs modernes (Chrome 80+, Firefox 75+, Safari 13.1+, Edge 80+). Pour IE11, un polyfill est nécessaire — contacter le support AnomalyIQ.
                        </InfoBox>

                        <SectionHead icon={<Settings size={16} />} title="Environnements" subtitle="URLs par environnement." />
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: C.grey100 }}>
                                    {["Env.", "CDN Script", "Endpoint API"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.grey600, fontWeight: 700, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Production", "https://cdn.anomalyiq.com/widgets.esm.js", "https://api.anomalyiq.com"],
                                    ["Staging", "https://cdn-staging.anomalyiq.com/widgets.esm.js", "https://api-staging.anomalyiq.com"],
                                    ["Local dev", "(idem staging)", "http://localhost:3001"],
                                ].map(([env, cdn, api]) => (
                                    <tr key={env} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                        <td style={{ padding: "8px 12px", color: C.grey700, fontWeight: 600 }}>{env}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "monospace", color: C.grey600, fontSize: 11 }}>{cdn}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "monospace", color: C.grey600, fontSize: 11 }}>{api}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ────────────────────────── AUTH ─────────────────────────────────── */}
                {activeSection === "auth" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <SectionHead icon={<ShieldCheck size={16} />} title="Authentification" subtitle="Les widgets utilisent deux mécanismes combinés : SSO Exchange (token court-vécu) + API Key (identification du widget)." />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <InfoBox icon={<KeyRound size={18} />} color="#8B5CF6" bg="rgba(139,92,246,.06)" border="rgba(139,92,246,.25)">
                                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>API Key</p>
                                <p style={{ margin: 0, fontSize: 12, color: "#6D28D9", lineHeight: 1.5 }}>Identifie le widget et l'ERP. Transmise via l'attribut <code>api-key</code> ET le header <code>X-Api-Key</code> côté backend. Ne pas exposer dans du code client non obfusqué.</p>
                            </InfoBox>
                            <InfoBox icon={<Ticket size={18} />} color="#0EA5E9" bg="rgba(14,165,233,.06)" border="rgba(14,165,233,.25)">
                                <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#0369A1" }}>Token SSO</p>
                                <p style={{ margin: 0, fontSize: 12, color: "#0369A1", lineHeight: 1.5 }}>Token court-vécu (15 min) obtenu via le endpoint <code>/auth/sso-exchange</code>. À rafraîchir avant expiration. Transmis via l'attribut <code>token</code>.</p>
                            </InfoBox>
                        </div>

                        <SectionHead icon={<Monitor size={16} />} title="Implémentation SSO Exchange" subtitle="Appel backend à effectuer à chaque session utilisateur (et à rafraîchir toutes les 10-14 min)." />
                        <CodeBlock language="js" code={ssoSnippet} onCopy={() => copy(ssoSnippet, "sso")} copied={copiedKey === "sso"} />

                        <SectionHead icon={<Send size={16} />} title="Headers requis par l'API" subtitle="Chaque requête backend doit inclure ces headers." />
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: C.grey100 }}>
                                    {["Header", "Valeur", "Requis", "Description"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.grey600, fontWeight: 700, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Authorization", "Bearer <sso_token>", "✓", "Token SSO court-vécu obtenu via /auth/sso-exchange"],
                                    ["X-Api-Key", "<api_key>", "✓", "Clé API du widget / ERP"],
                                    ["Content-Type", "application/json", "POST uniquement", "Pour les requêtes avec body"],
                                ].map(([h, v, r, d]) => (
                                    <tr key={h} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                        <td style={{ padding: "8px 12px", fontFamily: "monospace", color: C.grey800, fontWeight: 600 }}>{h}</td>
                                        <td style={{ padding: "8px 12px", fontFamily: "monospace", color: C.grey500, fontSize: 11 }}>{v}</td>
                                        <td style={{ padding: "8px 12px", color: r === "✓" ? "#16A34A" : C.grey400, fontWeight: r === "✓" ? 700 : 400, fontSize: 11 }}>{r}</td>
                                        <td style={{ padding: "8px 12px", color: C.grey500, fontSize: 11 }}>{d}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <SectionHead icon={<AlertTriangle size={16} />} title="Codes d'erreur" subtitle="Erreurs HTTP retournées par l'API." />
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                                <tr style={{ background: C.grey100 }}>
                                    {["Code", "Signification", "Action recommandée"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.grey600, fontWeight: 700, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["401", "Token expiré ou invalide", "Rafraîchir le token SSO et réessayer"],
                                    ["403", "API key invalide / inactive", "Vérifier la clé dans le SaaS AnomalyIQ"],
                                    ["404", "Ressource introuvable", "Vérifier l'ID passé en paramètre"],
                                    ["429", "Quota API dépassé", "Implémenter un back-off exponentiel"],
                                    ["500", "Erreur serveur", "Réessayer après 5s, contacter le support si persistant"],
                                ].map(([code, meaning, action]) => (
                                    <tr key={code} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                        <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 700, color: code === "401" || code === "403" ? C.red : code === "500" ? C.warning : C.grey700 }}>{code}</td>
                                        <td style={{ padding: "8px 12px", color: C.grey700 }}>{meaning}</td>
                                        <td style={{ padding: "8px 12px", color: C.grey500, fontSize: 11 }}>{action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ────────────────────────── WIDGETS ──────────────────────────────── */}
                {activeSection === "widgets" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        {activeWidgets.length === 0 && (
                            <div style={{ padding: "32px", textAlign: "center", color: C.grey400, fontSize: 13, border: `1.5px dashed ${C.grey200}`, borderRadius: 12 }}>
                                Aucun widget actif. Activez des widgets depuis la page ERP pour voir leur documentation.
                            </div>
                        )}
                        {activeWidgets.map((w, wi) => {
                            const spec = getWidgetIntegrationSpec(w);
                            const jsListenerSnippet = spec.events.map(ev =>
                                `document.querySelector('${spec.tag}').addEventListener('${ev.name}', (event) => {
  const data = event.detail; // ${ev.payload}
  console.log('${ev.name}', data);
});`).join("\n\n");

                            const fullSnippet = [
                                scriptTag,
                                "",
                                spec.html,
                                ...(spec.jsPropLines.length ? ["", "<!-- Propriétés JS à passer via script -->", "<script>", ...spec.jsPropLines, "</script>"] : []),
                                ...(spec.events.length ? ["", "<!-- Écouter les événements -->", "<script>", jsListenerSnippet, "</script>"] : []),
                            ].join("\n");

                            return (
                                <div key={w.id} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 16, overflow: "hidden" }}>
                                    {/* Widget header */}
                                    <div style={{ padding: "16px 20px", background: `linear-gradient(135deg, ${w.config.primaryColor}10, ${w.config.primaryColor}05)`, borderBottom: `1px solid ${C.grey200}`, display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: w.config.primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={18} color="#fff" /></div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.grey900 }}>{w.name}</h3>
                                            <p style={{ margin: 0, fontSize: 11, color: C.grey500, fontFamily: "monospace" }}>&lt;{spec.tag}&gt; · {w.type} · API key: {w.apiKey.slice(0, 18)}…</p>
                                        </div>
                                        <span style={{ fontSize: 12, fontFamily: "monospace", background: `${w.config.primaryColor}18`, color: w.config.primaryColor, border: `1.5px solid ${w.config.primaryColor}33`, borderRadius: 8, padding: "4px 12px", fontWeight: 700 }}>#{wi + 1}</span>
                                    </div>

                                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

                                        {/* HTML snippet */}
                                        <div>
                                            <SubHead>Snippet HTML complet</SubHead>
                                            <CodeBlock language="html" code={fullSnippet} onCopy={() => copy(fullSnippet, `html-${w.id}`)} copied={copiedKey === `html-${w.id}`} />
                                        </div>

                                        {/* Attributes table */}
                                        <div>
                                            <SubHead>Attributs HTML</SubHead>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                                <thead>
                                                    <tr style={{ background: C.grey50 }}>
                                                        {["Attribut", "Valeur", "Requis", "Description"].map(h => <th key={h} style={{ padding: "7px 12px", textAlign: "left", color: C.grey500, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {spec.allAttrs.map(a => (
                                                        <tr key={a.name} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                                            <td style={{ padding: "7px 12px", fontFamily: "monospace", fontWeight: 700, color: C.grey800, fontSize: 11 }}>{a.name}</td>
                                                            <td style={{ padding: "7px 12px", fontFamily: "monospace", color: C.grey500, fontSize: 10, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.value}>{a.value}</td>
                                                            <td style={{ padding: "7px 12px", color: a.required ? "#16A34A" : C.grey400, fontWeight: a.required ? 700 : 400 }}>{a.required ? "✓ Requis" : "Optionnel"}</td>
                                                            <td style={{ padding: "7px 12px", color: C.grey500, lineHeight: 1.4 }}>{a.desc}</td>
                                                        </tr>
                                                    ))}
                                                    {spec.widgetAttrs.filter(a => a.name.startsWith("(prop)")).map(a => (
                                                        <tr key={a.name} style={{ borderBottom: `1px solid ${C.grey200}`, background: "rgba(245,158,11,.04)" }}>
                                                            <td style={{ padding: "7px 12px", fontFamily: "monospace", fontWeight: 700, color: "#B45309", fontSize: 11 }}>{a.name}</td>
                                                            <td style={{ padding: "7px 12px", fontFamily: "monospace", color: C.grey500, fontSize: 10 }}>{a.value}</td>
                                                            <td style={{ padding: "7px 12px", color: "#16A34A", fontWeight: 700 }}>✓ Requis</td>
                                                            <td style={{ padding: "7px 12px", color: C.grey500, lineHeight: 1.4 }}>{a.desc}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* API endpoints */}
                                        {spec.apis.map((apiSpec, ai) => (
                                            <div key={ai}>
                                                <SubHead>{apiSpec.method} {apiSpec.path}</SubHead>
                                                <p style={{ fontSize: 12, color: C.grey500, marginBottom: 12 }}>{apiSpec.purpose}</p>
                                                <p style={{ fontSize: 11, color: C.grey400, marginBottom: 8 }}>Auth: <span style={{ fontFamily: "monospace", color: C.grey600 }}>{apiSpec.auth}</span></p>

                                                {apiSpec.params.length > 0 && (
                                                    <>
                                                        <p style={{ fontSize: 11, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Paramètres</p>
                                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 12 }}>
                                                            <thead>
                                                                <tr style={{ background: C.grey50 }}>
                                                                    {["Nom", "Type", "Requis", "Description"].map(h => <th key={h} style={{ padding: "6px 10px", textAlign: "left", color: C.grey500, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {apiSpec.params.map(p => (
                                                                    <tr key={p.name} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                                                        <td style={{ padding: "6px 10px", fontFamily: "monospace", color: C.grey800, fontWeight: 600, fontSize: 11 }}>{p.name}</td>
                                                                        <td style={{ padding: "6px 10px", fontFamily: "monospace", color: "#7C3AED", fontSize: 11 }}>{p.type}</td>
                                                                        <td style={{ padding: "6px 10px", color: p.required ? "#16A34A" : C.grey400, fontWeight: p.required ? 700 : 400 }}>{p.required ? "✓" : "–"}</td>
                                                                        <td style={{ padding: "6px 10px", color: C.grey500 }}>{p.desc}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                )}

                                                <p style={{ fontSize: 11, fontWeight: 700, color: C.grey500, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>Réponse (200)</p>
                                                <CodeBlock language="json" code={apiSpec.response} onCopy={() => copy(apiSpec.response, `resp-${w.id}-${ai}`)} copied={copiedKey === `resp-${w.id}-${ai}`} compact />
                                            </div>
                                        ))}

                                        {/* Events */}
                                        {spec.events.length > 0 && (
                                            <div>
                                                <SubHead>Événements CustomEvent émis</SubHead>
                                                {spec.events.map(ev => (
                                                    <div key={ev.name} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10, background: C.grey50 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                                            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: C.grey900 }}>{ev.name}</span>
                                                            <span style={{ fontSize: 10, background: "#DDD6FE", color: "#5B21B6", border: "1px solid #C4B5FD", borderRadius: 4, padding: "1px 7px", fontWeight: 700 }}>{ev.payload}</span>
                                                        </div>
                                                        <p style={{ fontSize: 12, color: C.grey500, margin: "0 0 10px", lineHeight: 1.5 }}>{ev.purpose}</p>
                                                        {ev.fields.length > 0 && (
                                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                                                <thead>
                                                                    <tr>
                                                                        {["Champ", "Type", "Description"].map(h => <th key={h} style={{ padding: "5px 8px", textAlign: "left", color: C.grey400, fontWeight: 700, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {ev.fields.map(f => (
                                                                        <tr key={f.name} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                                                            <td style={{ padding: "5px 8px", fontFamily: "monospace", fontWeight: 600, color: C.grey800 }}>{f.name}</td>
                                                                            <td style={{ padding: "5px 8px", fontFamily: "monospace", color: "#7C3AED" }}>{f.type}</td>
                                                                            <td style={{ padding: "5px 8px", color: C.grey500 }}>{f.desc}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* JS event listener snippet */}
                                        {spec.events.length > 0 && (
                                            <div>
                                                <SubHead>Écouter les événements (JavaScript)</SubHead>
                                                <CodeBlock language="js" code={jsListenerSnippet} onCopy={() => copy(jsListenerSnippet, `ev-${w.id}`)} copied={copiedKey === `ev-${w.id}`} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ────────────────────────── CSS VARS ─────────────────────────────── */}
                {activeSection === "css" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <SectionHead icon={<Palette size={16} />} title="CSS Custom Properties (theming)" subtitle="Ces variables CSS sont injectées par le SaaS sur l'élément parent de chaque widget. L'ERP peut les surcharger en les redéfinissant sur un sélecteur plus spécifique." />

                        {activeWidgets.length === 0 ? (
                            <div style={{ padding: "24px", textAlign: "center", color: C.grey400, fontSize: 13, border: `1.5px dashed ${C.grey200}`, borderRadius: 12 }}>Aucun widget actif.</div>
                        ) : (() => {
                            // All widgets share the same CSS vars structure; show the first one with its values
                            const w = activeWidgets[0];
                            const spec = getWidgetIntegrationSpec(w);
                            const cssSnippet = `/* Injection du thème AnomalyIQ — à placer sur le conteneur parent */\n.erp-anomaly-container {\n${spec.cssVars.map(v => `  ${v.name}: ${v.value};`).join("\n")}\n}`;

                            return (
                                <>
                                    <InfoBox icon={<Info size={18} />} color="#0EA5E9" bg="rgba(14,165,233,.06)" border="rgba(14,165,233,.25)">
                                        Ces variables sont basées sur la configuration de <strong>{w.name}</strong> ({w.type}). Tous les widgets actifs partagent le même jeu de variables — il suffit de les injecter une fois sur le conteneur parent commun.
                                    </InfoBox>

                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                        <thead>
                                            <tr style={{ background: C.grey50 }}>
                                                {["Variable", "Valeur actuelle", "Aperçu", "Rôle"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: C.grey500, fontWeight: 700, fontSize: 11, borderBottom: `1px solid ${C.grey200}` }}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {spec.cssVars.map(v => (
                                                <tr key={v.name} style={{ borderBottom: `1px solid ${C.grey200}` }}>
                                                    <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 600, color: C.grey800, fontSize: 11 }}>{v.name}</td>
                                                    <td style={{ padding: "8px 12px", fontFamily: "monospace", color: C.grey500, fontSize: 11 }}>{v.value}</td>
                                                    <td style={{ padding: "8px 12px" }}>
                                                        {v.value.startsWith("#") || v.value.startsWith("rgb") ? (
                                                            <span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 5, background: v.value, border: `1px solid ${C.grey200}`, verticalAlign: "middle" }} />
                                                        ) : (
                                                            <span style={{ fontSize: 11, color: C.grey400, fontStyle: "italic" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: "8px 12px", color: C.grey500 }}>{v.desc}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <SubHead>Snippet CSS à intégrer</SubHead>
                                    <CodeBlock language="css" code={cssSnippet} onCopy={() => copy(cssSnippet, "css")} copied={copiedKey === "css"} />
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* ────────────────────────── JSON REPORT ──────────────────────────── */}
                {activeSection === "json" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <SectionHead icon={<FileJson size={16} />} title="Rapport JSON complet" subtitle="Export machine-readable de l'intégration. À transmettre à l'équipe technique ERP." />
                        {(() => {
                            const report = {
                                generatedAt: new Date().toISOString(),
                                apiVersion: "v1",
                                erp: {
                                    id: client.id,
                                    name: client.name,
                                    email: client.email,
                                    plan: client.plan,
                                    status: client.status,
                                },
                                infrastructure: {
                                    apiEndpoint: "https://api.anomalyiq.com",
                                    cdnScript: "https://cdn.anomalyiq.com/widgets.esm.js",
                                    authEndpoint: "https://api.anomalyiq.com/auth/sso-exchange",
                                },
                                widgets: activeWidgets.map(w => {
                                    const spec = getWidgetIntegrationSpec(w);
                                    return {
                                        id: w.id,
                                        name: w.name,
                                        type: w.type,
                                        status: w.status,
                                        tag: spec.tag,
                                        apiKey: w.apiKey,
                                        htmlAttributes: spec.allAttrs.reduce((acc, a) => ({ ...acc, [a.name]: a.value }), {}),
                                        jsProperties: spec.jsPropLines,
                                        apis: spec.apis.map(a => ({ method: a.method, path: a.path, auth: a.auth, params: a.params })),
                                        events: spec.events.map(e => ({ name: e.name, payload: e.payload, fields: e.fields })),
                                        config: w.config,
                                    };
                                }),
                            };
                            const json = JSON.stringify(report, null, 2);
                            return <CodeBlock language="json" code={json} onCopy={() => copy(json, "json")} copied={copiedKey === "json"} />;
                        })()}
                    </div>
                )}

                {/* ────────────────────────── FRAMEWORK EXAMPLES ───────────────────── */}
                {activeSection === "examples" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <SectionHead icon={<Code2 size={16} />} title="Exemples d'intégration" subtitle="Même widget intégré dans trois contextes: Angular, Vue et une application legacy Java Servlet/JSP." />

                        {activeWidgets.length === 0 ? (
                            <div style={{ padding: "24px", textAlign: "center", color: C.grey400, fontSize: 13, border: `1.5px dashed ${C.grey200}`, borderRadius: 12 }}>
                                Aucun widget actif. Activez un widget pour générer des exemples d'intégration.
                            </div>
                        ) : (() => {
                            const w = activeWidgets[0];
                            const spec = getWidgetIntegrationSpec(w);
                            const eventName = spec.events[0]?.name ?? "anomaly-ready";
                            const propLines = spec.jsPropLines
                                .flatMap(line => line.split("\n"))
                                .filter(line => !line.startsWith("const el = document.querySelector"));
                            const propSnippet = propLines.length ? propLines.join("\n") : `// Aucun objet JS obligatoire pour <${spec.tag}>.`;
                            const angularSnippet = [
                                "// src/app/anomaly-widget/anomaly-widget.component.ts",
                                "import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';",
                                "",
                                "@Component({",
                                "  selector: 'app-anomaly-widget',",
                                "  template: `",
                                `    <${spec.tag}`,
                                "      #widget",
                                `      api-key=\"${w.apiKey}\"`,
                                `      erp-id=\"${w.clientId}\"`,
                                `      endpoint=\"https://api.anomalyiq.com\"`,
                                ...spec.allAttrs.filter(a => !["api-key", "erp-id", "endpoint"].includes(a.name)).map(a => `      ${a.name}=\"${a.value}\"`),
                                `    ></${spec.tag}>`,
                                "  `,",
                                "})",
                                "export class AnomalyWidgetComponent implements AfterViewInit {",
                                "  @ViewChild('widget', { static: true }) widget!: ElementRef<HTMLElement>;",
                                "",
                                "  ngAfterViewInit() {",
                                "    const el = this.widget.nativeElement as any;",
                                `    el.addEventListener('${eventName}', (event: CustomEvent) => {`,
                                "      console.log('AnomalyIQ event', event.detail);",
                                "    });",
                                propLines.length ? "" : null,
                                ...propLines.map(line => `    ${line}`),
                                "  }",
                                "}",
                                "",
                                "// index.html",
                                scriptTag,
                            ].filter(Boolean).join("\n");

                            const vueSnippet = [
                                "<!-- AnomalyWidget.vue -->",
                                "<template>",
                                `  <${spec.tag}`,
                                `    ref=\"widgetRef\"`,
                                `    api-key=\"${w.apiKey}\"`,
                                `    erp-id=\"${w.clientId}\"`,
                                `    endpoint=\"https://api.anomalyiq.com\"`,
                                ...spec.allAttrs.filter(a => !["api-key", "erp-id", "endpoint"].includes(a.name)).map(a => `    ${a.name}=\"${a.value}\"`),
                                `  ></${spec.tag}>`,
                                "</template>",
                                "",
                                "<script setup>",
                                "import { onMounted, ref } from 'vue';",
                                "",
                                "const widgetRef = ref(null);",
                                "",
                                "onMounted(() => {",
                                "  const el = widgetRef.value;",
                                `  el.addEventListener('${eventName}', event => {`,
                                "    console.log('AnomalyIQ event', event.detail);",
                                "  });",
                                "",
                                propSnippet.split("\n").map(line => `  ${line}`).join("\n"),
                                "});",
                                "</script>",
                                "",
                                "<!-- public/index.html -->",
                                scriptTag,
                            ].join("\n");

                            const servletSnippet = [
                                "// WidgetServlet.java",
                                "protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {",
                                "  String ssoToken = exchangeErpSessionForAnomalyToken(req.getSession());",
                                `  req.setAttribute(\"apiKey\", \"${w.apiKey}\");`,
                                `  req.setAttribute(\"erpId\", \"${w.clientId}\");`,
                                "  req.setAttribute(\"token\", ssoToken);",
                                "  req.getRequestDispatcher(\"/WEB-INF/views/anomaly-widget.jsp\").forward(req, resp);",
                                "}",
                                "",
                                "<!-- /WEB-INF/views/anomaly-widget.jsp -->",
                                scriptTag,
                                `<${spec.tag}`,
                                "  api-key=\"${apiKey}\"",
                                "  erp-id=\"${erpId}\"",
                                "  token=\"${token}\"",
                                "  endpoint=\"https://api.anomalyiq.com\"",
                                ...spec.allAttrs.filter(a => !["api-key", "erp-id", "endpoint"].includes(a.name)).map(a => `  ${a.name}=\"${a.value}\"`),
                                `></${spec.tag}>`,
                                "",
                                "<script>",
                                `  var widget = document.querySelector('${spec.tag}');`,
                                ...propLines.map(line => `  ${line.replace(/^el\./, "widget.")}`),
                                `  widget.addEventListener('${eventName}', function(event) {`,
                                "    console.log('AnomalyIQ event', event.detail);",
                                "  });",
                                "</script>",
                            ].join("\n");

                            return (
                                <>
                                    <InfoBox icon={<Info size={18} />} color="#0EA5E9" bg="rgba(14,165,233,.06)" border="rgba(14,165,233,.25)">
                                        Les exemples ci-dessous utilisent <strong>{w.name}</strong> (<code>&lt;{spec.tag}&gt;</code>). Pour un autre widget, reprendre le tag, les attributs et les propriétés listés dans l'onglet Widgets.
                                    </InfoBox>

                                    {[
                                        { title: "Angular", language: "ts", code: angularSnippet, key: "example-angular" },
                                        { title: "Vue", language: "vue", code: vueSnippet, key: "example-vue" },
                                        { title: "Legacy Java Servlet / JSP", language: "java", code: servletSnippet, key: "example-servlet" },
                                    ].map(example => (
                                        <div key={example.key} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 14, padding: 16, background: C.white }}>
                                            <SubHead>{example.title}</SubHead>
                                            <CodeBlock language={example.language} code={example.code} onCopy={() => copy(example.code, example.key)} copied={copiedKey === example.key} />
                                        </div>
                                    ))}
                                </>
                            );
                        })()}
                    </div>
                )}

            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ErpOnboardingPage  — multi-step: select → configure → report
// ─────────────────────────────────────────────────────────────────────────────
const ErpOnboardingPage = ({ clientId }) => {
    const { getClient, getWidgetsByClient, addWidget } = useApp();
    const { navigate } = useRouter();
    const { toast } = useToast();
    const client = getClient(clientId);
    const widgets = getWidgetsByClient(clientId);
    const catalog = getWidgetCatalog();
    const [step, setStep] = useState(0); // 0=select, 1=configure, 2=report

    if (!client) return <div className="ds-empty">ERP introuvable.</div>;

    const addFromCatalog = item => {
        const widget = addWidget(client.id, item.name, item.type);
        toast({ title: "Widget ajouté à l'ERP", description: widget.name });
    };

    const steps = [
        { id: 0, label: "Sélection des widgets", icon: LayoutGrid },
        { id: 1, label: "Configuration & style", icon: Brush },
        { id: 2, label: "Rapport d'intégration", icon: ClipboardList },
    ];

    return (
        <div className="ds-fadein">
            <PageHeader
                back={{ to: `/clients/${client.id}`, label: client.name }}
                title="Onboarding"
                subtitle={`Guide d'intégration complet pour ${client.name}`}
            />

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28, background: C.white, border: `1.5px solid ${C.grey200}`, borderRadius: 14, padding: "4px", width: "fit-content" }}>
                {steps.map((s, i) => {
                    const StepIcon = s.icon;
                    return (
                    <React.Fragment key={s.id}>
                        <button onClick={() => setStep(s.id)} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                            background: step === s.id ? `linear-gradient(135deg, ${C.red}, ${C.redMid})` : "transparent",
                            color: step === s.id ? "#fff" : step > s.id ? C.grey700 : C.grey400,
                            fontSize: 13, fontWeight: 600, transition: "all .18s", whiteSpace: "nowrap",
                        }}>
                            {step > s.id ? <Check size={15} /> : <StepIcon size={15} />}
                            {s.label}
                        </button>
                        {i < steps.length - 1 && <span style={{ color: C.grey300, padding: "0 2px", fontSize: 12 }}>›</span>}
                    </React.Fragment>
                    );
                })}
            </div>

            {/* ── Step 0: Widget selection ── */}
            {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Card>
                        <SectionTitle>Catalogue de widgets disponibles</SectionTitle>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                            {catalog.map(item => {
                                const assigned = widgets.find(w => w.type === item.type);
                                const Icon = item.icon;
                                return (
                                    <div key={item.type} style={{
                                        border: `1.5px solid ${assigned ? "rgba(34,197,94,.35)" : C.grey200}`,
                                        borderRadius: 14, padding: "16px", background: assigned ? "rgba(34,197,94,.06)" : C.white,
                                        transition: "all .15s",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={16} color={item.color} /></div>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: C.grey900, margin: 0 }}>{item.name}</p>
                                        </div>
                                        <p style={{ fontSize: 11, color: C.grey400, minHeight: 32, marginBottom: 12, lineHeight: 1.5 }}>{item.description}</p>
                                        {assigned
                                            ? <div style={{ display: "flex", gap: 6 }}>
                                                <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 700 }}>✓ Ajouté</span>
                                                <button onClick={() => navigate(`/configurator/${assigned.id}`)} style={{ marginLeft: "auto", fontSize: 11, color: C.grey600, background: "none", border: `1px solid ${C.grey300}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Configurer →</button>
                                            </div>
                                            : <Btn style={{ width: "100%" }} onClick={() => addFromCatalog(item)}>+ Ajouter</Btn>
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Btn onClick={() => setStep(1)} disabled={widgets.length === 0}>
                            Configurer le style → ({widgets.length} widget{widgets.length !== 1 ? "s" : ""})
                        </Btn>
                    </div>
                </div>
            )}

            {/* ── Step 1: Configure ── */}
            {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Card>
                        <SectionTitle>Widgets configurés pour {client.name}</SectionTitle>
                        {widgets.length === 0
                            ? <div className="ds-empty">Aucun widget sélectionné. Retournez à l'étape 1.</div>
                            : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {widgets.map(w => {
                                        const meta = getWidgetMeta(w.type); const Icon = meta.icon;
                                        return (
                                            <div key={w.id} className="ds-row">
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${w.config.primaryColor}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                    <Icon size={16} color={w.config.primaryColor} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.grey900, margin: 0 }}>{w.name}</p>
                                                    <p style={{ fontSize: 10, color: C.grey400, fontFamily: "monospace", margin: "2px 0 0" }}>{w.config.webComponent ?? "—"} · {w.apiKey.slice(0, 20)}…</p>
                                                </div>
                                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                    {w.status === "active" ? <Badge variant="green">actif</Badge> : <Badge variant="yellow">pause</Badge>}
                                                    <Btn variant="ghost" onClick={() => navigate(`/configurator/${w.id}`)}>Configurer le design</Btn>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }
                    </Card>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Btn variant="ghost" onClick={() => setStep(0)}>← Retour</Btn>
                        <Btn onClick={() => setStep(2)} disabled={widgets.length === 0}>
                            Voir le rapport d'intégration →
                        </Btn>
                    </div>
                </div>
            )}

            {/* ── Step 2: Integration Report ── */}
            {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <IntegrationReport client={client} widgets={widgets} />
                    <div style={{ display: "flex", justifyContent: "flex-start", gap: 10 }}>
                        <Btn variant="ghost" onClick={() => setStep(1)}>← Retour à la configuration</Btn>
                        <Btn variant="ghost" onClick={() => navigate(`/clients/${client.id}`)}>Retour à l'ERP</Btn>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components used only in this file
// ─────────────────────────────────────────────────────────────────────────────

function SectionHead({ icon, title, subtitle }) {
    return (
        <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: C.grey900 }}>{title}</h3>
            </div>
            {subtitle && <p style={{ margin: 0, fontSize: 12, color: C.grey500, lineHeight: 1.5 }}>{subtitle}</p>}
        </div>
    );
}

function SubHead({ children }) {
    return (
        <p style={{ fontSize: 11, fontWeight: 800, color: C.grey500, textTransform: "uppercase", letterSpacing: ".6px", margin: "0 0 8px" }}>
            {children}
        </p>
    );
}

function CodeBlock({ code, language, onCopy, copied, compact = false }) {
    return (
        <div style={{ position: "relative" }}>
            <pre style={{
                background: C.grey900, borderRadius: 10, padding: compact ? "10px 14px" : "14px 48px 14px 16px",
                fontFamily: "monospace", fontSize: 11, lineHeight: 1.65,
                color: language === "json" ? "#86efac" : language === "css" ? "#c4b5fd" : "#93c5fd",
                overflowX: "auto", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>
                {code}
            </pre>
            <button onClick={onCopy} style={{
                position: "absolute", top: 8, right: 8,
                background: copied ? C.success : "rgba(255,255,255,.12)",
                border: "none", borderRadius: 7, padding: "5px 10px",
                fontSize: 11, color: "#fff", cursor: "pointer", transition: "all .15s", fontWeight: 600,
            }}>
                {copied ? "✓ Copié" : "Copier"}
            </button>
        </div>
    );
}

function InfoBox({ icon, color, bg, border, children }) {
    return (
        <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1, fontSize: 12, color, lineHeight: 1.5 }}>{children}</div>
        </div>
    );
}




const WidgetsPage = () => {
    const { widgets, clients, updateWidget, deleteWidget } = useApp();
    const { navigate } = useRouter();
    const { toast } = useToast();
    const [q, setQ] = useState("");
    const [clientFilter, setClientFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [open, setOpen] = useState(false);
    const [customCatalog, setCustomCatalog] = useState(readCustomWidgetCatalog);
    const [newDefinition, setNewDefinition] = useState({ name: "", webComponent: "", description: "", color: C.info });

    const filtered = useMemo(() => widgets.filter(w => {
        if (clientFilter !== "all" && w.clientId !== clientFilter) return false;
        if (statusFilter !== "all" && w.status !== statusFilter) return false;
        if (typeFilter !== "all" && w.type !== typeFilter) return false;
        if (q && !w.name.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
    }), [widgets, q, clientFilter, statusFilter, typeFilter]);

    const clientName = id => clients.find(c => c.id === id)?.name ?? "—";
    const catalog = [...widgetCatalog, ...customCatalog.map(w => ({ ...w, icon: Code2, color: w.color ?? C.info }))];
    const openCreateDefinition = () => {
        setNewDefinition({ name: "", webComponent: "", description: "", color: C.info });
        setOpen(true);
    };
    const createWidgetDefinition = () => {
        if (!newDefinition.name.trim() || !newDefinition.webComponent.trim()) return;
        const definition = {
            type: `custom-${genId()}`,
            name: newDefinition.name.trim(),
            description: newDefinition.description.trim() || "Widget SaaS custom",
            webComponent: newDefinition.webComponent.trim(),
            color: newDefinition.color,
        };
        const next = [definition, ...customCatalog];
        setCustomCatalog(next);
        writeCustomWidgetCatalog(next);
        toast({ title: "Widget SaaS créé", description: definition.name });
        setOpen(false);
    };

    return (
        <div className="ds-fadein">
            {open && <ModalPortal>
                <div className="ds-modal-backdrop" onClick={() => setOpen(false)}>
                    <div className="ds-modal ds-scalein" onClick={e => e.stopPropagation()}>
                        <h2>Nouveau widget SaaS</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div>
                                <Label>Nom du widget</Label>
                                <Input value={newDefinition.name} onChange={e => setNewDefinition({ ...newDefinition, name: e.target.value })} placeholder="Ex: Contrôle fournisseur" />
                            </div>
                            <div>
                                <Label>Web component tag</Label>
                                <Input value={newDefinition.webComponent} onChange={e => setNewDefinition({ ...newDefinition, webComponent: e.target.value })} placeholder="Ex: anomaly-supplier-risk" className="ds-mono" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea rows={2} value={newDefinition.description} onChange={e => setNewDefinition({ ...newDefinition, description: e.target.value })} placeholder="Ce que ce widget expose aux ERP" />
                            </div>
                            <div>
                                <Label>Couleur catalogue</Label>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <input type="color" value={newDefinition.color} onChange={e => setNewDefinition({ ...newDefinition, color: e.target.value })} style={{ width: 38, height: 34, borderRadius: 7, border: `1.5px solid ${C.grey200}`, cursor: "pointer", padding: 2 }} />
                                    <Input value={newDefinition.color} onChange={e => setNewDefinition({ ...newDefinition, color: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                            <Btn variant="ghost" onClick={() => setOpen(false)}>Annuler</Btn>
                            <Btn onClick={createWidgetDefinition} disabled={!newDefinition.name.trim() || !newDefinition.webComponent.trim()}>Créer le widget SaaS</Btn>
                        </div>
                    </div>
                </div>
            </ModalPortal>}

            <PageHeader
                title="Widgets"
                subtitle="Tous les widgets exposés aux ERP"
                actions={<Btn onClick={openCreateDefinition}><Plus size={14} /> Nouveau widget SaaS</Btn>}
            />

            <Card style={{ marginBottom: 16 }}>
                <SectionTitle>Catalogue SaaS ({catalog.length})</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                    {catalog.map(item => {
                        const Icon = item.icon;
                        return (
                            <div key={item.type} style={{ border: `1.5px solid ${C.grey200}`, borderRadius: 12, padding: "12px 14px", background: C.white }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={14} color={item.color} /></div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>{item.name}</p>
                                </div>
                                <p style={{ fontSize: 11, color: C.grey400 }}>{item.description}</p>
                                {item.webComponent && <p className="ds-mono" style={{ fontSize: 10, color: C.grey500, marginTop: 6 }}>{item.webComponent}</p>}
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
                        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.grey400 }} />
                        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" style={{ paddingLeft: 30 }} />
                    </div>
                    <DSSelect value={clientFilter} onValueChange={setClientFilter} className="ds-select">
                        <DSOption value="all">Tous les ERP</DSOption>
                        {clients.map(c => <DSOption key={c.id} value={c.id}>{c.name}</DSOption>)}
                    </DSSelect>
                    <DSSelect value={typeFilter} onValueChange={setTypeFilter} className="ds-select">
                        <DSOption value="all">Tous les types</DSOption>
                        {catalog.map(m => <DSOption key={m.type} value={m.type}>{m.name}</DSOption>)}
                    </DSSelect>
                    <DSSelect value={statusFilter} onValueChange={setStatusFilter} className="ds-select">
                        <DSOption value="all">Tous statuts</DSOption>
                        <DSOption value="active">Actifs</DSOption>
                        <DSOption value="paused">En pause</DSOption>
                    </DSSelect>
                </div>
            </Card>

            {filtered.length === 0
                ? <div className="ds-empty">Aucun widget trouvé.</div>
                : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                        {filtered.map(w => {
                            const meta = getWidgetMeta(w.type); const Icon = meta.icon; return (
                                <div key={w.id} className="ds-card ds-card-hover" style={{ padding: "16px 18px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${w.config.primaryColor}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <Icon size={16} color={w.config.primaryColor} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 13, color: C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</p>
                                            <button onClick={() => navigate(`/clients/${w.clientId}`)} style={{ fontSize: 11, color: C.grey400, background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                                {clientName(w.clientId)} <ExternalLink size={10} />
                                            </button>
                                        </div>
                                        {w.status === "active" ? <Badge variant="green">actif</Badge> : <Badge variant="yellow">pause</Badge>}
                                    </div>
                                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                                        <Badge variant="grey">{meta.name}</Badge>
                                    </div>
                                    <p className="ds-mono" style={{ fontSize: 10, color: C.grey400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 12 }}>{w.apiKey}</p>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <Btn variant="ghost" style={{ flex: 1, fontSize: 12, padding: "7px 10px" }} onClick={() => navigate(`/configurator/${w.id}`)}><Settings size={13} /> Configurer</Btn>
                                        <Btn variant="icon" onClick={() => { navigator.clipboard.writeText(w.apiKey); toast({ title: "API key copiée" }); }}><Copy size={13} /></Btn>
                                        <Btn variant="icon" onClick={() => updateWidget(w.id, { status: w.status === "active" ? "paused" : "active" })}>
                                            {w.status === "active" ? <PowerOff size={13} /> : <Power size={13} color={C.success} />}
                                        </Btn>
                                        <ConfirmDialog
                                            trigger={<Btn variant="icon"><Trash2 size={13} color={C.red} /></Btn>}
                                            title="Supprimer le widget ?"
                                            description={`"${w.name}" sera supprimé définitivement.`}
                                            onConfirm={() => { deleteWidget(w.id); toast({ title: "Widget supprimé" }); }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }
        </div>
    );
};

// ── Configurator page ─────────────────────────────────────────────────────────
const ConfiguratorPage = ({ widgetId }) => {
    const { widgets, getWidget, getClient, updateWidget, updateWidgetConfig } = useApp();
    const { navigate } = useRouter();
    const { toast } = useToast();
    const [previewToken, setPreviewToken] = useState(null);
    const [tab, setTab] = useState("design");

    useEffect(() => {
        const ctrl = new AbortController();
        api.ssoExchange(ctrl.signal).then(r => setPreviewToken(r.token)).catch(() => setPreviewToken(null));
        return () => ctrl.abort();
    }, []);

    if (!widgetId) {
        return (
            <div className="ds-fadein">
                <PageHeader title="Configurateur" subtitle="Sélectionnez un widget à configurer" />
                {widgets.length === 0
                    ? <div className="ds-empty">Aucun widget. <button onClick={() => navigate("/clients")} style={{ color: C.red, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Créer depuis un ERP</button></div>
                    : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                            {widgets.map(w => {
                                const client = getClient(w.clientId); const meta = getWidgetMeta(w.type); const Icon = meta.icon; return (
                                    <div key={w.id} className="ds-card ds-card-hover" style={{ padding: "16px 18px" }} onClick={() => navigate(`/configurator/${w.id}`)}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${w.config.primaryColor}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                <Icon size={16} color={w.config.primaryColor} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: 13, color: C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</p>
                                                <p style={{ fontSize: 11, color: C.grey400 }}>{meta.name} · {client?.name ?? "—"}</p>
                                            </div>
                                            <ChevronRight size={14} color={C.grey300} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </div>
        );
    }

    const widget = getWidget(widgetId);
    if (!widget) return <div className="ds-empty">Widget introuvable. <button onClick={() => navigate("/widgets")} style={{ color: C.red, background: "none", border: "none", cursor: "pointer" }}>Retour</button></div>;

    const client = getClient(widget.clientId);
    const meta = getWidgetMeta(widget.type);
    const setConfig = patch => updateWidgetConfig(widget.id, patch);

    const tagName = widget.config.webComponent ?? "anomaly-widget";
    const htmlSnippet = `<script type="module" src="https://cdn.anomalyiq.com/widgets.esm.js"></script>\n<${tagName}\n  api-key="${widget.apiKey}"\n  erp-id="${widget.clientId}"\n  endpoint="https://api.anomalyiq.com">\n</${tagName}>`;

    return (
        <div className="ds-fadein">
            <PageHeader
                back={client ? { to: `/clients/${client.id}`, label: client.name } : undefined}
                title={widget.name}
                subtitle={`Configurateur · ${client?.name ?? "—"}`}
                actions={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Input value={widget.name} onChange={e => updateWidget(widget.id, { name: e.target.value })} style={{ width: 200 }} />
                        {widget.status === "active" ? <Badge variant="green">actif</Badge> : <Badge variant="yellow">pause</Badge>}
                    </div>
                }
            />

            <div className="ds-tabs" style={{ marginBottom: 20, width: "fit-content" }}>
                {[{ id: "design", label: "Design", icon: Palette }, { id: "preview", label: "Aperçu", icon: Eye }, { id: "integration", label: "Intégration", icon: Code }].map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} className={cn("ds-tab", tab === t.id && "active")} onClick={() => setTab(t.id)}>
                            <Icon size={13} /> {t.label}
                        </button>
                    );
                })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {tab === "design" && (
                    <Card>
                        <SectionTitle>Configuration du design</SectionTitle>
                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <div>
                                <p className="ds-section-label">Thème du widget</p>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {Object.entries(ASKGO_THEME_PRESETS).map(([name, preset]) => (
                                        <button key={name} onClick={() => setConfig({ ...preset, themePreset: name })} style={{ padding: "7px 12px", borderRadius: 9, border: `1.5px solid ${widget.config.themePreset === name ? C.red : C.grey200}`, background: widget.config.themePreset === name ? C.redPale : C.white, color: widget.config.themePreset === name ? C.red : C.grey600, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="ds-divider" style={{ margin: "0" }} />
                            <div>
                                <p className="ds-section-label">Radius & typographie</p>
                                <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
                                    <div>
                                        <Label>Border radius</Label>
                                        <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                                            {["0px", "3px", "6px", "8px", "12px", "20px"].map(r => (
                                                <button key={r} onClick={() => setConfig({ borderRadius: r })} style={{ padding: "5px 9px", borderRadius: r, border: `1.5px solid ${widget.config.borderRadius === r ? C.red : C.grey200}`, background: widget.config.borderRadius === r ? C.redPale : C.white, color: widget.config.borderRadius === r ? C.red : C.grey500, fontSize: 11, cursor: "pointer" }}>{r}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 260 }}>
                                        <Label>Police des widgets</Label>
                                        <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                                            {WIDGET_FONT_OPTIONS.map(opt => (
                                                <button key={opt.value} onClick={() => setConfig({ fontFamily: opt.value, fontFamilyMono: opt.mono })} style={{ padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${widget.config.fontFamily === opt.value ? C.red : C.grey200}`, background: widget.config.fontFamily === opt.value ? C.redPale : C.white, color: widget.config.fontFamily === opt.value ? C.red : C.grey600, fontSize: 12, cursor: "pointer", fontFamily: opt.value }}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ds-divider" style={{ margin: "0" }} />
                            <div>
                                <p className="ds-section-label">Couleurs</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                    <div>
                                        <Label>Principale</Label>
                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                            <input type="color" value={widget.config.primaryColor} onChange={e => setConfig({ primaryColor: e.target.value })} style={{ width: 36, height: 34, borderRadius: 7, border: `1.5px solid ${C.grey200}`, cursor: "pointer", padding: 2 }} />
                                            <Input value={widget.config.primaryColor} onChange={e => setConfig({ primaryColor: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Accent</Label>
                                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                            <input type="color" value={widget.config.accentColor} onChange={e => setConfig({ accentColor: e.target.value })} style={{ width: 36, height: 34, borderRadius: 7, border: `1.5px solid ${C.grey200}`, cursor: "pointer", padding: 2 }} />
                                            <Input value={widget.config.accentColor} onChange={e => setConfig({ accentColor: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="ds-divider" style={{ margin: "0" }} />
                            <div>
                                <p className="ds-section-label">Contenu</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    <div><Label>Nom de l'ERP</Label><Input value={widget.config.companyName} onChange={e => setConfig({ companyName: e.target.value })} /></div>
                                    <div><Label>Note interne</Label><Textarea value={widget.config.welcomeMessage} onChange={e => setConfig({ welcomeMessage: e.target.value })} rows={2} /></div>
                                </div>
                            </div>
                            <div className="ds-divider" style={{ margin: "0" }} />
                            <div>
                                <p className="ds-section-label">Paramètres spécifiques</p>
                                <TypeConfigFields widget={widget} onChange={setConfig} />
                            </div>
                        </div>
                    </Card>
                )}

                {tab === "integration" && (
                    <Card>
                        <SectionTitle>Intégration — Web Component</SectionTitle>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <Label>API Key</Label>
                                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                    <Input value={widget.apiKey} readOnly className="ds-mono" style={{ fontSize: 11 }} />
                                    <Btn variant="icon" onClick={() => { navigator.clipboard.writeText(widget.apiKey); toast({ title: "API key copiée" }); }}><Copy size={13} /></Btn>
                                </div>
                            </div>
                            <div>
                                <Label>HTML / app ERP</Label>
                                <div style={{ position: "relative", marginTop: 4 }}>
                                    <pre className="ds-code">{htmlSnippet}</pre>
                                    <Btn variant="icon" style={{ position: "absolute", top: 8, right: 8 }} onClick={() => { navigator.clipboard.writeText(htmlSnippet); toast({ title: "Code copié" }); }}><Copy size={12} /></Btn>
                                </div>
                            </div>
                            <div style={{ background: `${C.info}0D`, border: `1.5px solid ${C.info}30`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <Zap size={16} color={C.info} style={{ marginTop: 1, flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 13, color: C.grey900, marginBottom: 4 }}>Web Component AnomalyIqWidgets</p>
                                    <p style={{ fontSize: 12, color: C.grey500, marginBottom: 10, lineHeight: 1.5 }}>L'ERP consomme ce composant avec son API key et ses pipelines configurés dans le SaaS.</p>
                                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                        {["Ask&Go", "ERP", "React / Vue", "HTML statique"].map(b => <Badge key={b} variant="blue">{b}</Badge>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                <Card>
                    <SectionTitle>Aperçu en temps réel</SectionTitle>
                    <div style={{ background: C.grey50, border: `1.5px solid ${C.grey200}`, borderRadius: 12, padding: 16 }}>
                        <WidgetPreview widget={widget} token={previewToken} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

// ── Sidebar navigation ────────────────────────────────────────────────────────
const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/clients", label: "ERP", icon: Users },
    { path: "/widgets", label: "Widgets", icon: LayoutGrid },
    { path: "/configurator", label: "Configurateur", icon: Puzzle },
];

const Sidebar = () => {
    const { path, navigate } = useRouter();
    const { clients, widgets } = useApp();
    const active = (p) => p === "/" ? path === "/" : path.startsWith(p);

    return (
        <aside className="ds-sidebar">
            <div className="ds-sidebar-logo">
                <div className="ds-logo-icon"><Zap size={16} color="#fff" /></div>
                <span className="ds-logo-text">AnomalyIqWidgets</span>
            </div>

            <nav className="ds-nav">
                <span className="ds-nav-section">Navigation</span>
                {navItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button key={item.path} className={cn("ds-nav-item", active(item.path) && "active")} onClick={() => navigate(item.path)}>
                            <Icon size={15} />
                            {item.label}
                        </button>
                    );
                })}

                <span className="ds-nav-section" style={{ marginTop: 16 }}>Raccourcis</span>
                {clients.slice(0, 3).map(c => (
                    <button key={c.id} className={cn("ds-nav-item", path === `/clients/${c.id}` && "active")} onClick={() => navigate(`/clients/${c.id}`)}>
                        <Avatar name={c.name} size={18} color={C.red} />
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>{c.name}</span>
                    </button>
                ))}
            </nav>

            <div className="ds-sidebar-footer">
                <div style={{ marginBottom: 10, padding: "6px 8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.grey400, marginBottom: 5 }}>
                        <span>Widgets actifs</span>
                        <span style={{ fontWeight: 600, color: C.grey600 }}>{widgets.filter(w => w.status === "active").length}/{widgets.length}</span>
                    </div>
                    <div style={{ height: 4, background: C.grey200, borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${C.red}, ${C.redMid})`, width: `${widgets.length ? (widgets.filter(w => w.status === "active").length / widgets.length) * 100 : 0}%`, transition: "width .3s" }} />
                    </div>
                </div>
                <div className="ds-user-pill">
                    <div className="ds-avatar">A</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: C.grey900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin</p>
                        <p style={{ fontSize: 10, color: C.grey400 }}>admin@anomalyiq.com</p>
                    </div>
                    <Settings size={13} color={C.grey400} style={{ cursor: "pointer", flexShrink: 0 }} />
                </div>
            </div>
        </aside>
    );
};

// ── Topbar ────────────────────────────────────────────────────────────────────
const Topbar = () => {
    const { path } = useRouter();
    const labels = {
        "/": "Dashboard", "/clients": "ERP", "/widgets": "Widgets", "/configurator": "Configurateur",
    };
    const label = Object.entries(labels).reverse().find(([p]) => path === "/" ? p === "/" : path.startsWith(p))?.[1] ?? "Page";

    return (
        <div className="ds-topbar">
            <div className="ds-topbar-breadcrumb">
                <span>AnomalyIqWidgets</span>
                <ChevronRight size={12} />
                <span className="ds-topbar-title">{label}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, animation: "none" }} />
                <span style={{ fontSize: 11, color: C.grey400, fontWeight: 500 }}>Tous les systèmes OK</span>
            </div>
        </div>
    );
};

// ── Router ────────────────────────────────────────────────────────────────────
const AppRouter = () => {
    const { path } = useRouter();
    const onboardingMatch = path.match(/^\/clients\/([^/]+)\/onboarding$/);
    const clientMatch = path.match(/^\/clients\/([^/]+)$/);
    const cfgMatch = path.match(/^\/configurator\/([^/]+)$/);

    if (path === "/") return <Dashboard />;
    if (path === "/clients") return <ClientsPage />;
    if (onboardingMatch) return <ErpOnboardingPage clientId={onboardingMatch[1]} />;
    if (clientMatch) return <ClientDetailPage clientId={clientMatch[1]} />;
    if (path === "/widgets") return <WidgetsPage />;
    if (path === "/configurator") return <ConfiguratorPage />;
    if (cfgMatch) return <ConfiguratorPage widgetId={cfgMatch[1]} />;
    return <div className="ds-empty"><h1 style={{ fontSize: 36, fontWeight: 700, color: C.grey300 }}>404</h1><p>Page introuvable.</p></div>;
};

// ── Root ──────────────────────────────────────────────────────────────────────
export default function WidgetsApp() {
    return (
        <RouterProvider>
            <AppProvider>
                <ToastProvider>
                    <GlobalStyle />
                    <div className="ds-root">
                        <Sidebar />
                        <div className="ds-main">
                            <Topbar />
                            <div className="ds-content">
                                <AppRouter />
                            </div>
                        </div>
                    </div>
                </ToastProvider>
            </AppProvider>
        </RouterProvider>
    );
}
