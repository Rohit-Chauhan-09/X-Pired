import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ZoneBadge from '../components/ZoneBadge';
import CategoryBadge from '../components/CategoryBadge';
import DiscountModal from '../components/DiscountModal';
import SoldModal from '../components/SoldModal';
import DisposalModal from '../components/DisposalModal';
import PosterPrintModal from '../components/PosterPrintModal';
import { useAlert } from '../context/AlertContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Percent, 
  Printer, 
  ShoppingBag, 
  Trash2, 
  AlertTriangle, 
  PlusCircle, 
  RefreshCw,
  Flame,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

const Inventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useAlert();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedZone, setSelectedZone] = useState(searchParams.get('zone') || 'All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRack, setSelectedRack] = useState('All');

  // Modals
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalType, setModalType] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedZone !== 'All') params.zone = selectedZone;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedRack !== 'All') params.rack = selectedRack;

      const res = await api.get('/products', { params });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products', err);
      showToast('Could not load inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedZone, selectedCategory, selectedRack]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const openAction = (product, type) => {
    setActiveProduct(product);
    setModalType(type);
  };

  const closeAction = () => {
    setActiveProduct(null);
    setModalType(null);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from inventory?`)) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product removed successfully', 'info');
      fetchProducts();
    } catch (err) {
      showToast('Failed to remove product', 'error');
    }
  };

  const zoneFilters = ['All', 'critical', 'urgent', 'attention', 'safe', 'expired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              FEFO Inventory Master
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              First Expire First Out
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritizes oldest batches automatically so store staff sells or clears expiring stock before newer shipments.
          </p>
        </div>

        <button
          onClick={() => navigate('/add-product')}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, batch number, barcode, rack or shelf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedZone('All');
              setSelectedCategory('All');
              setSelectedRack('All');
              fetchProducts();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200"
            title="Reset Filters"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Zone Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-400 mr-1">Zone:</span>
            {zoneFilters.map((z) => (
              <button
                key={z}
                onClick={() => {
                  setSelectedZone(z);
                  setSearchParams(z !== 'All' ? { zone: z } : {});
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition ${
                  selectedZone === z
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* Category & Rack Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Dairy & Eggs">Dairy & Eggs</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Meat & Poultry">Meat & Poultry</option>
              <option value="Beverages & Juices">Beverages & Juices</option>
              <option value="Snacks & Confectionery">Snacks & Confectionery</option>
              <option value="Medicines & Health">Medicines & Health</option>
              <option value="Canned & Packaged Foods">Canned & Packaged Foods</option>
              <option value="Fruits & Vegetables">Fruits & Vegetables</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={selectedRack}
              onChange={(e) => setSelectedRack(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            >
              <option value="All">All Racks</option>
              <option value="Rack A">Rack A</option>
              <option value="Rack B">Rack B</option>
              <option value="Rack C">Rack C</option>
              <option value="Rack D">Rack D</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
            <p className="text-xs font-semibold">Updating batch catalog...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="font-bold text-slate-700">No products found matching filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding new products.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-3">Batch & Barcode</th>
                  <th className="py-3 px-3">Shelf Locator</th>
                  <th className="py-3 px-3">Expiry Date</th>
                  <th className="py-3 px-3">Lifespan Zone</th>
                  <th className="py-3 px-3">Available Qty</th>
                  <th className="py-3 px-3">Pricing</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((prod) => {
                  const days = prod.daysRemaining;
                  const isOverstocked = prod.overstockRisk?.isOverstocked;

                  return (
                    <tr key={prod._id} className="hover:bg-slate-50 transition">
                      {/* Item */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <CategoryBadge category={prod.category} size="xs" />
                          {isOverstocked && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1 cursor-help"
                              title={prod.overstockRisk?.recommendation}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>Overstock Risk</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Batch & Barcode */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-slate-800">
                          {prod.batchNumber}
                        </div>
                        {prod.barcode && (
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {prod.barcode}
                          </div>
                        )}
                      </td>

                      {/* Physical Shelf Locator */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => navigate(`/locator?highlight=${prod._id}`)}
                          className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1 rounded-xl transition"
                          title="Locate in store 3D floor grid"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                          <span>
                            {prod.shelfLocation?.rack || 'Rack'}, {prod.shelfLocation?.shelf || 'Shelf'}
                          </span>
                        </button>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {new Date(prod.expiryDate).toLocaleDateString()}
                      </td>

                      {/* Zone Status */}
                      <td className="py-3.5 px-3">
                        <ZoneBadge daysRemaining={days} />
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {prod.quantity} <span className="text-xs font-normal text-slate-500">{prod.unit}</span>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-3">
                        {prod.isDiscounted ? (
                          <div>
                            <span className="font-black text-rose-600 text-sm">
                              ₹{prod.currentPrice}
                            </span>
                            <span className="line-through text-slate-400 ml-1.5 text-xs">
                              ₹{prod.sellingPrice}
                            </span>
                            <span className="block text-[10px] text-rose-500 font-bold">
                              {prod.discountPercentage}% Clearance
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="font-black text-slate-800 text-sm">
                              ₹{prod.sellingPrice}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              Cost: ₹{prod.costPrice}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openAction(prod, 'discount')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title="Apply Smart Discount"
                          >
                            <Percent className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAction(prod, 'poster')}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title="Print Promotional Poster"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAction(prod, 'sold')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="Mark as Sold (Prevented Loss)"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAction(prod, 'dispose')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Log Disposal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <DiscountModal
        product={activeProduct}
        isOpen={modalType === 'discount'}
        onClose={closeAction}
        onUpdated={fetchProducts}
      />

      <SoldModal
        product={activeProduct}
        isOpen={modalType === 'sold'}
        onClose={closeAction}
        onUpdated={fetchProducts}
      />

      <DisposalModal
        product={activeProduct}
        isOpen={modalType === 'dispose'}
        onClose={closeAction}
        onUpdated={fetchProducts}
      />

      <PosterPrintModal
        product={activeProduct}
        storeName="X-Pired Fresh SuperMart"
        isOpen={modalType === 'poster'}
        onClose={closeAction}
      />
    </div>
  );
};

export default Inventory;
