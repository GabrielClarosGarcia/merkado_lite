import api from "@/services/api";
import {Inventory} from "@/app/models/Inventory";

// 👉 READ: Todo el inventario
export const getAllInventory = async (): Promise<Inventory[]> => {
  try {
    const response = await api.get("/inventory");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo inventario"
    );
  }
};

// 👉 READ: Stock por producto
export const getStockByProduct = async (productId: number) => {
  try {
    const response = await api.get(`/inventory/${productId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error obteniendo stock del producto"
    );
  }
};

// 👉 UPDATE: Actualizar stock
export const updateInventoryStock = async (data: {
  productId: number;
  quantity: number;
}) => {
  try {
    const response = await api.patch("/inventory", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Error actualizando stock"
    );
  }
};

// 👉 READ: Estado general
export const getInventoryStatus = async () => {
  const response = await api.get("/inventory/status");
  return response.data;
};

// 👉 READ: Bajo stock
export const getLowStockItems = async () => {
  const response = await api.get("/inventory/low-stock");
  return response.data;
};
