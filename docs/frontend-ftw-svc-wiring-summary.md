# Frontend ftw-svc Wiring Summary

This document summarizes the additional UI wiring pass completed after the initial endpoint integration work.

## Scope Completed

- Wired remaining high-impact UI surfaces to consume implemented `ftw-svc` endpoints.
- Preserved existing fallback behavior so screens remain functional when endpoint payloads are incomplete or unavailable.
- Kept all existing UI structure intact while replacing hardcoded/static data dependencies where corresponding backend endpoints now exist.

## Screens Updated

### `src/app/homeowner/dashboard/page.tsx`

- Added `fetchHomeownerDashboard()` integration for dashboard KPIs and project list hydration.
- Added `fetchJobCategories()` integration to drive category options from backend taxonomies (with UI-safe fallback styles).
- Retained existing notifications flow and existing mock fallback when backend data is missing.

### `src/app/contractor/projects/page.tsx`

- Added `fetchProjectChangeOrders(projectId)` loading in Change Orders tab.
- Added `createProjectChangeOrder(projectId, payload)` call when submitting new change orders.
- Added `fetchProjectPunchItems(projectId)` loading in Punch List tab.
- Added `createProjectPunchItem(projectId, payload)` call when adding punch items.
- Added `fetchProjectExpenses(projectId)` loading in Costs tab.
- Added `createProjectExpense(projectId, payload)` call when adding expenses.
- Added `fetchProjectDocuments(projectId)` loading in Documents tab.
- Added `createProjectDocument(projectId, payload)` call on document upload action.
- Kept tab-local optimistic UI updates so interactions remain responsive.

### `src/app/contractor/invoices/page.tsx`

- Added `fetchProjects()` + `fetchInvoiceableMilestones(projectId)` integration to populate Create Invoice project/milestone source data from backend.
- Replaced static project/milestone options with backend-driven options while keeping the existing static fallback set.
- Left existing invoice create/update flow intact (`fetchInvoices`, `createInvoice`, `updateInvoice`) and aligned milestone selection with backend availability.

### `src/app/contractor/work/page.tsx`

- Added `fetchEstimateTemplates()` integration to power estimate templates from backend endpoint output.
- Added `fetchClients()` integration to populate client selection from backend.
- Maintained local template/client fallback data for resiliency.

### `src/app/subcontractor/payments/page.tsx`

- Added `fetchSubcontractorEarningsSummary(subcontractorId)` for top-level earnings cards.
- Added `fetchSubcontractorPayouts(subcontractorId)` for payment history table.
- Preserved existing empty state when no payout history exists.

### `src/domains/marketplace/components/stats-bar.tsx`

- Added `fetchPublicStats()` integration for marketing/public stats.
- Replaced hardcoded stat rendering with backend-driven values (with default fallback).
- Refactored stat counter rendering into a child component to ensure hook usage remains valid and stable.

## Endpoint Coverage Added in This Pass

- `GET /api/homeowner/dashboard`
- `GET /api/taxonomies/job-categories`
- `GET /api/projects/{id}/change-orders`
- `POST /api/projects/{id}/change-orders`
- `GET /api/projects/{id}/punch-items`
- `POST /api/projects/{id}/punch-items`
- `GET /api/projects/{id}/expenses`
- `POST /api/projects/{id}/expenses`
- `GET /api/projects/{id}/documents`
- `POST /api/projects/{id}/documents`
- `GET /api/projects/{id}/invoiceable-milestones`
- `GET /api/estimate-templates`
- `GET /api/subcontractors/{id}/earnings-summary`
- `GET /api/subcontractors/{id}/payouts`
- `GET /api/stats/public`

## Validation

- Ran linter diagnostics on all edited files; no new linter issues were introduced in this pass.
