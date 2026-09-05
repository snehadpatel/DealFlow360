import { mockDb } from "../lib/mockDatabase";

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
    const users = await mockDb.getAll('users');
    const customers = await mockDb.getAll('customers');
    const products = await mockDb.getAll('products');
    
    return {
      users_count: users.length,
      customers_count: customers.length,
      products_count: products.length,
    };
  } catch (err) {
    return { users_count: 0, customers_count: 0, products_count: 0 };
  }
}

export async function fetchCustomersList(): Promise<ApiCustomer[]> {
  try {
    const data = await mockDb.getAll('customers');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function createCustomerApi(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    return await mockDb.create('customers', data);
  } catch (err) {
    throw err;
  }
}

export async function updateCustomerApi(id: string, data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  try {
    return await mockDb.update('customers', id, data);
  } catch (err) {
    throw err;
  }
}

export async function deleteCustomerApi(id: string): Promise<void> {
  try {
    await mockDb.remove('customers', id);
  } catch (err) {
    console.error(err);
  }
}

export async function fetchProductsList(): Promise<ApiProduct[]> {
  try {
    const data = await mockDb.getAll('products');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function createProductApi(data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    return await mockDb.create('products', data);
  } catch (err) {
    throw err;
  }
}

export async function updateProductApi(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  try {
    return await mockDb.update('products', id, data);
  } catch (err) {
    throw err;
  }
}

export async function deleteProductApi(id: string): Promise<void> {
  try {
    await mockDb.remove('products', id);
  } catch (err) {
    console.error(err);
  }
}

export async function fetchUsersList(): Promise<ApiUser[]> {
  try {
    const data = await mockDb.getAll('users');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function createUserApi(data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    return await mockDb.create('users', data);
  } catch (err) {
    throw err;
  }
}

export async function updateUserApi(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  try {
    return await mockDb.update('users', id, data);
  } catch (err) {
    throw err;
  }
}

export async function deleteUserApi(id: string): Promise<void> {
  try {
    await mockDb.remove('users', id);
  } catch (err) {
    console.error(err);
  }
}

export async function fetchWarehousesList(): Promise<any[]> {
  try {
    const data = await mockDb.getAll('warehouses');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function createWarehouseApi(data: any): Promise<any> {
  try {
    return await mockDb.create('warehouses', data);
  } catch (err) {
    throw err;
  }
}

export async function fetchSubscriptionPlansList(): Promise<any[]> {
  try {
    const data = await mockDb.getAll('subscription_plans');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAuditLogsList(): Promise<any[]> {
  return [];
}

export async function fetchNotificationsList(): Promise<any[]> {
  return [];
}
