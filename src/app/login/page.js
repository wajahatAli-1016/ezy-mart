"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../page.module.css";

const ADMIN_EMAIL = "wajahataliq1224@gmail.com";

export default function LoginPage() {
  const { user, login, signup } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, route accordingly
  useEffect(() => {
    if (!user) return;
    if (user.email === ADMIN_EMAIL) router.replace("/admin");
    else router.replace("/");
  }, [user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      // Redirect will happen via the effect above based on user.email
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <h2 style={{ marginBottom: 12 }}>{mode === "signup" ? "signup" : "Login"}</h2>
      <form onSubmit={submit} className={styles.modalForm} style={{ maxWidth: 360 }}>
        {mode === "signup" && (
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
        <button type="submit" disabled={loading} className={styles.buyBtn}>
          {loading ? (mode === "signup" ? "Creating..." : "Logging in...") : (mode === "signup" ? "Sign Up" : "Login")}
        </button>
      </form>
      <div style={{ marginTop: 8, fontSize: 14 }}>
        {mode === "signup" ? (
          <span>
            Already have an account?{" "}
            <button onClick={() => setMode("login")} style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}>
              Login
            </button>
          </span>
        ) : (
          <span>
            New here?{" "}
            <button onClick={() => setMode("signup")} style={{ background: "transparent", border: "none", color: "#2563eb", cursor: "pointer" }}>
              Create an account
            </button>
          </span>
        )}
      </div>
      
    </div>
  );
}


