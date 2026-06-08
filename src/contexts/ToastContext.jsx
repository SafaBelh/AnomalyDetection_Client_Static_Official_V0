import { createContext, useContext, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { C } from "@/constants/colors";

export const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type = "info") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  const colors = {
    success: C.success,
    info: C.info,
    warning: C.warning,
    error: C.red,
  };
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="fade-in"
            style={{
              background: "rgba(24,25,28,.94)",
              color: "#fff",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,.25)",
              borderLeft: `3px solid ${colors[t.type] || C.info}`,
              maxWidth: 320,
            }}
          >
            <span style={{ color: colors[t.type] || C.info, display: "flex" }}>
              {t.type === "success" ? (
                <Icon name="check" size={15} color={colors.success} />
              ) : t.type === "error" ? (
                <Icon name="x" size={15} color={colors.error} />
              ) : (
                <Icon
                  name="alerts"
                  size={15}
                  color={colors[t.type] || C.info}
                />
              )}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export function useToast() {
  return useContext(ToastCtx);
}
