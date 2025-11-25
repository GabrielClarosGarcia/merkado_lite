'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Comprapage.module.css';

interface CartItem {
    id: number;
    nombre: string;
    precio: string;
    image: string;
    quantity: number;
    priceNumeric: number;
}

export default function CompraPage() { 
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  
  const [address, setAddress] = useState({ street: '', number: '', apartment: '', recipient: 'Fabio Arze' });
  const [pickupTime, setPickupTime] = useState('14:00'); 
  
  const [discountAmount, setDiscountAmount] = useState(0);
  const [dynamicDeliveryCost, setDynamicDeliveryCost] = useState(0);
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);

  // COORDENADAS DE LA TIENDA (ORIGEN)
  const STORE_COORDS: [number, number] = [-17.3755, -66.1530];

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  
  // Referencia para el icono personalizado (para reutilizarlo)
  const customIconRef = useRef<any>(null);

  // 1. Cargar Leaflet y Carrito
  useEffect(() => {
    // Limpieza previa para evitar duplicados
    const existingLink = document.getElementById('leaflet-css');
    if (!existingLink) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.head.appendChild(script);
    }

    const storedCart = localStorage.getItem('mklite_cart');
    if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        const tempSubtotal = parsedCart.reduce((acc: number, item: CartItem) => acc + item.priceNumeric * item.quantity, 0);
        
        const discountApplied = localStorage.getItem('mklite_discount_applied'); 
        if (discountApplied === 'true') {
            setDiscountAmount(tempSubtotal * 0.10);
        }
    } else {
        router.push('/carrito');
    }
  }, [router]);

  // 2. Inicializar Mapa (Intento persistente hasta que cargue)
  useEffect(() => {
    if (activeTab === 0 && deliveryMethod === 'delivery') {
      const tryLoadMap = () => {
        if ((window as any).L && mapContainerRef.current && !mapRef.current) {
          const L = (window as any).L;
          
          // Coordenadas iniciales Cochabamba
          const initialCoords = [-17.3935, -66.1570];
          
          const map = L.map(mapContainerRef.current, {
              zoomControl: false
          }).setView(initialCoords, 14);

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          // MAPA ESTILO "CLEAN" (Positron)
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map);

          // ICONO ROJO (Estilo App)
          const svgIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#E60012">
              <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
              <circle cx="192" cy="192" r="80" fill="white"/>
            </svg>
          `;
          
          customIconRef.current = L.divIcon({
            html: svgIcon,
            className: '', 
            iconSize: [40, 53], 
            iconAnchor: [20, 53], 
            popupAnchor: [0, -60]
          });

          map.on('click', function(e: any) {
             updateMapPosition(e.latlng.lat, e.latlng.lng);
             // Solo buscamos calle si fue click manual
             fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
          });

          mapRef.current = map;
        } else {
          // Si no cargó, intentar de nuevo en 100ms
          setTimeout(tryLoadMap, 100);
        }
      };

      tryLoadMap();
    } else {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    }
  }, [activeTab, deliveryMethod]);

  // --- FUNCIONES AUXILIARES ---

  // Mover marcador y calcular precio
  const updateMapPosition = (lat: number, lng: number) => {
      const L = (window as any).L;
      if (!mapRef.current || !L) return;

      // Mover marcador
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else if (customIconRef.current) {
        markerRef.current = L.marker([lat, lng], { icon: customIconRef.current }).addTo(mapRef.current);
      }

      // Calcular Precio
      const tiendaLatLng = L.latLng(STORE_COORDS[0], STORE_COORDS[1]);
      const clienteLatLng = L.latLng(lat, lng);
      const distanceMeters = tiendaLatLng.distanceTo(clienteLatLng);
      
      // Regla: < 500m = Gratis. Luego +2 Bs por cada 500m extra.
      const calculatedCost = Math.floor(distanceMeters / 500) * 2;
      
      setDynamicDeliveryCost(calculatedCost);
      setHasSelectedLocation(true);
  };

  // Obtener nombre de calle desde coordenadas (Reverse Geocoding)
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setAddress(prev => ({...prev, street: 'Cargando nombre de calle...'}));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      const road = data.address?.road || data.address?.pedestrian || data.address?.suburb || 'Ubicación seleccionada';
      const houseNumber = data.address?.house_number || '';

      setAddress(prev => ({
        ...prev, 
        street: road,
        number: houseNumber || prev.number
      }));
    } catch (error) {
      setAddress(prev => ({...prev, street: 'Ubicación marcada'}));
    }
  };

  // --- NUEVO: BUSCAR CALLE MANUALMENTE (Forward Geocoding) ---
  const handleManualSearch = async () => {
      if (!address.street) return;
      
      // Añadimos Cochabamba para que no busque en otro país
      const query = `${address.street}, Cochabamba, Bolivia`;
      
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
          const data = await response.json();

          if (data && data.length > 0) {
              const { lat, lon } = data[0];
              const latNum = parseFloat(lat);
              const lngNum = parseFloat(lon);

              // Mover mapa ahí
              if (mapRef.current) {
                  mapRef.current.flyTo([latNum, lngNum], 16);
              }
              
              // Poner marcador y calcular precio
              updateMapPosition(latNum, lngNum);
          } 
      } catch (error) {
          console.error("Error buscando dirección", error);
      }
  };

  // Totales
  const subtotal = cartItems.reduce((acc, item) => acc + item.priceNumeric * item.quantity, 0);
  const finalDeliveryCost = deliveryMethod === 'delivery' ? dynamicDeliveryCost : 0;
  const total = subtotal - discountAmount + finalDeliveryCost;

  const handleNextStep = () => {
    if (activeTab < 1) setActiveTab(prev => prev + 1);
    else {
      alert('Compra realizada con éxito!');
      localStorage.removeItem('mklite_cart');
      localStorage.removeItem('mklite_discount_applied');
      router.push('/Home');
    }
  };

  const handlePrevStep = () => {
    if (activeTab > 0) setActiveTab(prev => prev - 1);
    else router.push('/carrito');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent} onClick={() => router.push('/Home')}>
          MERKADO LITE
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.checkoutForms}>
          <nav className={styles.tabsNav}>
            <span className={`${styles.tabItem} ${activeTab === 0 ? styles.tabItemActive : ''}`} onClick={() => setActiveTab(0)}>MÉTODO DE ENTREGA</span>
            <span className={`${styles.tabItem} ${activeTab === 1 ? styles.tabItemActive : ''}`} onClick={() => setActiveTab(1)}>MÉTODO DE PAGO</span>
          </nav>

          {activeTab === 0 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Método de entrega</h2>
              
              <div className={styles.radioOptionContainer}>
                <div className={styles.radioOption} onClick={() => setDeliveryMethod('delivery')}>
                  <input type="radio" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} />
                  <label>Envío a Domicilio</label>
                  <span className={styles.priceInfo}>Costo variable por distancia</span>
                </div>
              </div>
              <div className={styles.radioOptionContainer}>
                <div className={styles.radioOption} onClick={() => setDeliveryMethod('pickup')}>
                  <input type="radio" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                  <label>Retiro en Tienda</label>
                  <span className={`${styles.priceInfo} ${styles.gratis}`}>Gratis</span>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <>
                  <div className={styles.immediateDeliveryBox}>
                    ⚡ Entrega Inmediata (30 - 45 min aprox.)
                  </div>

                  <h3 className={styles.sectionTitle} style={{marginTop: '30px'}}>Ubicación de entrega</h3>
                  <p style={{fontSize: '14px', color: '#666', marginBottom: '15px'}}>
                    Haz clic en el mapa o escribe tu calle y presiona Enter.
                  </p>
                  
                  <div id="embedded-map" ref={mapContainerRef} className={styles.embeddedMapContainer}>
                    <div className={styles.loadingMap}>Cargando mapa...</div>
                  </div>
                  
                  <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                      <label>Calle (Presiona Enter para buscar)</label>
                      <input 
                        type="text" 
                        value={address.street} 
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()} // BUSCAR AL DAR ENTER
                        onBlur={handleManualSearch} // BUSCAR AL SALIR DEL CAMPO
                        placeholder="Ej: Av. America" 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Número</label>
                      <input 
                        type="text" 
                        value={address.number} 
                        onChange={(e) => setAddress({...address, number: e.target.value})} 
                        placeholder="123" 
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Dpto/Piso</label>
                      <input type="text" value={address.apartment} onChange={(e) => setAddress({...address, apartment: e.target.value})} placeholder="Opcional" />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Destinatario</label>
                    <input type="text" value={address.recipient} onChange={(e) => setAddress({...address, recipient: e.target.value})} />
                  </div>
                </>
              )}

              {deliveryMethod === 'pickup' && (
                <div style={{marginTop: '30px'}}>
                    <h3 className={styles.sectionTitle}>¿A qué hora pasas?</h3>
                    <div className={styles.formGroup}>
                        <label>Hora estimada de retiro</label>
                        <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={styles.datePickerInput}>
                            <option value="09:00">09:00</option>
                            <option value="10:00">10:00</option>
                            <option value="11:00">11:00</option>
                            <option value="12:00">12:00</option>
                            <option value="13:00">13:00</option>
                            <option value="14:00">14:00</option>
                            <option value="15:00">15:00</option>
                            <option value="16:00">16:00</option>
                            <option value="17:00">17:00</option>
                            <option value="18:00">18:00</option>
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Persona que recoge</label>
                        <input type="text" value={address.recipient} onChange={(e) => setAddress({...address, recipient: e.target.value})} />
                    </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Método de pago</h2>
              <div className={styles.radioOptionContainer}>
                <div className={styles.radioOption}>
                  <input type="radio" checked={true} readOnly />
                  <label>Pagar en Efectivo</label>
                </div>
              </div>
              <p style={{marginTop: '20px', color: '#666'}}>* Pago contra entrega.</p>
            </div>
          )}

          <div className={styles.navigationButtons}>
            <button className={`${styles.navigationButton} ${styles.backButton}`} onClick={handlePrevStep}>
              {activeTab === 0 ? 'VOLVER AL CARRITO' : 'ANTERIOR'}
            </button>
            <button className={`${styles.navigationButton} ${styles.nextButton}`} onClick={handleNextStep}>
              {activeTab === 1 ? 'FINALIZAR COMPRA' : 'SIGUIENTE'}
            </button>
          </div>
        </div>

        <div className={styles.summarySidebar}>
          <h3 className={styles.summaryTitle}>Resumen de la compra</h3>
          <div className={styles.summaryProducts}>
            {cartItems.map(item => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.summaryItemImage}>
                    <Image src={item.image} alt={item.nombre} width={40} height={40} style={{objectFit: 'contain'}} />
                  </div>
                  <div className={styles.summaryItemDetails}>
                    <h4>{item.nombre}</h4>
                    <p>Cantidad: {item.quantity}</p>
                  </div>
                  <span className={styles.summaryItemPrice}>Bs. {item.priceNumeric.toFixed(2)}</span>
                </div>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.summaryTotalRow}>
              <span>Subtotal:</span>
              <strong>Bs. {subtotal.toFixed(2)}</strong>
            </div>
            
            <div className={styles.summaryTotalRow}>
              <span>Costo de envío:</span>
              {deliveryMethod === 'delivery' ? (
                  !hasSelectedLocation ? (
                    <span style={{color:'#888', fontStyle:'italic'}}>Seleccione en mapa</span>
                  ) : dynamicDeliveryCost === 0 ? (
                    <span className={`${styles.priceInfo} ${styles.gratis}`}>¡Gratis!</span>
                  ) : (
                    <span className={styles.deliveryPriceDynamic}>Bs. {dynamicDeliveryCost.toFixed(2)}</span>
                  )
              ) : (
                  <span className={`${styles.priceInfo} ${styles.gratis}`}>Gratis</span>
              )}
            </div>

            {discountAmount > 0 && (
                <div className={styles.summaryTotalRow}>
                    <span className={styles.discountText}>Descuento (LITE10):</span>
                    <strong className={styles.discountText}>- Bs. {discountAmount.toFixed(2)}</strong>
                </div>
            )}
            
            <div className={styles.summaryTotalFinal}>
              <span>TOTAL</span>
              <span>Bs. {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}