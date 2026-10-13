# OWASP ASVS & Security Controls Checklist
## Sri Korakkar Siddha and Ayurvedha Clinic

| Control ID | Category | Requirement | Implementation Status | Evidence |
|---|---|---|---|---|
| **SEC-01** | Authentication | Password minimum length $\ge$ 8 characters | VERIFIED | `authService.updatePassword` enforces $\ge 8$ chars |
| **SEC-02** | Rate Limiting | 3 failed attempts triggers 15-minute lockout | VERIFIED | `LOCKOUT_THRESHOLD = 3`, `LOCKOUT_MINUTES = 15` |
| **SEC-03** | Credential Policy | Forced password change on first login | VERIFIED | `user.forcePasswordChange` triggers credential reset screen |
| **SEC-04** | Access Control | Role-based default-deny (Admin vs Staff) | VERIFIED | Admin-only voiding, user management, and day unlock |
| **SEC-05** | Integrity | Finalized bills are strictly immutable | VERIFIED | Historical product snapshots saved in bill items |
| **SEC-06** | Financial Audit | Single authoritative calculation engine | VERIFIED | `services/calculation.ts` self-test assertion passed |
| **SEC-07** | Non-Repudiation | Immutable audit log of security events | VERIFIED | `storage.addAuditLog` records actor, action, timestamp |
| **SEC-08** | Cash Separation | Non-cash exclusion from physical drawer | VERIFIED | `Closing = Opening + Cash - Expenses` strictly tested |
