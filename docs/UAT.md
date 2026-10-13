# User Acceptance Test (UAT) Checklists
## Sri Korakkar Siddha and Ayurvedha Clinic

### Scenario 1: Returning Patient Prescription & Billing (SRS Scenario 1)
- [x] 1. Search patient by 10-digit mobile number or name.
- [x] 2. Review historical visits, past prescriptions, and previously purchased medicines.
- [x] 3. Add prescription with medicine dosage instructions (e.g. "Amukkara Churnam 1 tsp twice daily after food").
- [x] 4. Convert or initiate bill with auto-suggested Siddha/Ayurveda products.
- [x] 5. Modify MRP/Quantity as required.
- [x] 6. Apply bill-level discount (percentage or fixed amount).
- [x] 7. Verify calculation:
  - Line 1: 2 × ₹30 = ₹60
  - Line 2: 1 × ₹100 = ₹100
  - Subtotal = ₹160
  - 10% discount = ₹16 -> Discounted = ₹144
  - GST 5% = ₹7.20 -> Grand Total = ₹151.20
- [x] 8. Finalize bill with payment mode CASH / UPI / CARD / TRANSFER.
- [x] 9. Print original thermal bill (58mm or 80mm) or A4 format.

### Scenario 2: Walk-In Fast Billing & Duplicate Print (SRS Scenario 2)
- [x] 1. Choose Walk-in customer or enter new patient details directly.
- [x] 2. Add multiple items rapidly using product code / search.
- [x] 3. Finalize bill and verify sequential bill numbering (e.g., `SK-2026-0001`).
- [x] 4. Re-open bill from history and trigger Reprint (Original layout).
- [x] 5. Trigger Duplicate Print and verify prominent `DUPLICATE BILL` banner/watermark.

### Scenario 3: Daily Cash Reconciliation & Day Close (SRS Scenario 3)
- [x] 1. Enter Day Opening Balance (e.g. ₹5,000).
- [x] 2. Record billing transactions across payment modes:
  - Cash Sales: ₹12,000
  - UPI Sales: ₹3,000
  - Card Sales: ₹1,000
  - Transfer Sales: ₹2,000
- [x] 3. Record business expense with printable voucher (e.g. ₹1,500 clinic supplies).
- [x] 4. Verify authoritative formula:
  - Closing Balance = ₹5,000 + ₹12,000 − ₹1,500 = **₹15,500**.
  - Total Sales = ₹12,000 + ₹3,000 + ₹1,000 + ₹2,000 = **₹18,000**.
- [x] 5. Lock the day (Admin Day Close).
- [x] 6. Verify non-admins cannot modify records on closed days.
- [x] 7. Admin reopen day with mandatory audit reason.
