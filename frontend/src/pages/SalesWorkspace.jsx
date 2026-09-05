import React, { useState } from 'react';
import SalesLayout from '../components/sales/SalesLayout';
import SalesDashboard from '../components/sales/SalesDashboard';
import MyQuotations from '../components/sales/MyQuotations';
import SalesPipeline from '../components/sales/SalesPipeline';
import QuotationBuilder from '../components/sales/QuotationBuilder';

export default function SalesWorkspace() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <SalesLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <SalesDashboard onAction={setActiveTab} />}
      {activeTab === 'quotations' && <MyQuotations onNewQuote={() => setActiveTab('builder')} />}
      {activeTab === 'pipeline' && <SalesPipeline />}
      {activeTab === 'builder' && <QuotationBuilder />}
    </SalesLayout>
  );
}
