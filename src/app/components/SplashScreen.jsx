"use client";
import { useEffect, useState } from "react";
import styles from "../page.module.css";
import logo from '../../../public/logo.png'

export default function SplashScreen({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash ? (
        <div className={styles.splash}>
          <img src={logo.src} alt="Logo" className={styles.logo1} />
        </div>
      ) : (
        children
      )}
    </>
  );
}
