import React, { useState, useEffect } from 'react';
import { 
  Subscription, 
  SubscriptionBillingPeriod, 
  SubscriptionTimelineEvent 
} from '../../types/subscription';
import { 
  getSubscriptionById, 
  getBillingSchedule, 
  getSubscriptionTimeline,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription
} from '../../api/subscriptionApi';
import BillingSchedule from './BillingSchedule';
import SubscriptionTimeline from './SubscriptionTimeline';
import { ArrowLeft, Building2, Package, CalendarDays, Ban, PlayCircle, PauseCircle, CheckCircle } from 'lucide-react';

interface Props {
  subscriptionId: string;
  onBack: () => void;
}

export default function SubscriptionDetail({ subscriptionId, onBack }: Props) {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [schedule, setSchedule] = useState<SubscriptionBillingPeriod[]>([]);
  const [timeline, setTimeline] = useState<SubscriptionTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [subscriptionId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subData, scheduleData, timelineData] = await Promise.all([
        getSubscriptionById(subscriptionId),
        getBillingSchedule(subscriptionId),
        getSubscriptionTimeline(subscriptionId)
      ]);
      setSub(subData);
      setSchedule(scheduleData);
      setTimeline(timelineData);
    } catch (err: any) {
      setError(err.message || "Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!sub) return;
    
    if (action === 'cancel' && !window.confirm("Are you sure you want to cancel this subscription? This action cannot be undone.")) {
      return;
    }

    setActionLoading(true);
    try {
      let updatedSub;
      if (action === 'pause') updatedSub = await pauseSubscription(sub.id);
      else if (action === 'resume') updatedSub = await resumeSubscription(sub.id);
      else updatedSub = await cancelSubscription(sub.id);
      
      setSub(updatedSub);
      // Reload timeline to reflect new state
      const updatedTimeline = await getSubscriptionTimeline(sub.id);
      setTimeline(updatedTimeline);
    } catch (err: any) {
      alert("Failed to perform action: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="p-8 text-center text-rose-500 bg-rose-50 rounded-xl border border-rose-100">
        <h3 className="text-lg font-bold">Error</h3>
        <p>{error || "Subscription not found"}</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      TRIAL: 'bg-blue-100 text-blue-800 border-blue-200',
      PAUSED: 'bg-amber-100 text-amber-800 border-amber-200',
      SUSPENDED: 'bg-rose-100 text-rose-800 border-rose-200',
      CANCELLED: 'bg-slate-100 text-slate-800 border-slate-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const style = styles[status] || 'bg-slate-100 text-slate-800';
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${style}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Subscriptions
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 font-mono">
              {sub.id.startsWith('SUB-') ? sub.id : `SUB-${sub.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`}
            </h1>
            {getStatusBadge(sub.status || 'ACTIVE')}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Customer: <strong className="text-slate-800">{sub.customerName}</strong> • Plan: <span className="font-semibold text-primary-600">{sub.planName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {sub.permissions.canResume && (
            <button 
              disabled={actionLoading}
              onClick={() => handleAction('resume')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume</span>
            </button>
          )}
          {sub.permissions.canPause && (
            <button 
              disabled={actionLoading}
              onClick={() => handleAction('pause')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}
          {sub.permissions.canCancel && (
            <button 
              disabled={actionLoading}
              onClick={() => handleAction('cancel')}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                <Building2 className="w-4 h-4 mr-2" />
                Customer
              </div>
              <div className="text-lg font-semibold text-slate-900">{sub.customerName}</div>
              <div className="text-sm text-slate-500">{sub.customerId}</div>
            </div>
            
            <div>
              <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                <Package className="w-4 h-4 mr-2" />
                Product / Plan
              </div>
              <div className="text-lg font-semibold text-slate-900">{sub.planName}</div>
              <div className="text-sm text-slate-500">Qty: {sub.quantity}</div>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                Billing Cycle
              </div>
              <div className="text-lg font-semibold text-slate-900">{sub.billingCycle}</div>
              <div className="text-sm text-slate-500">₹{sub.recurringAmount.toLocaleString('en-IN')} / cycle</div>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-slate-500 mb-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Key Dates
              </div>
              <div className="text-sm text-slate-900"><span className="text-slate-500 inline-block w-20">Start:</span> {formatDate(sub.startDate)}</div>
              <div className="text-sm text-slate-900"><span className="text-slate-500 inline-block w-20">Next Bill:</span> {formatDate(sub.nextBillingDate)}</div>
              {sub.endDate && (
                <div className="text-sm text-slate-900"><span className="text-slate-500 inline-block w-20">End:</span> {formatDate(sub.endDate)}</div>
              )}
            </div>
          </div>

          <BillingSchedule schedule={schedule} loading={loading} />
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-1">
          <SubscriptionTimeline timeline={timeline} loading={loading} />
        </div>
      </div>
    </div>
  );
}
