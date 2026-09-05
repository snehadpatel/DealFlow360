export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'PAUSED' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'UPCOMING' | 'FAILED';

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  quotationId: string;
  planName: string;
  quantity: number;
  recurringAmount: number;
  billingCycle: BillingCycle;
  startDate: string; // ISO 8601 Date string
  endDate?: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  permissions: {
    canPause: boolean;
    canResume: boolean;
    canCancel: boolean;
  };
}

export interface SubscriptionBillingPeriod {
  id: string;
  billingPeriod: string; // e.g. "September 2026"
  billingDate: string; // e.g. "05 Sep 2026"
  amount: number;
  invoiceId?: string; // e.g. "INV-2045"
  paymentStatus: PaymentStatus;
}

export interface SubscriptionTimelineEvent {
  id: string;
  status: string; // e.g. "Subscription Created", "Activated"
  date: string; // ISO date
  description: string;
}

export interface SubscriptionSummary {
  activeSubscriptions: number;
  expiringSoon: number;
  suspendedSubscriptions: number;
  monthlyRecurringRevenue: number;
}
