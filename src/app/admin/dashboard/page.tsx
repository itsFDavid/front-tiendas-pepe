"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Edit, Trash2, Loader2, RefreshCw } from "lucide-react";
import { deleteProduct, executeSeed, updateProduct } from "@/lib/api";
import { Product, User } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useProductContext } from "@/context/product-context";
import { Textarea } from "@/components/ui/textarea";
// import Image from "next/image";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editPrecio, setEditPrecio] = useState(0);
  const [editStock, setEditStock] = useState(0);
  // const [editImagen, setEditImagen] = useState<File | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const router = useRouter();
  // const [products, setProducts] = useState<Product[]>([]);
  const { products, refreshProducts, lastUpdated, isLoading, error } =
    useProductContext();

  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const auth = useAuth();
  const { productToEditId, setProductToEditId } = useProductContext();
  const productsPerPage = 50;

  // Detectar el scroll para mostrar el botón
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        // Cambia este valor si quieres que aparezca antes o después
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const authUser = auth;
      setUser(authUser.user);
      setUserLoading(false);
    };

    fetchUser();
  }, [auth]);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/products");
      }
    }
  }, [user, userLoading, router]);

  // Actualización automática cada 30 segundos
  // useEffect(() => {
  //   if (!user || user.role !== "admin") return;

  //   const intervalId = setInterval(async () => {
  //     try {
  //       const productsData = await fetchProducts(0, 100000);
  //       const formattedProducts = productsData.map((product: Product) => ({
  //         id_producto: product.id_producto?.toString() || "",
  //         nombre_producto: product.nombre_producto || "",
  //         descripcion: product.descripcion || "",
  //         precio: product.precio || 0,
  //         stock: product.stock || 0,
  //         imagen: product.imagen || null,
  //       }));
  //       // setProducts(formattedProducts);

  //       setLastUpdated(new Date().toLocaleTimeString());
  //       toast.info("Productos actualizados", { duration: 2000 });
  //     } catch (error) {
  //       console.error("Error en actualización automática:", error);
  //     }
  //   }, 30000); // 30 segundos

  //   return () => clearInterval(intervalId);
  // }, [user]);

  const handleRefreshProducts = async () => {
    try {
      toast.info("Actualizando productos...");
      await refreshProducts();
    } catch (error) {
      console.error("Error al actualizar productos:", error);
      toast.error("Error al actualizar los productos");
    }
  };

  const handleExcuteSeed = async () => {
    try {
      toast.info("Ejecutando semilla...");
      await executeSeed();
      await handleRefreshProducts();
      toast.success("Semilla ejecutada correctamente");
    } catch (error) {
      console.error("Error al ejecutar semilla:", error);
      toast.error("Error al ejecutar semilla");
    }
  };

  // useEffect(() => {
  //   const getProducts = async () => {
  //     try {
  //       setLoading(true);
  //       // Para el admin, obtenemos más productos (offset 0, limit 100)
  //       // const productsData = await fetchProducts(0, 100000);

  //       // Adaptamos la respuesta de la API a nuestro formato de Product
  //       // const formattedProducts = productsData.map((product: Product) => ({
  //       //   id_producto: product.id_producto?.toString() || "",
  //       //   nombre_producto: product.nombre_producto || "",
  //       //   descripcion: product.descripcion || "",
  //       //   precio: product.precio || 0,
  //       //   stock: product.stock || 0,
  //       //   imagen: product.imagen || null,
  //       // }));

  //       // setProducts(formattedProducts);
  //       refreshProducts();
  //     } catch (err) {
  //       setError(
  //         "Error al cargar los productos. Por favor, intenta de nuevo más tarde."
  //       );
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (user && user.role === "admin") {
  //     getProducts();
  //   }
  // }, [user, refreshProducts]);

  useEffect(() => {
    if (products.length > 0 && productToEditId) {
      const product = products.find((p) => p.id_producto === productToEditId);
      if (product) {
        handleEditProduct(product);
        setProductToEditId(null);
      }
    }
  }, [products, productToEditId, setProductToEditId]);

  // useEffect(() => {
  //   if (editImagen) {
  //     const objectUrl = URL.createObjectURL(editImagen);
  //     setPreviewUrl(objectUrl);

  //     return () => {
  //       URL.revokeObjectURL(objectUrl);
  //     };
  //   } else {
  //     setPreviewUrl(null);
  //   }
  // }, [editImagen]);

  // Productos después de filtrar por búsqueda
  const filteredProducts = products.filter(
    (product) =>
      product.nombre_producto
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.id_producto.toString().includes(searchTerm)
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleEditProduct = (product: Product) => {
    // Lógica para editar el producto
    // console.log("Editar producto:", product);
    setProductToEdit(product);
    toast.info(`Editando: ${product.nombre_producto}`);
    setProductToEdit(product);
    setEditNombre(product.nombre_producto);
    setEditDescripcion(product.descripcion || "");
    setEditPrecio(product.precio);
    setEditStock(product.stock);
    // setEditImagen(null);
  };

  const handleDeleteProduct = async (product: Product) => {
    toast.warning(`Eliminando: ${product.nombre_producto}`);
    try {
      await deleteProduct(product.id_producto);
      await refreshProducts();
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al eliminar el producto.");
    }
  };

  const handleSaveEdit = async () => {
    if (!productToEdit) return;

    try {
      const updatedProduct = {
        nombre_producto: editNombre,
        precio: editPrecio,
        stock: editStock,
        descripcion: editDescripcion,
      };

      await updateProduct(productToEdit.id_producto, updatedProduct);
      await refreshProducts();

      setProductToEdit(null);
      toast.success("Producto actualizado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Hubo un problema al actualizar el producto.");
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      {productToEdit && (
        <div className="mt-10 border rounded-lg p-6 bg-white shadow mb-5">
          <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Nombre del producto
              </label>
              <Input
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Descripcion del producto
              </label>
              <Textarea
                value={editDescripcion}
                onChange={(e) => setEditDescripcion(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio</label>
              <Input
                type="number"
                value={editPrecio}
                onChange={(e) => setEditPrecio(parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <Input
                type="number"
                value={editStock}
                onChange={(e) => setEditStock(parseInt(e.target.value))}
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium mb-1">Imagen</label>
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setEditImagen(file);
                  }
                }}
                accept="image/*"
                className="border-gray-100 border-2 border-b-blue-500 focus:ring-blue-500"
                placeholder="Selecciona una imagen"
              />
              {productToEdit.imagen &&
                typeof productToEdit.imagen === "string" && (
                  <div className="mt-2">
                    <Image
                      src={productToEdit.imagen}
                      alt="Imagen del producto"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}

              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview de la imagen"
                    width={128}
                    height={128}
                    className=" object-cover rounded-md"
                  />
                </div>
              )}
            </div> */}
          </div>
          <Button
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSaveEdit}
          >
            Guardar Cambios
          </Button>
          <Button
            variant="outline"
            className="mt-4 ml-2"
            onClick={() => setProductToEdit(null)}
          >
            Cancelar
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md border-1 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos en inventario
            </p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPurchaseHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
          </CardContent>
        </Card> */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${100}</div>
            <p className="text-xs text-muted-foreground">Ingresos totales</p>
          </CardContent>
        </Card> */}
      </div>

      <Tabs defaultValue="products">
        <TabsList className="mb-4 bg-cyan-50">
          <TabsTrigger value="products">Productos</TabsTrigger>
          {/* <TabsTrigger value="orders">Pedidos</TabsTrigger> */}
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between max-sm:flex-col">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-2xl">
                    Gestión de Productos
                  </CardTitle>
                  <p className="text-sm text-muted-foreground text-slate-400">
                    Última actualización: {lastUpdated}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-end gap-2 mt-2 max-sm:gap-3">
                  <Button
                    onClick={handleRefreshProducts}
                    className="ml-2 w-full shadow-sm bg-blue-300 hover:bg-blue-400"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Actualizar Lista de Productos
                  </Button>
                  {/* Boton de ejecutar semilla */}
                  <Button
                    onClick={handleExcuteSeed}
                    className="ml-2 w-full shadow-sm bg-green-300 hover:bg-green-400"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Ejecutar Semilla
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <CardDescription>
                  Administra tu inventario de productos
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-muted-foreground bg-amber-300 rounded-md px-2 py-1">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="space-x-2">
                      <Button
                        className="text-cyan-500 hover:text-cyan-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer shadow-none"
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        className="text-cyan-500 hover:text-cyan-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer shadow-none"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 mt-4 max-sm:flex-col">
                <div className="relative flex-1 max-sm:w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    className="pl-8 border-gray-100 border-2 border-b-blue-500 focus:ring-blue-500 max-sm:w-full"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button
                  className="bg-green-400 hover:bg-green-600 max-sm:mt-2 max-sm:w-full"
                  onClick={() => {
                    console.log("Añadir producto", user);
                    if (userLoading) {
                      toast.error("Cargando usuario...");
                      return;
                    }
                    if (!user) {
                      toast.error("Usuario no encontrado");
                      return;
                    }
                    if (user.role !== "admin") {
                      toast.error("No tienes permisos para añadir productos");
                      return;
                    }
                    router.push("/admin/crear-producto");
                    toast.info("Dirijiendo a panel para crear producto...");
                  }}
                >
                  Añadir Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripcion</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No se encontraron productos
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedProducts.map((product) => (
                        <TableRow key={product.id_producto}>
                          <TableCell className="font-medium">
                            {product.id_producto}
                          </TableCell>
                          <TableCell>{product.nombre_producto}</TableCell>
                          <TableCell
                            className="max-w-sm truncate overflow-hidden whitespace-nowrap"
                            title={product.descripcion || ""}
                          >
                            {product.descripcion}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(product.precio)}
                          </TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                className="text-yellow-800 bg-yellow-400 hover:bg-yellow-600"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                className="text-red-800 bg-red-400 hover:bg-red-600"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Pedidos</CardTitle>
              <CardDescription>
                Ver y gestionar pedidos de clientes
              </CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar pedidos por ID..."
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseHistory.map((order) => (
                    <TableRow key={order.id_compra}>
                      <TableCell className="font-medium">
                        {order.id_compra}
                      </TableCell>
                      <TableCell>{order.cliente_.nombre_cliente}</TableCell>
                      <TableCell>{order.fecha_compra.toISOString()}</TableCell>
                      <TableCell>
                        $
                        {(
                          order.detalles_.reduce(
                            (total, detalle) => total + detalle.total,
                            0
                          ) * 1.16
                        ).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>
      {showScrollButton && (
        <Button
          onClick={handleScrollToTop}
          className="fixed bottom-15 left-1 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
        >
          ↑ Subir
        </Button>
      )}
    </div>
  );
}
