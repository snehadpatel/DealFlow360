import apiClient from './client';

function mapOrderToFulfillment(order, index, custMap = {}, whMap = {}, shipMap = {}) {
  const cust = custMap[order.customer_id] || { name: `Enterprise Client #${index + 1}` };
  const ship = shipMap[order.id];
  const wh = whMap[ship?.warehouse_id] || { name: 'Warehouse' };
  const ordStatus = (order.status || 'CONFIRMED').toUpperCase();

  let fulfillmentStatus = 'PENDING';
  if (ordStatus === 'DELIVERED') fulfillmentStatus = 'FULFILLED';
  else if (ordStatus === 'SHIPPED') fulfillmentStatus = 'PARTIALLY_FULFILLED';
  else if (ordStatus === 'PROCESSING') fulfillmentStatus = 'ALLOCATED';

  const shortId = order.id ? `FUL-${String(order.id).slice(0, 8).toUpperCase()}` : `FUL-${1000 + index}`;

  return {
    id: shortId,
    rawId: order.id,
    quotationId: order.quotation_id ? `QT-${String(order.quotation_id).slice(0, 8)}` : '',
    customer: cust.name || `Customer #${index + 1}`,
    customerId: order.customer_id,
    salesRep: 'Sales Ops',
    orderValue: order.total_amount || 0,
    itemsCount: 1,
    warehouse: wh.name || 'Warehouse',
    status: fulfillmentStatus,
    backorderCount: 0,
    createdAt: order.created_at || new Date().toISOString(),
    deliveryAddress: order.delivery_address || '',
    shipping: {
      carrier: ship?.courier || 'Carrier',
      trackingNumber: ship?.tracking_number || '',
      expectedDelivery: ship?.estimated_delivery || '',
      status: fulfillmentStatus === 'FULFILLED' ? 'DELIVERED' : 'IN TRANSIT',
      address: order.delivery_address || '',
    },
    items: [],
    timeline: [
      { id: 1, status: 'Order Confirmed', date: order.created_at || '', description: 'Order queued for fulfillment', actor: 'System' },
    ],
    permissions: {
      can_allocate: fulfillmentStatus === 'PENDING',
      can_create_shipment: fulfillmentStatus === 'ALLOCATED' || fulfillmentStatus === 'PARTIALLY_FULFILLED',
    },
  };
}

export const getFulfillmentSummary = async () => {
  try {
    const orders = await getFulfillmentOrders();
    const pendingFulfillment = orders.filter(i => i.status === 'PENDING').length;
    const partiallyFulfilled = orders.filter(i => i.status === 'PARTIALLY_FULFILLED').length;
    const backorderedItems = orders.reduce((acc, curr) => acc + (curr.backorderCount || 0), 0);

    return {
      totalOrders: orders.length,
      totalOrdersGrowth: 0,
      pendingFulfillment,
      partiallyFulfilled,
      backorderedItems,
    };
  } catch (err) {
    console.error('Failed to fetch fulfillment summary:', err);
    return { totalOrders: 0, totalOrdersGrowth: 0, pendingFulfillment: 0, partiallyFulfilled: 0, backorderedItems: 0 };
  }
};

export const getFulfillmentOrders = async (filters = {}) => {
  try {
    const [ordersRes, shipsRes, custsRes, whsRes] = await Promise.all([
      apiClient.get('/orders').catch(() => []),
      apiClient.get('/shipments').catch(() => []),
      apiClient.get('/customers').catch(() => []),
      apiClient.get('/warehouses').catch(() => []),
    ]);

    const orders = Array.isArray(ordersRes) ? ordersRes : [];
    const shipments = Array.isArray(shipsRes) ? shipsRes : [];
    const customers = Array.isArray(custsRes) ? custsRes : [];
    const warehouses = Array.isArray(whsRes) ? whsRes : [];

    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });
    const whMap = {};
    warehouses.forEach(w => { whMap[w.id] = w; });
    const shipMap = {};
    shipments.forEach(s => { shipMap[s.order_id] = s; });

    let results = orders.map((o, idx) => mapOrderToFulfillment(o, idx, custMap, whMap, shipMap));

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

    return results;
  } catch (err) {
    console.error('Failed to fetch fulfillment orders:', err);
    return [];
  }
};

export const getFulfillmentById = async (id) => {
  const orders = await getFulfillmentOrders();
  const item = orders.find(f => f.id === id || f.rawId === id);
  if (!item) throw new Error('Fulfillment record not found');
  return item;
};

export const allocateStock = async (id) => {
  // Real allocation: the backend allocation_engine splits the order across
  // warehouses, reserves stock, and raises backorders for any shortfall, then
  // moves the order to PROCESSING. `id` may be the display id (FUL-XXXX) so
  // resolve the raw order UUID first. Errors propagate so the UI surfaces a
  // real failure instead of a fake local mutation.
  const f = await getFulfillmentById(id);
  const result = await apiClient.post(`/orders/${f.rawId}/allocate`);
  const backorderCount = (result?.lines || []).reduce((acc, l) => acc + (l.backorder_qty || 0), 0);
  return {
    ...f,
    status: 'ALLOCATED',
    backorderCount,
    allocation: result,
    permissions: { can_allocate: false, can_create_shipment: true },
  };
};

export const createShipment = async (id, shipmentData = {}) => {
  // Resolve the raw order UUID, create the shipment, and advance the order to
  // SHIPPED. No fake-success fallback — a failure must surface to the caller.
  const f = await getFulfillmentById(id);
  const res = await apiClient.post('/shipments', {
    order_id: f.rawId,
    courier: shipmentData.carrier || 'Blue Dart Express',
    ...shipmentData,
  });
  await apiClient.put(`/orders/${f.rawId}/status`, { status: 'SHIPPED' });
  return res;
};
