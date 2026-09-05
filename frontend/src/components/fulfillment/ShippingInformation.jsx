import React from 'react';
import { Truck, MapPin } from 'lucide-react';

export default function ShippingInformation({ shipping }) {
  if (!shipping) {
    return (
      <div className="bg-white border border-surface-border rounded-card p-6 shadow-card h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 text-gray-300 border border-gray-100">
          <Truck className="w-6 h-6" />
        </div>
        <p className="text-sm text-text-secondary">Shipping information will be available after shipment creation.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-surface-border rounded-card p-6 shadow-card h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-bold text-text-primary">Shipping Information</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Carrier</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">{shipping.carrier}</p>
        </div>
        
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tracking Number</p>
          <div className="flex items-center mt-0.5">
            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
              {shipping.trackingNumber}
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Expected Delivery</p>
          <p className="text-sm font-bold text-text-primary mt-0.5">
            {new Date(shipping.expectedDelivery).toLocaleDateString()}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</p>
          <p className={`text-sm font-bold mt-0.5 ${shipping.status === 'DELIVERED' ? 'text-success-600' : 'text-warning-600'}`}>
            {shipping.status}
          </p>
        </div>

        <div className="pt-4 border-t border-surface-border">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1 flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            Destination
          </p>
          <p className="text-sm text-text-primary leading-relaxed">
            {shipping.address}
          </p>
        </div>
      </div>
    </div>
  );
}
