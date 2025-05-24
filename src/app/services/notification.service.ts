import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/apis';
  //private apiUrl = 'https://backend-5uj8.onrender.com/apis';

  constructor(private http: HttpClient) {}
  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Récupérer toutes les notifications d’un patient
  getNotificationsByPatient(id_patient: string): Observable<{ notifications: Notification[] }> {
    return this.http.get<{ notifications: Notification[] }>(`${this.apiUrl}/notifications/${id_patient}`,{ headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la récupération des notifications');
      })
    );
  }

  // Marquer une notification comme lue
  markNotificationAsRead(id: string): Observable<{ message: string; notification: Notification }> {
    return this.http.put<{ message: string; notification: Notification }>(`${this.apiUrl}/notifications/${id}/lu`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur:', error);
        return throwError('Erreur lors de la mise à jour de la notification');
      })
    );
  }
}