import React, { useState } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { ShoppingBag, TrendingUp, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const SoldModal = ({ product, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !product) return null;

  const { showToast } = useAlert();
  const [qtySold, setQtySold] = useState(1);
  const [actionSource, setActionSource] = useState('Manual Day-End Update');
  const [submitting, setSubmitting] = useState(false);

  const unitPrice = product.currentPrice || product.sellingPrice;
  const costPrice = product.costPrice || 0;
  
  // Total loss prevented = costPrice * qtySold (capital saved from 100% loss)
  const lossPrevented = costPrice * qtySold;
  const totalRevenue = unitPrice * qtySold;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qtySold <= 0 || qtySold > product.quantity) {
      showToast(`Please enter a quantity between 1 and ${product.quantity}`, 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/products/${product._id}/sold`, {
        quantitySold: Number(qtySold),
        actionSource,
      });

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });

      showToast(res.data.message || 'Item marked as sold! Loss prevented recorded.', 'success');
      onUpdated();
      onClose();
    } catch (err) {
      showToast('Error recording sale: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <ShoppingBag className="w-5 h-5" />
            <span>Mark Items as Sold (Loss Prevented)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-lg">{product.name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Batch: {product.batchNumber} • Available: <strong className="text-slate-800">{product.quantity} {product.unit}</strong>
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Quantity Sold ({product.unit})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={qtySold}
                onChange={(e) => setQtySold(Math.min(product.quantity, Math.max(1, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 text-base focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setQtySold(product.quantity)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition whitespace-nowrap"
              >
                All ({product.quantity})
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Update Category
            </label>
            <select
              value={actionSource}
              onChange={(e) => setActionSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Manual Day-End Update">Manual Day-End Closing Update</option>
              <option value="Month-End Update">Month-End Inventory Reconciliation</option>
              <option value="Clearance Sale">Clearance Discount Sale</option>
              <option value="Regular Sale">Regular Sale</option>
            </select>
          </div>

          {/* Loss Prevented Impact Card */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Capital Loss Prevented:
              </span>
              <span className="font-extrabold text-emerald-700 text-base">
                +₹{lossPrevented.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-700/80">
              <span>Total Revenue Recovered:</span>
              <span className="font-bold">₹{totalRevenue.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-emerald-600 leading-tight">
              Selling these items before expiry prevented a total write-off of product inventory cost!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Updating...' : 'Record Sold'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SoldModal;
