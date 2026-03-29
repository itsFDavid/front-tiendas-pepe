import type { Product, Order, User, RegisterUseerDto } from "./types"
import { toast } from "sonner";
// const URL_API = 'http://localhost:3001/api/v1'
// const URL_API = "http://172.168.2.88:3001/api/v1";
const URL_API = 'https://tienda.itsfdavid.com/api/v1'

// Función para obtener productos con paginación basada en offset
export async function fetchProducts(offset = 0, limit = 12): Promise<Product[]> {
  toast.info("Cargando productos...", { duration: 1500 });
  return await safeFetch<Product[]>(
    `${URL_API}/productos?limit=${limit}&offset=${offset}`,
    { headers: getAuthHeaders() }
  );
}

export async function createPurchase(user: User, product: Product): Promise<void> {
  toast.info("Realizando compra...");
  const orderData = {
    clienteId: parseInt(user?.id ?? ""),
    tiendaId: 1,
    detalles: [
      {
        productoId: parseInt(product.id_producto),
        cantidad_productos: 1,
      },
    ],
  };

  await safeFetch(`${URL_API}/compras`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  toast.success("Compra realizada con éxito");
}

// Función para obtener el total de productos (para calcular la paginación)
export async function fetchTotalProducts(): Promise<number> {
  toast.info("Cargando total de productos...", { duration: 1500 });
  const response = await fetch(`${URL_API}/productos?limit=10000`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    console.error("Error:", data || response.statusText);
    handleHttpError(response);
  }

  const totalHeader = response.headers.get('X-Total-Count');
  if (totalHeader) {
    return parseInt(totalHeader, 10);
  }

  const products = await response.json();
  toast.success("Productos cargados");
  return products.length >= 1000 ? 1000 : products.length;
}

// Función para obtener un producto por ID
export async function fetchProductById(id: string): Promise<Product> {
  return await safeFetch<Product>(
    `${URL_API}/productos/${id}`,
    { headers: getAuthHeaders() }
  );
}


export async function getOrderByClient(id: number): Promise<Order[]> {
  toast.info("Cargando ordenes...");
  return await safeFetch<Order[]>(
    `${URL_API}/compras/user/${id}`,
    { headers: getAuthHeaders() }
  );
}

export async function DownloadPDFFactura(idOrden: number): Promise<void> {
  try {
    toast.info("Descargando factura...");
    const response = await fetch(`${URL_API}/facturas/generate/${idOrden}`, {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/pdf",
      },
    });

    if (!response.ok) {
      handleHttpError(response);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura_${idOrden}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("La descarga de la factura ha comenzado");
  } catch (error) {
    console.error("Error al descargar la factura:", error);
    toast.error("Error al descargar la factura");
    throw error;
  }
}


export async function loginUser(email: string, password: string): Promise<User | null> {
  const data = await safeFetch<User>(`${URL_API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!data) {
    toast.error("Error al iniciar sesión");
    return null;
  }
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // console.log("Login data:", data.token);
  return data;
}

export async function registerUser(data: RegisterUseerDto): Promise<User> {
  return await safeFetch<User>(`${URL_API}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function safeFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      handleHttpError(response, errorData);
      throw new Error(errorData?.message || response.statusText || "Unknown error");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}


function handleHttpError(
    response: Response, 
    errorData?: { message?: string | string[] | undefined } | null
  ) {
  const messages = errorData?.message || response.statusText;

  // console.error("Error:", messages);

  switch (response.status) {
    case 400:
       if (Array.isArray(messages)) {
        messages.forEach((msg: string, index: number) => {
          // console.error("Error:", msg);
          // Agrega un pequeño delay para evitar que se pierdan
          setTimeout(() => {
            toast.warning(`Error: ${msg}`);
          }, index * 100); // 100ms entre cada uno
        });
      } else {
        toast.error(`Error de solicitud: ${messages}`);
      }
      break;
    case 401:
      localStorage.removeItem("token");
      toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      break;

    case 403:
      toast.error("Acceso denegado.");
      break;

    case 404:
      toast.error(`No encontrado: ${messages}`);
      break;

    case 500:
      toast.error("Error del servidor. Intenta más tarde.");
      break;

    default:
      toast.error(`Error ${response.status}: ${messages}`);
      break;
  }
}



export async function updateProduct(id: string, updatedData: Partial<Product>): Promise<Product | undefined> {
  console.log("Updating product with ID:", id);
  console.log("Updated data:", updatedData);
  const response =  await safeFetch<Product>(
    `${URL_API}/productos/${id}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    }
  );  
  toast.success("Producto actualizado con éxito");
  return response;
}

export async function createProduct(data: {
  nombre_producto: string;
  precio: number;
  stock: number;
  descripcion?: string | null;
  imagen?: File | null;
}) {
  const res = await safeFetch<Product>(
    `${URL_API}/productos`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
  })
  toast.success("Producto creado con éxito");
  return res;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${URL_API}/productos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    handleHttpError(res);
  }
  toast.success("Producto eliminado con éxito");
}

export async function executeSeed(){
  const res = await fetch(`${URL_API}/productos/seed`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    handleHttpError(res);
  }
  toast.success("Seed ejecutado con éxito");
}