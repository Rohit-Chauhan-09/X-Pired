import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ZoneBadge from '../components/ZoneBadge';
import CategoryBadge from '../components/CategoryBadge';
import DiscountModal from '../components/DiscountModal';
import PosterPrintModal from '../components/PosterPrintModal';
import { useAlert } from '../context/AlertContext';
import { 
  Percent, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Printer, 
  MapPin, 
  RefreshCw, 
  TrendingUp,
  AlertOctagon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SmartDiscounter = () => {
  const { showToast } = useAlert();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [applyingAll, setApplyingAll] = useState(false);

  const fetchAtRiskProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const all = res.data || [];
      // Filter products in critical or urgent zones (days <= 7 and not expired)
      const atRisk = all.filter((p) => p.daysRemaining > 0 && p.daysRemaining <= 15);
      setProducts(atRisk);
    } catch (err) {
      console.error('Failed to load at-risk products for smart discounter', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRiskProducts();
  }, []);

  const handleApplySingle = async (p) => {
    try {
      const suggestedPct = p.smartDiscount?.discountPercentage || 30;
      await api.patch(`/products/${p._id}/discount`, {
        discountPercentage: suggestedPct,
      });

      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      showToast(`Applied ${suggestedPct}% clearance discount to ${p.name}!`, 'success');
      fetchAtRiskProducts();
    } catch (err) {
      showToast('Error applying discount', 'error');
    }
  };

  const handleApplyAll = async () => {
    if (!window.confirm(`Apply recommended clearance discounts to all ${products.length} at-risk items?`)) return;

    try {
      setApplyingAll(true);
      for (const p of products) {
        if (!p.isDiscounted && p.smartDiscount?.discountPercentage > 0) {
          await api.patch(`/products/${p._id}/discount`, {
            discountPercentage: p.smartDiscount.discountPercentage,
          });
        }
      }
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      showToast('All recommended clearance discounts applied successfully!', 'success');
      fetchAtRiskProducts();
    } catch (err) {
      showToast('Failed to apply all discounts', 'error');
    } finally {
      setApplyingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Smart Discount Suggester
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              Algorithmic Pricing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic markdown recommendations calculated from remaining lifespan to trigger sales before perishable items expire.
          </p>
        </div>

        {products.length > 0 && (
          <button
            onClick={handleApplyAll}
            disabled={applyingAll}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{applyingAll ? 'Applying...' : 'Apply All Suggested Markdowns'}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
          <p className="text-xs font-semibold">Analyzing shelf lifespan & discount algorithms...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-900 text-base">All Items At Safe Margins</h3>
          <p className="text-xs text-slate-400 mt-1">
            No perishable products currently need clearance discounts. Check back as expiry dates approach.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const smart = p.smartDiscount || {};
            const isAlreadyDiscounted = p.isDiscounted && p.discountPercentage > 0;

            return (
              <div
                key={p._id}
                className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  p.daysRemaining <= 3
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <CategoryBadge category={p.category} size="xs" />
                      <h3 className="font-black text-slate-900 text-base mt-1.5 leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-[11px] font-mono text-slate-400">
                        Batch: {p.batchNumber} • Qty: {p.quantity} {p.unit}
                      </p>
                    </div>
                    <ZoneBadge daysRemaining={p.daysRemaining} />
                  </div>

                  {/* Recommendation Reason Box */}
                  <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50/80 to-rose-50/80 border border-amber-200/60 text-xs">
                    <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Recommended: {smart.discountPercentage || 0}% Clearance</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {smart.reasoning}
                    </p>
                  </div>

                  {/* Before & After Price Box */}
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Original Price
                      </span>
                      <span className="text-sm font-semibold text-slate-500 line-through">
                        ₹{p.sellingPrice}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400" />

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black text-rose-600 block">
                        Clearance Price
                      </span>
                      <span className="text-xl font-black text-rose-600">
                        ₹{smart.suggestedPrice || p.currentPrice}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Located on: <strong className="text-slate-800">{p.shelfLocation?.rack}, {p.shelfLocation?.shelf}</strong></span>
                  </div>
                </div>

                {/* Card Bottom Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleApplySingle(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isAlreadyDiscounted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {isAlreadyDiscounted
                        ? `${p.discountPercentage}% Applied`
                        : `Apply ${smart.discountPercentage}%`}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setModalType('poster');
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition"
                    title="Print Clearance Poster"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <DiscountModal
        product={selectedProduct}
        isOpen={modalType === 'discount'}
        onClose={() => {
          setSelectedProduct(null);
          setModalType(null);
        }}
        onUpdated={fetchAtRiskProducts}
      />

      <PosterPrintModal
        product={selectedProduct}
        storeName="X-Pired Fresh SuperMart"
        isOpen={modalType === 'poster'}
        onClose={() => {
          setSelectedProduct(null);
          setModalType(null);
        }}
      />
    </div>
  );
};

export default SmartDiscounter;
