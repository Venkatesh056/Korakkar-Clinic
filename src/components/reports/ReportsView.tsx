import React, { useState } from 'react';
import { Bill, Expense, Product, DailyAccounts } from '../../types';
import { formatINR } from '../../services/calculation';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  ReceiptText,
  Package,
  Layers,
  ArrowRight,
  Wallet,
} from 'lucide-react';

interface ReportsViewProps {
  bills: Bill[];
  expenses: Expense[];
  products: Product[];
  dailyAccounts: Record<string, DailyAccounts>;
}

type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'STOCK';

export const ReportsView: React.FC<ReportsViewProps> = ({
  bills,
  expenses,
  products,
  dailyAccounts,
}) => {
  const [reportType, setReportType] = useState<ReportType>('DAILY');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().substring(0, 7));

  const activeBills = bills.filter((b) => b.status === 'FINALIZED');

  // Daily Report calculations
  const dailyBills = activeBills.filter((b) => b.date === selectedDate);
  const dailyExpenses = expenses.filter((e) => e.date === selectedDate);
  const dailyAcc = dailyAccounts[selectedDate];

  const dailyCash = dailyBills.filter((b) => b.paymentMode === 'CASH').reduce((sum, b) => sum + b.grandTotal, 0);
  const dailyUpi = dailyBills.filter((b) => b.paymentMode === 'UPI').reduce((sum, b) => sum + b.grandTotal, 0);
  const dailyCard = dailyBills.filter((b) => b.paymentMode === 'CARD').reduce((sum, b) => sum + b.grandTotal, 0);
  const dailyTransfer = dailyBills.filter((b) => b.paymentMode === 'TRANSFER').reduce((sum, b) => sum + b.grandTotal, 0);
  const dailyTotalSales = dailyCash + dailyUpi + dailyCard + dailyTransfer;
  const dailyExpenseTotal = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyClosingCash = (dailyAcc?.openingBalance || 0) + dailyCash - dailyExpenseTotal;

  // Weekly Report calculations
  const refDate = new Date(selectedDate);
  const past7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(refDate);
    d.setDate(refDate.getDate() - i);
    past7Days.push(d.toISOString().split('T')[0]);
  }

  const weeklyBills = activeBills.filter((b) => past7Days.includes(b.date));
  const weeklyExpenses = expenses.filter((e) => past7Days.includes(e.date));
  const weeklyTotalSales = weeklyBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const weeklyTotalExpenses = weeklyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const weeklyProvisionalProfit = weeklyTotalSales - weeklyTotalExpenses;

  // Monthly Report calculations
  const monthlyBills = activeBills.filter((b) => b.date.startsWith(selectedMonth));
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthlyTotalSales = monthlyBills.reduce((sum, b) => sum + b.grandTotal, 0);
  const monthlyTotalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyProvisionalMargin = monthlyTotalSales - monthlyTotalExpenses;

  // Stock Valuation calculations
  const totalStockItems = products.reduce((sum, p) => sum + (p.active ? p.stockQty : 0), 0);
  const totalStockMrpValue = products.reduce(
    (sum, p) => sum + (p.active ? p.stockQty * p.mrp : 0),
    0
  );
  const lowStockCount = products.filter((p) => p.active && p.stockQty <= 20).length;

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'DAILY') {
      csvContent += 'Bill Number,Time,Patient,Payment Mode,Items,Grand Total\n';
      dailyBills.forEach((b) => {
        csvContent += `"${b.billNumber}","${b.time}","${b.patientName}","${b.paymentMode}",${b.items.length},${b.grandTotal}\n`;
      });
    } else if (reportType === 'STOCK') {
      csvContent += 'Product Code,Product Name,Category,MRP,Stock Quantity,Valuation (₹)\n';
      products.forEach((p) => {
        csvContent += `"${p.productCode}","${p.name}","${p.category}",${p.mrp},${p.stockQty},${p.mrp * p.stockQty}\n`;
      });
    } else {
      csvContent += 'Bill Number,Date,Patient,Mode,Total\n';
      monthlyBills.forEach((b) => {
        csvContent += `"${b.billNumber}","${b.date}","${b.patientName}","${b.paymentMode}",${b.grandTotal}\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SriKorakkar_${reportType}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Financial & Clinical Analytics
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Audit-Certified Statements</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Clinical Revenue, Stock & Settlement Reports
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#16382b] bg-[#f0eae1] hover:bg-[#ded8cb] rounded-lg border border-[#ded8cb] shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#16382b]" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#d6a84f]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1 bg-[#f0eae1] p-1 rounded-lg border border-[#ded8cb]">
          <button
            type="button"
            onClick={() => setReportType('DAILY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              reportType === 'DAILY'
                ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                : 'text-[#697067] hover:text-[#16382b]'
            }`}
          >
            Daily Statement
          </button>
          <button
            type="button"
            onClick={() => setReportType('WEEKLY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              reportType === 'WEEKLY'
                ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                : 'text-[#697067] hover:text-[#16382b]'
            }`}
          >
            7-Day Period
          </button>
          <button
            type="button"
            onClick={() => setReportType('MONTHLY')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              reportType === 'MONTHLY'
                ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                : 'text-[#697067] hover:text-[#16382b]'
            }`}
          >
            Monthly Ledger
          </button>
          <button
            type="button"
            onClick={() => setReportType('STOCK')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              reportType === 'STOCK'
                ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                : 'text-[#697067] hover:text-[#16382b]'
            }`}
          >
            Formulary Valuation
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          {reportType === 'MONTHLY' ? (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono font-bold text-xs text-[#16382b]"
            />
          ) : (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono font-bold text-xs text-[#16382b]"
            />
          )}
        </div>
      </div>

      {/* REPORT 1: DAILY REPORT */}
      {reportType === 'DAILY' && (
        <div className="space-y-5">
          {/* Daily KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#16382b] text-[#ffffff] rounded-xl p-4 border border-[#2b5542] shadow-sm">
              <span className="text-[10px] font-bold text-[#d6a84f] uppercase tracking-wider block mb-1">
                Gross Counter Collections
              </span>
              <div className="font-serif-clinical text-2xl font-bold tabular-nums">
                {formatINR(dailyTotalSales)}
              </div>
              <span className="text-[10px] text-[#f0eae1]/80 font-mono mt-1 block">
                {dailyBills.length} finalized dispensations
              </span>
            </div>

            <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-[#16382b] uppercase tracking-wider block mb-1">
                Physical Cash Inflow
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#16382b] tabular-nums">
                {formatINR(dailyCash)}
              </div>
              <span className="text-[10px] text-[#697067]">Cash counter additions</span>
            </div>

            <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-[#ab4d38] uppercase tracking-wider block mb-1">
                Disbursed Expenses
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums">
                {formatINR(dailyExpenseTotal)}
              </div>
              <span className="text-[10px] text-[#697067]">{dailyExpenses.length} approved vouchers</span>
            </div>

            <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-4">
              <span className="text-[10px] font-bold text-[#16382b] uppercase tracking-wider block mb-1">
                Net Drawer Closing Float
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#16382b] tabular-nums">
                {formatINR(dailyClosingCash)}
              </div>
              <span className="text-[10px] text-[#697067] font-mono leading-tight block mt-0.5">
                Float: ₹{dailyAcc?.openingBalance || 0} + Cash - Exp
              </span>
            </div>
          </div>

          {/* Daily Table Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-[#f0eae1] border-b border-[#ded8cb] flex justify-between items-center text-xs">
              <span className="font-serif-clinical font-bold text-[#16382b]">
                Itemized Dispensary Bills for {selectedDate} ({dailyBills.length})
              </span>
              <span className="font-mono text-[#697067]">Cashier Register</span>
            </div>
            {dailyBills.length === 0 ? (
              <div className="p-10 text-center text-xs text-[#697067]">
                No bills recorded on {selectedDate}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[620px]">
                  <thead className="bg-[#faf7f2] font-bold text-[#1f2723] border-b border-[#ded8cb]">
                    <tr>
                      <th className="py-2.5 px-3">Bill No</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3 text-center">Items</th>
                      <th className="py-2.5 px-3 text-center">Mode</th>
                      <th className="py-2.5 px-3 text-right">Grand Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded8cb]">
                    {dailyBills.map((b) => (
                      <tr key={b.id} className="hover:bg-[#faf7f2]">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#16382b]">{b.billNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-[#697067]">{b.time}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#1f2723]">{b.patientName}</td>
                        <td className="py-2.5 px-3 text-center font-mono">{b.items.length}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#f0eae1] text-[#1f2723] border border-[#ded8cb]">
                            {b.paymentMode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16382b] tabular-nums">
                          {formatINR(b.grandTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT 2: WEEKLY REPORT */}
      {reportType === 'WEEKLY' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#16382b] text-[#ffffff] rounded-xl p-4 border border-[#2b5542] shadow-sm">
              <span className="text-[10px] font-bold text-[#d6a84f] uppercase tracking-wider block mb-1">
                7-Day Gross Sales
              </span>
              <div className="font-serif-clinical text-2xl font-bold tabular-nums">
                {formatINR(weeklyTotalSales)}
              </div>
              <span className="text-[10px] text-[#f0eae1]/80 font-mono mt-1 block">
                {weeklyBills.length} total dispensary bills
              </span>
            </div>

            <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-[#ab4d38] uppercase tracking-wider block mb-1">
                7-Day Cash Disbursements
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums">
                {formatINR(weeklyTotalExpenses)}
              </div>
              <span className="text-[10px] text-[#697067]">{weeklyExpenses.length} vouchers recorded</span>
            </div>

            <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-4">
              <span className="text-[10px] font-bold text-[#16382b] uppercase tracking-wider block mb-1">
                Provisional Net Surplus
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#16382b] tabular-nums">
                {formatINR(weeklyProvisionalProfit)}
              </div>
              <span className="text-[10px] text-[#697067]">Inflow minus operating expenses</span>
            </div>
          </div>

          {/* Daily Bar breakdown */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-serif-clinical text-sm font-bold text-[#16382b]">
              7-Day Daily Inflow Progression
            </h3>
            <div className="space-y-2">
              {past7Days.map((day) => {
                const dayBills = activeBills.filter((b) => b.date === day);
                const dayTotal = dayBills.reduce((sum, b) => sum + b.grandTotal, 0);
                const pct = weeklyTotalSales > 0 ? (dayTotal / weeklyTotalSales) * 100 : 0;
                return (
                  <div key={day} className="flex items-center gap-3 text-xs">
                    <span className="w-24 font-mono text-[#697067] font-semibold">{day}</span>
                    <div className="flex-1 bg-[#faf7f2] h-6 rounded-md overflow-hidden border border-[#ded8cb]">
                      <div
                        className="bg-[#16382b] h-full rounded-md transition-all flex items-center px-2"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      >
                        {dayTotal > 0 && (
                          <span className="text-[10px] font-mono text-[#ffffff] font-bold whitespace-nowrap">
                            {formatINR(dayTotal)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono text-right w-16 text-[#697067]">{dayBills.length} bills</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: MONTHLY REPORT */}
      {reportType === 'MONTHLY' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#16382b] text-[#ffffff] rounded-xl p-4 border border-[#2b5542] shadow-sm">
              <span className="text-[10px] font-bold text-[#d6a84f] uppercase tracking-wider block mb-1">
                Month Gross Revenue ({selectedMonth})
              </span>
              <div className="font-serif-clinical text-2xl font-bold tabular-nums">
                {formatINR(monthlyTotalSales)}
              </div>
              <span className="text-[10px] text-[#f0eae1]/80 font-mono mt-1 block">
                {monthlyBills.length} total dispensary bills
              </span>
            </div>

            <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-[#ab4d38] uppercase tracking-wider block mb-1">
                Month Expenses Total
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums">
                {formatINR(monthlyTotalExpenses)}
              </div>
              <span className="text-[10px] text-[#697067]">{monthlyExpenses.length} payment vouchers</span>
            </div>

            <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-4">
              <span className="text-[10px] font-bold text-[#16382b] uppercase tracking-wider block mb-1">
                Provisional Monthly Margin
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#16382b] tabular-nums">
                {formatINR(monthlyProvisionalMargin)}
              </div>
              <span className="text-[10px] text-[#697067]">Receipts minus expenses</span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-5 shadow-2xs text-xs space-y-3">
            <h3 className="font-serif-clinical text-sm font-bold text-[#16382b]">
              Summary by Payment Mode for {selectedMonth}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['CASH', 'UPI', 'CARD', 'TRANSFER'] as const).map((m) => {
                const sum = monthlyBills
                  .filter((b) => b.paymentMode === m)
                  .reduce((acc, b) => acc + b.grandTotal, 0);
                return (
                  <div key={m} className="p-3 bg-[#faf7f2] rounded-lg border border-[#ded8cb] space-y-1">
                    <span className="text-[10px] font-bold text-[#697067] block">{m} Channel</span>
                    <span className="font-mono font-bold text-sm text-[#16382b] tabular-nums">{formatINR(sum)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: FORMULARY VALUATION */}
      {reportType === 'STOCK' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#16382b] text-[#ffffff] rounded-xl p-4 border border-[#2b5542] shadow-sm">
              <span className="text-[10px] font-bold text-[#d6a84f] uppercase tracking-wider block mb-1">
                Total Stock Units
              </span>
              <div className="font-serif-clinical text-2xl font-bold tabular-nums">
                {totalStockItems} Units
              </div>
              <span className="text-[10px] text-[#f0eae1]/80 font-mono mt-1 block">
                Across {products.length} master formulations
              </span>
            </div>

            <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] font-bold text-[#16382b] uppercase tracking-wider block mb-1">
                Stock Valuation at MRP
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#16382b] tabular-nums">
                {formatINR(totalStockMrpValue)}
              </div>
              <span className="text-[10px] text-[#697067]">Dispensary shelf inventory value</span>
            </div>

            <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-4">
              <span className="text-[10px] font-bold text-[#ab4d38] uppercase tracking-wider block mb-1">
                Formulas Below Reorder Threshold
              </span>
              <div className="font-serif-clinical text-2xl font-bold text-[#ab4d38] tabular-nums">
                {lowStockCount} Formulas
              </div>
              <span className="text-[10px] text-[#697067]">Stock ≤ 20 units</span>
            </div>
          </div>

          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-[#f0eae1] border-b border-[#ded8cb] flex justify-between items-center text-xs">
              <span className="font-serif-clinical font-bold text-[#16382b]">
                Formulary Stock Inventory Ledger
              </span>
              <span className="font-mono text-[#697067]">{products.length} Items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[620px]">
                <thead className="bg-[#faf7f2] font-bold text-[#1f2723] border-b border-[#ded8cb]">
                  <tr>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Formulation Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                    <th className="py-2.5 px-3 text-center">Stock Qty</th>
                    <th className="py-2.5 px-3 text-right">Valuation (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8cb]">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-[#faf7f2]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#16382b]">{p.productCode}</td>
                      <td className="py-2.5 px-3 font-bold text-[#1f2723]">{p.name}</td>
                      <td className="py-2.5 px-3 text-[#697067]">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16382b]">{formatINR(p.mrp)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded border ${
                          p.stockQty <= 20
                            ? 'bg-[#ab4d38]/10 text-[#ab4d38] border-[#ab4d38]/30'
                            : 'bg-[#2b5542]/10 text-[#16382b] border-[#2b5542]/30'
                        }`}>
                          {p.stockQty} {p.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-[#16382b] tabular-nums">
                        {formatINR(p.mrp * p.stockQty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
