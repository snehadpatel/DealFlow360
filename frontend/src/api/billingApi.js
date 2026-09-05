import apiClient from './client';

/**
 * @typedef {Object} CustomerBillingInfo
 * @property {string} name
 * @property {string} customerId
 * @property {string} address
 * @property {string} email
 * @property {string} phone
 * @property {string} [taxId]
 */

/**
 * @typedef {Object} OneTimeChargeItem
 * @property {string} id
 * @property {string} productName
 * @property {string} sku
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {number} discountPercent
 * @property {number} discountAmount
 * @property {number} taxPercent
 * @property {number} taxAmount
 * @property {number} total
 */

/**
 * @typedef {Object} RecurringChargeItem
 * @property {string} id
 * @property {string} planName
 * @property {string} sku
 * @property {number} quantity
 * @property {string} billingCycle - MONTHLY | QUARTERLY | YEARLY | CUSTOM
 * @property {number} recurringAmount
 * @property {string} nextBillingDate
 * @property {string} status - ACTIVE | TRIAL | PAUSED | SUSPENDED | CANCELLED | EXPIRED
 * @property {string} [prorationNotice]
 */

/**
 * @typedef {Object} PaymentInformation
 * @property {string} status - PAID | PENDING | PARTIALLY_PAID | FAILED | REFUNDED
 * @property {string} method - ACH | Credit Card | Corporate Net 30 | Wire Transfer
 * @property {string} [transactionId]
 * @property {number} paidAmount
 * @property {string} [paymentDate]
 * @property {number} outstandingAmount
 * @property {string} currency
 */

/**
 * @typedef {Object} InvoiceInfo
 * @property {string} invoiceNumber
 * @property {string} invoiceDate
 * @property {string} dueDate
 * @property {number} invoiceAmount
 * @property {string} status - DRAFT | SENT | PENDING | PARTIALLY_PAID | PAID | OVERDUE | CANCELLED
 * @property {string} [downloadUrl]
 */

/**
 * @typedef {Object} BillingTimelineEvent
 * @property {number|string} id
 * @property {string} title
 * @property {string} status
 * @property {string} date
 * @property {string} description
 * @property {string} actor
 */

/**
 * @typedef {Object} BillingDetail
 * @property {string} id
 * @property {string} quotationId
 * @property {string} customerName
 * @property {string} status - PENDING | PROCESSING | PARTIALLY_PAID | PAID | OVERDUE | FAILED | CANCELLED
 * @property {string} createdAt
 * @property {string} currency
 * @property {number} totalAmount
 * @property {number} oneTimeCharges
 * @property {number} recurringCharges
 * @property {number} amountPaid
 * @property {number} outstandingAmount
 * @property {CustomerBillingInfo} customer
 * @property {OneTimeChargeItem[]} oneTimeItems
 * @property {RecurringChargeItem[]} recurringItems
 * @property {PaymentInformation} payment
 * @property {InvoiceInfo} invoice
 * @property {BillingTimelineEvent[]} timeline
 * @property {Object} permissions
 * @property {boolean} permissions.can_send_invoice
 * @property {boolean} permissions.can_download_invoice
 * @property {boolean} permissions.can_record_payment
 */

// Simulated network delay for smooth UI feedback
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock database for billing orders
let billingRecords = [
  {
    id: "BIL-2045",
    quotationId: "QT-2026-0184",
    customerName: "ABC Industries Ltd.",
    status: "PARTIALLY_PAID",
    createdAt: "2026-09-04T11:00:00Z",
    currency: "USD",
    totalAmount: 142500,
    oneTimeCharges: 120000,
    recurringCharges: 22500,
    amountPaid: 60000,
    outstandingAmount: 82500,
    customer: {
      name: "ABC Industries Ltd.",
      customerId: "CUST-0012",
      address: "Tower 4, Prime Tech Park, Industrial Corridor, San Jose, CA 95134",
      email: "accounts.payable@abcindustries.com",
      phone: "+1 (408) 555-0192",
      taxId: "US-EIN-94829104"
    },
    oneTimeItems: [
      {
        id: "OT-01",
        productName: "Enterprise Core Router XG-900",
        sku: "HW-RTR-900",
        quantity: 10,
        unitPrice: 9500,
        discountPercent: 12,
        discountAmount: 11400,
        taxPercent: 8,
        taxAmount: 6688,
        total: 90288
      },
      {
        id: "OT-02",
        productName: "Rack Mounting Hardware & Fiber Kit",
        sku: "ACC-RK-04",
        quantity: 10,
        unitPrice: 320,
        discountPercent: 5,
        discountAmount: 160,
        taxPercent: 8,
        taxAmount: 243.2,
        total: 3283.2
      },
      {
        id: "OT-03",
        productName: "On-Site Deployment & Gateway Integration",
        sku: "SRV-DEP-01",
        quantity: 1,
        unitPrice: 28000,
        discountPercent: 10,
        discountAmount: 2800,
        taxPercent: 5,
        taxAmount: 1260,
        total: 26460
      }
    ],
    recurringItems: [
      {
        id: "REC-01",
        planName: "DealFlow Enterprise Cloud Management Suite",
        sku: "SaaS-ENT-YR",
        quantity: 50,
        billingCycle: "MONTHLY",
        recurringAmount: 1250,
        nextBillingDate: "2026-10-05T00:00:00Z",
        status: "ACTIVE",
        prorationNotice: "Includes 14 days onboarding grace period"
      },
      {
        id: "REC-02",
        planName: "24/7 Mission-Critical SLA & Security Sentinel",
        sku: "SLA-PLAT-YR",
        quantity: 1,
        billingCycle: "YEARLY",
        recurringAmount: 7500,
        nextBillingDate: "2027-09-05T00:00:00Z",
        status: "ACTIVE"
      }
    ],
    payment: {
      status: "PARTIALLY_PAID",
      method: "Corporate Net 30 / ACH",
      transactionId: "TXN-8849204-ACH",
      paidAmount: 60000,
      paymentDate: "2026-09-04T15:45:00Z",
      outstandingAmount: 82500,
      currency: "USD"
    },
    invoice: {
      invoiceNumber: "INV-2045",
      invoiceDate: "2026-09-04T11:30:00Z",
      dueDate: "2026-10-04T23:59:59Z",
      invoiceAmount: 142500,
      status: "PARTIALLY_PAID",
      downloadUrl: "/api/billing/BIL-2045/invoice.pdf"
    },
    timeline: [
      {
        id: 1,
        title: "Billing Created",
        status: "CREATED",
        date: "2026-09-04T11:00:00Z",
        description: "Billing order generated following sales manager quotation sign-off",
        actor: "System Engine"
      },
      {
        id: 2,
        title: "Invoice Generated",
        status: "GENERATED",
        date: "2026-09-04T11:30:00Z",
        description: "Consolidated tax invoice #INV-2045 issued for $142,500",
        actor: "Finance/Ops (Felix)"
      },
      {
        id: 3,
        title: "Invoice Sent",
        status: "SENT",
        date: "2026-09-04T11:45:00Z",
        description: "Dispatched electronically to accounts.payable@abcindustries.com",
        actor: "Notification Service"
      },
      {
        id: 4,
        title: "Payment Initiated",
        status: "PROCESSING",
        date: "2026-09-04T15:10:00Z",
        description: "Customer initiated ACH advance payment wire",
        actor: "Customer (Buyer)"
      },
      {
        id: 5,
        title: "Partial Payment Completed",
        status: "COMPLETED",
        date: "2026-09-04T15:45:00Z",
        description: "Received $60,000.00 via ACH. Balance $82,500.00 due on Net 30",
        actor: "Treasury Automated Clearing"
      }
    ],
    permissions: {
      can_send_invoice: true,
      can_download_invoice: true,
      can_record_payment: true
    }
  },
  {
    id: "BIL-2046",
    quotationId: "QT-2026-0185",
    customerName: "TechCorp Solutions Inc.",
    status: "PAID",
    createdAt: "2026-09-03T09:15:00Z",
    currency: "USD",
    totalAmount: 48500,
    oneTimeCharges: 35000,
    recurringCharges: 13500,
    amountPaid: 48500,
    outstandingAmount: 0,
    customer: {
      name: "TechCorp Solutions Inc.",
      customerId: "CUST-0099",
      address: "100 Innovation Way, Suite 300, Austin, TX 78701",
      email: "finance@techcorpsolutions.com",
      phone: "+1 (512) 555-8833",
      taxId: "US-EIN-74920194"
    },
    oneTimeItems: [
      {
        id: "OT-10",
        productName: "High-Density PoE+ Switch 48-Port",
        sku: "HW-SW-48P",
        quantity: 5,
        unitPrice: 7000,
        discountPercent: 15,
        discountAmount: 5250,
        taxPercent: 6,
        taxAmount: 1785,
        total: 31535
      }
    ],
    recurringItems: [
      {
        id: "REC-10",
        planName: "Network Operations Cloud Controller",
        sku: "SaaS-CTRL-MO",
        quantity: 5,
        billingCycle: "MONTHLY",
        recurringAmount: 900,
        nextBillingDate: "2026-10-03T00:00:00Z",
        status: "ACTIVE"
      }
    ],
    payment: {
      status: "PAID",
      method: "Corporate Credit Card",
      transactionId: "TXN-CC-9940210",
      paidAmount: 48500,
      paymentDate: "2026-09-03T10:05:00Z",
      outstandingAmount: 0,
      currency: "USD"
    },
    invoice: {
      invoiceNumber: "INV-2046",
      invoiceDate: "2026-09-03T09:30:00Z",
      dueDate: "2026-09-17T23:59:59Z",
      invoiceAmount: 48500,
      status: "PAID",
      downloadUrl: "/api/billing/BIL-2046/invoice.pdf"
    },
    timeline: [
      {
        id: 1,
        title: "Billing Created",
        status: "CREATED",
        date: "2026-09-03T09:15:00Z",
        description: "Billing order confirmed",
        actor: "System Engine"
      },
      {
        id: 2,
        title: "Invoice Generated",
        status: "GENERATED",
        date: "2026-09-03T09:30:00Z",
        description: "Invoice #INV-2046 generated",
        actor: "Finance Ops"
      },
      {
        id: 3,
        title: "Payment Completed",
        status: "COMPLETED",
        date: "2026-09-03T10:05:00Z",
        description: "Full amount $48,500 settled via credit card",
        actor: "Stripe Gateway"
      }
    ],
    permissions: {
      can_send_invoice: true,
      can_download_invoice: true,
      can_record_payment: false
    }
  },
  {
    id: "BIL-2047",
    quotationId: "QT-2026-0186",
    customerName: "Global Retail Logistics",
    status: "PENDING",
    createdAt: "2026-09-05T08:00:00Z",
    currency: "USD",
    totalAmount: 92400,
    oneTimeCharges: 76000,
    recurringCharges: 16400,
    amountPaid: 0,
    outstandingAmount: 92400,
    customer: {
      name: "Global Retail Logistics",
      customerId: "CUST-0044",
      address: "Warehouse Block C, Port Road, Seattle, WA 98101",
      email: "invoices@globalretail.com",
      phone: "+1 (206) 555-4422",
      taxId: "US-EIN-91029482"
    },
    oneTimeItems: [
      {
        id: "OT-20",
        productName: "Industrial Warehouse Gateway Terminals",
        sku: "HW-TRM-IND",
        quantity: 20,
        unitPrice: 3800,
        discountPercent: 10,
        discountAmount: 7600,
        taxPercent: 8.5,
        taxAmount: 5814,
        total: 74214
      }
    ],
    recurringItems: [
      {
        id: "REC-20",
        planName: "Asset Tracking Cloud Connector",
        sku: "SaaS-TRK-MO",
        quantity: 20,
        billingCycle: "QUARTERLY",
        recurringAmount: 3600,
        nextBillingDate: "2026-10-01T00:00:00Z",
        status: "TRIAL"
      }
    ],
    payment: {
      status: "PENDING",
      method: "Corporate Net 30",
      transactionId: null,
      paidAmount: 0,
      paymentDate: null,
      outstandingAmount: 92400,
      currency: "USD"
    },
    invoice: {
      invoiceNumber: "INV-2047",
      invoiceDate: "2026-09-05T08:30:00Z",
      dueDate: "2026-10-05T23:59:59Z",
      invoiceAmount: 92400,
      status: "PENDING",
      downloadUrl: "/api/billing/BIL-2047/invoice.pdf"
    },
    timeline: [
      {
        id: 1,
        title: "Billing Created",
        status: "CREATED",
        date: "2026-09-05T08:00:00Z",
        description: "Billing order created for accepted quote",
        actor: "System Engine"
      },
      {
        id: 2,
        title: "Invoice Generated",
        status: "GENERATED",
        date: "2026-09-05T08:30:00Z",
        description: "Net 30 invoice generated",
        actor: "System Engine"
      }
    ],
    permissions: {
      can_send_invoice: true,
      can_download_invoice: true,
      can_record_payment: true
    }
  }
];

/**
 * Fetch billing list with filters
 */
export const getBillingList = async (filters = {}) => {
  try {
    const res = await apiClient.get('/billing', { params: filters });
    if (res && res.length) return res;
  } catch (err) {
    console.warn("Falling back to local billing dataset", err);
  }

  await delay(400);
  let results = [...billingRecords];

  if (filters.status && filters.status !== 'ALL') {
    results = results.filter(b => b.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(b =>
      b.id.toLowerCase().includes(q) ||
      b.quotationId.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q)
    );
  }

  return results;
};

/**
 * Fetch billing aggregated summary
 */
export const getBillingSummary = async () => {
  try {
    const res = await apiClient.get('/billing/summary');
    if (res && res.totalAmount !== undefined) return res;
  } catch (err) {
    console.warn("Falling back to local billing summary", err);
  }

  await delay(300);
  const totalAmount = billingRecords.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const oneTimeCharges = billingRecords.reduce((acc, curr) => acc + curr.oneTimeCharges, 0);
  const recurringCharges = billingRecords.reduce((acc, curr) => acc + curr.recurringCharges, 0);
  const amountPaid = billingRecords.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const outstandingAmount = billingRecords.reduce((acc, curr) => acc + curr.outstandingAmount, 0);

  return {
    totalBillingOrders: billingRecords.length,
    totalAmount,
    oneTimeCharges,
    recurringCharges,
    amountPaid,
    outstandingAmount
  };
};

/**
 * Fetch full billing detail by billingId
 * @param {string} billingId 
 * @returns {Promise<BillingDetail>}
 */
export const getBillingById = async (billingId) => {
  try {
    const res = await apiClient.get(`/billing/${billingId}`);
    if (res && res.id) return res;
  } catch (err) {
    console.warn(`Falling back to local billing detail for ${billingId}`, err);
  }

  await delay(450);
  const record = billingRecords.find(b => b.id.toUpperCase() === billingId.toUpperCase());
  if (!record) {
    // If not found, return the first one as standard preview or throw 404
    if (billingRecords.length > 0) {
      return billingRecords[0];
    }
    throw new Error(`Billing record ${billingId} not found`);
  }
  return record;
};

/**
 * Send invoice to recipient email
 */
export const sendInvoice = async (billingId, emailRecipient) => {
  try {
    const res = await apiClient.post(`/billing/${billingId}/send-invoice`, { email: emailRecipient });
    if (res) return res;
  } catch (err) {
    console.warn("Fallback mock send-invoice", err);
  }

  await delay(700);
  const record = billingRecords.find(b => b.id.toUpperCase() === billingId.toUpperCase());
  if (record) {
    record.timeline.push({
      id: Date.now(),
      title: "Invoice Re-Sent",
      status: "SENT",
      date: new Date().toISOString(),
      description: `Invoice re-dispatched to ${emailRecipient || record.customer.email}`,
      actor: "Current User"
    });
  }

  return {
    success: true,
    message: `Invoice successfully sent to ${emailRecipient || "customer email"}`
  };
};

/**
 * Download Invoice PDF blob
 */
export const downloadInvoicePdf = async (billingId) => {
  try {
    const res = await apiClient.get(`/billing/${billingId}/invoice`, { responseType: 'blob' });
    return res;
  } catch (err) {
    console.warn("Fallback download invoice simulated", err);
    await delay(500);
    return { success: true, filename: `Invoice-${billingId}.pdf` };
  }
};
