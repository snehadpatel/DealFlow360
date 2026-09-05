import apiClient from './client';

export const getUpsellRecommendations = (quotePayload) => apiClient.post('/ai/upsell', quotePayload);
export const getAnomalyNarrative = (dealData) => apiClient.post('/ai/anomaly-narrative', dealData);
