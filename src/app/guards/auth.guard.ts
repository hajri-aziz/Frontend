// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = !!this.userService.getUserRole();
    if (isLoggedIn) {
      return true;
    }
    // non connecté → on redirige vers /login en ajoutant redirect
    this.router.navigate(['/login'], {
      queryParams: { redirect: state.url }
    });
    return false;
  }
}
