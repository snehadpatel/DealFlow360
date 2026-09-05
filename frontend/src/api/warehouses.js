import apiClient from './client';

export const getWarehouses = () => apiClient.get('/warehouses');
export const getStockLevels = (productId) => apiClient.get(`/warehouses/stock/${productId}`);
export const getRecommendedSplit = (quoteId) => apiClient.get(`/warehouses/split-recommendation/${quoteId}`);
export const confirmWarehouseSplit = (quoteId, payload) => apiClient.post(`/warehouses/confirm-split/${quoteId}`, payload);
