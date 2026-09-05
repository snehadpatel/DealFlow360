# DealFlow360 — Frontend & Backend Integration Technical Guide

This document details **every single technical detail** of how the **React 18 Frontend** communicates with the **FastAPI Backend** in DealFlow360.

---

## 🏗️ 1. High-Level Network & Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant FE as React Frontend (Port 3000)
    participant Proxy as Vite Proxy Server (/api)
    participant BE as FastAPI Backend (Port 8000)
    participant Auth as Security & JWT Middleware
    participant Service as Business Service Layer
    participant DB as SQLModel / SQLite Database

    User->>FE: Triggers UI Action (e.g. Add Customer / Download Invoice)
    FE->>FE: Axios Client adds Bearer JWT Token to Headers
    FE->>Proxy: POST /api/v1/customers/ (HTTP Request)
    Proxy->>BE: Rewrites to http://localhost:8000/api/v1/customers/
    BE->>Auth: Decodes JWT Header & verifies Role permissions
    Auth-->>BE: User authenticated & authorized
    BE->>Service: Invokes Customer Service (customer_service.py)
    Service->>DB: Executes SQLModel session.commit()
    DB-->>Service: Inserts row into 'customer' table
    Service-->>BE: Returns Pydantic CustomerResponse
    BE-->>Proxy: HTTP 201 Created (JSON Payload)
    Proxy-->>FE: Returns Response to Axios Client
    FE->>User: Re-renders UI component & shows Success Toast
```

---

## ⚙️ 2. Development Server Reverse Proxy (`vite.config.js`)

During local development, the React application runs on `http://localhost:3000` while the FastAPI server runs on `http://localhost:8000`. To prevent **Cross-Origin Resource Sharing (CORS)** browser blocks and eliminate hardcoded backend URLs, Vite is configured with a reverse proxy:

### Configuration Code (`frontend/vite.config.js`):
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Technical Detail:
- Any request made by the frontend starting with `/api` (e.g. `/api/v1/customers`) is intercepted by Vite.
- Vite strips the `/api` prefix and forwards the request to `http://localhost:8000/v1/customers`.
- `changeOrigin: true` rewrites the Host header to match `localhost:8000`.

---

## 🔑 3. Axios Client & HTTP Interceptors (`frontend/src/api/client.js`)

All HTTP communication is centralized in `client.js` using **Axios Interceptors**.

### Implementation Code (`frontend/src/api/client.js`):
```javascript
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor — Injects Bearer JWT Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor — Unwraps Data & Handles Expired Tokens
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Key Technical Details:
1. **Request Interceptor**: Before every outgoing HTTP request, Axios reads the JWT token from `localStorage.getItem('token')`. If present, it attaches the HTTP header:
   ```http
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
2. **Response Interceptor Data Unwrapping**: Returns `response.data` directly, so frontend UI functions receive clean JSON objects without needing `res.data.data`.
3. **401 Unauthorized Eviction**: If the JWT token is expired, tampered, or invalid, the backend returns `401 Unauthorized`. The interceptor immediately purges `localStorage` credentials and redirects the user to `/login`.

---

## 🔐 4. Authentication & Security Lifecycle

### Login Sequence:
1. **User Request**: User enters email & password on `Login.jsx`.
2. **Frontend Call**: `login(email, password)` in `AuthContext.jsx` calls:
   ```javascript
   const data = await apiClient.post("/v1/auth/login", { email, password });
   ```
3. **Backend Execution (`backend/app/routers/auth.py`)**:
   - Backend queries SQLModel `select(User).where(User.email == email)`.
   - Hashes password input using `passlib[bcrypt]` and compares with `user.password_hash`.
   - If valid, generates a signed JWT token containing claims:
     ```json
     {
       "sub": "user-uuid-1234",
       "role": "ADMIN",
       "exp": 1757088000
     }
     ```
   - Returns payload:
     ```json
     {
       "access_token": "eyJhbGci...",
       "token_type": "bearer",
       "user": {
         "id": "user-uuid-1234",
         "name": "Super Admin",
         "email": "admin@dealflow360.com",
         "role": "ADMIN"
       }
     }
     ```
4. **State Storage**: `AuthContext.jsx` stores the token and user state:
   - `localStorage.setItem('token', access_token)`
   - `localStorage.setItem('user', JSON.stringify(userData))`
   - Axios headers updated: `apiClient.defaults.headers.common['Authorization'] = 'Bearer ...'`

### Sign Out Sequence:
1. User clicks **Sign Out** in Admin Header dropdown.
2. `logout()` is executed in `AuthContext.jsx`:
   - `setUser(null)` & `setToken(null)`
   - `localStorage.removeItem('token')` & `localStorage.removeItem('user')`
   - `sessionStorage.clear()`
   - Removes Axios default `Authorization` header.
3. React re-evaluates `isAuthenticated = false` and redirects to `<Login />`.

---

## 🔄 5. Data Transfer Objects (DTO) & Schema Mapping

The backend uses **Pydantic v2 Models** (`backend/app/schemas/`) while the frontend uses **TypeScript Interfaces** (`frontend/src/api/adminApi.ts`).

### Schema Comparison Example:

#### Backend Pydantic Schema (`backend/app/schemas/admin_schemas.py`):
```python
class CustomerResponse(BaseModel):
    id: UUID
    name: str
    tier: str
    email: str
    phone: Optional[str]
    address_billing: Optional[str]
    address_shipping: Optional[str]
    tax_id: Optional[str]
    credit_limit: float
    status: str
    created_at: datetime
```

#### Frontend TypeScript Interface (`frontend/src/api/adminApi.ts`):
```typescript
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
```

---

## 📋 6. Complete API Route & Module Integration Table

| Frontend Component | Action Triggered | Frontend API Helper | FastAPI Backend Endpoint | Backend Router File | DB Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Login.jsx` | Click "Sign In" | `login()` | `POST /v1/auth/login` | `routers/auth.py` | Query `user` table |
| `Dashboard.tsx` | Page Mount | `fetchDashboardStats()` | `GET /v1/dashboard/stats` | `routers/dashboard.py` | Aggregate counts across tables |
| `Customers.tsx` | Page Mount | `fetchCustomersList()` | `GET /v1/customers/` | `routers/customers.py` | `SELECT * FROM customer` |
| `Customers.tsx` | Add Customer Modal | `createCustomerApi()` | `POST /v1/customers/` | `routers/customers.py` | `INSERT INTO customer` |
| `Customers.tsx` | Tier/Status Change | `updateCustomerApi()` | `PUT /v1/customers/{id}` | `routers/customers.py` | `UPDATE customer` |
| `Products.tsx` | Page Mount | `fetchProductsList()` | `GET /v1/products/` | `routers/products.py` | `SELECT * FROM product` |
| `Products.tsx` | Add SKU Modal | `createProductApi()` | `POST /v1/products/` | `routers/products.py` | `INSERT INTO product` |
| `Warehouses.tsx` | Page Mount | `fetchWarehousesList()` | `GET /v1/warehouses/` | `routers/warehouses.py` | `SELECT * FROM warehouse` |
| `Users.tsx` | Page Mount | `fetchUsersList()` | `GET /v1/users/` | `routers/users.py` | `SELECT * FROM user` |
| `InvoicesScreen.jsx` | Download PDF Click | `downloadInvoicePdf()` | `GET /v1/invoices/{id}/pdf` | `routers/finance.py` | Generates Tax Invoice Document |
| `AuditLogs.tsx` | Page Mount | `fetchAuditLogsList()` | `GET /v1/audit-logs/` | `routers/admin_rules.py` | `SELECT * FROM auditlog` |

---

## 🛡️ 7. Error Handling & Offline Resilience

To guarantee the frontend application never crashes due to server errors or temporary network drops:

1. **Try / Catch Wrappers**: All frontend API calls in `adminApi.ts`, `invoiceApi.js`, and `customerApi.js` wrap network requests in `try/catch` blocks.
2. **Graceful Fallbacks**: If the backend is loading or unreachable, the frontend falls back to initialized state models, displaying an inline notification (`"Using local fallback / Offline mode"`) while keeping the UI fully interactive.
3. **Toast Notifications**: System operations (e.g. *"Customer created in database successfully"*, *"Signed out successfully"*) trigger non-intrusive floating toast notifications for user feedback.

---

## 🔍 8. End-to-End Walkthrough: Creating a New Customer Account

Here is what happens under the hood when an Admin clicks **"Create Account in DB"**:

1. **User Action**: Admin submits company details in `Customers.tsx`.
2. **Component Call**: `Customers.tsx` calls `createCustomerApi(form)` from `adminApi.ts`.
3. **HTTP Dispatch**: `adminApi.ts` invokes `apiClient.post('/v1/customers/', data)`.
4. **Header Injection**: Axios Interceptor attaches `Authorization: Bearer <jwt_token>`.
5. **Proxy Forwarding**: Vite proxies `/api/v1/customers/` to `http://localhost:8000/v1/customers/`.
6. **Token Verification**: FastAPI executes the `get_current_user` dependency, parsing the JWT token to verify identity and checking role permissions.
7. **Business Logic Execution**: `routers/customers.py` receives the validated Pydantic model and calls `customer_service.create_customer()`.
8. **DB Persistence**: SQLModel executes `session.add(customer)` and `session.commit()`. PostgreSQL/SQLite writes the new row into the `customer` table.
9. **HTTP Response**: FastAPI returns `201 Created` with the JSON payload of the newly created customer.
10. **UI Update**: `Customers.tsx` receives the response, appends the new customer object to its React state array, closes the modal, and renders a success toast.
