import { mockDb, getDb } from "../lib/mockDatabase";

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
  const users = await mockDb.getAll('users');
  const customers = await mockDb.getAll('customers');
  const products = await mockDb.getAll('products');
  return {
    users_count: users.length,
    customers_count: customers.length,
    products_count: products.length,
  };
}

export async function fetchCustomersList(): Promise<ApiCustomer[]> {
  return (await mockDb.getAll('customers')) as ApiCustomer[];
}

export async function createCustomerApi(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  return (await mockDb.create('customers', data)) as ApiCustomer;
}

export async function updateCustomerApi(id: string, data: Partial<ApiCustomer>): Promise<ApiCustomer> {
  return (await mockDb.update('customers', id, data)) as ApiCustomer;
}

export async function deleteCustomerApi(id: string): Promise<void> {
  await mockDb.remove('customers', id);
}

export async function fetchProductsList(): Promise<ApiProduct[]> {
  return (await mockDb.getAll('products')) as ApiProduct[];
}

export async function createProductApi(data: Partial<ApiProduct>): Promise<ApiProduct> {
  return (await mockDb.create('products', data)) as ApiProduct;
}

export async function updateProductApi(id: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  return (await mockDb.update('products', id, data)) as ApiProduct;
}

export async function deleteProductApi(id: string): Promise<void> {
  await mockDb.remove('products', id);
}

export async function fetchUsersList(): Promise<ApiUser[]> {
  return (await mockDb.getAll('users')) as ApiUser[];
}

export async function createUserApi(data: Partial<ApiUser>): Promise<ApiUser> {
  return (await mockDb.create('users', data)) as ApiUser;
}

export async function updateUserApi(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
  return (await mockDb.update('users', id, data)) as ApiUser;
}

export async function deleteUserApi(id: string): Promise<void> {
  await mockDb.remove('users', id);
}

// Stubs for remaining views
export async function fetchWarehousesList(): Promise<any[]> { return []; }
export async function createWarehouseApi(data: any): Promise<any> { return data; }
export async function fetchSubscriptionPlansList(): Promise<any[]> { return []; }
export async function fetchAuditLogsList(): Promise<any[]> { return []; }
export async function fetchNotificationsList() { return []; }
