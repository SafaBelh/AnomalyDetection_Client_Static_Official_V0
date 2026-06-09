import React, { useState } from 'react';
import { api } from '../api';
import type { FeedbackAction, FeedbackResponse } from '../types';
import { Button, ErrorBox } from './shared';

export interface FeedbackWidgetProps {
  token: string;
  alertId: string;
  onStatusChange?: (response: FeedbackResponse) => void;
  disabled?: boolean;
}

export function FeedbackWidget({ token, alertId, onStatusChange, disabled }: FeedbackWidgetProps) {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState<FeedbackAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<FeedbackResponse | null>(null);

  async function handleAction(action: FeedbackAction) {
    setLoading(action);
    setError(null);
    try {
      const res = await api.postFeedback(alertId, { action, comment: comment.trim() || undefined }, token);
      setDone(res);
      onStatusChange?.(res);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l\'envoi du feedback');
    } finally {
      setLoading(null);
    }
  }

  if (done) {
    const labels: Record<string, string> = {
      CONFIRMED: 'Alerte confirmée ✓',
      REJECTED: 'Alerte rejetée ✓',
      IGNORED: 'Alerte ignorée ✓',
    };
    return (
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--anomaly-border-radius)',
        background: 'rgba(34,197,94,0.08)',
        border: '1px solid var(--anomaly-success)',
        color: 'var(--anomaly-success)',
        fontSize: 13,
        fontFamily: 'var(--anomaly-font-mono)',
      }}>
        {labels[done.newStatus] ?? 'Feedback enregistré ✓'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        disabled={!!disabled || !!loading}
        placeholder="Commentaire optionnel…"
        rows={3}
        style={{
          background: 'var(--anomaly-background)',
          border: '1px solid var(--anomaly-border-color)',
          borderRadius: 'var(--anomaly-border-radius)',
          padding: '8px 12px',
          color: 'var(--anomaly-text-primary)',
          fontFamily: 'var(--anomaly-font-mono)',
          fontSize: 12,
          resize: 'vertical',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--anomaly-primary-color)')}
        onBlur={e => (e.target.style.borderColor = 'var(--anomaly-border-color)')}
      />

      {error && <ErrorBox message={error} />}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant="danger"
          size="sm"
          loading={loading === 'CONFIRM'}
          disabled={!!disabled || !!loading}
          onClick={() => handleAction('CONFIRM')}
        >
          ⚠ Confirmer l'anomalie
        </Button>
        <Button
          variant="ghost"
          size="sm"
          loading={loading === 'REJECT'}
          disabled={!!disabled || !!loading}
          onClick={() => handleAction('REJECT')}
        >
          ✗ Rejeter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          loading={loading === 'IGNORE'}
          disabled={!!disabled || !!loading}
          onClick={() => handleAction('IGNORE')}
        >
          — Ignorer
        </Button>
      </div>
    </div>
  );
}
