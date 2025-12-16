import { Product } from "./Product";

export interface Inventory {
  id_inventory?: number;

  product: Product;

  quantity: number;
  min_stock: number;

  location?: string;
}
