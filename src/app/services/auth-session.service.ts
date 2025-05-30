import { Injectable }      from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable }      from 'rxjs';

interface SessionLoginResponse {
  message: string;
  tokenSession: string;
  accessLink: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  sessionLogin(sessionId: string, password: string): Observable<SessionLoginResponse> {
    const tokenWeb = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${tokenWeb}`
    });
    return this.http.post<SessionLoginResponse>(
      `${this.apiUrl}/session-login`,
      { sessionId, password },
      { headers }
    );
  }
}
