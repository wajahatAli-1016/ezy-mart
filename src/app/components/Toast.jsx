"use client";

import { useEffect } from "react";
import styles from "../page.module.css";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span className={styles.toastMessage}>{message}</span>
      <button className={styles.toastClose} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
