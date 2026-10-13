import React, { useState } from 'react';
import { Bill, Role, User } from '../../types';
import { formatINR } from '../../services/calculation';
import { storage } from '../../services/storage';
import {
  Search,
  Printer,
  Copy,
  Ban,
  AlertTriangle,
  History,
  FileCheck2,
} from 'lucide-react';

interface BillHistoryViewProps {
  bills: Bill[];
  currentUser: User;
  onReprint: (bill: Bill, isDuplicate: boolean) => void;
  onBillVoided: (updatedBills: Bill[]) => void;
}

export const BillHistoryView: React.FC<BillHistoryViewProps> = ({
  bills,
  currentUser,
  onReprint,
  onBillVoided,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINALIZED' | 'VOID'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Void modal state
  const [voidModalBill, setVoidModalBill] = useState<Bill | null>(null);
  const [voidReason, setVoidReason] = useState<string>('');
  const [voidError, setVoidError] = useState<string>('');

  const filteredBills = bills.filter((bill) => {
    if (statusFilter !== 'ALL' && bill.status !== statusFilter) return false;
    if (paymentFilter !== 'ALL' && bill.paymentMode !== paymentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = bill.billNumber.toLowerCase().includes(q);
      const matchName = bill.patientName.toLowerCase().includes(q);
      const matchPhone = bill.patientMobile.includes(q);
      const matchDate = bill.date.includes(q);
      if (!matchNo && !matchName && !matchPhone && !matchDate) return false;
    }
    return true;
  });

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    setVoidError('');

    if (currentUser.role !== 'ADMIN') {
      setVoidError('Security Policy: Only ADMIN role is authorized to void finalized bills.');
      return;
    }

    if (!voidReason.trim()) {
      setVoidError('Mandatory requirement: A documented reason is required to void a bill.');
      return;
    }

    if (!voidModalBill) return;

    const allBills = storage.getBills();
    const now = new Date().toISOString();

    const updated = allBills.map((b) => {
      if (b.id === voidModalBill.id) {
        return {
          ...b,
          status: 'VOID' as const,
          voidReason: voidReason.trim(),
          voidedBy: currentUser.username,
          voidedAt: now,
        };
      }
      return b;
    });

    storage.saveBills(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'BILL_VOIDED',
      `Bill ${voidModalBill.billNumber} for ₹${voidModalBill.grandTotal} VOIDED. Mandatory Reason: "${voidReason.trim()}".`
    );

    onBillVoided(updated);
    setVoidModalBill(null);
    setVoidReason('');
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Transaction Journal
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Sequential Register</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Bill Register & Dispensing Audit Trail
          </h1>
        </div>

        <div className="text-xs text-[#697067] font-mono bg-[#ffffff] px-3.5 py-1.5 rounded-lg border border-[#ded8cb] shadow-2xs">
          <span>Total Transactions: </span>
          <strong className="text-[#16382b] font-bold">{bills.length}</strong>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Bill No (e.g. SK-2026), Patient Name, Phone, Date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#697067] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-[#ded8cb] rounded-lg font-bold bg-[#faf7f2] text-[#16382b]"
            >
              <option value="ALL">All Statuses</option>
              <option value="FINALIZED">Finalized Only</option>
              <option value="VOID">Voided Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#697067] font-semibold">Mode:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-[#ded8cb] rounded-lg font-bold bg-[#faf7f2] text-[#16382b]"
            >
              <option value="ALL">All Modes</option>
              <option value="CASH">CASH</option>
              <option value="UPI">UPI</option>
              <option value="CARD">CARD</option>
              <option value="TRANSFER">TRANSFER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Ledger Table */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[720px]">
            <thead className="bg-[#faf7f2] text-[#1f2723] font-bold border-b border-[#ded8cb]">
              <tr>
                <th className="py-3 px-3">Bill Number</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Patient / Mobile</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-3 text-center">Mode</th>
                <th className="py-3 px-3 text-right">Grand Total (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Print / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded8cb]">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#697067]">
                    No bills match the selected query.
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-[#faf7f2] transition-colors ${
                      b.status === 'VOID' ? 'bg-[#ab4d38]/5 opacity-80' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#16382b]">
                      <span className="bg-[#f0eae1] px-2 py-0.5 rounded border border-[#ded8cb]">
                        {b.billNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#697067]">
                      {b.date} <span className="text-[10px] text-[#9bb09f]">· {b.time}</span>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="text-[#1f2723] block">{b.patientName || 'Walk-in'}</strong>
                      {b.patientMobile && (
                        <span className="text-[11px] font-mono text-[#697067]">
                          {b.patientMobile}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {b.items.length} line{b.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#f0eae1] text-[#1f2723] border border-[#ded8cb]">
                        {b.paymentMode}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#16382b] tabular-nums">
                      {formatINR(b.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {b.status === 'VOID' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#ab4d38]/10 text-[#ab4d38] border border-[#ab4d38]/30">
                          VOID
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#2b5542]/10 text-[#16382b] border border-[#2b5542]/30">
                          Finalized
                        </span>
                      )}
                      {b.reprintCount > 0 && (
                        <span className="block text-[9px] text-[#697067] font-mono mt-0.5">
                          Reprints: {b.reprintCount}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onReprint(b, false)}
                          className="p-1.5 text-[#16382b] hover:bg-[#f0eae1] rounded transition-colors"
                          title="Print Original Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReprint(b, true)}
                          className="p-1.5 text-[#6b5239] hover:bg-[#f0eae1] rounded transition-colors"
                          title="Print Watermarked Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {currentUser.role === 'ADMIN' && b.status !== 'VOID' && (
                          <button
                            type="button"
                            onClick={() => {
                              setVoidModalBill(b);
                              setVoidReason('');
                              setVoidError('');
                            }}
                            className="p-1.5 text-[#ab4d38] hover:bg-[#f0eae1] rounded transition-colors"
                            title="Void Bill (Admin Only)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Void Confirmation Modal */}
      {voidModalBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ab4d38]" />
                <h3 className="font-serif-clinical text-base font-bold text-[#ab4d38]">
                  Void Bill {voidModalBill.billNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoidModalBill(null)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#697067] leading-relaxed">
              Voiding this bill will strictly exclude ₹{voidModalBill.grandTotal.toFixed(2)} from today's sales and physical cash reconciliation. A documented justification is mandatory for the audit log.
            </p>

            {voidError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {voidError}
              </div>
            )}

            <form onSubmit={handleConfirmVoid} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Mandatory Reason for Voiding <span className="text-[#ab4d38]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Document reason (e.g. Wrong items entered, patient changed prescription, billing duplicate)..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setVoidModalBill(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#ab4d38] hover:bg-[#8f3a27] rounded-lg shadow-2xs"
                >
                  Confirm Void
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
