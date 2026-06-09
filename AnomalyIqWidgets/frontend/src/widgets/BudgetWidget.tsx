import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { BudgetData } from '../types';
import { Button, ErrorBox, Spinner, WidgetCard } from './shared';

export interface BudgetWidgetProps {
  token: string;
  pipelineId: string;
  seriesId: string;
  year?: number;
}

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const fmtAmount = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(value));

export function BudgetWidget({ token, pipelineId, seriesId, year = new Date().getFullYear() }: BudgetWidgetProps) {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(year);
  const abortRef = useRef<AbortController | null>(null);

  function load() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    api
      .getBudget(pipelineId, seriesId, selectedYear, token, ctrl.signal)
      .then(d => { setData(d); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError(err.message ?? 'Erreur réseau');
        setLoading(false);
      });
  }

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [pipelineId, seriesId, selectedYear, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const maxVal = data ? Math.max(...data.months.flatMap(m => [m.actual, m.expected])) : 1;
  const totalActual = data ? data.months.reduce((sum, month) => sum + month.actual, 0) : 0;
  const totalBudget = data ? data.months.reduce((sum, month) => sum + month.expected, 0) : 0;
  const overrunMonths = data ? data.months.filter(month => month.status === 'OVER').length : 0;

  return (
    <WidgetCard
      title="Budget & anomalies"
      subtitle={`Série ${seriesId} · ${selectedYear}`}
      action={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedYear(y => y - 1)}>←</Button>
          <span style={{ fontSize: 12, fontFamily: 'var(--anomaly-font-mono)', color: 'var(--anomaly-text-secondary)', minWidth: 36, textAlign: 'center' }}>{selectedYear}</span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedYear(y => y + 1)}>→</Button>
        </div>
      }
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size={28} />
        </div>
      )}
      {error && <ErrorBox message={error} onRetry={load} />}
      {!loading && !error && data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            <KpiTile label="Réalisé" value={fmtAmount(totalActual)} sub="Cumul annuel" accent="var(--anomaly-primary-color)" />
            <KpiTile label="Budget" value={fmtAmount(totalBudget)} sub="Objectif annuel" accent="var(--anomaly-text-primary)" />
            <KpiTile
              label="Variance"
              value={`${data.annualVariance > 0 ? '+' : ''}${data.annualVariance.toFixed(1)}%`}
              sub={`${overrunMonths} mois en dépassement`}
              accent={data.annualVariance > 0 ? 'var(--anomaly-danger)' : 'var(--anomaly-success)'}
            />
          </div>

          <SectionLabel>Suivi mensuel</SectionLabel>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'var(--anomaly-font-mono)', color: 'var(--anomaly-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--anomaly-primary-color)', display: 'inline-block' }} /> Réalisé
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--anomaly-border-color)', border: '1px dashed var(--anomaly-text-muted)', display: 'inline-block' }} /> Budget
            </span>
          </div>

          {/* Bar chart */}
          <div style={{
            background: 'rgba(255,255,255,.72)',
            border: '1px solid rgba(255,255,255,.88)',
            borderRadius: 18,
            padding: '16px 14px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)',
          }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, alignItems: 'end', height: 150 }}>
            {data.months.map(m => {
              const actualH = Math.round((m.actual / maxVal) * 132);
              const expectedH = Math.round((m.expected / maxVal) * 132);
              const isOver = m.status === 'OVER';
              return (
                <div
                  key={m.month}
                  title={`${MONTH_NAMES[m.month - 1]}\nRéalisé: €${m.actual.toLocaleString('fr-FR')}\nBudget: €${m.expected.toLocaleString('fr-FR')}\nVariance: ${m.variance > 0 ? '+' : ''}${m.variance.toFixed(1)}%`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'default' }}
                >
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 132 }}>
                    <div style={{
                      width: 10,
                      height: actualH,
                      background: isOver ? 'linear-gradient(180deg, #E8736A, #D94F3D)' : 'linear-gradient(180deg, #F2A49F, #D94F3D)',
                      borderRadius: '6px 6px 2px 2px',
                      boxShadow: isOver ? '0 6px 14px rgba(217,79,61,.18)' : 'none',
                      transition: 'height 0.5s ease',
                    }} />
                    <div style={{
                      width: 10,
                      height: expectedH,
                      background: 'rgba(255,255,255,.35)',
                      borderRadius: '6px 6px 2px 2px',
                      border: '1px dashed #9CA3AF',
                      boxSizing: 'border-box',
                    }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--anomaly-text-muted)', fontFamily: 'var(--anomaly-font-mono)', whiteSpace: 'nowrap' }}>
                    {MONTH_NAMES[m.month - 1]}
                  </span>
                </div>
              );
            })}
          </div>
          </div>

          <SectionLabel>Détail des écarts</SectionLabel>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: 11, fontFamily: 'var(--anomaly-font-mono)' }}>
              <thead>
                <tr>
                  {['Mois', 'Réalisé', 'Budget', 'Variance'].map(h => (
                    <th key={h} style={{ padding: '4px 10px', textAlign: 'left', color: 'var(--anomaly-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.months.map(m => (
                  <tr key={m.month} style={{ background: 'rgba(255,255,255,.64)', boxShadow: '0 1px 4px rgba(0,0,0,.03)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--anomaly-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '8px 10px', color: 'var(--anomaly-text-secondary)', borderRadius: '10px 0 0 10px' }}>{MONTH_NAMES[m.month - 1]}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--anomaly-text-primary)', fontWeight: 800 }}>{fmtAmount(m.actual)}</td>
                    <td style={{ padding: '8px 10px', color: 'var(--anomaly-text-muted)' }}>{fmtAmount(m.expected)}</td>
                    <td style={{ padding: '8px 10px', color: m.status === 'OVER' ? 'var(--anomaly-danger)' : 'var(--anomaly-success)', fontWeight: 800, borderRadius: '0 10px 10px 0' }}>
                      {m.variance > 0 ? '+' : ''}{m.variance.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

function KpiTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.72)',
      border: '1px solid rgba(255,255,255,.88)',
      borderRadius: 18,
      padding: '16px 18px',
      boxShadow: '0 2px 8px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.03)',
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--anomaly-text-muted)' }}>{label}</div>
      <div style={{ marginTop: 8, fontFamily: 'var(--anomaly-font-mono)', fontSize: 18, fontWeight: 900, color: accent, letterSpacing: '-.8px' }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 10, color: 'var(--anomaly-text-muted)', lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#D94F3D,#D94F3Ddd)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', boxShadow: '0 4px 12px rgba(217,79,61,.28)' }}>•</span>
      <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.16em', color: 'var(--anomaly-text-muted)' }}>{children}</span>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#E5E7EB,transparent)' }} />
    </div>
  );
}
