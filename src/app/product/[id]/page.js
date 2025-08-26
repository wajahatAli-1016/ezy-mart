"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../page.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.jsx";
import PaymentModal from "../../components/PaymentModal.jsx";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import logo from "../../../../public/logo.png"

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const router = useRouter();
const { user } = useAuth();
const [payOpen, setPayOpen] = useState(false);


  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProduct(data);
      } catch (_) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (<div className={styles.loaderContainer + " " + styles.full}>
  <img src={logo.src} alt="Car" className={styles.loader} />
  <h3>loading product...</h3>
  </div>);
  if (error) return <div className={styles.productsSection}><p>{error}</p></div>;
  if (!product) return null;

  return (
    <div className={styles.productDetails}>
      <Navbar/>
      <div className={styles.pName}>
      <h1>{product.name}</h1>
      </div>
      <div className={styles.pCard} >
        <div className={styles.imageWrapper} style={{ height: 320 }}>
          {product.image && <img src={product.image} alt={product.name} className={styles.image} />}
        </div>
        <div className={styles.content}>
          <h2 className={styles.name}>{product.name}</h2>
          <p className={styles.price}>${product.price}</p>
          <p className={`${styles.stock} ${product.stock > 0 ? styles.inStock : styles.outStock}`}>
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </p>
          <p>{product.description}</p>
          <button
            className={`${styles.buyBtn} ${product.stock === 0 ? styles.disabled : ""}`}
            style={{ marginTop: 30 }}
            disabled={product.stock === 0}
            onClick={() => {
              if (!user) return;
              setPayOpen(true);
            }}
          >
            Pay Now
          </button>
        </div>
      </div>
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        product={product}
      />
      <Footer/>
    </div>
  );
}


