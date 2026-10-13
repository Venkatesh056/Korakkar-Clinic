import React, { useState, useEffect, useRef } from 'react';
import {
  Product,
  Patient,
  Bill,
  BillItem,
  PaymentMode,
  User,
  DailyAccounts,
  Prescription,
} from '../../types';
import {
  calculateBillTotals,
  formatINR,
  roundCurrency,
} from '../../services/calculation';
import { storage } from '../../services/storage';
import {
  Search,
  UserPlus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Receipt,
  UserCheck,
  Plus,
  Minus,
  Sparkles,
  ClipboardList,
  Calculator,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface BillingViewProps {
  products: Product[];
  patients: Patient[];
  currentUser: User;
  accountsToday: DailyAccounts;
  prefillPatient?: Patient | null;
  prefillPrescription?: Prescription | null;
  onClearPrefill?: () => void;
  onBillCreated: (newBill: Bill) => void;
  onOpenPrint: (bill: Bill) => void;
  onAddNewPatientInline: (patient: Patient) => void;
}

const CATEGORY_CHIPS = [
  'ALL',
  'Churnam',
  'Thailam',
  'Lehyam',
  'Asavam & Arishtam',
  'Tablet & Vati',
  'Syrup & Kashayam',
];

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  patients,
  currentUser,
  accountsToday,
  prefillPatient,
  prefillPrescription,
  onClearPrefill,
  onBillCreated,
  onOpenPrint,
  onAddNewPatientInline,
}) => {
  // Billing form state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');
  const [isWalkIn, setIsWalkIn] = useState<boolean>(true);
  const [walkInName, setWalkInName] = useState<string>('Walk-in Patient');
  const [walkInMobile, setWalkInMobile] = useState<string>('');

  // Inline new patient modal state
  const [showNewPatientModal, setShowNewPatientModal] = useState<boolean>(false);
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientMobile, setNewPatientMobile] = useState<string>('');
  const [newPatientAddress, setNewPatientAddress] = useState<string>('');
  const [newPatientNotes, setNewPatientNotes] = useState<string>('');
  const [patientError, setPatientError] = useState<string>('');

  // Bill items state
  const [items, setItems] = useState<BillItem[]>([]);

  // Product selection & filter state
  const [selectedCategoryChip, setSelectedCategoryChip] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addItemQty, setAddItemQty] = useState<number>(1);
  const [addItemMrp, setAddItemMrp] = useState<number>(0);

  // Discount state
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // GST state (disabled by default for traditional medicines)
  const [gstEnabled, setGstEnabled] = useState<boolean>(false);
  const [gstRate, setGstRate] = useState<number>(5);

  // Payment mode & cash change calculation
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');

  // Submission & idempotency
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [billError, setBillError] = useState<string>('');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => `idem_${Date.now()}`);

  const productInputRef = useRef<HTMLInputElement>(null);

  // Load prefilled patient or prescription if supplied
  useEffect(() => {
    if (prefillPatient) {
      setIsWalkIn(false);
      setSelectedPatientId(prefillPatient.id);
    }
  }, [prefillPatient]);

  useEffect(() => {
    if (prefillPrescription) {
      // Find items in product master matching the prescription
      const importedItems: BillItem[] = [];
      prefillPrescription.medicines.forEach((med) => {
        const prod = products.find(
          (p) =>
            p.id === med.productId ||
            p.name.toLowerCase() === med.medicineName.toLowerCase() ||
            (med.productCode && p.productCode.toLowerCase() === med.productCode.toLowerCase())
        );
        if (prod) {
          importedItems.push({
            id: `bi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: prod.id,
            productCode: prod.productCode,
            productName: prod.name,
            category: prod.category,
            quantity: 1,
            mrp: roundCurrency(prod.mrp),
            lineTotal: roundCurrency(prod.mrp),
          });
        }
      });
      if (importedItems.length > 0) {
        setItems(importedItems);
      }
    }
  }, [prefillPrescription, products]);

  // Selected patient's active prescriptions (if any)
  const allPrescriptions = storage.getPrescriptions();
  const patientActiveRx = !isWalkIn && selectedPatientId
    ? allPrescriptions.filter((rx) => rx.patientId === selectedPatientId)[0] || null
    : null;

  // Filtered products for search and category
  const filteredProducts = products
    .filter((p) => p.active)
    .filter((p) => {
      if (selectedCategoryChip !== 'ALL' && p.category !== selectedCategoryChip) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .slice(0, 8);

  // Filtered patients for dropdown
  const filteredPatients = patientSearchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
          p.mobile.includes(patientSearchQuery)
      )
    : patients.slice(0, 6);

  // Live calculation using authoritative engine
  const totals = calculateBillTotals({
    items: items.map((i) => ({ quantity: i.quantity, mrp: i.mrp })),
    discountType,
    discountValue,
    gstEnabled,
    gstRate,
  });

  // Cash change due calculation
  const tenderedNum = parseFloat(cashTendered) || 0;
  const changeDue = tenderedNum > totals.grandTotal ? roundCurrency(tenderedNum - totals.grandTotal) : 0;

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setAddItemMrp(prod.mrp);
    setAddItemQty(1);
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;
    if (addItemQty <= 0) {
      setBillError('Quantity must be greater than zero.');
      return;
    }
    if (addItemMrp < 0) {
      setBillError('MRP cannot be negative.');
      return;
    }

    const newItem: BillItem = {
      id: `bi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: selectedProduct.id,
      productCode: selectedProduct.productCode,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: Number(addItemQty),
      mrp: roundCurrency(Number(addItemMrp)),
      lineTotal: roundCurrency(Number(addItemQty) * Number(addItemMrp)),
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setAddItemQty(1);
    setAddItemMrp(0);
    setBillError('');

    if (productInputRef.current) {
      productInputRef.current.focus();
    }
  };

  const handleImportPrescription = (rx: Prescription) => {
    const imported: BillItem[] = [];
    rx.medicines.forEach((med) => {
      const prod = products.find(
        (p) =>
          p.id === med.productId ||
          p.name.toLowerCase() === med.medicineName.toLowerCase() ||
          (med.productCode && p.productCode.toLowerCase() === med.productCode.toLowerCase())
      );
      if (prod) {
        imported.push({
          id: `bi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productCode: prod.productCode,
          productName: prod.name,
          category: prod.category,
          quantity: 1,
          mrp: roundCurrency(prod.mrp),
          lineTotal: roundCurrency(prod.mrp),
        });
      }
    });

    if (imported.length > 0) {
      setItems([...items, ...imported]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'quantity' | 'mrp', value: number) => {
    setItems(
      items.map((i) => {
        if (i.id !== id) return i;
        const updatedQty = field === 'quantity' ? Math.max(0.1, Number(value) || 0) : i.quantity;
        const updatedMrp = field === 'mrp' ? Math.max(0, Number(value) || 0) : i.mrp;
        return {
          ...i,
          quantity: updatedQty,
          mrp: updatedMrp,
          lineTotal: roundCurrency(updatedQty * updatedMrp),
        };
      })
    );
  };

  const handleCreatePatientInline = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError('');

    if (!newPatientName.trim()) {
      setPatientError('Patient name is required.');
      return;
    }
    if (!/^\d{10}$/.test(newPatientMobile.trim())) {
      setPatientError('Mobile number must be exactly 10 digits.');
      return;
    }

    const exists = patients.find((p) => p.mobile === newPatientMobile.trim());
    if (exists) {
      setPatientError(`Patient with mobile ${newPatientMobile} already exists (${exists.name}).`);
      return;
    }

    const newPat: Patient = {
      id: `pat_${Date.now()}`,
      name: newPatientName.trim(),
      mobile: newPatientMobile.trim(),
      address: newPatientAddress.trim(),
      notes: newPatientNotes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddNewPatientInline(newPat);
    setSelectedPatientId(newPat.id);
    setIsWalkIn(false);
    setShowNewPatientModal(false);
    setNewPatientName('');
    setNewPatientMobile('');
    setNewPatientAddress('');
    setNewPatientNotes('');
  };

  const handleFinalizeBill = () => {
    setBillError('');

    if (accountsToday.isClosed) {
      setBillError('Accounts for today are locked. Bills cannot be finalized on a closed day without Administrator reopening.');
      return;
    }

    if (items.length === 0) {
      setBillError('A bill cannot be finalized without at least one medicine line item.');
      return;
    }

    let pName = walkInName.trim() || 'Walk-in Patient';
    let pMobile = walkInMobile.trim();
    let patId: string | null = null;

    if (!isWalkIn && selectedPatientId) {
      const p = patients.find((pat) => pat.id === selectedPatientId);
      if (p) {
        pName = p.name;
        pMobile = p.mobile;
        patId = p.id;
      }
    }

    setIsSubmitting(true);

    const nextBillNo = storage.getNextBillNumber();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const finalizedBill: Bill = {
      id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      billNumber: nextBillNo,
      patientId: patId,
      patientName: pName,
      patientMobile: pMobile,
      date: dateStr,
      time: timeStr,
      items: [...items],
      subtotal: totals.subtotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      discountedSubtotal: totals.discountedSubtotal,
      gstEnabled,
      gstRate: gstEnabled ? gstRate : 0,
      gstAmount: totals.gstAmount,
      grandTotal: totals.grandTotal,
      paymentMode,
      status: 'FINALIZED',
      createdBy: currentUser.username,
      reprintCount: 0,
      idempotencyKey,
      createdAt: now.toISOString(),
    };

    onBillCreated(finalizedBill);

    // Reset counter for next patient
    setItems([]);
    setSelectedProduct(null);
    setDiscountValue(0);
    setGstEnabled(false);
    setPaymentMode('CASH');
    setCashTendered('');
    setIsWalkIn(true);
    setWalkInName('Walk-in Patient');
    setWalkInMobile('');
    setSelectedPatientId('');
    setIdempotencyKey(`idem_${Date.now()}`);
    setIsSubmitting(false);

    if (onClearPrefill) onClearPrefill();
    onOpenPrint(finalizedBill);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Counter Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Active Counter Station · Sri Korakkar
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Dispensary POS</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Medicine Dispensation & Billing Counter
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs bg-[#ffffff] px-3.5 py-1.5 rounded-lg border border-[#ded8cb] shadow-2xs">
          <span className="text-[#697067]">Next Sequential Bill:</span>
          <strong className="font-mono text-[#16382b] text-sm font-bold">
            {storage.getNextBillNumber()}
          </strong>
        </div>
      </div>

      {billError && (
        <div className="bg-[#f0eae1] border-l-4 border-l-[#ab4d38] border border-[#ded8cb] text-[#1f2723] text-xs p-3.5 rounded-r-lg flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#ab4d38]" />
          <span className="font-medium">{billError}</span>
        </div>
      )}

      {/* Main Counter Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Medicine Search, Category Filter & Line Item Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Doctor Prescription Banner (if available) */}
          {patientActiveRx && (
            <div className="bg-[#ffffff] border border-[#b88628]/50 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#b88628]/15 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-4 h-4 text-[#b88628]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#16382b] flex items-center gap-2">
                    <span>Clinical Prescription Available</span>
                    <span className="text-[10px] font-mono text-[#697067] bg-[#f0eae1] px-1.5 py-0.2 rounded border border-[#ded8cb]">
                      {patientActiveRx.prescriptionDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#697067]">
                    {patientActiveRx.doctorName} prescribed {patientActiveRx.medicines.length} classical formula{patientActiveRx.medicines.length !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleImportPrescription(patientActiveRx)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-md shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d6a84f]" />
                <span>Import Rx (1-Click)</span>
              </button>
            </div>
          )}

          {/* Formulary Search Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#16382b] block">
                Formulary Lookup (Product Code or Classical Herb Name)
              </label>
              <span className="text-[11px] text-[#697067] font-mono">
                {products.filter((p) => p.active).length} Active Formulas
              </span>
            </div>

            {/* Category Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedCategoryChip(chip)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors border ${
                    selectedCategoryChip === chip
                      ? 'bg-[#16382b] text-[#ffffff] border-[#16382b]'
                      : 'bg-[#faf7f2] text-[#697067] border-[#ded8cb] hover:bg-[#f0eae1] hover:text-[#1f2723]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
              <input
                ref={productInputRef}
                type="text"
                placeholder="Search 'SK-CH', 'Nilavembu', 'Amukkara', 'Thirikadugu'..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:outline-none focus:border-[#16382b] focus:bg-[#ffffff] text-[#1f2723] transition-colors"
              />
            </div>

            {/* Suggestions list */}
            {productSearch.trim() && filteredProducts.length > 0 && (
              <div className="border border-[#ded8cb] rounded-lg divide-y divide-[#ded8cb] max-h-56 overflow-y-auto bg-[#ffffff] shadow-sm">
                {filteredProducts.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className="w-full text-left p-2.5 hover:bg-[#f0eae1] flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#16382b] mr-2 bg-[#f0eae1] px-1.5 py-0.2 rounded border border-[#ded8cb]">
                        {prod.productCode}
                      </span>
                      <span className="font-bold text-[#1f2723]">{prod.name}</span>
                      <span className="text-[10px] text-[#697067] ml-2 font-mono">
                        · {prod.category}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-[#16382b]">{formatINR(prod.mrp)}</span>
                      <span className={`text-[10px] ml-2 px-1.5 py-0.2 rounded border ${
                        prod.stockQty <= 20
                          ? 'bg-[#ab4d38]/10 text-[#ab4d38] border-[#ab4d38]/30 font-bold'
                          : 'bg-[#2b5542]/10 text-[#16382b] border-[#2b5542]/30'
                      }`}>
                        Stock: {prod.stockQty}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected Product Staging Panel */}
            {selectedProduct && (
              <div className="p-3 bg-[#f0eae1] border border-[#ded8cb] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#16382b] bg-[#ffffff] px-1.5 py-0.2 rounded border border-[#ded8cb]">
                      {selectedProduct.productCode}
                    </span>
                    <span className="font-bold text-[#1f2723]">{selectedProduct.name}</span>
                  </div>
                  <span className="text-[10px] text-[#697067] block mt-0.5">
                    Category: {selectedProduct.category} · Stock Available: {selectedProduct.stockQty}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quantity Stepper & Quick Adders */}
                  <div className="flex items-center gap-1">
                    <span className="text-[#697067] text-[11px] font-medium mr-1">Qty:</span>
                    <button
                      type="button"
                      onClick={() => setAddItemQty(Math.max(1, addItemQty - 1))}
                      className="w-7 h-7 bg-[#ffffff] border border-[#ded8cb] rounded flex items-center justify-center font-bold text-[#1f2723] hover:bg-[#ded8cb]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={addItemQty}
                      onChange={(e) => setAddItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 h-7 bg-[#ffffff] border border-[#ded8cb] rounded font-mono text-center font-bold text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setAddItemQty(addItemQty + 1)}
                      className="w-7 h-7 bg-[#ffffff] border border-[#ded8cb] rounded flex items-center justify-center font-bold text-[#1f2723] hover:bg-[#ded8cb]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    {/* Quick +1, +2, +5 buttons */}
                    <div className="flex items-center gap-1 ml-1.5">
                      {[1, 2, 5].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAddItemQty(amt)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            addItemQty === amt
                              ? 'bg-[#16382b] text-[#ffffff] border-[#16382b]'
                              : 'bg-[#ffffff] text-[#697067] border-[#ded8cb]'
                          }`}
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MRP */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#697067] text-[11px]">MRP:</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={addItemMrp}
                      onChange={(e) => setAddItemMrp(parseFloat(e.target.value) || 0)}
                      className="w-20 h-7 bg-[#ffffff] border border-[#ded8cb] rounded font-mono text-center font-bold text-xs"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3.5 h-7 bg-[#16382b] hover:bg-[#2b5542] text-[#ffffff] rounded font-bold transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#d6a84f]" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart Items Table Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-[#f0eae1] border-b border-[#ded8cb] flex items-center justify-between">
              <span className="font-serif-clinical text-xs font-bold text-[#16382b] flex items-center gap-2">
                <span>Dispensary Cart</span>
                <span className="font-mono bg-[#ffffff] px-2 py-0.5 rounded text-[10px] text-[#697067] border border-[#ded8cb]">
                  {items.length} line{items.length !== 1 ? 's' : ''}
                </span>
              </span>
              <span className="text-xs text-[#697067] font-mono">
                Items Subtotal: <strong className="text-[#16382b] text-sm tabular-nums">{formatINR(totals.subtotal)}</strong>
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center text-[#697067] text-xs">
                <Receipt className="w-8 h-8 text-[#9bb09f] mx-auto mb-2 opacity-60" />
                <p className="font-medium text-[#1f2723]">Cart is empty</p>
                <p className="text-[11px] mt-0.5">Search and select medicines from the formulary above to begin dispensing.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[540px]">
                  <thead className="bg-[#faf7f2] text-[#1f2723] font-bold border-b border-[#ded8cb]">
                    <tr>
                      <th className="py-2.5 px-3 w-8">#</th>
                      <th className="py-2.5 px-3">Medicine Description</th>
                      <th className="py-2.5 px-3 w-28 text-center">Qty</th>
                      <th className="py-2.5 px-3 w-24 text-right">MRP (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Line Total</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ded8cb]">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-[#faf7f2]/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[#697067] text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#1f2723] block">
                            {item.productName}
                          </span>
                          <span className="font-mono text-[10px] text-[#697067]">
                            {item.productCode} · {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0.1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)
                            }
                            className="w-16 px-1.5 py-0.5 text-center font-mono font-bold border border-[#ded8cb] bg-[#ffffff] rounded focus:border-[#16382b]"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.mrp}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'mrp', parseFloat(e.target.value) || 0)
                            }
                            className="w-20 px-1.5 py-0.5 text-right font-mono font-bold border border-[#ded8cb] bg-[#ffffff] rounded focus:border-[#16382b]"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16382b] tabular-nums">
                          {formatINR(item.lineTotal)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[#697067] hover:text-[#ab4d38] p-1 transition-colors"
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Patient Identity, Discounts, Taxes & Final Settlement (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Patient Details Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#ded8cb]">
              <span className="font-serif-clinical text-xs font-bold text-[#16382b]">
                Patient Information
              </span>
              <div className="flex items-center gap-1 bg-[#f0eae1] p-0.5 rounded-md border border-[#ded8cb]">
                <button
                  type="button"
                  onClick={() => setIsWalkIn(true)}
                  className={`text-[11px] px-2.5 py-0.5 rounded font-semibold transition-colors ${
                    isWalkIn
                      ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                      : 'text-[#697067] hover:text-[#16382b]'
                  }`}
                >
                  Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setIsWalkIn(false)}
                  className={`text-[11px] px-2.5 py-0.5 rounded font-semibold transition-colors ${
                    !isWalkIn
                      ? 'bg-[#16382b] text-[#ffffff] shadow-2xs'
                      : 'text-[#697067] hover:text-[#16382b]'
                  }`}
                >
                  Registered
                </button>
              </div>
            </div>

            {isWalkIn ? (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-[#697067] block mb-0.5">
                    Walk-in Patient Name
                  </label>
                  <input
                    type="text"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#697067] block mb-0.5">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={walkInMobile}
                    onChange={(e) => setWalkInMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-2.5 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs font-mono text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#697067]">
                    Search Clinic Registry
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPatientModal(true)}
                    className="text-[11px] font-bold text-[#16382b] hover:text-[#2b5542] flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3 text-[#b88628]" />
                    <span>+ Register Patient</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search name or 10-digit mobile..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
                />

                {filteredPatients.length > 0 && !selectedPatientId && (
                  <div className="border border-[#ded8cb] rounded-lg max-h-36 overflow-y-auto divide-y divide-[#ded8cb] bg-[#ffffff] shadow-xs">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id);
                          setPatientSearchQuery('');
                        }}
                        className="w-full text-left p-2 hover:bg-[#f0eae1] transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#1f2723] block">{p.name}</span>
                          <span className="text-[10px] text-[#697067] font-mono">
                            {p.mobile}
                          </span>
                        </div>
                        <UserCheck className="w-4 h-4 text-[#16382b]" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedPatientId && (
                  <div className="p-2.5 bg-[#f0eae1] rounded-lg border border-[#ded8cb] text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-[#16382b] font-bold">Patient: </span>
                      <strong className="text-[#1f2723]">
                        {patients.find((p) => p.id === selectedPatientId)?.name}
                      </strong>
                      <span className="font-mono text-[#697067] ml-1.5">
                        ({patients.find((p) => p.id === selectedPatientId)?.mobile})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatientId('')}
                      className="text-[#ab4d38] font-bold text-xs hover:underline ml-2"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discount & Taxes Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3 text-xs">
            <span className="font-serif-clinical text-xs font-bold text-[#16382b] block pb-1 border-b border-[#ded8cb]">
              Deductions & AYUSH GST
            </span>

            {/* Bill-level discount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#697067]">Dispensary Discount</label>
                <div className="flex items-center gap-1 bg-[#f0eae1] p-0.5 rounded border border-[#ded8cb]">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      discountType === 'PERCENTAGE'
                        ? 'bg-[#16382b] text-[#ffffff]'
                        : 'text-[#697067] hover:text-[#16382b]'
                    }`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('AMOUNT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      discountType === 'AMOUNT'
                        ? 'bg-[#16382b] text-[#ffffff]'
                        : 'text-[#697067] hover:text-[#16382b]'
                    }`}
                  >
                    ₹ Fixed
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                placeholder={discountType === 'PERCENTAGE' ? 'e.g. 10 for 10%' : 'e.g. 50'}
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono font-bold text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
              />
            </div>

            {/* Optional GST Toggle */}
            <div className="pt-2 border-t border-[#ded8cb]">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#1f2723] flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gstEnabled}
                    onChange={(e) => setGstEnabled(e.target.checked)}
                    className="rounded text-[#16382b] focus:ring-[#16382b]"
                  />
                  <span>Apply GST (Optional AYUSH)</span>
                </label>
                {gstEnabled && (
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value, 10))}
                    className="text-xs px-2 py-1 bg-[#faf7f2] border border-[#ded8cb] rounded-md font-mono font-bold text-[#16382b]"
                  >
                    <option value={5}>5% AYUSH Herbals</option>
                    <option value={12}>12% Medicated Oils/Syrup</option>
                    <option value={18}>18% General Products</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method & Change Calculator Card */}
          <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3 text-xs">
            <label className="font-serif-clinical text-xs font-bold text-[#16382b] block">
              Payment Settlement Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['CASH', 'UPI', 'CARD', 'TRANSFER'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-[#16382b] text-[#ffffff] border-[#16382b] shadow-xs'
                      : 'bg-[#faf7f2] text-[#1f2723] border-[#ded8cb] hover:bg-[#f0eae1]'
                  }`}
                >
                  {mode === 'CASH' && '💵 '}
                  {mode === 'UPI' && '📱 '}
                  {mode === 'CARD' && '💳 '}
                  {mode === 'TRANSFER' && '🏦 '}
                  {mode}
                </button>
              ))}
            </div>

            {/* Cash Tender & Change Due Calculator */}
            {paymentMode === 'CASH' && (
              <div className="p-3 bg-[#f0eae1] rounded-lg border border-[#ded8cb] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#697067] flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-[#b88628]" />
                    <span>Cash Tendered by Patient (₹):</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-24 px-2 py-1 bg-[#ffffff] border border-[#ded8cb] rounded font-mono font-bold text-right text-xs"
                  />
                </div>
                {changeDue > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#ded8cb]">
                    <span className="text-[11px] font-bold text-[#16382b]">Change Due to Patient:</span>
                    <span className="font-mono font-bold text-sm text-[#16382b] tabular-nums bg-[#ffffff] px-2 py-0.5 rounded border border-[#ded8cb]">
                      {formatINR(changeDue)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Final Totals & Dispatch Button Card */}
          <div className="bg-[#f0eae1] border border-[#ded8cb] rounded-xl p-5 shadow-sm space-y-3">
            <div className="space-y-1.5 text-xs text-[#697067]">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-mono text-[#1f2723] font-semibold tabular-nums">
                  {formatINR(totals.subtotal)}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[#16382b] font-bold">
                  <span>
                    Discount ({discountType === 'PERCENTAGE' ? `${discountValue}%` : 'Fixed'}):
                  </span>
                  <span className="font-mono tabular-nums">−{formatINR(totals.discountAmount)}</span>
                </div>
              )}

              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-[#697067] text-[11px]">
                  <span>Discounted Subtotal:</span>
                  <span className="font-mono tabular-nums">{formatINR(totals.discountedSubtotal)}</span>
                </div>
              )}

              {gstEnabled && (
                <div className="flex justify-between text-[#6b5239] font-bold">
                  <span>AYUSH GST ({gstRate}%):</span>
                  <span className="font-mono tabular-nums">+{formatINR(totals.gstAmount)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#ded8cb] flex items-baseline justify-between">
              <span className="font-serif-clinical text-sm font-bold text-[#1f2723]">
                Net Payable Total:
              </span>
              <span className="font-serif-clinical text-3xl font-bold font-mono tabular-nums text-[#16382b]">
                {formatINR(totals.grandTotal)}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting || items.length === 0}
              onClick={handleFinalizeBill}
              className={`w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs ${
                items.length === 0
                  ? 'bg-[#ded8cb] text-[#697067] cursor-not-allowed'
                  : 'bg-[#16382b] hover:bg-[#2b5542] text-[#ffffff]'
              }`}
            >
              <CheckCircle className="w-4 h-4 text-[#d6a84f]" />
              <span>Finalize & Issue Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inline New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <div>
                <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                  Register New Patient
                </h3>
                <p className="text-[11px] text-[#697067]">Add patient to clinic records with 10-digit mobile</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {patientError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {patientError}
              </div>
            )}

            <form onSubmit={handleCreatePatientInline} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Full Name <span className="text-[#ab4d38]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S. Ramanathan"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Mobile Number (10 Digits) <span className="text-[#ab4d38]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9840123456"
                  value={newPatientMobile}
                  onChange={(e) => setNewPatientMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1f2723] block mb-1">Address / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Main Bazaar, Tirunelveli"
                  value={newPatientAddress}
                  onChange={(e) => setNewPatientAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#1f2723] block mb-1">Dosha / Health Notes</label>
                <textarea
                  rows={2}
                  placeholder="Pulse diagnosis notes, allergies, chronic conditions..."
                  value={newPatientNotes}
                  onChange={(e) => setNewPatientNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-[#16382b] hover:bg-[#2b5542] text-[#ffffff] font-bold rounded-lg shadow-2xs"
                >
                  Save & Select Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
