// src/app/models/cours.model.ts

export interface Cours {
  _id?: string;
  title: string;
  description: string;
  price: number;
  currency?: 'TND';

  category_id: {
    _id?: string;
    title?: string;
    description?: string;
  } | string; // peut être une référence simple (id) ou un objet peuplé

  instructor_id: {
    _id?: string;
    nom?: string;
    prenom?: string;
    email?: string;
  } | string; // peut aussi être juste un id

  image?: string;
  created_at?: Date;
  updated_at?: Date;
}
