"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) { setLoading(false); return; }
      try {
        setLoading(true);
        const res = await fetch(`/api/orders?userId=${user._id || user.id}`);
        const data = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(data)) throw new Error("Failed");
        setOrders(data);
      } catch (_) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return <div className={styles.productsSection}><p>Please login to view your orders.</p></div>;
  if (loading) return <div className={styles.productsSection}><p>Loading...</p></div>;
  if (error) return <div className={styles.productsSection}><p>{error}</p></div>;

  return (
    <div className={styles.container}>
      <Navbar/>
      <div className={styles.order}>
        <h2>Your Orders</h2>
        {orders.length === 0 && <p>No orders yet.</p>}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <thead style={{ backgroundColor: "#4CAF50", color: "white" }}>
            <tr>
              <th className={styles.th}>Order #</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className={styles.td}>{o._id.slice(-6)}</td>
                <td className={styles.td}>{o.status}</td>
                <td className={styles.td}>${o.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Footer/>
    </div>
  );
}


