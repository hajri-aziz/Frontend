// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/post';

  constructor(private http: HttpClient) {}

  // Obtenir le token (par exemple, stocké dans localStorage)
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Remplacez par votre logique d'authentification
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/getallPost`, { headers: this.getHeaders() });
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/getPostbyId/${id}`, { headers: this.getHeaders() });
  }

  getPostWithComments(id: string): Observable<{ post: Post; commentaires: any[] }> {
    return this.http.get<{ post: Post; commentaires: any[] }>(`${this.apiUrl}/getPostAvecCommentaires/${id}`, {
      headers: this.getHeaders()
    });
  }

  addPost(post: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/addPost`, post, { headers: this.getHeaders() });
  }

  updatePost(id: string, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/updatePost/${id}`, post, { headers: this.getHeaders() });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deletePost/${id}`, { headers: this.getHeaders() });
  }
}