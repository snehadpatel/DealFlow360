import React from 'react';
import { SubscriptionBillingPeriod } from '../../types/subscription';
import { Calendar, FileText, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  schedule: SubscriptionBillingPeriod[];
  loading: boolean;
}

export default function BillingSchedule({ schedule, loading }: Props) {
  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>No billing schedule found.</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'UPCOMING':
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-slate-300" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'UPCOMING': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'PENDING': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'FAILED': return 'text-rose-700 bg-rose-100 border-rose-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center">
        <Calendar className="w-5 h-5 text-slate-500 mr-2" />
        <h3 className="font-semibold text-slate-800">Billing Schedule</h3>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {schedule.map((period) => (
          <div key={period.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="mt-1">{getStatusIcon(period.paymentStatus)}</div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{period.billingPeriod}</h4>
                <div className="text-xs text-slate-500 flex items-center mt-1">
                  <span className="mr-3">Date: {period.billingDate}</span>
                  {period.invoiceId && (
                    <span className="flex items-center text-primary-600 hover:underline cursor-pointer">
                      <FileText className="w-3 h-3 mr-1" />
                      {period.invoiceId}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-8 sm:pl-0">
              <span className="font-semibold text-slate-900">₹{period.amount.toLocaleString('en-IN')}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mt-1 ${getStatusClass(period.paymentStatus)}`}>
                {period.paymentStatus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
