"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "../page.module.css";

const PaymentModal = ({ open, onClose, product }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handlePay = async () => {
    if (!user) {
      alert("Please login to continue");
      return;
    }
    if (!product) return;
    setLoading(true);
    setError("");
    try {
      const orderPayload = {
        userId: user._id || user.id,
        items: [
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: 1,
          },
        ],
        totalAmount: product.price,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Payment failed" }));
        throw new Error(err.message || "Payment failed");
      }
      onClose?.();
      router.push("/orders");
    } catch (e) {
      setError(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        <h3>Payment</h3>
        <div className={styles.modalForm}>
          <input placeholder="Cardholder Name" />
          <input placeholder="Card Number" />
          
            <input placeholder="MM/YY" />
            <input placeholder="CVC" />
          
          {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}
          <button onClick={handlePay} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
          <button type="button" onClick={onClose} className={styles.modalClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

