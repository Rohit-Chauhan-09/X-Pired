import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import api from '../services/api';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Mail, 
  LogOut, 
  Bell, 
  AlertOctagon, 
  UserCheck, 
  ShieldAlert,
  ExternalLink 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isOwner } = useAuth();
  const { isOnline, offlineCount, manualSync, isSyncing, showToast } = useAlert();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModal, setEmailModal] = useState(null);

  const handleTriggerEmailScan = async () => {
    try {
      setSendingEmail(true);
      const res = await api.post('/settings/trigger-email');
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        if (res.data.previewUrl) {
          setEmailModal(res.data);
        }
      } else {
        showToast(res.data.message || 'No items to alert or email failed', 'info');
      }
    } catch (err) {
      showToast('Error sending email alert: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
        <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <AlertOctagon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  X-Pired
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Time’s Up. Toss It Out
              </p>
            </div>
          </div>

          {/* Center / Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Feature 9: Online / Offline status badge */}
            <div className="flex items-center">
              {isOnline ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold animate-pulse">
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>Offline Mode</span>
                </div>
              )}
            </div>

            {/* Offline sync queue button */}
            {offlineCount > 0 && (
              <button
                onClick={manualSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                title="Sync offline queued products"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync {offlineCount} Queued</span>
              </button>
            )}

            {/* Feature 1: Auto-Email scan trigger button */}
            <button
              onClick={handleTriggerEmailScan}
              disabled={sendingEmail}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              title="Trigger automated email alert scan using Nodemailer"
            >
              <Mail className={`w-3.5 h-3.5 text-rose-500 ${sendingEmail ? 'animate-bounce' : ''}`} />
              <span>{sendingEmail ? 'Scanning & Sending...' : 'Scan & Send Email Alert'}</span>
            </button>

            {/* User Profile & Role Badge */}
            <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'Retail User'}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                      isOwner
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {user?.role === 'owner' ? 'Store Owner' : 'Store Staff'}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal for Email Preview if Ethereal test mail was generated */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Email Alert Dispatched!
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {emailModal.message}
            </p>
            {emailModal.previewUrl && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl mb-4">
                <p className="text-xs text-indigo-800 font-medium mb-2">
                  Ethereal Test Mailer generated a real rendered inbox preview:
                </p>
                <a
                  href={emailModal.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Open Rendered Email Preview <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            <button
              onClick={() => setEmailModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
