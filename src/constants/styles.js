/* ═══════════════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════════════ */
export const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;font-family:'DM Sans',system-ui,sans-serif;}
body{background:radial-gradient(ellipse 50% 40% at 12% 8%,rgba(217,79,61,0.08) 0%,transparent 70%),radial-gradient(ellipse 45% 50% at 88% 92%,rgba(217,79,61,0.05) 0%,transparent 70%),#F0EDE8;background-attachment:fixed;color:#18191C;-webkit-font-smoothing:antialiased;}
button,input,select,textarea{font-family:inherit;}
::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(217,79,61,0.3);border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.94);}to{opacity:1;transform:scale(1);}}
.fade-up{animation:fadeUp .42s cubic-bezier(.22,.68,0,1.15) both;}
.fade-up-1{animation:fadeUp .42s .07s cubic-bezier(.22,.68,0,1.15) both;}
.fade-up-2{animation:fadeUp .42s .14s cubic-bezier(.22,.68,0,1.15) both;}
.fade-up-3{animation:fadeUp .42s .21s cubic-bezier(.22,.68,0,1.15) both;}
.fade-in{animation:fadeIn .3s both;}
.scale-in{animation:scaleIn .35s cubic-bezier(.22,.68,0,1.15) both;}
.spinner{animation:spin .7s linear infinite;}
.pulse-dot{animation:pulse 2s infinite;}
.glass-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.88);border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,.07),0 1px 3px rgba(0,0,0,.04);}
.glass-card-sm{background:rgba(255,255,255,0.65);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.88);border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.05);}
.card-solid{background:#fff;border:1.5px solid #E5E7EB;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,.06);}
.card-hover{transition:all .2s;cursor:pointer;}
.card-hover:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.10);}
.btn-primary{background:linear-gradient(135deg,#D94F3D,#E8736A);color:#fff;border:none;border-radius:11px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 6px 20px rgba(217,79,61,0.28);transition:all .2s;display:inline-flex;align-items:center;gap:7px;font-family:inherit;}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(217,79,61,0.38);}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-ghost{background:rgba(255,255,255,.75);color:#525761;border:1.5px solid #E5E7EB;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(8px);font-family:inherit;}
.btn-ghost:hover{border-color:#D94F3D;color:#D94F3D;background:#FDF1F0;}
.btn-icon{background:rgba(255,255,255,.7);border:1.5px solid #E5E7EB;border-radius:9px;padding:7px;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;color:#6B7280;}
.btn-icon:hover{border-color:#D94F3D;color:#D94F3D;background:#FDF1F0;}
.btn-danger{background:rgba(217,79,61,.08);color:#D94F3D;border:1.5px solid rgba(217,79,61,.3);border-radius:10px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;}
.btn-danger:hover{background:rgba(217,79,61,.18);}
.btn-confirm{background:rgba(34,197,94,.08);color:#22C55E;border:1.5px solid rgba(34,197,94,.3);border-radius:10px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;}
.btn-confirm:hover{background:rgba(34,197,94,.18);}
.btn-mute{background:rgba(107,114,128,.08);color:#6B7280;border:1.5px solid rgba(107,114,128,.25);border-radius:10px;padding:7px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:5px;}
.btn-toggle{padding:8px 16px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid #C4C7CC;background:rgba(255,255,255,.7);color:#525761;transition:all .2s;font-family:inherit;}
.btn-toggle:hover{border-color:#D94F3D;color:#D94F3D;}
.btn-toggle.active{background:linear-gradient(135deg,#D94F3D,#E8736A);color:#fff;border-color:transparent;box-shadow:0 4px 14px rgba(217,79,61,.25);}
.input-field{width:100%;padding:9px 13px;border-radius:10px;font-size:13px;font-weight:500;border:1.5px solid #E5E7EB;background:rgba(255,255,255,.88);color:#18191C;outline:none;transition:all .2s;font-family:inherit;}
.input-field:focus{border-color:#D94F3D;box-shadow:0 0 0 3px rgba(217,79,61,.10);}
.input-field::placeholder{color:#9CA3AF;font-weight:400;}
textarea.input-field{resize:vertical;line-height:1.5;}
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:99px;font-size:11px;font-weight:700;}
.badge-red{background:rgba(217,79,61,.12);color:#D94F3D;border:1px solid rgba(217,79,61,.2);}
.badge-warn{background:rgba(245,158,11,.12);color:#F59E0B;border:1px solid rgba(245,158,11,.2);}
.badge-ok{background:rgba(34,197,94,.12);color:#22C55E;border:1px solid rgba(34,197,94,.2);}
.badge-info{background:rgba(59,130,246,.12);color:#3B82F6;border:1px solid rgba(59,130,246,.2);}
.badge-mute{background:rgba(107,114,128,.10);color:#6B7280;border:1px solid rgba(107,114,128,.18);}
.badge-purple{background:rgba(139,92,246,.12);color:#8B5CF6;border:1px solid rgba(139,92,246,.2);}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;color:#6B7280;border:none;background:transparent;width:100%;text-align:left;text-decoration:none;font-family:inherit;}
.nav-item svg{transition:color .2s,stroke .2s;}
.nav-item:hover{background:rgba(217,79,61,.08);color:#D94F3D;}
.nav-item:hover svg{color:#D94F3D;stroke:#D94F3D;}
.nav-item.active{background:linear-gradient(135deg,#D94F3D,#E8736A);color:#fff;box-shadow:0 4px 16px rgba(217,79,61,.28);}
.nav-item.active svg{color:#fff;stroke:#fff;}
.kpi-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.88);border-radius:18px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,.06);transition:all .2s;}
.kpi-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,.10);}
.table-row{transition:background .15s;cursor:pointer;}
.table-row:hover{background:rgba(217,79,61,.04);}
.table-row.selected{background:rgba(217,79,61,.08);}
.step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;transition:all .3s;}
.step-done{background:linear-gradient(135deg,#22C55E,#16A34A);color:#fff;box-shadow:0 3px 10px rgba(34,197,94,.3);}
.step-active{background:linear-gradient(135deg,#D94F3D,#E8736A);color:#fff;box-shadow:0 3px 12px rgba(217,79,61,.3);animation:pulse 2s infinite;}
.step-future{background:rgba(196,199,204,.3);color:#6B7280;}
.tab{padding:8px 16px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#6B7280;transition:all .2s;font-family:inherit;}
.tab:hover{color:#D94F3D;background:rgba(217,79,61,.08);}
.tab.active{background:linear-gradient(135deg,#D94F3D,#E8736A);color:#fff;box-shadow:0 4px 14px rgba(217,79,61,.25);}
.conn-card{border:1.5px solid #E5E7EB;border-radius:14px;padding:14px;cursor:pointer;transition:all .2s;text-align:center;background:rgba(255,255,255,.7);}
.conn-card:hover{border-color:#D94F3D;background:#FDF1F0;transform:translateY(-1px);}
.conn-card.selected{border-color:#D94F3D;background:#FDF1F0;box-shadow:0 4px 16px rgba(217,79,61,.15);}
.slider{accent-color:#D94F3D;}
.modal-overlay{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;}
.modal-bg{position:fixed;inset:0;background:color-mix(in oklab,#18191C 35%,transparent);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:-1;}
.modal-box{position:relative;background:rgba(255,255,255,0.65);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.88);border-radius:18px;box-shadow:0 4px 24px rgba(0,0,0,.07),0 1px 3px rgba(0,0,0,.04);max-height:90vh;overflow-y:auto;width:100%;}
`;
