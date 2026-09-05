import apiClient from './client';
import { getMockState } from './customerApi';

export const getQuotationById = async (id) => {
  try {
    const res = await apiClient.get(`/portal/quotes/${id}`);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === id);
    if (!quote) {
      throw new Error(`Quotation ${id} not found.`);
    }
    return quote;
  }
};

export const acceptQuotation = async (quotationId) => {
  try {
    const res = await apiClient.post(`/portal/quotes/${quotationId}/accept`);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === quotationId);
    if (quote) {
      quote.status = 'CONFIRMED';
      if (quote.negotiation) {
        quote.negotiation.history.push({
          id: `h-${Date.now()}`,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          author: 'Customer accepted quotation',
          details: 'Quotation confirmed & accepted by customer',
          status: 'APPROVED',
        });
      }
    }
    return { success: true, quotationId, status: 'CONFIRMED' };
  }
};
