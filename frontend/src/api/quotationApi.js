import apiClient from './client';

export const getQuotationById = async (id) => {
  try {
    const res = await apiClient.get(`/quotes/${id}`);
    const q = res || {};

    let negotiationData = q.negotiation || null;
    if (!negotiationData) {
      try {
        const negs = await apiClient.get('/negotiations', { params: { quotation_id: id } });
        const list = Array.isArray(negs) ? negs : [];
        if (list.length > 0) {
          const neg = list[0];
          let messages = [];
          try {
            messages = await apiClient.get(`/negotiations/${neg.id}/messages`);
          } catch {
            messages = [];
          }
          const msgList = Array.isArray(messages) ? messages : [];
          const history = msgList.map(m => ({
            id: m.id,
            date: m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            author: m.sender_role === 'CUSTOMER' ? 'Customer' : 'Sales Team',
            details: m.message || (m.discount_proposed ? `Proposed discount: ${m.discount_proposed}%` : 'Negotiation note'),
            status: neg.status || 'OPEN',
          }));

          const reqDisc = neg.requested_discount || (q.subtotal > 0 ? Number(((q.discount_total || 0) / q.subtotal * 100).toFixed(1)) : 0);
          const appDisc = neg.counter_discount || neg.requested_discount || 0;
          const repMsg = msgList.filter(m => m.sender_role !== 'CUSTOMER').slice(-1)[0]?.message || 'Revised discount proposal from sales representative.';

          negotiationData = {
            id: neg.id,
            status: neg.status === 'COUNTER_OFFERED' ? 'COUNTER_OFFER' : neg.status,
            requestedDiscount: reqDisc,
            approvedDiscount: appDisc,
            message: msgList.filter(m => m.sender_role === 'CUSTOMER')[0]?.message || '',
            history,
            counterOffer: (neg.status === 'COUNTER_OFFERED' || neg.status === 'COUNTER_OFFER' || neg.counter_discount) ? {
              requestedDiscount: reqDisc,
              approvedDiscount: appDisc,
              updatedTotal: q.subtotal ? Math.round(q.subtotal * (1 - appDisc / 100) * 1.18) : q.total,
              salesMessage: repMsg,
            } : null,
          };
        }
      } catch (negErr) {
        console.warn('Could not fetch negotiation for quote:', negErr);
      }
    }

    return {
      ...q,
      id: q.id,
      customer: q.customer_name || 'Enterprise Customer',
      salesRep: q.rep_name || 'Sales Representative',
      createdDate: q.created_at ? q.created_at.split('T')[0] : '',
      validUntil: q.expires_at ? q.expires_at.split('T')[0] : '',
      subtotal: q.subtotal || 0,
      totalDiscount: q.discount_total || 0,
      taxTotal: q.tax_total || 0,
      totalAmount: q.total || 0,
      discountPercent: q.subtotal > 0 ? Number(((q.discount_total || 0) / q.subtotal * 100).toFixed(1)) : 0,
      items: (q.lines || []).map((l, idx) => ({
        id: idx + 1,
        product: l.product_name || `Product ${idx + 1}`,
        description: l.category || 'Product',
        quantity: l.quantity || 1,
        unitPrice: l.unit_price || 0,
        discount: l.discount_percent || 0,
        tax: l.tax_rate || 18,
        total: l.line_total || 0,
      })),
      negotiation: negotiationData,
    };
  } catch (err) {
    console.error(`Failed to fetch quote ${id} from DB:`, err);
    throw err;
  }
};

export const acceptQuotation = async (quotationId) => {
  try {
    const res = await apiClient.post(`/quotes/${quotationId}/confirm`);
    return res;
  } catch (err) {
    console.error(`Failed to accept quotation ${quotationId} in DB:`, err);
    throw err;
  }
};

