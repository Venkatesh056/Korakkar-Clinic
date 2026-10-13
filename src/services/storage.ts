/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Persistent Local & Cloud-Ready Data Store
 */

import {
  ClinicInfo,
  Product,
  Patient,
  Prescription,
  Bill,
  Expense,
  DailyAccounts,
  AuditLog,
  User,
} from '../types';

const STORAGE_KEYS = {
  CLINIC_INFO: 'sk_clinic_info',
  USERS: 'sk_users',
  PRODUCTS: 'sk_products',
  PATIENTS: 'sk_patients',
  PRESCRIPTIONS: 'sk_prescriptions',
  BILLS: 'sk_bills',
  EXPENSES: 'sk_expenses',
  DAILY_ACCOUNTS: 'sk_daily_accounts',
  AUDIT_LOGS: 'sk_audit_logs',
  SESSION_USER: 'sk_session_user',
  BILL_SEQUENCE: 'sk_bill_sequence',
  EXP_SEQUENCE: 'sk_exp_sequence',
};

export const INITIAL_CLINIC_INFO: ClinicInfo = {
  name: 'Sri Korakkar Siddha and Ayurvedha Clinic',
  tagline: 'Traditional Siddha & Ayurvedic Dispensary & Holistic Healing',
  address: 'No. 42, Sivan Sannathi Street, Vadapalani, Chennai - 600026, Tamil Nadu',
  phone: '+91 98401 23456 / 044-2480 9988',
  email: 'pharmacy@srikorakkarclinic.com',
  regNumber: 'TN-AYUSH-DISP-2018-8429',
  gstin: '33AABCS1429M1Z8',
  chiefPhysician: 'Dr. K. Ramalingam, B.S.M.S., M.D. (Siddha)',
};

const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    username: 'admin',
    fullName: 'Dr. K. Ramalingam (Chief Physician & Admin)',
    role: 'ADMIN',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
    forcePasswordChange: false,
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: '2026-10-11T09:00:00Z',
  },
  {
    id: 'u-2',
    username: 'staff',
    fullName: 'Selvi K. (Dispensary Pharmacist)',
    role: 'STAFF',
    active: true,
    failedAttempts: 0,
    lockedUntil: null,
    forcePasswordChange: false,
    createdAt: '2026-01-01T08:00:00Z',
    lastLoginAt: '2026-10-11T09:15:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    productCode: 'SK-CH-01',
    name: 'Nilavembu Kudineer Churnam (50g)',
    category: 'Churnam',
    mrp: 90,
    sellingPrice: 90,
    gstRate: 5,
    stockQty: 85,
    unit: 'Pouch',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-2',
    productCode: 'SK-CH-02',
    name: 'Amukkara Churnam (100g)',
    category: 'Churnam',
    mrp: 85,
    sellingPrice: 85,
    gstRate: 5,
    stockQty: 120,
    unit: 'Container',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-3',
    productCode: 'SK-CH-03',
    name: 'Thirikadugu Churnam (50g)',
    category: 'Churnam',
    mrp: 60,
    sellingPrice: 60,
    gstRate: 5,
    stockQty: 95,
    unit: 'Pouch',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-4',
    productCode: 'SK-TH-01',
    name: 'Pinda Thailam (100ml)',
    category: 'Thailam',
    mrp: 140,
    sellingPrice: 140,
    gstRate: 12,
    stockQty: 48,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-5',
    productCode: 'SK-TH-02',
    name: 'Murivenna Pain Relief Thailam (100ml)',
    category: 'Thailam',
    mrp: 160,
    sellingPrice: 160,
    gstRate: 12,
    stockQty: 62,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-6',
    productCode: 'SK-TH-03',
    name: 'Dhanwantharam Thailam (200ml)',
    category: 'Thailam',
    mrp: 190,
    sellingPrice: 190,
    gstRate: 12,
    stockQty: 34,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-7',
    productCode: 'SK-LH-01',
    name: 'Special Chyawanprash Lehyam (500g)',
    category: 'Lehyam',
    mrp: 280,
    sellingPrice: 280,
    gstRate: 5,
    stockQty: 40,
    unit: 'Jar',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-8',
    productCode: 'SK-LH-02',
    name: 'Thendral Digestive Lehyam (200g)',
    category: 'Lehyam',
    mrp: 150,
    sellingPrice: 150,
    gstRate: 5,
    stockQty: 55,
    unit: 'Jar',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-9',
    productCode: 'SK-AS-01',
    name: 'Draksharishtam Tonic (450ml)',
    category: 'Asavam & Arishtam',
    mrp: 175,
    sellingPrice: 175,
    gstRate: 12,
    stockQty: 50,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-10',
    productCode: 'SK-TB-01',
    name: 'Chandraprabha Vati (60 Tablets)',
    category: 'Tablet & Vati',
    mrp: 180,
    sellingPrice: 180,
    gstRate: 12,
    stockQty: 75,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-11',
    productCode: 'SK-TB-02',
    name: 'Maha Yogaraj Guggulu (60 Tablets)',
    category: 'Tablet & Vati',
    mrp: 220,
    sellingPrice: 220,
    gstRate: 12,
    stockQty: 60,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod-12',
    productCode: 'SK-KS-01',
    name: 'Maharasnadi Kashayam (200ml)',
    category: 'Syrup & Kashayam',
    mrp: 165,
    sellingPrice: 165,
    gstRate: 5,
    stockQty: 42,
    unit: 'Bottle',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
];

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'S. Murugan',
    mobile: '9841029384',
    address: '14, 2nd Cross Street, Kodambakkam, Chennai',
    notes: 'Chronic lumbar disc stiffness. Under Siddha Varmam therapy and thailam massage.',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'pat-2',
    name: 'Ananya Sundaram',
    mobile: '9940182746',
    address: '88, Lake View Road, West Mambalam, Chennai',
    notes: 'Seasonal allergic rhinitis. Prescribed Thirikadugu churnam with honey.',
    createdAt: '2026-03-01T10:30:00Z',
    updatedAt: '2026-03-01T10:30:00Z',
  },
  {
    id: 'pat-3',
    name: 'K. Venkatesh',
    mobile: '9884019283',
    address: '27, North Mada Street, Mylapore, Chennai',
    notes: 'General immunity enhancement and digestive debility.',
    createdAt: '2026-03-12T16:00:00Z',
    updatedAt: '2026-03-12T16:00:00Z',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-1',
    patientId: 'pat-1',
    doctorName: 'Dr. K. Ramalingam, B.S.M.S.',
    prescriptionDate: '2026-10-10',
    medicines: [
      {
        id: 'rx-m-1',
        productId: 'prod-5',
        medicineName: 'Murivenna Pain Relief Thailam (100ml)',
        dosage: 'External Application',
        timing: 'Morning & Night',
        foodRelation: 'After Food',
        anupanam: 'Warm Towel Compress',
        duration: '15 days',
        instructions: 'Gently apply warm thailam to lumbar region and rest 20 mins.',
      },
      {
        id: 'rx-m-2',
        productId: 'prod-2',
        medicineName: 'Amukkara Churnam (100g)',
        dosage: '1/2 teaspoon (2g)',
        timing: 'Night',
        foodRelation: 'After Food',
        anupanam: 'Warm Milk with Palm Sugar',
        duration: '30 days',
        instructions: 'Take before bedtime for deep rejuvenation and nervous vigor.',
      },
    ],
    notes: 'Avoid cold beverages and prolonged standing. Review in 2 weeks.',
    createdBy: 'admin',
    createdAt: '2026-10-10T11:30:00Z',
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill-1',
    billNumber: 'SK-2026-0001',
    patientId: 'pat-1',
    patientName: 'S. Murugan',
    patientMobile: '9841029384',
    date: '2026-10-10',
    time: '11:45:10',
    items: [
      {
        id: 'bi-1',
        productId: 'prod-5',
        productCode: 'SK-TH-02',
        productName: 'Murivenna Pain Relief Thailam (100ml)',
        category: 'Thailam',
        quantity: 1,
        mrp: 160,
        lineTotal: 160,
      },
      {
        id: 'bi-2',
        productId: 'prod-2',
        productCode: 'SK-CH-02',
        productName: 'Amukkara Churnam (100g)',
        category: 'Churnam',
        quantity: 1,
        mrp: 85,
        lineTotal: 85,
      },
    ],
    subtotal: 245,
    discountType: 'AMOUNT',
    discountValue: 15,
    discountAmount: 15,
    discountedSubtotal: 230,
    gstEnabled: false,
    gstRate: 0,
    gstAmount: 0,
    grandTotal: 230,
    paymentMode: 'CASH',
    status: 'FINALIZED',
    createdBy: 'staff',
    reprintCount: 0,
    createdAt: '2026-10-10T11:45:10Z',
  },
  {
    id: 'bill-2',
    billNumber: 'SK-2026-0002',
    patientId: 'pat-2',
    patientName: 'Ananya Sundaram',
    patientMobile: '9940182746',
    date: '2026-10-10',
    time: '14:20:00',
    items: [
      {
        id: 'bi-3',
        productId: 'prod-3',
        productCode: 'SK-CH-03',
        productName: 'Thirikadugu Churnam (50g)',
        category: 'Churnam',
        quantity: 2,
        mrp: 60,
        lineTotal: 120,
      },
    ],
    subtotal: 120,
    discountType: 'PERCENTAGE',
    discountValue: 0,
    discountAmount: 0,
    discountedSubtotal: 120,
    gstEnabled: false,
    gstRate: 0,
    gstAmount: 0,
    grandTotal: 120,
    paymentMode: 'UPI',
    status: 'FINALIZED',
    createdBy: 'staff',
    reprintCount: 0,
    createdAt: '2026-10-10T14:20:00Z',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    voucherNumber: 'VOU-2026-001',
    expenseType: 'Herbal Raw Materials',
    amount: 650,
    date: '2026-10-10',
    description: 'Fresh organic Amla and Ginger lot for dispensary decotions',
    createdBy: 'admin',
    createdAt: '2026-10-10T09:30:00Z',
  },
  {
    id: 'exp-2',
    voucherNumber: 'VOU-2026-002',
    expenseType: 'Tea & Refreshments',
    amount: 120,
    date: '2026-10-10',
    description: 'Herbal tea and mineral water for clinic staff and patients',
    createdBy: 'staff',
    createdAt: '2026-10-10T15:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-10T08:00:00Z',
    actor: 'admin',
    role: 'ADMIN',
    action: 'SYSTEM_BOOTSTRAP',
    details: 'Sri Korakkar Siddha & Ayurvedha Clinic system initialized.',
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-10T11:45:10Z',
    actor: 'staff',
    role: 'STAFF',
    action: 'BILL_FINALIZED',
    details: 'Bill SK-2026-0001 finalized for ₹230.00 (Mode: CASH).',
  },
];

/** Safe localStorage getter and setter */
function getItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Storage error writing key ${key}:`, err);
  }
}

// -------------------------------------------------------------
// PUBLIC STORAGE API
// -------------------------------------------------------------

export const storage = {
  getClinicInfo(): ClinicInfo {
    return getItem<ClinicInfo>(STORAGE_KEYS.CLINIC_INFO, INITIAL_CLINIC_INFO);
  },
  saveClinicInfo(info: ClinicInfo): void {
    setItem(STORAGE_KEYS.CLINIC_INFO, info);
  },

  getUsers(): User[] {
    return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  getProducts(): Product[] {
    return getItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    setItem(STORAGE_KEYS.PRODUCTS, products);
  },

  getPatients(): Patient[] {
    return getItem<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  },
  savePatients(patients: Patient[]): void {
    setItem(STORAGE_KEYS.PATIENTS, patients);
  },

  getPrescriptions(): Prescription[] {
    return getItem<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
  },
  savePrescriptions(prescriptions: Prescription[]): void {
    setItem(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
  },

  getBills(): Bill[] {
    return getItem<Bill[]>(STORAGE_KEYS.BILLS, INITIAL_BILLS);
  },
  saveBills(bills: Bill[]): void {
    setItem(STORAGE_KEYS.BILLS, bills);
  },

  getExpenses(): Expense[] {
    return getItem<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  },
  saveExpenses(expenses: Expense[]): void {
    setItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  getDailyAccounts(): Record<string, DailyAccounts> {
    return getItem<Record<string, DailyAccounts>>(STORAGE_KEYS.DAILY_ACCOUNTS, {
      '2026-10-10': {
        date: '2026-10-10',
        openingBalance: 3000,
        openingBalanceSet: true,
        cashSales: 230,
        upiSales: 120,
        cardSales: 0,
        transferSales: 0,
        totalSales: 350,
        totalExpenses: 770,
        closingBalance: 2460, // 3000 + 230 - 770 = 2460
        isClosed: true,
        closedBy: 'admin',
        closedAt: '2026-10-10T21:00:00Z',
      },
    });
  },
  saveDailyAccounts(accounts: Record<string, DailyAccounts>): void {
    setItem(STORAGE_KEYS.DAILY_ACCOUNTS, accounts);
  },

  getAuditLogs(): AuditLog[] {
    return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(actor: string, role: User['role'], action: string, details: string): void {
    const logs = this.getAuditLogs();
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      details,
    };
    setItem(STORAGE_KEYS.AUDIT_LOGS, [entry, ...logs]);
  },

  getNextBillNumber(): string {
    const bills = this.getBills();
    const currentYear = new Date().getFullYear();
    const prefix = `SK-${currentYear}-`;
    let highestNum = 0;

    for (const b of bills) {
      if (b.billNumber.startsWith(prefix)) {
        const numPart = parseInt(b.billNumber.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    }
    const nextNum = highestNum + 1;
    return `${prefix}${nextNum.toString().padStart(4, '0')}`;
  },

  getNextVoucherNumber(): string {
    const expenses = this.getExpenses();
    const currentYear = new Date().getFullYear();
    const prefix = `VOU-${currentYear}-`;
    let highestNum = 0;

    for (const e of expenses) {
      if (e.voucherNumber.startsWith(prefix)) {
        const numPart = parseInt(e.voucherNumber.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > highestNum) {
          highestNum = numPart;
        }
      }
    }
    const nextNum = highestNum + 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  },

  // Reset to clean seed defaults for restore drill or testing
  resetToFactoryDefaults(): void {
    setItem(STORAGE_KEYS.CLINIC_INFO, INITIAL_CLINIC_INFO);
    setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setItem(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    setItem(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    setItem(STORAGE_KEYS.BILLS, INITIAL_BILLS);
    setItem(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    setItem(STORAGE_KEYS.DAILY_ACCOUNTS, {});
    this.addAuditLog('admin', 'ADMIN', 'RESTORE_DRILL', 'Database reset to factory demonstration baseline.');
  },

  // Full JSON export for backup
  exportFullSnapshot(): string {
    const snapshot = {
      exportTimestamp: new Date().toISOString(),
      clinic: this.getClinicInfo(),
      users: this.getUsers(),
      products: this.getProducts(),
      patients: this.getPatients(),
      prescriptions: this.getPrescriptions(),
      bills: this.getBills(),
      expenses: this.getExpenses(),
      dailyAccounts: this.getDailyAccounts(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(snapshot, null, 2);
  },

  // Full import for restore drill
  importFullSnapshot(jsonString: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data.clinic || !Array.isArray(data.products) || !Array.isArray(data.bills)) {
        return { success: false, error: 'Invalid snapshot format or missing mandatory tables.' };
      }
      setItem(STORAGE_KEYS.CLINIC_INFO, data.clinic);
      if (Array.isArray(data.users)) setItem(STORAGE_KEYS.USERS, data.users);
      if (Array.isArray(data.products)) setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (Array.isArray(data.patients)) setItem(STORAGE_KEYS.PATIENTS, data.patients);
      if (Array.isArray(data.prescriptions)) setItem(STORAGE_KEYS.PRESCRIPTIONS, data.prescriptions);
      if (Array.isArray(data.bills)) setItem(STORAGE_KEYS.BILLS, data.bills);
      if (Array.isArray(data.expenses)) setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.dailyAccounts) setItem(STORAGE_KEYS.DAILY_ACCOUNTS, data.dailyAccounts);
      this.addAuditLog('admin', 'ADMIN', 'BACKUP_RESTORE', 'Database restored from imported JSON snapshot.');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Corrupted snapshot JSON.' };
    }
  },
};
