import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CoursService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // 🗂️ Catégories
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/coursecategories/all`);
  }

  getCategoryById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/coursecategories/get/${id}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/coursecategories/add`, data, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/coursecategories/update/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/coursecategories/delete/${id}`, {
      headers: this.getHeaders()
    });
  }

  // 📚 Cours
  getAllCours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/cours/all`, { headers: this.getHeaders() });
  }

  getCoursById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/cours/get/${id}`, { headers: this.getHeaders() });

  }

  createCours(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/cours/add`, data, { headers: this.getHeaders() });
  }

  updateCours(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/cours/update/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCours(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/cours/delete/${id}`, { headers: this.getHeaders() });
  }

  // 🔎 Filtres et recherche
  getCoursByCategory(catId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/cours/categorie/${catId}`, { headers: this.getHeaders() });
  }

getCoursByPrice(min: number, max: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/cours/filter/price?min=${min}&max=${max}`, { headers: this.getHeaders() });
}

getPopularCours(): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/cours/filter/popularity`, { headers: this.getHeaders() });
}


  searchCours(term: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/cours/search?q=${term}`, { headers: this.getHeaders() });
  }

  // 🎥 Sessions
  getAllSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sessions/all`, { headers: this.getHeaders() });
  }

  getSessionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sessions/${id}`, { headers: this.getHeaders() });
  }

  createSession(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sessions/add`, data, { headers: this.getHeaders() });
  }

  updateSession(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/sessions/update/${id}`, data, { headers: this.getHeaders() });
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/sessions/delete/${id}`, { headers: this.getHeaders() });
  }

  // 📝 Inscriptions
  inscrire(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sessions/inscrire`, data, { headers: this.getHeaders() });
  }

  getInscriptions(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sessions/inscriptions/${sessionId}`, { headers: this.getHeaders() });
  }

  annulerInscription(sessionId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/sessions/annuler/${sessionId}/${userId}`, { headers: this.getHeaders() });
  }

  getSessionsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/sessions/by-user/${userId}`, { headers: this.getHeaders() });
  }

  // 🔔 Rappel manuel
  sendReminders(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/sessions/${sessionId}/reminder`, {}, { headers: this.getHeaders() });
  }

  // 👨‍🏫 Instructeurs
  getAllInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user/showusers`); // adapte si tu as un filtre pour les rôles
  }
}