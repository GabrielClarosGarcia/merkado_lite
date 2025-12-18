"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// AQUÍ IMPORTAMOS EL SERVICIO QUE ACABAS DE CREAR:
import { getProductsList, getProductHistory, revertProductPrice } from '@/services/priceService';

// --- CONFIGURACIÓN DEL MENÚ ---
const MENU_OPTIONS = [
  { label: 'Ventas', path: '/administrador/ventas' },
  { label: 'Usuarios', path: '/administrador/usuarios/lista' },
  { label: 'Proveedores', path: '/administrador/proveedores' },
  { label: 'Promociones', path: '/administrador/promociones' },
  { label: 'Pedidos', path: '/administrador/pedidos' },
  { label: 'Ofertas', path: '/administrador/ofertas' },
  { label: 'Historial Precios', path: '/administrador/historial-precios' },
];

export default function HistorialPrecios() {
  const router = useRouter();
  const activePath = usePathname();

  const goTo = (path: string) => { router.push(path); };

  // --- ESTADOS ---
  const [products, setProducts] = useState<any[]>([]); // Lista real de la BD
  const [history, setHistory] = useState<any[]>([]);   // Historial real de la BD
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [currentProductPrice, setCurrentProductPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR LISTA DE PRODUCTOS AL INICIO
  useEffect(() => {
    async function loadData() {
      const data = await getProductsList();
      if (data && data.length > 0) {
        setProducts(data);
        // Intentamos usar el ID correcto (id_product suele ser en MySQL)
        const firstId = data[0].id_product || data[0].id;
        setSelectedProductId(firstId); 
        setCurrentProductPrice(parseFloat(data[0].price));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // 2. CARGAR HISTORIAL CUANDO CAMBIA LA SELECCIÓN
  useEffect(() => {
    if (selectedProductId) {
      async function loadHistory() {
        // Actualizamos precio visual del producto seleccionado
        const prod = products.find(p => (p.id_product || p.id) == selectedProductId);
        if (prod) setCurrentProductPrice(parseFloat(prod.price));

        // Pedimos historial al servicio
        const data = await getProductHistory(selectedProductId!);
        setHistory(data || []);
      }
      loadHistory();
    }
  }, [selectedProductId, products]);

  // 3. REVERTIR PRECIO
  const handleRevertPrice = async (historyEntry: any) => {
    // Detectamos el campo correcto del precio viejo
    const targetPrice = historyEntry.new_price || historyEntry.price || historyEntry.newPrice;
    
    const confirmation = `¿Está seguro de revertir el precio a Bs. ${Number(targetPrice).toFixed(2)}?`;
    if (!window.confirm(confirmation)) return;

    const success = await revertProductPrice(selectedProductId!, targetPrice, "Reversión desde Historial");

    if (success) {
        alert("¡Precio actualizado en la Base de Datos!");
        window.location.reload(); // Recargar para ver cambios
    } else {
        alert("Error al actualizar. Verifique la conexión.");
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(parseInt(e.target.value));
  };

  return (
    // CONTENEDOR PRINCIPAL FLEX
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#111827' }}>
        
        {/* --- MENÚ LATERAL --- */}
        <nav style={{
            width: '220px',
            backgroundColor: '#111827',
            minHeight: '100vh',
            padding: '25px 15px',
            color: '#F9FAFB',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
            flexShrink: 0
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '25px', letterSpacing: '1px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>Menú</h2>
            {MENU_OPTIONS.map(option => (
                <button
                    key={option.path}
                    onClick={() => goTo(option.path)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
                        backgroundColor: activePath === option.path ? '#2563EB' : '#1F2937',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#F9FAFB',
                        fontWeight: '500', textAlign: 'left', transition: 'all 0.3s',
                        boxShadow: activePath === option.path ? '0 4px 6px rgba(0,0,0,0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = activePath === option.path ? '#2563EB' : '#1F2937'}
                >
                    {option.label}
                </button>
            ))}
        </nav>

        {/* --- CONTENIDO --- */}
        <div className="flex-1 bg-gray-900 p-4 sm:p-8 font-sans text-gray-100 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            
            <header className="mb-8">
              <h1 className="text-3xl font-extrabold text-red-500 mb-2">Historial y Auditoría</h1>
              <p className="text-gray-400">Consulta datos reales y revierte precios en el sistema.</p>
            </header>

            {/* SELECTOR */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-red-700 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-200">Producto a Auditar</label>
                    <select
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-red-500"
                        value={selectedProductId || ''}
                        onChange={handleProductChange}
                        disabled={loading}
                    >
                        {loading ? <option>Cargando datos...</option> : null}
                        {products.map((p: any) => (
                            <option key={p.id_product || p.id} value={p.id_product || p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-red-800/20 p-4 rounded-lg border-l-4 border-red-500 flex flex-col justify-center">
                    <p className="text-sm font-medium text-red-400 uppercase">Precio Actual BD</p>
                    <div className="text-4xl font-extrabold text-white mt-1">
                        Bs. {currentProductPrice.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* TABLA HISTORIAL */}
            <h2 className="text-xl font-semibold text-white mb-4">Registro de Cambios</h2>
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-red-900/40">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase">Fecha</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase">Precio</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase">Usuario</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase">Motivo</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {history.length > 0 ? (
                      history.map((h, index) => {
                        // Mapeo flexible para adaptarse a lo que devuelva tu backend
                        const rowPrice = h.new_price || h.price || 0;
                        const rowDate = h.change_date || h.createdAt || h.date;
                        const rowUser = h.user_email || 'Admin/Sistema';
                        const rowMotive = h.motive || 'Cambio de precio';
                        
                        // Validar si es el precio vigente (redondeando decimales)
                        const isCurrent = Math.abs(parseFloat(rowPrice) - currentProductPrice) < 0.01;

                        return (
                            <tr key={index} className="hover:bg-gray-700/30 transition">
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {rowDate ? new Date(rowDate).toLocaleString() : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-red-400">
                                    {Number(rowPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-300">
                                    {rowUser}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-xs">
                                    {rowMotive}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {!isCurrent && (
                                        <button 
                                            onClick={() => handleRevertPrice(h)}
                                            className="text-white hover:bg-red-700 transition bg-red-600 py-1.5 px-3 rounded text-sm font-semibold"
                                        >
                                            Revertir
                                        </button>
                                    )}
                                    {isCurrent && <span className="text-gray-500 text-xs italic">Actual</span>}
                                </td>
                            </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            {products.length === 0 
                                ? "Conectando con base de datos..." 
                                : "Este producto no tiene historial de cambios."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
    </div>
  );
}