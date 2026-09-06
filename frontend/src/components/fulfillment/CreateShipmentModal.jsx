import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';

export default function CreateShipmentModal({ isOpen, onClose, orderId, onConfirm }) {
  const [formData, setFormData] = useState({
    carrier: '',
    address: '',
    packageCount: 1,
    expectedDelivery: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.carrier || !formData.address || !formData.expectedDelivery) {
      setError("Please fill in all required fields (Carrier, Address, Expected Delivery)");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(formData);
    } catch (err) {
      setError(err.message || 'Failed to create shipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-brand-500" />
            <h2 className="text-xl font-bold text-textPrimary">Create Shipment</h2>
          </div>
          <button aria-label="Close modal" onClick={onClose} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm font-semibold rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="shipment-carrier" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Carrier *</label>
            <select 
              id="shipment-carrier"
              name="carrier"
              value={formData.carrier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="">Select Carrier</option>
              <option value="BlueDart">BlueDart</option>
              <option value="Delhivery">Delhivery</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
            </select>
          </div>

          <div>
            <label htmlFor="shipment-address" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Shipping Address *</label>
            <textarea 
              id="shipment-address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              placeholder="Enter full shipping address..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="shipment-packages" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Packages</label>
              <input 
                id="shipment-packages"
                type="number"
                name="packageCount"
                min="1"
                value={formData.packageCount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="shipment-delivery-date" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Expected Delivery *</label>
              <input 
                id="shipment-delivery-date"
                type="date"
                name="expectedDelivery"
                value={formData.expectedDelivery}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shipment-notes" className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">Notes</label>
            <textarea 
              id="shipment-notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any specific delivery instructions..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </form>

        <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-200 text-textSecondary font-bold hover:bg-gray-100 rounded-full transition"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-full shadow-btn transition flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </>
            ) : "Create Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
