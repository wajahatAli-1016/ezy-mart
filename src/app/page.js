"use client";

import Navbar from "./components/Navbar";
import { Suspense } from "react";
import styles from "./page.module.css"
import filter from "../../public/filter.png"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "./components/LoginModal";
import { useAuth } from "./context/AuthContext.jsx";
import Carousel from "./components/Carousel";
import Footer from "./components/Footer";
import logo from "../../public/logo.png"
import { useCart } from "./context/CartContext.js";
import Toast from "./components/Toast.jsx";

const HomeContent = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [loginOpen, setLoginOpen] = useState(false)
  const [pendingProductId, setPendingProductId] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(null);
  const [toast, setToast] = useState(null);

  const slides = [
    "/banner1.png",
    "/banner2.png",
    "/banner3.png",
    "/banner4.png"
  ];



  const handleCategoryChange = (value) => {
    const params = new URLSearchParams(searchParams?.toString?.() || "");
    if (value) params.set("category", value); else params.delete("category");
    const qs = params.toString();
    router.push(`/${qs ? `?${qs}` : ""}`);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")
        const category = (searchParams?.get("category") || "").trim()
        const q = (searchParams?.get("q") || "").trim()
        const tags = (searchParams?.get("tags") || "").trim()
        const params = new URLSearchParams()
        if (category) params.set("category", category)
        if (q) params.set("q", q)
        if (tags) params.set("tags", tags)
        const qs = params.toString()
        const res = await fetch(`/api/products${qs ? `?${qs}` : ""}`);
        const data = await res.json().catch(() => []);
        if (!res.ok || !Array.isArray(data)) {
          setProducts([]);
          setError("Failed to load products")
          setLoading(false)
          return;
        }
        setProducts(data);
        setLoading(false)
      } catch (err) {
        setProducts([]);
        setError("Failed to load products")
        setLoading(false)
      }
    };
    loadProducts();
  }, [searchParams]);

  const selectedCategory = (searchParams?.get("category") || "").trim();

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedToCart(product._id);
    setTimeout(() => setAddedToCart(null), 2000); // Clear message after 2 seconds
  };

  return (
    <div className={styles.container}>
      <Suspense fallback={<div>Loading navbar...</div>}>
        <Navbar user={user} />
      </Suspense>

      <div className={styles.titles}>
        <h1 >Shop Smart, Live Better</h1>
        <p >Discover exclusive deals and trending products just for you.</p>
      </div>
      <div className={styles.bannerContainer}>
        <Carousel images={slides} />
      </div>

      <div className={styles.filter}>
        <h2 className={styles.text}>Our Products</h2>
        <select
          className={styles.select}
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="clothes">Clothes</option>
          <option value="shoes">Shoes</option>
          <option value="watch">Watch</option>
          <option value="mobile accessories">Mobile accessories</option>
        </select>
      </div>
      <div className={styles.productsSection}>
        {loading && <div className={styles.loaderContainer}>
          <img src={logo.src} alt="Car" className={styles.loader} />
          <h3>Loading products...</h3>
        </div>
        }
        {!loading && error && <p>{error}</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}
        {!loading && !error && (
          <div className={styles.productsGrid}>
            {products.map((p) => (
              <div key={p._id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {p.image && (
                    <img src={p.image} alt={p.name} className={styles.image} />
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <div className={styles.priceContainer}>
                    {p.isOnSale ? (
                      <>
                        <span className={styles.originalPrice}>${p.price}</span>
                        <span className={styles.salePrice}>${p.salePrice}</span>
                        <span className={styles.saleBadge}>{p.salePercentage}% OFF</span>
                      </>
                    ) : (
                      <p className={styles.price}>${p.price}</p>
                    )}
                  </div>
                  <p className={`${styles.stock} ${p.stock > 0 ? styles.inStock : styles.outStock}`}>
                    {p.stock > 0 ? "In stock" : "Out of stock"}
                  </p>
                  <div className={styles.btn}>
                    <button
                      className={`${styles.buyBtn} ${p.stock === 0 ? styles.disabled : ""}`}
                      disabled={p.stock === 0}
                      onClick={() => {
                        if (!user) {
                          setPendingProductId(p._id);
                          setLoginOpen(true);
                          return;
                        }
                        router.push(`/product/${p._id}`);
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      className={`${styles.cartBtn} ${addedToCart === p._id && user ? styles.addedToCart : ''}`}

                      onClick={() => {
                        if (!user) {
                          setPendingProductId(p._id);
                          setLoginOpen(true);
                          return;
                        }
                        handleAddToCart(p)

                      }}
                      disabled={p.stock === 0}
                    >
                      {addedToCart === p._id ? user ? 'Added!' : "" : 'Add to Cart'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          if (pendingProductId) {
            const id = pendingProductId;
            setPendingProductId(null);
            router.push(`/product/${id}`);
          }
        }}
      />
      <Footer />
    </div>
  )
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <HomeContent />
    </Suspense>
  );
}
