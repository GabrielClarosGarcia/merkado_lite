"use client";
import React, { useEffect, useState } from "react";
import { fetchProducts, Product } from "../product/productService";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    alert(`"${product.nombre}" añadido al carrito (próximamente)`);
  };

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mercado Lite</h1>
        <input placeholder="Buscar productos..." />
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px", padding: "20px" }}>
        {products.map((product) => (
          <div key={product.id} className={styles.card} onClick={() => handleCardClick(product)}>
            <div className={styles.cardImage}>
              <img 
                src={product.image || "/Imagines/arroz.jpg"} 
                alt={product.nombre} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            </div>
            <div className={styles.cardContent}>
              <h3>{product.nombre}</h3>
              <span>{product.precio}</span>
              <button className={styles.buttonAdd} onClick={(e) => handleAddToCart(e, product)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedProduct && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center"
        }} onClick={closeModal}>
          <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "10px", width: "600px" }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedProduct.image || "/Imagines/Logo.jpg"} 
              alt={selectedProduct.nombre} 
              style={{ width: "100%", height: "300px", objectFit: "cover", marginBottom: "15px" }} 
            />
            <h2>{selectedProduct.nombre}</h2>
            <p>{selectedProduct.description}</p>
            <span>{selectedProduct.precio}</span>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
