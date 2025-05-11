// src/app/pages/social-feed/social-feed.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post, Comment, Group, Message} from '../../models/post.models';
import { User } from '../../models/user.model';
import { UserService }  from '../../services/user.service';
import {PostService} from '../../services/post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-social-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.scss']
})
export class SocialFeedComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  posts: Post[] = [];
  newPost: Partial<Post> = { titre: '', contenu: '' };
  newCommentContents: { [postId: string]: string } = {};
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  users: User[] = [];
  selectedUser: User | null = null;
  messages: Message[] = [];
  messageContent = '';
  groups: Group[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private postService:PostService , private userService: UserService ) {}
 

  ngOnInit() {
    // Charger l'utilisateur connecté depuis localStorage
    const userId = localStorage.getItem('userId');
    if (!userId || !localStorage.getItem('token')) {
      // Rediriger vers la page de connexion si non authentifié
      window.location.href = '/login';
      return;
    }
    this.currentUser = {
      _id: userId,
      nom: localStorage.getItem('nom') || 'Utilisateur',
      prenom: localStorage.getItem('prenom') || '',
      profileImage: localStorage.getItem('profileImage') || 'https://i.pravatar.cc/150?img=1',
      email: localStorage.getItem('email') || 'user@example.com',
      role: localStorage.getItem('role') || 'user'
    };

    // Charger les posts
    this.loadPosts();

    // Charger les utilisateurs
    this.subscriptions.push(
      this.userService.getAllUsers().subscribe({
        next: (users: User[]) => {
          this.users = users.map(user => ({
            ...user,
            isOnline: Math.random() > 0.5 // Simuler l'état en ligne
          }));
        },
        error: () => {
          // Fallback si l'API users n'existe pas
          this.users = [
            this.currentUser!,   
          ];
        }
      })
    );

   
  }

  loadPosts() {
    this.subscriptions.push(
      this.postService.getPosts().subscribe({
        next: (posts) => {
          this.posts = posts.map(post => ({
            ...post,
            comments: [],
            date_creation: new Date(post.date_creation).toISOString()
          }));
          // Charger les commentaires pour chaque post
          posts.forEach(post => {
            if (post._id) {
              this.postService.getPostWithComments(post._id).subscribe({
                next: ({ commentaires }) => {
                  const postIndex = this.posts.findIndex(p => p._id === post._id);
                  if (postIndex !== -1) {
                    this.posts[postIndex].comments = commentaires.map(c => ({
                      ...c,
                      date_creation: new Date(c.date_creation).toISOString()
                    }));
                  }
                }
              });
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors du chargement des posts:', error);
          alert('Erreur lors du chargement des posts');
        }
      })
    );
  }

  getUserById(id: string): User {
    return this.users.find(user => user._id === id) || this.currentUser!;
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  addPost() {
    if (!this.newPost.titre?.trim() || !this.newPost.contenu?.trim() || !this.currentUser) return;

    const formData = new FormData();
    formData.append('titre', this.newPost.titre);
    formData.append('contenu', this.newPost.contenu);
    if (this.currentUser._id) {
      formData.append('idAuteur', this.currentUser._id);
    } else {
      console.error('Erreur: idAuteur est indéfini');
      return;
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.subscriptions.push(
      this.postService.addPost(formData).subscribe({
        next: () => {
          this.newPost = { titre: '', contenu: '' };
          this.selectedFile = null;
          this.imagePreview = null;
          // Recharger les posts
          this.loadPosts();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du post:', error);
          alert('Erreur lors de l\'ajout du post');
        }
      })
    );
  }

  toggleLike(post: Post) {
    if (!this.currentUser || !post._id) return;

      if (post._id && this.currentUser?._id) {
        this.postService.toggleLike(post._id, this.currentUser._id).subscribe({
          next: () => {
            // Recharger les posts pour refléter le changement de like
            this.loadPosts();
          },
          error: (error) => {
            console.error('Erreur lors du toggle like:', error);
            alert('Erreur lors du toggle like');
          }
        });
      }
  }

  addComment(post: Post) {
    const content = this.newCommentContents[post._id!];
    if (!content?.trim() || !this.currentUser || !post._id) return;

    const comment: Partial<Comment> = {
      idAuteur: {
        _id: this.currentUser._id || '',
        nom: this.currentUser.nom,
        prenom: this.currentUser.prenom,
        profileImage: this.currentUser.profileImage
      },
      idPost: post._id,
      contenu: content,
      date_creation: new Date().toISOString()
    };

    this.subscriptions.push(
      this.postService.addComment(comment).subscribe({
        next: () => {
          if (post._id) {
            this.newCommentContents[post._id] = '';
          }
          // Recharger les posts pour inclure le nouveau commentaire
          this.loadPosts();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du commentaire:', error);
          alert('Erreur lors de l\'ajout du commentaire');
        }
      })
    );
  }

  selectUser(user: User) {
    if (user._id === this.currentUser?._id || !this.currentUser) return;
    this.selectedUser = user;

    // Charger les messages de la conversation
    this.subscriptions.push(
      this.postService.getUserConversations(this.currentUser._id!).subscribe({
        next: (groups) => {
          const group = groups.find(g => user._id && g.members.includes(user._id));
          if (group && group._id) {
            this.postService.getConversationMessages(group._id).subscribe({
              next: (messages) => {
                this.messages = messages.map(m => ({
                  ...m,
                  timestamp: new Date(m.timestamp).toISOString()
                }));
              },
              error: (error) => {
                console.error('Erreur lors du chargement des messages:', error);
                this.messages = [];
              }
            });
          } else {
            this.messages = [];
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des conversations:', error);
          this.messages = [];
        }
      })
    );
  }

  sendMessage() {
    if (!this.selectedUser || !this.messageContent.trim() || !this.currentUser) return;

    // Simuler l'envoi (à remplacer par une vraie API)
    const message: Message = {
      conversationId: 'temp-conversation-id',
      sender: this.currentUser._id ?? '',
      content: this.messageContent,
      timestamp: new Date().toISOString()
    };

    this.messages.push(message);

    // Simuler une réponse
    setTimeout(() => {
      this.messages.push({
        conversationId: message.conversationId,
        sender: this.selectedUser?._id || '',
        content: 'Merci pour votre message !',
        timestamp: new Date().toISOString()
      });
    }, 1000);

    this.messageContent = '';
  }

  sharePost(post: Post) {
    alert(`Post partagé: ${post.contenu.substring(0, 30)}...`);
  }

  createGroup() {
    const name = prompt('Nom du groupe :');
    if (!name?.trim() || !this.currentUser) return;

    const group: Partial<Group> = {
      name,
      creator: this.currentUser._id,
      members: [this.currentUser._id!],
      admins: [this.currentUser._id!]
    };

    this.subscriptions.push(
      this.postService.createGroup(group).subscribe({
        next: () => {
          // Recharger les groupes
          this.postService.getUserConversations(this.currentUser?._id ?? '').subscribe({
            next: (groups) => {
              this.groups = groups;
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de la création du groupe:', error);
          alert('Erreur lors de la création du groupe');
        }
      })
    );
  }

  addMemberToGroup(groupId: string) {
    const newMemberId = prompt('ID du nouveau membre :');
    if (!newMemberId?.trim() || !this.currentUser) return;

    this.subscriptions.push(
      this.postService.addMember(groupId, newMemberId).subscribe({
        next: () => {
          // Recharger les groupes
          this.postService.getUserConversations(this.currentUser?._id ?? '').subscribe({
            next: (groups) => {
              this.groups = groups;
            }
          });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du membre:', error);
          alert('Erreur lors de l\'ajout du membre');
        }
      })
    );
  }

  toggleReaction(messageId: string, reaction: string) {
    if (!this.currentUser) return;

    this.subscriptions.push(
      this.postService.toggleReaction(messageId, this.currentUser!._id!, reaction).subscribe({
        next: () => {
          // Recharger les messages si nécessaire
          if (this.selectedUser) {
            this.selectUser(this.selectedUser);
          }
        },
        error: (error) => {
          console.error('Erreur lors du toggle de la réaction:', error);
          alert('Erreur lors du toggle de la réaction');
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('nom');
    localStorage.removeItem('prenom');
    localStorage.removeItem('profileImage');
    window.location.href = '/login';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
}
