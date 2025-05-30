import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit{
  email: string = '';
  password: string = '';
  redirectUrl = '/editprofil';
  showPassword: boolean = false; 

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute,public toastService: ToastService ) { }
   navigateToLogin() {
    this.router.navigate(['/signup']);
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
  const r = this.route.snapshot.queryParamMap.get('redirect');
  if (r) this.redirectUrl = r;
}
  onSubmit(): void {
    if (!this.email || !this.password) {
      this.toastService.showError('Veuillez remplir tous les champs.');
      return;
    }

    const credentials = {
      email: this.email,
      password: this.password
    };

console.log(credentials);
    this.userService.login(credentials).subscribe({
      next: (res:any) => {
        console.log('Connexion réussie :', res);
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id);// Enregistre l'ID de l'utilisateur dans le localStorage
        console.log('Token enregistré :', res.token);
        console.log('ID de l\'utilisateur enregistré :', res.user.id);
        this.toastService.showSuccess('Connexion réussie !');
        setTimeout(() => {
          this.router.navigateByUrl(this.redirectUrl);
        }, 1000); // 1 seconde de délai
      },
      error: (err:any) => {
        console.error('Erreur :', err);
        this.toastService.showError(err.error.message || 'Une erreur s\'est produite lors de la connexion.');
      
        
        //this.router.navigate(['/editprofil']); // Redirige vers une autre page
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

