import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  redirectUrl = '/editprofil';
  showPassword: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public toastService: ToastService
  ) {}

  ngOnInit(): void {
    const r = this.route.snapshot.queryParamMap.get('redirect');
    if (r) this.redirectUrl = r;
  }

  navigateToLogin() {
    this.router.navigate(['/signup']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      this.toastService.showError('Veuillez corriger les erreurs dans le formulaire.');
      return; // Ajout important pour sortir de la fonction si le formulaire est invalide
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

  console.log(credentials);
    this.userService.login(credentials).subscribe({
      next: (res: any) => {
        console.log('Connexion réussie :', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id);
        this.toastService.showSuccess('Connexion réussie !');
        setTimeout(() => {
          this.router.navigateByUrl(this.redirectUrl);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Erreur :', err);
        this.toastService.showError(err.error.message || 'Une erreur s\'est produite lors de la connexion.');
      }
    });
  }
}