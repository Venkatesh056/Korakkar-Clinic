/**
 * Sri Korakkar Siddha and Ayurvedha Clinic
 * Automated Financial & Business Logic Verification Test Suite
 */

import {
  calculateBillTotals,
  calculateAccountsTotals,
  verifyCoreFormulas,
  roundCurrency,
} from '../src/services/calculation.ts';

console.log('----------------------------------------------------');
console.log('SRI KORAKKAR SIDDHA AND AYURVEDHA CLINIC TEST SUITE');
console.log('----------------------------------------------------');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
    process.exitCode = 1;
  }
}

// 1. SRS Bill Worked Example Test (SRS Section 7.3)
// Line 1: 2 × ₹30 = ₹60
// Line 2: 1 × ₹100 = ₹100
// Subtotal = ₹160
// Discount = 10% (₹16) -> Discounted Subtotal = ₹144
// GST = 5% of ₹144 = ₹7.20 -> Grand Total = ₹151.20
const billTest = calculateBillTotals({
  items: [
    { quantity: 2, mrp: 30 },
    { quantity: 1, mrp: 100 },
  ],
  discountType: 'PERCENTAGE',
  discountValue: 10,
  gstEnabled: true,
  gstRate: 5,
});

assert(billTest.subtotal === 160.0, 'Billing: Subtotal is ₹160.00');
assert(billTest.discountAmount === 16.0, 'Billing: 10% Discount is ₹16.00');
assert(billTest.discountedSubtotal === 144.0, 'Billing: Discounted Subtotal is ₹144.00');
assert(billTest.gstAmount === 7.2, 'Billing: 5% GST is ₹7.20');
assert(billTest.grandTotal === 151.2, 'Billing: Final Grand Total is ₹151.20 (SRS Exact Match)');

// 2. Fixed Amount Discount Test
const fixedDiscountTest = calculateBillTotals({
  items: [{ quantity: 3, mrp: 50 }],
  discountType: 'AMOUNT',
  discountValue: 25,
  gstEnabled: false,
  gstRate: 0,
});
assert(fixedDiscountTest.subtotal === 150.0, 'Billing: Fixed Discount Subtotal ₹150');
assert(fixedDiscountTest.discountAmount === 25.0, 'Billing: Fixed Discount Amount ₹25');
assert(fixedDiscountTest.grandTotal === 125.0, 'Billing: Fixed Discount Grand Total ₹125');

// 3. SRS Accounts Worked Example Test (SRS Section 7.7)
// Opening Balance = ₹5,000
// Cash Sales = ₹12,000
// UPI Sales = ₹3,000
// Card Sales = ₹1,000
// Transfer Sales = ₹2,000
// Expenses = ₹1,500
// Expected Closing Balance = ₹15,500
// Expected Total Sales = ₹18,000
const accountsTest = calculateAccountsTotals({
  openingBalance: 5000,
  bills: [
    { grandTotal: 12000, paymentMode: 'CASH', status: 'FINALIZED' },
    { grandTotal: 3000, paymentMode: 'UPI', status: 'FINALIZED' },
    { grandTotal: 1000, paymentMode: 'CARD', status: 'FINALIZED' },
    { grandTotal: 2000, paymentMode: 'TRANSFER', status: 'FINALIZED' },
    { grandTotal: 500, paymentMode: 'CASH', status: 'VOID' }, // Must be ignored
  ],
  expenses: [{ amount: 1500 }],
});

assert(
  accountsTest.closingBalance === 15500.0,
  'Accounts: Closing Balance = Opening + Cash - Expenses = ₹15,500.00 (SRS Exact Match)'
);
assert(
  accountsTest.totalSales === 18000.0,
  'Accounts: Total Sales = Cash + UPI + Card + Transfer = ₹18,000.00 (SRS Exact Match)'
);
assert(
  accountsTest.cashSales === 12000.0,
  'Accounts: Physical Cash Counter Sales = ₹12,000.00'
);
assert(
  accountsTest.totalExpenses === 1500.0,
  'Accounts: Total Expenses = ₹1,500.00'
);

// 4. Transfer & Non-cash Exclusion Test
// Verify that UPI, Card, and Transfer are excluded from physical cash
const nonCashOnlyTest = calculateAccountsTotals({
  openingBalance: 2000,
  bills: [
    { grandTotal: 4000, paymentMode: 'UPI', status: 'FINALIZED' },
    { grandTotal: 3000, paymentMode: 'TRANSFER', status: 'FINALIZED' },
  ],
  expenses: [{ amount: 500 }],
});
assert(
  nonCashOnlyTest.closingBalance === 1500.0,
  'Accounts: Non-cash only sales do not inflate physical cash (₹2,000 - ₹500 = ₹1,500)'
);
assert(
  nonCashOnlyTest.totalSales === 7000.0,
  'Accounts: Non-cash sales included in Total Sales (₹4,000 + ₹3,000 = ₹7,000)'
);

// 5. Void Bill Exclusion Test
const voidTest = calculateAccountsTotals({
  openingBalance: 1000,
  bills: [
    { grandTotal: 800, paymentMode: 'CASH', status: 'VOID' },
    { grandTotal: 500, paymentMode: 'CASH', status: 'FINALIZED' },
  ],
  expenses: [],
});
assert(
  voidTest.cashSales === 500.0,
  'Accounts: Voided bills excluded from Cash Sales (only ₹500 counted, not ₹1300)'
);
assert(
  voidTest.closingBalance === 1500.0,
  'Accounts: Voided bills excluded from Closing Balance'
);

// 6. Zero Sales Day Test
const zeroSalesTest = calculateAccountsTotals({
  openingBalance: 1000,
  bills: [],
  expenses: [{ amount: 200 }],
});
assert(
  zeroSalesTest.totalSales === 0.0,
  'Accounts: Zero sales day yields ₹0 total sales'
);
assert(
  zeroSalesTest.closingBalance === 800.0,
  'Accounts: Zero sales day closing cash = Opening - Expenses = ₹800'
);

console.log('----------------------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log('----------------------------------------------------');

if (passedTests === totalTests) {
  console.log('ALL FINANCIAL INTEGRITY & ACCOUNTING TESTS CERTIFIED PASS.');
} else {
  console.error('TEST FAILURES OCCURRED.');
  process.exit(1);
}
