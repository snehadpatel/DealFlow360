import apiClient from './client';

export const getDealHealthStats = () => apiClient.get('/dashboard/stats');
export const getStalledDeals = () => apiClient.get('/dashboard/stalled');
export const getDiscountAnomalies = () => apiClient.get('/dashboard/anomalies');
