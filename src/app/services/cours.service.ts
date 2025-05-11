// src/app/services/cours.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  createCategory(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/coursecategories/add`, data, {
    headers: this.getHeaders()
  });
}
getAllCategories(): Observable<any> {
  return this.http.get('http://localhost:3000/api/coursecategories/all');
}


getCategoryById(id: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/coursecategories/get/${id}`);
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
    return this.http.get(`${this.apiUrl}/cours`, { headers: this.getHeaders() });
  }

  getCoursById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/${id}`, { headers: this.getHeaders() });
  }

  createCours(data: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/cours`, data, { headers: this.getHeaders() });
  }

  updateCours(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/cours/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCours(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cours/${id}`, { headers: this.getHeaders() });
  }

  // 🎥 Sessions
  getAllSessions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions`, { headers: this.getHeaders() });
  }

  getSessionById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/${id}`, { headers: this.getHeaders() });
  }

  createSession(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions`, data, { headers: this.getHeaders() });
  }

  updateSession(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/sessions/${id}`, data, { headers: this.getHeaders() });
  }

  deleteSession(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/${id}`, { headers: this.getHeaders() });
  }

  // 📝 Inscriptions
  inscrire(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/inscrire`, data, { headers: this.getHeaders() });
  }

  getInscriptions(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/inscriptions/${sessionId}`, { headers: this.getHeaders() });
  }

  annulerInscription(sessionId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sessions/annuler/${sessionId}/${userId}`, { headers: this.getHeaders() });
  }

  getSessionsByUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sessions/by-user/${userId}`, { headers: this.getHeaders() });
  }

  // 🔎 Filtres et recherche
  getCoursByCategory(catId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/categorie/${catId}`, { headers: this.getHeaders() });
  }

  getCoursByPrice(min: number, max: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/prix?min=${min}&max=${max}`, { headers: this.getHeaders() });
  }

  getPopularCours(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/populaires`, { headers: this.getHeaders() });
  }

  searchCours(term: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/cours/search?q=${term}`, { headers: this.getHeaders() });
  }

  // 🔔 Rappel manuel
  sendReminders(sessionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/reminder`, {}, { headers: this.getHeaders() });
  }
}
