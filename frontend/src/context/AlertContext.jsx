import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { getOfflineQueue, syncOfflineQueue } from '../services/offlineStorage';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored! Ready to sync offline queue.', 'success');
      autoSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Operating Offline. Any added products will be queued securely!', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch category settings for dynamic category colors
  const fetchCategorySettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.warn('Could not load categories:', err.message);
    }
  };

  useEffect(() => {
    fetchCategorySettings();
  }, []);

  const refreshOfflineCount = () => {
    setOfflineCount(getOfflineQueue().length);
  };

  const autoSync = async () => {
    if (getOfflineQueue().length === 0) return;
    setIsSyncing(true);
    const result = await syncOfflineQueue(api);
    setIsSyncing(false);
    refreshOfflineCount();
    if (result.success && result.count > 0) {
      showToast(`Synced ${result.count} offline product(s) to database!`, 'success');
    }
  };

  const manualSync = async () => {
    setIsSyncing(true);
    const result = await syncOfflineQueue(api);
    setIsSyncing(false);
    refreshOfflineCount();
    if (result.success) {
      showToast(`Synchronized ${result.count} queued item(s) successfully!`, 'success');
    } else {
      showToast(`Sync failed: ${result.error}`, 'error');
    }
    return result;
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper to get category color
  const getCategoryColor = (catName) => {
    const found = categories.find((c) => c.name.toLowerCase() === (catName || '').toLowerCase());
    return found ? found.color : '#64748b';
  };

  return (
    <AlertContext.Provider
      value={{
        isOnline,
        offlineCount,
        refreshOfflineCount,
        manualSync,
        isSyncing,
        toast,
        showToast,
        categories,
        getCategoryColor,
        fetchCategorySettings,
      }}
    >
      {children}
      {/* Global Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 border text-sm font-medium animate-bounce-subtle bg-slate-900 text-white border-slate-700">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-400'
                : toast.type === 'warning'
                ? 'bg-amber-400'
                : toast.type === 'error'
                ? 'bg-rose-500'
                : 'bg-blue-400'
            }`}
          />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);
