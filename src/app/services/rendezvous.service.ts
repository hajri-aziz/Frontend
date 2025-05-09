import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RendezVous } from '../models/rendezvous.model';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = 'http://localhost:3000/apis';

  constructor(private http: HttpClient) {}
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Ajouter un rendez-vous
  addRendezVous(rendezVous: Partial<RendezVous>): Observable<{ message: string; rendezVous: RendezVous }> {
    return this.http.post<{ message: string; rendezVous: RendezVous }>(`${this.apiUrl}/rendezVous`, rendezVous,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de l\'ajout du rendez-vous');
      })
    );
  }

  // Récupérer tous les rendez-vous
  getAllRendezVous(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/rendezVous`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des rendez-vous');
      })
    );
  }

  // Récupérer un rendez-vous par ID
  getRendezVousById(id: string): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/rendezVous/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération du rendez-vous');
      })
    );
  }

  // Récupérer les rendez-vous d’un psychologue
  getRendezVousByPsychologue(id_psychologue: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/rendezVous/psychologue/${id_psychologue}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des rendez-vous du psychologue');
      })
    );
  }

  // Modifier un rendez-vous
  updateRendezVous(id: string, rendezVous: Partial<RendezVous>): Observable<{ message: string; rendezVous: RendezVous }> {
    return this.http.put<{ message: string; rendezVous: RendezVous }>(`${this.apiUrl}/rendezVous/${id}`, rendezVous,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la mise à jour du rendez-vous');
      })
    );
  }

  // Annuler un rendez-vous
  deleteRendezVous(id: string): Observable<{ message: string; rendezVous: RendezVous }> {
    return this.http.delete<{ message: string; rendezVous: RendezVous }>(`${this.apiUrl}/rendezVous/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de l\'annulation du rendez-vous');
      })
    );
  }

  // Récupérer les rendez-vous par statut
  getRendezVousByStatut(statut: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/rendezVous/statut/${statut}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors du filtrage des rendez-vous');
      })
    );
  }
}