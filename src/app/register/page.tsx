"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apellido1, setApellido1] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!email.includes("@")) {
      setError("Email no valido");
      return;
    }
    if (!name) {
      setError("El nombre es requerido");
      return;
    }
    if (!email) {
      setError("El email es requerido");
      return;
    }
    if (!password) {
      setError("La contraseña es requerida");
      return;
    }
    if (!confirmPassword) {
      setError("La confirmación de contraseña es requerida");
      return;
    }
    if (error) {
      setError("");
    }
    try {
      const data = {
        nombre: name,
        email: email,
        password: password,
        apellido1: apellido1,
      };
      await registerUser(data);
      alert("Registro exitoso, puedes iniciar sesión");
      router.push("/login");
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      setError("Error al registrar el usuario");
      return;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
          <CardDescription>Ingresa tus datos para registrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido1">Apellido 1</Label>
              <Input
                id="apellido1"
                value={apellido1}
                onChange={(e) => setApellido1(e.target.value)}
                placeholder="Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p>
            Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-primary font-medium underline text-blue-400"
            >
              Iniciar Sesion
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
