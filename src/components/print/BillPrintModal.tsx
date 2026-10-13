import React, { useState } from 'react';
import { Bill, ClinicInfo } from '../../types';
import { formatINR, formatINRPlain } from '../../services/calculation';
import { storage } from '../../services/storage';
import { Printer, X, Check } from 'lucide-react';

interface BillPrintModalProps {
  bill: Bill | null;
  clinicInfo: ClinicInfo;
  isDuplicate?: boolean;
  onClose: () => void;
  onPrinted?: () => void;
}

export type PrintFormat = '58mm' | '80mm' | 'A4';

export const BillPrintModal: React.FC<BillPrintModalProps> = ({
  bill,
  clinicInfo,
  isDuplicate = false,
  onClose,
  onPrinted,
}) => {
  const [format, setFormat] = useState<PrintFormat>('80mm');
  const [printSuccess, setPrintSuccess] = useState<boolean>(false);

  if (!bill) return null;

  const handleTriggerPrint = () => {
    if (bill.reprintCount > 0 || isDuplicate) {
      storage.addAuditLog(
        'CURRENT_USER',
        'STAFF',
        isDuplicate ? 'BILL_DUPLICATE_PRINTED' : 'BILL_REPRINTED',
        `Bill ${bill.billNumber} printed (${isDuplicate ? 'DUPLICATE' : 'REPRINT'}). Format: ${format}.`
      );
    }

    setPrintSuccess(true);
    window.print();
    if (onPrinted) onPrinted();
    setTimeout(() => setPrintSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFEFA] rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#DEDCCF]">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="no-print p-4 bg-[#284B3A] text-[#FFFEFA] flex items-center justify-between border-b border-[#607A56]/60">
          <div>
            <h3 className="font-serif-clinical text-sm font-bold text-[#FFFEFA]">
              Dispense Print: <span className="font-mono text-[#A8B49A]">{bill.billNumber}</span>
            </h3>
            <p className="text-[11px] text-[#EAE4D6]">
              {isDuplicate ? '*** Marked as DUPLICATE copy ***' : 'Original Dispensary Receipt'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Format selector */}
            <div className="flex items-center bg-[#29332E] p-0.5 rounded border border-[#607A56]/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormat('58mm')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === '58mm' ? 'bg-[#284B3A] text-[#FFFEFA]' : 'text-[#EAE4D6] hover:text-[#FFFEFA]'
                }`}
              >
                58mm Roll
              </button>
              <button
                type="button"
                onClick={() => setFormat('80mm')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === '80mm' ? 'bg-[#284B3A] text-[#FFFEFA]' : 'text-[#EAE4D6] hover:text-[#FFFEFA]'
                }`}
              >
                80mm Roll
              </button>
              <button
                type="button"
                onClick={() => setFormat('A4')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  format === 'A4' ? 'bg-[#284B3A] text-[#FFFEFA]' : 'text-[#EAE4D6] hover:text-[#FFFEFA]'
                }`}
              >
                A4 Medical
              </button>
            </div>

            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 bg-[#607A56] hover:bg-[#A8B49A] text-[#FFFEFA] rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {printSuccess ? <Check className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
              <span>{printSuccess ? 'Printing...' : 'Print Now'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#EAE4D6] hover:text-[#FFFEFA] rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F6F3EA] flex justify-center">
          {/* Format: 58mm Thermal Receipt */}
          {format === '58mm' && (
            <div
              className={`bg-[#FFFEFA] shadow-sm p-4 text-[11px] leading-snug font-mono text-black border border-[#DEDCCF] w-[58mm] relative ${
                bill.status === 'VOID' ? 'opacity-70' : ''
              }`}
            >
              {isDuplicate && (
                <div className="border border-black text-center font-bold text-[10px] py-0.5 mb-2 tracking-widest uppercase">
                  *** DUPLICATE BILL ***
                </div>
              )}
              {bill.status === 'VOID' && (
                <div className="border-2 border-red-600 text-red-600 text-center font-bold text-xs py-1 mb-2 tracking-widest">
                  *** VOIDED BILL ***
                </div>
              )}

              <div className="text-center pb-2 border-b border-dashed border-black">
                <div className="text-[10px] font-bold tracking-tight text-black">
                  ஸ்ரீ கோரக்கர் சித்தா & ஆயுர்வேத கிளினிக்
                </div>
                <div className="font-bold text-xs leading-tight uppercase font-serif-clinical">
                  SRI KORAKKAR SIDDHA & AYURVEDHA
                </div>
                <div className="text-[9px] mt-0.5">{clinicInfo.address}</div>
                <div className="text-[9px]">Ph: {clinicInfo.phone}</div>
                {clinicInfo.gstin && <div className="text-[9px]">GSTIN: {clinicInfo.gstin}</div>}
              </div>

              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div>Bill: {bill.billNumber}</div>
                <div>Date: {bill.date} {bill.time}</div>
                <div>Patient: {bill.patientName}</div>
                {bill.patientMobile && <div>Mobile: {bill.patientMobile}</div>}
              </div>

              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-black">
                  <span>Item</span>
                  <span>Qty × Rate</span>
                  <span>Amt</span>
                </div>
                {bill.items.map((item, idx) => (
                  <div key={idx} className="py-1">
                    <div className="font-bold">{item.productName}</div>
                    <div className="flex justify-between text-[10px]">
                      <span>{item.quantity} × ₹{item.mrp}</span>
                      <span>₹{formatINRPlain(item.lineTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{formatINRPlain(bill.subtotal)}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{formatINRPlain(bill.discountAmount)}</span>
                  </div>
                )}
                {bill.gstAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({bill.gstRate}%):</span>
                    <span>+₹{formatINRPlain(bill.gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span>₹{formatINRPlain(bill.grandTotal)}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Payment Mode:</span>
                  <span className="font-bold">{bill.paymentMode}</span>
                </div>
              </div>

              <div className="text-center text-[9px] pt-3 text-slate-700">
                <p>Authentic Siddha & Ayurvedic Healthcare</p>
                <p>Wish you vibrant health & longevity!</p>
              </div>
            </div>
          )}

          {/* Format: 80mm Thermal Receipt */}
          {format === '80mm' && (
            <div
              className={`bg-[#FFFEFA] shadow-sm p-5 text-xs font-mono text-black border border-[#DEDCCF] w-[80mm] relative ${
                bill.status === 'VOID' ? 'opacity-70' : ''
              }`}
            >
              {isDuplicate && (
                <div className="border border-black text-center font-bold text-xs py-1 mb-3 tracking-widest uppercase bg-[#EAE4D6]/50">
                  *** DUPLICATE BILL ***
                </div>
              )}
              {bill.status === 'VOID' && (
                <div className="border-2 border-red-600 text-red-600 text-center font-bold text-xs py-1 mb-2 tracking-widest">
                  *** VOIDED BILL — NOT VALID ***
                </div>
              )}

              <div className="text-center pb-3 border-b border-dashed border-black">
                <div className="text-xs font-bold tracking-normal text-black mb-0.5">
                  ஸ்ரீ கோரக்கர் சித்தா & ஆயுர்வேத கிளினிக்
                </div>
                <div className="font-bold text-sm leading-tight uppercase font-serif-clinical">
                  SRI KORAKKAR SIDDHA & AYURVEDHA CLINIC
                </div>
                <div className="text-[10px] text-slate-700 mt-1">{clinicInfo.address}</div>
                <div className="text-[10px] text-slate-700">Phone: {clinicInfo.phone}</div>
                <div className="text-[10px] text-slate-700">
                  Reg: {clinicInfo.regNumber} {clinicInfo.gstin ? `| GSTIN: ${clinicInfo.gstin}` : ''}
                </div>
                <div className="text-[10px] font-semibold text-slate-900 mt-0.5">
                  {clinicInfo.chiefPhysician}
                </div>
              </div>

              <div className="py-2.5 border-b border-dashed border-black text-[11px] grid grid-cols-2 gap-1">
                <div>
                  <span className="text-slate-600">Bill No: </span>
                  <strong className="font-bold">{bill.billNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-600">Date: </span>
                  <span>{bill.date} {bill.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600">Patient: </span>
                  <strong>{bill.patientName}</strong>
                  {bill.patientMobile && ` (${bill.patientMobile})`}
                </div>
              </div>

              <div className="py-2.5 border-b border-dashed border-black">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-black text-left">
                      <th className="py-1">Formulation</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">MRP</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dotted divide-slate-300">
                    {bill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1 pr-1">
                          <span className="font-bold block">{item.productName}</span>
                          <span className="text-[9px] text-slate-600">{item.productCode}</span>
                        </td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">₹{formatINRPlain(item.mrp)}</td>
                        <td className="py-1 text-right font-bold">₹{formatINRPlain(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="py-2.5 border-b border-dashed border-black text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="tabular-nums">₹{formatINRPlain(bill.subtotal)}</span>
                </div>
                {bill.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-800">
                    <span>
                      Discount ({bill.discountType === 'PERCENTAGE' ? `${bill.discountValue}%` : 'Fixed'}):
                    </span>
                    <span className="tabular-nums">-₹{formatINRPlain(bill.discountAmount)}</span>
                  </div>
                )}
                {bill.gstAmount > 0 && (
                  <div className="flex justify-between text-slate-800">
                    <span>GST ({bill.gstRate}%):</span>
                    <span className="tabular-nums">+₹{formatINRPlain(bill.gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span className="tabular-nums">₹{formatINRPlain(bill.grandTotal)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Payment Mode:</span>
                  <span className="font-bold">{bill.paymentMode}</span>
                </div>
              </div>

              <div className="text-center text-[10px] pt-4 text-slate-700 space-y-0.5">
                <p className="font-semibold text-black">*** GET WELL SOON ***</p>
                <p>Authentic Siddha & Ayurvedic Medicine Dispensary</p>
              </div>
            </div>
          )}

          {/* Format: Standard A4 Medical Bill */}
          {format === 'A4' && (
            <div
              className={`bg-[#FFFEFA] shadow-md p-10 font-sans text-xs text-[#29332E] border border-[#DEDCCF] w-[210mm] min-h-[280mm] relative ${
                bill.status === 'VOID' ? 'opacity-70' : ''
              }`}
            >
              {isDuplicate && (
                <div className="absolute top-1/3 left-1/4 transform -rotate-12 text-6xl font-black text-[#DEDCCF] pointer-events-none select-none tracking-widest border-4 border-[#DEDCCF] p-6">
                  DUPLICATE BILL
                </div>
              )}

              {/* A4 Header */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-[#284B3A] mb-6">
                <div>
                  <h1 className="font-serif-clinical text-xl font-bold text-[#284B3A] uppercase tracking-tight">
                    {clinicInfo.name}
                  </h1>
                  <p className="text-xs text-[#607A56] font-medium">{clinicInfo.tagline}</p>
                  <p className="text-xs text-[#777B72] mt-1 max-w-md">{clinicInfo.address}</p>
                  <p className="text-xs text-[#777B72]">Ph: {clinicInfo.phone} | Email: {clinicInfo.email}</p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-[#284B3A] text-[#FFFEFA] font-bold text-sm rounded mb-2">
                    {isDuplicate ? 'DUPLICATE TAX INVOICE' : 'RETAIL PHARMACY INVOICE'}
                  </div>
                  <div className="text-xs text-[#777B72]">
                    Reg No: <strong className="text-[#29332E]">{clinicInfo.regNumber}</strong>
                  </div>
                  {clinicInfo.gstin && (
                    <div className="text-xs text-[#777B72]">
                      GSTIN: <strong className="text-[#29332E]">{clinicInfo.gstin}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bill & Patient Meta */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-[#F6F3EA] rounded border border-[#DEDCCF] mb-6">
                <div>
                  <h3 className="font-semibold text-[#80664A] text-[11px] uppercase mb-1">
                    Billed To:
                  </h3>
                  <div className="font-bold text-sm text-[#29332E]">{bill.patientName}</div>
                  {bill.patientMobile && (
                    <div className="text-[#777B72] text-xs">Phone: {bill.patientMobile}</div>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <div>
                    <span className="text-[#777B72]">Invoice Number: </span>
                    <strong className="font-mono text-sm text-[#29332E]">{bill.billNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[#777B72]">Invoice Date: </span>
                    <strong className="text-[#29332E]">{bill.date} ({bill.time})</strong>
                  </div>
                  <div>
                    <span className="text-[#777B72]">Payment Mode: </span>
                    <strong className="text-[#29332E]">{bill.paymentMode}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs border border-[#DEDCCF] rounded mb-6">
                <thead className="bg-[#EAE4D6] text-[#29332E] font-bold border-b border-[#DEDCCF]">
                  <tr>
                    <th className="py-2.5 px-3 text-left w-12">#</th>
                    <th className="py-2.5 px-3 text-left">Medicine Formulation</th>
                    <th className="py-2.5 px-3 text-left">Category</th>
                    <th className="py-2.5 px-3 text-center w-20">Quantity</th>
                    <th className="py-2.5 px-3 text-right w-28">MRP (₹)</th>
                    <th className="py-2.5 px-3 text-right w-32">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDCCF]">
                  {bill.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F6F3EA]">
                      <td className="py-2.5 px-3 font-mono text-[#777B72]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#29332E]">
                        {item.productName}
                        <span className="block text-[10px] font-mono text-[#777B72]">
                          {item.productCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#777B72]">{item.category}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {formatINRPlain(item.mrp)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-[#29332E]">
                        {formatINRPlain(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Box */}
              <div className="flex justify-end mb-10">
                <div className="w-72 bg-[#F6F3EA] border border-[#DEDCCF] rounded p-4 space-y-2">
                  <div className="flex justify-between text-[#777B72]">
                    <span>Items Subtotal:</span>
                    <span className="font-mono tabular-nums text-[#29332E]">{formatINR(bill.subtotal)}</span>
                  </div>
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-[#284B3A] font-semibold">
                      <span>Discount ({bill.discountType === 'PERCENTAGE' ? `${bill.discountValue}%` : 'Fixed'}):</span>
                      <span className="font-mono tabular-nums">−{formatINR(bill.discountAmount)}</span>
                    </div>
                  )}
                  {bill.gstAmount > 0 && (
                    <div className="flex justify-between text-[#80664A] font-semibold">
                      <span>GST ({bill.gstRate}%):</span>
                      <span className="font-mono tabular-nums">+{formatINR(bill.gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t-2 border-[#DEDCCF] flex justify-between font-bold text-base text-[#29332E]">
                    <span className="font-serif-clinical">Grand Total:</span>
                    <span className="font-serif-clinical font-mono tabular-nums text-[#284B3A]">
                      {formatINR(bill.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-10 pt-10 border-t border-[#DEDCCF] mt-auto">
                <div className="text-[11px] text-[#777B72] space-y-1">
                  <p className="font-semibold text-[#29332E]">Dispensary Instructions:</p>
                  <p>1. Store formulations in a cool, dry place away from sunlight.</p>
                  <p>2. Consume Ayurvedic medicines strictly according to physician advice.</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="border-t border-[#29332E] w-48 ml-auto pt-1 font-semibold text-[#29332E]">
                    Authorized Pharmacist
                  </div>
                  <div className="text-[10px] text-[#777B72]">Sri Korakkar Siddha Clinic</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
