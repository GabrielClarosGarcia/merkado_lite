import { DataSource } from "typeorm"
import { User } from "./user/user.entity"
import { Role } from "./role/role.entity"
import { Product } from "./product/product.entity"
import { Category } from "./category/category.entity"
import { Order } from "./order/order.entity"
import { OrderDetail } from "./order_detail/order_detail.entity"
import { Supplier } from "./supplier/supplier.entity"
import { Inventory } from "./inventory/inventory.entity"
import { InStoreSale } from "./instore_sale/instore_sale.entity"
import { InStoreSaleDetail } from "./instore_sale_detail/instore_sale_detail.entity"
import { PurchaseOrder } from "./purchase_order/purchase_order.entity"
import { Customer } from "./customer/customer.entity"
import { AuditLog } from "./audit_log/audit_log.entity"
import { Return } from "./return/return.entity"
import { Promotion } from "./promotion/promotion.entity"
import { PriceHistory } from "./price_history/price_history.entity"
import { Delivery } from "./delivery/delivery.entity"
import {Notification} from "./notification/notification.entity"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "merkado_admin",
    password: "1234",
    database: "mklite",
    synchronize: true,
    logging: true,
    entities: [Role, User, Product, Category, Order, OrderDetail, Supplier, Inventory, InStoreSale, InStoreSaleDetail, 
        PurchaseOrder, Customer, AuditLog, Notification, Return, Promotion, PriceHistory, Delivery],
    subscribers: [],
    migrations: [],
})
export class AppModule {}
//pusheando backend HU-F01