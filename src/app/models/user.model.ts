export interface User {
    _id?: string; // Facultatif pour les opérations en lecture ou création temporaire
    nom: string;
    prenom: string;
    email: string;
    password?: string; // souvent exclu côté frontend
    role: string;
    dateInscription?: Date;
    isAnonymous?: boolean;
    dateNaissance?: Date;
    otpCode?: string;
    otpExpires?: Date;
    isApproved?: boolean;
    telephone?: number;
    status?: 'autorisé' | 'non autorisé';
    profileImage?: string;
    isOnline?: boolean;
    
  }
  