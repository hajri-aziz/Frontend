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
  likes: {
    userId: string;
    type: string; // 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
    date?: Date;
  }[];
  comments?: Comment[];
}

export interface Comment {
  _id?: string;
  idAuteur: {
    _id: string;
    nom: string;
    prenom: string;
    profileImage?: string;
  };
  idPost: string;
  contenu: string;
  date_creation: string;
}

export interface Group {
  _id?: string;
  name: string;
  creator:{
        _id: string;
        nom: string;
        prenom: string;
        profileImage?: string;
    };
  members: string[];
  admins: string[];
  lastMessage?: string;
}

export interface Message {
[x: string]: any;
  _id?: string;
  conversationId: string;
  sender:string
  content: string;
  timestamp: string;
  reactions?: { userId: string; reaction: string }[];
  status?: 'sent' | 'delivered' | 'read';
}
