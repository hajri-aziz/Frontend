export interface Notification {
  _id?: string;
  id_patient: string;
  type: 'rendezvous' | 'evenement';
  id_cible: string;
  message: string;
  date_rappel: string; // Date ISO
  lu: boolean;
  envoye: boolean;
}