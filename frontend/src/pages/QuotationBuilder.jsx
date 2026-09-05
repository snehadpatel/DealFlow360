import React from 'react';
import QuotationBuilderSales from '../components/sales/QuotationBuilder';

// The Quotation Builder screen. The builder component below is wired to the
// real backend (products/customers/quotes), computes margin + blended-risk
// server-side on Save/Submit, and surfaces AI upsell suggestions inline via
// the live `/ai/upsell` endpoint.
export default function QuotationBuilder() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      <QuotationBuilderSales />
    </div>
  );
}
