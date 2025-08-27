"use client"
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth(); 
  const userId = user?._id || null;
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false); // 👈 to track hydration

  // Load from localStorage once
  useEffect(() => {
    if (userId) {
      const savedCart = JSON.parse(localStorage.getItem(`cart_${userId}`)) || [];
      setCart(savedCart);
      setLoaded(true);
    } else {
      setCart([]);
      setLoaded(true);
    }
  }, [userId]);

  // Save only after hydration
  useEffect(() => {
    if (loaded && userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }, [cart, loaded, userId]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item._id === product._id);
      if (exist) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.isOnSale ? item.salePrice : item.price;
      return total + price * item.qty;
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.qty, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
