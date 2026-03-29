"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ProductCard from "@/components/product-card";
import { fetchProducts, fetchTotalProducts } from "@/lib/api";
import type { Product, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const auth = useAuth();

  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12; // Productos por página

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = auth;
      setUser(authUser.user);
      setIsLoadingUser(false);
    };

    fetchUser();
  }, [auth]);

  useEffect(() => {
    if (!isLoadingUser && !user) {
      router.push("/login");
    }
  }, [isLoadingUser, user, router]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const productsData = await fetchProducts(offset, limit);

        const formattedProducts = productsData.map((product: Product) => ({
          id_producto: product.id_producto?.toString() || "",
          nombre_producto: product.nombre_producto || "",
          descripcion: product.descripcion || "",
          precio: product.precio || 0,
          stock: product.stock || 0,
          imagen: product.imagen || null,
        }));

        setProducts(formattedProducts);

        if (currentPage === 1 && totalProducts === 0) {
          const total = await fetchTotalProducts();
          setTotalProducts(total);
        }
      } catch (err) {
        setError(
          "Error al cargar los productos. Por favor, intenta de nuevo más tarde."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getProducts();
    }
  }, [user, currentPage, totalProducts]);

  // Calculamos el total de páginas
  const totalPages = Math.ceil(totalProducts / limit);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold">Nuestros Productos</h1>
        <div>
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePreviousPage}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem className="flex items-center justify-center px-4 bg-amber-400 rounded-2xl">
                  Página {currentPage} de {totalPages}
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">
            No se encontraron productos
          </h2>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id_producto} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
