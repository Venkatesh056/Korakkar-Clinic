import React, { useState } from 'react';
import { Expense, ExpenseType, User, DailyAccounts, ClinicInfo } from '../../types';
import { storage } from '../../services/storage';
import { formatINR, roundCurrency } from '../../services/calculation';
import {
  ReceiptText,
  Plus,
  Printer,
  Trash2,
  X,
  FileCheck2,
  AlertCircle,
  Calendar,
} from 'lucide-react';

interface ExpenseManagementViewProps {
  expenses: Expense[];
  accountsToday: DailyAccounts;
  currentUser: User;
  clinicInfo: ClinicInfo;
  onExpenseAdded: (newExpense: Expense) => void;
  onExpenseDeleted: (id: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseType[] = [
  'Herbal Raw Materials',
  'Clinic Supplies',
  'Clinic Rent',
  'Electricity & Utilities',
  'Staff Salary & Wages',
  'Tea & Refreshments',
  'Courier & Parcel',
  'Sanitation & Cleaning',
  'Maintenance',
  'Miscellaneous',
];

export const ExpenseManagementView: React.FC<ExpenseManagementViewProps> = ({
  expenses,
  accountsToday,
  currentUser,
  clinicInfo,
  onExpenseAdded,
  onExpenseDeleted,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [expenseType, setExpenseType] = useState<ExpenseType>('Herbal Raw Materials');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [previewVoucher, setPreviewVoucher] = useState<Expense | null>(null);

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (accountsToday.isClosed && date === accountsToday.date) {
      setErrorMsg('Cannot record expenses on a locked/closed business day. Reopen accounts to proceed.');
      return;
    }

    if (amount <= 0) {
      setErrorMsg('Expense amount must be strictly greater than zero.');
      return;
    }

    const voucherNo = storage.getNextVoucherNumber();
    const newExp: Expense = {
      id: `exp_${Date.now()}`,
      voucherNumber: voucherNo,
      expenseType,
      amount: roundCurrency(amount),
      date,
      description: description.trim(),
      createdBy: currentUser.username,
      createdAt: new Date().toISOString(),
    };

    const allExpenses = storage.getExpenses();
    const updated = [newExp, ...allExpenses];
    storage.saveExpenses(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'EXPENSE_CREATED',
      `Expense voucher ${voucherNo} for ₹${newExp.amount.toFixed(2)} recorded under ${expenseType}.`
    );

    onExpenseAdded(newExp);
    setShowAddModal(false);
    setAmount(0);
    setDescription('');
    setPreviewVoucher(newExp);
  };

  const handleDeleteExpense = (exp: Expense) => {
    if (currentUser.role !== 'ADMIN') {
      alert('Security Policy: Only ADMIN is authorized to delete expense entries.');
      return;
    }
    if (confirm(`Are you sure you want to delete expense voucher ${exp.voucherNumber} (₹${exp.amount})?`)) {
      const allExpenses = storage.getExpenses();
      const updated = allExpenses.filter((e) => e.id !== exp.id);
      storage.saveExpenses(updated);
      storage.addAuditLog(
        currentUser.username,
        currentUser.role,
        'EXPENSE_DELETED',
        `Expense voucher ${exp.voucherNumber} for ₹${exp.amount.toFixed(2)} DELETED by Administrator.`
      );
      onExpenseDeleted(exp.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Dispensary Float Disbursements
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Total Vouchers: {expenses.length}</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Dispensary Expense Vouchers
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#d6a84f]" />
          <span>+ Record Cash Disbursement</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#697067] block mb-1">
            Total Expense Disbursements
          </span>
          <div className="font-serif-clinical text-2xl font-bold text-[#1f2723] tabular-nums">
            {formatINR(totalExpenseSum)}
          </div>
          <span className="text-[11px] text-[#697067]">Cumulative approved vouchers</span>
        </div>

        <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ab4d38] block mb-1">
            Today's Cash Deductions
          </span>
          <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums">
            {formatINR(accountsToday.totalExpenses)}
          </div>
          <span className="text-[11px] text-[#697067]">Deducted from drawer cash float</span>
        </div>

        <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16382b] block mb-1">
            Audit Safeguard
          </span>
          <p className="text-[11px] text-[#697067] leading-tight">
            All disbursements generate numbered payment vouchers for clinic tax and accounts filing.
          </p>
        </div>
      </div>

      {/* Vouchers Table Card */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f0eae1] border-b border-[#ded8cb] flex items-center justify-between">
          <span className="font-serif-clinical text-xs font-bold text-[#16382b]">
            Expense Voucher Register ({expenses.length} Entries)
          </span>
          <span className="text-xs text-[#697067] font-mono">
            Latest: {expenses[0]?.voucherNumber || 'None'}
          </span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#697067]">
            No expense vouchers recorded yet. Click "+ Record Cash Disbursement" to add an entry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[640px]">
              <thead className="bg-[#faf7f2] text-[#1f2723] font-bold border-b border-[#ded8cb]">
                <tr>
                  <th className="py-3 px-3">Voucher #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description / Remarks</th>
                  <th className="py-3 px-3 text-right">Disbursed (₹)</th>
                  <th className="py-3 px-3 text-center">Cashier</th>
                  <th className="py-3 px-3 text-center">Print / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#16382b]">
                      <span className="bg-[#f0eae1] px-2 py-0.5 rounded border border-[#ded8cb]">
                        {exp.voucherNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#697067]">{exp.date}</td>
                    <td className="py-3 px-3 font-semibold text-[#1f2723]">{exp.expenseType}</td>
                    <td className="py-3 px-3 text-[#697067]">{exp.description || '—'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#ab4d38] tabular-nums">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[#697067]">{exp.createdBy}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewVoucher(exp)}
                          className="p-1.5 text-[#16382b] hover:bg-[#f0eae1] rounded transition-colors"
                          title="View / Print Payment Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {currentUser.role === 'ADMIN' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp)}
                            className="p-1.5 text-[#ab4d38] hover:bg-[#f0eae1] rounded transition-colors"
                            title="Delete Voucher (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                Record Cash Disbursement
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f2723] block mb-1">Disbursement Category</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">
                    Amount (₹) <span className="text-[#ab4d38]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 500"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono font-bold focus:border-[#16382b]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Disbursement Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1f2723] block mb-1">
                  Purpose / Payee / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Purchased raw honey & thailam glass bottles from supplier..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs"
                >
                  Generate Payment Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Voucher Print Preview Modal */}
      {previewVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                Payment Voucher: {previewVoucher.voucherNumber}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#d6a84f]" />
                  <span>Print Voucher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewVoucher(null)}
                  className="p-1 text-[#697067] hover:text-[#1f2723]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div className="p-5 bg-[#faf7f2] border border-[#ded8cb] rounded-xl text-xs font-mono space-y-3">
              <div className="text-center pb-2 border-b border-black">
                <div className="text-[10px] font-bold text-black">ஸ்ரீ கோரக்கர் சித்தா & ஆயுர்வேத கிளினிக்</div>
                <div className="font-bold text-sm uppercase">SRI KORAKKAR SIDDHA & AYURVEDHA CLINIC</div>
                <div className="text-[10px] text-slate-700">{clinicInfo.address} · Ph: {clinicInfo.phone}</div>
                <div className="text-[11px] font-bold mt-1 tracking-wider uppercase underline">
                  OFFICIAL CASH PAYMENT VOUCHER
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-dashed border-black">
                <span>Voucher No: <strong>{previewVoucher.voucherNumber}</strong></span>
                <span>Date: <strong>{previewVoucher.date}</strong></span>
              </div>

              <div className="space-y-1.5 py-1">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="font-sans font-bold">{previewVoucher.expenseType}</strong>
                </div>
                <div>
                  <span>Particulars:</span>
                  <div className="font-sans text-slate-800 p-2 bg-[#ffffff] rounded border border-slate-300 mt-1">
                    {previewVoucher.description || 'Cash disbursement against clinic drawer float.'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-[#ffffff] border border-black rounded text-sm font-bold">
                <span>TOTAL AMOUNT PAID:</span>
                <span>{formatINR(previewVoucher.amount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] text-center">
                <div className="border-t border-black pt-1">
                  Receiver Signature
                </div>
                <div className="border-t border-black pt-1">
                  Authorized Signatory (Doctor/Admin)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
