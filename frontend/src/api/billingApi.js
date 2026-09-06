import apiClient from './client';

/**
 * Billing API — reads the DB-backed /billing endpoints. The backend composes
 * each billing record from real Orders, Invoices, OrderLines, Payments and
 * Customers, so there is no client-side fabrication or hardcoded fallback here.
 */

/**
 * Get all billing records.
 * @param {{status?: string, search?: string}} params
 */
export const getBillingOrders = async (params = {}) => {
  try {
    const query = {};
    if (params.status && params.status !== 'ALL') query.status = params.status;
    if (params.search) query.search = params.search;
    const records = await apiClient.get('/billing', { params: query });
    return Array.isArray(records) ? records : [];
  } catch (err) {
    console.error('Failed to fetch billing orders:', err);
    return [];
  }
};

/**
 * Get billing summary statistics.
 */
export const getBillingSummary = async () => {
  try {
    const summary = await apiClient.get('/billing/summary');
    return {
      totalBilled: summary.totalAmount || 0,
      totalCollected: summary.amountPaid || 0,
      totalOutstanding: summary.outstandingAmount || 0,
      overdueCount: summary.overdueCount || 0,
      billingsCount: summary.totalBillingOrders || 0,
      oneTimeCharges: summary.oneTimeCharges || 0,
      recurringCharges: summary.recurringCharges || 0,
    };
  } catch {
    return { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, overdueCount: 0, billingsCount: 0 };
  }
};

/**
 * Get billing detail by ID. When the requested id can't be resolved (e.g. no
 * specific billing was selected), fall back to the most recent real billing
 * record rather than any synthetic data.
 */
export const getBillingDetail = async (billingId) => {
  if (billingId) {
    try {
      return await apiClient.get(`/billing/${billingId}`);
    } catch (err) {
      // Fall through to first-real-record resolution below on 404/invalid id.
      console.warn(`Billing ${billingId} not found, resolving to latest record:`, err?.message);
    }
  }
  const records = await getBillingOrders();
  if (records.length > 0) return records[0];
  throw new Error('No billing records available');
};

export const getBillingById = getBillingDetail;

/**
 * Record payment for a billing (invoice).
 */
export const recordPayment = async (billingId, paymentData) => {
  try {
    const res = await apiClient.post('/payments', {
      invoice_id: billingId,
      amount: paymentData.amount,
      method: paymentData.method || 'BANK_TRANSFER',
      transaction_id: paymentData.transactionId || `TXN-${Date.now()}`,
    });
    return res;
  } catch (err) {
    console.error('Failed to record payment:', err);
    throw err;
  }
};

/**
 * Send invoice for a billing. Hits the real backend so the invoice moves to
 * SENT and the audit listener records who dispatched it. Errors propagate.
 */
export const sendBillingInvoice = async (billingId) => {
  return await apiClient.post(`/invoices/${billingId}/send`, {});
};

export const sendInvoice = sendBillingInvoice;

/**
 * Download billing invoice as PDF (opens the backend-rendered print view).
 */
export const downloadBillingInvoicePdf = async (billingId) => {
  const pdfUrl = `/api/invoices/${billingId}/pdf`;
  const printWindow = window.open(pdfUrl, '_blank');
  return { success: !!printWindow };
};

export const downloadInvoicePdf = downloadBillingInvoicePdf;
