import { Injectable } from "@nestjs/common";
import { AppDataSource } from "src/data-source";
import { Notification } from "./notification.entity";
import { User } from "../user/user.entity";

@Injectable()
export class NotificationService {
    async sendNotification(message: string, userId: number) {
        const userRepo = AppDataSource.getRepository(User);
        const notifRepo = AppDataSource.getRepository(Notification);

        const user = await userRepo.findOne({
            where: { id_user: userId },
        });

        if (!user) {
            console.log('User ${userId} not found for notification');
            return;
        }

        const notif = new Notification();
        notif.user = user;
        notif.message = message;

        await notifRepo.save(notif);
    }

    async getNotificationsForUser(userId: number) {
        const notifRepo = AppDataSource.getRepository(Notification);

        const notifications = await notifRepo
            .createQueryBuilder("notif")
            .leftJoin("notif.user", "user")
            .where("user.id_user = :userId", { userId })
            .orderBy("notif.date", "DESC")
            .getMany();

        return notifications;
    }
}