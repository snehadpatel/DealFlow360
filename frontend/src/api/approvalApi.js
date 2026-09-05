import apiClient from './client';

const mockApprovalsData = {
  summary: {
    pending: 12,
    high_risk: 4,
    approved_today: 8,
    rejected_today: 2,
  },
  items: [
    {
      id: 'APP-1024',
      quotation_id: 'Q-1042',
      customer_name: 'Acme Corp',
      sales_rep_name: 'John Smith',
      total_value: 540000,
      discount: 18,
      risk_score: 82,
      risk_level: 'HIGH',
      approval_type: 'CUSTOMER_NEGOTIATION',
      status: 'PENDING',
      submitted_at: '2026-09-04T10:30:00',
      requested_discount: 18,
      current_discount: 10,
      reason: 'Customer requested 18% discount due to bulk Q4 commitment.',
    },
    {
      id: 'APP-1025',
      quotation_id: 'Q-1043',
      customer_name: 'XYZ Ltd',
      sales_rep_name: 'Rahul Sharma',
      total_value: 320000,
      discount: 12,
      risk_score: 54,
      risk_level: 'MEDIUM',
      approval_type: 'DISCOUNT',
      status: 'PENDING',
      submitted_at: '2026-09-04T11:00:00',
      requested_discount: 12,
      current_discount: 5,
      reason: 'Standard tier override request for strategic account.',
    },
    {
      id: 'APP-1026',
      quotation_id: 'Q-1044',
      customer_name: 'ABC Solutions',
      sales_rep_name: 'Alex Rep',
      total_value: 850000,
      discount: 8,
      risk_score: 25,
      risk_level: 'LOW',
      approval_type: 'FINANCE',
      status: 'APPROVED',
      submitted_at: '2026-09-04T09:15:00',
      requested_discount: 8,
      current_discount: 8,
      reason: 'Payment terms extension to 60 days.',
    },
    {
      id: 'APP-1027',
      quotation_id: 'Q-1045',
      customer_name: 'Global Enterprises',
      sales_rep_name: 'Maria Manager',
      total_value: 1200000,
      discount: 22,
      risk_score: 91,
      risk_level: 'HIGH',
      approval_type: 'CUSTOMER_NEGOTIATION',
      status: 'PENDING',
      submitted_at: '2026-09-04T14:20:00',
      requested_discount: 22,
      current_discount: 10,
      reason: 'Customer requested 22% competitive match discount.',
    },
    {
      id: 'APP-1028',
      quotation_id: 'Q-1046',
      customer_name: 'TechCorp International',
      sales_rep_name: 'Alex Rep',
      total_value: 410000,
      discount: 15,
      risk_score: 78,
      risk_level: 'HIGH',
      approval_type: 'DISCOUNT',
      status: 'PENDING',
      submitted_at: '2026-09-03T16:45:00',
      requested_discount: 15,
      current_discount: 5,
      reason: 'Hardware bundle price override.',
    },
    {
      id: 'APP-1029',
      quotation_id: 'Q-1047',
      customer_name: 'Delta Logistics',
      sales_rep_name: 'John Smith',
      total_value: 680000,
      discount: 10,
      risk_score: 40,
      risk_level: 'MEDIUM',
      approval_type: 'OTHER',
      status: 'REJECTED',
      submitted_at: '2026-09-04T08:30:00',
      requested_discount: 10,
      current_discount: 0,
      reason: 'Requested discount exceeds maximum allowable margin for category.',
    },
    {
      id: 'APP-1030',
      quotation_id: 'Q-1048',
      customer_name: 'Omega Systems',
      sales_rep_name: 'Rahul Sharma',
      total_value: 290000,
      discount: 14,
      risk_score: 68,
      risk_level: 'HIGH',
      approval_type: 'CUSTOMER_NEGOTIATION',
      status: 'CHANGES_REQUESTED',
      submitted_at: '2026-09-02T13:10:00',
      requested_discount: 14,
      current_discount: 10,
      reason: 'Counter-offer of 12% submitted to customer.',
    },
  ],
};

let currentMockApprovals = JSON.parse(JSON.stringify(mockApprovalsData));

export const getApprovals = async (params = {}) => {
  try {
    const response = await apiClient.get('/approvals', { params });
    return response;
  } catch {
    let items = [...currentMockApprovals.items];

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
          item.quotation_id.toLowerCase().includes(q) ||
          item.customer_name.toLowerCase().includes(q) ||
          item.sales_rep_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (params.sortBy) {
      if (params.sortBy === 'HIGHEST_RISK') {
        items.sort((a, b) => b.risk_score - a.risk_score);
      } else if (params.sortBy === 'NEWEST') {
        items.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      } else if (params.sortBy === 'OLDEST') {
        items.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
      } else if (params.sortBy === 'HIGHEST_DISCOUNT') {
        items.sort((a, b) => b.discount - a.discount);
      } else if (params.sortBy === 'HIGHEST_VALUE') {
        items.sort((a, b) => b.total_value - a.total_value);
      }
    } else {
      // Default: Highest risk / Pending first
      items.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return b.risk_score - a.risk_score;
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
  }
};

export const getApprovalSummary = async () => {
  try {
    const response = await apiClient.get('/approvals/summary');
    return response;
  } catch {
    return currentMockApprovals.summary;
  }
};

export const getApprovalById = async (id) => {
  try {
    const response = await apiClient.get(`/approvals/${id}`);
    return response;
  } catch {
    const found = currentMockApprovals.items.find((item) => item.id === id);
    if (!found) {
      throw new Error(`Approval request ${id} not found.`);
    }
    
    // Inject detailed mock data required for Screen 3 (Approval Detail)
    return {
      ...found,
      quotation: {
        id: found.quotation_id,
        customer_name: found.customer_name,
        sales_rep_name: found.sales_rep_name,
        currency: 'INR',
        subtotal: found.total_value + (found.total_value * (found.discount / 100)),
        discount: found.total_value * (found.discount / 100),
        tax: found.total_value * 0.18,
        total: found.total_value * 1.18,
        created_date: '04 Sep 2026',
        valid_until: '15 Sep 2026'
      },
      items: [
        { id: 1, name: 'Enterprise Laptop', category: 'Hardware', qty: 10, unit_price: 50000, original_discount: 10, requested_discount: found.requested_discount, final_price: 425000 },
        { id: 2, name: 'Software License', category: 'Software', qty: 10, unit_price: 8000, original_discount: 5, requested_discount: 10, final_price: 72000 },
        { id: 3, name: 'Support Plan', category: 'Services', qty: 1, unit_price: 20000, original_discount: 5, requested_discount: found.requested_discount > 15 ? 18 : 10, final_price: 16400 }
      ],
      discount_analysis: [
        { category: 'Hardware', allowed: 15, requested: found.requested_discount, status: found.requested_discount <= 15 ? 'WITHIN_LIMIT' : 'EXCEEDS_LIMIT' },
        { category: 'Software', allowed: 15, requested: 10, status: 'WITHIN_LIMIT' },
        { category: 'Services', allowed: 10, requested: found.requested_discount > 15 ? 18 : 10, status: found.requested_discount > 15 ? 'EXCEEDS_LIMIT' : 'WITHIN_LIMIT' }
      ],
      risk: {
        score: found.risk_score,
        level: found.risk_level,
        factors: [
          'Services discount exceeds category limit',
          'Overall requested discount is high',
          'Deal margin is below recommended threshold',
          'Customer requested additional discount'
        ].slice(0, found.risk_level === 'HIGH' ? 4 : found.risk_level === 'MEDIUM' ? 2 : 0)
      },
      negotiation: {
        message: found.reason,
        submitted_at: found.submitted_at
      },
      approval_chain: [
        { role: 'Sales Representative', person: found.sales_rep_name, status: 'SUBMITTED', timestamp: '04 Sep 2026 — 10:31 AM' },
        { role: 'Sales Manager', person: 'John Manager', status: found.status === 'PENDING' ? 'IN_REVIEW' : 'APPROVED', timestamp: '04 Sep 2026 — 10:35 AM' },
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
        { title: 'Sales Manager review', timestamp: found.status === 'PENDING' ? 'Pending' : 'Completed', status: found.status === 'PENDING' ? 'current' : 'past' },
        { title: 'Finance Review', timestamp: 'Waiting', status: 'future' }
      ]
    };
  }
};

export const approveApproval = async (id, data) => {
  return new Promise((resolve) => setTimeout(() => {
    const item = currentMockApprovals.items.find(i => i.id === id);
    if (item) item.status = 'APPROVED';
    resolve({ success: true });
  }, 800));
};

export const rejectApproval = async (id, data) => {
  if (!data.reason) throw new Error("Reason required");
  return new Promise((resolve) => setTimeout(() => {
    const item = currentMockApprovals.items.find(i => i.id === id);
    if (item) item.status = 'REJECTED';
    resolve({ success: true });
  }, 800));
};

export const requestApprovalChanges = async (id, data) => {
  if (!data.comment) throw new Error("Comment required");
  return new Promise((resolve) => setTimeout(() => {
    const item = currentMockApprovals.items.find(i => i.id === id);
    if (item) item.status = 'CHANGES_REQUESTED';
    resolve({ success: true });
  }, 800));
};
