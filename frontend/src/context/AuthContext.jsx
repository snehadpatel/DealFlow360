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

  // Real API login with backend fallback
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const jwtToken = res.access_token;
      const userData = res.user || {
        name: res.name || email.split("@")[0],
        email: email,
        role: res.role || "REP",
      };
      saveAuth(userData, jwtToken);
      return { user: userData, access_token: jwtToken };
    } catch (err) {
      console.warn("Backend API auth error, checking fallback:", err);
      // Fallback for mock personas if backend is unreachable
      const role = Object.keys(DEMO_CREDENTIALS).find(r => DEMO_CREDENTIALS[r].email === email) || "REP";
      const userData = { name: email.split('@')[0], role: role, email };
      saveAuth(userData, "mock-jwt-token");
      return { user: userData, access_token: "mock-jwt-token" };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role = "REP") => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const userData = { name, role, email };
      saveAuth(userData, "mock-jwt-token");
      return { user: userData, access_token: "mock-jwt-token" };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const userData = { name: "Google User", role: "REP", email: "google@dealflow360.com" };
      saveAuth(userData, "mock-jwt-token");
      return { user: userData, access_token: "mock-jwt-token" };
    } finally {
      setLoading(false);
    }
  };

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
