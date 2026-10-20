import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ZoneBadge from '../components/ZoneBadge';
import CategoryBadge from '../components/CategoryBadge';
import DiscountModal from '../components/DiscountModal';
import SoldModal from '../components/SoldModal';
import DisposalModal from '../components/DisposalModal';
import PosterPrintModal from '../components/PosterPrintModal';
import { 
  Flame, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Trash2, 
  ShoppingBag, 
  Percent, 
  Printer, 
  MapPin, 
  AlertOctagon, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [overstockList, setOverstockList] = useState([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState(null); // 'discount', 'sold', 'dispose', 'poster'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resSummary, resOverstock] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/products/overstock-warnings'),
      ]);
      setData(resSummary.data);
      setOverstockList(resOverstock.data || []);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openActionModal = (product, type) => {
    setSelectedProduct(product);
    setModalType(type);
  };

  const closeActionModal = () => {
    setSelectedProduct(null);
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading X-Pired Dashboard & FEFO Monitor...</p>
        </div>
      </div>
    );
  }

  const { zones, financials, counts, criticalItems, trendChart } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <AlertOctagon className="w-96 h-96 text-white transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Proactive Expiry Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            X-Pired Monitoring Hub
          </h1>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            Continuous background monitoring of perishable lifespan. Direct staff to exact physical shelf locations, apply dynamic clearance discounts, and prevent store product waste before it happens.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => navigate('/add-product')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <span>+ Add Perishable Stock</span>
            </button>
            <button
              onClick={() => navigate('/locator')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Open Shelf Locator</span>
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2"
            >
              <span>Staff Daily Checklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature 2: Color-Coded Dashboard Zones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <span>Color-Coded Expiry Zones</span>
            <span className="text-xs text-slate-400 font-normal">(Click card to filter inventory)</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {counts?.activeBatches || 0} Total Active Batches
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Critical Zone */}
          <div
            onClick={() => navigate('/inventory?zone=critical')}
            className="cursor-pointer bg-white p-4 rounded-2xl border-2 border-rose-200 hover:border-rose-500 hover:shadow-lg transition group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <Flame className="w-5 h-5" />
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600">
              {zones?.critical || 0}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">Critical Zone</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Expiring in ≤ 3 Days</p>
          </div>

          {/* Urgent Zone */}
          <div
            onClick={() => navigate('/inventory?zone=urgent')}
            className="cursor-pointer bg-white p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-500 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              {zones?.urgent || 0}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">Urgent Zone</div>
            <p className="text-[11px] text-slate-500 mt-0.5">4 to 7 Days Left</p>
          </div>

          {/* Attention Zone */}
          <div
            onClick={() => navigate('/inventory?zone=attention')}
            className="cursor-pointer bg-white p-4 rounded-2xl border-2 border-yellow-200 hover:border-yellow-500 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-yellow-100 text-yellow-700">
                <Clock className="w-5 h-5" />
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-yellow-600">
              {zones?.attention || 0}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">Attention Zone</div>
            <p className="text-[11px] text-slate-500 mt-0.5">8 to 15 Days Left</p>
          </div>

          {/* Safe Zone */}
          <div
            onClick={() => navigate('/inventory?zone=safe')}
            className="cursor-pointer bg-white p-4 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">
              {zones?.safe || 0}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">Safe Zone</div>
            <p className="text-[11px] text-slate-500 mt-0.5">&gt; 15 Days Left</p>
          </div>

          {/* Expired Zone */}
          <div
            onClick={() => navigate('/inventory?zone=expired')}
            className="cursor-pointer bg-white p-4 rounded-2xl border-2 border-slate-300 hover:border-slate-800 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                <Trash2 className="w-5 h-5" />
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {zones?.expired || 0}
            </div>
            <div className="text-xs font-bold text-slate-800 mt-1">Expired / Toss</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Disposal Required</p>
          </div>
        </div>
      </div>

      {/* Feature 10: Financial Loss Prevented Tracker Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Financial Loss Prevented */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-100">
              Financial Loss Prevented
            </span>
            <span className="p-2 rounded-xl bg-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black mt-3">
            ₹{financials?.totalLossPrevented?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Capital saved from total loss by selling items before expiry.
          </p>
          <div className="mt-4 pt-3 border-t border-emerald-400/40 flex justify-between text-xs font-semibold">
            <span>Revenue Recovered:</span>
            <span>₹{financials?.totalRevenueRecovered?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Metric 2: At-Risk Capital */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
              Current At-Risk Inventory Value
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Flame className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 mt-3">
            ₹{financials?.criticalRiskValue?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Value of perishable batches currently in Critical/Expired zones.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-600">
            <span>Total Stock Value:</span>
            <span>₹{financials?.totalInventoryValue?.toLocaleString() || 0}</span>
          </div>
        </div>

        {/* Metric 3: Expired Loss Incurred */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
              Disposed Loss Write-Off
            </span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Trash2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-800 mt-3">
            ₹{financials?.totalDisposalLoss?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recorded in Secure Disposal History audit certificates.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-emerald-600">
            <span>Net System Benefit:</span>
            <span>+₹{financials?.netSavingsBenefit?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Feature 7: Predictive Overstock Warning Alert Banner (if any) */}
      {overstockList.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Predictive Overstock Warnings ({overstockList.length} items flagged)</span>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
              High Quantity vs Expiry Velocity
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overstockList.slice(0, 2).map(({ product, risk }) => (
              <div key={product._id} className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{product.name}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                      {risk.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{risk.recommendation}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">
                    📍 {product.shelfLocation?.rack}, {product.shelfLocation?.shelf}
                  </span>
                  <button
                    onClick={() => openActionModal(product, 'discount')}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
                  >
                    <span>Apply Clearance Discount</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 4: FEFO Batch-Wise Table (First Expire First Out) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base">
                FEFO Action Priority: Earliest Expiring Batches
              </h3>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-black uppercase">
                First Expire First Out
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Items sorted strictly by expiry countdown so oldest inventory is prioritized and liquidated first.
            </p>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl transition"
          >
            <span>View All Inventory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4">Product & Category</th>
                <th className="py-3 px-3">Batch #</th>
                <th className="py-3 px-3">Shelf Location</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Zone Status</th>
                <th className="py-3 px-3">Stock & Price</th>
                <th className="py-3 px-4 text-right">Proactive Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {criticalItems && criticalItems.length > 0 ? (
                criticalItems.map((prod) => {
                  const now = new Date();
                  const diff = new Date(prod.expiryDate).setHours(23, 59, 59, 999) - now.getTime();
                  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={prod._id} className="hover:bg-slate-50/80 transition">
                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{prod.name}</div>
                        <div className="mt-1">
                          <CategoryBadge category={prod.category} size="xs" />
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-3.5 px-3 font-mono text-slate-600">
                        {prod.batchNumber}
                      </td>

                      {/* Physical Shelf Location (Feature 6) */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-rose-600" />
                          <span>{prod.shelfLocation?.rack || 'Rack'}, {prod.shelfLocation?.shelf || 'Shelf'}</span>
                        </div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {new Date(prod.expiryDate).toLocaleDateString()}
                      </td>

                      {/* Zone Badge */}
                      <td className="py-3.5 px-3">
                        <ZoneBadge daysRemaining={days} />
                      </td>

                      {/* Stock & Price */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800">
                          {prod.quantity} {prod.unit}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {prod.isDiscounted ? (
                            <span className="font-bold text-rose-600">
                              ₹{prod.currentPrice} <span className="line-through text-slate-400">₹{prod.sellingPrice}</span>
                            </span>
                          ) : (
                            <span>₹{prod.sellingPrice}</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Apply Discount */}
                          <button
                            onClick={() => openActionModal(prod, 'discount')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title="Apply Smart Clearance Discount"
                          >
                            <Percent className="w-4 h-4" />
                          </button>

                          {/* Print Poster */}
                          <button
                            onClick={() => openActionModal(prod, 'poster')}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition"
                            title="Print Clearance Poster"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Mark Sold (Prevented loss) */}
                          <button
                            onClick={() => openActionModal(prod, 'sold')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                            title="Mark Sold (Record Loss Prevented)"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>

                          {/* Dispose */}
                          <button
                            onClick={() => openActionModal(prod, 'dispose')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Log Disposal to Audit History"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No critical items right now! Store inventory is safe and fresh.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Trend Visualizer Chart */}
      {trendChart && trendChart.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                7-Day Money Saved vs Expired Money Lost
              </h3>
              <p className="text-xs text-slate-500">
                Visual proof of money saved by proactive FEFO alerts and early clearance discounts.
              </p>
            </div>
            <button
              onClick={() => navigate('/financials')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Open Full Tracker →
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendChart}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(val, name, item) => {
                    const key = item?.dataKey || name;
                    const label = (key === 'lossPrevented' || name === 'Money Saved' || name?.includes('Saved'))
                      ? 'Money Saved'
                      : 'Money Lost';
                    return [`₹${val}`, label];
                  }}
                />
                <Legend />
                <Bar dataKey="lossPrevented" name="Money Saved" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="lossIncurred" name="Money Lost" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modals */}
      <DiscountModal
        product={selectedProduct}
        isOpen={modalType === 'discount'}
        onClose={closeActionModal}
        onUpdated={fetchDashboardData}
      />

      <SoldModal
        product={selectedProduct}
        isOpen={modalType === 'sold'}
        onClose={closeActionModal}
        onUpdated={fetchDashboardData}
      />

      <DisposalModal
        product={selectedProduct}
        isOpen={modalType === 'dispose'}
        onClose={closeActionModal}
        onUpdated={fetchDashboardData}
      />

      <PosterPrintModal
        product={selectedProduct}
        storeName="X-Pired Fresh SuperMart"
        isOpen={modalType === 'poster'}
        onClose={closeActionModal}
      />
    </div>
  );
};

export default Dashboard;
