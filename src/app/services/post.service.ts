// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post, Comment, Group, Message } from '../models/post.models';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  getGroups(_id: string | undefined) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  // Posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/post/getallPost`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des posts:', error);
        return throwError(() => new Error('Erreur lors de la récupération des posts'));
      })
    );
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/post/getPostbyId/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du post:', error);
        return throwError(() => new Error('Erreur lors de la récupération du post'));
      })
    );
  }

  getPostWithComments(id: string): Observable<{ post: Post; commentaires: Comment[] }> {
    return this.http.get<{ post: Post; commentaires: Comment[] }>(`${this.apiUrl}/post/getPostAvecCommentaires/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return throwError(() => new Error('Erreur lors de la récupération des commentaires'));
      })
    );
  }

  addPost(post: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/post/addPost/`, post, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout du post:', error);
        return throwError(() => new Error('Erreur lors de l\'ajout du post'));
      })
    );
  }

  updatePost(id: string, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/post/updatePost/${id}`, post, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du post:', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du post'));
      })
    );
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/post/deletePost/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression du post:', error);
        return throwError(() => new Error('Erreur lors de la suppression du post'));
      })
    );
  }

  toggleLike(postId: string, userId: string): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/post/toggleLike/${postId}`, { userId }, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors du toggle like:', error);
        return throwError(() => new Error('Erreur lors du toggle like'));
      })
    );
  }

  // Commentaires
  addComment(comment: Partial<Comment>): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/commentaire/addComment`, comment, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        return throwError(() => new Error('Erreur lors de l\'ajout du commentaire'));
      })
    );
  }

  getComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/commentaire/getallComment`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return throwError(() => new Error('Erreur lors de la récupération des commentaires'));
      })
    );
  }

  getCommentById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/commentaire/getCommentbyId/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération du commentaire:', error);
        return throwError(() => new Error('Erreur lors de la récupération du commentaire'));
      })
    );
  }

  updateComment(id: string, comment: Partial<Comment>): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/commentaire/updateComment/${id}`, comment, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du commentaire:', error);
        return throwError(() => new Error('Erreur lors de la mise à jour du commentaire'));
      })
    );
  }

  deleteComment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/commentaire/deleteComment/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la suppression du commentaire:', error);
        return throwError(() => new Error('Erreur lors de la suppression du commentaire'));
      })
    );
  }

 

  addMember(groupId: string, newMemberId: string): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/group/ajouterMember`, { groupId, newMemberId }, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de l\'ajout du membre:', error);
        return throwError(() => new Error('Erreur lors de l\'ajout du membre'));
      })
    );
  }
   // Récupérer les groupes d'un utilisateur spécifique
  getUserGroups(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/group/getallGroupByUser/${userId}`);
  }


  // Récupérer un utilisateur par email
 getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/email/${email}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l’utilisateur par email:', error);
        return throwError(() => new Error('Utilisateur non trouvé'));
      })
    );
  }

  // Créer un groupe
  createGroup(group: Partial<Group>): Observable<Group> {
    return this.http.post<Group>(`${this.apiUrl}/group/create`, group, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la création du groupe:', error);
        return throwError(() => new Error('Erreur lors de la création du groupe'));
      })
    );
  }

  // Conversations et Messages
  getUserConversations(userId: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/conversations/${userId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des conversations:', error);
        return throwError(() => new Error('Erreur lors de la récupération des conversations'));
      })
    );
  }

  getConversationMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations?conversationId=${conversationId}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des messages:', error);
        return throwError(() => new Error('Erreur lors de la récupération des messages'));
      })
    );
  }

  toggleReaction(messageId: string, userId: string, reaction: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reactions/${messageId}`, { userId, reaction }, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors du toggle de la réaction:', error);
        return throwError(() => new Error('Erreur lors du toggle de la réaction'));
      })
    );
  }

  // Utilisateurs
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return throwError(() => new Error('Erreur lors de la récupération des utilisateurs'));
      })
    );
  }
}