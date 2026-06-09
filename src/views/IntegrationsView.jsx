

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus, X, Tag, Plug, Network, Settings2, Calculator, Sparkles, CheckCircle2,
  ArrowLeft, ArrowRight, Database, GitBranch, ScanLine, ClipboardCheck,
  RefreshCw, Download, FlaskConical, TrendingUp, ChevronRight, ChevronDown,
  AlertCircle, Search, Link2, Maximize2, Minimize2, PanelRightClose, PanelRightOpen,
  Cpu, Layers, BarChart3, Eye, EyeOff, Zap, Filter, Table2, Map, GripVertical, Hash,
  Bot, MessageSquare, FileJson, Send, ChevronUp, Code2, RotateCcw, Wand2,
  Info, Check, ChevronLeft, Copy, Users, Globe, Upload, FileText, AlertTriangle,
  FileBarChart, Activity, Clock, CheckSquare, XCircle, Loader2, Play, ArrowUpRight
} from "lucide-react";
import {
  CONNECTOR_CONFIG,
  AUTH_FIELDS,
  PIPELINE_DEFS,
  GENERIC_SCHEMA,
  MOCK_SCHEMAS,
  DEMO_CONNECTORS,
  TABLE_PALETTE,
  BUDGET_PRESETS,
  ERD_OFFSETS,
  CUSTOM_PIPELINE_COLORS,
  WIZARD_STEPS,
  generateFakeRows,
  inferColType,
  buildWizardDataFromAnswers,
  getSchemaForUrl,
  CARD_W,
  MAX_COLS,
  PAD,
  CONNECTORS_TABLE,
  TENANT_CONNECTIONS_TABLE,
  PIPELINES_TABLE,
  buildApiSchema,
  buildCsvSchema,
  CSV_SOURCE_PRESETS,
  normalizeTableName,
} from "@/store/staticData";
import { useStore, visibleTenants, createPipelineStore } from "@/store/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/contexts/ToastContext";

/* ─── PALETTE ─────────────────────────────────────────────────────────────── */
const C = {
  red: "#D94F3D", redLight: "rgba(217,79,61,.1)", redBorder: "rgba(217,79,61,.22)",
  g900: "#111827", g800: "#1f2937", g700: "#374151", g600: "#4b5563",
  g500: "#6b7280", g400: "#9ca3af", g300: "#d1d5db", g200: "#e5e7eb",
  g100: "#f3f4f6", g50: "#f9fafb",
  success: "#22c55e", successLight: "rgba(34,197,94,.1)", successBorder: "rgba(34,197,94,.25)",
  info: "#3b82f6", infoLight: "rgba(59,130,246,.08)",
  warning: "#f59e0b", warningLight: "rgba(245,158,11,.08)",
  canvas: "#0d0d12", canvasSurface: "rgba(18,18,22,.96)", canvasBorder: "rgba(255,255,255,.08)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;}
.root{font-family:'DM Sans',sans-serif;color:#111827;background:#f2f0ed;min-height:100vh;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{display:flex;flex-direction:column;background:rgba(243,241,238,.98);box-shadow:0 40px 100px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.6);border-radius:22px;overflow:hidden;position:relative;}
.fade-up{animation:fadeUp .28s ease-out;}
.fade-in{animation:fadeIn .2s ease-out;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideInUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes slideInUpFull{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes bubblePop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes logSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.spin{animation:spin 1s linear infinite;}
.pulse{animation:pulse 1.5s ease-in-out infinite;}
.slide-in-right{animation:slideInRight .35s cubic-bezier(.34,1.56,.64,1);}
.slide-in-up{animation:slideInUp .3s ease-out;}
.slide-in-up-full{animation:slideInUpFull .4s cubic-bezier(.34,1,.64,1);}
.bubble-pop{animation:bubblePop .4s cubic-bezier(.34,1.56,.64,1);}
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;border:none;outline:none;white-space:nowrap;}
.btn-primary{background:linear-gradient(135deg,#D94F3D,#c84332);color:#fff;box-shadow:0 2px 10px rgba(217,79,61,.28);}
.btn-primary:hover{opacity:.9;transform:translateY(-1px);}
.btn-primary:active{transform:scale(.97);}
.btn-primary:disabled{opacity:.35;cursor:not-allowed;transform:none;}
.btn-ghost{background:rgba(255,255,255,.8);color:#374151;border:1px solid #e5e7eb;}
.btn-ghost:hover{background:#fff;border-color:#d1d5db;}
.btn-ghost:disabled{opacity:.4;cursor:not-allowed;}
.btn-ghost.active{background:rgba(217,79,61,.08);border-color:rgba(217,79,61,.3);color:#D94F3D;}
.btn-danger{background:rgba(239,68,68,.08);color:#dc2626;border:1px solid rgba(239,68,68,.2);}
.btn-danger:hover{background:rgba(239,68,68,.15);}
.label{font-size:10px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px;}
.input{width:100%;padding:9px 12px;border-radius:10px;border:1px solid #e5e7eb;background:rgba(255,255,255,.9);color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;}
.input:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.1);}
.input::placeholder{color:#9ca3af;}
.select{width:100%;padding:9px 12px;border-radius:10px;border:1px solid #e5e7eb;background:rgba(255,255,255,.9);color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;height:40px;cursor:pointer;}
.select:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.1);}
.card{background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:14px;padding:16px;}
.scroll{scrollbar-width:thin;scrollbar-color:#d1d5db transparent;}
.scroll::-webkit-scrollbar{width:4px;}
.scroll::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}
.mono{font-family:'JetBrains Mono',monospace;}
.serif{font-family:'Instrument Serif',serif;}
.tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;border:1.5px solid;}
.toggle{position:relative;width:38px;height:22px;flex-shrink:0;}
.toggle input{opacity:0;width:0;height:0;position:absolute;}
.toggle-track{position:absolute;inset:0;border-radius:99px;background:#d1d5db;cursor:pointer;transition:background .2s;}
.toggle input:checked + .toggle-track{background:#D94F3D;}
.toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:transform .2s;}
.toggle input:checked ~ .toggle-thumb{transform:translateX(16px);}
.chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;font-size:11px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:#1d4ed8;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .15s;}
.chip:hover{background:rgba(59,130,246,.15);}
.chip.selected{background:#1d4ed8;color:#fff;border-color:#1d4ed8;}
.section{border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:10px;}
.section-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,247,245,.9);cursor:pointer;user-select:none;}
.section-hdr:hover{background:rgba(217,79,61,.04);}
.section-body{padding:14px;background:#fff;}
.formula-drop{padding:10px 14px;border-radius:10px;border:2px dashed #e5e7eb;min-height:46px;display:flex;align-items:center;flex-wrap:wrap;gap:6px;transition:border-color .15s;}
.formula-tok{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:8px;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;border:1.5px solid;transition:all .15s;}
.formula-tok.col{background:rgba(59,130,246,.08);color:#1d4ed8;border-color:rgba(59,130,246,.3);}
.formula-tok.op{background:rgba(107,114,128,.08);color:#374151;border-color:#e5e7eb;}
.formula-tok.agg{background:rgba(217,79,61,.08);color:#D94F3D;border-color:rgba(217,79,61,.25);}
.op-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:rgba(107,114,128,.08);border:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#374151;cursor:pointer;transition:all .15s;}
.op-badge:hover{background:#e5e7eb;}
.tab-bar{display:flex;gap:2px;padding:3px;background:rgba(0,0,0,.06);border-radius:11px;}
.tab{padding:5px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;font-family:'DM Sans',sans-serif;transition:all .15s;}
.tab.active{background:#fff;color:#111827;box-shadow:0 1px 4px rgba(0,0,0,.1);}
.gen-table{width:100%;border-collapse:collapse;font-size:11px;}
.gen-table th{padding:7px 12px;background:rgba(248,247,245,.9);color:#6b7280;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e5e7eb;text-align:left;white-space:nowrap;}
.gen-table td{padding:6px 12px;border-bottom:1px solid rgba(0,0,0,.04);font-family:'JetBrains Mono',monospace;color:#374151;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gen-table tr:hover td{background:rgba(217,79,61,.03);}
.schema-btn{display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#a1a1aa;font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;white-space:nowrap;}
.schema-btn:hover{background:rgba(217,79,61,.15);border-color:rgba(217,79,61,.35);color:#fca5a5;}
.schema-btn.active{background:rgba(217,79,61,.22);border-color:rgba(217,79,61,.5);color:#fca5a5;}
.schema-toolbar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(13,13,18,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);position:relative;z-index:10;flex-shrink:0;}
.erd-table-card{position:absolute;background:rgba(16,16,20,.97);border:1px solid rgba(255,255,255,.09);border-radius:12px;width:192px;box-shadow:0 4px 20px rgba(0,0,0,.5);transition:border-color .2s,box-shadow .2s;overflow:hidden;cursor:grab;z-index:3;}
.erd-table-card:active{cursor:grabbing;}
.erd-table-card:hover{border-color:rgba(217,79,61,.5);box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 18px -4px rgba(217,79,61,.28);}
.erd-table-card.highlighted{border-color:rgba(217,79,61,.75);box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 26px -4px rgba(217,79,61,.45);}
.erd-search-bar{position:absolute;top:10px;left:10px;z-index:20;pointer-events:all;display:flex;align-items:center;gap:7px;background:rgba(13,13,18,.94);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:0 10px;height:30px;width:190px;}
.erd-search-input{background:transparent;border:none;outline:none;color:#e4e4e7;font-size:11px;font-family:'DM Sans',sans-serif;width:100%;}
.erd-search-input::placeholder{color:#52525b;}
.erd-zoom-controls{position:absolute;bottom:10px;left:10px;z-index:20;pointer-events:all;display:flex;flex-direction:column;gap:3px;}
.erd-zoom-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:rgba(13,13,18,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.09);border-radius:6px;color:#a1a1aa;font-size:13px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.erd-zoom-btn:hover{background:rgba(217,79,61,.2);border-color:rgba(217,79,61,.4);color:#fca5a5;}
.erd-sidebar-toggle{position:absolute;right:10px;top:10px;z-index:20;pointer-events:all;width:28px;height:28px;display:flex;align-items:center;justify-content:center;background:rgba(13,13,18,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);border-radius:7px;color:#a1a1aa;cursor:pointer;transition:all .15s;}
.erd-sidebar-toggle:hover{background:rgba(217,79,61,.2);border-color:rgba(217,79,61,.4);color:#fca5a5;}
.erd-sidebar-wrap{display:flex;flex-direction:column;gap:0;transition:width .25s cubic-bezier(.4,0,.2,1),opacity .2s;overflow:hidden;background:#0d0d12;}
.erd-sidebar-wrap.open{width:276px;opacity:1;padding:14px 0 0 14px;}
.erd-sidebar-wrap.closed{width:0;opacity:0;pointer-events:none;}
.rel-sidebar{background:rgba(13,13,18,.7);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden;}
.rel-sidebar-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,.035);border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;font-weight:800;color:#a1a1aa;letter-spacing:.08em;text-transform:uppercase;}
.rel-sidebar-count{padding:2px 8px;border-radius:99px;background:rgba(217,79,61,.18);border:1px solid rgba(217,79,61,.28);color:#fca5a5;font-size:9px;font-family:'JetBrains Mono',monospace;letter-spacing:0;text-transform:none;}
.rel-sidebar-item{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background .12s;}
.rel-sidebar-item:last-child{border-bottom:none;}
.rel-sidebar-item:hover{background:rgba(217,79,61,.08);}
.rel-sidebar-item.active{background:rgba(217,79,61,.12);}
.force-canvas-root{background:#0d0d12;border-radius:14px;overflow:hidden;position:relative;}
.graph-control-cluster{display:flex;align-items:center;gap:6px;border-left:1px solid rgba(255,255,255,.08);padding-left:10px;margin-left:2px;}
.force-canvas-root canvas{position:absolute;inset:0;width:100%;height:100%;}
.graph-btn{display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#a1a1aa;font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;white-space:nowrap;}
.graph-btn:hover{background:rgba(217,79,61,.15);border-color:rgba(217,79,61,.4);color:#fca5a5;}
.graph-btn.active{background:rgba(217,79,61,.2);border-color:rgba(217,79,61,.5);color:#fee2e2;}
.graph-panel{position:absolute;top:62px;right:12px;width:256px;z-index:20;background:rgba(13,13,18,.94);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;transition:transform .25s cubic-bezier(.34,1.56,.64,1);pointer-events:all;}
.graph-panel.closed{transform:translateX(280px);pointer-events:none;}
.graph-panel-header{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:8px;}
.graph-panel-body{padding:10px 12px;display:flex;flex-direction:column;gap:8px;max-height:400px;overflow-y:auto;}
.graph-panel-body::-webkit-scrollbar{width:3px;}
.graph-panel-body::-webkit-scrollbar-thumb{background:#3f3f46;border-radius:99px;}
.graph-legend{position:absolute;bottom:12px;left:12px;z-index:10;pointer-events:all;display:flex;align-items:center;gap:10px;background:rgba(13,13,18,.8);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:6px 10px;}
.graph-hint{position:absolute;bottom:12px;right:12px;z-index:10;pointer-events:none;font-size:10px;color:#52525b;font-family:'JetBrains Mono',monospace;}
.graph-minimap{position:absolute;bottom:40px;left:12px;z-index:10;pointer-events:none;border:1px solid rgba(255,255,255,.06);border-radius:7px;overflow:hidden;}
.budget-section{border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:12px;}
.budget-section-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,247,245,.8);cursor:pointer;user-select:none;transition:background .15s;}
.budget-section-hdr:hover{background:rgba(217,79,61,.04);}
.budget-section-body{padding:14px;background:#fff;}
.col-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);font-size:11px;font-family:'JetBrains Mono',monospace;color:#1d4ed8;cursor:pointer;transition:all .15s;}
.col-chip:hover{background:rgba(59,130,246,.15);}
.formula-node{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .15s;border:1.5px solid;}
.formula-node.col{background:rgba(59,130,246,.08);color:#1d4ed8;border-color:rgba(59,130,246,.3);}
.formula-node.op{background:rgba(107,114,128,.08);color:#374151;border-color:#e5e7eb;}
.formula-node.agg{background:rgba(217,79,61,.08);color:#D94F3D;border-color:rgba(217,79,61,.25);}
.formula-op-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:rgba(107,114,128,.1);border:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#374151;cursor:pointer;flex-shrink:0;transition:all .15s;}
.formula-op-badge:hover{background:#e5e7eb;}

/* ── FLOATING ACTION BAR (Save / Sync) ── */
@keyframes actionBarSlideUp{from{transform:translate(-50%,80px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
.wizard-action-bar{position:absolute;bottom:70px;left:50%;transform:translateX(-50%);z-index:200;display:flex;align-items:center;gap:8px;padding:9px 14px;background:rgba(255,255,255,.97);border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.08);animation:actionBarSlideUp .3s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;}
.action-bar-save{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(34,197,94,.10);color:#15803d;border:1px solid rgba(34,197,94,.24);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.action-bar-save:hover{background:rgba(34,197,94,.18);transform:translateY(-1px);}
.action-bar-sync{display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(59,130,246,.10);color:#1d4ed8;border:1px solid rgba(59,130,246,.24);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.action-bar-sync:hover{background:rgba(59,130,246,.18);transform:translateY(-1px);}
.action-bar-divider{width:1px;height:20px;background:#e5e7eb;}

/* ── VISUAL JOIN BUILDER ── */
.vj-canvas{display:flex;align-items:center;gap:0;overflow-x:auto;padding:16px;background:rgba(13,13,18,.04);border-radius:12px;border:1px solid #e5e7eb;min-height:90px;}
.vj-table-node{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;}
.vj-table-pill{display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:700;font-family:'JetBrains Mono',monospace;border:1.5px solid;cursor:default;}
.vj-connector{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;padding:0 4px;}
.vj-line{width:40px;height:2px;background:#e5e7eb;position:relative;}
.vj-line::before,.vj-line::after{content:'';position:absolute;top:50%;transform:translateY(-50%);width:0;height:0;}
.vj-line::after{right:-1px;border-top:4px solid transparent;border-bottom:4px solid transparent;border-left:6px solid #d1d5db;}
.vj-join-select{padding:4px 8px;border-radius:7px;border:1px solid rgba(217,79,61,.25);background:rgba(217,79,61,.06);color:#D94F3D;font-size:10px;font-weight:700;font-family:'JetBrains Mono',monospace;cursor:pointer;outline:none;}
.vj-on-input{min-width:160px;padding:5px 9px;border-radius:8px;border:1px solid #e5e7eb;background:#fff;font-size:10px;font-family:'JetBrains Mono',monospace;outline:none;color:#374151;}
.vj-on-input:focus{border-color:#D94F3D;}

/* ── GQL TENANT LINK SELECTOR ── */
.gql-tenant-wrap{position:relative;}
.gql-tenant-trigger{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:1.5px solid #e5e7eb;background:rgba(255,255,255,.9);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;min-height:40px;}
.gql-tenant-trigger:hover{border-color:rgba(59,130,246,.4);}
.gql-tenant-trigger.open{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);}
.gql-tenant-trigger.linked{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.04);}
.gql-tenant-dropdown{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1.5px solid rgba(59,130,246,.25);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);z-index:200;overflow:hidden;animation:slideInUp .15s ease-out;min-width:280px;}
.gql-search-row{padding:8px 12px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:7px;background:rgba(59,130,246,.03);}
.gql-search-input{flex:1;border:none;outline:none;font-size:12px;font-family:'DM Sans',sans-serif;color:#111827;background:transparent;}
.gql-opt{display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;transition:background .1s;border-bottom:1px solid rgba(0,0,0,.04);}
.gql-opt:last-child{border-bottom:none;}
.gql-opt:hover{background:rgba(59,130,246,.06);}
.gql-opt.sel{background:rgba(34,197,94,.05);}
.gql-opt-avatar{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;}
.gql-opt-name{font-size:12px;font-weight:600;color:#111827;}
.gql-opt-id{font-size:10px;font-family:'JetBrains Mono',monospace;color:#9ca3af;}

/* ── TENANT PROCESSING OVERLAY ── */
@keyframes processingPulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.3)}50%{box-shadow:0 0 0 6px rgba(59,130,246,0)}}
.tenant-processing-card{border-radius:12px;border:1.5px solid rgba(59,130,246,.35);background:rgba(59,130,246,.04);padding:16px;animation:processingPulse 2s ease-in-out infinite;}
.proc-log-line{font-size:10px;font-family:'JetBrains Mono',monospace;padding:2.5px 0;animation:logSlide .2s ease-out;display:flex;align-items:baseline;gap:6px;}
.proc-log-line .ts{color:#9ca3af;flex-shrink:0;}
.proc-log-line .ok{color:#16a34a;}
.proc-log-line .info{color:#3b82f6;}
.proc-log-line .warn{color:#b45309;}
.proc-log-line .err{color:#dc2626;}
.proc-progress{height:5px;border-radius:99px;background:#e5e7eb;overflow:hidden;margin:8px 0;}
.proc-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#3b82f6,#6366f1);transition:width .5s ease-out;}

/* ── REPORT MODAL ── */
@keyframes reportIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.report-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);z-index:9995;display:flex;align-items:stretch;justify-content:flex-end;padding:0;overflow:hidden;}
.report-modal{background:#f8f7f5;border-radius:0;width:min(920px,calc(100vw - 42px));height:100vh;min-height:0;flex-shrink:0;display:flex;flex-direction:column;box-shadow:-28px 0 80px rgba(0,0,0,.28);animation:reportDrawerIn .28s cubic-bezier(.34,1,.64,1);overflow:hidden;}
@keyframes reportDrawerIn{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:translateX(0)}}
.report-hdr{padding:20px 28px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;min-height:72px;}
.report-body{flex:1 1 0px;min-height:0;overflow-y:auto;overflow-x:hidden;padding:20px 28px;display:flex;flex-direction:column;gap:16px;}
.report-body>*{flex-shrink:0;}
.report-body::-webkit-scrollbar{width:4px;}
.report-body::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}
.report-section{background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;}
.report-section-hdr{padding:12px 18px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:10px;}
.report-log-line{font-size:11px;font-family:'JetBrains Mono',monospace;padding:6px 18px;border-bottom:1px solid rgba(0,0,0,.03);display:flex;align-items:baseline;gap:10px;}
.report-log-line:last-child{border-bottom:none;}
.rl-ts{color:#9ca3af;flex-shrink:0;font-size:10px;}
.rl-ok{color:#16a34a;}
.rl-info{color:#3b82f6;}
.rl-warn{color:#b45309;}
.rl-err{color:#dc2626;}
.stat-card-sm{flex:1;padding:14px 16px;background:rgba(248,247,245,.8);border-radius:12px;border:1px solid #e5e7eb;text-align:center;}
.report-copy-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;background:#f3f4f6;border:1px solid #e5e7eb;color:#374151;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
.report-copy-btn:hover{background:#e5e7eb;}
.tenant-report-row{display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid rgba(0,0,0,.04);}
.tenant-report-row:last-child{border-bottom:none;}
.pl-badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600;}

/* ── CHAT BUBBLE ── */
.asst-fab{position:fixed;bottom:24px;right:24px;z-index:10001;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#D94F3D,#b83328);box-shadow:0 6px 28px rgba(217,79,61,.45),0 2px 8px rgba(0,0,0,.2);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;animation:bubblePop .4s cubic-bezier(.34,1.56,.64,1);}
body.integration-graph-fullscreen .asst-fab{display:none;}
.asst-fab:hover{transform:scale(1.08);box-shadow:0 8px 36px rgba(217,79,61,.6);}
.asst-fab-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#16a34a;border:2.5px solid #f2f0ed;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;}
.asst-tooltip{position:absolute;right:70px;top:50%;transform:translateY(-50%);background:#111827;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;padding:6px 12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity .2s;font-family:'DM Sans',sans-serif;}
.asst-fab:hover .asst-tooltip{opacity:1;}
.asst-tooltip::after{content:'';position:absolute;left:100%;top:50%;transform:translateY(-50%);border:5px solid transparent;border-left-color:#111827;}

/* ── CHAT POPUP ── */
.asst-popup{position:fixed;bottom:96px;right:24px;z-index:10001;width:400px;max-height:600px;background:#fff;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.07);display:flex;flex-direction:column;overflow:hidden;animation:slideInUp .3s cubic-bezier(.34,1.2,.64,1);}
.asst-popup-hdr{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#D94F3D,#b83328);flex-shrink:0;}
.asst-popup-body{flex:1;overflow-y:auto;min-height:0;}
.asst-popup-body::-webkit-scrollbar{width:3px;}
.asst-popup-body::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}

/* ── FULLSCREEN ASSISTANT ── */
.asst-fs{position:fixed;inset:0;z-index:10100;background:#f7f6f3;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;}
.asst-fs-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:#fff;border-bottom:1px solid #e5e7eb;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.asst-fs-body{flex:1;display:flex;min-height:0;overflow:hidden;}
.asst-fs-sidebar{width:200px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;padding:16px 10px;gap:3px;overflow-y:auto;}
.asst-fs-main{flex:1;display:flex;flex-direction:column;min-width:0;background:#f7f6f3;overflow:hidden;}
.asst-prog-rail{height:3px;background:#e5e7eb;flex-shrink:0;}
.asst-prog-fill{height:100%;background:linear-gradient(90deg,#D94F3D,#f97316);transition:width .4s ease-out;}
.asst-ss{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:default;border:1.5px solid transparent;}
.asst-ss.active{background:rgba(217,79,61,.08);border-color:rgba(217,79,61,.2);}
.asst-sn{width:24px;height:24px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border:1.5px solid #e5e7eb;font-size:9px;font-weight:700;color:#9ca3af;}
.asst-ss.done .asst-sn{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:#16a34a;}
.asst-ss.active .asst-sn{background:rgba(217,79,61,.1);border-color:rgba(217,79,61,.3);color:#D94F3D;}
.asst-chat-wrap{flex:1;overflow-y:auto;padding:24px 0;}
.asst-chat-wrap::-webkit-scrollbar{width:3px;}
.asst-chat-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
.asst-chat-inner{max-width:680px;width:100%;margin:0 auto;padding:0 28px;display:flex;flex-direction:column;gap:16px;}
.asst-msg-bot{display:flex;gap:10px;align-items:flex-start;}
.asst-msg-user{display:flex;gap:10px;align-items:flex-start;flex-direction:row-reverse;}
.asst-bb{background:#fff;border:1.5px solid #e5e7eb;border-radius:4px 16px 16px 16px;padding:13px 17px;font-size:13.5px;color:#374151;line-height:1.65;max-width:520px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
.asst-bu{background:linear-gradient(135deg,#D94F3D,#c84332);border-radius:16px 4px 16px 16px;padding:11px 15px;font-size:13px;color:#fff;line-height:1.6;max-width:420px;}
.asst-opt{display:flex;align-items:center;gap:10px;padding:11px 15px;border-radius:12px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:13px;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;transition:all .15s;width:100%;margin-bottom:5px;box-shadow:0 1px 3px rgba(0,0,0,.05);}
.asst-opt:hover{border-color:rgba(217,79,61,.4);background:rgba(217,79,61,.04);color:#D94F3D;}
.asst-typing{display:flex;gap:5px;padding:13px 17px;background:#fff;border:1.5px solid #e5e7eb;border-radius:4px 16px 16px 16px;width:fit-content;box-shadow:0 1px 4px rgba(0,0,0,.05);}
.asst-typing span{width:7px;height:7px;border-radius:50%;background:#d1d5db;display:block;animation:asstDot 1.2s ease-in-out infinite;}
.asst-typing span:nth-child(2){animation-delay:.2s;}
.asst-typing span:nth-child(3){animation-delay:.4s;}
@keyframes asstDot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-5px)}}
@keyframes asstSlideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.asst-anim{animation:asstSlideUp .22s ease-out;}
.asst-input-bar{display:flex;padding:12px 28px;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0;}
.asst-input-bar-inner{max-width:680px;width:100%;margin:0 auto;display:flex;gap:10px;}
.asst-ti{flex:1;padding:11px 16px;border-radius:12px;border:1.5px solid #e5e7eb;background:#f9fafb;font-size:13px;font-family:'DM Sans',sans-serif;color:#111827;outline:none;transition:border-color .15s;}
.asst-ti:focus{border-color:#D94F3D;background:#fff;box-shadow:0 0 0 3px rgba(217,79,61,.08);}
.asst-ti::placeholder{color:#9ca3af;}
.asst-sb{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#D94F3D,#c84332);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s;flex-shrink:0;}
.asst-sb:hover{transform:scale(1.06);}
.asst-sb:disabled{opacity:.35;cursor:not-allowed;transform:none;}
.asst-chip-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
.asst-chip{padding:6px 12px;border-radius:9px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .15s;}
.asst-chip.sel{border-color:rgba(217,79,61,.4);background:rgba(217,79,61,.07);color:#D94F3D;}
.asst-chip:hover{border-color:rgba(217,79,61,.3);}
.asst-pbtn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:linear-gradient(135deg,#D94F3D,#c84332);color:#fff;box-shadow:0 3px 12px rgba(217,79,61,.25);transition:all .15s;}
.asst-pbtn:hover{opacity:.9;transform:translateY(-1px);}
.asst-pbtn:disabled{opacity:.3;cursor:not-allowed;transform:none;}
.asst-gbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;background:#fff;border:1.5px solid #e5e7eb;color:#374151;transition:all .15s;}
.asst-gbtn:hover{background:#f9fafb;border-color:#d1d5db;}
.asst-form-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
.asst-form-wrap::-webkit-scrollbar{width:3px;}
.asst-form-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
.asst-fsec{margin-bottom:20px;background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}
.asst-fsec-hdr{display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f9fafb;border-bottom:1px solid #e5e7eb;}
.asst-fsec-body{padding:16px;display:flex;flex-direction:column;gap:12px;}
.asst-frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.asst-flabel{font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:6px;}
.asst-fi{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .15s;box-sizing:border-box;}
.asst-fi:focus{border-color:#D94F3D;background:#fff;box-shadow:0 0 0 3px rgba(217,79,61,.07);}
.asst-fi::placeholder{color:#9ca3af;}
.asst-fsel{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;height:40px;cursor:pointer;box-sizing:border-box;}
.asst-fsel:focus{border-color:#D94F3D;}
.asst-report-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
.asst-report-wrap::-webkit-scrollbar{width:3px;}
.asst-report-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
.asst-jblock{background:#1e1e2e;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;}
.asst-jtbar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);}
.asst-jcontent{padding:18px 20px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.9;overflow-x:auto;white-space:pre;}
.asst-jkey{color:#7dd3fc;}
.asst-jstr{color:#86efac;}
.asst-jnum{color:#fde68a;}
.asst-jbool{color:#f9a8d4;}
.asst-jnull{color:#52525b;}
.asst-jbrace{color:#a78bfa;}
.asst-cpbtn{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
.asst-cpbtn:hover{background:rgba(255,255,255,.1);color:#e5e7eb;}
.json-import-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
.json-import-wrap::-webkit-scrollbar{width:3px;}
.json-import-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
.json-textarea{width:100%;min-height:260px;padding:14px;border-radius:12px;border:1.5px solid #e5e7eb;background:#1e1e2e;color:#86efac;font-size:12px;font-family:'JetBrains Mono',monospace;outline:none;resize:vertical;line-height:1.7;}
.json-textarea:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.07);}
.score-bar{height:8px;border-radius:99px;background:#e5e7eb;overflow:hidden;margin:8px 0;}
.score-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.34,1.2,.64,1);}
.mode-tabs{display:flex;gap:3px;padding:4px;background:#f3f4f6;border-radius:12px;border:1px solid #e5e7eb;}
.mode-tab{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:none;background:transparent;color:#6b7280;cursor:pointer;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;transition:all .15s;}
.mode-tab.active{background:#fff;color:#D94F3D;box-shadow:0 1px 4px rgba(0,0,0,.1);}
`;

/* ─── UTILS ─────────────────────────────────────────────────── */
function buildReport(a) {
  const d = buildWizardDataFromAnswers(a);
  const authDetails = {};
  ["username", "apiKey", "apiKeyHeader", "clientId", "tokenUrl", "scopes", "publicKey", "issuer", "audience", "algorithm", "entityId", "ssoUrl"].forEach(k => { if (d[k]) authDetails[k] = d[k]; });
  return {
    identity: { name: d.name, connectorType: d.connectorType, authType: d.authType, logo: d.logo, color: d.color, description: d.description },
    authentication: authDetails,
    connection: { type: d.connectionType, jdbcUrl: d.jdbcUrl, jdbcUsername: d.jdbcUsername, jdbcPassword: d.jdbcPassword ? "***" : "", apiEndpoint: d.apiEndpoint, apiResources: d.apiResources || [], csvFiles: d.csvFiles || [] },
    tables: { selected: d.selectedTables, budgetSources: d.budgetSourceTables },
    pipelines: {
      factures: { enabled: true, sourceTables: d.pipelines.facture.tables, fieldMappings: d.pipelines.facture.fieldMappings },
      commandes: { enabled: true, sourceTables: d.pipelines.commande.tables, groupBy: d.pipelines.commande.groupByCols }
    },
    budget: { formula: d.budgetFormula },
    tenants: d.tenants.map(t => t.id),
  };
}

function computeScore(report) {
  let s = 0;
  if (report?.identity?.name) s += 15;
  if (report?.connection?.jdbcUrl) s += 15;
  if ((report?.tables?.selected || []).length > 0) s += 20;
  if ((report?.tables?.budgetSources || []).length > 0) s += 10;
  if ((report?.tenants || []).length > 0) s += 15;
  if (report?.authentication && Object.keys(report.authentication).length > 0) s += 10;
  if ((report?.pipelines?.factures?.sourceTables || []).length > 0) s += 10;
  if ((report?.pipelines?.commandes?.sourceTables || []).length > 0) s += 5;
  return Math.min(100, s);
}

/* ─── PROCESSING SIMULATION ─────────────────────────────────── */
function generateProcessingLogs(tenantId, pipelines = ["Factures", "Commandes"]) {
  const pipelineList = Array.isArray(pipelines)
    ? pipelines.filter(Boolean)
    : Object.keys(pipelines || {}).filter(key => pipelines[key]?.enabled !== false);
  const now = new Date();
  const ts = (offsetMs) => {
    const d = new Date(now.getTime() + offsetMs);
    return d.toTimeString().slice(0, 8);
  };
  const logs = [
    { time: ts(0), type: "info", text: `Initialisation du tenant ${tenantId}` },
    { time: ts(300), type: "info", text: "Connexion JDBC établie" },
    { time: ts(600), type: "ok", text: "Authentification réussie" },
    { time: ts(900), type: "info", text: `Découverte des tables (${Math.floor(Math.random() * 8) + 4} tables)` },
    { time: ts(1200), type: "ok", text: "Schéma analysé avec succès" },
  ];
  pipelineList.forEach((pl, i) => {
    const base = 1500 + i * 1800;
    logs.push({ time: ts(base), type: "info", text: `Pipeline ${pl} → démarrage` });
    logs.push({ time: ts(base + 400), type: "ok", text: `Pipeline ${pl} → mapping validé` });
    const count = Math.floor(Math.random() * 2000) + 200;
    const anomalies = Math.floor(Math.random() * 12);
    logs.push({ time: ts(base + 900), type: "ok", text: `Pipeline ${pl} → ${count} enregistrements importés` });
    if (anomalies > 0) logs.push({ time: ts(base + 1100), type: "warn", text: `Pipeline ${pl} → ${anomalies} anomalie(s) détectée(s)` });
    logs.push({ time: ts(base + 1300), type: "ok", text: `Pipeline ${pl} → pipeline actif` });
  });
  logs.push({ time: ts(1500 + pipelineList.length * 1800), type: "ok", text: "Budget initialisé — prévisions moteur actives" });
  logs.push({ time: ts(1800 + pipelineList.length * 1800), type: "ok", text: `Tenant ${tenantId} entièrement activé ✓` });
  return logs;
}

/* ─── Q&A FLOW ─────────────────────────────────────────────── */
const AUTH_DETAIL_QUESTIONS = {
  BASIC: [
    { id: "qa_basic_user", type: "text", key: "username", bot: () => "Quel est le nom d'utilisateur ?", placeholder: "ex: erp_user", next: "qa_basic_pw" },
    { id: "qa_basic_pw", type: "text", key: "password", bot: () => "Mot de passe ?", placeholder: "••••••••", next: "q_conn" },
  ],
  API_KEY: [
    { id: "qa_apikey", type: "text", key: "apiKey", bot: () => "Quelle est votre clé API ?", placeholder: "sk-xxxx...", next: "qa_apikey_header" },
    { id: "qa_apikey_header", type: "text", key: "apiKeyHeader", bot: () => "Nom du header HTTP pour la clé ? (ex: X-API-Key)", placeholder: "X-API-Key", next: "q_conn" },
  ],
  OAUTH2: [
    { id: "qa_oauth_id", type: "text", key: "clientId", bot: () => "Client ID OAuth2 ?", placeholder: "client_id_xxx", next: "qa_oauth_secret" },
    { id: "qa_oauth_secret", type: "text", key: "clientSecret", bot: () => "Client Secret ?", placeholder: "••••••••", next: "qa_oauth_url" },
    { id: "qa_oauth_url", type: "text", key: "tokenUrl", bot: () => "URL du token endpoint ?", placeholder: "https://auth.example.com/oauth/token", next: "q_conn" },
  ],
  JWT_SIGNED: [
    { id: "qa_jwt_key", type: "text", key: "publicKey", bot: () => "Clé publique PEM :", placeholder: "-----BEGIN PUBLIC KEY-----", next: "qa_jwt_issuer" },
    { id: "qa_jwt_issuer", type: "text", key: "issuer", bot: () => "Issuer JWT ?", placeholder: "https://your-domain.com", next: "qa_jwt_algo" },
    { id: "qa_jwt_algo", type: "choice", key: "algorithm", bot: () => "Algorithme de signature ?", options: [{ label: "RS256", value: "RS256" }, { label: "RS512", value: "RS512" }, { label: "ES256", value: "ES256" }, { label: "HS256", value: "HS256" }], next: "q_conn" },
  ],
  SAML: [
    { id: "qa_saml_entity", type: "text", key: "entityId", bot: () => "Entity ID SAML ?", placeholder: "https://erp.example.com/saml/metadata", next: "qa_saml_sso" },
    { id: "qa_saml_sso", type: "text", key: "ssoUrl", bot: () => "URL SSO SAML ?", placeholder: "https://idp.example.com/sso", next: "q_conn" },
  ],
  NONE: [],
};

function buildQAFlow() {
  const base = [
    { id: "start", type: "mode_pick", bot: "Bonjour ! 👋 Je suis votre assistant ERP. Comment souhaitez-vous configurer ce connecteur ?", options: [{ label: "💬 Questions / Réponses guidées", desc: "Je vous guide étape par étape", value: "qa" }, { label: "📋 Formulaire structuré", desc: "Toutes les sections en une page", value: "form" }, { label: "📄 Import JSON", desc: "Collez votre config JSON existante", value: "json" }] },
    { id: "q_name", type: "text", key: "name", bot: "Quel est le nom de ce connecteur ERP ?", placeholder: "ex: SAP Production France", next: "q_type" },
    { id: "q_type", type: "choice", key: "connectorType", bot: (a) => `Super, «${a.name || "ce système"}». Quel type ?`, options: [{ label: "🏭 ERP (SAP, Sage, Odoo…)", value: "ERP" }, { label: "🗄️ Source de données SQL", value: "DATA_SOURCE" }, { label: "📊 Comptabilité standalone", value: "ACCOUNTING" }], next: "q_auth" },
    { id: "q_auth", type: "choice", key: "authType", bot: () => "Quel mode d'authentification utilise ce système ?", options: [{ label: "👤 Basic (user / mot de passe)", value: "BASIC" }, { label: "🔑 API Key", value: "API_KEY" }, { label: "🔐 OAuth 2.0", value: "OAUTH2" }, { label: "📜 JWT Signé", value: "JWT_SIGNED" }, { label: "🔏 SAML 2.0", value: "SAML" }, { label: "🚫 Aucune", value: "NONE" }], nextFn: (val) => { const d = AUTH_DETAIL_QUESTIONS[val] || []; return d.length > 0 ? d[0].id : "q_conn"; } },
    ...AUTH_DETAIL_QUESTIONS.BASIC,
    ...AUTH_DETAIL_QUESTIONS.API_KEY,
    ...AUTH_DETAIL_QUESTIONS.OAUTH2,
    ...AUTH_DETAIL_QUESTIONS.JWT_SIGNED,
    ...AUTH_DETAIL_QUESTIONS.SAML,
    { id: "q_conn", type: "choice", key: "connectionType", bot: () => "Comment se connecter à la base de données ?", options: [{ label: "🔗 JDBC (base SQL directe)", value: "jdbc" }, { label: "🌐 API REST", value: "api" }, { label: "📁 Fichier CSV / Excel", value: "csv" }], next: "q_jdbc" },
    { id: "q_jdbc", type: "text", key: "jdbcUrl", bot: () => "URL JDBC de connexion ?", placeholder: "jdbc:postgresql://host:5432/erp_db", condition: (d) => d.connectionType === "jdbc", next: "q_tables" },
    { id: "q_tables", type: "multi_schema", key: "selectedTables", bot: (a, s) => s ? `Quelles tables importer ? (${s.tables.length} disponibles)` : "Listez les tables séparées par des virgules.", next: "q_pl_facture" },
    { id: "q_pl_facture", type: "pipeline_facture", key: "factureMappings", bot: () => "Configurons le pipeline Factures. Mappez les colonnes requises :", next: "q_pl_commande" },
    { id: "q_pl_commande", type: "pipeline_commande", key: "commandeGroupBy", bot: () => "Pipeline Commandes : quelles colonnes pour le Group By ? (optionnel)", next: "q_budget_tables" },
    { id: "q_budget_tables", type: "choice_dynamic", key: "budgetSourceTables", bot: () => "Quelle table contient les données budgétaires ?", next: "q_budget_formula" },
    { id: "q_budget_formula", type: "choice", key: "budgetFormulaType", bot: () => "Formule budgétaire à utiliser ?", options: [{ label: "Standard (Alloué − Consommé)", value: "standard" }, { label: "Avec engagements (Alloué − Engagé − Consommé)", value: "engaged" }, { label: "Personnalisée", value: "custom" }], next: "q_tenants" },
    { id: "q_tenants", type: "text", key: "_tenantsRaw", bot: () => "IDs tenants (clients) séparés par des virgules :", placeholder: "CLIENT_001, CLIENT_002", next: "q_done" },
    { id: "q_done", type: "done", bot: (a) => `✅ Configuration complète pour «${a.name || "votre ERP"}» ! Cliquez pour voir le rapport JSON.` },
  ];
  return base;
}

const QA_FLOW = buildQAFlow();
const QA_SIDEBAR_STEPS = [
  { id: "q_name", label: "Nom" }, { id: "q_type", label: "Type" }, { id: "q_auth", label: "Auth" },
  { id: "q_conn", label: "Connexion" }, { id: "q_jdbc", label: "URL JDBC" }, { id: "q_tables", label: "Tables" },
  { id: "q_pl_facture", label: "Pipeline Factures" }, { id: "q_pl_commande", label: "Pipeline Commandes" },
  { id: "q_budget_tables", label: "Budget" }, { id: "q_alerts", label: "Alertes" },
  { id: "q_tenants", label: "Tenants" }, { id: "q_done", label: "Rapport" },
];

/* ─── BASE COMPONENTS ────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

function InfoBox({ color = C.info, children }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 10, background: `${color}12`, border: `1px solid ${color}30` }}>
      <p style={{ fontSize: 11, color, lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

function SectionAccordion({ icon, title, subtitle, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-hdr" onClick={() => setOpen(p => !p)}>
        {icon && <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(217,79,61,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>{subtitle}</div>}
        </div>
        <span style={{ color: C.g400, transition: "transform .2s", display: "inline-block", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
          <ChevronDown size={14} />
        </span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

/* ─── VISUAL JOIN BUILDER ─────────────────────────────────────── */
function VisualJoinBuilder({ tables, joins, onChange }) {
  if (tables.length < 2) return null;
  const palette = [
    { bg: "rgba(217,79,61,.1)", border: "rgba(217,79,61,.35)", text: C.red },
    { bg: "rgba(59,130,246,.1)", border: "rgba(59,130,246,.35)", text: "#1d4ed8" },
    { bg: "rgba(34,197,94,.1)", border: "rgba(34,197,94,.35)", text: "#15803d" },
    { bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.35)", text: "#92400e" },
    { bg: "rgba(139,92,246,.1)", border: "rgba(139,92,246,.35)", text: "#6d28d9" },
  ];

  const getJoin = idx => (joins || [])[idx] || { type: "INNER", table: tables[idx + 1], on: "" };
  const updateJoin = (idx, field, val) => {
    const next = [...(joins || [])];
    while (next.length <= idx) next.push({ type: "INNER", table: "", on: "" });
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const JOIN_TYPES = ["INNER", "LEFT", "RIGHT", "FULL"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "16px 20px", background: "rgba(13,13,18,.04)", borderRadius: 12, border: "1px solid #e5e7eb", overflowX: "auto" }}>
        {tables.map((tname, i) => {
          const col = palette[i % palette.length];
          return (
            <div key={tname} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {i > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, margin: "0 10px" }}>
                  <div style={{ display: "flex", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(217,79,61,.25)" }}>
                    {JOIN_TYPES.map(jt => (
                      <button key={jt} onClick={() => updateJoin(i - 1, "type", jt)} style={{ padding: "3px 7px", fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", background: getJoin(i - 1).type === jt ? "rgba(217,79,61,.18)" : "transparent", color: getJoin(i - 1).type === jt ? C.red : C.g400, border: "none", cursor: "pointer", borderLeft: jt !== JOIN_TYPES[0] ? "1px solid rgba(217,79,61,.18)" : "none", transition: "all .12s" }}>
                        {jt}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 28, height: 1.5, background: "#d1d5db" }} />
                    <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: "5px solid #d1d5db" }} />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: 10, background: col.bg, border: `1.5px solid ${col.border}`, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: col.text }}>
                  <Database size={11} color={col.text} />
                  {tname}
                  {i === 0 && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: col.border, color: col.text, marginLeft: 2 }}>BASE</span>}
                </div>
                {/* {i === 0 && <div style={{ fontSize: 9, color: C.g400, marginTop: 2 }}>table principale</div>} */}
              </div>
            </div>
          );
        })}
      </div>

      {/* ON conditions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tables.slice(1).map((tname, i) => {
          const join = getJoin(i);
          const leftCol = palette[0];
          const rightCol = palette[(i + 1) % palette.length];
          const isComplete = join.on && join.on.trim().length > 0;
          return (
            <div key={tname} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isComplete ? "rgba(34,197,94,.04)" : "rgba(248,247,245,.8)", borderRadius: 11, border: `1px solid ${isComplete ? "rgba(34,197,94,.25)" : "#e5e7eb"}`, flexWrap: "wrap", transition: "all .18s" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: leftCol.bg, color: leftCol.text, fontFamily: "'JetBrains Mono',monospace", border: `1px solid ${leftCol.border}`, flexShrink: 0 }}>{tables[0]}</span>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: "rgba(245,158,11,.1)", color: "#92400e", border: "1px solid rgba(245,158,11,.25)", flexShrink: 0 }}>{join.type}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: rightCol.bg, color: rightCol.text, fontFamily: "'JetBrains Mono',monospace", border: `1px solid ${rightCol.border}`, flexShrink: 0 }}>{tname}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.g500, flexShrink: 0 }}>ON</span>
              <input
                value={join.on}
                onChange={e => updateJoin(i, "on", e.target.value)}
                placeholder={`${tables[0]}.id = ${tname}.${tables[0].toLowerCase()}_id`}
                style={{ flex: 1, minWidth: 180, padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${isComplete ? "rgba(34,197,94,.35)" : "#e5e7eb"}`, background: "#fff", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", outline: "none", color: C.g800, transition: "border-color .15s" }}
                onFocus={e => { e.currentTarget.style.borderColor = C.red; }}
                onBlur={e => { e.currentTarget.style.borderColor = isComplete ? "rgba(34,197,94,.35)" : "#e5e7eb"; }}
              />
              {isComplete && <CheckCircle2 size={15} color={C.success} style={{ flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── GQL TENANT LINKER ───────────────────────────────────────── */
function resolvePlatformTenant(tenant, platformTenants = []) {
  if (!tenant) return null;
  const direct = platformTenants.find(pt => pt.id === tenant.platformTenantId)
    || platformTenants.find(pt => pt.name === tenant.platformTenantName);
  if (direct) return direct;

  const connection = TENANT_CONNECTIONS_TABLE.find(c => c.externalId === tenant.id || c.external_tenant_id === tenant.id);
  if (connection?.tenantId) {
    const platformTenant = platformTenants.find(pt => pt.id === connection.tenantId);
    if (platformTenant) return platformTenant;
  }

  return tenant.platformTenantName ? { id: tenant.platformTenantId || "", name: tenant.platformTenantName } : null;
}

function GQLTenantLinker({ tenant, platformTenants, onLink }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const linked = resolvePlatformTenant(tenant, platformTenants);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = search
    ? platformTenants.filter(pt => (pt.name || "").toLowerCase().includes(search.toLowerCase()) || (pt.id || "").toLowerCase().includes(search.toLowerCase()))
    : platformTenants;

  const getInitials = (name) => (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const getColor = (id) => {
    const colors = ["#3b82f6", "#8b5cf6", "#059669", "#d97706", "#db2777", "#0891b2"];
    let hash = 0;
    for (const c of (id || "")) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return colors[hash % colors.length];
  };

  return (
    <div className="gql-tenant-wrap" ref={ref}>
      <div
        className={`gql-tenant-trigger${linked ? " linked" : ""}${open ? " open" : ""}`}
        onClick={() => { if (!linked) setOpen(o => !o); }}
      >
        {linked ? (
          <>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: getColor(linked.id), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {getInitials(linked.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{linked.name}</div>
              <div style={{ fontSize: 9, color: C.g400, fontFamily: "'JetBrains Mono',monospace" }}>{linked.id}</div>
            </div>
            <CheckCircle2 size={14} color={C.success} />
            <button
              onClick={e => { e.stopPropagation(); onLink(null); setOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex", padding: 2 }}
              title="Délier"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: C.g100, border: `1px dashed ${C.g300}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Link2 size={11} color={C.g400} />
            </div>
            <span style={{ fontSize: 12, color: C.g400, flex: 1 }}>Lier au tenant plateforme…</span>
            <ChevronDown size={13} color={C.g400} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </>
        )}
      </div>

      {open && !linked && (
        <div className="gql-tenant-dropdown">
          <div className="gql-search-row">
            <Search size={12} color={C.g400} />
            <input
              className="gql-search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou ID…"
              autoFocus
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px 12px", fontSize: 12, color: C.g400, textAlign: "center" }}>Aucun résultat</div>
            ) : filtered.map(pt => (
              <div
                key={pt.id}
                className={`gql-opt${pt.id === tenant.platformTenantId ? " sel" : ""}`}
                onClick={() => { onLink(pt); setOpen(false); setSearch(""); }}
              >
                <div className="gql-opt-avatar" style={{ background: getColor(pt.id) + "20", color: getColor(pt.id) }}>
                  {getInitials(pt.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="gql-opt-name">{pt.name}</div>
                  <div className="gql-opt-id">{pt.id}{pt.industry ? ` · ${pt.industry}` : ""}</div>
                </div>
                {pt.id === tenant.platformTenantId && <CheckCircle2 size={13} color={C.success} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── TENANT PROCESSING OVERLAY ──────────────────────────────── */
function TenantProcessingCard({ tenant, pipelines, onComplete }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState(null);
  const allLogs = useRef(generateProcessingLogs(tenant.id, pipelines));
  const logsEndRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const totalLogs = allLogs.current.length;
    const interval = setInterval(() => {
      if (i >= totalLogs) {
        clearInterval(interval);
        setDone(true);
        setProgress(100);
        setStats({
          records: Math.floor(Math.random() * 3000) + 500,
          anomalies: Math.floor(Math.random() * 20),
          pipelines: pipelines.length,
          duration: `${(Math.random() * 8 + 2).toFixed(1)}s`,
        });
        setTimeout(() => onComplete(), 1200);
        return;
      }
      const nextLog = allLogs.current[i];
      if (nextLog) setLogs(prev => [...prev, nextLog]);
      setProgress(Math.round(((i + 1) / totalLogs) * 100));
      i++;
    }, 280);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div className="tenant-processing-card">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(59,130,246,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {done ? <CheckCircle2 size={16} color={C.success} /> : <Loader2 size={16} color={C.info} className="spin" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: done ? "#15803d" : "#1d4ed8" }}>
            {done ? `Tenant ${tenant.id} activé` : `Activation en cours — ${tenant.id}`}
          </div>
          <div style={{ fontSize: 10, color: C.g400 }}>{tenant.label}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: done ? C.success : C.info }}>{progress}%</span>
      </div>
      <div className="proc-progress"><div className="proc-progress-fill" style={{ width: `${progress}%`, background: done ? `linear-gradient(90deg,${C.success},#4ade80)` : undefined }} /></div>
      <div style={{ maxHeight: 120, overflowY: "auto", marginTop: 8 }} className="scroll">
        {logs.filter(Boolean).map((log, i) => (
          <div key={i} className="proc-log-line">
            <span className="ts">{log.time}</span>
            <span className={log.type}>{log.type === "ok" ? "✓" : log.type === "warn" ? "⚠" : log.type === "err" ? "✗" : "·"} {log.text}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
      {done && stats && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[
            { label: "Enregistrements", val: stats.records.toLocaleString("fr-FR") },
            { label: "Anomalies", val: stats.anomalies },
            { label: "Pipelines", val: stats.pipelines },
            { label: "Durée", val: stats.duration },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "8px 6px", borderRadius: 9, background: "rgba(34,197,94,.07)", border: "1px solid rgba(34,197,94,.2)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>{s.val}</div>
              <div style={{ fontSize: 9, color: C.g400, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusTagInput({ value = [], onChange, placeholder, color = C.info }) {
  const [draft, setDraft] = useState("");
  const tags = Array.isArray(value) ? value : String(value || "").split(",").map(x => x.trim()).filter(Boolean);

  const commit = (raw = draft) => {
    const nextValues = String(raw || "").split(",").map(x => x.trim()).filter(Boolean);
    if (!nextValues.length) return;
    const seen = new Set(tags.map(x => x.toLowerCase()));
    const merged = [...tags];
    nextValues.forEach(item => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    });
    onChange(merged);
    setDraft("");
  };

  const remove = item => onChange(tags.filter(x => x !== item));

  return (
    <div
      style={{
        minHeight: 38,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 5,
        padding: "5px 8px",
        borderRadius: 10,
        border: `1.5px solid ${tags.length ? `${color}35` : C.g200}`,
        background: "#fff",
      }}
    >
      {tags.map(tag => (
        <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 7px", borderRadius: 7, background: `${color}12`, border: `1px solid ${color}28`, color, fontSize: 10, fontWeight: 700 }}>
          {tag}
          <button type="button" onClick={() => remove(tag)} style={{ border: "none", background: "transparent", color, cursor: "pointer", padding: 0, display: "flex" }}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1));
        }}
        placeholder={tags.length ? "" : placeholder}
        style={{ flex: 1, minWidth: 120, border: "none", outline: "none", fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: C.g800, padding: "4px 2px" }}
      />
    </div>
  );
}

/* ─── FULL ERP REPORT MODAL ───────────────────────────────────── */
function ERPReportModal({ integration, onClose }) {
  const [copied, setCopied] = useState(false);
  const tenants = integration.tenants || [
    { id: "CLIENT_001", label: "Client Alpha", active: true, platformTenantName: "Alpha Corp", pipelines: ["Factures", "Commandes"] },
    { id: "CLIENT_002", label: "Client Beta", active: true, platformTenantName: "Beta Industries", pipelines: ["Factures"] },
    { id: "CLIENT_003", label: "Client Gamma", active: false, platformTenantName: null, pipelines: [] },
  ];
  const activeTenants = tenants.filter(t => t.active);
  const linkedTenants = tenants.filter(t => t.platformTenantName);
  const selectedTables = integration.selectedTables || ["FACTURES", "FOURNISSEURS", "COMMANDES", "BUDGETS"];
  const pipelines = integration.pipelines || {};
  const customPipelines = integration.customPipelines || [];
  const allPipelineKeys = [...Object.keys(pipelines), ...customPipelines.map(cp => cp.id)];
  const enabledPipelines = allPipelineKeys.filter(k => (pipelines[k] || {}).enabled !== false);

  const runDate = new Date().toLocaleString("fr-FR");
  const totalRecords = activeTenants.length * 1247 + Math.floor(Math.random() * 500);
  const totalAnomalies = Math.floor(Math.random() * 40) + 5;

  const reportLogs = [
    { ts: "09:00:00", type: "info", text: `Rapport généré — ${runDate}` },
    { ts: "09:00:01", type: "ok", text: `Connecteur «${integration.name}» — statut: ACTIF` },
    { ts: "09:00:01", type: "ok", text: `${selectedTables.length} tables importées · ${enabledPipelines.length} pipeline(s) actif(s)` },
    { ts: "09:00:02", type: "info", text: `${activeTenants.length} tenant(s) actif(s) sur ${tenants.length} configuré(s)` },
    { ts: "09:00:03", type: "ok", text: `${linkedTenants.length} tenant(s) lié(s) à la plateforme` },
    { ts: "09:00:04", type: "ok", text: `Total enregistrements traités : ${totalRecords.toLocaleString("fr-FR")}` },
    { ts: "09:00:05", type: totalAnomalies > 20 ? "warn" : "ok", text: `Anomalies détectées : ${totalAnomalies}` },
    { ts: "09:00:06", type: "ok", text: "Moteur budgétaire — rythme et prévisions actifs" },
    { ts: "09:00:07", type: "ok", text: "Toutes les vérifications de santé passées ✓" },
  ];

  const tenantDetailLogs = activeTenants.flatMap(t => generateProcessingLogs(t.id, enabledPipelines.length > 0 ? enabledPipelines : ["Factures", "Commandes"]).slice(0, 6));

  const reportStr = JSON.stringify({
    generatedAt: new Date().toISOString(),
    connector: { id: integration.id, name: integration.name, type: integration.connectorType, auth: integration.authType, status: "ACTIVE" },
    tables: selectedTables,
    pipelines: enabledPipelines,
    tenants: activeTenants.map(t => ({ id: t.id, label: t.label, platformLink: t.platformTenantName || null, status: "ACTIVE" })),
    stats: { totalRecords, totalAnomalies, activeTenants: activeTenants.length, linkedTenants: linkedTenants.length },
  }, null, 2);

  const handleCopy = () => {
    try { navigator.clipboard?.writeText(reportStr); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { }
  };

  return createPortal(
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        <style>{CSS}</style>
        <div className="report-hdr">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: integration.color || C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {integration.logo || (integration.name || "??").slice(0, 2)}
            </div>
            <div>
              <div className="serif" style={{ fontSize: 20, color: C.g900 }}>Rapport d'exécution</div>
              <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{integration.name} · {runDate}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="report-copy-btn" onClick={handleCopy}>
              {copied ? <CheckCircle2 size={13} color={C.success} /> : <Copy size={13} />}
              {copied ? "Copié !" : "Copier JSON"}
            </button>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: C.g100, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="report-body">
          {/* Stats row */}
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "Enregistrements", val: totalRecords.toLocaleString("fr-FR"), color: C.info, icon: <Database size={16} /> },
              { label: "Anomalies", val: totalAnomalies, color: totalAnomalies > 20 ? C.warning : C.success, icon: <AlertCircle size={16} /> },
              { label: "Tenants actifs", val: `${activeTenants.length}/${tenants.length}`, color: C.success, icon: <Cpu size={16} /> },
              { label: "Pipelines", val: enabledPipelines.length, color: C.red, icon: <GitBranch size={16} /> },
              { label: "Tables", val: selectedTables.length, color: "#8b5cf6", icon: <Table2 size={16} /> },
            ].map(s => (
              <div className="stat-card-sm" key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: s.color, opacity: .7 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.g400, marginTop: 3, textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Execution log */}
          <div className="report-section">
            <div className="report-section-hdr">
              <Activity size={14} color={C.info} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Journal d'exécution</span>
              <span style={{ fontSize: 9, color: C.g400, marginLeft: "auto" }}>{reportLogs.length} entrées</span>
            </div>
            {reportLogs.map((log, i) => (
              <div key={i} className="report-log-line" style={{ background: i % 2 === 0 ? "transparent" : "rgba(248,247,245,.4)" }}>
                <span className="rl-ts">{log.ts}</span>
                <span className={`rl-${log.type}`}>{log.type === "ok" ? "✓" : log.type === "warn" ? "⚠" : "·"} {log.text}</span>
              </div>
            ))}
          </div>

          {/* Tenant details */}
          <div className="report-section">
            <div className="report-section-hdr">
              <Users size={14} color={C.g500} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Détails des tenants</span>
              <span style={{ fontSize: 9, color: C.g400, marginLeft: "auto" }}>{tenants.length} configurés</span>
            </div>
            {tenants.map((t, i) => {
              const records = t.active ? Math.floor(Math.random() * 2000) + 200 : 0;
              const anomalies = t.active ? Math.floor(Math.random() * 15) : 0;
              return (
                <div key={t.id} className="tenant-report-row">
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: t.active ? "rgba(34,197,94,.1)" : C.g100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {t.active ? <CheckCircle2 size={16} color={C.success} /> : <XCircle size={16} color={C.g300} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.g900 }}>{t.label || t.id}</div>
                    <div style={{ fontSize: 10, color: C.g400 }}>
                      ID: <span className="mono">{t.id}</span>
                      {t.platformTenantName && <> · Lié à: {t.platformTenantName}</>}
                    </div>
                  </div>
                  {t.active ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className="pl-badge" style={{ background: "rgba(59,130,246,.1)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,.2)" }}>
                        <Database size={9} /> {records.toLocaleString("fr-FR")} rec.
                      </span>
                      {anomalies > 0 && (
                        <span className="pl-badge" style={{ background: "rgba(245,158,11,.1)", color: "#b45309", border: "1px solid rgba(245,158,11,.2)" }}>
                          <AlertCircle size={9} /> {anomalies} anom.
                        </span>
                      )}
                      {(enabledPipelines.length > 0 ? enabledPipelines : ["facture", "commande"]).map(k => (
                        <span key={k} className="pl-badge" style={{ background: "rgba(34,197,94,.08)", color: "#15803d", border: "1px solid rgba(34,197,94,.2)" }}>
                          <CheckSquare size={9} /> {k}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 10, color: C.g300 }}>Inactif</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pipeline details */}
          <div className="report-section">
            <div className="report-section-hdr">
              <GitBranch size={14} color={C.red} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Pipelines configurés</span>
            </div>
            {(enabledPipelines.length > 0 ? enabledPipelines : ["facture", "commande"]).map((k, i) => {
              const pl = pipelines[k] || {};
              const tables2 = pl.tables || selectedTables.slice(0, 2);
              return (
                <div key={k} className="report-log-line" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.g800 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: C.successLight, color: "#15803d", fontWeight: 600 }}>ACTIF</span>
                    <span style={{ fontSize: 10, color: C.g400, marginLeft: "auto" }}>{tables2.length} table(s) source</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {tables2.map(t => (
                      <span key={t} style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", padding: "1px 6px", borderRadius: 4, background: C.g100, color: C.g600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tenant activation logs */}
          <div className="report-section">
            <div className="report-section-hdr">
              <Clock size={14} color={C.g500} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Logs d'activation par tenant</span>
            </div>
            {tenantDetailLogs.map((log, i) => (
              <div key={i} className="report-log-line" style={{ background: i % 2 === 0 ? "transparent" : "rgba(248,247,245,.4)" }}>
                <span className="rl-ts">{log.time}</span>
                <span className={`rl-${log.type}`}>{log.type === "ok" ? "✓" : log.type === "warn" ? "⚠" : "·"} {log.text}</span>
              </div>
            ))}
          </div>

          {/* JSON export */}
          <div style={{ background: "#1e1e2e", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
              <FileJson size={14} color="#7dd3fc" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#e4e4e7", flex: 1 }}>Export JSON complet</span>
              <button className="asst-cpbtn" onClick={handleCopy}>{copied ? <CheckCircle2 size={12} color="#4ade80" /> : <Copy size={12} />} {copied ? "Copié !" : "Copier"}</button>
            </div>
            <pre style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#86efac", overflowX: "auto", lineHeight: 1.75, margin: 0 }}>{reportStr}</pre>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── JSON RENDERER ─────────────────────────────────────────── */
function JSONRender({ obj, depth = 0 }) {
  const pad = "  ".repeat(depth), pad1 = "  ".repeat(depth + 1);
  if (obj === null) return <span className="asst-jnull">null</span>;
  if (typeof obj === "boolean") return <span className="asst-jbool">{String(obj)}</span>;
  if (typeof obj === "number") return <span className="asst-jnum">{obj}</span>;
  if (typeof obj === "string") return <span className="asst-jstr">"{obj}"</span>;
  if (Array.isArray(obj)) {
    if (!obj.length) return <span><span className="asst-jbrace">[]</span></span>;
    return <span><span className="asst-jbrace">{"["}</span>{"\n"}{obj.map((v, i) => <span key={i}>{pad1}<JSONRender obj={v} depth={depth + 1} />{i < obj.length - 1 ? "," : ""}{"\n"}</span>)}{pad}<span className="asst-jbrace">{"]"}</span></span>;
  }
  const entries = Object.entries(obj);
  if (!entries.length) return <span><span className="asst-jbrace">{"{}"}</span></span>;
  return <span><span className="asst-jbrace">{"{"}</span>{"\n"}{entries.map(([k, v], i) => <span key={k}>{pad1}<span className="asst-jkey">"{k}"</span><span style={{ color: "#52525b" }}>: </span><JSONRender obj={v} depth={depth + 1} />{i < entries.length - 1 ? "," : ""}{"\n"}</span>)}{pad}<span className="asst-jbrace">{"}"}</span></span>;
}

/* ─── REPORT VIEW (assistant) ───────────────────────────────── */
function ReportView({ report, onAutofill, onBack }) {
  const [copied, setCopied] = useState(false);
  const score = computeScore(report);
  const str = JSON.stringify(report, null, 2);
  const scoreColor = score >= 70 ? "#16a34a" : score >= 40 ? "#b45309" : "#dc2626";
  const scoreBg = score >= 70 ? "rgba(22,163,74,.07)" : score >= 40 ? "rgba(245,158,11,.07)" : "rgba(239,68,68,.07)";
  const scoreBorder = score >= 70 ? "rgba(22,163,74,.2)" : score >= 40 ? "rgba(245,158,11,.2)" : "rgba(239,68,68,.2)";
  const handleCopy = () => { try { navigator.clipboard?.writeText(str); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { } };
  const handleDL = () => { const b = new Blob([str], { type: "application/json" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = "erp-config.json"; a.click(); URL.revokeObjectURL(u); };
  return (
    <div className="asst-report-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", borderRadius: 16, background: scoreBg, border: `1px solid ${scoreBorder}`, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor, marginBottom: 4 }}>Score : {score}/100</div>
          <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}99)` }} /></div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{score >= 70 ? "Configuration prête à être appliquée." : "Des champs importants sont manquants."}</div>
        </div>
        <button className="asst-pbtn" onClick={onAutofill}><Wand2 size={15} /> Confirmer &amp; remplir le wizard</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {[{ label: report?.identity?.name || "Sans nom", color: "#D94F3D" }, { label: report?.identity?.connectorType || "ERP", color: "#3b82f6" }, { label: report?.identity?.authType || "NONE", color: "#8b5cf6" }, { label: `${(report?.tables?.selected || []).length} table(s)`, color: "#059669" }, { label: `${(report?.tenants || []).length} tenant(s)`, color: "#f59e0b" }].map(c => <div key={c.label} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>{c.label}</div>)}
      </div>
      <div className="asst-jblock">
        <div className="asst-jtbar">
          <FileJson size={14} color="#7dd3fc" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e4e4e7", flex: 1 }}>Configuration JSON</span>
          <button className="asst-cpbtn" onClick={handleCopy}>{copied ? <CheckCircle2 size={12} color="#4ade80" /> : <Copy size={12} />} {copied ? "Copié !" : "Copier"}</button>
          <button className="asst-cpbtn" onClick={handleDL}><Download size={12} /> Télécharger</button>
        </div>
        <div className="asst-jcontent"><JSONRender obj={report} /></div>
      </div>
      <div style={{ height: 32 }} />
    </div>
  );
}

/* ─── JSON IMPORT VIEW ──────────────────────────────────────── */
function JSONImportView({ onAutofill, onBack }) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(null);
  const TEMPLATE = { identity: { name: "Mon ERP", connectorType: "ERP", authType: "BASIC", logo: "ME", color: "#D94F3D", description: "" }, authentication: { username: "erp_user", password: "••••••" }, connection: { type: "jdbc", jdbcUrl: "jdbc:postgresql://host:5432/erp_db", jdbcUsername: "erp_user", jdbcPassword: "" }, tables: { selected: ["FACTURES", "FOURNISSEURS", "COMMANDES", "BUDGETS"], budgetSources: ["BUDGETS"] }, pipelines: { factures: { enabled: true, sourceTables: ["FACTURES", "FOURNISSEURS"], fieldMappings: {} }, commandes: { enabled: true, sourceTables: ["COMMANDES"], groupBy: [] } }, budget: {}, tenants: ["CLIENT_001", "CLIENT_002"] };
  const handleParse = () => { try { const p = JSON.parse(raw); setParsed(p); setError(null); setScore(computeScore(p)); } catch (e) { setError("JSON invalide : " + e.message); setParsed(null); setScore(null); } };
  const handleTemplate = () => { setRaw(JSON.stringify(TEMPLATE, null, 2)); setParsed(null); setError(null); setScore(null); };
  const handleConfirm = () => {
    if (!parsed) return;
    const d = { name: parsed.identity?.name || "", connectorType: parsed.identity?.connectorType || "ERP", authType: parsed.identity?.authType || "NONE", logo: parsed.identity?.logo || "", color: parsed.identity?.color || "#D94F3D", description: parsed.identity?.description || "", ...(parsed.authentication || {}), connectionType: parsed.connection?.type || "jdbc", jdbcUrl: parsed.connection?.jdbcUrl || "", jdbcUsername: parsed.connection?.jdbcUsername || "", jdbcPassword: parsed.connection?.jdbcPassword || "", selectedTables: parsed.tables?.selected || [], budgetSourceTables: parsed.tables?.budgetSources || [], tenants: (parsed.tenants || []).map(t => typeof t === "string" ? { id: t, label: t, active: false, statuses: { facture: { provisional: ["En attente"], final: ["Payé"], statusColumn: "STATUT" }, commande: { provisional: ["En cours"], final: ["Livré"], statusColumn: "STATUT" } } } : t), pipelines: { facture: { enabled: parsed.pipelines?.factures?.enabled !== false, tables: parsed.pipelines?.factures?.sourceTables || [], fieldMappings: parsed.pipelines?.factures?.fieldMappings || {}, conditions: [], joins: [], groupByCols: [] }, commande: { enabled: parsed.pipelines?.commandes?.enabled !== false, tables: parsed.pipelines?.commandes?.sourceTables || [], fieldMappings: {}, conditions: [], joins: [], groupByCols: parsed.pipelines?.commandes?.groupBy || [] } }, budgetFormula: [], customPipelines: [], generatedData: {} };
    onAutofill(d);
  };
  return (
    <div className="json-import-wrap">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div><div style={{ fontSize: 16, fontWeight: 700, color: C.g900 }}>Importer une configuration JSON</div><div style={{ fontSize: 12, color: C.g400, marginTop: 3 }}>Collez votre JSON de configuration ERP ci-dessous</div></div>
            <button className="asst-gbtn" onClick={handleTemplate} style={{ fontSize: 11 }}><FileText size={13} /> Charger un modèle</button>
          </div>
          <textarea className="json-textarea" value={raw} onChange={e => { setRaw(e.target.value); setParsed(null); setError(null); setScore(null); }} placeholder={'{\n  "identity": { "name": "Mon ERP", ... },\n  ...\n}'} />
        </div>
        {error && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.2)", marginBottom: 16 }}><AlertTriangle size={16} color="#dc2626" /><span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span></div>}
        {score !== null && parsed && (
          <div style={{ padding: "16px 20px", borderRadius: 14, background: score >= 70 ? "rgba(22,163,74,.06)" : "rgba(245,158,11,.06)", border: `1px solid ${score >= 70 ? "rgba(22,163,74,.2)" : "rgba(245,158,11,.2)"}`, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: score >= 70 ? "#16a34a" : "#b45309" }}>Score : {score}/100</div>
              {score >= 40 && <button className="asst-pbtn" onClick={handleConfirm}><Wand2 size={14} /> Confirmer &amp; remplir le wizard</button>}
            </div>
            <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: score >= 70 ? "linear-gradient(90deg,#16a34a,#22c55e)" : "linear-gradient(90deg,#b45309,#f59e0b)" }} /></div>
          </div>
        )}
        <button className="asst-pbtn" onClick={handleParse} disabled={!raw.trim()}><CheckCircle2 size={14} /> Analyser le JSON</button>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

/* ─── MULTI CHIP ─────────────────────────────────────────────── */
function MultiChip({ options, value, onChange }) {
  return (
    <div className="asst-chip-row">
      {options.map(opt => {
        const s = value.includes(opt.value);
        return <button key={opt.value} className={`asst-chip${s ? " sel" : ""}`} onClick={() => onChange(s ? value.filter(x => x !== opt.value) : [...value, opt.value])}>{opt.label}</button>;
      })}
    </div>
  );
}

/* ─── PIPELINE FACTURE STEP (in Q&A) ─────────────────────────── */
function PipelineFactureMsgWidget({ plCols, value, onChange }) {
  const fixedFields = PIPELINE_DEFS.facture.fixedFields;
  const [mapping, setMapping] = useState(value || {});
  const update = (k, v) => { const next = { ...mapping, [k]: v }; setMapping(next); onChange(next); };
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {fixedFields.map(f => (
        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(217,79,61,.04)", borderRadius: 10, border: "1px solid rgba(217,79,61,.15)" }}>
          <div style={{ minWidth: 130, fontSize: 11, fontWeight: 700, color: C.g700 }}>{f.label} <span style={{ color: C.red }}>*</span></div>
          <span style={{ color: C.g300, fontSize: 12 }}>→</span>
          <select value={mapping[f.key] || ""} onChange={e => update(f.key, e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: "none" }}>
            <option value="">-- Colonne --</option>
            {plCols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {mapping[f.key] && <CheckCircle2 size={13} color={C.success} />}
        </div>
      ))}
    </div>
  );
}

/* ─── SMART FORM SECTIONS ───────────────────────────────────── */
const SMART_FORM_SECTIONS = [
  { id: "identity", label: "Identité", color: "#D94F3D", Icon: Tag, fields: [{ key: "name", label: "Nom du connecteur", type: "text", placeholder: "SAP S/4HANA Production", span: 2 }, { key: "connectorType", label: "Type de système", type: "select", options: ["ERP", "DATA_SOURCE", "ACCOUNTING"] }, { key: "authType", label: "Authentification", type: "select", options: ["NONE", "BASIC", "API_KEY", "OAUTH2", "JWT_SIGNED", "SAML"] }, { key: "description", label: "Description", type: "text", placeholder: "Connecteur ERP…", span: 2 }, { key: "logo", label: "Initiales (2 car.)", type: "text", placeholder: "SP", maxLen: 2 }, { key: "color", label: "Couleur", type: "color" }] },
  { id: "auth_details", label: "Détails d'authentification", color: "#6366f1", Icon: Settings2, fields: [], dynamic: true },
  { id: "connection", label: "Connexion", color: "#3b82f6", Icon: Plug, fields: [{ key: "connectionType", label: "Type de connexion", type: "select", options: ["jdbc", "api", "csv"] }, { key: "jdbcUrl", label: "URL JDBC", type: "text", placeholder: "jdbc:postgresql://host:5432/erp_db", span: 2, mono: true }, { key: "jdbcUsername", label: "Utilisateur", type: "text", placeholder: "erp_user" }, { key: "jdbcPassword", label: "Mot de passe", type: "password", placeholder: "••••••••" }] },
  { id: "tables", label: "Tables", color: "#059669", Icon: Database, fields: [{ key: "selectedTables", label: "Tables à importer", type: "table_picker", span: 2 }, { key: "budgetSourceTables", label: "Tables sources budget", type: "table_subset", span: 2 }] },
  { id: "alerts", label: "Tenants", color: "#f59e0b", Icon: Cpu, fields: [{ key: "_tenantsRaw", label: "IDs Tenants (virgule)", type: "text", placeholder: "CLIENT_001, CLIENT_002", span: 2 }] },
];

function SmartFormPanel({ formData, setFormData, schema, onSubmit }) {
  const allTables = schema?.tables || [];
  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const [pwVis, setPwVis] = useState({});
  const authFields = AUTH_FIELDS[formData.authType] || [];
  const nonPickerFields = SMART_FORM_SECTIONS.flatMap(s => s.dynamic ? authFields : s.fields).filter(f => !["table_picker", "table_subset", "table_subset_key", "color"].includes(f?.type));
  const filled = nonPickerFields.filter(f => f?.key && formData[f.key]).length;
  const pct = nonPickerFields.length ? Math.round((filled / nonPickerFields.length) * 100) : 0;

  const renderF = (f) => {
    if (!f || !f.key) return null;
    const v = formData[f.key];
    const spanAll = f.span === 2 ? { gridColumn: "1 / -1" } : {};
    if (f.type === "table_picker") { const sel = Array.isArray(v) ? v : []; return <div key={f.key} style={{ gridColumn: "1 / -1" }}><label className="asst-flabel">{f.label}</label>{allTables.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Saisissez d'abord une URL JDBC</div> : <div className="asst-chip-row">{allTables.map(t => { const s = sel.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? sel.filter(x => x !== t.name) : [...sel, t.name])}>{t.name}</button>; })}</div>}</div>; }
    if (f.type === "table_subset" || f.type === "table_subset_key") { const parentSel = Array.isArray(formData.selectedTables) ? formData.selectedTables : []; const v2 = Array.isArray(v) ? v : []; const avail = allTables.filter(t => parentSel.includes(t.name)); return <div key={f.key} style={{ gridColumn: "1 / -1" }}><label className="asst-flabel">{f.label}</label>{avail.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Sélectionnez d'abord des tables</div> : <div className="asst-chip-row">{avail.map(t => { const s = v2.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? v2.filter(x => x !== t.name) : [...v2, t.name])}>{t.name}</button>; })}</div>}</div>; }
    if (f.type === "select") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><select className="asst-fsel" value={v || ""} onChange={e => update(f.key, e.target.value)}>{(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
    if (f.type === "color") return <div key={f.key}><label className="asst-flabel">{f.label}</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ width: 42, height: 42, padding: 3, border: "1.5px solid #e5e7eb", borderRadius: 9, cursor: "pointer" }} /><input className="asst-fi" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }} /></div></div>;
    if (f.type === "password") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><div style={{ position: "relative" }}><input type={pwVis[f.key] ? "text" : "password"} className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} style={{ paddingRight: 40 }} /><button onClick={() => setPwVis(p => ({ ...p, [f.key]: !p[f.key] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>{pwVis[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>;
    return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><input type={f.type === "number" ? "number" : "text"} className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder || ""} maxLength={f.maxLen} style={f.mono ? { fontFamily: "'JetBrains Mono',monospace", fontSize: 12 } : {}} /></div>;
  };

  return (
    <div className="asst-form-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#D94F3D,#f97316)", transition: "width .4s", borderRadius: 99 }} /></div>
        <span style={{ fontSize: 11, color: pct === 100 ? "#16a34a" : "#9ca3af", fontWeight: 700, minWidth: 32 }}>{pct}%</span>
      </div>
      {SMART_FORM_SECTIONS.map(sec => {
        const SI = sec.Icon;
        const fields = sec.dynamic ? authFields : sec.fields;
        if (sec.dynamic && fields.length === 0) return null;
        return <div key={sec.id} className="asst-fsec"><div className="asst-fsec-hdr"><div style={{ width: 32, height: 32, borderRadius: 9, background: `${sec.color}14`, border: `1px solid ${sec.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SI size={15} color={sec.color} /></div><div style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{sec.label}</div></div><div className="asst-fsec-body"><div className="asst-frow">{fields.map(f => renderF(f))}</div></div></div>;
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
        <button className="asst-pbtn" onClick={onSubmit}><Sparkles size={15} /> Générer le rapport JSON</button>
      </div>
    </div>
  );
}

/* ─── FULL ASSISTANT PANEL ──────────────────────────────────── */
function AssistantFullscreen({ onClose, onAutofill, rawSchema }) {
  const [mode, setMode] = useState(null);
  const [qaStepIdx, setQaStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [multiSel, setMultiSel] = useState([]);
  const [factureMappingTemp, setFactureMappingTemp] = useState({});
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [formData, setFormData] = useState({ color: "#D94F3D", connectorType: "ERP", authType: "NONE", connectionType: "jdbc", selectedTables: [], budgetSourceTables: [] });
  const chatEndRef = useRef(null);
  const curStep = QA_FLOW[qaStepIdx];
  const schema = useMemo(() => { const url = answers.jdbcUrl || ""; if (!url && !rawSchema) return null; if (rawSchema) { const sel = answers.selectedTables || []; if (sel.length === 0) return rawSchema; const tables = rawSchema.tables.filter(t => sel.includes(t.name)); const tableNames = new Set(tables.map(t => t.name)); return { tables, rels: rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to)) }; } return GENERIC_SCHEMA; }, [answers.jdbcUrl, answers.selectedTables, rawSchema]);
  const scrollB = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (messages.length === 0) initChat(); }, []);
  useEffect(() => { scrollB(); }, [messages, typing]);
  const addBot = (text, opts = {}) => setMessages(p => [...p, { role: "bot", text, ...opts }]);
  const addUser = text => setMessages(p => [...p, { role: "user", text }]);
  const initChat = () => { setQaStepIdx(0); setMode(null); setAnswers({}); setMultiSel([]); setReport(null); setShowReport(false); setFactureMappingTemp({}); const s = QA_FLOW[0]; setTimeout(() => setMessages([{ role: "bot", text: s.bot, type: s.type, options: s.options }]), 80); };
  const advanceToStep = useCallback((targetId, curAnswers) => {
    const idx = QA_FLOW.findIndex(s => s.id === targetId);
    if (idx < 0) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let si = idx, ns = QA_FLOW[si];
      while (ns?.condition && !ns.condition(curAnswers)) { const ni = QA_FLOW.findIndex(s => s.id === ns.next); if (ni < 0) break; si = ni; ns = QA_FLOW[si]; }
      if (!ns) return;
      const bt = typeof ns.bot === "function" ? ns.bot(curAnswers, schema) : ns.bot;
      const opts = { type: ns.type };
      if (ns.type === "choice" || ns.type === "mode_pick") opts.options = ns.options;
      else if (ns.type === "multi_schema") opts.schOpts = (schema?.tables || GENERIC_SCHEMA.tables).map(t => ({ label: t.name, value: t.name }));
      else if (ns.type === "choice_dynamic") opts.dynOpts = (curAnswers.selectedTables || []).map(n => ({ label: n, value: n }));
      else if (ns.type === "pipeline_facture") { const selTables = curAnswers.selectedTables || []; const plCols = (schema?.tables || GENERIC_SCHEMA.tables).filter(t => selTables.includes(t.name)).flatMap(t => t.cols.map(c => `${t.name}.${c}`)); opts.plCols = plCols; }
      else if (ns.type === "pipeline_commande") { const selTables = curAnswers.selectedTables || []; const plCols = (schema?.tables || GENERIC_SCHEMA.tables).filter(t => selTables.includes(t.name)).flatMap(t => t.cols.map(c => ({ label: `${t.name}.${c}`, value: `${t.name}.${c}` }))); opts.schOpts = plCols; }
      else if (ns.placeholder) opts.placeholder = ns.placeholder;
      addBot(bt, opts); setQaStepIdx(si);
    }, 600);
  }, [schema]);
  const advanceQA = useCallback((key, answer, display) => {
    const step = QA_FLOW[qaStepIdx];
    const na = key ? { ...answers, [key]: answer } : { ...answers };
    if (key) setAnswers(na);
    setMultiSel([]);
    if (display) addUser(display);
    else if (answer !== undefined && answer !== null) addUser(Array.isArray(answer) ? answer.join(", ") : String(answer));
    let nextId;
    if (step.nextFn) nextId = step.nextFn(answer, na);
    else nextId = step.next;
    if (!nextId) return;
    advanceToStep(nextId, na);
  }, [qaStepIdx, answers, advanceToStep]);
  const handleModeChoice = (v) => {
    setMode(v); addUser(v === "qa" ? "💬 Questions / Réponses" : v === "form" ? "📋 Formulaire" : "📄 Import JSON");
    if (v === "qa") { setTyping(true); setTimeout(() => { setTyping(false); const n = QA_FLOW[1]; addBot(n.bot, { type: n.type, placeholder: n.placeholder }); setQaStepIdx(1); }, 400); }
    else { setTyping(true); setTimeout(() => { setTyping(false); addBot(v === "form" ? "Parfait ! Remplissez le formulaire ci-dessous." : "Collez votre JSON de configuration ci-dessous.", { type: "switch_" + v }); }, 400); }
  };
  const handleTextSubmit = () => { if (!textInput.trim()) return; advanceQA(curStep?.key, textInput.trim(), textInput.trim()); setTextInput(""); };
  const genReport = (src) => { const r = buildReport(src); setReport(r); setShowReport(true); };
  const handleAutofillAndClose = () => { const src = mode === "form" ? formData : answers; onAutofill(buildWizardDataFromAnswers(src, schema)); onClose(); };
  const isDone = curStep?.id === "q_done";
  const showSidebar = mode === "qa";
  const modePct = mode === "qa" ? Math.round((qaStepIdx / (QA_FLOW.length - 1)) * 100) : 0;
  const isForm = mode === "form";
  const isJSON = mode === "json";
  return createPortal(
    <div className="asst-fs">
      <style>{CSS}</style>
      <div className="asst-fs-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={18} color="#D94F3D" /></div>
          <div><div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>Assistant Configuration ERP</div><div style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />100% local · Aucune IA externe</div></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {mode && !showReport && !isJSON && (<div className="mode-tabs">{[{ v: "qa", I: MessageSquare, label: "Q&A" }, { v: "form", I: FileJson, label: "Formulaire" }, { v: "json", I: Upload, label: "JSON" }].map(({ v, I, label }) => (<button key={v} className={`mode-tab${mode === v ? " active" : ""}`} onClick={() => { setMode(v); setShowReport(false); }}><I size={12} /> {label}</button>))}</div>)}
          {(showReport || isJSON) && <button className="asst-gbtn" onClick={() => setShowReport(false)}><ArrowLeft size={13} /> Retour</button>}
          <button onClick={initChat} style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}><RotateCcw size={14} /></button>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}><X size={15} /></button>
        </div>
      </div>
      {mode === "qa" && <div className="asst-prog-rail"><div className="asst-prog-fill" style={{ width: `${modePct}%` }} /></div>}
      <div className="asst-fs-body">
        {showSidebar && (<div className="asst-fs-sidebar"><div style={{ fontSize: 9, fontWeight: 700, color: C.g300, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, paddingLeft: 4 }}>Étapes</div>{QA_SIDEBAR_STEPS.map((s, i) => { const idx = QA_FLOW.findIndex(q => q.id === s.id); const done = qaStepIdx > idx, active = curStep?.id === s.id; return (<div key={s.id} className={`asst-ss${active ? " active" : done ? " done" : ""}`}><div className="asst-sn">{done ? <CheckCircle2 size={11} color={C.success} /> : i + 1}</div><span style={{ fontSize: 11, fontWeight: active ? 700 : done ? 500 : 400, color: active ? C.red : done ? C.g500 : C.g300 }}>{s.label}</span></div>); })}</div>)}
        <div className="asst-fs-main">
          {showReport && report ? (<ReportView report={report} onAutofill={handleAutofillAndClose} onBack={() => setShowReport(false)} />) :
            isJSON ? (<JSONImportView onAutofill={(d) => { onAutofill(d); onClose(); }} onBack={() => setMode(null)} />) :
              isForm ? (<SmartFormPanel formData={formData} setFormData={setFormData} schema={schema || GENERIC_SCHEMA} onSubmit={() => genReport(formData)} />) : (
                <>
                  <div className="asst-chat-wrap">
                    <div className="asst-chat-inner">
                      {messages.map((msg, i) => (
                        <div key={i} className={`${msg.role === "bot" ? "asst-msg-bot" : "asst-msg-user"} asst-anim`}>
                          {msg.role === "bot" && (<div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}><Bot size={15} color="#D94F3D" /></div>)}
                          <div style={{ maxWidth: "100%" }}>
                            <div className={msg.role === "bot" ? "asst-bb" : "asst-bu"}>{msg.text}</div>
                            {msg.role === "bot" && msg.type === "mode_pick" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}>{(msg.options || []).map((opt, oi) => (<button key={oi} className="asst-opt" onClick={() => handleModeChoice(opt.value)}><span style={{ flex: 1 }}>{opt.label}</span>{opt.desc && <span style={{ fontSize: 11, color: C.g400 }}>{opt.desc}</span>}<ChevronRight size={14} color={C.g300} /></button>))}</div>)}
                            {msg.role === "bot" && msg.type === "choice" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}>{(msg.options || []).map((opt, oi) => (<button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, opt.value, opt.label)}><span style={{ flex: 1 }}>{opt.label}</span><ChevronRight size={14} color={C.g300} /></button>))}</div>)}
                            {msg.role === "bot" && msg.type === "choice_dynamic" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}>{(msg.dynOpts || []).length === 0 ? <div style={{ fontSize: 12, color: C.g400 }}>Aucune table sélectionnée</div> : (msg.dynOpts || []).map((opt, oi) => (<button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, [opt.value], opt.label)}><Database size={13} color={C.g400} /><span style={{ flex: 1 }}>{opt.label}</span><ChevronRight size={14} color={C.g300} /></button>))}</div>)}
                            {msg.role === "bot" && msg.type === "multi_schema" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}><MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} /><button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }} disabled={multiSel.length === 0} onClick={() => advanceQA(curStep?.key, multiSel, `${multiSel.length} table(s)`)}><Check size={13} /> Confirmer ({multiSel.length})</button></div>)}
                            {msg.role === "bot" && msg.type === "pipeline_facture" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}><PipelineFactureMsgWidget plCols={msg.plCols || []} value={factureMappingTemp} onChange={setFactureMappingTemp} /><button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }} onClick={() => advanceQA(curStep?.key, factureMappingTemp, "Mapping factures configuré")}><Check size={13} /> Confirmer le mapping</button><button className="asst-gbtn" style={{ marginTop: 8, fontSize: 11, padding: "7px 14px" }} onClick={() => advanceQA(curStep?.key, {}, "Mapping ignoré")}>Passer</button></div>)}
                            {msg.role === "bot" && msg.type === "pipeline_commande" && i === messages.length - 1 && (<div style={{ marginTop: 10 }}><MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} /><div style={{ display: "flex", gap: 8, marginTop: 12 }}><button className="asst-pbtn" style={{ fontSize: 12, padding: "9px 16px" }} onClick={() => advanceQA(curStep?.key, multiSel, multiSel.length ? `${multiSel.length} col(s)` : "Pas de Group By")}><Check size={13} /> Confirmer</button><button className="asst-gbtn" style={{ fontSize: 11, padding: "7px 14px" }} onClick={() => advanceQA(curStep?.key, [], "Pas de Group By")}>Passer</button></div></div>)}
                            {msg.role === "bot" && msg.type === "done" && (<button className="asst-pbtn" style={{ marginTop: 12 }} onClick={() => genReport(answers)}><FileJson size={15} /> Voir le rapport JSON</button>)}
                          </div>
                        </div>
                      ))}
                      {typing && (<div className="asst-msg-bot asst-anim"><div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Bot size={15} color="#D94F3D" /></div><div className="asst-typing"><span /><span /><span /></div></div>)}
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                  {mode === "qa" && !isDone && curStep?.type === "text" && (<div className="asst-input-bar"><div className="asst-input-bar-inner"><input className="asst-ti" value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTextSubmit()} placeholder={curStep?.placeholder || "Tapez votre réponse…"} /><button className="asst-sb" onClick={handleTextSubmit} disabled={!textInput.trim()}><Send size={16} color="#fff" /></button></div></div>)}
                </>
              )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function AssistantBubble({ onOpen, hasData }) {
  return createPortal(
    <button className="asst-fab" onClick={onOpen} title="Ouvrir l'assistant ERP">
      <Bot size={26} color="#fff" />
      {hasData && <div className="asst-fab-badge"><Check size={10} /></div>}
      <span className="asst-tooltip">Assistant ERP</span>
    </button>,
    document.body
  );
}

/* ─── ERD (unchanged structure, abbreviated for space) ──────── */
function SchemaERD({ schema, tableRoles, onSelectTable, selectedTable, height = 480, fullscreen = false }) {
  const [search, setSearch] = useState("");
  const [selectedRel, setSelectedRel] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const viewportRef = useRef();
  const panRef = useRef({ isPanning: false, startX: 0, startY: 0, camX: 0, camY: 0 });
  const cardDragRef = useRef(null);
  const skipCardClickRef = useRef(false);
  const [cam, setCam] = useState({ x: 30, y: 30, scale: 0.88 });
  const tableNames = schema?.tables?.map(t => t.name) || [];
  const tableKey = tableNames.join("|");
  const tables = {};
  schema?.tables?.forEach(t => { tables[t.name] = t; });
  const relationships = schema?.rels || [];
  const highlighted = useMemo(() => { if (!search) return new Set(); const q = search.toLowerCase(); return new Set(tableNames.filter(n => n.toLowerCase().includes(q))); }, [search, tableNames]);
  const initialCardPositions = useMemo(() => Object.fromEntries(tableNames.map((name, i) => { const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: Math.floor(i / 4) * 290 }; return [name, { x: PAD + off.x, y: PAD + off.y }]; })), [tableKey]);
  const [cardPositions, setCardPositions] = useState(initialCardPositions);
  useEffect(() => { setCardPositions(initialCardPositions); }, [initialCardPositions]);
  const cardHeight = name => { const t = tables[name]; if (!t) return 80; return 36 + Math.min(t.cols.length, MAX_COLS) * 20 + (t.cols.length > MAX_COLS ? 18 : 4); };
  const canvasW = Math.max(...(tableNames.length ? tableNames.map((_, i) => { const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: 0 }; return PAD + off.x + CARD_W + PAD * 3; }) : [900]), 900);
  const canvasH = Math.max(...(tableNames.length ? tableNames.map((name, i) => { const off = ERD_OFFSETS[i] || { x: 0, y: Math.floor(i / 4) * 290 }; return PAD + off.y + cardHeight(name) + PAD * 3; }) : [600]), 600);
  const fitView = useCallback(() => { const vp = viewportRef.current; if (!vp) return; const W = vp.clientWidth, H = vp.clientHeight; if (fullscreen) { setCam({ scale: 1, x: 28, y: 42 }); return; } const scale = Math.min((W - 60) / canvasW, (H - 60) / canvasH, 1); setCam({ scale, x: (W - canvasW * scale) / 2, y: (H - canvasH * scale) / 2 }); }, [canvasW, canvasH, fullscreen]);
  useEffect(() => { fitView(); }, [tableNames.length, fullscreen, fitView]);
  const onMouseDown = useCallback(e => { if (e.target.closest(".erd-table-card")) return; panRef.current = { isPanning: true, startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y }; viewportRef.current.style.cursor = "grabbing"; e.preventDefault(); }, [cam]);
  const onMouseMove = useCallback(e => { if (cardDragRef.current) { const drag = cardDragRef.current; const dx = (e.clientX - drag.startX) / cam.scale; const dy = (e.clientY - drag.startY) / cam.scale; if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 4) drag.moved = true; setCardPositions(prev => ({ ...prev, [drag.name]: { x: drag.posX + dx, y: drag.posY + dy } })); return; } if (!panRef.current.isPanning) return; setCam(c => ({ ...c, x: panRef.current.camX + (e.clientX - panRef.current.startX), y: panRef.current.camY + (e.clientY - panRef.current.startY) })); }, [cam.scale]);
  const onMouseUp = useCallback(() => { if (cardDragRef.current?.moved) skipCardClickRef.current = true; cardDragRef.current = null; panRef.current.isPanning = false; if (viewportRef.current) viewportRef.current.style.cursor = "grab"; }, []);
  const onWheel = useCallback(e => { e.preventDefault(); const rect = viewportRef.current.getBoundingClientRect(); const mx = e.clientX - rect.left, my = e.clientY - rect.top, delta = e.deltaY > 0 ? 0.9 : 1.11; setCam(c => { const ns = Math.max(0.25, Math.min(2.5, c.scale * delta)); const wx = (mx - c.x) / c.scale, wy = (my - c.y) / c.scale; return { scale: ns, x: mx - wx * ns, y: my - wy * ns }; }); }, []);
  useEffect(() => { const el = viewportRef.current; if (!el) return; el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel); }, [onWheel]);
  if (!schema || !tableNames.length) return (<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, background: C.canvas, borderRadius: 14, color: "rgba(255,255,255,.18)", fontSize: 13, flexDirection: "column", gap: 10 }}><Database size={32} style={{ opacity: .2 }} /><span>Aucune table sélectionnée</span></div>);
  return (
    <div style={{ display: "flex", gap: 0, position: "relative", background: C.canvas, borderRadius: fullscreen ? 0 : "0 0 14px 14px", overflow: "hidden" }}>
      <div style={{ flex: 1, background: C.canvas, borderRadius: fullscreen ? 0 : "0 0 14px 14px", overflow: "hidden", position: "relative", minHeight: height }}>
        <div ref={viewportRef} style={{ height, overflow: "hidden", cursor: "grab", position: "relative", userSelect: "none" }} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <div style={{ position: "absolute", transformOrigin: "0 0", willChange: "transform", transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.scale})`, width: canvasW, height: canvasH }}>
            <svg style={{ position: "absolute", inset: 0, width: canvasW, height: canvasH, pointerEvents: "auto", overflow: "visible", zIndex: 2 }}>
              <defs><marker id="erd-arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="rgba(217,79,61,.55)" /></marker><marker id="erd-arr-act" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#D94F3D" /></marker></defs>
              {relationships.map((rel, i) => { const isActive = selectedRel === i || (hoveredTable && (hoveredTable === rel.from || hoveredTable === rel.to)); const fp = cardPositions[rel.from], tp = cardPositions[rel.to]; if (!fp || !tp) return null; const fr = fp.x < tp.x, fh = cardHeight(rel.from), th = cardHeight(rel.to); const ax1 = fp.x + (fr ? CARD_W : 0), ay1 = fp.y + fh / 2, ax2 = tp.x + (fr ? 0 : CARD_W), ay2 = tp.y + th / 2; const cp = Math.abs(ax2 - ax1) * 0.42; const d = `M${ax1} ${ay1} C${ax1 + (fr ? cp : -cp)} ${ay1},${ax2 + (fr ? -cp : cp)} ${ay2},${ax2} ${ay2}`; return (<g key={i} style={{ pointerEvents: "all", cursor: "pointer" }} onClick={() => setSelectedRel(selectedRel === i ? null : i)}><path d={d} fill="none" stroke="transparent" strokeWidth={10} />{isActive && <path d={d} fill="none" stroke="rgba(217,79,61,.15)" strokeWidth={5} />}<path d={d} fill="none" stroke={isActive ? "#D94F3D" : "rgba(217,79,61,.38)"} strokeWidth={isActive ? 1.8 : 1.1} markerEnd={`url(#${isActive ? "erd-arr-act" : "erd-arr"})`} />{isActive && (() => { const mx = (ax1 + ax2) / 2, my = (ay1 + ay2) / 2 - 2, lw = rel.col.length * 5 + 16; return (<g><rect x={mx - lw / 2} y={my - 8} width={lw} height={15} rx={4} fill="rgba(10,10,14,.94)" stroke="rgba(217,79,61,.3)" strokeWidth={0.7} /><text x={mx} y={my + 4} textAnchor="middle" fill="#fca5a5" fontSize={8} fontFamily="'JetBrains Mono',monospace">{rel.col}</text></g>); })()}</g>); })}
            </svg>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 1 }} />
            {tableNames.map((name, i) => { const pos = cardPositions[name], color = TABLE_PALETTE[i % TABLE_PALETTE.length], t = tables[name]; const isHl = highlighted.has(name) || hoveredTable === name || (selectedRel !== null && (relationships[selectedRel]?.from === name || relationships[selectedRel]?.to === name)) || selectedTable === name; return (<div key={name} className={`erd-table-card${isHl ? " highlighted" : ""}`} style={{ left: pos.x, top: pos.y }} onMouseDown={e => { e.stopPropagation(); cardDragRef.current = { name, startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y, moved: false }; }} onMouseEnter={() => setHoveredTable(name)} onMouseLeave={() => setHoveredTable(null)} onClick={() => { if (skipCardClickRef.current) { skipCardClickRef.current = false; return; } onSelectTable(selectedTable === name ? null : name); }}><div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderBottom: `1px solid ${color.fill}40` }}><div style={{ width: 20, height: 20, borderRadius: 5, background: color.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Database size={10} color="#fff" /></div><div style={{ fontSize: 10, fontWeight: 600, color: "#e4e4e7", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div><div style={{ fontSize: 9, color: "#52525b", fontFamily: "'JetBrains Mono',monospace" }}>{t.rowCount > 1000 ? (t.rowCount / 1000).toFixed(0) + "k" : t.rowCount}</div></div>{t.cols.slice(0, MAX_COLS).map(col => { const ct = inferColType(col); const isLinked = relationships.some(r => r.col === col && (r.from === name || r.to === name)); return (<div key={col} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3.5px 10px", fontSize: 9, borderBottom: "1px solid rgba(255,255,255,.025)" }}>{ct === "pk" ? <span style={{ fontSize: 9 }}>🔑</span> : isLinked ? <Link2 size={8} color="#5eead4" style={{ flexShrink: 0 }} /> : <span style={{ width: 7, height: 7, borderRadius: 2, border: "1px solid rgba(255,255,255,.1)", display: "inline-block", flexShrink: 0 }} />}<span style={{ fontFamily: "'JetBrains Mono',monospace", color: ct === "pk" ? "#fcd34d" : isLinked ? "#5eead4" : "#a1a1aa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 9 }}>{col}</span></div>); })}{t.cols.length > MAX_COLS && <div style={{ padding: "2px 10px 4px", fontSize: 8, color: "#52525b" }}>+{t.cols.length - MAX_COLS} more</div>}</div>); })}
          </div>
        </div>
        <div className="erd-search-bar"><Search size={11} color="#52525b" /><input className="erd-search-input" placeholder="Rechercher table…" value={search} onChange={e => setSearch(e.target.value)} />{search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}><X size={10} /></button>}</div>
        <div className="erd-zoom-controls"><button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.min(2.5, c.scale * 1.2) }))}>+</button><button className="erd-zoom-btn" onClick={fitView} style={{ fontSize: 10 }}>⊡</button><button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.max(0.25, c.scale * 0.85) }))}>−</button></div>
        <button className="erd-sidebar-toggle" onClick={() => setSidebarOpen(v => !v)}>{sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}</button>
      </div>
      <div className={`erd-sidebar-wrap ${sidebarOpen ? "open" : "closed"}`}>
        <div style={{ width: 260, display: "flex", flexDirection: "column" }}>
          <div className="rel-sidebar" style={{ maxHeight: height, overflowY: "auto" }}>
            <div className="rel-sidebar-header"><span>Relations</span><span className="rel-sidebar-count">{relationships.length}</span></div>
            {relationships.length === 0 ? <div style={{ padding: 14, fontSize: 11, color: "#71717a" }}>Aucune relation détectée.</div> : relationships.map((rel, i) => (<div key={`${rel.from}-${rel.to}-${i}`} className={`rel-sidebar-item${selectedRel === i ? " active" : ""}`} onClick={() => setSelectedRel(selectedRel === i ? null : i)}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: "#71717a" }}>{rel.type || "N:1"}</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.red, fontWeight: 700 }}>{rel.col}</span></div><div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5 }}><div style={{ color: "#5eead4" }}>{rel.from}</div><div style={{ color: "#71717a", marginTop: 1 }}>→ <span style={{ color: "#fca5a5" }}>{rel.to}</span></div></div></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SchemaForceGraph({ schema, onSelectTable, selectedTable, height = 460, fullscreen = false }) {
  const canvasRef = useRef(null);
  const minimapRef = useRef(null);
  const stateRef = useRef({ nodes: [], edges: [], cam: { x: 0, y: 0, scale: 1 }, drag: null, hover: null, selected: null, panStart: null, panCam: null, physicsOn: true, showLabels: false, tick: 0, particles: [], raf: null, W: 0, H: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [physicsOn, setPhysicsOn] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const tables = schema?.tables || [];
  const rels = schema?.rels || [];
  const fitView = useCallback(() => { const s = stateRef.current; const canvas = canvasRef.current; if (!canvas || !s.nodes.length) return; const xs = s.nodes.map(n => n.x), ys = s.nodes.map(n => n.y); const minX = Math.min(...xs) - 130, maxX = Math.max(...xs) + 130; const minY = Math.min(...ys) - 130, maxY = Math.max(...ys) + 130; const scale = Math.min((canvas.clientWidth * .85) / Math.max(1, maxX - minX), (canvas.clientHeight * .8) / Math.max(1, maxY - minY), 1.6); s.cam.scale = scale; s.cam.x = canvas.clientWidth / 2 - ((minX + maxX) / 2) * scale; s.cam.y = canvas.clientHeight / 2 - ((minY + maxY) / 2) * scale; }, []);
  useEffect(() => { stateRef.current.physicsOn = physicsOn; }, [physicsOn]);
  useEffect(() => { stateRef.current.showLabels = showLabels; }, [showLabels]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas || !tables.length) return; const rect = canvas.parentElement.getBoundingClientRect(); const cx = rect.width / 2, cy = Math.max(480, rect.height - 52) / 2; const r = Math.min(rect.width, Math.max(480, rect.height - 52)) * .38; const s = stateRef.current; s.nodes = tables.map((table, i) => { const angle = tables.length <= 1 ? -Math.PI / 2 : (i / tables.length) * Math.PI * 2 - Math.PI / 2; return { id: table.name, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), vx: 0, vy: 0, fx: 0, fy: 0, headers: table.cols || [], rowCount: table.rowCount || 0, color: TABLE_PALETTE[i % TABLE_PALETTE.length], r: 58 }; }); s.edges = rels.map(rel => ({ from: rel.from, to: rel.to, column: rel.col, type: rel.type || "N:1", fromN: s.nodes.find(n => n.id === rel.from), toN: s.nodes.find(n => n.id === rel.to) })).filter(e => e.fromN && e.toN); s.selected = selectedTable ? s.nodes.find(n => n.id === selectedTable) || null : null; setSelectedNode(s.selected); setPanelOpen(!!s.selected); fitView(); }, [tables, rels, schema, selectedTable, fitView]);
  useEffect(() => {
    const canvas = canvasRef.current, minimap = minimapRef.current;
    if (!canvas || !minimap) return;
    const ctx = canvas.getContext("2d"), mctx = minimap.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;
    const resize = () => { const rect = canvas.parentElement.getBoundingClientRect(); s.W = rect.width; s.H = Math.max(480, rect.height - 52); canvas.width = s.W * dpr; canvas.height = s.H * dpr; canvas.style.width = s.W + "px"; canvas.style.height = s.H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); minimap.width = 96 * dpr; minimap.height = 66 * dpr; minimap.style.width = "96px"; minimap.style.height = "66px"; mctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const roundRect = (x, y, w, h, radius) => { ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius); ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h); ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius); ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath(); };
    const applyPhysics = () => { if (!s.physicsOn) return; const repulse = 22000, springK = .022, damping = .88, centerK = .002; const totalKE = s.nodes.reduce((sum, n) => sum + n.vx * n.vx + n.vy * n.vy, 0); if (totalKE < .08 && s.tick > 120) { s.physicsOn = false; return; } s.nodes.forEach((n, i) => { let fx = 0, fy = 0; s.nodes.forEach((o, j) => { if (i === j) return; const dx = n.x - o.x, dy = n.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1; const f = d < n.r + o.r + 120 ? repulse * 2 / (d * d) : repulse / (d * d); fx += dx / d * f; fy += dy / d * f; }); n.fx = fx + (s.W / 2 - n.x) * centerK; n.fy = fy + (s.H / 2 - n.y) * centerK; }); s.edges.forEach(e => { const dx = e.toN.x - e.fromN.x, dy = e.toN.y - e.fromN.y, d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - 300) * springK, efx = dx / d * f, efy = dy / d * f; e.fromN.fx += efx; e.fromN.fy += efy; e.toN.fx -= efx; e.toN.fy -= efy; }); s.nodes.forEach(n => { if (n === s.drag) return; n.vx = Math.max(-6, Math.min(6, (n.vx + n.fx) * damping)); n.vy = Math.max(-6, Math.min(6, (n.vy + n.fy) * damping)); n.x += n.vx; n.y += n.vy; }); };
    const draw = () => {
      ctx.clearRect(0, 0, s.W, s.H); ctx.save(); ctx.translate(s.cam.x, s.cam.y); ctx.scale(s.cam.scale, s.cam.scale);
      const gs = 56, ox = -s.cam.x / s.cam.scale, oy = -s.cam.y / s.cam.scale, vw = s.W / s.cam.scale, vh = s.H / s.cam.scale;
      ctx.fillStyle = "rgba(255,255,255,.06)";
      for (let gx = Math.floor(ox / gs) * gs; gx < ox + vw + gs; gx += gs) for (let gy = Math.floor(oy / gs) * gs; gy < oy + vh + gs; gy += gs) { ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill(); }
      s.edges.forEach(e => { const f = e.fromN, t = e.toN, dx = t.x - f.x, dy = t.y - f.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d; const x1 = f.x + nx * f.r, y1 = f.y + ny * f.r, x2 = t.x - nx * t.r - nx * 8, y2 = t.y - ny * t.r - ny * 8; const active = s.selected && (s.selected.id === f.id || s.selected.id === t.id); if (active) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = f.color.fill + "44"; ctx.lineWidth = 6; ctx.stroke(); } ctx.setLineDash(e.type === "N:M" ? [6, 4] : []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = active ? f.color.fill : "rgba(217,79,61,.34)"; ctx.lineWidth = active ? 1.8 : 1; ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - nx * 9 - ny * 4.5, y2 - ny * 9 + nx * 4.5); ctx.lineTo(x2 - nx * 9 + ny * 4.5, y2 - ny * 9 - nx * 4.5); ctx.closePath(); ctx.fillStyle = active ? f.color.fill : "rgba(217,79,61,.50)"; ctx.fill(); { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, off = active ? 0 : 8, lx = mx - ny * off, ly = my + nx * off; ctx.font = `${active ? 600 : 500} ${active ? 10 : 9}px 'JetBrains Mono',monospace`; const tw = ctx.measureText(e.column).width + 16; ctx.fillStyle = active ? "rgba(10,10,14,.92)" : "rgba(10,10,14,.72)"; roundRect(lx - tw / 2, ly - 10, tw, 18, 5); ctx.fill(); ctx.strokeStyle = active ? f.color.fill + "66" : "rgba(217,79,61,.22)"; ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = active ? f.color.light : "rgba(252,165,165,.72)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e.column, lx, ly); } });
      s.nodes.forEach(n => { const active = s.selected === n, hover = s.hover === n; ctx.save(); ctx.translate(n.x, n.y); if (active || hover) { const g = ctx.createRadialGradient(0, 0, n.r * .6, 0, 0, n.r * 2.2); g.addColorStop(0, n.color.fill + (active ? "50" : "30")); g.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(0, 0, n.r * 2.2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); } const phase = (s.tick * .018 + s.nodes.indexOf(n) * 1.1) % (Math.PI * 2); ctx.beginPath(); ctx.arc(0, 0, n.r + 6 + Math.sin(phase) * 3, 0, Math.PI * 2); ctx.strokeStyle = n.color.fill; ctx.lineWidth = .7; ctx.globalAlpha = .18 + Math.sin(phase) * .08; ctx.stroke(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, n.r, 0, Math.PI * 2); const grad = ctx.createRadialGradient(-n.r * .25, -n.r * .25, 0, 0, 0, n.r); grad.addColorStop(0, n.color.fill + "2a"); grad.addColorStop(1, "#0a0a12"); ctx.fillStyle = grad; ctx.fill(); ctx.strokeStyle = n.color.fill; ctx.lineWidth = active ? 2 : 1.5; ctx.globalAlpha = active ? 1 : .75; ctx.stroke(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = n.color.fill + "cc"; ctx.fill(); ctx.font = "600 11px 'DM Sans',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = n.color.light; const words = n.id.replace(/_/g, " ").split(" "); if (words.length > 1) { ctx.fillText(words[0], 0, -12); ctx.fillText(words.slice(1).join(" "), 0, 4); } else ctx.fillText(n.id, 0, -7); ctx.font = "500 9px 'JetBrains Mono',monospace"; ctx.fillStyle = "rgba(255,255,255,.48)"; ctx.fillText(`${n.rowCount} lignes`, 0, 18); if (s.showLabels) { const linked = new Set(s.edges.filter(e => e.from === n.id || e.to === n.id).map(e => e.column)); const labelFont = Math.max(10, Math.min(15, 10 + s.cam.scale * 2.5)); n.headers.slice(0, 7).forEach((col, ci, cols) => { const a = -Math.PI * .7 + ci * ((Math.PI * 1.4) / Math.max(cols.length - 1, 1)), cr = n.r + 58, x = Math.cos(a) * cr, y = Math.sin(a) * cr, isLink = linked.has(col); ctx.beginPath(); ctx.moveTo(Math.cos(a) * n.r, Math.sin(a) * n.r); ctx.lineTo(x, y); ctx.strokeStyle = isLink ? "#34d399" : "rgba(255,255,255,.12)"; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, isLink ? 4 : 3, 0, Math.PI * 2); ctx.fillStyle = isLink ? "#34d399" : "rgba(255,255,255,.2)"; ctx.fill(); ctx.font = `500 ${labelFont}px 'JetBrains Mono',monospace`; ctx.fillStyle = isLink ? "#6ee7b7" : "rgba(255,255,255,.48)"; ctx.textAlign = Math.cos(a) > .1 ? "left" : Math.cos(a) < -.1 ? "right" : "center"; ctx.fillText(col.length > 18 ? col.slice(0, 18) + "..." : col, x + Math.cos(a) * 8, y + Math.sin(a) * 8); }); } ctx.restore(); });
      ctx.restore();
      mctx.clearRect(0, 0, 96, 66); mctx.fillStyle = "rgba(13,13,18,.72)"; mctx.fillRect(0, 0, 96, 66);
      if (s.nodes.length) { const xs = s.nodes.map(n => n.x), ys = s.nodes.map(n => n.y), minX = Math.min(...xs) - 70, maxX = Math.max(...xs) + 70, minY = Math.min(...ys) - 70, maxY = Math.max(...ys) + 70, ms = Math.min(86 / Math.max(1, maxX - minX), 58 / Math.max(1, maxY - minY)); s.edges.forEach(e => { mctx.beginPath(); mctx.moveTo(5 + (e.fromN.x - minX) * ms, 4 + (e.fromN.y - minY) * ms); mctx.lineTo(5 + (e.toN.x - minX) * ms, 4 + (e.toN.y - minY) * ms); mctx.strokeStyle = "rgba(217,79,61,.35)"; mctx.stroke(); }); s.nodes.forEach(n => { mctx.beginPath(); mctx.arc(5 + (n.x - minX) * ms, 4 + (n.y - minY) * ms, 4, 0, Math.PI * 2); mctx.fillStyle = n.color.fill; mctx.fill(); }); }
    };
    const loop = () => { s.tick++; applyPhysics(); draw(); s.raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(() => { resize(); fitView(); }); ro.observe(canvas.parentElement); resize(); fitView(); loop();
    return () => { cancelAnimationFrame(s.raf); ro.disconnect(); };
  }, [fitView]);
  const screenToWorld = useCallback((sx, sy) => { const s = stateRef.current; return { x: (sx - s.cam.x) / s.cam.scale, y: (sy - s.cam.y) / s.cam.scale }; }, []);
  const nodeAt = useCallback((x, y) => stateRef.current.nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.r + 10) || null, []);
  const handleMouseDown = e => { const rect = canvasRef.current.getBoundingClientRect(), sx = e.clientX - rect.left, sy = e.clientY - rect.top, w = screenToWorld(sx, sy), n = nodeAt(w.x, w.y), s = stateRef.current; if (n) { s.drag = n; s.dragStart = { x: sx, y: sy }; n.vx = 0; n.vy = 0; } else { s.panStart = { x: sx, y: sy }; s.panCam = { ...s.cam }; } };
  const handleMouseMove = e => { const rect = canvasRef.current.getBoundingClientRect(), sx = e.clientX - rect.left, sy = e.clientY - rect.top, w = screenToWorld(sx, sy), s = stateRef.current; if (s.drag) { s.drag.x = w.x; s.drag.y = w.y; return; } if (s.panStart) { s.cam.x = s.panCam.x + sx - s.panStart.x; s.cam.y = s.panCam.y + sy - s.panStart.y; return; } s.hover = nodeAt(w.x, w.y); canvasRef.current.style.cursor = s.hover ? "pointer" : "grab"; };
  const handleMouseUp = e => { const s = stateRef.current; if (s.drag && s.dragStart) { const rect = canvasRef.current.getBoundingClientRect(), sx = e.clientX - rect.left, sy = e.clientY - rect.top; if (Math.abs(sx - s.dragStart.x) + Math.abs(sy - s.dragStart.y) < 6) { s.selected = s.selected === s.drag ? null : s.drag; setSelectedNode(s.selected); setPanelOpen(!!s.selected); onSelectTable(s.selected?.id || null); } } s.drag = null; s.panStart = null; s.dragStart = null; };
  const handleWheel = useCallback(e => { e.preventDefault(); const rect = canvasRef.current.getBoundingClientRect(), sx = e.clientX - rect.left, sy = e.clientY - rect.top, before = screenToWorld(sx, sy), s = stateRef.current; s.cam.scale = Math.max(.25, Math.min(3.5, s.cam.scale * (e.deltaY < 0 ? 1.12 : .9))); const after = screenToWorld(sx, sy); s.cam.x += (after.x - before.x) * s.cam.scale; s.cam.y += (after.y - before.y) * s.cam.scale; }, [screenToWorld]);
  useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; canvas.addEventListener("wheel", handleWheel, { passive: false }); return () => canvas.removeEventListener("wheel", handleWheel); }, [handleWheel]);
  if (!tables.length) return <div style={{ height, background: C.canvas, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,.28)", flexDirection: "column", gap: 10 }}><Network size={32} style={{ opacity: .3 }} /><span style={{ fontSize: 13 }}>Aucune table à afficher</span></div>;
  const nodeRels = selectedNode ? stateRef.current.edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id) : [];
  const linkedCols = new Set(nodeRels.map(e => e.column));
  return (
    <div className="force-canvas-root" style={{ height, border: "1px solid rgba(255,255,255,.07)", borderTop: 0, borderRadius: fullscreen ? 0 : "0 0 14px 14px" }}>
      <canvas ref={canvasRef} style={{ display: "block", cursor: "grab" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
      <div className={`graph-panel${panelOpen ? "" : " closed"}`}>
        {selectedNode && <><div className="graph-panel-header"><div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedNode.color.fill, flexShrink: 0 }} /><div style={{ fontSize: 12, fontWeight: 700, color: "#e4e4e7", flex: 1, fontFamily: "'JetBrains Mono',monospace" }}>{selectedNode.id}</div><button onClick={() => { stateRef.current.selected = null; setSelectedNode(null); setPanelOpen(false); onSelectTable(null); }} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}><X size={13} /></button></div><div className="graph-panel-body"><div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" }}>Aperçu</div>{[["Colonnes", selectedNode.headers.length], ["Lignes", selectedNode.rowCount.toLocaleString("fr-FR")], ["Relations", nodeRels.length]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,.04)", fontSize: 12 }}><span style={{ color: "#a1a1aa" }}>{k}</span><span style={{ fontFamily: "'JetBrains Mono',monospace", color: "#fca5a5", fontSize: 11 }}>{v}</span></div>)}<div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 8 }}>{selectedNode.headers.map(col => <span key={col} style={{ padding: "2px 7px", borderRadius: 5, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", background: linkedCols.has(col) ? "rgba(52,211,153,.12)" : "rgba(255,255,255,.04)", color: linkedCols.has(col) ? "#34d399" : "#a1a1aa", border: linkedCols.has(col) ? "1px solid rgba(52,211,153,.25)" : "1px solid rgba(255,255,255,.07)" }}>{col.length > 15 ? col.slice(0, 15) + "..." : col}</span>)}</div></div></>}
      </div>
      <div className="graph-legend"><div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#71717a" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red }} />Table</div><div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#71717a" }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }} />Colonne liée</div><div className="graph-control-cluster"><button className={`graph-btn${physicsOn ? " active" : ""}`} onClick={() => setPhysicsOn(p => !p)}>Physics</button><button className={`graph-btn${showLabels ? " active" : ""}`} onClick={() => setShowLabels(p => !p)}>Colonnes</button><button className="graph-btn" onClick={fitView}>Ajuster</button></div></div>
      <canvas ref={minimapRef} className="graph-minimap" />
      <div className="graph-hint">Glisser · molette pour zoomer · clic pour inspecter</div>
    </div>
  );
}

/* ─── WIZARD STEPS ──────────────────────────────────────────── */
function ExplorationStep({ data, setData, schema, selectedTable, setSelectedTable }) {
  const [graphView, setGraphView] = useState("erd");
  const [graphFullscreen, setGraphFullscreen] = useState(false);
  useEffect(() => { document.body.classList.toggle("integration-graph-fullscreen", graphFullscreen); return () => document.body.classList.remove("integration-graph-fullscreen"); }, [graphFullscreen]);
  const tableInfo = schema?.tables?.find(t => t.name === selectedTable);
  const graphHeight = graphFullscreen ? Math.max(window.innerHeight - 43, 520) : 460;
  const graphShellStyle = graphFullscreen ? { position: "fixed", inset: 0, zIndex: 10020, borderRadius: 0, overflow: "hidden", background: C.canvas, boxShadow: "none" } : { borderRadius: 14, overflow: "hidden" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>Schéma filtré — <strong>{schema?.tables?.length || 0} tables</strong> · <strong>{schema?.rels?.length || 0} relations</strong></InfoBox>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="tab-bar">
          <button className={`tab${graphView === "erd" ? " active" : ""}`} onClick={() => setGraphView("erd")}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Table2 size={12} /> Vue ERD</span></button>
          <button className={`tab${graphView === "force" ? " active" : ""}`} onClick={() => setGraphView("force")}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Network size={12} /> Force Graph</span></button>
        </div>
      </div>
      {schema ? (
        <>
          {graphView === "erd" && (<div style={graphShellStyle}><div className="schema-toolbar"><div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#D94F3D,#e86b59)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Table2 size={11} color="#fff" /></div><div style={{ fontSize: 11, fontWeight: 600, color: "#e4e4e7" }}>Schéma ERD</div><div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: "rgba(217,79,61,.18)", color: "#fca5a5", border: "1px solid rgba(217,79,61,.3)" }}>{schema?.rels?.length || 0} relations</div><button onClick={() => setGraphFullscreen(v => !v)} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", color: "#d4d4d8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{graphFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button></div><SchemaERD schema={schema} tableRoles={data.tableRoles || {}} onSelectTable={setSelectedTable} selectedTable={selectedTable} height={graphHeight} fullscreen={graphFullscreen} /></div>)}
          {graphView === "force" && (<div style={graphShellStyle}><div className="schema-toolbar"><div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Network size={11} color="#fff" /></div><div style={{ fontSize: 11, fontWeight: 600, color: "#e4e4e7" }}>Force Graph</div><div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: "rgba(59,130,246,.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,.3)" }}>{schema?.tables?.length || 0} tables</div><button onClick={() => setGraphFullscreen(v => !v)} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", color: "#d4d4d8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{graphFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button></div><SchemaForceGraph schema={schema} onSelectTable={setSelectedTable} selectedTable={selectedTable} height={graphHeight} fullscreen={graphFullscreen} /></div>)}
          {tableInfo && (<div className="fade-in" style={{ background: "#fff", border: `1px solid ${C.g200}`, borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.g900, fontFamily: "'JetBrains Mono',monospace" }}>{tableInfo.name}</span><span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: C.g100, color: C.g500 }}>{tableInfo.rowCount.toLocaleString()} lignes</span></div><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{tableInfo.cols.map(col => (<span key={col} style={{ padding: "2px 8px", borderRadius: 5, background: C.g100, border: `1px solid ${C.g200}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g700 }}>{col}</span>))}</div></div>)}
        </>
      ) : (<div style={{ padding: "3rem", textAlign: "center", color: C.g400 }}><Database size={36} style={{ display: "block", margin: "0 auto 12px", opacity: .35 }} /><p style={{ fontSize: 13 }}>Connexion requise (étape 2)</p></div>)}
    </div>
  );
}

function IdentityStep({ data, setData }) {
  const authFields = AUTH_FIELDS[data.authType] || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.red}>Définissez l'identité du connecteur ERP et son mode d'authentification.</InfoBox>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1/-1" }}><label className="label">Nom du connecteur</label><input value={data.name || ""} onChange={e => setData({ ...data, name: e.target.value })} className="input" placeholder="ex: SAP S/4HANA Production" /></div>
        <div><label className="label">Type</label><select value={data.connectorType || "ERP"} onChange={e => setData({ ...data, connectorType: e.target.value })} className="select"><option value="ERP">ERP</option><option value="DATA_SOURCE">Source de données</option><option value="ACCOUNTING">Comptabilité</option></select></div>
        <div><label className="label">Authentification</label><select value={data.authType || "NONE"} onChange={e => setData({ ...data, authType: e.target.value })} className="select"><option value="NONE">Aucune</option><option value="BASIC">Basic Auth</option><option value="API_KEY">API Key</option><option value="OAUTH2">OAuth 2.0</option><option value="JWT_SIGNED">JWT Signé</option><option value="SAML">SAML 2.0</option></select></div>
        <div><label className="label">Logo (2 lettres)</label><input value={data.logo || ""} maxLength={2} onChange={e => setData({ ...data, logo: e.target.value })} className="input" placeholder="SG" /></div>
        <div><label className="label">Couleur principale</label><div style={{ display: "flex", gap: 8 }}><input type="color" value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} style={{ width: 40, height: 40, padding: 2, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }} /><input value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} className="input" style={{ flex: 1 }} /></div></div>
        <div style={{ gridColumn: "1/-1" }}><label className="label">Description</label><input value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} className="input" placeholder="Connecteur ERP…" /></div>
      </div>
      {authFields.length > 0 && (<div><div style={{ fontSize: 11, fontWeight: 700, color: C.g700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Settings2 size={13} color={C.red} /> Détails d'authentification ({data.authType})</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{authFields.map(f => (<div key={f.key} style={{ gridColumn: f.type === "textarea" ? "1/-1" : "auto" }}><label className="label">{f.label}</label>{f.type === "textarea" ? <textarea value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" rows={4} style={{ resize: "vertical", height: 90 }} /> : f.type === "select" ? <select value={data[f.key] || (f.options?.[0] || "")} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="select">{f.options?.map(o => <option key={o} value={o}>{o}</option>)}</select> : <input type={f.type} value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" placeholder={f.placeholder || ""} />}</div>))}</div></div>)}
    </div>
  );
}

function ConnectionStep({ data, setData, schema }) {
  const [testState, setTestState] = useState(null);
  const connTypes = [{ id: "jdbc", label: "JDBC", Icon: Database, desc: "Base SQL directe" }, { id: "api", label: "API REST", Icon: Network, desc: "Endpoint HTTP" }, { id: "csv", label: "Fichier CSV", Icon: Layers, desc: "Import fichier" }];
  const allTables = schema?.tables || [];
  const selectedTables = data.selectedTables || [];
  const toggleTable = name => setData({ ...data, selectedTables: selectedTables.includes(name) ? selectedTables.filter(t => t !== name) : [...selectedTables, name] });
  const csvFiles = data.csvFiles || [];
  const apiResources = data.apiResources || [];
  const parseCsvFiles = async (files) => {
    const parsed = await Promise.all(Array.from(files || []).map(async (file) => {
      const text = await file.text();
      const firstLine = text.split(/\r?\n/).find(line => line.trim()) || "";
      const delimiter = firstLine.includes(";") ? ";" : ",";
      const cols = firstLine.split(delimiter).map(col => col.trim().replace(/^"|"$/g, "")).filter(Boolean);
      const rowCount = Math.max(0, text.split(/\r?\n/).filter(line => line.trim()).length - 1);
      return { name: file.name, tableName: normalizeTableName(file.name), cols, rowCount };
    }));
    const nextFiles = [...csvFiles, ...parsed];
    const nextSchema = buildCsvSchema(nextFiles);
    setData({ ...data, connectionType: "csv", csvFiles: nextFiles, selectedTables: nextSchema.tables.map(t => t.name) });
  };
  const addCsvPreset = (preset) => {
    const exists = csvFiles.some(file => file.name === preset.name);
    const nextFiles = exists ? csvFiles.filter(file => file.name !== preset.name) : [...csvFiles, preset];
    const nextSchema = buildCsvSchema(nextFiles);
    setData({ ...data, connectionType: "csv", csvFiles: nextFiles, selectedTables: nextSchema.tables.map(t => t.name) });
  };
  const removeCsvFile = (name) => {
    const nextFiles = csvFiles.filter(file => file.name !== name);
    const nextSchema = buildCsvSchema(nextFiles);
    setData({ ...data, csvFiles: nextFiles, selectedTables: (data.selectedTables || []).filter(t => nextSchema.tables.some(table => table.name === t)) });
  };
  const updateApiResource = (index, patch) => {
    const next = apiResources.map((resource, i) => i === index ? { ...resource, ...patch } : resource);
    const nextSchema = buildApiSchema(next);
    setData({ ...data, apiResources: next, selectedTables: nextSchema.tables.map(t => t.name) });
  };
  const addApiResource = () => {
    const next = [...apiResources, { name: `resource_${apiResources.length + 1}`, path: data.apiEndpoint || "/api/resource", cols: ["id", "date", "amount", "status"], rowCount: 100 }];
    const nextSchema = buildApiSchema(next);
    setData({ ...data, connectionType: "api", apiResources: next, selectedTables: nextSchema.tables.map(t => t.name) });
  };
  const removeApiResource = (index) => {
    const next = apiResources.filter((_, i) => i !== index);
    const nextSchema = buildApiSchema(next);
    setData({ ...data, apiResources: next, selectedTables: (data.selectedTables || []).filter(t => nextSchema.tables.some(table => table.name === t)) });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div><label className="label" style={{ marginBottom: 8 }}>Type de connexion</label><div style={{ display: "flex", gap: 8 }}>{connTypes.map(t => (<div key={t.id} onClick={() => setData({ ...data, connectionType: t.id })} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center", background: data.connectionType === t.id ? "rgba(217,79,61,.08)" : "rgba(248,247,245,.8)", border: `1.5px solid ${data.connectionType === t.id ? C.red : C.g200}` }}><div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><t.Icon size={22} color={data.connectionType === t.id ? C.red : C.g400} /></div><div style={{ fontSize: 12, fontWeight: 700, color: data.connectionType === t.id ? C.red : C.g700 }}>{t.label}</div><div style={{ fontSize: 10, color: C.g400, marginTop: 2 }}>{t.desc}</div></div>))}</div></div>
      {data.connectionType === "jdbc" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div><label className="label">URL JDBC</label><input value={data.jdbcUrl || ""} onChange={e => setData({ ...data, jdbcUrl: e.target.value })} className="input mono" style={{ fontSize: 11 }} placeholder="jdbc:postgresql://host:5432/erp_db" /></div><div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><label className="label">Utilisateur</label><input value={data.jdbcUsername || ""} onChange={e => setData({ ...data, jdbcUsername: e.target.value })} className="input" /></div><div style={{ flex: 1 }}><label className="label">Mot de passe</label><input type="password" value={data.jdbcPassword || ""} onChange={e => setData({ ...data, jdbcPassword: e.target.value })} className="input" /></div></div></div>)}
      {data.connectionType === "csv" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div style={{ padding: "14px", borderRadius: 12, border: `1.5px dashed ${C.g300}`, background: "rgba(248,247,245,.65)" }}><label className="label">Sources CSV de test</label><div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginTop: 8 }}>{CSV_SOURCE_PRESETS.map(preset => { const selected = csvFiles.some(file => file.name === preset.name); return <button key={preset.name} type="button" onClick={() => addCsvPreset(preset)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 11, cursor: "pointer", background: selected ? "rgba(217,79,61,.08)" : "#fff", border: `1.5px solid ${selected ? C.red : C.g200}`, fontFamily: "inherit" }}><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}><FileText size={13} color={selected ? C.red : C.g400} /><span style={{ fontSize: 11, fontWeight: 800, color: selected ? C.red : C.g800 }}>{preset.label}</span></div><div className="mono" style={{ fontSize: 10, color: C.g500 }}>{normalizeTableName(preset.tableName)}</div><div style={{ fontSize: 10, color: C.g400, marginTop: 3 }}>{preset.cols.length} colonnes · {preset.rowCount} lignes</div></button>; })}</div><div style={{ fontSize: 10, color: C.g400, marginTop: 8 }}>Sélectionnez une ou plusieurs sources mock pour tester Facture, Commande et Budget sans backend.</div></div><div style={{ padding: "14px", borderRadius: 12, border: `1.5px dashed ${C.g300}`, background: "rgba(248,247,245,.65)" }}><label className="label">Importer vos propres fichiers CSV</label><input type="file" accept=".csv,text/csv" multiple onChange={e => parseCsvFiles(e.target.files)} className="input" style={{ marginTop: 6 }} /><div style={{ fontSize: 10, color: C.g400, marginTop: 6 }}>Chaque fichier est traité comme une table importable.</div></div>{csvFiles.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{csvFiles.map(file => <div key={file.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.g200}`, background: "#fff" }}><FileText size={13} color={C.red} /><div style={{ flex: 1, minWidth: 0 }}><div className="mono" style={{ fontSize: 11, fontWeight: 800, color: C.g800 }}>{normalizeTableName(file.tableName || file.name)}</div><div style={{ fontSize: 10, color: C.g400 }}>{file.type ? `${file.type} · ` : ""}{file.name} · {(file.cols || []).length} colonnes · {file.rowCount || 0} lignes</div></div><button type="button" className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 8px" }} onClick={() => removeCsvFile(file.name)}><X size={11} /> Retirer</button></div>)}</div>}</div>)}
      {data.connectionType === "api" && (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}><div><label className="label">Endpoint de base</label><input value={data.apiEndpoint || ""} onChange={e => setData({ ...data, apiEndpoint: e.target.value })} className="input mono" placeholder="https://api.exemple.com" /></div><div><label className="label">Token API</label><input value={data.apiAuthToken || ""} onChange={e => setData({ ...data, apiAuthToken: e.target.value })} className="input" placeholder="Bearer / API key" /></div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div><label className="label" style={{ marginBottom: 2 }}>Ressources API</label><div style={{ fontSize: 10, color: C.g400 }}>Chaque ressource est considérée comme une table.</div></div><button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={addApiResource}><Plus size={12} /> Ressource</button></div>{apiResources.map((resource, index) => <div key={index} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1.2fr 32px", gap: 8, alignItems: "center", padding: 10, borderRadius: 10, border: `1px solid ${C.g200}`, background: "#fff" }}><input className="input mono" value={resource.name || ""} onChange={e => updateApiResource(index, { name: e.target.value })} placeholder="factures" /><input className="input mono" value={resource.path || ""} onChange={e => updateApiResource(index, { path: e.target.value })} placeholder="/factures" /><input className="input mono" value={(resource.cols || []).join(", ")} onChange={e => updateApiResource(index, { cols: e.target.value.split(",").map(x => x.trim()).filter(Boolean) })} placeholder="id, date, amount" /><button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={() => removeApiResource(index)}><X size={12} /></button></div>)}</div>)}
      {data.connectionType !== "csv" && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => { setTestState("testing"); setTimeout(() => setTestState("ok"), 1200); }}>{testState === "testing" ? <RefreshCw size={12} className="spin" /> : <Zap size={12} />} Tester la connexion</button>{testState === "ok" && <span style={{ fontSize: 11, color: C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> Connexion réussie</span>}</div>}
      {allTables.length > 0 && (<div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}><div><label className="label" style={{ marginBottom: 2 }}>Tables disponibles</label><div style={{ fontSize: 10, color: C.g400 }}>{allTables.length} tables détectées</div></div><div style={{ display: "flex", gap: 6 }}><button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: allTables.map(t => t.name) })}>Tout</button><button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: [] })}>Effacer</button></div></div><div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", maxHeight: 260, overflowY: "auto" }} className="scroll">{allTables.map((t, i) => { const sel = selectedTables.includes(t.name); return (<div key={t.name} onClick={() => toggleTable(t.name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: sel ? "rgba(217,79,61,.04)" : i % 2 === 0 ? "rgba(248,247,245,.5)" : "#fff", borderBottom: i < allTables.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none" }}><div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? C.red : C.g300}`, background: sel ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={11} color="#fff" />}</div><span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.red : C.g700, flex: 1 }}>{t.name}</span><span style={{ fontSize: 10, color: C.g400 }}>{t.cols.length} cols · {t.rowCount.toLocaleString()} lignes</span></div>); })}</div></div>)}
    </div>
  );
}

function BudgetFormulaBuilder({ data, setData, schema, connId }) {
  const presets = BUDGET_PRESETS[connId] || BUDGET_PRESETS.generic || [];
  const [activePreset, setActivePreset] = useState(data.budgetPreset || null);
  const [formulaTokens, setFormulaTokens] = useState(data.budgetFormula || []);
  const [aggregation, setAggregation] = useState(data.budgetAgg || "SUM");
  const [previewResult, setPreviewResult] = useState(null);
  const budgetTables = data.budgetSourceTables || [];
  const allBudgetCols = budgetTables.flatMap(tn => { const t = schema?.tables?.find(t => t.name === tn); return (t?.cols || []).map(c => ({ table: tn, col: c })); });
  const applyPreset = preset => { setActivePreset(preset.id); setFormulaTokens(preset.formula); setData({ ...data, budgetPreset: preset.id, budgetFormula: preset.formula }); };
  const addToken = token => { const next = [...formulaTokens, token]; setFormulaTokens(next); setData({ ...data, budgetFormula: next }); };
  const removeToken = idx => { const next = formulaTokens.filter((_, i) => i !== idx); setFormulaTokens(next); setData({ ...data, budgetFormula: next }); };
  const clearFormula = () => { setFormulaTokens([]); setData({ ...data, budgetFormula: [] }); };
  const generatePreview = () => { setPreviewResult("computing"); setTimeout(() => setPreviewResult({ value: (Math.random() * 500000 + 50000).toFixed(2), currency: "TND" }), 800); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {presets.length > 0 && (<div><div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Modèles prédéfinis</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{presets.map(preset => (<button key={preset.id} onClick={() => applyPreset(preset)} style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: activePreset === preset.id ? "rgba(217,79,61,.08)" : "#fff", border: `1.5px solid ${activePreset === preset.id ? C.red : C.g200}`, minWidth: 160 }}><div style={{ fontSize: 12, fontWeight: 700, color: activePreset === preset.id ? C.red : C.g800 }}>{preset.name}</div><div style={{ fontSize: 10, color: C.g400, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{preset.desc}</div></button>))}</div></div>)}
      <div className="budget-section">
        <div className="budget-section-hdr"><div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={12} color={C.success} /></div><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Formule de calcul</div></div></div>
        <div className="budget-section-body">
          <div style={{ marginBottom: 10 }}><div className="formula-drop" style={{ borderColor: formulaTokens.length > 0 ? "rgba(34,197,94,.3)" : "#e5e7eb" }}>{formulaTokens.length === 0 ? <span style={{ fontSize: 11, color: C.g400 }}>Sélectionnez des colonnes et opérateurs…</span> : formulaTokens.map((tok, i) => (<div key={i} className={`formula-node ${tok.type === "op" ? "op" : tok.type === "agg" ? "agg" : "col"}`} onClick={() => removeToken(i)} title="Clic pour supprimer">{tok.type === "op" ? tok.op : tok.type === "agg" ? `${tok.fn}(${tok.label || tok.col})` : tok.label || tok.col}<X size={10} /></div>))}</div>{formulaTokens.length > 0 && <button onClick={clearFormula} style={{ fontSize: 10, color: C.g400, background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Effacer</button>}</div>
          {allBudgetCols.length > 0 && (<div style={{ marginBottom: 10 }}><div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Colonnes disponibles</div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{allBudgetCols.map(({ table, col }) => (<button key={`${table}.${col}`} className="col-chip" onClick={() => addToken({ type: "agg", fn: aggregation, table, col, label: `${table}.${col}` })}><span style={{ opacity: .6 }}>{table}.</span>{col}</button>))}</div></div>)}
          <div><div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Opérateurs</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["＋", "−", "×", "÷", "(", ")"].map(op => <button key={op} className="formula-op-badge" onClick={() => addToken({ type: "op", op })}>{op}</button>)}<div style={{ width: 1, background: C.g200, margin: "0 4px" }} />{["SUM", "AVG", "MAX", "COUNT"].map(fn => (<button key={fn} className="formula-node agg" style={{ cursor: "pointer", fontSize: 11, padding: "3px 9px" }} onClick={() => setAggregation(fn)}><span style={{ fontWeight: aggregation === fn ? 800 : 500 }}>{fn}</span>{aggregation === fn && <CheckCircle2 size={9} />}</button>))}</div></div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}><button className="btn btn-primary" onClick={generatePreview} disabled={formulaTokens.length === 0 && !activePreset}><FlaskConical size={13} /> Tester</button>{previewResult === "computing" && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.g500 }}><RefreshCw size={12} className="spin" /> Calcul…</div>}{previewResult && previewResult !== "computing" && (<div style={{ padding: "8px 14px", borderRadius: 10, background: C.successLight, border: `1px solid ${C.successBorder}` }}><div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>{parseFloat(previewResult.value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {previewResult.currency}</div></div>)}</div>
    </div>
  );
}

function BudgetStep({ data, setData, schema, connId }) {
  const allTables = schema?.tables || [];
  const budgetSourceTables = data.budgetSourceTables || [];
  const toggleSourceTable = name => setData({ ...data, budgetSourceTables: budgetSourceTables.includes(name) ? budgetSourceTables.filter(t => t !== name) : [...budgetSourceTables, name] });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.success}><strong>Configuration du moteur budgétaire</strong></InfoBox>
      <SectionAccordion icon={<Database size={13} color={C.success} />} title="Tables sources du budget">
        {allTables.length === 0 ? <div style={{ fontSize: 12, color: C.g400, textAlign: "center", padding: "1rem" }}>Sélectionnez des tables à l'étape Connexion</div> : (<div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{allTables.map(t => { const sel = budgetSourceTables.includes(t.name); return (<div key={t.name} onClick={() => toggleSourceTable(t.name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? "rgba(34,197,94,.06)" : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? "rgba(34,197,94,.35)" : "transparent"}` }}><div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.success : C.g300}`, background: sel ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div><span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.g800 : C.g600 }}>{t.name}</span></div>); })}</div>)}
      </SectionAccordion>
      <BudgetFormulaBuilder data={data} setData={setData} schema={schema} connId={connId} />
    </div>
  );
}

/* ─── PIPELINES STEP (updated with visual join builder) ──────── */
function PipelinesStep({ data, setData, schema }) {
  const selectedTables = data.selectedTables || [];
  const pipelines = data.pipelines || {};
  const customPipelines = data.customPipelines || [];
  const activeTables = (schema?.tables || []).filter(t => selectedTables.includes(t.name));
  const [activeTab, setActiveTab] = useState("facture");
  const [newPipelineName, setNewPipelineName] = useState("");
  const [showAddPipeline, setShowAddPipeline] = useState(false);

  const addCustomPipeline = () => {
    if (!newPipelineName.trim()) return;
    const id = `custom_${Date.now()}`;
    const colorIdx = customPipelines.length % CUSTOM_PIPELINE_COLORS.length;
    setData({ ...data, customPipelines: [...customPipelines, { id, label: newPipelineName.trim(), color: CUSTOM_PIPELINE_COLORS[colorIdx] }] });
    setNewPipelineName(""); setShowAddPipeline(false); setActiveTab(id);
  };
  const removeCustomPipeline = id => { const next = customPipelines.filter(cp => cp.id !== id); const nextPipelines = { ...pipelines }; delete nextPipelines[id]; setData({ ...data, customPipelines: next, pipelines: nextPipelines }); setActiveTab("facture"); };
  const setPipeline = (k, v) => setData({ ...data, pipelines: { ...pipelines, [k]: v } });
  const isBuiltin = activeTab === "facture" || activeTab === "commande";
  const builtinDef = isBuiltin ? PIPELINE_DEFS[activeTab] : null;
  const customDef = !isBuiltin ? customPipelines.find(cp => cp.id === activeTab) : null;
  const plColor = builtinDef?.color || customDef?.color || C.g400;
  const plLabel = builtinDef?.label || customDef?.label || activeTab;
  const PlIcon = builtinDef?.Icon || Settings2;
  const pl = pipelines[activeTab] || { enabled: true, tables: [], joins: [], conditions: [], fieldMappings: {}, extraFields: [], userFields: [], groupByCols: [] };
  const setPl = val => setPipeline(activeTab, val);
  const toggleTable = tname => setPl({ ...pl, tables: pl.tables.includes(tname) ? pl.tables.filter(t => t !== tname) : [...pl.tables, tname] });
  const plTables = activeTables.filter(t => (pl.tables || []).includes(t.name));
  const plCols = plTables.flatMap(t => t.cols.map(c => ({ full: `${t.name}.${c}`, table: t.name, col: c })));
  const fixedFields = builtinDef?.fixedFields || [];
  const userFields = pl.userFields || [];
  const addUserField = () => { const id = `field_${Date.now()}`; setPl({ ...pl, userFields: [...userFields, { id, key: "", label: "", type: "text", required: false }] }); };
  const updateUserField = (id, field, value) => { const nextFields = userFields.map(f => f.id === id ? { ...f, [field]: value } : f); setPl({ ...pl, userFields: nextFields }); };
  const removeUserField = (id) => { const field = userFields.find(f => f.id === id); const nextMappings = { ...(pl.fieldMappings || {}) }; if (field?.key) delete nextMappings[field.key]; setPl({ ...pl, userFields: userFields.filter(f => f.id !== id), fieldMappings: nextMappings }); };
  const setUserFieldMapping = (field, value) => { if (!field.key) return; setPl({ ...pl, fieldMappings: { ...(pl.fieldMappings || {}), [field.key]: value } }); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>Configurez les pipelines métier — tables, jointures, mapping.</InfoBox>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        {["facture", "commande"].map(key => { const def = PIPELINE_DEFS[key], Icon = def.Icon; return (<button key={key} onClick={() => setActiveTab(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${activeTab === key ? def.color : "transparent"}`, background: activeTab === key ? `${def.color}12` : "transparent", color: activeTab === key ? def.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}><Icon size={13} /> {def.label}</button>); })}
        {customPipelines.map(cp => (<div key={cp.id} style={{ display: "flex" }}><button onClick={() => setActiveTab(cp.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderRight: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}><Settings2 size={13} /> {cp.label}</button><button onClick={() => removeCustomPipeline(cp.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "7px 7px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderLeft: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g400, cursor: "pointer" }}><X size={11} /></button></div>))}
        {!showAddPipeline ? (<button onClick={() => setShowAddPipeline(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 10, border: `1.5px dashed ${C.g300}`, background: "transparent", color: C.g400, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}><Plus size={12} /> Nouveau pipeline</button>) : (<div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 8px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "#fff" }}><input value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomPipeline()} autoFocus className="input" style={{ width: 160, fontSize: 11, padding: "4px 8px", height: 30 }} placeholder="Nom du pipeline…" /><button className="btn btn-primary" style={{ fontSize: 10, padding: "4px 10px", height: 30 }} onClick={addCustomPipeline} disabled={!newPipelineName.trim()}>Créer</button><button onClick={() => setShowAddPipeline(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400 }}><X size={13} /></button></div>)}
      </div>

      {/* Pipeline header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `${plColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><PlIcon size={16} color={plColor} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.g900 }}>Pipeline {plLabel}</div></div>
        <Toggle checked={pl.enabled !== false} onChange={v => setPl({ ...pl, enabled: v })} />
      </div>

      {pl.enabled !== false && (
        <>
          <SectionAccordion icon={<Database size={13} color={C.red} />} title="Tables sources">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {activeTables.length === 0 ? <div style={{ fontSize: 12, color: C.g400, textAlign: "center", padding: "1rem" }}>Sélectionnez des tables à l'étape Connexion</div> :
                activeTables.map(t => { const sel = pl.tables.includes(t.name); return (<div key={t.name} onClick={() => toggleTable(t.name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? `${plColor}08` : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? plColor + "40" : "transparent"}` }}><div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? plColor : C.g300}`, background: sel ? plColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div><span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{t.name}</span></div>); })}
            </div>
          </SectionAccordion>

          {/* ── NEW: Visual Join Builder ── */}
          {pl.tables.length > 1 && (
            <SectionAccordion icon={<Link2 size={13} color={C.warning} />} title="Jointures (JOIN)" subtitle={`${pl.tables.length} tables — configurez les conditions ON`}>
              <VisualJoinBuilder
                tables={pl.tables}
                joins={pl.joins || []}
                onChange={(joins) => setPl({ ...pl, joins })}
              />
            </SectionAccordion>
          )}

          <SectionAccordion icon={<GitBranch size={13} color={plColor} />} title="Mapping des champs">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fixedFields.length > 0 && (<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{fixedFields.map(f => (<div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "rgba(248,247,245,.8)", borderRadius: 9, border: "1px solid #e5e7eb" }}><div style={{ minWidth: 160, flexShrink: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.g800 }}>{f.label}</div>{f.required && <div style={{ fontSize: 9, color: C.red }}>Requis</div>}</div><span style={{ color: C.g300 }}>→</span><select value={(pl.fieldMappings || {})[f.key] || ""} onChange={e => setPl({ ...pl, fieldMappings: { ...(pl.fieldMappings || {}), [f.key]: e.target.value } })} className="select" style={{ flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}><option value="">-- Sélectionner colonne --</option>{plCols.map(c => <option key={c.full} value={c.full}>{c.full}</option>)}</select>{(pl.fieldMappings || {})[f.key] && <CheckCircle2 size={14} color={C.success} />}</div>))}</div>)}
              {(fixedFields.length === 0 || builtinDef?.allowExtraFields) && (<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700, color: C.g800 }}>Champs personnalisés</div><div style={{ fontSize: 10, color: C.g400 }}>Définissez les champs du pipeline puis associez-les aux colonnes sources.</div></div><button type="button" onClick={addUserField} className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 10px", borderColor: `${plColor}30`, color: plColor, background: `${plColor}0D` }}><Plus size={12} /> Ajouter un champ</button></div>
                {userFields.length === 0 ? (<div style={{ fontSize: 11, color: C.g400, padding: "10px 12px", background: "rgba(248,247,245,.75)", borderRadius: 9, border: "1px dashed #d1d5db" }}>Aucun champ personnalisé. Ajoutez un champ pour configurer un nouveau pipeline métier.</div>) : userFields.map((field) => (<div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 105px 86px 1.25fr 28px", gap: 8, alignItems: "center", padding: "8px 10px", background: "rgba(248,247,245,.8)", borderRadius: 10, border: `1px solid ${plColor}22` }}><input value={field.key} onChange={e => updateUserField(field.id, "key", e.target.value.trim())} className="input mono" style={{ fontSize: 10, height: 34 }} placeholder="cle_champ" /><input value={field.label} onChange={e => updateUserField(field.id, "label", e.target.value)} className="input" style={{ fontSize: 11, height: 34 }} placeholder="Libellé" /><select value={field.type || "text"} onChange={e => updateUserField(field.id, "type", e.target.value)} className="select" style={{ fontSize: 10, height: 34 }}><option value="text">Texte</option><option value="number">Nombre</option><option value="date">Date</option><option value="status">Statut</option><option value="reference">Référence</option></select><label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.g600, fontWeight: 700 }}><input type="checkbox" checked={!!field.required} onChange={e => updateUserField(field.id, "required", e.target.checked)} /> Requis</label><select value={(pl.fieldMappings || {})[field.key] || ""} onChange={e => setUserFieldMapping(field, e.target.value)} disabled={!field.key} className="select" style={{ fontSize: 10, height: 34, fontFamily: "'JetBrains Mono',monospace" }}><option value="">-- Colonne source --</option>{plCols.map(c => <option key={c.full} value={c.full}>{c.full}</option>)}</select><button type="button" onClick={() => removeUserField(field.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.07)", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button></div>))}
              </div>)}
            </div>
          </SectionAccordion>
        </>
      )}
    </div>
  );
}

/* ─── TENANTS STEP (updated: inactive by default + processing + GQL link) ─── */
function TenantsStep({ data, setData }) {
  useStore();
  const toast = useToast();
  const tenants = data.tenants || [];
  const customPipelines = data.customPipelines || [];
  const allPipelineKeys = { facture: PIPELINE_DEFS.facture, commande: PIPELINE_DEFS.commande, ...Object.fromEntries(customPipelines.map(cp => [cp.id, { label: cp.label, color: cp.color, Icon: Settings2 }])) };
  const [newTenantId, setNewTenantId] = useState("");
  const [newTenantLabel, setNewTenantLabel] = useState("");
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [processingTenants, setProcessingTenants] = useState({});
  const [completedTenants, setCompletedTenants] = useState(new Set());
  const platformTenants = useMemo(() => { try { return visibleTenants() || []; } catch (e) { return []; } }, []);

  const addTenant = () => {
    if (!newTenantId.trim()) return;
    const id = newTenantId.trim();
    const label = newTenantLabel.trim() || id;
    const next = [...tenants, { id, label, active: false, platformTenantId: null, platformTenantName: null, statuses: Object.fromEntries(Object.keys(allPipelineKeys).map(k => [k, { provisional: [], final: [], statusColumn: "" }])) }];
    setData({ ...data, tenants: next }); setNewTenantId(""); setNewTenantLabel("");
  };

  const removeTenant = id => setData({ ...data, tenants: tenants.filter(t => t.id !== id) });

  const activateTenant = (id) => {
    const tenant = tenants.find(t => t.id === id);
    if (!resolvePlatformTenant(tenant, platformTenants)) {
      setExpandedTenant(id);
      toast("Liez d'abord cet ID ERP à un tenant plateforme.", "warning");
      return;
    }
    setProcessingTenants(prev => ({ ...prev, [id]: true }));
    setExpandedTenant(id);
  };

  const onProcessingComplete = (id) => {
    setProcessingTenants(prev => { const n = { ...prev }; delete n[id]; return n; });
    setCompletedTenants(prev => new Set([...prev, id]));
    setData({ ...data, tenants: tenants.map(t => t.id === id ? { ...t, active: true } : t) });
  };

  const deactivateTenant = (id) => {
    setCompletedTenants(prev => { const n = new Set(prev); n.delete(id); return n; });
    setData({ ...data, tenants: tenants.map(t => t.id === id ? { ...t, active: false } : t) });
  };

  const linkPlatformTenant = (erpId, pt) => {
    setData({ ...data, tenants: tenants.map(t => t.id === erpId ? { ...t, platformTenantId: pt ? pt.id : null, platformTenantName: pt ? pt.name : null } : t) });
  };

  const updateTenantStatus = (tenantId, pipeline, field, value) => setData({ ...data, tenants: tenants.map(t => t.id === tenantId ? { ...t, statuses: { ...t.statuses, [pipeline]: { ...(t.statuses?.[pipeline] || {}), [field]: value } } } : t) });

  const enabledPipelineNames = Object.entries(allPipelineKeys).filter(([k]) => (data.pipelines?.[k] || {}).enabled !== false).map(([, def]) => def.label || k);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>
        Ajoutez les IDs externes des tenants ERP, liez-les aux tenants plateforme, puis activez-les un par un pour déclencher l'initialisation complète.
      </InfoBox>

      {/* Add tenant */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={newTenantId} onChange={e => setNewTenantId(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="ID externe ERP (ex: CORP_001)" style={{ flex: 1 }} />
        <input value={newTenantLabel} onChange={e => setNewTenantLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="Libellé (optionnel)" style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addTenant} disabled={!newTenantId.trim()}><Plus size={13} /> Ajouter</button>
      </div>

      {tenants.length === 0 && (<div style={{ padding: "2.5rem", textAlign: "center", color: C.g400, background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}><Cpu size={32} style={{ display: "block", margin: "0 auto 10px", opacity: .4 }} /><p style={{ fontSize: 13 }}>Aucun ID externe configuré</p></div>)}

      {tenants.map(tenant => {
        const isProcessing = !!processingTenants[tenant.id];
        const isCompleted = completedTenants.has(tenant.id);
        const isActive = tenant.active;
        const linkedPlatformTenant = resolvePlatformTenant(tenant, platformTenants);
        const isLinked = !!linkedPlatformTenant;

        return (
          <div key={tenant.id} style={{ border: `1px solid ${isActive ? "rgba(34,197,94,.25)" : isProcessing ? "rgba(59,130,246,.3)" : C.g200}`, borderRadius: 14, overflow: "hidden", background: "#fff" }}>
            {/* Tenant header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? "rgba(34,197,94,.1)" : isProcessing ? "rgba(59,130,246,.1)" : C.g100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isActive ? <CheckCircle2 size={18} color={C.success} /> : isProcessing ? <Loader2 size={18} color={C.info} className="spin" /> : <Cpu size={18} color={C.g400} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? C.g900 : C.g500 }}>
                  {tenant.label}
                </div>
                <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>
                  ID externe: <span className="mono">{tenant.id}</span>
                  {isLinked && (
                    <span style={{ marginLeft: 6, color: C.success }}>· Lié à {linkedPlatformTenant?.name || tenant.platformTenantName}</span>
                  )}
                </div>
              </div>

              {/* Status badges */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {isActive && (
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 99, background: C.successLight, color: "#15803d", fontWeight: 700, border: `1px solid ${C.successBorder}` }}>
                    ACTIF
                  </span>
                )}
                {isLinked && !isActive && (
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 99, background: C.infoLight, color: "#1d4ed8", fontWeight: 700, border: "1px solid rgba(59,130,246,.25)" }}>
                    LIÉ
                  </span>
                )}
                {!isActive && !isProcessing && !isCompleted && (
                  <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 99, background: C.g100, color: C.g400, fontWeight: 700, border: `1px solid ${C.g200}` }}>
                    INACTIF
                  </span>
                )}
              </div>

              {!isProcessing && !isCompleted && (
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); isActive ? deactivateTenant(tenant.id) : activateTenant(tenant.id); }}
                  title={isActive ? "Désactiver le tenant" : isLinked ? "Activer le tenant" : "Lier au tenant plateforme avant activation"}
                  style={{ width: 48, height: 26, borderRadius: 99, border: `1px solid ${isActive ? C.successBorder : C.g200}`, background: isActive ? C.successLight : C.g100, cursor: !isActive && !isLinked ? "not-allowed" : "pointer", opacity: !isActive && !isLinked ? .55 : 1, padding: 3, display: "flex", alignItems: "center", justifyContent: isActive ? "flex-end" : "flex-start", transition: "all .18s", flexShrink: 0 }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: isActive ? C.success : C.g300, boxShadow: "0 2px 5px rgba(0,0,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all .18s" }}>
                    {isActive ? <Check size={11} /> : <Play size={9} />}
                  </span>
                </button>
              )}

              <button
                onClick={e => { e.stopPropagation(); removeTenant(tenant.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.g300, padding: 4, flexShrink: 0 }}
              >
                <X size={14} />
              </button>

              <ChevronDown
                size={14} color={C.g400}
                style={{ transform: expandedTenant === tenant.id ? "rotate(0)" : "rotate(-90deg)", transition: "transform .2s", flexShrink: 0, cursor: "pointer" }}
                onClick={e => { e.stopPropagation(); setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id); }}
              />
            </div>

            {/* Processing overlay */}
            {isProcessing && (
              <div style={{ padding: "0 16px 16px" }}>
                <TenantProcessingCard
                  tenant={tenant}
                  pipelines={enabledPipelineNames}
                  onComplete={() => onProcessingComplete(tenant.id)}
                />
              </div>
            )}

            {/* Expanded config panel (only when not processing) */}
            {expandedTenant === tenant.id && !isProcessing && (
              <div style={{ borderTop: "1px solid #e5e7eb", padding: 16 }} className="fade-in">

                {!isLinked && (
                  <div style={{ marginBottom: 14 }}>
                    <label className="label" style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <Link2 size={11} color={C.info} /> Tenant plateforme
                    </label>
                    <GQLTenantLinker
                      tenant={tenant}
                      platformTenants={platformTenants}
                      onLink={(pt) => linkPlatformTenant(tenant.id, pt)}
                    />
                  </div>
                )}

                {/* Pipeline statuses */}
                {Object.entries(allPipelineKeys).map(([pipeKey, plDef]) => {
                  const st = tenant.statuses?.[pipeKey] || {};
                  const PIcon = plDef.Icon || Settings2;
                  return (
                    <div key={pipeKey} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${plDef.color}25`, background: `${plDef.color}04`, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <PIcon size={14} color={plDef.color} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: plDef.color }}>{plDef.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ color: C.warning }}>Statuts provisoires</label>
                          <StatusTagInput
                            value={st.provisional || []}
                            onChange={next => updateTenantStatus(tenant.id, pipeKey, "provisional", next)}
                            placeholder="Entrée puis Entrée"
                            color={C.warning}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label className="label" style={{ color: C.success }}>Statuts finaux</label>
                          <StatusTagInput
                            value={st.final || []}
                            onChange={next => updateTenantStatus(tenant.id, pipeKey, "final", next)}
                            placeholder="Validé puis Entrée"
                            color={C.success}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Platform tenant reference list */}
      {platformTenants.length > 0 && (
        <div style={{ borderRadius: 12, border: `1px solid ${C.g200}`, overflow: "hidden", background: "#fff" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={13} color={C.g500} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.g600 }}>Tenants plateforme ({platformTenants.length})</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxHeight: 180, overflowY: "auto" }}>
            {platformTenants.map(pt => (
              <div key={pt.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: `1px solid ${C.g50}`, fontSize: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={12} color={C.info} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{pt.name}</div>
                  <div style={{ fontSize: 10, color: C.g400 }}>ID: {pt.id}{pt.industry ? ` · ${pt.industry}` : ""}</div>
                </div>
                {tenants.some(t => t.platformTenantId === pt.id) && (
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: C.successLight, color: "#15803d", fontWeight: 600 }}>Lié</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── DATA PREVIEW STEP ─────────────────────────────────────── */
function DataPreviewStep({ data, setData, schema }) {
  const customPipelines = data.customPipelines || [];
  const allTabs = [
    { key: "facture", label: "Factures", Icon: Database, color: PIPELINE_DEFS.facture.color },
    { key: "commande", label: "Commandes", Icon: Layers, color: PIPELINE_DEFS.commande.color },
    ...customPipelines.map(cp => ({ key: cp.id, label: cp.label, Icon: Settings2, color: cp.color })),
  ];
  const [activeTab, setActiveTab] = useState("facture");
  const [genData, setGenData] = useState(data.generatedData || {});
  const [loading, setLoading] = useState(false);
  const selectedTables = data.selectedTables || [];
  const activeTables = (schema?.tables || []).filter(t => selectedTables.includes(t.name));
  const pipelines = data.pipelines || {};
  const pl = pipelines[activeTab] || {};
  const plTables = activeTables.filter(t => (pl.tables || []).includes(t.name));
  const cols = plTables[0]?.cols || ["ID", "DATE", "MONTANT", "STATUT", "FOURNISSEUR"];

  const generate = () => {
    setLoading(true);
    setTimeout(() => {
      const rows = generateFakeRows(cols, activeTab, 10);
      const next = { ...genData, [activeTab]: rows };
      setGenData(next); setData({ ...data, generatedData: next }); setLoading(false);
    }, 700);
  };
  const activeRows = genData[activeTab] || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>Générez des données de test pour valider le mapping.</InfoBox>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {allTabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${activeTab === t.key ? t.color : "transparent"}`, background: activeTab === t.key ? `${t.color}12` : "transparent", color: activeTab === t.key ? t.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            <t.Icon size={13} /> {t.label}
            {genData[t.key] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, background: C.successLight, color: "#15803d" }}><CheckCircle2 size={8} /></span>}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />} Générer 10 lignes
      </button>
      {activeRows.length > 0 ? (
        <div style={{ borderRadius: 12, border: `1px solid ${C.g200}`, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="gen-table">
              <thead><tr>{Object.keys(activeRows[0]).map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{activeRows.map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j} title={String(v)}>{String(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ padding: "3rem", textAlign: "center", color: C.g400, background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
          <Sparkles size={32} style={{ display: "block", margin: "0 auto 12px", opacity: .4 }} />
          <p style={{ fontSize: 13 }}>Cliquez sur "Générer" pour créer des données de test</p>
        </div>
      )}
    </div>
  );
}

/* ─── SUMMARY STEP ──────────────────────────────────────────── */
function SummaryStep({ data, onSave, onDelete, initialData }) {
  const tenants = data.tenants || [];
  const customPipelines = data.customPipelines || [];
  const pipelines = data.pipelines || {};
  const enabledPl = [
    ...["facture", "commande"].filter(k => (pipelines[k] || {}).enabled !== false).map(k => PIPELINE_DEFS[k].label),
    ...customPipelines.filter(cp => (pipelines[cp.id] || {}).enabled !== false).map(cp => cp.label),
  ];
  const isValid = data.name && (data.selectedTables || []).length > 0;
  const connectionDetail = data.connectionType === "csv"
    ? `${(data.csvFiles || []).length} fichier(s) CSV`
    : data.connectionType === "api"
      ? `${(data.apiResources || []).length} ressource(s) API`
      : data.jdbcUrl || "—";
  const rows = [
    ["Nom", data.name || "—"],
    ["Type", data.connectorType || "—"],
    ["Auth", data.authType || "—"],
    ["Connexion", `${(data.connectionType || "jdbc").toUpperCase()} · ${connectionDetail}`],
    ["Tables", (data.selectedTables || []).length + " table(s)"],
    ["Pipelines", enabledPl.join(" · ") || "—"],
    ["Tenants", `${tenants.length} tenant(s)${tenants.filter(t => t.platformTenantId).length > 0 ? " · " + tenants.filter(t => t.platformTenantId).length + " lié(s)" : ""}`],
    ["Tenants actifs", `${tenants.filter(t => t.active).length} / ${tenants.length}`],
    ["Données test", data.generatedData && Object.keys(data.generatedData).length > 0 ? "✓ Générées" : "Non générées"],
    ["Budget", data.budgetFormula?.length > 0 ? "✓ Configuré" : "Non configuré"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, background: isValid ? C.successLight : C.warningLight, border: `1px solid ${isValid ? C.successBorder : "rgba(245,158,11,.3)"}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: isValid ? "rgba(34,197,94,.15)" : "rgba(245,158,11,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isValid ? <CheckCircle2 size={22} color={C.success} /> : <AlertCircle size={22} color={C.warning} />}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: isValid ? "#15803d" : "#92400e" }}>
            {isValid ? "Connecteur prêt à créer" : "Configuration incomplète"}
          </div>
          <div style={{ fontSize: 11, color: isValid ? "#16a34a" : "#b45309", marginTop: 2 }}>
            {isValid ? "Toutes les étapes critiques sont complètes." : "Vérifiez le nom et la sélection de tables."}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.g200}`, borderRadius: 14, overflow: "hidden" }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", padding: "10px 16px", borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : "none", background: i % 2 === 0 ? "transparent" : "rgba(248,247,245,.4)" }}>
            <span style={{ fontSize: 11, color: C.g400, flex: "0 0 160px" }}>{k}</span>
            <span style={{ fontSize: 11, color: String(v).startsWith("✓") ? C.success : C.g900, fontWeight: 600 }}>{String(v)}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-primary" onClick={onSave} disabled={!isValid} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: 10 }}>
          {initialData?.id ? <><RefreshCw size={14} /> Enregistrer</> : <><Sparkles size={14} /> Créer le connecteur</>}
        </button>
        {initialData?.id && onDelete && (
          <button className="btn btn-danger" onClick={onDelete}><X size={14} /> Supprimer</button>
        )}
      </div>
    </div>
  );
}

/* ─── WIZARD MODAL ──────────────────────────────────────────── */
function ConnectorWizardModal({ open, initialData = {}, onClose, onSave, onDelete, onSyncTemplates }) {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [savedPipelineSnapshot, setSavedPipelineSnapshot] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const [data, setData] = useState({
    name: "", connectorType: "ERP", authType: "NONE", description: "", color: "#D94F3D", logo: "",
    jdbcUrl: "", jdbcUsername: "", jdbcPassword: "", jdbcDriverClassName: "org.postgresql.Driver",
    apiEndpoint: "", apiAuthToken: "", apiResources: [], csvFiles: [], connectionType: "jdbc",
    selectedTables: [], pipelines: {}, tableRoles: {}, customPipelines: [],
    budgetSourceTables: [], budgetAmountCols: [],
    budgetFormula: [], budgetPreset: null, budgetAgg: "SUM",
    tenants: [], generatedData: {},
    ...initialData,
  });

  const isEditing = !!initialData?.id;

  const makeIdentitySnap = (d) => JSON.stringify({ name: d.name, color: d.color, description: d.description, logo: d.logo, authType: d.authType });
  const makePipelineSnap = (d) => JSON.stringify({ pipelines: d.pipelines, customPipelines: d.customPipelines, selectedTables: d.selectedTables });
  const [initialIdentitySnap] = useState(() => makeIdentitySnap(initialData));
  const [initialPipeSnap] = useState(() => makePipelineSnap(initialData));

  const hasUnsavedIdentity = isEditing && makeIdentitySnap(data) !== (savedSnapshot || initialIdentitySnap);
  const hasUnsavedPipeline = isEditing && makePipelineSnap(data) !== (savedPipelineSnapshot || initialPipeSnap);

  const openReport = () => {
    if (hasUnsavedIdentity || hasUnsavedPipeline) {
      toast("Sauvegardez ou synchronisez les changements avant d'ouvrir le rapport.", "warning");
      return;
    }
    setShowReport(true);
  };

  const connId = data.jdbcUrl?.includes("sap") ? "c1"
    : (data.jdbcUrl?.includes("sage") || data.jdbcUrl?.includes("sqlserver") || initialData?.id === "c2") ? "c2"
      : initialData?.id === "c1" ? "c1" : null;

  const rawSchema = data.connectionType === "csv"
    ? buildCsvSchema(data.csvFiles || [])
    : data.connectionType === "api"
      ? buildApiSchema(data.apiResources || [])
      : connId ? MOCK_SCHEMAS[connId] : (data.jdbcUrl ? GENERIC_SCHEMA : null);

  const schema = useMemo(() => {
    if (!rawSchema) return null;
    const sel = data.selectedTables || [];
    if (sel.length === 0) return rawSchema;
    const tables = rawSchema.tables.filter(t => sel.includes(t.name));
    const tableNames = new Set(tables.map(t => t.name));
    return { tables, rels: rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to)) };
  }, [rawSchema, data.selectedTables]);

  const schemaForConnection = useMemo(() => {
    if (data.connectionType === "csv") return buildCsvSchema(data.csvFiles || []);
    if (data.connectionType === "api") return buildApiSchema(data.apiResources || []);
    if (connId) return MOCK_SCHEMAS[connId];
    if (data.jdbcUrl) return GENERIC_SCHEMA;
    return null;
  }, [connId, data.jdbcUrl, data.connectionType, data.csvFiles, data.apiResources]);

  if (!open) return null;

  const progress = Math.round((step / WIZARD_STEPS.length) * 100);
  const cur = WIZARD_STEPS[step - 1];

  const renderStep = () => {
    switch (step) {
      case 1: return <IdentityStep data={data} setData={setData} />;
      case 2: return <ConnectionStep data={data} setData={setData} schema={schemaForConnection} />;
      case 3: return <ExplorationStep data={data} setData={setData} schema={schema} selectedTable={selectedTable} setSelectedTable={setSelectedTable} />;
      case 4: return <PipelinesStep data={data} setData={setData} schema={schema} />;
      case 5: return <BudgetStep data={data} setData={setData} schema={schema} connId={connId || "generic"} />;
      case 6: return <TenantsStep data={data} setData={setData} />;
      case 7: return <DataPreviewStep data={data} setData={setData} schema={schema} />;
      case 8: return <SummaryStep data={data} onSave={() => onSave(data)} onDelete={onDelete} initialData={initialData} />;
      default: return null;
    }
  };

  const modalContent = (
    <>
      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "rgba(255,255,255,.95)", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#D94F3D,#c84332)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(217,79,61,.3)" }}>
            <Plug size={15} color="#fff" />
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,.1)" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>{isEditing ? "Modifier le connecteur" : "Nouveau connecteur ERP"}</div>
            <div style={{ fontSize: 10, color: C.g400 }}>Moteur anomalie · Prévision budgétaire</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {hasUnsavedIdentity && (
            <button
              onClick={() => { onSave(data); setSavedSnapshot(makeIdentitySnap(data)); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.22)", color: "#15803d", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              <Check size={13} /> Sauvegarder
            </button>
          )}
          {hasUnsavedPipeline && (
            <button
              onClick={() => { onSyncTemplates?.(data); setSavedPipelineSnapshot(makePipelineSnap(data)); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "rgba(59,130,246,.1)", border: "1px solid rgba(59,130,246,.22)", color: "#1d4ed8", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              <RefreshCw size={13} /> Synchroniser
            </button>
          )}
          {isEditing && (
            <button
              onClick={openReport}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 9, background: "rgba(107,114,128,.07)", border: "1px solid #e5e7eb", color: C.g600, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              <FileBarChart size={13} /> Rapport
            </button>
          )}
          <button onClick={() => setIsFullscreen(p => !p)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,.85)", borderRight: "1px solid rgba(0,0,0,.07)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".1em" }}>Progression</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.red }}>{progress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,.07)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#D94F3D,#e86b59)", width: `${progress}%`, transition: "width .4s ease-out" }} />
            </div>
          </div>
          <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
            {WIZARD_STEPS.map((s, i) => {
              const n = i + 1, done = step > n, active = step === n;
              const { Icon: SIcon } = s;
              return (
                <div key={n} onClick={() => setStep(n)}
                  style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: active ? "rgba(217,79,61,.09)" : "transparent", border: `1.5px solid ${active ? "rgba(217,79,61,.22)" : "transparent"}`, cursor: "pointer", position: "relative" }}>
                  {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "linear-gradient(180deg,#D94F3D,#e86b59)" }} />}
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.successLight : active ? "rgba(217,79,61,.1)" : "rgba(0,0,0,.04)", border: `1.5px solid ${done ? C.successBorder : active ? "rgba(217,79,61,.25)" : C.g200}` }}>
                    {done ? <CheckCircle2 size={13} color={C.success} /> : <SIcon size={13} color={active ? C.red : C.g400} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: active ? 700 : done ? 600 : 500, color: active ? C.red : done ? C.g700 : C.g400, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</div>
                    <div style={{ fontSize: 9, color: active ? C.red : C.g300, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "rgba(248,247,245,.7)" }}>
          <div style={{ padding: "14px 24px 12px", borderBottom: "1px solid rgba(0,0,0,.06)", flexShrink: 0, background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(217,79,61,.09)", border: "1.5px solid rgba(217,79,61,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <cur.Icon size={18} color={C.red} />
              </div>
              <div>
                <div className="serif" style={{ fontSize: 18, color: C.g900, lineHeight: 1.2 }}>{cur.label}</div>
                <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>
                  {cur.desc}
                  <span style={{ marginLeft: 8, padding: "1px 7px", borderRadius: 99, background: "rgba(217,79,61,.08)", border: "1px solid rgba(217,79,61,.15)", fontSize: 9, fontWeight: 700, color: C.red }}>{step}/{WIZARD_STEPS.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div key={step} className="scroll fade-in" style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
            {renderStep()}
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderTop: "1px solid rgba(0,0,0,.06)", flexShrink: 0, background: "rgba(255,255,255,.5)" }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn btn-ghost" style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto" }}>
              <ArrowLeft size={13} /> Précédent
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              {WIZARD_STEPS.map((_, i) => (
                <div key={i} onClick={() => setStep(i + 1)}
                  style={{ width: step === i + 1 ? 16 : 5, height: 5, borderRadius: 99, cursor: "pointer", background: step > i + 1 ? C.success : step === i + 1 ? C.red : C.g200, transition: "all .3s" }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {step < WIZARD_STEPS.length ? (
                <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">Suivant <ArrowRight size={13} /></button>
              ) : !isEditing ? (
                <button onClick={() => onSave(data)} className="btn btn-primary"><Sparkles size={13} /> Créer</button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const wrapper = isFullscreen
    ? <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#f2f0ed", display: "flex", flexDirection: "column" }}>{modalContent}</div>
    : createPortal(
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}
          style={{ width: "100%", maxWidth: 1080, height: "min(780px,calc(100vh - 32px))" }}>
          {modalContent}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      {!showReport && (isFullscreen ? createPortal(wrapper, document.body) : wrapper)}
      {showReport && (
        <ERPReportModal
          integration={{ ...data, ...initialData }}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}

/* ─── INTEGRATION CARD ──────────────────────────────────────── */
function IntegrationCard({ integration, onEdit, onReport, onDisconnect, isAdmin }) {
  const [confirmDis, setConfirmDis] = useState(false);
  const [hovered, setHovered] = useState(false);

  const statusMap = {
    connected: { label: "Connecté", dot: "#86efac", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    available: { label: "Disponible", dot: "#93c5fd", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    coming_soon: { label: "Bientôt", dot: "#e5e7eb", bg: "#f9fafb", color: "#9ca3af", border: "#e5e7eb" },
  };
  const status = statusMap[integration.status] || statusMap.coming_soon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1.5px solid ${integration.status === "connected" ? (hovered ? "#a7f3d0" : "#d1fae5") : (hovered ? "#d1c9c0" : "#ede9e4")}`,
        overflow: "hidden",
        position: "relative",
        transition: "border-color .18s, transform .18s",
        transform: hovered ? "translateY(-2px)" : "none",
        opacity: integration.status === "coming_soon" ? .5 : 1,
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 64, height: 64, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
        <div style={{ position: "absolute", top: 10, right: -28, width: 96, padding: "3px 0", textAlign: "center", transform: "rotate(45deg)", background: status.border, color: status.color, fontSize: 9, fontWeight: 800, letterSpacing: ".02em", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}>
          {status.label}
        </div>
      </div>
      <div style={{ padding: "16px 16px 10px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 34 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: integration.color || "#6b7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: ".5px" }}>
            {integration.logo || integration.name.slice(0, 2)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{integration.name}</div>
            <div style={{ fontSize: 10, color: C.g400, marginTop: 2, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{integration.description}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 5, padding: "0 16px 12px" }}>
        {integration.authType && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>{integration.authType}</span>}
        {integration.category && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}>{integration.category}</span>}
      </div>

      <div style={{ height: 1, background: "#f3f4f6" }} />

      {isAdmin && (
        <div style={{ display: "flex" }}>
          {integration.status === "connected" && !confirmDis && (
            <>
              <button onClick={onEdit} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .15s, color .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#374151"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b7280"; }}>
                <Settings2 size={13} /> Configurer
              </button>
              <div style={{ width: 1, background: "#f3f4f6", margin: "7px 0" }} />
              <button onClick={onReport} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, fontWeight: 600, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .15s, color .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#374151"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b7280"; }}>
                <FileBarChart size={13} /> Rapport
              </button>
              <div style={{ width: 1, background: "#f3f4f6", margin: "7px 0" }} />
              <button onClick={() => setConfirmDis(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, fontWeight: 600, color: "#f87171", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fff5f4"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
                <Zap size={13} /> Déconnecter
              </button>
            </>
          )}
          {integration.status === "connected" && confirmDis && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px" }}>
              <span style={{ fontSize: 11, color: "#9ca3af", flex: 1 }}>Confirmer ?</span>
              <button onClick={onDisconnect} style={{ padding: "4px 12px", borderRadius: 8, background: "#fee2e2", color: "#ef4444", border: "1px solid #fecaca", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Oui</button>
              <button onClick={() => setConfirmDis(false)} style={{ padding: "4px 10px", borderRadius: 8, background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Non</button>
            </div>
          )}
          {integration.status === "available" && (
            <button onClick={onEdit} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, fontWeight: 700, color: C.red, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fff5f4"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; }}>
              <Plus size={13} /> Connecter
            </button>
          )}
          {integration.status === "coming_soon" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 8px", fontSize: 12, color: "#d1d5db", fontFamily: "'DM Sans',sans-serif" }}>
              <Zap size={13} /> Bientôt disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN VIEW ─────────────────────────────────────────────── */
export function IntegrationsView() {
  const [connectors, setConnectors] = useState(DEMO_CONNECTORS);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modal, setModal] = useState(null);
  const [reportConnector, setReportConnector] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantHasData, setAssistantHasData] = useState(false);

  const CATS = [
    { id: "all", label: "Tout" },
    { id: "erp", label: "ERP" },
    { id: "accounting", label: "Comptabilité" },
    { id: "crm", label: "CRM" },
    { id: "storage", label: "Stockage" },
  ];

  const filtered = connectors.filter(c => {
    if (category !== "all" && c.category !== category) return false;
    if (search && !`${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const connected = connectors.filter(c => c.status === "connected");

  const handleSave = d => {
    const saved = { ...d, pipelineTemplatesJson: JSON.stringify(d.pipelines || CONNECTOR_CONFIG.step7_templates) };
    if (saved.id) {
      setConnectors(prev => prev.map(c => c.id === saved.id ? { ...c, ...saved } : c));
      const raw = CONNECTORS_TABLE.find(c => c.id === saved.id);
      if (raw) raw.pipelineTemplatesJson = saved.pipelineTemplatesJson;
    } else {
      setConnectors(prev => [...prev, { ...saved, id: `c${Date.now()}`, status: "connected" }]);
    }
    setModal(null);
  };

  const handleDisconnect = id => setConnectors(prev => prev.map(c => c.id === id ? { ...c, status: "available" } : c));

  const handleAssistantAutofill = (d) => { setAssistantHasData(true); setModal(d); };

  const handleSyncTemplates = (integration) => {
    const connTemplates = integration.pipelineTemplatesJson
      ? JSON.parse(integration.pipelineTemplatesJson)
      : (integration.pipelines || CONNECTOR_CONFIG.step7_templates);
    const savedTemplatesJson = JSON.stringify(connTemplates);
    setConnectors(prev => prev.map(c => c.id === integration.id ? { ...c, ...integration, pipelineTemplatesJson: savedTemplatesJson } : c));
    const raw = CONNECTORS_TABLE.find(c => c.id === integration.id);
    if (raw) raw.pipelineTemplatesJson = savedTemplatesJson;

    const activeKeys = Object.keys(connTemplates);
    const linkedTenants = TENANT_CONNECTIONS_TABLE.filter(x => x.connectorId === integration.id && x.active);

    if (linkedTenants.length === 0) {
      alert("Aucun tenant actif lié à cet ERP.");
      return;
    }

    let created = 0;
    const createdKeys = new Set();
    linkedTenants.forEach(tc => {
      const processed = tc.processedTemplatesJson ? JSON.parse(tc.processedTemplatesJson) : [];
      const diff = activeKeys.filter(k => !processed.includes(k) && connTemplates[k]?.enabled !== false);
      diff.forEach(k => {
        const tmpl = connTemplates[k];
        const newPipe = {
          id: `mock-pipe-${Date.now()}-${tc.tenantId}-${k}`,
          tenantId: tc.tenantId,
          name: `${tc.externalId} - ${tmpl.name || k}`,
          sourceType: "JDBC",
          status: "ACTIVE",
          active: true,
          templateKey: k,
          isCustom: false,
          connectorId: tc.connectorId,
          externalId: tc.externalId,
          lastRunAt: new Date().toISOString(),
          lastRunStats: { processedCount: 0, importedCount: 0, anomalyCount: 0 },
          configJson: JSON.stringify({
            template: k,
            tables: tmpl.tables || [],
            joins: tmpl.joins || [],
            conditions: tmpl.conditions || [],
            fieldMappings: tmpl.fieldMappings || {},
          }),
        };
        createPipelineStore(newPipe);
        created += 1;
        createdKeys.add(k);
      });
      tc.processedTemplatesJson = JSON.stringify([...new Set([...processed, ...diff])]);
    });

    if (created === 0) {
      alert("Tous les templates actifs sont déjà synchronisés pour les tenants liés.");
      return;
    }
    alert(`Synchronisation terminée : ${created} pipeline(s) créé(s) pour ${linkedTenants.length} tenant(s) (${[...createdKeys].join(", ")}).`);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="root fade-up" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <PageHeader
          eyebrow="Connecteurs"
          title="Intégrations ERP"
          subtitle={`${connected.length} connectée${connected.length > 1 ? "s" : ""} · ${connectors.length} disponibles`}
          actions={(
            <>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g400 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: 30, width: 210, fontSize: 12 }} placeholder="Rechercher…" />
              </div>
              <button onClick={() => setModal({})} className="btn btn-primary"><Plus size={13} /> Nouveau connecteur</button>
            </>
          )}
        />

        {/* Category filter */}
        <div style={{ display: "flex", gap: 4 }}>
          {CATS.map(cat => {
            const count = connectors.filter(c => cat.id === "all" || c.category === cat.id).length;
            return (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                style={{ padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: category === cat.id ? "rgba(217,79,61,.14)" : "transparent", color: category === cat.id ? C.red : C.g400, fontFamily: "'DM Sans',sans-serif" }}>
                {cat.label} <span style={{ opacity: .6 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Connected section */}
        {connected.length > 0 && category === "all" && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <CheckCircle2 size={11} /> Connectés ({connected.length})
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {connected.filter(c => !search || `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())).map(c => (
                <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onReport={() => setReportConnector(c)} onDisconnect={() => handleDisconnect(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Available / filtered section */}
        {category !== "all" || (search && filtered.length === 0) ? (
          filtered.length > 0
            ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {filtered.map(c => <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onReport={() => setReportConnector(c)} onDisconnect={() => handleDisconnect(c.id)} />)}
            </div>
            : (
              <div style={{ textAlign: "center", padding: "64px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Plug size={32} color={C.g300} />Aucune intégration trouvée
              </div>
            )
        ) : (
          filtered.filter(c => c.status !== "connected").length === 0 ? (
            !search && connected.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Plug size={34} color={C.g300} />
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: C.g900 }}>Aucune intégration</div>
                <div>Aucun connecteur n'est configuré pour le moment.</div>
              </div>
            )
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {filtered.filter(c => c.status !== "connected").map(c => (
                <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onReport={() => setReportConnector(c)} onDisconnect={() => handleDisconnect(c.id)} />
              ))}
            </div>
          )
        )}
      </div>

      {/* Wizard modal */}
      {modal !== null && (
        <ConnectorWizardModal
          open={true}
          initialData={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onSyncTemplates={handleSyncTemplates}
          onDelete={modal.id ? () => { setConnectors(prev => prev.filter(c => c.id !== modal.id)); setModal(null); } : null}
        />
      )}

      {reportConnector && (
        <ERPReportModal
          integration={reportConnector}
          onClose={() => setReportConnector(null)}
        />
      )}

      {/* Floating assistant bubble */}
      <AssistantBubble onOpen={() => setAssistantOpen(true)} hasData={assistantHasData} />

      {assistantOpen && (
        <AssistantFullscreen
          onClose={() => setAssistantOpen(false)}
          onAutofill={handleAssistantAutofill}
          rawSchema={null}
        />
      )}
    </>
  );
}

export default IntegrationsView;
