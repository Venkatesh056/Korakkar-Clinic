import React, { useState } from 'react';
import { DailyAccounts, Bill, Expense, User } from '../../types';
import {
  calculateAccountsTotals,
  formatINR,
  roundCurrency,
} from '../../services/calculation';
import { storage } from '../../services/storage';
import {
  Wallet,
  Lock,
  Unlock,
  Printer,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Coins,
  ArrowRight,
  TrendingUp,
  ReceiptText,
} from 'lucide-react';

interface AccountsViewProps {
  businessDate: string;
  accountsToday: DailyAccounts;
  billsToday: Bill[];
  expensesToday: Expense[];
  currentUser: User;
  onAccountsUpdated: (updatedAcc: DailyAccounts) => void;
}

const DENOMINATIONS = [500, 200, 100, 50, 20, 10];

export const AccountsView: React.FC<AccountsViewProps> = ({
  businessDate,
  accountsToday,
  billsToday,
  expensesToday,
  currentUser,
  onAccountsUpdated,
}) => {
  const [openingInput, setOpeningInput] = useState<number>(accountsToday.openingBalance || 0);
  const [openingError, setOpeningError] = useState<string>('');

  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [reopenError, setReopenError] = useState<string>('');

  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [closeNote, setCloseNote] = useState<string>('');

  // Physical Denomination Counts State
  const [noteCounts, setNoteCounts] = useState<Record<number, number>>({
    500: 0,
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
  });

  const calc = calculateAccountsTotals({
    openingBalance: accountsToday.openingBalance,
    bills: billsToday,
    expenses: expensesToday,
  });

  // Calculate physical notes total
  const countedPhysicalCash = Object.entries(noteCounts).reduce(
    (sum, [denom, count]) => sum + Number(denom) * (Number(count) || 0),
    0
  );

  const drawerDiscrepancy = roundCurrency(countedPhysicalCash - calc.closingBalance);

  const handleNoteCountChange = (denom: number, val: string) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setNoteCounts((prev) => ({ ...prev, [denom]: qty }));
  };

  const handleSetOpeningBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningError('');

    if (openingInput < 0) {
      setOpeningError('Opening balance float cannot be negative.');
      return;
    }

    const allDaily = storage.getDailyAccounts();
    const existing = allDaily[businessDate] || {
      date: businessDate,
      openingBalance: 0,
      openingBalanceSet: false,
      cashSales: 0,
      upiSales: 0,
      cardSales: 0,
      transferSales: 0,
      totalSales: 0,
      totalExpenses: 0,
      closingBalance: 0,
      isClosed: false,
    };

    const newClosing = roundCurrency(openingInput + calc.cashSales - calc.totalExpenses);

    const updated: DailyAccounts = {
      ...existing,
      openingBalance: openingInput,
      openingBalanceSet: true,
      cashSales: calc.cashSales,
      upiSales: calc.upiSales,
      cardSales: calc.cardSales,
      transferSales: calc.transferSales,
      totalSales: calc.totalSales,
      totalExpenses: calc.totalExpenses,
      closingBalance: newClosing,
    };

    allDaily[businessDate] = updated;
    storage.saveDailyAccounts(allDaily);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'OPENING_BALANCE_SET',
      `Opening cash float of ₹${openingInput.toFixed(2)} recorded for business date ${businessDate}.`
    );

    onAccountsUpdated(updated);
  };

  const handleConfirmDayClose = () => {
    const allDaily = storage.getDailyAccounts();
    const existing = allDaily[businessDate];
    if (!existing) return;

    const updated: DailyAccounts = {
      ...existing,
      ...calc,
      isClosed: true,
      closedBy: currentUser.username,
      closedAt: new Date().toISOString(),
    };

    allDaily[businessDate] = updated;
    storage.saveDailyAccounts(allDaily);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'DAY_ACCOUNTS_CLOSED',
      `Day accounts locked for ${businessDate}. Final Closing Cash: ₹${calc.closingBalance.toFixed(2)}. Total Sales: ₹${calc.totalSales.toFixed(2)}. Cashier note: "${closeNote.trim()}".`
    );

    onAccountsUpdated(updated);
    setShowCloseModal(false);
  };

  const handleConfirmDayReopen = (e: React.FormEvent) => {
    e.preventDefault();
    setReopenError('');

    if (currentUser.role !== 'ADMIN') {
      setReopenError('Security Policy: Only ADMIN is authorized to reopen closed accounts.');
      return;
    }

    if (!reopenReason.trim()) {
      setReopenError('Mandatory requirement: A documented reason is required to unlock accounts.');
      return;
    }

    const allDaily = storage.getDailyAccounts();
    const existing = allDaily[businessDate];
    if (!existing) return;

    const updated: DailyAccounts = {
      ...existing,
      isClosed: false,
      reopenedBy: currentUser.username,
      reopenedAt: new Date().toISOString(),
      reopenReason: reopenReason.trim(),
    };

    allDaily[businessDate] = updated;
    storage.saveDailyAccounts(allDaily);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'DAY_ACCOUNTS_REOPENED',
      `Day accounts UNLOCKED for ${businessDate} by Admin. Reason: "${reopenReason.trim()}".`
    );

    onAccountsUpdated(updated);
    setShowReopenModal(false);
    setReopenReason('');
  };

  const handlePrintSettlementSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Audit-Hardened Ledger
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Business Date: {businessDate}</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Daily Cash Drawer & Accounts Reconciliation
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrintSettlementSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1f2723] bg-[#ffffff] hover:bg-[#f0eae1] rounded-lg border border-[#ded8cb] shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#16382b]" />
            <span>Print Ledger</span>
          </button>

          {accountsToday.isClosed ? (
            currentUser.role === 'ADMIN' ? (
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#ffffff] bg-[#b88628] hover:bg-[#94681f] rounded-lg shadow-xs transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reopen Accounts</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#ab4d38] bg-[#ab4d38]/10 rounded-lg border border-[#ab4d38]/30">
                <Lock className="w-3.5 h-3.5" />
                <span>Day Locked (Admin Required)</span>
              </span>
            )
          ) : (
            <button
              type="button"
              onClick={() => setShowCloseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#d6a84f]" />
              <span>Finalize & Close Day</span>
            </button>
          )}
        </div>
      </div>

      {/* Opening Float Status Card */}
      {!accountsToday.openingBalanceSet ? (
        <div className="bg-[#ffffff] border-l-4 border-l-[#b88628] border border-[#ded8cb] rounded-r-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1f2723]">
                Enter Morning Cash Float Balance
              </h2>
              <p className="text-xs text-[#697067] mt-0.5">
                The initial physical cash kept in the drawer before any bills are issued today.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#b88628] bg-[#b88628]/10 px-2.5 py-1 rounded border border-[#b88628]/30">
              One-Time Entry
            </span>
          </div>

          {openingError && (
            <div className="text-xs text-[#ab4d38] font-semibold">{openingError}</div>
          )}

          <form onSubmit={handleSetOpeningBalance} className="flex flex-wrap items-center gap-3 pt-1">
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-mono font-bold text-[#697067]">₹</span>
              <input
                type="number"
                min="0"
                step="10"
                placeholder="e.g. 5000"
                value={openingInput || ''}
                onChange={(e) => setOpeningInput(parseFloat(e.target.value) || 0)}
                className="pl-7 pr-3 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs font-mono font-bold text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs"
            >
              Lock Morning Float
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-3.5 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16382b]" />
            <span className="text-[#697067]">
              Morning Cash Float Recorded:{' '}
              <strong className="text-[#16382b] font-mono text-sm">
                {formatINR(accountsToday.openingBalance)}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-[#697067] italic font-serif-clinical">
            Protected ledger entry
          </span>
        </div>
      )}

      {/* Authoritative Financial KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Calculated Physical Cash In Hand */}
        <div className="bg-[#16382b] text-[#ffffff] rounded-xl p-4 border border-[#2b5542] shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-[#d6a84f] mb-1 font-bold">
            <span className="uppercase tracking-wider">Calculated Cash in Drawer</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="font-serif-clinical text-2xl font-bold tabular-nums my-1">
            {formatINR(calc.closingBalance)}
          </div>
          <p className="text-[10px] text-[#f0eae1]/80 leading-relaxed font-mono">
            Opening ({formatINR(accountsToday.openingBalance)}) + Cash ({formatINR(calc.cashSales)}) − Exp ({formatINR(calc.totalExpenses)})
          </p>
        </div>

        {/* Card 2: Cash Counter Sales */}
        <div className="bg-[#ffffff] rounded-xl p-4 border border-[#ded8cb] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#697067] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#16382b]">Physical Cash Sales</span>
            <TrendingUp className="w-4 h-4 text-[#16382b]" />
          </div>
          <div className="font-serif-clinical text-2xl font-bold text-[#1f2723] tabular-nums my-1">
            {formatINR(calc.cashSales)}
          </div>
          <p className="text-[10px] text-[#697067]">
            Direct counter payments added to float
          </p>
        </div>

        {/* Card 3: Non-Cash Bank Receipts */}
        <div className="bg-[#ffffff] rounded-xl p-4 border border-[#ded8cb] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#697067] mb-1">
            <span className="font-bold uppercase tracking-wider text-[#6b5239]">Bank & UPI Inflow</span>
            <span className="font-mono text-[10px] text-[#697067]">Direct Bank</span>
          </div>
          <div className="font-serif-clinical text-2xl font-bold text-[#1f2723] tabular-nums my-1">
            {formatINR(calc.upiSales + calc.cardSales + calc.transferSales)}
          </div>
          <p className="text-[10px] text-[#697067]">
            UPI: {formatINR(calc.upiSales)} · Card: {formatINR(calc.cardSales)}
          </p>
        </div>

        {/* Card 4: Operating Expenses */}
        <div className="bg-[#ffffff] rounded-xl p-4 border border-[#ded8cb] shadow-2xs">
          <div className="flex items-center justify-between text-[11px] text-[#ab4d38] mb-1 font-bold">
            <span className="uppercase tracking-wider">Disbursements (Exp)</span>
            <ReceiptText className="w-4 h-4" />
          </div>
          <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums my-1">
            {formatINR(calc.totalExpenses)}
          </div>
          <p className="text-[10px] text-[#697067]">
            {expensesToday.length} approved cash voucher{expensesToday.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Two Column Section: Physical Note Denomination Counter + Audit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Physical Currency Note Counter (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#b88628]" />
              <h2 className="font-serif-clinical text-base font-bold text-[#16382b]">
                Physical Note Denomination Counter
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#697067]">
              Count Physical Drawer
            </span>
          </div>

          <p className="text-xs text-[#697067] leading-relaxed">
            Count the currency notes in the counter drawer and enter their counts below to verify physical reconciliation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {DENOMINATIONS.map((denom) => {
              const count = noteCounts[denom] || 0;
              const sub = denom * count;
              return (
                <div key={denom} className="p-2.5 bg-[#faf7f2] rounded-lg border border-[#ded8cb] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#16382b] font-mono">₹{denom}</span>
                    <span className="text-[10px] text-[#697067] font-mono tabular-nums">
                      = ₹{sub}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={noteCounts[denom] || ''}
                    onChange={(e) => handleNoteCountChange(denom, e.target.value)}
                    className="w-full px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded font-mono font-bold text-center text-xs text-[#1f2723] focus:border-[#16382b]"
                  />
                </div>
              );
            })}
          </div>

          {/* Physical Count vs Calculated Reconciliation Alert */}
          <div className="p-3.5 rounded-lg border bg-[#f0eae1] border-[#ded8cb] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#697067] font-medium">Physical Cash Counted:</span>
              <span className="font-mono font-bold text-base text-[#16382b] tabular-nums">
                {formatINR(countedPhysicalCash)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#697067] font-medium">System Expected Cash:</span>
              <span className="font-mono font-bold text-sm text-[#1f2723] tabular-nums">
                {formatINR(calc.closingBalance)}
              </span>
            </div>

            {countedPhysicalCash > 0 && (
              <div className="pt-2 border-t border-[#ded8cb] flex items-center justify-between text-xs font-bold">
                <span>Reconciliation Result:</span>
                {drawerDiscrepancy === 0 ? (
                  <span className="text-[#2b5542] bg-[#2b5542]/10 px-2 py-0.5 rounded border border-[#2b5542]/30 flex items-center gap-1 font-mono">
                    ✓ Exact Match (₹0.00 difference)
                  </span>
                ) : drawerDiscrepancy > 0 ? (
                  <span className="text-[#b88628] bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30 font-mono">
                    Surplus: +{formatINR(drawerDiscrepancy)}
                  </span>
                ) : (
                  <span className="text-[#ab4d38] bg-[#ab4d38]/10 px-2 py-0.5 rounded border border-[#ab4d38]/30 font-mono">
                    Shortage: {formatINR(drawerDiscrepancy)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Authoritative Ledger Breakdown (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
            <div>
              <h2 className="font-serif-clinical text-base font-bold text-[#16382b]">
                Today's Settlement Statement
              </h2>
              <p className="text-[11px] text-[#697067]">SRS Rule § 4.3 Cash Reconciliation Engine</p>
            </div>
            <span className="font-mono text-xs font-bold text-[#16382b] bg-[#f0eae1] px-2.5 py-1 rounded border border-[#ded8cb]">
              Gross: {formatINR(calc.totalSales)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#faf7f2] rounded-lg border border-[#ded8cb]">
              <div>
                <span className="font-bold text-[#1f2723] block">1. Morning Opening Float</span>
                <span className="text-[10px] text-[#697067]">Base cash starting the counter</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#1f2723] tabular-nums">
                {formatINR(accountsToday.openingBalance)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#faf7f2] rounded-lg border border-[#ded8cb]">
              <div>
                <span className="font-bold text-[#16382b] block">2. Add: Counter Cash Receipts</span>
                <span className="text-[10px] text-[#697067]">Finalized bills paid in cash</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#16382b] tabular-nums">
                +{formatINR(calc.cashSales)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#faf7f2] rounded-lg border border-[#ded8cb]">
              <div>
                <span className="font-bold text-[#ab4d38] block">3. Less: Cash Disbursements (Expenses)</span>
                <span className="text-[10px] text-[#697067]">Recorded expense vouchers</span>
              </div>
              <span className="font-mono font-bold text-sm text-[#ab4d38] tabular-nums">
                −{formatINR(calc.totalExpenses)}
              </span>
            </div>

            <div className="p-3 bg-[#f0eae1] rounded-lg border border-[#ded8cb] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#16382b] text-sm block">4. Final Cash in Drawer Float</span>
                <span className="text-[11px] text-[#697067]">Formula: [1] + [2] − [3]</span>
              </div>
              <span className="font-mono font-bold text-xl text-[#16382b] tabular-nums">
                {formatINR(calc.closingBalance)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ded8cb] space-y-1.5 text-xs text-[#697067]">
            <div className="flex justify-between font-mono">
              <span>UPI Payments (QR Code):</span>
              <span className="font-bold text-[#1f2723] tabular-nums">{formatINR(calc.upiSales)}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Card POS Swipes:</span>
              <span className="font-bold text-[#1f2723] tabular-nums">{formatINR(calc.cardSales)}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span>Direct Bank Transfers:</span>
              <span className="font-bold text-[#1f2723] tabular-nums">{formatINR(calc.transferSales)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Close Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#16382b]" />
                <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                  Finalize & Lock Accounts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#697067] leading-relaxed">
              Locking today's accounts marks the day's financial books as complete. Once locked, further bills cannot be issued without Administrator authorization.
            </p>

            <div className="p-3 bg-[#f0eae1] rounded-lg border border-[#ded8cb] text-xs space-y-1">
              <div className="flex justify-between">
                <span>Final Closing Cash in Drawer:</span>
                <strong className="font-mono text-[#16382b]">{formatINR(calc.closingBalance)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Gross Collections:</span>
                <strong className="font-mono text-[#1f2723]">{formatINR(calc.totalSales)}</strong>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#1f2723] block mb-1">
                Closing Remarks / Cashier Note
              </label>
              <input
                type="text"
                placeholder="e.g. Counter balanced, verified against drawer count"
                value={closeNote}
                onChange={(e) => setCloseNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDayClose}
                className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs"
              >
                Confirm Day Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reopen Protected Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#b88628]" />
                <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                  Admin Reopen Authorization
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#697067] leading-relaxed">
              Security Protocol: Reopening locked accounts will allow new transactions to be posted for {businessDate}. A documented audit reason is strictly mandatory.
            </p>

            {reopenError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {reopenError}
              </div>
            )}

            <form onSubmit={handleConfirmDayReopen} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Mandatory Audit Justification <span className="text-[#ab4d38]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Document reason (e.g. Late emergency herbal medicine dispensation or cashier bill adjustment authorized by Doctor)..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#b88628] hover:bg-[#94681f] rounded-lg shadow-2xs"
                >
                  Authorize Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
