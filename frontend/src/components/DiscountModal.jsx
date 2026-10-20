import React, { useState } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { Percent, Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const DiscountModal = ({ product, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !product) return null;

  const { showToast } = useAlert();
  const smart = product.smartDiscount || {};
  const [discountPercent, setDiscountPercent] = useState(
    product.discountPercentage || smart.discountPercentage || 30
  );
  const [submitting, setSubmitting] = useState(false);

  const calculatedNewPrice = Math.max(
    1,
    Math.round(product.sellingPrice * (1 - discountPercent / 100))
  );

  const handleApply = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/products/${product._id}/discount`, {
        discountPercentage: discountPercent,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast(`Clearance discount of ${discountPercent}% applied!`, 'success');
      onUpdated();
      onClose();
    } catch (err) {
      showToast('Failed to apply discount: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <Percent className="w-5 h-5" />
            <span>Smart Discount Suggester</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h4 className="font-extrabold text-slate-900 text-lg">{product.name}</h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Batch: {product.batchNumber} • Expiry: {new Date(product.expiryDate).toLocaleDateString()}
          </p>

          {/* Smart recommendation card */}
          <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>System Recommendation: {smart.discountPercentage || 0}% OFF</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {smart.reasoning || 'Apply clearance pricing to accelerate inventory turnover before expiry.'}
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select or Customize Clearance Discount %:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[15, 25, 50, 70].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-2 text-xs font-extrabold rounded-lg border transition ${
                    discountPercent === pct
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>

            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1">
              <span>0% (Full Price)</span>
              <span className="text-rose-600 font-extrabold text-sm">{discountPercent}%</span>
              <span>90% (Deep Clearance)</span>
            </div>
          </div>

          {/* Price Calculation preview */}
          <div className="mt-5 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Original Price
              </span>
              <span className="text-sm font-semibold text-slate-500 line-through">
                ₹{product.sellingPrice}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
                New Clearance Price
              </span>
              <span className="text-xl font-extrabold text-rose-600">
                ₹{calculatedNewPrice}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleApply}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Applying...' : 'Apply Discount'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscountModal;
