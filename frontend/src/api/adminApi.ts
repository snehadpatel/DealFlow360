import apiClient from './client';

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
    const res: any = await apiClient.get('/dashboard/stats');
    return {
      users_count: res.users_count || 0,
      customers_count: res.customers_count || 0,
      products_count: res.products_count || 0,
    };
  } catch (err) {
    try {
      const [users, customers, products]: any[] = await Promise.all([
        apiClient.get('/users').catch(() => []),
        apiClient.get('/customers').catch(() => []),
        apiClient.get('/products').catch(() => []),
      ]);
      return {
        users_count: Array.isArray(users) ? users.length : 0,
        customers_count: Array.isArray(customers) ? customers.length : 0,
        products_count: Array.isArray(products) ? products.length : 0,
      };
    } catch {
      return { users_count: 0, customers_count: 0, products_count: 0 };
    }
  }
}

export async function fetchCustomersList(): Promise<ApiCustomer[]> {
  try {
    const res: any = await apiClient.get('/customers');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch customers from DB:', err);
    return [];
  }
}

export async function createCustomerApi(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    const res: any = await apiClient.post('/customers', data);
    return res;
  } catch (err) {
    console.error('Failed to create customer in DB:', err);
    throw err;
  }
}

export async function updateCustomerApi(id: string, data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    const res: any = await apiClient.put(`/customers/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update customer in DB:', err);
    throw err;
  }
}

export async function deleteCustomerApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/customers/${id}`);
  } catch (err) {
    console.error('Failed to delete customer in DB:', err);
    throw err;
  }
}

export async function fetchProductsList(): Promise<ApiProduct[]> {
  try {
    const res: any = await apiClient.get('/products');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch products from DB:', err);
    return [];
  }
}

export async function createProductApi(data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    const res: any = await apiClient.post('/products', data);
    return res;
  } catch (err) {
    console.error('Failed to create product in DB:', err);
    throw err;
  }
}

export async function updateProductApi(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    const res: any = await apiClient.put(`/products/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update product in DB:', err);
    throw err;
  }
}

export async function deleteProductApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/products/${id}`);
  } catch (err) {
    console.error('Failed to delete product in DB:', err);
    throw err;
  }
}

export async function fetchUsersList(): Promise<ApiUser[]> {
  try {
    const res: any = await apiClient.get('/users');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch users from DB:', err);
    return [];
  }
}

export async function createUserApi(data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    const res: any = await apiClient.post('/users', data);
    return res;
  } catch (err) {
    console.error('Failed to create user in DB:', err);
    throw err;
  }
}

export async function updateUserApi(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    const res: any = await apiClient.put(`/users/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update user in DB:', err);
    throw err;
  }
}

export async function deleteUserApi(id: string): Promise<void> {
  try {
    await apiClient.post(`/users/${id}/disable`);
  } catch (err) {
    console.error('Failed to disable/delete user in DB:', err);
    throw err;
  }
}

export async function fetchWarehousesList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/warehouses');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch warehouses from DB:', err);
    return [];
  }
}

export async function createWarehouseApi(data: any): Promise<any> {
  try {
    const res: any = await apiClient.post('/warehouses', data);
    return res;
  } catch (err) {
    console.error('Failed to create warehouse in DB:', err);
    throw err;
  }
}

export async function updateWarehouseApi(id: string, data: any): Promise<any> {
  try {
    const res: any = await apiClient.put(`/warehouses/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update warehouse in DB:', err);
    throw err;
  }
}

export async function deleteWarehouseApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/warehouses/${id}`);
  } catch (err) {
    console.error('Failed to delete warehouse in DB:', err);
    throw err;
  }
}

export async function fetchPriceListsList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/price-lists');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch price lists from DB:', err);
    return [];
  }
}

export async function createPriceListApi(data: any): Promise<any> {
  try {
    const res: any = await apiClient.post('/price-lists', data);
    return res;
  } catch (err) {
    console.error('Failed to create price list in DB:', err);
    throw err;
  }
}

export async function fetchPriceListItems(priceListId: string): Promise<any[]> {
  try {
    const res: any = await apiClient.get(`/price-lists/${priceListId}/items`);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch price list items from DB:', err);
    return [];
  }
}

export async function addPriceListItemApi(priceListId: string, data: any): Promise<any> {
  try {
    const res: any = await apiClient.post(`/price-lists/${priceListId}/items`, data);
    return res;
  } catch (err) {
    console.error('Failed to add price list item in DB:', err);
    throw err;
  }
}

export async function fetchDiscountRulesList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/discount-rules');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch discount rules from DB:', err);
    return [];
  }
}

export async function createDiscountRuleApi(data: any): Promise<any> {
  try {
    const res: any = await apiClient.post('/discount-rules', data);
    return res;
  } catch (err) {
    console.error('Failed to create discount rule in DB:', err);
    throw err;
  }
}

export async function updateDiscountRuleApi(id: string, data: any): Promise<any> {
  try {
    const res: any = await apiClient.put(`/discount-rules/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update discount rule in DB:', err);
    throw err;
  }
}

export async function deleteDiscountRuleApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/discount-rules/${id}`);
  } catch (err) {
    console.error('Failed to delete discount rule in DB:', err);
    throw err;
  }
}

export async function fetchSubscriptionPlansList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/subscriptions/plans');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch subscription plans from DB:', err);
    return [];
  }
}

export async function createSubscriptionPlanApi(data: any): Promise<any> {
  try {
    const res: any = await apiClient.post('/subscriptions/plans', data);
    return res;
  } catch (err) {
    console.error('Failed to create subscription plan in DB:', err);
    throw err;
  }
}

export async function updateSubscriptionPlanApi(id: string, data: any): Promise<any> {
  try {
    const res: any = await apiClient.put(`/subscriptions/plans/${id}`, data);
    return res;
  } catch (err) {
    console.error('Failed to update subscription plan in DB:', err);
    throw err;
  }
}

export async function deleteSubscriptionPlanApi(id: string): Promise<void> {
  try {
    await apiClient.delete(`/subscriptions/plans/${id}`);
  } catch (err) {
    console.error('Failed to delete subscription plan in DB:', err);
    throw err;
  }
}

export async function fetchAuditLogsList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/audit-logs').catch(() => []);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

export async function fetchNotificationsList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/notifications');
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

// ─── Price Lists ──────────────────────────────────────────────────────────────
export async function fetchPriceListsList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/price-lists');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch price lists from DB:', err);
    return [];
  }
}

export async function createPriceListApi(data: any): Promise<any> {
  const res: any = await apiClient.post('/price-lists', data);
  return res;
}

export async function fetchPriceListItems(priceListId: string): Promise<any[]> {
  try {
    const res: any = await apiClient.get(`/price-lists/${priceListId}/items`);
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch price list items from DB:', err);
    return [];
  }
}

export async function addPriceListItemApi(priceListId: string, data: any): Promise<any> {
  const res: any = await apiClient.post(`/price-lists/${priceListId}/items`, data);
  return res;
}

// ─── Discount Rules ─────────────────────────────────────────────────────────────
export async function fetchDiscountRulesList(): Promise<any[]> {
  try {
    const res: any = await apiClient.get('/discount-rules');
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error('Failed to fetch discount rules from DB:', err);
    return [];
  }
}

export async function createDiscountRuleApi(data: any): Promise<any> {
  const res: any = await apiClient.post('/discount-rules', data);
  return res;
}

export async function updateDiscountRuleApi(id: string, data: any): Promise<any> {
  const res: any = await apiClient.put(`/discount-rules/${id}`, data);
  return res;
}

export async function deleteDiscountRuleApi(id: string): Promise<void> {
  await apiClient.delete(`/discount-rules/${id}`);
}

// ─── Warehouses (update; toggle active state) ────────────────────────────────
// No backend DELETE route for warehouses (only PUT), and stock FKs make a hard
// delete unsafe — status is toggled via update instead.
export async function updateWarehouseApi(id: string, data: any): Promise<any> {
  const res: any = await apiClient.put(`/warehouses/${id}`, data);
  return res;
}

// ─── Subscription Plans (create / update / delete) ───────────────────────────
export async function createSubscriptionPlanApi(data: any): Promise<any> {
  const res: any = await apiClient.post('/subscriptions/plans', data);
  return res;
}

export async function updateSubscriptionPlanApi(id: string, data: any): Promise<any> {
  const res: any = await apiClient.put(`/subscriptions/plans/${id}`, data);
  return res;
}

export async function deleteSubscriptionPlanApi(id: string): Promise<void> {
  await apiClient.delete(`/subscriptions/plans/${id}`);
}
