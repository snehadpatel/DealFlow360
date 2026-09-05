import React from 'react';
import { Check, Clock, Circle, FileText } from 'lucide-react';

export default function ApprovalChain({ chain }) {
  if (!chain || chain.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-textSecondary border-b border-gray-200 pb-3 mb-5">
        Approval Chain
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-border before:to-transparent">
        {chain.map((step, idx) => {
          const isApproved = step.status === 'APPROVED' || step.status === 'SUBMITTED';
          const isCurrent = step.status === 'IN_REVIEW' || (step.status === 'PENDING' && idx > 0 && chain[idx-1].status === 'APPROVED');
          const isPending = step.status === 'PENDING' && !isCurrent;
          const isRejected = step.status === 'REJECTED';

          let icon = <Circle className="w-4 h-4 text-gray-300" />;
          let iconBg = 'bg-white border-gray-300';
          let textColor = 'text-gray-400';

          if (isApproved) {
            icon = <Check className="w-4 h-4 text-white" />;
            iconBg = 'bg-success-500 border-success-500';
            textColor = 'text-success-600';
          } else if (isCurrent) {
            icon = <Clock className="w-4 h-4 text-brand-500" />;
            iconBg = 'bg-brand-50 border-primary-500 ring-4 ring-primary-50';
            textColor = 'text-brand-600';
          }

          return (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${iconBg}`}>
                {icon}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md-hover group-hover:border-brand-200">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>
                    {step.status.replace('_', ' ')}
                  </span>
                  {step.timestamp && (
                    <span className="text-[10px] text-textSecondary font-medium">{step.timestamp}</span>
                  )}
                </div>
                <div className="font-bold text-sm text-textPrimary">{step.role}</div>
                {step.person && (
                  <div className="text-xs text-textSecondary mt-0.5 flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {step.person}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
