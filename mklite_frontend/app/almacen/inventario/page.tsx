'use client';

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { Inventory } from "@/app/models/Inventory";
import { getAllInventory } from "@/services/inventoryService";
import { useRouter } from "next/navigation";

const ENCARGADO = "Carlos Ruiz";

const InventarioAlmacenPage = () => {
  const router = useRouter();

  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // CARGAR INVENTARIO DESDE BACKEND
  // ===============================
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getAllInventory();
        setInventory(data);
      } catch (err) {
        setError("Error cargando inventario");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 text-sm underline text-gray-300 hover:text-white"
      >
        Cerrar sesión
      </button>

      <div className="max-w-7xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-8">
        {/* HEADER */}
        <header className="mb-8 border-b border-red-600 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-red-500">
            INVENTARIO GENERAL
          </h1>
          <div className="text-sm text-gray-400">
            Encargado: <span className="text-white">{ENCARGADO}</span> <br />
            Fecha: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* ESTADOS */}
        {loading && (
          <p className="text-center text-gray-400 italic">
            Cargando inventario...
          </p>
        )}

        {error && (
          <p className="text-center text-red-400 font-semibold">
            {error}
          </p>
        )}

        {!loading && inventory.length === 0 && (
          <p className="text-center text-gray-500 italic">
            No hay productos registrados en inventario
          </p>
        )}

        {/* TABLA INVENTARIO */}
        {!loading && inventory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-200">
              <thead className="bg-gray-700 text-xs uppercase text-gray-400">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Stock Mínimo</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const isLowStock = item.quantity <= item.min_stock;

                  return (
                    <tr
                      key={item.id_inventory}
                      className="border-b border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {item.product.nombre}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-orange-400">
                        {item.min_stock}
                      </td>
                      <td className="px-4 py-3">
                        {item.location || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isLowStock
                              ? "bg-red-700 text-white"
                              : "bg-green-700 text-white"
                          }`}
                        >
                          {isLowStock ? "BAJO STOCK" : "NORMAL"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-500 text-center">
          Sistema de Inventario • MERKADO LITE
        </footer>
      </div>
    </div>
  );
};

export default InventarioAlmacenPage;
