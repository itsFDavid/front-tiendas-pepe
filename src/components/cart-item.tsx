"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { CartItem as CartItemType } from "@/lib/types";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

export default function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1">
            {item.nombre_producto}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <div className="text-sm text-muted-foreground">
              {formatCurrency(item.precio)} x {item.quantity}
            </div>
            <div className="font-medium">
              {formatCurrency(item.precio * item.quantity)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg">
      {/* Imagen del producto */}
      <Image
        width={96}
        height={50}
        src={typeof item.imagen === "string" ? item.imagen : "/no-image.svg"}
        alt={item.nombre_producto}
        className="object-cover rounded-md border "
      />

      {/* Contenido del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">{item.nombre_producto}</h3>
        <p className="text-sm">
          {item.descripcion}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="font-medium">{formatCurrency(item.precio)}</div>
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              className="h-8 w-8 bg-red-300 hover:bg-red-400 hover:cursor-pointer"
              onClick={() =>
                updateQuantity(item.id_producto, Math.max(1, item.quantity - 1))
              }
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                  if (value > item.stock) {
                    toast.error("No hay más stock disponible");
                    return;
                  }
                  updateQuantity(item.id_producto, value);
                }
              }}
              className="w-14 text-center border-2 border-white border-b-blue-400 h-8 focus:outline-none focus:border-b-blue-600 focus:ring-0"
            />

            <Button
              size="icon"
              className="h-8 w-8 bg-green-200 hover:bg-green-300 hover:cursor-pointer"
              onClick={() => {
                if (item.quantity >= item.stock) {
                  toast.error("No hay más stock disponible");
                  return;
                }
                updateQuantity(item.id_producto, item.quantity + 1);
              }}
              disabled={item.quantity >= item.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-red-500 hover:bg-red-600 hover:cursor-pointer"
            onClick={() => removeFromCart(item.id_producto)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
