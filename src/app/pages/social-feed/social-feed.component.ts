// src/app/pages/social-feed/social-feed.component.ts
import { Component, type OnInit, type OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Post, Comment, Group, Message } from "../../models/post.models"
import type { User } from "../../models/user.model"
import { UserService } from "../../services/user.service"
import { PostService } from "../../services/post.service"
import type { Observable, Subscription } from "rxjs"
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http"
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PickerModule } from '@ctrl/ngx-emoji-mart';


@Component({
  selector: "app-social-feed",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./social-feed.component.html",
  styleUrls: ["./social-feed.component.scss"],
})
export class SocialFeedComponent implements OnInit, OnDestroy {


 
 
  showEmojiPicker: boolean = false;

 



  messageSubscription: Subscription | undefined;
  selectedGroup: any
  currentUser: User | null = null
  posts: Post[] = []
  newPost: Partial<Post> = { titre: "", contenu: "" }
  newCommentContents: { [postId: string]: string } = {}
  selectedFile: File | null = null
  imagePreview: string | null = null
  users: User[] = []
  selectedUser: User | null = null
  messages: Message[] = []
  groups: any[] = [];
  newGroupName: string = ''; // Champ pour le nom du groupe
  invitedEmail: string = ''; // Champ pour l'email de l'utilisateur à inviter
  private subscriptions: Subscription[] = []
  newGroup: any
  showModal: boolean = false;
  currentUserId: string = '';
  tempEmail: string = ''; // Email temporaire saisi dans le modale
  tempUsers: { email: string, id: string }[] = []; // Liste temporaire des utilisateurs
  showCreateGroupModal: boolean = false; // Modale pour créer un groupe
  groupMessages: any[] = [];
  messageContent: string = '';
  newMessage = '';
  isTyping: boolean = false;
  typingTimeout: any;
  groupMessageContent: string = '';
  private destroy$ = new Subject<void>();
  // Nouvelles propriétés ajoutées
  activeChats: any[] = []; // Pour gérer plusieurs chats ouverts
  expandedChatId: string | null = null; // Pour savoir quel chat est développé
  activeGroupChats: Array<{
    group: Group;
    isExpanded: boolean;
    unreadCount: number;
    groupMessages: any[];
}> = [];

  // ViewChild pour le scrolling automatique
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('groupMessagesContainer') private groupMessagesContainer!: ElementRef;
  newGroupMessage: any
expandedGroupChatId: string | null = null;
post: any
  
  constructor(
    private postService: PostService,
    private userService: UserService,
    private groupService: PostService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
  ) {}
 


  onTyping(): void {
    if (!this.isTyping) {
        this.isTyping = true;
        // Envoyer la notification "typing" au serveur
       
    }
    
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
    }, 2000);
  }

  // Écouter les notifications de typing
  listenForTyping(): void {
      
  }

  // Méthodes du SocketChatComponent intégrées
  private isMessageForCurrentConversation(msg: Message): boolean {
    return !!this.selectedUser && msg.conversationId === this.getConversationId();
  }

  // Méthodes modifiées pour intégrer la fonctionnalité de chat
  closeConversation(): void {
    this.selectedUser = null;
    this.messages = [];
    this.messageContent = '';
    this.postService.disconnect();
  }

  // Méthodes existantes restantes...
  ngOnInit() {
     this.postService.connect(this.currentUserId);
    this.checkServerConnection();
    this.loadCurrentUser();
    this.currentUserId = localStorage.getItem('userId') || '';
    this.loadPosts();
    this.loadUsers();
    this.loadGroups();
    this.listenForTyping();
    this.setupSocketListeners();
    this.setupSocketListenersGroup();

    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
      console.log('Users loaded:', this.users);
    });
    this.loadGroups();
    console.log("Vérification des données utilisateur terminée");
    console.log("Current User après vérification:", this.currentUser);
    this.checkServerConnection();
    this.loadUser();
    console.log("Vérification de la connexion au serveur terminée");
  }

  private checkServerConnection(): void {
    this.postService.getPosts().subscribe({
      next: () => {
        console.log("Connexion au serveur établie");
      },
      error: (error) => {
        console.error("Erreur de connexion au serveur:", error);
        alert("Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution sur http://localhost:3000");
      },
    });
  }

  private getSanitizedLocalStorageItem(key: string): string {
    try {
      const value = localStorage.getItem(key);

      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        !["null", "undefined", "NaN"].includes(value.toLowerCase())
      ) {
        return value.trim();
      }
      return "";
    } catch (error) {
      console.error(`Erreur de lecture du localStorage pour ${key}:`, error);
      return "";
    }
  }

  private getValidImageUrl(imageUrl: string | null): string {
    const defaultImage = "https://i.pravatar.cc/150?img=1";

    if (!imageUrl) return defaultImage;

    try {
      new URL(imageUrl); // Valide que c'est une URL valide
      return imageUrl;
    } catch {
      return defaultImage;
    }
  }
private loadPosts(): void {
  this.subscriptions.push(
    this.postService.getPosts().subscribe({
      next: (posts) => {
        console.log('Posts received from API:', posts);

        // Trier les posts par date de création décroissante
        const sortedPosts = [...posts].sort((a, b) => 
          new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
        );

        const userRequests = sortedPosts.map((post) =>
          this.userService.getUserById((post.idAuteur as any)?._id || post.idAuteur).pipe(
            map((user) => {
              const userData = user || {
                _id: (post.idAuteur as any)?._id || post.idAuteur || 'unknown',
                nom: post.idAuteur?.nom || 'Utilisateur',
                prenom: post.idAuteur?.prenom || 'Inconnu',
                profileImage: 'https://i.pravatar.cc/150?u=default',
              };
              if (!userData.prenom || !userData.nom) {
                console.warn(`Utilisateur ${userData._id} n'a pas de prénom ou de nom défini.`);
              }
              return { post, user: userData };
            }),
            catchError(() => of({
              post,
              user: {
                _id: (post.idAuteur as any)?._id || post.idAuteur || 'unknown',
                nom: 'Utilisateur',
                prenom: 'Inconnu',
                profileImage: 'https://i.pravatar.cc/150?u=default',
              }
            }))
          )
        );

        forkJoin(userRequests).subscribe({
          next: (results) => {
            this.posts = results.map(({ post, user }) => ({
              ...post,
              idAuteur: {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                profileImage: user.profileImage,
              },
              comments: [],
              date_creation: new Date(post.date_creation).toISOString(),
            }));
            console.log('Processed posts:', this.posts);
            this.loadCommentsForPosts();
          },
          error: (error) => {
            console.error('Error in forkJoin:', error);
            this.posts = sortedPosts.map((post) => ({
              ...post,
              idAuteur: {
                _id: (post.idAuteur as any)?._id || post.idAuteur || 'unknown',
                nom: 'Utilisateur',
                prenom: 'Inconnu',
                profileImage: 'https://i.pravatar.cc/150?u=default',
              },
              comments: [],
              date_creation: new Date(post.date_creation).toISOString(),
            }));
            this.loadCommentsForPosts();
          }
        });
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        alert('Erreur lors du chargement des posts');
      },
    })
  );
}

getFullName(user: any): string {
  return `${user.prenom || 'Prénom'} ${user.nom || 'Nom'}`;
}

  private loadCommentsForPosts(): void {
    this.posts.forEach((post) => {
      if (post._id) {
        this.postService.getPostWithComments(post._id).subscribe({
          next: ({ commentaires }) => {
            const postIndex = this.posts.findIndex((p) => p._id === post._id);
            if (postIndex !== -1) {
              this.posts[postIndex].comments = commentaires.map((c) => ({
                ...c,
                date_creation: new Date(c.date_creation).toISOString(),
              }));
            }
          },
        });
      }
    });
  }

  private loadUsers(): void {
    this.subscriptions.push(
      this.userService.getAllUsers().subscribe({
        next: (users: User[]) => {
          this.users = users.map((user) => ({
            ...user,
            isOnline: Math.random() > 0.5,
          }));
        },
        error: () => {
          this.users = this.currentUser ? [this.currentUser] : [];
        },
      }),
    );
  }

  getUserById(id: string): User | null {
    return this.users.find((user) => user._id === id) || this.currentUser || null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      console.log("Image selected:", this.selectedFile.name, this.selectedFile.size);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      console.warn("No file selected");
    }
  }

 addPost(): void {
  if (!this.validatePost() || !this.currentUser) {
    console.warn("Post validation failed or no current user");
    return;
  }

  const formData = this.createPostFormData();
  console.log("FormData prepared:", {
    titre: this.newPost.titre,
    contenu: this.newPost.contenu,
    hasImage: !!this.selectedFile,
  });

  this.subscriptions.push(
    this.postService.addPost(formData).subscribe({
      next: (post) => {
        console.log("Post added successfully:", post);
        
        // Créer l'objet utilisateur minimal pour l'affichage immédiat
        const userData = {
          _id: this.currentUser!._id ?? '',
          nom: this.currentUser!.nom,
          prenom: this.currentUser!.prenom,
          profileImage: this.currentUser!.profileImage || 'https://i.pravatar.cc/150?u=default'
        };

        // Ajouter le nouveau post au début du tableau
        this.posts.unshift({
          ...post,
          idAuteur: userData,
          comments: [],
          date_creation: new Date().toISOString()
        });

        this.resetPostForm();
      },
      error: (error) => this.handlePostError(error),
    })
  );
}
  private validatePost(): boolean {
    return !!(this.newPost.titre?.trim() && this.newPost.contenu?.trim() && this.currentUser?._id);
  }

  private createPostFormData(): FormData {
    const formData = new FormData();
    formData.append("titre", this.newPost.titre!);
    formData.append("contenu", this.newPost.contenu!);
    formData.append("idAuteur", this.currentUser!._id!);
    if (this.selectedFile) {
      formData.append("image", this.selectedFile);
    }
    return formData;
  }

  private resetPostForm(): void {
    this.newPost = { titre: "", contenu: "" };
    this.selectedFile = null;
    this.imagePreview = null;
    this.loadPosts();
  }

  private handlePostError(error: any): void {
    console.error("Error adding post:", error);
    alert("Error adding post");
  }

  toggleLike(post: Post): void {
    if (!this.currentUser?._id || !post._id) return;

    this.subscriptions.push(
      this.postService.toggleLike(post._id, this.currentUser._id).subscribe({
        next: () => this.loadPosts(),
        error: (error) => {
          console.error("Error toggling like:", error);
          alert("Error toggling like");
        },
      }),
    );
  }

  addComment(post: Post): void {
    const content = this.newCommentContents[post._id!];
    if (!content?.trim() || !this.currentUser || !post._id) return;

    const comment = this.createComment(post, content);
    this.subscriptions.push(
      this.postService.addComment(comment).subscribe({
        next: () => this.handleCommentSuccess(post._id!),
        error: (error) => this.handleCommentError(error),
      }),
    );
  }

  private createComment(post: Post, content: string): Partial<Comment> {
    return {
      idAuteur: {
        _id: this.currentUser!._id!,
        nom: this.currentUser!.nom,
        prenom: this.currentUser!.prenom,
        profileImage: this.currentUser!.profileImage,
      },
      idPost: post._id!,
      contenu: content,
      date_creation: new Date().toISOString(),
    };
  }

  private handleCommentSuccess(postId: string): void {
    this.newCommentContents[postId] = "";
    this.loadPosts();
  }

  private handleCommentError(error: any): void {
    console.error("Error adding comment:", error);
    alert("Error adding comment");
  }





  private handleConversationError(error: any): void {
    console.error("Error loading conversations:", error);
    this.messages = [];
  }

  sharePost(post: Post): void {
    alert(`Post partagé: ${post.contenu.substring(0, 30)}...`);
  }


 

  logout(): void {
    ;["token", "userId", "nom", "prenom", "profileImage", "email", "role"].forEach((key) =>
      localStorage.removeItem(key),
    );
    window.location.href = "/login";
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.postService.disconnect();
    this.destroy$.next();
  this.destroy$.complete();  
     this.subscriptions.forEach(sub => sub.unsubscribe());
  }




  getSafeImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return "https://via.placeholder.com/300x200?text=Image+non+disponible";
    }
    const fullUrl = `http://localhost:3000${imagePath}`;
    try {
      new URL(fullUrl);
      return fullUrl;
    } catch {
      return "https://via.placeholder.com/300x200?text=Image+non+disponible";
    }
  }

  getProfileImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      console.warn('Profile image path is empty, using default');
      return 'assets/profil.png';
    }
    const fullUrl = `http://localhost:3000${imagePath}`;
    console.log('Profile image URL:', fullUrl);
    return fullUrl;
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      console.warn('Post image path is empty, using placeholder');
      return 'https://via.placeholder.com/300x200?text=Image+non+disponible';
    }
    const fullUrl = `http://localhost:3000${imagePath}`;
    console.log('Post image URL:', fullUrl);
    return fullUrl;
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Failed to load profile image, falling back to default');
    imgElement.src = 'assets/profil.png';
  }

  handlePostImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Failed to load post image, falling back to placeholder');
    imgElement.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
  }

  loadUser(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.users;
        console.log('Users récupérés :', this.users);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      }
    });
  }

 
  openGroup(groupId: string) {
    console.log('Ouverture du groupe avec ID :', groupId);
  }

 

  private validateUserData(): void {
    if (!this.currentUser) {
      console.error("Erreur: currentUser est null");
      return;
    }

    if (!this.currentUser.nom && !this.currentUser.prenom) {
      const emailPrefix = this.currentUser.email.split("@")[0];
      this.currentUser = {
        ...this.currentUser,
        nom: emailPrefix || "Utilisateur",
        prenom: "",
      };
      console.warn("Utilisation du fallback email pour le nom");
    } else if (!this.currentUser.nom) {
      this.currentUser.nom = this.currentUser.prenom;
      this.currentUser.prenom = "";
    }

    if (typeof this.currentUser.nom !== "string") {
      this.currentUser.nom = String(this.currentUser.nom);
    }
    if (typeof this.currentUser.prenom !== "string") {
      this.currentUser.prenom = String(this.currentUser.prenom);
    }
  }

private loadCurrentUser(): void {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Vérifier si le token et l'userId sont présents
  if (!token || !userId) {
    console.warn("Token ou UserID manquant, redirection vers /login");
    window.location.href = "/login";
    return;
  }

  // Récupérer les données utilisateur avec logs pour débogage
  console.debug("Contenu de localStorage:", {
    token: !!token, // Vérifie si le token existe
    userId,
    prenom: localStorage.getItem("prenom"),
    nom: localStorage.getItem("nom"),
    email: localStorage.getItem("email"),
    profileImage: localStorage.getItem("profileImage"),
    role: localStorage.getItem("role")
  });

  // Récupération et sanitization des données utilisateur
  const prenom = this.getSanitizedLocalStorageItem("prenom") || "Inconnu";
  const nom = this.getSanitizedLocalStorageItem("nom") || "Utilisateur";
  const email = localStorage.getItem("email") || "email@inconnu.com";
  const profileImage = this.getValidImageUrl(localStorage.getItem("profileImage")) || "https://i.pravatar.cc/150?img=1";
  const role = localStorage.getItem("role") || "user";

  // Construction de l'objet utilisateur
  this.currentUser = {
    _id: userId,
    nom,
    prenom,
    email,
    profileImage,
    role
  };

  // Validation des données utilisateur
  this.validateUserData();

  console.debug("Utilisateur chargé:", {
    id: this.currentUser._id,
    prenom: this.currentUser.prenom,
    nom: this.currentUser.nom,
    email: this.currentUser.email,
    role: this.currentUser.role,
    profileImage: this.currentUser.profileImage
  });
}
  // Garder la méthode originale de selectUser avec des modifications de la seconde version
selectUser(user: User): void {
  if (user._id === this.currentUser?._id || !this.currentUser?._id) {
    console.warn('Invalid user selection:', { selectedUser: user._id, currentUser: this.currentUser?._id });
    return;
  }

  console.log('Selecting user:', user);
  this.selectedUser = user;
  this.messages = [];
  const existingChat = this.activeChats.find(chat => chat.user._id === user._id);
  if (!existingChat) {
    this.activeChats.push({
      user: user,
      isExpanded: true
    });
  }
  this.expandedChatId = user._id ?? null;

  this.postService.connect(this.currentUser._id);
  this.setupSocketListeners();

  const conversationId = this.getConversationId();
  if (conversationId) {
    this.postService.joinConversation(conversationId);
  }

  // Remplacer l'ancien chargement par loadFullConversation
  console.log('Loading full conversation for user:', user._id);
  if (user._id) {
    this.loadFullConversation(user._id);
  } else {
    console.error('User ID is undefined, cannot load conversation.');
  }
}
  private getConversationId(): string {
    if (!this.selectedUser || !this.currentUserId) return '';
    const id = [this.currentUserId, this.selectedUser._id].sort().join('_');
    console.log('Generated conversation ID:', id);
    return id;
  }


  private setupSocketListeners(): void {
    this.postService.onNewMessage((msg: any) => {
      console.log('New message received:', msg);
      const conversationId = this.getConversationId();
      const msgConversationId = msg.conversationId || [msg.expediteurId, msg.destinataireId].sort().join('_');
      if (msgConversationId === conversationId) {
        this.messages.push({
          _id: msg._id || Date.now().toString(),
          sender: msg.expediteurId,
          content: msg['contenu'],
          timestamp: msg.dateEnvoi || new Date().toISOString(),
          conversationId: msgConversationId
        });
        this.cdr.detectChanges();
        
        console.log('Message added to UI:', this.messages);
      }
    });
  }


  private validateMessage(): boolean {
    const isValid = !!(this.selectedUser && this.selectedUser._id && this.messageContent.trim() && this.currentUser?._id);
    if (!isValid) {
      console.warn('Validation failed:', {
        selectedUser: this.selectedUser,
        messageContent: this.messageContent,
        currentUserId: this.currentUser?._id
      });
    }
    return isValid;
  }

  // Nouvelles méthodes ajoutées du deuxième code
private loadMessagesBetweenUsers(userId1: string, userId2: string): void {
  console.log('Loading messages between:', { userId1, userId2 });
  this.messages = []; // Affiche le loader
  this.subscriptions.push(
    this.postService.getMessagesBetweenUsersDirect(userId1, userId2).subscribe({
      next: (apiMessages: any[]) => {
        console.log('Raw API messages:', apiMessages);
        this.messages = apiMessages.map((apiMsg: any) => ({
          _id: apiMsg._id,
          conversationId: apiMsg.conversationId,
          expediteurId: apiMsg.expediteurId,
          destinataireId: apiMsg.destinataireId,
          contenu: apiMsg.contenu,
          dateEnvoi: new Date(apiMsg.dateEnvoi).toISOString(),
          status: apiMsg.status || 'read',
          reactions: apiMsg.reactions || [],
          sender: apiMsg.expediteurId,
          content: apiMsg.contenu,
          timestamp: new Date(apiMsg.dateEnvoi).toISOString()
        }));
        console.log('Mapped messages:', this.messages);
        this.cdr.detectChanges();
        this.scrollToBottom('messagesContainer');
        
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.messages = [];
        this.cdr.detectChanges();
      }
    })
  );
}
sendMessage(): void {
  if (!this.validateMessage()) return;

  const message: Message = {
    _id: Date.now().toString(),
    expediteurId: this.currentUser!._id!,
    destinataireId: this.selectedUser!._id!,
    conversationId: this.getConversationId(),
    contenu: this.messageContent,
    dateEnvoi: new Date().toISOString(),
    status: 'sent',
    sender: this.currentUser!._id!,
    content: this.messageContent,
    timestamp: new Date().toISOString()
  };

  this.messages.push(message);
  this.postService.sendMessage(this.selectedUser!._id!, this.messageContent);
  this.messageContent = '';
  this.cdr.detectChanges();
  this.scrollToBottom('messagesContainer');
}




  minimizeChat(): void {
    if (!this.selectedUser) return;

    const selectedUserId = this.selectedUser ? this.selectedUser._id : null;
    if (!selectedUserId) return;

    const chatIndex = this.activeChats.findIndex(chat => chat.user._id === selectedUserId);
    if (chatIndex !== -1) {
      this.activeChats[chatIndex].isExpanded = false;
    }

    this.expandedChatId = null;
  }
  // Méthode pour fermer un chat
  closeChat(userId: string): void {
    this.activeChats = this.activeChats.filter(chat => chat.user._id !== userId);
    
    if (this.expandedChatId === userId) {
      this.expandedChatId = null;
      this.selectedUser = null;
    }
  }
 
expandChat(userId: string) {
  this.expandedChatId = userId;

  const chatUser = this.activeChats.find(chat => chat.user._id === userId);
  if (chatUser) {
    this.selectedUser = chatUser.user;
    chatUser.isExpanded = true;

    // On télécharge la conversation juste avec l'ID du destinataire
    this.loadFullConversation(userId);
  }
}

  loadFullConversation(otherUserId: string) {
    if (!this.currentUser || !this.currentUser._id) {
      console.error('Utilisateur courant non défini');
      this.messages = [];
      return;
    }

    this.messages = [];
    this.postService.getMessagesBetweenUsers(otherUserId).subscribe({
      next: (messages) => {
        this.messages = messages.map((msg: any) => ({
          _id: msg._id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          expediteur: msg.expediteur
        }));
        console.log('Messages transformés:', this.messages);
        this.scrollToBottom('messagesContainer');
      },
      error: (err) => {
        console.error('Erreur de chargement des messages:', err);
        this.messages = [];
      }
    });
  }

  scrollToBottom(p0: string): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  downloadMessages() {
    if (!this.messages || this.messages.length === 0) {
      alert('Aucun message à télécharger.');
      return;
    }

    const formattedMessages = this.messages.map(msg => {
      let senderName = 'Inconnu';
      if (this.currentUser && msg.sender === this.currentUser._id) {
        senderName = `${this.currentUser.prenom ?? ''} ${this.currentUser.nom ?? ''}`.trim();
      } else if (msg['expediteur'] && msg['expediteur'].prenom) {
        senderName = `${msg['expediteur'].prenom}`;
      }
      const timestamp = new Date(msg.timestamp).toLocaleString();
      return `${timestamp} - ${senderName}: ${msg.content}`;
    }).join('\n');

    const blob = new Blob([formattedMessages], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const prenom = this.selectedUser?.prenom ?? 'utilisateur';
    const nom = this.selectedUser?.nom ?? 'inconnu';
    a.download = `chat_${prenom}_${nom}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }




 // Méthodes pour les groupes




 





minimizeGroupChat(): void {
    if (this.expandedGroupChatId) {
        const chat = this.activeGroupChats.find(c => c.group._id === this.expandedGroupChatId);
        if (chat) {
            chat.isExpanded = false;
        }
        this.expandedGroupChatId = '';
    }
}

closeGroupChat(groupId: string): void {
    this.activeGroupChats = this.activeGroupChats.filter(c => c.group._id !== groupId);
    if (this.expandedGroupChatId === groupId) {
        this.expandedGroupChatId = '';
        this.selectedGroup = null;
    }
    // Quitter le groupe via socket si nécessaire
    this.postService.emit('leave-group', { groupId });
}






// Méthodes utilitaires
getGroupImage(group: Group): string {
    if (group.creator && group.creator.profileImage) {
        return this.getProfileImageUrl(group.creator.profileImage);
    }
    return 'assets/profil.png';
}

getTypingUsersText(users: User[]): string {
    if (users.length === 1) {
        return `${users[0].prenom} écrit...`;
    }
    if (users.length === 2) {
        return `${users[0].prenom} et ${users[1].prenom} écrivent...`;
    }
    return `${users.length} personnes écrivent...`;
}

onGroupTyping(): void {
   
}



 


  // Méthode pour faire défiler vers le

  //*******************************GROUP********************** */


loadGroups(): void {
    // You need to fetch the list of groups first, then for each group, fetch its messages if needed.
    // Here, just load the groups list (assuming you have a method for that).
    // If you want to load messages for each group, loop through the groups and call getGroupMessages(group._id).
    // For now, let's assume you want to load the groups list only.
    this.postService.getUserGroups(this.currentUserId).subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.groups = [];
      }
    });
  }

async openGroupChat(group: Group): Promise<void> {
    console.log(`Opening group chat for group ${group._id} as user ${this.currentUser?._id}`);
    await this.postService.joinGroup(group._id!);
    const existingChat = this.activeGroupChats.find(c => c.group._id === group._id);

    if (existingChat) {
      this.expandGroupChat(group._id!);
      return;
    }

    this.activeGroupChats.push({
      group,
      isExpanded: true,
      unreadCount: 0,
      groupMessages: []
    });

    this.selectedGroup = group;
    this.expandedGroupChatId = group._id!;
    await this.loadGroupMessages(group._id!);
  }

async loadGroupMessages(groupId: string): Promise<void> {
    console.log(`Loading messages for group ${groupId}`);
    try {
      this.groupMessages = await this.postService.getGroupMessages(groupId);
      this.scrollToBottom('groupMessagesContainer');
    } catch (error) {
      console.error('Failed to load group messages:', error);
    }
  }

expandGroupChat(groupId: string): void {
    console.log(`Expanding group chat for group ${groupId}`);
    const chat = this.activeGroupChats.find(c => c.group._id === groupId);
    if (chat) {
      chat.isExpanded = true;
      chat.unreadCount = 0;
      this.selectedGroup = chat.group;
      this.expandedGroupChatId = groupId;
      this.groupMessages = chat.groupMessages || [];
      this.loadGroupMessages(groupId); // Recharger les messages
      this.scrollToBottom('groupMessagesContainer');
    }
  }
async sendMessageGroup() {
  if (!this.groupMessageContent.trim() || !this.selectedGroup || !this.currentUser) {
    return;
  }

  try {
    await this.postService.sendGroupMessage({
      groupId: this.selectedGroup._id,
      content: this.groupMessageContent,
      senderId: this.currentUser._id!
    });
    
    this.groupMessageContent = '';
    this.scrollToBottom('groupMessagesContainer');
  } catch (error) {
    console.error('Échec de l\'envoi:', error);
    this.showError('Échec de l\'envoi du message');
  }
 this.groupMessageContent = '';
}
// Gestion des messages entrants corrigée
private setupSocketListenersGroup() {
  this.messageSubscription = this.postService.onNewGroupMessage().subscribe({
    next: (message) => {
      if (message.groupId === this.selectedGroup?._id) {
        this.groupMessages.push({
          _id: message._id,
          content: message.content,
          sender: message.senderId,
          timestamp: message.timestamp,
          isCurrentUser: message.senderId === this.currentUser?._id
        });
        this.cdr.detectChanges();
        this.scrollToBottom('groupMessagesContainer');
      }
    },
    error: (err) => console.error('Erreur socket:', err)
  });
}
// Simple error display method
showError(message: string): void {
  alert(message);
}
//**********************************REACTIONS********************************* */



// Dans votre composant
activeReactionMenu: string | null = null;

reactionTypes = [
  { type: 'like', emoji: '👍', label: 'J\'aime' },
  { type: 'love', emoji: '❤️', label: 'J\'adore' },
  { type: 'haha', emoji: '😂', label: 'Haha' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'sad', emoji: '😢', label: 'Triste' },
  { type: 'angry', emoji: '😠', label: 'Grrr' }
];

toggleReactionMenu(postId: string) {
  this.activeReactionMenu = this.activeReactionMenu === postId ? null : postId;
}



getReactionColorClass(post: any): any {
  const reaction = post.likes?.find((r: any) => r.userId === this.currentUser?._id);
  if (!reaction) return {};
  
  return {
    'text-blue-500': reaction.type === 'like',
    'text-red-500': reaction.type === 'love',
    'text-yellow-500': ['haha', 'wow', 'sad'].includes(reaction.type),
    'text-orange-500': reaction.type === 'angry'
  };
}


showReactionsFor: string | null = null;





setReaction(post: any, reactionType: string) {
  // Sauvegarde de l'état original pour rollback si besoin
  const originalLikes = [...(post.likes || [])];

  // Mise à jour immédiate de l'UI avant la requête API (votre code existant)
  const userReaction = {
    userId: this.currentUser!._id,
    type: reactionType,
    date: new Date()
  };

  if (this.hasUserReacted(post)) {
    post.likes = post.likes.map((reaction: any) => 
      reaction.userId === this.currentUser!._id ? userReaction : reaction
    );
  } else {
    post.likes = [...(post.likes || []), userReaction];
  }

  // Envoi de la requête API (votre code existant)
  this.postService.reactToPost(post._id, reactionType).subscribe({
    next: (updatedPost) => {
      // 1. On garde votre synchronisation existante
      post.likes = updatedPost.likes;
      
      // 2. Ajout du rafraîchissement automatique
      setTimeout(() => {
        this.postService.getPostById(post._id).subscribe(freshPost => {
          // Mise à jour en profondeur sans perdre les références
          Object.assign(post, freshPost);
        });
      }, 1000); // Délai ajustable (1000ms = 1s)
    },
    error: (err) => {
      console.error('Erreur API:', err);
      // Rollback UI (votre code existant)
      post.likes = originalLikes;
    }
  });
}

// Gestion de l'affichage des réactions
keepReactionsVisible() {
  // Ne rien faire, garde simplement le menu visible
}

hideReactions() {
  setTimeout(() => {
    this.showReactionsFor = null;
  }, 300);
}


// Dans votre composant
getUniqueReactions(post: any): any[] {
    if (!post.likes) return [];
    const reactionsMap = new Map();
    post.likes.forEach((reaction: any) => {
        reactionsMap.set(reaction.type, {
            type: reaction.type,
            count: (reactionsMap.get(reaction.type)?.count || 0) + 1
        });
    });
    return Array.from(reactionsMap.values());
}

getReactionUsers(post: any, type: string): string[] {
    if (!post.likes) return [];
    return post.likes
        .filter((r: any) => r.type === type)
        .map((r: any) => r.userId?.name || 'Anonyme');
}

getReactionEmoji(type: string): string {
    const found = this.reactionTypes.find(rt => rt.type === type);
    return found ? found.emoji : '👍';
}


handleReactionClick(post: any) {
  // Si l'utilisateur a déjà réagi, on supprime sa réaction
  if (this.hasUserReacted(post)) {
    this.removeReaction(post);
  } else {
    // Sinon on ajoute un like par défaut
    this.setReaction(post, 'like');
  }
}

hasUserReacted(post: any): boolean {
  if (!post.likes || !this.currentUser) return false;
  return post.likes.some((reaction: any) => 
    this.currentUser && reaction.userId === this.currentUser._id
  );
}

removeReaction(post: any) {
  this.postService.removeReaction(post._id).subscribe({
    next: (updatedPost) => {
      // Mettre à jour le post dans votre liste
      const index = this.posts.findIndex(p => p._id === post._id);
      if (index !== -1) {
        this.posts[index] = updatedPost;
      }
    },
    error: (err) => {
      console.error('Erreur lors de la suppression:', err);
    }
  });
}
  


// Retourne le type de réaction de l'utilisateur courant
getCurrentReactionType(post: any): string | null {
  if (!post.likes || !this.currentUser) return null;
  const reaction = post.likes.find((r: any) => this.currentUser && r.userId === this.currentUser._id);
  return reaction?.type || null;
}

// Retourne l'emoji correspondant à la réaction actuelle
getCurrentReactionEmoji(post: any): string {
  const type = this.getCurrentReactionType(post);
  const reaction = this.reactionTypes.find(rt => rt.type === type);
  return reaction?.emoji || '👍';
}

// Retourne le label approprié
getReactionLabel(post: any): string {
  if (!post.likes?.length) return 'J\'aime';
  
  const type = this.getCurrentReactionType(post);
  if (type) {
    return this.reactionTypes.find(rt => rt.type === type)?.label || 'J\'aime';
  }
  
  return post.likes.length === 1 
    ? '1 réaction' 
    : `${post.likes.length} réactions`;
}









// Unifier la gestion des réactions
async handleReaction(post: any, reactionType?: string) {
  try {
    // Si pas de type spécifié et que l'utilisateur a déjà réagi, on supprime
    if (!reactionType && this.hasUserReacted(post)) {
      await this.removeReaction(post);
      return;
    }
    
    // Si pas de type spécifié, on met like par défaut
    const typeToApply = reactionType || 'like';
    await this.applyReaction(post, typeToApply);
  } catch (error) {
    console.error('Erreur de réaction:', error);
  } finally {
    this.activeReactionMenu = null;
  }
}

// Version améliorée de applyReaction
 async applyReaction(post: any, reactionType: string) {
  // Sauvegarde pour rollback
  const originalLikes = [...(post.likes || [])];
  
  // Optimistic UI update
  this.updatePostReactionOptimistically(post, reactionType);
  
  try {
    const updatedPost = await this.postService.reactToPost(post._id, reactionType).toPromise();
    
    // Mise à jour immédiate
    this.updatePostInList(updatedPost);
    
    // Rafraîchissement différé pour synchronisation serveur
    setTimeout(() => this.refreshPost(post._id), 500);
  } catch (error) {
    console.error('Erreur API:', error);
    // Rollback
    post.likes = originalLikes;
    if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 401) {
      this.router.navigate(['/login']);
    }
  }
}

private updatePostReactionOptimistically(post: any, reactionType: string) {
  const userReaction = {
    userId: this.currentUser!._id,
    type: reactionType,
    date: new Date()
  };

  if (this.hasUserReacted(post)) {
    post.likes = post.likes.map((reaction: any) => 
      reaction.userId === this.currentUser!._id ? userReaction : reaction
    );
  } else {
    post.likes = [...(post.likes || []), userReaction];
  }
}

private updatePostInList(updatedPost: any) {
  const index = this.posts.findIndex(p => p._id === updatedPost._id);
  if (index !== -1) {
    // Mise à jour en profondeur pour conserver les références
    Object.assign(this.posts[index], updatedPost);
  }
}

// Méthode pour rafraîchir un post
refreshPost(postId: string) {
  this.postService.getPostById(postId).subscribe({
    next: (updatedPost) => {
      this.updatePostInList(updatedPost);
    },
    error: (err) => {
      console.error('Erreur de rafraîchissement:', err);
    }
  });
}
//************************Creer un nouveau group ********************************** */



 


 addMemberToGroup(groupId: string): void {
    const newMemberId = prompt("email du nouveau membre :");
    if (!newMemberId?.trim()) return;

    this.subscriptions.push(
      this.postService.addMember(groupId, newMemberId).subscribe({
        next: () => this.loadGroups(),
        error: (error) => {
          console.error("Error adding member:", error);
          alert("l'utilisateur déjà membre du groupe");
        },
      }),
    );
  }
openCreateGroupModal() {
    this.showCreateGroupModal = true;
    this.newGroupName = '';
    this.tempEmail = '';
    this.tempUsers = [];
  }

  closeCreateGroupModal() {
    this.showCreateGroupModal = false;
    this.newGroupName = '';
    this.tempEmail = '';
    this.tempUsers = [];
  }

addUserToTempList() {
  if (!this.tempEmail) {
    alert('Veuillez entrer un email.');
    return;
  }

  const normalizedEmail = this.tempEmail.trim().toLowerCase();
  console.log('Email saisi (normalisé) :', normalizedEmail); // Log pour déboguer

  // Vérifier si l'email existe déjà dans la liste temporaire
  if (this.tempUsers.some(user => user.email === normalizedEmail)) {
    alert('Cet email a déjà été ajouté.');
    return;
  }

  // Vérifier si l'email existe dans la base de données
  this.groupService.getUserByEmail(normalizedEmail).subscribe(
    (user) => {
      console.log('Utilisateur trouvé (frontend) :', user); // Log pour déboguer
      if (user && user._id) {
        this.tempUsers.push({ email: normalizedEmail, id: user._id });
        this.tempEmail = ''; // Réinitialiser le champ email
      } else {
        alert('Utilisateur non trouvé avec cet email.');
      }
    },
    (error) => {
      console.error('Erreur lors de la recherche de l\'utilisateur (frontend) :', error);
      alert('Utilisateur non trouvé avec cet email.');
    }
  );
}
  removeUserFromTempList(email: string) {
    this.tempUsers = this.tempUsers.filter(user => user.email !== email);
  }

  createGroup() {
    if (!this.newGroupName) {
      alert('Veuillez entrer un nom pour le groupe.');
      return;
    }

    if (this.tempUsers.length < 3) {
      alert('Vous devez ajouter au moins 3 utilisateurs pour créer un groupe.');
      return;
    }

    if (!this.currentUserId) {
      alert('Utilisateur non authentifié. Veuillez vous connecter.');
      return;
    }

    const groupData = {
      name: this.newGroupName,
      creator: this.currentUserId,
      members: this.tempUsers.map(user => user.id),
      admins: [this.currentUserId],
      
    };

    this.http.post('http://localhost:3000/group/create', groupData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(
      (response: any) => {
        console.log('Groupe créé avec succès :', response.group);
        this.groups.push(response.group);
        this.closeCreateGroupModal();
        this.showModal = true; // Afficher le modale de confirmation
      },
      (error) => {
        console.error('Erreur lors de la création du groupe :', error);
        alert('Erreur lors de la création du groupe.');
      }
    );
  }

  closeModal() {
    this.showModal = false;
    this.newGroupName = '';
    this.tempUsers = [];
  }

  //********************UPDATE DELET POST BY USER CREATED ************* */

  // Variables de classe
activePostMenu: string | null = null;
editingPost: any = null;
editPostForm = { titre: '', contenu: '' };

// Vérifie si l'utilisateur courant est l'auteur du post
isPostAuthor(post: any): boolean {
  return !!(this.currentUser && post.idAuteur._id === this.currentUser._id);
}

// Gère l'affichage du menu
togglePostMenu(postId: string): void {
  this.activePostMenu = this.activePostMenu === postId ? null : postId;
}

// Commence l'édition d'un post
startEditPost(post: any): void {
  this.editingPost = post;
  this.editPostForm = {
    titre: post.titre,
    contenu: post.contenu
  };
  this.activePostMenu = null; // Ferme le menu
}

// Annule l'édition
cancelEdit(): void {
  this.editingPost = null;
}

// Sauvegarde les modifications
saveEditedPost(): void {
  if (!this.editingPost) return;

  this.postService.updatePost(this.editingPost._id, this.editPostForm).subscribe({
    next: (updatedPost) => {
      const index = this.posts.findIndex(p => p._id === updatedPost._id);
      if (index !== -1) {
        this.posts[index] = {
          ...this.posts[index],
          titre: updatedPost.titre,
          contenu: updatedPost.contenu
        };
      }
      this.editingPost = null;
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour:', err);
    }
  });
}

// Confirme la suppression
confirmDeletePost(postId: string): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
    this.deletePost(postId);
  }
  this.activePostMenu = null;
}

// Supprime le post
deletePost(postId: string): void {
  this.postService.deletePost(postId).subscribe({
    next: () => {
      this.posts = this.posts.filter(post => post._id !== postId);
    },
    error: (err) => {
      console.error('Erreur lors de la suppression:', err);
    }
  });
}



//user nom prenom


private loadUserData(userId: string): Observable<any> {
  return this.userService.getUserById(userId).pipe(
    map(user => ({
      _id: userId,
      nom: user?.nom || user?.name || 'Utilisateur',
      prenom: user?.prenom || user?.firstName || 'Inconnu',
      profileImage: user?.profileImage || 'assets/profil.png'
    })),
    catchError(() => of({
      _id: userId,
      nom: 'Utilisateur',
      prenom: 'Inconnu',
      profileImage: 'assets/profil.png'
    }))
  );
}

private loadPostsWithUserData(): void {
  this.subscriptions.push(
    this.postService.getPosts().pipe(
      switchMap(posts => {
        const postsWithUsers$ = posts.map(post => {
          const userId = typeof post.idAuteur === 'object' ? post.idAuteur._id : post.idAuteur;
          return this.loadUserData(userId).pipe(
            map(user => ({
              ...post,
              idAuteur: user,
              date_creation: new Date(post.date_creation).toISOString()
            }))
          );
        });
        return forkJoin(postsWithUsers$);
      })
    ).subscribe({
      next: (posts) => {
        this.posts = posts;
        console.log('Posts with user data:', this.posts);
      },
      error: (error) => {
        console.error('Error loading posts:', error);
      }
    })
  );
}

//*******************************SEARCH MESSAGE********************* */
// Ajoutez ces propriétés à votre composant
searchQuery: string = '';
filteredMessages: any[] = [];
filterMessages() {
    if (!this.searchQuery.trim()) {
        this.filteredMessages = this.messages ? [...this.messages] : [];
        return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredMessages = (this.messages || []).filter(message => {
        const content = message.content?.toLowerCase() || '';
        const senderName = message.sender === this.currentUser?._id 
            ? 'vous' 
            : this.selectedUser?.prenom?.toLowerCase() || '';
        return content.includes(query) || senderName.includes(query);
    });
}
// Ajoutez cette méthode au composant
highlightText(text: string): string {
    if (!this.searchQuery.trim()) return text;
    
    const query = this.searchQuery.toLowerCase();
    return text.replace(new RegExp(query, 'gi'), match => 
        `<span class="highlight search-match">${match}</span>`
    );
}
// Méthode pour charger les messages entre deux utilisateurs
loadMessages(userId1: string, userId2: string): void {
  this.postService.getMessagesBetweenUsersDirect(userId1, userId2).subscribe({
    next: (response) => {
      this.messages = response.map((msg: any) => ({
        ...msg,
        sender: msg["expediteurId"]._id,
        content: msg['contenu'],
        timestamp: msg['dateEnvoi']
      }));
      this.filterMessages(); // Appel après avoir reçu et formaté les messages
    },
    error: (err) => {
      console.error('Erreur lors du chargement des messages:', err);
    }
  });
}


highlightSearch(text: string): SafeHtml {
    if (!this.searchQuery?.trim()) {
      return text;
    }
    
    const searchRegex = new RegExp(this.searchQuery, 'gi');
    return this.sanitizer.bypassSecurityTrustHtml(
      text.replace(searchRegex, match => 
        `<span class="bg-yellow-100 text-gray-900 px-0.5 rounded">${match}</span>`
      )
    );
  }
  //**************emojie message*************
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onEmojiClick(event: any) {
    this.messageContent += event.emoji.native; // Add emoji to input
    this.showEmojiPicker = false; // Close picker
  }




  

  }