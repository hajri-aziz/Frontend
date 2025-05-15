// src/app/pages/social-feed/social-feed.component.ts
import { Component, type OnInit, type OnDestroy } from "@angular/core"
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


  
  currentUser: User | null = null
  posts: Post[] = []
  newPost: Partial<Post> = { titre: "", contenu: "" }
  newCommentContents: { [postId: string]: string } = {}
  selectedFile: File | null = null
  imagePreview: string | null = null
  users: User[] = []
  selectedUser: User | null = null
  messages: Message[] = []
  messageContent = ""
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

  constructor(
    private postService: PostService,
    private userService: UserService,
    private groupService: PostService, // Remplacez par le
    private http: HttpClient,
  ) {}

  // Ajoutez cette méthode pour vérifier si le serveur est accessible
  private checkServerConnection(): void {
    this.postService.getPosts().subscribe({
      next: () => {
        console.log("Connexion au serveur établie")
      },
      error: (error) => {
        console.error("Erreur de connexion au serveur:", error)
        alert(
          "Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution sur http://localhost:3000",
        )
      },
    })
  }

  // Modifiez ngOnInit pour appeler cette méthode
  ngOnInit() {
   this.checkServerConnection();
    this.loadCurrentUser();
    this.currentUserId = localStorage.getItem('userId') || '';
    this.loadPosts();
    this.loadUsers();
    this.loadGroups();
    this.verifyUserData();

    console.log('Users initial:', this.users); // Vérifiez dans la console
    // Si vous récupérez les utilisateurs via un service ou une API :
    this.userService.getAllUsers().subscribe(data => {
     this.users = data;
      console.log('Users loaded:', this.users); // Vérifiez après chargement
    });
    this.loadGroups()
    this.verifyUserData()
    console.log("Vérification des données utilisateur terminée")
    console.log("Current User après vérification:", this.currentUser) // Vérifiez les données
    this.checkServerConnection()
    this.loadUser()
    console.log("Vérification de la connexion au serveur terminée")
    console.log("Vérification de la connexion au serveur terminée")
    this.checkServerConnection()
    console.log("Vérification de la connexion au serveur terminée")
    this.checkServerConnection()
  }

  // Ajoutez cette méthode pour vérifier les données utilisateur

  private loadCurrentUser(): void {
    // 1. Vérification des éléments essentiels
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    if (!token || !userId) {
      console.warn("Token ou UserID manquant, redirection vers /login")
      window.location.href = "/login"
      return
    }

    // 2. Chargement avec validation complète
    this.currentUser = {
      _id: userId,
      nom: this.getSanitizedLocalStorageItem("nom"),
      prenom: this.getSanitizedLocalStorageItem("prenom"),
      profileImage: this.getValidImageUrl(localStorage.getItem("profileImage")),
      email: localStorage.getItem("email") || "",
      role: localStorage.getItem("role") || "user",
    }

    // 3. Validation finale et fallback
    this.validateUserData()
    console.debug("Utilisateur chargé:", this.currentUser)
  }

  private getSanitizedLocalStorageItem(key: string): string {
    try {
      const value = localStorage.getItem(key)

      // Vérification approfondie
      if (
        typeof value === "string" &&
        value.trim() !== "" &&
        !["null", "undefined", "NaN"].includes(value.toLowerCase())
      ) {
        return value.trim()
      }
      return ""
    } catch (error) {
      console.error(`Erreur de lecture du localStorage pour ${key}:`, error)
      return ""
    }
  }

  private getValidImageUrl(imageUrl: string | null): string {
    const defaultImage = "https://i.pravatar.cc/150?img=1"

    if (!imageUrl) return defaultImage

    try {
      new URL(imageUrl) // Valide que c'est une URL valide
      return imageUrl
    } catch {
      return defaultImage
    }
  }

  private validateUserData(): void {
    if (!this.currentUser) {
      console.error("Erreur: currentUser est null")
      return
    }

    // Fallback intelligent
    if (!this.currentUser.nom && !this.currentUser.prenom) {
      const emailPrefix = this.currentUser.email.split("@")[0]
      this.currentUser = {
        ...this.currentUser,
        nom: emailPrefix || "Utilisateur",
        prenom: "",
      }
      console.warn("Utilisation du fallback email pour le nom")
    } else if (!this.currentUser.nom) {
      this.currentUser.nom = this.currentUser.prenom
      this.currentUser.prenom = ""
    }

    // Validation des types
    if (typeof this.currentUser.nom !== "string") {
      this.currentUser.nom = String(this.currentUser.nom)
    }
    if (typeof this.currentUser.prenom !== "string") {
      this.currentUser.prenom = String(this.currentUser.prenom)
    }
  }


// ...

private loadPosts(): void {
  this.subscriptions.push(
    this.postService.getPosts().subscribe({
      next: (posts) => {
        console.log('Posts received from API:', posts);

        // Create an array of observables to fetch user data for each post
        const userRequests = posts.map((post) =>
          // If idAuteur is an object with _id, use it; otherwise, treat it as a string ID
          this.userService.getUserById((post.idAuteur as any)?._id || post.idAuteur).pipe(
            map((user) => ({
              post,
              user: user || {
                _id: (post.idAuteur as any)?._id || post.idAuteur || 'unknown',
                nom: 'Utilisateur',
                prenom: 'Inconnu',
                profileImage: 'https://i.pravatar.cc/150?u=default',
              },
            }))
          )
        );

        // Execute all user requests in parallel
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
            // Fallback to default posts if user fetch fails
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
            const postIndex = this.posts.findIndex((p) => p._id === post._id)
            if (postIndex !== -1) {
              this.posts[postIndex].comments = commentaires.map((c) => ({
                ...c,
                date_creation: new Date(c.date_creation).toISOString(),
              }))
            }
          },
        })
      }
    })
  }

  private loadUsers(): void {
    this.subscriptions.push(
      this.userService.getAllUsers().subscribe({
        next: (users: User[]) => {
          this.users = users.map((user) => ({
            ...user,
            isOnline: Math.random() > 0.5,
          }))
        },
        error: () => {
          this.users = this.currentUser ? [this.currentUser] : []
        },
      }),
    )
  }

  getUserById(id: string): User | null {
    return this.users.find((user) => user._id === id) || this.currentUser || null
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files?.length) {
      this.selectedFile = input.files[0]
      console.log("Image selected:", this.selectedFile.name, this.selectedFile.size) // Log pour debug
      const reader = new FileReader()
      reader.onload = () => {
        this.imagePreview = reader.result as string
      }
      reader.readAsDataURL(this.selectedFile)
    } else {
      console.warn("No file selected")
    }
  }

  addPost(): void {
    if (!this.validatePost() || !this.currentUser) {
      console.warn("Post validation failed or no current user")
      return
    }

    const formData = this.createPostFormData()
    console.log("FormData prepared:", {
      titre: this.newPost.titre,
      contenu: this.newPost.contenu,
      hasImage: !!this.selectedFile,
    }) // Log pour debug

    this.subscriptions.push(
      this.postService.addPost(formData).subscribe({
        next: (post) => {
          console.log("Post added successfully:", post)
          this.resetPostForm()
        },
        error: (error) => this.handlePostError(error),
      }),
    )
  }

  private validatePost(): boolean {
    return !!(this.newPost.titre?.trim() && this.newPost.contenu?.trim() && this.currentUser?._id)
  }

  private createPostFormData(): FormData {
    const formData = new FormData()
    formData.append("titre", this.newPost.titre!)
    formData.append("contenu", this.newPost.contenu!)
    formData.append("idAuteur", this.currentUser!._id!)
    if (this.selectedFile) {
      formData.append("image", this.selectedFile)
    }
    return formData
  }

  private resetPostForm(): void {
    this.newPost = { titre: "", contenu: "" }
    this.selectedFile = null
    this.imagePreview = null
    this.loadPosts()
  }

  private handlePostError(error: any): void {
    console.error("Error adding post:", error)
    alert("Error adding post")
  }

  toggleLike(post: Post): void {
    if (!this.currentUser?._id || !post._id) return

    this.subscriptions.push(
      this.postService.toggleLike(post._id, this.currentUser._id).subscribe({
        next: () => this.loadPosts(),
        error: (error) => {
          console.error("Error toggling like:", error)
          alert("Error toggling like")
        },
      }),
    )
  }

  addComment(post: Post): void {
    const content = this.newCommentContents[post._id!]
    if (!content?.trim() || !this.currentUser || !post._id) return

    const comment = this.createComment(post, content)
    this.subscriptions.push(
      this.postService.addComment(comment).subscribe({
        next: () => this.handleCommentSuccess(post._id!),
        error: (error) => this.handleCommentError(error),
      }),
    )
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
    }
  }

  private handleCommentSuccess(postId: string): void {
    this.newCommentContents[postId] = ""
    this.loadPosts()
  }

  private handleCommentError(error: any): void {
    console.error("Error adding comment:", error)
    alert("Error adding comment")
  }

  selectUser(user: User): void {
    if (user._id === this.currentUser?._id || !this.currentUser?._id) return
    this.selectedUser = user
    this.loadConversation(user._id!)
  }

  private loadConversation(userId: string): void {
    this.subscriptions.push(
      this.postService.getUserConversations(this.currentUser!._id!).subscribe({
        next: (groups) => this.handleGroupsResponse(groups, userId),
        error: (error) => this.handleConversationError(error),
      }),
    )
  }

  private handleGroupsResponse(groups: Group[], userId: string): void {
    const group = groups.find((g) => userId && g.members.includes(userId))
    if (group?._id) {
      this.loadMessages(group._id)
    } else {
      this.messages = []
    }
  }

  private loadMessages(groupId: string): void {
    this.subscriptions.push(
      this.postService.getConversationMessages(groupId).subscribe({
        next: (messages) => {
          this.messages = messages.map((m) => ({
            ...m,
            timestamp: new Date(m.timestamp).toISOString(),
          }))
        },
        error: () => (this.messages = []),
      }),
    )
  }

  private handleConversationError(error: any): void {
    console.error("Error loading conversations:", error)
    this.messages = []
  }

  sendMessage(): void {
    if (!this.validateMessage()) return

    const message = this.createMessage()
    this.messages.push(message)
    this.simulateReply(message)
    this.messageContent = ""
  }

  private validateMessage(): boolean {
    return !!(this.selectedUser && this.messageContent.trim() && this.currentUser?._id)
  }

  private createMessage(): Message {
    return {
      conversationId: "temp-conversation-id",
      sender: this.currentUser!._id!,
      content: this.messageContent,
      timestamp: new Date().toISOString(),
    }
  }

  private simulateReply(message: Message): void {
    setTimeout(() => {
      this.messages.push({
        conversationId: message.conversationId,
        sender: this.selectedUser!._id!,
        content: "Merci pour votre message !",
        timestamp: new Date().toISOString(),
      })
    }, 1000)
  }

  sharePost(post: Post): void {
    alert(`Post partagé: ${post.contenu.substring(0, 30)}...`)
  }

 

  private createGroupData(name: string): Partial<Group> {
    return {
      name,
      creator: this.currentUser!._id!,
      members: [this.currentUser!._id!],
      admins: [this.currentUser!._id!],
    }
  }

 

  private handleGroupError(error: any): void {
    console.error("Error creating group:", error)
    alert("Error creating group")
  }

  addMemberToGroup(groupId: string): void {
    const newMemberId = prompt("email du nouveau membre :")
    if (!newMemberId?.trim()) return

    this.subscriptions.push(
      this.postService.addMember(groupId, newMemberId).subscribe({
        next: () => this.loadGroups(),
        error: (error) => {
          console.error("Error adding member:", error)
          alert("l'utilisateur déjà membre du groupe")
        },
      }),
    )
  }

  toggleReaction(messageId: string, reaction: string): void {
    if (!this.currentUser?._id) return

    this.subscriptions.push(
      this.postService.toggleReaction(messageId, this.currentUser._id, reaction).subscribe({
        next: () => {
          if (this.selectedUser) {
            this.selectUser(this.selectedUser)
          }
        },
        error: (error) => {
          console.error("Error toggling reaction:", error)
          alert("Error toggling reaction")
        },
      }),
    )
  }

  logout(): void {
    ;["token", "userId", "nom", "prenom", "profileImage", "email", "role"].forEach((key) =>
      localStorage.removeItem(key),
    )
    window.location.href = "/login"
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  // Ajoutez cette méthode pour vérifier les données utilisateur
  private verifyUserData(): void {
    if (!this.currentUser) {
      console.error("CurrentUser is null!")
      return
    }

    console.log("User data:", {
      nom: this.currentUser.nom,
      prenom: this.currentUser.prenom,
      profileImage: this.currentUser.profileImage,
    })

    // Fallback si les données sont corrompues
    if (!this.currentUser.nom || !this.currentUser.prenom) {
      this.currentUser.nom = localStorage.getItem("nom") || "Invité"
      this.currentUser.prenom = localStorage.getItem("prenom") || ""
    }
  }

  getSafeImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return "https://via.placeholder.com/300x200?text=Image+non+disponible"
    }
    const fullUrl = `http://localhost:3000${imagePath}`
    try {
      new URL(fullUrl) // Valide l'URL
      return fullUrl
    } catch {
      return "https://via.placeholder.com/300x200?text=Image+non+disponible"
    }
  }

  // Ajoutez ces méthodes à votre classe SocialFeedComponent

 // Méthode pour construire l'URL des images de profil (pour posts et commentaires)
  getProfileImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      console.warn('Profile image path is empty, using default');
      return 'assets/profil.png';
    }
    const fullUrl = `http://localhost:3000${imagePath}`;
    console.log('Profile image URL:', fullUrl); // Log pour déboguer
    return fullUrl;
  }

  // Méthode pour construire l'URL des images de post (pour le fond et les posts)
  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      console.warn('Post image path is empty, using placeholder');
      return 'https://via.placeholder.com/300x200?text=Image+non+disponible';
    }
    const fullUrl = `http://localhost:3000${imagePath}`;
    console.log('Post image URL:', fullUrl); // Log pour déboguer
    return fullUrl;
  }

  // Gestion des erreurs pour les images de profil
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Failed to load profile image, falling back to default');
    imgElement.src = 'assets/profil.png'; // Image par défaut locale
  }

  // Gestion des erreurs pour les images de post
  handlePostImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.warn('Failed to load post image, falling back to placeholder');
    imgElement.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
  }
  loadUser(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: any) => {
        this.users = data.users;  // Assurez-vous que l'API renvoie la liste complète des utilisateurs
        console.log('Users récupérés :', this.users);
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
      }
    });
  }


  loadGroups() {
    this.http.get<any[]>('http://localhost:3000/group/getallGroupByUser', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Ajoutez le token si nécessaire
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
    // Logique pour ouvrir ou afficher les détails du groupe
    // Exemple : navigation vers une page de détails du groupe
    //this.router.navigate(['/group-details', groupId]);
    // Ou, si vous avez une logique côté frontend pour afficher les détails :
    // const selectedGroup = this.groups.find(group => group._id === groupId);
    // this.selectedGroup = selectedGroup; // Mettez à jour une variable pour afficher les détails
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
    members: this.tempUsers.map(user => user.id), // Les membres sont déjà ajoutés ici
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
     // this.loadGroups(); // Refresh the groups list
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

  // ... (other existing methods remain unchanged)




  
}