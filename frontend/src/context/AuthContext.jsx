import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync token to axios headers
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const saveAuth = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Real login only. On failure we surface the error so the UI shows that the
  // backend isn't connected — we do NOT fabricate a user (that would hide a
  // broken integration during the demo, and the whole pitch is "real logic").
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post("/auth/login", { email, password });
      saveAuth(data.user || { name: data.name, role: data.role, email }, data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role = "REP") => {
    setLoading(true);
    try {
      const data = await apiClient.post("/auth/signup", { name, email, password, role });
      saveAuth(data.user || { name, role, email }, data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const data = await apiClient.post("/auth/google", { token: credential });
      saveAuth(data.user, data.access_token);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // Demo personas log in through the REAL /auth/login endpoint using the
  // credentials created by backend/seed.py, so a one-click demo still exercises
  // the true auth + RBAC path (real JWT, real role scoping).
  const DEMO_CREDENTIALS = {
    REP: { email: "alex.rep@dealflow360.com", password: "rep123" },
    MANAGER: { email: "maria.manager@dealflow360.com", password: "mgr123" },
    FINANCE: { email: "felix.finance@dealflow360.com", password: "fin123" },
    CUSTOMER: { email: "buyer@abccorp.com", password: "cust123" },
    ADMIN: { email: "admin@dealflow360.com", password: "admin123" },
  };

  const loginDemoPersona = async (role) => {
    const creds = DEMO_CREDENTIALS[role] || DEMO_CREDENTIALS.REP;
    return login(creds.email, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete apiClient.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        signup,
        loginWithGoogle,
        loginDemoPersona,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
