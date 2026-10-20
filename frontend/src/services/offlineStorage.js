const STORAGE_KEY = 'xpired_offline_queue';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse offline queue', err);
    return [];
  }
};

export const saveOfflineProduct = (product) => {
  const queue = getOfflineQueue();
  const queueItem = {
    ...product,
    clientTempId: 'offline_' + Date.now(),
    offlineCreatedAt: new Date().toISOString(),
  };
  queue.push(queueItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const syncOfflineQueue = async (api) => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  try {
    const response = await api.post('/products/sync-offline', { products: queue });
    clearOfflineQueue();
    return { success: true, count: response.data.count, data: response.data };
  } catch (error) {
    console.error('Failed to sync offline queue', error);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};
