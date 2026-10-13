# UI/UX Redesign Documentation: Human-Centred Clinical Experience
## Sri Korakkar Siddha and Ayurvedha Clinic
### “The quiet intelligence of traditional medicine, expressed through contemporary clinical precision.”

---

## 1. Phase 1 — Comprehensive UI & Experience Audit

### 1.1 Screen Inventory
1. **Authentication Screen (`LoginModal.tsx`)**:
   - *Current State*: Standard dark slate modal overlay with generic input fields and dark buttons.
   - *Design Issues*: Resembles a generic SaaS auth dialog. Lacks the serene, dignified ambiance of a traditional Siddha clinic.
   - *Redesign Objective*: Warm medicinal-paper ivory background, rich forest green accents, refined serif clinic typography, discrete security feedback.

2. **Dashboard (`DashboardView.tsx`)**:
   - *Current State*: Standard 4-card grid across the top (`bg-white rounded-xl shadow-xs`), quick action buttons in a grid, two-column split.
   - *Design Issues*: Standard template feel. Cards with identical borders and metric layouts lack intentional hierarchy.
   - *Redesign Objective*: A working dispensary operational board. Asymmetric visual balance, prominent physical cash drawer display, clean tabular activity streams, subtle botanical dividers instead of generic boxes.

3. **Billing Counter POS (`BillingView.tsx`)**:
   - *Current State*: Two-column split with generic card borders, standard inputs, standard button styles.
   - *Design Issues*: Lacks ergonomic flow for high-speed counter billing. Final total is in a dark box.
   - *Redesign Objective*: Purpose-engineered dispensary counter workstation. Distinct zones for Patient, Product Entry, Cart Ledger, and Settlement. High-contrast solid colour palette, keyboard focus rings, clear visual weight on the final total.

4. **Bill History & Void Ledger (`BillHistoryView.tsx`)**:
   - *Current State*: Standard data table with action buttons.
   - *Design Issues*: Generic table rows, standard action icons.
   - *Redesign Objective*: Official apothecary register aesthetic. Clear status demarcations (`FINALIZED` vs `VOID`), structured audit reasons, distinct reprint/duplicate actions.

5. **Patient Management & Clinical Prescriptions (`PatientManagementView.tsx`)**:
   - *Current State*: Directory list on left, patient card on right with prescription sub-cards.
   - *Design Issues*: Cards nested in cards, generic badges.
   - *Redesign Objective*: Dedicated patient case-file presentation. Clear clinical history, structured Ayurvedic medicine dosage with *anupanam* (honey/milk/warm water), clean chronological log.

6. **Product Master (`ProductMasterView.tsx`)**:
   - *Current State*: Standard CRUD table with search bar and category dropdown.
   - *Design Issues*: Looks like an e-commerce inventory table rather than an apothecary dispensary formulary.
   - *Redesign Objective*: Clean apothecary catalogue. Categorised by traditional preparation types (*Churnam*, *Thailam*, *Lehyam*, *Asavam*, *Bhasmam*), clear SKU codes, stock indicators.

7. **Accounts & Daily Cash Drawer Reconciliation (`AccountsView.tsx`)**:
   - *Current State*: Split view of physical cash flow vs total revenue.
   - *Design Issues*: Lacks the solemn financial gravitas of an end-of-day reconciliation ledger.
   - *Redesign Objective*: Classical double-entry settlement format. Clear distinction between physical cash in hand and digital non-cash receipts. Explicit Day Close lock status and administrative reopening workflow.

8. **Expense Management & Vouchers (`ExpenseManagementView.tsx`)**:
   - *Current State*: Table with modal voucher preview.
   - *Design Issues*: Generic modal voucher.
   - *Redesign Objective*: Authentic numbered dispensary payment vouchers with proper signature fields and expense heads.

9. **Clinical Reports & Analytics (`ReportsView.tsx`)**:
   - *Current State*: Segmented buttons with simple table.
   - *Design Issues*: Standard SaaS reports tab.
   - *Redesign Objective*: Editorial clinical financial reports with high-density tabular numbers, period summaries, and clean print outputs.

10. **Printing & Emulation (`BillPrintModal.tsx`)**:
    - *Current State*: Simple format toggles (58mm, 80mm, A4).
    - *Design Issues*: Adequate print styling, but can be made even more authentic with traditional Siddha clinic formatting, Tamil/English bilingual headers, and unmissable duplicate banners.

11. **User Management & Audit Trail (`UserManagementView.tsx`, `BackupRestoreView.tsx`)**:
    - *Current State*: Standard tables.
    - *Design Issues*: Predictable layout.
    - *Redesign Objective*: Purposeful administrative control rooms with unambiguous security boundaries.

12. **Mobile Bill Lookup (`MobileLookupView.tsx`)**:
    - *Current State*: Fixed frame dialog.
    - *Design Issues*: Generic phone simulation.
    - *Redesign Objective*: Streamlined pocket lookup tool for physicians and pharmacists.

---

## 2. Design Tokens & Colour System (Strictly Zero Gradients)

```css
:root {
  /* Primary colours */
  --color-forest: #284B3A;      /* Deep medicinal forest green */
  --color-leaf: #607A56;        /* Botanical leaf green */
  --color-sage: #A8B49A;        /* Muted sage */

  /* Background surfaces */
  --color-ivory: #F6F3EA;       /* Warm medicinal-paper ivory */
  --color-parchment: #EAE4D6;   /* Soft parchment */
  --color-paper: #FFFEFA;       /* Pure / near-white reading surface */

  /* Supporting accents */
  --color-earth: #80664A;       /* Earth brown */
  --color-terracotta: #B66E52;  /* Muted terracotta */
  --color-charcoal: #29332E;    /* Ink charcoal */
  --color-stone: #777B72;       /* Muted stone grey */
  --color-border: #DEDCCF;      /* Subtle border */
}
```

### Prohibited Styles
- **No linear, radial, or conic gradients anywhere**.
- **No gradient borders, text, or drop shadows**.
- **No floating neon or purple AI slop**.
- **No pill badge clusters or meaningless card containers**.

---

## 3. Typography Hierarchy
- **Brand / Editorial Title**: `Fraunces`, `serif` (warm, traditional, human, authoritative).
- **Interface & Operational Text**: `Plus Jakarta Sans`, `sans-serif` (clean, highly legible, accessible).
- **Financial & Quantitative Data**: `JetBrains Mono`, `tabular-nums` (strictly aligned figures, zero decimal drift).

---

## 4. Preservation of Functionality
- All 18 automated financial tests in `test/verify-financial-engine.ts` must continue passing with 100% precision.
- Closing Cash formula: `Closing = Opening + Cash - Expenses`.
- Bill Worked Example: Line 1 (₹60) + Line 2 (₹100) - 10% Discount (₹16) + 5% GST (₹7.20) = ₹151.20.
- RBAC, Audit Logging, Idempotency, and Append-only prescriptions remain strictly intact.
