import { Injectable } from '@angular/core';
import { Evenement, Participant } from '../models/evenement.model';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private apiUrl = 'http://localhost:3000/apis';
  //private apiUrl = 'https://backend-5uj8.onrender.com/apis';

  constructor(private http: HttpClient) {}
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  // Ajouter un événement
  addEvenement(evenement: Partial<Evenement>): Observable<{ message: string; evenement: Evenement }> {
    return this.http.post<{ message: string; evenement: Evenement }>(`${this.apiUrl}/evenements`, evenement,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de l\'ajout de l\'événement');
      })
    );
  }

  // Récupérer tous les événements
  getAllEvenements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/evenements`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des événements');
      })
    );
  }

  // Récupérer un événement par ID
  getEvenementById(id: string): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/evenements/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération de l\'événement');
      })
    );
  }

  // Modifier un événement
  updateEvenement(id: string, evenement: Partial<Evenement>): Observable<{ message: string; evenement: Evenement }> {
    return this.http.put<{ message: string; evenement: Evenement }>(`${this.apiUrl}/evenements/${id}`, evenement,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la mise à jour de l\'événement');
      })
    );
  }

  // Supprimer un événement
  deleteEvenement(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/evenements/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la suppression de l\'événement');
      })
    );
  }
    // Inscrire un patient à un événement
    inscrireEvenement(id_evenement: string): Observable<{ message: string; evenement: Evenement }> {
      return this.http.post<{ message: string; evenement: Evenement }>(`${this.apiUrl}/inscriptions`, { id_evenement }, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          console.error('Erreur:', error);
          return throwError(error.error?.message || 'Erreur lors de l\'inscription à l\'événement');
        })
      );
    }
  
    // Récupérer les inscriptions d’un événement
    getInscriptionsByEvenement(id_evenement: string): Observable<Participant[]> {
      return this.http.get<Participant[]>(`${this.apiUrl}/inscriptions/${id_evenement}`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          console.error('Erreur:', error);
          return throwError(error.error?.message || 'Erreur lors de la récupération des participants');
        })
      );
    }
  
    // Annuler une inscription à un événement
    annulerInscription(id_evenement: string, id_patient: string): Observable<{ message: string }> {
      return this.http.delete<{ message: string }>(`${this.apiUrl}/inscriptions/${id_evenement}/${id_patient}`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          console.error('Erreur:', error);
          return throwError(error.error?.message || 'Erreur lors de l\'annulation de l\'inscription');
        })
      );
    }

}