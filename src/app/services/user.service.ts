// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';  // URL de base de ton backend
  //private apiUrl = 'https://backend-5uj8.onrender.com';
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // suppose que tu stockes le JWT dans localStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 🔐 Authentification
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, data);
  }

  // 🔐 OTP / Mot de passe
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/forgot-password`, { email });
  }

  verifyOtp(data: { email: string, otp: string, newPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/verify-otp`, data);
  }

  // 👤 Utilisateur
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/showusers`, { headers: this.getAuthHeaders() });
  } 

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/showusers/${id}`, { headers: this.getAuthHeaders() });
  }

  getUserByName(nom: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/shownameuser/${nom}`, { headers: this.getAuthHeaders() });
  }
  getPsychiatristsList(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user/psychiatres`);
  }
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/logout`, {},{ headers: this.getAuthHeaders() } // En-tête d'autorisation
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  updateUser(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/update/${id}`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  authorizeUser(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/authorizeUser/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  // 📸 Upload de photo
  uploadProfilePhoto(id: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.put(`${this.apiUrl}/upload-profile-photo/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // 📜 Activités
  getAllActivities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/activities`, { headers: this.getAuthHeaders() });
  }

  getUserActivities(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/activities/${userId}`, { headers: this.getAuthHeaders() });
  }
    // Nouvelle méthode pour obtenir le rôle à partir du token
  getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Décode la payload du JWT
        return payload.role || null; // Retourne le rôle (ex. 'admin', 'user')
      } catch (e) {
        console.error('Erreur de décodage du token', e);
        return null;
      }
    }
    return null;
  }
}
