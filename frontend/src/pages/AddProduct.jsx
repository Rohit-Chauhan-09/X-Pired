import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { saveOfflineProduct } from '../services/offlineStorage';
import { 
  PlusCircle, 
  WifiOff, 
  MapPin, 
  Calendar, 
  Barcode, 
  Package, 
  IndianRupee, 
  Check, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AddProduct = () => {
  const navigate = useNavigate();
  const { isOnline, refreshOfflineCount, showToast } = useAlert();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Dairy & Eggs',
    batchNumber: `B-${Date.now().toString().slice(-4)}`,
    barcode: '',
    expiryDate: '',
    manufacturingDate: new Date().toISOString().split('T')[0],
    quantity: 10,
    unit: 'units',
    costPrice: '',
    sellingPrice: '',
    averageDailySales: 3,
    shelfLocation: {
      aisle: 'Aisle 1',
      rack: 'Rack A',
      shelf: 'Shelf 1',
      positionNotes: '',
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const generateBarcode = () => {
    const randomCode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);
    setFormData((prev) => ({ ...prev, barcode: randomCode }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.expiryDate || !formData.costPrice || !formData.sellingPrice) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      // Feature 9: Offline Form Submission Handler
      if (!isOnline) {
        saveOfflineProduct(formData);
        refreshOfflineCount();
        showToast('📶 Saved to Offline Queue! Will auto-sync when online.', 'info');
        navigate('/inventory');
        return;
      }

      // Online submission
      await api.post('/products', formData);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });

      showToast('Product added to proactive FEFO monitoring!', 'success');
      navigate('/inventory');
    } catch (err) {
      showToast('Error saving product: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {!isOnline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>Offline Mode Active • Entries will be saved to local queue</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <PlusCircle className="w-6 h-6" />
            <h1 className="text-xl font-black text-slate-900">
              Add Perishable Product Batch
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Manual data entry for tracking expiry date, batch number, and physical shelf coordinates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Product Information */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <span>1. Item Particulars</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Amul Gold Full Cream Milk 500ml"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                >
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
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Batch Number * (For FEFO Ordering)
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  required
                  placeholder="e.g. B-AML-204"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Barcode / SKU (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={generateBarcode}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline"
                  >
                    Generate Random Barcode
                  </button>
                </div>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="barcode"
                    placeholder="Scan or enter code"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Expiry & Shelf Location */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>2. Expiry Countdown & Physical Shelf Location</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Exact Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  required
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  name="manufacturingDate"
                  value={formData.manufacturingDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Physical Shelf Coordinates */}
              <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>Physical Shelf Location Coordinates (Rack/Shelf Locator)</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Aisle</label>
                    <select
                      name="shelfLocation.aisle"
                      value={formData.shelfLocation.aisle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Aisle 1">Aisle 1 (Dairy & Bakery)</option>
                      <option value="Aisle 2">Aisle 2 (Meat & Frozen)</option>
                      <option value="Aisle 3">Aisle 3 (Beverages & Snacks)</option>
                      <option value="Aisle 4">Aisle 4 (General & OTC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Rack</label>
                    <select
                      name="shelfLocation.rack"
                      value={formData.shelfLocation.rack}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Rack A">Rack A</option>
                      <option value="Rack B">Rack B</option>
                      <option value="Rack C">Rack C</option>
                      <option value="Rack D">Rack D</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Shelf Level</label>
                    <select
                      name="shelfLocation.shelf"
                      value={formData.shelfLocation.shelf}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="Shelf 1">Shelf 1 (Top Level)</option>
                      <option value="Shelf 2">Shelf 2 (Eye Level)</option>
                      <option value="Shelf 3">Shelf 3 (Mid Level)</option>
                      <option value="Shelf 4">Shelf 4 (Bottom Level)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Specific Shelf Notes / Chiller Placement (Optional)
                  </label>
                  <input
                    type="text"
                    name="shelfLocation.positionNotes"
                    placeholder="e.g. Front left row of chiller, next to butter tray"
                    value={formData.shelfLocation.positionNotes}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Quantity, Pricing & Predictive Overstock Velocity */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-slate-500" />
              <span>3. Stock, Financial Valuation & Sales Velocity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity Received *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="units">units</option>
                    <option value="packs">packs</option>
                    <option value="litres">litres</option>
                    <option value="kg">kg</option>
                    <option value="bottles">bottles</option>
                    <option value="cans">cans</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Cost Price (₹) * (For Loss Prevention)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  name="costPrice"
                  required
                  placeholder="e.g. 50"
                  value={formData.costPrice}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  name="sellingPrice"
                  required
                  placeholder="e.g. 70"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-amber-900 block">
                      Estimated Daily Sales Velocity (Units / Day)
                    </label>
                    <p className="text-[11px] text-amber-700">
                      Used by Predictive Overstock Warning to calculate if stock will clear before expiry.
                    </p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    name="averageDailySales"
                    value={formData.averageDailySales}
                    onChange={handleChange}
                    className="w-20 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Saving...'
                  : !isOnline
                  ? 'Save to Offline Queue'
                  : 'Add to Proactive Tracker'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
