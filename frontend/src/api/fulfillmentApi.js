import { mockDb, getDb } from '../lib/mockDatabase';

export const getFulfillmentSummary = async () => {
  const items = await mockDb.getAll('fulfillments');
  const pendingFulfillment = items.filter(i => i.status === 'PENDING').length;
  const partiallyFulfilled = items.filter(i => i.status === 'PARTIALLY_FULFILLED').length;
  const backorderedItems = items.reduce((acc, curr) => acc + (curr.backorderCount || 0), 0);

  return {
    totalOrders: items.length,
    totalOrdersGrowth: 12,
    pendingFulfillment,
    partiallyFulfilled,
    backorderedItems
  };
};

export const getFulfillmentOrders = async (filters = {}) => {
  let results = await mockDb.getAll('fulfillments');
  
  if (filters.status && filters.status !== 'All') {
    results = results.filter(f => f.status.toUpperCase() === filters.status.toUpperCase().replace(' ', '_'));
  }
  
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(f => 
      f.id.toLowerCase().includes(q) || 
      f.quotationId?.toLowerCase().includes(q) || 
      f.customer?.toLowerCase().includes(q)
    );
  }
  
  if (filters.warehouse && filters.warehouse !== 'All Warehouses') {
    results = results.filter(f => f.warehouse?.includes(filters.warehouse));
  }
  
  return results;
};

export const getFulfillmentById = async (id) => {
  const fulfillment = await mockDb.getById('fulfillments', id);
  if (!fulfillment) throw new Error("Fulfillment order not found");
  return fulfillment;
};

export const allocateStock = async (id, allocations) => {
  const f = await getFulfillmentById(id);
  
  f.status = "ALLOCATED";
  f.permissions.can_allocate = false;
  f.permissions.can_create_shipment = true;
  f.timeline.push({
    id: Date.now(),
    status: "Warehouse Allocation",
    date: new Date().toISOString(),
    description: "Stock allocated manually",
    actor: "Current User"
  });
  
  return await mockDb.update('fulfillments', id, f);
};

export const createShipment = async (id, shipmentData) => {
  const f = await getFulfillmentById(id);
  
  f.status = "FULFILLED";
  f.permissions.can_create_shipment = false;
  f.shipping = {
    carrier: shipmentData.carrier,
    trackingNumber: "NEW" + Math.floor(Math.random() * 10000000),
    expectedDelivery: shipmentData.expectedDelivery,
    status: "IN TRANSIT",
    address: shipmentData.address
  };
  
  f.timeline.push({
    id: Date.now(),
    status: "Shipment Created",
    date: new Date().toISOString(),
    description: `Shipped via ${shipmentData.carrier}`,
    actor: "Current User"
  });
  
  return await mockDb.update('fulfillments', id, f);
};
