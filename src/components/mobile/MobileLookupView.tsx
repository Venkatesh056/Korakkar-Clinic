import React, { useState } from 'react';
import { Bill, ClinicInfo } from '../../types';
import { formatINR } from '../../services/calculation';
import {
  Smartphone,
  Search,
  Printer,
  ChevronLeft,
} from 'lucide-react';

interface MobileLookupViewProps {
  bills: Bill[];
  clinicInfo: ClinicInfo;
  onClose: () => void;
  onPrintBill: (bill: Bill, isDuplicate: boolean) => void;
}

export const MobileLookupView: React.FC<MobileLookupViewProps> = ({
  bills,
  clinicInfo,
  onClose,
  onPrintBill,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const activeBills = bills.filter((b) => b.status === 'FINALIZED');

  const filteredBills = searchTerm.trim()
    ? activeBills.filter((b) => {
        const q = searchTerm.toLowerCase();
        return (
          b.billNumber.toLowerCase().includes(q) ||
          b.patientName.toLowerCase().includes(q) ||
          b.patientMobile.includes(q) ||
          b.date.includes(q)
        );
      })
    : activeBills.slice(0, 15);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f271e]/85 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4">
      {/* Mobile Frame (Responsive 420px container) */}
      <div className="bg-[#faf7f2] w-full max-w-md h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#ded8cb]">
        {/* Mobile Header Bar */}
        <div className="bg-[#16382b] text-[#ffffff] p-3.5 flex items-center justify-between shrink-0 border-b border-[#2b5542]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#d6a84f]" />
            <div>
              <h3 className="font-serif-clinical text-xs font-bold leading-tight">Mobile Dispensary Lookup</h3>
              <p className="text-[10px] text-[#9bb09f]">Bluetooth Thermal Receipt Mode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-[#0f271e] hover:bg-[#2b5542] text-[#f0eae1] rounded-md text-xs flex items-center gap-1 border border-[#2b5542]"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-[#ffffff] border-b border-[#ded8cb] shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Bill No, Mobile, Patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:outline-none focus:border-[#16382b] text-[#1f2723]"
            />
          </div>
        </div>

        {/* Content View: Bill List or Detailed View */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {selectedBill ? (
            /* Selected Bill Detail Card */
            <div className="bg-[#FFFEFA] rounded-xl p-4 border border-[#DEDCCF] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEDCCF]">
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="text-xs text-[#284B3A] font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to List</span>
                </button>
                <span className="font-mono text-xs font-bold text-[#29332E]">
                  {selectedBill.billNumber}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#777B72] block">Patient Name</span>
                <span className="font-serif-clinical text-base font-bold text-[#29332E]">{selectedBill.patientName}</span>
                {selectedBill.patientMobile && (
                  <span className="text-xs text-[#777B72] font-mono block">
                    {selectedBill.patientMobile}
                  </span>
                )}
              </div>

              <div className="text-xs text-[#777B72] font-mono">
                Dispensed: {selectedBill.date} {selectedBill.time}
              </div>

              {/* Items */}
              <div className="space-y-1.5 pt-2 border-t border-[#DEDCCF]">
                <span className="font-serif-clinical text-xs font-semibold text-[#29332E] block">
                  Formulations Dispensed:
                </span>
                {selectedBill.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-[#DEDCCF]/50">
                    <div>
                      <span className="font-medium text-[#29332E]">{item.productName}</span>
                      <span className="text-[10px] text-[#777B72] block font-mono">
                        {item.quantity} × ₹{item.mrp}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#29332E]">
                      {formatINR(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total & Mode */}
              <div className="p-3 bg-[#EAE4D6] rounded border border-[#DEDCCF] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#777B72] block">Total Amount</span>
                  <span className="text-[10px] font-mono text-[#29332E]">
                    Mode: {selectedBill.paymentMode}
                  </span>
                </div>
                <span className="font-serif-clinical text-lg font-bold text-[#284B3A]">
                  {formatINR(selectedBill.grandTotal)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onPrintBill(selectedBill, false)}
                  className="py-2.5 px-3 bg-[#284B3A] hover:bg-[#607A56] text-[#FFFEFA] rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Reprint Bill</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPrintBill(selectedBill, true)}
                  className="py-2.5 px-3 bg-[#EAE4D6] hover:bg-[#DEDCCF] text-[#29332E] rounded text-xs font-semibold border border-[#DEDCCF] flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
              </div>
            </div>
          ) : (
            /* Bills List */
            filteredBills.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#777B72]">
                No dispensary bills found.
              </div>
            ) : (
              filteredBills.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBill(b)}
                  className="w-full text-left p-3 bg-[#FFFEFA] rounded-xl border border-[#DEDCCF] hover:border-[#284B3A] transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#29332E]">
                        {b.billNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE4D6] text-[#29332E] font-mono">
                        {b.paymentMode}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#29332E] mt-0.5">
                      {b.patientName}
                    </div>
                    <div className="text-[10px] text-[#777B72] font-mono mt-0.5">
                      {b.date} · {b.items.length} item{b.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#284B3A] tabular-nums block">
                      {formatINR(b.grandTotal)}
                    </span>
                    <span className="text-[10px] text-[#777B72]">Tap to View →</span>
                  </div>
                </button>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
