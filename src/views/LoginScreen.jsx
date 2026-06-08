import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { C } from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { setActiveTenant } from "@/store/db";

export function LoginScreen({ onLogin }) {
  const { login, loading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    clearError();
    if (!username || !pass) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }
    setErr("");
    try {
      const userData = await login(username, pass);
      // Admin starts with no tenant filter (global view); only set tenant for non-admin
      if (userData?.isEngineAdmin) {
        setActiveTenant(null, null);
      } else if (userData?.tenantId) {
        setActiveTenant(userData.tenantId);
      }
      onLogin(userData);
    } catch (err) {
      setErr(err.body?.message || err.message || "Identifiants incorrects.");
    }
  };

  const FEATURES = [
    {
      icon: "bolt",
      title: "Scoring temps réel",
      desc: "Chaque facture scorée avec tolérances configurables par série.",
    },
    {
      icon: "sparkle",
      title: "Apprentissage adaptatif",
      desc: "Le feedback affine la détection — par fournisseur, par série.",
    },
    {
      icon: "integrations",
      title: "Connecteurs universels",
      desc: "CSV, SQL, REST, S3, SFTP — toute source connectée en minutes.",
    },
    {
      icon: "chart",
      title: "Audit complet",
      desc: "Chaque alerte, décision, seuil — journalisé et exportable.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 32px",
        }}
      >
        <div className="fade-up" style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: `linear-gradient(135deg,${C.red},${C.redMid})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 8px 28px rgba(217,79,61,.3)",
              }}
            >
              <Icon name="bolt" size={28} color="#fff" />
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 36,
                color: C.grey900,
                letterSpacing: "-0.5px",
              }}
            >
              Bienvenue
            </h1>
            <p style={{ fontSize: 13, color: C.grey500, marginTop: 6 }}>
              Connectez-vous à votre espace AnomalyIQ
            </p>
          </div>
          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.grey600,
                  letterSpacing: 0.5,
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Identifiant
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="admin@anomalyiq.com ou nom_tenant"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.grey600,
                  letterSpacing: 0.5,
                  display: "block",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Mot de passe
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.grey500,
                  }}
                >
                  <Icon
                    name={showPass ? "eyeOff" : "eye"}
                    size={16}
                    color={C.grey500}
                  />
                </button>
              </div>
            </div>
            {err && (
              <div
                style={{
                  background: C.redPale,
                  border: `1px solid rgba(217,79,61,.2)`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: C.red,
                  fontWeight: 600,
                }}
              >
                ⚠ {err}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "13px 20px",
              }}
            >
              {loading ? (
                <>
                  <Spinner size={16} color="#fff" />
                  Connexion…
                </>
              ) : (
                <>Se connecter →</>
              )}
            </button>
          </form>
          <div style={{
            marginTop: 24, padding: "14px 16px",
            background: "rgba(217,79,61,.05)", borderRadius: 12,
            border: `1px solid rgba(217,79,61,.12)`,
            fontSize: 11, color: C.grey500, textAlign: "center", lineHeight: 1.5,
          }}>
            Identifiez-vous avec les accès administrateur fournis par votre équipe.
            <br />
            <span style={{ fontSize: 10, color: C.grey400 }}>
              AnomalyIQ — Détection d&apos;anomalies invoice-to-pay
            </span>
          </div>
        </div>
      </div>
      {/* Right */}
      <div
        style={{
          width: 420,
          background: `linear-gradient(160deg,rgba(217,79,61,.07) 0%,rgba(217,79,61,.02) 100%)`,
          borderLeft: `1px solid rgba(217,79,61,.1)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 40,
          gap: 14,
        }}
      >
        <div className="fade-up" style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              background: "rgba(217,79,61,.08)",
              border: `1px solid rgba(217,79,61,.18)`,
              borderRadius: 99,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: C.red,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Powered by ML
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 32,
              color: C.grey900,
              lineHeight: 1.3,
              letterSpacing: "-0.5px",
            }}
          >
            Détectez chaque{" "}
            <span style={{ fontStyle: "italic", color: C.red }}>anomalie</span>.
            <br />
            Avant qu'elle ne coûte.
          </h2>
        </div>
        {FEATURES.map((f, i) => (
          <div
            key={f.title}
            className={`glass-card-sm fade-up-${Math.min(3, i)}`}
            style={{ padding: "14px 16px", display: "flex", gap: 12 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(217,79,61,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={f.icon} size={18} color={C.red} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: C.grey900 }}>
                {f.title}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: C.grey500,
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
