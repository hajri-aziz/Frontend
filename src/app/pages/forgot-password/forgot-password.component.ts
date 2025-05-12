import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  onSubmit(form: NgForm) {
    

    this.isLoading = true;

    this.userService.forgotPassword(this.email).subscribe({
      next: (responsea:any) => {
        this.isLoading = false;
       
        console.log('Réinitialisation demandée avec succès:', responsea);
        this.router.navigate(['/verify-otp'], {
          state: { email: this.email }
        });
      },
      error: (err:any) => {
        this.isLoading = false;
        console.error('Erreur lors de la demande de réinitialisation:', err);
        alert('Une erreur s\'est produite lors de la demande de réinitialisation. Veuillez réessayer.');
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }


}
