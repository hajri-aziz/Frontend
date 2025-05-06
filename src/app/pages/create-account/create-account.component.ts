import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service'; // Si vous utilisez un service pour ajouter un utilisateur.

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  createAccountForm!: FormGroup; // Formulaire de création d'utilisateur

  constructor(
    private fb: FormBuilder,
    private userService: UserService // Service pour ajouter un utilisateur
  ) {}

  ngOnInit(): void {
    this.createAccountForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      dateNaissance: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      role: ['user', Validators.required] // Rôle par défaut 'user', peut être 'admin' si l'admin crée un utilisateur.
    });
  }

  // Méthode appelée lors de la soumission du formulaire
  onAddUserSubmit(): void {
    if (this.createAccountForm.invalid) {
      return; // Ne rien faire si le formulaire est invalide
    }

    const user = this.createAccountForm.value; // Récupère les données du formulaire

    // Si vous avez un service UserService pour ajouter un utilisateur, vous pouvez l'utiliser ici
    this.userService.register(user).subscribe(
      (response) => {
        console.log('Utilisateur ajouté avec succès:', response);
        // Vous pouvez rediriger l'utilisateur ou réinitial3.0iser le formulaire ici
      },
      (error) => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
      }
    );
  }

  get f() {
    return this.createAccountForm.controls;
  }
}
