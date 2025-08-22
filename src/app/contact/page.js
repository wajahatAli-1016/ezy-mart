"use client"
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import styles from '../page.module.css';
import { Suspense } from "react";

const Contact = () =>{
    return(
        <div className={styles.container}>
            <Suspense>
            <Navbar/>
            </Suspense>
            <div className={styles.contactPage}>
      <div className={styles.contactContainer}>
        <h1>Contact Us</h1>
        <form>
          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />
          <textarea rows="5" placeholder="Your Message" required></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
            <Footer/>
        </div>
    )
}
export default Contact