import React from 'react';
import { GitCommit, CheckCircle2, Clock, Circle } from 'lucide-react';

export default function InvoiceTimeline({ timeline = [] }) {
  const defaultSteps = [
    { step: 'CREATED', title: 'Invoice Created', description: 'Generated from confirmed quotation' },
    { step: 'GENERATED', title: 'Generated', description: 'Taxes, terms, and billing IDs attached' },
    { step: 'SENT', title: 'Sent', description: 'Dispatched to customer billing contact' },
    { step: 'PAYMENT_INITIATED', title: 'Payment Initiated', description: 'Gateway checkout / Wire notice' },
    { step: 'PAYMENT_COMPLETED', title: 'Payment Completed', description: 'Settled in full' },
  ];

  const steps = timeline.length > 0 ? timeline : defaultSteps;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center space-x-2 border-b border-[#E5E7EB]/60 pb-3">
        <div className="p-2 rounded-xl bg-slate-100 text-[#1F2937]">
          <GitCommit className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1F2937]">Invoice Lifecycle Timeline</h3>
          <p className="text-[11px] text-[#6B7280]">Real-time state progression audit</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
        {steps.map((item, idx) => {
          const isDone = item.completed;
          const isCurrent = item.current;

          return (
            <div key={idx} className="relative group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#F26C4F] text-white ring-4 ring-[#FEECE8]'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3 h-3" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-current" />
                )}
              </div>

              {/* Content */}
              <div className="text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      isDone
                        ? 'text-[#1F2937]'
                        : isCurrent
                        ? 'text-[#F26C4F]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.date && (
                    <span className="text-[10px] text-[#6B7280] font-mono">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
