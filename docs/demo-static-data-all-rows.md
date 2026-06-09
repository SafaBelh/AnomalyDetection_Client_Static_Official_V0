# Demo Static Data - Full Row Listing

Source of truth: src/store/staticData.js

This appendix lists every row exposed by STATIC_DATA_REPORT. Complex nested values are shown as JSON.

## Table Index

| # | Table | Section | Rows | Columns |
| ---: | --- | --- | ---: | --- |
| 1 | SUPPLIERS_TABLE | Raw database | 4 | supplier_code, supplier_name |
| 2 | CATEGORIES_TABLE | Raw database | 5 | category_code, category_name |
| 3 | FACTURES_TABLE | Raw database | 120 | facture_id, tenant_id, date, status, amount, supplier_code, category_code |
| 4 | COMMANDES_TABLE | Raw database | 116 | commande_id, facture_id, date_cmd, amount, supplier_code, ligne_budgetaire, status |
| 5 | BUDGETS_TABLE | Raw database | 3 | budget_id, tenant_id, year, ligne_budgetaire, libelle, budget_alloue, montant_engage, montant_consomme, status |
| 6 | USERS_TABLE | Raw database | 2 | id, name, username, password, roles, isEngineAdmin, color, logo, automationEnabled |
| 7 | INVOICES_TABLE | Derived frontend | 20 | id, tenantId, tenant_id, invoiceId, reference, invoiceDate, date, supplier, supplierName, label, amount, status, anomalyType, anomalyScore, score, isFinal, accountingStatus |
| 8 | HISTORICAL_INVOICES_TABLE | Derived frontend | 96 | id, invoiceId, invoiceDate, date, supplier, supplierName, label, amount, status, isFinal |
| 9 | COMMANDES_FRONTEND_TABLE | Derived frontend | 116 | id, commandeRef, date, commandeDate, supplier, budgetCode, label, orderedAmount, receivedAmount, status, fiscalYear |
| 10 | COMMAND_BUDGET_SERIES_TABLE | Derived frontend | 3 | budgetCode, label, orderCount, totalCommandes, budgetAlloue, realizedAtJune, remainingForecast, projection, overrunAmount, status, severity, monthlyProfile |
| 11 | CONNECTORS_TABLE | Mock API | 2 | id, name, type, authType, description, publicKey, apiEndpoint, apiAuthHeader, apiAuthToken, jdbcUrl, jdbcUsername, jdbcPassword, driverClass, schemaTablesJson, fieldMappingJson, importStatusesJson, provisionalStatusesJson, finalStatusesJson, importStatusColumn, pipelineTemplatesJson, budgetTemplateJson, tenantDefaultsJson, mappingLocked, logo, color |
| 12 | TENANT_CONNECTIONS_TABLE | Mock API | 1 | id, tenantId, connectorId, externalId, active, notes, processedTemplatesJson, connectorName, connectorColor, connectorLogo, connectorType |
| 13 | PIPELINES_TABLE | Mock API | 2 | id, tenantId, name, sourceType, status, active, templateKey, isCustom, connectorId, externalId, lastRunAt, lastRunStats, configJson |
| 14 | ALERTS_TABLE | Mock API | 4 | id, tenantId, type, status, severity, anomalyScore, invoiceRef, message, detectedAt, explanation |
| 15 | BUDGET_ANALYSIS_TABLE | Mock API | 3 | budgetCode, label, budgetAlloue, totalCommandes, taux, status, prediction, projection, overrunAmount, message |
| 16 | CSV_DEMO_ROWS | Mock API | 18 | invoice_ref, invoice_date, amount, supplier_code, label, status, extra_comment |
| 17 | PIPELINE_LOGS_TABLE | Mock API | 1 | id, category, supplier, status, reason, createdAt |
| 18 | ANOMALIES_TABLE | Mock API | 0 |  |
| 19 | SERIES_TABLE | Mock API | 4 | id, name, supplier, label, n, mu, sigma, cv, flagged, tolerance_pct |
| 20 | DEMO_CONNECTORS | Configuration | 2 | id, name, logo, color, category, status, authType, description, jdbcUrl, jdbcUsername, jdbcPassword, connectionType, publicKey, apiEndpoint, apiAuthToken, connectorType, selectedTables, pipelines, tableRoles, budgetSourceTables, budgetAmountCols, budgetFormula, budgetPreset, budgetAgg, tenants, customPipelines, generatedData, issuer, audience, algorithm, jdbcDriverClassName |
| 21 | CONNECTOR_CONFIG | Configuration | 8 | key, detail |
| 22 | AUTH_FIELDS | Configuration | 6 | key, detail |
| 23 | PIPELINE_DEFS | Configuration | 2 | key, detail |
| 24 | GENERIC_SCHEMA | Configuration | 2 | key, detail |
| 25 | CSV_SOURCE_PRESETS | Configuration | 3 | type, label, name, tableName, cols, rowCount |
| 26 | MOCK_SCHEMAS | Configuration | 2 | key, detail |
| 27 | BUDGET_PRESETS | Configuration | 3 | key, detail |
| 28 | SETTINGS_DEFAULTS | UI constants | 8 | key, detail |
| 29 | SETTINGS_OPTIONS | UI constants | 4 | key, detail |
| 30 | TABLE_PALETTE | UI constants | 8 | fill, light, dark |
| 31 | ERD_OFFSETS | UI constants | 7 | x, y |
| 32 | CUSTOM_PIPELINE_COLORS | UI constants | 6 | value |
| 33 | WIZARD_STEPS | UI constants | 8 | label, desc, Icon |
| 34 | WS_MAPPING_DEMO_COLUMNS | UI constants | 8 | value |
| 35 | WS_MAPPING_CORE_FIELDS | UI constants | 7 | k, lbl, req, hint |
| 36 | CSV_IMPORT_SEQUENCE | UI constants | 13 | delay, text, color |
| 37 | PIPELINE_CSV_FIXTURES | UI constants | 3 | name, file, desc, mapping |
| 38 | ADMIN_TENANT_TYPE_DEFS | UI constants | 3 | type, role, colorKey, fallback |
| 39 | ADMIN_PIPELINE_STATUS_DEFS | UI constants | 3 | status, matches, colorKey |
| 40 | ADMIN_RADAR_METRICS | UI constants | 5 | value |
| 41 | PIPELINE_DASHBOARD_RADAR_METRICS | UI constants | 5 | metric, fullMark |
| 42 | ML_RADAR_METRICS | UI constants | 5 | metric, fullMark |
| 43 | CONNECTOR_LABELS | UI constants | 2 | key, detail |
| 44 | INTEGRATION_CATEGORIES | UI constants | 5 | id, label |
| 45 | INTEGRATION_CONNECTION_TYPES | UI constants | 3 | id, label, icon, desc |
| 46 | INTEGRATION_JOIN_TYPES | UI constants | 4 | value |
| 47 | VISUAL_JOIN_PALETTE | UI constants | 5 | bg, border, text |
| 48 | INTEGRATION_REPORT_FALLBACK_TENANTS | UI constants | 3 | id, label, active, platformTenantName, pipelines |
| 49 | DEFAULT_API_RESOURCE | UI constants | 3 | key, detail |
| 50 | ALERT_TABS | UI constants | 5 | id, label |
| 51 | MONTH_NAMES_FR | UI constants | 12 | value |
| 52 | BUDGET_TABS | UI constants | 4 | id, label |
| 53 | JSON_IMPORT_TEMPLATE | UI constants | 7 | key, detail |
| 54 | DERIVED_ANOMALY_DEFAULTS | UI constants | 4 | key, detail |

## 1. SUPPLIERS_TABLE

Raw fournisseurs ERP.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 4 |
| Columns | supplier_code, supplier_name |

| # | supplier_code | supplier_name |
| ---: | --- | --- |
| 1 | EAU | EAU_SAISON |
| 2 | FOURN | FOURNITURES_BUREAU |
| 3 | TEL | TELECOM_FIBRE |
| 4 | RED | FOURNISSEUR_RED |

## 2. CATEGORIES_TABLE

Raw categories ERP.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 5 |
| Columns | category_code, category_name |

| # | category_code | category_name |
| ---: | --- | --- |
| 1 | EAU_CAT | Eau potable |
| 2 | FOURN_CAT | Fournitures scolaires |
| 3 | FIBRE_CAT | Fibre Optique |
| 4 | INTERNET_CAT | Internet ADSL |
| 5 | RED_CAT | Services RED |

## 3. FACTURES_TABLE

Raw factures ERP, incluant historiques et tenants demo.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 120 |
| Columns | facture_id, tenant_id, date, status, amount, supplier_code, category_code |

| # | facture_id | tenant_id | date | status | amount | supplier_code | category_code |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | F-EAU-2024-01 | whitecape_ask | 2024-01-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 2 | F-EAU-2024-02 | whitecape_ask | 2024-02-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 3 | F-EAU-2024-03 | whitecape_ask | 2024-03-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 4 | F-EAU-2024-04 | whitecape_ask | 2024-04-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 5 | F-EAU-2024-05 | whitecape_ask | 2024-05-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 6 | F-EAU-2024-06 | whitecape_ask | 2024-06-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 7 | F-EAU-2024-07 | whitecape_ask | 2024-07-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 8 | F-EAU-2024-08 | whitecape_ask | 2024-08-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 9 | F-EAU-2024-09 | whitecape_ask | 2024-09-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 10 | F-EAU-2024-10 | whitecape_ask | 2024-10-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 11 | F-EAU-2024-11 | whitecape_ask | 2024-11-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 12 | F-EAU-2024-12 | whitecape_ask | 2024-12-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 13 | F-FOURN-2024-01 | whitecape_ask | 2024-01-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 14 | F-FOURN-2024-02 | whitecape_ask | 2024-02-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 15 | F-FOURN-2024-03 | whitecape_ask | 2024-03-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 16 | F-FOURN-2024-04 | whitecape_ask | 2024-04-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 17 | F-FOURN-2024-05 | whitecape_ask | 2024-05-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 18 | F-FOURN-2024-06 | whitecape_ask | 2024-06-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 19 | F-FOURN-2024-07 | whitecape_ask | 2024-07-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 20 | F-FOURN-2024-08 | whitecape_ask | 2024-08-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 21 | F-FOURN-2024-09 | whitecape_ask | 2024-09-10 | COMPTABILISE | 400 | FOURN | FOURN_CAT |
| 22 | F-FOURN-2024-10 | whitecape_ask | 2024-10-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 23 | F-FOURN-2024-11 | whitecape_ask | 2024-11-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 24 | F-FOURN-2024-12 | whitecape_ask | 2024-12-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 25 | F-TEL-F-2024-01 | whitecape_ask | 2024-01-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 26 | F-TEL-I-2024-01 | whitecape_ask | 2024-01-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 27 | F-TEL-F-2024-02 | whitecape_ask | 2024-02-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 28 | F-TEL-I-2024-02 | whitecape_ask | 2024-02-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 29 | F-TEL-F-2024-03 | whitecape_ask | 2024-03-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 30 | F-TEL-I-2024-03 | whitecape_ask | 2024-03-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 31 | F-TEL-F-2024-04 | whitecape_ask | 2024-04-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 32 | F-TEL-I-2024-04 | whitecape_ask | 2024-04-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 33 | F-TEL-F-2024-05 | whitecape_ask | 2024-05-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 34 | F-TEL-I-2024-05 | whitecape_ask | 2024-05-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 35 | F-TEL-F-2024-06 | whitecape_ask | 2024-06-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 36 | F-TEL-I-2024-06 | whitecape_ask | 2024-06-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 37 | F-TEL-F-2024-07 | whitecape_ask | 2024-07-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 38 | F-TEL-I-2024-07 | whitecape_ask | 2024-07-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 39 | F-TEL-F-2024-08 | whitecape_ask | 2024-08-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 40 | F-TEL-I-2024-08 | whitecape_ask | 2024-08-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 41 | F-TEL-F-2024-09 | whitecape_ask | 2024-09-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 42 | F-TEL-I-2024-09 | whitecape_ask | 2024-09-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 43 | F-TEL-F-2024-10 | whitecape_ask | 2024-10-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 44 | F-TEL-I-2024-10 | whitecape_ask | 2024-10-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 45 | F-TEL-F-2024-11 | whitecape_ask | 2024-11-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 46 | F-TEL-I-2024-11 | whitecape_ask | 2024-11-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 47 | F-TEL-F-2024-12 | whitecape_ask | 2024-12-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 48 | F-TEL-I-2024-12 | whitecape_ask | 2024-12-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 49 | F-EAU-2025-01 | whitecape_ask | 2025-01-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 50 | F-EAU-2025-02 | whitecape_ask | 2025-02-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 51 | F-EAU-2025-03 | whitecape_ask | 2025-03-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 52 | F-EAU-2025-04 | whitecape_ask | 2025-04-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 53 | F-EAU-2025-05 | whitecape_ask | 2025-05-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 54 | F-EAU-2025-06 | whitecape_ask | 2025-06-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 55 | F-EAU-2025-07 | whitecape_ask | 2025-07-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 56 | F-EAU-2025-08 | whitecape_ask | 2025-08-15 | COMPTABILISE | 240 | EAU | EAU_CAT |
| 57 | F-EAU-2025-09 | whitecape_ask | 2025-09-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 58 | F-EAU-2025-10 | whitecape_ask | 2025-10-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 59 | F-EAU-2025-11 | whitecape_ask | 2025-11-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 60 | F-EAU-2025-12 | whitecape_ask | 2025-12-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 61 | F-FOURN-2025-01 | whitecape_ask | 2025-01-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 62 | F-FOURN-2025-02 | whitecape_ask | 2025-02-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 63 | F-FOURN-2025-03 | whitecape_ask | 2025-03-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 64 | F-FOURN-2025-04 | whitecape_ask | 2025-04-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 65 | F-FOURN-2025-05 | whitecape_ask | 2025-05-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 66 | F-FOURN-2025-06 | whitecape_ask | 2025-06-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 67 | F-FOURN-2025-07 | whitecape_ask | 2025-07-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 68 | F-FOURN-2025-08 | whitecape_ask | 2025-08-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 69 | F-FOURN-2025-09 | whitecape_ask | 2025-09-10 | COMPTABILISE | 400 | FOURN | FOURN_CAT |
| 70 | F-FOURN-2025-10 | whitecape_ask | 2025-10-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 71 | F-FOURN-2025-11 | whitecape_ask | 2025-11-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 72 | F-FOURN-2025-12 | whitecape_ask | 2025-12-10 | COMPTABILISE | 50 | FOURN | FOURN_CAT |
| 73 | F-TEL-F-2025-01 | whitecape_ask | 2025-01-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 74 | F-TEL-I-2025-01 | whitecape_ask | 2025-01-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 75 | F-TEL-F-2025-02 | whitecape_ask | 2025-02-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 76 | F-TEL-I-2025-02 | whitecape_ask | 2025-02-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 77 | F-TEL-F-2025-03 | whitecape_ask | 2025-03-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 78 | F-TEL-I-2025-03 | whitecape_ask | 2025-03-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 79 | F-TEL-F-2025-04 | whitecape_ask | 2025-04-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 80 | F-TEL-I-2025-04 | whitecape_ask | 2025-04-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 81 | F-TEL-F-2025-05 | whitecape_ask | 2025-05-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 82 | F-TEL-I-2025-05 | whitecape_ask | 2025-05-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 83 | F-TEL-F-2025-06 | whitecape_ask | 2025-06-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 84 | F-TEL-I-2025-06 | whitecape_ask | 2025-06-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 85 | F-TEL-F-2025-07 | whitecape_ask | 2025-07-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 86 | F-TEL-I-2025-07 | whitecape_ask | 2025-07-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 87 | F-TEL-F-2025-08 | whitecape_ask | 2025-08-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 88 | F-TEL-I-2025-08 | whitecape_ask | 2025-08-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 89 | F-TEL-F-2025-09 | whitecape_ask | 2025-09-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 90 | F-TEL-I-2025-09 | whitecape_ask | 2025-09-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 91 | F-TEL-F-2025-10 | whitecape_ask | 2025-10-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 92 | F-TEL-I-2025-10 | whitecape_ask | 2025-10-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 93 | F-TEL-F-2025-11 | whitecape_ask | 2025-11-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 94 | F-TEL-I-2025-11 | whitecape_ask | 2025-11-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 95 | F-TEL-F-2025-12 | whitecape_ask | 2025-12-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 96 | F-TEL-I-2025-12 | whitecape_ask | 2025-12-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 97 | F-EAU-2026-01 | whitecape_ask | 2026-01-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 98 | F-EAU-2026-02 | whitecape_ask | 2026-02-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 99 | F-EAU-2026-03 | whitecape_ask | 2026-03-15 | COMPTABILISE | 280 | EAU | EAU_CAT |
| 100 | F-EAU-2026-04 | whitecape_ask | 2026-04-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 101 | F-EAU-2026-05 | whitecape_ask | 2026-05-15 | COMPTABILISE | 120 | EAU | EAU_CAT |
| 102 | F-FOURN-2026-01 | whitecape_ask | 2026-01-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 103 | F-FOURN-2026-02 | whitecape_ask | 2026-02-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 104 | F-FOURN-2026-03 | whitecape_ask | 2026-03-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 105 | F-FOURN-2026-04 | whitecape_ask | 2026-04-10 | COMPTABILISE | 100 | FOURN | FOURN_CAT |
| 106 | F-FOURN-2026-05 | whitecape_ask | 2026-05-10 | COMPTABILISE | 260 | FOURN | FOURN_CAT |
| 107 | F-TEL-F-2026-01 | whitecape_ask | 2026-01-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 108 | F-TEL-I-2026-01 | whitecape_ask | 2026-01-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 109 | F-TEL-F-2026-02 | whitecape_ask | 2026-02-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 110 | F-TEL-I-2026-02 | whitecape_ask | 2026-02-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 111 | F-TEL-F-2026-03 | whitecape_ask | 2026-03-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 112 | F-TEL-I-2026-03 | whitecape_ask | 2026-03-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 113 | F-TEL-F-2026-04 | whitecape_ask | 2026-04-05 | COMPTABILISE | 420 | TEL | FIBRE_CAT |
| 114 | F-TEL-I-2026-04 | whitecape_ask | 2026-04-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 115 | F-TEL-F-2026-05 | whitecape_ask | 2026-05-05 | COMPTABILISE | 300 | TEL | FIBRE_CAT |
| 116 | F-TEL-I-2026-05 | whitecape_ask | 2026-05-05 | COMPTABILISE | 50 | TEL | INTERNET_CAT |
| 117 | F-RED-2024-01 | tenant_red | 2024-01-15 | COMPTABILISE | 999 | RED | RED_CAT |
| 118 | F-RED-2024-02 | tenant_red | 2024-02-15 | COMPTABILISE | 999 | RED | RED_CAT |
| 119 | F-RED-2025-01 | tenant_red | 2025-01-15 | COMPTABILISE | 999 | RED | RED_CAT |
| 120 | F-RED-2025-02 | tenant_red | 2025-02-15 | COMPTABILISE | 999 | RED | RED_CAT |

## 4. COMMANDES_TABLE

Raw commandes ERP utilisees par le pipeline budget.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 116 |
| Columns | commande_id, facture_id, date_cmd, amount, supplier_code, ligne_budgetaire, status |

| # | commande_id | facture_id | date_cmd | amount | supplier_code | ligne_budgetaire | status |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | C-EAU-2024-01 | F-EAU-2024-01 | 2024-01-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 2 | C-EAU-2024-02 | F-EAU-2024-02 | 2024-02-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 3 | C-EAU-2024-03 | F-EAU-2024-03 | 2024-03-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 4 | C-EAU-2024-04 | F-EAU-2024-04 | 2024-04-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 5 | C-EAU-2024-05 | F-EAU-2024-05 | 2024-05-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 6 | C-EAU-2024-06 | F-EAU-2024-06 | 2024-06-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 7 | C-EAU-2024-07 | F-EAU-2024-07 | 2024-07-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 8 | C-EAU-2024-08 | F-EAU-2024-08 | 2024-08-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 9 | C-EAU-2024-09 | F-EAU-2024-09 | 2024-09-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 10 | C-EAU-2024-10 | F-EAU-2024-10 | 2024-10-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 11 | C-EAU-2024-11 | F-EAU-2024-11 | 2024-11-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 12 | C-EAU-2024-12 | F-EAU-2024-12 | 2024-12-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 13 | C-FOURN-2024-01 | F-FOURN-2024-01 | 2024-01-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 14 | C-FOURN-2024-02 | F-FOURN-2024-02 | 2024-02-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 15 | C-FOURN-2024-03 | F-FOURN-2024-03 | 2024-03-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 16 | C-FOURN-2024-04 | F-FOURN-2024-04 | 2024-04-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 17 | C-FOURN-2024-05 | F-FOURN-2024-05 | 2024-05-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 18 | C-FOURN-2024-06 | F-FOURN-2024-06 | 2024-06-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 19 | C-FOURN-2024-07 | F-FOURN-2024-07 | 2024-07-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 20 | C-FOURN-2024-08 | F-FOURN-2024-08 | 2024-08-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 21 | C-FOURN-2024-09 | F-FOURN-2024-09 | 2024-09-10 | 400 | FOURN | BUDGET_FOURN | LIVRE |
| 22 | C-FOURN-2024-10 | F-FOURN-2024-10 | 2024-10-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 23 | C-FOURN-2024-11 | F-FOURN-2024-11 | 2024-11-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 24 | C-FOURN-2024-12 | F-FOURN-2024-12 | 2024-12-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 25 | C-TEL-F-2024-01 | F-TEL-F-2024-01 | 2024-01-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 26 | C-TEL-I-2024-01 | F-TEL-I-2024-01 | 2024-01-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 27 | C-TEL-F-2024-02 | F-TEL-F-2024-02 | 2024-02-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 28 | C-TEL-I-2024-02 | F-TEL-I-2024-02 | 2024-02-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 29 | C-TEL-F-2024-03 | F-TEL-F-2024-03 | 2024-03-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 30 | C-TEL-I-2024-03 | F-TEL-I-2024-03 | 2024-03-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 31 | C-TEL-F-2024-04 | F-TEL-F-2024-04 | 2024-04-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 32 | C-TEL-I-2024-04 | F-TEL-I-2024-04 | 2024-04-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 33 | C-TEL-F-2024-05 | F-TEL-F-2024-05 | 2024-05-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 34 | C-TEL-I-2024-05 | F-TEL-I-2024-05 | 2024-05-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 35 | C-TEL-F-2024-06 | F-TEL-F-2024-06 | 2024-06-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 36 | C-TEL-I-2024-06 | F-TEL-I-2024-06 | 2024-06-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 37 | C-TEL-F-2024-07 | F-TEL-F-2024-07 | 2024-07-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 38 | C-TEL-I-2024-07 | F-TEL-I-2024-07 | 2024-07-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 39 | C-TEL-F-2024-08 | F-TEL-F-2024-08 | 2024-08-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 40 | C-TEL-I-2024-08 | F-TEL-I-2024-08 | 2024-08-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 41 | C-TEL-F-2024-09 | F-TEL-F-2024-09 | 2024-09-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 42 | C-TEL-I-2024-09 | F-TEL-I-2024-09 | 2024-09-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 43 | C-TEL-F-2024-10 | F-TEL-F-2024-10 | 2024-10-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 44 | C-TEL-I-2024-10 | F-TEL-I-2024-10 | 2024-10-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 45 | C-TEL-F-2024-11 | F-TEL-F-2024-11 | 2024-11-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 46 | C-TEL-I-2024-11 | F-TEL-I-2024-11 | 2024-11-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 47 | C-TEL-F-2024-12 | F-TEL-F-2024-12 | 2024-12-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 48 | C-TEL-I-2024-12 | F-TEL-I-2024-12 | 2024-12-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 49 | C-EAU-2025-01 | F-EAU-2025-01 | 2025-01-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 50 | C-EAU-2025-02 | F-EAU-2025-02 | 2025-02-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 51 | C-EAU-2025-03 | F-EAU-2025-03 | 2025-03-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 52 | C-EAU-2025-04 | F-EAU-2025-04 | 2025-04-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 53 | C-EAU-2025-05 | F-EAU-2025-05 | 2025-05-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 54 | C-EAU-2025-06 | F-EAU-2025-06 | 2025-06-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 55 | C-EAU-2025-07 | F-EAU-2025-07 | 2025-07-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 56 | C-EAU-2025-08 | F-EAU-2025-08 | 2025-08-15 | 240 | EAU | BUDGET_EAU | LIVRE |
| 57 | C-EAU-2025-09 | F-EAU-2025-09 | 2025-09-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 58 | C-EAU-2025-10 | F-EAU-2025-10 | 2025-10-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 59 | C-EAU-2025-11 | F-EAU-2025-11 | 2025-11-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 60 | C-EAU-2025-12 | F-EAU-2025-12 | 2025-12-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 61 | C-FOURN-2025-01 | F-FOURN-2025-01 | 2025-01-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 62 | C-FOURN-2025-02 | F-FOURN-2025-02 | 2025-02-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 63 | C-FOURN-2025-03 | F-FOURN-2025-03 | 2025-03-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 64 | C-FOURN-2025-04 | F-FOURN-2025-04 | 2025-04-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 65 | C-FOURN-2025-05 | F-FOURN-2025-05 | 2025-05-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 66 | C-FOURN-2025-06 | F-FOURN-2025-06 | 2025-06-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 67 | C-FOURN-2025-07 | F-FOURN-2025-07 | 2025-07-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 68 | C-FOURN-2025-08 | F-FOURN-2025-08 | 2025-08-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 69 | C-FOURN-2025-09 | F-FOURN-2025-09 | 2025-09-10 | 400 | FOURN | BUDGET_FOURN | LIVRE |
| 70 | C-FOURN-2025-10 | F-FOURN-2025-10 | 2025-10-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 71 | C-FOURN-2025-11 | F-FOURN-2025-11 | 2025-11-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 72 | C-FOURN-2025-12 | F-FOURN-2025-12 | 2025-12-10 | 50 | FOURN | BUDGET_FOURN | LIVRE |
| 73 | C-TEL-F-2025-01 | F-TEL-F-2025-01 | 2025-01-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 74 | C-TEL-I-2025-01 | F-TEL-I-2025-01 | 2025-01-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 75 | C-TEL-F-2025-02 | F-TEL-F-2025-02 | 2025-02-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 76 | C-TEL-I-2025-02 | F-TEL-I-2025-02 | 2025-02-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 77 | C-TEL-F-2025-03 | F-TEL-F-2025-03 | 2025-03-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 78 | C-TEL-I-2025-03 | F-TEL-I-2025-03 | 2025-03-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 79 | C-TEL-F-2025-04 | F-TEL-F-2025-04 | 2025-04-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 80 | C-TEL-I-2025-04 | F-TEL-I-2025-04 | 2025-04-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 81 | C-TEL-F-2025-05 | F-TEL-F-2025-05 | 2025-05-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 82 | C-TEL-I-2025-05 | F-TEL-I-2025-05 | 2025-05-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 83 | C-TEL-F-2025-06 | F-TEL-F-2025-06 | 2025-06-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 84 | C-TEL-I-2025-06 | F-TEL-I-2025-06 | 2025-06-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 85 | C-TEL-F-2025-07 | F-TEL-F-2025-07 | 2025-07-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 86 | C-TEL-I-2025-07 | F-TEL-I-2025-07 | 2025-07-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 87 | C-TEL-F-2025-08 | F-TEL-F-2025-08 | 2025-08-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 88 | C-TEL-I-2025-08 | F-TEL-I-2025-08 | 2025-08-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 89 | C-TEL-F-2025-09 | F-TEL-F-2025-09 | 2025-09-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 90 | C-TEL-I-2025-09 | F-TEL-I-2025-09 | 2025-09-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 91 | C-TEL-F-2025-10 | F-TEL-F-2025-10 | 2025-10-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 92 | C-TEL-I-2025-10 | F-TEL-I-2025-10 | 2025-10-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 93 | C-TEL-F-2025-11 | F-TEL-F-2025-11 | 2025-11-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 94 | C-TEL-I-2025-11 | F-TEL-I-2025-11 | 2025-11-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 95 | C-TEL-F-2025-12 | F-TEL-F-2025-12 | 2025-12-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 96 | C-TEL-I-2025-12 | F-TEL-I-2025-12 | 2025-12-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 97 | C-EAU-2026-01 | F-EAU-2026-01 | 2026-01-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 98 | C-EAU-2026-02 | F-EAU-2026-02 | 2026-02-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 99 | C-EAU-2026-03 | F-EAU-2026-03 | 2026-03-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 100 | C-EAU-2026-04 | F-EAU-2026-04 | 2026-04-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 101 | C-EAU-2026-05 | F-EAU-2026-05 | 2026-05-15 | 120 | EAU | BUDGET_EAU | LIVRE |
| 102 | C-FOURN-2026-01 | F-FOURN-2026-01 | 2026-01-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 103 | C-FOURN-2026-02 | F-FOURN-2026-02 | 2026-02-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 104 | C-FOURN-2026-03 | F-FOURN-2026-03 | 2026-03-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 105 | C-FOURN-2026-04 | F-FOURN-2026-04 | 2026-04-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 106 | C-FOURN-2026-05 | F-FOURN-2026-05 | 2026-05-10 | 100 | FOURN | BUDGET_FOURN | LIVRE |
| 107 | C-TEL-F-2026-01 | F-TEL-F-2026-01 | 2026-01-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 108 | C-TEL-I-2026-01 | F-TEL-I-2026-01 | 2026-01-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 109 | C-TEL-F-2026-02 | F-TEL-F-2026-02 | 2026-02-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 110 | C-TEL-I-2026-02 | F-TEL-I-2026-02 | 2026-02-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 111 | C-TEL-F-2026-03 | F-TEL-F-2026-03 | 2026-03-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 112 | C-TEL-I-2026-03 | F-TEL-I-2026-03 | 2026-03-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 113 | C-TEL-F-2026-04 | F-TEL-F-2026-04 | 2026-04-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 114 | C-TEL-I-2026-04 | F-TEL-I-2026-04 | 2026-04-05 | 50 | TEL | BUDGET_TEL | LIVRE |
| 115 | C-TEL-F-2026-05 | F-TEL-F-2026-05 | 2026-05-05 | 300 | TEL | BUDGET_TEL | LIVRE |
| 116 | C-TEL-I-2026-05 | F-TEL-I-2026-05 | 2026-05-05 | 50 | TEL | BUDGET_TEL | LIVRE |

## 5. BUDGETS_TABLE

Raw lignes budgetaires.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 3 |
| Columns | budget_id, tenant_id, year, ligne_budgetaire, libelle, budget_alloue, montant_engage, montant_consomme, status |

| # | budget_id | tenant_id | year | ligne_budgetaire | libelle | budget_alloue | montant_engage | montant_consomme | status |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | B-EAU-2026 | whitecape_ask | 2026 | BUDGET_EAU | Eau potable annuelle | 2160 | 0 | 0 | ACTIF |
| 2 | B-FOURN-2026 | whitecape_ask | 2026 | BUDGET_FOURN | Fournitures scolaires | 1000 | 0 | 0 | ACTIF |
| 3 | B-TEL-2026 | whitecape_ask | 2026 | BUDGET_TEL | Telecom fibre + internet | 4200 | 0 | 0 | ACTIF |

## 6. USERS_TABLE

Comptes demo plateforme et tenant.

| Property | Value |
| --- | --- |
| Section | Raw database |
| Row count | 2 |
| Columns | id, name, username, password, roles, isEngineAdmin, color, logo, automationEnabled |

| # | id | name | username | password | roles | isEngineAdmin | color | logo | automationEnabled |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-uuid-1 | Administrateur | admin | admin123 | ["ADMIN"] | true | #D94F3D | - | - |
| 2 | mock-uuid-2 | Whitecape Technology | whitecapeTech | @whitecapeTech123 | ["TENANT"] | false | #3B82F6 | WH | true |

## 7. INVOICES_TABLE

Factures mappees pour les vues frontend.

| Property | Value |
| --- | --- |
| Section | Derived frontend |
| Row count | 20 |
| Columns | id, tenantId, tenant_id, invoiceId, reference, invoiceDate, date, supplier, supplierName, label, amount, status, anomalyType, anomalyScore, score, isFinal, accountingStatus |

| # | id | tenantId | tenant_id | invoiceId | reference | invoiceDate | date | supplier | supplierName | label | amount | status | anomalyType | anomalyScore | score | isFinal | accountingStatus |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | F-EAU-2026-01 | mock-uuid-2 | whitecape_ask | F-EAU-2026-01 | F-EAU-2026-01 | 2026-01-15 | 2026-01-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | - | - | - | true | VALIDATED |
| 2 | F-EAU-2026-02 | mock-uuid-2 | whitecape_ask | F-EAU-2026-02 | F-EAU-2026-02 | 2026-02-15 | 2026-02-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | - | - | - | true | VALIDATED |
| 3 | F-EAU-2026-03 | mock-uuid-2 | whitecape_ask | F-EAU-2026-03 | F-EAU-2026-03 | 2026-03-15 | 2026-03-15 | EAU_SAISON | EAU_SAISON | Eau potable | 280 | anomaly | AMOUNT_SPIKE | 0.96 | 0.96 | true | VALIDATED |
| 4 | F-EAU-2026-04 | mock-uuid-2 | whitecape_ask | F-EAU-2026-04 | F-EAU-2026-04 | 2026-04-15 | 2026-04-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | - | - | - | true | VALIDATED |
| 5 | F-EAU-2026-05 | mock-uuid-2 | whitecape_ask | F-EAU-2026-05 | F-EAU-2026-05 | 2026-05-15 | 2026-05-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | - | - | - | true | VALIDATED |
| 6 | F-FOURN-2026-01 | mock-uuid-2 | whitecape_ask | F-FOURN-2026-01 | F-FOURN-2026-01 | 2026-01-10 | 2026-01-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | - | - | - | true | VALIDATED |
| 7 | F-FOURN-2026-02 | mock-uuid-2 | whitecape_ask | F-FOURN-2026-02 | F-FOURN-2026-02 | 2026-02-10 | 2026-02-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | - | - | - | true | VALIDATED |
| 8 | F-FOURN-2026-03 | mock-uuid-2 | whitecape_ask | F-FOURN-2026-03 | F-FOURN-2026-03 | 2026-03-10 | 2026-03-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | - | - | - | true | VALIDATED |
| 9 | F-FOURN-2026-04 | mock-uuid-2 | whitecape_ask | F-FOURN-2026-04 | F-FOURN-2026-04 | 2026-04-10 | 2026-04-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | - | - | - | true | VALIDATED |
| 10 | F-FOURN-2026-05 | mock-uuid-2 | whitecape_ask | F-FOURN-2026-05 | F-FOURN-2026-05 | 2026-05-10 | 2026-05-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 260 | anomaly | AMOUNT_SPIKE | 0.96 | 0.96 | true | VALIDATED |
| 11 | F-TEL-F-2026-01 | mock-uuid-2 | whitecape_ask | F-TEL-F-2026-01 | F-TEL-F-2026-01 | 2026-01-05 | 2026-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | - | - | - | true | VALIDATED |
| 12 | F-TEL-I-2026-01 | mock-uuid-2 | whitecape_ask | F-TEL-I-2026-01 | F-TEL-I-2026-01 | 2026-01-05 | 2026-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | - | - | - | true | VALIDATED |
| 13 | F-TEL-F-2026-02 | mock-uuid-2 | whitecape_ask | F-TEL-F-2026-02 | F-TEL-F-2026-02 | 2026-02-05 | 2026-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | - | - | - | true | VALIDATED |
| 14 | F-TEL-I-2026-02 | mock-uuid-2 | whitecape_ask | F-TEL-I-2026-02 | F-TEL-I-2026-02 | 2026-02-05 | 2026-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | - | - | - | true | VALIDATED |
| 15 | F-TEL-F-2026-03 | mock-uuid-2 | whitecape_ask | F-TEL-F-2026-03 | F-TEL-F-2026-03 | 2026-03-05 | 2026-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | - | - | - | true | VALIDATED |
| 16 | F-TEL-I-2026-03 | mock-uuid-2 | whitecape_ask | F-TEL-I-2026-03 | F-TEL-I-2026-03 | 2026-03-05 | 2026-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | - | - | - | true | VALIDATED |
| 17 | F-TEL-F-2026-04 | mock-uuid-2 | whitecape_ask | F-TEL-F-2026-04 | F-TEL-F-2026-04 | 2026-04-05 | 2026-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 420 | anomaly | AMOUNT_SPIKE | 0.96 | 0.96 | true | VALIDATED |
| 18 | F-TEL-I-2026-04 | mock-uuid-2 | whitecape_ask | F-TEL-I-2026-04 | F-TEL-I-2026-04 | 2026-04-05 | 2026-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | - | - | - | true | VALIDATED |
| 19 | F-TEL-F-2026-05 | mock-uuid-2 | whitecape_ask | F-TEL-F-2026-05 | F-TEL-F-2026-05 | 2026-05-05 | 2026-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | - | - | - | true | VALIDATED |
| 20 | F-TEL-I-2026-05 | mock-uuid-2 | whitecape_ask | F-TEL-I-2026-05 | F-TEL-I-2026-05 | 2026-05-05 | 2026-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | - | - | - | true | VALIDATED |

## 8. HISTORICAL_INVOICES_TABLE

Factures historiques 2024-2025 pour baseline moteur.

| Property | Value |
| --- | --- |
| Section | Derived frontend |
| Row count | 96 |
| Columns | id, invoiceId, invoiceDate, date, supplier, supplierName, label, amount, status, isFinal |

| # | id | invoiceId | invoiceDate | date | supplier | supplierName | label | amount | status | isFinal |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | F-EAU-2024-01 | F-EAU-2024-01 | 2024-01-15 | 2024-01-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 2 | F-EAU-2024-02 | F-EAU-2024-02 | 2024-02-15 | 2024-02-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 3 | F-EAU-2024-03 | F-EAU-2024-03 | 2024-03-15 | 2024-03-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 4 | F-EAU-2024-04 | F-EAU-2024-04 | 2024-04-15 | 2024-04-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 5 | F-EAU-2024-05 | F-EAU-2024-05 | 2024-05-15 | 2024-05-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 6 | F-EAU-2024-06 | F-EAU-2024-06 | 2024-06-15 | 2024-06-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 7 | F-EAU-2024-07 | F-EAU-2024-07 | 2024-07-15 | 2024-07-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 8 | F-EAU-2024-08 | F-EAU-2024-08 | 2024-08-15 | 2024-08-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 9 | F-EAU-2024-09 | F-EAU-2024-09 | 2024-09-15 | 2024-09-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 10 | F-EAU-2024-10 | F-EAU-2024-10 | 2024-10-15 | 2024-10-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 11 | F-EAU-2024-11 | F-EAU-2024-11 | 2024-11-15 | 2024-11-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 12 | F-EAU-2024-12 | F-EAU-2024-12 | 2024-12-15 | 2024-12-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 13 | F-FOURN-2024-01 | F-FOURN-2024-01 | 2024-01-10 | 2024-01-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 14 | F-FOURN-2024-02 | F-FOURN-2024-02 | 2024-02-10 | 2024-02-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 15 | F-FOURN-2024-03 | F-FOURN-2024-03 | 2024-03-10 | 2024-03-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 16 | F-FOURN-2024-04 | F-FOURN-2024-04 | 2024-04-10 | 2024-04-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 17 | F-FOURN-2024-05 | F-FOURN-2024-05 | 2024-05-10 | 2024-05-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 18 | F-FOURN-2024-06 | F-FOURN-2024-06 | 2024-06-10 | 2024-06-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 19 | F-FOURN-2024-07 | F-FOURN-2024-07 | 2024-07-10 | 2024-07-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 20 | F-FOURN-2024-08 | F-FOURN-2024-08 | 2024-08-10 | 2024-08-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 21 | F-FOURN-2024-09 | F-FOURN-2024-09 | 2024-09-10 | 2024-09-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 400 | normal | true |
| 22 | F-FOURN-2024-10 | F-FOURN-2024-10 | 2024-10-10 | 2024-10-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 23 | F-FOURN-2024-11 | F-FOURN-2024-11 | 2024-11-10 | 2024-11-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 24 | F-FOURN-2024-12 | F-FOURN-2024-12 | 2024-12-10 | 2024-12-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 25 | F-TEL-F-2024-01 | F-TEL-F-2024-01 | 2024-01-05 | 2024-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 26 | F-TEL-I-2024-01 | F-TEL-I-2024-01 | 2024-01-05 | 2024-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 27 | F-TEL-F-2024-02 | F-TEL-F-2024-02 | 2024-02-05 | 2024-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 28 | F-TEL-I-2024-02 | F-TEL-I-2024-02 | 2024-02-05 | 2024-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 29 | F-TEL-F-2024-03 | F-TEL-F-2024-03 | 2024-03-05 | 2024-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 30 | F-TEL-I-2024-03 | F-TEL-I-2024-03 | 2024-03-05 | 2024-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 31 | F-TEL-F-2024-04 | F-TEL-F-2024-04 | 2024-04-05 | 2024-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 32 | F-TEL-I-2024-04 | F-TEL-I-2024-04 | 2024-04-05 | 2024-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 33 | F-TEL-F-2024-05 | F-TEL-F-2024-05 | 2024-05-05 | 2024-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 34 | F-TEL-I-2024-05 | F-TEL-I-2024-05 | 2024-05-05 | 2024-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 35 | F-TEL-F-2024-06 | F-TEL-F-2024-06 | 2024-06-05 | 2024-06-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 36 | F-TEL-I-2024-06 | F-TEL-I-2024-06 | 2024-06-05 | 2024-06-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 37 | F-TEL-F-2024-07 | F-TEL-F-2024-07 | 2024-07-05 | 2024-07-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 38 | F-TEL-I-2024-07 | F-TEL-I-2024-07 | 2024-07-05 | 2024-07-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 39 | F-TEL-F-2024-08 | F-TEL-F-2024-08 | 2024-08-05 | 2024-08-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 40 | F-TEL-I-2024-08 | F-TEL-I-2024-08 | 2024-08-05 | 2024-08-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 41 | F-TEL-F-2024-09 | F-TEL-F-2024-09 | 2024-09-05 | 2024-09-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 42 | F-TEL-I-2024-09 | F-TEL-I-2024-09 | 2024-09-05 | 2024-09-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 43 | F-TEL-F-2024-10 | F-TEL-F-2024-10 | 2024-10-05 | 2024-10-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 44 | F-TEL-I-2024-10 | F-TEL-I-2024-10 | 2024-10-05 | 2024-10-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 45 | F-TEL-F-2024-11 | F-TEL-F-2024-11 | 2024-11-05 | 2024-11-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 46 | F-TEL-I-2024-11 | F-TEL-I-2024-11 | 2024-11-05 | 2024-11-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 47 | F-TEL-F-2024-12 | F-TEL-F-2024-12 | 2024-12-05 | 2024-12-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 48 | F-TEL-I-2024-12 | F-TEL-I-2024-12 | 2024-12-05 | 2024-12-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 49 | F-EAU-2025-01 | F-EAU-2025-01 | 2025-01-15 | 2025-01-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 50 | F-EAU-2025-02 | F-EAU-2025-02 | 2025-02-15 | 2025-02-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 51 | F-EAU-2025-03 | F-EAU-2025-03 | 2025-03-15 | 2025-03-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 52 | F-EAU-2025-04 | F-EAU-2025-04 | 2025-04-15 | 2025-04-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 53 | F-EAU-2025-05 | F-EAU-2025-05 | 2025-05-15 | 2025-05-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 54 | F-EAU-2025-06 | F-EAU-2025-06 | 2025-06-15 | 2025-06-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 55 | F-EAU-2025-07 | F-EAU-2025-07 | 2025-07-15 | 2025-07-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 56 | F-EAU-2025-08 | F-EAU-2025-08 | 2025-08-15 | 2025-08-15 | EAU_SAISON | EAU_SAISON | Eau potable | 240 | normal | true |
| 57 | F-EAU-2025-09 | F-EAU-2025-09 | 2025-09-15 | 2025-09-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 58 | F-EAU-2025-10 | F-EAU-2025-10 | 2025-10-15 | 2025-10-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 59 | F-EAU-2025-11 | F-EAU-2025-11 | 2025-11-15 | 2025-11-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 60 | F-EAU-2025-12 | F-EAU-2025-12 | 2025-12-15 | 2025-12-15 | EAU_SAISON | EAU_SAISON | Eau potable | 120 | normal | true |
| 61 | F-FOURN-2025-01 | F-FOURN-2025-01 | 2025-01-10 | 2025-01-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 62 | F-FOURN-2025-02 | F-FOURN-2025-02 | 2025-02-10 | 2025-02-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 63 | F-FOURN-2025-03 | F-FOURN-2025-03 | 2025-03-10 | 2025-03-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 64 | F-FOURN-2025-04 | F-FOURN-2025-04 | 2025-04-10 | 2025-04-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 65 | F-FOURN-2025-05 | F-FOURN-2025-05 | 2025-05-10 | 2025-05-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 66 | F-FOURN-2025-06 | F-FOURN-2025-06 | 2025-06-10 | 2025-06-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 100 | normal | true |
| 67 | F-FOURN-2025-07 | F-FOURN-2025-07 | 2025-07-10 | 2025-07-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 68 | F-FOURN-2025-08 | F-FOURN-2025-08 | 2025-08-10 | 2025-08-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 69 | F-FOURN-2025-09 | F-FOURN-2025-09 | 2025-09-10 | 2025-09-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 400 | normal | true |
| 70 | F-FOURN-2025-10 | F-FOURN-2025-10 | 2025-10-10 | 2025-10-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 71 | F-FOURN-2025-11 | F-FOURN-2025-11 | 2025-11-10 | 2025-11-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 72 | F-FOURN-2025-12 | F-FOURN-2025-12 | 2025-12-10 | 2025-12-10 | FOURNITURES_BUREAU | FOURNITURES_BUREAU | Fournitures scolaires | 50 | normal | true |
| 73 | F-TEL-F-2025-01 | F-TEL-F-2025-01 | 2025-01-05 | 2025-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 74 | F-TEL-I-2025-01 | F-TEL-I-2025-01 | 2025-01-05 | 2025-01-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 75 | F-TEL-F-2025-02 | F-TEL-F-2025-02 | 2025-02-05 | 2025-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 76 | F-TEL-I-2025-02 | F-TEL-I-2025-02 | 2025-02-05 | 2025-02-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 77 | F-TEL-F-2025-03 | F-TEL-F-2025-03 | 2025-03-05 | 2025-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 78 | F-TEL-I-2025-03 | F-TEL-I-2025-03 | 2025-03-05 | 2025-03-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 79 | F-TEL-F-2025-04 | F-TEL-F-2025-04 | 2025-04-05 | 2025-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 80 | F-TEL-I-2025-04 | F-TEL-I-2025-04 | 2025-04-05 | 2025-04-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 81 | F-TEL-F-2025-05 | F-TEL-F-2025-05 | 2025-05-05 | 2025-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 82 | F-TEL-I-2025-05 | F-TEL-I-2025-05 | 2025-05-05 | 2025-05-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 83 | F-TEL-F-2025-06 | F-TEL-F-2025-06 | 2025-06-05 | 2025-06-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 84 | F-TEL-I-2025-06 | F-TEL-I-2025-06 | 2025-06-05 | 2025-06-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 85 | F-TEL-F-2025-07 | F-TEL-F-2025-07 | 2025-07-05 | 2025-07-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 86 | F-TEL-I-2025-07 | F-TEL-I-2025-07 | 2025-07-05 | 2025-07-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 87 | F-TEL-F-2025-08 | F-TEL-F-2025-08 | 2025-08-05 | 2025-08-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 88 | F-TEL-I-2025-08 | F-TEL-I-2025-08 | 2025-08-05 | 2025-08-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 89 | F-TEL-F-2025-09 | F-TEL-F-2025-09 | 2025-09-05 | 2025-09-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 90 | F-TEL-I-2025-09 | F-TEL-I-2025-09 | 2025-09-05 | 2025-09-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 91 | F-TEL-F-2025-10 | F-TEL-F-2025-10 | 2025-10-05 | 2025-10-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 92 | F-TEL-I-2025-10 | F-TEL-I-2025-10 | 2025-10-05 | 2025-10-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 93 | F-TEL-F-2025-11 | F-TEL-F-2025-11 | 2025-11-05 | 2025-11-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 94 | F-TEL-I-2025-11 | F-TEL-I-2025-11 | 2025-11-05 | 2025-11-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |
| 95 | F-TEL-F-2025-12 | F-TEL-F-2025-12 | 2025-12-05 | 2025-12-05 | TELECOM_FIBRE | TELECOM_FIBRE | Fibre Optique | 300 | normal | true |
| 96 | F-TEL-I-2025-12 | F-TEL-I-2025-12 | 2025-12-05 | 2025-12-05 | TELECOM_FIBRE | TELECOM_FIBRE | Internet ADSL | 50 | normal | true |

## 9. COMMANDES_FRONTEND_TABLE

Commandes mappees pour les vues frontend.

| Property | Value |
| --- | --- |
| Section | Derived frontend |
| Row count | 116 |
| Columns | id, commandeRef, date, commandeDate, supplier, budgetCode, label, orderedAmount, receivedAmount, status, fiscalYear |

| # | id | commandeRef | date | commandeDate | supplier | budgetCode | label | orderedAmount | receivedAmount | status | fiscalYear |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | C-EAU-2024-01 | C-EAU-2024-01 | 2024-01-15 | 2024-01-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 2 | C-EAU-2024-02 | C-EAU-2024-02 | 2024-02-15 | 2024-02-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 3 | C-EAU-2024-03 | C-EAU-2024-03 | 2024-03-15 | 2024-03-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 4 | C-EAU-2024-04 | C-EAU-2024-04 | 2024-04-15 | 2024-04-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 5 | C-EAU-2024-05 | C-EAU-2024-05 | 2024-05-15 | 2024-05-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 6 | C-EAU-2024-06 | C-EAU-2024-06 | 2024-06-15 | 2024-06-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2024 |
| 7 | C-EAU-2024-07 | C-EAU-2024-07 | 2024-07-15 | 2024-07-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2024 |
| 8 | C-EAU-2024-08 | C-EAU-2024-08 | 2024-08-15 | 2024-08-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2024 |
| 9 | C-EAU-2024-09 | C-EAU-2024-09 | 2024-09-15 | 2024-09-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 10 | C-EAU-2024-10 | C-EAU-2024-10 | 2024-10-15 | 2024-10-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 11 | C-EAU-2024-11 | C-EAU-2024-11 | 2024-11-15 | 2024-11-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 12 | C-EAU-2024-12 | C-EAU-2024-12 | 2024-12-15 | 2024-12-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2024 |
| 13 | C-FOURN-2024-01 | C-FOURN-2024-01 | 2024-01-10 | 2024-01-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 14 | C-FOURN-2024-02 | C-FOURN-2024-02 | 2024-02-10 | 2024-02-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 15 | C-FOURN-2024-03 | C-FOURN-2024-03 | 2024-03-10 | 2024-03-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 16 | C-FOURN-2024-04 | C-FOURN-2024-04 | 2024-04-10 | 2024-04-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 17 | C-FOURN-2024-05 | C-FOURN-2024-05 | 2024-05-10 | 2024-05-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 18 | C-FOURN-2024-06 | C-FOURN-2024-06 | 2024-06-10 | 2024-06-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2024 |
| 19 | C-FOURN-2024-07 | C-FOURN-2024-07 | 2024-07-10 | 2024-07-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2024 |
| 20 | C-FOURN-2024-08 | C-FOURN-2024-08 | 2024-08-10 | 2024-08-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2024 |
| 21 | C-FOURN-2024-09 | C-FOURN-2024-09 | 2024-09-10 | 2024-09-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 400 | 400 | OVER_BUDGET | 2024 |
| 22 | C-FOURN-2024-10 | C-FOURN-2024-10 | 2024-10-10 | 2024-10-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2024 |
| 23 | C-FOURN-2024-11 | C-FOURN-2024-11 | 2024-11-10 | 2024-11-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2024 |
| 24 | C-FOURN-2024-12 | C-FOURN-2024-12 | 2024-12-10 | 2024-12-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2024 |
| 25 | C-TEL-F-2024-01 | C-TEL-F-2024-01 | 2024-01-05 | 2024-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 26 | C-TEL-I-2024-01 | C-TEL-I-2024-01 | 2024-01-05 | 2024-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 27 | C-TEL-F-2024-02 | C-TEL-F-2024-02 | 2024-02-05 | 2024-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 28 | C-TEL-I-2024-02 | C-TEL-I-2024-02 | 2024-02-05 | 2024-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 29 | C-TEL-F-2024-03 | C-TEL-F-2024-03 | 2024-03-05 | 2024-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 30 | C-TEL-I-2024-03 | C-TEL-I-2024-03 | 2024-03-05 | 2024-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 31 | C-TEL-F-2024-04 | C-TEL-F-2024-04 | 2024-04-05 | 2024-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 32 | C-TEL-I-2024-04 | C-TEL-I-2024-04 | 2024-04-05 | 2024-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 33 | C-TEL-F-2024-05 | C-TEL-F-2024-05 | 2024-05-05 | 2024-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 34 | C-TEL-I-2024-05 | C-TEL-I-2024-05 | 2024-05-05 | 2024-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 35 | C-TEL-F-2024-06 | C-TEL-F-2024-06 | 2024-06-05 | 2024-06-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 36 | C-TEL-I-2024-06 | C-TEL-I-2024-06 | 2024-06-05 | 2024-06-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 37 | C-TEL-F-2024-07 | C-TEL-F-2024-07 | 2024-07-05 | 2024-07-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 38 | C-TEL-I-2024-07 | C-TEL-I-2024-07 | 2024-07-05 | 2024-07-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 39 | C-TEL-F-2024-08 | C-TEL-F-2024-08 | 2024-08-05 | 2024-08-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 40 | C-TEL-I-2024-08 | C-TEL-I-2024-08 | 2024-08-05 | 2024-08-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 41 | C-TEL-F-2024-09 | C-TEL-F-2024-09 | 2024-09-05 | 2024-09-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 42 | C-TEL-I-2024-09 | C-TEL-I-2024-09 | 2024-09-05 | 2024-09-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 43 | C-TEL-F-2024-10 | C-TEL-F-2024-10 | 2024-10-05 | 2024-10-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 44 | C-TEL-I-2024-10 | C-TEL-I-2024-10 | 2024-10-05 | 2024-10-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 45 | C-TEL-F-2024-11 | C-TEL-F-2024-11 | 2024-11-05 | 2024-11-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 46 | C-TEL-I-2024-11 | C-TEL-I-2024-11 | 2024-11-05 | 2024-11-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 47 | C-TEL-F-2024-12 | C-TEL-F-2024-12 | 2024-12-05 | 2024-12-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2024 |
| 48 | C-TEL-I-2024-12 | C-TEL-I-2024-12 | 2024-12-05 | 2024-12-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2024 |
| 49 | C-EAU-2025-01 | C-EAU-2025-01 | 2025-01-15 | 2025-01-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 50 | C-EAU-2025-02 | C-EAU-2025-02 | 2025-02-15 | 2025-02-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 51 | C-EAU-2025-03 | C-EAU-2025-03 | 2025-03-15 | 2025-03-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 52 | C-EAU-2025-04 | C-EAU-2025-04 | 2025-04-15 | 2025-04-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 53 | C-EAU-2025-05 | C-EAU-2025-05 | 2025-05-15 | 2025-05-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 54 | C-EAU-2025-06 | C-EAU-2025-06 | 2025-06-15 | 2025-06-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2025 |
| 55 | C-EAU-2025-07 | C-EAU-2025-07 | 2025-07-15 | 2025-07-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2025 |
| 56 | C-EAU-2025-08 | C-EAU-2025-08 | 2025-08-15 | 2025-08-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 240 | 240 | ON_TRACK | 2025 |
| 57 | C-EAU-2025-09 | C-EAU-2025-09 | 2025-09-15 | 2025-09-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 58 | C-EAU-2025-10 | C-EAU-2025-10 | 2025-10-15 | 2025-10-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 59 | C-EAU-2025-11 | C-EAU-2025-11 | 2025-11-15 | 2025-11-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 60 | C-EAU-2025-12 | C-EAU-2025-12 | 2025-12-15 | 2025-12-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2025 |
| 61 | C-FOURN-2025-01 | C-FOURN-2025-01 | 2025-01-10 | 2025-01-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 62 | C-FOURN-2025-02 | C-FOURN-2025-02 | 2025-02-10 | 2025-02-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 63 | C-FOURN-2025-03 | C-FOURN-2025-03 | 2025-03-10 | 2025-03-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 64 | C-FOURN-2025-04 | C-FOURN-2025-04 | 2025-04-10 | 2025-04-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 65 | C-FOURN-2025-05 | C-FOURN-2025-05 | 2025-05-10 | 2025-05-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 66 | C-FOURN-2025-06 | C-FOURN-2025-06 | 2025-06-10 | 2025-06-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2025 |
| 67 | C-FOURN-2025-07 | C-FOURN-2025-07 | 2025-07-10 | 2025-07-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2025 |
| 68 | C-FOURN-2025-08 | C-FOURN-2025-08 | 2025-08-10 | 2025-08-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2025 |
| 69 | C-FOURN-2025-09 | C-FOURN-2025-09 | 2025-09-10 | 2025-09-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 400 | 400 | OVER_BUDGET | 2025 |
| 70 | C-FOURN-2025-10 | C-FOURN-2025-10 | 2025-10-10 | 2025-10-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2025 |
| 71 | C-FOURN-2025-11 | C-FOURN-2025-11 | 2025-11-10 | 2025-11-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2025 |
| 72 | C-FOURN-2025-12 | C-FOURN-2025-12 | 2025-12-10 | 2025-12-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 50 | 50 | OVER_BUDGET | 2025 |
| 73 | C-TEL-F-2025-01 | C-TEL-F-2025-01 | 2025-01-05 | 2025-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 74 | C-TEL-I-2025-01 | C-TEL-I-2025-01 | 2025-01-05 | 2025-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 75 | C-TEL-F-2025-02 | C-TEL-F-2025-02 | 2025-02-05 | 2025-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 76 | C-TEL-I-2025-02 | C-TEL-I-2025-02 | 2025-02-05 | 2025-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 77 | C-TEL-F-2025-03 | C-TEL-F-2025-03 | 2025-03-05 | 2025-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 78 | C-TEL-I-2025-03 | C-TEL-I-2025-03 | 2025-03-05 | 2025-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 79 | C-TEL-F-2025-04 | C-TEL-F-2025-04 | 2025-04-05 | 2025-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 80 | C-TEL-I-2025-04 | C-TEL-I-2025-04 | 2025-04-05 | 2025-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 81 | C-TEL-F-2025-05 | C-TEL-F-2025-05 | 2025-05-05 | 2025-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 82 | C-TEL-I-2025-05 | C-TEL-I-2025-05 | 2025-05-05 | 2025-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 83 | C-TEL-F-2025-06 | C-TEL-F-2025-06 | 2025-06-05 | 2025-06-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 84 | C-TEL-I-2025-06 | C-TEL-I-2025-06 | 2025-06-05 | 2025-06-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 85 | C-TEL-F-2025-07 | C-TEL-F-2025-07 | 2025-07-05 | 2025-07-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 86 | C-TEL-I-2025-07 | C-TEL-I-2025-07 | 2025-07-05 | 2025-07-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 87 | C-TEL-F-2025-08 | C-TEL-F-2025-08 | 2025-08-05 | 2025-08-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 88 | C-TEL-I-2025-08 | C-TEL-I-2025-08 | 2025-08-05 | 2025-08-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 89 | C-TEL-F-2025-09 | C-TEL-F-2025-09 | 2025-09-05 | 2025-09-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 90 | C-TEL-I-2025-09 | C-TEL-I-2025-09 | 2025-09-05 | 2025-09-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 91 | C-TEL-F-2025-10 | C-TEL-F-2025-10 | 2025-10-05 | 2025-10-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 92 | C-TEL-I-2025-10 | C-TEL-I-2025-10 | 2025-10-05 | 2025-10-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 93 | C-TEL-F-2025-11 | C-TEL-F-2025-11 | 2025-11-05 | 2025-11-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 94 | C-TEL-I-2025-11 | C-TEL-I-2025-11 | 2025-11-05 | 2025-11-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 95 | C-TEL-F-2025-12 | C-TEL-F-2025-12 | 2025-12-05 | 2025-12-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2025 |
| 96 | C-TEL-I-2025-12 | C-TEL-I-2025-12 | 2025-12-05 | 2025-12-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2025 |
| 97 | C-EAU-2026-01 | C-EAU-2026-01 | 2026-01-15 | 2026-01-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2026 |
| 98 | C-EAU-2026-02 | C-EAU-2026-02 | 2026-02-15 | 2026-02-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2026 |
| 99 | C-EAU-2026-03 | C-EAU-2026-03 | 2026-03-15 | 2026-03-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2026 |
| 100 | C-EAU-2026-04 | C-EAU-2026-04 | 2026-04-15 | 2026-04-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2026 |
| 101 | C-EAU-2026-05 | C-EAU-2026-05 | 2026-05-15 | 2026-05-15 | EAU_SAISON | BUDGET_EAU | Eau potable annuelle | 120 | 120 | ON_TRACK | 2026 |
| 102 | C-FOURN-2026-01 | C-FOURN-2026-01 | 2026-01-10 | 2026-01-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2026 |
| 103 | C-FOURN-2026-02 | C-FOURN-2026-02 | 2026-02-10 | 2026-02-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2026 |
| 104 | C-FOURN-2026-03 | C-FOURN-2026-03 | 2026-03-10 | 2026-03-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2026 |
| 105 | C-FOURN-2026-04 | C-FOURN-2026-04 | 2026-04-10 | 2026-04-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2026 |
| 106 | C-FOURN-2026-05 | C-FOURN-2026-05 | 2026-05-10 | 2026-05-10 | FOURNITURES_BUREAU | BUDGET_FOURN | Fournitures scolaires | 100 | 100 | OVER_BUDGET | 2026 |
| 107 | C-TEL-F-2026-01 | C-TEL-F-2026-01 | 2026-01-05 | 2026-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2026 |
| 108 | C-TEL-I-2026-01 | C-TEL-I-2026-01 | 2026-01-05 | 2026-01-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2026 |
| 109 | C-TEL-F-2026-02 | C-TEL-F-2026-02 | 2026-02-05 | 2026-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2026 |
| 110 | C-TEL-I-2026-02 | C-TEL-I-2026-02 | 2026-02-05 | 2026-02-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2026 |
| 111 | C-TEL-F-2026-03 | C-TEL-F-2026-03 | 2026-03-05 | 2026-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2026 |
| 112 | C-TEL-I-2026-03 | C-TEL-I-2026-03 | 2026-03-05 | 2026-03-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2026 |
| 113 | C-TEL-F-2026-04 | C-TEL-F-2026-04 | 2026-04-05 | 2026-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2026 |
| 114 | C-TEL-I-2026-04 | C-TEL-I-2026-04 | 2026-04-05 | 2026-04-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2026 |
| 115 | C-TEL-F-2026-05 | C-TEL-F-2026-05 | 2026-05-05 | 2026-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 300 | 300 | ON_TRACK | 2026 |
| 116 | C-TEL-I-2026-05 | C-TEL-I-2026-05 | 2026-05-05 | 2026-05-05 | TELECOM_FIBRE | BUDGET_TEL | Telecom fibre + internet | 50 | 50 | ON_TRACK | 2026 |

## 10. COMMAND_BUDGET_SERIES_TABLE

Series budgetaires derivees des commandes.

| Property | Value |
| --- | --- |
| Section | Derived frontend |
| Row count | 3 |
| Columns | budgetCode, label, orderCount, totalCommandes, budgetAlloue, realizedAtJune, remainingForecast, projection, overrunAmount, status, severity, monthlyProfile |

| # | budgetCode | label | orderCount | totalCommandes | budgetAlloue | realizedAtJune | remainingForecast | projection | overrunAmount | status | severity | monthlyProfile |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BUDGET_EAU | Eau potable annuelle | 5 | 600 | 2160 | 600 | 1200 | 1800 | 0 | ON_TRACK | info | [120,120,120,120,120,240,240,240,120,120,120,120] |
| 2 | BUDGET_FOURN | Fournitures scolaires | 5 | 500 | 1000 | 500 | 750 | 1250 | 250 | BUDGET_OVERRUN | critical | [100,100,100,100,100,100,50,50,400,50,50,50] |
| 3 | BUDGET_TEL | Telecom fibre + internet | 10 | 1750 | 4200 | 1750 | 2450 | 4200 | 0 | ON_TRACK | info | [350,350,350,350,350,350,350,350,350,350,350,350] |

## 11. CONNECTORS_TABLE

DTO mock des connecteurs backend.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 2 |
| Columns | id, name, type, authType, description, publicKey, apiEndpoint, apiAuthHeader, apiAuthToken, jdbcUrl, jdbcUsername, jdbcPassword, driverClass, schemaTablesJson, fieldMappingJson, importStatusesJson, provisionalStatusesJson, finalStatusesJson, importStatusColumn, pipelineTemplatesJson, budgetTemplateJson, tenantDefaultsJson, mappingLocked, logo, color |

| # | id | name | type | authType | description | publicKey | apiEndpoint | apiAuthHeader | apiAuthToken | jdbcUrl | jdbcUsername | jdbcPassword | driverClass | schemaTablesJson | fieldMappingJson | importStatusesJson | provisionalStatusesJson | finalStatusesJson | importStatusColumn | pipelineTemplatesJson | budgetTemplateJson | tenantDefaultsJson | mappingLocked | logo | color |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-conn-1 | Ask&Go ERP | ERP | JWT_SIGNED | Connecteur ERP multi-tenant pour import, pipelines et budgets | -----BEGIN PUBLIC KEY-----<br>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...<br>-----END PUBLIC KEY----- | - | - | - | jdbc:postgresql://localhost:5432/askgo_db | postgres | •••••••• | org.postgresql.Driver | {"mainTable":"factures","joinTables":[{"table":"suppliers","alias":"s","joinType":"INNER","onCondition":"factures.supplier_code = s.supplier_code"},{"table":"categories","alias":"c","joinType":"INNER","onCondition":"factures.category_code = c.category_code"}]} | {"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"} | ["RECU","COMPTABILISE"] | ["RECU"] | ["COMPTABILISE"] | factures.status | {"facture":{"key":"facture","name":"Factures — import standard","description":"Importe les factures avec creation de series","enabled":true,"tables":["factures","suppliers","categories"],"joins":["s.supplier_code = factures.supplier_code","c.category_code = factures.category_code"],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status IN ('RECU', 'COMPTABILISE')"],"groupByCols":["s.supplier_name","c.category_name"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"},"tolerancePct":0.15,"toleranceDays":45,"importStatusColumn":"factures.status","importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"]},"commande":{"key":"commande","name":"Commandes — import bons de commande","description":"Importe les commandes pour analyse budget","enabled":true,"tables":["commandes"],"joins":[],"conditions":["commandes.status != 'ANNULE'"],"groupByCols":["supplierName"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"},"tolerancePct":0.1,"toleranceDays":30},"avoir":{"key":"avoir","name":"Avoirs — import notes de credit","description":"Importe les avoirs et notes de credit","enabled":true,"tables":["factures"],"joins":[],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status = 'AVOIR'"],"groupByCols":["factures.supplier_code"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"factures.supplier_code","invoiceDate":"factures.date","amount":"factures.amount","label":"factures.category_code"},"tolerancePct":0.15,"toleranceDays":45}} | {"mainTable":"budgets","joinTables":[],"conditions":["budgets.tenant_id = '${tenantCode}'","budgets.year = ${year}"],"mapping":{"budgetCode":"budgets.ligne_budgetaire","label":"budgets.libelle","allocatedAmount":"budgets.budget_alloue"}} | {"defaultTolerancePct":0.15,"defaultToleranceDays":45,"autoCreateSeries":true,"autoDetectAnomalies":true,"budgetAnalysisEnabled":true,"commandeImportEnabled":true,"fiscalYearStartMonth":1} | true | - | - |
| 2 | mock-conn-liadev | LiaDev ERP | ERP | JWT_SIGNED | Connecteur ERP multi-tenant pour import, pipelines et budgets | -----BEGIN PUBLIC KEY-----<br>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...<br>-----END PUBLIC KEY----- | - | - | - | jdbc:postgresql://localhost:5432/askgo_db | postgres | •••••••• | org.postgresql.Driver | {"mainTable":"factures","joinTables":[{"table":"suppliers","alias":"s","joinType":"INNER","onCondition":"factures.supplier_code = s.supplier_code"},{"table":"categories","alias":"c","joinType":"INNER","onCondition":"factures.category_code = c.category_code"}]} | {"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"} | ["RECU","COMPTABILISE"] | ["RECU"] | ["COMPTABILISE"] | factures.status | {"facture":{"key":"facture","name":"Factures — import standard","description":"Importe les factures avec creation de series","enabled":true,"tables":["factures","suppliers","categories"],"joins":["s.supplier_code = factures.supplier_code","c.category_code = factures.category_code"],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status IN ('RECU', 'COMPTABILISE')"],"groupByCols":["s.supplier_name","c.category_name"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"},"tolerancePct":0.15,"toleranceDays":45,"importStatusColumn":"factures.status","importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"]},"commande":{"key":"commande","name":"Commandes — import bons de commande","description":"Importe les commandes pour analyse budget","enabled":true,"tables":["commandes"],"joins":[],"conditions":["commandes.status != 'ANNULE'"],"groupByCols":["supplierName"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"},"tolerancePct":0.1,"toleranceDays":30},"avoir":{"key":"avoir","name":"Avoirs — import notes de credit","description":"Importe les avoirs et notes de credit","enabled":true,"tables":["factures"],"joins":[],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status = 'AVOIR'"],"groupByCols":["factures.supplier_code"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"factures.supplier_code","invoiceDate":"factures.date","amount":"factures.amount","label":"factures.category_code"},"tolerancePct":0.15,"toleranceDays":45}} | {"mainTable":"budgets","joinTables":[],"conditions":["budgets.tenant_id = '${tenantCode}'","budgets.year = ${year}"],"mapping":{"budgetCode":"budgets.ligne_budgetaire","label":"budgets.libelle","allocatedAmount":"budgets.budget_alloue"}} | {"defaultTolerancePct":0.15,"defaultToleranceDays":45,"autoCreateSeries":true,"autoDetectAnomalies":true,"budgetAnalysisEnabled":true,"commandeImportEnabled":true,"fiscalYearStartMonth":1} | true | LD | #2563EB |

## 12. TENANT_CONNECTIONS_TABLE

DTO mock des liens ERP par tenant.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 1 |
| Columns | id, tenantId, connectorId, externalId, active, notes, processedTemplatesJson, connectorName, connectorColor, connectorLogo, connectorType |

| # | id | tenantId | connectorId | externalId | active | notes | processedTemplatesJson | connectorName | connectorColor | connectorLogo | connectorType |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-conn-1 | mock-uuid-2 | mock-conn-1 | whitecape_ask | true | Lien Whitecape ↔ Ask&Go ERP | ["facture","commande"] | Ask&Go ERP | #714B67 | AG | ERP |

## 13. PIPELINES_TABLE

DTO mock des pipelines actifs.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 2 |
| Columns | id, tenantId, name, sourceType, status, active, templateKey, isCustom, connectorId, externalId, lastRunAt, lastRunStats, configJson |

| # | id | tenantId | name | sourceType | status | active | templateKey | isCustom | connectorId | externalId | lastRunAt | lastRunStats | configJson |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-pipe-1 | mock-uuid-2 | whitecape_ask - facture | JDBC | ACTIVE | true | facture | false | mock-conn-1 | whitecape_ask | 2026-05-31T11:00:00Z | {"processedCount":20,"importedCount":20,"anomalyCount":3} | {"query":"SELECT ..."} |
| 2 | mock-pipe-2 | mock-uuid-2 | whitecape_ask - commande | JDBC | ACTIVE | true | commande | false | mock-conn-1 | whitecape_ask | 2026-05-31T11:05:00Z | {"processedCount":20,"importedCount":20,"anomalyCount":0} | {"query":"SELECT ...","groupByCols":["supplierName"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"}} |

## 14. ALERTS_TABLE

DTO mock des alertes moteur.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 4 |
| Columns | id, tenantId, type, status, severity, anomalyScore, invoiceRef, message, detectedAt, explanation |

| # | id | tenantId | type | status | severity | anomalyScore | invoiceRef | message | detectedAt | explanation |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-alert-1 | mock-uuid-2 | BUDGET_OVERRUN | ACTIVE | critical | 0 | - | Projection budget Fournitures : depassement annuel probable (+160€) | 2026-05-31T00:00:00Z | FOURNITURES_BUREAU — Projection fin d'annee = 1410€ > 1250€ budget annuel. Le pic de mai augmente le risque de depassement. |
| 2 | mock-alert-2 | mock-uuid-2 | AMOUNT_SPIKE | ACTIVE | warning | 0.96 | F-EAU-2026-03 | Montant inhabituel detecte : EAU_SAISON en mars (280€ vs 120€ attendu) | 2026-03-15T09:00:00Z | La facture F-EAU-2026-03 depasse fortement le comportement habituel de la serie Eau potable. |
| 3 | mock-alert-3 | mock-uuid-2 | AMOUNT_SPIKE | ACTIVE | critical | 0.96 | F-FOURN-2026-05 | Montant inhabituel detecte : FOURNITURES_BUREAU en mai (260€ vs 100€ attendu) | 2026-05-10T09:00:00Z | La facture F-FOURN-2026-05 declenche une anomalie montant et contribue au risque de depassement budget annuel. |
| 4 | mock-alert-4 | mock-uuid-2 | AMOUNT_SPIKE | ACTIVE | warning | 0.96 | F-TEL-F-2026-04 | Montant inhabituel detecte : Fibre Optique en avril (420€ vs 300€ attendu) | 2026-04-05T09:00:00Z | La facture F-TEL-F-2026-04 depasse l'attendu mensuel de la serie Fibre Optique sans encore depasser le budget annuel. |

## 15. BUDGET_ANALYSIS_TABLE

DTO mock d'analyse budget.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 3 |
| Columns | budgetCode, label, budgetAlloue, totalCommandes, taux, status, prediction, projection, overrunAmount, message |

| # | budgetCode | label | budgetAlloue | totalCommandes | taux | status | prediction | projection | overrunAmount | message |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BUDGET_EAU | Eau potable annuelle | 2160 | 1800 | 0.83 | ON_TRACK | Stable (saisonnier connu) | 1800 | 0 | BUDGET_EAU — Eau potable : Consommation saisonniere detectee. Vous etes ON_TRACK. |
| 2 | BUDGET_FOURN | Fournitures scolaires | 1000 | 1250 | 1.25 | OVER_BUDGET | OVER_BUDGET_PREDICTED | 1250 | 250 | BUDGET_FOURN — ALERTE : Votre profil est fortement saisonnier avec un pic historique en septembre (400€). Projection fin d'annee : 1250€ (+250€ de depassement prevu). |
| 3 | BUDGET_TEL | Telecom fibre + internet | 4200 | 4200 | 1 | ON_TRACK | Stable | 4200 | 0 | BUDGET_TEL — Telecom : Consommation stable a 350€/mois. Vous etes ON_TRACK. |

## 16. CSV_DEMO_ROWS

Lignes CSV demo derivees des factures.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 18 |
| Columns | invoice_ref, invoice_date, amount, supplier_code, label, status, extra_comment |

| # | invoice_ref | invoice_date | amount | supplier_code | label | status | extra_comment |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | F-EAU-2026-01 | 2026-01-15 | 120 | EAU_SAISON | Eau potable | COMPTABILISE | standard |
| 2 | F-EAU-2026-02 | 2026-02-15 | 120 | EAU_SAISON | Eau potable | COMPTABILISE | standard |
| 3 | F-EAU-2026-03 | 2026-03-15 | 280 | EAU_SAISON | Eau potable | COMPTABILISE | pic rentree scolaire |
| 4 | F-EAU-2026-04 | 2026-04-15 | 120 | EAU_SAISON | Eau potable | COMPTABILISE | standard |
| 5 | F-EAU-2026-05 | 2026-05-15 | 120 | EAU_SAISON | Eau potable | COMPTABILISE | standard |
| 6 | F-FOURN-2026-01 | 2026-01-10 | 100 | FOURNITURES_BUREAU | Fournitures scolaires | COMPTABILISE | standard |
| 7 | F-FOURN-2026-02 | 2026-02-10 | 100 | FOURNITURES_BUREAU | Fournitures scolaires | COMPTABILISE | standard |
| 8 | F-FOURN-2026-03 | 2026-03-10 | 100 | FOURNITURES_BUREAU | Fournitures scolaires | COMPTABILISE | standard |
| 9 | F-FOURN-2026-04 | 2026-04-10 | 100 | FOURNITURES_BUREAU | Fournitures scolaires | COMPTABILISE | standard |
| 10 | F-FOURN-2026-05 | 2026-05-10 | 260 | FOURNITURES_BUREAU | Fournitures scolaires | COMPTABILISE | pic rentree scolaire |
| 11 | F-TEL-F-2026-01 | 2026-01-05 | 300 | TELECOM_FIBRE | Fibre Optique | COMPTABILISE | standard |
| 12 | F-TEL-I-2026-01 | 2026-01-05 | 50 | TELECOM_FIBRE | Internet ADSL | COMPTABILISE | standard |
| 13 | F-TEL-F-2026-02 | 2026-02-05 | 300 | TELECOM_FIBRE | Fibre Optique | COMPTABILISE | standard |
| 14 | F-TEL-I-2026-02 | 2026-02-05 | 50 | TELECOM_FIBRE | Internet ADSL | COMPTABILISE | standard |
| 15 | F-TEL-F-2026-03 | 2026-03-05 | 300 | TELECOM_FIBRE | Fibre Optique | COMPTABILISE | standard |
| 16 | F-TEL-I-2026-03 | 2026-03-05 | 50 | TELECOM_FIBRE | Internet ADSL | COMPTABILISE | standard |
| 17 | F-TEL-F-2026-04 | 2026-04-05 | 420 | TELECOM_FIBRE | Fibre Optique | COMPTABILISE | pic rentree scolaire |
| 18 | F-TEL-I-2026-04 | 2026-04-05 | 50 | TELECOM_FIBRE | Internet ADSL | COMPTABILISE | standard |

## 17. PIPELINE_LOGS_TABLE

Logs mock de decisions pipeline.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 1 |
| Columns | id, category, supplier, status, reason, createdAt |

| # | id | category | supplier | status | reason | createdAt |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | mock-log-1 | SERIES_DECISION | TELECOM_FIBRE | SUCCESS | autoSelectBestGrouping a choisi fournisseur+label pour TELECOM_FIBRE. Detection de 2 clusters (50 € et 300 €). Score : 41.9 vs. 81.3. | 2024-06-01T11:00:00Z |

## 18. ANOMALIES_TABLE

Anomalies mock explicites.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 0 |
| Columns |  |

_No rows._

## 19. SERIES_TABLE

Series statistiques mock.

| Property | Value |
| --- | --- |
| Section | Mock API |
| Row count | 4 |
| Columns | id, name, supplier, label, n, mu, sigma, cv, flagged, tolerance_pct |

| # | id | name | supplier | label | n | mu | sigma | cv | flagged | tolerance_pct |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-series-1 | EAU_SAISON — Eau potable | EAU_SAISON | Eau potable | 12 | 150 | 57.74 | 0.385 | true | 15 |
| 2 | mock-series-2 | FOURNITURES_BUREAU — Fournitures scolaires | FOURNITURES_BUREAU | Fournitures scolaires | 12 | 104.17 | 92.47 | 0.888 | true | 15 |
| 3 | mock-series-3 | TELECOM_FIBRE — Fibre Optique | TELECOM_FIBRE | Fibre Optique | 12 | 300 | 0 | 0 | false | 15 |
| 4 | mock-series-4 | TELECOM_FIBRE — Internet ADSL | TELECOM_FIBRE | Internet ADSL | 12 | 50 | 0 | 0 | false | 15 |

## 20. DEMO_CONNECTORS

Connecteurs complets utilises par l'UI integrations.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 2 |
| Columns | id, name, logo, color, category, status, authType, description, jdbcUrl, jdbcUsername, jdbcPassword, connectionType, publicKey, apiEndpoint, apiAuthToken, connectorType, selectedTables, pipelines, tableRoles, budgetSourceTables, budgetAmountCols, budgetFormula, budgetPreset, budgetAgg, tenants, customPipelines, generatedData, issuer, audience, algorithm, jdbcDriverClassName |

| # | id | name | logo | color | category | status | authType | description | jdbcUrl | jdbcUsername | jdbcPassword | connectionType | publicKey | apiEndpoint | apiAuthToken | connectorType | selectedTables | pipelines | tableRoles | budgetSourceTables | budgetAmountCols | budgetFormula | budgetPreset | budgetAgg | tenants | customPipelines | generatedData | issuer | audience | algorithm | jdbcDriverClassName |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | mock-conn-1 | Ask&Go ERP | AG | #714B67 | erp | connected | JWT_SIGNED | Connecteur ERP multi-tenant pour import, pipelines et budgets | jdbc:postgresql://localhost:5432/askgo_db | postgres | •••••••• | jdbc | -----BEGIN PUBLIC KEY-----<br>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...<br>-----END PUBLIC KEY----- | - | - | ERP | ["factures","suppliers","categories","commandes","budgets"] | {"facture":{"enabled":true,"tables":["factures","suppliers","categories"],"joins":["suppliers.supplier_code = factures.supplier_code","categories.category_code = factures.category_code"],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status IN ('RECU', 'COMPTABILISE')"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"suppliers.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"categories.category_name"},"groupByCols":["suppliers.supplier_name","categories.category_name"],"tolerancePct":0.15,"toleranceDays":45,"importStatusColumn":"factures.status","importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"]},"commande":{"enabled":true,"tables":["commandes"],"joins":[],"conditions":["commandes.status != 'ANNULE'"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"},"groupByCols":["supplierName"],"tolerancePct":0.1,"toleranceDays":30}} | {"factures":"main","suppliers":"join","categories":"join","commandes":"main","budgets":"budget"} | ["budgets"] | [] | [] | - | SUM | [{"id":"whitecape_ask","label":"whitecape_ask","active":true,"statuses":{"facture":{"provisional":["RECU"],"final":["COMPTABILISE"],"statusColumn":"factures.status"},"commande":{"provisional":["En cours"],"final":["LIVRE"],"statusColumn":"commandes.status"}}}] | [] | {} | askgo-erp | anomaly-detection | RS256 | org.postgresql.Driver |
| 2 | mock-conn-liadev | LiaDev ERP | LD | #2563EB | erp | connected | JWT_SIGNED | Connecteur ERP multi-tenant pour import, pipelines et budgets | jdbc:postgresql://localhost:5432/askgo_db | postgres | •••••••• | jdbc | -----BEGIN PUBLIC KEY-----<br>MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...<br>-----END PUBLIC KEY----- | - | - | ERP | ["factures","suppliers","categories","commandes","budgets"] | {"facture":{"key":"facture","name":"Factures — import standard","description":"Importe les factures avec creation de series","enabled":true,"tables":["factures","suppliers","categories"],"joins":["s.supplier_code = factures.supplier_code","c.category_code = factures.category_code"],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status IN ('RECU', 'COMPTABILISE')"],"groupByCols":["s.supplier_name","c.category_name"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"},"tolerancePct":0.15,"toleranceDays":45,"importStatusColumn":"factures.status","importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"]},"commande":{"key":"commande","name":"Commandes — import bons de commande","description":"Importe les commandes pour analyse budget","enabled":true,"tables":["commandes"],"joins":[],"conditions":["commandes.status != 'ANNULE'"],"groupByCols":["supplierName"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"},"tolerancePct":0.1,"toleranceDays":30},"avoir":{"key":"avoir","name":"Avoirs — import notes de credit","description":"Importe les avoirs et notes de credit","enabled":true,"tables":["factures"],"joins":[],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status = 'AVOIR'"],"groupByCols":["factures.supplier_code"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"factures.supplier_code","invoiceDate":"factures.date","amount":"factures.amount","label":"factures.category_code"},"tolerancePct":0.15,"toleranceDays":45}} | {"factures":"main","suppliers":"join","categories":"join","commandes":"main","budgets":"budget"} | ["budgets"] | [] | [] | - | SUM | [{"id":"whitecape_liadev","label":"whitecape_liadev","active":false,"statuses":{"facture":{"provisional":["RECU"],"final":["COMPTABILISE"],"statusColumn":"factures.status"},"commande":{"provisional":["En cours"],"final":["LIVRE"],"statusColumn":"commandes.status"}}}] | [] | {} | liadev-erp | anomaly-detection | RS256 | org.postgresql.Driver |

## 21. CONNECTOR_CONFIG

Configuration source du connecteur Ask&Go ERP.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 8 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | step1_identity | {"name":"Ask&Go ERP","description":"Connecteur ERP multi-tenant pour import, pipelines et budgets","type":"ERP","authType":"JWT_SIGNED"} |
| 2 | step2_authentication | {"publicKey":"-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----","apiEndpoint":null,"apiAuthHeader":null,"apiAuthToken":null} |
| 3 | step3_database | {"jdbcUrl":"jdbc:postgresql://localhost:5432/askgo_db","jdbcUsername":"postgres","jdbcPassword":"••••••••","driverClass":"org.postgresql.Driver"} |
| 4 | step4_schema | {"mainTable":"factures","joinTables":[{"table":"suppliers","alias":"s","joinType":"INNER","onCondition":"factures.supplier_code = s.supplier_code"},{"table":"categories","alias":"c","joinType":"INNER","onCondition":"factures.category_code = c.category_code"}]} |
| 5 | step5_fieldMapping | {"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"} |
| 6 | step6_statuses | {"importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"],"importStatusColumn":"factures.status"} |
| 7 | step7_templates | {"facture":{"key":"facture","name":"Factures — import standard","description":"Importe les factures avec creation de series","enabled":true,"tables":["factures","suppliers","categories"],"joins":["s.supplier_code = factures.supplier_code","c.category_code = factures.category_code"],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status IN ('RECU', 'COMPTABILISE')"],"groupByCols":["s.supplier_name","c.category_name"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"s.supplier_name","invoiceDate":"factures.date","amount":"factures.amount","status":"factures.status","label":"c.category_name"},"tolerancePct":0.15,"toleranceDays":45,"importStatusColumn":"factures.status","importStatuses":["RECU","COMPTABILISE"],"provisionalStatuses":["RECU"],"finalStatuses":["COMPTABILISE"]},"commande":{"key":"commande","name":"Commandes — import bons de commande","description":"Importe les commandes pour analyse budget","enabled":true,"tables":["commandes"],"joins":[],"conditions":["commandes.status != 'ANNULE'"],"groupByCols":["supplierName"],"fieldMappings":{"commandeRef":"commandes.commande_id","commandeDate":"commandes.date_cmd","amount":"commandes.amount","supplierName":"commandes.supplier_code","budgetCode":"commandes.ligne_budgetaire","category":"commandes.category","status":"commandes.status"},"tolerancePct":0.1,"toleranceDays":30},"avoir":{"key":"avoir","name":"Avoirs — import notes de credit","description":"Importe les avoirs et notes de credit","enabled":true,"tables":["factures"],"joins":[],"conditions":["factures.tenant_id = '${tenantCode}'","factures.status = 'AVOIR'"],"groupByCols":["factures.supplier_code"],"fieldMappings":{"invoiceId":"factures.facture_id","supplierName":"factures.supplier_code","invoiceDate":"factures.date","amount":"factures.amount","label":"factures.category_code"},"tolerancePct":0.15,"toleranceDays":45}} |
| 8 | step8_budgetAndDefaults | {"budgetTemplate":{"mainTable":"budgets","joinTables":[],"conditions":["budgets.tenant_id = '${tenantCode}'","budgets.year = ${year}"],"mapping":{"budgetCode":"budgets.ligne_budgetaire","label":"budgets.libelle","allocatedAmount":"budgets.budget_alloue"}},"tenantDefaults":{"defaultTolerancePct":0.15,"defaultToleranceDays":45,"autoCreateSeries":true,"autoDetectAnomalies":true,"budgetAnalysisEnabled":true,"commandeImportEnabled":true,"fiscalYearStartMonth":1},"mappingLocked":true} |

## 22. AUTH_FIELDS

Champs d'authentification par type.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 6 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | NONE | [] |
| 2 | BASIC | [{"key":"username","label":"Utilisateur","type":"text"},{"key":"password","label":"Mot de passe","type":"password"}] |
| 3 | API_KEY | [{"key":"apiKey","label":"Clé API","type":"password"},{"key":"apiKeyHeader","label":"Nom du header","type":"text","placeholder":"X-API-Key"}] |
| 4 | OAUTH2 | [{"key":"clientId","label":"Client ID","type":"text"},{"key":"clientSecret","label":"Client Secret","type":"password"},{"key":"tokenUrl","label":"Token URL","type":"text"},{"key":"scopes","label":"Scopes","type":"text","placeholder":"read write"}] |
| 5 | JWT_SIGNED | [{"key":"publicKey","label":"Clé publique (PEM)","type":"textarea"},{"key":"issuer","label":"Issuer","type":"text"},{"key":"audience","label":"Audience","type":"text"},{"key":"algorithm","label":"Algorithme","type":"select","options":["RS256","RS384","RS512","ES256","HS256"]}] |
| 6 | SAML | [{"key":"entityId","label":"Entity ID","type":"text"},{"key":"ssoUrl","label":"SSO URL","type":"text"},{"key":"certificate","label":"Certificat X.509","type":"textarea"}] |

## 23. PIPELINE_DEFS

Definitions UI et mapping des pipelines.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 2 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | facture | {"label":"Factures","color":"#D94F3D","Icon":{"render":"[Function Database]"},"fixedFields":[{"key":"invoiceId","label":"ID Facture / Invoice ID","required":true},{"key":"supplierName","label":"Fournisseur / Supplier","required":true},{"key":"invoiceDate","label":"Date Facture / Invoice Date","required":true},{"key":"amount","label":"Montant / Amount","required":true},{"key":"status","label":"Statut / Status","required":true},{"key":"label","label":"Label / Catégorie","required":true}],"allowExtraFields":false,"hasGroupBy":true} |
| 2 | commande | {"label":"Commandes","color":"#3b82f6","Icon":{"render":"[Function Layers]"},"fixedFields":[{"key":"commandeRef","label":"Référence commande","required":true},{"key":"commandeDate","label":"Date commande","required":true},{"key":"amount","label":"Montant","required":true},{"key":"supplierName","label":"Fournisseur","required":true},{"key":"status","label":"Statut","required":true},{"key":"budgetCode","label":"Ligne budgétaire (optionnel)","required":false},{"key":"category","label":"Catégorie (optionnel)","required":false}],"allowExtraFields":true,"hasGroupBy":true} |

## 24. GENERIC_SCHEMA

Schema ERP generique.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 2 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | tables | [{"name":"factures","cols":["facture_id","tenant_id","date","status","amount","supplier_code","category_code"],"rowCount":50},{"name":"suppliers","cols":["supplier_code","supplier_name"],"rowCount":4},{"name":"categories","cols":["category_code","category_name"],"rowCount":5},{"name":"commandes","cols":["commande_id","facture_id","date_cmd","amount","supplier_code","ligne_budgetaire","category","status"],"rowCount":36},{"name":"budgets","cols":["budget_id","tenant_id","year","ligne_budgetaire","libelle","budget_alloue","montant_engage","montant_consomme","status"],"rowCount":3}] |
| 2 | rels | [{"from":"factures","to":"suppliers","col":"supplier_code","type":"N:1"},{"from":"factures","to":"categories","col":"category_code","type":"N:1"},{"from":"commandes","to":"factures","col":"facture_id","type":"N:1"},{"from":"commandes","to":"suppliers","col":"supplier_code","type":"N:1"},{"from":"commandes","to":"budgets","col":"ligne_budgetaire","type":"N:1"}] |

## 25. CSV_SOURCE_PRESETS

Presets de sources CSV.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 3 |
| Columns | type, label, name, tableName, cols, rowCount |

| # | type | label | name | tableName | cols | rowCount |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | facture | Factures CSV | demo_factures_2026.csv | factures_csv | ["invoice_ref","invoice_date","supplier_code","supplier_name","amount","currency","category","status","tenant_id"] | 248 |
| 2 | commande | Commandes CSV | demo_commandes_2026.csv | commandes_csv | ["commande_id","commande_date","vendor_code","vendor_name","amount","budget_code","category","status","tenant_id"] | 136 |
| 3 | budget | Budgets CSV | demo_budgets_2026.csv | budgets_csv | ["budget_id","year","budget_code","libelle","budget_alloue","montant_engage","montant_consomme","tenant_id"] | 42 |

## 26. MOCK_SCHEMAS

Schemas ERP mock SAP/Sage.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 2 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | c1 | {"tables":[{"name":"BKPF","cols":["MANDT","BUKRS","BELNR","GJAHR","BLART","BLDAT","BUDAT","WAERS","XBLNR","BKTXT"],"rowCount":842301},{"name":"BSEG","cols":["MANDT","BUKRS","BELNR","GJAHR","BUZEI","KOART","LIFNR","KUNNR","SAKNR","DMBTR","WRBTR","SGTXT","ZFBDT"],"rowCount":2104560},{"name":"LFA1","cols":["MANDT","LIFNR","LAND1","NAME1","NAME2","ORT01","PSTLZ","STRAS","TELF1","WAERS","ZTERM"],"rowCount":14200},{"name":"EKKO","cols":["MANDT","EBELN","BUKRS","BSTYP","BSART","LIFNR","EKGRP","BEDAT","WAERS","NETWR"],"rowCount":198400},{"name":"EKPO","cols":["MANDT","EBELN","EBELP","MATNR","TXZ01","MENGE","MEINS","NETPR","NETWR","ELIKZ"],"rowCount":512000},{"name":"CSKS","cols":["MANDT","KOKRS","KOSTL","DATBI","DATAB","BKZKP","WAERS","TXKST","BUDGET_ANNUEL"],"rowCount":3200},{"name":"T001","cols":["MANDT","BUKRS","BUTXT","ORT01","LAND1","WAERS","SPRAS"],"rowCount":4}],"rels":[{"from":"BKPF","to":"BSEG","col":"BELNR+GJAHR","type":"1:N"},{"from":"BSEG","to":"LFA1","col":"LIFNR","type":"N:1"},{"from":"EKKO","to":"EKPO","col":"EBELN","type":"1:N"},{"from":"EKKO","to":"LFA1","col":"LIFNR","type":"N:1"},{"from":"BSEG","to":"CSKS","col":"KOSTL","type":"N:1"}]} |
| 2 | c2 | {"tables":[{"name":"FACTURES","cols":["ID_FACTURE","NUM_PIECE","DATE_FACT","DATE_ECHE","CODE_FOUR","MONTANT_HT","MONTANT_TTC","STATUT","DEVISE","SAISIE_PAR"],"rowCount":67420},{"name":"FOURNISSEURS","cols":["CODE_FOUR","NOM","ADRESSE","VILLE","PAYS","SIRET","COMPTE_COMPTA","DELAI_PAIEMENT"],"rowCount":2140},{"name":"COMMANDES","cols":["NUM_COMMANDE","DATE_CMD","CODE_FOUR","MONTANT_HT","STATUT","LIVRAISON_PREV","VALIDE_PAR"],"rowCount":48200},{"name":"LIGNES_FACTURE","cols":["ID_LIGNE","ID_FACTURE","CODE_ARTICLE","DESIGNATION","QTE","PU_HT","REMISE","MONTANT_LIGNE"],"rowCount":234800},{"name":"BUDGETS","cols":["ID_BUDGET","ANNEE","CODE_CENTRE","LIBELLE","MONTANT_ALLOUE","MONTANT_ENGAGE","MONTANT_CONSOM","STATUT"],"rowCount":840},{"name":"CENTRES_COUT","cols":["CODE_CENTRE","LIBELLE","RESP_CENTRE","BUDGET_ANNUEL","ACTIF"],"rowCount":48},{"name":"ARTICLES","cols":["CODE_ARTICLE","DESIGNATION","FAMILLE","UNITE","PRIX_ACHAT","TVA"],"rowCount":8900}],"rels":[{"from":"FACTURES","to":"FOURNISSEURS","col":"CODE_FOUR","type":"N:1"},{"from":"FACTURES","to":"COMMANDES","col":"NUM_COMMANDE","type":"N:1"},{"from":"LIGNES_FACTURE","to":"FACTURES","col":"ID_FACTURE","type":"N:1"},{"from":"LIGNES_FACTURE","to":"ARTICLES","col":"CODE_ARTICLE","type":"N:1"},{"from":"BUDGETS","to":"CENTRES_COUT","col":"CODE_CENTRE","type":"N:1"},{"from":"COMMANDES","to":"FOURNISSEURS","col":"CODE_FOUR","type":"N:1"}]} |

## 27. BUDGET_PRESETS

Presets de formules budget.

| Property | Value |
| --- | --- |
| Section | Configuration |
| Row count | 3 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | c1 | [{"id":"sap_std","name":"SAP Standard","desc":"CSKS.BUDGET_ANNUEL − Σ BSEG.DMBTR (KOART=K)","formula":[{"type":"agg","fn":"TABLE","table":"CSKS","col":"BUDGET_ANNUEL","label":"CSKS.BUDGET_ANNUEL"},{"type":"op","op":"−"},{"type":"agg","fn":"SUM","table":"BSEG","col":"DMBTR","label":"Σ BSEG.DMBTR","filter":"KOART='K'"}]},{"id":"sap_engaged","name":"Budget Engagé","desc":"Σ EKKO.NETWR (statut ouvert)","formula":[{"type":"agg","fn":"SUM","table":"EKKO","col":"NETWR","label":"Σ EKKO.NETWR","filter":"BSTYP='F'"}]}] |
| 2 | c2 | [{"id":"sage_alloc","name":"Sage Standard","desc":"BUDGETS.MONTANT_ALLOUE − MONTANT_CONSOM","formula":[{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_ALLOUE","label":"MONTANT_ALLOUE"},{"type":"op","op":"−"},{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_CONSOM","label":"MONTANT_CONSOM"}]},{"id":"sage_engage","name":"Avec Engagements","desc":"MONTANT_ALLOUE − MONTANT_ENGAGE − MONTANT_CONSOM","formula":[{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_ALLOUE","label":"MONTANT_ALLOUE"},{"type":"op","op":"−"},{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_ENGAGE","label":"MONTANT_ENGAGE"},{"type":"op","op":"−"},{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_CONSOM","label":"MONTANT_CONSOM"}]},{"id":"sage_custom","name":"Personnalisé","desc":"Construire votre propre formule","formula":[]}] |
| 3 | generic | [{"id":"gen_std","name":"Standard","desc":"BUDGETS.MONTANT_ALLOUE − MONTANT_CONSOM","formula":[{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_ALLOUE","label":"MONTANT_ALLOUE"},{"type":"op","op":"−"},{"type":"agg","fn":"COL","table":"BUDGETS","col":"MONTANT_CONSOM","label":"MONTANT_CONSOM"}]}] |

## 28. SETTINGS_DEFAULTS

Valeurs par defaut des parametres.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 8 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | pipelineMode | automated |
| 2 | alertChannel | inapp |
| 3 | storageMode | shared |
| 4 | authMode | oauth |
| 5 | anomalyMinInvoices | 3 |
| 6 | anomalyTolerancePct | 10 |
| 7 | lightMode | true |
| 8 | compactMode | false |

## 29. SETTINGS_OPTIONS

Options selectionnables des parametres.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 4 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | pipelineModes | [["manual","Manuel"],["automated","Automatise"]] |
| 2 | alertChannels | [["inapp","In-app"],["email","Email"],["webhook","Webhook mock"]] |
| 3 | storageModes | [["shared","Base partagee"],["dedicated","Base isolee"]] |
| 4 | authModes | [["oauth","OAuth 2.0"],["apikey","Cle API"],["basic","Basic Auth"],["jdbc","JDBC"]] |

## 30. TABLE_PALETTE

Palette ERD/table.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 8 |
| Columns | fill, light, dark |

| # | fill | light | dark |
| ---: | --- | --- | --- |
| 1 | #D94F3D | #fca5a5 | #991b1b |
| 2 | #0891b2 | #5eead4 | #0e7490 |
| 3 | #059669 | #6ee7b7 | #047857 |
| 4 | #d97706 | #fcd34d | #b45309 |
| 5 | #6366f1 | #a5b4fc | #4338ca |
| 6 | #db2777 | #f9a8d4 | #be185d |
| 7 | #2563eb | #93c5fd | #1d4ed8 |
| 8 | #ea580c | #fdba74 | #c2410c |

## 31. ERD_OFFSETS

Offsets de layout ERD.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 7 |
| Columns | x, y |

| # | x | y |
| ---: | --- | --- |
| 1 | 0 | 0 |
| 2 | 222 | 0 |
| 3 | 444 | 0 |
| 4 | 666 | 0 |
| 5 | 111 | 280 |
| 6 | 333 | 280 |
| 7 | 555 | 280 |

## 32. CUSTOM_PIPELINE_COLORS

Couleurs pipelines custom.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 6 |
| Columns | value |

| # | value |
| ---: | --- |
| 1 | #7c3aed |
| 2 | #0891b2 |
| 3 | #059669 |
| 4 | #d97706 |
| 5 | #db2777 |
| 6 | #ea580c |

## 33. WIZARD_STEPS

Etapes du wizard connecteur.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 8 |
| Columns | label, desc, Icon |

| # | label | desc | Icon |
| ---: | --- | --- | --- |
| 1 | Identité | Nom, auth, logo | {"render":"[Function Tag]"} |
| 2 | Connexion | JDBC/API + tables | {"render":"[Function Plug]"} |
| 3 | Exploration | Vue ERD schéma | {"render":"[Function Network]"} |
| 4 | Pipelines | Factures, Cmd, Custom | {"render":"[Function GitBranch]"} |
| 5 | Budget | Tables, colonnes, formule | {"render":"[Function Calculator]"} |
| 6 | Tenants | Statuts par client | {"render":"[Function Cpu]"} |
| 7 | Données test | Génération & preview | {"render":"[Function Sparkles]"} |
| 8 | Récapitulatif | Vérification finale | {"render":"[Function CircleCheck]"} |

## 34. WS_MAPPING_DEMO_COLUMNS

Colonnes demo de mapping workspace.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 8 |
| Columns | value |

| # | value |
| ---: | --- |
| 1 | invoice_ref |
| 2 | invoice_date |
| 3 | amount |
| 4 | supplier_code |
| 5 | label |
| 6 | entity |
| 7 | status |
| 8 | due_date |

## 35. WS_MAPPING_CORE_FIELDS

Champs coeur de mapping workspace.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 7 |
| Columns | k, lbl, req, hint |

| # | k | lbl | req | hint |
| ---: | --- | --- | --- | --- |
| 1 | amount | Montant | true | Valeur numérique de la facture |
| 2 | date | Date facture | true | Date d'émission ou de comptabilisation |
| 3 | supplier | Fournisseur | true | Code ou nom du tiers / fournisseur |
| 4 | label | Libellé / Service | false | Sous-catégorie, service ou description |
| 5 | tenant | Entité / Société | false | Code société ou entité juridique |
| 6 | status | Statut | false | Statut de la pièce |
| 7 | docref | Réf. document | false | Numéro ou référence de la pièce |

## 36. CSV_IMPORT_SEQUENCE

Sequence terminale d'import CSV.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 13 |
| Columns | delay, text, color |

| # | delay | text | color |
| ---: | --- | --- | --- |
| 1 | 0 | $ anomalyiq import --source csv --validate | #a8d8a8 |
| 2 | 320 |   Lecture du fichier… | #94a3b8 |
| 3 | 700 |   Parsing en-têtes CSV… | #94a3b8 |
| 4 | 1100 |   ✔ En-têtes détectés : | #4ade80 |
| 5 | 1350 | __FIELDS__ | #60a5fa |
| 6 | 1700 |   Validation des types… | #94a3b8 |
| 7 | 2100 |   ✔ Colonnes montant   → numeric (float64) | #4ade80 |
| 8 | 2400 |   ✔ Colonnes date      → datetime | #4ade80 |
| 9 | 2700 |   ✔ Colonnes fournisseur → string | #4ade80 |
| 10 | 3000 |   Chargement dans la mémoire pipeline… | #94a3b8 |
| 11 | 3400 | __ROWS__ | #f9a8d4 |
| 12 | 3800 |   ✔ Import terminé avec succès | #4ade80 |
| 13 | 4000 |   Pipeline prêt — passez à la connexion ↓ | #fbbf24 |

## 37. PIPELINE_CSV_FIXTURES

Fixtures CSV pipeline.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | name, file, desc, mapping |

| # | name | file | desc | mapping |
| ---: | --- | --- | --- | --- |
| 1 | Factures Ask&Go mixed quality | askgo_factures_mixed_quality.csv | Factures avec doublons, valeurs manquantes, invalid dates, tenant_red. | invoice_ref -> ID, invoice_date -> date, supplier_name -> fournisseur, amount -> montant, category -> label, status -> statut |
| 2 | Commandes budget 2026 | askgo_commandes_budget_2026.csv | Commandes avec budget_code, projection BUDGET_FOURN, ligne invalide. | commande_id -> reference, commande_date -> date, vendor -> fournisseur, amount -> montant, budget_code -> budgetCode, status -> statut |
| 3 | Generic expenses quality cases | generic_expenses_quality_cases.csv | Colonnes differentes pour tester mapping et nettoyage generique. | record_id -> ID, date_posted -> date, vendor_name -> fournisseur, gross_amount -> montant, expense_type -> label, approval_state -> statut |

## 38. ADMIN_TENANT_TYPE_DEFS

Definitions de typologie tenant admin.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | type, role, colorKey, fallback |

| # | type | role | colorKey | fallback |
| ---: | --- | --- | --- | --- |
| 1 | Enterprise | ADMIN | red | - |
| 2 | Pro | TENANT_ADMIN | info | - |
| 3 | Starter | USER | success | true |

## 39. ADMIN_PIPELINE_STATUS_DEFS

Definitions statut pipeline admin.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | status, matches, colorKey |

| # | status | matches | colorKey |
| ---: | --- | --- | --- |
| 1 | Actif | ["actif"] | success |
| 2 | Warning | ["warning"] | warning |
| 3 | Paused | ["draft","paused"] | grey400 |

## 40. ADMIN_RADAR_METRICS

Metriques radar admin.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | value |

| # | value |
| ---: | --- |
| 1 | Factures |
| 2 | Anomalies |
| 3 | Pipelines |
| 4 | Alertes |
| 5 | Taux |

## 41. PIPELINE_DASHBOARD_RADAR_METRICS

Metriques radar dashboard pipeline.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | metric, fullMark |

| # | metric | fullMark |
| ---: | --- | --- |
| 1 | Volume (factures) | 100 |
| 2 | Stabilité (CV) | 100 |
| 3 | Alertes actives | 100 |
| 4 | Taille série | 100 |
| 5 | Tolérance | 100 |

## 42. ML_RADAR_METRICS

Metriques radar ML.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | metric, fullMark |

| # | metric | fullMark |
| ---: | --- | --- |
| 1 | Volume | 100 |
| 2 | Stabilité CV | 100 |
| 3 | Taille série | 100 |
| 4 | Tolérance | 100 |
| 5 | Score anomalie | 100 |

## 43. CONNECTOR_LABELS

Libelles connecteurs par id.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 2 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | mock-conn-1 | Ask&Go ERP |
| 2 | mock-conn-liadev | LiaDev ERP |

## 44. INTEGRATION_CATEGORIES

Categories integrations.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | id, label |

| # | id | label |
| ---: | --- | --- |
| 1 | all | Tout |
| 2 | erp | ERP |
| 3 | accounting | Comptabilité |
| 4 | crm | CRM |
| 5 | storage | Stockage |

## 45. INTEGRATION_CONNECTION_TYPES

Types de connexion integration.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | id, label, icon, desc |

| # | id | label | icon | desc |
| ---: | --- | --- | --- | --- |
| 1 | jdbc | JDBC | Database | Base SQL directe |
| 2 | api | API REST | Network | Endpoint HTTP |
| 3 | csv | Fichier CSV | Layers | Import fichier |

## 46. INTEGRATION_JOIN_TYPES

Types de jointures integration.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 4 |
| Columns | value |

| # | value |
| ---: | --- |
| 1 | INNER |
| 2 | LEFT |
| 3 | RIGHT |
| 4 | FULL |

## 47. VISUAL_JOIN_PALETTE

Palette visuelle des jointures.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | bg, border, text |

| # | bg | border | text |
| ---: | --- | --- | --- |
| 1 | rgba(217,79,61,.1) | rgba(217,79,61,.35) | #D94F3D |
| 2 | rgba(59,130,246,.1) | rgba(59,130,246,.35) | #1d4ed8 |
| 3 | rgba(34,197,94,.1) | rgba(34,197,94,.35) | #15803d |
| 4 | rgba(245,158,11,.1) | rgba(245,158,11,.35) | #92400e |
| 5 | rgba(139,92,246,.1) | rgba(139,92,246,.35) | #6d28d9 |

## 48. INTEGRATION_REPORT_FALLBACK_TENANTS

Tenants fallback pour rapport integration.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | id, label, active, platformTenantName, pipelines |

| # | id | label | active | platformTenantName | pipelines |
| ---: | --- | --- | --- | --- | --- |
| 1 | CLIENT_001 | Client Alpha | true | Alpha Corp | ["Factures","Commandes"] |
| 2 | CLIENT_002 | Client Beta | true | Beta Industries | ["Factures"] |
| 3 | CLIENT_003 | Client Gamma | false | - | [] |

## 49. DEFAULT_API_RESOURCE

Ressource API par defaut.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 3 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | path | /api/resource |
| 2 | cols | ["id","date","amount","status"] |
| 3 | rowCount | 100 |

## 50. ALERT_TABS

Onglets alertes.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 5 |
| Columns | id, label |

| # | id | label |
| ---: | --- | --- |
| 1 | toutes | Toutes |
| 2 | en_attente | En attente |
| 3 | anomaly | Anomalies |
| 4 | pipeline | Pipelines |
| 5 | system | Système |

## 51. MONTH_NAMES_FR

Noms des mois FR.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 12 |
| Columns | value |

| # | value |
| ---: | --- |
| 1 | Janvier |
| 2 | Février |
| 3 | Mars |
| 4 | Avril |
| 5 | Mai |
| 6 | Juin |
| 7 | Juillet |
| 8 | Août |
| 9 | Septembre |
| 10 | Octobre |
| 11 | Novembre |
| 12 | Décembre |

## 52. BUDGET_TABS

Onglets budget.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 4 |
| Columns | id, label |

| # | id | label |
| ---: | --- | --- |
| 1 | suivi | Suivi budgétaire |
| 2 | serie | Analyse par série |
| 3 | simulation | Simulation budget |
| 4 | commandes | Budget Commandes |

## 53. JSON_IMPORT_TEMPLATE

Template import JSON connecteur.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 7 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | identity | {"name":"Mon ERP","connectorType":"ERP","authType":"BASIC","logo":"ME","color":"#D94F3D","description":""} |
| 2 | authentication | {"username":"erp_user","password":"••••••"} |
| 3 | connection | {"type":"jdbc","jdbcUrl":"jdbc:postgresql://host:5432/erp_db","jdbcUsername":"erp_user","jdbcPassword":""} |
| 4 | tables | {"selected":["FACTURES","FOURNISSEURS","COMMANDES","BUDGETS"],"budgetSources":["BUDGETS"]} |
| 5 | pipelines | {"factures":{"enabled":true,"sourceTables":["FACTURES","FOURNISSEURS"],"fieldMappings":{}},"commandes":{"enabled":true,"sourceTables":["COMMANDES"],"groupBy":[]}} |
| 6 | budget | {} |
| 7 | tenants | ["CLIENT_001","CLIENT_002"] |

## 54. DERIVED_ANOMALY_DEFAULTS

Defaults d'anomalie derivee.

| Property | Value |
| --- | --- |
| Section | UI constants |
| Row count | 4 |
| Columns | key, detail |

| # | key | detail |
| ---: | --- | --- |
| 1 | type | AMOUNT_SPIKE |
| 2 | score | 0.96 |
| 3 | expectedAmountRatio | 0.72 |
| 4 | maxAcceptableRatio | 0.85 |