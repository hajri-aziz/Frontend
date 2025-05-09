
export interface Psychologue {
  _id: string;
  nom: string;
}

export interface Disponibilite {
  _id?: string;
  id_psychologue: Psychologue;
  date: string; // Date sera une string ISO dans les réponses JSON (ex. "2025-05-07T00:00:00.000Z")
  heure_debut: string; // ex. "09:00"
  heure_fin: string; // ex. "10:00"
  statut: 'disponible' | 'occupé' | 'absent';
}