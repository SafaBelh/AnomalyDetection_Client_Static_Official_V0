// ─── Alert types ──────────────────────────────────────────────────────────────

export type AlertStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'IGNORED';
export type AlertType = 'DUPLICATE' | 'AMOUNT_ANOMALY' | 'FREQUENCY' | 'ROUNDING' | 'NEW_SUPPLIER';
export type FeedbackAction = 'CONFIRM' | 'REJECT' | 'IGNORE';

export interface Alert {
  id: string;
  date: string;
  type: AlertType;
  score: number;
  supplier: string;
  amount: number;
  status: AlertStatus;
}

export interface AlertDetail extends Alert {
  explanation: string;
  referenceValues: {
    expected: number | null;
    actual: number | null;
  };
}

export interface AlertsPage {
  items: Alert[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export interface FeedbackPayload {
  action: FeedbackAction;
  comment?: string;
}

export interface FeedbackResponse {
  status: 'ok';
  alertId: string;
  newStatus: AlertStatus;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface InvoiceData {
  supplier: string;
  amount: number;
  date: string;
  label?: string;
  extraFields?: Record<string, string>;
}

export interface InvoiceCheckResult {
  score: number;
  severity: Severity;
  explanation: string;
}

export interface SavedInvoice extends InvoiceData {
  id: string;
  score: number | null;
  savedAt: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetMonth {
  month: number;
  actual: number;
  expected: number;
  variance: number;
  status: 'OVER' | 'UNDER';
}

export interface BudgetData {
  year: number;
  months: BudgetMonth[];
  annualVariance: number;
}

// ─── Forecast ─────────────────────────────────────────────────────────────────

export interface ForecastItem {
  date: string;
  expectedAmount: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastPage {
  items: ForecastItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────

export interface Theme {
  primaryColor: string;
  primaryDark: string;
  accentColor: string;
  background: string;
  surface: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  borderRadius: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
  // Typography — injected as CSS vars so widgets inherit them
  fontFamily: string;
  fontFamilyMono: string;
}

// ─── Procurement types ────────────────────────────────────────────────────────

export type SupplierStatus = 'ACTIVE' | 'PENDING' | 'REVIEW' | 'SUSPENDED';

export interface Supplier {
  id: string;
  name: string;
  category: string;
  spend: number;
  invoiceCount: number;
  status: SupplierStatus;
  riskScore: number;
}

export interface SuppliersPage {
  items: Supplier[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Department {
  id: string;
  name: string;
  budget: number;
  spent: number;
  pipeline: string;
  series: string;
}

export interface InvoicesPage {
  items: SavedInvoice[];
  total: number;
  page: number;
  totalPages: number;
}
