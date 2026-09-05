import apiClient from './client';

export const getCustomerDashboard = async () => {
  try {
    const [quotes, invoices, negotiations] = await Promise.all([
      apiClient.get('/quotes').catch(() => []),
      apiClient.get('/invoices').catch(() => []),
      apiClient.get('/negotiations').catch(() => []),
    ]);

    const quoteList = Array.isArray(quotes) ? quotes : [];
    const invList = Array.isArray(invoices) ? invoices : [];
    const negList = Array.isArray(negotiations) ? negotiations : [];

    const activeQuotations = quoteList.filter(q => ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'NEGOTIATION'].includes(q.status)).length;
    const pendingNegotiations = negList.filter(n => ['OPEN', 'COUNTER_OFFERED'].includes(n.status)).length;
    const approvedQuotations = quoteList.filter(q => q.status === 'APPROVED' || q.status === 'CONFIRMED').length;
    const outstandingInvoices = invList.filter(inv => inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE').length;

    return {
      summary: { activeQuotations, pendingNegotiations, approvedQuotations, outstandingInvoices },
      recentQuotations: quoteList.slice(0, 8).map(q => ({
        id: q.id,
        customer: q.customer_name || 'Titanium Pharma',
        salesRep: q.rep_name || 'Sales Rep',
        createdDate: q.created_at ? q.created_at.split('T')[0] : '',
        validUntil: q.expires_at ? q.expires_at.split('T')[0] : (q.created_at ? q.created_at.split('T')[0] : ''),
        currency: q.currency || 'INR',
        subtotal: q.subtotal || 0,
        totalDiscount: q.discount_total || 0,
        taxTotal: q.tax_total || 0,
        totalAmount: q.total || 0,
        status: q.status || 'DRAFT',
        items: q.lines || [],
        negotiation: null,
      })),
      recentInvoices: invList.slice(0, 5),
      recentNegotiations: negList.slice(0, 5),
    };
  } catch (err) {
    console.error('Failed to fetch customer dashboard:', err);
    return { summary: { activeQuotations: 0, pendingNegotiations: 0, approvedQuotations: 0, outstandingInvoices: 0 }, recentQuotations: [] };
  }
};

export const getCustomerQuotations = async () => {
  try {
    const quotes = await apiClient.get('/quotes');
    const list = Array.isArray(quotes) ? quotes : [];
    return list.map(q => ({
      id: q.id,
      customer: q.customer_name || 'Titanium Pharma',
      salesRep: q.rep_name || 'Sales Rep',
      createdDate: q.created_at ? q.created_at.split('T')[0] : '',
      validUntil: q.expires_at ? q.expires_at.split('T')[0] : (q.created_at ? q.created_at.split('T')[0] : ''),
      currency: q.currency || 'INR',
      subtotal: q.subtotal || 0,
      totalDiscount: q.discount_total || 0,
      taxTotal: q.tax_total || 0,
      totalAmount: q.total || 0,
      discountPercent: q.subtotal > 0 ? ((q.discount_total || 0) / q.subtotal * 100).toFixed(1) : 0,
      status: q.status || 'DRAFT',
      items: (q.lines || []).map((l, i) => ({
        id: i + 1,
        product: l.product_name || 'Product',
        description: '',
        quantity: l.quantity || 0,
        unitPrice: l.unit_price || 0,
        discount: l.discount_percent || 0,
        tax: l.tax_rate || 18,
        total: l.line_total || 0,
      })),
      negotiation: null,
    }));
  } catch (err) {
    console.error('Failed to fetch customer quotations:', err);
    return [];
  }
};

export const getNegotiations = async () => {
  try {
    const negs = await apiClient.get('/negotiations');
    const list = Array.isArray(negs) ? negs : [];
    return list.map(n => ({
      id: n.id,
      quotationId: n.quotation_id,
      customerName: n.customer_name || 'Titanium Pharma',
      repName: n.rep_name || 'Sales Rep',
      status: n.status || 'OPEN',
      requestedDiscount: n.requested_discount || 0,
      counterDiscount: n.counter_discount || null,
      finalDiscount: n.final_discount || null,
      quotationTotal: n.quotation_total || 0,
      lastMessage: n.last_message || 'Negotiation initiated',
      messagesCount: n.messages_count || 0,
      createdAt: n.created_at ? n.created_at.split('T')[0] : '',
      updatedAt: n.updated_at ? n.updated_at.split('T')[0] : '',
    }));
  } catch (err) {
    console.error('Failed to fetch customer negotiations:', err);
    return [];
  }
};

export const getNegotiationMessages = async (negId) => {
  try {
    const res = await apiClient.get(`/negotiations/${negId}/messages`);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error(`Failed to fetch messages for negotiation ${negId}:`, err);
    return [];
  }
};

export const sendNegotiationMessage = async (negId, message, discountProposed = null) => {
  try {
    return await apiClient.post(`/negotiations/${negId}/messages`, {
      message,
      discount_proposed: discountProposed,
    });
  } catch (err) {
    console.error(`Failed to send message on negotiation ${negId}:`, err);
    throw err;
  }
};

export const acceptNegotiation = async (negId, discount = null) => {
  try {
    return await apiClient.post(`/negotiations/${negId}/accept`, { discount });
  } catch (err) {
    console.error(`Failed to accept negotiation ${negId}:`, err);
    throw err;
  }
};

export const getInvoices = async () => {
  try {
    const invoices = await apiClient.get('/invoices');
    const list = Array.isArray(invoices) ? invoices : [];
    return list.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number || '',
      quoteId: inv.order_id || '',
      date: inv.created_at ? inv.created_at.split('T')[0] : (inv.invoice_date ? inv.invoice_date.split('T')[0] : ''),
      dueDate: inv.due_date || '',
      amount: inv.amount || 0,
      amountPaid: inv.amount_paid || 0,
      outstandingAmount: inv.outstanding_amount || 0,
      status: inv.status || 'SENT',
    }));
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
    return [];
  }
};

export const payInvoice = async (invoiceId, paymentData) => {
  try {
    return await apiClient.post(`/invoices/${invoiceId}/pay`, paymentData);
  } catch (err) {
    console.error(`Failed to record payment for invoice ${invoiceId}:`, err);
    throw err;
  }
};

export const getSubscriptions = async () => {
  try {
    const subs = await apiClient.get('/subscriptions');
    const list = Array.isArray(subs) ? subs : [];
    return list.map(s => ({
      id: s.id,
      planId: s.plan_id,
      planName: s.plan_name || 'Enterprise Service License',
      billingCycle: s.billing_cycle || s.plan_billing_cycle || 'Monthly',
      nextRenewal: s.next_billing_date || '',
      startDate: s.start_date || '',
      amount: s.total_amount || s.plan_price || 0,
      quantity: s.quantity || 1,
      status: s.status || 'ACTIVE',
    }));
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
    return [];
  }
};

export const pauseSubscription = async (subId) => {
  try {
    return await apiClient.post(`/subscriptions/${subId}/pause`);
  } catch (err) {
    console.error(`Failed to pause subscription ${subId}:`, err);
    throw err;
  }
};

export const resumeSubscription = async (subId) => {
  try {
    return await apiClient.post(`/subscriptions/${subId}/resume`);
  } catch (err) {
    console.error(`Failed to resume subscription ${subId}:`, err);
    throw err;
  }
};

export const cancelSubscription = async (subId) => {
  try {
    return await apiClient.post(`/subscriptions/${subId}/cancel`);
  } catch (err) {
    console.error(`Failed to cancel subscription ${subId}:`, err);
    throw err;
  }
};

export const getCustomerProfile = async () => {
  try {
    const user = await apiClient.get('/auth/me');
    let customerData = {};
    if (user && user.customer_id) {
      try {
        customerData = await apiClient.get(`/customers/${user.customer_id}`);
      } catch { /* fallback */ }
    }
    return {
      customerId: user.customer_id,
      companyName: customerData.name || user.name || 'Titanium Pharma',
      contactName: user.name || 'ABC Corp Buyer',
      email: user.email || customerData.email || 'buyer@abccorp.com',
      phone: customerData.phone || '+91 98765 43210',
      address: customerData.address_billing || 'Tower 8, Suite 434, Tech Hub Park, Bengaluru',
      shippingAddress: customerData.address_shipping || customerData.address_billing || 'Warehouse 4B, Electronic City, Bengaluru',
      taxId: customerData.tax_id || 'GSTIN-29AAACA1234A1Z5',
      tier: customerData.tier || 'GOLD',
      creditLimit: customerData.credit_limit || 5000000,
    };
  } catch (err) {
    console.error('Failed to fetch customer profile:', err);
    return { companyName: '', contactName: '', email: '', phone: '', address: '', taxId: '' };
  }
};

export const updateCustomerProfile = async (profileData) => {
  try {
    const user = await apiClient.get('/auth/me');
    if (user && user.customer_id) {
      const res = await apiClient.put(`/customers/${user.customer_id}`, {
        name: profileData.companyName,
        email: profileData.email,
        phone: profileData.phone,
        address_billing: profileData.address,
        address_shipping: profileData.shippingAddress || profileData.address,
        tax_id: profileData.taxId,
      });
      return res;
    }
    throw new Error('No linked customer ID found on user.');
  } catch (err) {
    console.error('Failed to update customer profile:', err);
    throw err;
  }
};

