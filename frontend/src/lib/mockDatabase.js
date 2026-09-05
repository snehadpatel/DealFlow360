// Generate 200 mock customers
const generatedCustomers = [];
const tiers = ["Platinum", "Gold", "Silver", "Bronze"];
const statuses = ["Active", "Active", "Active", "Active", "At Risk", "Churned"];
const companies = ["Tech", "Global", "Systems", "Solutions", "Industries", "Group", "Corp", "Networks"];

for (let i = 1; i <= 200; i++) {
  const companyName = i === 1 ? "ABC Industries Ltd." : 
                      i === 2 ? "Infosys Technologies" : 
                      i === 3 ? "TechVision India" : 
                      `${companies[i % companies.length]} ${companies[(i * 3) % companies.length]} ${i} Ltd.`;
                      
  generatedCustomers.push({
    id: `CUST-${(1000 + i).toString()}`,
    name: companyName,
    tier: tiers[i % tiers.length],
    email: i <= 3 ? (i===1 ? "accounts@abc.com" : i===2 ? "procurement@infosys.com" : "orders@techvision.in") : `contact${i}@${companyName.replace(/[^a-zA-Z]/g, '').toLowerCase()}.com`,
    credit_limit: (50000 + (i % 20) * 10000),
    status: statuses[i % statuses.length],
  });
}

// Generate 50 mock products
const generatedProducts = [
  { id: "P-101", name: "Enterprise Laptop Pro X1", sku: "LAP-PRO-X1", price: 85000, cost: 70000, category: "Hardware", tax_rate: 18, stock: 45, discount_ceiling: 15 },
  { id: "P-201", name: "Cloud Management Suite", sku: "SaaS-CMS-ENT", price: 12000, cost: 4000, category: "Subscription", tax_rate: 0, stock: null, discount_ceiling: 25 },
  { id: "P-302", name: "24/7 Premium Support Plan", sku: "SUP-PREMIUM-YR", price: 36000, cost: 20000, category: "Services", tax_rate: 18, stock: null, discount_ceiling: 10 },
];

const productCategories = ["Hardware", "Accessories", "Subscription", "Services"];
const productNames = ["Server Rack 42U", "Managed Switch 24-Port", "NVMe Storage 2TB", "Dual Monitor Stand", "Wireless Ergonomic Mouse", "Data Backup Enterprise", "CyberSecurity Audit", "API Gateway License", "Cloud GPU Instance", "Consulting Hour"];
const productSkus = ["SRV-RACK-42", "NET-SW-24", "STO-NVME-2T", "ACC-MON-STD", "ACC-MSE-WRL", "SUB-BCK-ENT", "SRV-SEC-AUD", "SUB-API-GTW", "SUB-GPU-C5", "SRV-CON-HR"];

for (let i = 4; i <= 50; i++) {
  const cat = productCategories[i % 4];
  const baseName = productNames[i % productNames.length];
  const price = 5000 + (i * 1250);
  
  generatedProducts.push({
    id: `P-${100 + i}`,
    name: `${baseName} Gen ${Math.floor(i / 10) + 1}`,
    sku: `${productSkus[i % productSkus.length]}-G${Math.floor(i / 10) + 1}`,
    price: price,
    cost: price * 0.65, // ~35% margin
    category: cat,
    tax_rate: cat === "Subscription" ? 0 : 18,
    stock: (cat === "Subscription" || cat === "Services") ? null : Math.floor(Math.random() * 100),
    discount_ceiling: cat === "Subscription" ? 25 : cat === "Services" ? 10 : 15,
  });
}

// In-memory fallback dataset for mock database queries
const initialDbState = {
  quotations: [
    {
      id: "QT-2026-0184",
      customer: "ABC Industries Ltd.",
      customerId: "CUST-1001",
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
      customerId: "CUST-1002",
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
      customerId: "CUST-1003",
      amount: 182000.0,
      margin: 24.0,
      status: "DRAFT",
      stage: "DRAFT",
      date: "2026-09-05",
      rep: "Alex Kumar",
      itemsCount: 2,
    },
  ],
  customers: generatedCustomers,
  products: generatedProducts,
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
  users: [
    { id: "U-1", name: "Admin User", email: "admin@dealflow360.com", role: "ADMIN", is_active: true }
  ]
};

// Initialize from localStorage or use defaults
let dbState = {};
try {
  const stored = localStorage.getItem("dealflow360_mockDb");
  if (stored) {
    dbState = JSON.parse(stored);
    
    let needsUpdate = false;
    
    // Force override if the user only has the original 3 customers
    if (!dbState.customers || dbState.customers.length < 100) {
      dbState.customers = generatedCustomers;
      needsUpdate = true;
    }
    
    // Force override if the user only has the original 3 products OR if products are missing discount_ceiling
    if (!dbState.products || dbState.products.length < 10 || !dbState.products[0].discount_ceiling) {
      dbState.products = generatedProducts;
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      localStorage.setItem("dealflow360_mockDb", JSON.stringify(dbState));
    }
  } else {
    dbState = JSON.parse(JSON.stringify(initialDbState));
    localStorage.setItem("dealflow360_mockDb", JSON.stringify(dbState));
  }
} catch (e) {
  dbState = JSON.parse(JSON.stringify(initialDbState));
}

function persistState() {
  try {
    localStorage.setItem("dealflow360_mockDb", JSON.stringify(dbState));
  } catch (e) {
    console.warn("Could not persist to localStorage");
  }
}

export const getDb = () => dbState;

export const mockDb = {
  getAll: async (collection) => {
    // Return a copy so React state sees a new array reference
    return [...(dbState[collection] || [])];
  },

  getById: async (collection, id) => {
    const list = dbState[collection] || [];
    return list.find((item) => item.id === id) || null;
  },

  create: async (collection, data) => {
    if (!dbState[collection]) dbState[collection] = [];
    const newRecord = { ...data, id: data.id || `${collection.toUpperCase().slice(0, 3)}-${Date.now()}` };
    dbState[collection].unshift(newRecord);
    persistState();
    return newRecord;
  },

  update: async (collection, id, data) => {
    if (!dbState[collection]) return null;
    const index = dbState[collection].findIndex((item) => item.id === id);
    if (index !== -1) {
      dbState[collection][index] = { ...dbState[collection][index], ...data };
      persistState();
      return dbState[collection][index];
    }
    return null;
  },

  remove: async (collection, id) => {
    if (!dbState[collection]) return { success: false };
    dbState[collection] = dbState[collection].filter((item) => item.id !== id);
    persistState();
    return { success: true };
  },
};
