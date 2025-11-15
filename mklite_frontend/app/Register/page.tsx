"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser } from "./userService";
import { User } from "./User";
import { Modal } from "@/components/Modal";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<User>({
    name: "",
    ci: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.ci || !form.phone || !form.email || !form.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);
      setShowModal(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.formWrapper}>
          <h1 className="text-4xl font-extrabold mb-8 text-center text-red-600 tracking-tight">
            Registro
          </h1>

          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="text"
              name="ci"
              placeholder="Cédula de Identidad (CI)"
              value={form.ci}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className={styles.input}
            />

            {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Registrando..." : "Registrarme"}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.rightSide}>
        <Image
          src="/Imagines/Logo.jpg"
          alt="Logo de registro"
          width={550}
          height={550}
          className="object-contain drop-shadow-2xl"
        />
      </div>

      {showModal && <Modal message="Tu usuario ha sido creado correctamente." onClose={closeModal} />}
    </div>
  );
}
