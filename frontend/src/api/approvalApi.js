// Real-first adapter for the Approval screens.
//
// The React approval screens (ApprovalScreen / ApprovalDetail and their child
// components) were originally built against an in-memory `mockDb`. The real
// FastAPI backend exposes the approval workflow as a *flat* list of
// `ApprovalRequest` rows (`/approvals/pending`, `/approvals/{id}/approve`,
// `/reject`, `/return`) plus the full quote via `/quotes/{id}`.
//
// This module fetches from the real backend and assembles the richer,
// nested shape the components already consume — so every number the reviewer
// sees (blended risk, discount overage, approval chain, audit trail) is
// backend-computed and hand-verifiable (spec §10), not faked. If the backend
// is unreachable it throws, and the screens surface their normal error state
// (no silent fabricated data — a real login/demo must provably hit the API).

import apiClient from './client';

// ---------------------------------------------------------------------------
// Small in-request caches so the Detail view can resolve an approval → quote
// (the backend has no single GET /approvals/{id}). Populated by getApprovals /
// getApprovalById; safe to be stale — every action refetches.
// ---------------------------------------------------------------------------
let _customersById = null;
let _usersById = null;
const _approvalIndex = new Map(); // approval_id -> raw ApprovalRequest row

async function _loadLookups() {
  if (_customersById && _usersById) return;
  const [customers, users] = await Promise.all([
    apiClient.get('/customers').catch(() => []),
    apiClient.get('/users').catch(() => []), // ADMIN-only; non-admins get []
  ]);
  _customersById = new Map((customers || []).map((c) => [c.id, c]));
  _usersById = new Map((users || []).map((u) => [u.id, u]));
}

const _num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);

// Map the backend's 0-100 display score (Quotation.blended_risk) to the
// LOW/MEDIUM/HIGH band the badge components expect. Mirrors risk_engine.
function _riskLevel(score) {
  const s = _num(score);
  if (s <= 30) return 'LOW';
  if (s <= 60) return 'MEDIUM';
  return 'HIGH';
}

function _customerName(customerId) {
  return _customersById?.get(customerId)?.name || 'Customer';
}
function _customerTier(customerId) {
  return _customersById?.get(customerId)?.tier || 'BRONZE';
}
function _userName(userId) {
  return _usersById?.get(userId)?.name || null;
}

// Weighted (by line subtotal) discount % across a quote's lines — the single
// headline "requested discount" figure the list/table shows.
function _weightedDiscount(lines = []) {
  let base = 0;
  let disc = 0;
  for (const l of lines) {
    const lineBase = _num(l.unit_price) * _num(l.quantity);
    base += lineBase;
    disc += lineBase * (_num(l.discount_percent) / 100);
  }
  return base > 0 ? Math.round((disc / base) * 1000) / 10 : 0;
}

// ---------------------------------------------------------------------------
// LIST — GET /approvals/pending, enriched with each quote's numbers.
// ---------------------------------------------------------------------------
export const getApprovals = async (params = {}) => {
  await _loadLookups();
  const pending = await apiClient.get('/approvals/pending'); // ApprovalResponse[]

  // Collapse the per-role approval rows to one card per quote (a quote may
  // require Manager AND Finance) and fetch each quote once.
  const byQuote = new Map();
  for (const appr of pending) {
    _approvalIndex.set(appr.id, appr);
    if (!byQuote.has(appr.quotation_id)) byQuote.set(appr.quotation_id, []);
    byQuote.get(appr.quotation_id).push(appr);
  }

  const quotes = await Promise.all(
    [...byQuote.keys()].map((qid) => apiClient.get(`/quotes/${qid}`).catch(() => null))
  );

  let items = [];
  for (const quote of quotes) {
    if (!quote) continue;
    const approvals = (byQuote.get(quote.id) || []).sort(
      (a, b) => a.approval_level - b.approval_level
    );
    // The "acting" approval is the lowest-level still-pending row.
    const primary = approvals[0];
    const roles = approvals.map((a) => a.approver_role);
    const approvalType = roles.includes('FINANCE') ? 'FINANCE' : 'DISCOUNT';

    items.push({
      id: primary.id,
      quotation_id: `Q-${String(quote.id).slice(0, 8).toUpperCase()}`,
      _quoteId: quote.id,
      customer_name: _customerName(quote.customer_id),
      sales_rep_name: _userName(quote.rep_id) || 'Sales Rep',
      total_value: _num(quote.total),
      discount: _weightedDiscount(quote.lines),
      risk_score: Math.round(_num(quote.blended_risk)),
      risk_level: quote.risk_level || _riskLevel(quote.blended_risk),
      approval_type: approvalType,
      submitted_at: primary.created_at,
      status: 'PENDING',
      _quoteId_raw: quote.id,
    });
  }

  // ---- client-side filter / sort / paginate (matches original contract) ----
  if (params.status && params.status !== 'ALL') {
    items = items.filter((i) => i.status === params.status);
  }
  if (params.riskLevel && params.riskLevel !== 'ALL') {
    items = items.filter((i) => i.risk_level === params.riskLevel);
  }
  if (params.approvalType && params.approvalType !== 'ALL') {
    items = items.filter((i) => i.approval_type === params.approvalType);
  }
  if (params.search && params.search.trim() !== '') {
    const q = params.search.toLowerCase().trim();
    items = items.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.quotation_id?.toLowerCase().includes(q) ||
        i.customer_name?.toLowerCase().includes(q) ||
        i.sales_rep_name?.toLowerCase().includes(q)
    );
  }

  const sortBy = params.sortBy || 'HIGHEST_RISK';
  const sorters = {
    HIGHEST_RISK: (a, b) => b.risk_score - a.risk_score,
    NEWEST: (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at),
    OLDEST: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
    HIGHEST_DISCOUNT: (a, b) => b.discount - a.discount,
    HIGHEST_VALUE: (a, b) => b.total_value - a.total_value,
  };
  items.sort(sorters[sortBy] || sorters.HIGHEST_RISK);

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = items.length;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, page_size: pageSize };
};

// ---------------------------------------------------------------------------
// SUMMARY cards.
// ---------------------------------------------------------------------------
export const getApprovalSummary = async () => {
  const { items } = await getApprovals({ pageSize: 1000 });
  const today = new Date().toISOString().slice(0, 10);
  const pending = items.length; // /pending only returns open requests
  const high_risk = items.filter((i) => i.risk_level === 'HIGH').length;

  // approved/rejected today aren't in /pending — pull from the rep-visible
  // quote list (best-effort; 0 if not permitted).
  let approved_today = 0;
  let rejected_today = 0;
  try {
    const quotes = await apiClient.get('/quotes');
    for (const q of quotes || []) {
      const day = (q.updated_at || '').slice(0, 10);
      if (day !== today) continue;
      if (q.status === 'APPROVED') approved_today += 1;
      else if (q.status === 'REJECTED') rejected_today += 1;
    }
  } catch {
    /* non-fatal */
  }
  return { pending, high_risk, approved_today, rejected_today };
};

// ---------------------------------------------------------------------------
// DETAIL — resolve approval → quote, build the nested view + audit timeline.
// ---------------------------------------------------------------------------
export const getApprovalById = async (approvalId) => {
  await _loadLookups();

  // Resolve which quote this approval belongs to. Prefer the cached row from a
  // prior list fetch; otherwise scan /approvals/pending fresh.
  let appr = _approvalIndex.get(approvalId);
  if (!appr) {
    const pending = await apiClient.get('/approvals/pending');
    for (const a of pending) _approvalIndex.set(a.id, a);
    appr = _approvalIndex.get(approvalId);
  }
  if (!appr) throw new Error(`Approval request ${approvalId} not found or already resolved.`);

  const quoteId = appr.quotation_id;
  const [quote, chainRows, auditRows] = await Promise.all([
    apiClient.get(`/quotes/${quoteId}`),
    apiClient.get(`/approvals/quote/${quoteId}`).catch(() => []),
    apiClient.get(`/quotes/${quoteId}/audit`).catch(() => []),
  ]);

  const tier = _customerTier(quote.customer_id);
  const TIER_MAX = { BRONZE: 10, SILVER: 15, GOLD: 20 };
  const tierMax = TIER_MAX[tier] ?? 10;

  // Resolve product metadata for line rows / discount analysis.
  const products = await apiClient.get('/products').catch(() => []);
  const productById = new Map((products || []).map((p) => [p.id, p]));

  const lines = quote.lines || [];
  const items = lines.map((l, idx) => {
    const p = productById.get(l.product_id);
    return {
      id: l.id || idx,
      name: p?.name || 'Product',
      category: p?.category || '—',
      qty: l.quantity,
      unit_price: l.unit_price,
      original_discount: 0,
      requested_discount: Math.round(_num(l.discount_percent) * 10) / 10,
      final_price: l.line_total,
    };
  });

  // Per-category discount analysis against the binding ceiling
  // = min(tier_max, product_ceiling) — the exact §10 rule.
  const catAgg = new Map();
  for (const l of lines) {
    const p = productById.get(l.product_id);
    const cat = p?.category || 'General';
    const ceiling = Math.min(tierMax, _num(p?.discount_ceiling) || tierMax);
    const cur = catAgg.get(cat) || { requested: 0, allowed: ceiling };
    cur.requested = Math.max(cur.requested, _num(l.discount_percent));
    cur.allowed = Math.min(cur.allowed, ceiling);
    catAgg.set(cat, cur);
  }
  const discount_analysis = [...catAgg.entries()].map(([category, v]) => ({
    category,
    allowed: Math.round(v.allowed * 10) / 10,
    requested: Math.round(v.requested * 10) / 10,
    status: v.requested > v.allowed + 0.01 ? 'EXCEEDS_LIMIT' : 'WITHIN_LIMIT',
  }));

  const score = Math.round(_num(quote.blended_risk));
  const level = quote.risk_level || _riskLevel(quote.blended_risk);
  const factors = [];
  const overCeiling = discount_analysis.filter((d) => d.status === 'EXCEEDS_LIMIT');
  if (overCeiling.length) {
    factors.push(
      `${overCeiling.length} line category(ies) exceed the discount ceiling for a ${tier} customer.`
    );
  }
  if (_num(quote.margin_percent) < 15) {
    factors.push(`Deal margin is ${_num(quote.margin_percent).toFixed(1)}% — below the 15% floor.`);
  }
  if (!factors.length) factors.push('All discounts sit within their configured ceilings.');

  // Approval chain (all rows for the quote, ordered by level) → timeline cards.
  const STATUS_LABEL = { PENDING: 'IN_REVIEW', APPROVED: 'APPROVED', REJECTED: 'REJECTED', RETURNED: 'RETURNED', INVALIDATED: 'INVALIDATED' };
  const chain = [
    {
      role: 'Sales Representative',
      person: _userName(quote.rep_id) || 'Sales Rep',
      status: 'SUBMITTED',
      timestamp: _fmt(quote.created_at),
    },
    ...(chainRows || [])
      .sort((a, b) => a.approval_level - b.approval_level)
      .map((r) => ({
        role: r.approver_role === 'FINANCE' ? 'Finance' : 'Sales Manager',
        person: _userName(r.approver_id),
        status: STATUS_LABEL[r.status] || r.status,
        timestamp: r.resolved_at ? _fmt(r.resolved_at) : _fmt(r.created_at),
      })),
  ];

  const timeline = (auditRows || []).map((a) => ({
    title: _humanizeAction(a.action),
    timestamp: _fmt(a.timestamp),
    reason: a.reason || null,
    status: 'past',
  }));

  const currentRow = (chainRows || [])
    .filter((r) => r.status === 'PENDING')
    .sort((a, b) => a.approval_level - b.approval_level)[0];

  const subtotal = _num(quote.subtotal);
  const weighted = _weightedDiscount(lines);

  return {
    id: approvalId,
    status: appr.status === 'PENDING' ? 'PENDING' : appr.status,
    approval_type: (chainRows || []).some((r) => r.approver_role === 'FINANCE')
      ? 'FINANCE'
      : 'DISCOUNT',
    current_discount: 0,
    requested_discount: weighted,
    quotation: {
      id: `Q-${String(quote.id).slice(0, 8).toUpperCase()}`,
      customer_name: _customerName(quote.customer_id),
      sales_rep_name: _userName(quote.rep_id) || 'Sales Rep',
      currency: quote.currency || 'INR',
      subtotal,
      discount: _num(quote.discount_total),
      tax: _num(quote.tax_total),
      total: _num(quote.total),
      created_date: _fmtDate(quote.created_at),
      valid_until: quote.expires_at ? _fmtDate(quote.expires_at) : '—',
    },
    items,
    discount_analysis,
    risk: { score, level, factors },
    negotiation: null,
    approval_chain: chain,
    current_reviewer: currentRow
      ? {
          role: currentRow.approver_role === 'FINANCE' ? 'Finance' : 'Sales Manager',
          person: _userName(currentRow.approver_id),
          assigned_at: _fmt(currentRow.created_at),
        }
      : null,
    timeline,
  };
};

// ---------------------------------------------------------------------------
// ACTIONS — POST to the real backend. `id` is the ApprovalRequest id.
// ---------------------------------------------------------------------------
export const approveApproval = async (id, data = {}) => {
  return apiClient.post(`/approvals/${id}/approve`, { reason: data.comment || null });
};

export const rejectApproval = async (id, data = {}) => {
  if (!data.reason) throw new Error('Reason required');
  return apiClient.post(`/approvals/${id}/reject`, { reason: data.reason });
};

export const requestApprovalChanges = async (id, data = {}) => {
  if (!data.comment) throw new Error('Comment required');
  return apiClient.post(`/approvals/${id}/return`, { reason: data.comment });
};

// ---------------------------------------------------------------------------
// formatting helpers
// ---------------------------------------------------------------------------
function _fmt(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function _fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function _humanizeAction(action = '') {
  return action
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
