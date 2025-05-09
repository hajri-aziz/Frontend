export interface RendezVous {
  _id?: string;
  id_psychologue: string;
  id_patient: string;
  date: string; // Date ISO
  heure: string; // ex. "14:30"
  motif: string;
  statut: 'en attente' | 'confirmé' | 'annulé';
}