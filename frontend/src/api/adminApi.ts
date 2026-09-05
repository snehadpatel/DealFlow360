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
  tax_rate: number;
  unit: string;
  description?: string;
  is_archived?: boolean;
}

export interface ApiWarehouse {
  id: string;
  name: string;
  location: string;
  manager_id?: string;
  is_active: boolean;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
}

export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  max_users: number;
  features_json?: string;
  is_active: boolean;
}

export interface ApiAuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id: string;
  details_json?: string;
  ip_address?: string;
  created_at: string;
}

// ─── ADMIN API FUNCTIONS ───────────────────────────────────────────────────

export async function fetchDashboardStats() {
  try {
    return await apiClient.get("/v1/dashboard/stats");
  } catch (e) {
    console.warn("Falling back to seeded dashboard metrics", e);
    return null;
  }
}

export async function fetchCustomersList(): Promise<ApiCustomer[]> {
  try {
    return await apiClient.get("/v1/customers/");
  } catch (e) {
    console.warn("Using local customer state fallback", e);
    return [];
  }
}

export async function createCustomerApi(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  return await apiClient.post("/v1/customers/", data);
}

export async function updateCustomerApi(id: string, data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  return await apiClient.put(`/v1/customers/${id}`, data);
}

export async function deleteCustomerApi(id: string): Promise<void> {
  return await apiClient.delete(`/v1/customers/${id}`);
}

export async function fetchProductsList(): Promise<ApiProduct[]> {
  try {
    return await apiClient.get("/v1/products/");
  } catch (e) {
    console.warn("Using local product state fallback", e);
    return [];
  }
}

export async function createProductApi(data: Partial<ApiProduct>): Promise<ApiProduct> {
  return await apiClient.post("/v1/products/", data);
}

export async function updateProductApi(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  return await apiClient.put(`/v1/products/${id}`, data);
}

export async function deleteProductApi(id: string): Promise<void> {
  return await apiClient.delete(`/v1/products/${id}`);
}

export async function fetchWarehousesList(): Promise<ApiWarehouse[]> {
  try {
    return await apiClient.get("/v1/warehouses/");
  } catch (e) {
    console.warn("Using local warehouse state fallback", e);
    return [];
  }
}

export async function createWarehouseApi(data: Partial<ApiWarehouse>): Promise<ApiWarehouse> {
  return await apiClient.post("/v1/warehouses/", data);
}

export async function fetchUsersList(): Promise<ApiUser[]> {
  try {
    return await apiClient.get("/v1/users/");
  } catch (e) {
    console.warn("Using local users state fallback", e);
    return [];
  }
}

export async function createUserApi(data: Partial<ApiUser>): Promise<ApiUser> {
  return await apiClient.post("/v1/users/", data);
}

export async function fetchSubscriptionPlansList(): Promise<ApiSubscriptionPlan[]> {
  try {
    return await apiClient.get("/v1/subscriptions/plans");
  } catch (e) {
    console.warn("Using local subscription plans fallback", e);
    return [];
  }
}

export async function fetchAuditLogsList(): Promise<ApiAuditLog[]> {
  try {
    return await apiClient.get("/v1/audit-logs/");
  } catch (e) {
    console.warn("Using local audit log state fallback", e);
    return [];
  }
}

export async function fetchNotificationsList() {
  try {
    return await apiClient.get("/v1/notifications/");
  } catch (e) {
    return [];
  }
}
