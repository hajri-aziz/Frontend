import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Disponibilite } from '../models/disponibilite.model';

export interface Message {
  _id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DisponibiliteService {
  private apiUrl = 'http://localhost:3000/apis';
  //private apiUrl = 'https://backend-5uj8.onrender.com/apis';

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
  // Récupérer tous les messages
  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/contact/`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des messages', error);
        return throwError('Erreur serveur');
      })
    );
  }

  // Créer un message
  createMessage(message: Message): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/contact/`, message).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création du message', error);
        return throwError('Erreur serveur');
      })
    );
  }

  // Supprimer un message
  deleteMessage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contact/${id}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression du message', error);
        return throwError('Erreur serveur');
      })
    );
  }
}