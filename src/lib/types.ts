export interface Product {
  id_producto: string
  nombre_producto: string
  descripcion: string | null
  precio: number
  stock: number
  imagen: string | null | File | undefined
}

export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  apellido1: string;
  apellido2?: string | null;
  email_cliente: string;
  fecha_nacimiento?: Date | null;
  puntos_compra?: number;
  fecha_registro?: Date;
}

export interface OrderDetail {
  id_detalle_compra: number;
  total: number;
  descripcion?: string | null;
  cantidad_productos: number;
  precio_unitario: number;
  producto: Product;
}

export interface Order {
  id_compra: number;
  fecha_compra: Date;
  cliente_: Cliente;
  detalles_: OrderDetail[];
  tienda_: {
    id_tienda: number;
    nombre_tienda: string;
  }
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: string
  nombre: string
  email: string
  // password: string
  role: UserRole
  token?: string;
}

export interface CartItem extends Product {
  quantity: number
}


export interface RegisterUseerDto {
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  email: string;
  password: string;
  fecha_nacimiento?: Date | null;
}