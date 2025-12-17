'use client';

import React, { useState, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
// =================================================================
// 1. CONSTANTES Y DATOS MOCKEADOS (Simulando BBDD de Productos, Lotes y Movimientos)
// =================================================================

const ALMACEN_ENCARGADO = "Carlos Ruiz";
const CURRENT_DATE = new Date();

const PRODUCT_TYPES = [
    { id: 'SKU0078', name: 'Coca-Cola Clásica (Caja 12x1L)', unit: 'Caja' },
    { id: 'SKU0079', name: 'Coca-Cola Zero (Caja 12x1L)', unit: 'Caja' },
    { id: 'SKU0080', name: 'Fanta Naranja (Pack 6x355ml)', unit: 'Pack' },
    { id: 'SKU0081', name: 'Sprite Limón (Pack 6x355ml)', unit: 'Pack' },
    { id: 'SKU0082', name: 'Agua Ciel (Botella 1.5L)', unit: 'Botella' },
    { id: 'SKU0083', name: 'Jugo Del Valle (Caja 1L)', unit: 'Caja' },
];

const MOVEMENT_TYPES = {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
};

const ENTRY_REASONS = [
    'Compra a Proveedor',
    'Devolución de Cliente',
    'Producción Interna',
    'Ajuste de Inventario (Positivo)',
];

const EXIT_REASONS = [
    'Venta a Cliente',
    'Merma / Deterioro',
    'Devolución a Proveedor',
    'Uso Interno / Consumo',
    'Ajuste de Inventario (Negativo)',
];

const MOCK_LOT_INVENTORY_DB = [
    {
        productId: 'SKU0078',
        productName: 'Coca-Cola Clásica (Caja 12x1L)',
        lotNumber: 'COC-CLAS-20250115',
        quantity: 300,
        expirationDate: new Date('2025-01-15'),
        status: 'ACTIVO',
        lastMovementDate: new Date('2024-10-26'),
    },
    {
        productId: 'SKU0079',
        productName: 'Coca-Cola Zero (Caja 12x1L)',
        lotNumber: 'COC-ZERO-20241220',
        quantity: 120,
        expirationDate: new Date('2024-12-20'),
        status: 'PROX_VENC',
        lastMovementDate: new Date('2024-10-20'),
    },
    {
        productId: 'SKU0080',
        productName: 'Fanta Naranja (Pack 6x355ml)',
        lotNumber: 'FAN-NAR-20241130',
        quantity: 180,
        expirationDate: new Date('2024-11-30'),
        status: 'PROX_VENC',
        lastMovementDate: new Date('2024-10-20'),
    },
    {
        productId: 'SKU0081',
        productName: 'Sprite Limón (Pack 6x355ml)',
        lotNumber: 'SPR-LIM-20241031',
        quantity: 45,
        expirationDate: new Date('2024-10-31'),
        status: 'VENCIDO',
        lastMovementDate: new Date('2024-10-15'),
    },
    {
        productId: 'SKU0078',
        productName: 'Coca-Cola Clásica (Caja 12x1L)',
        lotNumber: 'COC-CLAS-20250630',
        quantity: 250,
        expirationDate: new Date('2025-06-30'),
        status: 'ACTIVO',
        lastMovementDate: new Date('2024-10-20'),
    },
];

const MENU_OPTIONS = [
    { label: 'Movimientos', path: '/almacen/movimientos', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
    ), isActive: true },
    { label: 'Alertas', path: '/almacen/alertas', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    ) },
    { label: 'Inventario', path: '/almacen/inventario', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10m-4-6h8m-4 0v-4"></path></svg>
    ) },
    { label: 'Reposición Stock', path: '/almacen/reposicion-stock', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 8h-2.22l-.123-.382a8.04 8.04 0 00-15.658 0L4.22 8H20v2m-6-10v5m-6-5v5m-4 2l4 4m6-4l-4 4"></path></svg>
    ) },
    { label: 'Vencidos', path: '/almacen/vencidos', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
    ) },
    { label: 'Órdenes de Compra', path: '/almacen/ordenes-compra', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
    ) },
];

// =================================================================
// 2. COMPONENTE DE MENÚ LATERAL
// =================================================================

const SidebarMenu = ({ menuOptions, activePath }) => {
    const router = useRouter(); 
    return (
        <nav className="flex flex-col space-y-2">
            {menuOptions.map((item) => (
                <a
                    key={item.path}
                    href={item.path} // En un entorno real de React, usarías <Link to={item.path}>
                    className={`
                        flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium
                        ${item.path === activePath || item.isActive
                            ? 'bg-red-600 text-white shadow-lg hover:bg-red-700'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-red-400'
                        }
                    `}
                >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                </a>
            ))}
        </nav>
    );
};

// =================================================================
// 3. COMPONENTE PRINCIPAL: GestionInventarioAlmacen
// =================================================================

const GestionInventarioAlmacen = () => {
    const router = useRouter();
    const [movements, setMovements] = useState(MOCK_LOT_INVENTORY_DB);
    const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
    const [activePath, setActivePath] = useState('/almacen/movimientos'); // Estado para simular la navegación

    const [formDate, setFormDate] = useState(CURRENT_DATE);
    const [movementType, setMovementType] = useState(MOVEMENT_TYPES.ENTRADA);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [lotNumber, setLotNumber] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expirationDate, setExpirationDate] = useState(null);
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');

    const [existingLotsForProduct, setExistingLotsForProduct] = useState([]);

    const getLotStatus = useCallback((expDate) => {
        if (!expDate) return 'DESCONOCIDO';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        thirtyDaysFromNow.setHours(0, 0, 0, 0);

        if (expDate <= today) return 'VENCIDO';
        if (expDate <= thirtyDaysFromNow) return 'PROX_VENC';
        return 'ACTIVO';
    }, []);

    // Recalcular estado de lotes al montar o actualizar
    useMemo(() => {
        setMovements(prevMovements => prevMovements.map(lot => ({
            ...lot,
            status: getLotStatus(lot.expirationDate)
        })));
    }, [getLotStatus]);

    // Función de búsqueda (se mantiene para simular interacción, aunque no es la navegación real)
    const handleProductSearch = () => {
        setMessage('Buscando productos...');
        setTimeout(() => {
            const product = PRODUCT_TYPES.find(p => p.id === selectedProduct?.id) || PRODUCT_TYPES[0];
            setSelectedProduct(product);
            setMessage(`Producto seleccionado: ${product.name}`);
        }, 500);
    };

    const handleLotSearch = () => {
        if (!selectedProduct) {
            setMessage('ALERTA: Seleccione primero un producto.');
            return;
        }
        setMessage('Buscando lotes existentes para el producto...');
        const foundLots = movements.filter(lot => 
            lot.productId === selectedProduct.id && lot.status !== 'VENCIDO'
        );
        setExistingLotsForProduct(foundLots);

        if (foundLots.length > 0 && movementType === MOVEMENT_TYPES.SALIDA) {
            setMessage(`Lotes encontrados para ${selectedProduct.name}. Elija uno para la salida.`);
        } else if (movementType === MOVEMENT_TYPES.ENTRADA) {
            setMessage(`Prepare para registrar un nuevo lote de ${selectedProduct.name}.`);
        } else if (movementType === MOVEMENT_TYPES.SALIDA && foundLots.length === 0) {
            setMessage(`ALERTA: No se encontraron lotes activos para la salida de ${selectedProduct.name}.`);
        } else {
            setMessage('Búsqueda de lotes completada.');
        }
    };

    const handleLotSelectionForExit = (e) => {
        const selectedLotNum = e.target.value;
        setLotNumber(selectedLotNum);
        if (selectedLotNum) {
            const lot = movements.find(l => l.lotNumber === selectedLotNum);
            if (lot) {
                setExpirationDate(lot.expirationDate);
                setMessage(`Lote ${lot.lotNumber} seleccionado. Stock actual: ${lot.quantity || 'N/D'}`);
            }
        } else {
            setExpirationDate(null);
            setMessage('');
        }
    };

    const handleRegisterMovement = useCallback(async () => {
        if (!formDate || !movementType || !selectedProduct || !lotNumber || !quantity || !reason) {
            setMessage('ERROR: Por favor, complete todos los campos obligatorios.');
            return;
        }
        if (movementType === MOVEMENT_TYPES.ENTRADA && !expirationDate) {
            setMessage('ERROR: Para entradas, la fecha de vencimiento es obligatoria.');
            return;
        }
        if (isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
            setMessage('ERROR: La cantidad debe ser un número positivo.');
            return;
        }

        setMessage('Registrando movimiento...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const parsedQuantity = parseInt(quantity);
        let success = false;

        if (movementType === MOVEMENT_TYPES.ENTRADA) {
            const existingLotIndex = movements.findIndex(m => m.lotNumber === lotNumber && m.productId === selectedProduct.id);
            if (existingLotIndex !== -1) {
                const updatedMovements = [...movements];
                updatedMovements[existingLotIndex].quantity += parsedQuantity;
                updatedMovements[existingLotIndex].lastMovementDate = formDate;
                updatedMovements[existingLotIndex].status = getLotStatus(updatedMovements[existingLotIndex].expirationDate);
                setMovements(updatedMovements);
                setMessage(`ÉXITO: Entrada de ${parsedQuantity} ${selectedProduct.unit}(s) al lote ${lotNumber}. Stock actualizado.`);
            } else {
                const newLot = {
                    productId: selectedProduct.id,
                    productName: selectedProduct.name,
                    lotNumber: lotNumber,
                    quantity: parsedQuantity,
                    expirationDate: expirationDate,
                    status: getLotStatus(expirationDate),
                    lastMovementDate: formDate,
                };
                setMovements(prev => [...prev, newLot]);
                setMessage(`ÉXITO: Entrada de nuevo lote ${lotNumber} (${parsedQuantity} ${selectedProduct.unit}(s)).`);
            }
            success = true;

        } else if (movementType === MOVEMENT_TYPES.SALIDA) {
            const existingLotIndex = movements.findIndex(m => m.lotNumber === lotNumber && m.productId === selectedProduct.id);
            if (existingLotIndex === -1) {
                setMessage('ERROR: Lote no encontrado para la salida.');
            } else if (movements[existingLotIndex].quantity < parsedQuantity) {
                setMessage(`ERROR: Cantidad insuficiente en el lote ${lotNumber}. Disponible: ${movements[existingLotIndex].quantity}.`);
            } else {
                const updatedMovements = [...movements];
                updatedMovements[existingLotIndex].quantity -= parsedQuantity;
                updatedMovements[existingLotIndex].lastMovementDate = formDate;
                updatedMovements[existingLotIndex].status = getLotStatus(updatedMovements[existingLotIndex].expirationDate);
                setMovements(updatedMovements);
                setMessage(`ÉXITO: Salida de ${parsedQuantity} ${selectedProduct.unit}(s) del lote ${lotNumber}. Stock actualizado.`);
                success = true;
            }
        }

        if (success) {
            setLastUpdateTime(new Date());
            setLotNumber('');
            setQuantity('');
            setExpirationDate(null);
            setReason('');
            setSelectedProduct(null);
            setExistingLotsForProduct([]);
        }

    }, [formDate, movementType, selectedProduct, lotNumber, quantity, expirationDate, reason, movements, getLotStatus]);

    const handleMovementTypeChange = (e) => {
        setMovementType(e.target.value);
        setLotNumber('');
        setQuantity('');
        setExpirationDate(null);
        setExistingLotsForProduct([]);
        setReason('');
    };
  const handleLogout = () => {
        router.push('/'); // Redirige al inicio
    };

    const handleProductChange = (e) => {
        const productId = e.target.value;
        const product = PRODUCT_TYPES.find(p => p.id === productId);
        setSelectedProduct(product || null);
        setLotNumber('');
        setExpirationDate(null);
        setExistingLotsForProduct([]);
        if (product) {
            setMessage(`Producto seleccionado: ${product.name}.`);
        } else {
            setMessage('');
        }
    };

    const currentReasons = movementType === MOVEMENT_TYPES.ENTRADA ? ENTRY_REASONS : EXIT_REASONS;

    return (
        <div className="min-h-screen p-6 bg-gray-900 text-gray-100 font-sans flex justify-center items-center">
            <button 
    onClick={handleLogout} 
    style={{
        position: 'absolute',
        top: '20px',
        // CAMBIO CLAVE: Volver a 'right: 20px' y eliminar 'left' o ponerlo en 'auto'
        right: '20px', 
        left: 'auto', // Aseguramos que 'left' no interfiera
        background: 'none',
        border: 'none',
        color: '#eef0f5ff',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: '14px',
        zIndex: 10, 
    }}
>
    Cerrar Sesión
</button>
            <div className="w-full max-w-7xl bg-gray-800 rounded-xl shadow-2xl p-8">
                {/* Header */}
                <header className="mb-8 flex justify-between items-center border-b border-red-600 pb-4">
                    <h1 className="text-3xl font-extrabold text-red-500 flex items-center">
                        <svg className="w-9 h-9 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 17h2v-6h-2v6zm-5 0h2v-6H6v6zm14 0h2v-6h-2v6zm-5-14H9V5h6V3zm-2 2h-2V3h2v2zm10 0v-2c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2V5h-2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-2zM9 7h2v2H9V7zm4 0h2v2h-2V7z"></path></svg>
                        SISTEMA DE ALMACÉN
                    </h1>
                    <div className="text-sm text-gray-400">
                        <span className="mr-4">Encargado: {ALMACEN_ENCARGADO}</span>
                        <span className="font-semibold text-white">Fecha: {CURRENT_DATE.toLocaleDateString()}</span>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 h-[65vh]">
                    {/* Nueva Columna Izquierda: Menú Lateral */}
                    <div className="lg:w-1/6 p-4 bg-gray-900 rounded-lg shadow-inner flex flex-col flex-shrink-0">
                        <h2 className="text-lg font-semibold mb-5 text-gray-300 border-b border-gray-700 pb-3">Menú</h2>
                        <SidebarMenu menuOptions={MENU_OPTIONS} activePath={activePath} />
                    </div>

                    {/* Columna Central: Formulario (Ahora 2/6, era 2/5) */}
                    <div className="lg:w-2/6 p-6 bg-gray-900 rounded-lg shadow-inner flex flex-col">
                        <h2 className="text-xl font-bold mb-5 text-red-400">REGISTRAR MOVIMIENTO POR LOTE</h2>
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            {/* Campo Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha:</label>
                                <DatePicker
                                    selected={formDate}
                                    onChange={(date) => setFormDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                />
                            </div>

                            {/* Tipo de Movimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Movimiento:</label>
                                <select
                                    value={movementType}
                                    onChange={handleMovementTypeChange}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                >
                                    <option value={MOVEMENT_TYPES.ENTRADA}>Entrada</option>
                                    <option value={MOVEMENT_TYPES.SALIDA}>Salida</option>
                                </select>
                            </div>

                            {/* Producto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Producto:</label>
                                <div className="flex">
                                    <select
                                        value={selectedProduct?.id || ''}
                                        onChange={handleProductChange}
                                        className="flex-1 p-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                    >
                                        <option value="">Seleccione un producto</option>
                                        {PRODUCT_TYPES.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleProductSearch}
                                        className="p-3 bg-gray-600 text-gray-200 rounded-r-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        title="Buscar producto"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Número de Lote */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Número de Lote:</label>
                                {movementType === MOVEMENT_TYPES.SALIDA && selectedProduct ? (
                                    <div className="flex">
                                        <select
                                            value={lotNumber}
                                            onChange={handleLotSelectionForExit}
                                            className="flex-1 p-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                            disabled={!selectedProduct || existingLotsForProduct.length === 0}
                                        >
                                            <option value="">Seleccione un lote existente</option>
                                            {existingLotsForProduct.map(lot => (
                                                <option key={lot.lotNumber} value={lot.lotNumber}>
                                                    {lot.lotNumber} (Disp: {lot.quantity})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleLotSearch}
                                            className="p-3 bg-gray-600 text-gray-200 rounded-r-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            title="Cargar lotes disponibles"
                                            disabled={!selectedProduct}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={lotNumber}
                                            onChange={(e) => setLotNumber(e.target.value)}
                                            placeholder="Ej: LOTE-ABC-001"
                                            className="flex-1 p-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                            disabled={!selectedProduct}
                                        />
                                        <button
                                            onClick={handleLotSearch}
                                            className="p-3 bg-gray-600 text-gray-200 rounded-r-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            title="Buscar lotes existentes"
                                            disabled={!selectedProduct}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Cantidad y Unidad */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cantidad (Unidades):</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Ej: 150"
                                        min="1"
                                        className="flex-1 p-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                    />
                                    {selectedProduct && (
                                        <span className="p-3 bg-gray-600 text-gray-200 rounded-r-lg border border-l-0 border-gray-600 text-sm flex items-center">
                                            {selectedProduct.unit}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Fecha de Vencimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Vencimiento:</label>
                                <DatePicker
                                    selected={expirationDate}
                                    onChange={(date) => setExpirationDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    minDate={CURRENT_DATE}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                    disabled={movementType === MOVEMENT_TYPES.SALIDA && lotNumber !== ''}
                                />
                            </div>

                            {/* Motivo del Movimiento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Motivo:</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-red-500 focus:border-red-500 text-sm"
                                >
                                    <option value="">Seleccione un motivo</option>
                                    {currentReasons.map((r, index) => (
                                        <option key={index} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Botón de Registrar y Mensaje */}
                        <div className="mt-6 flex-shrink-0">
                            <button
                                onClick={handleRegisterMovement}
                                className="w-full px-5 py-3 bg-red-600 text-white font-extrabold rounded-lg hover:bg-red-700 transition-all duration-300 shadow-lg text-base"
                            >
                                REGISTRAR MOVIMIENTO
                            </button>
                            {message && (
                                <p className={`mt-3 text-center text-sm font-semibold p-2 rounded-lg ${message.startsWith('ERROR:') ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-200'}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Columna Derecha: Tabla (Ahora 3/6, era 3/5) */}
                    <div className="lg:w-3/6 p-6 bg-gray-900 rounded-lg shadow-inner flex flex-col">
                        <h2 className="text-xl font-bold mb-5 text-red-400">HISTORIAL DE LOTES Y VENCIMIENTOS</h2>
                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                            <table className="min-w-full table-auto text-sm text-left text-gray-200">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Fecha Mov.</th>
                                        <th scope="col" className="px-4 py-3">Producto</th>
                                        <th scope="col" className="px-4 py-3">Lote</th>
                                        <th scope="col" className="px-4 py-3 text-right">Cantidad</th>
                                        <th scope="col" className="px-4 py-3">Vencimiento</th>
                                        <th scope="col" className="px-4 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.sort((a,b) => b.lastMovementDate - a.lastMovementDate).map((lot, index) => (
                                        <tr key={lot.lotNumber + "-" + index} className="border-b border-gray-700 hover:bg-gray-700">
                                            <td className="px-4 py-3">{lot.lastMovementDate.toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{lot.productName}</td>
                                            <td className="px-4 py-3">{lot.lotNumber}</td>
                                            <td className="px-4 py-3 text-right">{lot.quantity} {PRODUCT_TYPES.find(p => p.id === lot.productId)?.unit || ''}</td>
                                            <td className="px-4 py-3">{lot.expirationDate ? lot.expirationDate.toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${lot.status === 'VENCIDO' ? 'bg-red-700' :
                                                      lot.status === 'PROX_VENC' ? 'bg-orange-500' :
                                                      'bg-green-600'} text-white`}>
                                                    {lot.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {movements.length === 0 && (
                                <p className="text-center text-gray-500 italic py-5">No hay movimientos registrados.</p>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="mt-6 pt-4 border-t border-gray-700 text-sm text-gray-500 text-center">
                    Última actualización: {lastUpdateTime.toLocaleString()} (Hora del sistema central)
                </footer>
            </div>
        </div>
    );
};

export default GestionInventarioAlmacen;