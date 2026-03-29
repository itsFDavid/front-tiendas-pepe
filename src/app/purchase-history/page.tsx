"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { mockPurchaseHistory } from "@/lib/mock-data";
import { Download, Loader2 } from "lucide-react";
import { DownloadPDFFactura, getOrderByClient } from "@/lib/api";
import { Order, User } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function PurchaseHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // estado de carga

  const auth = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = auth;
      setUser(authUser.user);
      setLoading(false);
    };

    fetchUser();
  }, [auth]);

  const [comprasHistorial, setComprasHistorial] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const comprasUser = async () => {
        try {
          const data = await getOrderByClient(Number(user.id));
          setComprasHistorial(data);
        } catch (error) {
          console.error("Error fetching purchase history:", error);
        }
      };
      comprasUser();
    }
  }, [user]);

  const handleDownloadPdf = async (orderId: number) => {
    await DownloadPDFFactura(orderId);
    alert(`Descargar PDF para la orden ${orderId}`);
  };

  if (loading) {
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
      <h1 className="text-3xl font-bold mb-8">Historial de compras</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tus Ordenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead className="text-center">Fecha de compra</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comprasHistorial.map((order) => (
                <TableRow key={order.id_compra}>
                  <TableCell className="font-medium">
                    {order.id_compra}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(order.fecha_compra).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(
                      order.detalles_.reduce(
                        (total, totalOrders) => total + totalOrders.total,
                        0,
                      ) * 1.16,
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(order.id_compra)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Factura
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
