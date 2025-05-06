import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isMobileMenuOpen = false;

  // Méthode pour basculer l'état du menu mobile
  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

}
