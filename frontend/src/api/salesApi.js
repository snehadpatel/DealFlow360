// Mock Data for Sales Rep Workspace

const mockDashboard = {
  quotes: 24,
  pendingApproval: 5,
  wonDeals: 4250000,
  drafts: 8,
  negotiation: 3,
  avgMargin: 18.4,
};

const mockPipeline = [
  { id: 'L-101', stage: 'LEAD', customer: 'ABC Corp', value: 2000000 },
  { id: 'L-102', stage: 'LEAD', customer: 'Sigma Co', value: 1500000 },
  { id: 'Q-1025', stage: 'QUOTED', customer: 'XYZ Ltd', value: 3200000 },
  { id: 'Q-1033', stage: 'QUOTED', customer: 'Omega Inc', value: 1100000 },
  { id: 'Q-1026', stage: 'APPROVAL', customer: 'Beta Inc', value: 4000000 },
  { id: 'Q-1024', stage: 'NEGOTIATION', customer: 'Acme Corp', value: 6000000 },
  { id: 'Q-1010', stage: 'WON', customer: 'Delta', value: 2500000 },
];

const mockQuotations = [
  { id: 'Q-1024', customer: 'ABC Corp', amount: 6000000, discount: 12, margin: 21, status: 'APPROVED', date: '2026-09-02' },
  { id: 'Q-1025', customer: 'XYZ Ltd', amount: 3200000, discount: 18, margin: 14, status: 'PENDING', date: '2026-09-03' },
  { id: 'Q-1026', customer: 'Beta Inc', amount: 1800000, discount: 5, margin: 25, status: 'DRAFT', date: '2026-09-04' },
  { id: 'Q-1027', customer: 'Acme Corp', amount: 4500000, discount: 20, margin: 12, status: 'NEGOTIATION', date: '2026-09-04' },
];

const mockProducts = [
  { id: 'P-101', name: 'Enterprise Laptop Pro', category: 'Hardware', price: 65000, cost: 48000, stock: 120 },
  { id: 'P-102', name: 'Developer Workstation', category: 'Hardware', price: 95000, cost: 72000, stock: 45 },
  { id: 'P-201', name: '27" 4K Monitor', category: 'Hardware', price: 35000, cost: 24000, stock: 200 },
  { id: 'P-301', name: 'Cloud License - Annual', category: 'Software', price: 15000, cost: 2000, stock: 9999 },
  { id: 'P-302', name: 'Premium Support 24/7', category: 'Service', price: 75000, cost: 30000, stock: 9999 },
];

// Artificial delay for realism
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getSalesDashboard = async () => {
  await delay(600);
  return mockDashboard;
};

export const getSalesPipeline = async () => {
  await delay(500);
  return mockPipeline;
};

export const getMyQuotations = async (filters = {}) => {
  await delay(700);
  let result = [...mockQuotations];
  
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(q => q.status === filters.status);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(q => q.id.toLowerCase().includes(s) || q.customer.toLowerCase().includes(s));
  }
  
  return result;
};

export const getProductCatalog = async () => {
  await delay(400);
  return mockProducts;
};

// AI Mock Service
export const getAiRecommendation = async (cartItems) => {
  await delay(800);
  
  // Logic: If they have hardware, recommend support
  const hasHardware = cartItems.some(i => i.category === 'Hardware');
  
  if (hasHardware) {
    return {
      product: mockProducts.find(p => p.id === 'P-302'), // Premium Support
      addedRevenue: 75000,
      addedMarginPercent: 3.2,
      reason: 'Frequently purchased by customers buying hardware in the Enterprise tier.',
    };
  }
  return null; // No recommendation
};
