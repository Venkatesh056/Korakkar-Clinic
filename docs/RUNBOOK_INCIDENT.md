# Operational Runbook: Incident Handling & Security Response
## Sri Korakkar Siddha and Ayurvedha Clinic

### 1. Security Incidents Covered
- Account brute-force lockout triggers (3 consecutive failed logins).
- Attempted unauthorized bill voiding or tampering.
- Attempted financial modifications on a locked/closed business day.
- Administrative password reset requests.

### 2. Lockout Recovery Procedure
- If staff account is locked (15-minute cooldown), an Administrator can navigate to `User Management` -> select `Reset Pass`.
- This clears `failedAttempts` and `lockedUntil`, and flags `forcePasswordChange = true` so the user sets a secure 8+ character password upon next login.

### 3. Discrepancy Reconciliation in Daily Cash
- If physical cash in drawer deviates from `Closing Cash in Hand`:
  1. Inspect `Today's Collections by Mode` in Accounts Ledger.
  2. Verify all unrecorded clinical cash expenses have vouchers generated.
  3. Ensure UPI/Card payments were not mistakenly placed in cash drawer.
  4. If corrections are required on closed day, Administrator unlocks with mandatory audit reason.
