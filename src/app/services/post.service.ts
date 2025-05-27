// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post, Comment, Group, Message } from '../models/post.models';
import { User } from '../models/user.model';
import io from 'socket.io-client';

@Injectable({providedIn: 'root'})
export class PostService {
  private socket: any; // Use 'any' or proper interface if available
  private readonly SOCKET_URL = 'http://localhost:3000';
  //private readonly SOCKET_URL = 'https://backend-5uj8.onrender.com';

  private apiUrl = 'http://localhost:3000';
  //private apiUrl = 'https://backend-5uj8.onrender.com';

  newGroupName: string | undefined;
  private newGroupMessageSubject = new Subject<any>();
  private groupCreatedSubject = new Subject<any>();
  
 
  constructor(private http: HttpClient) {const options = {
      transports: ['websocket'],
      autoConnect: false,
      query: {
        token: localStorage.getItem('token')
      }
    };
    this.socket = io(this.SOCKET_URL, options);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token || ''}`
    });
  }

  // *******************************************REST API POST  ************************/
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



  //*******************************************REST API COMMENTAIRE  ************************/ 
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






  //*************************************REST API USER***************** */
getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return throwError(() => new Error('Erreur lors de la récupération des utilisateurs'));
      })
    );
  }
addMemberByEmail(groupId: string, email: string) {
  return this.http.post(`http://localhost:3000/group/add-member`, { groupId, email }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
}
getUserByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/group/email/${email}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l’utilisateur par email:', error);
        return throwError(() => new Error('Utilisateur non trouvé'));
      })
    );
  }

  //***************************************REST API MESSAGE******************** */
addMember(groupId: string, newMemberEmail: string): Observable<Group> {
  return this.http.post<Group>(`${this.apiUrl}/group/add-member`, { groupId, email: newMemberEmail }, { headers: this.getHeaders() }).pipe(
    catchError((error) => {
      console.error('Erreur lors de l\'ajout du membre:', error);
      return throwError(() => new Error('Erreur lors de l\'ajout du membre'));
    })
  );
}
 getUserConversations(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messages/conversations/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  }

 getConversationMessages(conversationId: string): Observable<Message[]> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<Message[]>(`${this.apiUrl}/messages/conversations/${conversationId}`, { headers });
}


  



toggleReaction(messageId: string, userId: string, reaction: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/messages/${messageId}/reaction`,
      { userId, reaction },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  }
toggleLike(postId: string, userId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/posts/${postId}/like`,
      { userId },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  }


  ///////***********************SOCKET  ONETOONE************************* */
  connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.auth = { userId };
      this.socket.connect();
    }
  }

  joinConversation(conversationId: string): void {
    this.socket.emit('joinConversation', conversationId);
  }

  sendMessage(destinataireId: string, contenu: string): void {
    this.socket.emit('sendMessage', {
      destinataireId,
      contenu
    });
  }
 
  onNewMessage(callback: (message: any) => void): void {
    this.socket.on('newMessage', (message: any) => {
      console.log('New message received in SocketService:', message);
      callback(message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }


getMessagesBetweenUsersDirect(userId1: string, userId2: string): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}group/message/between/${userId1}/${userId2}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
}
 emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }
getMessagesBetweenUsers(otherUserId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/group/message/with/${otherUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
  }

  //*****************************REST API GROUP *************************** */
  
async getGroupMessages(groupId: string): Promise<Message[]> {
    const url = `${this.apiUrl}/group/${groupId}/messages`; // Ajusté pour correspondre à la route :groupId/messages
    console.log(`Fetching group messages for groupId: ${groupId} from ${url}`);
    const response = await this.http.get<Message[]>(url, { headers: this.getHeaders() }).toPromise();
    console.log('Group messages fetched:', response);
    return response ?? [];
}
 // Rejoindre un groupe

  // Écouter la création d'un nouveau groupe


  // Écouter les nouveaux messages
  onNewMessageGroup(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new-group-message', (message: any) => {
        observer.next(message);
      });
    });
  }
async sendGroupMessage(data: { groupId: string, contenu: string, sender: string }): Promise<void> {
    console.log("📤 Emitting send-group-message with data:", data);
    return new Promise((resolve, reject) => {
        this.socket.emit('send-group-message', data, (response: any) => {
            if (response?.status === 'success') {
                console.log("✅ Successfully sent group message");
                resolve();
            } else {
                console.error("❌ Failed to send group message:", response);
                reject(new Error('Failed to send group message'));
            }
        });
    });
}




  //***************************** REST API GROUP *************************** */

getUserGroups(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/group/getallGroupByUser`, { headers: this.getHeaders() });
}

// Rejoindre un groupe
joinGroup(groupId: string): void {
    this.socket.emit('join-group', { groupId }, (response: any) => {
        if (response?.status === 'success') {
            console.log(`Successfully joined group ${groupId}`);
        } else {
            console.error(`Failed to join group ${groupId}`, response);
        }
    });
}

leaveGroup(groupId: string): void {
    this.socket.emit('leave-group', { groupId });
}

// Écouter la création d'un nouveau groupe
onGroupCreated(): Observable<any> {
    return new Observable(observer => {
        this.socket.on('group-created', (data: any) => {
            observer.next(data);
        });
    });
}

// Récupérer les messages d'un groupe


// Écoute des nouveaux messages de groupe
onNewGroupMessage(): Observable<Message> {
    return new Observable(observer => {
        this.socket.on('new-group-message', (message: Message) => {
            observer.next(message);
        });
    });
}



// Gestion des erreurs
onError(): Observable<string> {
    return new Observable(observer => {
        this.socket.on('error', (err: any) => {
            observer.next(err);
        });
    });
}



//************************************REACTION********************* */

   addReaction(postId: string, reactionType: any) {
    
        

      
  return this.http.post(`http://localhost:3000/post/posts/${postId}/react`, { 
    type: reactionType 
  });
    }
    
    removeReaction(postId: string) {
        return this.http.delete(`/api/posts/${postId}/react`);
    }
  
}




  
