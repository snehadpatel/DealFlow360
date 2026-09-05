import React, { useState } from 'react';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import QuotationList from '../components/customer/QuotationList';
import QuotationDetail from '../components/customer/QuotationDetail';
import NegotiationsView from '../components/customer/NegotiationsView';
import InvoicesView from '../components/customer/InvoicesView';
import SubscriptionsView from '../components/customer/SubscriptionsView';
import ProfileView from '../components/customer/ProfileView';

export default function CustomerPortal({ activeTab, onTabChange }) {
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);

  // Clear quotation detail view when navigating to a different top-level tab
  React.useEffect(() => {
    setSelectedQuotationId(null);
  }, [activeTab]);

  const handleSelectQuotation = (quoteId) => {
    setSelectedQuotationId(quoteId);
  };

  const handleBackToList = () => {
    setSelectedQuotationId(null);
  };

  return (
    <div className="w-full">
      {selectedQuotationId ? (
        <QuotationDetail quotationId={selectedQuotationId} onBack={handleBackToList} />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <CustomerDashboard
              onSelectQuotation={handleSelectQuotation}
              onViewAllQuotations={() => onTabChange('quotations')}
              onNavigateTab={(tab) => onTabChange(tab)}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationList onSelectQuotation={handleSelectQuotation} />
          )}

          {activeTab === 'negotiations' && (
            <NegotiationsView onSelectQuotation={handleSelectQuotation} />
          )}

          {activeTab === 'invoices' && <InvoicesView />}

          {activeTab === 'subscriptions' && <SubscriptionsView />}

          {activeTab === 'profile' && <ProfileView />}
        </>
      )}
    </div>
  );
}
