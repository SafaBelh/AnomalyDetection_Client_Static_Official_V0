import { C } from "@/constants/colors";
import { fmtE } from "@/utils/formatters";

export const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(255,255,255,.97)",
        border: `1px solid ${C.grey200}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 11,
        boxShadow: "0 4px 16px rgba(0,0,0,.10)",
      }}
    >
      {label && (
        <div style={{ color: C.grey500, marginBottom: 5, fontWeight: 700 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.grey700, fontWeight: 500 }}>
          {p.name}:{" "}
          <strong>
            {typeof p.value === "number" && p.value > 999
              ? fmtE(Math.round(p.value))
              : p.value}
          </strong>
        </div>
      ))}
    </div>
  );
};
