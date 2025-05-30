import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { NotificationService } from 'src/app/services/notification.service'; // Import NotificationService
import { Notification } from 'src/app/models/notification.model'; // Import Notification model
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isMobileMenuOpen = false;
  isNotificationMenuOpen = false; // For notification dropdown
  profileImageUrl: string = 'assets/Ellipse 23.png'; // Default image
  nom?: string;
  prenom?: string;
  notifications: Notification[] = []; // Store notifications
  unreadNotificationsCount: number = 0; // Track unread count
  notificationError: string | null = null; // For error handling

  constructor(
    public router: Router,
    private userService: UserService,
    private notificationService: NotificationService, // Inject NotificationService
    private toastService: ToastService // Assurez-vous d'importer ToastService si vous l'utilisez pour les notifications
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadNotifications();
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleNotificationMenu() {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
  }

  private loadUserProfile(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = this.getUserIdFromToken(token);
    
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.nom = user.nom;
        this.prenom = user.prenom;
        if (user.profileImage) {
          this.profileImageUrl = this.normalizeImageUrl(user.profileImage);
        }
      },
      error: (err) => console.error('Erreur de chargement du profil', err)
    });
  }

  private loadNotifications(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const userId = this.getUserIdFromToken(token);

    this.notificationService.getNotificationsByPatient(userId).subscribe({
      next: (response) => {
        this.notifications = response.notifications;
        this.updateUnreadCount();
        this.notificationError = null;
      },
      error: (err) => {
        console.error('Erreur de chargement des notifications', err);
        this.notificationError = 'Erreur lors du chargement des notifications';
      }
    });
  }

  markAsRead(notificationId: string): void {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage for markAsRead');
      this.notificationError = 'Vous devez être connecté pour marquer les notifications comme lues.';
      return;
    }

    this.notificationService.markNotificationAsRead(notificationId).subscribe({
      next: (response) => {
        const notification = this.notifications.find(n => n._id === notificationId);
        if (notification) {
          notification.lu = true;
          this.updateUnreadCount();
          this.notificationError = null;
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la notification', err);
        this.notificationError = 'Erreur lors de la mise à jour de la notification.';
      }
    });
  }

  private updateUnreadCount(): void {
    this.unreadNotificationsCount = this.notifications.filter(n => !n.lu).length;
  }

  private getUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      console.error('Erreur de décodage du token', e);
      return '';
    }
  }

  private normalizeImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/Ellipse 23.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000/${imagePath.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  }
  logout() {
    this.userService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.toastService.showSuccess('Deconnexion réussie !');
        this.router.navigate(['/login']); // Redirige vers la page de login
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion:', err);
        this.toastService.showError('Erreur lors de la déconnexion. Veuillez réessayer.');
        // Optionnel: Afficher un message d'erreur à l'utilisateur
      }
    });
  }
}