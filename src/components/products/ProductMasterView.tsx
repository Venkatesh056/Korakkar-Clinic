import React, { useState } from 'react';
import { Product, ProductCategory, User } from '../../types';
import { storage } from '../../services/storage';
import { formatINR, roundCurrency } from '../../services/calculation';
import {
  Package,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface ProductMasterViewProps {
  products: Product[];
  currentUser: User;
  onProductsUpdated: (updatedList: Product[]) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Churnam',
  'Thailam',
  'Lehyam',
  'Asavam & Arishtam',
  'Bhasmam & Chenduram',
  'Tablet & Vati',
  'Syrup & Kashayam',
  'Herbal Oil',
  'General',
];

export const ProductMasterView: React.FC<ProductMasterViewProps> = ({
  products,
  currentUser,
  onProductsUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formError, setFormError] = useState<string>('');
  const [formData, setFormData] = useState({
    id: '',
    productCode: '',
    name: '',
    category: 'Churnam' as ProductCategory,
    mrp: 0,
    sellingPrice: 0,
    gstRate: 5,
    stockQty: 50,
    unit: 'Bottle',
    active: true,
  });

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreate = () => {
    setModalMode('CREATE');
    setFormData({
      id: '',
      productCode: `SK-CH-${String(products.length + 1).padStart(2, '0')}`,
      name: '',
      category: 'Churnam',
      mrp: 0,
      sellingPrice: 0,
      gstRate: 5,
      stockQty: 50,
      unit: 'Pouch',
      active: true,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setModalMode('EDIT');
    setFormData({
      id: p.id,
      productCode: p.productCode,
      name: p.name,
      category: p.category,
      mrp: p.mrp,
      sellingPrice: p.sellingPrice || p.mrp,
      gstRate: p.gstRate,
      stockQty: p.stockQty,
      unit: p.unit || 'Unit',
      active: p.active,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.productCode.trim()) {
      setFormError('Product Code is required.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (formData.mrp <= 0) {
      setFormError('MRP must be greater than zero.');
      return;
    }

    const duplicate = products.find(
      (p) =>
        p.productCode.toLowerCase() === formData.productCode.trim().toLowerCase() &&
        p.id !== formData.id
    );
    if (duplicate) {
      setFormError(`Product Code '${formData.productCode}' already exists (${duplicate.name}).`);
      return;
    }

    const allProducts = storage.getProducts();
    let updated: Product[];
    const now = new Date().toISOString();

    if (modalMode === 'CREATE') {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        productCode: formData.productCode.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        mrp: roundCurrency(formData.mrp),
        sellingPrice: roundCurrency(formData.sellingPrice || formData.mrp),
        gstRate: formData.gstRate,
        stockQty: Math.max(0, parseInt(String(formData.stockQty), 10) || 0),
        unit: formData.unit.trim() || 'Unit',
        active: formData.active,
        createdAt: now,
        updatedAt: now,
      };
      updated = [newProd, ...allProducts];
    } else {
      updated = allProducts.map((p) =>
        p.id === formData.id
          ? {
              ...p,
              productCode: formData.productCode.trim().toUpperCase(),
              name: formData.name.trim(),
              category: formData.category,
              mrp: roundCurrency(formData.mrp),
              sellingPrice: roundCurrency(formData.sellingPrice || formData.mrp),
              gstRate: formData.gstRate,
              stockQty: Math.max(0, parseInt(String(formData.stockQty), 10) || 0),
              unit: formData.unit.trim() || 'Unit',
              active: formData.active,
              updatedAt: now,
            }
          : p
      );
    }

    storage.saveProducts(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      modalMode === 'CREATE' ? 'PRODUCT_CREATED' : 'PRODUCT_UPDATED',
      `Formulary entry "${formData.name.trim()}" (${formData.productCode}) ${
        modalMode === 'CREATE' ? 'created' : 'updated'
      }. MRP: ₹${formData.mrp}.`
    );

    onProductsUpdated(updated);
    setShowModal(false);
  };

  const handleToggleActive = (p: Product) => {
    const allProducts = storage.getProducts();
    const updated = allProducts.map((prod) =>
      prod.id === p.id ? { ...prod, active: !prod.active, updatedAt: new Date().toISOString() } : prod
    );
    storage.saveProducts(updated);
    storage.addAuditLog(
      currentUser.username,
      currentUser.role,
      'PRODUCT_STATUS_CHANGED',
      `Product "${p.name}" (${p.productCode}) marked as ${!p.active ? 'ACTIVE' : 'INACTIVE'}.`
    );
    onProductsUpdated(updated);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-[#ded8cb]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#b88628] uppercase tracking-wider bg-[#b88628]/10 px-2 py-0.5 rounded border border-[#b88628]/30">
              Apothecary Inventory
            </span>
            <span className="text-xs text-[#697067]">|</span>
            <span className="text-xs font-mono text-[#697067]">Total Formulas: {products.length}</span>
          </div>
          <h1 className="font-serif-clinical text-2xl font-bold text-[#16382b] tracking-tight">
            Formulary Master & Medicine Pricing
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4 text-[#d6a84f]" />
          <span>+ Add Formulary Medicine</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-[#697067] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search formulary by name, product code or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs text-[#1f2723] focus:border-[#16382b] focus:bg-[#ffffff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#697067]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#faf7f2] border border-[#ded8cb] rounded-lg text-xs font-bold text-[#16382b]"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#ded8cb]">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`text-[11px] px-2.5 py-0.5 rounded font-medium border ${
              categoryFilter === 'ALL'
                ? 'bg-[#16382b] text-[#ffffff] border-[#16382b]'
                : 'bg-[#faf7f2] text-[#697067] border-[#ded8cb]'
            }`}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`text-[11px] px-2.5 py-0.5 rounded font-medium border ${
                  categoryFilter === cat
                    ? 'bg-[#16382b] text-[#ffffff] border-[#16382b]'
                    : 'bg-[#faf7f2] text-[#697067] border-[#ded8cb]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulary Catalog Table Card */}
      <div className="bg-[#ffffff] border border-[#ded8cb] rounded-xl overflow-hidden shadow-2xs">
        <div className="px-4 py-3 bg-[#f0eae1] border-b border-[#ded8cb] flex items-center justify-between">
          <span className="font-serif-clinical text-xs font-bold text-[#16382b]">
            Formulary Register ({filteredProducts.length} Items)
          </span>
          <span className="text-xs text-[#697067] font-mono">
            Active: {filteredProducts.filter((p) => p.active).length} · Inactive: {filteredProducts.filter((p) => !p.active).length}
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#697067]">
            No medicines found matching the current search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[680px]">
              <thead className="bg-[#faf7f2] text-[#1f2723] font-bold border-b border-[#ded8cb]">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Medicine Formulation</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">GST Rate</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded8cb]">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#16382b]">
                      <span className="bg-[#f0eae1] px-1.5 py-0.5 rounded border border-[#ded8cb]">
                        {prod.productCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <strong className="text-[#1f2723] block">{prod.name}</strong>
                      <span className="text-[10px] text-[#697067] font-mono">Unit: {prod.unit || 'Bottle/Pouch'}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#697067]">{prod.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#16382b] text-sm tabular-nums">
                      {formatINR(prod.mrp)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        prod.stockQty <= 20
                          ? 'bg-[#ab4d38]/10 text-[#ab4d38] border-[#ab4d38]/30'
                          : 'bg-[#2b5542]/10 text-[#16382b] border-[#2b5542]/30'
                      }`}>
                        {prod.stockQty} {prod.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#697067]">
                      {prod.gstRate || 0}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                          prod.active
                            ? 'bg-[#2b5542]/10 text-[#16382b] border-[#2b5542]/30'
                            : 'bg-[#ded8cb] text-[#697067] border-[#ded8cb]'
                        }`}
                      >
                        {prod.active ? '● Active' : '○ Disabled'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1 text-[#16382b] hover:bg-[#f0eae1] rounded transition-colors"
                        title="Edit Formulation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#ded8cb]">
            <div className="flex items-center justify-between pb-3 border-b border-[#ded8cb]">
              <h3 className="font-serif-clinical text-base font-bold text-[#16382b]">
                {modalMode === 'CREATE' ? 'Add Formulation to Master' : 'Edit Formulation'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#697067] hover:text-[#1f2723] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-[#f0eae1] text-[#ab4d38] text-xs rounded-lg border border-[#ab4d38]/40 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">
                    Product Code <span className="text-[#ab4d38]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SK-CH-05"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1f2723] block mb-1">
                  Medicine Name <span className="text-[#ab4d38]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karpooradi Thailam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">
                    MRP (₹) <span className="text-[#ab4d38]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={formData.mrp || ''}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockQty}
                    onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#1f2723] block mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="Pouch, Bottle"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg focus:border-[#16382b]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1f2723] block mb-1">GST Percentage</label>
                <select
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-[#faf7f2] border border-[#ded8cb] rounded-lg font-mono focus:border-[#16382b]"
                >
                  <option value={0}>0% (Tax Exempt)</option>
                  <option value={5}>5% (AYUSH Standard)</option>
                  <option value={12}>12% (Medicated Oils)</option>
                  <option value={18}>18% (General)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#697067] hover:bg-[#f0eae1] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#16382b] hover:bg-[#2b5542] rounded-lg shadow-2xs"
                >
                  {modalMode === 'CREATE' ? 'Add to Formulary' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
