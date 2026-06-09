# AnomalyIQ Demo Data And Functional Logic Report

This document is for client-facing demo validation. It explains what static data exists in the demo, how invoice/order series are built, what rows are accepted, skipped, rejected, or filtered, and how the functional logic produces alerts and budget risk.

Source of truth: `src/store/staticData.js`

Related execution UI: `src/views/PipelinesView/PipelineRunReportDrawer.jsx`, `src/views/PipelinesView/PipelineWorkspaceView/CleaningStep.jsx`, `src/views/PipelinesView/PipelineWorkspaceView/ClusterEDAStep.jsx`, `src/views/PipelinesView/PipelineWorkspaceView/SeriesBuilder.jsx`, `src/views/PipelinesView/PipelineWorkspaceView/DetectionStep.jsx`

## 1. Demo Scope

The demo is built around one active ERP tenant, `whitecape_ask`, connected to Ask&Go ERP. A second raw tenant, `tenant_red`, exists only to prove tenant filtering and isolation.

| Area | Demo Value |
| --- | --- |
| Main ERP connector | Ask&Go ERP |
| Main active tenant | `whitecape_ask` |
| Filtered/out-of-scope tenant | `tenant_red` |
| Main pipeline types | `facture`, `commande` |
| Main source mode | JDBC mock/static data |
| Documentation source | `src/store/staticData.js` |

## 2. Static Data Inventory

| Static table | Section | Rows | Purpose |
| --- | --- | ---: | --- |
| `SUPPLIERS_TABLE` | Raw database | 4 | Supplier reference table |
| `CATEGORIES_TABLE` | Raw database | 5 | Category/service reference table |
| `FACTURES_TABLE` | Raw database | 120 | Raw invoices across tenants and years |
| `COMMANDES_TABLE` | Raw database | 116 | Raw purchase orders used for budget projection |
| `BUDGETS_TABLE` | Raw database | 3 | 2026 budget lines |
| `USERS_TABLE` | Raw database | 2 | Demo users/admin tenant accounts |
| `INVOICES_TABLE` | Derived frontend | 20 | 2026 Whitecape invoices displayed/analyzed in the app |
| `HISTORICAL_INVOICES_TABLE` | Derived frontend | 96 | 2024-2025 Whitecape historical invoices used as baseline |
| `COMMANDES_FRONTEND_TABLE` | Derived frontend | 116 | UI-friendly command/order records |
| `COMMAND_BUDGET_SERIES_TABLE` | Derived frontend | 3 | Budget projections by budget line |
| `CONNECTORS_TABLE` | Mock API | 2 | Backend-style connector DTOs |
| `TENANT_CONNECTIONS_TABLE` | Mock API | 1 | Tenant-to-ERP connection |
| `PIPELINES_TABLE` | Mock API | 2 | Active facture and commande pipelines |
| `ALERTS_TABLE` | Mock API | 4 | Seeded alert messages |
| `BUDGET_ANALYSIS_TABLE` | Mock API | 3 | Budget analysis rows |
| `CSV_DEMO_ROWS` | Mock API | 18 | CSV preview rows derived from invoices |
| `PIPELINE_LOGS_TABLE` | Mock API | 1 | Engine decision log |
| `ANOMALIES_TABLE` | Mock API | 0 | Explicit anomaly DTO table, currently empty because anomalies are derived from invoice rows |
| `SERIES_TABLE` | Mock API | 4 | Seeded statistical series summary |

## 3. Raw ERP Data

### 3.1 Suppliers

| supplier_code | supplier_name | Demo role |
| --- | --- | --- |
| `EAU` | `EAU_SAISON` | Seasonal water invoices |
| `FOURN` | `FOURNITURES_BUREAU` | Office/school supplies, budget-risk example |
| `TEL` | `TELECOM_FIBRE` | Telecom supplier with two services requiring fine grouping |
| `RED` | `FOURNISSEUR_RED` | Other tenant data, filtered out of Whitecape pipeline |

### 3.2 Categories

| category_code | category_name | Used by |
| --- | --- | --- |
| `EAU_CAT` | Eau potable | Water series |
| `FOURN_CAT` | Fournitures scolaires | Supplies series |
| `FIBRE_CAT` | Fibre Optique | Telecom fibre series |
| `INTERNET_CAT` | Internet ADSL | Telecom internet series |
| `RED_CAT` | Services RED | Other-tenant rows only |

### 3.3 Factures By Tenant

| tenant_id | Rows | Amount Total | Demo Handling |
| --- | ---: | ---: | --- |
| `whitecape_ask` | 116 | 17,790 EUR | Accepted into Whitecape tenant scope |
| `tenant_red` | 4 | 3,996 EUR | Filtered out by tenant condition |
| Total raw `FACTURES_TABLE` | 120 | 21,786 EUR | Raw source size |

### 3.4 2026 Whitecape Factures Used By The Demo UI

`INVOICES_TABLE` is derived from `FACTURES_TABLE` using this filter:

```text
tenant_id = whitecape_ask
date starts with 2026-
```

| Series | Rows | Amount Total | Notes |
| --- | ---: | ---: | --- |
| `EAU_SAISON | Eau potable` | 5 | 760 EUR | Contains March spike at 280 EUR |
| `FOURNITURES_BUREAU | Fournitures scolaires` | 5 | 660 EUR | Contains May spike at 260 EUR |
| `TELECOM_FIBRE | Fibre Optique` | 5 | 1,620 EUR | Contains April spike at 420 EUR |
| `TELECOM_FIBRE | Internet ADSL` | 5 | 250 EUR | Stable 50 EUR/month service |
| Total | 20 | 3,290 EUR | Analyzed current-year invoice dataset |

### 3.5 Historical Baseline

`HISTORICAL_INVOICES_TABLE` contains 96 rows from 2024 and 2025 for `whitecape_ask`. This baseline is used to demonstrate recurring behavior, normal monthly amounts, variability, and budget projection.

| Historical Years | Rows | Amount Total | Purpose |
| --- | ---: | ---: | --- |
| 2024-2025 | 96 | 14,500 EUR | Baseline for normal behavior and seasonality |

### 3.6 Out-Of-Scope Tenant Rows

The following raw rows exist to demonstrate tenant isolation. They are not part of the Whitecape invoice UI and are filtered out before analysis.

| facture_id | tenant_id | date | amount | supplier_code | category_code | Handling |
| --- | --- | --- | ---: | --- | --- | --- |
| `F-RED-2024-01` | `tenant_red` | 2024-01-15 | 999 EUR | `RED` | `RED_CAT` | Filtered out by tenant condition |
| `F-RED-2024-02` | `tenant_red` | 2024-02-15 | 999 EUR | `RED` | `RED_CAT` | Filtered out by tenant condition |
| `F-RED-2025-01` | `tenant_red` | 2025-01-15 | 999 EUR | `RED` | `RED_CAT` | Filtered out by tenant condition |
| `F-RED-2025-02` | `tenant_red` | 2025-02-15 | 999 EUR | `RED` | `RED_CAT` | Filtered out by tenant condition |

## 4. Pipeline Configuration

### 4.1 Facture Pipeline

| Property | Value |
| --- | --- |
| Template key | `facture` |
| Source tables | `factures`, `suppliers`, `categories` |
| Joins | `suppliers.supplier_code = factures.supplier_code`, `categories.category_code = factures.category_code` |
| Tenant condition | `factures.tenant_id = '${tenantCode}'` |
| Status condition | `factures.status IN ('RECU', 'COMPTABILISE')` |
| Grouping | supplier name + category name |
| Tolerance amount | 15% |
| Tolerance days | 45 days |

Required mapping:

| Target field | Source field |
| --- | --- |
| `invoiceId` | `factures.facture_id` |
| `supplierName` | `suppliers.supplier_name` |
| `invoiceDate` | `factures.date` |
| `amount` | `factures.amount` |
| `status` | `factures.status` |
| `label` | `categories.category_name` |

### 4.2 Commande Pipeline

| Property | Value |
| --- | --- |
| Template key | `commande` |
| Source tables | `commandes` |
| Condition | `commandes.status != 'ANNULE'` |
| Required grouping | `supplierName` |
| Tolerance amount | 10% |
| Tolerance days | 30 days |

Required mapping:

| Target field | Source field | Required |
| --- | --- | --- |
| `commandeRef` | `commandes.commande_id` | Yes |
| `commandeDate` | `commandes.date_cmd` | Yes |
| `amount` | `commandes.amount` | Yes |
| `supplierName` | `commandes.supplier_code` | Yes |
| `status` | `commandes.status` | Yes |
| `budgetCode` | `commandes.ligne_budgetaire` | No |
| `category` | `commandes.category` | No |

## 5. Step-By-Step Functional Logic

### 5.1 Step 1: Mapping

Purpose: map source columns to the canonical fields used by the engine.

| Check | Result In Demo |
| --- | --- |
| Invoice ID mapped | Yes |
| Date mapped | Yes |
| Amount mapped | Yes |
| Supplier mapped | Yes |
| Label/category mapped | Yes |
| Status mapped | Yes |
| Extra fields | Preserved as extra columns when present |

No rows are rejected at mapping time. Mapping validates the structure and tells later steps which fields should be used.

### 5.2 Step 2: Cleaning

Purpose: remove rows that cannot be safely analyzed.

Rules implemented in the workspace cleaning step:

| Rule | Rejection Reason |
| --- | --- |
| Amount must be present and numeric | `montant manquant` |
| Amount must be greater than 0 | `montant <= 0` |
| Required fields must not be empty when amount column is unavailable | `champ vide` |
| Date must be valid | Shown as a cleaning rule in UI/report |
| Supplier must be present | Shown as a cleaning rule in UI/report |

Demo execution report skipped rows:

| ref | Step | Field | Reason | Handling |
| --- | --- | --- | --- | --- |
| `F-MISC-2024-03` | Nettoyage | `amount` | Montant = 0.00 EUR | Ignored/skipped, not included in clean rows |
| `F-NULL-DATE-01` | Nettoyage | `invoiceDate` | Date absente | Ignored/skipped, not included in clean rows |
| `F-NOFOUR-05` | Nettoyage | `supplier` | Fournisseur manquant | Ignored/skipped, not included in clean rows |

Important distinction for the demo:

| Row Type | Exists In `staticData.js` Raw Tables | Exists In Execution Report | Purpose |
| --- | --- | --- | --- |
| `tenant_red` rows | Yes | No | Real static rows used to show tenant filtering |
| `F-MISC-2024-03` | No | Yes | Demo report example for zero amount skip |
| `F-NULL-DATE-01` | No | Yes | Demo report example for missing date skip |
| `F-NOFOUR-05` | No | Yes | Demo report example for missing supplier skip |

Cleaning KPI used in the run report for the facture pipeline:

| Metric | Value |
| --- | ---: |
| Clean rows analyzed | 20 |
| Demo skipped rows | 3 |
| Raw rows shown in execution report | 23 |
| Skipped rate in report | 13.04% |

### 5.3 Step 3: EDA And Distribution

Purpose: inspect invoice amounts and candidate grouping quality before creating final series.

| EDA Output | Demo Result |
| --- | --- |
| Candidate current-year invoice rows | 20 |
| Candidate supplier/category groups | 4 |
| Amount total | 3,290 EUR |
| Source anomalies marked on invoice rows | 3 |

EDA detects the important telecom case: one supplier, `TELECOM_FIBRE`, has two different stable behaviors. Fibre is around 300 EUR/month, while Internet ADSL is 50 EUR/month. If grouped by supplier only, these two services would create false positives. Therefore supplier + label is the correct grouping.

### 5.4 Step 4: Cluster Detection

Purpose: identify whether a supplier should be split into multiple series.

Engine behavior shown in the demo:

| Supplier | Candidate Grouping | Decision | Rejected Grouping | Why |
| --- | --- | --- | --- | --- |
| `TELECOM_FIBRE` | supplier only vs supplier + label | Choose supplier + label | supplier only | Two stable clusters exist: Fibre Optique and Internet ADSL |
| `FOURNITURES_BUREAU` | supplier + label | Keep supplier + label | None | CV is high, but this is a useful budget-risk signal |
| `EAU_SAISON` | supplier + label | Keep supplier + label | None | Seasonal water pattern remains interpretable |

Cluster-related ignored rows:

| Case | Demo Status |
| --- | --- |
| Automatic removal of tiny clusters | Implemented in `ClusterEDAStep` when a detected cluster size is below threshold `k` |
| Current seeded Whitecape current-year demo | No persisted tiny-cluster rows in `staticData.js` |
| Manual cluster removal | User can mark cluster rows ignored; IDs are passed to `wsAPI.ignoreInvoices(ids)` |

### 5.5 Step 5: Series Construction

Purpose: build statistical series from cleaned invoice rows.

Default grouping in the demo: supplier + label.

Formula used by local series builder:

```text
n = number of rows in group
mu = average(amount)
sigma = sqrt(average((amount - mu)^2))
cv = sigma / mu
flagged = cv > 0.25 OR n < 3
```

Seeded `SERIES_TABLE` used by mock API:

| id | Series | Supplier | Label | n | mu | sigma | cv | flagged | tolerance_pct |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | ---: |
| `mock-series-1` | `EAU_SAISON - Eau potable` | `EAU_SAISON` | Eau potable | 12 | 150.00 | 57.74 | 0.385 | true | 15 |
| `mock-series-2` | `FOURNITURES_BUREAU - Fournitures scolaires` | `FOURNITURES_BUREAU` | Fournitures scolaires | 12 | 104.17 | 92.47 | 0.888 | true | 15 |
| `mock-series-3` | `TELECOM_FIBRE - Fibre Optique` | `TELECOM_FIBRE` | Fibre Optique | 12 | 300.00 | 0.00 | 0.000 | false | 15 |
| `mock-series-4` | `TELECOM_FIBRE - Internet ADSL` | `TELECOM_FIBRE` | Internet ADSL | 12 | 50.00 | 0.00 | 0.000 | false | 15 |

Current-year 2026 rows used in dashboard analysis:

| Series | Current Rows | Current Amount Total | Observed Behavior |
| --- | ---: | ---: | --- |
| `EAU_SAISON - Eau potable` | 5 | 760 EUR | March amount spike |
| `FOURNITURES_BUREAU - Fournitures scolaires` | 5 | 660 EUR | May amount spike and budget risk |
| `TELECOM_FIBRE - Fibre Optique` | 5 | 1,620 EUR | April amount spike |
| `TELECOM_FIBRE - Internet ADSL` | 5 | 250 EUR | Stable monthly cost |

Series accepted/rejected status:

| Series | Accepted For Detection | Flagged For Review | Reason |
| --- | --- | --- | --- |
| `EAU_SAISON - Eau potable` | Yes | Yes | CV above threshold due to seasonal/spike behavior |
| `FOURNITURES_BUREAU - Fournitures scolaires` | Yes | Yes | High variability and budget risk |
| `TELECOM_FIBRE - Fibre Optique` | Yes | No | Stable baseline with one visible spike |
| `TELECOM_FIBRE - Internet ADSL` | Yes | No | Stable low-value recurring series |

No seeded series is rejected from detection. Flagged means it is retained but requires more careful interpretation.

### 5.6 Step 6: Configuration

| Config | Facture Pipeline | Commande Pipeline |
| --- | ---: | ---: |
| Amount tolerance | 15% | 10% |
| Days tolerance | 45 days | 30 days |
| Grouping required | Yes | Yes |
| Default facture grouping | Supplier + label | Not applicable |
| Default commande grouping | Not applicable | Supplier name |

### 5.7 Step 7: Detection

Purpose: compare incoming/current invoices against their historical series behavior.

Seeded current-year anomaly rows:

| invoice_id | Date | Supplier | Label | Amount | Type | Score | Why It Is A Demo Anomaly |
| --- | --- | --- | --- | ---: | --- | ---: | --- |
| `F-EAU-2026-03` | 2026-03-15 | `EAU_SAISON` | Eau potable | 280 EUR | `AMOUNT_SPIKE` | 0.96 | Water amount is much higher than regular 120 EUR months |
| `F-FOURN-2026-05` | 2026-05-10 | `FOURNITURES_BUREAU` | Fournitures scolaires | 260 EUR | `AMOUNT_SPIKE` | 0.96 | Supplies amount is much higher than regular 100 EUR/50 EUR months |
| `F-TEL-F-2026-04` | 2026-04-05 | `TELECOM_FIBRE` | Fibre Optique | 420 EUR | `AMOUNT_SPIKE` | 0.96 | Fibre invoice is above stable 300 EUR/month behavior |

Detection feedback handling:

| User Action | Stored Decision | Meaning |
| --- | --- | --- |
| Confirmer | `CONFIRMED` | Client agrees this is a true anomaly |
| Rejeter | `REJECTED` | Client marks alert as false positive |
| Ignorer | `IGNORED` | Client dismisses alert without confirming/rejecting |

Rejected alert rows in the demo are not pre-seeded. They are created only when the user clicks `Rejeter` during the demo. The UI tracks counts in `feedbackLog` as confirmed, rejected, and total log entries.

### 5.8 Step 8: Dashboard And Final Report

Execution report KPIs for the facture demo:

| KPI | Value |
| --- | ---: |
| Rows shown as imported/raw in execution report | 23 |
| Clean rows analyzed | 20 |
| Skipped rows | 3 |
| Series built | 4 |
| Detected anomalies | 3 |
| Status | `SUCCESS_WITH_WARNINGS` |

## 6. Budget And Commande Logic

`COMMANDES_TABLE` contains 116 purchase-order rows. `COMMAND_BUDGET_SERIES_TABLE` derives 2026 budget projection by budget line.

| Budget Code | Label | 2026 Orders | 2026 Realized | Remaining Forecast | Projection | Budget | Overrun | Status | Severity |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| `BUDGET_EAU` | Eau potable annuelle | 5 | 600 EUR | 1,200 EUR | 1,800 EUR | 2,160 EUR | 0 EUR | `ON_TRACK` | `info` |
| `BUDGET_FOURN` | Fournitures scolaires | 5 | 500 EUR | 750 EUR | 1,250 EUR | 1,000 EUR | 250 EUR | `BUDGET_OVERRUN` | `critical` |
| `BUDGET_TEL` | Telecom fibre + internet | 10 | 1,750 EUR | 2,450 EUR | 4,200 EUR | 4,200 EUR | 0 EUR | `ON_TRACK` | `info` |

Monthly historical profiles used for projection:

| Budget Code | Monthly Profile Jan-Dec |
| --- | --- |
| `BUDGET_EAU` | 120, 120, 120, 120, 120, 240, 240, 240, 120, 120, 120, 120 |
| `BUDGET_FOURN` | 100, 100, 100, 100, 100, 100, 50, 50, 400, 50, 50, 50 |
| `BUDGET_TEL` | 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350, 350 |

Budget-risk explanation for the client:

| Series | Logic |
| --- | --- |
| `BUDGET_FOURN` | Current consumption plus historical seasonality predicts 1,250 EUR by year end against 1,000 EUR budget, so the client sees a likely 250 EUR overrun |
| `BUDGET_EAU` | Water has seasonal summer peaks but remains under annual budget |
| `BUDGET_TEL` | Telecom spend is stable and reaches exactly the allocated annual budget |

## 7. CSV Demo Fixtures And Quality Cases

The app contains three CSV fixture descriptors for demo/import explanation.

| Fixture | File | Intended Quality Cases |
| --- | --- | --- |
| Factures Ask&Go mixed quality | `askgo_factures_mixed_quality.csv` | Duplicates, missing values, invalid dates, `tenant_red` rows |
| Commandes budget 2026 | `askgo_commandes_budget_2026.csv` | Budget code mapping, `BUDGET_FOURN` projection, invalid line |
| Generic expenses quality cases | `generic_expenses_quality_cases.csv` | Generic mapping and cleaning with different column names |

The actual static `CSV_DEMO_ROWS` table currently contains 18 derived invoice preview rows. The quality-case rows listed above are fixture metadata for the import demo narrative; the execution report uses the three skipped rows documented in section 5.2.

## 8. Complete Skipped, Rejected, And Filtered Row Matrix

| Stage | Row/Case | Count | Status | Client Explanation |
| --- | --- | ---: | --- | --- |
| Tenant filter | `tenant_red` factures | 4 | Filtered | Other tenant data exists in raw source but cannot enter Whitecape analysis |
| Cleaning | `F-MISC-2024-03` | 1 | Skipped | Amount is zero, unsafe for anomaly baseline |
| Cleaning | `F-NULL-DATE-01` | 1 | Skipped | Missing date, cannot place row in time series |
| Cleaning | `F-NOFOUR-05` | 1 | Skipped | Missing supplier, cannot assign row to a series |
| Cluster EDA | Tiny cluster below `k` threshold | 0 seeded rows | Potentially ignored | Logic exists, but no seeded static row currently triggers a persisted removal |
| Series builder | Low-volume or high-CV series | 2 seeded flagged series | Accepted with warning | The series remains usable but is marked for careful interpretation |
| Detection feedback | Client clicks `Rejeter` | 0 initially | Runtime rejected alert | Not pre-seeded; created during the live demo when user rejects an alert |
| Detection feedback | Client clicks `Ignorer` | 0 initially | Runtime ignored alert | Not pre-seeded; created during the live demo when user ignores an alert |

## 9. Client Demo Narrative

Use this sequence when presenting:

1. Show the ERP contains real-looking raw tables: suppliers, categories, factures, commandes, budgets.
2. Explain tenant isolation: `tenant_red` rows exist but are filtered out for `whitecape_ask`.
3. Show cleaning: three bad example rows are skipped because they cannot be trusted for statistical analysis.
4. Show EDA: telecom has two stable behaviors under one supplier, so supplier-only grouping is rejected.
5. Show series construction: four valid recurring series are built.
6. Show anomalies: three current-year invoices are flagged as amount spikes.
7. Show budget logic: supplies are projected above budget due to seasonal profile.
8. Show feedback: the client can confirm, reject, or ignore each alert to validate the model.

## 10. Validation Summary

| Question | Demo Answer |
| --- | --- |
| Do we have static demo data? | Yes, centralized in `src/store/staticData.js` |
| Do we show raw and derived data? | Yes, raw tables and derived frontend/API DTOs are both present |
| Do we explain skipped rows? | Yes, three cleaning skip examples are documented with reason and field |
| Do we explain rejected rows? | Yes, grouping rejection and runtime alert rejection are documented separately |
| Do we build series? | Yes, four invoice series and three budget series |
| Do we show why telecom is split? | Yes, fibre and internet have distinct stable amounts |
| Do we show anomalies? | Yes, three seeded amount spikes |
| Do we show budget risk? | Yes, `BUDGET_FOURN` projects a 250 EUR overrun |
