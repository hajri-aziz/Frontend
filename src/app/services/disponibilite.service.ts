import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Disponibilite } from '../models/disponibilite.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibiliteService {
  private apiUrl = 'http://localhost:3000/apis';

  constructor(private http: HttpClient) {}
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  // Ajouter une disponibilité
  addDisponibilite(disponibilite: Partial<Disponibilite>): Observable<{ message: string; disponibilite: Disponibilite }> {
    return this.http.post<{ message: string; disponibilite: Disponibilite }>(`${this.apiUrl}/disponibilite`, disponibilite, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de l\'ajout de la disponibilité');
      })
    );
  }

  // Récupérer toutes les disponibilités
  getAllDisponibilites(): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/disponibilites`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des disponibilités');
      })
    );
  }

  // Récupérer une disponibilité par ID
  getDisponibiliteById(id: string): Observable<Disponibilite> {
    return this.http.get<Disponibilite>(`${this.apiUrl}/disponibilitesByid/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération de la disponibilité');
      })
    );
  }

  // Récupérer les disponibilités d’un psychologue
  getDisponibilitesByPsychologue(id_psychologue: string): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/disponibilites/psychologue/${id_psychologue}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des disponibilités du psychologue');
      })
    );
  }

  // Modifier une disponibilité
  updateDisponibilite(id: string, disponibilite: Partial<Disponibilite>): Observable<{ message: string; disponibilite: Disponibilite }> {
    return this.http.put<{ message: string; disponibilite: Disponibilite }>(`${this.apiUrl}/disponibilites/${id}`, disponibilite,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la mise à jour de la disponibilité');
      })
    );
  }

  // Supprimer une disponibilité
  deleteDisponibilite(id: string): Observable<{ message: string; disponibilite: Disponibilite }> {
    return this.http.delete<{ message: string; disponibilite: Disponibilite }>(`${this.apiUrl}/disponibilites/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la suppression de la disponibilité');
      })
    );
  }

  // Récupérer les disponibilités par statut
  getDisponibilitesByStatut(statut: string, formattedDate: string): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/disponibilites/statut/${statut}?date=${formattedDate}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors du filtrage des disponibilités');
      })
    );
  }
}