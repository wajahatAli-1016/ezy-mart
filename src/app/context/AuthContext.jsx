"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext({ user: null, login: async () => {}, signup: async () => {}, logout: () => {} });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("auth_user") : null;
      if (raw) setUser(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const login = async ({ email, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error(err.message || "Login failed");
    }
    const loggedInUser = await res.json();
    setUser(loggedInUser);
    try { window.localStorage.setItem("auth_user", JSON.stringify(loggedInUser)); } catch (_) {}
    return loggedInUser;
  };

  const signup = async ({ name, email, password }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Signup failed" }));
      throw new Error(err.message || "Signup failed");
    }
    const newUser = await res.json();
    setUser(newUser);
    try { window.localStorage.setItem("auth_user", JSON.stringify(newUser)); } catch (_) {}
    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      window.localStorage.removeItem("auth_user");
    } catch (_) {}
  };

  const value = useMemo(() => ({ user, login, signup, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


