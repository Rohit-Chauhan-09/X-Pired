import React from 'react';
import { Printer, X, Sparkles, Tag, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

const PosterPrintModal = ({ product, storeName = 'X-Pired Fresh SuperMart', isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  const originalPrice = product.sellingPrice || 0;
  const currentPrice = product.currentPrice || originalPrice;
  const discountPct = product.discountPercentage || 
    (originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  const formattedExpiry = new Date(product.expiryDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto">
      {/* Outer wrapper: no-print controls, print container */}
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Top Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 no-print">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Printer className="w-5 h-5 text-rose-600" />
              <span>Printable Clearance Poster</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ready to print & affix directly to store shelf or display rack.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Poster Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= Printable Poster Card ================= */}
        <div className="printable-poster mt-4 p-8 bg-gradient-to-b from-amber-500/10 via-white to-rose-500/10 border-4 border-dashed border-rose-600 rounded-3xl relative overflow-hidden text-center shadow-lg">
          
          {/* Top Store Header */}
          <div className="border-b-2 border-slate-900 pb-3 mb-6">
            <p className="text-xs font-black tracking-widest uppercase text-slate-500">
              {storeName}
            </p>
            <div className="inline-block bg-rose-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full mt-1">
              ⚡ FLASH CLEARANCE SALE ⚡
            </div>
          </div>

          {/* Discount Burst Badge */}
          <div className="my-2 inline-block">
            <div className="bg-rose-600 text-white font-black text-4xl sm:text-5xl px-6 py-2 rounded-2xl shadow-xl transform -rotate-2 inline-flex items-center gap-2 border-2 border-white">
              <span>{discountPct > 0 ? `${discountPct}% OFF` : 'SPECIAL DEAL'}</span>
            </div>
          </div>

          {/* Product Title */}
          <div className="my-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs font-mono text-slate-500 mt-1">
              Batch: {product.batchNumber} • Net Qty: {product.quantity} {product.unit} Available
            </p>
          </div>

          {/* Price Box */}
          <div className="my-6 bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-around shadow-inner">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider line-through">
                WAS ₹{originalPrice}
              </p>
              <p className="text-xs text-rose-400 font-semibold mt-0.5">
                Save ₹{(originalPrice - currentPrice).toFixed(0)}!
              </p>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                CLEARANCE PRICE
              </p>
              <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                ₹{currentPrice}
              </p>
            </div>
          </div>

          {/* Shelf Location & Expiry Details */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white/80 border border-slate-200 rounded-xl text-left text-xs text-slate-700 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Location</span>
                <span className="font-extrabold text-slate-900">
                  {product.shelfLocation?.rack || 'Rack A'}, {product.shelfLocation?.shelf || 'Shelf 1'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Best Before</span>
                <span className="font-extrabold text-rose-700">
                  {formattedExpiry}
                </span>
              </div>
            </div>
          </div>

          {/* Barcode Simulator / Footer */}
          <div className="border-t-2 border-slate-200 pt-3">
            {/* Visual barcode bars */}
            <div className="flex justify-center items-center gap-0.5 h-8 opacity-80 mb-1">
              {[3,1,4,2,1,5,2,3,1,4,2,1,3,5,1,2,4,1,3,2,5,1,4,2].map((w, idx) => (
                <div key={idx} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
              ))}
            </div>
            <p className="text-[11px] font-mono tracking-widest text-slate-600">
              {product.barcode || `890126201${product.batchNumber?.replace(/\D/g, '') || '9901'}`}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Limited Clearance Stock • Final Sale • Grab before it is gone!
            </p>
          </div>
        </div>

        {/* Bottom Actions (Hidden during print) */}
        <div className="mt-6 flex justify-end gap-3 no-print">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Clearance Poster</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PosterPrintModal;
