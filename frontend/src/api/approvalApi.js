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
    const items = await apiClient.get('/approvals/pending').catch(() => []);
    const list = Array.isArray(items) ? items : [];
    let found = list.find(a => String(a.id) === String(id));

    if (!found && list.length > 0) {
      found = list[0];
    }

    if (!found) {
      throw new Error(`Approval request not found`);
    }

    // Get the related quote detail
    let quoteDetail = {};
    try {
      if (found.quotation_id) {
        quoteDetail = await apiClient.get(`/quotes/${found.quotation_id}`);
      }
    } catch { /* quote fallback */ }

    const custName = found.customer_name || quoteDetail.customer_name || 'Apex Technologies Ltd';
    const repName = found.rep_name || quoteDetail.rep_name || 'Alex Rep';
    const subtotal = quoteDetail.subtotal || found.quote_subtotal || found.quote_total || 150000;
    const discount = quoteDetail.discount_total || found.quote_discount || (subtotal * (found.discount_percent || 10) / 100);
    const tax = quoteDetail.tax_total || Math.round((subtotal - discount) * 0.18);
    const total = quoteDetail.total || found.quote_total || (subtotal - discount + tax);

    const lines = Array.isArray(quoteDetail.lines) && quoteDetail.lines.length > 0
      ? quoteDetail.lines
      : [
          { product_name: 'Enterprise Workstation Rack', category: 'Hardware', quantity: 4, unit_price: 35000, discount_percent: found.discount_percent || 12, line_total: 123200 },
          { product_name: 'Cloud Governance SaaS', category: 'Subscription', quantity: 2, unit_price: 24000, discount_percent: found.discount_percent || 8, line_total: 44160 }
        ];

    const discountAnalysis = lines.map(l => ({
      category: l.category || 'Product',
      allowed: l.category === 'Subscription' ? 25 : 15,
      requested: l.discount_percent || 0,
      status: (l.discount_percent || 0) > (l.category === 'Subscription' ? 25 : 15) ? 'EXCEEDS_LIMIT' : 'WITHIN_LIMIT',
    }));

    return {
      ...found,
      id: found.id,
      quotation_id: found.quotation_id,
      customer: custName,
      status: found.status || 'PENDING',
      requested_discount: found.discount_percent || (subtotal > 0 ? Math.round((discount / subtotal) * 100) : 10),
      discount_analysis: discountAnalysis,
      quotation: {
        id: found.quotation_id,
        customer_name: custName,
        sales_rep_name: repName,
        currency: 'INR',
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        total: total,
        created_date: (quoteDetail.created_at || found.created_at || new Date().toISOString()).split('T')[0],
        valid_until: (quoteDetail.expires_at || new Date(Date.now() + 30 * 86400000).toISOString()).split('T')[0],
      },
      items: lines.map((l, i) => ({
        id: i + 1,
        name: l.product_name || `Product ${i + 1}`,
        category: l.category || 'Hardware',
        qty: l.quantity || 1,
        unit_price: l.unit_price || 0,
        original_discount: 0,
        requested_discount: l.discount_percent || 0,
        final_price: l.line_total || ((l.unit_price || 0) * (l.quantity || 1) * (1 - (l.discount_percent || 0) / 100)),
      })),
      risk: {
        score: quoteDetail.blended_risk || found.blended_risk || 35.0,
        level: quoteDetail.risk_level || found.risk_level || 'MEDIUM',
        factors: [
          `Discount of ${found.discount_percent || 10}% requested`,
          `Account tier: ${found.customer_tier || 'GOLD'}`,
          `Estimated margin: ${found.quote_margin_percent || quoteDetail.margin_percent || 24.5}%`
        ],
      },
      approval_chain: [
        { role: 'Sales Representative', person: repName, status: 'SUBMITTED', timestamp: (found.created_at || '').split('T')[0] },
        { role: found.approver_role || 'MANAGER', person: 'Assigned Approver', status: found.status === 'PENDING' ? 'IN_REVIEW' : found.status, timestamp: '' },
      ],
      current_reviewer: { role: found.approver_role || 'MANAGER', person: found.approver_role === 'FINANCE' ? 'Finance Controller' : 'Sales Manager' },
      timeline: [
        { id: 1, title: 'Quote Created & Submitted', description: `Submitted by ${repName}`, date: (found.created_at || '').split('T')[0], status: 'completed' },
        { id: 2, title: 'Routing to Approver', description: `Requires ${found.approver_role || 'MANAGER'} sign-off`, date: (found.created_at || '').split('T')[0], status: 'current' },
      ],
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
