import React from 'react';
import { User, FileText, Calendar, CreditCard } from 'lucide-react';
import { StatusBadge } from './FulfillmentTable';

export default function FulfillmentOrderSummary({ fulfillment }) {
  if (!fulfillment) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
      <h2 className="text-lg font-bold text-textPrimary mb-4 border-b border-gray-200 pb-3">
        Order Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Customer</p>
              <p className="text-sm font-bold text-textPrimary mt-0.5">{fulfillment.customer}</p>
              <p className="text-xs text-textSecondary">{fulfillment.customerId}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Quotation</p>
              <p className="text-sm font-bold text-brand-600 mt-0.5">{fulfillment.quotationId}</p>
              <p className="text-xs text-textSecondary">Rep: {fulfillment.salesRep}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Order Date</p>
              <p className="text-sm font-bold text-textPrimary mt-0.5">
                {new Date(fulfillment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Financials</p>
              <p className="text-sm font-bold text-textPrimary mt-0.5">
                Total: ₹{fulfillment.orderValue.toLocaleString()}
              </p>
              <p className={`text-xs font-bold mt-1 ${fulfillment.paymentStatus === 'PAID' ? 'text-success-600' : 'text-warning-600'}`}>
                Payment: {fulfillment.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-textPrimary">Fulfillment Status</span>
        <StatusBadge status={fulfillment.status} />
      </div>
    </div>
  );
}
