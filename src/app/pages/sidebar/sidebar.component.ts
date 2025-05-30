import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service'; // Importez le même service que dans editprofil

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  isMobileMenuOpen = false;
  profileImageUrl: string = 'assets/Ellipse 23.png'; // Image par défaut
  nom?: string;
  prenom?: string;

  constructor(
    public router: Router,
    private userService: UserService,
    private toastService: ToastService // Assurez-vous d'importer ToastService si vous l'utilisez pour les notifications
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }




private loadUserProfile(): void {
  const token = localStorage.getItem('token');
  if (!token) return;

  const userId = this.getUserIdFromToken(token);
  
  this.userService.getUserById(userId).subscribe({
    next: (user) => {
      // Ajout de la récupération du nom et prénom
      this.nom = user.nom; // Assurez-vous que ces propriétés existent dans votre modèle User
      this.prenom = user.prenom;
      
      if (user.profileImage) {
        this.profileImageUrl = this.normalizeImageUrl(user.profileImage);
      }
    },
    error: (err) => console.error('Erreur de chargement du profil', err)
  });
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