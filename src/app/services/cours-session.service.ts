// src/app/services/cours-session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursSessionService {
  private apiUrl = 'http://localhost:3000/api/courssessions';
  //private apiUrl = 'https://backend-5uj8.onrender.com/api/courssessions';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}` // Fix: Use backticks for proper string interpolation
    });
  }

  // CRUD de base
  createSession(sessionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, sessionData, {
      headers: this.getAuthHeaders()
    });
  }

  getAllSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  getSessionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateSession(id: string, sessionData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, sessionData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des inscriptions

 inscrireUtilisateur(sessionId: string, userId: string): Observable<any> {
  const body = { user_id: userId };
  console.log("Body envoyé pour inscription :", body);
  return this.http.post(
    `${this.apiUrl}/${sessionId}/inscriptions`,
    body,
    { headers: this.getAuthHeaders() } // Use the consistent getAuthHeaders method
  );
}

  getInscriptions(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${sessionId}/inscriptions`, {
      headers: this.getAuthHeaders()
    });
  }

  annulerInscription(sessionId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${sessionId}/inscriptions/${userId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Sessions par utilisateur
  getSessionsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/sessions`, {
      headers: this.getAuthHeaders()
    });
  }

  // Sessions par cours
  getSessionsByCours(coursId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/by-cours/${coursId}`, {
      headers: this.getAuthHeaders()
    });
  }
}