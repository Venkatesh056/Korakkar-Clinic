# Operational Runbook: Backup & Disaster Recovery
## Sri Korakkar Siddha and Ayurvedha Clinic

### 1. Objective
Ensure continuous data durability and recovery capability for clinic operations, patient medical history, prescriptions, and financial accounts.

### 2. Backup Schedules & Types
- **Automated Daily Encrypted Snapshots**: Triggered at 23:59 IST after Day Close.
- **On-Demand Manual Snapshot**: Executable by Administrator via `Backup & Restore` -> `Generate & Download Backup Now`.
- **Retention**: 7 years for clinical dispensing logs.

### 3. Restore Drill Procedure (Phase 15 Verification)
1. Navigate to `Backup & Restore` console as Administrator.
2. Select `Execute Certified Restore Drill`.
3. Confirm that seed baseline, product inventory, and customer registers restore cleanly.
4. Verify financial consistency:
   - Calculate Accounts: `Closing = Opening + Cash - Expenses`.
   - Ensure voided bills remain excluded.
5. Verify audit log records `RESTORE_DRILL` event with administrator username.

### 4. Incident Escalation
If snapshot corruption occurs, alert Chief Administrator immediately and load the latest verified offline JSON snapshot.
