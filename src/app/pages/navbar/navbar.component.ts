import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Notification } from 'src/app/models/notification.model';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  profileImageUrl: string = 'assets/Ellipse 23.png';

  nom?: string;
  prenom?: string;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isNotificationMenuOpen = false;
  notifications: Notification[] = [];
  unreadNotificationsCount: number = 0;

  constructor(
    private elementRef: ElementRef,
    public router: Router,
    private userService: UserService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {}
 

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadNotifications();
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
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

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotificationMenuOpen = false;
  }

  toggleNotificationMenu() {
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;
    this.isProfileMenuOpen = false;
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
      },
      error: (err) => console.error('Erreur de chargement des notifications', err)
    });
  }

markAsRead(notificationId: string): void {
  const token = localStorage.getItem('token');
  console.log('Token for markAsRead:', token);
  if (!token) {
    console.error('No token found in localStorage for markAsRead');
    return;
  }

  this.notificationService.markNotificationAsRead(notificationId).subscribe({
    next: (response) => {
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification) {
        notification.lu = true;
        this.updateUnreadCount();
      }
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour de la notification', err);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!event.target || !this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
      this.isNotificationMenuOpen = false;
    }
  }
}