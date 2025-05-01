import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      telephone: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.userService.register(this.signupForm.value).subscribe({
        next: (res) => {
          alert('Inscription réussie !');
          console.log('Inscription réussie', res);},
        error: (err) => {
          console.error('Erreur lors de l\'inscription', err);
          alert('Une erreur est survenue');
        }
      });
    }
  }
}
