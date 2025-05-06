import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private userService: UserService, private router: Router) { }
   navigateToLogin() {
    this.router.navigate(['/signup']);
   }

  onSubmit(): void {
    if (!this.email || !this.password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.userService.login(credentials).subscribe({
      next: (res:any) => {
        console.log('Connexion réussie :', res);
        localStorage.setItem('token', res.token);
        alert('Connexion réussie.');
        this.router.navigate(['/dashboard']); // Redirige vers une autre page
      },
      error: (err:any) => {
        console.error('Erreur :', err);
        alert(err.error.message || 'Erreur lors de la connexion.');
      }
    });
  }
}
