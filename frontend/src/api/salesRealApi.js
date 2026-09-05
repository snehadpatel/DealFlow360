import { mockDb } from '../lib/mockDatabase';

export const getProducts = async () => await mockDb.getAll('products');

export const getCustomers = async () => await mockDb.getAll('customers');

const computeTotals = (items, products) => {
  let subtotal = 0;
  let discount_total = 0;
  let tax_total = 0;
  let totalCost = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.product_id);
    if (!product) continue;
    
    const gross = (product.price || 0) * item.quantity;
    const discount = gross * (item.discount_percent / 100);
    const net = gross - discount;
    const tax = net * ((product.tax_rate || 0) / 100);
    
    subtotal += gross;
    discount_total += discount;
    tax_total += tax;
    totalCost += (product.cost || (product.price * 0.7)) * item.quantity;
  }
  
  const total = subtotal - discount_total + tax_total;
  const net = subtotal - discount_total;
  const margin_percent = net > 0 ? ((net - totalCost) / net) * 100 : 0;
  
  return { subtotal, discount_total, tax_total, total, margin_percent };
};

export const createQuote = async (payload) => {
  const products = await mockDb.getAll('products');
  const totals = computeTotals(payload.items, products);
  
  const newQuote = {
    ...payload,
    ...totals,
    status: 'DRAFT',
    blended_risk: 0,
    risk_level: 'LOW',
    approvals: []
  };
  return await mockDb.create('quotes', newQuote);
};

export const getQuote = async (quoteId) => await mockDb.getById('quotes', quoteId);

export const updateQuote = async (quoteId, payload) => {
  const quote = await mockDb.getById('quotes', quoteId);
  if (!quote) throw new Error('Quote not found');
  
  const products = await mockDb.getAll('products');
  const totals = computeTotals(payload.items, products);
  
  return await mockDb.update('quotes', quoteId, { ...payload, ...totals });
};

export const submitQuote = async (quoteId) => {
  const quote = await mockDb.getById('quotes', quoteId);
  if (!quote) throw new Error('Quote not found');
  
  // Mock blended risk logic
  let riskLevel = 'LOW';
  let riskScore = 0;
  let status = 'APPROVED';
  let approvals = [];
  
  const hasHighDiscount = quote.items.some(i => i.discount_percent > 20);
  if (quote.margin_percent < 15 || hasHighDiscount) {
    riskLevel = quote.margin_percent < 10 ? 'CRITICAL' : 'HIGH';
    riskScore = quote.margin_percent < 10 ? 80 : 45;
    status = 'PENDING_APPROVAL';
    approvals = [
      { approver_role: 'Sales Manager', status: 'PENDING' },
      ...(riskLevel === 'CRITICAL' ? [{ approver_role: 'Finance', status: 'PENDING' }] : [])
    ];
  }
  
  return await mockDb.update('quotes', quoteId, { 
    status, 
    risk_level: riskLevel, 
    blended_risk: riskScore,
    approvals 
  });
};
