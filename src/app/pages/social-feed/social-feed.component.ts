// src/app/pages/social-feed/social-feed.component.ts
import { Component, type OnInit, type OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Post, Comment, Group, Message } from "../../models/post.models"
import type { User } from "../../models/user.model"
import { UserService } from "../../services/user.service"
import { PostService } from "../../services/post.service"
import type { Subscription } from "rxjs"
import { forkJoin, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http"


@Component({
  selector: "app-social-feed",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./social-feed.component.html",
  styleUrls: ["./social-feed.component.scss"],
})
export class SocialFeedComponent implements OnInit, OnDestroy {

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
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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

          const userRequests = posts.map((post) =>
            this.userService.getUserById((post.idAuteur as any)?._id || post.idAuteur).pipe(
              map((user) => ({
                post,
                user: user || {
                  _id: (post.idAuteur as any)?._id || post.idAuteur || 'unknown',
                  nom: post.idAuteur?.nom || 'Utilisateur',
                  prenom: post.idAuteur?.prenom || 'Inconnu',
                  profileImage: 'https://i.pravatar.cc/150?u=default',
                },
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
              console.error('Error fetching user data:', error);
              this.posts = posts.map((post) => ({
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
            },
          });
        },
        error: (error) => {
          console.error('Error loading posts:', error);
          alert('Erreur lors du chargement des posts');
        },
      })
    );
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
          this.resetPostForm();
        },
        error: (error) => this.handlePostError(error),
      }),
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
    console.log('Email saisi (normalisé) :', normalizedEmail);

    if (this.tempUsers.some(user => user.email === normalizedEmail)) {
      alert('Cet email a déjà été ajouté.');
      return;
    }

    this.postService.getUserByEmail(normalizedEmail).subscribe(
      (user) => {
        console.log('Utilisateur trouvé (frontend) :', user);
        if (user && user._id) {
          this.tempUsers.push({ email: normalizedEmail, id: user._id });
          this.tempEmail = '';
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
        this.showModal = true;
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
   // Méthode pour charger les messages entre deux utilisateurs
  loadMessages(userId1: string, userId2: string): void {
    this.postService.getMessagesBetweenUsersDirect(userId1, userId2).subscribe({
      next: (response) => {
        this.messages = response;
        // Formater les messages si nécessaire
        this.messages = this.messages.map(msg => ({
          ...msg,
          sender: msg["expediteurId"]._id,
          content: msg['contenu'],
          timestamp: msg['dateEnvoi']
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des messages:', err);
      }
    });
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


// Dans votre composant




// Obtenir la réaction de l'utilisateur courant
getCurrentUserReaction(post: any): any {
    if (!this.currentUser || !this.currentUser._id || !post.likes) return null;
    return post.likes.find((like: any) => like.userId === this.currentUser!._id);
}

// Gérer une réaction
handleReaction(post: any, reactionType: string) {
    const currentReaction = this.getCurrentUserReaction(post);
    
    // Si l'utilisateur clique sur sa réaction actuelle, on la supprime
    if (currentReaction && currentReaction.type === reactionType) {
        this.postService.removeReaction(post._id).subscribe(updatedPost => {
            // Mettre à jour le post
        });
    } 
    // Sinon on ajoute/modifie la réaction
    else {
        this.postService.addReaction(post._id, reactionType).subscribe(updatedPost => {
            // Mettre à jour le post
        });
    }
}

// Obtenir le résumé des réactions (top 3)
getReactionSummary(post: any): any[] {
    if (!post.likes || post.likes.length === 0) return [];
    
    const reactionCounts: any = {};
    post.likes.forEach((like: any) => {
        reactionCounts[like.type] = (reactionCounts[like.type] || 0) + 1;
    });
    
    return Object.entries(reactionCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([type, count]) => ({ type, count }));
}

// Obtenir le nombre total de réactions
getTotalReactions(post: any): number {
    return post.likes?.length || 0;
}



    
    addReaction(postId: string, reactionType: string) {
        return this.http.post(`/api/posts/${postId}/react`, { type: reactionType });
    }
    
   


    getReactionIcon(reactionType: string): string {
  // Chemin de base pour les icônes de réactions
  const basePath = '/assets/reactions/';
  
  // Mapping des types de réactions vers leurs icônes
  const reactionIcons: {[key: string]: string} = {
    'like': `${basePath}like.png`,
    'love': `${basePath}love.png`,
    'haha': `${basePath}haha.png`,
    'wow': `${basePath}wow.png`,
    'sad': `${basePath}sad.png`,
    'angry': `${basePath}angry.png`
  };

  return reactionIcons[reactionType] || `${basePath}like.png`;
}


// Pour capitaliser la première lettre (utilisé dans le bouton)
capitalizeFirstLetter(string: string): string {
 return string.charAt(0).toUpperCase() + string.slice(1);
}








// Obtenir le SVG d'une réaction



// Obtenir le nombre total de réactions
getReactionCount(post: any): number {
    return post.likes?.length || 0;
}

// Obtenir les 3 réactions principales
getTopReactions(post: any): any[] {
    if (!post.likes || post.likes.length === 0) return [];
    
    const reactionCounts: any = {};
    post.likes.forEach((like: any) => {
        reactionCounts[like.type] = (reactionCounts[like.type] || 0) + 1;
    });
    
    return Object.entries(reactionCounts)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 3)
        .map(([type, count]) => ({ type, count }));
}

// Basculer la réaction






// Dans votre composant


showReactionMenu: string | null = null;

// Obtenir l'icône SVG de la réaction actuelle
getCurrentReactionIcon(post: any): string {
    const reaction = this.getUserReaction(post);
    return this.getReactionSvg(reaction || 'like', '20');
}

// Obtenir le libellé à afficher


// Obtenir le SVG d'une réaction
getReactionSvg(type: string, size: string = '24'): string {
    const svgs: {[key: string]: string} = {
        'like': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="#04789d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                </svg>`,
        'love': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#f33e58" stroke="#f33e58" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"></path>
                </svg>`,
        // Ajouter les autres SVG pour chaque type de réaction
    };
    return svgs[type] || svgs['like'];
}

// Basculer la réaction
toggleReaction(post: any) {
    const currentReaction = this.getUserReaction(post);
    if (currentReaction) {
        this.removeReaction(post);
    } else {
        this.setReaction(post, 'like');
    }
}



// Supprimer une réaction
removeReaction(post: { _id: string; likes: any[] }) {
    this.postService.removeReaction(post._id).subscribe(
        (updatedPost: any) => {
            // Mettre à jour le post dans votre state/store
            if (updatedPost && updatedPost.likes) {
                post.likes = updatedPost.likes;
            }
        },
        (err: any) => {
            console.error('Erreur lors de la suppression de la réaction:', err);
        }
    );
}




// Dans votre composant


// Obtenir l'emoji de la réaction actuelle


handleReactionClick(post: any) {
    if (!this.showReactionsFor) {
        // Si le menu n'est pas visible, basculer like/unlike
        const currentReaction = this.getUserReaction(post);
        if (currentReaction) {
            this.removeReaction(post);
        } else {
            this.setReaction(post, 'like');
        }
    }
}
//updateeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee


































// Dans votre composant
reactionTypes = [
    { type: 'like', label: 'J\'aime', emoji: '👍', color: '#1877F2' },
    { type: 'love', label: 'Love', emoji: '❤️', color: '#F33E58' },
    { type: 'haha', label: 'Haha', emoji: '😂', color: '#F7B125' },
    { type: 'wow', label: 'Wow', emoji: '😯', color: '#F7B125' },
    { type: 'sad', label: 'Triste', emoji: '😢', color: '#F7B125' },
    { type: 'angry', label: 'En colère', emoji: '😡', color: '#E9710F' }
];

showReactionsFor: string | null = null;
reactionTimeout: any = null;

// Obtenir l'emoji de la réaction actuelle
getCurrentReactionEmoji(post: any): string {
    const reaction = this.getUserReaction(post);
    const foundReaction = this.reactionTypes.find(r => r.type === reaction);
    return foundReaction ? foundReaction.emoji : '👍';
}

// Obtenir le libellé de la réaction
getReactionLabel(post: any): string {
    const reaction = this.getUserReaction(post);
    return reaction ? this.reactionTypes.find(r => r.type === reaction)?.label || 'J\'aime' : 'J\'aime';
}

// Garder le menu visible
keepReactionsVisible() {
    if (this.reactionTimeout) {
        clearTimeout(this.reactionTimeout);
    }
    this.showReactionsFor = this.post._id;
}

// Cacher le menu avec délai
hideReactions() {
    this.reactionTimeout = setTimeout(() => {
        this.showReactionsFor = null;
    }, 300);
}



// Vérifier si l'utilisateur a réagi
hasUserReacted(post: any, type: string): boolean {
    if (!this.currentUser || !post.likes) return false;
    return post.likes.some((like: any) => 
        this.currentUser && like.userId === this.currentUser._id && like.type === type
    );
}

// Obtenir la réaction de l'utilisateur
getUserReaction(post: any): string | null {
    if (!this.currentUser || !post.likes) return null;
    const reaction = post.likes && this.currentUser ? post.likes.find((like: any) => like.userId === this.currentUser!._id) : null;
    return reaction ? reaction.type : null;
}








startHideReactionsTimer() {
  this.reactionTimeout = setTimeout(() => {
    this.showReactionsFor = null;
  }, 300);
}

// Nouvelle méthode pour annuler le timer
cancelHideReactionsTimer() {
  if (this.reactionTimeout) {
    clearTimeout(this.reactionTimeout);
  }
}

// Méthode setReaction corrigée
setReaction(post: Post, type: string) {
  console.log('Tentative de réaction:', {postId: post._id, type});
  
  if (!post._id) {
    console.error('post._id is undefined, cannot add reaction.');
    return;
  }
  this.postService.addReaction(post._id, type).subscribe(
    (updatedPost: any) => {
      console.log('Réponse du serveur:', updatedPost);
      
      // 1. Trouver l'index du post dans votre tableau
      const postIndex = this.posts.findIndex(p => p._id === post._id);
      
      // 2. Mettre à jour le post spécifique
      if (postIndex !== -1) {
        this.posts[postIndex] = { 
          ...this.posts[postIndex], 
          likes: updatedPost.likes 
        };
        
        // 3. Déclencher le changement (si nécessaire)
        this.posts = [...this.posts]; // Crée une nouvelle référence
      }
      
      // 4. Fermer le menu des réactions
      this.showReactionsFor = null;
    },
    (err) => {
      console.error('Erreur:', err);
      // Gérer l'erreur visuellement
    }
  );
}
// Le reste des méthodes (getUserReaction, hasUserReacted, etc.) reste identique


 


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


  

  }