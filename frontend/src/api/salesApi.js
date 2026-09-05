import { mockDb, getDb } from '../lib/mockDatabase';

export const getSalesDashboard = async () => {
  const db = getDb();
  
  // Calculate dynamic dashboard stats based on quotations
  const quotes = db.quotations || [];
  const wonQuotes = quotes.filter(q => q.status === 'CONFIRMED' || q.stage === 'WON');
  const wonValue = wonQuotes.reduce((acc, q) => acc + q.amount, 0);
  
  const pendingApproval = quotes.filter(q => q.stage === 'APPROVAL').length;
  const drafts = quotes.filter(q => q.status === 'DRAFT').length;
  const negotiation = quotes.filter(q => q.stage === 'NEGOTIATION').length;
  
  const avgMargin = quotes.length > 0 
    ? parseFloat((quotes.reduce((acc, q) => acc + q.margin, 0) / quotes.length).toFixed(1))
    : 0;

  return {
    quotes: quotes.length,
    pendingApproval,
    wonDeals: wonValue,
    drafts,
    negotiation,
    avgMargin,
  };
};

export const getSalesPipeline = async () => {
  // Convert quotations into pipeline format
  const quotes = await mockDb.getAll('quotations');
  return quotes.map(q => ({
    id: q.id,
    stage: q.stage || 'LEAD',
    customer: q.customer,
    value: q.amount
  }));
};

// --- CRUD Operations for Quotations ---

export const getMyQuotations = async (filters = {}) => {
  const allQuotes = await mockDb.getAll('quotations');
  let result = [...allQuotes];
  
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(q => q.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(q => q.id.toLowerCase().includes(s) || q.customer.toLowerCase().includes(s));
  }
  
  return result;
};

export const getQuotationById = async (id) => {
  return await mockDb.getById('quotations', id);
};

export const createQuotation = async (data) => {
  const db = getDb();
  const customer = db.customers?.find(c => c.id === data.customerId);
  const newQuote = {
    ...data,
    customer: customer ? customer.name : (data.customer || 'Unknown'),
    status: 'DRAFT',
    stage: 'QUOTED',
    date: new Date().toISOString().split('T')[0]
  };
  return await mockDb.create('quotations', newQuote);
};

export const updateQuotation = async (id, data) => {
  return await mockDb.update('quotations', id, data);
};

export const deleteQuotation = async (id) => {
  return await mockDb.remove('quotations', id);
};

// --- Products & Catalog ---

export const getProductCatalog = async () => {
  return await mockDb.getAll('products');
};

export const getProductById = async (id) => {
  return await mockDb.getById('products', id);
};

export const createProduct = async (data) => {
  return await mockDb.create('products', data);
};

export const updateProduct = async (id, data) => {
  return await mockDb.update('products', id, data);
};

export const deleteProduct = async (id) => {
  return await mockDb.remove('products', id);
};


// AI Mock Service
export const getAiRecommendation = async (cartItems) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const products = await mockDb.getAll('products');
  
  const hasHardware = cartItems.some(i => i.category === 'Hardware');
  
  if (hasHardware) {
    return {
      product: products.find(p => p.id === 'P-302'), // Premium Support
      addedRevenue: 75000,
      addedMarginPercent: 3.2,
      reason: 'Frequently purchased by customers buying hardware in the Enterprise tier.',
    };
  }
  return null;
};
