

// import { useEffect, useMemo, useState } from "react";
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
// import { createPortal } from "react-dom";
// import { Icon } from "@/components/ui/Icon";
// import { Spinner } from "@/components/ui/Spinner";
// import { C } from "@/constants/colors";
// import { useToast } from "@/contexts/ToastContext";
// import { pipelinesForTenant, useAuth, useStore, visibleTenants } from "@/store/db";
// import { wsAPI, wsStore } from "@/store/wsAPI";
// import { CalendarDays, ChevronDown, ChevronRight, Clock, X } from "lucide-react";

// function addDays(date, days) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + days);
//   return d.toISOString().slice(0, 10);
// }

// function rhythmLabel(days) {
//   if (days >= 350) return "Annuel";
//   if (days >= 80) return "Trimestriel";
//   if (days >= 25) return "Mensuel";
//   if (days >= 12) return "Bimensuel";
//   return "Hebdomadaire";
// }

// function Toggle({ on, onChange }) {
//   return (
//     <div
//       onClick={(e) => { e.stopPropagation(); onChange(); }}
//       style={{
//         width: 36, height: 20, borderRadius: 99,
//         background: on ? C.red : "#D1D5DB",
//         cursor: "pointer", position: "relative",
//         transition: "background .3s", flexShrink: 0,
//         boxShadow: on ? "0 0 0 3px rgba(217,79,61,.12)" : "none",
//       }}
//     >
//       <div style={{
//         position: "absolute", top: 2,
//         left: on ? 36 - 16 - 2 : 2,
//         width: 16, height: 16, borderRadius: "50%",
//         background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.18)",
//         transition: "left .25s cubic-bezier(.4,0,.2,1)",
//       }} />
//     </div>
//   );
// }

// function SeriesCard({ series, pipeline }) {
//   const cv = series.cv ?? 0;
//   const flagged = series.flagged ?? (cv > 0.25 || (series.n ?? 0) < 3);
//   const [paused, setPaused] = useState(false);

//   return (
//     <div style={{
//       padding: "11px 14px", borderRadius: 10,
//       background: paused ? "rgba(107,114,128,.04)" : "rgba(255,255,255,.75)",
//       border: `1px solid ${paused ? C.grey200 : flagged ? "rgba(217,79,61,.18)" : "rgba(0,0,0,.06)"}`,
//       display: "flex", alignItems: "center", gap: 12,
//     }}>
//       <div style={{ width: 6, height: 6, borderRadius: "50%", background: flagged ? C.red : paused ? C.grey400 : C.success, flexShrink: 0 }} />
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
//           <span style={{ fontSize: 12, fontWeight: 700, color: paused ? C.grey500 : C.grey900 }}>
//             {series.name || series.id}
//           </span>
//           {flagged && (
//             <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: C.red, borderRadius: 4, padding: "1px 5px" }}>
//               Flag
//             </span>
//           )}
//           {series.high_cv && (
//             <span style={{ fontSize: 9, fontWeight: 600, color: C.warning, background: `${C.warning}15`, borderRadius: 4, padding: "1px 5px" }}>
//               CV élevé
//             </span>
//           )}
//           {series.low_volume && (
//             <span style={{ fontSize: 9, fontWeight: 600, color: C.info, background: `${C.info}15`, borderRadius: 4, padding: "1px 5px" }}>
//               Faible volume
//             </span>
//           )}
//         </div>
//         <div style={{ display: "flex", gap: 12, fontSize: 10, color: C.grey500, flexWrap: "wrap" }}>
//           <span><span style={{ fontWeight: 700, color: C.grey700 }}>{series.n ?? 0}</span> factures</span>
//           <span>Moy. <span style={{ fontWeight: 700, color: C.grey700, fontFamily: "'JetBrains Mono',monospace" }}>€{(series.mu ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</span></span>
//           <span>σ <span style={{ fontWeight: 700, color: C.grey700, fontFamily: "'JetBrains Mono',monospace" }}>€{(series.sigma ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</span></span>
//           <span>CV <span style={{ fontWeight: 700, color: cv > 0.25 ? C.red : C.grey700, fontFamily: "'JetBrains Mono',monospace" }}>{(cv * 100).toFixed(1)}%</span></span>
//           <span>Tol. <span style={{ fontWeight: 700, color: C.grey700, fontFamily: "'JetBrains Mono',monospace" }}>{series.tolerance_pct ?? pipeline?.tolerancePct ?? 10}%</span></span>
//         </div>
//       </div>
//       <div style={{ textAlign: "right", flexShrink: 0 }}>
//         <div style={{ fontSize: 9, color: C.grey400, marginBottom: 4 }}>{paused ? "En pause" : "Actif"}</div>
//         <Toggle on={!paused} onChange={() => setPaused(v => !v)} />
//       </div>
//     </div>
//   );
// }

// /* ─── Series Detail Drawer ───────────────────────────────────────── */
// function SeriesDetailModal({ series, pipeline, onClose }) {
//   const mu = series.mu || 0;
//   const sigma = series.sigma || 0;
//   const cv = series.cv || 0;
//   const n = series.n || 0;
//   const tolerancePct = series.tolerance_pct ?? pipeline?.tolerancePct ?? 10;
//   const toleranceDays = series.tolerance_days ?? pipeline?.toleranceDays ?? 10;
//   const minBound = mu * (1 - tolerancePct / 100);
//   const maxBound = mu * (1 + tolerancePct / 100);
//   const monthlyMuMap = series.monthlyMuMap || {};
//   const [seasonTab, setSeasonTab] = useState("monthly");

//   const monthlyData = useMemo(() => {
//     const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
//     return months.map((name, i) => ({
//       name,
//       mu: monthlyMuMap[String(i + 1)] || monthlyMuMap[String(i)] || monthlyMuMap[i] || mu,
//     }));
//   }, [monthlyMuMap, mu]);

//   const timeSeriesData = useMemo(() => {
//     const data = [];
//     for (let i = 0; i < Math.min(n, 24); i++) {
//       const month = i % 12;
//       const year = 2024 + Math.floor(i / 12);
//       const amt = mu + (Math.random() - 0.5) * sigma * 2;
//       data.push({
//         date: `${year}-${String(month + 1).padStart(2, "0")}`,
//         amt: Math.max(0, Math.round(amt * 100) / 100),
//       });
//     }
//     return data.sort((a, b) => a.date.localeCompare(b.date));
//   }, [mu, sigma, n]);

//   const rhythmData = useMemo(() => {
//     const gaps = [];
//     for (let i = 1; i < timeSeriesData.length; i++) {
//       const prev = new Date(`${timeSeriesData[i - 1].date}-01`);
//       const cur = new Date(`${timeSeriesData[i].date}-01`);
//       const diff = Math.max(1, Math.round((cur - prev) / 86400000));
//       if (Number.isFinite(diff)) gaps.push(diff);
//     }
//     const median = gaps.length
//       ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)]
//       : (series.median_gap_days || series.rhythm_days || 30);
//     const count = Math.max(24, Math.min(72, Math.max(gaps.length, n || 24)));
//     return Array.from({ length: count }, (_, i) => ({
//       idx: i + 1,
//       gap: gaps[i] || Math.max(1, Math.round(median + ((i % 7) - 3) * 0.9)),
//       median,
//     }));
//   }, [timeSeriesData, n, series]);

//   const medianGap = rhythmData[0]?.median || series.median_gap_days || series.rhythm_days || 30;
//   const detectedRhythm = series.rhythm || series.frequencyLabel || rhythmLabel(medianGap);

//   const expectedInvoiceDays = useMemo(() => {
//     const baseDay = series.expected_day || series.expectedInvoiceDay || series.dayOfMonth || 15;
//     return Array.from({ length: 12 }, () => Math.min(28, Math.max(1, Number(baseDay) || 15)));
//   }, [series]);

//   /* shared section header style */
//   const sectionTitle = (label, icon) => (
//     <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: C.grey700, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
//       {icon} {label}
//     </div>
//   );

//   const drawer = (
//     <div
//       style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(17,24,39,.22)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}
//       onClick={onClose}
//     >
//       <div
//         style={{ width: "min(760px, calc(100vw - 24px))", height: "100vh", background: "rgba(248,247,245,.98)", boxShadow: "-18px 0 45px rgba(0,0,0,.14)", display: "flex", flexDirection: "column", animation: "slideInRight .2s ease-out", borderLeft: "1px solid rgba(255,255,255,.8)" }}
//         onClick={e => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 8, height: 8, borderRadius: "50%", background: series.active !== false ? C.success : C.grey400 }} />
//             <div>
//               <div style={{ fontSize: 15, fontWeight: 700, color: C.grey900 }}>{series.name || series.id}</div>
//               <div style={{ fontSize: 11, color: C.grey500, display: "flex", gap: 6 }}>
//                 <span>{pipeline?.name}</span><span>·</span><span>{pipeline?.connector}</span>
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.grey200}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
//           >
//             <X size={14} color={C.grey500} />
//           </button>
//         </div>

//         {/* Scrollable body */}
//         <div style={{ padding: "16px 20px 32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

//           {/* Stats row */}
//           <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//             {[
//               { label: "Factures", value: n },
//               { label: "Moyenne (μ)", value: `€${mu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`, color: C.info },
//               { label: "Écart-type (σ)", value: `€${sigma.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}`, color: C.grey700 },
//               { label: "CV", value: `${(cv * 100).toFixed(1)}%`, color: cv > 0.25 ? C.red : C.grey700 },
//               { label: "Tolérance", value: `${tolerancePct}%`, color: C.warning },
//               { label: "Seuil min", value: `€${minBound.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`, color: C.info },
//               { label: "Seuil max", value: `€${maxBound.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`, color: C.red },
//             ].map(s => (
//               <div key={s.label} style={{ flex: 1, minWidth: 90, padding: "9px 12px", borderRadius: 10, background: `${(s.color || C.grey500)}08`, border: `1px solid ${(s.color || C.grey500)}18` }}>
//                 <div style={{ fontSize: 9, fontWeight: 700, color: s.color || C.grey500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</div>
//                 <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: C.grey900 }}>{s.value}</div>
//               </div>
//             ))}
//           </div>

//           {/* Config card */}
//           <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
//               <div>
//                 <div style={{ fontSize: 13, fontWeight: 800, color: C.red }}>{series.name || series.id}</div>
//                 <div style={{ fontSize: 10, color: C.grey500, marginTop: 2 }}>{n} fact. · μ €{mu.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} · CV {(cv * 100).toFixed(1)}%</div>
//               </div>
//               <span style={{ borderRadius: 999, border: `1.5px solid ${series.active === false ? C.grey200 : C.red}`, background: series.active === false ? "rgba(107,114,128,.06)" : "rgba(217,79,61,.06)", color: series.active === false ? C.grey500 : C.red, padding: "5px 11px", fontSize: 10, fontWeight: 800 }}>
//                 {series.active === false ? "Désactivée" : "Active"}
//               </span>
//             </div>
//             <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12, marginBottom: 10 }}>
//               <div style={{ fontSize: 10, fontWeight: 800, color: C.grey700, marginBottom: 9 }}>Tolérances</div>
//               {[
//                 ["Tolérance montant (%)", tolerancePct, `±${tolerancePct}%`],
//                 ["Tolérance date (jours)", toleranceDays, `±${toleranceDays}j`],
//               ].map(([label, value, display]) => (
//                 <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
//                   <span style={{ fontSize: 11, color: C.grey500, width: 170 }}>{label}</span>
//                   <input type="range" min={label.includes("date") ? 1 : 0} max={label.includes("date") ? 60 : 50} value={value} disabled style={{ flex: 1, accentColor: C.red }} />
//                   <span style={{ fontSize: 11, fontWeight: 800, color: C.grey700, width: 48, textAlign: "right" }}>{display}</span>
//                 </div>
//               ))}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//                 <div style={{ background: "#fff", borderRadius: 8, padding: "7px 10px", fontSize: 10, color: C.grey500 }}>Seuil max: <strong style={{ color: C.red }}>€{Math.round(maxBound).toLocaleString("fr-FR")}</strong></div>
//                 <div style={{ background: "#fff", borderRadius: 8, padding: "7px 10px", fontSize: 10, color: C.grey500 }}>Seuil min: <strong style={{ color: C.success }}>€{Math.round(minBound).toLocaleString("fr-FR")}</strong></div>
//               </div>
//             </div>
//             <div style={{ background: "#f9fafb", borderRadius: 10, padding: 12 }}>
//               <div style={{ fontSize: 10, fontWeight: 800, color: C.grey700, marginBottom: 5 }}>Saisonnalité & prévision automatiques</div>
//               <div style={{ fontSize: 11, color: C.grey500, lineHeight: 1.55 }}>Le moteur détecte automatiquement la saisonnalité, le rythme de facturation et la fenêtre de prévision. Seules les tolérances restent configurables ici.</div>
//             </div>
//           </div>

//           {/* Amounts over time */}
//           <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
//             {sectionTitle("Montants dans le temps")}
//             <ResponsiveContainer width="100%" height={190}>
//               <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                 <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
//                 <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
//                 <Tooltip formatter={v => [`€${Number(v).toFixed(2)}`, "Montant"]} />
//                 <ReferenceLine y={mu} stroke="#D94F3D" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: "μ", position: "right", fontSize: 10, fill: "#D94F3D" }} />
//                 <Line type="monotone" dataKey="amt" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Seasonality */}
//           <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
//             {sectionTitle("Analyse de saisonnalité")}
//             <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
//               {[["monthly", "Par mois"], ["quarterly", "Par trimestre"]].map(([id, label]) => (
//                 <button
//                   key={id}
//                   onClick={() => setSeasonTab(id)}
//                   className={`tab${seasonTab === id ? " active" : ""}`}
//                   style={{ fontSize: 11, padding: "5px 12px" }}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>
//             {seasonTab === "monthly" ? (
//               <>
//                 <ResponsiveContainer width="100%" height={170}>
//                   <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                     <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
//                     <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
//                     <Tooltip formatter={v => [`€${Number(v).toFixed(2)}`, "Moyenne"]} />
//                     <ReferenceLine y={mu} stroke="#D94F3D" strokeDasharray="5 5" strokeWidth={1.5} label={{ value: "μ global", position: "right", fontSize: 10, fill: "#D94F3D" }} />
//                     <Bar dataKey="mu" fill="#D94F3D" fillOpacity={0.72} radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 5, marginTop: 10 }}>
//                   {monthlyData.map((m) => (
//                     <div key={m.name} style={{ background: "rgba(217,79,61,.07)", borderRadius: 7, padding: "6px 7px", textAlign: "center" }}>
//                       <div style={{ fontSize: 9, color: C.grey500 }}>{m.name}</div>
//                       <div style={{ fontSize: 10, fontWeight: 800, color: C.red }}>€{Math.round(m.mu).toLocaleString("fr-FR")}</div>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <ResponsiveContainer width="100%" height={170}>
//                 <BarChart data={[0, 3, 6, 9].map((start, i) => ({ name: `Q${i + 1}`, mu: Math.round((monthlyData[start].mu + monthlyData[start + 1].mu + monthlyData[start + 2].mu) / 3) }))}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//                   <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
//                   <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
//                   <Tooltip formatter={v => [`€${Number(v).toFixed(2)}`, "Moyenne"]} />
//                   <Bar dataKey="mu" fill="#D94F3D" fillOpacity={0.72} radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Inter-invoice gaps */}
//           <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
//             {sectionTitle("Écarts entre factures (jours)", <Clock size={13} />)}
//             <div style={{ display: "flex", gap: 28, marginBottom: 12 }}>
//               <div>
//                 <div style={{ fontSize: 20, fontWeight: 900, color: C.info, lineHeight: 1 }}>{medianGap}j</div>
//                 <div style={{ fontSize: 11, color: C.grey500, marginTop: 3 }}>Écart médian</div>
//               </div>
//               <div>
//                 <div style={{ fontSize: 20, fontWeight: 900, color: C.success, lineHeight: 1 }}>{detectedRhythm}</div>
//                 <div style={{ fontSize: 11, color: C.grey500, marginTop: 3 }}>Rythme détecté</div>
//               </div>
//             </div>
//             <ResponsiveContainer width="100%" height={140}>
//               <BarChart data={rhythmData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//                 <XAxis dataKey="idx" tick={{ fontSize: 9, fill: C.grey500 }} interval={2} />
//                 <YAxis tick={{ fontSize: 10, fill: C.grey500 }} domain={[0, Math.max(36, Math.ceil(medianGap * 1.25))]} />
//                 <Tooltip formatter={v => [`${v} jours`, "Écart"]} />
//                 <ReferenceLine y={medianGap} stroke="#D8A444" strokeDasharray="5 5" />
//                 <Bar dataKey="gap" fill="#D1D5DB" radius={[3, 3, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* ─── Forecast 12 months — refined cards ─────────────────── */}
//           <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 16 }}>
//             {sectionTitle(
//               `Prévision 12 mois · ±${tolerancePct}% · ±${toleranceDays}j`,
//               <CalendarDays size={13} />
//             )}
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
//               {Array.from({ length: 12 }, (_, i) => {
//                 const base = new Date();
//                 base.setMonth(base.getMonth() + i + 1);
//                 const expectedDate = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(expectedInvoiceDays[i]).padStart(2, "0")}`;
//                 const predicted = monthlyMuMap[i] || monthlyMuMap[String(i + 1)] || mu;
//                 const lower = predicted * (1 - tolerancePct / 100);
//                 const upper = predicted * (1 + tolerancePct / 100);
//                 return (
//                   <div
//                     key={i}
//                     style={{
//                       background: "#fff",
//                       border: "1px solid rgba(0,0,0,.07)",
//                       borderRadius: 10,
//                       padding: "11px 13px",
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: 3,
//                     }}
//                   >
//                     {/* Index */}
//                     <div style={{ fontSize: 10, fontWeight: 700, color: C.info }}>#{i + 1}</div>

//                     {/* Expected date */}
//                     <div style={{ fontSize: 12, fontWeight: 700, color: C.grey900, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "-0.01em" }}>
//                       {expectedDate}
//                     </div>

//                     {/* Date window */}
//                     <div style={{ fontSize: 10, color: C.grey400, fontFamily: "'JetBrains Mono',monospace" }}>
//                       {addDays(expectedDate, -toleranceDays)} → {addDays(expectedDate, toleranceDays)}
//                     </div>

//                     {/* Divider */}
//                     <div style={{ height: 1, background: "#f3f4f6", margin: "5px 0" }} />

//                     {/* Predicted amount */}
//                     <div style={{ fontSize: 13, fontWeight: 700, color: C.warning, fontFamily: "'JetBrains Mono',monospace" }}>
//                       €{Math.round(predicted).toLocaleString("fr-FR")}
//                     </div>

//                     {/* Min – Max range */}
//                     <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", display: "flex", alignItems: "center", gap: 3 }}>
//                       <span style={{ color: C.success }}>€{Math.round(lower).toLocaleString("fr-FR")}</span>
//                       <span style={{ color: C.grey400 }}>–</span>
//                       <span style={{ color: C.red }}>€{Math.round(upper).toLocaleString("fr-FR")}</span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//           {/* ──────────────────────────────────────────────────────────── */}

//         </div>
//       </div>
//     </div>
//   );

//   return createPortal(drawer, document.body);
// }

// export function SeriesView() {
//   const toast = useToast();
//   const { tenant, partner, isEngineAdmin } = useAuth();
//   useStore();
//   const [seriesMap, setSeriesMap] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [selectedDetail, setSelectedDetail] = useState(null);
//   const [adminTenantFilter, setAdminTenantFilter] = useState("");
//   const [expandedPipelines, setExpandedPipelines] = useState(new Set());

//   const allTenants = useMemo(() => {
//     if (!isEngineAdmin) return [];
//     try { return visibleTenants(); } catch (e) { return []; }
//   }, [isEngineAdmin]);

//   const pipelines = useMemo(() => {
//     if (tenant) return pipelinesForTenant(tenant.id);
//     if (isEngineAdmin && adminTenantFilter) return pipelinesForTenant(adminTenantFilter);
//     if (isEngineAdmin) return allTenants.flatMap(t => pipelinesForTenant(t.id));
//     return [];
//   }, [tenant, isEngineAdmin, adminTenantFilter, allTenants]);

//   useEffect(() => {
//     let mounted = true;
//     setLoading(true);
//     (async () => {
//       const map = {};
//       await Promise.all(pipelines.map(async (p) => {
//         if (!p.workspaceStarted) { map[p.id] = []; return; }
//         try {
//           wsStore.activePipelineId = p.id;
//           const data = await wsAPI.listSeries();
//           map[p.id] = Array.isArray(data) ? data : [];
//         } catch (e) {
//           map[p.id] = [];
//         }
//       }));
//       if (mounted) { setSeriesMap(map); setLoading(false); }
//     })();
//     return () => { mounted = false; };
//   }, [pipelines]);

//   useEffect(() => {
//     setExpandedPipelines(new Set());
//   }, [pipelines]);

//   if (!tenant && !isEngineAdmin) return null;

//   const totalPipelines = pipelines.length;
//   const startedPipelines = pipelines.filter(p => p.workspaceStarted).length;
//   const allSeries = Object.values(seriesMap).flat();
//   const totalSeries = allSeries.length;
//   const flaggedSeries = allSeries.filter(s => s.flagged || s.high_cv || s.low_volume).length;

//   return (
//     <div className="fade-up" style={{ padding: "24px 22px", minHeight: "calc(100vh - 68px)", display: "flex", flexDirection: "column", gap: 0 }}>

//       {/* Page header */}
//       <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexShrink: 0 }}>
//         <Icon name="fileText" size={17} color={C.grey700} />
//         <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 23, color: C.grey900, margin: 0 }}>Séries</h2>
//         {!tenant && isEngineAdmin && allTenants.length > 0 && (
//           <select
//             value={adminTenantFilter}
//             onChange={e => setAdminTenantFilter(e.target.value)}
//             style={{ marginLeft: 10, padding: "5px 11px", borderRadius: 8, border: `1.5px solid ${C.grey200}`, fontSize: 11, fontFamily: "inherit", outline: "none", background: "rgba(255,255,255,.88)" }}
//           >
//             <option value="">Tous les tenants</option>
//             {allTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//           </select>
//         )}
//       </div>

//       {/* Summary stats */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 18, flexShrink: 0 }}>
//         {[
//           ["Pipelines", totalPipelines, C.red],
//           ["Pipelines démarrés", startedPipelines, C.success],
//           ["Séries configurées", totalSeries, C.info],
//           ["Séries flaggées", flaggedSeries, C.red],
//         ].map(([label, value, color]) => (
//           <div key={label} style={{ background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 12, padding: "13px 16px" }}>
//             <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{label}</div>
//             <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color, letterSpacing: "-.5px" }}>{value}</div>
//           </div>
//         ))}
//       </div>

//       {/* Pipeline list */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingRight: 2 }}>
//         {loading && (
//           <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 40 }}>
//             <Spinner size={15} />
//             <span style={{ fontSize: 12, color: C.grey500 }}>Chargement des séries…</span>
//           </div>
//         )}

//         {!loading && pipelines.length === 0 && (
//           <div style={{ padding: 40, textAlign: "center", color: C.grey400, fontSize: 12 }}>
//             Aucun pipeline configuré pour ce tenant.
//           </div>
//         )}

//         {!loading && pipelines.map((p) => {
//           const series = seriesMap[p.id] || [];
//           const partnerColor = partner?.color || C.grey500;
//           const isExpanded = expandedPipelines.has(p.id);
//           const togglePipeline = () => {
//             setExpandedPipelines(prev => {
//               const next = new Set(prev);
//               if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
//               return next;
//             });
//           };
//           return (
//             <div key={p.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 1px 3px rgba(0,0,0,.04)", overflow: "hidden" }}>
//               <div
//                 onClick={togglePipeline}
//                 style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 20px", cursor: "pointer", userSelect: "none", borderBottom: isExpanded ? "1px solid rgba(0,0,0,.05)" : "1px solid transparent" }}
//               >
//                 <div style={{ width: 20, height: 20, borderRadius: 7, background: "rgba(0,0,0,.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//                   {isExpanded ? <ChevronDown size={13} color={C.grey500} /> : <ChevronRight size={13} color={C.grey500} />}
//                 </div>
//                 <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.status === "actif" ? C.success : C.grey400, flexShrink: 0 }} />
//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: C.grey900 }}>{p.name}</div>
//                   <div style={{ fontSize: 10, color: C.grey500, display: "flex", gap: 7, marginTop: 2 }}>
//                     <span>{p.connector}</span>
//                     <span>·</span>
//                     <span style={{ color: partnerColor, fontWeight: 600 }}>{partner?.name || (!tenant ? p.tenantId : "—")}</span>
//                     <span>·</span>
//                     <span>{series.length} série{series.length !== 1 ? "s" : ""}</span>
//                     {!p.workspaceStarted && <span style={{ color: C.warning }}>· Non démarré</span>}
//                   </div>
//                 </div>
//                 <span style={{ padding: "3px 9px", borderRadius: 99, background: series.length > 0 ? "rgba(59,130,246,.08)" : "rgba(107,114,128,.08)", color: series.length > 0 ? C.info : C.grey500, fontSize: 10, fontWeight: 800 }}>
//                   {series.length} série{series.length !== 1 ? "s" : ""}
//                 </span>
//               </div>

//               {isExpanded && (
//                 <div className="fade-in" style={{ padding: "10px 20px 16px" }}>
//                   {!p.workspaceStarted && (
//                     <div style={{ fontSize: 11, color: C.grey400, padding: "12px 0", textAlign: "center" }}>
//                       Lancez le workspace de ce pipeline pour configurer ses séries.
//                     </div>
//                   )}
//                   {p.workspaceStarted && series.length === 0 && (
//                     <div style={{ fontSize: 11, color: C.grey400, padding: "12px 0", textAlign: "center" }}>
//                       Aucune série détectée — importez des données dans le workspace.
//                     </div>
//                   )}
//                   {p.workspaceStarted && series.length > 0 && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
//                       {series.map((s, i) => (
//                         <div key={s.id || i} onClick={() => setSelectedDetail({ series: s, pipeline: p })} style={{ cursor: "pointer" }}>
//                           <SeriesCard series={s} pipeline={p} />
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {selectedDetail && (
//         <SeriesDetailModal
//           series={selectedDetail.series}
//           pipeline={selectedDetail.pipeline}
//           onClose={() => setSelectedDetail(null)}
//         />
//       )}
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { pipelinesForTenant, useAuth, useStore, visibleTenants } from "@/store/db";
import { wsAPI, wsStore } from "@/store/wsAPI";
import { CalendarDays, ChevronDown, ChevronRight, Clock, X, TrendingUp, AlertTriangle, Activity } from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────────────────── */
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function rhythmLabel(days) {
  if (days >= 350) return "Annuel";
  if (days >= 80) return "Trimestriel";
  if (days >= 25) return "Mensuel";
  if (days >= 12) return "Bimensuel";
  return "Hebdomadaire";
}

/* ─── Design tokens (kept in sync with C.* palette) ────────────────── */
const T = {
  // surfaces
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F4F1",
  // borders
  border: "rgba(0,0,0,.07)",
  borderMid: "rgba(0,0,0,.11)",
  // text
  ink900: "#111111",
  ink700: "#3A3A3A",
  ink500: "#707070",
  ink400: "#9A9A9A",
  ink300: "#BFBFBF",
  // accent
  red: C.red || "#D94F3D",
  success: C.success || "#22C55E",
  info: C.info || "#3B82F6",
  warning: C.warning || "#D8A444",
  // mono
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  // serif
  serif: "'Instrument Serif', 'Playfair Display', Georgia, serif",
};

/* ─── Toggle ────────────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div
      role="switch" aria-checked={on}
      onClick={e => { e.stopPropagation(); onChange(); }}
      style={{
        width: 34, height: 18, borderRadius: 99,
        background: on ? T.red : T.ink300,
        cursor: "pointer", position: "relative",
        transition: "background .25s",
        flexShrink: 0,
        border: `1.5px solid ${on ? T.red : T.ink300}`,
      }}
    >
      <div style={{
        position: "absolute",
        top: 1, left: on ? 15 : 1,
        width: 14, height: 14, borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.22)",
        transition: "left .22s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────────────── */
function Badge({ children, color = T.red, bg }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase",
      color, background: bg || `${color}15`,
      borderRadius: 4, padding: "2px 6px", lineHeight: 1.6,
    }}>
      {children}
    </span>
  );
}

/* ─── Stat pill ─────────────────────────────────────────────────────── */
function StatPill({ label, value, color = T.ink700 }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      padding: "9px 13px",
      background: `${color}08`,
      border: `1px solid ${color}18`,
      borderRadius: 10, flex: 1, minWidth: 80,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: T.mono, color: T.ink900 }}>
        {value}
      </span>
    </div>
  );
}

/* ─── SeriesCard ─────────────────────────────────────────────────────── */
function SeriesCard({ series, pipeline }) {
  const cv = series.cv ?? 0;
  const flagged = series.flagged ?? (cv > 0.25 || (series.n ?? 0) < 3);
  const [paused, setPaused] = useState(false);
  const mu = series.mu ?? 0;
  const n = series.n ?? 0;
  const sigma = series.sigma ?? 0;
  const tolerancePct = series.tolerance_pct ?? pipeline?.tolerancePct ?? 10;

  const statusColor = paused ? T.ink400 : flagged ? T.red : T.success;

  return (
    <div style={{
      padding: "13px 16px",
      borderRadius: 11,
      background: paused ? T.surfaceAlt : T.surface,
      border: `1px solid ${flagged && !paused ? `${T.red}22` : T.border}`,
      display: "flex", alignItems: "center", gap: 14,
      transition: "box-shadow .15s, border-color .15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 3px 14px rgba(0,0,0,.07)"; e.currentTarget.style.borderColor = flagged && !paused ? `${T.red}44` : T.borderMid; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = flagged && !paused ? `${T.red}22` : T.border; }}
    >
      {/* Status dot */}
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: statusColor, flexShrink: 0,
        boxShadow: `0 0 0 3px ${statusColor}22`,
      }} />

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
          <span style={{
            fontSize: 12.5, fontWeight: 700,
            color: paused ? T.ink400 : T.ink900,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {series.name || series.id}
          </span>
          {flagged && <Badge color={T.red}>Flag</Badge>}
          {series.high_cv && <Badge color={T.warning}>CV élevé</Badge>}
          {series.low_volume && <Badge color={T.info}>Faible vol.</Badge>}
        </div>

        {/* Metrics row */}
        <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
          {[
            { label: "factures", val: n, raw: true },
            { label: "moy", val: `€${mu.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`, mono: true },
            { label: "σ", val: `€${sigma.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`, mono: true },
            { label: "CV", val: `${(cv * 100).toFixed(1)}%`, mono: true, color: cv > 0.25 ? T.red : undefined },
            { label: "tol", val: `${tolerancePct}%`, mono: true },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 3, marginRight: 14 }}>
              <span style={{ fontFamily: m.mono ? T.mono : undefined, fontSize: 11, fontWeight: 700, color: m.color || T.ink700 }}>
                {m.val}
              </span>
              <span style={{ fontSize: 9, color: T.ink400, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: T.ink400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {paused ? "En pause" : "Actif"}
        </span>
        <Toggle on={!paused} onChange={() => setPaused(v => !v)} />
      </div>
    </div>
  );
}

/* ─── Section title ─────────────────────────────────────────────────── */
function SectionTitle({ children, icon }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      fontSize: 11, fontWeight: 700, color: T.ink500,
      textTransform: "uppercase", letterSpacing: "0.09em",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottom: `1px solid ${T.border}`,
    }}>
      {icon && <span style={{ color: T.ink400 }}>{icon}</span>}
      {children}
    </div>
  );
}

/* ─── SeriesDetailModal ─────────────────────────────────────────────── */
function SeriesDetailModal({ series, pipeline, onClose }) {
  const mu = series.mu || 0;
  const sigma = series.sigma || 0;
  const cv = series.cv || 0;
  const n = series.n || 0;
  const tolerancePct = series.tolerance_pct ?? pipeline?.tolerancePct ?? 10;
  const toleranceDays = series.tolerance_days ?? pipeline?.toleranceDays ?? 10;
  const minBound = mu * (1 - tolerancePct / 100);
  const maxBound = mu * (1 + tolerancePct / 100);
  const monthlyMuMap = series.monthlyMuMap || {};
  const [seasonTab, setSeasonTab] = useState("monthly");

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    return months.map((name, i) => ({
      name,
      mu: monthlyMuMap[String(i + 1)] || monthlyMuMap[String(i)] || monthlyMuMap[i] || mu,
    }));
  }, [monthlyMuMap, mu]);

  const timeSeriesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < Math.min(n, 24); i++) {
      const month = i % 12;
      const year = 2024 + Math.floor(i / 12);
      const amt = mu + (Math.random() - 0.5) * sigma * 2;
      data.push({
        date: `${year}-${String(month + 1).padStart(2, "0")}`,
        amt: Math.max(0, Math.round(amt * 100) / 100),
      });
    }
    return data.sort((a, b) => a.date.localeCompare(b.date));
  }, [mu, sigma, n]);

  const rhythmData = useMemo(() => {
    const gaps = [];
    for (let i = 1; i < timeSeriesData.length; i++) {
      const prev = new Date(`${timeSeriesData[i - 1].date}-01`);
      const cur = new Date(`${timeSeriesData[i].date}-01`);
      const diff = Math.max(1, Math.round((cur - prev) / 86400000));
      if (Number.isFinite(diff)) gaps.push(diff);
    }
    const median = gaps.length
      ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)]
      : (series.median_gap_days || series.rhythm_days || 30);
    const count = Math.max(24, Math.min(72, Math.max(gaps.length, n || 24)));
    return Array.from({ length: count }, (_, i) => ({
      idx: i + 1,
      gap: gaps[i] || Math.max(1, Math.round(median + ((i % 7) - 3) * 0.9)),
      median,
    }));
  }, [timeSeriesData, n, series]);

  const medianGap = rhythmData[0]?.median || series.median_gap_days || series.rhythm_days || 30;
  const detectedRhythm = series.rhythm || series.frequencyLabel || rhythmLabel(medianGap);

  const expectedInvoiceDays = useMemo(() => {
    const baseDay = series.expected_day || series.expectedInvoiceDay || series.dayOfMonth || 15;
    return Array.from({ length: 12 }, () => Math.min(28, Math.max(1, Number(baseDay) || 15)));
  }, [series]);

  const drawer = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(10,10,10,.35)",
        backdropFilter: "blur(6px) saturate(0.8)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(780px, calc(100vw - 16px))",
          height: "100vh",
          background: T.bg,
          boxShadow: "-24px 0 60px rgba(0,0,0,.16)",
          display: "flex", flexDirection: "column",
          borderLeft: `1px solid ${T.border}`,
          animation: "slideInRight .22s cubic-bezier(.16,1,.3,1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Drawer header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          background: T.surface,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Active indicator */}
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: series.active !== false ? T.success : T.ink400,
              boxShadow: `0 0 0 3px ${(series.active !== false ? T.success : T.ink400)}22`,
            }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink900, letterSpacing: "-0.02em" }}>
                {series.name || series.id}
              </div>
              <div style={{ fontSize: 11, color: T.ink400, marginTop: 2, display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{pipeline?.name}</span>
                <span style={{ color: T.ink300 }}>·</span>
                <span>{pipeline?.connector}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: T.surface, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
            onMouseLeave={e => e.currentTarget.style.background = T.surface}
          >
            <X size={14} color={T.ink500} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ padding: "20px 24px 40px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* KPI strip */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <StatPill label="Factures" value={n} color={T.ink700} />
            <StatPill label="Moyenne μ" value={`€${mu.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`} color={T.info} />
            <StatPill label="Écart-type σ" value={`€${sigma.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}`} color={T.ink700} />
            <StatPill label="CV" value={`${(cv * 100).toFixed(1)}%`} color={cv > 0.25 ? T.red : T.ink700} />
            <StatPill label="Tolérance" value={`${tolerancePct}%`} color={T.warning} />
            <StatPill label="Seuil min" value={`€${Math.round(minBound).toLocaleString("fr-FR")}`} color={T.success} />
            <StatPill label="Seuil max" value={`€${Math.round(maxBound).toLocaleString("fr-FR")}`} color={T.red} />
          </div>

          {/* Config card */}
          <div style={{
            background: T.surface,
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
          }}>
            {/* Card header bar */}
            <div style={{
              padding: "13px 18px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: `${T.red}04`,
            }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: T.red, letterSpacing: "-0.01em" }}>
                  {series.name || series.id}
                </div>
                <div style={{ fontSize: 10.5, color: T.ink400, marginTop: 2, fontFamily: T.mono }}>
                  {n} fact. · μ €{mu.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} · CV {(cv * 100).toFixed(1)}%
                </div>
              </div>
              <span style={{
                borderRadius: 999,
                border: `1.5px solid ${series.active === false ? T.border : T.red}`,
                background: series.active === false ? T.surfaceAlt : `${T.red}08`,
                color: series.active === false ? T.ink400 : T.red,
                padding: "4px 12px", fontSize: 10, fontWeight: 800,
                letterSpacing: "0.05em",
              }}>
                {series.active === false ? "Désactivée" : "Active"}
              </span>
            </div>

            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Tolerance sliders */}
              <div style={{ background: T.surfaceAlt, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.ink700, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Tolérances
                </div>
                {[
                  ["Montant (%)", tolerancePct, `±${tolerancePct}%`, false],
                  ["Date (jours)", toleranceDays, `±${toleranceDays}j`, true],
                ].map(([label, value, display, isDate]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: T.ink500, width: 110 }}>{label}</span>
                    <input type="range" min={isDate ? 1 : 0} max={isDate ? 60 : 50}
                      value={value} disabled
                      style={{ flex: 1, accentColor: T.red }} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: T.ink700, width: 44, textAlign: "right", fontFamily: T.mono }}>
                      {display}
                    </span>
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
                  {[
                    { label: "Seuil max", val: `€${Math.round(maxBound).toLocaleString("fr-FR")}`, color: T.red },
                    { label: "Seuil min", val: `€${Math.round(minBound).toLocaleString("fr-FR")}`, color: T.success },
                  ].map(d => (
                    <div key={d.label} style={{
                      background: T.surface, borderRadius: 8, padding: "8px 11px",
                      fontSize: 11, color: T.ink400,
                      border: `1px solid ${d.color}22`,
                    }}>
                      {d.label}: <strong style={{ color: d.color, fontFamily: T.mono }}>{d.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto note */}
              <div style={{ background: T.surfaceAlt, borderRadius: 10, padding: "11px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.ink700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Saisonnalité & prévision automatiques
                </div>
                <div style={{ fontSize: 11, color: T.ink500, lineHeight: 1.6 }}>
                  Le moteur détecte automatiquement la saisonnalité, le rythme de facturation et la fenêtre de prévision. Seules les tolérances restent configurables.
                </div>
              </div>
            </div>
          </div>

          {/* Amounts over time */}
          <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "16px 18px" }}>
            <SectionTitle icon={<TrendingUp size={13} />}>Montants dans le temps</SectionTitle>
            <ResponsiveContainer width="100%" height={185}>
              <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.ink400, fontFamily: T.mono }} />
                <YAxis tick={{ fontSize: 10, fill: T.ink400 }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
                <Tooltip
                  contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, fontFamily: T.mono }}
                  formatter={v => [`€${Number(v).toFixed(2)}`, "Montant"]}
                />
                <ReferenceLine y={mu} stroke={T.red} strokeDasharray="5 5" strokeWidth={1.5}
                  label={{ value: "μ", position: "right", fontSize: 10, fill: T.red }} />
                <Line type="monotone" dataKey="amt" stroke={T.info} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Seasonality */}
          <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "16px 18px" }}>
            <SectionTitle>Analyse de saisonnalité</SectionTitle>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[["monthly", "Par mois"], ["quarterly", "Par trimestre"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setSeasonTab(id)}
                  style={{
                    fontSize: 11, padding: "5px 13px",
                    borderRadius: 7,
                    border: `1px solid ${seasonTab === id ? T.red : T.border}`,
                    background: seasonTab === id ? `${T.red}0A` : T.surface,
                    color: seasonTab === id ? T.red : T.ink500,
                    cursor: "pointer", fontWeight: seasonTab === id ? 700 : 500,
                    transition: "all .15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {seasonTab === "monthly" ? (
              <>
                <ResponsiveContainer width="100%" height={165}>
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.ink400 }} />
                    <YAxis tick={{ fontSize: 10, fill: T.ink400 }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
                    <Tooltip
                      contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, fontFamily: T.mono }}
                      formatter={v => [`€${Number(v).toFixed(2)}`, "Moyenne"]}
                    />
                    <ReferenceLine y={mu} stroke={T.red} strokeDasharray="5 5" strokeWidth={1.5}
                      label={{ value: "μ", position: "right", fontSize: 10, fill: T.red }} />
                    <Bar dataKey="mu" fill={T.red} fillOpacity={0.65} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 5, marginTop: 12 }}>
                  {monthlyData.map(m => (
                    <div key={m.name} style={{
                      background: `${T.red}07`, borderRadius: 7, padding: "6px 7px",
                      textAlign: "center", border: `1px solid ${T.red}12`,
                    }}>
                      <div style={{ fontSize: 9, color: T.ink400, marginBottom: 2 }}>{m.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: T.red, fontFamily: T.mono }}>
                        €{Math.round(m.mu).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <ResponsiveContainer width="100%" height={165}>
                <BarChart data={[0, 3, 6, 9].map((start, i) => ({
                  name: `Q${i + 1}`,
                  mu: Math.round((monthlyData[start].mu + monthlyData[start + 1].mu + monthlyData[start + 2].mu) / 3),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.ink400 }} />
                  <YAxis tick={{ fontSize: 10, fill: T.ink400 }} tickFormatter={v => `€${v.toLocaleString("fr-FR")}`} />
                  <Tooltip
                    contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, fontFamily: T.mono }}
                    formatter={v => [`€${Number(v).toFixed(2)}`, "Moyenne"]}
                  />
                  <Bar dataKey="mu" fill={T.red} fillOpacity={0.65} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Inter-invoice gaps */}
          <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "16px 18px" }}>
            <SectionTitle icon={<Clock size={13} />}>Écarts entre factures</SectionTitle>
            {/* Rhythm summary */}
            <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: T.info, letterSpacing: "-0.04em", lineHeight: 1 }}>
                  {medianGap}<span style={{ fontSize: 14, fontWeight: 600, color: T.ink400 }}>j</span>
                </div>
                <div style={{ fontSize: 10.5, color: T.ink400, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Écart médian
                </div>
              </div>
              <div style={{ width: 1, background: T.border }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.success, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {detectedRhythm}
                </div>
                <div style={{ fontSize: 10.5, color: T.ink400, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Rythme détecté
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={rhythmData} margin={{ top: 5, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" vertical={false} />
                <XAxis dataKey="idx" tick={{ fontSize: 9, fill: T.ink400, fontFamily: T.mono }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: T.ink400 }} domain={[0, Math.max(36, Math.ceil(medianGap * 1.25))]} />
                <Tooltip
                  contentStyle={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11, fontFamily: T.mono }}
                  formatter={v => [`${v} jours`, "Écart"]}
                />
                <ReferenceLine y={medianGap} stroke={T.warning} strokeDasharray="4 4" strokeWidth={1.5} />
                <Bar dataKey="gap" fill={T.ink300} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast 12 months */}
          <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: "16px 18px" }}>
            <SectionTitle icon={<CalendarDays size={13} />}>
              Prévision 12 mois · ±{tolerancePct}% · ±{toleranceDays}j
            </SectionTitle>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const base = new Date();
                base.setMonth(base.getMonth() + i + 1);
                const expectedDate = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(expectedInvoiceDays[i]).padStart(2, "0")}`;
                const predicted = monthlyMuMap[i] || monthlyMuMap[String(i + 1)] || mu;
                const lower = predicted * (1 - tolerancePct / 100);
                const upper = predicted * (1 + tolerancePct / 100);

                return (
                  <div key={i} style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 10, padding: "11px 13px",
                    display: "flex", flexDirection: "column", gap: 4,
                    transition: "border-color .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = T.borderMid}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                  >
                    {/* Index chip */}
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: T.info,
                      background: `${T.info}10`, borderRadius: 4, padding: "1px 5px",
                      alignSelf: "flex-start", fontFamily: T.mono,
                    }}>
                      #{i + 1}
                    </span>

                    {/* Date */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.ink900, fontFamily: T.mono, letterSpacing: "-0.01em" }}>
                      {expectedDate}
                    </div>

                    {/* Window */}
                    <div style={{ fontSize: 9.5, color: T.ink400, fontFamily: T.mono }}>
                      {addDays(expectedDate, -toleranceDays)} → {addDays(expectedDate, toleranceDays)}
                    </div>

                    <div style={{ height: 1, background: T.border, margin: "3px 0" }} />

                    {/* Predicted amount */}
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: T.warning, fontFamily: T.mono }}>
                      €{Math.round(predicted).toLocaleString("fr-FR")}
                    </div>

                    {/* Range */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: T.mono }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.success }}>€{Math.round(lower).toLocaleString("fr-FR")}</span>
                      <span style={{ fontSize: 10, color: T.ink300 }}>–</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.red }}>€{Math.round(upper).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(drawer, document.body);
}

/* ─── SeriesView ─────────────────────────────────────────────────────── */
export function SeriesView() {
  useToast();
  const { tenant, partner, isEngineAdmin } = useAuth();
  useStore();
  const [seriesMap, setSeriesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [adminTenantFilter, setAdminTenantFilter] = useState("");
  const [expandedPipelines, setExpandedPipelines] = useState(new Set());

  const allTenants = useMemo(() => {
    if (!isEngineAdmin) return [];
    try { return visibleTenants(); } catch { return []; }
  }, [isEngineAdmin]);

  const pipelines = useMemo(() => {
    if (tenant) return pipelinesForTenant(tenant.id);
    if (isEngineAdmin && adminTenantFilter) return pipelinesForTenant(adminTenantFilter);
    if (isEngineAdmin) return allTenants.flatMap(t => pipelinesForTenant(t.id));
    return [];
  }, [tenant, isEngineAdmin, adminTenantFilter, allTenants]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const map = {};
      await Promise.all(pipelines.map(async p => {
        if (!p.workspaceStarted) { map[p.id] = []; return; }
        try {
          wsStore.activePipelineId = p.id;
          const data = await wsAPI.listSeries();
          map[p.id] = Array.isArray(data) ? data : [];
        } catch { map[p.id] = []; }
      }));
      if (mounted) { setSeriesMap(map); setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [pipelines]);

  useEffect(() => {
    setExpandedPipelines(new Set());
  }, [pipelines]);

  if (!tenant && !isEngineAdmin) return null;

  const allSeries = Object.values(seriesMap).flat();
  const totalSeries = allSeries.length;
  const flaggedSeries = allSeries.filter(s => s.flagged || s.high_cv || s.low_volume).length;
  const startedPipelines = pipelines.filter(p => p.workspaceStarted).length;

  return (
    <div
      className="fade-up"
      style={{
        padding: "28px 26px",
        minHeight: "calc(100vh - 68px)",
        display: "flex", flexDirection: "column", gap: 0,
      }}
    >
      <PageHeader
        eyebrow="Monitoring"
        title="Séries de facturation"
        subtitle={`${totalSeries} série${totalSeries !== 1 ? "s" : ""} · ${pipelines.length} pipeline${pipelines.length !== 1 ? "s" : ""}`}
        actions={!tenant && isEngineAdmin && allTenants.length > 0 && (
          <select
            value={adminTenantFilter}
            onChange={e => setAdminTenantFilter(e.target.value)}
            style={{
              padding: "7px 13px", borderRadius: 9,
              border: `1.5px solid ${T.border}`,
              fontSize: 11, fontFamily: "inherit", outline: "none",
              background: T.surface, color: T.ink700,
              cursor: "pointer",
            }}
          >
            <option value="">Tous les tenants</option>
            {allTenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
      />

      {/* ── Summary stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
        {[
          { label: "Pipelines", value: pipelines.length, color: T.ink700, icon: <Activity size={14} /> },
          { label: "Pipelines démarrés", value: startedPipelines, color: T.success, icon: <Activity size={14} /> },
          { label: "Séries configurées", value: totalSeries, color: T.info, icon: <TrendingUp size={14} /> },
          { label: "Séries flaggées", value: flaggedSeries, color: T.red, icon: <AlertTriangle size={14} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px 18px",
            position: "relative", overflow: "hidden",
            boxShadow: `0 12px 30px ${color}14, 0 2px 8px rgba(24,25,28,.04)`,
            transition: "box-shadow .2s, transform .2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.ink400, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
              </span>
              <span style={{ color }}>{icon}</span>
            </div>
            <div style={{
              fontFamily: T.serif,
              fontSize: 34, color, letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pipeline list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 50 }}>
            <Spinner size={15} />
            <span style={{ fontSize: 12, color: T.ink400 }}>Chargement des séries…</span>
          </div>
        )}

        {!loading && pipelines.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: T.ink400, fontSize: 12 }}>
            Aucun pipeline configuré pour ce tenant.
          </div>
        )}

        {!loading && pipelines.map(p => {
          const series = seriesMap[p.id] || [];
          const partnerColor = partner?.color || T.ink500;
          const isExpanded = expandedPipelines.has(p.id);
          const flaggedCount = series.filter(s => s.flagged || s.high_cv || s.low_volume).length;

          const toggle = () => setExpandedPipelines(prev => {
            const next = new Set(prev);
            if (next.has(p.id)) next.delete(p.id); else next.add(p.id);
            return next;
          });

          return (
            <div key={p.id} style={{
              background: T.surface,
              borderRadius: 14,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
              boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,.06)" : "none",
              transition: "box-shadow .2s",
            }}>
              {/* Pipeline header row */}
              <div
                onClick={toggle}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "15px 20px",
                  cursor: "pointer", userSelect: "none",
                  borderBottom: isExpanded ? `1px solid ${T.border}` : "1px solid transparent",
                  background: isExpanded ? `${T.red}03` : T.surface,
                  transition: "background .15s",
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = T.surfaceAlt; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = T.surface; }}
              >
                {/* Chevron */}
                <div style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: isExpanded ? `${T.red}10` : T.surfaceAlt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background .15s",
                }}>
                  {isExpanded
                    ? <ChevronDown size={13} color={T.red} />
                    : <ChevronRight size={13} color={T.ink400} />}
                </div>

                {/* Status dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: p.status === "actif" ? T.success : T.ink300,
                  flexShrink: 0,
                }} />

                {/* Pipeline info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink900 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: T.ink400, display: "flex", gap: 7, marginTop: 3, alignItems: "center" }}>
                    <span>{p.connector}</span>
                    <span style={{ color: T.ink300 }}>·</span>
                    <span style={{ color: partnerColor, fontWeight: 600 }}>{partner?.name || (!tenant ? p.tenantId : "—")}</span>
                    <span style={{ color: T.ink300 }}>·</span>
                    <span>{series.length} série{series.length !== 1 ? "s" : ""}</span>
                    {!p.workspaceStarted && (
                      <span style={{ color: T.warning, fontWeight: 600 }}>· Non démarré</span>
                    )}
                  </div>
                </div>

                {/* Right-side chips */}
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  {flaggedCount > 0 && (
                    <span style={{
                      padding: "3px 9px", borderRadius: 99,
                      background: `${T.red}10`, color: T.red,
                      fontSize: 10, fontWeight: 800, letterSpacing: "0.04em",
                    }}>
                      {flaggedCount} flag{flaggedCount > 1 ? "s" : ""}
                    </span>
                  )}
                  <span style={{
                    padding: "3px 10px", borderRadius: 99,
                    background: series.length > 0 ? `${T.info}10` : T.surfaceAlt,
                    color: series.length > 0 ? T.info : T.ink400,
                    fontSize: 10, fontWeight: 800,
                  }}>
                    {series.length} série{series.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Expanded body */}
              {isExpanded && (
                <div className="fade-in" style={{ padding: "12px 20px 18px" }}>
                  {!p.workspaceStarted && (
                    <div style={{ fontSize: 11, color: T.ink400, padding: "16px 0", textAlign: "center" }}>
                      Lancez le workspace de ce pipeline pour configurer ses séries.
                    </div>
                  )}
                  {p.workspaceStarted && series.length === 0 && (
                    <div style={{ fontSize: 11, color: T.ink400, padding: "16px 0", textAlign: "center" }}>
                      Aucune série détectée — importez des données dans le workspace.
                    </div>
                  )}
                  {p.workspaceStarted && series.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {series.map((s, i) => (
                        <div
                          key={s.id || i}
                          onClick={() => setSelectedDetail({ series: s, pipeline: p })}
                          style={{ cursor: "pointer" }}
                        >
                          <SeriesCard series={s} pipeline={p} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDetail && (
        <SeriesDetailModal
          series={selectedDetail.series}
          pipeline={selectedDetail.pipeline}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
}
