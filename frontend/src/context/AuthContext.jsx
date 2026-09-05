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

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient.post("/auth/login", { email, password });
      saveAuth(data.user || { name: data.name, role: data.role, email }, data.access_token);
      return data;
    } catch (err) {
      // Fallback for offline/mock development
      const mockRole = email.includes("manager")
        ? "MANAGER"
        : email.includes("finance")
        ? "FINANCE"
        : email.includes("customer") || email.includes("buyer")
        ? "CUSTOMER"
        : "REP";
      const fallbackUser = {
        id: "mock-" + Math.random().toString(36).substring(2, 9),
        name: email.split("@")[0],
        email,
        role: mockRole,
      };
      saveAuth(fallbackUser, "mock-jwt-token-" + mockRole.toLowerCase());
      return { user: fallbackUser };
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
    } catch (err) {
      const fallbackUser = {
        id: "mock-" + Math.random().toString(36).substring(2, 9),
        name,
        email,
        role,
      };
      saveAuth(fallbackUser, "mock-jwt-token-" + role.toLowerCase());
      return { user: fallbackUser };
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
    } catch (err) {
      const fallbackUser = {
        id: "google-" + Math.random().toString(36).substring(2, 9),
        name: "Google User",
        email: "google.user@example.com",
        role: "REP",
        picture: "https://ui-avatars.com/api/?name=Google+User&background=10b981&color=fff",
      };
      saveAuth(fallbackUser, "mock-google-token");
      return { user: fallbackUser };
    } finally {
      setLoading(false);
    }
  };

  const loginDemoPersona = (role) => {
    const personas = {
      REP: { name: "Alex Rep (Sales)", email: "alex.rep@dealflow360.com", role: "REP" },
      MANAGER: { name: "Maria Manager (Approver)", email: "maria.manager@dealflow360.com", role: "MANAGER" },
      FINANCE: { name: "Felix Finance (Ops)", email: "felix.finance@dealflow360.com", role: "FINANCE" },
      CUSTOMER: { name: "Acme Corp (Buyer Portal)", email: "buyer@acmecorp.com", role: "CUSTOMER" },
      ADMIN: { name: "Super Admin", email: "admin@dealflow360.com", role: "ADMIN" },
    };
    const selected = personas[role] || personas.REP;
    saveAuth(selected, `demo-token-${role.toLowerCase()}`);
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
