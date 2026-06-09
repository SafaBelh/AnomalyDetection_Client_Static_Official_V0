import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { ForecastItem, ForecastPage } from '../types';
import { ErrorBox, Spinner, WidgetCard } from './shared';

export interface ForecastWidgetProps {
  token: string;
  pipelineId: string;
  seriesId: string;
}

export function ForecastWidget({ token, pipelineId, seriesId }: ForecastWidgetProps) {
  const [data, setData] = useState<ForecastPage | null>(null);
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
      .getForecast(pipelineId, seriesId, token, ctrl.signal)
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
  }, [pipelineId, seriesId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WidgetCard title="Prévisions" subtitle={`Série ${seriesId} · 12 mois`}>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
          <Spinner size={28} />
        </div>
      )}
      {error && <ErrorBox message={error} onRetry={load} />}
      {!loading && !error && data && <ForecastChart items={data.items} />}
    </WidgetCard>
  );
}

function ForecastChart({ items }: { items: ForecastItem[] }) {
  if (items.length === 0) return <p style={{ color: 'var(--anomaly-text-muted)', fontSize: 13 }}>Aucune donnée.</p>;

  const allValues = items.flatMap(i => [i.lowerBound, i.upperBound]);
  const minV = Math.min(...allValues) * 0.95;
  const maxV = Math.max(...allValues) * 1.05;
  const range = maxV - minV;

  const W = 560;
  const H = 160;
  const padL = 60;
  const padR = 10;
  const padT = 10;
  const padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xOf = (i: number) => padL + (i / (items.length - 1)) * chartW;
  const yOf = (v: number) => padT + chartH - ((v - minV) / range) * chartH;

  // Band path (upper + lower bound filled)
  const bandUp = items.map((it, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(it.upperBound).toFixed(1)}`).join(' ');
  const bandDown = [...items].reverse().map((it, i, arr) => `L${xOf(arr.length - 1 - i).toFixed(1)},${yOf(it.lowerBound).toFixed(1)}`).join(' ');
  const bandPath = `${bandUp} ${bandDown} Z`;

  // Expected line
  const linePath = items.map((it, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(it.expectedAmount).toFixed(1)}`).join(' ');

  // Y axis ticks
  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minV + (range / ticks) * i);

  function fmtDate(d: string) {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  }

  const xTickEvery = Math.ceil(items.length / 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: 'var(--anomaly-font-mono)', color: 'var(--anomaly-text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 2, background: 'var(--anomaly-primary-color)', display: 'inline-block', borderRadius: 1 }} /> Prévision
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 20, height: 10, background: 'rgba(37,99,235,0.15)', display: 'inline-block', borderRadius: 2 }} /> Intervalle de confiance
        </span>
      </div>

      {/* SVG Chart */}
      <div style={{ overflowX: 'auto' }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', maxWidth: '100%' }}>
          {/* Grid lines */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={padL} y1={yOf(v)} x2={W - padR} y2={yOf(v)} stroke="var(--anomaly-border-color)" strokeWidth="1" />
              <text x={padL - 6} y={yOf(v) + 4} textAnchor="end" fontSize="9" fill="var(--anomaly-text-muted)" fontFamily="var(--anomaly-font-mono)">
                {(v / 1000).toFixed(0)}k
              </text>
            </g>
          ))}

          {/* Confidence band */}
          <path d={bandPath} fill="rgba(37,99,235,0.12)" />

          {/* Upper/lower bound dashed lines */}
          <path
            d={items.map((it, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(it.upperBound).toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--anomaly-primary-color)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4"
          />
          <path
            d={items.map((it, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)},${yOf(it.lowerBound).toFixed(1)}`).join(' ')}
            fill="none" stroke="var(--anomaly-primary-color)" strokeWidth="1" strokeDasharray="3,3" opacity="0.4"
          />

          {/* Expected line */}
          <path d={linePath} fill="none" stroke="var(--anomaly-primary-color)" strokeWidth="2" strokeLinecap="round" />

          {/* Dots + X labels */}
          {items.map((it, i) => (
            <g key={i}>
              <circle cx={xOf(i)} cy={yOf(it.expectedAmount)} r="3" fill="var(--anomaly-primary-color)" />
              {i % xTickEvery === 0 && (
                <text x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--anomaly-text-muted)" fontFamily="var(--anomaly-font-mono)">
                  {fmtDate(it.date)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--anomaly-font-mono)' }}>
          <thead>
            <tr>
              {['Date', 'Prévision', 'Borne inf.', 'Borne sup.'].map(h => (
                <th key={h} style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--anomaly-text-muted)', fontWeight: 500, borderBottom: '1px solid var(--anomaly-border-color)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}
                style={{ borderBottom: '1px solid var(--anomaly-border-color)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--anomaly-surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '5px 8px', color: 'var(--anomaly-text-secondary)' }}>{fmtDate(it.date)}</td>
                <td style={{ padding: '5px 8px', color: 'var(--anomaly-text-primary)', fontWeight: 600 }}>€{it.expectedAmount.toLocaleString('fr-FR')}</td>
                <td style={{ padding: '5px 8px', color: 'var(--anomaly-text-muted)' }}>€{it.lowerBound.toLocaleString('fr-FR')}</td>
                <td style={{ padding: '5px 8px', color: 'var(--anomaly-text-muted)' }}>€{it.upperBound.toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtDate(d: string) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}
