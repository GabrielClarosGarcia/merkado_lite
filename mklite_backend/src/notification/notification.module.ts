import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";

@Module({
    imports: [],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService], // importante para usar el servicio en Inventory
})
export class NotificationModule {}