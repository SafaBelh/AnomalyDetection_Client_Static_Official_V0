import { C } from "@/constants/colors";

export const SliderRow = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  fmt = (v) => v,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 5,
      marginBottom: 8,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 11, color: C.grey500 }}>{label}</div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.grey700,
          flexShrink: 0,
        }}
      >
        {fmt(value)}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider"
      style={{ width: "100%" }}
    />
  </div>
);

