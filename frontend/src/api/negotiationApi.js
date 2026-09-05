import apiClient from './client';

export const getNegotiationHistory = async (quotationId) => {
  try {
    const negotiations = await apiClient.get('/negotiations', { params: { quotation_id: quotationId } });
    const list = Array.isArray(negotiations) ? negotiations : [];
    if (list.length === 0) return [];

    const neg = list[0];
    // Get messages for this negotiation
    try {
      const messages = await apiClient.get(`/negotiations/${neg.id}/messages`);
      const msgList = Array.isArray(messages) ? messages : [];
      return msgList.map(m => ({
        id: m.id,
        date: m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        author: m.sender_role === 'CUSTOMER' ? 'Customer' : 'Sales Team',
        details: m.message || '',
        status: neg.status || 'OPEN',
      }));
    } catch {
      return [];
    }
  } catch {
    return [];
  }
};

export const submitNegotiation = async (payload) => {
  try {
    const res = await apiClient.post('/negotiations', {
      quotation_id: payload.quotation_id,
      customer_id: payload.customer_id,
      rep_id: payload.rep_id,
      requested_discount: payload.requested_discount,
    });

    // Also add a message
    if (res && res.id && payload.message) {
      await apiClient.post(`/negotiations/${res.id}/messages`, {
        message: payload.message,
        discount_proposed: payload.requested_discount,
      }).catch(() => {});
    }

    return {
      success: true,
      quotation_id: payload.quotation_id,
      status: 'OPEN',
      message: 'Your negotiation request has been sent to the sales team.',
    };
  } catch (err) {
    console.error('Failed to submit negotiation:', err);
    throw err;
  }
};

export const acceptCounterOffer = async (quotationId) => {
  try {
    // Find the negotiation for this quotation
    const negotiations = await apiClient.get('/negotiations', { params: { quotation_id: quotationId } });
    const list = Array.isArray(negotiations) ? negotiations : [];
    if (list.length > 0) {
      await apiClient.post(`/negotiations/${list[0].id}/accept`);
    }
    return { success: true, quotationId, status: 'ACCEPTED' };
  } catch (err) {
    console.error('Failed to accept counter offer:', err);
    throw err;
  }
};

export const continueNegotiation = async (quotationId) => {
  try {
    const negotiations = await apiClient.get('/negotiations', { params: { quotation_id: quotationId } });
    const list = Array.isArray(negotiations) ? negotiations : [];
    if (list.length > 0) {
      await apiClient.post(`/negotiations/${list[0].id}/messages`, {
        message: 'Customer requested further negotiation',
        discount_proposed: null,
      });
    }
    return { success: true, quotationId, status: 'OPEN' };
  } catch (err) {
    console.error('Failed to continue negotiation:', err);
    throw err;
  }
};
