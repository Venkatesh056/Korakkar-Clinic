# Sri Korakkar Siddha and Ayurvedha Clinic
## Pharmacy Billing, Accounts & Patient Management System

Production-grade medical dispensary, prescription tracking, and authoritative financial accounting system designed for Sri Korakkar Siddha and Ayurvedha Clinic.

---

### Key Capabilities

1. **Dispensary Point of Sale (POS)**:
   - Rapid medicine search by product code (e.g. `SK-CH-01`) or name (`Nilavembu`, `Amukkara`).
   - Line-item editable MRP and positive decimal/integer quantities.
   - Bill-level discount (percentage or fixed amount, with latest edited input taking precedence).
   - Optional GST toggle (5% AYUSH, 12% Thailam/Syrup, 18% General).
   - Server-authoritative calculation: **Verified ₹151.20 worked example passes**.
   - Immutable finalized bills, sequential numbering (`SK-2026-0001`), and Admin-only voiding with mandatory audit reason.

2. **Accounts & Daily Cash Drawer Reconciliation (Highest Functional Priority)**:
   - Authoritative formula: `Closing Balance = Opening Balance + Cash Sales - Expenses`.
   - UPI, Card, and Bank Transfer sales are included in `Total Sales` but **strictly excluded** from physical drawer cash in hand.
   - **Verified ₹15,500 closing cash and ₹18,000 total sales worked example passes**.
   - Daily opening balance prompt, day-end locking, and authorized Admin reopening.

3. **Patient & Append-Only Prescription Management**:
   - Case-insensitive search by name or 10-digit mobile number with duplicate detection.
   - Chronological append-only prescriptions with traditional dosage, food relation, and vehicle (*anupanam* e.g. honey, warm water, milk).
   - Dispensary purchase history linked to patient records.

4. **Print Architecture & Receipt Emulation**:
   - Thermal 58mm roll layout.
   - Thermal 80mm roll layout.
   - Standard A4 formal clinic invoice.
   - Distinct **DUPLICATE BILL** banner/watermark on non-original prints.

5. **Security & RBAC**:
   - ADMIN and STAFF roles with default-deny server-side authorization.
   - 3-attempt lockout with 15-minute cooldown.
   - Forced password change on initial login.
   - Tamper-resistant immutable audit trail.

---

### Quick Start & Verification

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3000` to access the dispensary console.

**Demo Credentials**:
- **Administrator**: `admin` / `admin123`
- **Dispensary Staff**: `staff` / `staff123`

---

### Mandatory Living Documentation

- `docs/PROGRESS.md` — Master 24-phase development roadmap and completion criteria.
- `docs/DECISIONS.md` — Approved Architectural Decision Records (ADRs).
- `docs/THREAT_MODEL.md` — STRIDE threat model and mitigations.
- `docs/SECURITY_CHECKLIST.md` — OWASP ASVS Level 2 security controls.
- `docs/UAT.md` — Executable user acceptance testing checklist.
- `docs/API.md` — REST API endpoint contracts.
- `docs/RUNBOOK_BACKUP_RESTORE.md` — Disaster recovery and restore drill runbook.
- `docs/RUNBOOK_INCIDENT.md` — Incident response and credential procedures.
