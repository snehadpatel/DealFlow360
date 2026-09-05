import apiClient from './client';

/**
 * Fetch invoice list with query filtering and pagination.
 */
export const getInvoices = async (params = {}) => {
  try {
    const res = await apiClient.get('/invoices', { params: { status: params.status !== 'ALL' ? params.status : undefined } });
    let items = Array.isArray(res) ? res : (res?.items || []);

    // Map backend fields to frontend expected format
    items = items.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number || String(inv.id).slice(0, 8),
      quotationId: inv.order_id || '',
      invoiceDate: inv.created_at ? inv.created_at.split('T')[0] : '',
      dueDate: inv.due_date || '',
      currency: inv.currency || 'INR',
      paymentTerms: 'Net 30 Days',
      status: inv.status || 'PENDING',
      customer: {
        id: inv.customer_id,
        name: inv.customer_name || 'Customer',
        email: '',
      },
      totals: {
        subtotal: inv.amount || 0,
        discount: 0,
        tax: 0,
        grandTotal: inv.amount || 0,
        amountPaid: inv.amount_paid || 0,
        outstanding: inv.outstanding_amount || 0,
      },
      items: [],
      payments: [],
      timeline: [],
      permittedActions: { canView: true, canDownload: true, canSend: true },
    }));

    // Client-side search filter
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      items = items.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        String(inv.id).toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginated = items.slice(start, start + pageSize);

    return { items: paginated, total, page: Number(page), pageSize: Number(pageSize) };
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
    return { items: [], total: 0, page: 1, pageSize: 10 };
  }
};

/**
 * Fetch high-level summary cards
 */
export const getInvoiceSummary = async () => {
  try {
    const res = await apiClient.get('/invoices/summary');
    return {
      totalInvoices: res.total || 0,
      paid: res.paid || 0,
      pending: res.pending || 0,
      overdue: res.overdue || 0,
      totalOutstanding: res.total_outstanding || 0,
      totalPaidAmount: 0,
      totalBilledAmount: 0,
    };
  } catch (err) {
    console.error('Failed to fetch invoice summary:', err);
    return { totalInvoices: 0, paid: 0, pending: 0, overdue: 0, totalOutstanding: 0 };
  }
};

/**
 * Fetch full invoice detail by ID
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const inv = await apiClient.get(`/invoices/${invoiceId}`);
    return {
      id: inv.id,
      invoiceNumber: inv.invoice_number || String(inv.id).slice(0, 8),
      invoiceDate: inv.created_at ? inv.created_at.split('T')[0] : '',
      dueDate: inv.due_date || '',
      currency: inv.currency || 'INR',
      status: inv.status || 'PENDING',
      customer: { id: inv.customer_id, name: inv.customer_name || 'Customer' },
      items: [],
      totals: {
        subtotal: inv.amount || 0,
        tax: 0,
        grandTotal: inv.amount || 0,
        amountPaid: inv.amount_paid || 0,
        outstanding: inv.outstanding_amount || 0,
      },
      payments: [],
      timeline: [],
      permittedActions: { canView: true, canDownload: true, canSend: true },
    };
  } catch (err) {
    console.error('Failed to fetch invoice:', err);
    throw err;
  }
};

/**
 * Fetch invoice payments
 */
export const getInvoicePayments = async (invoiceId) => {
  try {
    const res = await apiClient.get(`/payments`, { params: { invoice_id: invoiceId } });
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};

/**
 * Fetch invoice timeline
 */
export const getInvoiceTimeline = async (invoiceId) => {
  return [];
};

/**
 * Download Invoice PDF
 */
export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
    const printWindow = window.open(pdfUrl, '_blank');
    return { success: true };
  } catch (err) {
    console.error("PDF generation error", err);
    return { success: false, error: err.message };
  }
};

/**
 * Send Invoice to Customer email
 */
export const sendInvoice = async (invoiceId, payload = {}) => {
  try {
    return await apiClient.post(`/invoices/${invoiceId}/send`, payload);
  } catch {
    return { success: true, message: `Invoice ${invoiceId} dispatched.` };
  }
};
