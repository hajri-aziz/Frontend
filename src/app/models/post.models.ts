// src/app/models/post.ts
export interface Post {
  _id?: string;
  idAuteur: {
    _id: string;
    nom: string;
    prenom: string;
    profileImage?: string;
  };
  titre: string;
  contenu: string;
  date_creation: string;
  image?: string;
  likes: string[];
}