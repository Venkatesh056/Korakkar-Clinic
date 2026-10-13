# Threat Model (STRIDE)
## Sri Korakkar Siddha and Ayurvedha Clinic

### 1. Scope and Assets
- **Protected Assets**:
  - Patient personal information (name, 10-digit mobile number, address, clinical notes).
  - Prescriptions & medical dispensations.
  - Financial records: bill ledger, revenue by payment mode, expense vouchers, cash drawer reconciliation.
  - System integrity: Admin accounts, pricing snapshots, audit logs.

### 2. STRIDE Threat Analysis & Mitigations

| Category | Threat | Mitigations |
|---|---|---|
| **Spoofing** | Attacker impersonates clinic staff or admin | Strong password hashing, 3-attempt lockout (15 min cooldown), session timeout, role enforcement |
| **Tampering** | User modifies bill total or edits finalized bill | Finalized bills are strictly immutable; client totals discarded; server recalculates every total; Admin void requires mandatory reason |
| **Repudiation** | Staff denies deleting an expense or voiding a bill | Append-only audit log records actor, timestamp, action, and mandatory reason |
| **Information Disclosure** | PII leakage via logs or unauthorized API access | Logs sanitized of passwords and patient health notes; strict RBAC limits financial reports to Admin |
| **Denial of Service** | Rapid repeated requests lock out database or UI | Client throttling, rate limiting, idempotent bill submission prevents duplicate inserts |
| **Elevation of Privilege** | Staff role triggers Admin actions (e.g., voiding bills, reopening closed accounts) | Backend/service layer verifies `user.role === 'ADMIN'` on every privileged method |
