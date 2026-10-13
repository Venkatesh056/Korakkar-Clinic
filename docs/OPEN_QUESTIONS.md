# Open Questions & Requirement Baselines
## Sri Korakkar Siddha and Ayurvedha Clinic

| ID | Topic | Current Baseline / Working Default | Impact | Resolution Status |
|---|---|---|---|---|
| Q-001 | Password Minimum Length | Enforcing 8-character minimum (SRS draft mentioned 6, security best practice requires $\ge$ 8) | High (Security) | Resolved to 8 chars min |
| Q-002 | Net Profit Calculation | Reported as provisional `Total Sales - Total Expenses` until inventory COGS is integrated | Medium (Reporting) | Clearly marked "Provisional" |
| Q-003 | Default Day Opening Balance | Defaults to Previous Day's Closing Balance or manual entry if not set | High (Accounts) | Configurable on Day Opening prompt |
| Q-004 | GST Rate Default | Disabled by default (0%). Optional toggle for 5%, 12%, 18% per SRS requirement | High (Billing) | Disabled by default |
| Q-005 | Product Quantity Fractional Units | Support integer pack units and decimal quantities (`12.3` kg/litres for bulk herbal churnams) | Medium (Inventory) | Supported |
