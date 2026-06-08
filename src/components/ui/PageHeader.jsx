import { C } from "@/constants/colors";

export function PageHeader({ eyebrow = "Monitoring", title, subtitle, actions = null }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
          <div style={{ width: 18, height: 2, background: C.red, borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: "uppercase", letterSpacing: "0.1em" }}>{eyebrow}</span>
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, fontWeight: 400, color: C.grey900, margin: 0, letterSpacing: "-0.02em", lineHeight: 1 }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: 11, color: C.grey500, margin: "7px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export default PageHeader;
