import apiClient from './client';

export const getSalesDashboard = async () => {
  try {
    const quotes = await apiClient.get('/quotes');
    const list = Array.isArray(quotes) ? quotes : [];

    const wonQuotes = list.filter(q => q.status === 'CONFIRMED');
    const wonValue = wonQuotes.reduce((acc, q) => acc + (q.total || 0), 0);
    const pendingApproval = list.filter(q => q.status === 'PENDING_APPROVAL').length;
    const drafts = list.filter(q => q.status === 'DRAFT').length;
    const negotiation = list.filter(q => q.status === 'NEGOTIATION').length;
    const avgMargin = list.length > 0
      ? parseFloat((list.reduce((acc, q) => acc + (q.margin_percent || 0), 0) / list.length).toFixed(1))
      : 0;

    return {
      quotes: list.length,
      pendingApproval,
      wonDeals: wonValue,
      drafts,
      negotiation,
      avgMargin,
    };
  } catch (err) {
    console.error('Failed to fetch sales dashboard:', err);
    return { quotes: 0, pendingApproval: 0, wonDeals: 0, drafts: 0, negotiation: 0, avgMargin: 0 };
  }
};

export const getSalesPipeline = async () => {
  try {
    const quotes = await apiClient.get('/quotes');
    const list = Array.isArray(quotes) ? quotes : [];
    return list.map(q => {
      let stage = 'QUOTED';
      const st = (q.status || '').toUpperCase();
      if (st === 'PENDING_APPROVAL' || st === 'APPROVED') {
        stage = 'APPROVAL';
      } else if (st === 'NEGOTIATION' || st === 'COUNTER_OFFER') {
        stage = 'NEGOTIATION';
      } else if (st === 'CONFIRMED' || st === 'COMPLETED') {
        stage = 'WON';
      } else if (st === 'DRAFT') {
        stage = 'QUOTED';
      }

      return {
        id: q.id,
        stage: stage,
        rawStatus: q.status || 'DRAFT',
        customer: q.customer_name || q.customer_id || 'Enterprise Customer',
        value: q.total || 0,
        margin: q.margin_percent || 0,
      };
    });
  } catch (err) {
    console.error('Failed to fetch sales pipeline:', err);
    return [];
  }
};

// --- CRUD Operations for Quotations ---

export const getMyQuotations = async (filters = {}) => {
  try {
    const quotes = await apiClient.get('/quotes');
    let result = Array.isArray(quotes) ? quotes : [];

    // Map backend fields to frontend expected format
    result = result.map(q => ({
      id: q.id,
      customer: q.customer_name || 'Unknown',
      customerId: q.customer_id,
      amount: q.total || 0,
      margin: q.margin_percent || 0,
      status: q.status || 'DRAFT',
      stage: q.status || 'DRAFT',
      date: q.created_at ? q.created_at.split('T')[0] : '',
      rep: q.rep_name || 'Sales Rep',
      itemsCount: q.lines?.length || 0,
    }));

    if (filters.status && filters.status !== 'ALL') {
      if (filters.status === 'PENDING' || filters.status === 'PENDING_APPROVAL') {
        result = result.filter(q => q.status === 'PENDING_APPROVAL' || q.status === 'PENDING');
      } else {
        result = result.filter(q => q.status === filters.status);
      }
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(q =>
        String(q.id).toLowerCase().includes(s) ||
        q.customer.toLowerCase().includes(s)
      );
    }

    return result;
  } catch (err) {
    console.error('Failed to fetch quotations:', err);
    return [];
  }
};

export const getQuotationById = async (id) => {
  return await apiClient.get(`/quotes/${id}`);
};

export const createQuotation = async (data) => {
  return await apiClient.post('/quotes', data);
};

export const updateQuotation = async (id, data) => {
  return await apiClient.put(`/quotes/${id}`, data);
};

export const deleteQuotation = async (id) => {
  return await apiClient.delete(`/quotes/${id}`);
};

// --- Products & Catalog ---

export const getProductCatalog = async () => {
  try {
    const data = await apiClient.get('/products?include_archived=false');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
};

export const getProductById = async (id) => {
  return await apiClient.get(`/products/${id}`);
};

export const createProduct = async (data) => {
  return await apiClient.post('/products', data);
};

export const updateProduct = async (id, data) => {
  return await apiClient.put(`/products/${id}`, data);
};

export const deleteProduct = async (id) => {
  return await apiClient.delete(`/products/${id}`);
};

// AI Recommendation — calls real backend AI endpoint
export const getAiRecommendation = async (cartItems) => {
  try {
    const res = await apiClient.post('/ai/upsell', {
      items: cartItems.map(i => ({ product_id: i.id, name: i.name, category: i.category })),
    });
    return res;
  } catch {
    return null;
  }
};
