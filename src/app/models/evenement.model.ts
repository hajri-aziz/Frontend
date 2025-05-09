export interface Participant {
  id_participant: string;
  inscrit_le: string; // Date ISO
}

export interface Evenement {
  _id?: string;
  titre: string;
  description: string;
  date: string; // Date ISO
  heure_debut: string; // ex. "10:00"
  duree: number; // en minutes
  capacite: number;
  participants: Participant[];
}