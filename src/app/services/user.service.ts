// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000'; // URL de base de ton backend

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

  verifyOtp(data: any): Observable<any> {
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

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/update/${id}`, data, { headers: this.getAuthHeaders() });
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
}
