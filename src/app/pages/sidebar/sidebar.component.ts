import { Component } from '@angular/core';
import { Router } from '@angular/router';  // Importer le service Router

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isMobileMenuOpen = false;

  // Injecter le service Router dans le constructeur
  constructor(public router: Router) {}

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
