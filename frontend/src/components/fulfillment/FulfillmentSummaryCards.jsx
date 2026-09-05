import React from 'react';
import { Package, Clock, Box, AlertTriangle } from 'lucide-react';

export default function FulfillmentSummaryCards({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 h-28 animate-pulse shadow-md">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: summary.totalOrders,
      subtext: `+${summary.totalOrdersGrowth} this week`,
      icon: Package,
      color: "primary",
      bgColor: "bg-brand-50",
      textColor: "text-brand-600",
      iconColor: "text-brand-500"
    },
    {
      title: "Pending Fulfillment",
      value: summary.pendingFulfillment,
      subtext: "Requires warehouse allocation",
      icon: Clock,
      color: "warning",
      bgColor: "bg-warning-50",
      textColor: "text-warning-700",
      iconColor: "text-warning-500"
    },
    {
      title: "Partially Fulfilled",
      value: summary.partiallyFulfilled,
      subtext: "Multiple warehouse allocation",
      icon: Box,
      color: "success",
      bgColor: "bg-success-50",
      textColor: "text-success-700",
      iconColor: "text-success-500"
    },
    {
      title: "Backordered",
      value: summary.backorderedItems,
      subtext: "Stock unavailable",
      icon: AlertTriangle,
      color: "danger",
      bgColor: "bg-danger-50",
      textColor: "text-danger-700",
      iconColor: "text-danger-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-md-hover transition-shadow duration-200 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-textSecondary mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-extrabold text-textPrimary mb-1 group-hover:scale-105 transition-transform origin-left">
                  {card.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-2xl ${card.bgColor} ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-medium text-textSecondary mt-2">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
