import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Alert, AlertsPage, AlertStatus } from '../types';
import { alertTypeLabel, Button, ErrorBox, ScoreBadge, Spinner, StatusBadge, WidgetCard } from './shared';

export interface AlertsWidgetProps {
  token: string;
  statusFilter?: AlertStatus;
  onSelectAlert?: (alert: Alert) => void;
  refreshKey?: number; // increment to force refresh
}

const PAGE_SIZE = 10;

export function AlertsWidget({ token, statusFilter = 'PENDING', onSelectAlert, refreshKey = 0 }: AlertsWidgetProps) {
  const [page, setPage] = useState<AlertsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<string>(statusFilter);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    api
      .getAlerts({ status: filter || undefined, page: currentPage, size: PAGE_SIZE }, token, ctrl.signal)
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Erreur réseau');
        setLoading(false);
      });
  }, [token, filter, currentPage, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return (
    <WidgetCard
      title="Alertes"
      subtitle={page ? `${page.total} résultat${page.total !== 1 ? 's' : ''}` : undefined}
      action={
        <select
          value={filter}
          onChange={e => { setFilter(e.target.value); setCurrentPage(0); }}
          style={{
            background: 'var(--anomaly-background)',
            border: '1px solid var(--anomaly-border-color)',
            borderRadius: 'var(--anomaly-border-radius)',
            color: 'var(--anomaly-text-secondary)',
            padding: '4px 8px',
            fontSize: 12,
            fontFamily: 'var(--anomaly-font-mono)',
            cursor: 'pointer',
          }}
        >
          <option value="">Tous</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmés</option>
          <option value="REJECTED">Rejetés</option>
          <option value="IGNORED">Ignorés</option>
        </select>
      }
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size={28} />
        </div>
      )}

      {error && <ErrorBox message={error} onRetry={load} />}

      {!loading && !error && page && (
        <>
          {page.items.length === 0 ? (
            <p style={{ color: 'var(--anomaly-text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Aucune alerte.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {page.items.map(alert => (
                <AlertRow key={alert.id} alert={alert} onSelect={onSelectAlert} />
              ))}
            </div>
          )}

          {page.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                ← Préc.
              </Button>
              <span style={{ fontSize: 12, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>
                {currentPage + 1} / {page.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= page.totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Suiv. →
              </Button>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  );
}

function AlertRow({ alert, onSelect }: { alert: Alert; onSelect?: (a: Alert) => void }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: 'var(--anomaly-background)',
        borderRadius: 'var(--anomaly-border-radius)',
        border: '1px solid var(--anomaly-border-color)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--anomaly-primary-color)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--anomaly-border-color)')}
    >
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--anomaly-text-primary)', fontFamily: 'var(--anomaly-font-family)' }}>
          {alert.supplier}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)' }}>
          {alertTypeLabel(alert.type)} · {alert.date}
        </p>
      </div>
      <span style={{ fontSize: 12, color: 'var(--anomaly-text-secondary)', fontFamily: 'var(--anomaly-font-mono)', whiteSpace: 'nowrap' }}>
        €{alert.amount.toLocaleString('fr-FR')}
      </span>
      <ScoreBadge score={alert.score} />
      <StatusBadge status={alert.status} />
      {onSelect && (
        <Button size="sm" variant="ghost" onClick={() => onSelect(alert)}>
          Détail
        </Button>
      )}
    </div>
  );
}
