"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Product, User } from "@/lib/types";
import { createPurchase } from "@/lib/api";
import { toast } from "sonner";

export interface CartItem extends Product {
  quantity: number;
}

// const URL_API = "http://172.168.2.88:3001/api/v1";
// const URL_API = 'http://localhost:3001/api/v1';
const URL_API = "https://tienda.itsfdavid.com/api/v1";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  handlePurchase: (user: User) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Failed to parse stored cart:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id_producto === product.id_producto,
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id_producto === product.id_producto
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [
          ...prevCart,
          {
            ...product,
            quantity: 1,
            handlePurchase: async (user: User) => {
              console.log("Handling purchase for product:", product);
              await createPurchase(user, product);
            },
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id_producto === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id_producto !== productId),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const handlePurchase = async (user: User) => {
    const orderData = {
      clienteId: parseInt(user?.id ?? ""),
      tiendaId: 1,
      detalles: [
        ...cart.map((item) => ({
          productoId: parseInt(item.id_producto),
          cantidad_productos: item.quantity,
        })),
      ],
    };
    try {
      const res = await fetch(`${URL_API}/compras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.warning(`${data.message || "Error desconocido"}`);
        return;
      }
      clearCart(); // Limpiar el carrito después de la compra
      toast.success("Compra realizada con éxito");
    } catch (error) {
      console.error("Error al realizar la compra:", error);
      toast.error("Error al realizar la compra");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        handlePurchase, // Agregar la función handlePurchase al contexto
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
