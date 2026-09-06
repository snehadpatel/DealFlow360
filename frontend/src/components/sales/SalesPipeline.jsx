import React, { useState, useEffect } from 'react';
import { getSalesPipeline } from '../../api/salesApi';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const formatCurrency = (val) => currencyFormatter.format(val || 0);

export default function SalesPipeline() {
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalesPipeline().then(setPipeline).finally(() => setLoading(false));
  }, []);



  const stages = [
    { id: 'LEAD', title: 'Lead', color: 'bg-gray-100 border-gray-200 text-gray-700' },
    { id: 'QUOTED', title: 'Quoted', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'APPROVAL', title: 'Approval', color: 'bg-warning-50 border-warning-200 text-warning-700' },
    { id: 'NEGOTIATION', title: 'Negotiation', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'WON', title: 'Won', color: 'bg-success-50 border-success-200 text-success-700' },
  ];

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-120px)] animate-pulse">
        {stages.map((s, i) => (
          <div key={i} className="min-w-[280px] flex-1 bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
            <div className="h-6 bg-gray-100 rounded-lg w-1/2" />
            <div className="h-24 bg-gray-50 rounded-lg" />
            <div className="h-24 bg-gray-50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-2xl font-extrabold text-textPrimary">Sales Pipeline</h1>
        <p className="text-sm text-textSecondary mt-1">Drag and drop functionality restricted by business rules. Advance deals through quotation creation.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-2 items-start">
        {stages.map((stage) => {
          const items = pipeline.filter(p => p.stage === stage.id);
          const stageTotal = items.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div key={stage.id} className="min-w-[280px] w-72 max-w-sm flex-shrink-0 bg-gray-50/50 border border-gray-200 rounded-2xl flex flex-col max-h-full">
              <div className={`px-4 py-3 border-b rounded-t-card flex justify-between items-center ${stage.color}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider">{stage.title}</h3>
                <span className="text-xs font-semibold bg-white/50 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              
              <div className="p-3 text-xs font-bold text-textSecondary border-b border-gray-200 bg-white flex justify-between">
                <span>Total Value</span>
                <span className="text-textPrimary">{formatCurrency(stageTotal)}</span>
              </div>

              <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 p-3.5 rounded-lg shadow-sm hover:shadow-md-hover transition cursor-grab">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-textSecondary">{item.id}</span>
                    </div>
                    <div className="font-extrabold text-textPrimary mb-1 truncate">{item.customer}</div>
                    <div className="font-bold text-brand-500">{formatCurrency(item.value)}</div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center p-4 text-xs text-textSecondary italic border-2 border-dashed border-gray-200 rounded-lg">
                    No deals in this stage
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
