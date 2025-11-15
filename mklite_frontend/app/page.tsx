"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../app/login/loginService";
import styles from "../app/login/LoginPage.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor ingresa email y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("token", response.token);
      router.push("/Home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          <h1 className="text-4xl font-extrabold mb-8 text-center text-red-600 tracking-tight">
            Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="text-center mt-4">
            <a href="/Register" className="text-red-600 font-medium hover:text-red-800 transition">
              Crear cuenta
            </a>
          </div>
        </div>
      </div>

      <div className={styles.rightSide}>
        <Image
          src="/Imagines/Logo.jpg"
          alt="Logo de la app"
          width={550}
          height={550}
          className="object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
}
