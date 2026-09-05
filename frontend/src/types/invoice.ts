export type InvoiceStatus =
  | 'DRAFT'
  | 'SENT'
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface InvoiceCustomer {
  id: string;
  name: string;
  email: string;
  billingAddress: string;
  shippingAddress?: string;
  taxId?: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string | number;
  product: string;
  sku: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount?: number;
  taxPercent: number;
  taxAmount?: number;
  total: number;
  isRecurring?: boolean;
  recurringInterval?: string;
}

export interface InvoicePayment {
  transactionId: string;
  date: string;
  amount: number;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  referenceNote?: string;
}

export interface InvoiceTimelineEvent {
  step: string;
  title: string;
  description?: string;
  date?: string;
  completed: boolean;
  current?: boolean;
}

export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  oneTimeCharges: number;
  recurringCharges: number;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  quotationRef?: string;
  billingId?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  paymentTerms: string;
  status: InvoiceStatus;
  statusMessage?: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  totals: InvoiceTotals;
  payments: InvoicePayment[];
  timeline: InvoiceTimelineEvent[];
  permittedActions?: {
    canView: boolean;
    canDownload: boolean;
    canSend: boolean;
    canViewCustomer: boolean;
    canViewQuotation: boolean;
  };
}

export interface InvoiceSummary {
  totalInvoices: number;
  paid: number;
  pending: number;
  overdue: number;
  totalOutstanding: number;
  totalPaidAmount?: number;
  totalBilledAmount?: number;
}
