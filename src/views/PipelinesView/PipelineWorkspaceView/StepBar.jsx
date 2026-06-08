

import { Check, LayoutDashboard, Map, Sparkles, Layers, Settings, BarChart2, Wand2, Cpu } from "lucide-react";
import { C } from "@/constants/colors";

/* ─────────────────────────────────────────────────────────────────────────────
   PIPELINE_STEPS — single source of truth
   Each step carries an icon, a short title, and a one-line description.
───────────────────────────────────────────────────────────────────────────── */
export const PIPELINE_STEPS = [
  {
    id: "mapping",
    label: "Mapping",
    desc: "Associer les colonnes sources",
    Icon: Map,
  },
  {
    id: "cleaning",
    label: "Nettoyage",
    desc: "Filtrer les données invalides",
    Icon: Wand2,
  },
  {
    id: "clusterEDA",
    label: "Clusters",
    desc: "Analyse exploratoire",
    Icon: BarChart2,
  },
  {
    id: "seriesBuilder",
    label: "Séries",
    desc: "Construire les séries temps",
    Icon: Layers,
  },
  {
    id: "seriesConfig",
    label: "Configuration",
    desc: "Paramétrer les tolérances",
    Icon: Settings,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    desc: "Résultats & anomalies",
    Icon: LayoutDashboard,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   SideStepBar — vertical left rail used in the new workspace layout
   Props:
     step       {number}   current step index (0-based)
     onNavigate {fn(idx)}  click handler — only called for completed steps
     pipelineName {string}
     connector   {string}
───────────────────────────────────────────────────────────────────────────── */
export function SideStepBar({ step, onNavigate, pipelineName, connector }) {
  const progress = Math.round((step / (PIPELINE_STEPS.length - 1)) * 100);

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(255,255,255,0.88)",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Pipeline identity block */}
      <div
        style={{
          padding: "20px 18px 14px",
          borderBottom: "1px solid rgba(0,0,0,.05)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: `linear-gradient(135deg,${C.red},${C.redMid})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            boxShadow: "0 4px 14px rgba(217,79,61,.28)",
          }}
        >
          <Cpu size={18} color="#fff" strokeWidth={1.8} />
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: C.grey900,
            lineHeight: 1.3,
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={pipelineName}
        >
          {pipelineName || "Pipeline"}
        </div>
        {connector && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(217,79,61,.09)",
              border: "1px solid rgba(217,79,61,.2)",
              borderRadius: 6,
              padding: "2px 7px",
              fontSize: 9,
              fontWeight: 700,
              color: C.red,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {connector}
          </div>
        )}
      </div>

      {/* Progress summary */}
      <div style={{ padding: "12px 18px 10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 600, color: C.grey500 }}>
            PROGRESSION
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.red,
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            {progress}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 99,
            background: C.grey100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg,${C.red},${C.redMid})`,
              width: `${progress}%`,
              transition: "width .5s ease-out",
              boxShadow: "0 1px 6px rgba(217,79,61,.4)",
            }}
          />
        </div>
        <div style={{ fontSize: 9, color: C.grey400, marginTop: 5 }}>
          Étape {Math.min(step + 1, PIPELINE_STEPS.length)} sur{" "}
          {PIPELINE_STEPS.length}
        </div>
      </div>

      {/* Step list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "4px 10px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {PIPELINE_STEPS.map(({ id, label, desc, Icon: StepIcon }, i) => {
          const isDone = i < step;
          const isActive = i === step;
          const clickable = isDone && onNavigate;

          return (
            <div
              key={id}
              onClick={() => clickable && onNavigate(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                cursor: clickable ? "pointer" : "default",
                background: isActive
                  ? "rgba(217,79,61,.09)"
                  : "transparent",
                border: isActive
                  ? "1.5px solid rgba(217,79,61,.2)"
                  : "1.5px solid transparent",
                transition: "all .18s",
                position: "relative",
              }}
              title={clickable ? `Aller à : ${label}` : undefined}
            >
              {/* Icon dot */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? "rgba(34,197,94,.12)"
                    : isActive
                    ? `rgba(217,79,61,.12)`
                    : "rgba(0,0,0,.04)",
                  border: `1.5px solid ${
                    isDone
                      ? "rgba(34,197,94,.3)"
                      : isActive
                      ? "rgba(217,79,61,.3)"
                      : C.grey200
                  }`,
                  transition: "all .2s",
                }}
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} color={C.success} />
                ) : (
                  <StepIcon
                    size={13}
                    color={isActive ? C.red : C.grey400}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                )}
              </div>

              {/* Labels */}
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : isDone ? 600 : 500,
                    color: isActive
                      ? C.red
                      : isDone
                      ? C.grey700
                      : C.grey400,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: isActive ? C.red : isDone ? C.grey400 : C.grey300,
                    marginTop: 2,
                    opacity: isActive ? 0.8 : 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {desc}
                </div>
              </div>

              {/* Active indicator bar */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: 20,
                    borderRadius: "0 3px 3px 0",
                    background: `linear-gradient(180deg,${C.red},${C.redMid})`,
                    boxShadow: `0 0 8px ${C.red}60`,
                  }}
                />
              )}

              {/* Connector line between steps */}
              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 24,
                    bottom: -10,
                    width: 2,
                    height: 10,
                    background: (i + 1) < step
                      ? "rgba(34,197,94,.35)"
                      : "rgba(0,0,0,.06)",
                    borderRadius: 1,
                    zIndex: 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: "10px 16px 14px",
          borderTop: "1px solid rgba(0,0,0,.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 9,
            color: C.grey400,
            lineHeight: 1.4,
          }}
        >
          <Sparkles size={10} color={C.grey400} />
          Utilisez ← → pour naviguer entre les étapes
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   StepBar — compact horizontal bar (kept for backward compat inside each step)
───────────────────────────────────────────────────────────────────────────── */
export function StepBar({ step, onNavigate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: 20,
        gap: 0,
        overflowX: "auto",
        paddingBottom: 4,
      }}
    >
      {PIPELINE_STEPS.map(({ label }, i) => {
        const isDone = i < step;
        const isActive = i === step;
        const clickable = isDone && onNavigate;
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: 64,
                cursor: clickable ? "pointer" : "default",
              }}
              onClick={() => clickable && onNavigate(i)}
              title={clickable ? `Aller à : ${label}` : undefined}
            >
              <div
                className={`step-dot${
                  isDone ? " step-done" : isActive ? " step-active" : " step-future"
                }`}
              >
                {isDone ? <Check size={13} strokeWidth={3} /> : i + 1}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: isActive ? C.red : isDone ? C.success : C.grey500,
                  fontWeight: isActive ? 700 : 500,
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </div>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div
                style={{
                  width: 14,
                  height: 2,
                  background: isDone ? C.success : C.grey200,
                  borderRadius: 2,
                  marginBottom: 14,
                  flexShrink: 0,
                  transition: "background .4s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}