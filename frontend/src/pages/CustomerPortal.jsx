import React, { useState } from 'react';
import CustomerLayout from '../components/customer/CustomerLayout';
import CustomerDashboard from '../components/customer/CustomerDashboard';
import QuotationList from '../components/customer/QuotationList';
import QuotationDetail from '../components/customer/QuotationDetail';
import InvoicesView from '../components/customer/InvoicesView';
import SubscriptionsView from '../components/customer/SubscriptionsView';
import ProfileView from '../components/customer/ProfileView';

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedQuotationId(null);
  };

  const handleSelectQuotation = (quoteId) => {
    setSelectedQuotationId(quoteId);
  };

  const handleBackToList = () => {
    setSelectedQuotationId(null);
  };

  return (
    <CustomerLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {selectedQuotationId ? (
        <QuotationDetail quotationId={selectedQuotationId} onBack={handleBackToList} />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <CustomerDashboard
              onSelectQuotation={handleSelectQuotation}
              onViewAllQuotations={() => handleTabChange('quotations')}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationList onSelectQuotation={handleSelectQuotation} />
          )}

          {activeTab === 'negotiations' && (
            <QuotationList onSelectQuotation={handleSelectQuotation} />
          )}

          {activeTab === 'invoices' && <InvoicesView />}

          {activeTab === 'subscriptions' && <SubscriptionsView />}

          {activeTab === 'profile' && <ProfileView />}
        </>
      )}
    </CustomerLayout>
  );
}
