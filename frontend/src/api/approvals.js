import apiClient from './client';

export const getPendingApprovals = () => apiClient.get('/approvals/pending');
export const approveQuote = (approvalId, payload = {}) => apiClient.post(`/approvals/${approvalId}/approve`, payload);
export const rejectQuote = (approvalId, payload) => apiClient.post(`/approvals/${approvalId}/reject`, payload);
