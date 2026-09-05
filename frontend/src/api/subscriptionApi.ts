import apiClient from './client';

export interface Subscription {
  id: string;
  customerId?: string;
  customerName?: string;
  quotationId?: string;
  planName?: string;
  quantity?: number;
  recurringAmount?: number;
  billingCycle?: string;
  startDate?: string;
  nextBillingDate?: string;
  status?: string;
  paymentStatus?: string;
  permissions?: { canPause: boolean; canResume: boolean; canCancel: boolean };
}

export interface SubscriptionSummary {
  activeSubscriptions: number;
  expiringSoon: number;
  suspendedSubscriptions: number;
  monthlyRecurringRevenue: number;
}

export interface SubscriptionBillingPeriod {
  id: string;
  billingPeriod: string;
  billingDate: string;
  amount: number;
  invoiceId?: string;
  paymentStatus: string;
}

export interface SubscriptionTimelineEvent {
  id: string;
  status: string;
  date: string;
  description: string;
}

export const getSubscriptions = async (filters?: { search?: string; status?: string; billingCycle?: string }): Promise<Subscription[]> => {
  try {
    const data = await apiClient.get('/subscriptions');
    let results: any[] = Array.isArray(data) ? data : [];

    // Map backend format to frontend format
    results = results.map((s: any) => ({
      id: s.id,
      customerId: s.customer_id,
      customerName: s.customer_name || 'Customer',
      planName: s.plan_name || 'Subscription Plan',
      quantity: s.quantity || 1,
      recurringAmount: s.total_amount || s.plan_price || 0,
      billingCycle: s.billing_cycle || s.plan_billing_cycle || 'MONTHLY',
      startDate: s.start_date || '',
      nextBillingDate: s.next_billing_date || '',
      status: s.status || 'ACTIVE',
      paymentStatus: s.status === 'ACTIVE' ? 'PAID' : 'PENDING',
      permissions: { canPause: s.status === 'ACTIVE', canResume: s.status === 'PAUSED' || s.status === 'SUSPENDED', canCancel: s.status !== 'CANCELLED' },
    }));

    if (filters) {
      if (filters.status && filters.status !== 'All') {
        results = results.filter((s: Subscription) => s.status === filters.status);
      }
      if (filters.billingCycle && filters.billingCycle !== 'All') {
        results = results.filter((s: Subscription) => s.billingCycle === filters.billingCycle);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter((s: Subscription) =>
          String(s.id).toLowerCase().includes(q) ||
          (s.customerName || '').toLowerCase().includes(q) ||
          (s.planName || '').toLowerCase().includes(q)
        );
      }
    }

    return results;
  } catch (err) {
    console.error('Failed to fetch subscriptions:', err);
    return [];
  }
};

export const getSubscriptionSummary = async (): Promise<SubscriptionSummary> => {
  try {
    const data = await apiClient.get('/subscriptions');
    const list: any[] = Array.isArray(data) ? data : [];
    const active = list.filter((s: any) => s.status === 'ACTIVE').length;
    const suspended = list.filter((s: any) => s.status === 'SUSPENDED' || s.status === 'PAUSED').length;
    const mrr = list
      .filter((s: any) => s.status === 'ACTIVE')
      .reduce((acc: number, s: any) => acc + (s.total_amount || s.plan_price || 0), 0);

    return {
      activeSubscriptions: active,
      expiringSoon: 0,
      suspendedSubscriptions: suspended,
      monthlyRecurringRevenue: mrr,
    };
  } catch (err) {
    console.error('Failed to fetch subscription summary:', err);
    return { activeSubscriptions: 0, expiringSoon: 0, suspendedSubscriptions: 0, monthlyRecurringRevenue: 0 };
  }
};

export const getSubscriptionById = async (id: string): Promise<Subscription> => {
  const subs = await getSubscriptions();
  const sub = subs.find((s: Subscription) => String(s.id) === String(id));
  if (!sub) throw new Error("Subscription not found");
  return sub;
};

export const getBillingSchedule = async (_id: string): Promise<SubscriptionBillingPeriod[]> => {
  return [];
};

export const getSubscriptionTimeline = async (_id: string): Promise<SubscriptionTimelineEvent[]> => {
  return [];
};

export const pauseSubscription = async (id: string): Promise<Subscription> => {
  const res = await apiClient.put(`/subscriptions/${id}`, { status: 'PAUSED' });
  return res as Subscription;
};

export const resumeSubscription = async (id: string): Promise<Subscription> => {
  const res = await apiClient.put(`/subscriptions/${id}`, { status: 'ACTIVE' });
  return res as Subscription;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const res = await apiClient.post(`/subscriptions/${id}/cancel`);
  return res as Subscription;
};
