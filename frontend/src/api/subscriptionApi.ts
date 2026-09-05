import {
  Subscription,
  SubscriptionSummary,
  SubscriptionBillingPeriod,
  SubscriptionTimelineEvent
} from '../types/subscription';

/**
 * Mock Data
 */
let mockSubscriptions: Subscription[] = [
  {
    id: "SUB-8091",
    customerId: "CUST-0012",
    customerName: "ABC Industries",
    quotationId: "QT-2026-0184",
    planName: "Enterprise Platform License",
    quantity: 50,
    recurringAmount: 12500,
    billingCycle: "MONTHLY",
    startDate: "2026-01-15T00:00:00Z",
    nextBillingDate: "2026-10-15T00:00:00Z",
    status: "ACTIVE",
    paymentStatus: "PAID",
    permissions: { canPause: true, canResume: false, canCancel: true }
  },
  {
    id: "SUB-8092",
    customerId: "CUST-0099",
    customerName: "TechCorp Solutions",
    quotationId: "QT-2026-0185",
    planName: "Pro Analytics Add-on",
    quantity: 1,
    recurringAmount: 45000,
    billingCycle: "YEARLY",
    startDate: "2025-11-01T00:00:00Z",
    nextBillingDate: "2026-11-01T00:00:00Z",
    status: "ACTIVE",
    paymentStatus: "PENDING",
    permissions: { canPause: true, canResume: false, canCancel: true }
  },
  {
    id: "SUB-8093",
    customerId: "CUST-0044",
    customerName: "Global Retail",
    quotationId: "QT-2026-0170",
    planName: "Basic SaaS Tier",
    quantity: 10,
    recurringAmount: 1500,
    billingCycle: "MONTHLY",
    startDate: "2026-06-01T00:00:00Z",
    nextBillingDate: "2026-09-01T00:00:00Z",
    status: "SUSPENDED",
    paymentStatus: "FAILED",
    permissions: { canPause: false, canResume: true, canCancel: true }
  },
  {
    id: "SUB-8094",
    customerId: "CUST-0105",
    customerName: "NextGen Logistics",
    quotationId: "QT-2026-0190",
    planName: "Standard CRM Access",
    quantity: 25,
    recurringAmount: 5000,
    billingCycle: "QUARTERLY",
    startDate: "2026-08-15T00:00:00Z",
    nextBillingDate: "2026-11-15T00:00:00Z",
    status: "TRIAL",
    paymentStatus: "UPCOMING",
    permissions: { canPause: false, canResume: false, canCancel: true }
  }
];

const mockBillingSchedules: Record<string, SubscriptionBillingPeriod[]> = {
  "SUB-8091": [
    { id: "BS-1", billingPeriod: "July 2026", billingDate: "15 Jul 2026", amount: 12500, invoiceId: "INV-2010", paymentStatus: "PAID" },
    { id: "BS-2", billingPeriod: "August 2026", billingDate: "15 Aug 2026", amount: 12500, invoiceId: "INV-2045", paymentStatus: "PAID" },
    { id: "BS-3", billingPeriod: "September 2026", billingDate: "15 Sep 2026", amount: 12500, invoiceId: "INV-2090", paymentStatus: "PAID" },
    { id: "BS-4", billingPeriod: "October 2026", billingDate: "15 Oct 2026", amount: 12500, paymentStatus: "UPCOMING" }
  ]
};

const mockTimelines: Record<string, SubscriptionTimelineEvent[]> = {
  "SUB-8091": [
    { id: "TE-1", status: "Subscription Created", date: "2026-01-14T10:00:00Z", description: "Created from Quotation QT-2026-0184" },
    { id: "TE-2", status: "Activated", date: "2026-01-15T00:00:00Z", description: "First payment received, subscription active" },
    { id: "TE-3", status: "Billing Started", date: "2026-01-15T00:00:00Z", description: "Monthly billing cycle initiated" },
    { id: "TE-4", status: "Renewed", date: "2026-09-15T00:00:00Z", description: "Automatically renewed for current month" },
    { id: "TE-5", status: "Next Billing", date: "2026-10-15T00:00:00Z", description: "Upcoming invoice generation" }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSubscriptions = async (filters?: { search?: string; status?: string; billingCycle?: string }): Promise<Subscription[]> => {
  await delay(700);
  let results = [...mockSubscriptions];

  if (filters) {
    if (filters.status && filters.status !== 'All') {
      results = results.filter(s => s.status === filters.status);
    }
    if (filters.billingCycle && filters.billingCycle !== 'All') {
      results = results.filter(s => s.billingCycle === filters.billingCycle);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(s => 
        s.id.toLowerCase().includes(q) || 
        s.customerName.toLowerCase().includes(q) || 
        s.planName.toLowerCase().includes(q)
      );
    }
  }

  return results;
};

export const getSubscriptionSummary = async (): Promise<SubscriptionSummary> => {
  await delay(500);
  return {
    activeSubscriptions: 142,
    expiringSoon: 18,
    suspendedSubscriptions: 4,
    monthlyRecurringRevenue: 485000
  };
};

export const getSubscriptionById = async (id: string): Promise<Subscription> => {
  await delay(600);
  const sub = mockSubscriptions.find(s => s.id === id);
  if (!sub) throw new Error("Subscription not found");
  return sub;
};

export const getBillingSchedule = async (id: string): Promise<SubscriptionBillingPeriod[]> => {
  await delay(600);
  return mockBillingSchedules[id] || [];
};

export const getSubscriptionTimeline = async (id: string): Promise<SubscriptionTimelineEvent[]> => {
  await delay(600);
  return mockTimelines[id] || [];
};

export const pauseSubscription = async (id: string): Promise<Subscription> => {
  await delay(800);
  const index = mockSubscriptions.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Subscription not found");
  
  mockSubscriptions[index] = {
    ...mockSubscriptions[index],
    status: "PAUSED",
    permissions: { canPause: false, canResume: true, canCancel: true }
  };
  return mockSubscriptions[index];
};

export const resumeSubscription = async (id: string): Promise<Subscription> => {
  await delay(800);
  const index = mockSubscriptions.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Subscription not found");
  
  mockSubscriptions[index] = {
    ...mockSubscriptions[index],
    status: "ACTIVE",
    permissions: { canPause: true, canResume: false, canCancel: true }
  };
  return mockSubscriptions[index];
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  await delay(1000);
  const index = mockSubscriptions.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Subscription not found");
  
  mockSubscriptions[index] = {
    ...mockSubscriptions[index],
    status: "CANCELLED",
    permissions: { canPause: false, canResume: false, canCancel: false }
  };
  return mockSubscriptions[index];
};
