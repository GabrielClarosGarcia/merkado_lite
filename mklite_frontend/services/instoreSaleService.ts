import api from "@/services/api";
import type { CreateInStoreSaleDto, InStoreSale } from "@/app/models/InStoreSale";

export const createInStoreSale = async (dto: CreateInStoreSaleDto): Promise<InStoreSale> => {
  try {
    const response = await api.post("/instore-sale", dto);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error creando venta presencial");
  }
};

export const getInStoreSalesByUser = async (userId: number): Promise<InStoreSale[]> => {
  try {
    const response = await api.get('/instore-sale/user/${userId}');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error obteniendo ventas del vendedor");
  }
};

export const cancelInStoreSale = async (saleId: number, reason: string) => {
  try {
    const response = await api.post("/instore-sale/cancel", { saleId, reason });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error anulando venta");
  }
};

export const returnInStoreSaleItem = async (saleId: number, productId: number, quantity: number) => {
  try {
    const response = await api.post("/instore-sale/return", { saleId, productId, quantity });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error procesando devolucion");
  }
};