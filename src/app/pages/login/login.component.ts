import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false; 

  constructor(private userService: UserService, private router: Router,public toastService: ToastService ) { }
   navigateToLogin() {
    this.router.navigate(['/signup']);
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  

  onSubmit(form: NgForm): void { // Recevez le formulaire en paramètre
    // Vérifiez si le formulaire est valide avant de soumettre
    if (form.invalid) {
      // Marquez tous les champs comme touchés pour afficher les erreurs
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.toastService.showError('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.userService.login(credentials).subscribe({
      next: (res: any) => {
        console.log('Connexion réussie :', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id);
        this.toastService.showSuccess('Connexion réussie !');
        setTimeout(() => {
          this.router.navigate(['/editprofil']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Erreur :', err);
        this.toastService.showError(err.error.message || 'Une erreur s\'est produite lors de la connexion.');
      },
    });
  }
  /*ngOnInit() {
    console.log('ngOnInit lancé');
    setTimeout(() => {
      this.toastService.showSuccess('TEST FORCÉ - Ça marche ?');
    }, 1000);
  }*/
}

