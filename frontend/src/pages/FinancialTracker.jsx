import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import { 
  TrendingUp, 
  Trash2, 
  ShoppingBag, 
  IndianRupee, 
  PieChart as PieIcon, 
  BarChart3, 
  RefreshCw, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell 
} from 'recharts';

const FinancialTracker = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load financial tracker metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Calculating financial metrics & loss prevention stats...</p>
        </div>
      </div>
    );
  }

  const { financials, trendChart, recentPreventedSales, categoryBreakdown } = data || {};
  const totalPrevented = financials?.totalLossPrevented || 0;
  const totalLost = financials?.totalDisposalLoss || 0;
  const totalHandled = totalPrevented + totalLost;
  const preventionRate = totalHandled > 0 ? Math.round((totalPrevented / totalHandled) * 100) : 100;

  const COLORS = ['#0284c7', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#059669', '#0891b2', '#16a34a'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Financial Loss Prevented Tracker
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
              Feature #10
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks total money saved by selling perishable items on time using FEFO prioritization and clearance markdowns rather than tossing them away.
          </p>
        </div>

        <button
          onClick={fetchFinancials}
          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Financials</span>
        </button>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
              Total Loss Prevented
            </span>
            <span className="p-2 rounded-xl bg-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </span>
          </div>
          <div className="text-3xl font-black mt-3">
            ₹{totalPrevented.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Capital cost saved from total write-off.
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Revenue Recovered
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">
            ₹{financials?.totalRevenueRecovered?.toLocaleString() || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cash generated from clearance sales.
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Expired Stock Loss
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Trash2 className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-3">
            ₹{totalLost.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total money lost from expired stock.
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Waste Prevention Ratio
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-3">
            {preventionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Efficiency of stock liquidated before expiry.
          </p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Money Saved vs Money Lost (7-Day Overview)
              </h3>
              <p className="text-xs text-slate-500">
                Daily comparison showing money saved by selling early versus expired stock lost.
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-72 w-full">
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

        {/* Category Breakdown (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              Active Value by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Current inventory valuation under proactive tracking.
            </p>

            <div className="space-y-3">
              {categoryBreakdown && categoryBreakdown.slice(0, 5).map((cat, idx) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{cat.category}</span>
                    <span className="font-extrabold text-slate-900">₹{cat.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: COLORS[idx % COLORS.length],
                        width: `${Math.min(100, Math.round((cat.value / (financials?.totalInventoryValue || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Smart monitoring prevents inventory capital decay before product expiration.
          </div>
        </div>
      </div>

      {/* Recent Prevented Losses Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-base">
            Recent Loss Prevention Transactions (Saved from Disposal)
          </h3>
          <p className="text-xs text-slate-500">
            Audit log of items marked as sold at closing or under clearance discount.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-3">Batch #</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Qty Sold</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Capital Saved</th>
                <th className="py-3 px-3">Revenue Recovered</th>
                <th className="py-3 px-4 text-right">Sold By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPreventedSales && recentPreventedSales.length > 0 ? (
                recentPreventedSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {sale.productName}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {sale.batchNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <CategoryBadge category={sale.category} size="xs" />
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      {sale.quantitySold} {sale.unit}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800">₹{sale.soldPrice}</span>
                      {sale.discountPercentage > 0 && (
                        <span className="text-[10px] text-rose-500 font-bold ml-1">
                          ({sale.discountPercentage}% off)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-black text-emerald-600">
                      +₹{sale.lossPrevented?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      ₹{sale.revenueRecovered?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {sale.soldByName || 'Store Staff'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No sales recorded yet. Mark items sold at closing time or during clearance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialTracker;
