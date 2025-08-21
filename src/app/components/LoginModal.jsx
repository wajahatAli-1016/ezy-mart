"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../page.module.css";

const LoginModal = ({ open, onClose, onSuccess }) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      onSuccess?.();
      onClose?.();
    } catch (_) {
      // noop for demo
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <h3>{mode === "signup" ? "Create Account" : "Login"}</h3>
        <form onSubmit={submit} className={styles.modalForm}>
          {mode === "signup" && (
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? (mode === "signup" ? "Signing up..." : "Logging in...") : (mode === "signup" ? "Sign Up" : "Login")}
          </button>
          <button type="button" onClick={onClose} className={styles.modalClose}>Cancel</button>
        </form>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          {mode === "signup" ? (
            <span>Already have an account? <button onClick={() => setMode("login")} style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}>Login</button></span>
          ) : (
            <span>New here? <button onClick={() => setMode("signup")} style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}>Create an account</button></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;


