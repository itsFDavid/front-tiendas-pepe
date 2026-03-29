"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  ShoppingCart,
  User,
  LogOut,
  Package,
  History,
  LayoutDashboard,
} from "lucide-react";
import CartItem from "./cart-item";
import { formatCurrency } from "@/lib/utils";
import { useProductContext } from "@/context/product-context";
import { UserRole } from "@/lib/types";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { setProductToEditId } = useProductContext();
  const { cart, getTotalPrice, handlePurchase } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { lowStockProducts } = useProductContext();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // useEffect(() => {
  //   const loadLowStock = async () => {
  //     if (user?.role === "admin") {
  //       const products = await fetchProducts(0, 1000);
  //       const filtered = products.filter((p) => p.stock < 15);
  //       setLowStockProducts(filtered);
  //     }
  //   };
  //   loadLowStock();
  // }, [user]);

  if (!user) {
    return (
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            <span>Tiendas Don Pepe</span>
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto">
        <Link
          href={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/products"}
          className="flex items-center gap-2 font-bold text-xl"
        >
          <img src="/logo.svg" alt="Logo" className="h-15 w-15" />
          <span>Tiendas Don Pepe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {user.role === UserRole.ADMIN ? (
            <Link
              href="/admin/dashboard"
              className={`text-sm font-medium ${
                pathname === "/admin/dashboard"
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </div>
            </Link>
          ) : (
            <>
              <Link
                href="/products"
                className={`text-sm font-medium ${
                  pathname === "/products"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Productos
                </div>
              </Link>
              <Link
                href="/purchase-history"
                className={`text-sm font-medium ${
                  pathname === "/purchase-history"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <History className="h-4 w-4" />
                  Historial de compras
                </div>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user.role === UserRole.USER && (
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-green-700 text-xl rounded-full h-5 w-4 flex items-center justify-center">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-yellow-50 p-4">
                <SheetHeader>
                  <SheetTitle>Tu carrito</SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col h-[calc(100vh-10rem)]">
                  <div className="flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Tu carrito está vacío
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4 border-2 border-yellow-50 border-b-yellow-600 hover:bg-yellow-100"
                          onClick={() => {
                            setIsCartOpen(false);
                            router.push("/products");
                          }}
                        >
                          Continuar comprando
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <CartItem
                            key={item.id_producto}
                            item={item}
                            compact
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">Sub Total</span>
                        <span className="font-bold">
                          {formatCurrency(getTotalPrice())}
                        </span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">Total + IVA 16%</span>
                        <span className="font-bold">
                          {formatCurrency(getTotalPrice() * 1.16)}
                        </span>
                      </div>
                      <div className="grid gap-2">
                        <Button
                          onClick={() => {
                            setIsCartOpen(false);
                            router.push("/cart");
                          }}
                          className="w-full border border-primary text-primary hover:bg-yellow-100"
                        >
                          Ver carrito
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCartOpen(false);
                            handlePurchase(user);
                          }}
                          className="w-full border border-primary text-primary hover:bg-yellow-100"
                        >
                          Comprar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}

          <DropdownMenu>
            {user.role === UserRole.ADMIN && lowStockProducts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Package className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {lowStockProducts.length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white shadow-md w-80 max-h-96 overflow-y-auto"
                >
                  <DropdownMenuLabel>
                    Productos con poco stock
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {lowStockProducts.map((product) => (
                    <DropdownMenuItem
                      key={product.id_producto}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setProductToEditId(product.id_producto.toString());
                        router.push("/admin/dashboard");
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {product.nombre_producto}
                        </span>
                        <span
                          className={`text-xs ${
                            product.stock < 10
                              ? "text-red-500"
                              : "text-amber-400"
                          }`}
                        >
                          Stock: {product.stock}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-yellow-50">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
