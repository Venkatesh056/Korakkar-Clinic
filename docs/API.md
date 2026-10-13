# API Specification & Domain Contracts
## Sri Korakkar Siddha and Ayurvedha Clinic

### Base Path
`/api/v1`

---

### 1. Authentication & Security
- `POST /api/v1/auth/login`: Authenticates user; returns session token; triggers lockout after 3 failures.
- `POST /api/v1/auth/logout`: Revokes session; writes audit entry.
- `POST /api/v1/auth/change-password`: Enforces $\ge 8$ characters and resets `forcePasswordChange`.

### 2. Billing & Point of Sale
- `POST /api/v1/bills`: Generates sequential bill (`SK-YYYY-XXXX`); recalculates subtotal, discounts, GST, and grand total server-side; snapshots products.
- `GET /api/v1/bills`: Query bills with filtering by date range, payment mode, and status.
- `POST /api/v1/bills/{id}/void`: Admin-only; requires mandatory `voidReason`; excludes from cash and revenue ledgers.

### 3. Accounts & Reconciliation (Authoritative Engine)
- `POST /api/v1/accounts/opening-balance`: Sets opening physical drawer cash once per business day.
- `GET /api/v1/accounts/today`: Returns current day's cash in hand, payment-mode collections, and expenses.
- `POST /api/v1/accounts/close`: Locks accounts for the business date.
- `POST /api/v1/accounts/reopen`: Admin-only; unlocks accounts with mandatory written audit reason.

### 4. Expense Management
- `POST /api/v1/expenses`: Records dispensary operational expense; creates printable voucher; reduces cash in hand.
- `DELETE /api/v1/expenses/{id}`: Admin-only deletion; updates daily accounts accordingly.

### 5. Patients & Prescriptions
- `POST /api/v1/patients`: Registers patient with mandatory 10-digit mobile number and duplicate detection.
- `POST /api/v1/patients/{id}/prescriptions`: Appends chronological clinical prescription with medicine timings and anupanam.
