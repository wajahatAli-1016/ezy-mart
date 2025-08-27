"use client"
import Link from "next/link.js";
import { useCart } from "../context/CartContext.js";
import styles from '../page.module.css';
import Navbar from "../components/Navbar.jsx";
export default function CartPage() {
    const { cart, removeFromCart, clearCart } = useCart();

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
        <div className={styles.container}>
            <Navbar/>
            <div className={styles.cartContainer}>
            <h1 className={styles.cartHeading}>Your Cart</h1>
            {cart.length === 0 ? (
                <p>Cart is empty</p>
            ) : (
                <>
                <div className={styles.productsGrid}>
                    {cart.map((item) => (
                        <div key={item._id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                {item.image && (
                                    <img src={item.image} alt={item.name} className={styles.image} />
                                )}
                            </div>
                            <div className={styles.content}>
                            <span>{item.name} (x{item.qty})</span>
                            <span>${item.price * item.qty}</span>

                            <h2 className={styles.salePrice}>{total}</h2>
                            <div className={styles.btn}>
                                <button
                                    className={styles.buyBtn}
                                    onClick={() => removeFromCart(item._id)}
                                >
                                    Remove
                                </button>
                                <Link className={styles.cartBtn} href={`/product/${item._id}`} style={{ width: "100%" }}>Pay now</Link>

                            </div>
                            </div>
                        </div>
                    ))}
</div>
                </>
            )}
            </div>
        </div>
    );
}
