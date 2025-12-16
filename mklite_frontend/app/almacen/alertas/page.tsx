'use client';

import React, { useEffect, useState } from 'react';
import { getNotificationsByUser, markNotificationAsRead } from '@/services/notificationService';
import { Notification } from '@/app/models/Notification';

// ==========================================================
// CONSTANTES
// ==========================================================
const ENCARGADO_ALMACEN = 'Carlos Ruiz';

// ==========================================================
// COMPONENTE TARJETA DE ALERTA (REAL)
// ==========================================================
const AlertCard = ({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: number) => void;
}) => {
  return (
    <div className="p-4 rounded-lg shadow-xl border-l-4 border-red-600 bg-red-800/80 text-gray-100 flex justify-between mb-4">
      <div className="flex items-start gap-3">
        <svg
          className="w-6 h-6 text-red-300 mt-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7V9a1 1 0 012 0v2a1 1 0 11-2 0zm0 4a1 1 0 102 0 1 1 0 00-2 0z"
            clipRule="evenodd"
          />
        </svg>

        <div>
          <p className="font-extrabold text-lg">ALERTA DE INVENTARIO</p>
          <p className="text-sm font-medium">{notification.message}</p>
          <p className="text-xs text-gray-300 mt-1">
            {new Date(notification.date).toLocaleString()}
          </p>
        </div>
      </div>

      {!notification.read && (
        <button
          onClick={() => onRead(notification.id_notification!)}
          className="h-fit text-xs bg-gray-900 px-3 py-1 rounded hover:bg-gray-700 transition"
        >
          Marcar como leída
        </button>
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE PRINCIPAL
// ==========================================================
const AlertasStockAlmacen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // ⚠️ Luego este id debe venir del auth
  const userId = 1;

  // -------------------------------
  // Cargar notificaciones reales
  // -------------------------------
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByUser(userId);
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // -------------------------------
  // Marcar como leída
  // -------------------------------
  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id_notification === id ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-gray-100 flex justify-center items-center">
      <div className="w-full max-w-5xl bg-gray-800 rounded-xl shadow-2xl p-8">
        
        {/* HEADER */}
        <header className="mb-6 border-b border-gray-700 pb-3">
          <h1 className="text-3xl font-extrabold flex items-center">
            ALERTAS DE INVENTARIO
            <svg
              className="w-8 h-8 ml-3 text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6V9c0-3.07-1.63-5.64-4.5-6.32V2.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.18C7.63 3.36 6 5.93 6 9v7l-2 2v1h16v-1l-2-2z" />
            </svg>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Encargado: {ENCARGADO_ALMACEN}
          </p>
        </header>

        {/* CONTENIDO */}
        <section className="bg-gray-900 rounded-lg p-5 shadow-inner max-h-[65vh] overflow-y-auto">
          {loading && (
            <p className="text-gray-400 italic text-center">
              Cargando alertas...
            </p>
          )}

          {!loading && notifications.length === 0 && (
            <p className="text-gray-500 italic text-center">
              No hay alertas de inventario
            </p>
          )}

          {!loading &&
            notifications.map((notification) => (
              <AlertCard
                key={notification.id_notification}
                notification={notification}
                onRead={handleMarkAsRead}
              />
            ))}
        </section>

        {/* FOOTER */}
        <footer className="mt-6 p-4 text-center bg-red-800/80 rounded-lg font-extrabold text-lg text-white shadow-xl">
          {unreadCount > 0
            ? `¡ATENCIÓN! ${unreadCount} ALERTAS PENDIENTES`
            : 'Todas las alertas han sido revisadas'}
        </footer>
      </div>
    </div>
  );
};

export default AlertasStockAlmacen;
