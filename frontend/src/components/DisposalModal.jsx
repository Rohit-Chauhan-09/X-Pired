import React, { useState } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { Trash2, AlertTriangle, Check, X } from 'lucide-react';

const DisposalModal = ({ product, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !product) return null;

  const { showToast } = useAlert();
  const [qtyDisposed, setQtyDisposed] = useState(product.quantity);
  const [reason, setReason] = useState('Expired Before Sale');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const costLoss = (product.costPrice || 0) * Number(qtyDisposed);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (qtyDisposed <= 0 || qtyDisposed > product.quantity) {
      showToast(`Please enter a quantity between 1 and ${product.quantity}`, 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/products/${product._id}/dispose`, {
        quantityDisposed: Number(qtyDisposed),
        reason,
        notes,
      });

      showToast(res.data.message || 'Disposal recorded securely in history audit.', 'info');
      onUpdated();
      onClose();
    } catch (err) {
      showToast('Error recording disposal: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
            <Trash2 className="w-5 h-5" />
            <span>Secure Disposal History Log</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-lg">{product.name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Batch: {product.batchNumber} • Current Stock: {product.quantity} {product.unit}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Quantity to Dispose ({product.unit})
            </label>
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={qtyDisposed}
              onChange={(e) => setQtyDisposed(Math.min(product.quantity, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 text-base focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Disposal Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            >
              <option value="Expired Before Sale">Expired Before Sale</option>
              <option value="Damaged / Spoiled">Damaged / Spoiled</option>
              <option value="Packaging Broken">Packaging Broken</option>
              <option value="Donated To Food Bank">Donated To Food Bank</option>
              <option value="Returned To Supplier">Returned To Supplier</option>
              <option value="Bio-Waste Compost">Bio-Waste Compost</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Staff Audit Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., pulled from Rack B shelf 2, verified seal broken..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Cost Loss Warning Box */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-800 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Financial Loss Incurred:
              </span>
              <span className="font-extrabold text-rose-700 text-base">
                -₹{costLoss.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-rose-600 leading-tight">
              A permanent digital disposal certificate will be generated in your audit history.
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
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{submitting ? 'Logging...' : 'Confirm Disposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisposalModal;
