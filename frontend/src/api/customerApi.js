import apiClient from './client';

// Isolated initial mock dataset for Customer Portal
const mockCustomerData = {
  profile: {
    companyName: 'Acme Corporation',
    contactName: 'Jane Doe',
    email: 'buyer@acmecorp.com',
    phone: '+1 (555) 234-5678',
    address: '100 Tech Parkway, Suite 400, San Francisco, CA 94107',
    taxId: 'US987654321',
  },
  quotations: [
    {
      id: 'Q-1042',
      customer: 'Acme Corp',
      salesRep: 'Alex Rep',
      createdDate: '2026-09-04',
      validUntil: '2026-09-18',
      currency: 'INR',
      subtotal: 620000,
      totalDiscount: 80000,
      taxTotal: 98280,
      totalAmount: 540000,
      discountPercent: 10,
      status: 'NEGOTIATION',
      items: [
        {
          id: 1,
          product: 'Laptop',
          description: 'Business Laptop',
          quantity: 10,
          unitPrice: 50000,
          discount: 10,
          tax: 18,
          total: 450000,
        },
        {
          id: 2,
          product: 'Software License',
          description: 'Enterprise License',
          quantity: 10,
          unitPrice: 8000,
          discount: 5,
          tax: 18,
          total: 76000,
        },
        {
          id: 3,
          product: 'Support Plan',
          description: 'Annual Support',
          quantity: 1,
          unitPrice: 20000,
          discount: 0,
          tax: 18,
          total: 20000,
        },
      ],
      negotiation: {
        status: 'PENDING', // PENDING, COUNTER_OFFER, APPROVED, REJECTED
        requestedDiscount: 15,
        approvedDiscount: null,
        message: 'We are requesting an additional discount because of our bulk purchase.',
        counterOffer: null,
        rejectionReason: null,
        history: [
          {
            id: 'h-1',
            date: '04 Sep 2026',
            author: 'Customer requested 15% discount',
            details: 'Reason: Bulk purchase',
            status: 'PENDING',
          },
          {
            id: 'h-2',
            date: '04 Sep 2026',
            author: 'Sales Manager reviewed request',
            details: 'Forwarded to Finance for risk evaluation',
            status: 'PENDING',
          },
          {
            id: 'h-3',
            date: '04 Sep 2026',
            author: 'Finance review',
            details: 'Pending',
            status: 'PENDING',
          },
        ],
      },
    },
    {
      id: 'Q-1039',
      customer: 'Acme Corp',
      salesRep: 'Maria Manager',
      createdDate: '2026-08-28',
      validUntil: '2026-09-10',
      currency: 'INR',
      subtotal: 1200000,
      totalDiscount: 180000,
      taxTotal: 183600,
      totalAmount: 1020000,
      discountPercent: 15,
      status: 'APPROVED',
      items: [
        {
          id: 1,
          product: 'Cloud Infrastructure Node',
          description: 'Dedicated GPU Instance Cluster',
          quantity: 4,
          unitPrice: 300000,
          discount: 15,
          tax: 18,
          total: 1020000,
        },
      ],
      negotiation: {
        status: 'APPROVED',
        requestedDiscount: 15,
        approvedDiscount: 15,
        message: 'Approved per annual volume commitment.',
        counterOffer: null,
        rejectionReason: null,
        history: [
          {
            id: 'h-10',
            date: '28 Aug 2026',
            author: 'Customer requested 15% discount',
            details: 'Volume purchase commitment',
            status: 'APPROVED',
          },
          {
            id: 'h-11',
            date: '28 Aug 2026',
            author: 'Sales Operations',
            details: 'Approved Negotiation',
            status: 'APPROVED',
          },
        ],
      },
    },
    {
      id: 'Q-1035',
      customer: 'Acme Corp',
      salesRep: 'Alex Rep',
      createdDate: '2026-08-15',
      validUntil: '2026-08-30',
      currency: 'INR',
      subtotal: 350000,
      totalDiscount: 35000,
      taxTotal: 56700,
      totalAmount: 315000,
      discountPercent: 10,
      status: 'CONFIRMED',
      items: [
        {
          id: 1,
          product: 'Workstation Setup',
          description: 'Developer Desktop Workstation',
          quantity: 5,
          unitPrice: 70000,
          discount: 10,
          tax: 18,
          total: 315000,
        },
      ],
      negotiation: null,
    },
    {
      id: 'Q-1045',
      customer: 'Acme Corp',
      salesRep: 'Alex Rep',
      createdDate: '2026-09-02',
      validUntil: '2026-09-16',
      currency: 'INR',
      subtotal: 800000,
      totalDiscount: 80000,
      taxTotal: 129600,
      totalAmount: 720000,
      discountPercent: 10,
      status: 'COUNTER_OFFER',
      items: [
        {
          id: 1,
          product: 'Data Warehouse Storage',
          description: '50TB High Performance Storage SAN',
          quantity: 2,
          unitPrice: 400000,
          discount: 10,
          tax: 18,
          total: 720000,
        },
      ],
      negotiation: {
        status: 'COUNTER_OFFER',
        requestedDiscount: 15,
        approvedDiscount: 12,
        message: 'Customer requested 15% discount.',
        counterOffer: {
          requestedDiscount: 15,
          approvedDiscount: 12,
          updatedTotal: 528000,
          salesMessage: 'We can approve a maximum discount of 12%.',
        },
        rejectionReason: null,
        history: [
          {
            id: 'h-20',
            date: '02 Sep 2026',
            author: 'Customer requested 15% discount',
            details: 'Reason: Competitive match request',
            status: 'PENDING',
          },
          {
            id: 'h-21',
            date: '03 Sep 2026',
            author: 'Sales Team Counter Offer',
            details: 'Approved 12% max discount.',
            status: 'COUNTER_OFFER',
          },
        ],
      },
    },
    {
      id: 'Q-1048',
      customer: 'Acme Corp',
      salesRep: 'Maria Manager',
      createdDate: '2026-09-01',
      validUntil: '2026-09-15',
      currency: 'INR',
      subtotal: 450000,
      totalDiscount: 0,
      taxTotal: 81000,
      totalAmount: 450000,
      discountPercent: 0,
      status: 'SENT',
      items: [
        {
          id: 1,
          product: 'Security Audit & Compliance Package',
          description: 'ISO 27001 readiness review and penetration testing',
          quantity: 1,
          unitPrice: 450000,
          discount: 0,
          tax: 18,
          total: 450000,
        },
      ],
      negotiation: null,
    },
  ],
  invoices: [
    {
      id: 'INV-2026-089',
      quoteId: 'Q-1035',
      date: '2026-08-30',
      dueDate: '2026-09-30',
      amount: 315000,
      status: 'UNPAID',
    },
    {
      id: 'INV-2026-054',
      quoteId: 'Q-1020',
      date: '2026-07-15',
      dueDate: '2026-08-15',
      amount: 540000,
      status: 'PAID',
    },
    {
      id: 'INV-2026-012',
      quoteId: 'Q-1002',
      date: '2026-05-10',
      dueDate: '2026-06-10',
      amount: 180000,
      status: 'PAID',
    },
  ],
  subscriptions: [
    {
      id: 'SUB-8842',
      planName: 'Enterprise SaaS Core',
      billingCycle: 'Annual Pre-paid',
      nextRenewal: '2027-08-30',
      amount: 960000,
      status: 'ACTIVE',
    },
    {
      id: 'SUB-8843',
      planName: '24/7 Dedicated Support Tier',
      billingCycle: 'Monthly',
      nextRenewal: '2026-10-01',
      amount: 20000,
      status: 'ACTIVE',
    },
  ],
};

// Global in-memory reference
let mockState = JSON.parse(JSON.stringify(mockCustomerData));

export const getCustomerDashboard = async () => {
  try {
    const res = await apiClient.get('/portal/dashboard');
    return res;
  } catch {
    const quotes = mockState.quotations;
    const invoices = mockState.invoices;

    const activeQuotations = quotes.filter((q) => ['SENT', 'NEGOTIATION', 'COUNTER_OFFER', 'DRAFT'].includes(q.status)).length;
    const pendingNegotiations = quotes.filter((q) => q.negotiation && q.negotiation.status === 'PENDING').length;
    const approvedQuotations = quotes.filter((q) => q.status === 'APPROVED').length;
    const outstandingInvoices = invoices.filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE').length;

    return {
      summary: {
        activeQuotations,
        pendingNegotiations,
        approvedQuotations,
        outstandingInvoices,
      },
      recentQuotations: quotes.slice(0, 5),
    };
  }
};

export const getCustomerQuotations = async () => {
  try {
    const res = await apiClient.get('/portal/quotes');
    return res;
  } catch {
    return mockState.quotations;
  }
};

export const getInvoices = async () => {
  try {
    const res = await apiClient.get('/portal/invoices');
    return res;
  } catch {
    return mockState.invoices;
  }
};

export const getSubscriptions = async () => {
  try {
    const res = await apiClient.get('/portal/subscriptions');
    return res;
  } catch {
    return mockState.subscriptions;
  }
};

export const getCustomerProfile = async () => {
  try {
    const res = await apiClient.get('/portal/profile');
    return res;
  } catch {
    return mockState.profile;
  }
};

export const getMockState = () => mockState;
