import { C } from "@/constants/colors";

export function EmptyState({ icon, title, subtitle, cta, onCta }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 16, textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(217,79,61,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: C.grey900, letterSpacing: "-0.3px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: C.grey500, marginTop: 6, maxWidth: 320, lineHeight: 1.5 }}>{subtitle}</div>}
      </div>
      {cta && onCta && (
        <button className="btn-primary" onClick={onCta}>
          {cta}
        </button>
      )}
    </div>
  );
}
