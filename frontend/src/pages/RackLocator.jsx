import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ZoneBadge from '../components/ZoneBadge';
import CategoryBadge from '../components/CategoryBadge';
import DiscountModal from '../components/DiscountModal';
import SoldModal from '../components/SoldModal';
import PosterPrintModal from '../components/PosterPrintModal';
import { 
  MapPin, 
  Search, 
  Layers, 
  AlertTriangle, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Percent, 
  Printer, 
  ShoppingBag,
  Info
} from 'lucide-react';

const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Shelf 4'];

const RackLocator = () => {
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('highlight');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRack, setSelectedRack] = useState('Rack A');
  const [selectedShelf, setSelectedShelf] = useState('Shelf 1');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalType, setModalType] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      const list = res.data || [];
      setProducts(list);

      // If a product ID was passed in query, automatically select its rack and shelf
      if (highlightedId) {
        const found = list.find((p) => p._id === highlightedId);
        if (found && found.shelfLocation) {
          if (found.shelfLocation.rack) setSelectedRack(found.shelfLocation.rack);
          if (found.shelfLocation.shelf) setSelectedShelf(found.shelfLocation.shelf);
        }
      }
    } catch (err) {
      console.error('Failed to load products for locator', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter items on selected Rack and Shelf
  const itemsOnSelectedShelf = products.filter((p) => {
    const r = p.shelfLocation?.rack || 'Rack A';
    const s = p.shelfLocation?.shelf || 'Shelf 1';
    return r === selectedRack && s === selectedShelf;
  });

  // Calculate highest risk for each rack/shelf combination
  const getShelfStatus = (rack, shelf) => {
    const shelfItems = products.filter(
      (p) => (p.shelfLocation?.rack || 'Rack A') === rack && (p.shelfLocation?.shelf || 'Shelf 1') === shelf
    );
    if (shelfItems.length === 0) return { count: 0, status: 'empty' };

    let hasExpired = false;
    let hasCritical = false;
    let hasUrgent = false;

    shelfItems.forEach((p) => {
      const days = p.daysRemaining;
      if (days <= 0) hasExpired = true;
      else if (days <= 3) hasCritical = true;
      else if (days <= 7) hasUrgent = true;
    });

    if (hasExpired) return { count: shelfItems.length, status: 'expired' };
    if (hasCritical) return { count: shelfItems.length, status: 'critical' };
    if (hasUrgent) return { count: shelfItems.length, status: 'urgent' };
    return { count: shelfItems.length, status: 'safe' };
  };

  // Find matching items from search
  const searchMatches = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Physical Rack & Shelf Locator
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              Feature #6
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual interactive store map. Directs staff to the exact aisle, rack, and shelf level to retrieve expiring items instantly.
          </p>
        </div>

        {/* Quick Item Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search item to pinpoint on rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 shadow-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Search results banner if searching */}
      {searchQuery.trim() && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 mb-2">
            Search Matches ({searchMatches.length} found):
          </h4>
          <div className="flex flex-wrap gap-2">
            {searchMatches.slice(0, 5).map((p) => (
              <button
                key={p._id}
                onClick={() => {
                  setSelectedRack(p.shelfLocation?.rack || 'Rack A');
                  setSelectedShelf(p.shelfLocation?.shelf || 'Shelf 1');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-xs text-slate-800 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-extrabold">{p.name}</span>
                <span className="font-mono text-slate-500">({p.shelfLocation?.rack}, {p.shelfLocation?.shelf})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Visual Layout: Store Grid + Shelf Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Store Layout Racks (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-600" />
                <span>Store Floor Plan & Racks</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click any shelf slot to inspect items resting on it.
              </p>
            </div>

            {/* Status Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" /> Critical / Expired
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Urgent
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe
              </span>
            </div>
          </div>

          {/* Racks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RACKS.map((rack) => (
              <div
                key={rack}
                className={`p-4 rounded-2xl border-2 transition ${
                  selectedRack === rack
                    ? 'border-slate-900 bg-slate-50/70 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-extrabold text-slate-900 text-sm">{rack}</span>
                  <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    4 Shelf Levels
                  </span>
                </div>

                {/* Shelves Vertical Stack */}
                <div className="space-y-2">
                  {SHELVES.map((shelf) => {
                    const shelfData = getShelfStatus(rack, shelf);
                    const isSelected = selectedRack === rack && selectedShelf === shelf;

                    let bgClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                    let badgeClass = 'bg-slate-200 text-slate-700';

                    if (shelfData.status === 'expired' || shelfData.status === 'critical') {
                      bgClass = isSelected
                        ? 'bg-rose-100 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-500'
                        : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100';
                      badgeClass = 'bg-rose-500 text-white font-extrabold animate-pulse';
                    } else if (shelfData.status === 'urgent') {
                      bgClass = isSelected
                        ? 'bg-amber-100 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-500'
                        : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100';
                      badgeClass = 'bg-amber-500 text-white font-bold';
                    } else if (shelfData.status === 'safe') {
                      bgClass = isSelected
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100';
                      badgeClass = 'bg-emerald-500 text-white font-bold';
                    }

                    return (
                      <button
                        key={shelf}
                        type="button"
                        onClick={() => {
                          setSelectedRack(rack);
                          setSelectedShelf(shelf);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${bgClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          <span className="font-bold">{shelf}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {shelfData.count} item(s)
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Shelf Inspection (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 block">
                  Active Inspection Slot
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {selectedRack} • {selectedShelf}
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold font-mono">
                {itemsOnSelectedShelf.length} Batches
              </span>
            </div>

            {itemsOnSelectedShelf.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">This shelf slot is currently empty.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Assign new batches to {selectedRack}, {selectedShelf} from the Add Product form.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {itemsOnSelectedShelf.map((p) => {
                  const days = p.daysRemaining;
                  const isHighlighted = p._id === highlightedId;

                  return (
                    <div
                      key={p._id}
                      className={`p-3.5 rounded-2xl border transition ${
                        isHighlighted
                          ? 'border-rose-500 bg-rose-50/50 shadow-sm'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <CategoryBadge category={p.category} size="xs" />
                            <span className="font-mono text-[11px] text-slate-500">
                              #{p.batchNumber}
                            </span>
                          </div>
                        </div>
                        <ZoneBadge daysRemaining={days} showDays={true} />
                      </div>

                      {p.shelfLocation?.positionNotes && (
                        <p className="text-[11px] text-slate-500 mt-2 bg-white p-1.5 rounded-lg border border-slate-200">
                          📌 Note: {p.shelfLocation.positionNotes}
                        </p>
                      )}

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="font-bold text-slate-700">
                          {p.quantity} {p.unit} •{' '}
                          <span className="text-rose-600 font-extrabold">
                            ₹{p.currentPrice || p.sellingPrice}
                          </span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setActiveProduct(p);
                              setModalType('discount');
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title="Clearance Discount"
                          >
                            <Percent className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveProduct(p);
                              setModalType('poster');
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title="Print Poster"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setActiveProduct(p);
                              setModalType('sold');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="Mark Sold"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Store location maps allow physical picking without wasting time scanning random shelves.
          </div>
        </div>

      </div>

      {/* Modals */}
      <DiscountModal
        product={activeProduct}
        isOpen={modalType === 'discount'}
        onClose={() => {
          setActiveProduct(null);
          setModalType(null);
        }}
        onUpdated={fetchProducts}
      />

      <SoldModal
        product={activeProduct}
        isOpen={modalType === 'sold'}
        onClose={() => {
          setActiveProduct(null);
          setModalType(null);
        }}
        onUpdated={fetchProducts}
      />

      <PosterPrintModal
        product={activeProduct}
        storeName="X-Pired Fresh SuperMart"
        isOpen={modalType === 'poster'}
        onClose={() => {
          setActiveProduct(null);
          setModalType(null);
        }}
      />
    </div>
  );
};

export default RackLocator;
