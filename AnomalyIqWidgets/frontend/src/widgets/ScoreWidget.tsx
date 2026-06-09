import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { InvoiceData, InvoiceCheckResult, Severity } from '../types';
import { ErrorBox, Spinner, WidgetCard } from './shared';

export interface ScoreWidgetProps {
  token: string;
  pipelineId: string;
  invoiceData: InvoiceData;
  onScoreReceived?: (result: InvoiceCheckResult) => void;
}

const SEVERITY_CONFIG: Record<Severity, { color: string; label: string; bg: string }> = {
  LOW:    { color: 'var(--anomaly-success)', label: 'Risque faible',  bg: 'rgba(34,197,94,0.08)' },
  MEDIUM: { color: 'var(--anomaly-warning)', label: 'Risque modéré', bg: 'rgba(245,158,11,0.08)' },
  HIGH:   { color: 'var(--anomaly-danger)',  label: 'Risque élevé',  bg: 'rgba(239,68,68,0.08)' },
};

export function ScoreWidget({ token, pipelineId, invoiceData, onScoreReceived }: ScoreWidgetProps) {
  const [result, setResult] = useState<InvoiceCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function load() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    api
      .checkInvoice(pipelineId, invoiceData, token, ctrl.signal)
      .then(data => {
        setResult(data);
        setLoading(false);
        onScoreReceived?.(data);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Erreur réseau');
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [pipelineId, invoiceData.supplier, invoiceData.amount, invoiceData.date]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WidgetCard title="Score de risque" subtitle={`${invoiceData.supplier} · €${invoiceData.amount.toLocaleString('fr-FR')}`}>
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <Spinner size={32} />
          <span style={{ fontSize: 12, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>
            Analyse en cours…
          </span>
        </div>
      )}
      {error && <ErrorBox message={error} onRetry={load} />}
      {!loading && !error && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <CircularScore score={result.score} severity={result.severity} />
          <div style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--anomaly-border-radius)',
            background: SEVERITY_CONFIG[result.severity].bg,
            border: `1px solid ${SEVERITY_CONFIG[result.severity].color}`,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, color: SEVERITY_CONFIG[result.severity].color, fontFamily: 'var(--anomaly-font-mono)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {SEVERITY_CONFIG[result.severity].label}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--anomaly-text-secondary)', lineHeight: 1.5 }}>
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

function CircularScore({ score, severity }: { score: number; severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  const r = 48;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--anomaly-border-color)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={config.color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: config.color, fontFamily: 'var(--anomaly-font-family)', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 10, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>/100</span>
      </div>
    </div>
  );
}
