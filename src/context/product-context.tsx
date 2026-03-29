"use client";
import { fetchProducts } from "@/lib/api";
import { Product, User } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

interface ProductProviderProps {
  children: React.ReactNode;
  user: User | null;
}

interface ProductContextType {
  products: Product[];
  lowStockProducts: Product[];
  refreshProducts: () => Promise<void>;
  productToEditId: string | null;
  setProductToEditId: (id: string | null) => void;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  lowStockProducts: [],
  refreshProducts: async () => {},
  productToEditId: null,
  setProductToEditId: () => {},
  lastUpdated: "",
  isLoading: true,
  error: null,
});

export const ProductProvider = ({ children, user }: ProductProviderProps) => {
  const [productToEditId, setProductToEditId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    if (user?.role !== "admin") {
      setProducts([]);
      setLowStockProducts([]);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      // toast.loading("Cargando productos...", {
      //   duration: 1500,
      //   description: "Por favor, espera un momento.",
      // });
      const productsData = await fetchProducts(0, 100000);
      const formattedProducts = productsData.map((product: Product) => ({
        id_producto: product.id_producto?.toString() || "",
        nombre_producto: product.nombre_producto || "",
        descripcion: product.descripcion || "",
        precio: product.precio || 0,
        stock: product.stock || 0,
        imagen: product.imagen || null,
      }));

      setLastUpdated(new Date().toLocaleString());
      setProducts(formattedProducts);
      setLowStockProducts(formattedProducts.filter((p) => p.stock < 15));
      // toast.dismiss();
      toast.success("Productos actualizados con éxito");
    } catch (error) {
      setError(
        "Error al cargar los productos. Por favor, intenta de nuevo más tarde."
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshProducts();

    const interval = setInterval(() => {
      refreshProducts();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refreshProducts]);

  return (
    <ProductContext.Provider
      value={{
        productToEditId,
        setProductToEditId,
        products,
        lowStockProducts,
        refreshProducts,
        lastUpdated,
        isLoading,
        error,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProductContext debe usarse dentro de ProductProvider");
  return context;
};
