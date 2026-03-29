"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 flex flex-col items-center">
        <Image
          src={
            typeof product.imagen === "string"
              ? product.imagen
              : "/no-image.svg"
          }
          width={300}
          height={200}
          alt={
            typeof product.imagen === "string"
              ? product.imagen
              : "Imagen no disponible"
          }
          className="w-full h-48 object-contain rounded-md mb-4 bg-white"
        />
        <CardTitle>{product.nombre_producto}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-5">
          {product.descripcion}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold">{formatCurrency(product.precio)}</p>
          <div className="flex flex-col items-center bg-amber-200 px-1.5 py-0.5 rounded-xl">
            <p className="text-sm text-muted-foreground">{product.stock}</p>
            <p className="text-sm text-muted-foreground">En stock</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button
          className="w-full bg-black text-white"
          onClick={() => addToCart(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Añadir al carrito
        </Button>
      </CardFooter>
    </Card>
  );
}
