import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAlert } from '../context/AlertContext';
import { 
  SlidersHorizontal, 
  Mail, 
  Palette, 
  Store, 
  Save, 
  RefreshCw, 
  Check, 
  Send,
  ExternalLink
} from 'lucide-react';

const SettingsPage = () => {
  const { showToast, fetchCategorySettings } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [mailResult, setMailResult] = useState(null);

  const [settings, setSettings] = useState({
    storeName: 'X-Pired Fresh SuperMart',
    alertEmail: 'owner@xpired.com',
    enableEmailAlerts: true,
    urgentDaysThreshold: 7,
    criticalDaysThreshold: 3,
    attentionDaysThreshold: 15,
    posterFooterNote: 'Clearance item – valid while stocks last. No exchange on perishable goods.',
    categories: [],
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleCategoryChange = (index, field, value) => {
    const updated = [...settings.categories];
    updated[index] = { ...updated[index], [field]: value };
    setSettings((prev) => ({ ...prev, categories: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', settings);
      showToast('Settings & Category colors saved successfully!', 'success');
      fetchCategorySettings();
    } catch (err) {
      showToast('Failed to save settings: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setSendingTestMail(true);
      const res = await api.post('/settings/trigger-email', {
        toEmail: settings.alertEmail,
      });
      setMailResult(res.data);
      if (res.data?.success) {
        showToast('Nodemailer alert dispatched!', 'success');
      } else {
        showToast(res.data?.message || 'Email scan finished', 'info');
      }
    } catch (err) {
      showToast('Email error: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSendingTestMail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Store & Alert Settings
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] uppercase">
              Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated email notifications (Nodemailer), category custom alert colors, and threshold rules.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Auto-Email Alerts Configuration (Feature 1) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <Mail className="w-5 h-5" />
              <span>Feature #1: Auto-Email Alerts (Nodemailer)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailAlerts}
                onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Recipient Email Address
              </label>
              <input
                type="email"
                required
                value={settings.alertEmail}
                onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Trigger Email When Remaining Lifespan ≤ (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.urgentDaysThreshold}
                onChange={(e) => setSettings({ ...settings, urgentDaysThreshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Test Nodemailer dispatch button */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <div className="text-xs font-extrabold text-slate-800">
                Test Nodemailer Email Delivery Now
              </div>
              <p className="text-[11px] text-slate-500">
                Immediately runs the background expiry scan and dispatches a test alert email to {settings.alertEmail}.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={sendingTestMail}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTestMail ? 'Dispatching...' : 'Dispatch Test Alert'}</span>
            </button>
          </div>

          {mailResult && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
              <p className="font-bold">{mailResult.message}</p>
              {mailResult.previewUrl && (
                <a
                  href={mailResult.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Click to open test email inbox preview <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Category-Wise Custom Alerts in Different Colours (Feature 11) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-base border-b border-slate-100 pb-3">
            <Palette className="w-5 h-5" />
            <span>Feature #11: Category-Wise Custom Alerts In Different Colours</span>
          </div>
          <p className="text-xs text-slate-500">
            Customize alert colors and warning day thresholds for each specific product category for rapid visual identification.
          </p>

          <div className="space-y-3">
            {settings.categories?.map((cat, idx) => (
              <div
                key={cat.name}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={cat.color}
                    onChange={(e) => handleCategoryChange(idx, 'color', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    title="Pick Category Accent Color"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block">
                      {cat.name}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold"
                      style={{ color: cat.color }}
                    >
                      {cat.color}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="text-[11px] font-bold text-slate-500">Warning Alert:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={cat.warningDays}
                      onChange={(e) => handleCategoryChange(idx, 'warningDays', Number(e.target.value))}
                      className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                    />
                    <span className="text-[10px] text-slate-400">days</span>
                  </div>

                  {/* Live preview badge */}
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold border"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      borderColor: `${cat.color}40`,
                    }}
                  >
                    Preview Badge
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Store Particulars */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Store className="w-5 h-5 text-rose-600" />
            <span>Store Particulars & Clearance Flyer Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Store Name (Printed on Posters)
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Clearance Poster Footer Disclaimer
              </label>
              <input
                type="text"
                value={settings.posterFooterNote}
                onChange={(e) => setSettings({ ...settings, posterFooterNote: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
