import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public router: Router, private userService: UserService) {}

  // Méthode pour déterminer le layout à afficher
  getLayoutType(): 'sidebar' | 'navbar' | 'simple' {
    const hiddenRoutes = ['/login', '/signup', '/', '/about', '/services', '/home', '/contact'];
    const isHiddenRoute = hiddenRoutes.includes(this.router.url);

    if (isHiddenRoute) {
      return 'simple'; // Layout sans sidebar ni navbar pour login/signup
    }

    const userRole = this.userService.getUserRole();
    if (userRole === 'admin') {
      return 'sidebar'; // Sidebar pour les administrateurs
    }

    return 'navbar'; // Navbar pour les autres utilisateurs
  }
}