import { mockDb, getDb } from '../lib/mockDatabase';

export const getApprovals = async (params = {}) => {
  let items = await mockDb.getAll('approvals');

  // Status filter
  if (params.status && params.status !== 'ALL') {
    items = items.filter((item) => item.status === params.status);
  }

  // Risk level filter
  if (params.riskLevel && params.riskLevel !== 'ALL') {
    items = items.filter((item) => item.risk_level === params.riskLevel);
  }

  // Approval type filter
  if (params.approvalType && params.approvalType !== 'ALL') {
    items = items.filter((item) => item.approval_type === params.approvalType);
  }

  // Search query
  if (params.search && params.search.trim() !== '') {
    const q = params.search.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.quotationId?.toLowerCase().includes(q) ||
        item.customer?.toLowerCase().includes(q) ||
        item.requestedBy?.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (params.sortBy) {
    if (params.sortBy === 'HIGHEST_RISK') {
      items.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
    } else if (params.sortBy === 'NEWEST') {
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (params.sortBy === 'OLDEST') {
      items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (params.sortBy === 'HIGHEST_DISCOUNT') {
      items.sort((a, b) => (b.margin || 0) - (a.margin || 0));
    } else if (params.sortBy === 'HIGHEST_VALUE') {
      items.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }
  } else {
    // Default: Highest risk / Pending first
    items.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return (b.riskScore || 0) - (a.riskScore || 0);
    });
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = items.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    total,
    page,
    page_size: pageSize,
  };
};

export const getApprovalSummary = async () => {
  const items = await mockDb.getAll('approvals');
  const pending = items.filter(i => i.status === 'PENDING').length;
  const high_risk = items.filter(i => i.riskScore === 'High' && i.status === 'PENDING').length;
  const approved_today = items.filter(i => i.status === 'APPROVED').length;
  const rejected_today = items.filter(i => i.status === 'REJECTED').length;

  return { pending, high_risk, approved_today, rejected_today };
};

export const getApprovalById = async (id) => {
  const found = await mockDb.getById('approvals', id);
  if (!found) {
    throw new Error(`Approval request ${id} not found.`);
  }
  
  // Inject detailed mock data required for Screen 3 (Approval Detail)
  return {
    ...found,
    quotation: {
      id: found.quotationId,
      customer_name: found.customer,
      sales_rep_name: found.requestedBy,
      currency: 'INR',
      subtotal: found.amount,
      discount: found.amount * 0.1,
      tax: found.amount * 0.18,
      total: found.amount * 1.18,
      created_date: '04 Sep 2026',
      valid_until: '15 Sep 2026'
    },
    items: [
      { id: 1, name: 'Enterprise Laptop', category: 'Hardware', qty: 10, unit_price: 50000, original_discount: 10, requested_discount: 15, final_price: 425000 },
      { id: 2, name: 'Software License', category: 'Software', qty: 10, unit_price: 8000, original_discount: 5, requested_discount: 10, final_price: 72000 },
    ],
    discount_analysis: [
      { category: 'Hardware', allowed: 15, requested: 15, status: 'WITHIN_LIMIT' },
      { category: 'Software', allowed: 15, requested: 10, status: 'WITHIN_LIMIT' }
    ],
    risk: {
      score: found.riskScore === 'High' ? 85 : 40,
      level: found.riskScore ? found.riskScore.toUpperCase() : 'MEDIUM',
      factors: [
        'Overall requested discount is high',
        'Deal margin is below recommended threshold',
      ]
    },
    negotiation: {
      message: 'Requested override for strategic account.',
      submitted_at: found.date
    },
    approval_chain: [
      { role: 'Sales Representative', person: found.requestedBy, status: 'SUBMITTED', timestamp: '04 Sep 2026 — 10:31 AM' },
      { role: 'Sales Manager', person: 'John Manager', status: found.status === 'PENDING' ? 'IN_REVIEW' : found.status, timestamp: '04 Sep 2026 — 10:35 AM' },
      { role: 'Finance', person: null, status: 'PENDING', timestamp: null },
      { role: 'Final Approval', person: null, status: 'PENDING', timestamp: null }
    ],
    current_reviewer: {
      role: 'Sales Manager',
      person: 'John Manager',
      assigned_at: '04 Sep 2026 — 10:35 AM'
    },
    timeline: [
      { title: 'Customer submitted request', timestamp: '04 Sep 2026 — 10:30 AM', status: 'past' },
      { title: 'Approval request created', timestamp: '04 Sep 2026 — 10:31 AM', status: 'past' },
      { title: 'Sales Manager review', timestamp: found.status === 'PENDING' ? 'Pending' : 'Completed', status: found.status === 'PENDING' ? 'current' : 'past' }
    ]
  };
};

export const approveApproval = async (id, data) => {
  return await mockDb.update('approvals', id, { status: 'APPROVED' });
};

export const rejectApproval = async (id, data) => {
  if (!data.reason) throw new Error("Reason required");
  return await mockDb.update('approvals', id, { status: 'REJECTED', reason: data.reason });
};

export const requestApprovalChanges = async (id, data) => {
  if (!data.comment) throw new Error("Comment required");
  return await mockDb.update('approvals', id, { status: 'CHANGES_REQUESTED', comment: data.comment });
};
