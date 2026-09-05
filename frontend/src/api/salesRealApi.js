import apiClient from './client';

export const getProducts = async () => {
  const data = await apiClient.get('/products?include_archived=false');
  return Array.isArray(data) ? data : [];
};

export const getCustomers = async () => {
  const data = await apiClient.get('/customers');
  return Array.isArray(data) ? data : [];
};

export const createQuote = async (payload) => {
  return await apiClient.post('/quotes', payload);
};

export const getQuote = async (quoteId) => {
  return await apiClient.get(`/quotes/${quoteId}`);
};

export const updateQuote = async (quoteId, payload) => {
  return await apiClient.put(`/quotes/${quoteId}`, payload);
};

export const submitQuote = async (quoteId) => {
  return await apiClient.post(`/quotes/${quoteId}/submit`);
};
