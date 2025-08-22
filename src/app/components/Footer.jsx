import Link from "next/link";
import styles from "../page.module.css"
const Footer = () => {
    return(

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
    
    )
}

export default Footer;