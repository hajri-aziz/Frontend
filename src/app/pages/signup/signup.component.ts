import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword: boolean = false; 

  constructor(private fb: FormBuilder, private userService: UserService, public toastService: ToastService) {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      telephone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{8}$/) // Exactement 8 chiffres
      ]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.userService.register(this.signupForm.value).subscribe({
        next: (res) => {
          this.toastService.showSuccess('Inscription réussie! , Votre inscription est en attente d\'approbation');
        },
        error: (err) => {
          this.toastService.showError(err.error.message || 'Une erreur s\'est produite lors de l\'inscription.');
        }
      });
    }
  }
}