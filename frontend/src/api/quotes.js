import apiClient from './client';

export const getQuotes = () => apiClient.get('/quotes');
export const getQuoteById = (id) => apiClient.get(`/quotes/${id}`);
export const createQuote = (payload) => apiClient.post('/quotes', payload);
export const updateQuote = (id, payload) => apiClient.put(`/quotes/${id}`, payload);
export const deleteQuote = (id) => apiClient.delete(`/quotes/${id}`);
