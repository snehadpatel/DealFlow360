// In-memory fallback dataset for mock database queries

const dbState = {
  quotations: [
    {
      id: "QT-2026-0184",
      customer: "ABC Industries Ltd.",
      customerId: "CUST-0012",
      amount: 142500.0,
      margin: 28.5,
      status: "CONFIRMED",
      stage: "WON",
      date: "2026-09-04",
      rep: "Alex Kumar",
      itemsCount: 3,
    },
    {
      id: "QT-2026-0185",
      customer: "Infosys Technologies",
      customerId: "CUST-0014",
      amount: 480000.0,
      margin: 18.2,
      status: "PENDING",
      stage: "APPROVAL",
      date: "2026-09-05",
      rep: "Priya Sharma",
      itemsCount: 5,
    },
    {
      id: "QT-2026-0186",
      customer: "TechVision India",
      customerId: "CUST-0016",
      amount: 182000.0,
      margin: 24.0,
      status: "DRAFT",
      stage: "DRAFT",
      date: "2026-09-05",
      rep: "Alex Kumar",
      itemsCount: 2,
    },
  ],
  customers: [
    { id: "CUST-0012", name: "ABC Industries Ltd.", tier: "Gold", email: "accounts@abc.com" },
    { id: "CUST-0014", name: "Infosys Technologies", tier: "Gold", email: "procurement@infosys.com" },
    { id: "CUST-0016", name: "TechVision India", tier: "Silver", email: "orders@techvision.in" },
  ],
  products: [
    { id: "P-101", name: "Enterprise Laptop Pro X1", sku: "LAP-PRO-X1", price: 85000, category: "Hardware" },
    { id: "P-201", name: "Cloud Management Suite", sku: "SaaS-CMS-ENT", price: 12000, category: "Subscription" },
    { id: "P-302", name: "24/7 Premium Support Plan", sku: "SUP-PREMIUM-YR", price: 36000, category: "Services" },
  ],
  approvals: [
    {
      id: "APP-101",
      quotation_id: "QT-2026-0185",
      customer: "Infosys Technologies",
      requested_discount: 28.0,
      approval_type: "Discount Threshold",
      risk_level: "CRITICAL",
      status: "PENDING",
      submitted_by: "Priya Sharma",
      date: "2026-09-05",
    },
    {
      id: "APP-102",
      quotation_id: "QT-2026-0186",
      customer: "TCS Enterprise",
      requested_discount: 22.0,
      approval_type: "Discount Threshold",
      risk_level: "HIGH",
      status: "APPROVED",
      submitted_by: "Alex Kumar",
      date: "2026-09-04",
    },
  ],
  fulfillments: [
    {
      id: "FUL-901",
      orderId: "ORD-8821",
      customer: "ABC Industries Ltd.",
      status: "PARTIALLY_FULFILLED",
      backorderCount: 2,
      date: "2026-09-04",
    },
    {
      id: "FUL-902",
      orderId: "ORD-8822",
      customer: "TechVision India",
      status: "PENDING",
      backorderCount: 0,
      date: "2026-09-05",
    },
  ],
};

export const getDb = () => dbState;

export const mockDb = {
  getAll: async (collection) => {
    return dbState[collection] || [];
  },

  getById: async (collection, id) => {
    const list = dbState[collection] || [];
    return list.find((item) => item.id === id) || null;
  },

  create: async (collection, data) => {
    if (!dbState[collection]) dbState[collection] = [];
    const newRecord = { ...data, id: data.id || `${collection.toUpperCase().slice(0, 3)}-${Date.now()}` };
    dbState[collection].unshift(newRecord);
    return newRecord;
  },

  update: async (collection, id, data) => {
    if (!dbState[collection]) return null;
    const index = dbState[collection].findIndex((item) => item.id === id);
    if (index !== -1) {
      dbState[collection][index] = { ...dbState[collection][index], ...data };
      return dbState[collection][index];
    }
    return null;
  },

  remove: async (collection, id) => {
    if (!dbState[collection]) return { success: false };
    dbState[collection] = dbState[collection].filter((item) => item.id !== id);
    return { success: true };
  },
};
