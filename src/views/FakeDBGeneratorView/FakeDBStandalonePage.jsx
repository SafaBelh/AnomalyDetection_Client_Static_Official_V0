import { C } from "@/constants/colors";
import { FakeDBGeneratorView } from "@/views/FakeDBGeneratorView/index";

export function FakeDBStandalonePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 60% 50% at 10% 5%,rgba(139,92,246,.09) 0%,transparent 65%),radial-gradient(ellipse 50% 55% at 90% 95%,rgba(217,79,61,.06) 0%,transparent 65%),#F0EDE8",
      }}
    >
      {/* Minimal header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px",
          background: "rgba(255,255,255,.72)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,.88)",
          boxShadow: "0 2px 16px rgba(0,0,0,.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `linear-gradient(135deg,${C.purple},${C.info})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(139,92,246,.3)",
              fontSize: 18,
            }}
          >
            🧪
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 18,
                color: C.grey900,
                lineHeight: 1,
              }}
            >
              Générateur de données de test
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.grey500,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "1px 7px",
                  background: "rgba(139,92,246,.1)",
                  border: "1px solid rgba(139,92,246,.25)",
                  borderRadius: 99,
                  fontSize: 9,
                  fontWeight: 700,
                  color: C.purple,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                🔒 Admin
              </span>
              AnomalyIQ · Outil interne
            </div>
          </div>
        </div>
        <button
          onClick={() => window.close()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 10,
            border: `1.5px solid ${C.grey200}`,
            background: "rgba(255,255,255,.75)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            color: C.grey600,
            fontFamily: "inherit",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = C.red;
            e.currentTarget.style.color = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.grey200;
            e.currentTarget.style.color = C.grey600;
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Fermer l'onglet
        </button>
      </header>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}>
        <FakeDBGeneratorView />
      </div>
    </div>
  );
}

