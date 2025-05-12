// src/app/models/participant.model.ts

export interface Participant {
  user_id: string | User;
  inscription_date?: Date;
  notified?: boolean;
  reminders_sent?: number;
}
import { User } from './user.model';

export interface Participant {
  user_id: string | User;
  inscription_date?: Date;
  notified?: boolean;
  reminders_sent?: number;
}
