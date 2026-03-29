"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { createProduct } from "@/lib/api";
import { User } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Asegúrate de tener este componente
import Image from "next/image";

export default function CrearProductoPage() {
  const router = useRouter();
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState(""); // nuevo campo
  const [precio, setPrecio] = useState(1);
  const [stock, setStock] = useState(10);
  const [imagen, setImagen] = useState<File | null>(null); // nuevo campo
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setUser(auth.user);
      setUserLoading(false);
    };
    fetchUser();
  }, [auth]);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/admin");
      }
    }
  }, [user, userLoading, router]);

  const handleCreate = async () => {
    if (!nombre || precio <= 0 || stock < 0 || !descripcion) {
      toast.error("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);

      await createProduct({
        nombre_producto: nombre,
        descripcion,
        precio,
        stock,
        imagen,
      });
      router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al crear el producto");
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="max-w-xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Crear Nuevo Producto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>
            Nombre del producto <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <Label>
            Descripción <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Escribe una descripción del producto..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <Label>
            Precio <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            placeholder="Precio"
            value={precio}
            onChange={(e) => setPrecio(parseFloat(e.target.value))}
          />

          <Label>
            Stock <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
          />

          <Label>Imagen del producto (opcional)</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImagen(file);
                setPreviewUrl(URL.createObjectURL(file)); // <-- genera la URL para previsualizar
              }
            }}
          />

          {previewUrl && (
            <div className="mt-4 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <Image
                width={300}
                height={200}
                src={previewUrl}
                alt="Vista previa del producto"
                // className="max-w-full h-auto rounded-md border"
                className="w-full h-48 object-contain rounded-md mb-4 bg-white"
              />
            </div>
          )}

          <Button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-400 hover:bg-blue-500 hover:cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Crear Producto
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
