import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Alert, AlertDetail, FeedbackResponse } from '../types';
import { alertTypeLabel, Button, ErrorBox, ScoreBadge, Spinner, StatusBadge, WidgetCard } from './shared';
import { FeedbackWidget } from './FeedbackWidget';

export interface AlertDetailWidgetProps {
  token: string;
  alert: Alert;
  onStatusChange?: (response: FeedbackResponse) => void;
  onClose?: () => void;
}

export function AlertDetailWidget({ token, alert, onStatusChange, onClose }: AlertDetailWidgetProps) {
  const [detail, setDetail] = useState<AlertDetail | null>(null);
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
      .getAlert(alert.id, token, ctrl.signal)
      .then(d => { setDetail(d); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Erreur réseau');
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [alert.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [feedbackDone, setFeedbackDone] = useState(false);

  function handleStatusChange(res: FeedbackResponse) {
    setFeedbackDone(true);
    if (detail) setDetail({ ...detail, status: res.newStatus });
    onStatusChange?.(res);
  }

  return (
    <WidgetCard
      title={`Alerte · ${alertTypeLabel(alert.type)}`}
      subtitle={`ID: ${alert.id}`}
      action={
        onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Fermer
          </Button>
        )
      }
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size={28} />
        </div>
      )}
      {error && <ErrorBox message={error} onRetry={load} />}
      {!loading && !error && detail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Header row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fournisseur</p>
              <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--anomaly-text-primary)', fontFamily: 'var(--anomaly-font-family)' }}>{detail.supplier}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant</p>
              <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--anomaly-text-primary)', fontFamily: 'var(--anomaly-font-mono)' }}>€{detail.amount.toLocaleString('fr-FR')}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
              <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--anomaly-text-secondary)', fontFamily: 'var(--anomaly-font-mono)' }}>{detail.date}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <ScoreBadge score={detail.score} />
              <StatusBadge status={detail.status} />
            </div>
          </div>

          {/* Score gauge */}
          <ScoreGauge score={detail.score} />

          {/* Explanation */}
          <div style={{
            background: 'var(--anomaly-background)',
            borderRadius: 'var(--anomaly-border-radius)',
            padding: '12px 16px',
            border: '1px solid var(--anomaly-border-color)',
          }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explication</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--anomaly-text-secondary)', lineHeight: 1.6 }}>{detail.explanation}</p>
          </div>

          {/* Reference values */}
          {(detail.referenceValues.expected !== null || detail.referenceValues.actual !== null) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <RefValue label="Valeur attendue" value={detail.referenceValues.expected} />
              <RefValue label="Valeur réelle" value={detail.referenceValues.actual} highlight />
            </div>
          )}

          {/* Feedback */}
          {!feedbackDone && detail.status === 'PENDING' && (
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</p>
              <FeedbackWidget token={token} alertId={detail.id} onStatusChange={handleStatusChange} />
            </div>
          )}
          {(feedbackDone || detail.status !== 'PENDING') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--anomaly-text-muted)' }}>Statut actuel :</span>
              <StatusBadge status={detail.status} />
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? 'var(--anomaly-danger)' : score >= 40 ? 'var(--anomaly-warning)' : 'var(--anomaly-success)';
  const label = score >= 70 ? 'Risque élevé' : score >= 40 ? 'Risque modéré' : 'Risque faible';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>Score d'anomalie</span>
        <span style={{ fontSize: 11, color, fontFamily: 'var(--anomaly-font-mono)', fontWeight: 600 }}>{score}/100 — {label}</span>
      </div>
      <div style={{ height: 8, background: 'var(--anomaly-background)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--anomaly-border-color)' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

function RefValue({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div style={{
      background: 'var(--anomaly-background)',
      border: `1px solid ${highlight ? 'var(--anomaly-warning)' : 'var(--anomaly-border-color)'}`,
      borderRadius: 'var(--anomaly-border-radius)',
      padding: '10px 14px',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 10, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: highlight ? 'var(--anomaly-warning)' : 'var(--anomaly-text-secondary)', fontFamily: 'var(--anomaly-font-mono)' }}>
        {value !== null ? `€${value.toLocaleString('fr-FR')}` : '—'}
      </p>
    </div>
  );
}
