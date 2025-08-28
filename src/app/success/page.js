"use client"
import Link from 'next/link';
import styles from '../page.module.css'
import Navbar from '../components/Navbar';

export default function Success() {
  return (
  <div className={styles.message}>
    <Navbar/>
    <h1 className={styles.successMessage}>✅ Payment Successful!</h1>
    <Link href='/'>Back to main page</Link>
    </div>
  );
  }
  