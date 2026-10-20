import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import PosterPrintModal from '../components/PosterPrintModal';
import { 
  Printer, 
  Tag, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Search, 
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

const ClearancePosters = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState('');

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const all = res.data || [];
      // Show products that are either marked as discounted OR expiring soon (within 7 days)
      const eligible = all.filter((p) => p.quantity > 0 && (p.isDiscounted || p.daysRemaining <= 7));
      setProducts(eligible);
    } catch (err) {
      console.error('Failed to load products for clearance posters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Printable Clearance Posters
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              Feature #8
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and print eye-catching shelf-talkers and clearance flyers with prices, barcodes, and rack locations.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items to print posters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2 bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
          <p className="text-xs font-semibold">Loading printable clearance items...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
          <Printer className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-extrabold text-slate-900 text-base">No Items Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Apply clearance discounts to items in the FEFO Inventory or Smart Discounter module first.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => {
            const originalPrice = prod.sellingPrice || 0;
            const currentPrice = prod.currentPrice || originalPrice;
            const discountPct =
              prod.discountPercentage ||
              (originalPrice > currentPrice
                ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
                : 25);

            return (
              <div
                key={prod._id}
                className="bg-white rounded-3xl border-2 border-dashed border-rose-300 p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Poster Card Preview */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      CLEARANCE POSTER
                    </span>
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {discountPct}% OFF
                    </span>
                  </div>

                  <CategoryBadge category={prod.category} size="xs" />

                  <h3 className="font-black text-slate-900 text-lg mt-2 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">
                    Batch: {prod.batchNumber}
                  </p>

                  {/* Price Comparison */}
                  <div className="my-4 p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block line-through">
                        WAS ₹{originalPrice}
                      </span>
                      <span className="text-xs text-rose-400 font-bold">
                        SAVE ₹{(originalPrice - currentPrice).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-black text-amber-400 block">
                        NOW ONLY
                      </span>
                      <span className="text-2xl font-black text-white">
                        ₹{currentPrice}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {prod.shelfLocation?.rack || 'Rack A'}, {prod.shelfLocation?.shelf || 'Shelf 1'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Best Before: <strong>{new Date(prod.expiryDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {prod.quantity} {prod.unit} left
                  </span>
                  <button
                    onClick={() => setSelectedProduct(prod)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Poster</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Poster Print Modal with window.print() */}
      <PosterPrintModal
        product={selectedProduct}
        storeName="X-Pired Fresh SuperMart"
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default ClearancePosters;
