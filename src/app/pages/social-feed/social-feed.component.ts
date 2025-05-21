// src/app/pages/social-feed/social-feed.component.ts
import { Component, type OnInit, type OnDestroy, ChangeDetectorRef } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import type { Post, Comment, Group, Message } from "../../models/post.models"
import type { User } from "../../models/user.model"
import { UserService } from "../../services/user.service"
import { PostService } from "../../services/post.service"
import type { Subscription } from "rxjs"
import { forkJoin } from 'rxjs';
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
    this.checkServerConnection();
    this.loadCurrentUser();
    this.currentUserId = localStorage.getItem('userId') || '';
    this.loadPosts();
    this.loadUsers();
    this.loadGroups();
    this.listenForTyping();

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



  private handleGroupsResponse(groups: Group[], userId: string): void {
    const group = groups.find((g) => userId && g.members.includes(userId));
    if (group?._id) {
      this.loadMessages(group._id);
    } else {
      this.messages = [];
    }
  }

  private loadMessages(groupId: string): void {
    this.subscriptions.push(
      this.postService.getConversationMessages(groupId).subscribe({
        next: (messages) => {
          this.messages = messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp).toISOString(),
          }));
        },
        error: () => (this.messages = []),
      }),
    );
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

  toggleReaction(messageId: string, reaction: string): void {
    if (!this.currentUser?._id) return;

    this.subscriptions.push(
      this.postService.toggleReaction(messageId, this.currentUser._id, reaction).subscribe({
        next: () => {
          if (this.selectedUser) {
            this.selectUser(this.selectedUser);
          }
        },
        error: (error) => {
          console.error("Error toggling reaction:", error);
          alert("Error toggling reaction");
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

  loadGroups() {
    this.http.get<any[]>('http://localhost:3000/group/getallGroupByUser', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).subscribe(
      (data: any[]) => {
        this.groups = data;
        console.log('Groupes chargés :', data);
      },
      (error: any) => {
        console.error('Erreur lors du chargement des groupes :', error);
      }
    );
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

    if (!token || !userId) {
      console.warn("Token ou UserID manquant, redirection vers /login");
      window.location.href = "/login";
      return;
    }

    const prenom = this.getSanitizedLocalStorageItem("prenom");
    const nom = this.getSanitizedLocalStorageItem("nom");
    const email = localStorage.getItem("email") || "email@inconnu.com";
    const profileImage = this.getValidImageUrl(localStorage.getItem("profileImage"));
    const role = localStorage.getItem("role") || "user";

    this.currentUser = {
      _id: userId,
      nom: nom || "Utilisateur",
      prenom: prenom || "Inconnu",
      profileImage,
      email,
      role,
    };

    this.validateUserData();

    console.debug("Utilisateur chargé:", {
      id: this.currentUser._id,
      prenom: this.currentUser.prenom,
      nom: this.currentUser.nom,
      email: this.currentUser.email,
      role: this.currentUser.role,
      profileImage: this.currentUser.profileImage,
    });
  }



  selectUser(user: User): void {
    if (user._id === this.currentUser?._id || !this.currentUser?._id) return;

    this.selectedUser = user;
    this.messages = [];
    this.currentUserId = this.currentUser._id;

    if (!user._id) {
      console.error('Selected user ID is undefined');
      return;
    }

    this.postService.connect(this.currentUserId);
    this.setupSocketListeners();

    const conversationId = this.getConversationId();
    if (conversationId) {
      this.postService.joinConversation(conversationId);
    }

    this.loadConversation(user._id);
  }

  private getConversationId(): string {
  if (!this.selectedUser || !this.currentUserId) return '';
  const id = [this.currentUserId, this.selectedUser._id].sort().join('_');
  console.log('Generated conversation ID:', id);
  return id;
}

  private loadConversation(userId: string): void {
    const conversationId = this.getConversationId();
    if (conversationId) {
      this.subscriptions.push(
        this.postService.getConversationMessages(conversationId).subscribe({
          next: (messages) => {
            this.messages = messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp).toISOString(),
            }));
            console.log('Messages loaded:', this.messages);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error loading messages:', error);
            this.messages = [];
          },
        })
      );
    }
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
          content: msg.contenu,
          timestamp: msg.dateEnvoi || new Date().toISOString(),
          conversationId: msgConversationId
        });
        this.cdr.detectChanges();
        console.log('Message added to UI:', this.messages);
      }
    });
  }

  sendMessage(): void {
    if (!this.validateMessage()) return;

    const message: Message = {
      _id: Date.now().toString(),
      sender: this.currentUser!._id!,
      conversationId: this.getConversationId(),
      content: this.messageContent,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', {
      destinataireId: this.selectedUser!._id,
      contenu: this.messageContent
    });

    this.messages.push(message);
    this.postService.sendMessage(this.selectedUser!._id!, this.messageContent);
    this.messageContent = '';
    this.cdr.detectChanges();
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
}