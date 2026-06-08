// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { createPortal } from "react-dom";
// import {
//   Plus, X, Tag, Plug, Network, Settings2, Calculator, Sparkles, CheckCircle2,
//   ArrowLeft, ArrowRight, Database, GitBranch, ScanLine, ClipboardCheck,
//   RefreshCw, Download, FlaskConical, TrendingUp, ChevronRight, ChevronDown,
//   AlertCircle, Search, Link2, Maximize2, Minimize2, PanelRightClose, PanelRightOpen,
//   Cpu, Layers, BarChart3, Eye, EyeOff, Zap, Filter, Table2, Map, GripVertical, Hash,
//   Bot, MessageSquare, FileJson, Send, ChevronUp, Code2, RotateCcw, Wand2,
//   Info, Check, ChevronLeft, Copy, Users, Globe, Upload, FileText, AlertTriangle
// } from "lucide-react";
// import {
//   CONNECTOR_CONFIG,
//   AUTH_FIELDS,
//   PIPELINE_DEFS,
//   GENERIC_SCHEMA,
//   MOCK_SCHEMAS,
//   DEMO_CONNECTORS,
//   TABLE_PALETTE,
//   BUDGET_PRESETS,
//   ERD_OFFSETS,
//   CUSTOM_PIPELINE_COLORS,
//   WIZARD_STEPS,
//   generateFakeRows,
//   inferColType,
//   buildWizardDataFromAnswers,
//   getSchemaForUrl,
//   CARD_W,
//   MAX_COLS,
//   PAD,
//   CONNECTORS_TABLE,
//   TENANT_CONNECTIONS_TABLE,
//   PIPELINES_TABLE,
// } from "@/store/staticData";
// import { useStore, visibleTenants, createPipelineStore } from "@/store/db";
// import { PageHeader } from "@/components/ui/PageHeader";

// /* ─── PALETTE ─────────────────────────────────────────────────────────────── */
// const C = {
//   red: "#D94F3D", redLight: "rgba(217,79,61,.1)", redBorder: "rgba(217,79,61,.22)",
//   g900: "#111827", g800: "#1f2937", g700: "#374151", g600: "#4b5563",
//   g500: "#6b7280", g400: "#9ca3af", g300: "#d1d5db", g200: "#e5e7eb",
//   g100: "#f3f4f6", g50: "#f9fafb",
//   success: "#22c55e", successLight: "rgba(34,197,94,.1)", successBorder: "rgba(34,197,94,.25)",
//   info: "#3b82f6", infoLight: "rgba(59,130,246,.08)",
//   warning: "#f59e0b", warningLight: "rgba(245,158,11,.08)",
//   canvas: "#0d0d12", canvasSurface: "rgba(18,18,22,.96)", canvasBorder: "rgba(255,255,255,.08)",
// };

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
// *{box-sizing:border-box;margin:0;padding:0;}
// body{font-family:'DM Sans',sans-serif;}
// .root{font-family:'DM Sans',sans-serif;color:#111827;background:#f2f0ed;min-height:100vh;}
// .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(8px);z-index:9990;display:flex;align-items:center;justify-content:center;padding:20px;}
// .modal{display:flex;flex-direction:column;background:rgba(243,241,238,.98);box-shadow:0 40px 100px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.6);border-radius:22px;overflow:hidden;}
// .fade-up{animation:fadeUp .28s ease-out;}
// .fade-in{animation:fadeIn .2s ease-out;}
// @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
// @keyframes fadeIn{from{opacity:0}to{opacity:1}}
// @keyframes spin{to{transform:rotate(360deg)}}
// @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
// @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
// @keyframes slideInUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
// @keyframes bubblePop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
// .spin{animation:spin 1s linear infinite;}
// .pulse{animation:pulse 1.5s ease-in-out infinite;}
// .slide-in-right{animation:slideInRight .35s cubic-bezier(.34,1.56,.64,1);}
// .slide-in-up{animation:slideInUp .3s ease-out;}
// .bubble-pop{animation:bubblePop .4s cubic-bezier(.34,1.56,.64,1);}
// .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;border:none;outline:none;white-space:nowrap;}
// .btn-primary{background:linear-gradient(135deg,#D94F3D,#c84332);color:#fff;box-shadow:0 2px 10px rgba(217,79,61,.28);}
// .btn-primary:hover{opacity:.9;transform:translateY(-1px);}
// .btn-primary:active{transform:scale(.97);}
// .btn-primary:disabled{opacity:.35;cursor:not-allowed;transform:none;}
// .btn-ghost{background:rgba(255,255,255,.8);color:#374151;border:1px solid #e5e7eb;}
// .btn-ghost:hover{background:#fff;border-color:#d1d5db;}
// .btn-ghost:disabled{opacity:.4;cursor:not-allowed;}
// .btn-ghost.active{background:rgba(217,79,61,.08);border-color:rgba(217,79,61,.3);color:#D94F3D;}
// .btn-danger{background:rgba(239,68,68,.08);color:#dc2626;border:1px solid rgba(239,68,68,.2);}
// .btn-danger:hover{background:rgba(239,68,68,.15);}
// .label{font-size:10px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px;}
// .input{width:100%;padding:9px 12px;border-radius:10px;border:1px solid #e5e7eb;background:rgba(255,255,255,.9);color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .15s,box-shadow .15s;}
// .input:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.1);}
// .input::placeholder{color:#9ca3af;}
// .select{width:100%;padding:9px 12px;border-radius:10px;border:1px solid #e5e7eb;background:rgba(255,255,255,.9);color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;height:40px;cursor:pointer;}
// .select:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.1);}
// .card{background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:14px;padding:16px;}
// .scroll{scrollbar-width:thin;scrollbar-color:#d1d5db transparent;}
// .scroll::-webkit-scrollbar{width:4px;}
// .scroll::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px;}
// .mono{font-family:'JetBrains Mono',monospace;}
// .serif{font-family:'Instrument Serif',serif;}
// .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:10px;font-weight:700;border:1.5px solid;}
// .toggle{position:relative;width:38px;height:22px;flex-shrink:0;}
// .toggle input{opacity:0;width:0;height:0;position:absolute;}
// .toggle-track{position:absolute;inset:0;border-radius:99px;background:#d1d5db;cursor:pointer;transition:background .2s;}
// .toggle input:checked + .toggle-track{background:#D94F3D;}
// .toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.18);transition:transform .2s;}
// .toggle input:checked ~ .toggle-thumb{transform:translateX(16px);}
// .chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;font-size:11px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);color:#1d4ed8;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .15s;}
// .chip:hover{background:rgba(59,130,246,.15);}
// .chip.selected{background:#1d4ed8;color:#fff;border-color:#1d4ed8;}
// .section{border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:10px;}
// .section-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,247,245,.9);cursor:pointer;user-select:none;}
// .section-hdr:hover{background:rgba(217,79,61,.04);}
// .section-body{padding:14px;background:#fff;}
// .formula-drop{padding:10px 14px;border-radius:10px;border:2px dashed #e5e7eb;min-height:46px;display:flex;align-items:center;flex-wrap:wrap;gap:6px;transition:border-color .15s;}
// .formula-tok{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:8px;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;border:1.5px solid;transition:all .15s;}
// .formula-tok.col{background:rgba(59,130,246,.08);color:#1d4ed8;border-color:rgba(59,130,246,.3);}
// .formula-tok.op{background:rgba(107,114,128,.08);color:#374151;border-color:#e5e7eb;}
// .formula-tok.agg{background:rgba(217,79,61,.08);color:#D94F3D;border-color:rgba(217,79,61,.25);}
// .op-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:7px;background:rgba(107,114,128,.08);border:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#374151;cursor:pointer;transition:all .15s;}
// .op-badge:hover{background:#e5e7eb;}
// .tab-bar{display:flex;gap:2px;padding:3px;background:rgba(0,0,0,.06);border-radius:11px;}
// .tab{padding:5px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6b7280;font-family:'DM Sans',sans-serif;transition:all .15s;}
// .tab.active{background:#fff;color:#111827;box-shadow:0 1px 4px rgba(0,0,0,.1);}
// .gen-table{width:100%;border-collapse:collapse;font-size:11px;}
// .gen-table th{padding:7px 12px;background:rgba(248,247,245,.9);color:#6b7280;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e5e7eb;text-align:left;white-space:nowrap;}
// .gen-table td{padding:6px 12px;border-bottom:1px solid rgba(0,0,0,.04);font-family:'JetBrains Mono',monospace;color:#374151;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
// .gen-table tr:hover td{background:rgba(217,79,61,.03);}
// .schema-btn{display:flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:#a1a1aa;font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;white-space:nowrap;}
// .schema-btn:hover{background:rgba(217,79,61,.15);border-color:rgba(217,79,61,.35);color:#fca5a5;}
// .schema-btn.active{background:rgba(217,79,61,.22);border-color:rgba(217,79,61,.5);color:#fca5a5;}
// .schema-toolbar{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(13,13,18,.95);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);position:relative;z-index:10;flex-shrink:0;}
// .erd-table-card{position:absolute;background:rgba(16,16,20,.97);border:1px solid rgba(255,255,255,.09);border-radius:12px;width:192px;box-shadow:0 4px 20px rgba(0,0,0,.5);transition:border-color .2s,box-shadow .2s;overflow:hidden;cursor:pointer;}
// .erd-table-card:hover{border-color:rgba(217,79,61,.5);box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 18px -4px rgba(217,79,61,.28);}
// .erd-table-card.highlighted{border-color:rgba(217,79,61,.75);box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 26px -4px rgba(217,79,61,.45);}
// .erd-search-bar{position:absolute;top:10px;left:10px;z-index:20;pointer-events:all;display:flex;align-items:center;gap:7px;background:rgba(13,13,18,.94);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:0 10px;height:30px;width:190px;}
// .erd-search-input{background:transparent;border:none;outline:none;color:#e4e4e7;font-size:11px;font-family:'DM Sans',sans-serif;width:100%;}
// .erd-search-input::placeholder{color:#52525b;}
// .erd-zoom-controls{position:absolute;bottom:10px;left:10px;z-index:20;pointer-events:all;display:flex;flex-direction:column;gap:3px;}
// .erd-zoom-btn{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:rgba(13,13,18,.94);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.09);border-radius:6px;color:#a1a1aa;font-size:13px;cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
// .erd-zoom-btn:hover{background:rgba(217,79,61,.2);border-color:rgba(217,79,61,.4);color:#fca5a5;}
// .force-canvas-root{background:#0d0d12;border-radius:14px;overflow:hidden;position:relative;}
// .budget-section{border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;margin-bottom:12px;}
// .budget-section-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,247,245,.8);cursor:pointer;user-select:none;transition:background .15s;}
// .budget-section-hdr:hover{background:rgba(217,79,61,.04);}
// .budget-section-body{padding:14px;background:#fff;}
// .col-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:7px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);font-size:11px;font-family:'JetBrains Mono',monospace;color:#1d4ed8;cursor:pointer;transition:all .15s;}
// .col-chip:hover{background:rgba(59,130,246,.15);}
// .formula-node{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .15s;border:1.5px solid;}
// .formula-node.col{background:rgba(59,130,246,.08);color:#1d4ed8;border-color:rgba(59,130,246,.3);}
// .formula-node.op{background:rgba(107,114,128,.08);color:#374151;border-color:#e5e7eb;}
// .formula-node.agg{background:rgba(217,79,61,.08);color:#D94F3D;border-color:rgba(217,79,61,.25);}
// .formula-op-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;background:rgba(107,114,128,.1);border:1px solid #e5e7eb;font-size:13px;font-weight:700;color:#374151;cursor:pointer;flex-shrink:0;transition:all .15s;}
// .formula-op-badge:hover{background:#e5e7eb;}

// /* ── CHAT BUBBLE ── */
// .asst-fab{position:fixed;bottom:24px;right:24px;z-index:10001;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#D94F3D,#b83328);box-shadow:0 6px 28px rgba(217,79,61,.45),0 2px 8px rgba(0,0,0,.2);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;animation:bubblePop .4s cubic-bezier(.34,1.56,.64,1);}
// .asst-fab:hover{transform:scale(1.08);box-shadow:0 8px 36px rgba(217,79,61,.6);}
// .asst-fab-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#16a34a;border:2.5px solid #f2f0ed;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#fff;}
// .asst-tooltip{position:absolute;right:70px;top:50%;transform:translateY(-50%);background:#111827;color:#fff;font-size:11px;font-weight:600;white-space:nowrap;padding:6px 12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity .2s;font-family:'DM Sans',sans-serif;}
// .asst-fab:hover .asst-tooltip{opacity:1;}
// .asst-tooltip::after{content:'';position:absolute;left:100%;top:50%;transform:translateY(-50%);border:5px solid transparent;border-left-color:#111827;}

// /* ── CHAT POPUP ── */
// .asst-popup{position:fixed;bottom:96px;right:24px;z-index:10001;width:400px;max-height:600px;background:#fff;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.18),0 0 0 1px rgba(0,0,0,.07);display:flex;flex-direction:column;overflow:hidden;animation:slideInUp .3s cubic-bezier(.34,1.2,.64,1);}
// .asst-popup-hdr{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#D94F3D,#b83328);flex-shrink:0;}
// .asst-popup-body{flex:1;overflow-y:auto;min-height:0;}
// .asst-popup-body::-webkit-scrollbar{width:3px;}
// .asst-popup-body::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}

// /* ── FULLSCREEN LIGHT ── */
// .asst-fs{position:fixed;inset:0;z-index:10100;background:#f7f6f3;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;}
// .asst-fs-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:#fff;border-bottom:1px solid #e5e7eb;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.06);}
// .asst-fs-body{flex:1;display:flex;min-height:0;overflow:hidden;}
// .asst-fs-sidebar{width:200px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;padding:16px 10px;gap:3px;overflow-y:auto;}
// .asst-fs-main{flex:1;display:flex;flex-direction:column;min-width:0;background:#f7f6f3;overflow:hidden;}
// .asst-prog-rail{height:3px;background:#e5e7eb;flex-shrink:0;}
// .asst-prog-fill{height:100%;background:linear-gradient(90deg,#D94F3D,#f97316);transition:width .4s ease-out;}

// /* ── SIDEBAR STEPS LIGHT ── */
// .asst-ss{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:default;border:1.5px solid transparent;}
// .asst-ss.active{background:rgba(217,79,61,.08);border-color:rgba(217,79,61,.2);}
// .asst-sn{width:24px;height:24px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border:1.5px solid #e5e7eb;font-size:9px;font-weight:700;color:#9ca3af;}
// .asst-ss.done .asst-sn{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:#16a34a;}
// .asst-ss.active .asst-sn{background:rgba(217,79,61,.1);border-color:rgba(217,79,61,.3);color:#D94F3D;}

// /* ── CHAT MESSAGES LIGHT ── */
// .asst-chat-wrap{flex:1;overflow-y:auto;padding:24px 0;}
// .asst-chat-wrap::-webkit-scrollbar{width:3px;}
// .asst-chat-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
// .asst-chat-inner{max-width:680px;width:100%;margin:0 auto;padding:0 28px;display:flex;flex-direction:column;gap:16px;}
// .asst-msg-bot{display:flex;gap:10px;align-items:flex-start;}
// .asst-msg-user{display:flex;gap:10px;align-items:flex-start;flex-direction:row-reverse;}
// .asst-bb{background:#fff;border:1.5px solid #e5e7eb;border-radius:4px 16px 16px 16px;padding:13px 17px;font-size:13.5px;color:#374151;line-height:1.65;max-width:520px;box-shadow:0 1px 4px rgba(0,0,0,.05);}
// .asst-bu{background:linear-gradient(135deg,#D94F3D,#c84332);border-radius:16px 4px 16px 16px;padding:11px 15px;font-size:13px;color:#fff;line-height:1.6;max-width:420px;}
// .asst-opt{display:flex;align-items:center;gap:10px;padding:11px 15px;border-radius:12px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:13px;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;transition:all .15s;width:100%;margin-bottom:5px;box-shadow:0 1px 3px rgba(0,0,0,.05);}
// .asst-opt:hover{border-color:rgba(217,79,61,.4);background:rgba(217,79,61,.04);color:#D94F3D;}
// .asst-typing{display:flex;gap:5px;padding:13px 17px;background:#fff;border:1.5px solid #e5e7eb;border-radius:4px 16px 16px 16px;width:fit-content;box-shadow:0 1px 4px rgba(0,0,0,.05);}
// .asst-typing span{width:7px;height:7px;border-radius:50%;background:#d1d5db;display:block;animation:asstDot 1.2s ease-in-out infinite;}
// .asst-typing span:nth-child(2){animation-delay:.2s;}
// .asst-typing span:nth-child(3){animation-delay:.4s;}
// @keyframes asstDot{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-5px)}}
// @keyframes asstSlideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
// .asst-anim{animation:asstSlideUp .22s ease-out;}
// .asst-input-bar{display:flex;padding:12px 28px;border-top:1px solid #e5e7eb;background:#fff;flex-shrink:0;}
// .asst-input-bar-inner{max-width:680px;width:100%;margin:0 auto;display:flex;gap:10px;}
// .asst-ti{flex:1;padding:11px 16px;border-radius:12px;border:1.5px solid #e5e7eb;background:#f9fafb;font-size:13px;font-family:'DM Sans',sans-serif;color:#111827;outline:none;transition:border-color .15s;}
// .asst-ti:focus{border-color:#D94F3D;background:#fff;box-shadow:0 0 0 3px rgba(217,79,61,.08);}
// .asst-ti::placeholder{color:#9ca3af;}
// .asst-sb{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#D94F3D,#c84332);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s;flex-shrink:0;}
// .asst-sb:hover{transform:scale(1.06);}
// .asst-sb:disabled{opacity:.35;cursor:not-allowed;transform:none;}
// .asst-chip-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;}
// .asst-chip{padding:6px 12px;border-radius:9px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#6b7280;font-size:12px;font-family:'JetBrains Mono',monospace;cursor:pointer;transition:all .15s;}
// .asst-chip.sel{border-color:rgba(217,79,61,.4);background:rgba(217,79,61,.07);color:#D94F3D;}
// .asst-chip:hover{border-color:rgba(217,79,61,.3);}
// .asst-pbtn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;border:none;background:linear-gradient(135deg,#D94F3D,#c84332);color:#fff;box-shadow:0 3px 12px rgba(217,79,61,.25);transition:all .15s;}
// .asst-pbtn:hover{opacity:.9;transform:translateY(-1px);}
// .asst-pbtn:disabled{opacity:.3;cursor:not-allowed;transform:none;}
// .asst-gbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;background:#fff;border:1.5px solid #e5e7eb;color:#374151;transition:all .15s;}
// .asst-gbtn:hover{background:#f9fafb;border-color:#d1d5db;}

// /* ── FORM / REPORT ── */
// .asst-form-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
// .asst-form-wrap::-webkit-scrollbar{width:3px;}
// .asst-form-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
// .asst-fsec{margin-bottom:20px;background:#fff;border:1.5px solid #e5e7eb;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);}
// .asst-fsec-hdr{display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f9fafb;border-bottom:1px solid #e5e7eb;}
// .asst-fsec-body{padding:16px;display:flex;flex-direction:column;gap:12px;}
// .asst-frow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
// .asst-flabel{font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:6px;}
// .asst-fi{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:border-color .15s;box-sizing:border-box;}
// .asst-fi:focus{border-color:#D94F3D;background:#fff;box-shadow:0 0 0 3px rgba(217,79,61,.07);}
// .asst-fi::placeholder{color:#9ca3af;}
// .asst-fsel{width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #e5e7eb;background:#f9fafb;color:#111827;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;height:40px;cursor:pointer;box-sizing:border-box;}
// .asst-fsel:focus{border-color:#D94F3D;}
// .asst-report-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
// .asst-report-wrap::-webkit-scrollbar{width:3px;}
// .asst-report-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
// .asst-jblock{background:#1e1e2e;border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;}
// .asst-jtbar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(255,255,255,.03);border-bottom:1px solid rgba(255,255,255,.07);}
// .asst-jcontent{padding:18px 20px;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.9;overflow-x:auto;white-space:pre;}
// .asst-jkey{color:#7dd3fc;}
// .asst-jstr{color:#86efac;}
// .asst-jnum{color:#fde68a;}
// .asst-jbool{color:#f9a8d4;}
// .asst-jnull{color:#52525b;}
// .asst-jbrace{color:#a78bfa;}
// .asst-cpbtn{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#9ca3af;font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s;}
// .asst-cpbtn:hover{background:rgba(255,255,255,.1);color:#e5e7eb;}

// /* ── JSON IMPORT ── */
// .json-import-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
// .json-import-wrap::-webkit-scrollbar{width:3px;}
// .json-import-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
// .json-textarea{width:100%;min-height:260px;padding:14px;border-radius:12px;border:1.5px solid #e5e7eb;background:#1e1e2e;color:#86efac;font-size:12px;font-family:'JetBrains Mono',monospace;outline:none;resize:vertical;line-height:1.7;}
// .json-textarea:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.07);}
// .score-bar{height:8px;border-radius:99px;background:#e5e7eb;overflow:hidden;margin:8px 0;}
// .score-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.34,1.2,.64,1);}

// /* ── MODE TABS LIGHT ── */
// .mode-tabs{display:flex;gap:3px;padding:4px;background:#f3f4f6;border-radius:12px;border:1px solid #e5e7eb;}
// .mode-tab{display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;border:none;background:transparent;color:#6b7280;cursor:pointer;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;transition:all .15s;}
// .mode-tab.active{background:#fff;color:#D94F3D;box-shadow:0 1px 4px rgba(0,0,0,.1);}
// `;

// /* ─── UTILS ─────────────────────────────────────────────────── */
// function buildReport(a) {
//   const d = buildWizardDataFromAnswers(a);
//   const authDetails = {};
//   ["username", "apiKey", "apiKeyHeader", "clientId", "tokenUrl", "scopes", "publicKey", "issuer", "audience", "algorithm", "entityId", "ssoUrl"].forEach(k => { if (d[k]) authDetails[k] = d[k]; });
//   return {
//     identity: { name: d.name, connectorType: d.connectorType, authType: d.authType, logo: d.logo, color: d.color, description: d.description },
//     authentication: authDetails,
//     connection: { type: d.connectionType, jdbcUrl: d.jdbcUrl, jdbcUsername: d.jdbcUsername, jdbcPassword: d.jdbcPassword ? "***" : "" },
//     tables: { selected: d.selectedTables, budgetSources: d.budgetSourceTables },
//     pipelines: {
//       factures: { enabled: true, sourceTables: d.pipelines.facture.tables, fieldMappings: d.pipelines.facture.fieldMappings },
//       commandes: { enabled: true, sourceTables: d.pipelines.commande.tables, groupBy: d.pipelines.commande.groupByCols }
//     },
//     budget: { formula: d.budgetFormula, alertYellow: Number(d.alertYellow || 75), alertRed: Number(d.alertRed || 90) },
//     tenants: d.tenants.map(t => t.id),
//   };
// }

// function computeScore(report) {
//   let s = 0;
//   if (report?.identity?.name) s += 15;
//   if (report?.connection?.jdbcUrl) s += 15;
//   if ((report?.tables?.selected || []).length > 0) s += 20;
//   if ((report?.tables?.budgetSources || []).length > 0) s += 10;
//   if ((report?.tenants || []).length > 0) s += 15;
//   if (report?.authentication && Object.keys(report.authentication).length > 0) s += 10;
//   if ((report?.pipelines?.factures?.sourceTables || []).length > 0) s += 10;
//   if ((report?.pipelines?.commandes?.sourceTables || []).length > 0) s += 5;
//   return Math.min(100, s);
// }

// /* ─── Q&A FLOW ─────────────────────────────────────────────── */
// const AUTH_DETAIL_QUESTIONS = {
//   BASIC: [
//     { id: "qa_basic_user", type: "text", key: "username", bot: () => "Quel est le nom d'utilisateur ?", placeholder: "ex: erp_user", next: "qa_basic_pw" },
//     { id: "qa_basic_pw", type: "text", key: "password", bot: () => "Mot de passe ?", placeholder: "••••••••", next: "q_conn" },
//   ],
//   API_KEY: [
//     { id: "qa_apikey", type: "text", key: "apiKey", bot: () => "Quelle est votre clé API ?", placeholder: "sk-xxxx...", next: "qa_apikey_header" },
//     { id: "qa_apikey_header", type: "text", key: "apiKeyHeader", bot: () => "Nom du header HTTP pour la clé ? (ex: X-API-Key)", placeholder: "X-API-Key", next: "q_conn" },
//   ],
//   OAUTH2: [
//     { id: "qa_oauth_id", type: "text", key: "clientId", bot: () => "Client ID OAuth2 ?", placeholder: "client_id_xxx", next: "qa_oauth_secret" },
//     { id: "qa_oauth_secret", type: "text", key: "clientSecret", bot: () => "Client Secret ?", placeholder: "••••••••", next: "qa_oauth_url" },
//     { id: "qa_oauth_url", type: "text", key: "tokenUrl", bot: () => "URL du token endpoint ?", placeholder: "https://auth.example.com/oauth/token", next: "q_conn" },
//   ],
//   JWT_SIGNED: [
//     { id: "qa_jwt_key", type: "text", key: "publicKey", bot: () => "Clé publique PEM (copiez-collez la première ligne ou l'empreinte) :", placeholder: "-----BEGIN PUBLIC KEY-----", next: "qa_jwt_issuer" },
//     { id: "qa_jwt_issuer", type: "text", key: "issuer", bot: () => "Issuer JWT ?", placeholder: "https://your-domain.com", next: "qa_jwt_algo" },
//     {
//       id: "qa_jwt_algo", type: "choice", key: "algorithm", bot: () => "Algorithme de signature ?",
//       options: [{ label: "RS256", value: "RS256" }, { label: "RS512", value: "RS512" }, { label: "ES256", value: "ES256" }, { label: "HS256", value: "HS256" }],
//       next: "q_conn"
//     },
//   ],
//   SAML: [
//     { id: "qa_saml_entity", type: "text", key: "entityId", bot: () => "Entity ID SAML ?", placeholder: "https://erp.example.com/saml/metadata", next: "qa_saml_sso" },
//     { id: "qa_saml_sso", type: "text", key: "ssoUrl", bot: () => "URL SSO SAML ?", placeholder: "https://idp.example.com/sso", next: "q_conn" },
//   ],
//   NONE: [],
// };

// // Build full QA flow with auth detail steps injected
// function buildQAFlow() {
//   const base = [
//     {
//       id: "start", type: "mode_pick", bot: "Bonjour ! 👋 Je suis votre assistant ERP. Comment souhaitez-vous configurer ce connecteur ?", options: [
//         { label: "💬 Questions / Réponses guidées", desc: "Je vous guide étape par étape", value: "qa" },
//         { label: "📋 Formulaire structuré", desc: "Toutes les sections en une page", value: "form" },
//         { label: "📄 Import JSON", desc: "Collez votre config JSON existante", value: "json" },
//       ]
//     },
//     { id: "q_name", type: "text", key: "name", bot: "Quel est le nom de ce connecteur ERP ?", placeholder: "ex: SAP Production France", next: "q_type" },
//     {
//       id: "q_type", type: "choice", key: "connectorType", bot: (a) => `Super, «${a.name || "ce système"}». Quel type ?`,
//       options: [
//         { label: "🏭 ERP (SAP, Sage, Odoo…)", value: "ERP" },
//         { label: "🗄️ Source de données SQL", value: "DATA_SOURCE" },
//         { label: "📊 Comptabilité standalone", value: "ACCOUNTING" },
//       ], next: "q_auth"
//     },
//     {
//       id: "q_auth", type: "choice", key: "authType", bot: () => "Quel mode d'authentification utilise ce système ?",
//       options: [
//         { label: "👤 Basic (user / mot de passe)", value: "BASIC" },
//         { label: "🔑 API Key", value: "API_KEY" },
//         { label: "🔐 OAuth 2.0", value: "OAUTH2" },
//         { label: "📜 JWT Signé", value: "JWT_SIGNED" },
//         { label: "🔏 SAML 2.0", value: "SAML" },
//         { label: "🚫 Aucune", value: "NONE" },
//       ],
//       nextFn: (val) => {
//         const detailSteps = AUTH_DETAIL_QUESTIONS[val] || [];
//         return detailSteps.length > 0 ? detailSteps[0].id : "q_conn";
//       }
//     },
//     // Auth detail steps (BASIC)
//     ...AUTH_DETAIL_QUESTIONS.BASIC,
//     ...AUTH_DETAIL_QUESTIONS.API_KEY,
//     ...AUTH_DETAIL_QUESTIONS.OAUTH2,
//     ...AUTH_DETAIL_QUESTIONS.JWT_SIGNED,
//     ...AUTH_DETAIL_QUESTIONS.SAML,
//     // Connection
//     {
//       id: "q_conn", type: "choice", key: "connectionType", bot: () => "Comment se connecter à la base de données ?",
//       options: [
//         { label: "🔗 JDBC (base SQL directe)", value: "jdbc" },
//         { label: "🌐 API REST", value: "api" },
//         { label: "📁 Fichier CSV / Excel", value: "csv" },
//       ], next: "q_jdbc"
//     },
//     { id: "q_jdbc", type: "text", key: "jdbcUrl", bot: () => "URL JDBC de connexion ?", placeholder: "jdbc:postgresql://host:5432/erp_db", condition: (d) => d.connectionType === "jdbc", next: "q_tables" },
//     { id: "q_tables", type: "multi_schema", key: "selectedTables", bot: (a, s) => s ? `Quelles tables importer ? (${s.tables.length} disponibles)` : "Listez les tables séparées par des virgules.", next: "q_pl_facture" },
//     // Pipeline Factures
//     { id: "q_pl_facture", type: "pipeline_facture", key: "factureMappings", bot: () => "Configurons le pipeline Factures. Mappez les colonnes requises :", next: "q_pl_commande" },
//     // Pipeline Commandes
//     { id: "q_pl_commande", type: "pipeline_commande", key: "commandeGroupBy", bot: () => "Pipeline Commandes : quelles colonnes pour le Group By ? (optionnel)", next: "q_budget_tables" },
//     // Budget
//     { id: "q_budget_tables", type: "choice_dynamic", key: "budgetSourceTables", bot: () => "Quelle table contient les données budgétaires ?", next: "q_budget_formula" },
//     {
//       id: "q_budget_formula", type: "choice", key: "budgetFormulaType", bot: () => "Formule budgétaire à utiliser ?",
//       options: [
//         { label: "Standard (Alloué − Consommé)", value: "standard" },
//         { label: "Avec engagements (Alloué − Engagé − Consommé)", value: "engaged" },
//         { label: "Personnalisée (configurer dans le wizard)", value: "custom" },
//       ], next: "q_alerts"
//     },
//     // Alerts
//     {
//       id: "q_alerts", type: "choice", key: "alertRed", bot: () => "Seuil (% consommé) pour l'alerte rouge ?",
//       options: [
//         { label: "80%", value: "80" },
//         { label: "90% (recommandé)", value: "90" },
//         { label: "95%", value: "95" },
//         { label: "100%", value: "100" },
//       ], next: "q_tenants"
//     },
//     // Tenants
//     { id: "q_tenants", type: "text", key: "_tenantsRaw", bot: () => "IDs tenants (clients) séparés par des virgules :", placeholder: "CLIENT_001, CLIENT_002", next: "q_done" },
//     { id: "q_done", type: "done", bot: (a) => `✅ Configuration complète pour «${a.name || "votre ERP"}» ! Cliquez pour voir le rapport JSON.` },
//   ];
//   return base;
// }

// const QA_FLOW = buildQAFlow();

// const QA_SIDEBAR_STEPS = [
//   { id: "q_name", label: "Nom" },
//   { id: "q_type", label: "Type" },
//   { id: "q_auth", label: "Auth" },
//   { id: "q_conn", label: "Connexion" },
//   { id: "q_jdbc", label: "URL JDBC" },
//   { id: "q_tables", label: "Tables" },
//   { id: "q_pl_facture", label: "Pipeline Factures" },
//   { id: "q_pl_commande", label: "Pipeline Commandes" },
//   { id: "q_budget_tables", label: "Budget" },
//   { id: "q_alerts", label: "Alertes" },
//   { id: "q_tenants", label: "Tenants" },
//   { id: "q_done", label: "Rapport" },
// ];

// /* ─── BASE COMPONENTS ────────────────────────────────────────── */
// function Toggle({ checked, onChange }) {
//   return (
//     <label className="toggle">
//       <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
//       <div className="toggle-track" />
//       <div className="toggle-thumb" />
//     </label>
//   );
// }

// function InfoBox({ color = C.info, children }) {
//   return (
//     <div style={{ padding: "10px 14px", borderRadius: 10, background: `${color}12`, border: `1px solid ${color}30` }}>
//       <p style={{ fontSize: 11, color, lineHeight: 1.6 }}>{children}</p>
//     </div>
//   );
// }

// function SectionAccordion({ icon, title, subtitle, children, defaultOpen = true }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="section">
//       <div className="section-hdr" onClick={() => setOpen(p => !p)}>
//         {icon && <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(217,79,61,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>}
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>{title}</div>
//           {subtitle && <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>{subtitle}</div>}
//         </div>
//         <span style={{ color: C.g400, transition: "transform .2s", display: "inline-block", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>
//           <ChevronDown size={14} />
//         </span>
//       </div>
//       {open && <div className="section-body">{children}</div>}
//     </div>
//   );
// }

// /* ─── JSON RENDERER ─────────────────────────────────────────── */
// function JSONRender({ obj, depth = 0 }) {
//   const pad = "  ".repeat(depth), pad1 = "  ".repeat(depth + 1);
//   if (obj === null) return <span className="asst-jnull">null</span>;
//   if (typeof obj === "boolean") return <span className="asst-jbool">{String(obj)}</span>;
//   if (typeof obj === "number") return <span className="asst-jnum">{obj}</span>;
//   if (typeof obj === "string") return <span className="asst-jstr">"{obj}"</span>;
//   if (Array.isArray(obj)) {
//     if (!obj.length) return <span><span className="asst-jbrace">[]</span></span>;
//     return <span><span className="asst-jbrace">{"["}</span>{"\n"}{obj.map((v, i) => <span key={i}>{pad1}<JSONRender obj={v} depth={depth + 1} />{i < obj.length - 1 ? "," : ""}{"\n"}</span>)}{pad}<span className="asst-jbrace">{"]"}</span></span>;
//   }
//   const entries = Object.entries(obj);
//   if (!entries.length) return <span><span className="asst-jbrace">{"{}"}</span></span>;
//   return <span><span className="asst-jbrace">{"{"}</span>{"\n"}{entries.map(([k, v], i) => <span key={k}>{pad1}<span className="asst-jkey">"{k}"</span><span style={{ color: "#52525b" }}>: </span><JSONRender obj={v} depth={depth + 1} />{i < entries.length - 1 ? "," : ""}{"\n"}</span>)}{pad}<span className="asst-jbrace">{"}"}</span></span>;
// }

// /* ─── REPORT VIEW ───────────────────────────────────────────── */
// function ReportView({ report, onAutofill, onBack }) {
//   const [copied, setCopied] = useState(false);
//   const score = computeScore(report);
//   const str = JSON.stringify(report, null, 2);
//   const scoreColor = score >= 70 ? "#16a34a" : score >= 40 ? "#b45309" : "#dc2626";
//   const scoreBg = score >= 70 ? "rgba(22,163,74,.07)" : score >= 40 ? "rgba(245,158,11,.07)" : "rgba(239,68,68,.07)";
//   const scoreBorder = score >= 70 ? "rgba(22,163,74,.2)" : score >= 40 ? "rgba(245,158,11,.2)" : "rgba(239,68,68,.2)";

//   const handleCopy = () => { try { navigator.clipboard?.writeText(str); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { } };
//   const handleDL = () => { const b = new Blob([str], { type: "application/json" }), u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = "erp-config.json"; a.click(); URL.revokeObjectURL(u); };

//   return (
//     <div className="asst-report-wrap">
//       <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", borderRadius: 16, background: scoreBg, border: `1px solid ${scoreBorder}`, marginBottom: 24 }}>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor, marginBottom: 4 }}>Score : {score}/100</div>
//           <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}99)` }} /></div>
//           <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
//             {score >= 70 ? "Configuration prête à être appliquée." : "Des champs importants sont manquants."}
//           </div>
//         </div>
//         <button className="asst-pbtn" onClick={onAutofill}><Wand2 size={15} /> Confirmer &amp; remplir le wizard</button>
//       </div>

//       <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
//         {[
//           { label: report?.identity?.name || "Sans nom", color: "#D94F3D" },
//           { label: report?.identity?.connectorType || "ERP", color: "#3b82f6" },
//           { label: report?.identity?.authType || "NONE", color: "#8b5cf6" },
//           { label: `${(report?.tables?.selected || []).length} table(s)`, color: "#059669" },
//           { label: `${(report?.tenants || []).length} tenant(s)`, color: "#f59e0b" },
//         ].map(c => <div key={c.label} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>{c.label}</div>)}
//       </div>

//       <div className="asst-jblock">
//         <div className="asst-jtbar">
//           <FileJson size={14} color="#7dd3fc" />
//           <span style={{ fontSize: 12, fontWeight: 700, color: "#e4e4e7", flex: 1 }}>Configuration JSON</span>
//           <button className="asst-cpbtn" onClick={handleCopy}>{copied ? <CheckCircle2 size={12} color="#4ade80" /> : <Copy size={12} />} {copied ? "Copié !" : "Copier"}</button>
//           <button className="asst-cpbtn" onClick={handleDL}><Download size={12} /> Télécharger</button>
//         </div>
//         <div className="asst-jcontent"><JSONRender obj={report} /></div>
//       </div>
//       <div style={{ height: 32 }} />
//     </div>
//   );
// }

// /* ─── JSON IMPORT VIEW ──────────────────────────────────────── */
// function JSONImportView({ onAutofill, onBack }) {
//   const [raw, setRaw] = useState("");
//   const [parsed, setParsed] = useState(null);
//   const [error, setError] = useState(null);
//   const [score, setScore] = useState(null);

//   const TEMPLATE = {
//     identity: { name: "Mon ERP", connectorType: "ERP", authType: "BASIC", logo: "ME", color: "#D94F3D", description: "" },
//     authentication: { username: "erp_user", password: "••••••" },
//     connection: { type: "jdbc", jdbcUrl: "jdbc:postgresql://host:5432/erp_db", jdbcUsername: "erp_user", jdbcPassword: "" },
//     tables: { selected: ["FACTURES", "FOURNISSEURS", "COMMANDES", "BUDGETS"], budgetSources: ["BUDGETS"] },
//     pipelines: {
//       factures: { enabled: true, sourceTables: ["FACTURES", "FOURNISSEURS"], fieldMappings: { invoiceId: "FACTURES.ID_FACTURE", supplierName: "FOURNISSEURS.NOM", invoiceDate: "FACTURES.DATE_FACT", amount: "FACTURES.MONTANT_TTC", status: "FACTURES.STATUT", label: "FACTURES.CATEGORIE" } },
//       commandes: { enabled: true, sourceTables: ["COMMANDES"], groupBy: [] }
//     },
//     budget: { alertYellow: 75, alertRed: 90 },
//     tenants: ["CLIENT_001", "CLIENT_002"],
//   };

//   const handleParse = () => {
//     try {
//       const p = JSON.parse(raw);
//       setParsed(p); setError(null); setScore(computeScore(p));
//     } catch (e) { setError("JSON invalide : " + e.message); setParsed(null); setScore(null); }
//   };

//   const handleTemplate = () => {
//     setRaw(JSON.stringify(TEMPLATE, null, 2));
//     setParsed(null); setError(null); setScore(null);
//   };

//   const handleConfirm = () => {
//     if (!parsed) return;
//     // Convert JSON structure → wizard data
//     const d = {
//       name: parsed.identity?.name || "",
//       connectorType: parsed.identity?.connectorType || "ERP",
//       authType: parsed.identity?.authType || "NONE",
//       logo: parsed.identity?.logo || "",
//       color: parsed.identity?.color || "#D94F3D",
//       description: parsed.identity?.description || "",
//       ...(parsed.authentication || {}),
//       connectionType: parsed.connection?.type || "jdbc",
//       jdbcUrl: parsed.connection?.jdbcUrl || "",
//       jdbcUsername: parsed.connection?.jdbcUsername || "",
//       jdbcPassword: parsed.connection?.jdbcPassword || "",
//       selectedTables: parsed.tables?.selected || [],
//       budgetSourceTables: parsed.tables?.budgetSources || [],
//       alertYellow: String(parsed.budget?.alertYellow || 75),
//       alertRed: String(parsed.budget?.alertRed || 90),
//       tenants: (parsed.tenants || []).map(t => typeof t === "string"
//         ? { id: t, label: t, active: true, statuses: { facture: { provisional: ["En attente"], final: ["Payé"], statusColumn: "STATUT" }, commande: { provisional: ["En cours"], final: ["Livré"], statusColumn: "STATUT" } } }
//         : t),
//       pipelines: {
//         facture: { enabled: parsed.pipelines?.factures?.enabled !== false, tables: parsed.pipelines?.factures?.sourceTables || [], fieldMappings: parsed.pipelines?.factures?.fieldMappings || {}, conditions: [], joins: [], groupByCols: [] },
//         commande: { enabled: parsed.pipelines?.commandes?.enabled !== false, tables: parsed.pipelines?.commandes?.sourceTables || [], fieldMappings: {}, conditions: [], joins: [], groupByCols: parsed.pipelines?.commandes?.groupBy || [] },
//       },
//       budgetFormula: [], customPipelines: [], generatedData: {},
//     };
//     onAutofill(d);
//   };

//   return (
//     <div className="json-import-wrap">
//       <div style={{ maxWidth: 680, margin: "0 auto" }}>
//         <div style={{ marginBottom: 20 }}>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
//             <div>
//               <div style={{ fontSize: 16, fontWeight: 700, color: C.g900 }}>Importer une configuration JSON</div>
//               <div style={{ fontSize: 12, color: C.g400, marginTop: 3 }}>Collez votre JSON de configuration ERP ci-dessous</div>
//             </div>
//             <button className="asst-gbtn" onClick={handleTemplate} style={{ fontSize: 11 }}>
//               <FileText size={13} /> Charger un modèle
//             </button>
//           </div>
//           <textarea
//             className="json-textarea"
//             value={raw}
//             onChange={e => { setRaw(e.target.value); setParsed(null); setError(null); setScore(null); }}
//             placeholder={'{\n  "identity": { "name": "Mon ERP", ... },\n  "connection": { "jdbcUrl": "...", ... },\n  ...\n}'}
//           />
//         </div>

//         {error && (
//           <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.2)", marginBottom: 16 }}>
//             <AlertTriangle size={16} color="#dc2626" />
//             <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
//           </div>
//         )}

//         {score !== null && parsed && (
//           <div style={{ padding: "16px 20px", borderRadius: 14, background: score >= 70 ? "rgba(22,163,74,.06)" : "rgba(245,158,11,.06)", border: `1px solid ${score >= 70 ? "rgba(22,163,74,.2)" : "rgba(245,158,11,.2)"}`, marginBottom: 16 }}>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
//               <div style={{ fontSize: 14, fontWeight: 700, color: score >= 70 ? "#16a34a" : "#b45309" }}>Score : {score}/100</div>
//               {score >= 40 && <button className="asst-pbtn" onClick={handleConfirm}><Wand2 size={14} /> Confirmer &amp; remplir le wizard</button>}
//             </div>
//             <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: score >= 70 ? "linear-gradient(90deg,#16a34a,#22c55e)" : "linear-gradient(90deg,#b45309,#f59e0b)" }} /></div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
//               {[
//                 { label: parsed?.identity?.name || "—", color: "#D94F3D" },
//                 { label: (parsed?.tables?.selected || []).length + " tables", color: "#059669" },
//                 { label: (parsed?.tenants || []).length + " tenants", color: "#f59e0b" },
//               ].map(c => <div key={c.label} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>{c.label}</div>)}
//             </div>
//           </div>
//         )}

//         <div style={{ display: "flex", gap: 10 }}>
//           <button className="asst-pbtn" onClick={handleParse} disabled={!raw.trim()}>
//             <CheckCircle2 size={14} /> Analyser le JSON
//           </button>
//           {score !== null && score < 40 && (
//             <div style={{ fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
//               <AlertTriangle size={14} /> Score trop bas — complétez les champs manquants
//             </div>
//           )}
//         </div>

//         {/* Structure reference */}
//         <div style={{ marginTop: 28, padding: "16px 20px", borderRadius: 14, background: C.g50, border: `1px solid ${C.g200}` }}>
//           <div style={{ fontSize: 12, fontWeight: 700, color: C.g700, marginBottom: 10 }}>Structure attendue</div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
//             {[
//               { key: "identity.name", desc: "Nom du connecteur", required: true },
//               { key: "connection.jdbcUrl", desc: "URL JDBC", required: true },
//               { key: "tables.selected[]", desc: "Liste des tables", required: true },
//               { key: "tables.budgetSources[]", desc: "Tables budget", required: false },
//               { key: "pipelines.factures", desc: "Config pipeline factures", required: false },
//               { key: "tenants[]", desc: "IDs clients", required: false },
//               { key: "budget.alertRed", desc: "Seuil alerte rouge", required: false },
//               { key: "authentication", desc: "Détails auth (selon type)", required: false },
//             ].map(f => (
//               <div key={f.key} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
//                 <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: f.required ? C.redLight : C.g100, color: f.required ? C.red : C.g400, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{f.required ? "REQ" : "OPT"}</span>
//                 <div>
//                   <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g700 }}>{f.key}</div>
//                   <div style={{ fontSize: 10, color: C.g400 }}>{f.desc}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div style={{ height: 32 }} />
//       </div>
//     </div>
//   );
// }

// /* ─── MULTI CHIP ─────────────────────────────────────────────── */
// function MultiChip({ options, value, onChange }) {
//   return (
//     <div className="asst-chip-row">
//       {options.map(opt => {
//         const s = value.includes(opt.value);
//         return <button key={opt.value} className={`asst-chip${s ? " sel" : ""}`} onClick={() => onChange(s ? value.filter(x => x !== opt.value) : [...value, opt.value])}>{opt.label}</button>;
//       })}
//     </div>
//   );
// }

// /* ─── PIPELINE FACTURE STEP (in Q&A) ───────────────────────── */
// function PipelineFactureMsgWidget({ plCols, value, onChange }) {
//   const fixedFields = PIPELINE_DEFS.facture.fixedFields;
//   const [mapping, setMapping] = useState(value || {});
//   const update = (k, v) => { const next = { ...mapping, [k]: v }; setMapping(next); onChange(next); };
//   return (
//     <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
//       {fixedFields.map(f => (
//         <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(217,79,61,.04)", borderRadius: 10, border: "1px solid rgba(217,79,61,.15)" }}>
//           <div style={{ minWidth: 130, fontSize: 11, fontWeight: 700, color: C.g700 }}>{f.label} <span style={{ color: C.red }}>*</span></div>
//           <span style={{ color: C.g300, fontSize: 12 }}>→</span>
//           <select value={mapping[f.key] || ""} onChange={e => update(f.key, e.target.value)}
//             style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: "none" }}>
//             <option value="">-- Colonne --</option>
//             {plCols.map(c => <option key={c} value={c}>{c}</option>)}
//           </select>
//           {mapping[f.key] && <CheckCircle2 size={13} color={C.success} />}
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─── SMART FORM SECTIONS ───────────────────────────────────── */
// const SMART_FORM_SECTIONS = [
//   {
//     id: "identity", label: "Identité", color: "#D94F3D", Icon: Tag,
//     fields: [
//       { key: "name", label: "Nom du connecteur", type: "text", placeholder: "SAP S/4HANA Production", span: 2 },
//       { key: "connectorType", label: "Type de système", type: "select", options: ["ERP", "DATA_SOURCE", "ACCOUNTING"] },
//       { key: "authType", label: "Authentification", type: "select", options: ["NONE", "BASIC", "API_KEY", "OAUTH2", "JWT_SIGNED", "SAML"] },
//       { key: "description", label: "Description", type: "text", placeholder: "Connecteur ERP…", span: 2 },
//       { key: "logo", label: "Initiales (2 car.)", type: "text", placeholder: "SP", maxLen: 2 },
//       { key: "color", label: "Couleur", type: "color" },
//     ]
//   },
//   {
//     id: "auth_details", label: "Détails d'authentification", color: "#6366f1", Icon: Settings2,
//     fields: [], // dynamic based on authType
//     dynamic: true,
//   },
//   {
//     id: "connection", label: "Connexion", color: "#3b82f6", Icon: Plug,
//     fields: [
//       { key: "connectionType", label: "Type de connexion", type: "select", options: ["jdbc", "api", "csv"] },
//       { key: "jdbcUrl", label: "URL JDBC", type: "text", placeholder: "jdbc:postgresql://host:5432/erp_db", span: 2, mono: true },
//       { key: "jdbcUsername", label: "Utilisateur", type: "text", placeholder: "erp_user" },
//       { key: "jdbcPassword", label: "Mot de passe", type: "password", placeholder: "••••••••" },
//     ]
//   },
//   {
//     id: "tables", label: "Tables", color: "#059669", Icon: Database,
//     fields: [
//       { key: "selectedTables", label: "Tables à importer", type: "table_picker", span: 2 },
//       { key: "budgetSourceTables", label: "Tables sources budget", type: "table_subset", span: 2 },
//     ]
//   },
//   {
//     id: "pipelines", label: "Pipelines", color: "#D94F3D", Icon: GitBranch,
//     fields: [
//       { key: "factureTables", label: "Tables Factures", type: "table_subset_key", sourceKey: "selectedTables", span: 2 },
//       { key: "commandeTables", label: "Tables Commandes", type: "table_subset_key", sourceKey: "selectedTables", span: 2 },
//     ]
//   },
//   {
//     id: "alerts", label: "Alertes & Tenants", color: "#f59e0b", Icon: Cpu,
//     fields: [
//       { key: "alertYellow", label: "Seuil jaune (%)", type: "number", placeholder: "75" },
//       { key: "alertRed", label: "Seuil rouge (%)", type: "number", placeholder: "90" },
//       { key: "_tenantsRaw", label: "IDs Tenants (virgule)", type: "text", placeholder: "CLIENT_001, CLIENT_002", span: 2 },
//     ]
//   },
// ];

// function SmartFormPanel({ formData, setFormData, schema, onSubmit }) {
//   const allTables = schema?.tables || [];
//   const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));
//   const [pwVis, setPwVis] = useState({});

//   const authFields = AUTH_FIELDS[formData.authType] || [];
//   const nonPickerFields = SMART_FORM_SECTIONS.flatMap(s => {
//     if (s.dynamic) return authFields;
//     return s.fields;
//   }).filter(f => !["table_picker", "table_subset", "table_subset_key", "color"].includes(f?.type));
//   const filled = nonPickerFields.filter(f => f?.key && formData[f.key]).length;
//   const pct = nonPickerFields.length ? Math.round((filled / nonPickerFields.length) * 100) : 0;

//   const renderF = (f) => {
//     if (!f || !f.key) return null;
//     const v = formData[f.key];
//     const spanAll = f.span === 2 ? { gridColumn: "1 / -1" } : {};

//     if (f.type === "table_picker") {
//       const sel = Array.isArray(v) ? v : [];
//       return <div key={f.key} style={{ gridColumn: "1 / -1" }}>
//         <label className="asst-flabel">{f.label}</label>
//         {allTables.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Saisissez d'abord une URL JDBC</div> :
//           <div className="asst-chip-row">{allTables.map(t => { const s = sel.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? sel.filter(x => x !== t.name) : [...sel, t.name])}>{t.name}</button>; })}</div>}
//       </div>;
//     }
//     if (f.type === "table_subset" || f.type === "table_subset_key") {
//       const parentSel = Array.isArray(formData.selectedTables) ? formData.selectedTables : [];
//       const v2 = Array.isArray(v) ? v : [];
//       const avail = allTables.filter(t => parentSel.includes(t.name));
//       return <div key={f.key} style={{ gridColumn: "1 / -1" }}>
//         <label className="asst-flabel">{f.label}</label>
//         {avail.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Sélectionnez d'abord des tables</div> :
//           <div className="asst-chip-row">{avail.map(t => { const s = v2.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? v2.filter(x => x !== t.name) : [...v2, t.name])}>{t.name}</button>; })}</div>}
//       </div>;
//     }
//     if (f.type === "select") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><select className="asst-fsel" value={v || ""} onChange={e => update(f.key, e.target.value)}>{(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
//     if (f.type === "color") return <div key={f.key}><label className="asst-flabel">{f.label}</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ width: 42, height: 42, padding: 3, border: "1.5px solid #e5e7eb", borderRadius: 9, cursor: "pointer" }} /><input className="asst-fi" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }} /></div></div>;
//     if (f.type === "password") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><div style={{ position: "relative" }}><input type={pwVis[f.key] ? "text" : "password"} className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} style={{ paddingRight: 40 }} /><button onClick={() => setPwVis(p => ({ ...p, [f.key]: !p[f.key] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>{pwVis[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>;
//     if (f.type === "textarea") return <div key={f.key} style={{ gridColumn: "1/-1" }}><label className="asst-flabel">{f.label}</label><textarea className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} rows={4} style={{ resize: "vertical", height: 80, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} /></div>;
//     return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><input type={f.type === "number" ? "number" : "text"} className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder || ""} maxLength={f.maxLen} style={f.mono ? { fontFamily: "'JetBrains Mono',monospace", fontSize: 12 } : {}} /></div>;
//   };

//   return (
//     <div className="asst-form-wrap">
//       <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
//         <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#e5e7eb", overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#D94F3D,#f97316)", transition: "width .4s", borderRadius: 99 }} /></div>
//         <span style={{ fontSize: 11, color: pct === 100 ? "#16a34a" : "#9ca3af", fontWeight: 700, minWidth: 32 }}>{pct}%</span>
//       </div>
//       {SMART_FORM_SECTIONS.map(sec => {
//         const SI = sec.Icon;
//         const fields = sec.dynamic ? authFields : sec.fields;
//         if (sec.dynamic && fields.length === 0) return null;
//         return <div key={sec.id} className="asst-fsec">
//           <div className="asst-fsec-hdr">
//             <div style={{ width: 32, height: 32, borderRadius: 9, background: `${sec.color}14`, border: `1px solid ${sec.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SI size={15} color={sec.color} /></div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{sec.label}</div>
//           </div>
//           <div className="asst-fsec-body"><div className="asst-frow">{fields.map(f => renderF(f))}</div></div>
//         </div>;
//       })}
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
//         <button className="asst-pbtn" onClick={onSubmit}><Sparkles size={15} /> Générer le rapport JSON</button>
//       </div>
//     </div>
//   );
// }

// /* ─── FULL ASSISTANT PANEL ──────────────────────────────────── */
// function AssistantFullscreen({ onClose, onAutofill, rawSchema }) {
//   const [mode, setMode] = useState(null); // null | "qa" | "form" | "json"
//   const [qaStepIdx, setQaStepIdx] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [messages, setMessages] = useState([]);
//   const [textInput, setTextInput] = useState("");
//   const [typing, setTyping] = useState(false);
//   const [multiSel, setMultiSel] = useState([]);
//   const [factureMappingTemp, setFactureMappingTemp] = useState({});
//   const [report, setReport] = useState(null);
//   const [showReport, setShowReport] = useState(false);
//   const [formData, setFormData] = useState({ color: "#D94F3D", connectorType: "ERP", authType: "NONE", connectionType: "jdbc", selectedTables: [], budgetSourceTables: [] });
//   const chatEndRef = useRef(null);

//   const curStep = QA_FLOW[qaStepIdx];
//   const schema = useMemo(() => {
//     const url = answers.jdbcUrl || "";
//     if (!url && !rawSchema) return null;
//     if (rawSchema) {
//       const sel = answers.selectedTables || [];
//       if (sel.length === 0) return rawSchema;
//       const tables = rawSchema.tables.filter(t => sel.includes(t.name));
//       const tableNames = new Set(tables.map(t => t.name));
//       return { tables, rels: rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to)) };
//     }
//     return GENERIC_SCHEMA;
//   }, [answers.jdbcUrl, answers.selectedTables, rawSchema]);

//   const scrollB = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   useEffect(() => { if (messages.length === 0) initChat(); }, []);
//   useEffect(() => { scrollB(); }, [messages, typing]);

//   const addBot = (text, opts = {}) => setMessages(p => [...p, { role: "bot", text, ...opts }]);
//   const addUser = text => setMessages(p => [...p, { role: "user", text }]);

//   const initChat = () => {
//     setQaStepIdx(0); setMode(null); setAnswers({}); setMultiSel([]); setReport(null); setShowReport(false); setFactureMappingTemp({});
//     const s = QA_FLOW[0];
//     setTimeout(() => setMessages([{ role: "bot", text: s.bot, type: s.type, options: s.options }]), 80);
//   };

//   const advanceToStep = useCallback((targetId, curAnswers) => {
//     const idx = QA_FLOW.findIndex(s => s.id === targetId);
//     if (idx < 0) return;
//     setTyping(true);
//     setTimeout(() => {
//       setTyping(false);
//       let si = idx, ns = QA_FLOW[si];
//       while (ns?.condition && !ns.condition(curAnswers)) {
//         const ni = QA_FLOW.findIndex(s => s.id === ns.next);
//         if (ni < 0) break; si = ni; ns = QA_FLOW[si];
//       }
//       if (!ns) return;
//       const bt = typeof ns.bot === "function" ? ns.bot(curAnswers, schema) : ns.bot;
//       const opts = { type: ns.type };
//       if (ns.type === "choice" || ns.type === "mode_pick") opts.options = ns.options;
//       else if (ns.type === "multi_schema") opts.schOpts = (schema?.tables || GENERIC_SCHEMA.tables).map(t => ({ label: t.name, value: t.name }));
//       else if (ns.type === "choice_dynamic") opts.dynOpts = (curAnswers.selectedTables || []).map(n => ({ label: n, value: n }));
//       else if (ns.type === "pipeline_facture") {
//         const selTables = curAnswers.selectedTables || [];
//         const plCols = (schema?.tables || GENERIC_SCHEMA.tables)
//           .filter(t => selTables.includes(t.name))
//           .flatMap(t => t.cols.map(c => `${t.name}.${c}`));
//         opts.plCols = plCols;
//       }
//       else if (ns.type === "pipeline_commande") {
//         const selTables = curAnswers.selectedTables || [];
//         const plCols = (schema?.tables || GENERIC_SCHEMA.tables)
//           .filter(t => selTables.includes(t.name))
//           .flatMap(t => t.cols.map(c => ({ label: `${t.name}.${c}`, value: `${t.name}.${c}` })));
//         opts.schOpts = plCols;
//       }
//       else if (ns.placeholder) opts.placeholder = ns.placeholder;
//       addBot(bt, opts); setQaStepIdx(si);
//     }, 600);
//   }, [schema]);

//   const advanceQA = useCallback((key, answer, display) => {
//     const step = QA_FLOW[qaStepIdx];
//     const na = key ? { ...answers, [key]: answer } : { ...answers };
//     if (key) setAnswers(na);
//     setMultiSel([]);
//     if (display) addUser(display);
//     else if (answer !== undefined && answer !== null) addUser(Array.isArray(answer) ? answer.join(", ") : String(answer));

//     // Determine next step ID
//     let nextId;
//     if (step.nextFn) nextId = step.nextFn(answer, na);
//     else nextId = step.next;
//     if (!nextId) return;
//     advanceToStep(nextId, na);
//   }, [qaStepIdx, answers, advanceToStep]);

//   const handleModeChoice = (v) => {
//     setMode(v);
//     addUser(v === "qa" ? "💬 Questions / Réponses" : v === "form" ? "📋 Formulaire" : "📄 Import JSON");
//     if (v === "qa") {
//       setTyping(true);
//       setTimeout(() => {
//         setTyping(false);
//         const n = QA_FLOW[1];
//         addBot(n.bot, { type: n.type, placeholder: n.placeholder });
//         setQaStepIdx(1);
//       }, 400);
//     } else {
//       setTyping(true);
//       setTimeout(() => {
//         setTyping(false);
//         addBot(v === "form" ? "Parfait ! Remplissez le formulaire ci-dessous." : "Collez votre JSON de configuration ci-dessous.", { type: "switch_" + v });
//       }, 400);
//     }
//   };

//   const handleTextSubmit = () => {
//     if (!textInput.trim()) return;
//     advanceQA(curStep?.key, textInput.trim(), textInput.trim());
//     setTextInput("");
//   };

//   const genReport = (src) => {
//     const r = buildReport(src);
//     setReport(r); setShowReport(true);
//   };

//   const handleAutofillAndClose = () => {
//     const src = mode === "form" ? formData : answers;
//     onAutofill(buildWizardDataFromAnswers(src, schema));
//     onClose();
//   };

//   const isDone = curStep?.id === "q_done";
//   const showSidebar = mode === "qa";
//   const modePct = mode === "qa" ? Math.round((qaStepIdx / (QA_FLOW.length - 1)) * 100) : 0;
//   const isForm = mode === "form";
//   const isJSON = mode === "json";

//   return createPortal(
//     <div className="asst-fs">
//       <style>{CSS}</style>
//       {/* Header */}
//       <div className="asst-fs-hdr">
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <Bot size={18} color="#D94F3D" />
//           </div>
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>Assistant Configuration ERP</div>
//             <div style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 5 }}>
//               <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />
//               100% local · Aucune IA externe
//             </div>
//           </div>
//         </div>
//         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//           {mode && !showReport && !isJSON && (
//             <div className="mode-tabs">
//               {[{ v: "qa", I: MessageSquare, label: "Q&A" }, { v: "form", I: FileJson, label: "Formulaire" }, { v: "json", I: Upload, label: "JSON" }].map(({ v, I, label }) => (
//                 <button key={v} className={`mode-tab${mode === v ? " active" : ""}`} onClick={() => { setMode(v); setShowReport(false); }}>
//                   <I size={12} /> {label}
//                 </button>
//               ))}
//             </div>
//           )}
//           {(showReport || isJSON) && <button className="asst-gbtn" onClick={() => { setShowReport(false); }}><ArrowLeft size={13} /> Retour</button>}
//           <button onClick={initChat} title="Recommencer"
//             style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
//             <RotateCcw size={14} />
//           </button>
//           <button onClick={onClose}
//             style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
//             <X size={15} />
//           </button>
//         </div>
//       </div>

//       {mode === "qa" && <div className="asst-prog-rail"><div className="asst-prog-fill" style={{ width: `${modePct}%` }} /></div>}

//       <div className="asst-fs-body">
//         {/* Sidebar for Q&A */}
//         {showSidebar && (
//           <div className="asst-fs-sidebar">
//             <div style={{ fontSize: 9, fontWeight: 700, color: C.g300, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, paddingLeft: 4 }}>Étapes</div>
//             {QA_SIDEBAR_STEPS.map((s, i) => {
//               const idx = QA_FLOW.findIndex(q => q.id === s.id);
//               const done = qaStepIdx > idx, active = curStep?.id === s.id;
//               return (
//                 <div key={s.id} className={`asst-ss${active ? " active" : done ? " done" : ""}`}>
//                   <div className="asst-sn">{done ? <CheckCircle2 size={11} color={C.success} /> : i + 1}</div>
//                   <span style={{ fontSize: 11, fontWeight: active ? 700 : done ? 500 : 400, color: active ? C.red : done ? C.g500 : C.g300 }}>{s.label}</span>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Main content */}
//         <div className="asst-fs-main">
//           {showReport && report ? (
//             <ReportView report={report} onAutofill={handleAutofillAndClose} onBack={() => setShowReport(false)} />
//           ) : isJSON ? (
//             <JSONImportView onAutofill={(d) => { onAutofill(d); onClose(); }} onBack={() => setMode(null)} />
//           ) : isForm ? (
//             <SmartFormPanel formData={formData} setFormData={setFormData} schema={schema || GENERIC_SCHEMA} onSubmit={() => genReport(formData)} />
//           ) : (
//             <>
//               <div className="asst-chat-wrap">
//                 <div className="asst-chat-inner">
//                   {messages.map((msg, i) => (
//                     <div key={i} className={`${msg.role === "bot" ? "asst-msg-bot" : "asst-msg-user"} asst-anim`}>
//                       {msg.role === "bot" && (
//                         <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
//                           <Bot size={15} color="#D94F3D" />
//                         </div>
//                       )}
//                       <div style={{ maxWidth: "100%" }}>
//                         <div className={msg.role === "bot" ? "asst-bb" : "asst-bu"}>{msg.text}</div>

//                         {/* Mode pick */}
//                         {msg.role === "bot" && msg.type === "mode_pick" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             {(msg.options || []).map((opt, oi) => (
//                               <button key={oi} className="asst-opt" onClick={() => handleModeChoice(opt.value)}>
//                                 <span style={{ flex: 1 }}>{opt.label}</span>
//                                 {opt.desc && <span style={{ fontSize: 11, color: C.g400 }}>{opt.desc}</span>}
//                                 <ChevronRight size={14} color={C.g300} />
//                               </button>
//                             ))}
//                           </div>
//                         )}

//                         {/* Regular choice */}
//                         {msg.role === "bot" && msg.type === "choice" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             {(msg.options || []).map((opt, oi) => (
//                               <button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, opt.value, opt.label)}>
//                                 <span style={{ flex: 1 }}>{opt.label}</span>
//                                 <ChevronRight size={14} color={C.g300} />
//                               </button>
//                             ))}
//                           </div>
//                         )}

//                         {/* Dynamic choice (tables for budget) */}
//                         {msg.role === "bot" && msg.type === "choice_dynamic" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             {(msg.dynOpts || []).length === 0
//                               ? <div style={{ fontSize: 12, color: C.g400 }}>Aucune table sélectionnée</div>
//                               : (msg.dynOpts || []).map((opt, oi) => (
//                                 <button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, [opt.value], opt.label)}>
//                                   <Database size={13} color={C.g400} /><span style={{ flex: 1 }}>{opt.label}</span><ChevronRight size={14} color={C.g300} />
//                                 </button>
//                               ))
//                             }
//                           </div>
//                         )}

//                         {/* Multi schema (table selection) */}
//                         {msg.role === "bot" && msg.type === "multi_schema" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             <MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} />
//                             <button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }} disabled={multiSel.length === 0}
//                               onClick={() => advanceQA(curStep?.key, multiSel, `${multiSel.length} table(s)`)}>
//                               <Check size={13} /> Confirmer ({multiSel.length})
//                             </button>
//                           </div>
//                         )}

//                         {/* Pipeline Factures mapping */}
//                         {msg.role === "bot" && msg.type === "pipeline_facture" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             <PipelineFactureMsgWidget
//                               plCols={msg.plCols || []}
//                               value={factureMappingTemp}
//                               onChange={setFactureMappingTemp}
//                             />
//                             <button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }}
//                               onClick={() => advanceQA(curStep?.key, factureMappingTemp, "Mapping factures configuré")}>
//                               <Check size={13} /> Confirmer le mapping
//                             </button>
//                             <button className="asst-gbtn" style={{ marginTop: 8, fontSize: 11, padding: "7px 14px" }}
//                               onClick={() => advanceQA(curStep?.key, {}, "Mapping ignoré (configurer dans le wizard)")}>
//                               Passer — configurer plus tard
//                             </button>
//                           </div>
//                         )}

//                         {/* Pipeline Commandes group by */}
//                         {msg.role === "bot" && msg.type === "pipeline_commande" && i === messages.length - 1 && (
//                           <div style={{ marginTop: 10 }}>
//                             <MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} />
//                             <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
//                               <button className="asst-pbtn" style={{ fontSize: 12, padding: "9px 16px" }}
//                                 onClick={() => advanceQA(curStep?.key, multiSel, multiSel.length ? `${multiSel.length} col(s) Group By` : "Pas de Group By")}>
//                                 <Check size={13} /> Confirmer
//                               </button>
//                               <button className="asst-gbtn" style={{ fontSize: 11, padding: "7px 14px" }}
//                                 onClick={() => advanceQA(curStep?.key, [], "Pas de Group By")}>
//                                 Passer
//                               </button>
//                             </div>
//                           </div>
//                         )}

//                         {/* Done */}
//                         {msg.role === "bot" && msg.type === "done" && (
//                           <button className="asst-pbtn" style={{ marginTop: 12 }} onClick={() => genReport(answers)}>
//                             <FileJson size={15} /> Voir le rapport JSON
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                   {typing && (
//                     <div className="asst-msg-bot asst-anim">
//                       <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                         <Bot size={15} color="#D94F3D" />
//                       </div>
//                       <div className="asst-typing"><span /><span /><span /></div>
//                     </div>
//                   )}
//                   <div ref={chatEndRef} />
//                 </div>
//               </div>

//               {mode === "qa" && !isDone && curStep?.type === "text" && (
//                 <div className="asst-input-bar">
//                   <div className="asst-input-bar-inner">
//                     <input className="asst-ti" value={textInput} onChange={e => setTextInput(e.target.value)}
//                       onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
//                       placeholder={curStep?.placeholder || "Tapez votre réponse…"} />
//                     <button className="asst-sb" onClick={handleTextSubmit} disabled={!textInput.trim()}>
//                       <Send size={16} color="#fff" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// }

// /* ─── CHAT BUBBLE + POPUP ───────────────────────────────────── */
// function AssistantBubble({ onOpen, hasData }) {
//   const [showTooltip] = useState(true);
//   return createPortal(
//     <button className="asst-fab" onClick={onOpen} title="Ouvrir l'assistant ERP">
//       <Bot size={26} color="#fff" />
//       {hasData && <div className="asst-fab-badge"><Check size={10} /></div>}
//       <span className="asst-tooltip">Assistant ERP</span>
//     </button>,
//     document.body
//   );
// }

// /* ─── ERD ────────────────────────────────────────────────────── */
// function SchemaERD({ schema, tableRoles, onSelectTable, selectedTable, height = 480 }) {
//   const [search, setSearch] = useState("");
//   const [selectedRel, setSelectedRel] = useState(null);
//   const [hoveredTable, setHoveredTable] = useState(null);
//   const viewportRef = useRef();
//   const panRef = useRef({ isPanning: false, startX: 0, startY: 0, camX: 0, camY: 0 });
//   const [cam, setCam] = useState({ x: 30, y: 30, scale: 0.88 });

//   const tableNames = schema?.tables?.map(t => t.name) || [];
//   const tables = {};
//   schema?.tables?.forEach(t => { tables[t.name] = t; });
//   const relationships = schema?.rels || [];

//   const highlighted = useMemo(() => {
//     if (!search) return new Set();
//     const q = search.toLowerCase();
//     return new Set(tableNames.filter(n => n.toLowerCase().includes(q)));
//   }, [search, tableNames]);

//   const cardPositions = useMemo(() => Object.fromEntries(tableNames.map((name, i) => {
//     const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: Math.floor(i / 4) * 290 };
//     return [name, { x: PAD + off.x, y: PAD + off.y }];
//   })), [tableNames]);

//   const cardHeight = name => { const t = tables[name]; if (!t) return 80; return 36 + Math.min(t.cols.length, MAX_COLS) * 20 + (t.cols.length > MAX_COLS ? 18 : 4); };

//   const canvasW = Math.max(...(tableNames.length ? tableNames.map((_, i) => { const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: 0 }; return PAD + off.x + CARD_W + PAD * 3; }) : [900]), 900);
//   const canvasH = Math.max(...(tableNames.length ? tableNames.map((name, i) => { const off = ERD_OFFSETS[i] || { x: 0, y: Math.floor(i / 4) * 290 }; return PAD + off.y + cardHeight(name) + PAD * 3; }) : [600]), 600);

//   const fitView = useCallback(() => {
//     const vp = viewportRef.current; if (!vp) return;
//     const W = vp.clientWidth, H = vp.clientHeight;
//     const scale = Math.min((W - 60) / canvasW, (H - 60) / canvasH, 1);
//     setCam({ scale, x: (W - canvasW * scale) / 2, y: (H - canvasH * scale) / 2 });
//   }, [canvasW, canvasH]);

//   useEffect(() => { fitView(); }, [tableNames.length]);

//   const onMouseDown = useCallback(e => {
//     if (e.target.closest(".erd-table-card")) return;
//     panRef.current = { isPanning: true, startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y };
//     viewportRef.current.style.cursor = "grabbing"; e.preventDefault();
//   }, [cam]);
//   const onMouseMove = useCallback(e => {
//     if (!panRef.current.isPanning) return;
//     setCam(c => ({ ...c, x: panRef.current.camX + (e.clientX - panRef.current.startX), y: panRef.current.camY + (e.clientY - panRef.current.startY) }));
//   }, []);
//   const onMouseUp = useCallback(() => { panRef.current.isPanning = false; if (viewportRef.current) viewportRef.current.style.cursor = "grab"; }, []);
//   const onWheel = useCallback(e => {
//     e.preventDefault();
//     const rect = viewportRef.current.getBoundingClientRect();
//     const mx = e.clientX - rect.left, my = e.clientY - rect.top, delta = e.deltaY > 0 ? 0.9 : 1.11;
//     setCam(c => { const ns = Math.max(0.25, Math.min(2.5, c.scale * delta)); const wx = (mx - c.x) / c.scale, wy = (my - c.y) / c.scale; return { scale: ns, x: mx - wx * ns, y: my - wy * ns }; });
//   }, []);
//   useEffect(() => { const el = viewportRef.current; if (!el) return; el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel); }, [onWheel]);

//   if (!schema || !tableNames.length) return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, background: C.canvas, borderRadius: 14, color: "rgba(255,255,255,.18)", fontSize: 13, flexDirection: "column", gap: 10 }}>
//       <Database size={32} style={{ opacity: .2 }} />
//       <span>Aucune table sélectionnée</span>
//     </div>
//   );

//   return (
//     <div style={{ display: "flex", gap: 10, position: "relative" }}>
//       <div style={{ flex: 1, background: C.canvas, borderRadius: 14, overflow: "hidden", position: "relative", minHeight: height }}>
//         <div ref={viewportRef} style={{ height, overflow: "hidden", cursor: "grab", position: "relative", userSelect: "none" }}
//           onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
//           <div style={{ position: "absolute", transformOrigin: "0 0", willChange: "transform", transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.scale})`, width: canvasW, height: canvasH }}>
//             <svg style={{ position: "absolute", inset: 0, width: canvasW, height: canvasH, pointerEvents: "none", overflow: "visible" }}>
//               <defs>
//                 <marker id="erd-arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="rgba(217,79,61,.55)" /></marker>
//                 <marker id="erd-arr-act" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#D94F3D" /></marker>
//               </defs>
//               {relationships.map((rel, i) => {
//                 const isActive = selectedRel === i || (hoveredTable && (hoveredTable === rel.from || hoveredTable === rel.to));
//                 const fp = cardPositions[rel.from], tp = cardPositions[rel.to]; if (!fp || !tp) return null;
//                 const fr = fp.x < tp.x, fh = cardHeight(rel.from), th = cardHeight(rel.to);
//                 const ax1 = fp.x + (fr ? CARD_W : 0), ay1 = fp.y + fh / 2, ax2 = tp.x + (fr ? 0 : CARD_W), ay2 = tp.y + th / 2;
//                 const cp = Math.abs(ax2 - ax1) * 0.42;
//                 const d = `M${ax1} ${ay1} C${ax1 + (fr ? cp : -cp)} ${ay1},${ax2 + (fr ? -cp : cp)} ${ay2},${ax2} ${ay2}`;
//                 return (
//                   <g key={i} style={{ pointerEvents: "all", cursor: "pointer" }} onClick={() => setSelectedRel(selectedRel === i ? null : i)}>
//                     <path d={d} fill="none" stroke="transparent" strokeWidth={10} />
//                     {isActive && <path d={d} fill="none" stroke="rgba(217,79,61,.15)" strokeWidth={5} />}
//                     <path d={d} fill="none" stroke={isActive ? "#D94F3D" : "rgba(217,79,61,.38)"} strokeWidth={isActive ? 1.8 : 1.1} markerEnd={`url(#${isActive ? "erd-arr-act" : "erd-arr"})`} />
//                     {isActive && (() => { const mx = (ax1 + ax2) / 2, my = (ay1 + ay2) / 2 - 2, lw = rel.col.length * 5 + 16; return (<g><rect x={mx - lw / 2} y={my - 8} width={lw} height={15} rx={4} fill="rgba(10,10,14,.94)" stroke="rgba(217,79,61,.3)" strokeWidth={0.7} /><text x={mx} y={my + 4} textAnchor="middle" fill="#fca5a5" fontSize={8} fontFamily="'JetBrains Mono',monospace">{rel.col}</text></g>); })()}
//                   </g>
//                 );
//               })}
//             </svg>
//             <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
//             {tableNames.map((name, i) => {
//               const pos = cardPositions[name], color = TABLE_PALETTE[i % TABLE_PALETTE.length], t = tables[name];
//               const isHl = highlighted.has(name) || hoveredTable === name || (selectedRel !== null && (relationships[selectedRel]?.from === name || relationships[selectedRel]?.to === name)) || selectedTable === name;
//               return (
//                 <div key={name} className={`erd-table-card${isHl ? " highlighted" : ""}`} style={{ left: pos.x, top: pos.y }}
//                   onMouseEnter={() => setHoveredTable(name)} onMouseLeave={() => setHoveredTable(null)}
//                   onClick={() => onSelectTable(selectedTable === name ? null : name)}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderBottom: `1px solid ${color.fill}40` }}>
//                     <div style={{ width: 20, height: 20, borderRadius: 5, background: color.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Database size={10} color="#fff" /></div>
//                     <div style={{ fontSize: 10, fontWeight: 600, color: "#e4e4e7", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
//                     <div style={{ fontSize: 9, color: "#52525b", fontFamily: "'JetBrains Mono',monospace" }}>{t.rowCount > 1000 ? (t.rowCount / 1000).toFixed(0) + "k" : t.rowCount}</div>
//                   </div>
//                   {t.cols.slice(0, MAX_COLS).map(col => {
//                     const ct = inferColType(col);
//                     const isLinked = relationships.some(r => r.col === col && (r.from === name || r.to === name));
//                     return (
//                       <div key={col} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3.5px 10px", fontSize: 9, borderBottom: "1px solid rgba(255,255,255,.025)" }}>
//                         {ct === "pk" ? <span style={{ fontSize: 9 }}>🔑</span> : isLinked ? <Link2 size={8} color="#5eead4" style={{ flexShrink: 0 }} /> : <span style={{ width: 7, height: 7, borderRadius: 2, border: "1px solid rgba(255,255,255,.1)", display: "inline-block", flexShrink: 0 }} />}
//                         <span style={{ fontFamily: "'JetBrains Mono',monospace", color: ct === "pk" ? "#fcd34d" : isLinked ? "#5eead4" : "#a1a1aa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 9 }}>{col}</span>
//                       </div>
//                     );
//                   })}
//                   {t.cols.length > MAX_COLS && <div style={{ padding: "2px 10px 4px", fontSize: 8, color: "#52525b" }}>+{t.cols.length - MAX_COLS} more</div>}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//         <div className="erd-search-bar">
//           <Search size={11} color="#52525b" />
//           <input className="erd-search-input" placeholder="Rechercher table…" value={search} onChange={e => setSearch(e.target.value)} />
//           {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}><X size={10} /></button>}
//         </div>
//         <div className="erd-zoom-controls">
//           <button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.min(2.5, c.scale * 1.2) }))}>+</button>
//           <button className="erd-zoom-btn" onClick={fitView} style={{ fontSize: 10 }}>⊡</button>
//           <button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.max(0.25, c.scale * 0.85) }))}>−</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─── WIZARD STEPS (unchanged from original, kept full) ──────── */
// function ExplorationStep({ data, setData, schema, selectedTable, setSelectedTable }) {
//   const [graphView, setGraphView] = useState("erd");
//   const tableInfo = schema?.tables?.find(t => t.name === selectedTable);
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.info}>Schéma filtré — <strong>{schema?.tables?.length || 0} tables</strong> · <strong>{schema?.rels?.length || 0} relations</strong></InfoBox>
//       <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//         <div className="tab-bar">
//           <button className={`tab${graphView === "erd" ? " active" : ""}`} onClick={() => setGraphView("erd")}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Table2 size={12} /> Vue ERD</span></button>
//           <button className={`tab${graphView === "force" ? " active" : ""}`} onClick={() => setGraphView("force")}><span style={{ display: "flex", alignItems: "center", gap: 5 }}><Network size={12} /> Force Graph</span></button>
//         </div>
//       </div>
//       {schema ? (
//         <>
//           {graphView === "erd" && (
//             <div style={{ borderRadius: 14, overflow: "hidden" }}>
//               <div className="schema-toolbar">
//                 <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#D94F3D,#e86b59)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Table2 size={11} color="#fff" /></div>
//                 <div style={{ fontSize: 11, fontWeight: 600, color: "#e4e4e7" }}>Schéma ERD</div>
//                 <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: "rgba(217,79,61,.18)", color: "#fca5a5", border: "1px solid rgba(217,79,61,.3)" }}>{schema?.rels?.length || 0} relations</div>
//               </div>
//               <SchemaERD schema={schema} tableRoles={data.tableRoles || {}} onSelectTable={setSelectedTable} selectedTable={selectedTable} height={460} />
//             </div>
//           )}
//           {tableInfo && (
//             <div className="fade-in" style={{ background: "#fff", border: `1px solid ${C.g200}`, borderRadius: 12, padding: "14px 16px" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//                 <span style={{ fontSize: 13, fontWeight: 700, color: C.g900, fontFamily: "'JetBrains Mono',monospace" }}>{tableInfo.name}</span>
//                 <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: C.g100, color: C.g500 }}>{tableInfo.rowCount.toLocaleString()} lignes</span>
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
//                 {tableInfo.cols.map(col => (
//                   <span key={col} style={{ padding: "2px 8px", borderRadius: 5, background: C.g100, border: `1px solid ${C.g200}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g700 }}>{col}</span>
//                 ))}
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div style={{ padding: "3rem", textAlign: "center", color: C.g400 }}>
//           <Database size={36} style={{ display: "block", margin: "0 auto 12px", opacity: .35 }} />
//           <p style={{ fontSize: 13 }}>Connexion requise (étape 2)</p>
//         </div>
//       )}
//     </div>
//   );
// }

// function IdentityStep({ data, setData }) {
//   const authFields = AUTH_FIELDS[data.authType] || [];
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.red}>Définissez l'identité du connecteur ERP et son mode d'authentification.</InfoBox>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//         <div style={{ gridColumn: "1/-1" }}>
//           <label className="label">Nom du connecteur</label>
//           <input value={data.name || ""} onChange={e => setData({ ...data, name: e.target.value })} className="input" placeholder="ex: SAP S/4HANA Production" />
//         </div>
//         <div>
//           <label className="label">Type</label>
//           <select value={data.connectorType || "ERP"} onChange={e => setData({ ...data, connectorType: e.target.value })} className="select">
//             <option value="ERP">ERP</option><option value="DATA_SOURCE">Source de données</option><option value="ACCOUNTING">Comptabilité</option>
//           </select>
//         </div>
//         <div>
//           <label className="label">Authentification</label>
//           <select value={data.authType || "NONE"} onChange={e => setData({ ...data, authType: e.target.value })} className="select">
//             <option value="NONE">Aucune</option><option value="BASIC">Basic Auth</option><option value="API_KEY">API Key</option><option value="OAUTH2">OAuth 2.0</option><option value="JWT_SIGNED">JWT Signé</option><option value="SAML">SAML 2.0</option>
//           </select>
//         </div>
//         <div><label className="label">Logo (2 lettres)</label><input value={data.logo || ""} maxLength={2} onChange={e => setData({ ...data, logo: e.target.value })} className="input" placeholder="SG" /></div>
//         <div>
//           <label className="label">Couleur principale</label>
//           <div style={{ display: "flex", gap: 8 }}>
//             <input type="color" value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} style={{ width: 40, height: 40, padding: 2, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }} />
//             <input value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} className="input" style={{ flex: 1 }} />
//           </div>
//         </div>
//         <div style={{ gridColumn: "1/-1" }}><label className="label">Description</label><input value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} className="input" placeholder="Connecteur ERP…" /></div>
//       </div>
//       {authFields.length > 0 && (
//         <div>
//           <div style={{ fontSize: 11, fontWeight: 700, color: C.g700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
//             <Settings2 size={13} color={C.red} /> Détails d'authentification ({data.authType})
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//             {authFields.map(f => (
//               <div key={f.key} style={{ gridColumn: f.type === "textarea" ? "1/-1" : "auto" }}>
//                 <label className="label">{f.label}</label>
//                 {f.type === "textarea" ? <textarea value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" rows={4} style={{ resize: "vertical", height: 90 }} /> :
//                   f.type === "select" ? <select value={data[f.key] || (f.options?.[0] || "")} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="select">{f.options?.map(o => <option key={o} value={o}>{o}</option>)}</select> :
//                     <input type={f.type} value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" placeholder={f.placeholder || ""} />}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function ConnectionStep({ data, setData, schema }) {
//   const [testState, setTestState] = useState(null);
//   const connTypes = [
//     { id: "jdbc", label: "JDBC", Icon: Database, desc: "Base SQL directe" },
//     { id: "api", label: "API REST", Icon: Network, desc: "Endpoint HTTP" },
//     { id: "csv", label: "Fichier CSV", Icon: Layers, desc: "Import fichier" }
//   ];
//   const allTables = schema?.tables || [];
//   const selectedTables = data.selectedTables || [];
//   const toggleTable = name => setData({ ...data, selectedTables: selectedTables.includes(name) ? selectedTables.filter(t => t !== name) : [...selectedTables, name] });
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <div>
//         <label className="label" style={{ marginBottom: 8 }}>Type de connexion</label>
//         <div style={{ display: "flex", gap: 8 }}>
//           {connTypes.map(t => (
//             <div key={t.id} onClick={() => setData({ ...data, connectionType: t.id })}
//               style={{ flex: 1, padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center", background: data.connectionType === t.id ? "rgba(217,79,61,.08)" : "rgba(248,247,245,.8)", border: `1.5px solid ${data.connectionType === t.id ? C.red : C.g200}` }}>
//               <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><t.Icon size={22} color={data.connectionType === t.id ? C.red : C.g400} /></div>
//               <div style={{ fontSize: 12, fontWeight: 700, color: data.connectionType === t.id ? C.red : C.g700 }}>{t.label}</div>
//               <div style={{ fontSize: 10, color: C.g400, marginTop: 2 }}>{t.desc}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {data.connectionType === "jdbc" && (
//         <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//           <div><label className="label">URL JDBC</label><input value={data.jdbcUrl || ""} onChange={e => setData({ ...data, jdbcUrl: e.target.value })} className="input mono" style={{ fontSize: 11 }} placeholder="jdbc:postgresql://host:5432/erp_db" /></div>
//           <div style={{ display: "flex", gap: 10 }}>
//             <div style={{ flex: 1 }}><label className="label">Utilisateur</label><input value={data.jdbcUsername || ""} onChange={e => setData({ ...data, jdbcUsername: e.target.value })} className="input" /></div>
//             <div style={{ flex: 1 }}><label className="label">Mot de passe</label><input type="password" value={data.jdbcPassword || ""} onChange={e => setData({ ...data, jdbcPassword: e.target.value })} className="input" /></div>
//           </div>
//         </div>
//       )}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => { setTestState("testing"); setTimeout(() => setTestState("ok"), 1200); }}>
//           {testState === "testing" ? <RefreshCw size={12} className="spin" /> : <Zap size={12} />} Tester la connexion
//         </button>
//         {testState === "ok" && <span style={{ fontSize: 11, color: C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> Connexion réussie</span>}
//       </div>
//       {allTables.length > 0 && (
//         <div>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
//             <div><label className="label" style={{ marginBottom: 2 }}>Tables disponibles</label><div style={{ fontSize: 10, color: C.g400 }}>{allTables.length} tables détectées</div></div>
//             <div style={{ display: "flex", gap: 6 }}>
//               <button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: allTables.map(t => t.name) })}>Tout</button>
//               <button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: [] })}>Effacer</button>
//             </div>
//           </div>
//           <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", maxHeight: 260, overflowY: "auto" }} className="scroll">
//             {allTables.map((t, i) => {
//               const sel = selectedTables.includes(t.name); return (
//                 <div key={t.name} onClick={() => toggleTable(t.name)}
//                   style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: sel ? "rgba(217,79,61,.04)" : i % 2 === 0 ? "rgba(248,247,245,.5)" : "#fff", borderBottom: i < allTables.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none" }}>
//                   <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? C.red : C.g300}`, background: sel ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={11} color="#fff" />}</div>
//                   <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.red : C.g700, flex: 1 }}>{t.name}</span>
//                   <span style={{ fontSize: 10, color: C.g400 }}>{t.cols.length} cols · {t.rowCount.toLocaleString()} lignes</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//       {allTables.length === 0 && data.connectionType === "jdbc" && (
//         <div style={{ padding: "20px", textAlign: "center", background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
//           <Database size={28} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
//           <div style={{ fontSize: 12, color: C.g400 }}>Saisissez une URL JDBC et testez la connexion pour découvrir les tables</div>
//           <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 12 }} onClick={() => {
//             // Simulate table discovery for any JDBC URL
//             setTestState("testing");
//             setTimeout(() => setTestState("ok"), 1000);
//           }}><Zap size={12} /> Découvrir les tables</button>
//         </div>
//       )}
//     </div>
//   );
// }

// function BudgetFormulaBuilder({ data, setData, schema, connId }) {
//   const presets = BUDGET_PRESETS[connId] || BUDGET_PRESETS.generic || [];
//   const [activePreset, setActivePreset] = useState(data.budgetPreset || null);
//   const [formulaTokens, setFormulaTokens] = useState(data.budgetFormula || []);
//   const [aggregation, setAggregation] = useState(data.budgetAgg || "SUM");
//   const [previewResult, setPreviewResult] = useState(null);
//   const budgetTables = data.budgetSourceTables || [];
//   const allBudgetCols = budgetTables.flatMap(tn => { const t = schema?.tables?.find(t => t.name === tn); return (t?.cols || []).map(c => ({ table: tn, col: c })); });

//   const applyPreset = preset => { setActivePreset(preset.id); setFormulaTokens(preset.formula); setData({ ...data, budgetPreset: preset.id, budgetFormula: preset.formula }); };
//   const addToken = token => { const next = [...formulaTokens, token]; setFormulaTokens(next); setData({ ...data, budgetFormula: next }); };
//   const removeToken = idx => { const next = formulaTokens.filter((_, i) => i !== idx); setFormulaTokens(next); setData({ ...data, budgetFormula: next }); };
//   const clearFormula = () => { setFormulaTokens([]); setData({ ...data, budgetFormula: [] }); };
//   const generatePreview = () => { setPreviewResult("computing"); setTimeout(() => setPreviewResult({ value: (Math.random() * 500000 + 50000).toFixed(2), currency: "TND" }), 800); };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//       {presets.length > 0 && (
//         <div>
//           <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Modèles prédéfinis</div>
//           <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//             {presets.map(preset => (
//               <button key={preset.id} onClick={() => applyPreset(preset)}
//                 style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: activePreset === preset.id ? "rgba(217,79,61,.08)" : "#fff", border: `1.5px solid ${activePreset === preset.id ? C.red : C.g200}`, minWidth: 160 }}>
//                 <div style={{ fontSize: 12, fontWeight: 700, color: activePreset === preset.id ? C.red : C.g800 }}>{preset.name}</div>
//                 <div style={{ fontSize: 10, color: C.g400, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{preset.desc}</div>
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//       <div className="budget-section">
//         <div className="budget-section-hdr">
//           <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={12} color={C.success} /></div>
//           <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Formule de calcul</div></div>
//         </div>
//         <div className="budget-section-body">
//           <div style={{ marginBottom: 10 }}>
//             <div className="formula-drop" style={{ borderColor: formulaTokens.length > 0 ? "rgba(34,197,94,.3)" : "#e5e7eb" }}>
//               {formulaTokens.length === 0 ? <span style={{ fontSize: 11, color: C.g400 }}>Sélectionnez des colonnes et opérateurs…</span> :
//                 formulaTokens.map((tok, i) => (
//                   <div key={i} className={`formula-node ${tok.type === "op" ? "op" : tok.type === "agg" ? "agg" : "col"}`} onClick={() => removeToken(i)} title="Clic pour supprimer">
//                     {tok.type === "op" ? tok.op : tok.type === "agg" ? `${tok.fn}(${tok.label || tok.col})` : tok.label || tok.col}
//                     <X size={10} />
//                   </div>
//                 ))
//               }
//             </div>
//             {formulaTokens.length > 0 && <button onClick={clearFormula} style={{ fontSize: 10, color: C.g400, background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Effacer</button>}
//           </div>
//           {allBudgetCols.length > 0 && (
//             <div style={{ marginBottom: 10 }}>
//               <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Colonnes disponibles</div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
//                 {allBudgetCols.map(({ table, col }) => (
//                   <button key={`${table}.${col}`} className="col-chip" onClick={() => addToken({ type: "agg", fn: aggregation, table, col, label: `${table}.${col}` })}>
//                     <span style={{ opacity: .6 }}>{table}.</span>{col}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//           <div>
//             <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Opérateurs</div>
//             <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//               {["＋", "−", "×", "÷", "(", ")"].map(op => <button key={op} className="formula-op-badge" onClick={() => addToken({ type: "op", op })}>{op}</button>)}
//               <div style={{ width: 1, background: C.g200, margin: "0 4px" }} />
//               {["SUM", "AVG", "MAX", "COUNT"].map(fn => (
//                 <button key={fn} className="formula-node agg" style={{ cursor: "pointer", fontSize: 11, padding: "3px 9px" }} onClick={() => setAggregation(fn)}>
//                   <span style={{ fontWeight: aggregation === fn ? 800 : 500 }}>{fn}</span>
//                   {aggregation === fn && <CheckCircle2 size={9} />}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//         <button className="btn btn-primary" onClick={generatePreview} disabled={formulaTokens.length === 0 && !activePreset}><FlaskConical size={13} /> Tester</button>
//         {previewResult === "computing" && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.g500 }}><RefreshCw size={12} className="spin" /> Calcul…</div>}
//         {previewResult && previewResult !== "computing" && (
//           <div style={{ padding: "8px 14px", borderRadius: 10, background: C.successLight, border: `1px solid ${C.successBorder}` }}>
//             <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>{parseFloat(previewResult.value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {previewResult.currency}</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function BudgetStep({ data, setData, schema, connId }) {
//   const allTables = schema?.tables || [];
//   const budgetSourceTables = data.budgetSourceTables || [];
//   const toggleSourceTable = name => setData({ ...data, budgetSourceTables: budgetSourceTables.includes(name) ? budgetSourceTables.filter(t => t !== name) : [...budgetSourceTables, name] });
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.success}><strong>Configuration du moteur budgétaire</strong></InfoBox>
//       <SectionAccordion icon={<Database size={13} color={C.success} />} title="Tables sources du budget">
//         {allTables.length === 0 ? <div style={{ fontSize: 12, color: C.g400, textAlign: "center", padding: "1rem" }}>Sélectionnez des tables à l'étape Connexion</div> : (
//           <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//             {allTables.map(t => {
//               const sel = budgetSourceTables.includes(t.name); return (
//                 <div key={t.name} onClick={() => toggleSourceTable(t.name)}
//                   style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? "rgba(34,197,94,.06)" : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? "rgba(34,197,94,.35)" : "transparent"}` }}>
//                   <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.success : C.g300}`, background: sel ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div>
//                   <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.g800 : C.g600 }}>{t.name}</span>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </SectionAccordion>
//       <BudgetFormulaBuilder data={data} setData={setData} schema={schema} connId={connId} />
//       <div className="budget-section">
//         <div className="budget-section-hdr" style={{ background: "rgba(245,158,11,.04)" }}>
//           <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(245,158,11,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertCircle size={12} color={C.warning} /></div>
//           <div><div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Seuils d'alerte</div></div>
//         </div>
//         <div className="budget-section-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//           {[{ label: "Seuil jaune (%)", key: "alertYellow", default: "75", color: C.warning }, { label: "Seuil rouge (%)", key: "alertRed", default: "90", color: "#ef4444" }].map(threshold => (
//             <div key={threshold.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <div style={{ width: 10, height: 10, borderRadius: "50%", background: threshold.color, flexShrink: 0 }} />
//               <span style={{ fontSize: 11, color: C.g700, flex: 1 }}>{threshold.label}</span>
//               <input type="number" min="0" max="100" value={data[threshold.key] || threshold.default} onChange={e => setData({ ...data, [threshold.key]: e.target.value })} className="input" style={{ width: 72, textAlign: "center" }} />
//               <span style={{ fontSize: 11, color: C.g400 }}>%</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// function PipelinesStep({ data, setData, schema }) {
//   const selectedTables = data.selectedTables || [];
//   const pipelines = data.pipelines || {};
//   const customPipelines = data.customPipelines || [];
//   const activeTables = (schema?.tables || []).filter(t => selectedTables.includes(t.name));
//   const [activeTab, setActiveTab] = useState("facture");
//   const [newPipelineName, setNewPipelineName] = useState("");
//   const [showAddPipeline, setShowAddPipeline] = useState(false);

//   const addCustomPipeline = () => {
//     if (!newPipelineName.trim()) return;
//     const id = `custom_${Date.now()}`;
//     const colorIdx = customPipelines.length % CUSTOM_PIPELINE_COLORS.length;
//     setData({ ...data, customPipelines: [...customPipelines, { id, label: newPipelineName.trim(), color: CUSTOM_PIPELINE_COLORS[colorIdx] }] });
//     setNewPipelineName(""); setShowAddPipeline(false); setActiveTab(id);
//   };
//   const removeCustomPipeline = id => {
//     const next = customPipelines.filter(cp => cp.id !== id);
//     const nextPipelines = { ...pipelines }; delete nextPipelines[id];
//     setData({ ...data, customPipelines: next, pipelines: nextPipelines }); setActiveTab("facture");
//   };
//   const setPipeline = (k, v) => setData({ ...data, pipelines: { ...pipelines, [k]: v } });
//   const isBuiltin = activeTab === "facture" || activeTab === "commande";
//   const builtinDef = isBuiltin ? PIPELINE_DEFS[activeTab] : null;
//   const customDef = !isBuiltin ? customPipelines.find(cp => cp.id === activeTab) : null;
//   const plColor = builtinDef?.color || customDef?.color || C.g400;
//   const plLabel = builtinDef?.label || customDef?.label || activeTab;
//   const PlIcon = builtinDef?.Icon || Settings2;
//   const pl = pipelines[activeTab] || { enabled: true, tables: [], joins: [], conditions: [], fieldMappings: {}, extraFields: [], userFields: [], groupByCols: [] };
//   const setPl = val => setPipeline(activeTab, val);
//   const toggleTable = tname => setPl({ ...pl, tables: pl.tables.includes(tname) ? pl.tables.filter(t => t !== tname) : [...pl.tables, tname] });
//   const plTables = activeTables.filter(t => (pl.tables || []).includes(t.name));
//   const plCols = plTables.flatMap(t => t.cols.map(c => ({ full: `${t.name}.${c}`, table: t.name, col: c })));
//   const fixedFields = builtinDef?.fixedFields || [];

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.info}>Configurez les pipelines métier — tables, jointures, mapping.</InfoBox>
//       <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
//         {["facture", "commande"].map(key => {
//           const def = PIPELINE_DEFS[key], Icon = def.Icon;
//           return (
//             <button key={key} onClick={() => setActiveTab(key)}
//               style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${activeTab === key ? def.color : "transparent"}`, background: activeTab === key ? `${def.color}12` : "transparent", color: activeTab === key ? def.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
//               <Icon size={13} /> {def.label}
//             </button>
//           );
//         })}
//         {customPipelines.map(cp => (
//           <div key={cp.id} style={{ display: "flex" }}>
//             <button onClick={() => setActiveTab(cp.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderRight: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
//               <Settings2 size={13} /> {cp.label}
//             </button>
//             <button onClick={() => removeCustomPipeline(cp.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "7px 7px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderLeft: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
//               <X size={11} />
//             </button>
//           </div>
//         ))}
//         {!showAddPipeline ? (
//           <button onClick={() => setShowAddPipeline(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 10, border: `1.5px dashed ${C.g300}`, background: "transparent", color: C.g400, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
//             <Plus size={12} /> Nouveau pipeline
//           </button>
//         ) : (
//           <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 8px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "#fff" }}>
//             <input value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomPipeline()} autoFocus className="input" style={{ width: 160, fontSize: 11, padding: "4px 8px", height: 30 }} placeholder="Nom du pipeline…" />
//             <button className="btn btn-primary" style={{ fontSize: 10, padding: "4px 10px", height: 30 }} onClick={addCustomPipeline} disabled={!newPipelineName.trim()}>Créer</button>
//             <button onClick={() => setShowAddPipeline(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400 }}><X size={13} /></button>
//           </div>
//         )}
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
//         <div style={{ width: 32, height: 32, borderRadius: 10, background: `${plColor}15`, display: "flex", alignItems: "center", justifyContent: "center" }}><PlIcon size={16} color={plColor} /></div>
//         <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.g900 }}>Pipeline {plLabel}</div></div>
//         <Toggle checked={pl.enabled !== false} onChange={v => setPl({ ...pl, enabled: v })} />
//       </div>
//       {pl.enabled !== false && (
//         <>
//           <SectionAccordion icon={<Database size={13} color={C.red} />} title="Tables sources">
//             <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//               {activeTables.length === 0 ? <div style={{ fontSize: 12, color: C.g400, textAlign: "center", padding: "1rem" }}>Sélectionnez des tables à l'étape Connexion</div> :
//                 activeTables.map(t => {
//                   const sel = pl.tables.includes(t.name); return (
//                     <div key={t.name} onClick={() => toggleTable(t.name)}
//                       style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? `${plColor}08` : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? plColor + "40" : "transparent"}` }}>
//                       <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? plColor : C.g300}`, background: sel ? plColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div>
//                       <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{t.name}</span>
//                     </div>
//                   );
//                 })}
//             </div>
//           </SectionAccordion>
//           {pl.tables.length > 1 && (
//             <SectionAccordion icon={<Link2 size={13} color={C.warning} />} title="Jointures (JOIN)">
//               <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//                 {pl.tables.slice(1).map((tname, idx) => {
//                   const joinIdx = idx;
//                   const join = (pl.joins || [])[joinIdx] || { type: "INNER", table: tname, on: "" };
//                   const updateJoin = (field, val) => {
//                     const joins = [...(pl.joins || [])];
//                     while (joins.length <= joinIdx) joins.push({ type: "INNER", table: "", on: "" });
//                     joins[joinIdx] = { ...joins[joinIdx], [field]: val };
//                     setPl({ ...pl, joins });
//                   };
//                   return (
//                     <div key={tname} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(248,247,245,.8)", borderRadius: 9, border: "1px solid #e5e7eb", flexWrap: "wrap" }}>
//                       <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: C.g700, minWidth: 90 }}>Table {idx + 2}</span>
//                       <span className="mono" style={{ fontSize: 11, color: C.g400 }}>JOIN</span>
//                       <select value={join.type} onChange={e => updateJoin("type", e.target.value)} className="select" style={{ width: 90, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "5px 8px", height: 32 }}>
//                         <option value="INNER">INNER</option>
//                         <option value="LEFT">LEFT</option>
//                         <option value="RIGHT">RIGHT</option>
//                       </select>
//                       <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: plColor }}>{tname}</span>
//                       <span className="mono" style={{ fontSize: 11, color: C.g400 }}>ON</span>
//                       <input value={join.on} onChange={e => updateJoin("on", e.target.value)} className="input" style={{ flex: 1, minWidth: 120, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "5px 8px", height: 32 }} placeholder="ex: T1.col = T2.col" />
//                     </div>
//                   );
//                 })}
//                 {pl.joins?.length > 0 && pl.joins.some(j => j.on) && (
//                   <div style={{ padding: "8px 12px", background: "rgba(59,130,246,.06)", borderRadius: 9, border: "1px solid rgba(59,130,246,.2)", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.info }}>
//                     SQL: SELECT * FROM {pl.tables[0]} {pl.tables.slice(1).map((t, i) => {
//                       const j = (pl.joins || [])[i];
//                       return j?.on ? `${j.type} JOIN ${t} ON ${j.on}` : `${j?.type || "INNER"} JOIN ${t}`;
//                     }).join(" ")}
//                   </div>
//                 )}
//               </div>
//             </SectionAccordion>
//           )}
//           <SectionAccordion icon={<GitBranch size={13} color={plColor} />} title="Mapping des champs">
//             {fixedFields.length > 0 ? (
//               <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//                 {fixedFields.map(f => (
//                   <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "rgba(248,247,245,.8)", borderRadius: 9, border: "1px solid #e5e7eb" }}>
//                     <div style={{ minWidth: 160, flexShrink: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.g800 }}>{f.label}</div>{f.required && <div style={{ fontSize: 9, color: C.red }}>Requis</div>}</div>
//                     <span style={{ color: C.g300 }}>→</span>
//                     <select value={(pl.fieldMappings || {})[f.key] || ""} onChange={e => setPl({ ...pl, fieldMappings: { ...(pl.fieldMappings || {}), [f.key]: e.target.value } })} className="select" style={{ flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
//                       <option value="">-- Sélectionner colonne --</option>
//                       {plCols.map(c => <option key={c.full} value={c.full}>{c.full}</option>)}
//                     </select>
//                     {(pl.fieldMappings || {})[f.key] && <CheckCircle2 size={14} color={C.success} />}
//                   </div>
//                 ))}
//               </div>
//             ) : <div style={{ fontSize: 11, color: C.g400 }}>Définissez librement les champs selon vos besoins.</div>}
//           </SectionAccordion>
//         </>
//       )}
//     </div>
//   );
// }

// function TenantsStep({ data, setData }) {
//   useStore();
//   const tenants = data.tenants || [];
//   const customPipelines = data.customPipelines || [];
//   const allPipelineKeys = { facture: PIPELINE_DEFS.facture, commande: PIPELINE_DEFS.commande, ...Object.fromEntries(customPipelines.map(cp => [cp.id, { label: cp.label, color: cp.color, Icon: Settings2 }])) };
//   const [newTenantId, setNewTenantId] = useState("");
//   const [newTenantLabel, setNewTenantLabel] = useState("");
//   const [expandedTenant, setExpandedTenant] = useState(null);
//   const [searchMap, setSearchMap] = useState({});

//   const platformTenants = useMemo(() => { try { return visibleTenants() || []; } catch (e) { return []; } }, []);

//   const addTenant = () => {
//     if (!newTenantId.trim()) return;
//     const id = newTenantId.trim();
//     const label = newTenantLabel.trim() || id;
//     const next = [...tenants, { id, label, active: true, platformTenantId: null, platformTenantName: null, statuses: Object.fromEntries(Object.keys(allPipelineKeys).map(k => [k, { provisional: [], final: [], statusColumn: "" }])) }];
//     setData({ ...data, tenants: next }); setNewTenantId(""); setNewTenantLabel(""); setExpandedTenant(id);
//   };
//   const removeTenant = id => setData({ ...data, tenants: tenants.filter(t => t.id !== id) });
//   const toggleTenant = id => setData({ ...data, tenants: tenants.map(t => t.id === id ? { ...t, active: !t.active } : t) });
//   const linkPlatformTenant = (erpId, pt) => {
//     setData({ ...data, tenants: tenants.map(t => t.id === erpId ? { ...t, platformTenantId: pt ? pt.id : null, platformTenantName: pt ? pt.name : null } : t) });
//     setSearchMap(p => ({ ...p, [erpId]: "" }));
//   };
//   const updateTenantStatus = (tenantId, pipeline, field, value) => setData({ ...data, tenants: tenants.map(t => t.id === tenantId ? { ...t, statuses: { ...t.statuses, [pipeline]: { ...(t.statuses?.[pipeline] || {}), [field]: value } } } : t) });

//   const linkedPt = pt => (
//     <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 6px", borderRadius: 8, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", fontSize: 11 }}>
//       <CheckCircle2 size={12} color={C.success} />
//       <span style={{ fontWeight: 600, color: "#15803d" }}>{pt.name}</span>
//       <span style={{ color: C.g400, fontSize: 10 }}>({pt.id})</span>
//     </div>
//   );

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.info}>
//         Ajoutez les IDs externes des tenants (tels qu'ils existent dans l'ERP), puis liez chaque ID au tenant plateforme correspondant.
//       </InfoBox>
//       <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//         <input value={newTenantId} onChange={e => setNewTenantId(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="ID externe ERP (ex: CORP_001)" style={{ flex: 1 }} />
//         <input value={newTenantLabel} onChange={e => setNewTenantLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="Libellé (optionnel)" style={{ flex: 1 }} />
//         <button className="btn btn-primary" onClick={addTenant} disabled={!newTenantId.trim()}><Plus size={13} /> Ajouter</button>
//       </div>

//       {tenants.length === 0 && (
//         <div style={{ padding: "2.5rem", textAlign: "center", color: C.g400, background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
//           <Cpu size={32} style={{ display: "block", margin: "0 auto 10px", opacity: .4 }} />
//           <p style={{ fontSize: 13 }}>Aucun ID externe configuré</p>
//         </div>
//       )}

//       {tenants.map(tenant => {
//         const linkedPT = platformTenants.find(pt => pt.id === tenant.platformTenantId);
//         const search = (searchMap[tenant.id] || "").toLowerCase();
//         const filtered = search ? platformTenants.filter(pt => (pt.name || "").toLowerCase().includes(search) || (pt.id || "").toLowerCase().includes(search)) : [];
//         return (
//           <div key={tenant.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}>
//               <div style={{ width: 36, height: 36, borderRadius: 10, background: tenant.active ? "rgba(217,79,61,.1)" : C.g100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                 {linkedPT ? <CheckCircle2 size={18} color={C.success} /> : <Cpu size={18} color={tenant.active ? C.red : C.g400} />}
//               </div>
//               <div style={{ flex: 1, minWidth: 0 }}>
//                 <div style={{ fontSize: 13, fontWeight: 700 }}>{tenant.label}</div>
//                 <div style={{ fontSize: 10, color: C.g400 }}>ID externe: <span className="mono">{tenant.id}</span></div>
//                 {linkedPT && <div style={{ fontSize: 10, color: C.success, marginTop: 2 }}>Lié à: {tenant.platformTenantName}</div>}
//               </div>
//               <Toggle checked={tenant.active} onChange={() => toggleTenant(tenant.id)} />
//               <button onClick={e => { e.stopPropagation(); removeTenant(tenant.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400 }}><X size={14} /></button>
//               <ChevronDown size={14} color={C.g400} style={{ transform: expandedTenant === tenant.id ? "rotate(0)" : "rotate(-90deg)", transition: "transform .2s" }} />
//             </div>
//             {expandedTenant === tenant.id && (
//               <div style={{ borderTop: "1px solid #e5e7eb", padding: 16 }} className="fade-in">
//                 {/* Platform tenant linking */}
//                 <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.info}20`, background: `${C.info}06` }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
//                     <Link2 size={13} color={C.info} />
//                     <span style={{ fontSize: 11, fontWeight: 700, color: C.info }}>Lier au tenant plateforme</span>
//                   </div>
//                   {linkedPT ? (
//                     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                       {linkedPt(linkedPT)}
//                       <button onClick={() => linkPlatformTenant(tenant.id, null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 11, textDecoration: "underline" }}>Délier</button>
//                     </div>
//                   ) : (
//                     <div>
//                       <input
//                         value={searchMap[tenant.id] || ""}
//                         onChange={e => setSearchMap(p => ({ ...p, [tenant.id]: e.target.value }))}
//                         className="input"
//                         placeholder="Rechercher un tenant plateforme..."
//                         style={{ fontSize: 12, width: "100%" }}
//                       />
//                       {search && filtered.length > 0 && (
//                         <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto" }}>
//                           {filtered.slice(0, 8).map(pt => (
//                             <div key={pt.id} onClick={() => linkPlatformTenant(tenant.id, pt)}
//                               style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.12)", fontSize: 12, transition: "background .15s" }}>
//                               <CheckCircle2 size={12} color={C.info} />
//                               <span style={{ fontWeight: 600, flex: 1 }}>{pt.name}</span>
//                               <span style={{ color: C.g400, fontSize: 10 }}>{pt.id}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                       {search && filtered.length === 0 && <div style={{ fontSize: 11, color: C.g400, marginTop: 4 }}>Aucun tenant plateforme trouvé</div>}
//                     </div>
//                   )}
//                 </div>
//                 {/* Pipeline statuses */}
//                 {Object.entries(allPipelineKeys).map(([pipeKey, plDef]) => {
//                   const st = tenant.statuses?.[pipeKey] || {};
//                   const toList = v => Array.isArray(v) ? v.join(", ") : (v || "");
//                   const fromList = s => s.split(",").map(x => x.trim()).filter(Boolean);
//                   const PIcon = plDef.Icon || Settings2;
//                   return (
//                     <div key={pipeKey} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${plDef.color}25`, background: `${plDef.color}04`, marginBottom: 8 }}>
//                       <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><PIcon size={14} color={plDef.color} /><span style={{ fontSize: 11, fontWeight: 700, color: plDef.color }}>{plDef.label}</span></div>
//                       <div style={{ display: "flex", gap: 10 }}>
//                         <div style={{ flex: 1 }}><label className="label" style={{ color: C.warning }}>Statuts provisoires</label><input value={toList(st.provisional)} onChange={e => updateTenantStatus(tenant.id, pipeKey, "provisional", fromList(e.target.value))} className="input" style={{ fontSize: 11 }} /></div>
//                         <div style={{ flex: 1 }}><label className="label" style={{ color: C.success }}>Statuts finaux</label><input value={toList(st.final)} onChange={e => updateTenantStatus(tenant.id, pipeKey, "final", fromList(e.target.value))} className="input" style={{ fontSize: 11 }} /></div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );
//       })}

//       {/* Platform tenant reference list */}
//       {platformTenants.length > 0 && (
//         <div style={{ borderRadius: 12, border: `1px solid ${C.g200}`, overflow: "hidden", background: "#fff" }}>
//           <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 6 }}>
//             <Users size={13} color={C.g500} />
//             <span style={{ fontSize: 11, fontWeight: 700, color: C.g600 }}>Tenants plateforme ({platformTenants.length})</span>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", maxHeight: 180, overflowY: "auto" }}>
//             {platformTenants.map(pt => (
//               <div key={pt.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: `1px solid ${C.g50}`, fontSize: 12 }}>
//                 <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(59,130,246,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                   <CheckCircle2 size={12} color={C.info} />
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600 }}>{pt.name}</div>
//                   <div style={{ fontSize: 10, color: C.g400 }}>ID: {pt.id}{pt.industry ? ` · ${pt.industry}` : ""}</div>
//                 </div>
//                 {tenants.some(t => t.platformTenantId === pt.id) && (
//                   <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: C.successLight, color: "#15803d", fontWeight: 600 }}>Lié</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function DataPreviewStep({ data, setData, schema }) {
//   const customPipelines = data.customPipelines || [];
//   const allTabs = [
//     { key: "facture", label: "Factures", Icon: Database, color: PIPELINE_DEFS.facture.color },
//     { key: "commande", label: "Commandes", Icon: Layers, color: PIPELINE_DEFS.commande.color },
//     ...customPipelines.map(cp => ({ key: cp.id, label: cp.label, Icon: Settings2, color: cp.color }))
//   ];
//   const [activeTab, setActiveTab] = useState("facture");
//   const [genData, setGenData] = useState(data.generatedData || {});
//   const [loading, setLoading] = useState(false);
//   const selectedTables = data.selectedTables || [];
//   const activeTables = (schema?.tables || []).filter(t => selectedTables.includes(t.name));
//   const pipelines = data.pipelines || {};
//   const pl = pipelines[activeTab] || {};
//   const plTables = activeTables.filter(t => (pl.tables || []).includes(t.name));
//   const cols = plTables[0]?.cols || ["ID", "DATE", "MONTANT", "STATUT", "FOURNISSEUR"];

//   const generate = () => {
//     setLoading(true);
//     setTimeout(() => {
//       const rows = generateFakeRows(cols, activeTab, 10);
//       const next = { ...genData, [activeTab]: rows };
//       setGenData(next); setData({ ...data, generatedData: next }); setLoading(false);
//     }, 700);
//   };
//   const activeRows = genData[activeTab] || [];

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
//       <InfoBox color={C.info}>Générez des données de test pour valider le mapping.</InfoBox>
//       <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//         {allTabs.map(t => (
//           <button key={t.key} onClick={() => setActiveTab(t.key)}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${activeTab === t.key ? t.color : "transparent"}`, background: activeTab === t.key ? `${t.color}12` : "transparent", color: activeTab === t.key ? t.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
//             <t.Icon size={13} /> {t.label}
//             {genData[t.key] && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 99, background: C.successLight, color: "#15803d" }}><CheckCircle2 size={8} /></span>}
//           </button>
//         ))}
//       </div>
//       <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />} Générer 10 lignes</button>
//       {activeRows.length > 0 ? (
//         <div style={{ borderRadius: 12, border: `1px solid ${C.g200}`, overflow: "hidden" }}>
//           <div style={{ overflowX: "auto" }}>
//             <table className="gen-table">
//               <thead><tr>{Object.keys(activeRows[0]).map(h => <th key={h}>{h}</th>)}</tr></thead>
//               <tbody>{activeRows.map((row, i) => <tr key={i}>{Object.values(row).map((v, j) => <td key={j} title={String(v)}>{String(v)}</td>)}</tr>)}</tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div style={{ padding: "3rem", textAlign: "center", color: C.g400, background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
//           <Sparkles size={32} style={{ display: "block", margin: "0 auto 12px", opacity: .4 }} />
//           <p style={{ fontSize: 13 }}>Cliquez sur "Générer" pour créer des données de test</p>
//         </div>
//       )}
//     </div>
//   );
// }

// function SummaryStep({ data, onSave, onDelete, initialData }) {
//   const tenants = data.tenants || [];
//   const customPipelines = data.customPipelines || [];
//   const pipelines = data.pipelines || {};
//   const enabledPl = [
//     ...["facture", "commande"].filter(k => (pipelines[k] || {}).enabled !== false).map(k => PIPELINE_DEFS[k].label),
//     ...customPipelines.filter(cp => (pipelines[cp.id] || {}).enabled !== false).map(cp => cp.label),
//   ];
//   const isValid = data.name && (data.selectedTables || []).length > 0;
//   const rows = [
//     ["Nom", data.name || "—"], ["Type", data.connectorType || "—"], ["Auth", data.authType || "—"],
//     ["Tables", (data.selectedTables || []).length + " table(s)"],
//     ["Pipelines", enabledPl.join(" · ") || "—"],
//     ["Tenants", `${tenants.length} tenant(s)${tenants.filter(t => t.platformTenantId).length > 0 ? " · " + tenants.filter(t => t.platformTenantId).length + " lié(s)" : ""}`],
//     ["Données test", data.generatedData && Object.keys(data.generatedData).length > 0 ? "✓ Générées" : "Non générées"],
//     ["Budget", data.budgetFormula?.length > 0 ? "✓ Configuré" : "Non configuré"],
//   ];
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, background: isValid ? C.successLight : C.warningLight, border: `1px solid ${isValid ? C.successBorder : "rgba(245,158,11,.3)"}` }}>
//         <div style={{ width: 40, height: 40, borderRadius: 12, background: isValid ? "rgba(34,197,94,.15)" : "rgba(245,158,11,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//           {isValid ? <CheckCircle2 size={22} color={C.success} /> : <AlertCircle size={22} color={C.warning} />}
//         </div>
//         <div>
//           <div style={{ fontSize: 14, fontWeight: 700, color: isValid ? "#15803d" : "#92400e" }}>{isValid ? "Connecteur prêt à créer" : "Configuration incomplète"}</div>
//           <div style={{ fontSize: 11, color: isValid ? "#16a34a" : "#b45309", marginTop: 2 }}>{isValid ? "Toutes les étapes critiques sont complètes." : "Vérifiez le nom et la sélection de tables."}</div>
//         </div>
//       </div>
//       <div style={{ background: "#fff", border: `1px solid ${C.g200}`, borderRadius: 14, overflow: "hidden" }}>
//         {rows.map(([k, v], i) => (
//           <div key={k} style={{ display: "flex", padding: "10px 16px", borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : "none", background: i % 2 === 0 ? "transparent" : "rgba(248,247,245,.4)" }}>
//             <span style={{ fontSize: 11, color: C.g400, flex: "0 0 160px" }}>{k}</span>
//             <span style={{ fontSize: 11, color: String(v).startsWith("✓") ? C.success : C.g900, fontWeight: 600 }}>{String(v)}</span>
//           </div>
//         ))}
//       </div>
//       <div style={{ display: "flex", gap: 10 }}>
//         <button className="btn btn-primary" onClick={onSave} disabled={!isValid} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: 10 }}>
//           {initialData?.id ? <><RefreshCw size={14} /> Enregistrer</> : <><Sparkles size={14} /> Créer le connecteur</>}
//         </button>
//         {initialData?.id && onDelete && <button className="btn btn-danger" onClick={onDelete}><X size={14} /> Supprimer</button>}
//       </div>
//     </div>
//   );
// }

// function AutofillBanner({ onDismiss }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "linear-gradient(135deg,rgba(34,197,94,.08),rgba(34,197,94,.04))", border: "1px solid rgba(34,197,94,.25)", borderRadius: 14, marginBottom: 14 }}>
//       <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Wand2 size={18} color={C.success} /></div>
//       <div style={{ flex: 1 }}>
//         <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>Wizard auto-rempli par l'assistant !</div>
//         <div style={{ fontSize: 11, color: "#16a34a", marginTop: 2 }}>Vérifiez les données et ajustez si nécessaire.</div>
//       </div>
//       <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a" }}><X size={14} /></button>
//     </div>
//   );
// }

// /* ─── WIZARD MODAL ──────────────────────────────────────────── */
// function ConnectorWizardModal({ open, initialData = {}, onClose, onSave, onDelete, onSyncTemplates }) {
//   const [step, setStep] = useState(1);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [selectedTable, setSelectedTable] = useState(null);
//   const [autofillBanner, setAutofillBanner] = useState(false);
//   const [assistantOpen, setAssistantOpen] = useState(false);
//   const [data, setData] = useState({
//     name: "", connectorType: "ERP", authType: "NONE", description: "", color: "#D94F3D", logo: "",
//     jdbcUrl: "", jdbcUsername: "", jdbcPassword: "", jdbcDriverClassName: "org.postgresql.Driver",
//     apiEndpoint: "", apiAuthToken: "", connectionType: "jdbc",
//     selectedTables: [], pipelines: {}, tableRoles: {}, customPipelines: [],
//     budgetSourceTables: [], budgetAmountCols: [],
//     budgetFormula: [], budgetPreset: null, budgetAgg: "SUM", alertYellow: "75", alertRed: "90",
//     tenants: [], generatedData: {},
//     ...initialData,
//   });

//   const connId = data.jdbcUrl?.includes("sap") ? "c1" : (data.jdbcUrl?.includes("sage") || data.jdbcUrl?.includes("sqlserver") || initialData?.id === "c2") ? "c2" : initialData?.id === "c1" ? "c1" : null;
//   // Always provide a schema: use connId-specific or generic fallback
//   const rawSchema = connId ? MOCK_SCHEMAS[connId] : (data.jdbcUrl ? GENERIC_SCHEMA : null);

//   const schema = useMemo(() => {
//     if (!rawSchema) return null;
//     const sel = data.selectedTables || [];
//     if (sel.length === 0) return rawSchema;
//     const tables = rawSchema.tables.filter(t => sel.includes(t.name));
//     const tableNames = new Set(tables.map(t => t.name));
//     const rels = rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to));
//     return { tables, rels };
//   }, [rawSchema, data.selectedTables]);

//   // When JDBC URL changes, make tables available
//   const schemaForConnection = useMemo(() => {
//     if (connId) return MOCK_SCHEMAS[connId];
//     if (data.jdbcUrl) return GENERIC_SCHEMA;
//     return null;
//   }, [connId, data.jdbcUrl]);

//   const handleAutofill = (newData) => {
//     setData(prev => ({ ...prev, ...newData }));
//     setAutofillBanner(true);
//     setStep(1);
//   };

//   if (!open) return null;
//   const isEditing = !!initialData?.id;
//   const progress = Math.round((step / WIZARD_STEPS.length) * 100);
//   const cur = WIZARD_STEPS[step - 1];

//   const renderStep = () => {
//     switch (step) {
//       case 1: return <IdentityStep data={data} setData={setData} />;
//       case 2: return <ConnectionStep data={data} setData={setData} schema={schemaForConnection} />;
//       case 3: return <ExplorationStep data={data} setData={setData} schema={schema} selectedTable={selectedTable} setSelectedTable={setSelectedTable} />;
//       case 4: return <PipelinesStep data={data} setData={setData} schema={schema} />;
//       case 5: return <BudgetStep data={data} setData={setData} schema={schema} connId={connId || "generic"} />;
//       case 6: return <TenantsStep data={data} setData={setData} />;
//       case 7: return <DataPreviewStep data={data} setData={setData} schema={schema} />;
//       case 8: return <SummaryStep data={data} onSave={() => onSave(data)} onDelete={onDelete} initialData={initialData} />;
//       default: return null;
//     }
//   };

//   const modalContent = (
//     <>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "rgba(255,255,255,.95)", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//           <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#D94F3D,#c84332)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(217,79,61,.3)" }}>
//             <Plug size={15} color="#fff" />
//           </div>
//           <div style={{ width: 1, height: 20, background: "rgba(0,0,0,.1)" }} />
//           <div>
//             <div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>{initialData?.id ? "Modifier le connecteur" : "Nouveau connecteur ERP"}</div>
//             <div style={{ fontSize: 10, color: C.g400 }}>Moteur anomalie · Prévision budgétaire</div>
//           </div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//           <button onClick={() => setAssistantOpen(true)}
//             style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 9, border: `1.5px solid rgba(217,79,61,.25)`, background: `rgba(217,79,61,.06)`, cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.red, fontFamily: "'DM Sans',sans-serif", transition: "all .15s" }}>
//             <Bot size={13} /> Assistant
//           </button>
//           <button onClick={() => setIsFullscreen(p => !p)} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
//             {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
//           </button>
//           <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
//             <X size={14} />
//           </button>
//         </div>
//       </div>

//       <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
//         {/* Sidebar */}
//         <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", background: "rgba(255,255,255,.85)", borderRight: "1px solid rgba(0,0,0,.07)", overflow: "hidden" }}>
//           <div style={{ padding: "14px 16px 10px" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
//               <span style={{ fontSize: 9, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".1em" }}>Progression</span>
//               <span style={{ fontSize: 10, fontWeight: 800, color: C.red }}>{progress}%</span>
//             </div>
//             <div style={{ height: 4, borderRadius: 99, background: "rgba(0,0,0,.07)", overflow: "hidden" }}>
//               <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg,#D94F3D,#e86b59)", width: `${progress}%`, transition: "width .4s ease-out" }} />
//             </div>
//           </div>
//           <div className="scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
//             {WIZARD_STEPS.map((s, i) => {
//               const n = i + 1, done = step > n, active = step === n;
//               const { Icon: SIcon } = s;
//               return (
//                 <div key={n} onClick={() => setStep(n)}
//                   style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, background: active ? "rgba(217,79,61,.09)" : "transparent", border: `1.5px solid ${active ? "rgba(217,79,61,.22)" : "transparent"}`, cursor: "pointer", position: "relative" }}>
//                   {active && <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "linear-gradient(180deg,#D94F3D,#e86b59)" }} />}
//                   <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? C.successLight : active ? "rgba(217,79,61,.1)" : "rgba(0,0,0,.04)", border: `1.5px solid ${done ? C.successBorder : active ? "rgba(217,79,61,.25)" : C.g200}` }}>
//                     {done ? <CheckCircle2 size={13} color={C.success} /> : <SIcon size={13} color={active ? C.red : C.g400} />}
//                   </div>
//                   <div style={{ minWidth: 0 }}>
//                     <div style={{ fontSize: 11, fontWeight: active ? 700 : done ? 600 : 500, color: active ? C.red : done ? C.g700 : C.g400, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</div>
//                     <div style={{ fontSize: 9, color: active ? C.red : C.g300, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.desc}</div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Main */}
//         <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "rgba(248,247,245,.7)" }}>
//           <div style={{ padding: "14px 24px 12px", borderBottom: "1px solid rgba(0,0,0,.06)", flexShrink: 0, background: "#fff" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//               <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(217,79,61,.09)", border: "1.5px solid rgba(217,79,61,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                 <cur.Icon size={18} color={C.red} />
//               </div>
//               <div>
//                 <div className="serif" style={{ fontSize: 18, color: C.g900, lineHeight: 1.2 }}>{cur.label}</div>
//                 <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>
//                   {cur.desc}
//                   <span style={{ marginLeft: 8, padding: "1px 7px", borderRadius: 99, background: "rgba(217,79,61,.08)", border: "1px solid rgba(217,79,61,.15)", fontSize: 9, fontWeight: 700, color: C.red }}>{step}/{WIZARD_STEPS.length}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div key={step} className="scroll fade-in" style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
//             {autofillBanner && <AutofillBanner onDismiss={() => setAutofillBanner(false)} />}
//             {renderStep()}
//           </div>
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderTop: "1px solid rgba(0,0,0,.06)", flexShrink: 0, background: "rgba(255,255,255,.5)" }}>
//             <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn btn-ghost" style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto" }}><ArrowLeft size={13} /> Précédent</button>
//             <div style={{ display: "flex", gap: 4 }}>
//               {WIZARD_STEPS.map((_, i) => (
//                 <div key={i} onClick={() => setStep(i + 1)} style={{ width: step === i + 1 ? 16 : 5, height: 5, borderRadius: 99, cursor: "pointer", background: step > i + 1 ? C.success : step === i + 1 ? C.red : C.g200, transition: "all .3s" }} />
//               ))}
//             </div>
//             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//               {isEditing && (
//                 <button onClick={() => onSyncTemplates?.(data)} className="btn btn-ghost"><RefreshCw size={13} /> Synchroniser templates</button>
//               )}
//               {isEditing && (
//                 <button onClick={() => onSave(data)} className="btn btn-primary"><Check size={13} /> Sauvegarder</button>
//               )}
//               {step < WIZARD_STEPS.length ? (
//                 <button onClick={() => setStep(s => s + 1)} className="btn btn-primary">Suivant <ArrowRight size={13} /></button>
//               ) : !isEditing ? (
//                 <button onClick={() => onSave(data)} className="btn btn-primary"><Sparkles size={13} /> Créer</button>
//               ) : null}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Assistant fullscreen */}
//       {assistantOpen && <AssistantFullscreen onClose={() => setAssistantOpen(false)} onAutofill={handleAutofill} rawSchema={rawSchema} />}
//     </>
//   );

//   if (isFullscreen) {
//     return createPortal(
//       <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#f2f0ed", display: "flex", flexDirection: "column" }}>
//         {modalContent}
//       </div>,
//       document.body
//     );
//   }

//   return createPortal(
//     <div className="overlay" onClick={onClose}>
//       <div className="modal" onClick={e => e.stopPropagation()}
//         style={{ width: "100%", maxWidth: 1080, height: "min(780px,calc(100vh - 32px))" }}>
//         {modalContent}
//       </div>
//     </div>,
//     document.body
//   );
// }

// /* ─── INTEGRATION CARD ──────────────────────────────────────── */
// function IntegrationCard({ integration, onEdit, onDisconnect, isAdmin }) {
//   const [confirmDis, setConfirmDis] = useState(false);
//   const badge = {
//     connected: { label: "Connecté", bg: C.successLight, color: "#15803d", dot: C.success },
//     available: { label: "Disponible", bg: C.infoLight, color: "#1d4ed8", dot: C.info },
//     coming_soon: { label: "Bientôt", bg: C.g100, color: C.g400, dot: C.g300 },
//   }[integration.status] || { label: integration.status, bg: C.g100, color: C.g400 };

//   return (
//     <div className="card" style={{ border: `1px solid ${integration.status === "connected" ? "rgba(34,197,94,.25)" : C.g200}`, transition: "all .2s", cursor: "default" }}
//       onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"}
//       onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
//       <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
//         <div style={{ width: 44, height: 44, borderRadius: 12, background: integration.color || "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
//           {integration.logo || integration.name.slice(0, 2)}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: C.g900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{integration.name}</div>
//           <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>{integration.description}</div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: badge.bg, flexShrink: 0 }}>
//           <div style={{ width: 5, height: 5, borderRadius: "50%", background: badge.dot }} />
//           <span style={{ fontSize: 9, fontWeight: 600, color: badge.color }}>{badge.label}</span>
//         </div>
//       </div>
//       <div style={{ fontSize: 10, color: C.g400, marginBottom: 12, padding: "6px 0", borderTop: `1px solid ${C.g100}`, borderBottom: `1px solid ${C.g100}`, display: "flex", gap: 8 }}>
//         <span className="mono" style={{ background: C.g100, padding: "2px 7px", borderRadius: 5, fontSize: 9 }}>{integration.authType}</span>
//         {integration.category && <span style={{ textTransform: "uppercase", fontSize: 9, color: C.g300 }}>{integration.category}</span>}
//       </div>
//       {isAdmin && (
//         <div style={{ display: "flex", gap: 6 }}>
//           {integration.status === "connected" && (
//             <>
//               <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: 6 }} onClick={onEdit}><Settings2 size={12} /> Configurer</button>
//               {!confirmDis ? (
//                 <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: 6, borderColor: "#fecaca", color: "#dc2626" }} onClick={() => setConfirmDis(true)}><Zap size={12} /> Déconnecter</button>
//               ) : (
//                 <div style={{ flex: 1, display: "flex", gap: 4 }}>
//                   <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 10, padding: 5, background: "#dc2626", boxShadow: "none" }} onClick={onDisconnect}>Oui</button>
//                   <button onClick={() => setConfirmDis(false)} style={{ fontSize: 10, color: C.g400, background: "none", border: "none", cursor: "pointer" }}>Non</button>
//                 </div>
//               )}
//             </>
//           )}
//           {integration.status === "available" && <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={onEdit}><Plus size={12} /> Connecter</button>}
//           {integration.status === "coming_soon" && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 9, background: C.g100, fontSize: 11, color: C.g400 }}><Zap size={12} style={{ marginRight: 4 }} /> Bientôt</div>}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── MAIN VIEW ─────────────────────────────────────────────── */
// export function IntegrationsView() {
//   const [connectors, setConnectors] = useState(DEMO_CONNECTORS);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("all");
//   const [modal, setModal] = useState(null);
//   const [assistantOpen, setAssistantOpen] = useState(false);
//   const [assistantHasData, setAssistantHasData] = useState(false);

//   const CATS = [
//     { id: "all", label: "Tout" }, { id: "erp", label: "ERP" }, { id: "accounting", label: "Comptabilité" },
//     { id: "crm", label: "CRM" }, { id: "storage", label: "Stockage" },
//   ];
//   const filtered = connectors.filter(c => {
//     if (category !== "all" && c.category !== category) return false;
//     if (search && !`${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
//     return true;
//   });
//   const connected = connectors.filter(c => c.status === "connected");
//   const handleSave = d => {
//     const saved = { ...d, pipelineTemplatesJson: JSON.stringify(d.pipelines || CONNECTOR_CONFIG.step7_templates) };
//     if (saved.id) {
//       setConnectors(prev => prev.map(c => c.id === saved.id ? { ...c, ...saved } : c));
//       const raw = CONNECTORS_TABLE.find(c => c.id === saved.id);
//       if (raw) raw.pipelineTemplatesJson = saved.pipelineTemplatesJson;
//     } else {
//       setConnectors(prev => [...prev, { ...saved, id: `c${Date.now()}`, status: "connected" }]);
//     }
//     setModal(null);
//   };
//   const handleDisconnect = id => setConnectors(prev => prev.map(c => c.id === id ? { ...c, status: "available" } : c));
//   const handleAssistantAutofill = (d) => { setAssistantHasData(true); setModal(d); };
//   const handleSyncTemplates = (integration) => {
//     const connTemplates = integration.pipelineTemplatesJson
//       ? JSON.parse(integration.pipelineTemplatesJson)
//       : (integration.pipelines || CONNECTOR_CONFIG.step7_templates);
//     const savedTemplatesJson = JSON.stringify(connTemplates);
//     setConnectors(prev => prev.map(c => c.id === integration.id ? { ...c, ...integration, pipelineTemplatesJson: savedTemplatesJson } : c));
//     const raw = CONNECTORS_TABLE.find(c => c.id === integration.id);
//     if (raw) raw.pipelineTemplatesJson = savedTemplatesJson;
//     const activeKeys = Object.keys(connTemplates);
//     const linkedTenants = TENANT_CONNECTIONS_TABLE.filter(x => x.connectorId === integration.id && x.active);
//     if (linkedTenants.length === 0) { alert("Aucun tenant actif lié à cet ERP."); return; }
//     let created = 0;
//     const createdKeys = new Set();
//     linkedTenants.forEach(tc => {
//       const processed = tc.processedTemplatesJson ? JSON.parse(tc.processedTemplatesJson) : [];
//       const diff = activeKeys.filter(k => !processed.includes(k) && connTemplates[k]?.enabled !== false);
//       diff.forEach(k => {
//         const tmpl = connTemplates[k];
//         const newPipe = {
//           id: `mock-pipe-${Date.now()}-${tc.tenantId}-${k}`,
//           tenantId: tc.tenantId,
//           name: `${tc.externalId} - ${tmpl.name || k}`,
//           sourceType: "JDBC",
//           status: "ACTIVE",
//           active: true,
//           templateKey: k,
//           isCustom: false,
//           connectorId: tc.connectorId,
//           externalId: tc.externalId,
//           lastRunAt: new Date().toISOString(),
//           lastRunStats: { processedCount: 0, importedCount: 0, anomalyCount: 0 },
//           configJson: JSON.stringify({ template: k, tables: tmpl.tables || [], joins: tmpl.joins || [], conditions: tmpl.conditions || [], fieldMappings: tmpl.fieldMappings || {} }),
//         };
//         createPipelineStore(newPipe);
//         created += 1;
//         createdKeys.add(k);
//       });
//       tc.processedTemplatesJson = JSON.stringify([...new Set([...processed, ...diff])]);
//     });
//     if (created === 0) { alert("Tous les templates actifs sont déjà synchronisés pour les tenants liés."); return; }
//     alert(`Synchronisation terminée : ${created} pipeline(s) créé(s) pour ${linkedTenants.length} tenant(s) (${[...createdKeys].join(", ")}).`);
//   };

//   return (
//     <>
//       <style>{CSS}</style>
//       <div className="root fade-up" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
//         <PageHeader
//           eyebrow="Connecteurs"
//           title="Intégrations ERP"
//           subtitle={`${connected.length} connectée${connected.length > 1 ? "s" : ""} · ${connectors.length} disponibles`}
//           actions={(
//             <>
//             <div style={{ position: "relative" }}>
//               <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g400 }} />
//               <input value={search} onChange={e => setSearch(e.target.value)} className="input" style={{ paddingLeft: 30, width: 210, fontSize: 12 }} placeholder="Rechercher…" />
//             </div>
//             <button onClick={() => setModal({})} className="btn btn-primary"><Plus size={13} /> Nouveau connecteur</button>
//             </>
//           )}
//         />

//         <div style={{ display: "flex", gap: 4 }}>
//           {CATS.map(cat => {
//             const count = connectors.filter(c => cat.id === "all" || c.category === cat.id).length;
//             return (
//               <button key={cat.id} onClick={() => setCategory(cat.id)}
//                 style={{ padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", border: "none", background: category === cat.id ? "rgba(217,79,61,.14)" : "transparent", color: category === cat.id ? C.red : C.g400, fontFamily: "'DM Sans',sans-serif" }}>
//                 {cat.label} <span style={{ opacity: .6 }}>({count})</span>
//               </button>
//             );
//           })}
//         </div>

//         {connected.length > 0 && category === "all" && (
//           <div>
//             <p style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={11} /> Connectés ({connected.length})</p>
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
//               {connected.filter(c => !search || `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())).map(c => (
//                 <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Non-connected or filtered section */}
//         {category !== "all" || (search && filtered.length === 0) ? (
//           filtered.length > 0 ? filtered.map(c => (
//             <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
//           )) : (
//             <div style={{ textAlign: "center", padding: "64px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
//               <Plug size={32} color={C.g300} />Aucune intégration trouvée
//             </div>
//           )
//         ) : (
//           filtered.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "80px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
//               <Plug size={34} color={C.g300} />
//               <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: C.g900 }}>Aucune intégration</div>
//               <div>Aucun connecteur n'est configuré pour le moment.</div>
//             </div>
//           ) : (
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
//               {filtered.filter(c => c.status !== "connected").map(c => (
//                 <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
//               ))}
//             </div>
//           )
//         )}
//       </div>

//       {modal !== null && (
//         <ConnectorWizardModal
//           open={true}
//           initialData={modal}
//           onClose={() => setModal(null)}
//           onSave={handleSave}
//           onSyncTemplates={handleSyncTemplates}
//           onDelete={modal.id ? () => { setConnectors(prev => prev.filter(c => c.id !== modal.id)); setModal(null); } : null}
//         />
//       )}

//       {/* Floating chat bubble — always visible */}
//       <AssistantBubble onOpen={() => setAssistantOpen(true)} hasData={assistantHasData} />

//       {/* Standalone assistant (from FAB) */}
//       {assistantOpen && (
//         <AssistantFullscreen
//           onClose={() => setAssistantOpen(false)}
//           onAutofill={handleAssistantAutofill}
//           rawSchema={null}
//         />
//       )}
//     </>
//   );
// }

// export default IntegrationsView;


import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus, X, Tag, Plug, Network, Settings2, Calculator, Sparkles, CheckCircle2,
  ArrowLeft, ArrowRight, Database, GitBranch, ScanLine, ClipboardCheck,
  RefreshCw, Download, FlaskConical, TrendingUp, ChevronRight, ChevronDown,
  AlertCircle, Search, Link2, Maximize2, Minimize2, PanelRightClose, PanelRightOpen,
  Cpu, Layers, BarChart3, Eye, EyeOff, Zap, Filter, Table2, Map, GripVertical, Hash,
  Bot, MessageSquare, FileJson, Send, ChevronUp, Code2, RotateCcw, Wand2,
  Info, Check, ChevronLeft, Copy, Users, Globe, Upload, FileText, AlertTriangle
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
} from "@/store/staticData";
import { useStore, visibleTenants, createPipelineStore } from "@/store/db";
import { PageHeader } from "@/components/ui/PageHeader";

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
.modal{display:flex;flex-direction:column;background:rgba(243,241,238,.98);box-shadow:0 40px 100px rgba(0,0,0,.25),0 0 0 1px rgba(255,255,255,.6);border-radius:22px;overflow:hidden;}
.fade-up{animation:fadeUp .28s ease-out;}
.fade-in{animation:fadeIn .2s ease-out;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes slideInUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes bubblePop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.spin{animation:spin 1s linear infinite;}
.pulse{animation:pulse 1.5s ease-in-out infinite;}
.slide-in-right{animation:slideInRight .35s cubic-bezier(.34,1.56,.64,1);}
.slide-in-up{animation:slideInUp .3s ease-out;}
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

/* ── UNSAVED CHANGES SAVE BUTTON ── */
@keyframes saveButtonPop{0%{transform:scale(0.7);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
.save-changes-btn{animation:saveButtonPop .3s cubic-bezier(.34,1.56,.64,1);display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(34,197,94,.10);color:#15803d;border:1px solid rgba(34,197,94,.24);cursor:pointer;box-shadow:0 8px 20px rgba(34,197,94,.08);transition:all .15s;font-family:'DM Sans',sans-serif;}
.save-changes-btn:hover{background:rgba(34,197,94,.16);transform:translateY(-1px);}
.sync-changes-btn{animation:saveButtonPop .3s cubic-bezier(.34,1.56,.64,1);display:inline-flex;align-items:center;gap:6px;padding:7px 16px;border-radius:10px;font-size:12px;font-weight:700;background:rgba(59,130,246,.10);color:#1d4ed8;border:1px solid rgba(59,130,246,.24);cursor:pointer;box-shadow:0 8px 20px rgba(59,130,246,.08);transition:all .15s;font-family:'DM Sans',sans-serif;}
.sync-changes-btn:hover{background:rgba(59,130,246,.16);transform:translateY(-1px);}

/* ── JOIN BUILDER ── */
.join-row{display:flex;align-items:center;gap:8px;padding:10px 14px;background:rgba(248,247,245,.8);border-radius:11px;border:1px solid #e5e7eb;flex-wrap:wrap;}
.join-table-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:8px;font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:700;}
.join-keyword{font-size:10px;font-weight:800;letter-spacing:.05em;padding:3px 8px;border-radius:6px;background:rgba(217,79,61,.1);color:#D94F3D;font-family:'JetBrains Mono',monospace;}
.join-on-keyword{font-size:10px;font-weight:800;letter-spacing:.05em;padding:3px 8px;border-radius:6px;background:rgba(245,158,11,.1);color:#b45309;font-family:'JetBrains Mono',monospace;}

/* ── TENANT SELECT (GraphQL-style) ── */
.gql-select-wrap{position:relative;}
.gql-select-trigger{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;border:1.5px solid #e5e7eb;background:rgba(255,255,255,.9);cursor:pointer;transition:all .15s;font-family:'DM Sans',sans-serif;}
.gql-select-trigger:hover{border-color:rgba(59,130,246,.4);}
.gql-select-trigger.open{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.1);}
.gql-select-trigger.linked{border-color:rgba(34,197,94,.4);background:rgba(34,197,94,.04);}
.gql-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid rgba(59,130,246,.25);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);z-index:100;overflow:hidden;animation:slideInUp .15s ease-out;}
.gql-search{padding:8px 12px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:7px;}
.gql-search input{flex:1;border:none;outline:none;font-size:12px;font-family:'DM Sans',sans-serif;color:#111827;background:transparent;}
.gql-option{display:flex;align-items:center;gap:10px;padding:8px 12px;cursor:pointer;transition:background .1s;}
.gql-option:hover{background:rgba(59,130,246,.06);}
.gql-option.selected-opt{background:rgba(34,197,94,.06);}

/* ── TENANT PROCESSING OVERLAY ── */
@keyframes processingPulse{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.4)}50%{box-shadow:0 0 0 8px rgba(59,130,246,0)}}
@keyframes logSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.tenant-processing{border-radius:12px;border:1.5px solid rgba(59,130,246,.35);background:rgba(59,130,246,.04);padding:14px;animation:processingPulse 2s ease-in-out infinite;}
.log-line{font-size:10px;font-family:'JetBrains Mono',monospace;padding:2px 0;animation:logSlide .2s ease-out;display:flex;align-items:baseline;gap:6px;}
.log-line .ts{color:#9ca3af;flex-shrink:0;}
.log-line .ok{color:#16a34a;}
.log-line .info{color:#3b82f6;}
.log-line .warn{color:#b45309;}

/* ── REPORT MODAL ── */
@keyframes reportIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.report-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);z-index:9995;display:flex;align-items:center;justify-content:center;padding:20px;}
.report-modal{background:#f8f7f5;border-radius:22px;width:100%;max-width:860px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;box-shadow:0 40px 100px rgba(0,0,0,.3);animation:reportIn .3s ease-out;overflow:hidden;}
.report-hdr{padding:20px 24px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.report-body{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px;}
.report-section{background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;}
.report-section-hdr{padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:8px;}
.report-log-line{font-size:11px;font-family:'JetBrains Mono',monospace;padding:5px 16px;border-bottom:1px solid rgba(0,0,0,.03);display:flex;align-items:baseline;gap:10px;}
.report-log-line:last-child{border-bottom:none;}
.rl-ts{color:#9ca3af;flex-shrink:0;font-size:10px;}
.rl-ok{color:#16a34a;}
.rl-info{color:#3b82f6;}
.rl-warn{color:#b45309;}
.rl-err{color:#dc2626;}
.stat-card{flex:1;padding:14px 16px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;text-align:center;}

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

/* ── FULLSCREEN LIGHT ── */
.asst-fs{position:fixed;inset:0;z-index:10100;background:#f7f6f3;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;}
.asst-fs-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:#fff;border-bottom:1px solid #e5e7eb;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.06);}
.asst-fs-body{flex:1;display:flex;min-height:0;overflow:hidden;}
.asst-fs-sidebar{width:200px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;padding:16px 10px;gap:3px;overflow-y:auto;}
.asst-fs-main{flex:1;display:flex;flex-direction:column;min-width:0;background:#f7f6f3;overflow:hidden;}
.asst-prog-rail{height:3px;background:#e5e7eb;flex-shrink:0;}
.asst-prog-fill{height:100%;background:linear-gradient(90deg,#D94F3D,#f97316);transition:width .4s ease-out;}

/* ── SIDEBAR STEPS LIGHT ── */
.asst-ss{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:default;border:1.5px solid transparent;}
.asst-ss.active{background:rgba(217,79,61,.08);border-color:rgba(217,79,61,.2);}
.asst-sn{width:24px;height:24px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#f3f4f6;border:1.5px solid #e5e7eb;font-size:9px;font-weight:700;color:#9ca3af;}
.asst-ss.done .asst-sn{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.3);color:#16a34a;}
.asst-ss.active .asst-sn{background:rgba(217,79,61,.1);border-color:rgba(217,79,61,.3);color:#D94F3D;}

/* ── CHAT MESSAGES LIGHT ── */
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

/* ── FORM / REPORT ── */
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

/* ── JSON IMPORT ── */
.json-import-wrap{flex:1;overflow-y:auto;padding:24px 40px;}
.json-import-wrap::-webkit-scrollbar{width:3px;}
.json-import-wrap::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:99px;}
.json-textarea{width:100%;min-height:260px;padding:14px;border-radius:12px;border:1.5px solid #e5e7eb;background:#1e1e2e;color:#86efac;font-size:12px;font-family:'JetBrains Mono',monospace;outline:none;resize:vertical;line-height:1.7;}
.json-textarea:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.07);}
.score-bar{height:8px;border-radius:99px;background:#e5e7eb;overflow:hidden;margin:8px 0;}
.score-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.34,1.2,.64,1);}

/* ── MODE TABS LIGHT ── */
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
    connection: { type: d.connectionType, jdbcUrl: d.jdbcUrl, jdbcUsername: d.jdbcUsername, jdbcPassword: d.jdbcPassword ? "***" : "" },
    tables: { selected: d.selectedTables, budgetSources: d.budgetSourceTables },
    pipelines: {
      factures: { enabled: true, sourceTables: d.pipelines.facture.tables, fieldMappings: d.pipelines.facture.fieldMappings },
      commandes: { enabled: true, sourceTables: d.pipelines.commande.tables, groupBy: d.pipelines.commande.groupByCols }
    },
    budget: { formula: d.budgetFormula, alertYellow: Number(d.alertYellow || 75), alertRed: Number(d.alertRed || 90) },
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
    { id: "qa_jwt_key", type: "text", key: "publicKey", bot: () => "Clé publique PEM (copiez-collez la première ligne ou l'empreinte) :", placeholder: "-----BEGIN PUBLIC KEY-----", next: "qa_jwt_issuer" },
    { id: "qa_jwt_issuer", type: "text", key: "issuer", bot: () => "Issuer JWT ?", placeholder: "https://your-domain.com", next: "qa_jwt_algo" },
    {
      id: "qa_jwt_algo", type: "choice", key: "algorithm", bot: () => "Algorithme de signature ?",
      options: [{ label: "RS256", value: "RS256" }, { label: "RS512", value: "RS512" }, { label: "ES256", value: "ES256" }, { label: "HS256", value: "HS256" }],
      next: "q_conn"
    },
  ],
  SAML: [
    { id: "qa_saml_entity", type: "text", key: "entityId", bot: () => "Entity ID SAML ?", placeholder: "https://erp.example.com/saml/metadata", next: "qa_saml_sso" },
    { id: "qa_saml_sso", type: "text", key: "ssoUrl", bot: () => "URL SSO SAML ?", placeholder: "https://idp.example.com/sso", next: "q_conn" },
  ],
  NONE: [],
};

// Build full QA flow with auth detail steps injected
function buildQAFlow() {
  const base = [
    {
      id: "start", type: "mode_pick", bot: "Bonjour ! 👋 Je suis votre assistant ERP. Comment souhaitez-vous configurer ce connecteur ?", options: [
        { label: "💬 Questions / Réponses guidées", desc: "Je vous guide étape par étape", value: "qa" },
        { label: "📋 Formulaire structuré", desc: "Toutes les sections en une page", value: "form" },
        { label: "📄 Import JSON", desc: "Collez votre config JSON existante", value: "json" },
      ]
    },
    { id: "q_name", type: "text", key: "name", bot: "Quel est le nom de ce connecteur ERP ?", placeholder: "ex: SAP Production France", next: "q_type" },
    {
      id: "q_type", type: "choice", key: "connectorType", bot: (a) => `Super, «${a.name || "ce système"}». Quel type ?`,
      options: [
        { label: "🏭 ERP (SAP, Sage, Odoo…)", value: "ERP" },
        { label: "🗄️ Source de données SQL", value: "DATA_SOURCE" },
        { label: "📊 Comptabilité standalone", value: "ACCOUNTING" },
      ], next: "q_auth"
    },
    {
      id: "q_auth", type: "choice", key: "authType", bot: () => "Quel mode d'authentification utilise ce système ?",
      options: [
        { label: "👤 Basic (user / mot de passe)", value: "BASIC" },
        { label: "🔑 API Key", value: "API_KEY" },
        { label: "🔐 OAuth 2.0", value: "OAUTH2" },
        { label: "📜 JWT Signé", value: "JWT_SIGNED" },
        { label: "🔏 SAML 2.0", value: "SAML" },
        { label: "🚫 Aucune", value: "NONE" },
      ],
      nextFn: (val) => {
        const detailSteps = AUTH_DETAIL_QUESTIONS[val] || [];
        return detailSteps.length > 0 ? detailSteps[0].id : "q_conn";
      }
    },
    // Auth detail steps (BASIC)
    ...AUTH_DETAIL_QUESTIONS.BASIC,
    ...AUTH_DETAIL_QUESTIONS.API_KEY,
    ...AUTH_DETAIL_QUESTIONS.OAUTH2,
    ...AUTH_DETAIL_QUESTIONS.JWT_SIGNED,
    ...AUTH_DETAIL_QUESTIONS.SAML,
    // Connection
    {
      id: "q_conn", type: "choice", key: "connectionType", bot: () => "Comment se connecter à la base de données ?",
      options: [
        { label: "🔗 JDBC (base SQL directe)", value: "jdbc" },
        { label: "🌐 API REST", value: "api" },
        { label: "📁 Fichier CSV / Excel", value: "csv" },
      ], next: "q_jdbc"
    },
    { id: "q_jdbc", type: "text", key: "jdbcUrl", bot: () => "URL JDBC de connexion ?", placeholder: "jdbc:postgresql://host:5432/erp_db", condition: (d) => d.connectionType === "jdbc", next: "q_tables" },
    { id: "q_tables", type: "multi_schema", key: "selectedTables", bot: (a, s) => s ? `Quelles tables importer ? (${s.tables.length} disponibles)` : "Listez les tables séparées par des virgules.", next: "q_pl_facture" },
    // Pipeline Factures
    { id: "q_pl_facture", type: "pipeline_facture", key: "factureMappings", bot: () => "Configurons le pipeline Factures. Mappez les colonnes requises :", next: "q_pl_commande" },
    // Pipeline Commandes
    { id: "q_pl_commande", type: "pipeline_commande", key: "commandeGroupBy", bot: () => "Pipeline Commandes : quelles colonnes pour le Group By ? (optionnel)", next: "q_budget_tables" },
    // Budget
    { id: "q_budget_tables", type: "choice_dynamic", key: "budgetSourceTables", bot: () => "Quelle table contient les données budgétaires ?", next: "q_budget_formula" },
    {
      id: "q_budget_formula", type: "choice", key: "budgetFormulaType", bot: () => "Formule budgétaire à utiliser ?",
      options: [
        { label: "Standard (Alloué − Consommé)", value: "standard" },
        { label: "Avec engagements (Alloué − Engagé − Consommé)", value: "engaged" },
        { label: "Personnalisée (configurer dans le wizard)", value: "custom" },
      ], next: "q_alerts"
    },
    // Alerts
    {
      id: "q_alerts", type: "choice", key: "alertRed", bot: () => "Seuil (% consommé) pour l'alerte rouge ?",
      options: [
        { label: "80%", value: "80" },
        { label: "90% (recommandé)", value: "90" },
        { label: "95%", value: "95" },
        { label: "100%", value: "100" },
      ], next: "q_tenants"
    },
    // Tenants
    { id: "q_tenants", type: "text", key: "_tenantsRaw", bot: () => "IDs tenants (clients) séparés par des virgules :", placeholder: "CLIENT_001, CLIENT_002", next: "q_done" },
    { id: "q_done", type: "done", bot: (a) => `✅ Configuration complète pour «${a.name || "votre ERP"}» ! Cliquez pour voir le rapport JSON.` },
  ];
  return base;
}

const QA_FLOW = buildQAFlow();

const QA_SIDEBAR_STEPS = [
  { id: "q_name", label: "Nom" },
  { id: "q_type", label: "Type" },
  { id: "q_auth", label: "Auth" },
  { id: "q_conn", label: "Connexion" },
  { id: "q_jdbc", label: "URL JDBC" },
  { id: "q_tables", label: "Tables" },
  { id: "q_pl_facture", label: "Pipeline Factures" },
  { id: "q_pl_commande", label: "Pipeline Commandes" },
  { id: "q_budget_tables", label: "Budget" },
  { id: "q_alerts", label: "Alertes" },
  { id: "q_tenants", label: "Tenants" },
  { id: "q_done", label: "Rapport" },
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

/* ─── REPORT VIEW ───────────────────────────────────────────── */
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
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
            {score >= 70 ? "Configuration prête à être appliquée." : "Des champs importants sont manquants."}
          </div>
        </div>
        <button className="asst-pbtn" onClick={onAutofill}><Wand2 size={15} /> Confirmer &amp; remplir le wizard</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {[
          { label: report?.identity?.name || "Sans nom", color: "#D94F3D" },
          { label: report?.identity?.connectorType || "ERP", color: "#3b82f6" },
          { label: report?.identity?.authType || "NONE", color: "#8b5cf6" },
          { label: `${(report?.tables?.selected || []).length} table(s)`, color: "#059669" },
          { label: `${(report?.tenants || []).length} tenant(s)`, color: "#f59e0b" },
        ].map(c => <div key={c.label} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>{c.label}</div>)}
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

  const TEMPLATE = {
    identity: { name: "Mon ERP", connectorType: "ERP", authType: "BASIC", logo: "ME", color: "#D94F3D", description: "" },
    authentication: { username: "erp_user", password: "••••••" },
    connection: { type: "jdbc", jdbcUrl: "jdbc:postgresql://host:5432/erp_db", jdbcUsername: "erp_user", jdbcPassword: "" },
    tables: { selected: ["FACTURES", "FOURNISSEURS", "COMMANDES", "BUDGETS"], budgetSources: ["BUDGETS"] },
    pipelines: {
      factures: { enabled: true, sourceTables: ["FACTURES", "FOURNISSEURS"], fieldMappings: { invoiceId: "FACTURES.ID_FACTURE", supplierName: "FOURNISSEURS.NOM", invoiceDate: "FACTURES.DATE_FACT", amount: "FACTURES.MONTANT_TTC", status: "FACTURES.STATUT", label: "FACTURES.CATEGORIE" } },
      commandes: { enabled: true, sourceTables: ["COMMANDES"], groupBy: [] }
    },
    budget: { alertYellow: 75, alertRed: 90 },
    tenants: ["CLIENT_001", "CLIENT_002"],
  };

  const handleParse = () => {
    try {
      const p = JSON.parse(raw);
      setParsed(p); setError(null); setScore(computeScore(p));
    } catch (e) { setError("JSON invalide : " + e.message); setParsed(null); setScore(null); }
  };

  const handleTemplate = () => {
    setRaw(JSON.stringify(TEMPLATE, null, 2));
    setParsed(null); setError(null); setScore(null);
  };

  const handleConfirm = () => {
    if (!parsed) return;
    // Convert JSON structure → wizard data
    const d = {
      name: parsed.identity?.name || "",
      connectorType: parsed.identity?.connectorType || "ERP",
      authType: parsed.identity?.authType || "NONE",
      logo: parsed.identity?.logo || "",
      color: parsed.identity?.color || "#D94F3D",
      description: parsed.identity?.description || "",
      ...(parsed.authentication || {}),
      connectionType: parsed.connection?.type || "jdbc",
      jdbcUrl: parsed.connection?.jdbcUrl || "",
      jdbcUsername: parsed.connection?.jdbcUsername || "",
      jdbcPassword: parsed.connection?.jdbcPassword || "",
      selectedTables: parsed.tables?.selected || [],
      budgetSourceTables: parsed.tables?.budgetSources || [],
      alertYellow: String(parsed.budget?.alertYellow || 75),
      alertRed: String(parsed.budget?.alertRed || 90),
      tenants: (parsed.tenants || []).map(t => typeof t === "string"
        ? { id: t, label: t, active: true, statuses: { facture: { provisional: ["En attente"], final: ["Payé"], statusColumn: "STATUT" }, commande: { provisional: ["En cours"], final: ["Livré"], statusColumn: "STATUT" } } }
        : t),
      pipelines: {
        facture: { enabled: parsed.pipelines?.factures?.enabled !== false, tables: parsed.pipelines?.factures?.sourceTables || [], fieldMappings: parsed.pipelines?.factures?.fieldMappings || {}, conditions: [], joins: [], groupByCols: [] },
        commande: { enabled: parsed.pipelines?.commandes?.enabled !== false, tables: parsed.pipelines?.commandes?.sourceTables || [], fieldMappings: {}, conditions: [], joins: [], groupByCols: parsed.pipelines?.commandes?.groupBy || [] },
      },
      budgetFormula: [], customPipelines: [], generatedData: {},
    };
    onAutofill(d);
  };

  return (
    <div className="json-import-wrap">
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.g900 }}>Importer une configuration JSON</div>
              <div style={{ fontSize: 12, color: C.g400, marginTop: 3 }}>Collez votre JSON de configuration ERP ci-dessous</div>
            </div>
            <button className="asst-gbtn" onClick={handleTemplate} style={{ fontSize: 11 }}>
              <FileText size={13} /> Charger un modèle
            </button>
          </div>
          <textarea
            className="json-textarea"
            value={raw}
            onChange={e => { setRaw(e.target.value); setParsed(null); setError(null); setScore(null); }}
            placeholder={'{\n  "identity": { "name": "Mon ERP", ... },\n  "connection": { "jdbcUrl": "...", ... },\n  ...\n}'}
          />
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.2)", marginBottom: 16 }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
          </div>
        )}

        {score !== null && parsed && (
          <div style={{ padding: "16px 20px", borderRadius: 14, background: score >= 70 ? "rgba(22,163,74,.06)" : "rgba(245,158,11,.06)", border: `1px solid ${score >= 70 ? "rgba(22,163,74,.2)" : "rgba(245,158,11,.2)"}`, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: score >= 70 ? "#16a34a" : "#b45309" }}>Score : {score}/100</div>
              {score >= 40 && <button className="asst-pbtn" onClick={handleConfirm}><Wand2 size={14} /> Confirmer &amp; remplir le wizard</button>}
            </div>
            <div className="score-bar"><div className="score-fill" style={{ width: `${score}%`, background: score >= 70 ? "linear-gradient(90deg,#16a34a,#22c55e)" : "linear-gradient(90deg,#b45309,#f59e0b)" }} /></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {[
                { label: parsed?.identity?.name || "—", color: "#D94F3D" },
                { label: (parsed?.tables?.selected || []).length + " tables", color: "#059669" },
                { label: (parsed?.tenants || []).length + " tenants", color: "#f59e0b" },
              ].map(c => <div key={c.label} style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color }}>{c.label}</div>)}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button className="asst-pbtn" onClick={handleParse} disabled={!raw.trim()}>
            <CheckCircle2 size={14} /> Analyser le JSON
          </button>
          {score !== null && score < 40 && (
            <div style={{ fontSize: 12, color: "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> Score trop bas — complétez les champs manquants
            </div>
          )}
        </div>

        {/* Structure reference */}
        <div style={{ marginTop: 28, padding: "16px 20px", borderRadius: 14, background: C.g50, border: `1px solid ${C.g200}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.g700, marginBottom: 10 }}>Structure attendue</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { key: "identity.name", desc: "Nom du connecteur", required: true },
              { key: "connection.jdbcUrl", desc: "URL JDBC", required: true },
              { key: "tables.selected[]", desc: "Liste des tables", required: true },
              { key: "tables.budgetSources[]", desc: "Tables budget", required: false },
              { key: "pipelines.factures", desc: "Config pipeline factures", required: false },
              { key: "tenants[]", desc: "IDs clients", required: false },
              { key: "budget.alertRed", desc: "Seuil alerte rouge", required: false },
              { key: "authentication", desc: "Détails auth (selon type)", required: false },
            ].map(f => (
              <div key={f.key} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: f.required ? C.redLight : C.g100, color: f.required ? C.red : C.g400, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{f.required ? "REQ" : "OPT"}</span>
                <div>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g700 }}>{f.key}</div>
                  <div style={{ fontSize: 10, color: C.g400 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

/* ─── PIPELINE FACTURE STEP (in Q&A) ───────────────────────── */
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
          <select value={mapping[f.key] || ""} onChange={e => update(f.key, e.target.value)}
            style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#fff", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", outline: "none" }}>
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
  {
    id: "identity", label: "Identité", color: "#D94F3D", Icon: Tag,
    fields: [
      { key: "name", label: "Nom du connecteur", type: "text", placeholder: "SAP S/4HANA Production", span: 2 },
      { key: "connectorType", label: "Type de système", type: "select", options: ["ERP", "DATA_SOURCE", "ACCOUNTING"] },
      { key: "authType", label: "Authentification", type: "select", options: ["NONE", "BASIC", "API_KEY", "OAUTH2", "JWT_SIGNED", "SAML"] },
      { key: "description", label: "Description", type: "text", placeholder: "Connecteur ERP…", span: 2 },
      { key: "logo", label: "Initiales (2 car.)", type: "text", placeholder: "SP", maxLen: 2 },
      { key: "color", label: "Couleur", type: "color" },
    ]
  },
  {
    id: "auth_details", label: "Détails d'authentification", color: "#6366f1", Icon: Settings2,
    fields: [], // dynamic based on authType
    dynamic: true,
  },
  {
    id: "connection", label: "Connexion", color: "#3b82f6", Icon: Plug,
    fields: [
      { key: "connectionType", label: "Type de connexion", type: "select", options: ["jdbc", "api", "csv"] },
      { key: "jdbcUrl", label: "URL JDBC", type: "text", placeholder: "jdbc:postgresql://host:5432/erp_db", span: 2, mono: true },
      { key: "jdbcUsername", label: "Utilisateur", type: "text", placeholder: "erp_user" },
      { key: "jdbcPassword", label: "Mot de passe", type: "password", placeholder: "••••••••" },
    ]
  },
  {
    id: "tables", label: "Tables", color: "#059669", Icon: Database,
    fields: [
      { key: "selectedTables", label: "Tables à importer", type: "table_picker", span: 2 },
      { key: "budgetSourceTables", label: "Tables sources budget", type: "table_subset", span: 2 },
    ]
  },
  {
    id: "pipelines", label: "Pipelines", color: "#D94F3D", Icon: GitBranch,
    fields: [
      { key: "factureTables", label: "Tables Factures", type: "table_subset_key", sourceKey: "selectedTables", span: 2 },
      { key: "commandeTables", label: "Tables Commandes", type: "table_subset_key", sourceKey: "selectedTables", span: 2 },
    ]
  },
  {
    id: "alerts", label: "Alertes & Tenants", color: "#f59e0b", Icon: Cpu,
    fields: [
      { key: "alertYellow", label: "Seuil jaune (%)", type: "number", placeholder: "75" },
      { key: "alertRed", label: "Seuil rouge (%)", type: "number", placeholder: "90" },
      { key: "_tenantsRaw", label: "IDs Tenants (virgule)", type: "text", placeholder: "CLIENT_001, CLIENT_002", span: 2 },
    ]
  },
];

function SmartFormPanel({ formData, setFormData, schema, onSubmit }) {
  const allTables = schema?.tables || [];
  const update = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const [pwVis, setPwVis] = useState({});

  const authFields = AUTH_FIELDS[formData.authType] || [];
  const nonPickerFields = SMART_FORM_SECTIONS.flatMap(s => {
    if (s.dynamic) return authFields;
    return s.fields;
  }).filter(f => !["table_picker", "table_subset", "table_subset_key", "color"].includes(f?.type));
  const filled = nonPickerFields.filter(f => f?.key && formData[f.key]).length;
  const pct = nonPickerFields.length ? Math.round((filled / nonPickerFields.length) * 100) : 0;

  const renderF = (f) => {
    if (!f || !f.key) return null;
    const v = formData[f.key];
    const spanAll = f.span === 2 ? { gridColumn: "1 / -1" } : {};

    if (f.type === "table_picker") {
      const sel = Array.isArray(v) ? v : [];
      return <div key={f.key} style={{ gridColumn: "1 / -1" }}>
        <label className="asst-flabel">{f.label}</label>
        {allTables.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Saisissez d'abord une URL JDBC</div> :
          <div className="asst-chip-row">{allTables.map(t => { const s = sel.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? sel.filter(x => x !== t.name) : [...sel, t.name])}>{t.name}</button>; })}</div>}
      </div>;
    }
    if (f.type === "table_subset" || f.type === "table_subset_key") {
      const parentSel = Array.isArray(formData.selectedTables) ? formData.selectedTables : [];
      const v2 = Array.isArray(v) ? v : [];
      const avail = allTables.filter(t => parentSel.includes(t.name));
      return <div key={f.key} style={{ gridColumn: "1 / -1" }}>
        <label className="asst-flabel">{f.label}</label>
        {avail.length === 0 ? <div style={{ fontSize: 12, color: "#9ca3af" }}>Sélectionnez d'abord des tables</div> :
          <div className="asst-chip-row">{avail.map(t => { const s = v2.includes(t.name); return <button key={t.name} className={`asst-chip${s ? " sel" : ""}`} onClick={() => update(f.key, s ? v2.filter(x => x !== t.name) : [...v2, t.name])}>{t.name}</button>; })}</div>}
      </div>;
    }
    if (f.type === "select") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><select className="asst-fsel" value={v || ""} onChange={e => update(f.key, e.target.value)}>{(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select></div>;
    if (f.type === "color") return <div key={f.key}><label className="asst-flabel">{f.label}</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ width: 42, height: 42, padding: 3, border: "1.5px solid #e5e7eb", borderRadius: 9, cursor: "pointer" }} /><input className="asst-fi" value={v || "#D94F3D"} onChange={e => update(f.key, e.target.value)} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }} /></div></div>;
    if (f.type === "password") return <div key={f.key} style={spanAll}><label className="asst-flabel">{f.label}</label><div style={{ position: "relative" }}><input type={pwVis[f.key] ? "text" : "password"} className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder} style={{ paddingRight: 40 }} /><button onClick={() => setPwVis(p => ({ ...p, [f.key]: !p[f.key] }))} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>{pwVis[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}</button></div></div>;
    if (f.type === "textarea") return <div key={f.key} style={{ gridColumn: "1/-1" }}><label className="asst-flabel">{f.label}</label><textarea className="asst-fi" value={v || ""} onChange={e => update(f.key, e.target.value)} rows={4} style={{ resize: "vertical", height: 80, fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }} /></div>;
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
        return <div key={sec.id} className="asst-fsec">
          <div className="asst-fsec-hdr">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${sec.color}14`, border: `1px solid ${sec.color}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SI size={15} color={sec.color} /></div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{sec.label}</div>
          </div>
          <div className="asst-fsec-body"><div className="asst-frow">{fields.map(f => renderF(f))}</div></div>
        </div>;
      })}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
        <button className="asst-pbtn" onClick={onSubmit}><Sparkles size={15} /> Générer le rapport JSON</button>
      </div>
    </div>
  );
}

/* ─── FULL ASSISTANT PANEL ──────────────────────────────────── */
function AssistantFullscreen({ onClose, onAutofill, rawSchema }) {
  const [mode, setMode] = useState(null); // null | "qa" | "form" | "json"
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
  const schema = useMemo(() => {
    const url = answers.jdbcUrl || "";
    if (!url && !rawSchema) return null;
    if (rawSchema) {
      const sel = answers.selectedTables || [];
      if (sel.length === 0) return rawSchema;
      const tables = rawSchema.tables.filter(t => sel.includes(t.name));
      const tableNames = new Set(tables.map(t => t.name));
      return { tables, rels: rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to)) };
    }
    return GENERIC_SCHEMA;
  }, [answers.jdbcUrl, answers.selectedTables, rawSchema]);

  const scrollB = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (messages.length === 0) initChat(); }, []);
  useEffect(() => { scrollB(); }, [messages, typing]);

  const addBot = (text, opts = {}) => setMessages(p => [...p, { role: "bot", text, ...opts }]);
  const addUser = text => setMessages(p => [...p, { role: "user", text }]);

  const initChat = () => {
    setQaStepIdx(0); setMode(null); setAnswers({}); setMultiSel([]); setReport(null); setShowReport(false); setFactureMappingTemp({});
    const s = QA_FLOW[0];
    setTimeout(() => setMessages([{ role: "bot", text: s.bot, type: s.type, options: s.options }]), 80);
  };

  const advanceToStep = useCallback((targetId, curAnswers) => {
    const idx = QA_FLOW.findIndex(s => s.id === targetId);
    if (idx < 0) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      let si = idx, ns = QA_FLOW[si];
      while (ns?.condition && !ns.condition(curAnswers)) {
        const ni = QA_FLOW.findIndex(s => s.id === ns.next);
        if (ni < 0) break; si = ni; ns = QA_FLOW[si];
      }
      if (!ns) return;
      const bt = typeof ns.bot === "function" ? ns.bot(curAnswers, schema) : ns.bot;
      const opts = { type: ns.type };
      if (ns.type === "choice" || ns.type === "mode_pick") opts.options = ns.options;
      else if (ns.type === "multi_schema") opts.schOpts = (schema?.tables || GENERIC_SCHEMA.tables).map(t => ({ label: t.name, value: t.name }));
      else if (ns.type === "choice_dynamic") opts.dynOpts = (curAnswers.selectedTables || []).map(n => ({ label: n, value: n }));
      else if (ns.type === "pipeline_facture") {
        const selTables = curAnswers.selectedTables || [];
        const plCols = (schema?.tables || GENERIC_SCHEMA.tables)
          .filter(t => selTables.includes(t.name))
          .flatMap(t => t.cols.map(c => `${t.name}.${c}`));
        opts.plCols = plCols;
      }
      else if (ns.type === "pipeline_commande") {
        const selTables = curAnswers.selectedTables || [];
        const plCols = (schema?.tables || GENERIC_SCHEMA.tables)
          .filter(t => selTables.includes(t.name))
          .flatMap(t => t.cols.map(c => ({ label: `${t.name}.${c}`, value: `${t.name}.${c}` })));
        opts.schOpts = plCols;
      }
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

    // Determine next step ID
    let nextId;
    if (step.nextFn) nextId = step.nextFn(answer, na);
    else nextId = step.next;
    if (!nextId) return;
    advanceToStep(nextId, na);
  }, [qaStepIdx, answers, advanceToStep]);

  const handleModeChoice = (v) => {
    setMode(v);
    addUser(v === "qa" ? "💬 Questions / Réponses" : v === "form" ? "📋 Formulaire" : "📄 Import JSON");
    if (v === "qa") {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const n = QA_FLOW[1];
        addBot(n.bot, { type: n.type, placeholder: n.placeholder });
        setQaStepIdx(1);
      }, 400);
    } else {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addBot(v === "form" ? "Parfait ! Remplissez le formulaire ci-dessous." : "Collez votre JSON de configuration ci-dessous.", { type: "switch_" + v });
      }, 400);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    advanceQA(curStep?.key, textInput.trim(), textInput.trim());
    setTextInput("");
  };

  const genReport = (src) => {
    const r = buildReport(src);
    setReport(r); setShowReport(true);
  };

  const handleAutofillAndClose = () => {
    const src = mode === "form" ? formData : answers;
    onAutofill(buildWizardDataFromAnswers(src, schema));
    onClose();
  };

  const isDone = curStep?.id === "q_done";
  const showSidebar = mode === "qa";
  const modePct = mode === "qa" ? Math.round((qaStepIdx / (QA_FLOW.length - 1)) * 100) : 0;
  const isForm = mode === "form";
  const isJSON = mode === "json";

  return createPortal(
    <div className="asst-fs">
      <style>{CSS}</style>
      {/* Header */}
      <div className="asst-fs-hdr">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={18} color="#D94F3D" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>Assistant Configuration ERP</div>
            <div style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.success, display: "inline-block" }} />
              100% local · Aucune IA externe
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {mode && !showReport && !isJSON && (
            <div className="mode-tabs">
              {[{ v: "qa", I: MessageSquare, label: "Q&A" }, { v: "form", I: FileJson, label: "Formulaire" }, { v: "json", I: Upload, label: "JSON" }].map(({ v, I, label }) => (
                <button key={v} className={`mode-tab${mode === v ? " active" : ""}`} onClick={() => { setMode(v); setShowReport(false); }}>
                  <I size={12} /> {label}
                </button>
              ))}
            </div>
          )}
          {(showReport || isJSON) && <button className="asst-gbtn" onClick={() => { setShowReport(false); }}><ArrowLeft size={13} /> Retour</button>}
          <button onClick={initChat} title="Recommencer"
            style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
            <RotateCcw size={14} />
          </button>
          <button onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 9, background: "#f3f4f6", border: "1px solid #e5e7eb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g500 }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {mode === "qa" && <div className="asst-prog-rail"><div className="asst-prog-fill" style={{ width: `${modePct}%` }} /></div>}

      <div className="asst-fs-body">
        {/* Sidebar for Q&A */}
        {showSidebar && (
          <div className="asst-fs-sidebar">
            <div style={{ fontSize: 9, fontWeight: 700, color: C.g300, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10, paddingLeft: 4 }}>Étapes</div>
            {QA_SIDEBAR_STEPS.map((s, i) => {
              const idx = QA_FLOW.findIndex(q => q.id === s.id);
              const done = qaStepIdx > idx, active = curStep?.id === s.id;
              return (
                <div key={s.id} className={`asst-ss${active ? " active" : done ? " done" : ""}`}>
                  <div className="asst-sn">{done ? <CheckCircle2 size={11} color={C.success} /> : i + 1}</div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : done ? 500 : 400, color: active ? C.red : done ? C.g500 : C.g300 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Main content */}
        <div className="asst-fs-main">
          {showReport && report ? (
            <ReportView report={report} onAutofill={handleAutofillAndClose} onBack={() => setShowReport(false)} />
          ) : isJSON ? (
            <JSONImportView onAutofill={(d) => { onAutofill(d); onClose(); }} onBack={() => setMode(null)} />
          ) : isForm ? (
            <SmartFormPanel formData={formData} setFormData={setFormData} schema={schema || GENERIC_SCHEMA} onSubmit={() => genReport(formData)} />
          ) : (
            <>
              <div className="asst-chat-wrap">
                <div className="asst-chat-inner">
                  {messages.map((msg, i) => (
                    <div key={i} className={`${msg.role === "bot" ? "asst-msg-bot" : "asst-msg-user"} asst-anim`}>
                      {msg.role === "bot" && (
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <Bot size={15} color="#D94F3D" />
                        </div>
                      )}
                      <div style={{ maxWidth: "100%" }}>
                        <div className={msg.role === "bot" ? "asst-bb" : "asst-bu"}>{msg.text}</div>

                        {/* Mode pick */}
                        {msg.role === "bot" && msg.type === "mode_pick" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            {(msg.options || []).map((opt, oi) => (
                              <button key={oi} className="asst-opt" onClick={() => handleModeChoice(opt.value)}>
                                <span style={{ flex: 1 }}>{opt.label}</span>
                                {opt.desc && <span style={{ fontSize: 11, color: C.g400 }}>{opt.desc}</span>}
                                <ChevronRight size={14} color={C.g300} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Regular choice */}
                        {msg.role === "bot" && msg.type === "choice" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            {(msg.options || []).map((opt, oi) => (
                              <button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, opt.value, opt.label)}>
                                <span style={{ flex: 1 }}>{opt.label}</span>
                                <ChevronRight size={14} color={C.g300} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Dynamic choice (tables for budget) */}
                        {msg.role === "bot" && msg.type === "choice_dynamic" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            {(msg.dynOpts || []).length === 0
                              ? <div style={{ fontSize: 12, color: C.g400 }}>Aucune table sélectionnée</div>
                              : (msg.dynOpts || []).map((opt, oi) => (
                                <button key={oi} className="asst-opt" onClick={() => advanceQA(curStep?.key, [opt.value], opt.label)}>
                                  <Database size={13} color={C.g400} /><span style={{ flex: 1 }}>{opt.label}</span><ChevronRight size={14} color={C.g300} />
                                </button>
                              ))
                            }
                          </div>
                        )}

                        {/* Multi schema (table selection) */}
                        {msg.role === "bot" && msg.type === "multi_schema" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            <MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} />
                            <button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }} disabled={multiSel.length === 0}
                              onClick={() => advanceQA(curStep?.key, multiSel, `${multiSel.length} table(s)`)}>
                              <Check size={13} /> Confirmer ({multiSel.length})
                            </button>
                          </div>
                        )}

                        {/* Pipeline Factures mapping */}
                        {msg.role === "bot" && msg.type === "pipeline_facture" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            <PipelineFactureMsgWidget
                              plCols={msg.plCols || []}
                              value={factureMappingTemp}
                              onChange={setFactureMappingTemp}
                            />
                            <button className="asst-pbtn" style={{ marginTop: 12, fontSize: 12, padding: "9px 16px" }}
                              onClick={() => advanceQA(curStep?.key, factureMappingTemp, "Mapping factures configuré")}>
                              <Check size={13} /> Confirmer le mapping
                            </button>
                            <button className="asst-gbtn" style={{ marginTop: 8, fontSize: 11, padding: "7px 14px" }}
                              onClick={() => advanceQA(curStep?.key, {}, "Mapping ignoré (configurer dans le wizard)")}>
                              Passer — configurer plus tard
                            </button>
                          </div>
                        )}

                        {/* Pipeline Commandes group by */}
                        {msg.role === "bot" && msg.type === "pipeline_commande" && i === messages.length - 1 && (
                          <div style={{ marginTop: 10 }}>
                            <MultiChip options={msg.schOpts || []} value={multiSel} onChange={setMultiSel} />
                            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                              <button className="asst-pbtn" style={{ fontSize: 12, padding: "9px 16px" }}
                                onClick={() => advanceQA(curStep?.key, multiSel, multiSel.length ? `${multiSel.length} col(s) Group By` : "Pas de Group By")}>
                                <Check size={13} /> Confirmer
                              </button>
                              <button className="asst-gbtn" style={{ fontSize: 11, padding: "7px 14px" }}
                                onClick={() => advanceQA(curStep?.key, [], "Pas de Group By")}>
                                Passer
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Done */}
                        {msg.role === "bot" && msg.type === "done" && (
                          <button className="asst-pbtn" style={{ marginTop: 12 }} onClick={() => genReport(answers)}>
                            <FileJson size={15} /> Voir le rapport JSON
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="asst-msg-bot asst-anim">
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(217,79,61,.1)", border: "1.5px solid rgba(217,79,61,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bot size={15} color="#D94F3D" />
                      </div>
                      <div className="asst-typing"><span /><span /><span /></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>

              {mode === "qa" && !isDone && curStep?.type === "text" && (
                <div className="asst-input-bar">
                  <div className="asst-input-bar-inner">
                    <input className="asst-ti" value={textInput} onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleTextSubmit()}
                      placeholder={curStep?.placeholder || "Tapez votre réponse…"} />
                    <button className="asst-sb" onClick={handleTextSubmit} disabled={!textInput.trim()}>
                      <Send size={16} color="#fff" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── CHAT BUBBLE + POPUP ───────────────────────────────────── */
function AssistantBubble({ onOpen, hasData }) {
  const [showTooltip] = useState(true);
  return createPortal(
    <button className="asst-fab" onClick={onOpen} title="Ouvrir l'assistant ERP">
      <Bot size={26} color="#fff" />
      {hasData && <div className="asst-fab-badge"><Check size={10} /></div>}
      <span className="asst-tooltip">Assistant ERP</span>
    </button>,
    document.body
  );
}

/* ─── ERD ────────────────────────────────────────────────────── */
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

  const highlighted = useMemo(() => {
    if (!search) return new Set();
    const q = search.toLowerCase();
    return new Set(tableNames.filter(n => n.toLowerCase().includes(q)));
  }, [search, tableNames]);

  const initialCardPositions = useMemo(() => Object.fromEntries(tableNames.map((name, i) => {
    const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: Math.floor(i / 4) * 290 };
    return [name, { x: PAD + off.x, y: PAD + off.y }];
  })), [tableKey]);
  const [cardPositions, setCardPositions] = useState(initialCardPositions);

  useEffect(() => { setCardPositions(initialCardPositions); }, [initialCardPositions]);

  const cardHeight = name => { const t = tables[name]; if (!t) return 80; return 36 + Math.min(t.cols.length, MAX_COLS) * 20 + (t.cols.length > MAX_COLS ? 18 : 4); };

  const canvasW = Math.max(...(tableNames.length ? tableNames.map((_, i) => { const off = ERD_OFFSETS[i] || { x: (i % 4) * 220, y: 0 }; return PAD + off.x + CARD_W + PAD * 3; }) : [900]), 900);
  const canvasH = Math.max(...(tableNames.length ? tableNames.map((name, i) => { const off = ERD_OFFSETS[i] || { x: 0, y: Math.floor(i / 4) * 290 }; return PAD + off.y + cardHeight(name) + PAD * 3; }) : [600]), 600);

  const fitView = useCallback(() => {
    const vp = viewportRef.current; if (!vp) return;
    const W = vp.clientWidth, H = vp.clientHeight;
    if (fullscreen) {
      setCam({ scale: 1, x: 28, y: 42 });
      return;
    }
    const scale = Math.min((W - 60) / canvasW, (H - 60) / canvasH, 1);
    setCam({ scale, x: (W - canvasW * scale) / 2, y: (H - canvasH * scale) / 2 });
  }, [canvasW, canvasH, fullscreen]);

  useEffect(() => { fitView(); }, [tableNames.length, fullscreen, fitView]);

  const onMouseDown = useCallback(e => {
    if (e.target.closest(".erd-table-card")) return;
    panRef.current = { isPanning: true, startX: e.clientX, startY: e.clientY, camX: cam.x, camY: cam.y };
    viewportRef.current.style.cursor = "grabbing"; e.preventDefault();
  }, [cam]);
  const onMouseMove = useCallback(e => {
    if (cardDragRef.current) {
      const drag = cardDragRef.current;
      const dx = (e.clientX - drag.startX) / cam.scale;
      const dy = (e.clientY - drag.startY) / cam.scale;
      if (Math.abs(e.clientX - drag.startX) + Math.abs(e.clientY - drag.startY) > 4) drag.moved = true;
      setCardPositions(prev => ({ ...prev, [drag.name]: { x: drag.posX + dx, y: drag.posY + dy } }));
      return;
    }
    if (!panRef.current.isPanning) return;
    setCam(c => ({ ...c, x: panRef.current.camX + (e.clientX - panRef.current.startX), y: panRef.current.camY + (e.clientY - panRef.current.startY) }));
  }, [cam.scale]);
  const onMouseUp = useCallback(() => {
    if (cardDragRef.current?.moved) skipCardClickRef.current = true;
    cardDragRef.current = null;
    panRef.current.isPanning = false;
    if (viewportRef.current) viewportRef.current.style.cursor = "grab";
  }, []);
  const onWheel = useCallback(e => {
    e.preventDefault();
    const rect = viewportRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top, delta = e.deltaY > 0 ? 0.9 : 1.11;
    setCam(c => { const ns = Math.max(0.25, Math.min(2.5, c.scale * delta)); const wx = (mx - c.x) / c.scale, wy = (my - c.y) / c.scale; return { scale: ns, x: mx - wx * ns, y: my - wy * ns }; });
  }, []);
  useEffect(() => { const el = viewportRef.current; if (!el) return; el.addEventListener("wheel", onWheel, { passive: false }); return () => el.removeEventListener("wheel", onWheel); }, [onWheel]);

  if (!schema || !tableNames.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height, background: C.canvas, borderRadius: 14, color: "rgba(255,255,255,.18)", fontSize: 13, flexDirection: "column", gap: 10 }}>
      <Database size={32} style={{ opacity: .2 }} />
      <span>Aucune table sélectionnée</span>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 0, position: "relative", background: C.canvas, borderRadius: fullscreen ? 0 : "0 0 14px 14px", overflow: "hidden" }}>
      <div style={{ flex: 1, background: C.canvas, borderRadius: fullscreen ? 0 : "0 0 14px 14px", overflow: "hidden", position: "relative", minHeight: height }}>
        <div ref={viewportRef} style={{ height, overflow: "hidden", cursor: "grab", position: "relative", userSelect: "none" }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <div style={{ position: "absolute", transformOrigin: "0 0", willChange: "transform", transform: `translate(${cam.x}px,${cam.y}px) scale(${cam.scale})`, width: canvasW, height: canvasH }}>
            <svg style={{ position: "absolute", inset: 0, width: canvasW, height: canvasH, pointerEvents: "auto", overflow: "visible", zIndex: 2 }}>
              <defs>
                <marker id="erd-arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="rgba(217,79,61,.55)" /></marker>
                <marker id="erd-arr-act" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#D94F3D" /></marker>
              </defs>
              {relationships.map((rel, i) => {
                const isActive = selectedRel === i || (hoveredTable && (hoveredTable === rel.from || hoveredTable === rel.to));
                const fp = cardPositions[rel.from], tp = cardPositions[rel.to]; if (!fp || !tp) return null;
                const fr = fp.x < tp.x, fh = cardHeight(rel.from), th = cardHeight(rel.to);
                const ax1 = fp.x + (fr ? CARD_W : 0), ay1 = fp.y + fh / 2, ax2 = tp.x + (fr ? 0 : CARD_W), ay2 = tp.y + th / 2;
                const cp = Math.abs(ax2 - ax1) * 0.42;
                const d = `M${ax1} ${ay1} C${ax1 + (fr ? cp : -cp)} ${ay1},${ax2 + (fr ? -cp : cp)} ${ay2},${ax2} ${ay2}`;
                return (
                  <g key={i} style={{ pointerEvents: "all", cursor: "pointer" }} onClick={() => setSelectedRel(selectedRel === i ? null : i)}>
                    <path d={d} fill="none" stroke="transparent" strokeWidth={10} />
                    {isActive && <path d={d} fill="none" stroke="rgba(217,79,61,.15)" strokeWidth={5} />}
                    <path d={d} fill="none" stroke={isActive ? "#D94F3D" : "rgba(217,79,61,.38)"} strokeWidth={isActive ? 1.8 : 1.1} markerEnd={`url(#${isActive ? "erd-arr-act" : "erd-arr"})`} />
                    {isActive && (() => { const mx = (ax1 + ax2) / 2, my = (ay1 + ay2) / 2 - 2, lw = rel.col.length * 5 + 16; return (<g><rect x={mx - lw / 2} y={my - 8} width={lw} height={15} rx={4} fill="rgba(10,10,14,.94)" stroke="rgba(217,79,61,.3)" strokeWidth={0.7} /><text x={mx} y={my + 4} textAnchor="middle" fill="#fca5a5" fontSize={8} fontFamily="'JetBrains Mono',monospace">{rel.col}</text></g>); })()}
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 1 }} />
            {tableNames.map((name, i) => {
              const pos = cardPositions[name], color = TABLE_PALETTE[i % TABLE_PALETTE.length], t = tables[name];
              const isHl = highlighted.has(name) || hoveredTable === name || (selectedRel !== null && (relationships[selectedRel]?.from === name || relationships[selectedRel]?.to === name)) || selectedTable === name;
              return (
                <div key={name} className={`erd-table-card${isHl ? " highlighted" : ""}`} style={{ left: pos.x, top: pos.y }}
                  onMouseDown={e => { e.stopPropagation(); cardDragRef.current = { name, startX: e.clientX, startY: e.clientY, posX: pos.x, posY: pos.y, moved: false }; }}
                  onMouseEnter={() => setHoveredTable(name)} onMouseLeave={() => setHoveredTable(null)}
                  onClick={() => { if (skipCardClickRef.current) { skipCardClickRef.current = false; return; } onSelectTable(selectedTable === name ? null : name); }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderBottom: `1px solid ${color.fill}40` }}>
                    <div style={{ width: 20, height: 20, borderRadius: 5, background: color.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Database size={10} color="#fff" /></div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#e4e4e7", fontFamily: "'JetBrains Mono',monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                    <div style={{ fontSize: 9, color: "#52525b", fontFamily: "'JetBrains Mono',monospace" }}>{t.rowCount > 1000 ? (t.rowCount / 1000).toFixed(0) + "k" : t.rowCount}</div>
                  </div>
                  {t.cols.slice(0, MAX_COLS).map(col => {
                    const ct = inferColType(col);
                    const isLinked = relationships.some(r => r.col === col && (r.from === name || r.to === name));
                    return (
                      <div key={col} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3.5px 10px", fontSize: 9, borderBottom: "1px solid rgba(255,255,255,.025)" }}>
                        {ct === "pk" ? <span style={{ fontSize: 9 }}>🔑</span> : isLinked ? <Link2 size={8} color="#5eead4" style={{ flexShrink: 0 }} /> : <span style={{ width: 7, height: 7, borderRadius: 2, border: "1px solid rgba(255,255,255,.1)", display: "inline-block", flexShrink: 0 }} />}
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", color: ct === "pk" ? "#fcd34d" : isLinked ? "#5eead4" : "#a1a1aa", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 9 }}>{col}</span>
                      </div>
                    );
                  })}
                  {t.cols.length > MAX_COLS && <div style={{ padding: "2px 10px 4px", fontSize: 8, color: "#52525b" }}>+{t.cols.length - MAX_COLS} more</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="erd-search-bar">
          <Search size={11} color="#52525b" />
          <input className="erd-search-input" placeholder="Rechercher table…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}><X size={10} /></button>}
        </div>
        <div className="erd-zoom-controls">
          <button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.min(2.5, c.scale * 1.2) }))}>+</button>
          <button className="erd-zoom-btn" onClick={fitView} style={{ fontSize: 10 }}>⊡</button>
          <button className="erd-zoom-btn" onClick={() => setCam(c => ({ ...c, scale: Math.max(0.25, c.scale * 0.85) }))}>−</button>
        </div>
        <button className="erd-sidebar-toggle" title={sidebarOpen ? "Masquer les relations" : "Afficher les relations"} onClick={() => setSidebarOpen(v => !v)}>
          {sidebarOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
        </button>
      </div>
      <div className={`erd-sidebar-wrap ${sidebarOpen ? "open" : "closed"}`}>
        <div style={{ width: 260, display: "flex", flexDirection: "column" }}>
          <div className="rel-sidebar" style={{ maxHeight: height, overflowY: "auto" }}>
            <div className="rel-sidebar-header">
              <span>Relations</span>
              <span className="rel-sidebar-count">{relationships.length}</span>
            </div>
            {relationships.length === 0 ? (
              <div style={{ padding: 14, fontSize: 11, color: "#71717a" }}>Aucune relation détectée.</div>
            ) : relationships.map((rel, i) => (
              <div key={`${rel.from}-${rel.to}-${i}`} className={`rel-sidebar-item${selectedRel === i ? " active" : ""}`} onClick={() => setSelectedRel(selectedRel === i ? null : i)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".07em", color: "#71717a" }}>{rel.type || "N:1"}</span>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.red, fontWeight: 700 }}>{rel.col}</span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5 }}>
                  <div style={{ color: "#5eead4" }}>{rel.from}</div>
                  <div style={{ color: "#71717a", marginTop: 1 }}>→ <span style={{ color: "#fca5a5" }}>{rel.to}</span></div>
                </div>
              </div>
            ))}
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

  const fitView = useCallback(() => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !s.nodes.length) return;
    const xs = s.nodes.map(n => n.x), ys = s.nodes.map(n => n.y);
    const minX = Math.min(...xs) - 130, maxX = Math.max(...xs) + 130;
    const minY = Math.min(...ys) - 130, maxY = Math.max(...ys) + 130;
    const scale = Math.min((canvas.clientWidth * .85) / Math.max(1, maxX - minX), (canvas.clientHeight * .8) / Math.max(1, maxY - minY), 1.6);
    s.cam.scale = scale;
    s.cam.x = canvas.clientWidth / 2 - ((minX + maxX) / 2) * scale;
    s.cam.y = canvas.clientHeight / 2 - ((minY + maxY) / 2) * scale;
  }, []);

  useEffect(() => { stateRef.current.physicsOn = physicsOn; }, [physicsOn]);
  useEffect(() => { stateRef.current.showLabels = showLabels; }, [showLabels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tables.length) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const cx = rect.width / 2, cy = Math.max(480, rect.height - 52) / 2;
    const r = Math.min(rect.width, Math.max(480, rect.height - 52)) * .38;
    const s = stateRef.current;
    s.nodes = tables.map((table, i) => {
      const angle = tables.length <= 1 ? -Math.PI / 2 : (i / tables.length) * Math.PI * 2 - Math.PI / 2;
      return { id: table.name, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), vx: 0, vy: 0, fx: 0, fy: 0, headers: table.cols || [], rowCount: table.rowCount || 0, color: TABLE_PALETTE[i % TABLE_PALETTE.length], r: 58 };
    });
    s.edges = rels.map(rel => ({ from: rel.from, to: rel.to, column: rel.col, type: rel.type || "N:1", overlap: rel.overlap || Math.min(schema.tables.find(t => t.name === rel.from)?.rowCount || 0, schema.tables.find(t => t.name === rel.to)?.rowCount || 0), fromN: s.nodes.find(n => n.id === rel.from), toN: s.nodes.find(n => n.id === rel.to) })).filter(e => e.fromN && e.toN);
    s.selected = selectedTable ? s.nodes.find(n => n.id === selectedTable) || null : null;
    setSelectedNode(s.selected);
    setPanelOpen(!!s.selected);
    fitView();
  }, [tables, rels, schema, selectedTable, fitView]);

  useEffect(() => {
    const canvas = canvasRef.current, minimap = minimapRef.current;
    if (!canvas || !minimap) return;
    const ctx = canvas.getContext("2d"), mctx = minimap.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const s = stateRef.current;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      s.W = rect.width;
      s.H = Math.max(480, rect.height - 52);
      canvas.width = s.W * dpr; canvas.height = s.H * dpr;
      canvas.style.width = s.W + "px"; canvas.style.height = s.H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      minimap.width = 96 * dpr; minimap.height = 66 * dpr;
      minimap.style.width = "96px"; minimap.style.height = "66px";
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const roundRect = (x, y, w, h, radius) => {
      ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.lineTo(x + w - radius, y); ctx.quadraticCurveTo(x + w, y, x + w, y + radius); ctx.lineTo(x + w, y + h - radius); ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h); ctx.lineTo(x + radius, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - radius); ctx.lineTo(x, y + radius); ctx.quadraticCurveTo(x, y, x + radius, y); ctx.closePath();
    };
    const applyPhysics = () => {
      if (!s.physicsOn) return;
      const repulse = 22000, springK = .022, damping = .88, centerK = .002;
      const totalKE = s.nodes.reduce((sum, n) => sum + n.vx * n.vx + n.vy * n.vy, 0);
      if (totalKE < .08 && s.tick > 120) { s.physicsOn = false; return; }
      s.nodes.forEach((n, i) => {
        let fx = 0, fy = 0;
        s.nodes.forEach((o, j) => {
          if (i === j) return;
          const dx = n.x - o.x, dy = n.y - o.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = d < n.r + o.r + 120 ? repulse * 2 / (d * d) : repulse / (d * d);
          fx += dx / d * f; fy += dy / d * f;
        });
        n.fx = fx + (s.W / 2 - n.x) * centerK; n.fy = fy + (s.H / 2 - n.y) * centerK;
      });
      s.edges.forEach(e => {
        const dx = e.toN.x - e.fromN.x, dy = e.toN.y - e.fromN.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 300) * springK, efx = dx / d * f, efy = dy / d * f;
        e.fromN.fx += efx; e.fromN.fy += efy; e.toN.fx -= efx; e.toN.fy -= efy;
      });
      s.nodes.forEach(n => {
        if (n === s.drag) return;
        n.vx = Math.max(-6, Math.min(6, (n.vx + n.fx) * damping)); n.vy = Math.max(-6, Math.min(6, (n.vy + n.fy) * damping));
        n.x += n.vx; n.y += n.vy;
      });
    };
    const draw = () => {
      ctx.clearRect(0, 0, s.W, s.H); ctx.save(); ctx.translate(s.cam.x, s.cam.y); ctx.scale(s.cam.scale, s.cam.scale);
      const gs = 56, ox = -s.cam.x / s.cam.scale, oy = -s.cam.y / s.cam.scale, vw = s.W / s.cam.scale, vh = s.H / s.cam.scale;
      ctx.fillStyle = "rgba(255,255,255,.06)";
      for (let gx = Math.floor(ox / gs) * gs; gx < ox + vw + gs; gx += gs) for (let gy = Math.floor(oy / gs) * gs; gy < oy + vh + gs; gy += gs) { ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill(); }
      s.edges.forEach(e => {
        const f = e.fromN, t = e.toN, dx = t.x - f.x, dy = t.y - f.y, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = dx / d, ny = dy / d;
        const x1 = f.x + nx * f.r, y1 = f.y + ny * f.r, x2 = t.x - nx * t.r - nx * 8, y2 = t.y - ny * t.r - ny * 8;
        const active = s.selected && (s.selected.id === f.id || s.selected.id === t.id);
        if (active) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = f.color.fill + "44"; ctx.lineWidth = 6; ctx.stroke(); }
        ctx.setLineDash(e.type === "N:M" ? [6, 4] : []); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = active ? f.color.fill : "rgba(217,79,61,.34)"; ctx.lineWidth = active ? 1.8 : 1; ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - nx * 9 - ny * 4.5, y2 - ny * 9 + nx * 4.5); ctx.lineTo(x2 - nx * 9 + ny * 4.5, y2 - ny * 9 - nx * 4.5); ctx.closePath(); ctx.fillStyle = active ? f.color.fill : "rgba(217,79,61,.50)"; ctx.fill();
        { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, off = active ? 0 : 8, lx = mx - ny * off, ly = my + nx * off; ctx.font = `${active ? 600 : 500} ${active ? 10 : 9}px 'JetBrains Mono',monospace`; const tw = ctx.measureText(e.column).width + 16; ctx.fillStyle = active ? "rgba(10,10,14,.92)" : "rgba(10,10,14,.72)"; roundRect(lx - tw / 2, ly - 10, tw, 18, 5); ctx.fill(); ctx.strokeStyle = active ? f.color.fill + "66" : "rgba(217,79,61,.22)"; ctx.lineWidth = .8; ctx.stroke(); ctx.fillStyle = active ? f.color.light : "rgba(252,165,165,.72)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(e.column, lx, ly); }
      });
      s.nodes.forEach(n => {
        const active = s.selected === n, hover = s.hover === n; ctx.save(); ctx.translate(n.x, n.y); if (active || hover) { const g = ctx.createRadialGradient(0, 0, n.r * .6, 0, 0, n.r * 2.2); g.addColorStop(0, n.color.fill + (active ? "50" : "30")); g.addColorStop(1, "transparent"); ctx.beginPath(); ctx.arc(0, 0, n.r * 2.2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); }
        const phase = (s.tick * .018 + s.nodes.indexOf(n) * 1.1) % (Math.PI * 2); ctx.beginPath(); ctx.arc(0, 0, n.r + 6 + Math.sin(phase) * 3, 0, Math.PI * 2); ctx.strokeStyle = n.color.fill; ctx.lineWidth = .7; ctx.globalAlpha = .18 + Math.sin(phase) * .08; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(0, 0, n.r, 0, Math.PI * 2); const grad = ctx.createRadialGradient(-n.r * .25, -n.r * .25, 0, 0, 0, n.r); grad.addColorStop(0, n.color.fill + "2a"); grad.addColorStop(1, "#0a0a12"); ctx.fillStyle = grad; ctx.fill(); ctx.strokeStyle = n.color.fill; ctx.lineWidth = active ? 2 : 1.5; ctx.globalAlpha = active ? 1 : .75; ctx.stroke(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = n.color.fill + "cc"; ctx.fill();
        ctx.font = "600 11px 'DM Sans',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = n.color.light; const words = n.id.replace(/_/g, " ").split(" "); if (words.length > 1) { ctx.fillText(words[0], 0, -12); ctx.fillText(words.slice(1).join(" "), 0, 4); } else ctx.fillText(n.id, 0, -7);
        ctx.font = "500 9px 'JetBrains Mono',monospace"; ctx.fillStyle = "rgba(255,255,255,.48)"; ctx.fillText(`${n.rowCount} lignes`, 0, 18);
        if (s.showLabels) { const linked = new Set(s.edges.filter(e => e.from === n.id || e.to === n.id).map(e => e.column)); const labelFont = Math.max(10, Math.min(15, 10 + s.cam.scale * 2.5)); const maxChars = Math.max(15, Math.min(26, Math.round(13 + s.cam.scale * 5))); n.headers.slice(0, 7).forEach((col, ci, cols) => { const a = -Math.PI * .7 + ci * ((Math.PI * 1.4) / Math.max(cols.length - 1, 1)), cr = n.r + 58, x = Math.cos(a) * cr, y = Math.sin(a) * cr, isLink = linked.has(col); ctx.beginPath(); ctx.moveTo(Math.cos(a) * n.r, Math.sin(a) * n.r); ctx.lineTo(x, y); ctx.strokeStyle = isLink ? "#34d399" : "rgba(255,255,255,.12)"; ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, isLink ? 4 : 3, 0, Math.PI * 2); ctx.fillStyle = isLink ? "#34d399" : "rgba(255,255,255,.2)"; ctx.fill(); ctx.font = `500 ${labelFont}px 'JetBrains Mono',monospace`; ctx.fillStyle = isLink ? "#6ee7b7" : "rgba(255,255,255,.48)"; ctx.textAlign = Math.cos(a) > .1 ? "left" : Math.cos(a) < -.1 ? "right" : "center"; ctx.fillText(col.length > maxChars ? col.slice(0, maxChars) + "..." : col, x + Math.cos(a) * 8, y + Math.sin(a) * 8); }); }
        ctx.restore();
      });
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

/* ─── WIZARD STEPS (unchanged from original, kept full) ──────── */
function ExplorationStep({ data, setData, schema, selectedTable, setSelectedTable }) {
  const [graphView, setGraphView] = useState("erd");
  const [graphFullscreen, setGraphFullscreen] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("integration-graph-fullscreen", graphFullscreen);
    return () => document.body.classList.remove("integration-graph-fullscreen");
  }, [graphFullscreen]);
  const tableInfo = schema?.tables?.find(t => t.name === selectedTable);
  const graphHeight = graphFullscreen ? Math.max(window.innerHeight - 43, 520) : 460;
  const graphShellStyle = graphFullscreen
    ? { position: "fixed", inset: 0, zIndex: 10020, borderRadius: 0, overflow: "hidden", background: C.canvas, boxShadow: "none" }
    : { borderRadius: 14, overflow: "hidden" };
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
          {graphView === "erd" && (
            <div style={graphShellStyle}>
              <div className="schema-toolbar">
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#D94F3D,#e86b59)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Table2 size={11} color="#fff" /></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#e4e4e7" }}>Schéma ERD</div>
                <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: "rgba(217,79,61,.18)", color: "#fca5a5", border: "1px solid rgba(217,79,61,.3)" }}>{schema?.rels?.length || 0} relations</div>
                <button onClick={() => setGraphFullscreen(v => !v)} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", color: "#d4d4d8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title={graphFullscreen ? "Réduire" : "Plein écran"}>
                  {graphFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
              <SchemaERD schema={schema} tableRoles={data.tableRoles || {}} onSelectTable={setSelectedTable} selectedTable={selectedTable} height={graphHeight} fullscreen={graphFullscreen} />
            </div>
          )}
          {graphView === "force" && (
            <div style={graphShellStyle}>
              <div className="schema-toolbar">
                <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Network size={11} color="#fff" /></div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#e4e4e7" }}>Force Graph</div>
                <div style={{ marginLeft: "auto", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", background: "rgba(59,130,246,.18)", color: "#93c5fd", border: "1px solid rgba(59,130,246,.3)" }}>{schema?.tables?.length || 0} tables</div>
                <button onClick={() => setGraphFullscreen(v => !v)} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.06)", color: "#d4d4d8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title={graphFullscreen ? "Réduire" : "Plein écran"}>
                  {graphFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </div>
              <SchemaForceGraph schema={schema} onSelectTable={setSelectedTable} selectedTable={selectedTable} height={graphHeight} fullscreen={graphFullscreen} />
            </div>
          )}
          {tableInfo && (
            <div className="fade-in" style={{ background: "#fff", border: `1px solid ${C.g200}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.g900, fontFamily: "'JetBrains Mono',monospace" }}>{tableInfo.name}</span>
                <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: C.g100, color: C.g500 }}>{tableInfo.rowCount.toLocaleString()} lignes</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {tableInfo.cols.map(col => (
                  <span key={col} style={{ padding: "2px 8px", borderRadius: 5, background: C.g100, border: `1px solid ${C.g200}`, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g700 }}>{col}</span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: "3rem", textAlign: "center", color: C.g400 }}>
          <Database size={36} style={{ display: "block", margin: "0 auto 12px", opacity: .35 }} />
          <p style={{ fontSize: 13 }}>Connexion requise (étape 2)</p>
        </div>
      )}
    </div>
  );
}

function IdentityStep({ data, setData }) {
  const authFields = AUTH_FIELDS[data.authType] || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.red}>Définissez l'identité du connecteur ERP et son mode d'authentification.</InfoBox>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1/-1" }}>
          <label className="label">Nom du connecteur</label>
          <input value={data.name || ""} onChange={e => setData({ ...data, name: e.target.value })} className="input" placeholder="ex: SAP S/4HANA Production" />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={data.connectorType || "ERP"} onChange={e => setData({ ...data, connectorType: e.target.value })} className="select">
            <option value="ERP">ERP</option><option value="DATA_SOURCE">Source de données</option><option value="ACCOUNTING">Comptabilité</option>
          </select>
        </div>
        <div>
          <label className="label">Authentification</label>
          <select value={data.authType || "NONE"} onChange={e => setData({ ...data, authType: e.target.value })} className="select">
            <option value="NONE">Aucune</option><option value="BASIC">Basic Auth</option><option value="API_KEY">API Key</option><option value="OAUTH2">OAuth 2.0</option><option value="JWT_SIGNED">JWT Signé</option><option value="SAML">SAML 2.0</option>
          </select>
        </div>
        <div><label className="label">Logo (2 lettres)</label><input value={data.logo || ""} maxLength={2} onChange={e => setData({ ...data, logo: e.target.value })} className="input" placeholder="SG" /></div>
        <div>
          <label className="label">Couleur principale</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="color" value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} style={{ width: 40, height: 40, padding: 2, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer" }} />
            <input value={data.color || "#D94F3D"} onChange={e => setData({ ...data, color: e.target.value })} className="input" style={{ flex: 1 }} />
          </div>
        </div>
        <div style={{ gridColumn: "1/-1" }}><label className="label">Description</label><input value={data.description || ""} onChange={e => setData({ ...data, description: e.target.value })} className="input" placeholder="Connecteur ERP…" /></div>
      </div>
      {authFields.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.g700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Settings2 size={13} color={C.red} /> Détails d'authentification ({data.authType})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {authFields.map(f => (
              <div key={f.key} style={{ gridColumn: f.type === "textarea" ? "1/-1" : "auto" }}>
                <label className="label">{f.label}</label>
                {f.type === "textarea" ? <textarea value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" rows={4} style={{ resize: "vertical", height: 90 }} /> :
                  f.type === "select" ? <select value={data[f.key] || (f.options?.[0] || "")} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="select">{f.options?.map(o => <option key={o} value={o}>{o}</option>)}</select> :
                    <input type={f.type} value={data[f.key] || ""} onChange={e => setData({ ...data, [f.key]: e.target.value })} className="input" placeholder={f.placeholder || ""} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionStep({ data, setData, schema }) {
  const [testState, setTestState] = useState(null);
  const connTypes = [
    { id: "jdbc", label: "JDBC", Icon: Database, desc: "Base SQL directe" },
    { id: "api", label: "API REST", Icon: Network, desc: "Endpoint HTTP" },
    { id: "csv", label: "Fichier CSV", Icon: Layers, desc: "Import fichier" }
  ];
  const allTables = schema?.tables || [];
  const selectedTables = data.selectedTables || [];
  const toggleTable = name => setData({ ...data, selectedTables: selectedTables.includes(name) ? selectedTables.filter(t => t !== name) : [...selectedTables, name] });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="label" style={{ marginBottom: 8 }}>Type de connexion</label>
        <div style={{ display: "flex", gap: 8 }}>
          {connTypes.map(t => (
            <div key={t.id} onClick={() => setData({ ...data, connectionType: t.id })}
              style={{ flex: 1, padding: "12px 10px", borderRadius: 12, cursor: "pointer", textAlign: "center", background: data.connectionType === t.id ? "rgba(217,79,61,.08)" : "rgba(248,247,245,.8)", border: `1.5px solid ${data.connectionType === t.id ? C.red : C.g200}` }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><t.Icon size={22} color={data.connectionType === t.id ? C.red : C.g400} /></div>
              <div style={{ fontSize: 12, fontWeight: 700, color: data.connectionType === t.id ? C.red : C.g700 }}>{t.label}</div>
              <div style={{ fontSize: 10, color: C.g400, marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {data.connectionType === "jdbc" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div><label className="label">URL JDBC</label><input value={data.jdbcUrl || ""} onChange={e => setData({ ...data, jdbcUrl: e.target.value })} className="input mono" style={{ fontSize: 11 }} placeholder="jdbc:postgresql://host:5432/erp_db" /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}><label className="label">Utilisateur</label><input value={data.jdbcUsername || ""} onChange={e => setData({ ...data, jdbcUsername: e.target.value })} className="input" /></div>
            <div style={{ flex: 1 }}><label className="label">Mot de passe</label><input type="password" value={data.jdbcPassword || ""} onChange={e => setData({ ...data, jdbcPassword: e.target.value })} className="input" /></div>
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => { setTestState("testing"); setTimeout(() => setTestState("ok"), 1200); }}>
          {testState === "testing" ? <RefreshCw size={12} className="spin" /> : <Zap size={12} />} Tester la connexion
        </button>
        {testState === "ok" && <span style={{ fontSize: 11, color: C.success, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={13} /> Connexion réussie</span>}
      </div>
      {allTables.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div><label className="label" style={{ marginBottom: 2 }}>Tables disponibles</label><div style={{ fontSize: 10, color: C.g400 }}>{allTables.length} tables détectées</div></div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: allTables.map(t => t.name) })}>Tout</button>
              <button className="btn btn-ghost" style={{ fontSize: 10, padding: "4px 10px" }} onClick={() => setData({ ...data, selectedTables: [] })}>Effacer</button>
            </div>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", maxHeight: 260, overflowY: "auto" }} className="scroll">
            {allTables.map((t, i) => {
              const sel = selectedTables.includes(t.name); return (
                <div key={t.name} onClick={() => toggleTable(t.name)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: sel ? "rgba(217,79,61,.04)" : i % 2 === 0 ? "rgba(248,247,245,.5)" : "#fff", borderBottom: i < allTables.length - 1 ? "1px solid rgba(0,0,0,.04)" : "none" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sel ? C.red : C.g300}`, background: sel ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={11} color="#fff" />}</div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.red : C.g700, flex: 1 }}>{t.name}</span>
                  <span style={{ fontSize: 10, color: C.g400 }}>{t.cols.length} cols · {t.rowCount.toLocaleString()} lignes</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {allTables.length === 0 && data.connectionType === "jdbc" && (
        <div style={{ padding: "20px", textAlign: "center", background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
          <Database size={28} style={{ display: "block", margin: "0 auto 8px", opacity: .3 }} />
          <div style={{ fontSize: 12, color: C.g400 }}>Saisissez une URL JDBC et testez la connexion pour découvrir les tables</div>
          <button className="btn btn-ghost" style={{ fontSize: 11, marginTop: 12 }} onClick={() => {
            // Simulate table discovery for any JDBC URL
            setTestState("testing");
            setTimeout(() => setTestState("ok"), 1000);
          }}><Zap size={12} /> Découvrir les tables</button>
        </div>
      )}
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
      {presets.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Modèles prédéfinis</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {presets.map(preset => (
              <button key={preset.id} onClick={() => applyPreset(preset)}
                style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", background: activePreset === preset.id ? "rgba(217,79,61,.08)" : "#fff", border: `1.5px solid ${activePreset === preset.id ? C.red : C.g200}`, minWidth: 160 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: activePreset === preset.id ? C.red : C.g800 }}>{preset.name}</div>
                <div style={{ fontSize: 10, color: C.g400, marginTop: 2, fontFamily: "'JetBrains Mono',monospace" }}>{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="budget-section">
        <div className="budget-section-hdr">
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(34,197,94,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={12} color={C.success} /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Formule de calcul</div></div>
        </div>
        <div className="budget-section-body">
          <div style={{ marginBottom: 10 }}>
            <div className="formula-drop" style={{ borderColor: formulaTokens.length > 0 ? "rgba(34,197,94,.3)" : "#e5e7eb" }}>
              {formulaTokens.length === 0 ? <span style={{ fontSize: 11, color: C.g400 }}>Sélectionnez des colonnes et opérateurs…</span> :
                formulaTokens.map((tok, i) => (
                  <div key={i} className={`formula-node ${tok.type === "op" ? "op" : tok.type === "agg" ? "agg" : "col"}`} onClick={() => removeToken(i)} title="Clic pour supprimer">
                    {tok.type === "op" ? tok.op : tok.type === "agg" ? `${tok.fn}(${tok.label || tok.col})` : tok.label || tok.col}
                    <X size={10} />
                  </div>
                ))
              }
            </div>
            {formulaTokens.length > 0 && <button onClick={clearFormula} style={{ fontSize: 10, color: C.g400, background: "none", border: "none", cursor: "pointer", marginTop: 4 }}>Effacer</button>}
          </div>
          {allBudgetCols.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Colonnes disponibles</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {allBudgetCols.map(({ table, col }) => (
                  <button key={`${table}.${col}`} className="col-chip" onClick={() => addToken({ type: "agg", fn: aggregation, table, col, label: `${table}.${col}` })}>
                    <span style={{ opacity: .6 }}>{table}.</span>{col}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Opérateurs</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["＋", "−", "×", "÷", "(", ")"].map(op => <button key={op} className="formula-op-badge" onClick={() => addToken({ type: "op", op })}>{op}</button>)}
              <div style={{ width: 1, background: C.g200, margin: "0 4px" }} />
              {["SUM", "AVG", "MAX", "COUNT"].map(fn => (
                <button key={fn} className="formula-node agg" style={{ cursor: "pointer", fontSize: 11, padding: "3px 9px" }} onClick={() => setAggregation(fn)}>
                  <span style={{ fontWeight: aggregation === fn ? 800 : 500 }}>{fn}</span>
                  {aggregation === fn && <CheckCircle2 size={9} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className="btn btn-primary" onClick={generatePreview} disabled={formulaTokens.length === 0 && !activePreset}><FlaskConical size={13} /> Tester</button>
        {previewResult === "computing" && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.g500 }}><RefreshCw size={12} className="spin" /> Calcul…</div>}
        {previewResult && previewResult !== "computing" && (
          <div style={{ padding: "8px 14px", borderRadius: 10, background: C.successLight, border: `1px solid ${C.successBorder}` }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#15803d" }}>{parseFloat(previewResult.value).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {previewResult.currency}</div>
          </div>
        )}
      </div>
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
        {allTables.length === 0 ? <div style={{ fontSize: 12, color: C.g400, textAlign: "center", padding: "1rem" }}>Sélectionnez des tables à l'étape Connexion</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {allTables.map(t => {
              const sel = budgetSourceTables.includes(t.name); return (
                <div key={t.name} onClick={() => toggleSourceTable(t.name)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? "rgba(34,197,94,.06)" : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? "rgba(34,197,94,.35)" : "transparent"}` }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? C.success : C.g300}`, background: sel ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: sel ? C.g800 : C.g600 }}>{t.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </SectionAccordion>
      <BudgetFormulaBuilder data={data} setData={setData} schema={schema} connId={connId} />
      <div className="budget-section">
        <div className="budget-section-hdr" style={{ background: "rgba(245,158,11,.04)" }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(245,158,11,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><AlertCircle size={12} color={C.warning} /></div>
          <div><div style={{ fontSize: 12, fontWeight: 700, color: C.g800 }}>Seuils d'alerte</div></div>
        </div>
        <div className="budget-section-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[{ label: "Seuil jaune (%)", key: "alertYellow", default: "75", color: C.warning }, { label: "Seuil rouge (%)", key: "alertRed", default: "90", color: "#ef4444" }].map(threshold => (
            <div key={threshold.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: threshold.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.g700, flex: 1 }}>{threshold.label}</span>
              <input type="number" min="0" max="100" value={data[threshold.key] || threshold.default} onChange={e => setData({ ...data, [threshold.key]: e.target.value })} className="input" style={{ width: 72, textAlign: "center" }} />
              <span style={{ fontSize: 11, color: C.g400 }}>%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
  const removeCustomPipeline = id => {
    const next = customPipelines.filter(cp => cp.id !== id);
    const nextPipelines = { ...pipelines }; delete nextPipelines[id];
    setData({ ...data, customPipelines: next, pipelines: nextPipelines }); setActiveTab("facture");
  };
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
  const addUserField = () => {
    const id = `field_${Date.now()}`;
    setPl({
      ...pl,
      userFields: [...userFields, { id, key: "", label: "", type: "text", required: false }],
    });
  };
  const updateUserField = (id, field, value) => {
    const nextFields = userFields.map(f => f.id === id ? { ...f, [field]: value } : f);
    setPl({ ...pl, userFields: nextFields });
  };
  const removeUserField = (id) => {
    const field = userFields.find(f => f.id === id);
    const nextMappings = { ...(pl.fieldMappings || {}) };
    if (field?.key) delete nextMappings[field.key];
    setPl({ ...pl, userFields: userFields.filter(f => f.id !== id), fieldMappings: nextMappings });
  };
  const setUserFieldMapping = (field, value) => {
    if (!field.key) return;
    setPl({ ...pl, fieldMappings: { ...(pl.fieldMappings || {}), [field.key]: value } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>Configurez les pipelines métier — tables, jointures, mapping.</InfoBox>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        {["facture", "commande"].map(key => {
          const def = PIPELINE_DEFS[key], Icon = def.Icon;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${activeTab === key ? def.color : "transparent"}`, background: activeTab === key ? `${def.color}12` : "transparent", color: activeTab === key ? def.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
              <Icon size={13} /> {def.label}
            </button>
          );
        })}
        {customPipelines.map(cp => (
          <div key={cp.id} style={{ display: "flex" }}>
            <button onClick={() => setActiveTab(cp.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderRight: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g500, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
              <Settings2 size={13} /> {cp.label}
            </button>
            <button onClick={() => removeCustomPipeline(cp.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "7px 7px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${activeTab === cp.id ? cp.color : "transparent"}`, borderLeft: "none", background: activeTab === cp.id ? `${cp.color}12` : "transparent", color: activeTab === cp.id ? cp.color : C.g400, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <X size={11} />
            </button>
          </div>
        ))}
        {!showAddPipeline ? (
          <button onClick={() => setShowAddPipeline(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 10, border: `1.5px dashed ${C.g300}`, background: "transparent", color: C.g400, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
            <Plus size={12} /> Nouveau pipeline
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "4px 8px", borderRadius: 10, border: `1.5px solid ${C.g200}`, background: "#fff" }}>
            <input value={newPipelineName} onChange={e => setNewPipelineName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustomPipeline()} autoFocus className="input" style={{ width: 160, fontSize: 11, padding: "4px 8px", height: 30 }} placeholder="Nom du pipeline…" />
            <button className="btn btn-primary" style={{ fontSize: 10, padding: "4px 10px", height: 30 }} onClick={addCustomPipeline} disabled={!newPipelineName.trim()}>Créer</button>
            <button onClick={() => setShowAddPipeline(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400 }}><X size={13} /></button>
          </div>
        )}
      </div>
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
                activeTables.map(t => {
                  const sel = pl.tables.includes(t.name); return (
                    <div key={t.name} onClick={() => toggleTable(t.name)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, cursor: "pointer", background: sel ? `${plColor}08` : "rgba(248,247,245,.6)", border: `1.5px solid ${sel ? plColor + "40" : "transparent"}` }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sel ? plColor : C.g300}`, background: sel ? plColor : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <CheckCircle2 size={10} color="#fff" />}</div>
                      <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>{t.name}</span>
                    </div>
                  );
                })}
            </div>
          </SectionAccordion>
          {pl.tables.length > 1 && (
            <SectionAccordion icon={<Link2 size={13} color={C.warning} />} title="Jointures (JOIN)">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Visual SQL chain */}
                <div style={{ padding: "10px 12px", background: "rgba(13,13,18,.04)", borderRadius: 10, border: "1px solid rgba(0,0,0,.08)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", overflowX: "auto" }}>
                  <span className="join-table-badge" style={{ background: `${plColor}12`, color: plColor, border: `1px solid ${plColor}30` }}>
                    <Database size={10} color={plColor} /> {pl.tables[0]}
                  </span>
                  {pl.tables.slice(1).map((tname, idx) => {
                    const join = (pl.joins || [])[idx] || { type: "INNER", table: tname, on: "" };
                    return (
                      <span key={tname} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span className="join-keyword">{join.type} JOIN</span>
                        <span className="join-table-badge" style={{ background: "rgba(59,130,246,.1)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,.25)" }}>
                          <Database size={10} color="#1d4ed8" /> {tname}
                        </span>
                        {join.on && <><span className="join-on-keyword">ON</span><span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.g600, background: C.g100, padding: "2px 7px", borderRadius: 5 }}>{join.on}</span></>}
                      </span>
                    );
                  })}
                </div>
                {/* Join config rows */}
                {pl.tables.slice(1).map((tname, idx) => {
                  const joinIdx = idx;
                  const join = (pl.joins || [])[joinIdx] || { type: "INNER", table: tname, on: "" };
                  const updateJoin = (field, val) => {
                    const joins = [...(pl.joins || [])];
                    while (joins.length <= joinIdx) joins.push({ type: "INNER", table: "", on: "" });
                    joins[joinIdx] = { ...joins[joinIdx], [field]: val };
                    setPl({ ...pl, joins });
                  };
                  return (
                    <div key={tname} className="join-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "0 0 auto" }}>
                        <span className="join-table-badge" style={{ background: `${plColor}12`, color: plColor, border: `1px solid ${plColor}30`, fontSize: 10 }}>
                          <Database size={9} color={plColor} /> {pl.tables[0]}
                        </span>
                        <span style={{ color: C.g300, fontSize: 11 }}>⟶</span>
                      </div>
                      <select value={join.type} onChange={e => updateJoin("type", e.target.value)} className="select" style={{ width: 86, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "5px 8px", height: 32, fontWeight: 700 }}>
                        <option value="INNER">INNER</option>
                        <option value="LEFT">LEFT</option>
                        <option value="RIGHT">RIGHT</option>
                        <option value="FULL">FULL</option>
                      </select>
                      <span className="join-keyword" style={{ fontSize: 10 }}>JOIN</span>
                      <span className="join-table-badge" style={{ background: "rgba(59,130,246,.1)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,.25)", fontSize: 10, flexShrink: 0 }}>
                        <Database size={9} color="#1d4ed8" /> {tname}
                      </span>
                      <span className="join-on-keyword">ON</span>
                      <input value={join.on} onChange={e => updateJoin("on", e.target.value)} className="input" style={{ flex: 1, minWidth: 120, fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "5px 8px", height: 32 }} placeholder={`${pl.tables[0]}.id = ${tname}.${pl.tables[0].toLowerCase()}_id`} />
                    </div>
                  );
                })}
              </div>
            </SectionAccordion>
          )}
          <SectionAccordion icon={<GitBranch size={13} color={plColor} />} title="Mapping des champs">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {fixedFields.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fixedFields.map(f => (
                  <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: "rgba(248,247,245,.8)", borderRadius: 9, border: "1px solid #e5e7eb" }}>
                    <div style={{ minWidth: 160, flexShrink: 0 }}><div style={{ fontSize: 11, fontWeight: 600, color: C.g800 }}>{f.label}</div>{f.required && <div style={{ fontSize: 9, color: C.red }}>Requis</div>}</div>
                    <span style={{ color: C.g300 }}>→</span>
                    <select value={(pl.fieldMappings || {})[f.key] || ""} onChange={e => setPl({ ...pl, fieldMappings: { ...(pl.fieldMappings || {}), [f.key]: e.target.value } })} className="select" style={{ flex: 1, fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>
                      <option value="">-- Sélectionner colonne --</option>
                      {plCols.map(c => <option key={c.full} value={c.full}>{c.full}</option>)}
                    </select>
                    {(pl.fieldMappings || {})[f.key] && <CheckCircle2 size={14} color={C.success} />}
                  </div>
                ))}
              </div>
              )}
              {(fixedFields.length === 0 || builtinDef?.allowExtraFields) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.g800 }}>Champs personnalisés</div>
                      <div style={{ fontSize: 10, color: C.g400 }}>Définissez les champs du pipeline puis associez-les aux colonnes sources.</div>
                    </div>
                    <button type="button" onClick={addUserField} className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 10px", borderColor: `${plColor}30`, color: plColor, background: `${plColor}0D` }}>
                      <Plus size={12} /> Ajouter un champ
                    </button>
                  </div>
                  {userFields.length === 0 ? (
                    <div style={{ fontSize: 11, color: C.g400, padding: "10px 12px", background: "rgba(248,247,245,.75)", borderRadius: 9, border: "1px dashed #d1d5db" }}>
                      Aucun champ personnalisé. Ajoutez un champ pour configurer un nouveau pipeline métier.
                    </div>
                  ) : userFields.map((field) => (
                    <div key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 105px 86px 1.25fr 28px", gap: 8, alignItems: "center", padding: "8px 10px", background: "rgba(248,247,245,.8)", borderRadius: 10, border: `1px solid ${plColor}22` }}>
                      <input value={field.key} onChange={e => updateUserField(field.id, "key", e.target.value.trim())} className="input mono" style={{ fontSize: 10, height: 34 }} placeholder="cle_champ" />
                      <input value={field.label} onChange={e => updateUserField(field.id, "label", e.target.value)} className="input" style={{ fontSize: 11, height: 34 }} placeholder="Libellé utilisateur" />
                      <select value={field.type || "text"} onChange={e => updateUserField(field.id, "type", e.target.value)} className="select" style={{ fontSize: 10, height: 34 }}>
                        <option value="text">Texte</option>
                        <option value="number">Nombre</option>
                        <option value="date">Date</option>
                        <option value="status">Statut</option>
                        <option value="reference">Référence</option>
                      </select>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.g600, fontWeight: 700 }}>
                        <input type="checkbox" checked={!!field.required} onChange={e => updateUserField(field.id, "required", e.target.checked)} /> Requis
                      </label>
                      <select value={(pl.fieldMappings || {})[field.key] || ""} onChange={e => setUserFieldMapping(field, e.target.value)} disabled={!field.key} className="select" style={{ fontSize: 10, height: 34, fontFamily: "'JetBrains Mono',monospace" }}>
                        <option value="">-- Colonne source --</option>
                        {plCols.map(c => <option key={c.full} value={c.full}>{c.full}</option>)}
                      </select>
                      <button type="button" onClick={() => removeUserField(field.id)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(239,68,68,.18)", background: "rgba(239,68,68,.07)", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionAccordion>
        </>
      )}
    </div>
  );
}

function TenantsStep({ data, setData }) {
  useStore();
  const tenants = data.tenants || [];
  const customPipelines = data.customPipelines || [];
  const allPipelineKeys = { facture: PIPELINE_DEFS.facture, commande: PIPELINE_DEFS.commande, ...Object.fromEntries(customPipelines.map(cp => [cp.id, { label: cp.label, color: cp.color, Icon: Settings2 }])) };
  const [newTenantId, setNewTenantId] = useState("");
  const [newTenantLabel, setNewTenantLabel] = useState("");
  const [expandedTenant, setExpandedTenant] = useState(null);
  const [searchMap, setSearchMap] = useState({});

  const platformTenants = useMemo(() => { try { return visibleTenants() || []; } catch (e) { return []; } }, []);

  const addTenant = () => {
    if (!newTenantId.trim()) return;
    const id = newTenantId.trim();
    const label = newTenantLabel.trim() || id;
    const next = [...tenants, { id, label, active: true, platformTenantId: null, platformTenantName: null, statuses: Object.fromEntries(Object.keys(allPipelineKeys).map(k => [k, { provisional: [], final: [], statusColumn: "" }])) }];
    setData({ ...data, tenants: next }); setNewTenantId(""); setNewTenantLabel(""); setExpandedTenant(id);
  };
  const removeTenant = id => setData({ ...data, tenants: tenants.filter(t => t.id !== id) });
  const toggleTenant = id => setData({ ...data, tenants: tenants.map(t => t.id === id ? { ...t, active: !t.active } : t) });
  const linkPlatformTenant = (erpId, pt) => {
    setData({ ...data, tenants: tenants.map(t => t.id === erpId ? { ...t, platformTenantId: pt ? pt.id : null, platformTenantName: pt ? pt.name : null } : t) });
    setSearchMap(p => ({ ...p, [erpId]: "" }));
  };
  const updateTenantStatus = (tenantId, pipeline, field, value) => setData({ ...data, tenants: tenants.map(t => t.id === tenantId ? { ...t, statuses: { ...t.statuses, [pipeline]: { ...(t.statuses?.[pipeline] || {}), [field]: value } } } : t) });

  const linkedPt = pt => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 6px", borderRadius: 8, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", fontSize: 11 }}>
      <CheckCircle2 size={12} color={C.success} />
      <span style={{ fontWeight: 600, color: "#15803d" }}>{pt.name}</span>
      <span style={{ color: C.g400, fontSize: 10 }}>({pt.id})</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <InfoBox color={C.info}>
        Ajoutez les IDs externes des tenants (tels qu'ils existent dans l'ERP), puis liez chaque ID au tenant plateforme correspondant.
      </InfoBox>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={newTenantId} onChange={e => setNewTenantId(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="ID externe ERP (ex: CORP_001)" style={{ flex: 1 }} />
        <input value={newTenantLabel} onChange={e => setNewTenantLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addTenant()} className="input" placeholder="Libellé (optionnel)" style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={addTenant} disabled={!newTenantId.trim()}><Plus size={13} /> Ajouter</button>
      </div>

      {tenants.length === 0 && (
        <div style={{ padding: "2.5rem", textAlign: "center", color: C.g400, background: C.g50, borderRadius: 12, border: `1px dashed ${C.g200}` }}>
          <Cpu size={32} style={{ display: "block", margin: "0 auto 10px", opacity: .4 }} />
          <p style={{ fontSize: 13 }}>Aucun ID externe configuré</p>
        </div>
      )}

      {tenants.map(tenant => {
        const linkedPT = platformTenants.find(pt => pt.id === tenant.platformTenantId);
        const search = (searchMap[tenant.id] || "").toLowerCase();
        const filtered = search ? platformTenants.filter(pt => (pt.name || "").toLowerCase().includes(search) || (pt.id || "").toLowerCase().includes(search)) : [];
        return (
          <div key={tenant.id} style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer" }} onClick={() => setExpandedTenant(expandedTenant === tenant.id ? null : tenant.id)}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: tenant.active ? "rgba(217,79,61,.1)" : C.g100, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {linkedPT ? <CheckCircle2 size={18} color={C.success} /> : <Cpu size={18} color={tenant.active ? C.red : C.g400} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{tenant.label}</div>
                <div style={{ fontSize: 10, color: C.g400 }}>ID externe: <span className="mono">{tenant.id}</span></div>
                {linkedPT && <div style={{ fontSize: 10, color: C.success, marginTop: 2 }}>Lié à: {tenant.platformTenantName}</div>}
              </div>
              <Toggle checked={tenant.active} onChange={() => toggleTenant(tenant.id)} />
              <button onClick={e => { e.stopPropagation(); removeTenant(tenant.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400 }}><X size={14} /></button>
              <ChevronDown size={14} color={C.g400} style={{ transform: expandedTenant === tenant.id ? "rotate(0)" : "rotate(-90deg)", transition: "transform .2s" }} />
            </div>
            {expandedTenant === tenant.id && (
              <div style={{ borderTop: "1px solid #e5e7eb", padding: 16 }} className="fade-in">
                {/* Platform tenant linking */}
                <div style={{ marginBottom: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.info}20`, background: `${C.info}06` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Link2 size={13} color={C.info} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.info }}>Lier au tenant plateforme</span>
                  </div>
                  {linkedPT ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {linkedPt(linkedPT)}
                      <button onClick={() => linkPlatformTenant(tenant.id, null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 11, textDecoration: "underline" }}>Délier</button>
                    </div>
                  ) : (
                    <div>
                      <input
                        value={searchMap[tenant.id] || ""}
                        onChange={e => setSearchMap(p => ({ ...p, [tenant.id]: e.target.value }))}
                        className="input"
                        placeholder="Rechercher un tenant plateforme..."
                        style={{ fontSize: 12, width: "100%" }}
                      />
                      {search && filtered.length > 0 && (
                        <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3, maxHeight: 160, overflowY: "auto" }}>
                          {filtered.slice(0, 8).map(pt => (
                            <div key={pt.id} onClick={() => linkPlatformTenant(tenant.id, pt)}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, cursor: "pointer", background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.12)", fontSize: 12, transition: "background .15s" }}>
                              <CheckCircle2 size={12} color={C.info} />
                              <span style={{ fontWeight: 600, flex: 1 }}>{pt.name}</span>
                              <span style={{ color: C.g400, fontSize: 10 }}>{pt.id}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {search && filtered.length === 0 && <div style={{ fontSize: 11, color: C.g400, marginTop: 4 }}>Aucun tenant plateforme trouvé</div>}
                    </div>
                  )}
                </div>
                {/* Pipeline statuses */}
                {Object.entries(allPipelineKeys).map(([pipeKey, plDef]) => {
                  const st = tenant.statuses?.[pipeKey] || {};
                  const toList = v => Array.isArray(v) ? v.join(", ") : (v || "");
                  const fromList = s => s.split(",").map(x => x.trim()).filter(Boolean);
                  const PIcon = plDef.Icon || Settings2;
                  return (
                    <div key={pipeKey} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${plDef.color}25`, background: `${plDef.color}04`, marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><PIcon size={14} color={plDef.color} /><span style={{ fontSize: 11, fontWeight: 700, color: plDef.color }}>{plDef.label}</span></div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div style={{ flex: 1 }}><label className="label" style={{ color: C.warning }}>Statuts provisoires</label><input value={toList(st.provisional)} onChange={e => updateTenantStatus(tenant.id, pipeKey, "provisional", fromList(e.target.value))} className="input" style={{ fontSize: 11 }} /></div>
                        <div style={{ flex: 1 }}><label className="label" style={{ color: C.success }}>Statuts finaux</label><input value={toList(st.final)} onChange={e => updateTenantStatus(tenant.id, pipeKey, "final", fromList(e.target.value))} className="input" style={{ fontSize: 11 }} /></div>
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

function DataPreviewStep({ data, setData, schema }) {
  const customPipelines = data.customPipelines || [];
  const allTabs = [
    { key: "facture", label: "Factures", Icon: Database, color: PIPELINE_DEFS.facture.color },
    { key: "commande", label: "Commandes", Icon: Layers, color: PIPELINE_DEFS.commande.color },
    ...customPipelines.map(cp => ({ key: cp.id, label: cp.label, Icon: Settings2, color: cp.color }))
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
      <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />} Générer 10 lignes</button>
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

function SummaryStep({ data, onSave, onDelete, initialData }) {
  const tenants = data.tenants || [];
  const customPipelines = data.customPipelines || [];
  const pipelines = data.pipelines || {};
  const enabledPl = [
    ...["facture", "commande"].filter(k => (pipelines[k] || {}).enabled !== false).map(k => PIPELINE_DEFS[k].label),
    ...customPipelines.filter(cp => (pipelines[cp.id] || {}).enabled !== false).map(cp => cp.label),
  ];
  const isValid = data.name && (data.selectedTables || []).length > 0;
  const rows = [
    ["Nom", data.name || "—"], ["Type", data.connectorType || "—"], ["Auth", data.authType || "—"],
    ["Tables", (data.selectedTables || []).length + " table(s)"],
    ["Pipelines", enabledPl.join(" · ") || "—"],
    ["Tenants", `${tenants.length} tenant(s)${tenants.filter(t => t.platformTenantId).length > 0 ? " · " + tenants.filter(t => t.platformTenantId).length + " lié(s)" : ""}`],
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
          <div style={{ fontSize: 14, fontWeight: 700, color: isValid ? "#15803d" : "#92400e" }}>{isValid ? "Connecteur prêt à créer" : "Configuration incomplète"}</div>
          <div style={{ fontSize: 11, color: isValid ? "#16a34a" : "#b45309", marginTop: 2 }}>{isValid ? "Toutes les étapes critiques sont complètes." : "Vérifiez le nom et la sélection de tables."}</div>
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
        {initialData?.id && onDelete && <button className="btn btn-danger" onClick={onDelete}><X size={14} /> Supprimer</button>}
      </div>
    </div>
  );
}

/* ─── WIZARD MODAL ──────────────────────────────────────────── */
function ConnectorWizardModal({ open, initialData = {}, onClose, onSave, onDelete, onSyncTemplates }) {
  const [step, setStep] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [savedPipelineSnapshot, setSavedPipelineSnapshot] = useState(null);
  const [data, setData] = useState({
    name: "", connectorType: "ERP", authType: "NONE", description: "", color: "#D94F3D", logo: "",
    jdbcUrl: "", jdbcUsername: "", jdbcPassword: "", jdbcDriverClassName: "org.postgresql.Driver",
    apiEndpoint: "", apiAuthToken: "", connectionType: "jdbc",
    selectedTables: [], pipelines: {}, tableRoles: {}, customPipelines: [],
    budgetSourceTables: [], budgetAmountCols: [],
    budgetFormula: [], budgetPreset: null, budgetAgg: "SUM", alertYellow: "75", alertRed: "90",
    tenants: [], generatedData: {},
    ...initialData,
  });

  const isEditing = !!initialData?.id;
  // Snapshots for detecting unsaved changes
  const makeIdentitySnap = (d) => JSON.stringify({ name: d.name, color: d.color, description: d.description, logo: d.logo, authType: d.authType });
  const makePipelineSnap = (d) => JSON.stringify({ pipelines: d.pipelines, customPipelines: d.customPipelines, selectedTables: d.selectedTables });
  const [initialIdentitySnap] = useState(() => makeIdentitySnap(initialData));
  const [initialPipeSnap] = useState(() => makePipelineSnap(initialData));
  const hasUnsavedIdentity = isEditing && makeIdentitySnap(data) !== (savedSnapshot || initialIdentitySnap);
  const hasUnsavedPipeline = isEditing && makePipelineSnap(data) !== (savedPipelineSnapshot || initialPipeSnap);

  const connId = data.jdbcUrl?.includes("sap") ? "c1" : (data.jdbcUrl?.includes("sage") || data.jdbcUrl?.includes("sqlserver") || initialData?.id === "c2") ? "c2" : initialData?.id === "c1" ? "c1" : null;
  // Always provide a schema: use connId-specific or generic fallback
  const rawSchema = connId ? MOCK_SCHEMAS[connId] : (data.jdbcUrl ? GENERIC_SCHEMA : null);

  const schema = useMemo(() => {
    if (!rawSchema) return null;
    const sel = data.selectedTables || [];
    if (sel.length === 0) return rawSchema;
    const tables = rawSchema.tables.filter(t => sel.includes(t.name));
    const tableNames = new Set(tables.map(t => t.name));
    const rels = rawSchema.rels.filter(r => tableNames.has(r.from) && tableNames.has(r.to));
    return { tables, rels };
  }, [rawSchema, data.selectedTables]);

  // When JDBC URL changes, make tables available
  const schemaForConnection = useMemo(() => {
    if (connId) return MOCK_SCHEMAS[connId];
    if (data.jdbcUrl) return GENERIC_SCHEMA;
    return null;
  }, [connId, data.jdbcUrl]);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "rgba(255,255,255,.95)", borderBottom: "1px solid rgba(0,0,0,.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#D94F3D,#c84332)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 10px rgba(217,79,61,.3)" }}>
            <Plug size={15} color="#fff" />
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,.1)" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.g900 }}>{initialData?.id ? "Modifier le connecteur" : "Nouveau connecteur ERP"}</div>
            <div style={{ fontSize: 10, color: C.g400 }}>Moteur anomalie · Prévision budgétaire</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Contextual Save button — appears when identity fields changed */}
          {hasUnsavedIdentity && (
            <button className="save-changes-btn" onClick={() => { onSave(data); setSavedSnapshot(makeIdentitySnap(data)); }}>
              <Check size={13} /> Sauvegarder
            </button>
          )}
          {/* Contextual Sync button — appears when pipeline config changed */}
          {hasUnsavedPipeline && (
            <button className="sync-changes-btn" onClick={() => { onSyncTemplates?.(data); setSavedPipelineSnapshot(makePipelineSnap(data)); }}>
              <RefreshCw size={13} /> Synchroniser
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

        {/* Main */}
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderTop: "1px solid rgba(0,0,0,.06)", flexShrink: 0, background: "rgba(255,255,255,.5)" }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn btn-ghost" style={{ opacity: step === 1 ? 0 : 1, pointerEvents: step === 1 ? "none" : "auto" }}><ArrowLeft size={13} /> Précédent</button>
            <div style={{ display: "flex", gap: 4 }}>
              {WIZARD_STEPS.map((_, i) => (
                <div key={i} onClick={() => setStep(i + 1)} style={{ width: step === i + 1 ? 16 : 5, height: 5, borderRadius: 99, cursor: "pointer", background: step > i + 1 ? C.success : step === i + 1 ? C.red : C.g200, transition: "all .3s" }} />
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

  if (isFullscreen) {
    return createPortal(
      <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#f2f0ed", display: "flex", flexDirection: "column" }}>
        {modalContent}
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 1080, height: "min(780px,calc(100vh - 32px))" }}>
        {modalContent}
      </div>
    </div>,
    document.body
  );
}

/* ─── INTEGRATION CARD ──────────────────────────────────────── */
function IntegrationCard({ integration, onEdit, onDisconnect, isAdmin }) {
  const [confirmDis, setConfirmDis] = useState(false);
  const badge = {
    connected: { label: "Connecté", bg: C.successLight, color: "#15803d", dot: C.success },
    available: { label: "Disponible", bg: C.infoLight, color: "#1d4ed8", dot: C.info },
    coming_soon: { label: "Bientôt", bg: C.g100, color: C.g400, dot: C.g300 },
  }[integration.status] || { label: integration.status, bg: C.g100, color: C.g400 };

  return (
    <div className="card" style={{ border: `1px solid ${integration.status === "connected" ? "rgba(34,197,94,.25)" : C.g200}`, transition: "all .2s", cursor: "default" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: integration.color || "#64748B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {integration.logo || integration.name.slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.g900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{integration.name}</div>
          <div style={{ fontSize: 10, color: C.g400, marginTop: 1 }}>{integration.description}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: badge.bg, flexShrink: 0 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: badge.dot }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: badge.color }}>{badge.label}</span>
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.g400, marginBottom: 12, padding: "6px 0", borderTop: `1px solid ${C.g100}`, borderBottom: `1px solid ${C.g100}`, display: "flex", gap: 8 }}>
        <span className="mono" style={{ background: C.g100, padding: "2px 7px", borderRadius: 5, fontSize: 9 }}>{integration.authType}</span>
        {integration.category && <span style={{ textTransform: "uppercase", fontSize: 9, color: C.g300 }}>{integration.category}</span>}
      </div>
      {isAdmin && (
        <div style={{ display: "flex", gap: 6 }}>
          {integration.status === "connected" && (
            <>
              <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: 6 }} onClick={onEdit}><Settings2 size={12} /> Configurer</button>
              {!confirmDis ? (
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 11, padding: 6, borderColor: "#fecaca", color: "#dc2626" }} onClick={() => setConfirmDis(true)}><Zap size={12} /> Déconnecter</button>
              ) : (
                <div style={{ flex: 1, display: "flex", gap: 4 }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 10, padding: 5, background: "#dc2626", boxShadow: "none" }} onClick={onDisconnect}>Oui</button>
                  <button onClick={() => setConfirmDis(false)} style={{ fontSize: 10, color: C.g400, background: "none", border: "none", cursor: "pointer" }}>Non</button>
                </div>
              )}
            </>
          )}
          {integration.status === "available" && <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 11 }} onClick={onEdit}><Plus size={12} /> Connecter</button>}
          {integration.status === "coming_soon" && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 6, borderRadius: 9, background: C.g100, fontSize: 11, color: C.g400 }}><Zap size={12} style={{ marginRight: 4 }} /> Bientôt</div>}
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
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantHasData, setAssistantHasData] = useState(false);

  const CATS = [
    { id: "all", label: "Tout" }, { id: "erp", label: "ERP" }, { id: "accounting", label: "Comptabilité" },
    { id: "crm", label: "CRM" }, { id: "storage", label: "Stockage" },
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
    if (linkedTenants.length === 0) { alert("Aucun tenant actif lié à cet ERP."); return; }
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
          configJson: JSON.stringify({ template: k, tables: tmpl.tables || [], joins: tmpl.joins || [], conditions: tmpl.conditions || [], fieldMappings: tmpl.fieldMappings || {} }),
        };
        createPipelineStore(newPipe);
        created += 1;
        createdKeys.add(k);
      });
      tc.processedTemplatesJson = JSON.stringify([...new Set([...processed, ...diff])]);
    });
    if (created === 0) { alert("Tous les templates actifs sont déjà synchronisés pour les tenants liés."); return; }
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

        {connected.length > 0 && category === "all" && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={11} /> Connectés ({connected.length})</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
              {connected.filter(c => !search || `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase())).map(c => (
                <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Non-connected or filtered section */}
        {category !== "all" || (search && filtered.length === 0) ? (
          filtered.length > 0 ? filtered.map(c => (
            <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
          )) : (
            <div style={{ textAlign: "center", padding: "64px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Plug size={32} color={C.g300} />Aucune intégration trouvée
            </div>
          )
        ) : (
          filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.g400, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Plug size={34} color={C.g300} />
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: C.g900 }}>Aucune intégration</div>
              <div>Aucun connecteur n'est configuré pour le moment.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
              {filtered.filter(c => c.status !== "connected").map(c => (
                <IntegrationCard key={c.id} integration={c} isAdmin={true} onEdit={() => setModal(c)} onDisconnect={() => handleDisconnect(c.id)} />
              ))}
            </div>
          )
        )}
      </div>

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

      {/* Floating chat bubble — always visible */}
      <AssistantBubble onOpen={() => setAssistantOpen(true)} hasData={assistantHasData} />

      {/* Standalone assistant (from FAB) */}
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
