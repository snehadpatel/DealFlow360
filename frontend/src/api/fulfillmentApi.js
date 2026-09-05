/**
 * @typedef {Object} FulfillmentSummary
 * @property {number} totalOrders
 * @property {number} totalOrdersGrowth
 * @property {number} pendingFulfillment
 * @property {number} partiallyFulfilled
 * @property {number} backorderedItems
 */

/**
 * Mock data representing fulfillment state.
 */
let fulfillments = [
  {
    id: "FUL-1024",
    quotationId: "QT-2026-0184",
    customer: "ABC Industries",
    customerId: "CUST-0012",
    salesRep: "John Smith",
    orderValue: 125000,
    itemsCount: 8,
    warehouse: "Mumbai WH",
    status: "PARTIALLY_FULFILLED",
    backorderCount: 2,
    createdAt: "2026-09-04T10:30:00Z",
    paymentStatus: "PAID",
    items: [
      {
        productId: "PROD-001",
        productName: "Laptop Pro",
        sku: "LAP-001",
        orderedQuantity: 10,
        availableQuantity: 8,
        allocatedQuantity: 8,
        backorderedQuantity: 2,
        status: "PARTIALLY_FULFILLED"
      },
      {
        productId: "PROD-002",
        productName: "Wireless Keyboard",
        sku: "KEY-204",
        orderedQuantity: 20,
        availableQuantity: 20,
        allocatedQuantity: 20,
        backorderedQuantity: 0,
        status: "FULFILLED"
      }
    ],
    warehouseStock: [
      {
        productId: "PROD-001",
        productName: "Laptop Pro",
        warehouses: [
          { warehouseId: "WH-001", warehouseName: "Ahmedabad WH", location: "Gujarat", available: 5, allocated: 5, status: "ALLOCATED" },
          { warehouseId: "WH-002", warehouseName: "Mumbai WH", location: "Maharashtra", available: 3, allocated: 3, status: "ALLOCATED" },
          { warehouseId: "WH-003", warehouseName: "Delhi WH", location: "Delhi", available: 0, allocated: 0, status: "OUT_OF_STOCK" }
        ]
      },
      {
        productId: "PROD-002",
        productName: "Wireless Keyboard",
        warehouses: [
          { warehouseId: "WH-001", warehouseName: "Ahmedabad WH", location: "Gujarat", available: 50, allocated: 0, status: "AVAILABLE" },
          { warehouseId: "WH-002", warehouseName: "Mumbai WH", location: "Maharashtra", available: 20, allocated: 20, status: "ALLOCATED" }
        ]
      }
    ],
    backorders: [
      {
        productId: "PROD-001",
        productName: "Laptop Pro",
        sku: "LAP-001",
        orderedQuantity: 10,
        fulfilledQuantity: 8,
        backorderedQuantity: 2,
        expectedAvailability: "2026-09-10T00:00:00Z",
        status: "BACKORDERED"
      }
    ],
    timeline: [
      { id: 1, status: "Quotation Approved", date: "2026-09-04T10:30:00Z", description: "Approved by Sales Manager", actor: "Manager" },
      { id: 2, status: "Fulfillment Created", date: "2026-09-04T10:31:00Z", description: "System generated order", actor: "System" },
      { id: 3, status: "Stock Checked", date: "2026-09-04T10:35:00Z", description: "Inventory availability confirmed", actor: "System" },
      { id: 4, status: "Warehouse Allocation", date: "2026-09-04T10:40:00Z", description: "Stock allocated from Ahmedabad and Mumbai warehouses", actor: "Finance/Ops" }
    ],
    shipping: null, // No shipping info yet
    permissions: {
      can_allocate: true,
      can_create_shipment: true
    }
  },
  {
    id: "FUL-1025",
    quotationId: "QT-2026-0185",
    customer: "TechCorp Solutions",
    customerId: "CUST-0099",
    salesRep: "Sarah Jenkins",
    orderValue: 45000,
    itemsCount: 2,
    warehouse: "Delhi WH",
    status: "PENDING",
    backorderCount: 0,
    createdAt: "2026-09-05T08:15:00Z",
    paymentStatus: "PENDING",
    items: [
      {
        productId: "PROD-003",
        productName: "Office Chair",
        sku: "CHR-101",
        orderedQuantity: 5,
        availableQuantity: 50,
        allocatedQuantity: 0,
        backorderedQuantity: 0,
        status: "PENDING"
      }
    ],
    warehouseStock: [
      {
        productId: "PROD-003",
        productName: "Office Chair",
        warehouses: [
          { warehouseId: "WH-003", warehouseName: "Delhi WH", location: "Delhi", available: 50, allocated: 0, status: "AVAILABLE" }
        ]
      }
    ],
    backorders: [],
    timeline: [
      { id: 1, status: "Quotation Approved", date: "2026-09-05T08:10:00Z", description: "Approved automatically via Rules Engine", actor: "System" },
      { id: 2, status: "Fulfillment Created", date: "2026-09-05T08:15:00Z", description: "System generated order", actor: "System" }
    ],
    shipping: null,
    permissions: {
      can_allocate: true,
      can_create_shipment: false
    }
  },
  {
    id: "FUL-1020",
    quotationId: "QT-2026-0170",
    customer: "Global Retail",
    customerId: "CUST-0044",
    salesRep: "Mike Ross",
    orderValue: 89000,
    itemsCount: 15,
    warehouse: "Ahmedabad WH",
    status: "FULFILLED",
    backorderCount: 0,
    createdAt: "2026-09-01T14:20:00Z",
    paymentStatus: "PAID",
    items: [
      {
        productId: "PROD-004",
        productName: "Monitor Stand",
        sku: "MNT-99",
        orderedQuantity: 15,
        availableQuantity: 15,
        allocatedQuantity: 15,
        backorderedQuantity: 0,
        status: "FULFILLED"
      }
    ],
    warehouseStock: [
      {
        productId: "PROD-004",
        productName: "Monitor Stand",
        warehouses: [
          { warehouseId: "WH-001", warehouseName: "Ahmedabad WH", location: "Gujarat", available: 15, allocated: 15, status: "ALLOCATED" }
        ]
      }
    ],
    backorders: [],
    timeline: [
      { id: 1, status: "Quotation Approved", date: "2026-09-01T14:20:00Z", description: "Approved by Sales Manager", actor: "Manager" },
      { id: 4, status: "Warehouse Allocation", date: "2026-09-01T15:00:00Z", description: "Stock allocated from Ahmedabad", actor: "Finance/Ops" },
      { id: 5, status: "Shipment Created", date: "2026-09-02T10:00:00Z", description: "Shipped via BlueDart", actor: "Finance/Ops" },
      { id: 6, status: "Delivered", date: "2026-09-04T12:00:00Z", description: "Delivered to Customer", actor: "BlueDart" }
    ],
    shipping: {
      carrier: "BlueDart",
      trackingNumber: "BD987654321",
      expectedDelivery: "2026-09-04T00:00:00Z",
      status: "DELIVERED",
      address: "45 Business Park, Andheri East, Mumbai, 400069"
    },
    permissions: {
      can_allocate: false,
      can_create_shipment: false
    }
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getFulfillmentSummary = async () => {
  await delay(600);
  return {
    totalOrders: 128,
    totalOrdersGrowth: 12,
    pendingFulfillment: 24,
    partiallyFulfilled: 11,
    backorderedItems: 7
  };
};

export const getFulfillmentOrders = async (filters = {}) => {
  await delay(800);
  let results = [...fulfillments];
  
  if (filters.status && filters.status !== 'All') {
    results = results.filter(f => f.status.toUpperCase() === filters.status.toUpperCase().replace(' ', '_'));
  }
  
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(f => 
      f.id.toLowerCase().includes(q) || 
      f.quotationId.toLowerCase().includes(q) || 
      f.customer.toLowerCase().includes(q)
    );
  }
  
  if (filters.warehouse && filters.warehouse !== 'All Warehouses') {
    results = results.filter(f => f.warehouse.includes(filters.warehouse));
  }
  
  return results;
};

export const getFulfillmentById = async (id) => {
  await delay(600);
  const fulfillment = fulfillments.find(f => f.id === id);
  if (!fulfillment) throw new Error("Fulfillment order not found");
  return fulfillment;
};

export const allocateStock = async (id, allocations) => {
  await delay(1200);
  const index = fulfillments.findIndex(f => f.id === id);
  if (index === -1) throw new Error("Fulfillment order not found");
  
  // In a real app, backend calculates limits. We'll just fake a success state change.
  const f = fulfillments[index];
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
  
  return f;
};

export const createShipment = async (id, shipmentData) => {
  await delay(1500);
  const index = fulfillments.findIndex(f => f.id === id);
  if (index === -1) throw new Error("Fulfillment order not found");
  
  const f = fulfillments[index];
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
  
  return f;
};
