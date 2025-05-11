// src/app/models/cours-session.model.ts

import { Participant } from './participant.model';

export interface CoursSession {
  _id?: string;
  title: string;
  cours_id: string | {
    _id?: string;
    title?: string;
    description?: string;
  };
  video_url: string;
  duration: {
    amount: number;
    unit: 'minutes';
  };
  startdate: Date;
  enddate: Date;
  location: string;
  capacity: number;
  status: 'active' | 'inactive' | 'completed' | 'scheduled' | 'in-progress' | 'cancelled';
  participants?: Participant[];
  created_at?: Date;
  updated_at?: Date;
}
