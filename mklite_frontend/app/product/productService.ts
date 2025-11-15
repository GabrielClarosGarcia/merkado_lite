import api from "@/services/api";

export interface Product {
  id: number;
  nombre: string;
  precio: string;
  description: string;
  image?: string; // opcional, por defecto podemos mostrar un placeholder
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/product");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al obtener productos");
  }
};
