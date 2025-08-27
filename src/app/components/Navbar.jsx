import styles from "../page.module.css"
import logo from "../../../public/logo.png"
import search from "../../../public/search.png"
import avatar from "../../../public/avatar.png"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "../context/CartContext.js"
import cart from '../../../public/cart.png'
const Navbar = ({user}) => {
    const { user: authUser, logout } = useAuth();
    const { getTotalItems } = useCart();
    const effectiveUser = user || authUser || null;
    const [scrolled, setScrolled] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const displayName = (
        typeof effectiveUser === "string"
          ? effectiveUser
          : effectiveUser?.name || effectiveUser?.username || effectiveUser?.email || ""
      ).trim();
    
      const firstLetter = displayName.slice(0, 1).toUpperCase();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Reflect current URL params back into the search box as a hint
    const q = (searchParams?.get("q") || "").trim();
    const category = (searchParams?.get("category") || "").trim();
    const tags = (searchParams?.get("tags") || "").trim();
    const parts = [];
    if (category) parts.push(`category:${category}`);
    if (tags) parts.push(`tags:${tags}`);
    if (q) parts.push(q);
    const combined = parts.join(" ");
    setSearchText(combined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = () => {
    const input = (searchText || "").trim();
    if (!input) {
      setMobileMenuOpen(false);
      router.push("/");
      return;
    }

    let remaining = input;
    let category = "";
    let tags = [];

    // Extract category:pattern
    const catMatch = remaining.match(/(?:^|\s)category:([^\s]+)/i);
    if (catMatch) {
      category = catMatch[1].trim();
      remaining = remaining.replace(catMatch[0], " ").trim();
    }

    // Extract tags:pattern (comma separated)
    const tagsMatch = remaining.match(/(?:^|\s)tags:([^\s]+)/i);
    if (tagsMatch) {
      const raw = tagsMatch[1].trim();
      tags = raw.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
      remaining = remaining.replace(tagsMatch[0], " ").trim();
    }

    // Extract #hash tags
    const hashTags = Array.from(remaining.matchAll(/#(\w+)/g)).map(m => m[1]);
    if (hashTags.length) {
      tags = Array.from(new Set([...(tags || []), ...hashTags]));
      remaining = remaining.replace(/#(\w+)/g, " ").trim();
    }

    const q = remaining.trim();

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (tags.length) params.set("tags", tags.join(","));

    const qs = params.toString();
    setMobileMenuOpen(false);
    router.push(`/${qs ? `?${qs}` : ""}`);
  };

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setMobileMenuOpen(false);

    return(
        <div className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
            {/* Mobile hamburger button */}
            <button className={styles.mobileMenuBtn} onClick={toggleMobileMenu} aria-label="Toggle menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <ul className={`${styles.items} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}>
                <img src={logo.src} alt="logo" className={styles.logo}/>
                <Link href="/" onClick={closeMobileMenu}>Home</Link>
                <Link href = "/orders" onClick={closeMobileMenu}>Orders</Link>
                <Link href="/contact" onClick={closeMobileMenu}>Contact</Link>
                {effectiveUser ? (
                  <>
                    {effectiveUser?.email === "wajahataliq1224@gmail.com" && <Link href="/admin" onClick={closeMobileMenu}>Admin</Link>}
                    <button onClick={() => { logout(); closeMobileMenu(); }} style={{ marginLeft: 12, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>Logout</button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}>Login</Link>
                )}
            </ul>
            <div className={styles.search}>
                <input
                  type="text"
                  placeholder="Search: e.g. category:shoes tags:sale,new #red leather jacket"
                  className={styles.searchInput}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") performSearch(); }}
                />
                <img src={search.src} alt="search" className={styles.searchIcon} onClick={performSearch}/>
                
                {/* Cart Icon */}
                {effectiveUser?
                <Link href="/cart" className={styles.cartIcon}>
                  <img src={cart.src} className={styles.cart}/>
                  {getTotalItems() > 0 && (
                    <span className={styles.cartBadge}>{getTotalItems()}</span>
                  )}
                </Link>:""
                }
                
                {!effectiveUser?
                  <img src={avatar.src} className={styles.avatar}/>:
                  <div className={styles.user}>{firstLetter}</div>
                        
                      }
            </div>
            {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={closeMobileMenu} />}
        </div>
    )
}

export default Navbar;
