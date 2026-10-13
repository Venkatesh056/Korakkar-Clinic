import React from 'react';
import {
  Wallet,
  Receipt,
  TrendingUp,
  ReceiptText,
  Users,
  Package,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Bill, Expense, DailyAccounts, Role, Product } from '../../types';
import { formatINR } from '../../services/calculation';
import { storage } from '../../services/storage';

interface DashboardViewProps {
  todayBills: Bill[];
  todayExpenses: Expense[];
  accountsToday: DailyAccounts;
  allBills: Bill[];
  allExpenses: Expense[];
  userRole: Role;
  onNavigate: (tab: string) => void;
  onOpenNewBill: () => void;
  onOpenAddExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  todayBills,
  todayExpenses,
  accountsToday,
  allBills,
  allExpenses,
  userRole,
  onNavigate,
  onOpenNewBill,
  onOpenAddExpense,
}) => {
  // Authoritative calculations
  const validTodayBills = todayBills.filter((b) => b.status === 'FINALIZED');
  const billsCount = validTodayBills.length;

  // Today's total sales (Cash + UPI + Card + Transfer)
  const todaySales = validTodayBills.reduce((sum, b) => sum + b.grandTotal, 0);

  // Today's expenses
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Cash in Hand: Accounts closing cash formula = Opening Balance + Cash Sales - Total Expenses
  const physicalCashInHand = accountsToday.closingBalance;

  // Payment method distribution
  const cashOnly = validTodayBills.filter((b) => b.paymentMode === 'CASH').reduce((sum, b) => sum + b.grandTotal, 0);
  const upiOnly = validTodayBills.filter((b) => b.paymentMode === 'UPI').reduce((sum, b) => sum + b.grandTotal, 0);
  const cardOnly = validTodayBills.filter((b) => b.paymentMode === 'CARD').reduce((sum, b) => sum + b.grandTotal, 0);
  const transferOnly = validTodayBills.filter((b) => b.paymentMode === 'TRANSFER').reduce((sum, b) => sum + b.grandTotal, 0);

  // Low stock products alert (< 25 units)
  const allProducts = storage.getProducts();
  const lowStockProducts = allProducts.filter((p) => p.active && p.stockQty <= 25).slice(0, 4);

  // Rolling periods
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysIso = sevenDaysAgo.toISOString().split('T')[0];
  const currentYearMonth = now.toISOString().substring(0, 7);

  const weeklySales = allBills
    .filter((b) => b.status === 'FINALIZED' && b.date >= sevenDaysIso)
    .reduce((sum, b) => sum + b.grandTotal, 0);

  const monthlySales = allBills
    .filter((b) => b.status === 'FINALIZED' && b.date.startsWith(currentYearMonth))
    .reduce((sum, b) => sum + b.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Editorial Clinical Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] tracking-widest uppercase bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Dispensary HQ · Siddha & Ayurvedic Practice
            </span>
            <span className="text-xs text-[#697067] hidden sm:inline">|</span>
            <span className="text-xs font-serif-clinical text-[#697067] italic hidden sm:inline">
              Korakkar Classical Traditions
            </span>
          </div>
          <h1 className="font-serif-clinical text-2xl md:text-3xl font-bold text-[#16382b] tracking-tight">
            Clinical Operations & Cashier Console
          </h1>
          <p className="text-xs text-[#697067] mt-1 max-w-2xl">
            Real-time dispensary counter activity, physical cash drawer float tracking, and patient medicine dispensation.
          </p>
        </div>

        {/* Quick Dispensary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenNewBill}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-md shadow-xs transition-colors border border-[#2b5542]"
          >
            <PlusCircle className="w-4 h-4 text-[#d6a84f]" />
            <span>New Bill (F2)</span>
          </button>
          <button
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1f2723] bg-[#ffffff] hover:bg-[#f0eae1] rounded-md border border-[#ded8cb] shadow-2xs transition-colors"
          >
            <ReceiptText className="w-3.5 h-3.5 text-[#6b5239]" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Floating Alerts for Drawer State */}
      {!accountsToday.openingBalanceSet && (
        <div className="bg-[#ffffff] border-l-4 border-l-[#b88628] border border-[#ded8cb] rounded-r-lg p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#b88628]/15 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-[#b88628]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#1f2723] uppercase tracking-wide">
                Morning Cash Float Not Set
              </h2>
              <p className="text-xs text-[#697067]">
                Please record the morning physical cash in the drawer before finalizing counter dispensations.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('accounts')}
            className="px-3 py-1.5 text-xs font-bold text-[#ffffff] bg-[#b88628] hover:bg-[#94681f] rounded transition-colors shrink-0"
          >
            Record Float (₹)
          </button>
        </div>
      )}

      {accountsToday.isClosed && (
        <div className="bg-[#ffffff] border-l-4 border-l-[#2b5542] border border-[#ded8cb] rounded-r-lg p-4 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2b5542]/15 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#2b5542]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#16382b] uppercase tracking-wide">
                Day Accounts Locked & Balanced
              </h2>
              <p className="text-xs text-[#697067]">
                Finalized by {accountsToday.closedBy || 'Admin'}. Cash drawer count reconciled against dispensary register.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('accounts')}
            className="px-3 py-1.5 text-xs font-semibold text-[#16382b] bg-[#f0eae1] border border-[#ded8cb] hover:bg-[#ffffff] rounded transition-colors shrink-0"
          >
            View Day Ledger
          </button>
        </div>
      )}

      {/* Main Metric Cards: Botanical & Purposeful Asymmetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Dominant Hero Card: Physical Cash in Drawer (md:col-span-4) */}
        <div className="md:col-span-4 bg-[#16382b] text-[#ffffff] rounded-xl p-5 border border-[#2b5542] shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold tracking-wider uppercase text-[10px] text-[#d6a84f] bg-[#0f271e] px-2 py-0.5 rounded border border-[#2b5542]">
                Physical Drawer Cash
              </span>
              <Wallet className="w-4 h-4 text-[#d6a84f]" />
            </div>
            <div className="font-serif-clinical text-3xl sm:text-4xl font-bold tracking-tight text-[#ffffff] my-2 tabular-nums">
              {formatINR(physicalCashInHand)}
            </div>
            <p className="text-[11px] text-[#f0eae1]/80 leading-relaxed">
              Calculated physical currency in drawer float. Non-cash payments (UPI/Card) are banked directly.
            </p>
          </div>

          <div className="pt-3 mt-4 border-t border-[#2b5542] relative z-10 flex items-center justify-between text-xs text-[#9bb09f]">
            <span className="font-mono text-[11px]">Opening: ₹{accountsToday.openingBalance}</span>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-[#d6a84f] hover:text-[#ffffff] text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Audit Drawer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Today Sales (md:col-span-4) */}
        <div className="md:col-span-4 bg-[#ffffff] rounded-xl p-5 border border-[#ded8cb] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#697067] mb-2">
              <span className="font-bold uppercase text-[10px] tracking-wider text-[#6b5239]">
                Today's Total Gross
              </span>
              <TrendingUp className="w-4 h-4 text-[#2b5542]" />
            </div>
            <div className="font-serif-clinical text-3xl font-bold text-[#1f2723] my-2 tabular-nums">
              {formatINR(todaySales)}
            </div>
            <div className="flex items-center gap-2 text-xs text-[#697067]">
              <span className="font-bold text-[#16382b]">{billsCount}</span>
              <span>dispensary bill{billsCount !== 1 ? 's' : ''} issued across all counters</span>
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-[#ded8cb] flex items-center justify-between text-xs text-[#697067] font-mono">
            <span>Cash: <strong className="text-[#16382b]">{formatINR(cashOnly)}</strong></span>
            <span>Digital: <strong className="text-[#1f2723]">{formatINR(upiOnly + cardOnly + transferOnly)}</strong></span>
          </div>
        </div>

        {/* Expenses & Rolling Revenue Mini-Grids (md:col-span-4) */}
        <div className="md:col-span-4 space-y-3 flex flex-col justify-between">
          {/* Today's Cash Disbursements */}
          <div className="bg-[#ffffff] rounded-xl p-4 border border-[#ded8cb] shadow-2xs">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="uppercase text-[10px] text-[#ab4d38] font-bold tracking-wider">
                Cash Disbursements
              </span>
              <ReceiptText className="w-3.5 h-3.5 text-[#ab4d38]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#1f2723] tabular-nums">
              {formatINR(todayExpenseTotal)}
            </div>
            <div className="text-[11px] text-[#697067] mt-0.5 flex justify-between items-center">
              <span>{todayExpenses.length} voucher{todayExpenses.length !== 1 ? 's' : ''} approved</span>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-[#16382b] hover:underline"
              >
                Vouchers
              </button>
            </div>
          </div>

          {/* Rolling Periods Mini-Panel */}
          <div className="bg-[#f0eae1] rounded-xl p-4 border border-[#ded8cb]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="uppercase text-[10px] font-bold tracking-wider text-[#16382b]">
                Cumulative Inflow
              </span>
              <Calendar className="w-3.5 h-3.5 text-[#16382b]" />
            </div>
            <div className="flex items-baseline justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#697067] block">7-Day Run</span>
                <span className="font-bold text-[#1f2723] text-sm tabular-nums">{formatINR(weeklySales)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#697067] block">Month To Date</span>
                <span className="font-bold text-[#1f2723] text-sm tabular-nums">{formatINR(monthlySales)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Structured Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Counter Bills (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb] mb-3">
            <div>
              <h2 className="font-serif-clinical text-base font-bold text-[#16382b]">
                Today's Dispensary Journal
              </h2>
              <p className="text-xs text-[#697067]">Chronological register of medicines dispensed</p>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#16382b] hover:text-[#2b5542] flex items-center gap-1"
            >
              <span>View Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {validTodayBills.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#697067] bg-[#faf7f2] rounded-lg border border-dashed border-[#ded8cb]">
              <Receipt className="w-8 h-8 text-[#9bb09f] mx-auto mb-2" />
              <p className="font-medium text-[#1f2723]">No medicines dispensed yet today</p>
              <p className="text-[11px] text-[#697067] mt-1">Press F2 or click "New Bill" to begin dispensing to patients.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#ded8cb]">
              {validTodayBills.slice(0, 6).map((bill) => (
                <div key={bill.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-[#faf7f2] px-2 rounded transition-colors">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#16382b] bg-[#f0eae1] px-1.5 py-0.2 rounded border border-[#ded8cb]">
                        {bill.billNumber}
                      </span>
                      <span className="font-medium text-[#1f2723] truncate">
                        {bill.patientName || 'Walk-in Patient'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#697067] mt-0.5 flex items-center gap-2">
                      <span className="font-mono">{bill.time}</span>
                      <span>·</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-[#ded8cb]/60 text-[#1f2723]">
                        {bill.paymentMode}
                      </span>
                      <span>·</span>
                      <span>{bill.items.length} formula{bill.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#16382b] text-sm tabular-nums block">
                      {formatINR(bill.grandTotal)}
                    </span>
                    <span className="text-[10px] font-medium text-[#4f7358]">Finalized</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Inflow Breakdown & Low-Stock Formulary Vigilance (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Payment Method Distribution */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb] mb-3">
              <div>
                <h2 className="font-serif-clinical text-sm font-bold text-[#16382b]">
                  Settlement Breakdown
                </h2>
                <p className="text-[11px] text-[#697067]">Inflow verified by channel</p>
              </div>
              <span className="font-mono text-xs font-bold text-[#16382b] tabular-nums">
                {formatINR(todaySales)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#f0eae1] rounded-lg border border-[#ded8cb]">
                <div>
                  <span className="font-bold text-[#16382b] block">Physical Cash Counter</span>
                  <span className="text-[10px] text-[#697067]">Counted in physical drawer float</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#16382b] tabular-nums">
                  {formatINR(cashOnly)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#ffffff] rounded-lg border border-[#ded8cb]">
                <div>
                  <span className="font-bold text-[#1f2723] block">UPI / QR Dynamic</span>
                  <span className="text-[10px] text-[#697067]">GPay, PhonePe, Paytm transfers</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#1f2723] tabular-nums">
                  {formatINR(upiOnly)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#ffffff] rounded-lg border border-[#ded8cb]">
                <div>
                  <span className="font-bold text-[#1f2723] block">Card POS / NEFT</span>
                  <span className="text-[10px] text-[#697067]">Card terminal & direct bank credits</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#1f2723] tabular-nums">
                  {formatINR(cardOnly + transferOnly)}
                </span>
              </div>
            </div>
          </div>

          {/* Apothecary Low Stock Vigilance */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb] mb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#b88628]" />
                <h2 className="font-serif-clinical text-sm font-bold text-[#16382b]">
                  Formulary Reorder Vigilance
                </h2>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className="text-[11px] font-semibold text-[#16382b] hover:underline"
              >
                Formulary
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#4f7358] bg-[#f0eae1] rounded-lg">
                ✓ All botanical churnams and oils at adequate dispensary stock levels.
              </div>
            ) : (
              <div className="space-y-1.5">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-[#faf7f2] rounded border border-[#ded8cb] text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-[#1f2723] truncate block">{p.name}</span>
                      <span className="font-mono text-[10px] text-[#697067]">{p.productCode} · {p.category}</span>
                    </div>
                    <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[#b88628]/15 text-[#6b5239] border border-[#b88628]/30">
                      {p.stockQty} {p.unit || 'units'} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

