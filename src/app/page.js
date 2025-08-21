"use client";

import Navbar from "./components/Navbar";
import styles from "./page.module.css"
import banner from "../../public/banner.png"
import filter from "../../public/filter.png"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModal from "./components/LoginModal";
import { useAuth } from "./context/AuthContext.jsx";
import Carousel from "./components/Carousel";
const Home = () => {
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState("")
const [loginOpen, setLoginOpen] = useState(false)
const [pendingProductId, setPendingProductId] = useState(null)
const router = useRouter()
const searchParams = useSearchParams()
const { user } = useAuth()

const slides = [
  "/banner.png",
  "/banner2.png",
  "/banner3.png",
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

  return (
    <div className={styles.container}>
      <Navbar user={user} />
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
        {loading && <p>Loading products...</p>}
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
                  <p className={styles.price}>${p.price}</p>
                  <p className={`${styles.stock} ${p.stock > 0 ? styles.inStock : styles.outStock}`}>
                    {p.stock > 0 ? "In stock" : "Out of stock"}
                  </p>
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
      <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        
        {/* Brand / Logo */}
        <div className={styles.brand}>
          <h2>Ezy-<span>Mart</span></h2>
          <p>Your trusted e-commerce store for everything.</p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/shop">Shop</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.contact}>
          <h4>Contact Us</h4>
          <p>Email: wajahataliq1224@gmail.com</p>
          <p>Phone: +92 3124944512</p>
          <p>Address: Lahore, Pakistan</p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} ShopZone. All rights reserved.</p>
      </div>
    </footer>
  
    </div>
  )
};

export default Home;
