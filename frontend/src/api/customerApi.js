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

export const getInvoices = async () => {
  try {
    const invoices = await apiClient.get('/invoices');
    const list = Array.isArray(invoices) ? invoices : [];
    return list.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number || '',
      quoteId: inv.order_id || '',
      date: inv.created_at ? inv.created_at.split('T')[0] : '',
      dueDate: inv.due_date || '',
      amount: inv.amount || 0,
      status: inv.status || 'PENDING',
    }));
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
    return [];
  }
};

export const getSubscriptions = async () => {
  try {
    const subs = await apiClient.get('/subscriptions');
    const list = Array.isArray(subs) ? subs : [];
    return list.map(s => ({
      id: s.id,
      planName: s.plan_name || 'Subscription Plan',
      billingCycle: s.billing_cycle || s.plan_billing_cycle || 'Monthly',
      nextRenewal: s.next_billing_date || '',
      amount: s.total_amount || s.plan_price || 0,
      status: s.status || 'ACTIVE',
    }));
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
    return [];
  }
};

export const getCustomerProfile = async () => {
  try {
    const user = await apiClient.get('/auth/me');
    return {
      companyName: user.name || 'Titanium Pharma',
      contactName: user.name || 'ABC Corp Buyer',
      email: user.email || 'buyer@abccorp.com',
      phone: '+1 (555) 234-5678',
      address: 'Tower 8, Suite 434, Tech Hub Park',
      taxId: 'TAX-88492019',
    };
  } catch (err) {
    console.error('Failed to fetch customer profile:', err);
    return { companyName: '', contactName: '', email: '', phone: '', address: '', taxId: '' };
  }
};

export const getMockState = () => ({
  quotations: [],
  invoices: [],
  subscriptions: [],
  profile: {},
});
