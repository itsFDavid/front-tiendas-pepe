import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import Navigation from "@/components/navigation";
import { Toaster } from "sonner";
import { ProductProviderWrapper } from "@/components/product-provider-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tiendas Don Pepe",
  description: "Tienda de productos de cualquier tipo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="logo.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ProductProviderWrapper>
            <CartProvider>
              <Navigation />
              <Toaster richColors position="bottom-right" />
              <main className="container mx-auto px-4 py-8">{children}</main>
            </CartProvider>
          </ProductProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
