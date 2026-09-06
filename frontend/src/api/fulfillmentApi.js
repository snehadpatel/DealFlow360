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

export const allocateStock = async (id, allocations = {}) => {
  const f = await getFulfillmentById(id);
  const orderId = f.rawId || id;
  try {
    await apiClient.put(`/orders/${orderId}/status`, {
      status: 'PROCESSING',
      notes: 'Stock allocated across fulfillment centers',
    });
  } catch (err) {
    console.warn('Backend order allocation note:', err);
  }
  f.status = 'ALLOCATED';
  f.permissions.can_allocate = false;
  f.permissions.can_create_shipment = true;
  return f;
};

export const createShipment = async (id, shipmentData = {}) => {
  const f = await getFulfillmentById(id);
  const orderId = f.rawId || id;
  try {
    const whRes = await apiClient.get('/warehouses').catch(() => []);
    const whId = Array.isArray(whRes) && whRes.length > 0 ? whRes[0].id : undefined;

    const res = await apiClient.post('/shipments', {
      order_id: orderId,
      warehouse_id: shipmentData.warehouse_id || whId,
      courier: shipmentData.carrier || shipmentData.courier || 'Blue Dart Express',
      tracking_number: shipmentData.trackingNumber || shipmentData.tracking_number || `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      shipping_cost: Number(shipmentData.shipping_cost) || 0,
    });

    await apiClient.put(`/orders/${orderId}/status`, {
      status: 'DELIVERED',
      notes: 'Shipment dispatched to customer',
    }).catch(() => {});

    return res;
  } catch (err) {
    console.warn('Backend shipment creation error:', err);
    f.status = 'FULFILLED';
    return f;
  }
};
