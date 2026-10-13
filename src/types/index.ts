/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Core Type Definitions
 */

export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  failedAttempts: number;
  lockedUntil: string | null;
  forcePasswordChange: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export type ProductCategory =
  | 'Churnam'
  | 'Thailam'
  | 'Lehyam'
  | 'Asavam & Arishtam'
  | 'Bhasmam & Chenduram'
  | 'Tablet & Vati'
  | 'Syrup & Kashayam'
  | 'Herbal Oil'
  | 'General';

export interface Product {
  id: string;
  productCode: string;
  name: string;
  category: ProductCategory;
  mrp: number;
  sellingPrice: number;
  gstRate: number; // 0, 5, 12, 18
  stockQty: number;
  unit: string; // e.g. "Bottle", "Pouch", "Strip", "Jar", "g", "ml"
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  mobile: string; // exactly 10 digits
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionMedicine {
  id: string;
  productId?: string;
  productCode?: string;
  medicineName: string;
  dosage: string; // e.g. "1 tsp", "1 tablet"
  timing: 'Morning' | 'Night' | 'Morning & Night' | 'Thrice Daily' | 'As Needed';
  foodRelation: 'Before Food' | 'After Food' | 'With Food';
  anupanam?: string; // vehicle, e.g. "Warm Water", "Honey", "Warm Milk", "Ghee"
  duration: string; // e.g. "15 days", "1 month"
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName?: string;
  doctorName: string;
  prescriptionDate: string; // YYYY-MM-DD
  medicines: PrescriptionMedicine[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface BillItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  category: ProductCategory;
  quantity: number;
  mrp: number; // editable per line
  lineTotal: number; // quantity * mrp
}

export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'TRANSFER';

export interface Bill {
  id: string;
  billNumber: string; // e.g. SK-2026-0001
  patientId: string | null;
  patientName: string;
  patientMobile: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  items: BillItem[];
  subtotal: number;
  discountType: 'PERCENTAGE' | 'AMOUNT';
  discountValue: number;
  discountAmount: number;
  discountedSubtotal: number;
  gstEnabled: boolean;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  status: 'FINALIZED' | 'VOID';
  voidReason?: string;
  voidedBy?: string;
  voidedAt?: string;
  createdBy: string;
  reprintCount: number;
  idempotencyKey?: string;
  createdAt: string;
}

export type ExpenseType =
  | 'Clinic Rent'
  | 'Electricity & Utilities'
  | 'Herbal Raw Materials'
  | 'Clinic Supplies'
  | 'Staff Salary & Wages'
  | 'Tea & Refreshments'
  | 'Courier & Parcel'
  | 'Sanitation & Cleaning'
  | 'Maintenance'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  voucherNumber: string; // e.g. VOU-2026-001
  expenseType: ExpenseType;
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  createdBy: string;
  createdAt: string;
}

export interface DailyAccounts {
  date: string; // YYYY-MM-DD
  openingBalance: number;
  openingBalanceSet: boolean;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  transferSales: number;
  totalSales: number;
  totalExpenses: number;
  closingBalance: number; // Opening + CashSales - TotalExpenses
  isClosed: boolean;
  closedBy?: string;
  closedAt?: string;
  reopenedBy?: string;
  reopenedReason?: string;
  reopenReason?: string;
  reopenedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: Role;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  regNumber: string;
  gstin?: string;
  chiefPhysician: string;
}
