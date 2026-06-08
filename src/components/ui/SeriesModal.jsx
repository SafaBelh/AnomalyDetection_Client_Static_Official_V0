import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { useToast } from "@/contexts/ToastContext";
import { updatePipelineStore } from "@/store/db";
import { wsAPI, wsStore } from "@/store/wsAPI";
// import { WSSeriesBuilder } from "@/views/PipelinesView/PipelineWorkspaceView/WSSeriesBuilder";
// import { WSSeriesConfig } from "@/views/PipelinesView/PipelineWorkspaceView/WSSeriesConfig";
import {WSSeriesBuilder} from "../../views/PipelinesView/PipelineWorkspaceView/SeriesBuilder"
import {WSSeriesConfig} from "../../views/PipelinesView/PipelineWorkspaceView/SeriesConfigStep"
export function SeriesModal({ open, pipeline, onClose }) {
  const toast = useToast();
  // "loading" | "config" | "builder"
  const [view, setView] = useState("loading");
  const [existingSeries, setExistingSeries] = useState([]);
  const [groupFields, setGroupFields] = useState(["supplier", "label"]);

  // Load existing series whenever modal opens
  useEffect(() => {
    if (!open || !pipeline) return;
    setView("loading");
    wsStore.activePipelineId = pipeline.id;
    wsAPI
      .listSeries()
      .then((list) => {
        if (list && list.length > 0) {
          // Ensure each series has an `active` field
          setExistingSeries(
            list.map((s) => ({ ...s, active: s.active !== false }))
          );
          setView("config");
        } else {
          // No series yet — go to builder first
          setView("builder");
        }
      })
      .catch(() => setView("builder"));
  }, [open, pipeline?.id]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !pipeline) return null;

  const defaultCols = {
    amount: "amount",
    date: "invoice_date",
    supplier: "supplier_code",
    label: "label",
    tenant: null,
  };

  const handleBuilderConfirm = (d) => {
    setExistingSeries(
      (d.series || []).map((s) => ({ ...s, active: s.active !== false }))
    );
    setGroupFields(d.groupFields || ["supplier", "label"]);
    setView("config");
  };

  const handleConfigSave = (configured) => {
    updatePipelineStore(pipeline.id, { workspaceStarted: true });
    toast("Configuration des séries sauvegardée", "success");
    onClose();
  };

  const stepLabel =
    view === "builder"
      ? "Reconfiguration du regroupement"
      : view === "config"
      ? `${existingSeries.length} série${
          existingSeries.length > 1 ? "s" : ""
        } · Tolérances & activation`
      : "Chargement…";

  return createPortal(
    <div
      className="modal-overlay"
      style={{ padding: 0, alignItems: "stretch" }}
    >
      <div className="modal-bg" onClick={onClose} />
      <div
        className="scale-in"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1100,
          margin: "24px auto",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.88)",
          borderRadius: 20,
          boxShadow: "0 8px 48px rgba(0,0,0,.14)",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 48px)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(0,0,0,.06)",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            borderRadius: "20px 20px 0 0",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: `linear-gradient(135deg,${C.teal},${C.info})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(20,184,166,.25)",
              }}
            >
              <Icon name="fileText" size={18} color="#fff" />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 20,
                  color: C.grey900,
                  lineHeight: 1.2,
                }}
              >
                Séries — <span style={{ color: C.teal }}>{pipeline.name}</span>
              </h3>
              <p style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
                {stepLabel}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Only show regrouping button when in config view */}
            {view === "config" && (
              <button
                onClick={() => setView("builder")}
                className="btn-ghost"
                style={{ fontSize: 11, padding: "5px 12px", gap: 5 }}
              >
                <Icon name="refresh" size={12} color={C.grey500} />
                Reconfigurer regroupement
              </button>
            )}
            {view === "builder" && existingSeries.length > 0 && (
              <button
                onClick={() => setView("config")}
                className="btn-ghost"
                style={{ fontSize: 11, padding: "5px 12px", gap: 5 }}
              >
                ← Retour aux séries
              </button>
            )}
            <button onClick={onClose} className="btn-icon">
              <Icon name="x" size={15} color={C.grey500} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            background: "rgba(240,237,232,0.4)",
          }}
        >
          {view === "loading" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                gap: 12,
              }}
            >
              <Spinner size={28} />
              <span style={{ fontSize: 14, color: C.grey500 }}>
                Chargement des séries…
              </span>
            </div>
          )}
          {view === "builder" && (
            <WSSeriesBuilder
              cols={defaultCols}
              extraCols={[]}
              onConfirm={handleBuilderConfirm}
              onNavigate={() => {}}
              hideStepBar
            />
          )}
          {view === "config" && existingSeries.length > 0 && (
            <WSSeriesConfig
              series={existingSeries}
              groupFields={groupFields}
              onConfirm={handleConfigSave}
              onBack={() => setView("builder")}
              onNavigate={() => {}}
              hideStepBar
              showActiveToggle
              onSeriesChange={setExistingSeries}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Series toggle row — extracted to respect Rules of Hooks ── */
export function SeriesToggleRow({ series, Toggle, toast }) {
  const [paused, setPaused] = useState(series.paused);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        borderRadius: 10,
        background: paused ? "rgba(107,114,128,.05)" : "rgba(34,197,94,.04)",
        border: `1px solid ${paused ? C.grey200 : "rgba(34,197,94,.15)"}`,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: paused ? C.grey500 : C.grey900,
          }}
        >
          {series.name}
        </div>
        <div style={{ fontSize: 9, color: C.grey400 }}>
          {paused ? "En pause" : "● Active"}
        </div>
      </div>
      <Toggle
        on={!paused}
        onChange={() => {
          setPaused((v) => !v);
          toast(paused ? "Série réactivée" : "Série mise en pause", "info");
        }}
        small
      />
    </div>
  );
}
