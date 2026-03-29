"use client";

import { useAuth } from "@/context/auth-context";
import { ProductProvider } from "@/context/product-context";

export function ProductProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return <ProductProvider user={user}>{children}</ProductProvider>;
}
