'use client';

import React, { useMemo } from 'react';

// =================================================================
// 1. CONSTANTES Y DATOS MOCKEADOS
// =================================================================

const ENCARGADO_ALMACEN = "Carlos Ruiz";
const CURRENT_DATE = "2024-10-26"; // Fecha fija según la imagen

// Estados de Stock (Simplificados como en la imagen)
const STATUS = {
    CRITICO: 'CRÍTICO', // Por debajo del mínimo
    BAJO: 'BAJO',       // En o por debajo de un umbral (Usado en la tabla como "BAJO")
    NORMAL: 'NORMAL',
};

// Mapeo de estados a colores de Tailwind
const STATUS_COLORS = {
    [STATUS.BAJO]: 'text-red-500 bg-red-900/50',
    [STATUS.NORMAL]: 'text-green-500 bg-green-900/50',
    // Los colores de las tarjetas se manejan directamente
};

// Datos simulados de inventario basados en la estructura de la imagen
const MOCK_INVENTORY_DB = [
    // Alertas Activas (Datos de las tarjetas)
    { id: 'ALR001', name: 'Café Grano 1kg', lote: 'CF-202600', stock: 15, minStock: 20, status: STATUS.CRITICO, alertType: 'CRITICA' },
    { id: 'ALR002', name: 'Té Verde 300g.', lote: 'TV-202400', stock: 30, minStock: 40, status: STATUS.CRITICO, alertType: 'BAJO STOCK' },

    // Niveles de Stock Críticos (Datos de la tabla)
    { id: 'TBL001', name: 'Arroz Blanco', stock: 60, minStock: 60, targetStock: 60, status: STATUS.BAJO },
    { id: 'TBL002', name: 'Pasta Larga', stock: 50, minStock: 60, targetStock: 60, status: STATUS.BAJO },
    { id: 'TBL003', name: 'Peste Larga', stock: 25, minStock: 30, targetStock: 30, status: STATUS.BAJO },
    { id: 'TBL004', name: 'Aceite Girasol', stock: 26, minStock: 30, targetStock: 30, status: STATUS.BAJO },
    { id: 'TBL005', name: 'Aditivos', stock: 12, minStock: 100, targetStock: 100, status: STATUS.BAJO }, // Este estaría 'CRITICO' si la lógica fuera estricta, pero se etiqueta 'BAJO' como en la imagen
    { id: 'TBL006', name: 'Leche URT', stock: 80, minStock: 100, targetStock: 100, status: STATUS.NORMAL },
];

// =================================================================
// 2. COMPONENTES REUTILIZABLES
// =================================================================

// Componente Tarjeta de Alerta (Columna Izquierda)
const AlertCard = ({ item }) => {
    const isCritica = item.alertType === 'CRITICA';
    const bgColor = isCritica ? 'bg-red-800/80' : 'bg-yellow-800/80';
    const iconColor = isCritica ? 'text-red-300' : 'text-yellow-300';
    const borderColor = isCritica ? 'border-red-600' : 'border-yellow-600';
    
    // Asumiendo que la segunda línea en la imagen es un segundo lote con su mínimo
    const secondaryLote = isCritica ? { lote: 'TV-202410', min: '10u' } : { lote: 'CI-202418', min: '40u' };

    return (
        <div className={`p-4 rounded-lg shadow-xl border-l-4 ${borderColor} ${bgColor} text-gray-100 flex items-start justify-between mb-4`}>
            <div className="flex items-start">
                <svg className={`w-6 h-6 mr-3 mt-1 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V9a1 1 0 012 0v2a1 1 0 11-2 0zm0 4a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd"></path></svg>
                <div className="leading-snug">
                    <p className="font-extrabold text-lg">{item.alertType}</p>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-300 mt-1">Lote: {item.lote}</p>
                    <p className="text-xs text-gray-300">Stock: {item.stock}u. Mínimo: {item.minStock}u</p>
                </div>
            </div>
            {/* Lote Secundario a la Derecha (simulando los datos de la imagen) */}
            <div className="text-right text-xs text-gray-300">
                <p>Lote: {secondaryLote.lote}</p>
                <p>Mínimo: {secondaryLote.min}</p>
                <svg className={`w-4 h-4 ml-auto mt-2 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V9a1 1 0 012 0v2a1 1 0 11-2 0zm0 4a1 1 0 102 0 1 1 0 00-2 0z" clipRule="evenodd"></path></svg>
            </div>
        </div>
    );
};

// =================================================================
// 3. COMPONENTE PRINCIPAL: AlertasStockAlmacen
// =================================================================

const AlertasStockAlmacen = () => {
    
    const activeAlerts = MOCK_INVENTORY_DB.filter(item => item.alertType); // Tarjetas de la izquierda
    const tableItems = MOCK_INVENTORY_DB.filter(item => !item.alertType); // Items de la tabla

    const productsBelowMin = useMemo(() => {
        // Contamos todos los ítems (tarjetas + tabla) que tienen stock < minStock
        return MOCK_INVENTORY_DB.filter(item => item.stock < item.minStock).length;
    }, []);

    // Se asume que 'targetStock' es el valor de la columna 'Mínimo' de la tabla, 
    // y que 'Stock Actual' debe compararse con él.
    const getTargetStock = (item) => {
        return item.targetStock || item.minStock;
    };
    
    const getRowStatus = (item) => {
        // Lógica para determinar el estado de la fila basado en la imagen
        const target = getTargetStock(item);
        if (item.stock < target) {
             return STATUS.BAJO; // BAJO si está por debajo del límite
        }
        return STATUS.NORMAL;
    };

    return (
        <div className="min-h-screen p-6 bg-gray-900 text-gray-100 font-sans flex justify-center items-center">
            <div className="w-full max-w-7xl bg-gray-800 rounded-xl shadow-2xl p-8">
                
                {/* Header Superior */}
                <header className="mb-6 border-b border-gray-700 pb-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-extrabold text-white flex items-center">
                            ALERTAS DE INVENTARIO – STOCK MÍNIMO
                            <svg className="w-8 h-8 ml-3 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.18C7.63 3.36 6 5.93 6 9v7l-2 2v1h16v-1l-2-2z"></path></svg>
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Encargado: {ENCARGADO_ALMACEN} | Fecha: {CURRENT_DATE}</p>
                </header>

                {/* Contenido Principal: Columnas de Alertas y Tabla */}
                <div className="flex flex-col lg:flex-row gap-8 h-[75vh]">
                    
                    {/* Columna Izquierda: Tarjetas de Alertas Activas */}
                    <div className="lg:w-2/5 p-4 bg-gray-900 rounded-lg shadow-inner flex flex-col">
                        <h2 className="text-xl font-bold mb-5 text-gray-300 uppercase">Alertas Activas de Stock Mínimo</h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            {activeAlerts.map(item => (
                                <AlertCard key={item.id} item={item} />
                            ))}
                            {activeAlerts.length === 0 && (
                                <div className="p-4 text-center text-gray-500 italic mt-8">No hay alertas críticas en este momento.</div>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Tabla de Niveles de Stock Críticos */}
                    <div className="lg:w-3/5 p-4 bg-gray-900 rounded-lg shadow-inner flex flex-col">
                        <h2 className="text-xl font-bold mb-5 text-gray-300 uppercase">Niveles de Stock Críticos</h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            <table className="min-w-full table-auto text-sm text-left text-gray-200">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Producto</th>
                                        <th scope="col" className="px-4 py-3">Stock Actual</th>
                                        <th scope="col" className="px-4 py-3">Mínimo</th>
                                        <th scope="col" className="px-4 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableItems.map((item) => {
                                        const status = getRowStatus(item);
                                        const statusClass = status === STATUS.BAJO ? 'text-red-300' : 'text-green-300';
                                        
                                        return (
                                            <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-semibold">{item.name}</td>
                                                <td className="px-4 py-3">{item.stock}</td>
                                                <td className="px-4 py-3 font-extrabold text-orange-400">{getTargetStock(item)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${status === STATUS.BAJO ? STATUS_COLORS.BAJO : STATUS_COLORS.NORMAL}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer de Notificación Fija (Bajo) */}
                <footer className="mt-6 p-4 text-center bg-red-800/80 rounded-lg font-extrabold text-lg text-white shadow-xl">
                    ¡ATENCIÓN! {productsBelowMin} PRODUCTOS HAN ALCANZADO SU STOCK MÍNIMO DEFINIDO
                </footer>
            </div>
        </div>
    );
};

export default AlertasStockAlmacen;