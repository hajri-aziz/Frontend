// src/app/services/cours-session.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursSessionService {
  private apiUrl = 'http://localhost:3000/api/courssessions';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
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
    const body = { user_id: userId }; // ✅ seul user_id dans body
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    console.log("Body envoyé pour inscription :", body);
    return this.http.post(
      `http://localhost:3000/api/courssessions/${sessionId}/inscriptions`,
      body,
      { headers }
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