import React from 'react';

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--anomaly-primary-color)"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

// ─── Error box ────────────────────────────────────────────────────────────────

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid var(--anomaly-danger)',
      borderRadius: 'var(--anomaly-border-radius)',
      padding: '12px 16px',
      color: 'var(--anomaly-danger)',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <span>⚠ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'var(--anomaly-danger)',
            color: '#fff',
            border: 'none',
            borderRadius: 'calc(var(--anomaly-border-radius) / 2)',
            padding: '4px 12px',
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

// ─── Widget card wrapper ──────────────────────────────────────────────────────

export function WidgetCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--anomaly-surface)',
      border: '1px solid var(--anomaly-border-color)',
      borderRadius: 'var(--anomaly-border-radius)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)',
      backdropFilter: 'blur(18px) saturate(180%)',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--anomaly-border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--anomaly-text-primary)',
            fontFamily: 'var(--anomaly-font-family)',
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Score badge ──────────────────────────────────────────────────────────────

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--anomaly-danger)' : score >= 40 ? 'var(--anomaly-warning)' : 'var(--anomaly-success)';
  return (
    <span style={{
      display: 'inline-block',
      minWidth: 36,
      padding: '3px 9px',
      borderRadius: 20,
      background: color + '22',
      color,
      fontFamily: 'var(--anomaly-font-mono)',
      fontSize: 11,
      fontWeight: 800,
      textAlign: 'center',
    }}>
      {score}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:   { bg: 'rgba(245,158,11,0.12)', color: 'var(--anomaly-warning)',  label: 'En attente' },
    CONFIRMED: { bg: 'rgba(34,197,94,0.12)',  color: 'var(--anomaly-success)',  label: 'Confirmé'   },
    REJECTED:  { bg: 'rgba(239,68,68,0.12)',  color: 'var(--anomaly-danger)',   label: 'Rejeté'     },
    IGNORED:   { bg: 'rgba(148,163,184,0.12)', color: 'var(--anomaly-text-muted)', label: 'Ignoré'  },
  };
  const s = map[status] ?? { bg: '#333', color: '#aaa', label: status };
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      fontFamily: 'var(--anomaly-font-mono)',
    }}>
      {s.label}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, children, style, disabled, ...props }: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    border: 'none',
    borderRadius: 'var(--anomaly-border-radius)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--anomaly-font-family)',
    fontWeight: 600,
    letterSpacing: '0.02em',
    transition: 'all 0.15s',
    opacity: disabled || loading ? 0.6 : 1,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg, var(--anomaly-primary-color), var(--anomaly-primary-dark))', color: '#fff', boxShadow: '0 4px 14px rgba(217,79,61,.28)' },
    danger:  { background: 'var(--anomaly-danger)',        color: '#fff' },
    success: { background: 'var(--anomaly-success)',       color: '#fff' },
    ghost:   { background: 'transparent', color: 'var(--anomaly-text-secondary)', border: '1px solid var(--anomaly-border-color)' },
  };

  return (
    <button
      disabled={disabled || loading}
      style={{ ...base, ...variants[variant], ...style }}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, style, ...rest } = props;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label style={{ fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input
        style={{
          background: 'var(--anomaly-background)',
          border: '1px solid var(--anomaly-border-color)',
          borderRadius: 'var(--anomaly-border-radius)',
          padding: '8px 12px',
          color: 'var(--anomaly-text-primary)',
          fontFamily: 'var(--anomaly-font-mono)',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--anomaly-primary-color)')}
        onBlur={e => (e.target.style.borderColor = 'var(--anomaly-border-color)')}
        {...rest}
      />
    </div>
  );
}

// ─── Alert type label ─────────────────────────────────────────────────────────

export function alertTypeLabel(type: string): string {
  const map: Record<string, string> = {
    DUPLICATE: 'Doublon',
    AMOUNT_ANOMALY: 'Anomalie montant',
    FREQUENCY: 'Fréquence',
    ROUNDING: 'Arrondi suspect',
    NEW_SUPPLIER: 'Nouveau fournisseur',
  };
  return map[type] ?? type;
}
