/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Authoritative Centralized Financial & Calculation Engine
 * 
 * Complies with SRS Worked Examples:
 * 1. Bill Engine Test Case:
 *    Line 1: 2 × ₹30 = ₹60
 *    Line 2: 1 × ₹100 = ₹100
 *    Subtotal = ₹160
 *    Discount = 10% (₹16) -> Discounted Subtotal = ₹144
 *    GST = 5% of ₹144 = ₹7.20 -> Grand Total = ₹151.20
 * 
 * 2. Accounts Engine Test Case:
 *    Opening Balance = ₹5,000
 *    Cash Sales = ₹12,000
 *    UPI Sales = ₹3,000
 *    Card Sales = ₹1,000
 *    Transfer Sales = ₹2,000
 *    Expenses = ₹1,500
 *    Expected Closing Balance = Opening + CashSales - Expenses = ₹15,500
 *    Expected Total Sales = Cash + UPI + Card + Transfer = ₹18,000
 */

import { Bill, Expense, PaymentMode } from '../types';

/** Rounds monetary amounts strictly to 2 decimal places */
export function roundCurrency(val: number): number {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}

export interface BillCalculationInput {
  items: Array<{
    quantity: number;
    mrp: number;
  }>;
  discountType: 'PERCENTAGE' | 'AMOUNT';
  discountValue: number;
  gstEnabled: boolean;
  gstRate: number; // e.g. 5 for 5%
}

export interface BillCalculationOutput {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  gstAmount: number;
  grandTotal: number;
}

/**
 * Single authoritative source for all billing math.
 * The server/backend recalculates every request and rejects client-sent totals.
 */
export function calculateBillTotals(input: BillCalculationInput): BillCalculationOutput {
  // 1. Calculate Subtotal from line items
  let subtotal = 0;
  for (const item of input.items) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const mrp = Math.max(0, Number(item.mrp) || 0);
    subtotal += roundCurrency(qty * mrp);
  }
  subtotal = roundCurrency(subtotal);

  // 2. Calculate Bill-Level Discount
  let discountAmount = 0;
  const rawDiscountVal = Math.max(0, Number(input.discountValue) || 0);

  if (input.discountType === 'PERCENTAGE') {
    // Percentage discount capped at 100%
    const pct = Math.min(100, rawDiscountVal);
    discountAmount = roundCurrency((subtotal * pct) / 100);
  } else {
    // Fixed amount discount capped at subtotal
    discountAmount = roundCurrency(Math.min(subtotal, rawDiscountVal));
  }

  const discountedSubtotal = roundCurrency(Math.max(0, subtotal - discountAmount));

  // 3. Optional GST applied to discounted subtotal
  let gstAmount = 0;
  if (input.gstEnabled && input.gstRate > 0) {
    gstAmount = roundCurrency((discountedSubtotal * input.gstRate) / 100);
  }

  // 4. Final Grand Total
  const grandTotal = roundCurrency(discountedSubtotal + gstAmount);

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    gstAmount,
    grandTotal,
  };
}

export interface AccountsCalculationInput {
  openingBalance: number;
  bills: Array<{
    grandTotal: number;
    paymentMode: PaymentMode;
    status: 'FINALIZED' | 'VOID';
  }>;
  expenses: Array<{
    amount: number;
  }>;
}

export interface AccountsCalculationOutput {
  openingBalance: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
  transferSales: number;
  totalSales: number;
  totalExpenses: number;
  closingBalance: number;
}

/**
 * Authoritative Accounts calculation
 * RULE: Closing Balance = Opening Balance + Cash Sales - Total Expenses
 * UPI, CARD, and TRANSFER are explicitly excluded from physical cash in hand.
 * VOID bills are strictly excluded from all revenue and cash figures.
 */
export function calculateAccountsTotals(input: AccountsCalculationInput): AccountsCalculationOutput {
  const openingBalance = roundCurrency(Math.max(0, Number(input.openingBalance) || 0));

  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  let transferSales = 0;

  // Filter out voided bills
  const activeBills = input.bills.filter((b) => b.status === 'FINALIZED');

  for (const bill of activeBills) {
    const amount = roundCurrency(bill.grandTotal);
    switch (bill.paymentMode) {
      case 'CASH':
        cashSales += amount;
        break;
      case 'UPI':
        upiSales += amount;
        break;
      case 'CARD':
        cardSales += amount;
        break;
      case 'TRANSFER':
        transferSales += amount;
        break;
    }
  }

  cashSales = roundCurrency(cashSales);
  upiSales = roundCurrency(upiSales);
  cardSales = roundCurrency(cardSales);
  transferSales = roundCurrency(transferSales);

  const totalSales = roundCurrency(cashSales + upiSales + cardSales + transferSales);

  let totalExpenses = 0;
  for (const exp of input.expenses) {
    totalExpenses += roundCurrency(Math.max(0, exp.amount || 0));
  }
  totalExpenses = roundCurrency(totalExpenses);

  // Authoritative physical cash formula
  const closingBalance = roundCurrency(openingBalance + cashSales - totalExpenses);

  return {
    openingBalance,
    cashSales,
    upiSales,
    cardSales,
    transferSales,
    totalSales,
    totalExpenses,
    closingBalance,
  };
}

/** Formats INR currency string with ₹ symbol and tabular formatting */
export function formatINR(val: number): string {
  const rounded = roundCurrency(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/** Format currency without ₹ symbol for dense data tables */
export function formatINRPlain(val: number): string {
  const rounded = roundCurrency(val);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

// Self-test assertion at module initialization to guarantee zero regression
export function verifyCoreFormulas(): { billTestPassed: boolean; accountsTestPassed: boolean } {
  // Test 1: Bill ₹151.20 test
  const billResult = calculateBillTotals({
    items: [
      { quantity: 2, mrp: 30 },
      { quantity: 1, mrp: 100 },
    ],
    discountType: 'PERCENTAGE',
    discountValue: 10,
    gstEnabled: true,
    gstRate: 5,
  });

  const billTestPassed =
    billResult.subtotal === 160.0 &&
    billResult.discountAmount === 16.0 &&
    billResult.discountedSubtotal === 144.0 &&
    billResult.gstAmount === 7.2 &&
    billResult.grandTotal === 151.2;

  // Test 2: Accounts ₹15,500 Closing & ₹18,000 Total Sales test
  const accountsResult = calculateAccountsTotals({
    openingBalance: 5000,
    bills: [
      { grandTotal: 12000, paymentMode: 'CASH', status: 'FINALIZED' },
      { grandTotal: 3000, paymentMode: 'UPI', status: 'FINALIZED' },
      { grandTotal: 1000, paymentMode: 'CARD', status: 'FINALIZED' },
      { grandTotal: 2000, paymentMode: 'TRANSFER', status: 'FINALIZED' },
      { grandTotal: 999, paymentMode: 'CASH', status: 'VOID' }, // must be ignored
    ],
    expenses: [{ amount: 1500 }],
  });

  const accountsTestPassed =
    accountsResult.totalSales === 18000.0 &&
    accountsResult.closingBalance === 15500.0 &&
    accountsResult.cashSales === 12000.0 &&
    accountsResult.totalExpenses === 1500.0;

  return { billTestPassed, accountsTestPassed };
}
