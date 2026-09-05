import apiClient from './client';
import { getMockState } from './customerApi';

export const getNegotiationHistory = async (quotationId) => {
  try {
    const res = await apiClient.get(`/portal/negotiations/${quotationId}/history`);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === quotationId);
    return quote?.negotiation?.history || [];
  }
};

export const submitNegotiation = async (payload) => {
  // payload: { quotation_id, requested_discount, message }
  try {
    const res = await apiClient.post('/negotiations', payload);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === payload.quotation_id);

    if (!quote) {
      throw new Error(`Quotation ${payload.quotation_id} not found.`);
    }

    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Update quote status and negotiation object
    quote.status = 'NEGOTIATION';
    const newHistoryItem = {
      id: `h-${Date.now()}`,
      date: todayStr,
      author: `Customer requested ${payload.requested_discount}% discount`,
      details: `Reason: ${payload.message}`,
      status: 'PENDING',
    };

    if (!quote.negotiation) {
      quote.negotiation = {
        status: 'PENDING',
        requestedDiscount: payload.requested_discount,
        approvedDiscount: null,
        message: payload.message,
        counterOffer: null,
        rejectionReason: null,
        history: [newHistoryItem],
      };
    } else {
      quote.negotiation.status = 'PENDING';
      quote.negotiation.requestedDiscount = payload.requested_discount;
      quote.negotiation.message = payload.message;
      quote.negotiation.counterOffer = null;
      quote.negotiation.history.push(newHistoryItem);
    }

    return {
      success: true,
      quotation_id: payload.quotation_id,
      status: 'PENDING',
      message: 'Your negotiation request has been sent to the sales team for review.',
      negotiation: quote.negotiation,
    };
  }
};

export const acceptCounterOffer = async (quotationId) => {
  try {
    const res = await apiClient.post(`/portal/negotiations/${quotationId}/accept-counter`);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === quotationId);

    if (quote && quote.negotiation && quote.negotiation.counterOffer) {
      const approvedDiscount = quote.negotiation.counterOffer.approvedDiscount;
      quote.status = 'APPROVED';
      quote.discountPercent = approvedDiscount;
      quote.negotiation.status = 'APPROVED';
      quote.negotiation.approvedDiscount = approvedDiscount;
      
      // recalculate totals
      const discountFactor = 1 - approvedDiscount / 100;
      quote.totalAmount = Math.round(quote.subtotal * discountFactor);
      quote.totalDiscount = quote.subtotal - quote.totalAmount;

      quote.negotiation.history.push({
        id: `h-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        author: 'Customer accepted counter offer',
        details: `Accepted revised discount of ${approvedDiscount}%`,
        status: 'APPROVED',
      });
    }

    return { success: true, quotationId, status: 'APPROVED' };
  }
};

export const continueNegotiation = async (quotationId) => {
  try {
    const res = await apiClient.post(`/portal/negotiations/${quotationId}/continue`);
    return res;
  } catch {
    const mock = getMockState();
    const quote = mock.quotations.find((q) => q.id === quotationId);

    if (quote && quote.negotiation) {
      quote.negotiation.counterOffer = null;
      quote.negotiation.status = 'PENDING';
      quote.negotiation.history.push({
        id: `h-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        author: 'Customer requested further negotiation',
        details: 'Submitted for further sales discussion',
        status: 'PENDING',
      });
    }

    return { success: true, quotationId, status: 'PENDING' };
  }
};
