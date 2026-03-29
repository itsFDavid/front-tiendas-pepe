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
  Menu, // Importamos el icono de hamburguesa
} from "lucide-react";
import CartItem from "./cart-item";
import { formatCurrency } from "@/lib/utils";
import { useProductContext } from "@/context/product-context";
import { UserRole } from "@/lib/types";

export default function Navigation() {
  const { user, logout } = useAuth();
  const { setProductToEditId, lowStockProducts } = useProductContext();
  const { cart, getTotalPrice, handlePurchase } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            <span>Tiendas Don Pepe</span>
          </Link>
        </div>
      </header>
    );
  }

  // Componente interno para reutilizar los links en desktop y móvil
  const NavLinks = () => (
    <>
      {user.role === UserRole.ADMIN ? (
        <Link
          href="/admin/dashboard"
          onClick={() => setIsMenuOpen(false)}
          className={`text-sm font-medium flex items-center gap-2 ${
            pathname === "/admin/dashboard"
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/products"
            onClick={() => setIsMenuOpen(false)}
            className={`text-sm font-medium flex items-center gap-2 ${
              pathname === "/products"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Home className="h-4 w-4" /> Productos
          </Link>
          <Link
            href="/purchase-history"
            onClick={() => setIsMenuOpen(false)}
            className={`text-sm font-medium flex items-center gap-2 ${
              pathname === "/purchase-history"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <History className="h-4 w-4" /> Historial de compras
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-4">
          {/* BOTÓN HAMBURGUESA (Solo móvil) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white">
              <SheetHeader>
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href={
              user.role === UserRole.ADMIN ? "/admin/dashboard" : "/products"
            }
            className="flex items-center gap-2 font-bold text-xl"
          >
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">Tiendas Don Pepe</span>
          </Link>
        </div>

        {/* NAVEGACIÓN DESKTOP (Se oculta en móvil) */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* CARRITO (Solo para Usuarios) */}
          {user.role === UserRole.USER && (
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-green-800 font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-yellow-50 p-4 w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Tu carrito</SheetTitle>
                </SheetHeader>
                {/* ... (Todo tu código del carrito se mantiene igual) ... */}
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
                          className="mt-4 border-2 border-yellow-600 hover:bg-yellow-100"
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
                        <span>Total + IVA 16%</span>
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
                          className="w-full border border-primary"
                        >
                          Ver carrito
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsCartOpen(false);
                            handlePurchase(user);
                          }}
                          className="w-full"
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

          {/* MENÚ DE USUARIO / ALERTAS DE STOCK */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user.role === UserRole.ADMIN && lowStockProducts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-red-200"
                  >
                    <Package className="h-5 w-5 text-red-600" />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                      {lowStockProducts.length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white w-72">
                  <DropdownMenuLabel>Poco Stock</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {lowStockProducts.map((product) => (
                    <DropdownMenuItem
                      key={product.id_producto}
                      onClick={() => {
                        setProductToEditId(product.id_producto.toString());
                        router.push("/admin/dashboard");
                      }}
                    >
                      {product.nombre_producto} ({product.stock})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-yellow-50 w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.nombre}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
