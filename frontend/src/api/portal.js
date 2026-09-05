import apiClient from './client';

export const getPortalQuote = (tokenOrId) => apiClient.get(`/portal/quotes/${tokenOrId}`);
export const submitCounterOffer = (tokenOrId, payload) => apiClient.post(`/portal/quotes/${tokenOrId}/counter`, payload);
export const confirmQuotePortal = (tokenOrId) => apiClient.post(`/portal/quotes/${tokenOrId}/confirm`);
