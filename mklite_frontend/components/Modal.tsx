import React from "react";
import styles from "../app/Register/RegisterPage.module.css";

interface ModalProps {
  message: string;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className="text-xl font-bold mb-4">Registro exitoso</h2>
        <p>{message}</p>
        <button onClick={onClose} className={`${styles.button} mt-4`}>
          Aceptar
        </button>
      </div>
    </div>
  );
};
