import { User } from "./User";

export interface Notification {
  id_notification?: number;

  user?: User;        // opcional, normalmente no se usa en la vista
  message: string;

  date: string;       // Date → string (frontend siempre)
  read: boolean;
}
