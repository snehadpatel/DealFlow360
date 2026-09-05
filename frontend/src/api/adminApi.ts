import apiClient from "./client";

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address_billing?: string;
  address_shipping?: string;
  tier: string;
  credit_limit: number;
  payment_terms?: string;
  status: string;
  rep_id?: string;
  created_at?: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  discount_ceiling: number;
  tax_rate?: number;
  unit?: string;
  description?: string;
  stock?: number;
  is_archived?: boolean;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export async function fetchDashboardStats() {
  try {
    const res = await apiClient.get("/dashboard/stats");
    return res;
  } catch (err) {
    console.warn("Failed to fetch dashboard stats from backend, returning fallback:", err);
    return {
      users_count: 200,
      customers_count: 200,
      products_count: 200,
    };
  }
}

export async function fetchCustomersList(): Promise<ApiCustomer[]> {
  try {
    const data = await apiClient.get("/customers");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch customers from backend:", err);
    return [];
  }
}

export async function createCustomerApi(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    const res = await apiClient.post("/customers", data);
    return res;
  } catch (err) {
    console.error("Failed to create customer in DB:", err);
    throw err;
  }
}

export async function updateCustomerApi(id: string, data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res;
  } catch (err) {
    console.error("Failed to update customer in DB:", err);
    throw err;
  }
}

export async function deleteCustomerApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/customers/${id}`);
  } catch (err) {
    console.error("Failed to delete customer in DB:", err);
  }
}

export async function fetchProductsList(): Promise<ApiProduct[]> {
  try {
    const data = await apiClient.get("/products");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch products from backend:", err);
    return [];
  }
}

export async function createProductApi(data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    const res = await apiClient.post("/products", data);
    return res;
  } catch (err) {
    console.error("Failed to create product in DB:", err);
    throw err;
  }
}

export async function updateProductApi(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    const res = await apiClient.put(`/products/${id}`, data);
    return res;
  } catch (err) {
    console.error("Failed to update product in DB:", err);
    throw err;
  }
}

export async function deleteProductApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (err) {
    console.error("Failed to delete product in DB:", err);
  }
}

export async function fetchUsersList(): Promise<ApiUser[]> {
  try {
    const data = await apiClient.get("/users");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch users from backend:", err);
    return [];
  }
}

export async function createUserApi(data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    const res = await apiClient.post("/users", data);
    return res;
  } catch (err) {
    console.error("Failed to create user in DB:", err);
    throw err;
  }
}

export async function updateUserApi(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    const res = await apiClient.put(`/users/${id}`, data);
    return res;
  } catch (err) {
    console.error("Failed to update user in DB:", err);
    throw err;
  }
}

export async function deleteUserApi(id: string): Promise<void> {
  try {
    await apiClient.post(`/users/${id}/disable`);
  } catch (err) {
    console.error("Failed to disable user in DB:", err);
  }
}

export async function fetchWarehousesList(): Promise<any[]> {
  try {
    const data = await apiClient.get("/warehouses");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch warehouses from backend:", err);
    return [];
  }
}

export async function createWarehouseApi(data: any): Promise<any> {
  try {
    const res = await apiClient.post("/warehouses", data);
    return res;
  } catch (err) {
    console.error("Failed to create warehouse in DB:", err);
    throw err;
  }
}

export async function fetchSubscriptionPlansList(): Promise<any[]> {
  try {
    const data = await apiClient.get("/subscriptions/plans");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch subscription plans from backend:", err);
    return [];
  }
}

export async function fetchAuditLogsList(): Promise<any[]> {
  try {
    const data = await apiClient.get("/audit-logs");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch audit logs from backend:", err);
    return [];
  }
}

export async function fetchNotificationsList(): Promise<any[]> {
  try {
    const data = await apiClient.get("/notifications");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("Failed to fetch notifications from backend:", err);
    return [];
  }
}
