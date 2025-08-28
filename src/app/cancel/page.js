"use client"
import Link from 'next/link';
import styles from '../page.module.css';
import Navbar from '../components/Navbar';

export default function Cancel() {
  return (
  <div className={styles.message}>
    <Navbar/>
    <h1 className={styles.cancelMessage}>❌ Payment Cancelled!</h1>
    <Link href='/'>Back to main page</Link>
    </div>
  );
  }
  