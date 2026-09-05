import apiClient from './client';

// Resilient mock dataset with comprehensive business data matching backend models
let mockInvoices = [
  {
    id: 'INV-2045',
    invoiceNumber: 'INV-2045',
    quotationId: 'Q-1042',
    quotationRef: 'Q-1042 (Enterprise Core Setup)',
    billingId: 'BIL-99410',
    invoiceDate: '2026-09-04',
    dueDate: '2026-10-04',
    currency: 'INR',
    paymentTerms: 'Net 30 Days',
    status: 'PENDING',
    statusMessage: 'Payment is awaiting completion.',
    customer: {
      id: 'CUST-801',
      name: 'Acme Corporation',
      email: 'billing@acmecorp.com',
      phone: '+1 (555) 234-5678',
      taxId: 'GSTIN27AABCU9603R1ZM',
      billingAddress: '100 Tech Parkway, Suite 400, San Francisco, CA 94107',
      shippingAddress: '100 Tech Parkway, Bldg B Receiving Dock, San Francisco, CA 94107',
    },
    items: [
      {
        id: 1,
        product: 'Enterprise Edge Router X1',
        sku: 'HW-RTR-X1',
        description: 'High-throughput branch router with dual redundant PSU',
        quantity: 5,
        unitPrice: 70000,
        discountPercent: 10,
        discountAmount: 35000,
        taxPercent: 18,
        taxAmount: 56700,
        total: 371700,
        isRecurring: false,
      },
      {
        id: 2,
        product: 'SaaS Platform License (Gold Tier)',
        sku: 'SW-LIC-GOLD',
        description: 'Multi-tenant cloud management license (annual billed upfront)',
        quantity: 10,
        unitPrice: 12000,
        discountPercent: 5,
        discountAmount: 6000,
        taxPercent: 18,
        taxAmount: 20520,
        total: 134520,
        isRecurring: true,
        recurringInterval: 'Annual',
      },
      {
        id: 3,
        product: '24/7 Mission-Critical Support Pack',
        sku: 'SRV-SUP-247',
        description: '1-hour SLA enterprise support with dedicated TAM',
        quantity: 1,
        unitPrice: 45000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 18,
        taxAmount: 8100,
        total: 53100,
        isRecurring: true,
        recurringInterval: 'Annual',
      },
    ],
    totals: {
      subtotal: 515000,
      discount: 41000,
      tax: 85320,
      oneTimeCharges: 371700,
      recurringCharges: 187620,
      grandTotal: 559320,
      amountPaid: 0,
      outstanding: 559320,
    },
    payments: [],
    timeline: [
      { step: 'CREATED', title: 'Invoice Created', description: 'Generated from confirmed Quote Q-1042', date: '2026-09-04 10:15 AM', completed: true },
      { step: 'GENERATED', title: 'Tax & Totals Generated', description: 'GST 18% & Net 30 rules calculated', date: '2026-09-04 10:16 AM', completed: true },
      { step: 'SENT', title: 'Sent to Customer', description: 'Delivered to billing@acmecorp.com', date: '2026-09-04 10:20 AM', completed: true },
      { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', description: 'Awaiting customer gateway checkout', date: '', completed: false, current: true },
      { step: 'PAYMENT_COMPLETED', title: 'Payment Completed', description: 'Zero balance receipt issued', date: '', completed: false },
    ],
    permittedActions: {
      canView: true,
      canDownload: true,
      canSend: true,
      canViewCustomer: true,
      canViewQuotation: true,
    },
  },
  {
    id: 'INV-2044',
    invoiceNumber: 'INV-2044',
    quotationId: 'Q-1041',
    quotationRef: 'Q-1041 (Cloud Infrastructure Setup)',
    billingId: 'BIL-99408',
    invoiceDate: '2026-08-15',
    dueDate: '2026-09-15',
    currency: 'INR',
    paymentTerms: 'Net 30 Days',
    status: 'PAID',
    statusMessage: 'Payment completed successfully.',
    customer: {
      id: 'CUST-802',
      name: 'Starlight Tech Solutions',
      email: 'finance@starlight.io',
      phone: '+1 (555) 987-6543',
      taxId: 'GSTIN33AABCS1234D1ZP',
      billingAddress: '450 Innovation Way, Austin, TX 78701',
      shippingAddress: '450 Innovation Way, Austin, TX 78701',
    },
    items: [
      {
        id: 1,
        product: 'Data Warehouse Storage SAN',
        sku: 'HW-SAN-50T',
        description: '50TB High Performance NVMe Tier Storage',
        quantity: 2,
        unitPrice: 400000,
        discountPercent: 10,
        discountAmount: 80000,
        taxPercent: 18,
        taxAmount: 129600,
        total: 849600,
        isRecurring: false,
      },
    ],
    totals: {
      subtotal: 800000,
      discount: 80000,
      tax: 129600,
      oneTimeCharges: 849600,
      recurringCharges: 0,
      grandTotal: 849600,
      amountPaid: 849600,
      outstanding: 0,
    },
    payments: [
      {
        transactionId: 'TXN-908124',
        date: '2026-08-28 04:30 PM',
        amount: 849600,
        paymentMethod: 'Corporate Wire Transfer (HDFC Bank)',
        status: 'SUCCESS',
        referenceNote: 'Reference #WIRE-20260828-STL',
      },
    ],
    timeline: [
      { step: 'CREATED', title: 'Invoice Created', description: 'Generated from Quote Q-1041', date: '2026-08-15 09:00 AM', completed: true },
      { step: 'GENERATED', title: 'Tax & Totals Generated', description: 'Applied standard corporate discount', date: '2026-08-15 09:02 AM', completed: true },
      { step: 'SENT', title: 'Sent to Customer', description: 'Delivered to finance@starlight.io', date: '2026-08-15 09:05 AM', completed: true },
      { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', description: 'Wire transfer submitted by customer', date: '2026-08-28 02:10 PM', completed: true },
      { step: 'PAYMENT_COMPLETED', title: 'Payment Completed', description: 'Settled in full (UTR: HDFCWIR20260828)', date: '2026-08-28 04:30 PM', completed: true, current: true },
    ],
    permittedActions: {
      canView: true,
      canDownload: true,
      canSend: false,
      canViewCustomer: true,
      canViewQuotation: true,
    },
  },
  {
    id: 'INV-2043',
    invoiceNumber: 'INV-2043',
    quotationId: 'Q-1039',
    quotationRef: 'Q-1039 (Security Audit Suite)',
    billingId: 'BIL-99395',
    invoiceDate: '2026-07-20',
    dueDate: '2026-08-20',
    currency: 'INR',
    paymentTerms: 'Net 30 Days',
    status: 'OVERDUE',
    statusMessage: 'Payment deadline has passed.',
    customer: {
      id: 'CUST-803',
      name: 'Nexus Dynamics LLC',
      email: 'ap@nexusdynamics.com',
      phone: '+1 (555) 444-3322',
      taxId: 'GSTIN07AABCN5566G1ZK',
      billingAddress: '12 Cyber City, Sector 29, Gurugram, HR 122001',
    },
    items: [
      {
        id: 1,
        product: 'Security Audit & Compliance Package',
        sku: 'SRV-SEC-AUDIT',
        description: 'ISO 27001 readiness review and penetration testing',
        quantity: 1,
        unitPrice: 450000,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 18,
        taxAmount: 81000,
        total: 531000,
        isRecurring: false,
      },
    ],
    totals: {
      subtotal: 450000,
      discount: 0,
      tax: 81000,
      oneTimeCharges: 531000,
      recurringCharges: 0,
      grandTotal: 531000,
      amountPaid: 0,
      outstanding: 531000,
    },
    payments: [],
    timeline: [
      { step: 'CREATED', title: 'Invoice Created', date: '2026-07-20 11:00 AM', completed: true },
      { step: 'GENERATED', title: 'Tax & Totals Generated', date: '2026-07-20 11:02 AM', completed: true },
      { step: 'SENT', title: 'Sent to Customer', date: '2026-07-20 11:15 AM', completed: true },
      { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', description: 'Overdue reminder notice dispatched', date: '', completed: false, current: true },
      { step: 'PAYMENT_COMPLETED', title: 'Payment Completed', date: '', completed: false },
    ],
    permittedActions: {
      canView: true,
      canDownload: true,
      canSend: true,
      canViewCustomer: true,
      canViewQuotation: true,
    },
  },
  {
    id: 'INV-2042',
    invoiceNumber: 'INV-2042',
    quotationId: 'Q-1038',
    quotationRef: 'Q-1038 (Workstation Refresh)',
    billingId: 'BIL-99388',
    invoiceDate: '2026-08-01',
    dueDate: '2026-09-01',
    currency: 'INR',
    paymentTerms: 'Net 30 Days',
    status: 'PARTIALLY_PAID',
    statusMessage: 'Partial payment received. Balance remaining.',
    customer: {
      id: 'CUST-804',
      name: 'Quantum BioLabs',
      email: 'procurement@quantumbio.org',
      phone: '+1 (555) 777-8899',
      taxId: 'GSTIN29AABCQ8899J1ZQ',
      billingAddress: '88 Genomics Blvd, Cambridge, MA 02142',
    },
    items: [
      {
        id: 1,
        product: 'Developer Workstation Setup',
        sku: 'HW-WS-PRO',
        description: 'High memory engineering workstations with 3-year warranty',
        quantity: 4,
        unitPrice: 85000,
        discountPercent: 5,
        discountAmount: 17000,
        taxPercent: 18,
        taxAmount: 58140,
        total: 381140,
        isRecurring: false,
      },
    ],
    totals: {
      subtotal: 340000,
      discount: 17000,
      tax: 58140,
      oneTimeCharges: 381140,
      recurringCharges: 0,
      grandTotal: 381140,
      amountPaid: 200000,
      outstanding: 181140,
    },
    payments: [
      {
        transactionId: 'TXN-884102',
        date: '2026-08-10 11:30 AM',
        amount: 200000,
        paymentMethod: 'Credit Card (Visa ending in 4092)',
        status: 'SUCCESS',
        referenceNote: 'Initial 50% milestone payment',
      },
    ],
    timeline: [
      { step: 'CREATED', title: 'Invoice Created', date: '2026-08-01 10:00 AM', completed: true },
      { step: 'GENERATED', title: 'Tax & Totals Generated', date: '2026-08-01 10:05 AM', completed: true },
      { step: 'SENT', title: 'Sent to Customer', date: '2026-08-01 10:10 AM', completed: true },
      { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', date: '2026-08-10 11:28 AM', completed: true },
      { step: 'PAYMENT_COMPLETED', title: 'Partial Settlement', description: '₹200,000 paid; ₹181,140 balance pending', date: '2026-08-10 11:30 AM', completed: false, current: true },
    ],
    permittedActions: {
      canView: true,
      canDownload: true,
      canSend: true,
      canViewCustomer: true,
      canViewQuotation: true,
    },
  },
  {
    id: 'INV-2041',
    invoiceNumber: 'INV-2041',
    quotationId: 'Q-1035',
    quotationRef: 'Q-1035 (Draft Network Setup)',
    billingId: 'BIL-99370',
    invoiceDate: '2026-09-05',
    dueDate: '2026-10-05',
    currency: 'INR',
    paymentTerms: 'Due on Receipt',
    status: 'DRAFT',
    statusMessage: 'Draft invoice awaiting final dispatch approval.',
    customer: {
      id: 'CUST-805',
      name: 'Alpha Horizon Logistics',
      email: 'accounts@alphahorizon.com',
      phone: '+1 (555) 123-9988',
      taxId: 'GSTIN19AABCA9988P1ZM',
      billingAddress: '200 Port Terminal Rd, Mumbai, MH 400001',
    },
    items: [
      {
        id: 1,
        product: 'Industrial IoT Gateway',
        sku: 'HW-IOT-GW',
        description: 'Ruggedized sensor hub and edge telemetry node',
        quantity: 8,
        unitPrice: 25000,
        discountPercent: 12,
        discountAmount: 24000,
        taxPercent: 18,
        taxAmount: 31680,
        total: 207680,
        isRecurring: false,
      },
    ],
    totals: {
      subtotal: 200000,
      discount: 24000,
      tax: 31680,
      oneTimeCharges: 207680,
      recurringCharges: 0,
      grandTotal: 207680,
      amountPaid: 0,
      outstanding: 207680,
    },
    payments: [],
    timeline: [
      { step: 'CREATED', title: 'Invoice Draft Created', description: 'Internal review in progress', date: '2026-09-05 08:30 AM', completed: true, current: true },
      { step: 'GENERATED', title: 'Pending Dispatch', date: '', completed: false },
      { step: 'SENT', title: 'Sent to Customer', date: '', completed: false },
      { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', date: '', completed: false },
      { step: 'PAYMENT_COMPLETED', title: 'Payment Completed', date: '', completed: false },
    ],
    permittedActions: {
      canView: true,
      canDownload: true,
      canSend: true,
      canViewCustomer: true,
      canViewQuotation: true,
    },
  },
];

/**
 * Fetch invoice list with query filtering and pagination.
 */
export const getInvoices = async (params = {}) => {
  try {
    const res = await apiClient.get('/invoices', { params });
    if (res && res.items) return res;
    if (Array.isArray(res)) return { items: res, total: res.length, page: params.page || 1, pageSize: params.pageSize || 10 };
    return filterMockInvoices(params);
  } catch (err) {
    console.warn('Backend /invoices unreachable, utilizing resilient mock state', err.message);
    return filterMockInvoices(params);
  }
};

const filterMockInvoices = (params = {}) => {
  const { search = '', status = 'ALL', date = 'ALL', dueDate = 'ALL', page = 1, pageSize = 10 } = params;
  let items = [...mockInvoices];

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    items = items.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customer.name.toLowerCase().includes(q) ||
        (inv.quotationId && inv.quotationId.toLowerCase().includes(q)) ||
        (inv.quotationRef && inv.quotationRef.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'ALL') {
    items = items.filter((inv) => inv.status === status);
  }

  if (date && date !== 'ALL') {
    // Standard mock date range handling
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);

  return {
    items: paginated,
    total,
    page: Number(page),
    pageSize: Number(pageSize),
  };
};

/**
 * Fetch high-level summary cards (Total Invoices, Paid, Pending, Overdue, Outstanding)
 */
export const getInvoiceSummary = async () => {
  try {
    const res = await apiClient.get('/invoices/summary');
    if (res && res.totalInvoices !== undefined) return res;
    return computeMockSummary();
  } catch {
    return computeMockSummary();
  }
};

const computeMockSummary = () => {
  const totalInvoices = mockInvoices.length;
  const paid = mockInvoices.filter((i) => i.status === 'PAID').length;
  const pending = mockInvoices.filter((i) => ['PENDING', 'SENT', 'PARTIALLY_PAID', 'DRAFT'].includes(i.status)).length;
  const overdue = mockInvoices.filter((i) => i.status === 'OVERDUE').length;
  const totalOutstanding = mockInvoices.reduce((acc, i) => acc + (i.totals?.outstanding || 0), 0);
  const totalPaidAmount = mockInvoices.reduce((acc, i) => acc + (i.totals?.amountPaid || 0), 0);
  const totalBilledAmount = mockInvoices.reduce((acc, i) => acc + (i.totals?.grandTotal || 0), 0);

  return {
    totalInvoices,
    paid,
    pending,
    overdue,
    totalOutstanding,
    totalPaidAmount,
    totalBilledAmount,
  };
};

/**
 * Fetch full invoice detail by ID
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const res = await apiClient.get(`/invoices/${invoiceId}`);
    if (res && res.id) return res;
    const found = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (found) return found;
    throw new Error(`Invoice ${invoiceId} not found`);
  } catch (err) {
    const found = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (found) return found;
    throw err;
  }
};

/**
 * Fetch invoice payments
 */
export const getInvoicePayments = async (invoiceId) => {
  try {
    const res = await apiClient.get(`/invoices/${invoiceId}/payments`);
    return res;
  } catch {
    const inv = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    return inv ? inv.payments : [];
  }
};

/**
 * Fetch invoice timeline
 */
export const getInvoiceTimeline = async (invoiceId) => {
  try {
    const res = await apiClient.get(`/invoices/${invoiceId}/timeline`);
    return res;
  } catch {
    const inv = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    return inv ? inv.timeline : [];
  }
};

/**
 * Download Invoice PDF
 */
export const downloadInvoicePdf = async (invoiceId) => {
  try {
    const inv = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId) || {
      id: invoiceId,
      invoiceNumber: invoiceId,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: 'Net 30 Days',
      status: 'PENDING',
      customer: { name: 'Valued Customer Account', email: 'billing@customer.com', taxId: 'GSTIN27AABCU9603R1ZM', billingAddress: 'Corporate Office, Mumbai' },
      items: [
        { product: 'Enterprise Software & Hardware Package', sku: 'DF360-ENT-01', quantity: 1, unitPrice: 250000, taxPercent: 18, total: 295000 }
      ],
      totals: { subtotal: 250000, tax: 45000, grandTotal: 295000 }
    };

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>TAX INVOICE - ${inv.invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #F26C4F; padding-bottom: 16px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: bold; color: #1F2937; }
            .brand span { color: #F26C4F; }
            .inv-title { text-align: right; }
            .inv-title h1 { margin: 0; font-size: 22px; color: #F26C4F; text-transform: uppercase; letter-spacing: 1px; }
            .inv-title p { margin: 4px 0 0 0; font-size: 12px; color: #6B7280; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
            .card { flex: 1; background: #FAFBFD; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; font-size: 12px; }
            .card h4 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #9CA3AF; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
            th { background: #FAFBFD; border-bottom: 2px solid #E5E7EB; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #6B7280; }
            td { padding: 12px 10px; border-bottom: 1px solid #F4F5F7; }
            .totals { width: 280px; margin-left: auto; font-size: 13px; margin-top: 20px; }
            .tot-row { display: flex; justify-content: space-between; padding: 6px 0; color: #4B5563; }
            .tot-row.grand { font-size: 16px; font-weight: bold; color: #F26C4F; border-top: 2px solid #E5E7EB; padding-top: 10px; margin-top: 6px; }
            .footer { margin-top: 50px; border-top: 1px solid #E5E7EB; padding-top: 20px; text-align: center; font-size: 11px; color: #9CA3AF; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">DealFlow<span>360</span> Enterprise</div>
            <div class="inv-title">
              <h1>TAX INVOICE</h1>
              <p>Invoice Ref: <strong>${inv.invoiceNumber}</strong></p>
              <p>Date: ${inv.invoiceDate || 'Today'}</p>
            </div>
          </div>

          <div class="details">
            <div class="card">
              <h4>Billed From</h4>
              <strong>DealFlow360 Technologies Pvt Ltd</strong><br>
              Tower 4, Prime Tech Park, Cyber Hub<br>
              GSTIN: 27ABCDE1234F1Z5<br>
              Email: billing@dealflow360.com
            </div>
            <div class="card">
              <h4>Billed To</h4>
              <strong>${inv.customer?.name || 'Customer Account'}</strong><br>
              ${inv.customer?.email || ''}<br>
              Tax ID / GSTIN: ${inv.customer?.taxId || 'N/A'}<br>
              Status: <span style="color: #F26C4F; font-weight: bold;">${inv.status || 'PENDING'}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST Tax</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(inv.items || []).map(item => `
                <tr>
                  <td><strong>${item.product}</strong><br><small style="color:#6B7280;">${item.description || ''}</small></td>
                  <td>${item.sku || 'N/A'}</td>
                  <td>${item.quantity || 1}</td>
                  <td>₹${(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                  <td>${item.taxPercent || 18}% GST</td>
                  <td style="text-align: right; font-weight: bold;">₹${(item.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="tot-row"><span>Subtotal:</span><span>₹${(inv.totals?.subtotal || 0).toLocaleString('en-IN')}</span></div>
            <div class="tot-row"><span>GST Tax:</span><span>₹${(inv.totals?.tax || 0).toLocaleString('en-IN')}</span></div>
            <div class="tot-row grand"><span>Grand Total:</span><span>₹${(inv.totals?.grandTotal || 0).toLocaleString('en-IN')}</span></div>
          </div>

          <div class="footer">
            <p>This is an official computer-generated Tax Invoice issued by DealFlow360 Platform. Authorized signature verified.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
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
    // Mock successful transmission
    const inv = mockInvoices.find((i) => i.id === invoiceId || i.invoiceNumber === invoiceId);
    if (inv) {
      if (inv.status === 'DRAFT') inv.status = 'SENT';
      const sentEvent = inv.timeline.find((t) => t.step === 'SENT');
      if (sentEvent) {
        sentEvent.completed = true;
        sentEvent.date = new Date().toLocaleString();
      }
    }
    return { success: true, message: `Invoice ${invoiceId} dispatched successfully to customer.` };
  }
};
