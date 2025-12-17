export interface InStoreSaleItemDto {
  productId: number;
  quantity: number;
}

export interface CreateInStoreSaleDto {
  userId: number;
  items: InStoreSaleItemDto[];
  payment_method: string;
}

export interface InStoreSaleDetail {
  id_sale_detail?: number;
  quantity: number;
  subtotal: number;
  product?: any;
}

export interface InStoreSale {
  id_sale?: number;
  sale_date?: string;
  total?: number;
  payment_method?: string;
  status?: string;
  cancel_reason?: string | null;
  details?: InStoreSaleDetail[];
}