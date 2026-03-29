"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/cart-item";
import { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const { cart, getTotalPrice, handlePurchase } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authUser = auth;
        if (!authUser?.user) {
          router.push("/login");
        } else {
          setUser(authUser.user);
        }
      } catch (err) {
        console.error(err);
        setError("Error al obtener los datos del usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [auth, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Tu carrito de compras</h1>

      {cart.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">Tu carrito está vacío</h2>
          <Button
            onClick={() => router.push("/products")}
            className="border-2 border-yellow-50 border-b-yellow-600 hover:bg-yellow-100"
          >
            Continuar comprando
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem key={item.id_producto} item={item} />
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Suma de la orden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA</span>
                  <span>{formatCurrency(getTotalPrice() * 0.16)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotalPrice() * 1.16)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full border-1 hover:bg-gray-100"
                  onClick={() => handlePurchase(user!)}
                >
                  Comprar
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
