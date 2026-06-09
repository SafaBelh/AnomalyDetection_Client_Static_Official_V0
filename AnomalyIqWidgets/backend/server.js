import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory data factories ─────────────────────────────────────────────────

const makeAlerts = () => [
  {
    id: 'alert_001', date: '2024-11-15', type: 'DUPLICATE', score: 92,
    supplier: 'Acme Corp', amount: 14500, status: 'PENDING',
    explanation: 'This invoice matches an already-processed invoice from 2024-11-01 (INV-8821). The amount, supplier, and line items are identical within a 2-day window.',
    referenceValues: { expected: 0, actual: 14500 },
  },
  {
    id: 'alert_002', date: '2024-11-18', type: 'AMOUNT_ANOMALY', score: 78,
    supplier: 'Globex Ltd', amount: 87200, status: 'PENDING',
    explanation: 'The invoice amount is 340% above the 12-month rolling average for this supplier (avg: €25,600). No contract amendment found.',
    referenceValues: { expected: 25600, actual: 87200 },
  },
  {
    id: 'alert_003', date: '2024-11-20', type: 'FREQUENCY', score: 65,
    supplier: 'Initech Solutions', amount: 3200, status: 'CONFIRMED',
    explanation: 'Supplier submitted 4 invoices this week, vs. a historical average of 1 per week. This may indicate invoice splitting.',
    referenceValues: { expected: 1, actual: 4 },
  },
  {
    id: 'alert_004', date: '2024-11-21', type: 'ROUNDING', score: 55,
    supplier: 'Umbrella Consulting', amount: 5000, status: 'PENDING',
    explanation: 'Round-number invoice detected. Studies show fraudulent invoices are 3× more likely to end in 000. No detailed breakdown provided.',
    referenceValues: { expected: null, actual: 5000 },
  },
  {
    id: 'alert_005', date: '2024-11-22', type: 'NEW_SUPPLIER', score: 48,
    supplier: 'Veridian Dynamics', amount: 18750, status: 'PENDING',
    explanation: 'First invoice from this supplier. No approved vendor record found in procurement system. Bank details differ from contact form.',
    referenceValues: { expected: null, actual: 18750 },
  },
  {
    id: 'alert_006', date: '2024-11-23', type: 'AMOUNT_ANOMALY', score: 85,
    supplier: 'Soylent Corp', amount: 4100, status: 'PENDING',
    explanation: 'Invoice amount exceeds the pre-approved purchase order by €850 (PO-2024-441 was for €3,250). No change order on record.',
    referenceValues: { expected: 3250, actual: 4100 },
  },
];

const makeBudgetData = (year) => ({
  year,
  annualVariance: -4.2,
  months: [
    { month: 1,  actual: 41200,  expected: 40000,  variance: 3.0,   status: 'OVER'  },
    { month: 2,  actual: 38500,  expected: 40000,  variance: -3.75, status: 'UNDER' },
    { month: 3,  actual: 43100,  expected: 42000,  variance: 2.6,   status: 'OVER'  },
    { month: 4,  actual: 39800,  expected: 41000,  variance: -2.9,  status: 'UNDER' },
    { month: 5,  actual: 44600,  expected: 43000,  variance: 3.7,   status: 'OVER'  },
    { month: 6,  actual: 40100,  expected: 41500,  variance: -3.4,  status: 'UNDER' },
    { month: 7,  actual: 38900,  expected: 40000,  variance: -2.75, status: 'UNDER' },
    { month: 8,  actual: 42300,  expected: 41000,  variance: 3.2,   status: 'OVER'  },
    { month: 9,  actual: 45800,  expected: 44000,  variance: 4.1,   status: 'OVER'  },
    { month: 10, actual: 39200,  expected: 41000,  variance: -4.4,  status: 'UNDER' },
    { month: 11, actual: 43500,  expected: 42000,  variance: 3.6,   status: 'OVER'  },
    { month: 12, actual: 41000,  expected: 42000,  variance: -2.4,  status: 'UNDER' },
  ],
});

const makeForecastItems = () => {
  const items = [];
  const now = new Date('2024-12-01');
  for (let i = 0; i < 12; i++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() + i);
    const base = 40000 + Math.sin(i * 0.8) * 4000 + Math.random() * 2000;
    items.push({
      date: d.toISOString().slice(0, 10),
      expectedAmount: Math.round(base),
      lowerBound: Math.round(base * 0.87),
      upperBound: Math.round(base * 1.13),
    });
  }
  return items;
};

// ─── Procurement data factories ───────────────────────────────────────────────

const makeSuppliers = () => [
  { id: 'sup_001', name: 'Acme Corp',          category: 'IT Hardware',  spend: 148500, invoiceCount: 12, status: 'ACTIVE',  riskScore: 22 },
  { id: 'sup_002', name: 'Globex Ltd',          category: 'Consulting',   spend: 312000, invoiceCount: 8,  status: 'ACTIVE',  riskScore: 78 },
  { id: 'sup_003', name: 'Initech Solutions',   category: 'Software',     spend: 54200,  invoiceCount: 31, status: 'ACTIVE',  riskScore: 65 },
  { id: 'sup_004', name: 'Umbrella Consulting', category: 'Consulting',   spend: 28000,  invoiceCount: 4,  status: 'REVIEW',  riskScore: 55 },
  { id: 'sup_005', name: 'Veridian Dynamics',   category: 'Facilities',   spend: 18750,  invoiceCount: 1,  status: 'PENDING', riskScore: 48 },
  { id: 'sup_006', name: 'Soylent Corp',        category: 'Catering',     spend: 9800,   invoiceCount: 6,  status: 'ACTIVE',  riskScore: 85 },
  { id: 'sup_007', name: 'Initrode Global',     category: 'Logistics',    spend: 76400,  invoiceCount: 18, status: 'ACTIVE',  riskScore: 30 },
  { id: 'sup_008', name: 'Massive Dynamics',    category: 'R&D',          spend: 220000, invoiceCount: 5,  status: 'ACTIVE',  riskScore: 15 },
];

const makeDepartments = () => [
  { id: 'dept_eng',   name: 'Engineering', budget: 500000, spent: 387200, pipeline: 'pipeline_eng',   series: 'series_eng'   },
  { id: 'dept_ops',   name: 'Operations',  budget: 320000, spent: 298100, pipeline: 'pipeline_ops',   series: 'series_ops'   },
  { id: 'dept_sales', name: 'Sales',       budget: 180000, spent: 142600, pipeline: 'pipeline_sales', series: 'series_sales' },
  { id: 'dept_hr',    name: 'HR',          budget: 95000,  spent: 61800,  pipeline: 'pipeline_hr',    series: 'series_hr'    },
  { id: 'dept_it',    name: 'IT',          budget: 260000, spent: 241900, pipeline: 'pipeline_123',   series: 'series_456'   },
];

// ─── Mutable store ────────────────────────────────────────────────────────────

let store = {
  alerts: makeAlerts(),
  invoices: [],
  suppliers: makeSuppliers(),
  departments: makeDepartments(),
};

function resetStore() {
  store = {
    alerts: makeAlerts(),
    invoices: [],
    suppliers: makeSuppliers(),
    departments: makeDepartments(),
  };
}

// ─── Core ERP endpoints ───────────────────────────────────────────────────────

app.post('/sso/exchange', (_req, res) => {
  res.json({ token: 'fake-jwt-token-abc123' });
});

app.get('/alerts', (req, res) => {
  const { status, supplier, page = 0, size = 10 } = req.query;
  let list = store.alerts;
  if (status) list = list.filter(a => a.status === status);
  if (supplier) list = list.filter(a => a.supplier.toLowerCase().includes(supplier.toLowerCase()));
  const start = Number(page) * Number(size);
  res.json({
    items: list.slice(start, start + Number(size)),
    total: list.length,
    page: Number(page),
    size: Number(size),
    totalPages: Math.ceil(list.length / Number(size)),
  });
});

app.get('/alerts/:id', (req, res) => {
  const alert = store.alerts.find(a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

app.post('/feedback/:alertId', (req, res) => {
  const { action, comment } = req.body;
  const alert = store.alerts.find(a => a.id === req.params.alertId);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  if (!['CONFIRM', 'REJECT', 'IGNORE'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }
  alert.status = action === 'CONFIRM' ? 'CONFIRMED' : action === 'REJECT' ? 'REJECTED' : 'IGNORED';
  if (comment) alert.comment = comment;
  res.json({ status: 'ok', alertId: alert.id, newStatus: alert.status });
});

app.post('/pipelines/:id/invoices/check', (req, res) => {
  const { supplier, amount } = req.body;
  if (!supplier || amount == null) {
    return res.status(400).json({ error: 'supplier and amount are required' });
  }
  const base = Math.min(95, Math.max(10, 100 - (amount / 2000)));
  const noise = (Math.random() - 0.5) * 20;
  const score = Math.round(Math.min(100, Math.max(5, base + noise)));
  const severity = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  const explanations = {
    HIGH: `High anomaly score (${score}/100). The invoice amount of €${Number(amount).toLocaleString()} significantly exceeds the expected range for ${supplier}. Manual review recommended before payment.`,
    MEDIUM: `Moderate anomaly score (${score}/100). Invoice from ${supplier} shows some deviation from historical patterns. Consider verifying line items.`,
    LOW: `Low anomaly score (${score}/100). Invoice from ${supplier} for €${Number(amount).toLocaleString()} is within normal parameters.`,
  };
  setTimeout(() => res.json({ score, severity, explanation: explanations[severity] }), 600);
});

app.post('/pipelines/:id/invoices/confirm', (req, res) => {
  const { supplier, amount, date, label, extraFields, score } = req.body;
  if (!supplier || amount == null || !date) {
    return res.status(400).json({ error: 'supplier, amount, and date are required' });
  }
  const invoice = {
    id: `inv_${Date.now()}`,
    supplier, amount, date,
    label: label || '',
    extraFields: extraFields || {},
    score: score ?? null,
    savedAt: new Date().toISOString(),
  };
  store.invoices.push(invoice);
  // If supplier exists, bump their count
  const sup = store.suppliers.find(s => s.name === supplier);
  if (sup) { sup.invoiceCount += 1; sup.spend += Number(amount); }
  setTimeout(() => res.json(invoice), 400);
});

app.get('/pipelines/:pipelineId/series/:seriesId/budget', (req, res) => {
  const year = Number(req.query.year) || 2024;
  // For different pipelines, vary the data slightly
  const base = makeBudgetData(year);
  const dept = store.departments.find(d => d.pipeline === req.params.pipelineId);
  if (dept) {
    // Scale by dept budget ratio
    const ratio = dept.budget / 500000;
    base.months = base.months.map(m => ({
      ...m,
      actual: Math.round(m.actual * ratio),
      expected: Math.round(m.expected * ratio),
    }));
  }
  res.json(base);
});

app.get('/pipelines/:pipelineId/series/:seriesId/forecast', (req, res) => {
  const { page = 0, size = 12 } = req.query;
  const dept = store.departments.find(d => d.pipeline === req.params.pipelineId);
  const ratio = dept ? dept.budget / 500000 : 1;
  const all = makeForecastItems().map(it => ({
    ...it,
    expectedAmount: Math.round(it.expectedAmount * ratio),
    lowerBound: Math.round(it.lowerBound * ratio),
    upperBound: Math.round(it.upperBound * ratio),
  }));
  const start = Number(page) * Number(size);
  res.json({
    items: all.slice(start, start + Number(size)),
    total: all.length,
    page: Number(page),
    size: Number(size),
    totalPages: Math.ceil(all.length / Number(size)),
  });
});

app.post('/reset', (_req, res) => {
  resetStore();
  res.json({ status: 'reset ok' });
});

// ─── Procurement-specific endpoints ──────────────────────────────────────────

// Supplier list
app.get('/suppliers', (req, res) => {
  const { status, page = 0, size = 20 } = req.query;
  let list = store.suppliers;
  if (status) list = list.filter(s => s.status === status);
  const start = Number(page) * Number(size);
  res.json({
    items: list.slice(start, start + Number(size)),
    total: list.length,
    page: Number(page),
    totalPages: Math.ceil(list.length / Number(size)),
  });
});

// Supplier by id
app.get('/suppliers/:id', (req, res) => {
  const s = store.suppliers.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

// Approve / suspend supplier
app.post('/suppliers/:id/status', (req, res) => {
  const { status } = req.body;
  const s = store.suppliers.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  s.status = status;
  res.json(s);
});

// Departments list
app.get('/departments', (_req, res) => {
  res.json(store.departments);
});

// Invoices list (for procurement history)
app.get('/invoices', (req, res) => {
  const { supplier, page = 0, size = 10 } = req.query;
  let list = store.invoices;
  if (supplier) list = list.filter(i => i.supplier?.toLowerCase().includes(supplier.toLowerCase()));
  const start = Number(page) * Number(size);
  res.json({
    items: list.slice(start, start + Number(size)).reverse(),
    total: list.length,
    page: Number(page),
    totalPages: Math.ceil(list.length / Number(size)),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mock ERP backend running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /sso/exchange /alerts /feedback /pipelines /suppliers /departments /invoices /reset`);
});
