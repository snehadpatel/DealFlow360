import apiClient from './client';

export const getApprovals = async (params = {}) => {
  try {
    const items = await apiClient.get('/approvals/pending');
    let result = Array.isArray(items) ? items : [];

    // Map backend fields to frontend expected format
    result = result.map(a => ({
      id: a.id,
      quotation_id: a.quotation_id,
      customer: a.customer_name || 'Enterprise Client',
      requested_discount: a.discount_percent || 0,
      approval_type: a.approver_role === 'FINANCE' ? 'Finance Override' : 'Discount Threshold',
      risk_level: a.risk_level || 'MEDIUM',
      status: a.status || 'PENDING',
      submitted_by: a.rep_name || 'Sales Representative',
      date: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      approver_role: a.approver_role,
      comments: a.comments,
      amount: a.quote_total || 0,
      margin: a.quote_margin_percent || 0,
    }));

    // Status filter
    if (params.status && params.status !== 'ALL') {
      result = result.filter(item => item.status === params.status);
    }

    // Risk level filter
    if (params.riskLevel && params.riskLevel !== 'ALL') {
      result = result.filter(item => item.risk_level === params.riskLevel);
    }

    // Search query
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      result = result.filter(item =>
        String(item.id).toLowerCase().includes(q) ||
        String(item.quotation_id).toLowerCase().includes(q) ||
        item.customer?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (params.sortBy === 'NEWEST') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (params.sortBy === 'OLDEST') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      // Default: Pending first
      result.sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return 0;
      });
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = result.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = result.slice(startIndex, startIndex + pageSize);

    return { items: paginatedItems, total, page, page_size: pageSize };
  } catch (err) {
    console.error('Failed to fetch approvals:', err);
    return { items: [], total: 0, page: 1, page_size: 10 };
  }
};

export const getApprovalSummary = async () => {
  try {
    const items = await apiClient.get('/approvals/pending');
    const list = Array.isArray(items) ? items : [];
    const pending = list.filter(i => i.status === 'PENDING').length;
    const high_risk = list.filter(i => i.risk_level === 'HIGH' && i.status === 'PENDING').length;

    return { pending, high_risk, approved_today: 0, rejected_today: 0 };
  } catch (err) {
    console.error('Failed to fetch approval summary:', err);
    return { pending: 0, high_risk: 0, approved_today: 0, rejected_today: 0 };
  }
};

export const getApprovalById = async (id) => {
  try {
    // Get all pending approvals and find the one matching the id
    const items = await apiClient.get('/approvals/pending');
    const list = Array.isArray(items) ? items : [];
    const found = list.find(a => String(a.id) === String(id));

    if (!found) throw new Error(`Approval ${id} not found`);

    // Get the related quote detail
    let quoteDetail = {};
    try {
      quoteDetail = await apiClient.get(`/quotes/${found.quotation_id}`);
    } catch { /* quote may not be accessible */ }

    return {
      ...found,
      id: found.id,
      quotation_id: found.quotation_id,
      customer: found.customer_name || quoteDetail.customer_name || 'Enterprise Client',
      status: found.status,
      quotation: {
        id: found.quotation_id,
        customer_name: found.customer_name || quoteDetail.customer_name || 'Enterprise Client',
        sales_rep_name: found.rep_name || 'Sales Representative',
        currency: 'INR',
        subtotal: quoteDetail.subtotal || 0,
        discount: quoteDetail.discount_total || 0,
        tax: quoteDetail.tax_total || 0,
        total: quoteDetail.total || 0,
        created_date: quoteDetail.created_at || '',
        valid_until: quoteDetail.expires_at || '',
      },
      items: (quoteDetail.lines || []).map((l, i) => ({
        id: i + 1,
        name: l.product_name || `Product ${i + 1}`,
        category: 'Product',
        qty: l.quantity,
        unit_price: l.unit_price,
        original_discount: 0,
        requested_discount: l.discount_percent,
        final_price: l.line_total,
      })),
      risk: {
        score: quoteDetail.blended_risk || 0,
        level: quoteDetail.risk_level || 'LOW',
        factors: ['Discount analysis from backend'],
      },
      approval_chain: [
        { role: 'Sales Representative', person: found.rep_name || 'Rep', status: 'SUBMITTED', timestamp: '' },
        { role: found.approver_role || 'Manager', person: 'Approver', status: found.status === 'PENDING' ? 'IN_REVIEW' : found.status, timestamp: '' },
      ],
      current_reviewer: { role: found.approver_role, person: 'Assigned Approver' },
      timeline: [],
    };
  } catch (err) {
    console.error('Failed to fetch approval detail:', err);
    throw err;
  }
};

export const approveApproval = async (id, data = {}) => {
  return await apiClient.post(`/approvals/${id}/approve`, { reason: data.reason || '' });
};

export const rejectApproval = async (id, data) => {
  if (!data.reason) throw new Error("Reason required");
  return await apiClient.post(`/approvals/${id}/reject`, { reason: data.reason });
};

export const requestApprovalChanges = async (id, data) => {
  if (!data.comment) throw new Error("Comment required");
  return await apiClient.post(`/approvals/${id}/return`, { reason: data.comment });
};
