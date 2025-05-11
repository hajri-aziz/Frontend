import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router) {}

  // Méthode pour déterminer si on est sur une page sans sidebar
  shouldShowSidebar(): boolean {
    const hiddenRoutes = ['/login', '/signup','/','/about','/services','/home'];
    return !hiddenRoutes.includes(this.router.url);
  }
  
}
