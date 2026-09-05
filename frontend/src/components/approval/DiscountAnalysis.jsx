import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

export default function DiscountAnalysis({ analysis }) {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="bg-white border border-surface-border rounded-card shadow-card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary border-b border-surface-border pb-3 mb-4">
        Discount Analysis
      </h3>
      
      <div className="space-y-3">
        <div className="flex text-xs font-bold uppercase tracking-wider text-text-secondary px-2">
          <div className="w-1/3">Category</div>
          <div className="w-1/4 text-center">Allowed</div>
          <div className="w-1/4 text-center">Requested</div>
          <div className="flex-1 text-right">Status</div>
        </div>
        
        <div className="space-y-2">
          {analysis.map((item, idx) => {
            const isExceeded = item.status === 'EXCEEDS_LIMIT';
            return (
              <div 
                key={idx} 
                className={`flex items-center px-3 py-2.5 rounded-btn border ${
                  isExceeded ? 'bg-danger-50 border-danger-200' : 'bg-gray-50 border-surface-border'
                }`}
              >
                <div className="w-1/3 font-bold text-text-primary text-sm">{item.category}</div>
                <div className="w-1/4 text-center font-medium text-text-secondary text-sm">{item.allowed}%</div>
                <div className={`w-1/4 text-center font-extrabold text-sm ${isExceeded ? 'text-danger-600' : 'text-text-primary'}`}>
                  {item.requested}%
                </div>
                <div className="flex-1 flex justify-end">
                  {isExceeded ? (
                    <div className="flex items-center space-x-1.5 text-danger-600 bg-white px-2 py-1 rounded border border-danger-200 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase">Exceeds Limit</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-success-600">
                      <Check className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Within Limit</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
