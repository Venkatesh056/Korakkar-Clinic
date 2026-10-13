# Architectural Decision Record (ADR)
## Sri Korakkar Siddha and Ayurvedha Clinic — Pharmacy Billing, Accounts & Patient Management System

### ADR-001: Financial Calculation Authority and Precision
- **Status**: APPROVED
- **Context**: Medical dispensary operations require absolute financial accuracy without floating-point drift or discrepancies between billing, accounting, and reports.
- **Decision**: All currency calculations are handled on the server/authoritative service layer using exact decimal arithmetic (two decimal places with `HALF_UP` rounding). The Accounts module is the single source of truth for financial totals.
- **Consequences**:
  - Exact formula: `Closing Balance = Opening Balance + Cash Sales - Expenses`.
  - Non-cash payment methods (`UPI`, `CARD`, `TRANSFER`) are excluded from physical cash in hand but included in `Total Sales`.
  - Verified test case: Opening ₹5,000 + Cash ₹12,000 - Expenses ₹1,500 = ₹15,500 closing cash; Total Sales = ₹18,000 (with UPI ₹3k, Card ₹1k, Transfer ₹2k).

### ADR-002: Bill Immutability and Void Audit Trail
- **Status**: APPROVED
- **Context**: Finalized bills must not be tampered with or silently updated.
- **Decision**: Bills once finalized become immutable snapshots. Any voiding operation requires `ADMIN` privileges and a mandatory written reason. Voided bills are excluded from cash and sales calculations but preserved in the audit log.
- **Consequences**: Historical product details (MRP, product name) are snapshotted in bill line items at time of billing.

### ADR-003: Sequential Concurrency-Safe Bill Numbering
- **Status**: APPROVED
- **Context**: Need predictable, audit-compliant sequential numbering (`SK-YYYY-XXXXX`).
- **Decision**: Bill numbers are generated sequentially by the server/service with branch scoping and idempotency keys to prevent double-billing on network re-submission.

### ADR-004: Prescription Append-Only Integrity
- **Status**: APPROVED
- **Context**: Clinical Siddha and Ayurvedic prescriptions are legal medical records.
- **Decision**: Prescriptions are strictly append-only. Editing or replacing an existing prescription is disallowed; new visits append a new prescription dated chronologically.

### ADR-005: Thermal and Standard A4 Printing Architecture
- **Status**: APPROVED
- **Context**: Dispensary needs thermal roll receipts (58mm, 80mm) for fast counter billing and A4 for formal clinical invoices.
- **Decision**: Built-in responsive print formatting with dedicated CSS `@media print` rules, visual receipt preview modals with scale controls, reprint flags, and prominent "DUPLICATE BILL" banners for non-original prints.
