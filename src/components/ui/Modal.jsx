import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { C } from "@/constants/colors";

export function Modal({
  open,
  onClose,
  children,
  size = "600px",
  title,
  subtitle,
  icon,
  noScroll = false,
}) {
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
  if (!open) return null;
  const noScrollStyle = noScroll
    ? {
        display: "flex",
        flexDirection: "column",
        height: "min(92vh, 850px)",
        maxHeight: "92vh",
        overflow: "hidden",
      }
    : {};
  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-bg" onClick={onClose} />
      <div
        className="modal-box scale-in"
        style={{ maxWidth: size, ...noScrollStyle }}
      >
        {(title || icon) && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              padding: "18px 22px 14px",
              borderBottom: `1px solid rgba(255,255,255,0.88)`,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(18px)",
              borderRadius: "18px 18px 0 0",
              flexShrink: 0,
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              {icon}
              <div>
                {title && (
                  <h3
                    style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 21,
                      color: C.grey900,
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p style={{ fontSize: 11, color: C.grey500, marginTop: 2 }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn-icon"
              style={{ flexShrink: 0 }}
            >
              <Icon name="x" size={15} color={C.grey500} />
            </button>
          </div>
        )}
        {noScroll ? (
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        ) : (
          <div style={{ padding: 24 }}>{children}</div>
        )}
      </div>
    </div>
  );
  return createPortal(modalContent, document.body);
}
