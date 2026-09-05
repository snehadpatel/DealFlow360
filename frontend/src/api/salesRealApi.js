import apiClient from './client';

// Real backend-backed sales API for the Quotation Builder. These hit the
// FastAPI endpoints (products/customers/quotes) so every number the builder
// shows after Save/Submit is computed by the backend (spec-compliant margin +
// blended-risk routing), not faked in the browser.

export const getProducts = (includeArchived = false) =>
  apiClient.get(`/products${includeArchived ? '?include_archived=true' : ''}`);

export const getCustomers = () => apiClient.get('/customers');

// Create a DRAFT quote. `items` = [{ product_id, quantity, discount_percent }].
export const createQuote = (payload) => apiClient.post('/quotes', payload);

export const getQuote = (quoteId) => apiClient.get(`/quotes/${quoteId}`);

export const updateQuote = (quoteId, payload) => apiClient.put(`/quotes/${quoteId}`, payload);

// Submit a draft for approval — the backend routes it through the spec blended
// risk model and either auto-approves or creates the Manager/Finance chain.
export const submitQuote = (quoteId) => apiClient.post(`/quotes/${quoteId}/submit`, {});
