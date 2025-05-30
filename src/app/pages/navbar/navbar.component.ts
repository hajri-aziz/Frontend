import { Component, HostListener, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';// Assurez-vous que le chemin est correct

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  profileImageUrl: string = 'assets/Ellipse 23.png'; // Image par défaut
  nom?: string;
  prenom?: string;
  isMobileMenuOpen = false;
 

  constructor(private elementRef: ElementRef,public router: Router, private userService: UserService) {
  }

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


  // Dans votre composant
isProfileMenuOpen = false;

toggleProfileMenu() {
  this.isProfileMenuOpen = !this.isProfileMenuOpen;
}

// Pour fermer le menu quand on clique ailleurs
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (!event.target || !this.elementRef.nativeElement.contains(event.target)) {
    this.isProfileMenuOpen = false;
  }
}
}