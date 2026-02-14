"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart based on auth status
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.id) {
      fetchCartFromDB();
    } else {
      const saved = localStorage.getItem("albirr-cart");
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
      setLoaded(true);
    }
  }, [session, status]);

  // Save to localStorage for guests
  useEffect(() => {
    if (loaded && !session?.user?.id && status !== "loading") {
      localStorage.setItem("albirr-cart", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  async function fetchCartFromDB() {
    try {
      const res = await fetch("/api/cart");
      const items = await res.json();
      setCart(
        items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity,
        })),
      );
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoaded(true);
    }
  }

  const addToCart = async (product) => {
    const existing = cart.find((item) => item.id === product.id);
    const newQuantity = existing ? existing.quantity + 1 : 1;

    setCart((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (session?.user?.id) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity: newQuantity,
          }),
        });
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));

    if (session?.user?.id) {
      try {
        await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to remove from cart:", error);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );

    if (session?.user?.id) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (error) {
        console.error("Failed to update cart:", error);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);

    if (session?.user?.id) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    } else {
      localStorage.removeItem("albirr-cart");
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
