import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoursCategory } from '../models/cours-category.model';

@Injectable({
  providedIn: 'root'
})
export class CoursCategoryService {
  //private baseUrl = 'http://localhost:3000/api/coursecategories';
  private baseUrl = 'https://backend-5uj8.onrender.com/api/coursecategories';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all`);
  }
  

  getById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/get/${id}`);
  }
  getAllCategories(): Observable<CoursCategory[]> {
    return this.http.get<CoursCategory[]>(`${this.baseUrl}/`);
  }
}
