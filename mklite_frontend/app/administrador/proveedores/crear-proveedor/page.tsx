"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Supplier } from "@/app/models/Supplier";
import { createSupplier } from "@/services/supplierService";

const CATEGORIAS = [
  'Bebidas','Abarrotes','Panadería','Cárnicos','Lácteos','Limpieza','Higiene Personal','Otros'
];

export default function NuevoProveedor() {
  const router = useRouter();
  const [form, setForm] = useState<Omit<Supplier, "id_supplier">>({
    name: "",
    manager_name: "",
    phone: "",
    email: "",
    category: "Abarrotes",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createSupplier(form as Supplier);
      router.push("/administrador/proveedores"); 
    } catch (err: any) {
      setError(err.message || "Error creando proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 font-sans text-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-2xl font-bold text-red-500 mb-6">Registrar Nuevo Proveedor</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            placeholder="Nombre de la Empresa"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            required
          />
          <input 
            type="text" 
            name="manager_name"
            placeholder="Nombre del Contacto"
            value={form.manager_name}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            required
          />
          <input 
            type="text" 
            name="phone"
            placeholder="Teléfono"
            value={form.phone}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            required
          />
          <input 
            type="email" 
            name="email"
            placeholder="Correo Electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
            required
          />
          <input 
            type="text" 
            name="address"
            placeholder="Dirección"
            value={form.address}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
          />
          <select 
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500"
          >
            {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => router.push("/administrador/proveedores")} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold">{loading ? "Guardando..." : "Registrar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
