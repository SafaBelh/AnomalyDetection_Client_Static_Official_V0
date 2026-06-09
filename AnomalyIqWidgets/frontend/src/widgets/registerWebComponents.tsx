import React from 'react';
import ReactDOM from 'react-dom/client';
import type { Alert, AlertStatus, InvoiceCheckResult } from '../types';
import { AlertDetailWidget } from './AlertDetailWidget';
import { AlertsWidget } from './AlertsWidget';
import { BudgetWidget } from './BudgetWidget';
import { ForecastWidget } from './ForecastWidget';
import { ScoreWidget } from './ScoreWidget';

type WidgetElementProps = Record<string, unknown>;

abstract class ReactWidgetElement extends HTMLElement {
  private root?: ReactDOM.Root;
  protected props: WidgetElementProps = {};

  connectedCallback() {
    this.root ??= ReactDOM.createRoot(this);
    this.renderWidget();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }

  attributeChangedCallback() {
    this.renderWidget();
  }

  setWidgetProp(name: string, value: unknown) {
    this.props[name] = value;
    this.renderWidget();
  }

  protected attr(name: string) {
    return this.getAttribute(name) ?? undefined;
  }

  protected emit(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  protected renderWidget() {
    if (!this.root) return;
    this.root.render(this.renderReact());
  }

  protected abstract renderReact(): React.ReactNode;
}

class AnomalyAlertsElement extends ReactWidgetElement {
  static observedAttributes = ['token', 'status-filter', 'refresh-key'];

  protected renderReact() {
    return (
      <AlertsWidget
        token={this.attr('token') ?? ''}
        statusFilter={this.attr('status-filter') as AlertStatus | undefined}
        refreshKey={Number(this.attr('refresh-key') ?? 0)}
        onSelectAlert={alert => this.emit('anomaly-select-alert', alert)}
      />
    );
  }
}

class AnomalyAlertDetailElement extends ReactWidgetElement {
  static observedAttributes = ['token'];

  set alert(value: Alert | null) {
    this.setWidgetProp('alert', value);
  }

  protected renderReact() {
    const alert = this.props.alert as Alert | null | undefined;
    if (!alert) return null;
    return (
      <AlertDetailWidget
        token={this.attr('token') ?? ''}
        alert={alert}
        onStatusChange={response => this.emit('anomaly-status-change', response)}
        onClose={() => this.emit('anomaly-close')}
      />
    );
  }
}

class AnomalyScoreElement extends ReactWidgetElement {
  static observedAttributes = ['token', 'pipeline-id'];

  set invoiceData(value: unknown) {
    this.setWidgetProp('invoiceData', value);
  }

  protected renderReact() {
    const invoiceData = this.props.invoiceData as { supplier: string; amount: number; date: string } | undefined;
    if (!invoiceData) return null;
    return (
      <ScoreWidget
        token={this.attr('token') ?? ''}
        pipelineId={this.attr('pipeline-id') ?? ''}
        invoiceData={invoiceData}
        onScoreReceived={(result: InvoiceCheckResult) => this.emit('anomaly-score-received', result)}
      />
    );
  }
}

class AnomalyBudgetElement extends ReactWidgetElement {
  static observedAttributes = ['token', 'pipeline-id', 'series-id', 'year'];

  protected renderReact() {
    return (
      <BudgetWidget
        token={this.attr('token') ?? ''}
        pipelineId={this.attr('pipeline-id') ?? ''}
        seriesId={this.attr('series-id') ?? ''}
        year={Number(this.attr('year') ?? new Date().getFullYear())}
      />
    );
  }
}

class AnomalyForecastElement extends ReactWidgetElement {
  static observedAttributes = ['token', 'pipeline-id', 'series-id'];

  protected renderReact() {
    return (
      <ForecastWidget
        token={this.attr('token') ?? ''}
        pipelineId={this.attr('pipeline-id') ?? ''}
        seriesId={this.attr('series-id') ?? ''}
      />
    );
  }
}

export function registerAnomalyWidgets() {
  const definitions: [string, CustomElementConstructor][] = [
    ['anomaly-alerts', AnomalyAlertsElement],
    ['anomaly-alert-detail', AnomalyAlertDetailElement],
    ['anomaly-score', AnomalyScoreElement],
    ['anomaly-budget', AnomalyBudgetElement],
    ['anomaly-forecast', AnomalyForecastElement],
  ];

  for (const [name, ctor] of definitions) {
    if (!customElements.get(name)) customElements.define(name, ctor);
  }
}
