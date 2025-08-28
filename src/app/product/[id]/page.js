"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../page.module.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.js";
import PaymentModal from "../../components/PaymentModal.jsx";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import logo from "../../../../public/logo.png"
import {loadStripe} from "@stripe/stripe-js"

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const router = useRouter();
const { user } = useAuth();
const { addToCart } = useCart();
const [payOpen, setPayOpen] = useState(false);
const [addedToCart, setAddedToCart] = useState(false);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


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
  const items = [
    {
      name: product.name,
      price: product.isOnSale ? product.salePrice : product.price,
      quantity: 1,
    }
  ];

  const handleCheckout = async () => {
    try {
      // 1) Create an order in DB
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?._id || user?.id,
          items: [
            {
              product: product._id,
              name: product.name,
              image: product.image,
              price: items[0].price,
              quantity: items[0].quantity,
            },
          ],
          totalAmount,
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create order");
      }
      const order = await orderRes.json();

      // 2) Create Stripe Checkout Session with metadata.orderId
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, orderId: order._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      if (data?.id) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.id });
        return;
      }

      throw new Error("Invalid checkout response");
    } catch (e) {
      alert(e.message || "Unable to start checkout");
    }
  };
  return (
    <div className={styles.productDetails}>
      <Navbar/>
      <div className={styles.pName}>
      <h1>{product.name}</h1>
      </div>
      <div className={styles.pCard} >
        <div className={styles.imageWrapper} style={{ height: 320}}>
          {product.image && <img src={product.image} alt={product.name} className={styles.image} />}
        </div>
        <div className={styles.content}>
          <h2 className={styles.name}>{product.name}</h2>
          <div className={styles.priceContainer}>
            {product.isOnSale ? (
              <>
                <span className={styles.originalPrice}>${product.price}</span>
                <span className={styles.salePrice}>${product.salePrice}</span>
                <span className={styles.saleBadge}>{product.salePercentage}% OFF</span>
              </>
            ) : (
              <p className={styles.price}>${product.price}</p>
            )}
          </div>
          <p className={`${styles.stock} ${product.stock > 0 ? styles.inStock : styles.outStock}`}>
            {product.stock > 0 ? "In stock" : "Out of stock"}
          </p>
          <p>{product.description}</p>
          <div className={styles.btn}>
            <button
              className={`${styles.buyBtn} ${product.stock === 0 ? styles.disabled : ""}`}
              style={{ marginTop: 30 }}
              disabled={product.stock === 0}
              onClick={() => {
                if (!user) return;
                handleCheckout();
              }}
            >
              Pay Now
            </button>
            <button
              className={`${styles.cartBtn} ${addedToCart ? styles.addedToCart : ""}`}
              style={{ marginTop: 30 }}
              disabled={product.stock === 0}
              onClick={() => {
                addToCart(product);
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
              }}
            >
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
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


