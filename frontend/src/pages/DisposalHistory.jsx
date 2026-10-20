import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import { 
  Trash2, 
  Search, 
  FileCheck, 
  Printer, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  RefreshCw, 
  X,
  ExternalLink
} from 'lucide-react';

const DisposalHistory = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ totalCostLoss: 0, totalQuantity: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReason, setSelectedReason] = useState('All');
  const [activeCertificate, setActiveCertificate] = useState(null);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedReason !== 'All') params.reason = selectedReason;

      const res = await api.get('/disposals', { params });
      setRecords(res.data?.records || []);
      setStats({
        totalCostLoss: res.data?.totalCostLoss || 0,
        totalQuantity: res.data?.totalQuantity || 0,
        totalCount: res.data?.totalCount || 0,
      });
    } catch (err) {
      console.error('Failed to load disposal history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposals();
  }, [selectedReason]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDisposals();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Secure Disposal History
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase">
              Feature #12 Audit Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent, tamper-evident audit ledger of all perishable stock safely thrown away, spoiled, or donated.
          </p>
        </div>

        <button
          onClick={fetchDisposals}
          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-400 block">
            Total Disposed Certificates
          </span>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {stats.totalCount} Logs
          </div>
          <p className="text-xs text-slate-500 mt-1">Audited disposal events</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-slate-400 block">
            Quantity Disposed
          </span>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {stats.totalQuantity} Units
          </div>
          <p className="text-xs text-slate-500 mt-1">Total physical stock removed from shelves</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-rose-500 block">
            Total Financial Loss Incurred
          </span>
          <div className="text-3xl font-black text-rose-600 mt-2">
            -₹{stats.totalCostLoss.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Direct inventory write-off value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search certificate #, product, or staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </form>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Reason:</span>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="All">All Disposal Reasons</option>
            <option value="Expired Before Sale">Expired Before Sale</option>
            <option value="Damaged / Spoiled">Damaged / Spoiled</option>
            <option value="Packaging Broken">Packaging Broken</option>
            <option value="Donated To Food Bank">Donated To Food Bank</option>
            <option value="Returned To Supplier">Returned To Supplier</option>
            <option value="Bio-Waste Compost">Bio-Waste Compost</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
            <p className="text-xs font-semibold">Loading secure disposal records...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No disposal records found</p>
            <p className="text-xs text-slate-400 mt-1">Either no items were disposed or search criteria didn't match.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-extrabold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Batch & Rack</th>
                  <th className="py-3 px-3">Qty Disposed</th>
                  <th className="py-3 px-3">Loss Incurred</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Logged By</th>
                  <th className="py-3 px-4 text-right">View Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {rec.disposalCertificateNo}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900">{rec.productName}</div>
                      <div className="mt-0.5">
                        <CategoryBadge category={rec.category} size="xs" />
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-mono text-slate-600">{rec.batchNumber}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-600" />
                        <span>{rec.shelfLocation?.rack || 'Rack'}, {rec.shelfLocation?.shelf || 'Shelf'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">
                      {rec.quantityDisposed} {rec.unit || 'units'}
                    </td>
                    <td className="py-3.5 px-3 font-black text-rose-600">
                      -₹{rec.costLoss?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {rec.reason}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="font-semibold">{rec.disposedByName || 'Store Staff'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveCertificate(rec)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disposal Certificate Inspection Modal */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold">
                <FileCheck className="w-5 h-5" />
                <span className="uppercase tracking-wider text-xs">Official Disposal Audit Record</span>
              </div>
              <button
                onClick={() => setActiveCertificate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-slate-900 rounded-2xl p-6 bg-slate-50/50 space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Disposal Certificate
                </h3>
                <p className="font-mono text-xs text-rose-600 font-bold mt-1">
                  {activeCertificate.disposalCertificateNo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Product</span>
                  <span className="font-extrabold text-slate-800">{activeCertificate.productName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Batch Number</span>
                  <span className="font-mono font-bold text-slate-800">{activeCertificate.batchNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Quantity</span>
                  <span className="font-bold text-slate-800">{activeCertificate.quantityDisposed} {activeCertificate.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Cost Loss</span>
                  <span className="font-black text-rose-600">₹{activeCertificate.costLoss?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Reason</span>
                  <span className="font-bold text-slate-800">{activeCertificate.reason}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Authorized Staff</span>
                  <span className="font-bold text-slate-800">{activeCertificate.disposedByName}</span>
                </div>
              </div>

              {activeCertificate.notes && (
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                  <strong className="block text-slate-800 text-[10px] uppercase font-bold mb-0.5">Notes:</strong>
                  {activeCertificate.notes}
                </div>
              )}

              <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
                Timestamp: {new Date(activeCertificate.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveCertificate(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisposalHistory;
