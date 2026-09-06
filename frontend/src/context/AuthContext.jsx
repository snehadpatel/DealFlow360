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

  // Real API login — no mock fallback
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const jwtToken = res.access_token;
      const userData = res.user || {
        id: res.id,
        name: res.name || email.split("@")[0],
        email: email,
        role: res.role || "REP",
        customer_id: res.customer_id,
      };
      saveAuth(userData, jwtToken);
      return { user: userData, access_token: jwtToken };
    } catch (err) {
      console.error("Login failed:", err);
      const detail = err?.response?.data?.detail || "Invalid email or password";
      throw new Error(detail);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role = "REP") => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/signup", { name, email, password, role });
      const jwtToken = res.access_token;
      const userData = res.user || { name, role, email };
      saveAuth(userData, jwtToken);
      return { user: userData, access_token: jwtToken };
    } catch (err) {
      console.error("Signup failed:", err);
      const detail = err?.response?.data?.detail || "Signup failed";
      throw new Error(detail);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/google", { credential });
      const jwtToken = res.access_token;
      const userData = res.user || { name: "Google User", role: "REP", email: "google@dealflow360.com" };
      saveAuth(userData, jwtToken);
      return { user: userData, access_token: jwtToken };
    } catch (err) {
      console.error("Google login failed:", err);
      throw new Error("Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials matching seeded TechNova team
  const DEMO_CREDENTIALS = {
    REP: { email: "rahul@technova.com", password: "rep123" },
    MANAGER: { email: "neha@technova.com", password: "mgr123" },
    FINANCE: { email: "sneha@technova.com", password: "fin123" },
    OPERATIONS: { email: "karan@technova.com", password: "ops123" },
    CUSTOMER: { email: "ankit@abcbank.com", password: "cust123" },
    ADMIN: { email: "arjun@technova.com", password: "admin123" },
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
