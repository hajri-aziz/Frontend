// src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:3000/api/courssessions';
  //private apiUrl = 'https://backend-5uj8.onrender.com/api/courssessions';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}` // Fix: Use backticks for proper string interpolation
  });
}

  // Réserver un créneau
  bookTimeSlot(sessionId: string, userId: string, date: string, time: string, motif: string): Observable<any> {
    const payload = { user_id: userId, date, time, motif };
    return this.http.post(`${this.apiUrl}/${sessionId}/book`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  // Charger les réservations existantes d'une session (optionnel)
  getSessionBookings(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/${sessionId}`, {
      headers: this.getAuthHeaders()
    });
  }
   // 🔧 Inscrire un utilisateur à une session (nécessaire pour calendrier)
  inscrireUtilisateur(sessionId: string, userId: string): Observable<any> {
    const payload = { user_id: userId };
   // Frontend (dans booking.service.ts ou cours-session.service.ts)
    return this.http.post(`${this.apiUrl}/${sessionId}/inscriptions`, { user_id: userId }, {
    headers: this.getAuthHeaders()
    });
}
}