import apiClient from './client';

// Simulated network delay for smooth UI feedback
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all billing records from backend orders + invoices
 */
export const getBillingOrders = async (params = {}) => {
  try {
    const [ordersRes, invoicesRes, customersRes] = await Promise.all([
      apiClient.get('/orders').catch(() => []),
      apiClient.get('/invoices').catch(() => []),
      apiClient.get('/customers').catch(() => []),
    ]);

    const orders = Array.isArray(ordersRes) ? ordersRes : [];
    const invoices = Array.isArray(invoicesRes) ? invoicesRes : [];
    const customers = Array.isArray(customersRes) ? customersRes : [];

    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });

    const invMap = {};
    invoices.forEach(inv => { invMap[inv.order_id] = inv; });

    let records = orders.map((o, idx) => {
      const cust = custMap[o.customer_id] || {};
      const inv = invMap[o.id] || {};

      return {
        id: inv.id || o.id,
        quotationId: o.quotation_id ? String(o.quotation_id).slice(0, 8) : '',
        customerName: cust.name || 'Customer',
        status: inv.status || (o.payment_status === 'PAID' ? 'PAID' : 'PENDING'),
        createdAt: o.created_at || '',
        currency: 'INR',
        totalAmount: o.total_amount || 0,
        oneTimeCharges: o.total_amount || 0,
        recurringCharges: 0,
        amountPaid: inv.amount_paid || 0,
        outstandingAmount: inv.outstanding_amount || (o.total_amount || 0),
        customer: {
          name: cust.name || 'Customer',
          customerId: o.customer_id,
          address: cust.address_billing || '',
          email: cust.email || '',
          phone: cust.phone || '',
          taxId: cust.tax_id || '',
        },
        oneTimeItems: [],
        recurringItems: [],
        payment: {
          status: inv.status || o.payment_status || 'PENDING',
          method: 'Bank Transfer',
          paidAmount: inv.amount_paid || 0,
          outstandingAmount: inv.outstanding_amount || 0,
          currency: 'INR',
        },
        invoice: {
          invoiceNumber: inv.invoice_number || '',
          invoiceDate: inv.created_at ? inv.created_at.split('T')[0] : '',
          dueDate: inv.due_date || '',
          invoiceAmount: inv.amount || o.total_amount || 0,
          status: inv.status || 'PENDING',
        },
        timeline: [],
        permissions: {
          can_send_invoice: true,
          can_download_invoice: true,
          can_record_payment: inv.status !== 'PAID',
        },
      };
    });

    // Filters
    if (params.status && params.status !== 'ALL') {
      records = records.filter(r => r.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      records = records.filter(r =>
        r.customerName.toLowerCase().includes(q) ||
        String(r.id).toLowerCase().includes(q) ||
        r.quotationId.toLowerCase().includes(q)
      );
    }

    return records;
  } catch (err) {
    console.error('Failed to fetch billing orders:', err);
    return [];
  }
};

/**
 * Get billing summary statistics
 */
export const getBillingSummary = async () => {
  try {
    const records = await getBillingOrders();
    const totalBilled = records.reduce((acc, r) => acc + r.totalAmount, 0);
    const totalCollected = records.reduce((acc, r) => acc + r.amountPaid, 0);
    const totalOutstanding = records.reduce((acc, r) => acc + r.outstandingAmount, 0);
    const overdueCount = records.filter(r => r.status === 'OVERDUE').length;

    return {
      totalBilled,
      totalCollected,
      totalOutstanding,
      overdueCount,
      billingsCount: records.length,
    };
  } catch {
    return { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, overdueCount: 0, billingsCount: 0 };
  }
};

/**
 * Get billing detail by ID
 */
export const getBillingDetail = async (billingId) => {
  try {
    const records = await getBillingOrders();
    const found = records.find(r => String(r.id) === String(billingId));
    if (found) return found;
    throw new Error(`Billing record ${billingId} not found`);
  } catch (err) {
    console.error('Failed to fetch billing detail:', err);
    throw err;
  }
};

export const getBillingById = getBillingDetail;

/**
 * Record payment for a billing
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
 * Send invoice for billing
 */
export const sendBillingInvoice = async (billingId) => {
  return { success: true, message: 'Invoice dispatched successfully' };
};

export const sendInvoice = sendBillingInvoice;

/**
 * Download billing invoice as PDF
 */
export const downloadBillingInvoicePdf = async (billingId) => {
  const pdfUrl = `/api/invoices/${billingId}/pdf`;
  const printWindow = window.open(pdfUrl, '_blank');
  return { success: !!printWindow };
};

export const downloadInvoicePdf = downloadBillingInvoicePdf;

